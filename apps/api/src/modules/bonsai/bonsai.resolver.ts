import { Resolver, Query, Arg, Mutation, FieldResolver, Root, createUnionType, Ctx } from "type-graphql";
import { GraphQLError } from "graphql";
import { Bonsai } from './bonsai.entity';
import { BONSAI_RULES } from "@zen/shared-types";
import { User } from '../user/user.entity';
import { Habit } from '../habit/habit.entity';
import { BonsaiNotFoundError, BonsaiAlreadyDeadError } from "./errors";
import { SeedNotInInventoryError } from "../shop/errors";
import { BonsaiService } from './bonsai.service';
import type { Context } from '@/types/context';

// Создаем Union Type. Результат полива — это ЛИБО дерево, ЛИБО ошибка
export const BonsaiResult = createUnionType({
	name: "BonsaiResult", // Имя для схемы GraphQL
	types: () => [Bonsai, BonsaiNotFoundError, BonsaiAlreadyDeadError] as const, // Возможные варианты
});

export const PlantBonsaiResult = createUnionType({
	name: "PlantBonsaiResult",
	types: () => [Bonsai, SeedNotInInventoryError] as const,
})

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

	// Связь между деревом и пользователем. Используем Dataloaders для получения данных владельца
	@FieldResolver(() => User)
	async user(
		@Root() bonsai: Bonsai,
		@Ctx() ctx: Context
	): Promise<User> {
		const user = await ctx.loaders.userLoader.load(bonsai.userId);
		if (!user) {
			throw new GraphQLError(`Пользователь с ID ${bonsai.userId} не найден`);
		}
		return user;
	}

	// Связь между деревом и привычкой. Используем Dataloaders для получения данных привычки
	@FieldResolver(() => Habit)
	async habit(
		@Root() bonsai: Bonsai,
		@Ctx() ctx: Context
	): Promise<Habit> {
		const habit = await ctx.loaders.habitLoader.load(bonsai.habitId);
		if (!habit) {
			throw new GraphQLError(`Привычка с ID ${bonsai.habitId} не найдена`);
		}
		return habit;
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
			throw new GraphQLError("Пожалуйста, авторизуйтесь", { extensions: { code: 'UNAUTHENTICATED' } });
		}
		return BonsaiService.getGarden(ctx.userId);
	}

	// Поливаем дерево
	@Mutation(() => BonsaiResult)
	async waterBonsai(@Arg("id", () => String) id: string) {
		return BonsaiService.waterBonsai(id);
	}

	// Повышаем уровень дерева
	@Mutation(() => BonsaiResult)
	async levelUpBonsai(@Arg("id", () => String) id: string) {
		return BonsaiService.levelUpBonsai(id);
	}

	// Создаем дерево
	@Mutation(() => PlantBonsaiResult)
	async plantBonsaiFromInventory(
		@Arg("seedId", () => String) seedId: string,
		@Arg("habitId", () => String) habitId: string,
		@Ctx() ctx: Context
	) {
		const userId = ctx.userId;
		if (!userId) {
			throw new GraphQLError("Вы не авторизованы!", { extensions: { code: 'UNAUTHENTICATED' } });
		}
		return BonsaiService.plantBonsaiFromInventory(seedId, userId, habitId);
	}

	// Удаляем дерево
	@Mutation(() => BonsaiResult)
	async deleteBonsai(@Arg("id", () => String) id: string) {
		return BonsaiService.deleteBonsai(id);
	}

}