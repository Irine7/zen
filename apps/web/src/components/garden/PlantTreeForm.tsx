import { useState } from "react";

interface InventoryItem {
  id: string;
  quantity: number;
  seed: {
    id: string;
    name: string;
    type: string;
  };
}
interface PlantTreeFormProps {
  inventoryLoading: boolean;
  inventory?: InventoryItem[];
  isCreating: boolean;
  // Колбэк ожидает получить название привычки и ID семечка
  onSubmit: (habitTitle: string, selectedSeedId: string) => void;
  onNavigateToShop: () => void
}

export function PlantTreeForm({
  inventoryLoading,
  inventory = [],
  isCreating,
  onSubmit,
  onNavigateToShop,
}: PlantTreeFormProps) {
    const [habitTitle, setHabitTitle] = useState('');
    const [selectedSeedId, setSelectedSeedId] = useState('');

    const handleSubmit = () => {
      // Делаем trim для избежания пустых строк с пробелами
      const trimmedTitle = habitTitle.trim();
      if (trimmedTitle && selectedSeedId) {
        onSubmit(trimmedTitle, selectedSeedId);
      }
    };
    
  if (inventoryLoading) {
    return <p className="text-zinc-400">Загрузка инвентаря...</p>;
  }
  if (inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
        <p className="text-zinc-400 text-sm">
          У вас нет семечек. Купите их в магазине!
        </p>
        <button 
          onClick={onNavigateToShop}
          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Перейти в магазин
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-400 mb-2 mt-4">
        Название привычки
      </label>
      <input 
        type="text" 
        value={habitTitle} 
        onChange={(e) => setHabitTitle(e.target.value)} 
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
      />
      <label className="block text-sm font-medium text-zinc-400 mb-2 mt-4">
        Выберите семечко
      </label>
      <select 
        value={selectedSeedId} 
        onChange={(e) => setSelectedSeedId(e.target.value)} 
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
      >
        <option value="">Выберите семечко</option>
        {inventory.map((item) => (
          <option key={item.id} value={item.seed.id}>
            {item.seed.name}
          </option>
        ))}
      </select>
      <button 
        onClick={handleSubmit} 
        disabled={isCreating || !habitTitle.trim() || !selectedSeedId} 
        className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 font-semibold py-2.5 rounded-lg transition-colors"
      >
        Посадить
      </button>
    </div>
  );
}
