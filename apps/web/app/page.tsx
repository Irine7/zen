"use client";

import { useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { BonsaiCard } from '@/src/components/garden/BonsaiCard';
import { GET_GARDEN } from '@/src/graphql/queries';
import { GetGardenData } from '@/src/types/garden';
import { GardenHeader } from '@/src/components/garden/GardenHeader';
import { BackgroundGlow } from '@/src/components/ui/BackgroundGlow';
import { PlantTreeButton } from '@/src/components/garden/PlantTreeButton';
import { GET_USER_PROFILE } from '@/src/graphql/queries';
import { UserProfileData } from '@/src/types/user';
import { AUTH_TOKEN_KEY } from '@/constants/auth';

export default function ZenGardenPage() {
	const router = useRouter();
	const { data, loading: gardenLoading, error: gardenError } = useQuery<GetGardenData>(GET_GARDEN);
	const { data: userData, loading: userLoading, error: userError } = useQuery<UserProfileData>(GET_USER_PROFILE, {
		variables: { id: "1" }
	});

	useEffect(() => {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!token) {
			router.push("/login");
		}
		if (userError || gardenError) {
			router.push("/login");
		}
	}, [userError, gardenError, router]);

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