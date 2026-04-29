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

export interface DeleteBonsaiData {
	deleteBonsai: {
		__typename: 'Bonsai';
		id: string;
	} | {
		__typename: 'BonsaiNotFoundError';
		message: string;
	};
}

export interface CreateBonsaiData {
	createBonsai: ExtendedBonsai;
	__typename: 'Bonsai' | 'BonsaiAlreadyDeadError' | 'BonsaiNotFoundError' | 'HabitNotFoundError';
	message?: string;
}