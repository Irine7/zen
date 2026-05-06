"use client";

import { AuthGuard } from '@/src/components/auth/AuthGuard';
import { GardenContent } from '@/src/components/garden/GardenContent';

export default function ZenGardenPage() {
	return (
		<AuthGuard>
			<GardenContent />
		</AuthGuard>
	);
}