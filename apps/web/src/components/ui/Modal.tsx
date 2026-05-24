"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
	// Блокируем скролл страницы при открытом модальном окне
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					{/* Задний фон (Backdrop) */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm"
					/>

					{/* Контейнер модального окна */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="relative w-full max-w-md overflow-hidden bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl z-10"
					>
						{/* Заголовок и кнопка закрытия */}
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
								{title}
							</h3>
							<button
								onClick={onClose}
								className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
							>
								<X size={18} />
							</button>
						</div>

						{/* Содержимое */}
						<div className="text-zinc-300">
							{children}
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
