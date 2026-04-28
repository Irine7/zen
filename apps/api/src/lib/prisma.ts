import "dotenv/config";
import { PrismaClient } from '@prisma/client';

// В Prisma 7+ нативный драйвер автоматически использует DATABASE_URL из окружения.
// Мы убираем адаптер Neon, так как он вызывает проблемы с определением хоста при локальной разработке.
export const prisma = new PrismaClient();