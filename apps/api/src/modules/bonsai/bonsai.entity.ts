import { ObjectType, Field, ID, Int, InputType } from "type-graphql";
import { User } from '../user/user.entity';
import { Habit } from '../habit/habit.entity';

@ObjectType()
export class Bonsai {
	@Field(() => ID)
	id!: string;       // Уникальный идентификатор дерева в базе

	@Field(() => String)
	userId!: string;   // Ссылка на владельца (User Module)

	@Field(() => String)
	habitId!: string;  // Ссылка на привычку (Habit Module), которая питает дерево

	@Field(() => String)
	type!: string;     // Тип дерева (например, 'PINE', 'MAPLE')

	@Field(() => Int)
	level!: number;    // Уровень роста (начинается с 1)

	@Field(() => Date)
	lastWateredAt!: Date; // Время последнего "полива" (выполнения привычки)

	@Field(() => Date)
	createdAt!: Date;     // Дата посадки дерева

	@Field(() => User)
	user?: User;   // Ссылка на владельца (User Module)

	@Field(() => Habit)
	habit?: Habit;  // Ссылка на привычку (Habit Module)
}

// Используется для создания нового дерева
@InputType()
export class CreateBonsaiInput {
	@Field(() => String)
	type!: string;

	@Field(() => String)
	userId!: string;

	@Field(() => String)
	habitId!: string;
}