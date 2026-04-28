import { ExtendedBonsai } from "@/src/types/garden";

export function LevelProgress({ bonsai }: { bonsai: ExtendedBonsai }) {
	return (
		<div className="relative w-12 h-12 flex items-center justify-center">
			<svg className="absolute w-full h-full -rotate-90 transform">
				<circle
					cx="24"
					cy="24"
					r="18"
					stroke="currentColor"
					strokeWidth="2.5"
					fill="transparent"
					className="text-white/5"
				/>
				<circle
					cx="24"
					cy="24"
					r="18"
					stroke="currentColor"
					strokeWidth="2.5"
					fill="transparent"
					strokeDasharray="113"
					strokeDashoffset={113 * (1 - 0.65)}
					strokeLinecap="round"
					className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out"
				/>
			</svg>
			<div className="flex flex-col items-center justify-center leading-none">
				<span className="text-[8px] text-zinc-500 font-bold tracking-tighter uppercase">Lvl</span>
				<span className="text-sm font-bold text-white">{bonsai.level}</span>
			</div>
		</div>
	);
}