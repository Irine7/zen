import { useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useApolloClient } from '@apollo/client/react';
import { LOGOUT, FORGOT_PASSWORD, RESET_PASSWORD } from '@/src/graphql/queries';
import { AUTH_REGEX } from '@zen/shared-types';

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

export const useForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mutate, { loading }] = useMutation(FORGOT_PASSWORD, {
    onCompleted: () => setIsSubmitted(true),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!AUTH_REGEX.EMAIL.test(email)) {
      setError("Неверный формат email");
      return;
    }
    mutate({ variables: { email } });
  };

  return { email, setEmail, handleSubmit, loading, error, isSubmitted, setError };
};


export const useResetPassword = () => {
  const [error, setError] = useState<string | null>(null);
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const searchParams = useSearchParams();
		const token = searchParams.get('token');
  const [mutate, { loading }] = useMutation(RESET_PASSWORD, {
    onCompleted: () => {
      window.location.href = "/login?reset=success";
    },
    onError: (err) => setError(err.message),
  });
  const reset = (token: string, password: string) => {
    setError(null);
    mutate({ variables: { token, password } });
  };

		const handleSubmit = (e: FormEvent) => {
			e.preventDefault();
			setError(null);
	
			if (!token) {
				setError("Токен сброса не найден. Попробуйте сбросить пароль еще раз.");
				return;
			}
			if (password !== confirmPassword) {
				setError("Пароли не совпадают");
				return;
			}
			if (!AUTH_REGEX.PASSWORD.test(password)) {
				setError("Пароль должен содержать не менее 8 символов, включая заглавную букву, строчную букву, цифру и спецсимвол");
				return;
			}
			reset(token, password);
		};
  return { password, setPassword, confirmPassword, setConfirmPassword, handleSubmit, loading, error, setError, token };
};