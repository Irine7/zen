import { useMutation } from "@apollo/client/react";
import { DocumentNode, OperationVariables } from '@apollo/client';
import { WATER_BONSAI, LEVEL_UP_BONSAI, DELETE_BONSAI, CREATE_BONSAI } from "@/src/graphql/queries";
import { handleBonsaiResponse } from "@/src/utils/bonsai-errors";
import { DeleteBonsaiData, ExtendedBonsai, CreateBonsaiData } from "@/src/types/garden";
import { gql } from '@apollo/client';

/**
 * TData — это тип того, что вернет сервер (например, { waterBonsai: Bonsai })
 * TVariables — это тип аргументов (например, { id: string })
 */

// Общие настройки для всех мутаций
type UseMutationOptions<TData, TVariables extends OperationVariables> = 
  Parameters<typeof useMutation<TData, TVariables>>[1];

const useBonsaiMutation = <TData = any, TVariables extends OperationVariables = OperationVariables>(
  mutation: DocumentNode,
  options?: UseMutationOptions<TData, TVariables>
) => {
  return useMutation<TData, TVariables>(mutation, {
    onError: (err) => console.error(err.message),
    ...options,
  });
};

export function useBonsaiActions(bonsai?: ExtendedBonsai) {
	const [waterMutation, { loading: isWatering }] = useBonsaiMutation<
		{ waterBonsai: ExtendedBonsai; }, // Что ждем в ответе
		{ id: string; } // Какие переменные нужны 
	>(WATER_BONSAI);
	const [levelUpMutation, { loading: isLevelingUp }] = useBonsaiMutation(LEVEL_UP_BONSAI);
	const [createMutation, { loading: isCreating }] = useBonsaiMutation(CREATE_BONSAI, {
		update(cache: any, { data }: { data?: CreateBonsaiData; }) {
			const newBonsai = data?.createBonsai;
			if (data?.createBonsai) {
				// Читаем текущий сад из кэша, добавляем в него новое дерево и записываем обратно
				cache.modify({
					fields: {
						getGarden(existingBonsais = []) {
							const newBonsaiRef = cache.writeFragment({
								data: newBonsai,
								fragment: gql`
                                fragment NewBonsai on Bonsai {
                                    id type level lastWateredAt user 
																		{ id zenPoints }
                                }
                            `
							});
							return [...existingBonsais, newBonsaiRef];
						}
					}
				});
			}
		}
	});

	const [deleteMutation, { loading: isDeleting }] = useBonsaiMutation(DELETE_BONSAI, {
		update(cache: any, { data }: { data?: DeleteBonsaiData; }) {
			// Проверяем, что удаление на сервере прошло успешно (или это оптимистичный ответ)
			const deletedBonsai = data?.deleteBonsai;
			if (deletedBonsai?.__typename === 'Bonsai') {
				// Удаляем объект из кэша Apollo вручную
				cache.evict({ id: cache.identify(deletedBonsai) });
				// Чистим "мусор" в кэше
				cache.gc();
			}
		}
	});

	return {
		water: async () => {
			if (!bonsai) return; // Если дерева нет, ничего не делаем
			const { data } = await waterMutation({
				variables: { id: bonsai.id },
				// Оптимистичный ответ: мы притворяемся, что сервер уже ответил успешно
				optimisticResponse: {
					waterBonsai: {
						...bonsai, // Копируем ВСЕ поля из текущего дерева (createdAt, habit и т.д.)
						lastWateredAt: new Date().toISOString(), // Перезаписываем дату
						user: {
							...bonsai.user, // Копируем данные пользователя
							zenPoints: bonsai.user.zenPoints + 5 // Добавляем очки пользователю
						},
					}
				}
			});
			return handleBonsaiResponse(data, "Полито!");
		},
		levelUp: async () => {
			if (!bonsai) return;
			const { data } = await levelUpMutation({ variables: { id: bonsai.id } });
			return handleBonsaiResponse(data, "Уровень повышен!");
		},
		createBonsai: async (type: string, habitId: string, userId: string) => {
			const { data } = await createMutation({ variables: { input: { type, habitId, userId } } });
			return handleBonsaiResponse(data, "Создано");
		},
		deleteBonsai: async () => {
			if (!bonsai) return;
			const { data } = await deleteMutation({
				variables: { id: bonsai.id },
				optimisticResponse: {
					deleteBonsai: {
						__typename: "Bonsai",
						id: bonsai.id,
					},
				},
			});
			return handleBonsaiResponse(data, "Удалено");
		},

		loading: { isWatering, isLevelingUp, isCreating, isDeleting }
	};
}
