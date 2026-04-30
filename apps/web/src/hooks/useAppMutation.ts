import { DocumentNode, OperationVariables } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { handleBonsaiResponse } from "@/src/utils/bonsai-errors";

/**
 * TData — это тип того, что вернет сервер (например, { waterBonsai: Bonsai })
 * TVariables — это тип аргументов (например, { id: string })
 */

type UseMutationOptions<TData, TVariables extends OperationVariables> =
	Parameters<typeof useMutation<TData, TVariables>>[1];

type ExtendedOptions<TData, TVariables extends OperationVariables> =
	UseMutationOptions<TData, TVariables> & {
		successMessage?: string;
	};

export const useAppMutation = <TData = any, TVariables extends OperationVariables = OperationVariables>(
	mutation: DocumentNode,
	options?: ExtendedOptions<TData, TVariables>
) => {
	// 1. Вызываем оригинальный хук
	const [mutate, result] = useMutation<TData, TVariables>(mutation, options);

	// 2. Создаем обертку над функцией мутации
	// Parameters<typeof mutate>[0] — это автоматическое получение типа всех настроек Apollo
	const wrappedMutate = async (
		mutateOptions: Parameters<typeof mutate>[0] & { successMessage?: string; }
	) => {
		const { successMessage, ...apolloOptions } = mutateOptions;

		// Выполняем мутацию
		const res = await mutate(apolloOptions as any);

		// Если есть сообщение и данные получены — обрабатываем
		if (successMessage && res.data) {
			handleBonsaiResponse(res.data, successMessage);
		}

		return res;
	};

	// 3. Возвращаем нашу обертку и объект состояния (loading, error и т.д.)
	// 'as const' нужен, чтобы TS понимал, что это массив фиксированной длины (кортеж)
	return [wrappedMutate, result] as const;
};
