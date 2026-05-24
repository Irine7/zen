import { ApolloCache } from '@apollo/client';
import { PlantBonsaiData } from '@/src/types/garden';
import { bonsaiFragment } from '@/src/graphql/queries';
import { DeleteBonsaiData } from '@/src/types/garden';

export const handleBonsaiCreate = (cache: ApolloCache, { data }: { data?: PlantBonsaiData; }) => {
	const newBonsai = data?.plantBonsaiFromInventory;
	// Если мутация вернула ошибку, а не Bonsai — ничего не добавляем в кэш
	if (!newBonsai || newBonsai.__typename !== 'Bonsai') return;

	cache.modify({
		fields: {
			getGarden(existingBonsais = []) {
				const newBonsaiRef = cache.writeFragment({
					data: newBonsai,
					fragment: bonsaiFragment
				});
				return [...existingBonsais, newBonsaiRef];
			}
		}
	});
};

export const handleBonsaiDelete = (cache: ApolloCache, { data }: { data?: DeleteBonsaiData; }) => {
	// Проверяем, что удаление на сервере прошло успешно (или это оптимистичный ответ)
	const deletedBonsai = data?.deleteBonsai;
	if (deletedBonsai?.__typename === 'Bonsai') {
		// Удаляем объект из кэша Apollo вручную
		cache.evict({ id: cache.identify(deletedBonsai) });
		// Чистим "мусор" в кэше
		cache.gc();
	}
};