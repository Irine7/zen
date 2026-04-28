export interface IHabit {
  id: string;
  title: string;
  description?: string | null;
  userId: string;
}

export interface IBonsai {
  id: string;
  userId: string;
  habitId: string;
  type: BonsaiType;
  level: number;
  lastWateredAt: Date;
  createdAt: Date;
}

export type BonsaiType = 'PINE' | 'MAPLE';

export interface IUser {
  id: string;
  email: string;
  name?: string;
}

// --- Константы игры ---
export const BONSAI_RULES = {
  DEATH_THRESHOLD_MS: 7 * 24 * 60 * 60 * 1000, // 7 дней
  SICK_THRESHOLD_MS: 3 * 24 * 60 * 60 * 1000,     // 3 дня
};

// --- Коды ошибок ---
export enum ErrorCode {
  NOT_FOUND = "NOT_FOUND",
  ALREADY_COMPLETED = "ALREADY_COMPLETED",
  ALREADY_DEAD = "ALREADY_DEAD",
  UNAUTHORIZED = "UNAUTHORIZED",
}

// --- Статусы дерева ---
export enum BonsaiStatus {
  HEALTHY = "HEALTHY",
  SICK = "SICK",
  DEAD = "DEAD",
}

