"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { AuthInput } from '@/src/components/auth/AuthInput';
import { Lock, ArrowRight } from 'lucide-react';
import { PasswordRequirements } from '@/src/components/auth/PasswordRequirements';
import { AUTH_REGEX } from '@zen/shared-types';
import { useResetPassword } from '@/src/hooks/useAuthActions';

export default function ResetPasswordPage() {
	const { handleSubmit, loading, error, setError, password, setPassword, confirmPassword, setConfirmPassword, token } = useResetPassword();

	if (!token) {
		return (
			<AuthLayout title="Invalid Link" subtitle="This password reset link is invalid or has expired">
				<div className="text-center">
					<Link href="/forgot-password" className="btn-primary py-4 block w-full">
						Request new link
					</Link>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout title="New Password" subtitle="Create a strong password for your garden">
			<form onSubmit={handleSubmit} className="space-y-6">
				<AuthInput
					label="New Password"
					name="password"
					icon={Lock}
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="••••••••"
					required
				/>

				<AuthInput
					label="Confirm New Password"
					name="confirmPassword"
					icon={Lock}
					type="password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					placeholder="••••••••"
					required
				/>

				<PasswordRequirements password={password} />

				{confirmPassword && password !== confirmPassword && (
					<p className="text-red-500 text-xs">Passwords do not match</p>
				)}

				{/* Вывод серверной или локальной ошибки */}
				{error && (
					<p className="text-red-500 text-sm text-center">{error}</p>
				)}

				<button
					type="submit"
					disabled={loading || !password || password !== confirmPassword}
					className="w-full btn-primary py-4 text-lg disabled:opacity-50"
				>
					{loading ? 'Updating...' : 'Update Password'}
					<ArrowRight size={20} />
				</button>

			</form>
		</AuthLayout>
	);
}