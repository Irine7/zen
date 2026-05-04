import { Field, ObjectType } from "type-graphql";
import { User } from "../user/user.entity";

@ObjectType()
export class AuthPayload {
	@Field()
	token!: string;

	@Field(() => User)
	user!: User;
}