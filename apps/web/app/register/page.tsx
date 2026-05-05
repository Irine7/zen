"use client";

import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { AuthForm } from '@/src/components/auth/AuthForm';

export default function RegisterPage() {
  return (
    <AuthLayout title="Create Account" subtitle="Join the community of mindful growers">
      <AuthForm mode="register" />
      <div className="mt-8 pt-8 border-t border-white/5 text-center">
        <p className="text-zinc-500 text-sm">
          Already have an account? <a href="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium">Log in</a>
        </p>
      </div>
    </AuthLayout>
  );
}