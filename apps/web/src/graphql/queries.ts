import { gql } from '@apollo/client';

export const CREATE_BONSAI = gql`
mutation PlantBonsai($seedId: String!, $habitId: String!) {
	plantBonsaiFromInventory(seedId: $seedId, habitId: $habitId) {
	__typename
	... on Bonsai {
		id
		type
		level
		lastWateredAt
		createdAt
		user {
			id
			zenPoints
		}
		habit {
			title
		}
	}
	... on SeedNotInInventoryError {
		message
	}
}
}
`;

export const CREATE_HABIT = gql`
mutation CreateHabit($input: CreateHabitInput!) {
	createHabit(input: $input) {
		id
		title}
}
`;

export const WATER_BONSAI = gql`
	mutation WaterBonsai($id: String!) {
		waterBonsai(id: $id) {
			__typename
			... on Bonsai {
				id
				lastWateredAt
				user {
					id
					zenPoints # Apollo увидит этот ID и обновит очки везде на экране! 
				}
			}
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
`;

export const LEVEL_UP_BONSAI = gql`
	mutation LevelUpBonsai($id: String!) {
		levelUpBonsai(id: $id) {
			__typename
			... on Bonsai {
				id
				level
				lastWateredAt
			}
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
			user {
				id
				zenPoints
			}
			habit {
				title
			}
		}
	}
`;

export const GET_INVENTORY = gql`
	query GetInventory {
		getInventory {
		id
		quantity
		seed {
			id
			name
			type
		}
		}
	}
`;

export const GET_HABITS = gql`
	query GetHabits {
		getHabits {
			id
			title
			description
			bonsai {
				id
			}
		}
	}
`;

export const bonsaiFragment = gql`
	fragment NewBonsai on Bonsai {
		id type level lastWateredAt user { id zenPoints }
	}`;

export const GET_USER_PROFILE = gql`
query GetUserProfile($id: String!) {
	getUserProfile(id: $id) {
		id
		zenPoints
	}
}
`;

export const SIGN_UP = gql`
  mutation SignUp($name: String!, $email: String!, $password: String!) {
    signUp(name: $name, email: $email, password: $password) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

export const SIGN_IN = gql`
mutation SignIn($email: String!, $password: String!) {
	signIn(email: $email, password: $password) {
		token
		user {
			id
			email
			name
		}
	}
}`;

export const GET_ME = gql`
	query GetMe {
		getMe {
			id
			email
			name
			zenPoints
			emailVerified
		}
	}
`;

export const LOGOUT = gql`
	mutation Logout {
		logout
	}
`;

export const REFRESH_TOKEN = gql`
	mutation RefreshToken {
		refreshToken {
			token
			user {
				id
				email
				name
			}
		}
	}
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password)
  }
`;

export const VERIFY_RESET_TOKEN = gql`
	query VerifyResetToken($token: String!) {
		verifyResetToken(token: $token)
	}
`;

export const VERIFY_EMAIL_TOKEN = gql`
	mutation VerifyEmailToken($token: String!) {
		verifyEmailToken(token: $token)
	}
`;

export const RESEND_VERIFICATION_TOKEN = gql`
	mutation ResendVerificationToken {
		resendVerificationToken
	}
`;