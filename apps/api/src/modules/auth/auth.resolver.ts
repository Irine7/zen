import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { prisma } from "@/lib/prisma";
import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import type { Context } from "@/types/context";
import { AuthPayload } from "./auth.entity";

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
		const token = jwt.sign({
			userId: user.id,
			email: user.email
		},
			process.env.JWT_SECRET as string,
			{ expiresIn: "7d" }
		);

		res?.setHeader("Set-Cookie", cookie.serialize("auth_token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7,
			path: "/",
		}));

		return { token, user };
	}

	// Входим в систему
	@Mutation(() => AuthPayload)
	async signIn(
		@Arg("email", () => String) email: string,
		@Arg("password", () => String) password: string,
		@Ctx() { res }: Context // Достаем res из контекста
	): Promise<AuthPayload> {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) throw new Error("Пользователь не найден");
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) throw new Error("Неверный пароль");

		const token = jwt.sign({
			userId: user.id,
			email: user.email
		},
			process.env.JWT_SECRET as string,
			{ expiresIn: "7d" }
		);
		res?.setHeader("Set-Cookie", cookie.serialize("auth_token", token, {
			httpOnly: true, // КЛЮЧЕВОЙ МОМЕНТ: JS не увидит куку
			secure: process.env.NODE_ENV === "production", // Только через HTTPS в продакшене
			sameSite: "lax", // Защита от CSRF
			maxAge: 60 * 60 * 24 * 7, // 7 дней (в секундах)
			path: "/", // Доступна на всем сайте
		}));

		return { token, user };
	}
}

// А что если мы добавим еще и метод logout? Как думаешь, что нужно отправить в куке auth_token, чтобы пользователь «разлогинился»?