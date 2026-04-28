import { GraphQLError } from "graphql";
import type { Prisma } from '@prisma/client';
import { prisma } from "@/lib/prisma";
import { User } from './user.entity';

export class UserService {
	// Находит пользователя по ID или выбрасывает GraphQLError
	static async getByIdOrThrow(id: string): Promise<User> {
		const user = await prisma.user.findUnique({ where: { id } });
		if (!user) {
			throw new GraphQLError(`Пользователь с ID ${id} не найден`);
		}
		return user;
	}

	// Добавляет очки пользователю
	static async addPoints(userId: string, points: number, tx?: Prisma.TransactionClient) {
		const client = tx || prisma; // Позволяет работать внутри транзакции
		return client.user.update({
			where: { id: userId },
			data: { zenPoints: { increment: points } }
		})
	}
}
