import DataLoader from "dataloader";
import { prisma } from "@/lib/prisma";
import { Habit } from "@/modules/habit/habit.entity";
import { User } from "@/modules/user/user.entity";

export function createLoaders() {
  return {
    habitLoader: new DataLoader<string, Habit | null>(async (keys) => {
      // Запрашиваем привычки из БД, чьи id находятся в keys
      const habits = await prisma.habit.findMany({
        where: { id: { in: [...keys] } } // Объединение запросов по id
      });
      
      // Создаем пустую карту, где ключом будет строка (ID), а значением - объект Habit
      const habitMap = new Map<string, Habit>();
      
      // Заполняем карту данными из БД
      habits.forEach(habit => { habitMap.set(habit.id, habit) });

      // Возвращаем массив привычек  (который пришел на входе) в том порядке, в котором идут keys
      return keys.map(key => habitMap.get(key) || null);
    }),

    userLoader: new DataLoader<string, User | null>(async (keys) => {
      const users = await prisma.user.findMany({
        where: { id: { in: [...keys] } }
      });

      const userMap = new Map<string, User>();
      users.forEach(user => { userMap.set(user.id, user) });

      return keys.map(key => userMap.get(key) || null);
    })
  };
}
