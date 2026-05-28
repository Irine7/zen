# Веха 1: Решение проблемы N+1 с помощью DataLoader 🚀

## Введение в проблему

Сейчас, когда клиент запрашивает список деревьев в саду (`getGarden`), GraphQL-сервер выполняет один SQL-запрос для получения всех деревьев:
```sql
SELECT * FROM "Bonsai" WHERE "userId" = 'some-user-id';
```

Однако в `BonsaiResolver` у нас есть `@FieldResolver` для поля `habit`, который подтягивает детали привычки для каждого дерева:
```typescript
@FieldResolver(() => Habit)
async habit(@Root() bonsai: Bonsai): Promise<Habit> {
    return HabitService.getByIdOrThrow(bonsai.habitId);
}
```
Если в саду 10 деревьев, этот метод вызовется **10 раз**. Для каждого дерева бэкенд сделает отдельный запрос к базе:
```sql
SELECT * FROM "Habit" WHERE "id" = 'habit-id-1';
SELECT * FROM "Habit" WHERE "id" = 'habit-id-2';
-- ... и так 10 раз!
```
Это и есть **проблема N+1** (1 запрос на получение списка + N запросов на получение связанных сущностей).

---

## 📖 Что нужно изучить (Теоретическая подготовка)

Перед тем как писать код, пожалуйста, изучи следующие темы:
1.  **Проблема N+1 в GraphQL**:
    *   Прочитай статью на Хабре: *«GraphQL: решаем проблему N+1 запросов»* или введи в поиск *"GraphQL N+1 problem"*.
2.  **Как работает DataLoader**:
    *   Пойми две ключевые функции: **Batching** (группировка мелких запросов в один большой с использованием оператора типа `IN` в SQL) и **Caching** (сохранение результатов в рамках одного HTTP-запроса).
    *   Официальный репозиторий библиотеки: [graphql/dataloader](https://github.com/graphql/dataloader).
    *   *Важно*: DataLoader создается заново на **каждый** входящий HTTP-запрос (в контексте), чтобы кэш запросов одного пользователя не утёк другому.

---

## 🛠️ Шаги для реализации (Твой план действий)

### Шаг 1: Установка библиотеки
В папке `apps/api` нужно установить библиотеку `dataloader`.
*   **Команда**: `pnpm --filter @zen/api add dataloader` (или просто `npm install dataloader` в директории `apps/api`).

### Шаг 2: Создание DataLoader для Habit
Создадим новый файл для загрузчиков, например, `apps/api/src/lib/dataloaders.ts`.
Тебе нужно будет написать функцию, которая:
1.  Принимает массив `keys` (это будут `habitId` типа `string[]`).
2.  Делает **один** запрос к базе данных через Prisma, чтобы достать все привычки, чьи ID находятся в массиве `keys` (используя оператор `in`).
3.  **Критически важно**: возвращает массив привычек в том же порядке, в котором шли переданные ключи `keys`. Если для какого-то ключа привычка не найдена, на его месте должен быть `null` или ошибка.

*Пример логики выравнивания порядка (Map-паттерн):*
```typescript
// Получили список из БД: [{id: 'b', title: 'Habit B'}, {id: 'a', title: 'Habit A'}]
// А на входе keys были: ['a', 'b']
// Нужно вернуть: [{id: 'a', title: 'Habit A'}, {id: 'b', title: 'Habit B'}]
```

### Шаг 3: Подключение DataLoader к Apollo Context
В файле `apps/api/src/index.ts` (или там, где инициализируется `Context` сервера):
1.  Расширить тип `Context` в `apps/api/src/types/context.ts`, добавив туда свойство `loaders`.
2.  В функции `context` при создании Apollo Server инициализировать новый экземпляр `DataLoader` на каждый запрос.

### Шаг 4: Использование DataLoader в Резолвере
В [BonsaiResolver](file:///c:/Users/TEKNES/Desktop/zen/apps/api/src/modules/bonsai/bonsai.resolver.ts):
1.  Получить `ctx` (контекст) в `@FieldResolver(() => Habit)`.
2.  Вместо вызова `HabitService.getByIdOrThrow(bonsai.habitId)` вызвать метод `.load(bonsai.habitId)` у созданного лоадера из контекста.

---

## 🧪 План Верификации (Как проверить)

### Ручное тестирование в Prisma Studio или GraphQL Playground
1.  Открой консоль сервера `apps/api`.
2.  Сделай GraphQL Query на получение всего сада с привычками:
    ```graphql
    query {
      getGarden {
        id
        habit {
          id
          title
        }
      }
    }
    ```
3.  Посмотри в консоль бэкенда (у нас настроено логирование запросов Prisma). Вместо кучи строк `SELECT ... WHERE id = ...` ты должна увидеть ровно один запрос `SELECT ... WHERE id IN (...)`.
