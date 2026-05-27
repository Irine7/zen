import { useState } from "react";

export interface UsePlantTreeFormProps {
  // Колбэк ожидает получить название привычки и ID семечка
  onSubmit: (habitTitle: string, selectedSeedId: string) => void;
}

export function usePlantTreeForm({ onSubmit }: UsePlantTreeFormProps) {
	const [habitTitle, setHabitTitle] = useState('');
    const [selectedSeedId, setSelectedSeedId] = useState('');

    const handleSubmit = () => {
      // Делаем trim для избежания пустых строк с пробелами
      const trimmedTitle = habitTitle.trim();
      if (trimmedTitle && selectedSeedId) {
        onSubmit(trimmedTitle, selectedSeedId);
        setHabitTitle(''); // Очищаем поле ввода
        setSelectedSeedId(''); // Сбрасываем выбор семечка
      }
    };

    return {
        habitTitle,
        setHabitTitle,
        selectedSeedId,
        setSelectedSeedId,
        handleSubmit,
    }

}