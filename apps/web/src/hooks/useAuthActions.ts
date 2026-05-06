import { AUTH_TOKEN_KEY, USER_ID_KEY } from "@/constants/auth";

export const useAuthActions = () => {
	const handleAuthSuccess = (token: string, userId: string) => {
		localStorage.setItem(AUTH_TOKEN_KEY, token);
		localStorage.setItem(USER_ID_KEY, userId);
		window.location.href = "/";
	};
	return { handleAuthSuccess };
};