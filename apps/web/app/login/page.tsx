"use client";

import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { AuthForm } from '@/src/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <AuthLayout title="Zen Garden" subtitle="Sign in to grow your habits">
      <AuthForm mode="login" />
      <div className="mt-8 pt-8 border-t border-white/5 text-center">
        <p className="text-zinc-500 text-sm">
          Don't have an account? <a href="/register" className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium">Create Account</a>
        </p>
      </div>
    </AuthLayout>
  );
}