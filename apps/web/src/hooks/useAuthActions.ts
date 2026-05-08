export const useAuthActions = () => {
	const handleAuthSuccess = () => {
		window.location.href = "/";
	};
	return { handleAuthSuccess };
};