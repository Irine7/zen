import { memo } from 'react';
import { motion } from 'framer-motion';
import { ExtendedBonsai } from '@/src/types/garden';
import { ANIMATIONS } from '@/src/constants/animations';
import { useBonsaiStatus } from '@/src/hooks/useBonsaiStatus';
import { LevelProgress } from './LevelProgress';
import { BonsaiInfo } from './BonsaiInfo';
import { ProgressBar } from './ProgressBar';
import { BonsaiActions } from './BonsaiActions';
import { BonsaiImage } from './BonsaiImage';
import { BonsaiStatusBadge } from './BonsaiStatusBadge';

interface BonsaiCardProps {
	bonsai: ExtendedBonsai;
	index: number;
}

export const BonsaiCard = memo(({ bonsai, index }: BonsaiCardProps) => {
	const { isHealthy, isDead, status, hydration, hydrationColor } = useBonsaiStatus(bonsai);

	return (
		<motion.div
			initial={ANIMATIONS.fadeIn.initial}
			animate={ANIMATIONS.fadeIn.animate}
			transition={{ delay: index * 0.1 }}
			className="group zen-card"
		>
			<BonsaiImage bonsai={bonsai} />
			<div className="zen-card-content">
				<div className="flex justify-between items-end">
					<div className="flex items-center gap-4">
						<LevelProgress bonsai={bonsai} />
						<BonsaiInfo bonsai={bonsai} />
					</div>
					<BonsaiStatusBadge status={status} isHealthy={isHealthy} />
				</div>

				<ProgressBar progress={hydration} color={hydrationColor} />
				<BonsaiActions bonsai={bonsai} />
			</div>
		</motion.div>
	);
});

BonsaiCard.displayName = 'BonsaiCard';
