"use client";

import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { AuthInput } from '@/src/components/auth/AuthInput';
import { useForgotPassword } from '@/src/hooks/useAuthActions';

export default function ForgotPasswordPage() {
	const { email, setEmail, handleSubmit, loading, error, isSubmitted, setError } = useForgotPassword();

	if (isSubmitted) {
		return (
			<AuthLayout title="Check your email" subtitle="We've sent recovery instructions to your inbox">
				<div className="text-center py-4">
					<div className="inline-flex p-4 rounded-full bg-emerald-500/10 mb-6">
						<CheckCircle2 className="text-emerald-500" size={48} />
					</div>
					<p className="text-zinc-400 mb-8">
						Вам было отправлено письмо с ссылкой для сброса пароля
					</p>
					<Link href="/login" className="w-full btn-primary py-4 block text-center">
						Back to Login
					</Link>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout title="Recover Password" subtitle="Enter your email and we'll help you get back in">
			<form onSubmit={handleSubmit} className="space-y-6">
				<AuthInput
					label="Email Address"
					name="email"
					icon={Mail}
					type="email"
					value={email}
					onChange={(event) => {
						setEmail(event.target.value);
						setError(null); // Сбрасываем ошибку при вводе
					}}
					placeholder="your@email.com"
					required
				/>

				{/* Показываем ошибку, если она есть */}
				{error && (
					<p className="text-red-500 text-sm text-center">{error}</p>
				)}

				<button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg disabled:opacity-50">
					{loading ? 'Sending...' : 'Send Reset Link'}
					<ArrowRight size={20} />
				</button>

				<div className="text-center pt-4">
					<Link href="/login" className="text-sm text-zinc-500 hover:text-white transition-colors">
						Remembered your password? Log in
					</Link>
				</div>
			</form>
		</AuthLayout>
	);
}