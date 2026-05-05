import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Resolver, Mutation, Arg } from "type-graphql";
import { prisma } from "@/lib/prisma";
import { AuthPayload } from "./auth.entity";

@Resolver()
export class AuthResolver {
	// Регистрируемся в системе
	@Mutation(() => AuthPayload)
	async signUp(
		@Arg("email", () => String) email: string,
		@Arg("password", () => String) password: string,
		@Arg("name", () => String, { nullable: true }) name?: string,
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

		return { token, user };
	}

	// Входим в систему
	@Mutation(() => AuthPayload)
	async signIn(
		@Arg("email", () => String) email: string,
		@Arg("password", () => String) password: string,
	): Promise<AuthPayload> {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) throw new Error("Пользователь не найден")
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) throw new Error("Неверный пароль")

		const token = jwt.sign({
			userId: user.id,
			email: user.email
		},
		process.env.JWT_SECRET as string,
		{expiresIn: "7d"}
		);
		return { token, user };
	}
}