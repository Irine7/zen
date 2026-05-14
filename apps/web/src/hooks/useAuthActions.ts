import { useMutation, useApolloClient } from '@apollo/client/react';
import { LOGOUT } from '@/src/graphql/queries';

export const useAuthActions = () => {
	const handleAuthSuccess = () => {
		window.location.href = "/";
	};
	return { handleAuthSuccess };
};

export const useLogout = () => {
	const client = useApolloClient();

	const [logoutMutation, { loading }] = useMutation(LOGOUT, {
		onCompleted: async () => {
			await client.clearStore(); // ОЧИЩАЕМ КЭШ
			window.location.href = "/login"; // Уходим на страницу входа
		},
	});
	const handleLogout = () => {
		logoutMutation();
	};
	return { handleLogout, loading };
};