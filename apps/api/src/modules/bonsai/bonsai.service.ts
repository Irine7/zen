import { prisma } from "@/lib/prisma";
import { Bonsai } from './bonsai.entity';
import { BonsaiAlreadyDeadError, BonsaiNotFoundError } from "./errors";
import { GraphQLError } from "graphql";
import { UserService } from "../user/user.service";
import { validateBonsaiAlive } from "./logic";
import { SeedNotInInventoryError } from "../shop/errors";

export class BonsaiService {
	// Находим дерево по id или возвращаем объект ошибки (для Union Types)
	static async getById(id: string): Promise<Bonsai | BonsaiNotFoundError> {
		const tree = await prisma.bonsai.findUnique({ where: { id } });
		
		if (!tree) {
			const error = new BonsaiNotFoundError();
			error.message = `Дерево с ID ${id} не найдено`;
			return error;
		}
		return tree;
	}

	// Получаем весь сад
	static async getGarden(userId: string): Promise<Bonsai[]> {
		return prisma.bonsai.findMany({
			where: { userId },
		});
	}

	// Поливаем дерево
	static async waterBonsai(id: string): Promise<Bonsai | BonsaiNotFoundError | BonsaiAlreadyDeadError> {
		const result = await BonsaiService.getById(id);
		if (result instanceof BonsaiNotFoundError) return result;
		
		const deadError = validateBonsaiAlive(result.lastWateredAt);
		if (deadError) return deadError;

		return await prisma.$transaction(async (tx) => {
			// Обновляем дату полива
			const updatedBonsai = await tx.bonsai.update({
				where: { id },
				data: { lastWateredAt: new Date() }
			});
			// Начисляем пользователю очки
			await UserService.addPoints(result.userId, 5, tx);
			return Object.assign(new Bonsai(), updatedBonsai);
		});
	}

	// Повышаем уровень дерева
	static async levelUpBonsai(id: string): Promise<Bonsai | BonsaiNotFoundError | BonsaiAlreadyDeadError> {
		const result = await BonsaiService.getById(id);
		if (result instanceof BonsaiNotFoundError) return result;

		const deadError = validateBonsaiAlive(result.lastWateredAt);
		if (deadError) return deadError;

		const updatedBonsai = await prisma.bonsai.update({
			where: { id },
			data: {
				level: { increment: 1 },
				lastWateredAt: new Date()
			}
		}).catch((err: any) => BonsaiService.handleDbError(err, id));
		return Object.assign(new Bonsai(), updatedBonsai);
	}

	// Создаем дерево
	static async plantBonsaiFromInventory(seedId: string, userId: string, habitId: string): Promise<Bonsai | SeedNotInInventoryError> {
		return prisma.$transaction(async (tx) => {
			// Проверяем, есть ли семечко в инвентаре
			const seedInventory = await tx.inventory.findUnique({
				where:{
					userId_seedId: {
						userId: userId,
						seedId: seedId
					}
				},
				include: { seed: true }
			});

			// Если семечка нет в инвентаре, возвращаем ошибку
			if (!seedInventory || seedInventory.quantity <= 0) {
				return Object.assign(new SeedNotInInventoryError(), 
				{message: "В вашем инвентаре нет этого семечка"})
			}

			// Если семечко одно, удаляем запись из инвентаря 
			if (seedInventory.quantity === 1) {
				await tx.inventory.delete({
					where: {
						id: seedInventory.id
					}
				})
			}
			// Если семечек несколько, уменьшаем количество
			else { 
				await tx.inventory.update({
					where: {
						id: seedInventory.id
					},
					data: {
						quantity: { decrement: 1 }
					} 
				})
			}

			// Создаем дерево
			const newBonsai = await tx.bonsai.create({
				data: {
					userId: userId,
					habitId: habitId,
					lastWateredAt: new Date(),
					type: seedInventory.seed.type
				}
			})
			return Object.assign(new Bonsai(), newBonsai);
		});
	}

	// Удаляем дерево
	static async deleteBonsai(id:string): Promise<Bonsai | BonsaiNotFoundError> {
		const result = await BonsaiService.getById(id);
		if (result instanceof BonsaiNotFoundError) return result;

		await prisma.bonsai.delete({ where: { id } });
		return Object.assign(new Bonsai(), result);
	}

	// Централизованная обработка ошибок Prisma
	static handleDbError(error: any, id: string): BonsaiNotFoundError | never {
		if (error.code === 'P2025') {
			const notFound = new BonsaiNotFoundError();
			notFound.message = `Дерево с ID ${id} не найдено`;
			return notFound;
		}

		console.error("Критическая ошибка БД:", error);
		throw new GraphQLError("Внутренняя ошибка сервера");
	}
}
