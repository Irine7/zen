import { ObjectType, Field, ID, Int } from "type-graphql";

@ObjectType()
export class Seed {
	@Field(() => ID)
	id!: string;

	@Field(() => String)
	type!: string; // PINE, SAKURA, MAPLE, BAMBOO

	@Field(() => String)
	name!: string;

	@Field(() => Int)
	price!: number;

	@Field(() => String, { nullable: true })
	description?: string | null;
}