import { IBonsai } from '@zen/shared-types';

export interface ExtendedBonsai extends Omit<IBonsai, 'lastWateredAt' | 'createdAt'> {
	lastWateredAt: string;
	createdAt: string;
	user: {
		id: string;
		zenPoints: number;
	};
	habit: {
		title: string;
	};
}

export interface GetGardenData {
	getGarden: ExtendedBonsai[];
}

export interface CreateBonsaiData {
	createBonsai: ExtendedBonsai;
}
