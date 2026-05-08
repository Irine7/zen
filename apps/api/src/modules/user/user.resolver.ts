import { Arg, Query, Resolver, Ctx } from 'type-graphql';
import { User } from './user.entity';
import { UserService } from './user.service';
import type { Context } from '@/types/context';
import { prisma } from '@/lib/prisma';

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
		if (!userId) return null;
		return UserService.getById(userId);
	}
}