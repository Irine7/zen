"use client";

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { AuthInput } from './AuthInput';
import { useAuthForm } from '@/src/hooks/useAuthForm';
import { PasswordRequirements } from './PasswordRequirements';

interface AuthFormProps {
	mode: 'login' | 'register';
}

export const AuthForm = ({ mode }: AuthFormProps) => {
	const { formData, loading, error, isLogin, handleChange, handleSubmit } = useAuthForm(mode);

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

			{/* Поле подтверждения — только при регистрации */}
			{!isLogin && (
				<AuthInput
					label="Confirm Password"
					name="confirmPassword"
					icon={Lock}
					type="password"
					value={formData.confirmPassword}
					onChange={handleChange}
					placeholder="••••••••"
					required
				/>
			)}

			{/* Подсказка по сложности — только при регистрации */}
			{!isLogin && <PasswordRequirements password={formData.password} />}


			{/* Показываем ошибку, если пароли не совпадают */}
			{!isLogin && formData.confirmPassword &&
				formData.password !== formData.confirmPassword && (
					<p className="text-red-500 text-xs">
						Пароли не совпадают
					</p>
				)}

			
			{error && (
				<p className="text-red-500 text-sm">
					{error}
				</p>
			)}

			<button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg">
				{loading ? 'Processing...' : (isLogin ? 'Enter the Garden' : 'Start Growing')}
				<ArrowRight size={20} />
			</button> 
		</form>
	);
};