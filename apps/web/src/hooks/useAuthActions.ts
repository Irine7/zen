import { AUTH_TOKEN_KEY } from "@/constants/auth";

export const useAuthActions = () => {
	const handleAuthSuccess = (token: string) => {
		localStorage.setItem(AUTH_TOKEN_KEY, token);
		window.location.href = "/";
	};
	return { handleAuthSuccess };
};