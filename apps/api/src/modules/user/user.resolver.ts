import { Arg, Query, Resolver } from 'type-graphql';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
	// Получаем одного пользователя
	@Query(() => User)
	async getUserProfile(
		@Arg("id", () => String) id: string,
	): Promise<User> {
		return UserService.getByIdOrThrow(id);
	}
}