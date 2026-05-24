import { Mutation, Arg, Resolver, createUnionType, Ctx, Query } from 'type-graphql';
import { GraphQLError } from "graphql";
import { CreateHabitInput, Habit } from './habit.entity';
import { HabitService } from './habit.service';
import { HabitAlreadyCompletedError, HabitNotFoundError } from './errors';
import { BonsaiAlreadyDeadError, BonsaiNotFoundError } from '../bonsai/errors';
import type { Context } from '@/types/context';

export const CompleteHabitResult = createUnionType({
	name: "CompleteHabitResult",
	types: () => [Habit, HabitNotFoundError, HabitAlreadyCompletedError, BonsaiNotFoundError, BonsaiAlreadyDeadError] as const,
});

@Resolver(() => Habit)
export class HabitResolver {

	@Mutation(()=> Habit)
	async createHabit(
		@Arg("input", ()=> CreateHabitInput) input: CreateHabitInput,
		@Ctx() ctx: Context
	) {
		// Проверяем авторизацию
		if(!ctx.userId) {
			throw new GraphQLError("Пользователь не авторизован!", { extensions: { code: 'UNAUTHENTICATED' } });
		}
		//  Создаем привычку
		return await HabitService.create(input, ctx.userId);
	}
	
	@Mutation(() => CompleteHabitResult)
	async completeHabit(@Arg("id", () => String) id: string) {
		return await HabitService.complete(id);
	}

	@Query(() => [Habit]) 
	async getHabits(@Ctx() ctx: Context): Promise<Habit[]> {
		if (!ctx.userId) {
			throw new GraphQLError("Вы не авторизованы!", {
				extensions: { code: "UNAUTHENTICATED" }
			});
		}
		return HabitService.getHabits(ctx.userId);
	}
}