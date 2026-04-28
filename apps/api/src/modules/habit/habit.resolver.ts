import { Mutation, Arg, Resolver, createUnionType } from 'type-graphql';
import type { Prisma } from '@prisma/client';
import { Habit } from './habit.entity';
import { HabitService } from './habit.service';
import { isBonsaiDead } from '../bonsai/logic';
import { prisma } from '@/lib/prisma';
import { UserService } from '../user/user.service';
import { HabitAlreadyCompletedError, HabitNotFoundError } from './errors';
import { BonsaiAlreadyDeadError, BonsaiNotFoundError } from '../bonsai/errors';

export const CompleteHabitResult = createUnionType({
	name: "CompleteHabitResult",
	types: () => [Habit, HabitNotFoundError, HabitAlreadyCompletedError, BonsaiNotFoundError, BonsaiAlreadyDeadError] as const,
});

@Resolver(() => Habit)
export class HabitResolver {
	@Mutation(() => CompleteHabitResult)
	async completeHabit(@Arg("id", () => String) id: string) {
		// 1. Ищем привычку вместе с деревом
		const habitWithBonsai = await HabitService.getWithBonsai(id);
		if (!habitWithBonsai) return new HabitNotFoundError();
		// 2. Проверяем, что дерево существует
		if (!habitWithBonsai.bonsai) return new BonsaiNotFoundError();
		// 3. Проверяем, живое ли дерево
		if (isBonsaiDead(habitWithBonsai.bonsai.lastWateredAt)) return new BonsaiAlreadyDeadError();

		// 4. Проверяем, не была ли привычка уже выполнена сегодня
		const now = new Date();
		const lastWatered = habitWithBonsai.bonsai.lastWateredAt;
		const isCompletedToday =
			now.getFullYear() === lastWatered.getFullYear() &&
			now.getMonth() === lastWatered.getMonth() &&
			now.getDate() === lastWatered.getDate();

		if (isCompletedToday) return new HabitAlreadyCompletedError();

		// 5. Выполняем транзакцию
		return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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