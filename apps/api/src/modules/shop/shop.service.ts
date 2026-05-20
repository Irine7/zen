import { prisma } from "@/lib/prisma";
import { GraphQLError } from "graphql";
import { SeedNotFoundError, InsufficientFundsError } from "./errors";
import { Inventory } from "./inventory.entity";

export class ShopService {
  static async getSeeds() {
    return prisma.seed.findMany({
      orderBy: { price: "asc" }
    });
  }
  static async getInventory(userId: string) {
    return prisma.inventory.findMany({
      where: { userId },
      include: { seed: true }
    });
  }

  static async buySeed(userId: string, seedId: string) {
    // Используем транзакцию для обеспечения атомарности операции
    return prisma.$transaction(async (tx) => {
      // Ищем семечко в магазине
      const seed = await tx.seed.findUnique({
        where: { id: seedId }
      });

      if (!seed) {
        return Object.assign(new SeedNotFoundError(), {
          message: "Семечко не найдено в магазине"
        });
      }

      // Ищем пользователя и его баланс Zen Points
      const user = await tx.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new GraphQLError("Пользователь не найден", {
          extensions: { code: "BAD_USER_INPUT" }
        });
      }

      // Проверяем, хватает ли очков для покупки
      if (user.zenPoints < seed.price) {
        return Object.assign(new InsufficientFundsError(), {
          message: `Недостаточно Zen Points. Требуется ${seed.price}, у вас ${user.zenPoints}`,
          requiredPoints: seed.price,
          actualPoints: user.zenPoints
        });
      }

      // Списываем Zen Points у пользователя
      await tx.user.update({
        where: { id: userId },
        data: {
          zenPoints: { decrement: seed.price }
        }
      });

      // Добавляем семечко в инвентарь или увеличиваем количество
      const inventoryItem = await tx.inventory.upsert({
        where: {
          userId_seedId: {
            userId: userId,
            seedId: seed.id
          }
        },
        update: {
          quantity: { increment: 1 }
        },
        create: {
          userId: userId,
          seedId: seed.id,
          quantity: 1
        },
        include: {
          seed: true // Подтягиваем информацию о семечке для возвращаемого объекта
        }
      });

      // Возвращаем объект класса Inventory (требование TypeGraphQL)
      return Object.assign(new Inventory(), inventoryItem);
    });
  }
}
