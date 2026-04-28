import { ObjectType, Field } from "type-graphql";
import { ErrorCode } from "@zen/shared-types";

@ObjectType()
export class HabitNotFoundError {
	@Field(() => String)
	message: string = "Привычка не найдена";

	@Field(() => String)
	code: string = ErrorCode.NOT_FOUND;
}

@ObjectType()
export class HabitAlreadyCompletedError {
	@Field(() => String)
	message: string = "Привычка уже выполнена";

	@Field(() => String)
	code: string = ErrorCode.ALREADY_COMPLETED;
}