"use client";

import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface GardenHeaderProps {
  points?: number;
}

export const GardenHeader = ({ points = 1240 }: GardenHeaderProps) => {
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
        <p className="zen-header-subtitle">Welcome back, your garden is breathing.</p>
      </motion.div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="zen-points-label">Zen Points</span>
          <span className="zen-points-value">{points.toLocaleString()}</span>
        </div>
        <div className="btn-icon rounded-full cursor-pointer">
          <User size={20} />
        </div>
      </div>
    </header>
  );
};
