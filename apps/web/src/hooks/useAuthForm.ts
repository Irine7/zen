import { useState } from 'react';
import { useMutation } from "@apollo/client/react";
import { SIGN_IN, SIGN_UP } from '@/src/graphql/queries';
import { useAuthActions } from '@/src/hooks/useAuthActions';
import { AUTH_REGEX } from '@zen/shared-types';
import { SignInData, SignUpData } from '@/src/types/auth';

export const useAuthForm = (mode: 'login' | 'register') => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { handleAuthSuccess } = useAuthActions();
  const isLogin = mode === 'login';

  const [authMutation, { loading, error }] = useMutation<SignInData | SignUpData>(
    isLogin ? SIGN_IN : SIGN_UP, 
    {
      onCompleted: (data) => {
        const result = 'signIn' in data ? data.signIn : data.signUp;
        if (result?.token) handleAuthSuccess();
      },
      onError: (err) => setLocalError(err.message)
    }
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const validate = () => {
    if (!AUTH_REGEX.EMAIL.test(formData.email)) return "Неверный формат email";
    if (!isLogin) {
      if (formData.name.trim().length === 0) return "Имя не может быть пустым";
      if (!AUTH_REGEX.PASSWORD.test(formData.password)) return "Пароль слишком простой";
      if (formData.password !== formData.confirmPassword) return "Пароли не совпадают";
    }
    return null;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    const validationError = validate();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    const { confirmPassword, ...signUpData } = formData;
    const variables = isLogin 
      ? { email: formData.email, password: formData.password } 
      : signUpData;

    authMutation({ variables });
  };

  return {
    formData,
    loading,
    error: localError || error?.message,
    isLogin,
    handleChange,
    handleSubmit
  };
};