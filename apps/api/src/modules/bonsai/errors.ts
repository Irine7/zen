import { ObjectType, Field } from "type-graphql";
import { ErrorCode } from "@zen/shared-types";

// Когда мы ищем дерево по ID, а его нет
@ObjectType()
export class BonsaiNotFoundError {
	@Field(() => String)
	message: string = "Дерево не найдено";

	@Field(() => String)
	code: string = ErrorCode.NOT_FOUND;
}

// Когда мы пытаемся полить мертвое дерево
@ObjectType()
export class BonsaiAlreadyDeadError {
	@Field(() => String)
	message: string = "К сожалению, это дерево погибло";

	@Field(() => String)
	code: string = ErrorCode.ALREADY_DEAD;
}