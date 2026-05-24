import { useAppMutation } from "@/src/hooks/useAppMutation";
import { CREATE_BONSAI } from "@/src/graphql/queries";
import { handleBonsaiCreate } from "@/src/utils/bonsai-cache";


export function useCreateBonsai() {
	const [createMutation, { loading: isCreating }] = useAppMutation(CREATE_BONSAI, {
		update: handleBonsaiCreate
	});

	return {
		createBonsai: async (seedId: string, habitId: string) => {
			return createMutation({
				variables: { seedId, habitId },
				successMessage: "Создано!"
			});
		},
		isCreating
	}
}