export interface User {
  id: string;
  email: string;
  name: string;
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
