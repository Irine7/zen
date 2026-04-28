import { motion } from "framer-motion";
import { ExtendedBonsai } from "@/src/types/garden";
import { ASSETS } from "@/src/constants/assets";

export function BonsaiImage({ bonsai }: { bonsai: ExtendedBonsai; }) {
	const image = ASSETS[bonsai.type as keyof typeof ASSETS] || ASSETS.PINE;

	return (
		<div className="zen-card-image-container">
			<div className="zen-card-image-glow" />
			<motion.img
				src={image}
				alt={bonsai.type}
				whileHover={{ scale: 1.05, rotate: -1 }}
				className="relative z-10 h-full w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
			/>
		</div>
	);
}