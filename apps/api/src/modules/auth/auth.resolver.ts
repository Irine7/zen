import bcrypt from "bcrypt";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import type { Context } from "@/types/context";
import { AuthPayload } from "./auth.entity";
import { setAuthTokens, validateAuthInput } from '@/lib/auth';

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
		const { accessToken } = await setAuthTokens(res, user);

		return { token: accessToken, user };
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

		const { accessToken } = await setAuthTokens(res, user);

		return { token: accessToken, user };
	}

	@Mutation(() => Boolean)
	async logout(@Ctx() { res }: Context): Promise<boolean> {
		// Общие настройки для удаления
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax" as const,
			maxAge: 0, // Удаляем куку немедленно
			path: "/",
		};

		// Устанавливаем массив из двух кук для удаления (и access, и refresh токена)
		res?.setHeader("Set-Cookie", [
			cookie.serialize("auth_token", "", cookieOptions),
			cookie.serialize("refresh_token", "", cookieOptions),
		]);

		return true;
	}

	@Mutation(() => AuthPayload)
	async refreshToken(
		@Ctx() { res }: Context
	): Promise<AuthPayload> {
		const cookieHeader = res?.req?.headers?.cookie;
		if (!cookieHeader) throw new Error('No cookies found');

		const cookies = cookie.parse(cookieHeader);
		const token = cookies.refresh_token;
		if (!token) throw new Error('Refresh token not found');

		try {
			// Проверяем JWT подпись
			const payload = jwt.verify(token, process.env.JWT_SECRET as string, { algorithms: ["HS256"] }) as { userId: string; };
			// Ищем токен в базе данных
			const savedToken = await prisma.refreshToken.findUnique({
				where: {
					token: token,
				},
				include: { user: true }
			});
			// Если токена нет в базе или он протух по времени в БД
			if (!savedToken || savedToken.expiresAt < new Date()) {
				throw new Error("Refresh token is invalid or expired");
			}
			//Удаляем старый токен
			await prisma.refreshToken.delete({
				where: {
					token: token
				}
			});
			// Генерируем новую пару токенов
			const { accessToken } = await setAuthTokens(res, savedToken.user);
			// Возвращаем объект, который совпадает с типом AuthPayload
			return {
				token: accessToken,
				user: savedToken.user as any
			};
		} catch (error) {
			console.error("Refresh token error:", error);
			throw new Error('Authentication failed');
		}
	}
}