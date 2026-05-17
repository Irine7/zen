export interface User {
	id: string;
	email: string;
	name: string;
	zenPoints: number;
	emailVerified: boolean;
}

export interface AuthPayload {
	token: string;
	user: User;
}

export interface SignUpData {
	signUp: AuthPayload;
}

export interface SignInData {
	signIn: AuthPayload;
}

export interface GetMe {
	getMe: User;
}

export interface VerifyResetToken {
	verifyResetToken: boolean;
}

export interface VerifyEmailToken {
	verifyEmailToken: boolean;
}
