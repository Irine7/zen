"use client";


import { BonsaiCard } from './BonsaiCard';
import { GardenHeader } from './GardenHeader';
import { BackgroundGlow } from '@/src/components/ui/BackgroundGlow';
import { PlantTreeButton } from './PlantTreeButton';
import { Modal } from "../ui/Modal";
import { PlantTreeForm } from "./PlantTreeForm";
import { ShopModal } from "./ShopModal";
import { useGarden } from '@/src/hooks/useGarden';

// Компонент GardenContent обрабатывает загрузку и отображение сада
// Он должен быть обернут в AuthGuard
export const GardenContent = () => {
	const { 
        isLoading,
		error,
		errorMessage,
		...otherData
	} = useGarden();

	if (isLoading) {
		return <div className="min-h-screen flex items-center justify-center text-emerald-500">
			Загрузка сада...
		</div>;
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center text-red-500">
				Ошибка: {errorMessage}
			</div>
		);
	}

	return (
		<div className="zen-layout">
			<BackgroundGlow />
			<div className="zen-container">
				<GardenHeader points={otherData.userData?.getUserProfile.zenPoints} />
				<main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{otherData.gardenData?.getGarden.map((bonsai, index) => (
						<BonsaiCard key={bonsai.id} bonsai={bonsai} index={index} />
					))}
					<PlantTreeButton 
					onClick={() => otherData.setIsModalOpen(true)}
					isCreating={otherData.loading.isCreating}
					/>
				</main>
				<Modal 
					isOpen={otherData.isModalOpen}
					onClose={() => otherData.setIsModalOpen(false)}
					title="Посадить дерево"
				>
					<PlantTreeForm
						inventoryLoading={otherData.inventoryLoading}
						inventory={otherData.inventoryData?.getInventory}
						isCreating={otherData.loading.isCreating}
						onSubmit={otherData.handlePlant}
						onNavigateToShop={() => {
							otherData.setIsModalOpen(false);
							otherData.setIsShopModalOpen(true);
						}}
					/>
				</Modal>
				<ShopModal 
					isOpen={otherData.isShopModalOpen} 
					onClose={() => otherData.setIsShopModalOpen(false)} 
					zenPoints={otherData.userData?.getUserProfile.zenPoints} 
					userId={otherData.userId || ""}
				/>
			</div>
		</div>
	);
};
