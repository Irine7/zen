import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { prisma } from "@/lib/prisma";
import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import type { Context } from "@/types/context";
import { AuthPayload } from "./auth.entity";
import { setAuthCookie, validateAuthInput } from '@/lib/auth';

@Resolver()
export class AuthResolver {
	// Регистрируемся в системе
	@Mutation(() => AuthPayload)
	async signUp(
		@Arg("email", () => String) email: string,
		@Arg("password", () => String) password: string,
		@Arg("name", () => String, { nullable: true }) name: string | undefined,
		@Ctx() { res }: Context
	): Promise<AuthPayload> {
		await validateAuthInput(password, email, name);

		// Шифруем пароль
		const hashedPassword = await bcrypt.hash(password, 10);

		// Создаем пользователя в базе
		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				name: name || "User",
			}
		});

		// Создаем JWT токен
		const token = setAuthCookie(res, user);

		return { token, user };
	}

	// Входим в систему
	@Mutation(() => AuthPayload)
	async signIn(
		@Arg("email", () => String) email: string,
		@Arg("password", () => String) password: string,
		@Ctx() { res }: Context // Достаем res из контекста
	): Promise<AuthPayload> {
		await validateAuthInput(password, email);

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) throw new Error("Пользователь не найден");
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) throw new Error("Неверный пароль");

		const token = setAuthCookie(res, user);

		return { token, user };
	}

	@Mutation(() => Boolean)
	async logout(@Ctx() { res }: Context): Promise<boolean> {
		res?.setHeader("Set-Cookie", cookie.serialize("auth_token", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 0, // Удаляет куку немедленно
			path: "/",
		}));
		return true;
	}
}

// TODO: реализовать метод для обновления токена
// TODO: реализовать логаут на клиенте