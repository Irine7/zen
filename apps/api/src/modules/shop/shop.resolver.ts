import { Resolver, Query, Mutation, Arg, Ctx, createUnionType } from "type-graphql";
import { GraphQLError } from "graphql";
import { Seed } from "./seed.entity";
import { Inventory } from "./inventory.entity";
import { SeedNotFoundError, InsufficientFundsError } from "./errors";
import type { Context } from "@/types/context";
import { ShopService } from "./shop.service";

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
    return ShopService.getSeeds();
  }

  // Получаем инвентарь текущего пользователя
  @Query(() => [Inventory])
  async getInventory(@Ctx() ctx: Context): Promise<Inventory[]> {
    if (!ctx.userId) {
      throw new GraphQLError("Вы не авторизованы!", {
        extensions: { code: "UNAUTHENTICATED" }
      });
    }

    return ShopService.getInventory(ctx.userId);
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

    return ShopService.buySeed(userId, seedId);
  }
}