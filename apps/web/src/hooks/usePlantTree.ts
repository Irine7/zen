import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { CREATE_HABIT, GET_INVENTORY } from '../graphql/queries';
import { useBonsaiActions } from './useBonsaiActions';


interface InventoryItem {
    id: string;
    quantity: number;
    seed: {
        id: string;
        name: string;
        type: string;
    };
}

export interface InventoryData {
    getInventory: InventoryItem[];
}

export function usePlantTree() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: inventoryData, loading: inventoryLoading } = useQuery<InventoryData>(GET_INVENTORY);
  const [createHabit] = useMutation<{ createHabit: { id: string; title: string } }, { input: { title: string } }>(CREATE_HABIT);
  const { createBonsai, loading: bonsaiLoading } = useBonsaiActions();

  // Принимаем аргументы в функцию
  const handlePlant = async (habitTitle: string, selectedSeedId: string) => {
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
		} catch (error) {
			console.error("Ошибка при посадке дерева:", error);
		}
	}

    console.log("Инвентарь:", inventoryData);

  return {
    isModalOpen,
    setIsModalOpen,
    inventoryData,
    inventoryLoading,
    loading: bonsaiLoading,
    handlePlant,
  };
}
