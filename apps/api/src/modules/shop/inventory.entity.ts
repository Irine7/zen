import { ObjectType, Field, ID, Int } from "type-graphql";
import { Seed } from "./seed.entity";

@ObjectType()
export class Inventory {
	@Field(() => ID)
	id!: string;

	@Field(() => String)
	userId!: string;

	@Field(() => String)
	seedId!: string;

	@Field(() => Int)
	quantity!: number;

	// Связанный объект семечка. Благодаря include в Prisma мы сможем 
	// запрашивать данные семечка внутри инвентаря
	@Field(() => Seed)
	seed!: Seed;

	@Field(() => Date)
	createdAt!: Date;

	@Field(() => Date)
	updatedAt!: Date;
}
