import React from 'react';
import { Leaf } from 'lucide-react';
import { BackgroundGlow } from '@/src/components/ui/BackgroundGlow';

interface AuthLayoutProps {
	children: React.ReactNode;
	title: string;
	subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => (
	<div className="zen-layout">
		<BackgroundGlow />
		<div className="zen-container flex flex-col items-center justify-center min-h-[80vh]">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 mb-4 border border-emerald-500/20">
						<Leaf className="text-emerald-500" size={32} />
					</div>
					<h1 className="text-4xl font-bold tracking-tight text-white mb-2">{title}</h1>
					<p className="text-zinc-400">{subtitle}</p>
				</div>
				<div className="glass-card p-8 md:p-10">
					{children}
				</div>
			</div>
		</div>
	</div>
);
