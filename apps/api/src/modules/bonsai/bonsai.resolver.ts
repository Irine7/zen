import { Resolver, Query, Arg, Mutation, FieldResolver, Root, createUnionType, Ctx } from "type-graphql";
import { Bonsai, CreateBonsaiInput } from './bonsai.entity';
import { prisma } from "@/lib/prisma";
import { BONSAI_RULES } from "@zen/shared-types";
import { validateBonsaiAlive } from "./logic";
import { User } from '../user/user.entity';
import { Habit } from '../habit/habit.entity';
import { BonsaiNotFoundError, BonsaiAlreadyDeadError } from "./errors";
import { UserService } from '../user/user.service';
import { HabitService } from '../habit/habit.service';
import { BonsaiService } from './bonsai.service';
import type { Context } from '@/types/context';

// Создаем Union Type. Результат полива — это ЛИБО дерево, ЛИБО ошибка
export const BonsaiResult = createUnionType({
	name: "BonsaiResult", // Имя для схемы GraphQL
	types: () => [Bonsai, BonsaiNotFoundError, BonsaiAlreadyDeadError] as const, // Возможные варианты
});

@Resolver(() => Bonsai)
export class BonsaiResolver {
	// Динамическое поле для статуса состояния дерева	
	@FieldResolver(() => String)
	status(@Root() bonsai: Bonsai): string {
		const diff = Date.now() - bonsai.lastWateredAt.getTime();
		if (diff > BONSAI_RULES.DEATH_THRESHOLD_MS) return "DEAD";
		if (diff > BONSAI_RULES.SICK_THRESHOLD_MS) return "SICK";
		return "HEALTHY";
	}

	// Связь между деревом и пользователем. Используем UserService для получения данных владельца
	@FieldResolver(() => User)
	async user(@Root() bonsai: Bonsai): Promise<User> {
		return UserService.getByIdOrThrow(bonsai.userId);
	}

	// Связь между деревом и привычкой. Используем HabitService для получения данных привычки
	@FieldResolver(() => Habit)
	async habit(@Root() bonsai: Bonsai): Promise<Habit> {
		return HabitService.getByIdOrThrow(bonsai.habitId);
	}

	// ----------------------- //

	// Получаем одно дерево
	@Query(() => BonsaiResult)
	async getBonsai(@Arg("id", () => String) id: string) {
		return BonsaiService.getById(id);
	}

	// Получаем весь сад
	@Query(() => [Bonsai])
	async getGarden(@Ctx() ctx: Context): Promise<Bonsai[]> {
		if (!ctx.userId) {
			throw new Error("Пожалуйста, авторизуйтесь");
		}
		return prisma.bonsai.findMany({
			where: {
				userId: ctx.userId // Каждый видит только свой сад
			}
		});
	}

	// Поливаем дерево
	@Mutation(() => BonsaiResult)
	async waterBonsai(@Arg("id", () => String) id: string) {
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
	@Mutation(() => BonsaiResult)
	async levelUpBonsai(@Arg("id", () => String) id: string) {
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
	@Mutation(() => Bonsai)
	async createBonsai(
		@Arg("input", () => CreateBonsaiInput) input: CreateBonsaiInput,
		@Ctx() ctx: Context
	): Promise<Bonsai> {
		if (!ctx.userId) {
			throw new Error("Вы не авторизованы!");
		}
		return prisma.bonsai.create({
			data: {
				...input,
				userId: ctx.userId
			}
		});
	}

	// Удаляем дерево
	@Mutation(() => BonsaiResult)
	async deleteBonsai(@Arg("id", () => String) id: string) {
		const result = await BonsaiService.getById(id);
		if (result instanceof BonsaiNotFoundError) return result;

		await prisma.bonsai.delete({ where: { id } });
		return Object.assign(new Bonsai(), result);
	}

}