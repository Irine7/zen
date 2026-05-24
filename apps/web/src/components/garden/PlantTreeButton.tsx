import { useState } from 'react';
import { motion } from "framer-motion";
import { useQuery, useMutation } from '@apollo/client/react';
import { Loader, Star } from "lucide-react";
import { ANIMATIONS } from '@/src/constants/animations';
import { Modal } from '@/src/components/ui/Modal';
import { useBonsaiActions } from '@/src/hooks/useBonsaiActions';
import { GET_INVENTORY, CREATE_HABIT } from '@/src/graphql/queries';

interface InventoryItem {
    id: string;
    quantity: number;
    seed: {
        id: string;
        name: string;
        type: string;
    };
}

interface InventoryData {
    getInventory: InventoryItem[];
}


export function PlantTreeButton() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [habitTitle, setHabitTitle] = useState('');
	const [selectedSeedId, setSelectedSeedId] = useState('');
	const { data: inventoryData, loading: inventoryLoading } = useQuery<InventoryData>(GET_INVENTORY);
	const [createHabit] = useMutation<
		{ createHabit: { id: string; title: string } },
		{ input: { title: string } }
	>(CREATE_HABIT);

	const { createBonsai, loading } = useBonsaiActions();

	const handlePlant = async () => {
		if (!habitTitle || !selectedSeedId) return;
		try {
			// Создаем привычку
			const habitResult = await createHabit({
				variables: { input: { title: habitTitle } }
			});
			const newHabitId = habitResult.data?.createHabit?.id;
			if (!newHabitId) {
				throw new Error("Не удалось создать привычку");
			}
			// Сажаем дерево на эту привычку
			await createBonsai(selectedSeedId, newHabitId);

			// Закрываем модалку и сбрасываем поля
			setIsModalOpen(false);
			setHabitTitle("");
			setSelectedSeedId("");
		} catch (error) {
			console.error("Ошибка при посадке дерева:", error);
		}
	}

	console.log("Инвентарь:", inventoryData);

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
				
				{
					inventoryLoading ? (
						<p className="text-zinc-400">Загрузка инвентаря...</p>
					) : !inventoryData?.getInventory || inventoryData.getInventory.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
							<p className="text-zinc-400 text-sm">
								У вас нет семечек. Купите их в магазине!
							</p>
							<button 
								onClick={() => alert("Магазин в разработке! Скоро здесь появится полноценная витрина. 😉")}
								className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
							>
								Перейти в магазин
							</button>
						</div>
					) : (
						<div className="space-y-2">
							<label className="block text-sm font-medium text-zinc-400 mb-2 mt-4">Название привычки</label>
							<input type="text" value={habitTitle} onChange={(e) => setHabitTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
							<label className="block text-sm font-medium text-zinc-400 mb-2 mt-4">Выберите семечко</label>
							<select value={selectedSeedId} onChange={(e) => setSelectedSeedId(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors">
								<option value="">Выберите семечко</option>
								{inventoryData.getInventory.map((item) => (
									<option key={item.id} value={item.seed.id}>{item.seed.name}</option>
								))}
							</select>
							<button onClick={handlePlant} disabled={loading.isCreating || !habitTitle || !selectedSeedId} className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 font-semibold py-2.5 rounded-lg transition-colors">Посадить</button>
						</div>
					)
				}				
			</Modal>
		</>
	);
}