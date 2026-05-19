import { Arg, Query, Resolver, Ctx } from 'type-graphql';
import { GraphQLError } from 'graphql';
import { User } from './user.entity';
import { UserService } from './user.service';
import type { Context } from '@/types/context';

@Resolver(() => User)
export class UserResolver {
	// Получаем одного пользователя
	@Query(() => User)
	async getUserProfile(
		@Arg("id", () => String) id: string,
	): Promise<User> {
		return UserService.getByIdOrThrow(id);
	}

	@Query(() => User, { nullable: true })
	async getMe(@Ctx() { userId }: Context): Promise<User | null> {
		if (!userId) {
			throw new GraphQLError("Вы не авторизованы", { extensions: { code: 'UNAUTHENTICATED' } });
		}
		return UserService.getById(userId);
	}
}