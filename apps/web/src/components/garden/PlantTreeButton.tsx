import { motion } from "framer-motion";
import { Loader, Star } from "lucide-react";
import { ANIMATIONS } from '@/src/constants/animations';
import { useBonsaiActions } from '@/src/hooks/useBonsaiActions';

export function PlantTreeButton() {
	const { createBonsai, loading } = useBonsaiActions();

	const handleClick = async () => {
		await createBonsai("PINE", "l3", "1");
	}

	return (
		<motion.button
			whileHover={ANIMATIONS.hover}
			whileTap={ANIMATIONS.tap}
			onClick={handleClick}
			disabled={loading.isCreating}
			className="group glass-card-dashed"
		>
			<div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
				{loading.isCreating ? <Loader className="animate-spin" size={24} /> : <Star size={24} />}
			</div>
			<span className="font-medium">Plant New Tree</span>
		</motion.button>
	);
}