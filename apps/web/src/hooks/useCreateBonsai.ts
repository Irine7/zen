import { useAppMutation } from "@/src/hooks/useAppMutation";
import { CREATE_BONSAI } from "@/src/graphql/queries";
import { handleBonsaiCreate } from "@/src/utils/bonsai-cache";


export function useCreateBonsai() {
	const [createMutation, { loading: isCreating }] = useAppMutation(CREATE_BONSAI, {
		update: handleBonsaiCreate
	});

	return {
		createBonsai: async (type: string, habitId: string, userId: string) => {
			return createMutation({
				variables: { input: { type, habitId, userId } },
				successMessage: "Создано!"
			});
		},
		isCreating
	}
}