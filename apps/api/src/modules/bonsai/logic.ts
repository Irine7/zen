import { BONSAI_RULES } from "@zen/shared-types";
import { BonsaiAlreadyDeadError } from "./errors";

// Проверяет, погибло ли дерево. Используется в FieldResolver для определения статуса
export function isBonsaiDead(lastWateredAt: Date): boolean {
	return Date.now() - lastWateredAt.getTime() > BONSAI_RULES.DEATH_THRESHOLD_MS;
}

// Валидатор для мутаций. Если дерево мертво — возвращает объект ошибки, иначе null
export function validateBonsaiAlive(lastWateredAt: Date): BonsaiAlreadyDeadError | null {
	if (isBonsaiDead(lastWateredAt)) {
		return new BonsaiAlreadyDeadError();
	}
	return null;
}