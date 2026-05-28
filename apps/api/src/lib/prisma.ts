import "dotenv/config";
import { PrismaClient } from '../generated/prisma';

// В Prisma 7+ нативный драйвер автоматически использует DATABASE_URL из окружения.
// Мы убираем адаптер Neon, так как он вызывает проблемы с определением хоста при локальной разработке.
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});