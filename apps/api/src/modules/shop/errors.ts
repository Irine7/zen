import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
export class SeedNotFoundError {
	@Field(() => String)
	message!: string;
}

@ObjectType()
export class InsufficientFundsError {
	@Field(() => String)
	message!: string;

	@Field(() => Int)
	requiredPoints!: number;

	@Field(() => Int)
	actualPoints!: number;
}