import { ObjectType, Field, ID } from "type-graphql";
import type { IHabit } from "@zen/shared-types";
import { Bonsai } from "../bonsai/bonsai.entity";

@ObjectType()
export class Habit implements IHabit {
	@Field(() => ID)
	id!: string;

	@Field(() => String)
	title!: string;

	@Field(() => String, { nullable: true })
	description?: string | null;

	@Field(() => String)
	userId!: string;

	@Field(() => Bonsai, { nullable: true })
	bonsai?: Bonsai;
}