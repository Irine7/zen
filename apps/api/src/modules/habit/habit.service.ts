import { prisma } from "@/lib/prisma";
import { Habit } from './habit.entity';
import { GraphQLError } from "graphql";

export class HabitService {
	// Находит привычку по ID или выбрасывает GraphQLError
	static async getByIdOrThrow(id: string): Promise<Habit> {
		const habit = await prisma.habit.findUnique({ where: { id } });
		if (!habit) {
			throw new GraphQLError(`Привычка с ID ${id} не найдена`);
		}
		return habit;
	}

	// Находит дерево с привязанной привычкой
	static async getWithBonsai(id: string) {
		return prisma.habit.findUnique({
			where: { id },
			include: { bonsai: true }, // Достаем данные из связанной таблицы bonsai
		});
	}
}
