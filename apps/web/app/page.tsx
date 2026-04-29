"use client";

import { useQuery } from '@apollo/client/react';
import { BonsaiCard } from '@/src/components/garden/BonsaiCard';
import { GET_GARDEN } from '@/src/graphql/queries';
import { GetGardenData } from '@/src/types/garden';
import { GardenHeader } from '@/src/components/garden/GardenHeader';
import { BackgroundGlow } from '@/src/components/ui/BackgroundGlow';
import { PlantTreeButton } from '@/src/components/garden/PlantTreeButton';
import { GET_USER_PROFILE } from '@/src/graphql/queries';

interface UserProfileData {
	getUserProfile: {
		id: string;
		zenPoints: number;
	};
}

export default function ZenGardenPage() {
	const { data, loading: gardenLoading, error: gardenError } = useQuery<GetGardenData>(GET_GARDEN);
	const { data: userData, loading: userLoading, error: userError } = useQuery<UserProfileData>(GET_USER_PROFILE, {
		variables: { id: "1" }
	});

	if (gardenLoading || userLoading) return <div>Загрузка...</div>;
	if (gardenError || userError) return <div>Ошибка: {gardenError?.message || userError?.message}</div>;

	return (
		<div className="zen-layout">
			<BackgroundGlow />
			<div className="zen-container">
				<GardenHeader points={userData?.getUserProfile.zenPoints || 0} />
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