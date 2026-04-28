"use client";

import { useQuery } from '@apollo/client/react';
import { BonsaiCard } from '@/src/components/garden/BonsaiCard';
import { GET_GARDEN } from '@/src/graphql/queries';
import { GetGardenData } from '@/src/types/garden';
import { GardenHeader } from '@/src/components/garden/GardenHeader';
import { BackgroundGlow } from '@/src/components/ui/BackgroundGlow';
import { PlantTreeButton } from '@/src/components/garden/PlantTreeButton';

export default function ZenGardenPage() {
	const { data, loading, error } = useQuery<GetGardenData>(GET_GARDEN);

	if (loading) return <div>Загрузка...</div>;
	if (error) return <div>Ошибка: {error.message}</div>;

	return (
		<div className="zen-layout">
			<BackgroundGlow />
			<div className="zen-container">
				<GardenHeader points={1240} />
				<main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{data?.getGarden.map((bonsai, index) => (
						<BonsaiCard key={bonsai.id} bonsai={bonsai} index={index} />
					))}
					<PlantTreeButton />
				</main>
			</div>
		</div>
	);
}