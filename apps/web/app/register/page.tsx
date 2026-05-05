"use client";

import React, { useState } from 'react';
import { Leaf, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { BackgroundGlow } from '@/src/components/ui/BackgroundGlow';
import { useMutation } from "@apollo/client/react";
import { AUTH_TOKEN_KEY } from "@/constants/auth";
import { SIGN_UP } from '@/src/graphql/queries';
import { SignUpData } from '@/src/types/auth';


export default function RegisterPage() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const [signUp, { loading, error }] = useMutation<SignUpData>(SIGN_UP, {
		onCompleted: (data) => {
			const { token } = data.signUp;
			// Сохраняем токен
			localStorage.setItem(AUTH_TOKEN_KEY, token);
			// Перенаправляем на главную
			window.location.href = "/";
		},
		onError: (error) => {
			console.error("Ошибка регистрации:", error);
			alert(`Ошибка регистрации: ${error.message}`);
		}
	});

	const handleRegister = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			await signUp({ variables: { name, email, password } });
		} catch (error) {
			console.log("Регистрация не удалась, но мы это обработали");
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
						<h1 className="text-4xl font-bold tracking-tight text-white mb-2">Create Account</h1>
						<p className="text-zinc-400">Join the community of mindful growers</p>
					</div>

					{/* Карточка регистрации */}
					<div className="glass-card p-8 md:p-10">
						<form onSubmit={handleRegister} className="space-y-5">

							{/* Поле Имя */}
							<div className="space-y-2">
								<label className="text-xs uppercase tracking-widest font-semibold text-zinc-500 ml-1">
									Your Name
								</label>
								<div className="relative">
									<User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
									<input
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-emerald-500/50 focus:bg-white/10 transition-all outline-none"
										placeholder="Alex Zen"
										required
									/>
								</div>
							</div>

							{/* Поле Email */}
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

							{/* Поле Пароль */}
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

							<button
								type="submit"
								className="w-full btn-primary py-4 text-lg mt-2"
							>
								Start Growing
								<ArrowRight size={20} />
							</button>
						</form>

						<div className="mt-8 pt-8 border-t border-white/5 text-center">
							<p className="text-zinc-500 text-sm">
								Already have an account? <a href="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium">Log In</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
