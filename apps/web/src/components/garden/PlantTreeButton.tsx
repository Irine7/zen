import { motion } from "framer-motion";
import { Loader, Star } from "lucide-react";
import { ANIMATIONS } from '@/src/constants/animations';
import { Modal } from '@/src/components/ui/Modal';
import { usePlantTree } from '@/src/hooks/usePlantTree';
import { PlantTreeForm } from "./PlantTreeForm";

export function PlantTreeButton() {
	const {
		isModalOpen, 
		setIsModalOpen, 
		inventoryData, 
		inventoryLoading, 
		loading, 
		handlePlant
	} = usePlantTree();
	
	return (
		<>
			<motion.button
				whileHover={ANIMATIONS.hover}
				whileTap={ANIMATIONS.tap}
				onClick={() => setIsModalOpen(true)}
				//disabled={loading.isCreating}
				className="group glass-card-dashed"
			>
				<div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
					{loading.isCreating ? <Loader className="animate-spin" size={24} /> : <Star size={24} />}
				</div>
				<span className="font-medium">Plant New Tree</span>
			</motion.button>
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Plant New Tree">
  				<PlantTreeForm 
					inventoryLoading={inventoryLoading}
					inventory={inventoryData?.getInventory}
					isCreating={loading.isCreating}
					onSubmit={handlePlant} // Передаем функцию, которая примет (title, seedId)
				/>
			</Modal>
		</>
	);
}