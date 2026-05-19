import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const SEEDS_TO_CREATE = [
  {
    type: 'PINE',
    name: 'Сосна (Pine)',
    price: 50,
    description: 'Символ долголетия, стойкости и силы духа. Идеально подходит для привычек, связанных со спортом и здоровьем.',
  },
  {
    type: 'SAKURA',
    name: 'Сакура (Cherry)',
    price: 100,
    description: 'Символ красоты, творчества и быстротечности жизни. Идеально для хобби, искусства и творческих привычек.',
  },
  {
    type: 'MAPLE',
    name: 'Японский Клен (Maple)',
    price: 75,
    description: 'Символ спокойствия, мудрости и гармонии. Идеально для медитации, чтения и обучения.',
  },
  {
    type: 'BAMBOO',
    name: 'Бамбук (Bamboo)',
    price: 60,
    description: 'Символ гибкости, быстрого роста и стойкости перед бурями. Идеально для йоги, растяжки или изучения языков.',
  },
];

async function main() {
  console.log('🌱 Начинаем заполнение магазина семенами...');

  for (const seedData of SEEDS_TO_CREATE) {
    const seed = await prisma.seed.upsert({
      where: { type: seedData.type },
      update: {
        name: seedData.name,
        price: seedData.price,
        description: seedData.description,
      },
      create: seedData,
    });
    console.log(`✅ Семечко ${seed.type} готово! Цена: ${seed.price} Zen Points`);
  }

  console.log('🚀 Магазин успешно наполнен семенами!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при наполнении магазина:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
