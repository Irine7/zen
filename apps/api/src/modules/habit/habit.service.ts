import { GraphQLError } from "graphql";
import { prisma } from "@/lib/prisma";
import { CreateHabitInput, Habit } from './habit.entity';
import { isBonsaiDead } from '../bonsai/logic';
import { UserService } from '../user/user.service';
import { HabitAlreadyCompletedError, HabitNotFoundError } from './errors';
import { BonsaiAlreadyDeadError, BonsaiNotFoundError } from '../bonsai/errors';

export class HabitService {
	// Находим привычку по ID или выбрасываем GraphQLError
	static async getByIdOrThrow(id: string): Promise<Habit> {
		const habit = await prisma.habit.findUnique({ where: { id } });
		if (!habit) {
			throw new GraphQLError(`Привычка с ID ${id} не найдена`);
		}
		return habit;
	}

	// Находим привычку с деревом
	static async getWithBonsai(id: string) {
		return prisma.habit.findUnique({
			where: { id },
			include: { bonsai: true }, // Достаем данные из связанной таблицы bonsai
		});
	}

	// Находим все привычки пользователя
	static async getHabits(userId: string) {
		return prisma.habit.findMany({
			where: { userId },
			include: { bonsai: true }, // Достаем данные из связанной таблицы bonsai
		});
	}

	// Создаем новую привычку
	static async create(input: CreateHabitInput, userId: string) {
		return prisma.habit.create({
			data: {
				title: input.title,
				description: input.description ?? null,
				userId: userId
			}
		});
	}

	// Выполняем привычку
	static async complete(id: string) {
		// Ищем привычку вместе с деревом
		const habitWithBonsai = await HabitService.getWithBonsai(id);
		
		if (!habitWithBonsai) return new HabitNotFoundError();
		// Проверяем, что дерево существует
		if (!habitWithBonsai.bonsai) return new BonsaiNotFoundError();
		// Проверяем, живое ли дерево
		if (isBonsaiDead(habitWithBonsai.bonsai.lastWateredAt)) return new BonsaiAlreadyDeadError();

		// Проверяем, не была ли привычка уже выполнена сегодня
		const now = new Date();
		const lastWatered = habitWithBonsai.bonsai.lastWateredAt;
		const isCompletedToday =
			now.getFullYear() === lastWatered.getFullYear() &&
			now.getMonth() === lastWatered.getMonth() &&
			now.getDate() === lastWatered.getDate();

		if (isCompletedToday) return new HabitAlreadyCompletedError();

		// Выполняем транзакцию
		return await prisma.$transaction(async (tx) => {
			// Обновляем дерево (поливаем его)
			await tx.bonsai.update({
				where: { id: habitWithBonsai.bonsai!.id },
				data: { lastWateredAt: new Date() }
			});

			// Начисляем пользователю очки
			await UserService.addPoints(habitWithBonsai.userId, 10, tx);

			// Возвращаем свежие данные из базы, чтобы фронтенд сразу увидел изменения
			return await tx.habit.findUnique({
				where: { id },
				include: { bonsai: true } // 
			});
		});
	}
}
