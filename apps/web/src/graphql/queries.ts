import { gql } from '@apollo/client';

export const CREATE_BONSAI = gql`
mutation CreateBonsai($input: CreateBonsaiInput!) {
	createBonsai(input: $input) {
	... on Bonsai { id type level lastWateredAt createdAt habit { title } }
	}
}
`;

export const WATER_BONSAI = gql`
	mutation WaterBonsai($id: String!) {
		waterBonsai(id: $id) {
		__typename
			... on Bonsai { id lastWateredAt }
			... on BonsaiNotFoundError { message }
			... on BonsaiAlreadyDeadError { message }
		}
	}
`;

export const DELETE_BONSAI = gql`
mutation DeleteBonsai($id: String!) {
	deleteBonsai(id: $id) {
		__typename
		... on Bonsai { id }
		... on BonsaiNotFoundError { message }
	}
}
`

export const LEVEL_UP_BONSAI = gql`
	mutation LevelUpBonsai($id: String!) {
		levelUpBonsai(id: $id) {
			__typename
			... on Bonsai { id level lastWateredAt }
			... on BonsaiNotFoundError { message }
			... on BonsaiAlreadyDeadError { message }
		}
	}
	`;

export const GET_GARDEN = gql`
	query GetGarden {
		getGarden {
			id
			type
			level
			lastWateredAt
			habit {
				title
			}
		}
	}
`;