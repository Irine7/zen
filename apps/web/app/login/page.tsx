"use client";

import React, { useState } from 'react';
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react';
import { BackgroundGlow } from '@/src/components/ui/BackgroundGlow';
import { useMutation } from "@apollo/client/react";
import { AUTH_TOKEN_KEY } from "@/constants/auth";
import { SIGN_IN } from '@/src/graphql/queries';

interface SignInData {
	signIn: {
		token: string;
		user: {
			id: string;
			email: string;
			name: string;
		};
	};
}

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const [signIn, { loading, error }] = useMutation<SignInData>(SIGN_IN, {
		onCompleted: (data) => {
			const { token } = data.signIn;
			// Сохраняем токен
			localStorage.setItem(AUTH_TOKEN_KEY, token);
			// Перенаправляем на главную
			window.location.href = "/";
		},
		onError: (error) => {
			console.error("Ошибка входа:", error);
			alert(`Ошибка входа: ${error.message}`);
		}
	});

	const handleLogin = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			// Просто вызываем мутацию, остальное сделает onCompleted
			await signIn({ variables: { email, password } });
		} catch (error) {
			console.log("Вход не удался, но мы это обработали");
		}
	};

	return (
		<div className="zen-layout">
			<BackgroundGlow />
			<div className="zen-container flex flex-col items-center justify-center min-h-[80vh]">

				<div className="w-full max-w-md">
					{/* Логотип */}
					<div className="text-center mb-8">
						<div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 mb-4 border border-emerald-500/20">
							<Leaf className="text-emerald-500" size={32} />
						</div>
						<h1 className="text-4xl font-bold tracking-tight text-white mb-2">Zen Garden</h1>
						<p className="text-zinc-400">Sign in to grow your habits</p>
					</div>

					{/* Карточка формы */}
					<div className="glass-card p-8 md:p-10">
						<form onSubmit={handleLogin} className="space-y-6">

							<div className="space-y-2">
								<label className="text-xs uppercase tracking-widest font-semibold text-zinc-500 ml-1">
									Email
								</label>
								<div className="relative">
									<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-emerald-500/50 focus:bg-white/10 transition-all outline-none"
										placeholder="your@email.com"
										required
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-xs uppercase tracking-widest font-semibold text-zinc-500 ml-1">
									Password
								</label>
								<div className="relative">
									<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
									<input
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-emerald-500/50 focus:bg-white/10 transition-all outline-none"
										placeholder="••••••••"
										required
									/>
								</div>
							</div>

							{error && <p className="text-red-500 text-sm mb-4">{error.message}</p>}

							<button
								type="submit"
								disabled={loading}
								className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? 'Entering...' : 'Enter the Garden'}
								<ArrowRight size={20} />
							</button>
						</form>

						<div className="mt-8 pt-8 border-t border-white/5 text-center">
							<p className="text-zinc-500 text-sm">
								New here? <a href="/register" className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium">Create Account</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
