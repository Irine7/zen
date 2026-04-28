import { useMutation } from "@apollo/client/react";
import { WATER_BONSAI, LEVEL_UP_BONSAI, DELETE_BONSAI, CREATE_BONSAI } from "@/src/graphql/queries";
import { handleBonsaiResponse } from "@/src/utils/bonsai-errors";

// Общие настройки для всех мутаций
const useBonsaiMutation = (mutation: any, options = {}) => {
    return useMutation(mutation, {
        onError: (err) => alert(`Ошибка: ${err.message}`),
        ...options
    });
};

export function useBonsaiActions(bonsaiId?: string) {
    const [waterMutation, { loading: isWatering }] = useBonsaiMutation(WATER_BONSAI);
    const [levelUpMutation, { loading: isLevelingUp }] = useBonsaiMutation(LEVEL_UP_BONSAI);
    const [createMutation, { loading: isCreating }] = useBonsaiMutation(CREATE_BONSAI, { refetchQueries: ['GetGarden'] });
    const [deleteMutation, { loading: isDeleting }] = useBonsaiMutation(DELETE_BONSAI, { refetchQueries: ['GetGarden'] });

    return {
        water: async () => {
            const { data } = await waterMutation({ variables: { id: bonsaiId } });
            return handleBonsaiResponse(data, "Полито!");
        },
        levelUp: async () => {
            const { data } = await levelUpMutation({ variables: { id: bonsaiId } });
            return handleBonsaiResponse(data, "Уровень повышен!");
        },
        deleteBonsai: async () => {
            const { data } = await deleteMutation({ variables: { id: bonsaiId } });
            return handleBonsaiResponse(data, "Удалено");
        },
        createBonsai: async (type: string, habitId: string, userId: string) => {
            const { data } = await createMutation({ variables: { input: { type, habitId, userId } } });
            return handleBonsaiResponse(data, "Создано");
        },
        loading: { isWatering, isLevelingUp, isDeleting, isCreating }
    };
}
