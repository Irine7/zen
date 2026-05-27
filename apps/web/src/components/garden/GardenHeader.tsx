"use client";

import { motion } from 'framer-motion';
import { User, LogOut, Store } from 'lucide-react';
import { useLogout } from '@/src/hooks/useAuthActions';
import { useQuery } from '@apollo/client/react';
import { GET_ME } from '@/src/graphql/queries';
import { GetMe } from '@/src/types/auth';

interface GardenHeaderProps {
	points?: number;
	onOpenShop?: () => void;
}

export const GardenHeader = ({ points = 0, onOpenShop }: GardenHeaderProps) => {
	const { handleLogout } = useLogout();
	const { data: meData } = useQuery<GetMe>(GET_ME);
	const userName = meData?.getMe?.name || 'User';

	return (
		<header className="flex justify-between items-center mb-16">
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				className="flex flex-col gap-1"
			>
				<h1 className="zen-header-title">
					Zen <span className="text-emerald-500 font-normal">Garden</span>
				</h1>
				<p className="zen-header-subtitle">
					Welcome back, <span className="text-emerald-500 font-normal">{userName}</span>!
				</p>
			</motion.div>

			<div className="flex items-center gap-6">
				<div className="flex flex-col items-end">
					<span className="zen-points-label">Zen Points</span>
					<span className="zen-points-value">{points.toLocaleString()}</span>
				</div>

				<button 
					onClick={onOpenShop} 
					className="btn-icon rounded-full cursor-pointer hover:text-emerald-400 text-emerald-500 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
					title="Магазин"
				>
					<Store size={20} />
				</button>

				<div className="btn-icon rounded-full cursor-pointer hover:text-emerald-400 text-emerald-500 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
					<User size={20} />
				</div>
				<div
					onClick={handleLogout}
					className="btn-icon rounded-full cursor-pointer hover:text-red-500 text-emerald-500 border border-emerald-500/20 hover:border-red-500/40 transition-colors"
				>
					<LogOut size={20} />
				</div>
			</div>
		</header>
	);
};
