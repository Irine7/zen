"use client";

import React from 'react';
import { Loader2, Leaf } from 'lucide-react';
import { BackgroundGlow } from './BackgroundGlow';

export const GlobalLoader = () => {
	return (
		<div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
			{/* Наш фирменный задний фон со свечением */}
			<BackgroundGlow />

			<div className="relative flex flex-col items-center">
				{/* Анимированный ореол вокруг логотипа */}
				<div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full animate-pulse" />

				<div className="relative mb-8">
					{/* Центральный логотип-листок */}
					<div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2.5rem] backdrop-blur-md relative z-10 overflow-hidden group">
						<div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<Leaf className="text-emerald-500 animate-[bounce_3s_infinite]" size={48} strokeWidth={1.5} />
					</div>

					{/* Тонкое кольцо загрузки вокруг */}
					<div className="absolute -inset-2">
						<Loader2 className="w-full h-full text-emerald-500/30 animate-[spin_3s_linear_infinite]" size={80} strokeWidth={1} />
					</div>
				</div>

				{/* Текст загрузки с градиентом */}
				<div className="space-y-3 text-center relative z-10">
					<h2 className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
						Zen Garden
					</h2>
					<div className="flex items-center justify-center gap-2">
						<span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
						<span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
						<span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" />
					</div>
					<p className="text-zinc-500 text-xs uppercase tracking-[0.3em] font-medium pl-[0.3em]">
						Aligning your spirit
					</p>
				</div>
			</div>

			{/* Декоративные частицы (опционально, создают глубину) */}
			<div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-12 opacity-20">
				<div className="w-[1px] h-24 bg-gradient-to-t from-emerald-500 to-transparent" />
				<div className="w-[1px] h-24 bg-gradient-to-t from-emerald-500 to-transparent translate-y-8" />
				<div className="w-[1px] h-24 bg-gradient-to-t from-emerald-500 to-transparent" />
			</div>
		</div>
	);
};
