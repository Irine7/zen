import { useState } from "react";
import { useQuery } from '@apollo/client/react';
import { usePlantTree } from "./usePlantTree";
import { GET_GARDEN, GET_ME, GET_USER_PROFILE } from "../graphql/queries";
import { GetMe } from '@/src/types/auth';
import { GetGardenData } from '@/src/types/garden';
import { UserProfileData } from "../types/user";

export function useGarden() {
    const { isModalOpen, setIsModalOpen, inventoryData, inventoryLoading, loading, handlePlant } = usePlantTree();
	const [isShopModalOpen, setIsShopModalOpen] = useState(false);

	const { data: meData, loading: meLoading, error: meError } = useQuery<GetMe>(GET_ME);
	const userId = meData?.getMe?.id;

	const { data: gardenData, loading: gardenLoading, error: gardenError } = useQuery<GetGardenData>(GET_GARDEN);
	const { data: userData, loading: userLoading, error: userError } = useQuery<UserProfileData>(GET_USER_PROFILE, {
		variables: { id: userId || "" },
		skip: !userId
	});

    const isLoading = meLoading || gardenLoading || userLoading;
	const error = meError || gardenError || userError;
	const errorMessage = meError?.message || gardenError?.message || userError?.message;

	return {
		isModalOpen,
		setIsModalOpen,
		inventoryData,
		inventoryLoading,
		loading,
		handlePlant,
		isShopModalOpen,
		setIsShopModalOpen,
		meData,
		meLoading,
		meError,
		userId,
		gardenData,
		gardenLoading,
		gardenError,
		userData,
		userLoading,
		userError,
        isLoading,
		error,
		errorMessage,
	}
}
	
