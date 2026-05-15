"use client";

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { useVerifyEmail } from '@/src/hooks/useAuthActions';

export default function VerifyEmailPage() {
	const { isVerified, loading, error } = useVerifyEmail();

	// 1. СОСТОЯНИЕ ЗАГРУЗКИ (Магическое ожидание)
	if (loading) {
		return (
			<AuthLayout title="Verifying Email" subtitle="We're validating your digital soul in our garden">
				<div className="flex flex-col items-center py-12">
					<div className="relative mb-8">
						<div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse"></div>
						<Loader2 className="text-emerald-500 animate-spin relative z-10" size={64} strokeWidth={1.5} />
					</div>
					<div className="space-y-2 text-center animate-pulse">
						<p className="text-white font-medium text-lg italic">Whispering to the seeds...</p>
						<p className="text-zinc-500 text-sm">Please stay on this path</p>
					</div>
				</div>
			</AuthLayout>
		);
	}

	// 2. УСПЕХ (Момент триумфа)
	if (isVerified) {
		return (
			<AuthLayout title="Success!" subtitle="Your garden is ready for growth">
				<div className="text-center py-6">
					<div className="relative inline-flex mb-10">
						{/* Эффект сияния вокруг иконки */}
						<div className="absolute inset-0 bg-emerald-400/30 blur-2xl rounded-full scale-150 animate-pulse"></div>
						<div className="relative bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl backdrop-blur-sm">
							<CheckCircle2 className="text-emerald-400" size={56} strokeWidth={1.5} />
						</div>
						<Sparkles className="absolute -top-2 -right-2 text-emerald-300 animate-bounce" size={24} />
					</div>

					<div className="space-y-4 mb-10">
						<h3 className="text-2xl font-bold text-white tracking-tight">Email Confirmed</h3>
						<p className="text-zinc-400 leading-relaxed max-w-[280px] mx-auto text-sm">
							Your path is clear. Access all sanctuary features and start your mindfulness journey today.
						</p>
					</div>

					<Link href="/login" className="w-full btn-primary py-4 group transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
						<span>Enter the Sanctuary</span>
						<ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
					</Link>
				</div>
			</AuthLayout>
		);
	}

	// 3. ОШИБКА (Мягкое предупреждение)
	return (
		<AuthLayout title="Path Blocked" subtitle="Something went wrong with the verification link">
			<div className="text-center py-6">
				<div className="inline-flex p-5 rounded-3xl bg-red-500/5 border border-red-500/10 mb-10">
					<XCircle className="text-red-400/80" size={56} strokeWidth={1.5} />
				</div>

				<div className="space-y-3 mb-10">
					<p className="text-red-400 font-medium px-4">
						{error || "The verification link is invalid or has already been used."}
					</p>
					<p className="text-zinc-500 text-xs italic px-6">
						Paths change over time. Try requesting a new link or contact support.
					</p>
				</div>

				<Link href="/register" className="w-full btn-primary py-4 text-lg">
					Return to Start
				</Link>
			</div>
		</AuthLayout>
	);
}
