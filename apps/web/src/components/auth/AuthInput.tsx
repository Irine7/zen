import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	icon: LucideIcon;
}

export const AuthInput = ({ label, icon: Icon, ...props }: AuthInputProps) => (
	<div className="space-y-2">
		<label className="text-xs uppercase tracking-widest font-semibold text-zinc-500 ml-1">
			{label}
		</label>
		<div className="relative">
			<Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
			<input
				{...props}
				className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-emerald-500/50 focus:bg-white/10 transition-all outline-none"
			/>
		</div>
	</div>
);
