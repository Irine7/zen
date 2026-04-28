import { IBonsai } from '@zen/shared-types';

export interface ExtendedBonsai extends Omit<IBonsai, 'lastWateredAt' | 'createdAt'> {
	lastWateredAt: string;
	createdAt: string;
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
