import { Resolver, Query, Mutation, Arg, Ctx, createUnionType } from "type-graphql";
import { prisma } from "@/lib/prisma";
import { Seed } from "./seed.entity";
import { Inventory } from "./inventory.entity";
import { SeedNotFoundError, InsufficientFundsError } from "./errors";
import type { Context } from "@/types/context";
import { GraphQLError } from "graphql";

// Создаем Union Type. Покупка может вернуть: инвентарь (успех), ошибку отсутствия семечка или нехватки средств
export const BuySeedResult = createUnionType({
  name: "BuySeedResult",
  types: () => [Inventory, SeedNotFoundError, InsufficientFundsError] as const,
});

@Resolver(() => Inventory)
export class ShopResolver {
  // Получаем список всех семян в магазине
  @Query(() => [Seed])
  async getSeeds(): Promise<Seed[]> {
    return prisma.seed.findMany({
      orderBy: { price: "asc" }
    });
  }

  // Получаем инвентарь текущего пользователя
  @Query(() => [Inventory])
  async getInventory(@Ctx() ctx: Context): Promise<Inventory[]> {
    if (!ctx.userId) {
      throw new GraphQLError("Вы не авторизованы!", {
        extensions: { code: "UNAUTHENTICATED" }
      });
    }

    return prisma.inventory.findMany({
      where: { userId: ctx.userId },
      include: { seed: true }
    });
  }

  // Покупаем семечко
  @Mutation(() => BuySeedResult)
  async buySeed(
    @Arg("seedId", () => String) seedId: string,
    @Ctx() ctx: Context
  ) {
    const userId = ctx.userId;
    if (!userId) {
      throw new GraphQLError("Вы не авторизованы!", {
        extensions: { code: "UNAUTHENTICATED" }
      });
    }

    // Запускаем транзакцию
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