import { Droplets, Settings, Trash2 } from 'lucide-react';
import { ExtendedBonsai } from '@/src/types/garden';
import { useBonsaiActions } from '@/src/hooks/useBonsaiActions';
import { useBonsaiStatus } from '@/src/hooks/useBonsaiStatus';

export function BonsaiActions({ bonsai }: { bonsai: ExtendedBonsai; }) {
	const { water, levelUp, deleteBonsai, loading } = useBonsaiActions(bonsai.id);
	const { isDead } = useBonsaiStatus(bonsai);

	return (
		<div className="flex gap-3 pt-2">
			{!isDead && (
				<>
					<button className="flex-1 btn-primary" onClick={water} disabled={loading.isWatering}>
						<Droplets size={16} />
						{loading.isWatering ? 'Watering...' : 'Water Tree'}
					</button>
					<button className="btn-icon" onClick={levelUp} disabled={loading.isLevelingUp}>
						<Settings size={18} />
					</button>
				</>
			)}
			{isDead && (
				<button className="btn-icon" onClick={deleteBonsai} disabled={loading.isDeleting}>
					<Trash2 size={18} />
				</button>
			)}
		</div>
	);
}