import { BONSAI_RULES, BonsaiStatus } from "@zen/shared-types";
import { ExtendedBonsai } from "@/src/types/garden";

export function useBonsaiStatus(bonsai: ExtendedBonsai) {
	const lastWateredAtDate = new Date(bonsai.lastWateredAt).getTime();
	const now = Date.now();
	const diff = now - lastWateredAtDate;
	const hydration = Math.max(0, 100 - (diff / BONSAI_RULES.DEATH_THRESHOLD_MS) * 100);
	const hydrationColor = hydration > 50 ? 'bg-emerald-500' : hydration > 25 ? 'bg-yellow-500' : 'bg-red-500';

	const isHealthy = diff < BONSAI_RULES.SICK_THRESHOLD_MS;
	const isSick = diff >= BONSAI_RULES.SICK_THRESHOLD_MS && diff < BONSAI_RULES.DEATH_THRESHOLD_MS;
	const isDead = diff >= BONSAI_RULES.DEATH_THRESHOLD_MS;
	const status = isHealthy ? BonsaiStatus.HEALTHY : isSick ? BonsaiStatus.SICK : BonsaiStatus.DEAD;

	return { hydration, hydrationColor, isHealthy, isSick, isDead, status };
} 