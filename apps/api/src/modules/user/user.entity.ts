import { ObjectType, Field, ID, Int } from "type-graphql";

@ObjectType()
export class User {
	@Field(() => ID)
	id!: string;

	@Field(() => String)
	email!: string;

	password!: string;

	@Field(() => String, { nullable: true }) // Имя может быть пустым
	name?: string | null;

	@Field(() => Int)
	zenPoints!: number;
}
