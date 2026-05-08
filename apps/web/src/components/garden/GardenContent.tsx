"use client";

import { useQuery } from '@apollo/client/react';
import { BonsaiCard } from './BonsaiCard';
import { GET_GARDEN, GET_USER_PROFILE, GET_ME } from '@/src/graphql/queries';
import { GetGardenData } from '@/src/types/garden';
import { GardenHeader } from './GardenHeader';
import { BackgroundGlow } from '@/src/components/ui/BackgroundGlow';
import { PlantTreeButton } from './PlantTreeButton';
import { UserProfileData } from '@/src/types/user';

interface GetMe {
	getMe: {
		id: string;
		email: string;
		name: string;
	};
}

// Компонент GardenContent обрабатывает загрузку и отображение сада
// Он должен быть обернут в AuthGuard
export const GardenContent = () => {
	const { data: meData, loading: meLoading, error: meError } = useQuery<GetMe>(GET_ME);
	const userId = meData?.getMe?.id;

	const { data: gardenData, loading: gardenLoading, error: gardenError } = useQuery<GetGardenData>(GET_GARDEN);
	const { data: userData, loading: userLoading, error: userError } = useQuery<UserProfileData>(GET_USER_PROFILE, {
		variables: { id: userId || "" },
		skip: !userId
	});

	if (meLoading || gardenLoading || userLoading) {
		return <div className="min-h-screen flex items-center justify-center text-emerald-500">Загрузка сада...</div>;
	}

	if (meError || gardenError || userError) {
		return (
			<div className="min-h-screen flex items-center justify-center text-red-500">
				Ошибка: {meError?.message || gardenError?.message || userError?.message}
			</div>
		);
	}

	return (
		<div className="zen-layout">
			<BackgroundGlow />
			<div className="zen-container">
				<GardenHeader points={userData?.getUserProfile.zenPoints || 0} />
				<main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{gardenData?.getGarden.map((bonsai, index) => (
						<BonsaiCard key={bonsai.id} bonsai={bonsai} index={index} />
					))}
					<PlantTreeButton />
				</main>
			</div>
		</div>
	);
};
