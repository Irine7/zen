import { useMutation, useQuery } from "@apollo/client/react";
import { BUY_SEED, GET_INVENTORY, GET_SEEDS, GET_USER_PROFILE } from "@/src/graphql/queries";
import { BuySeedData, BuySeedVariables, GetSeedsData } from "@/src/types/shop";

export function useShop(userId?: string) {
    const { data, loading, error } = useQuery<GetSeedsData>(GET_SEEDS);
    const [buySeed, { loading: isBuying }] = useMutation<BuySeedData, BuySeedVariables>(BUY_SEED);
    const seeds = data?.getSeeds || [];

    const handleBuy = async (seedId: string) => {
    try {
      // Запускаем мутацию и сохраняем возвращенный результат
      const response = await buySeed({
        variables: { seedId },
        refetchQueries: [
            { query: GET_INVENTORY }, 
            { query: GET_USER_PROFILE, variables: { id: userId || "" } }
        ],
      });
      
     const result = response.data?.buySeed;

     //  Проверяем __typename ответа
     if (result) {
       if (result.__typename === 'Inventory') {
         alert("Семечко успешно куплено!");
       } else if (result.message) {
         // Выводим ошибку, которую прислал сервер (например, нехватка очков)
         alert(result.message);
       }
     }
    } catch (error) {
      console.error("Ошибка при покупке семечка:", error);
      alert("Произошла ошибка при покупке");
    }
  };

	return {
		data,
		loading,
		error,
		buySeed,
		isBuying,
		seeds,
        handleBuy
	}
}
	
