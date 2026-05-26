export interface Seed {
  id: string;
  type: string;
  name: string;
  price: number;
  description?: string | null;
}

export interface GetSeedsData {
  getSeeds: Seed[];
}

export interface BuySeedData {
  buySeed: {
    __typename: 'Inventory' | 'SeedNotFoundError' | 'InsufficientFundsError' | 'SeedNotInInventoryError';
    id?: string;
    quantity?: number;
    seed?: {
      id: string;
      name: string;
    };
    message?: string;
  };
}

export interface BuySeedVariables {
  seedId: string;
}

export interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  zenPoints?: number;
  userId?: string;
}