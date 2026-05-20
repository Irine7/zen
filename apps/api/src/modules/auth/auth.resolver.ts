import { Resolver, Mutation, Query, Arg, Ctx } from "type-graphql";
import type { Context } from "@/types/context";
import { AuthPayload } from "./auth.entity";
import { AuthService } from "./auth.service";

@Resolver()
export class AuthResolver {
	@Mutation(() => AuthPayload)
	async signUp(
		@Arg("email", () => String) email: string,
		@Arg("password", () => String) password: string,
		@Arg("name", () => String, { nullable: true }) name: string | undefined,
		@Ctx() { res }: Context
	): Promise<AuthPayload> {
		return AuthService.signUp(email, password, name, res);
	}

	@Mutation(() => AuthPayload)
	async signIn(
		@Arg("email", () => String) email: string,
		@Arg("password", () => String) password: string,
		@Ctx() { res }: Context // Достаем res из контекста
	): Promise<AuthPayload> {
		return AuthService.signIn(email, password, res);
	}

	@Mutation(() => Boolean)
	async logout(@Ctx() { req, res }: Context): Promise<boolean> {
		return AuthService.logout(req, res);
	}

	@Mutation(() => AuthPayload)
	async refreshToken(
		@Ctx() { req, res }: Context
	): Promise<AuthPayload> {
		return AuthService.refreshToken(req, res);
	}

	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg("email", () => String) email: string): Promise<boolean> {
		return AuthService.forgotPassword(email);
	}

	@Mutation(() => Boolean)
	async resetPassword(
		@Arg("token", () => String) token: string,
		@Arg("password", () => String) password: string,
		@Ctx() { res }: Context
	): Promise<boolean> {
		return AuthService.resetPassword(token, password, res);
	}

	@Mutation(() => Boolean)
	async verifyEmailToken(
		@Arg("token", () => String) token: string,
		@Ctx() { res }: Context
	): Promise<boolean> {
		return AuthService.verifyEmailToken(token, res);
	}

	@Query(() => Boolean)
	async verifyResetToken(
		@Arg('token', () => String) token: string
	): Promise<boolean> {
		return AuthService.verifyResetToken(token);
	}

	@Mutation(() => Boolean)
	async resendVerificationToken(
		@Ctx() { userId }: Context // Забираем userId прямо из доверенного контекста
	): Promise<boolean> {
		return AuthService.resendVerificationToken(userId);
	}
}