"use client";

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useMutation } from "@apollo/client/react";
import { SIGN_IN, SIGN_UP } from '@/src/graphql/queries';
import { AuthInput } from './AuthInput';
import { useAuthActions } from '@/src/hooks/useAuthActions';
import { SignInData, SignUpData } from '@/src/types/auth';

interface AuthFormProps {
	mode: 'login' | 'register';
}

export const AuthForm = ({ mode }: AuthFormProps) => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
	});

	const { handleAuthSuccess } = useAuthActions();
	const isLogin = mode === 'login';

	const mutation = isLogin ? SIGN_IN : SIGN_UP;
	const [authMutation, { loading, error }] = useMutation<SignInData | SignUpData>(mutation, {
		onCompleted: (data) => {
			let token = '';
			let userId = '';

			if ('signIn' in data) {
				token = data.signIn.token;
				userId = data.signIn.user.id;
			} else if ('signUp' in data) {
				token = data.signUp.token;
				userId = data.signUp.user.id;
			}
			
			if (token && userId) {
				handleAuthSuccess(token, userId);
			}
		},
		onError: (err) => alert(`Ошибка: ${err.message}`)
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
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

			{error && <p className="text-red-500 text-sm">{error.message}</p>}

			<button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg">
				{loading ? 'Processing...' : (isLogin ? 'Enter the Garden' : 'Start Growing')}
				<ArrowRight size={20} />
			</button>
		</form>
	);
};
