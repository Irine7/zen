"use client";

import { useQuery } from '@apollo/client/react';
import { BonsaiCard } from './BonsaiCard';
import { GET_GARDEN, GET_USER_PROFILE } from '@/src/graphql/queries';
import { GetGardenData } from '@/src/types/garden';
import { GardenHeader } from './GardenHeader';
import { BackgroundGlow } from '@/src/components/ui/BackgroundGlow';
import { PlantTreeButton } from './PlantTreeButton';
import { UserProfileData } from '@/src/types/user';
import { USER_ID_KEY } from '@/constants/auth';

// Компонент GardenContent обрабатывает загрузку и отображение сада
// Он должен быть обернут в AuthGuard
export const GardenContent = () => {
	const userId = typeof window !== 'undefined' ? localStorage.getItem(USER_ID_KEY) : null;

	const { data, loading: gardenLoading, error: gardenError } = useQuery<GetGardenData>(GET_GARDEN);
	const { data: userData, loading: userLoading, error: userError } = useQuery<UserProfileData>(GET_USER_PROFILE, {
		variables: { id: userId || "" },
		skip: !userId // Пропускаем, если ID нет (хотя AuthGuard должен это поймать)
	});

	if (gardenLoading || userLoading) {
		return <div className="min-h-screen flex items-center justify-center text-emerald-500">Загрузка сада...</div>;
	}

	if (gardenError || userError) {
		return (
			<div className="min-h-screen flex items-center justify-center text-red-500">
				Ошибка: {gardenError?.message || userError?.message}
			</div>
		);
	}

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
};
