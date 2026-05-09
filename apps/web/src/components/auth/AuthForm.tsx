"use client";

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useMutation } from "@apollo/client/react";
import { SIGN_IN, SIGN_UP } from '@/src/graphql/queries';
import { AuthInput } from './AuthInput';
import { useAuthActions } from '@/src/hooks/useAuthActions';
import { SignInData, SignUpData } from '@/src/types/auth';
import { AUTH_REGEX } from '@zen/shared-types';

interface AuthFormProps {
	mode: 'login' | 'register';
}

export const AuthForm = ({ mode }: AuthFormProps) => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
	});
	const [localError, setLocalError] = useState<string | null>(null);

	const { handleAuthSuccess } = useAuthActions();
	const isLogin = mode === 'login';

	const mutation = isLogin ? SIGN_IN : SIGN_UP;
	const [authMutation, { loading, error }] = useMutation<SignInData | SignUpData>(mutation, {
		onCompleted: (data) => {
			const result = 'signIn' in data ? data.signIn : data.signUp;

			if (result?.token) {
				handleAuthSuccess();
			}
		},
		onError: (err) => setLocalError(err.message)
	});

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }));
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		setLocalError(null); // Сбрасываем старую ошибку

		if (!AUTH_REGEX.EMAIL.test(formData.email)) {
			setLocalError("Неверный формат email");
			return;
		}
		if (!isLogin && !AUTH_REGEX.PASSWORD.test(formData.password)) {
			setLocalError("Пароль слишком простой: нужны цифры и спецсимволы");
			return;
		}
		if (!isLogin && formData.name.trim().length === 0) {
			setLocalError("Имя не может быть пустым");
			return;
		}
		
		// Если прошли проверку — отправляем на сервер
		const variables = isLogin
			? { email: formData.email, password: formData.password }
			: formData;

		authMutation({ variables });
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{!isLogin && (
				<AuthInput
					label="Your name"
					name="name"
					icon={User}
					type="text"
					value={formData.name}
					onChange={handleChange}
					placeholder="Alex Zen"
					required
				/>
			)}

			<AuthInput
				label="Email"
				name="email"
				icon={Mail}
				type="email"
				value={formData.email}
				onChange={handleChange}
				placeholder="alex@zen.com"
				required
			/>

			<AuthInput
				label="Password"
				name="password"
				icon={Lock}
				type="password"
				value={formData.password}
				onChange={handleChange}
				placeholder="••••••••"
				required
			/>

			{(error || localError) && (
				<p className="text-red-500 text-sm">
					{localError || error?.message}
				</p>
			)}
			<button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg">
				{loading ? 'Processing...' : (isLogin ? 'Enter the Garden' : 'Start Growing')}
				<ArrowRight size={20} />
			</button>
		</form>
	);
};
