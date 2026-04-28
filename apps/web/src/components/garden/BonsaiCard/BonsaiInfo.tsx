import { ExtendedBonsai } from '@/src/types/garden';

export function BonsaiInfo({ bonsai }: { bonsai: ExtendedBonsai; }) {
	return (
		<div className="flex flex-col gap-0.5">
			<h3 className="zen-card-title">{bonsai.habit.title}</h3>
			<span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Active Habit</span>
		</div>
	);
}