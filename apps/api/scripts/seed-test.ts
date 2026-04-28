import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем создание тестовых данных...');

  // 1. Создаем пользователя с ID "1"
  const user = await prisma.user.upsert({
    where: { id: "1" },
    update: {},
    create: {
      id: "1",
      email: "test@example.com",
      name: "Test User",
    },
  });
  console.log('✅ Пользователь создан:', user.id);

  // 2. Создаем привычку с ID "h1" для этого пользователя
  const habit = await prisma.habit.upsert({
    where: { id: "h1" },
    update: {},
    create: {
      id: "h1",
      title: "Coding practice",
      userId: "1",
    },
  });
  console.log('✅ Привычка создана:', habit.id);

  console.log('🚀 Теперь кнопка в интерфейсе должна заработать!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при сидировании:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
