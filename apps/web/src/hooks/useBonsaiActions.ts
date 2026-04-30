import { WATER_BONSAI, LEVEL_UP_BONSAI, DELETE_BONSAI, CREATE_BONSAI } from "@/src/graphql/queries";
import { ExtendedBonsai } from "@/src/types/garden";
import { handleBonsaiCreate, handleBonsaiDelete } from "@/src/utils/bonsai-cache";
import { useAppMutation } from "@/src/hooks/useAppMutation";

export function useBonsaiActions(bonsai?: ExtendedBonsai) {
	const [waterMutation, { loading: isWatering }] = useAppMutation<
		{ waterBonsai: ExtendedBonsai; }, // Что ждем в ответе
		{ id: string; } // Какие переменные нужны 
	>(WATER_BONSAI);
	const [levelUpMutation, { loading: isLevelingUp }] = useAppMutation(LEVEL_UP_BONSAI);
	const [createMutation, { loading: isCreating }] = useAppMutation(CREATE_BONSAI, {
		update: handleBonsaiCreate
	});
	const [deleteMutation, { loading: isDeleting }] = useAppMutation(DELETE_BONSAI, {
		update: handleBonsaiDelete
	});

	return {
		water: async () => {
			if (!bonsai) return; // Если дерева нет, ничего не делаем
			return waterMutation({
				variables: { id: bonsai.id },
				successMessage: "Полито!",
				optimisticResponse: {
					waterBonsai: {
						...bonsai, // Копируем ВСЕ поля из текущего дерева (createdAt, habit и т.д.)
						lastWateredAt: new Date().toISOString(), // Перезаписываем дату
						user: {
							...bonsai.user, // Копируем данные пользователя
							zenPoints: bonsai.user.zenPoints + 5 // Добавляем очки пользователю
						}
					}
				}
			});
		},
		levelUp: async () => {
			if (!bonsai) return;
			return levelUpMutation({
				variables: { id: bonsai.id },
				successMessage: "Уровень повышен!",
				optimisticResponse: {
					levelUpBonsai: {
						...bonsai,
						level: bonsai.level + 1
					}
				}
			});
		},
		createBonsai: async (type: string, habitId: string, userId: string) => {
			return createMutation({
				variables: { input: { type, habitId, userId } },
				successMessage: "Создано!"
			});
		},
		deleteBonsai: async () => {
			if (!bonsai) return;
			return deleteMutation({
				variables: { id: bonsai.id },
				successMessage: "Удалено!",
				optimisticResponse: {
					deleteBonsai: {
						__typename: "Bonsai",
						id: bonsai.id,
					},
				},
			});
		},

		loading: { isWatering, isLevelingUp, isCreating, isDeleting }
	};
}
