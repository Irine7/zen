import { prisma } from "@/lib/prisma";
import { Bonsai } from './bonsai.entity';
import { BonsaiNotFoundError } from "./errors";
import { GraphQLError } from "graphql";

export class BonsaiService {
	// Находит дерево или возвращает объект ошибки (для Union Types)
	static async getById(id: string): Promise<Bonsai | BonsaiNotFoundError> {
		const tree = await prisma.bonsai.findUnique({ where: { id } });
		
		if (!tree) {
			const error = new BonsaiNotFoundError();
			error.message = `Дерево с ID ${id} не найдено`;
			return error;
		}
		return tree;
	}

	// Централизованная обработка ошибок Prisma
	static handleDbError(error: any, id: string): BonsaiNotFoundError | never {
		if (error.code === 'P2025') {
			const notFound = new BonsaiNotFoundError();
			notFound.message = `Дерево с ID ${id} не найдено`;
			return notFound;
		}

		console.error("Критическая ошибка БД:", error);
		throw new GraphQLError("Внутренняя ошибка сервера");
	}
}
