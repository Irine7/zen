import bcrypt from "bcrypt";
import { randomBytes } from 'crypto';
import { GraphQLError } from 'graphql';
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { Resolver, Mutation, Query, Arg, Ctx } from "type-graphql";
import type { Context } from "@/types/context";
import { AuthPayload } from "./auth.entity";
import { setAuthTokens, validateAuthInput } from '@/lib/auth';

@Resolver()
export class AuthResolver {
	@Mutation(() => AuthPayload)
	async signUp(
		@Arg("email", () => String) email: string,
		@Arg("password", () => String) password: string,
		@Arg("name", () => String, { nullable: true }) name: string | undefined,
		@Ctx() { res }: Context
	): Promise<AuthPayload> {
		await validateAuthInput(password, email, true);
		// Шифруем пароль
		const hashedPassword = await bcrypt.hash(password, 10);

		// Генерируем токен верификации email
		const verificationToken = randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

		// Создаем пользователя в базе
		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				name: name || "User",
				emailVerified: false,
				emailVerificationToken: {
					create: {
						token: verificationToken,
						expiresAt: expiresAt,
					}
				}
			}
		});

		console.log(`--- EMAIL VERIFICATION MOCK ---`);
		console.log(`To: ${email}`);
		console.log(`Link: http://localhost:3000/verify-email?token=${verificationToken}`);
		console.log(`---------------------------------`);

		// Создаем JWT токен
		const { accessToken } = await setAuthTokens(res, user);

		return { token: accessToken, user };
	}

	@Mutation(() => AuthPayload)
	async signIn(
		@Arg("email", () => String) email: string,
		@Arg("password", () => String) password: string,
		@Ctx() { res }: Context // Достаем res из контекста
	): Promise<AuthPayload> {
		await validateAuthInput(password, email, false);

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
		if (!cookieHeader) throw new GraphQLError('No cookies found', { extensions: { code: 'UNAUTHENTICATED' } });

		const cookies = cookie.parse(cookieHeader);
		const token = cookies.refresh_token;
		if (!token) throw new GraphQLError('Refresh token not found', { extensions: { code: 'UNAUTHENTICATED' } });

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
			throw new GraphQLError('Authentication failed', { extensions: { code: 'UNAUTHENTICATED' } });
		}
	}

	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg("email", () => String) email: string): Promise<boolean> {
		// Ищем пользователя
		const user = await prisma.user.findUnique({ where: { email } });
		// Если пользователя нет — по соображениям безопасности мы всё равно возвращаем true, чтобы злоумышленник не мог «перебирать» существующие email'ы.
		if (!user) return true;

		// Генерируем токен с маленьким сроком жизни (15 минут)
		const token = randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

		// Сохраняем в PasswordResetToken
		await prisma.passwordResetToken.create({
			data: {
				token,
				expiresAt,
				userId: user.id
			}
		});

		// Имитируем отправку письма
		console.log(`--- EMAIL MOCK ---`);
		console.log(`To: ${email}`);
		console.log(`Link: http://localhost:3000/reset-password?token=${token}`);
		console.log(`------------------`);
		return true;
	}

	@Mutation(() => Boolean)
	async resetPassword(
		@Arg("token", () => String) token: string,
		@Arg("password", () => String) password: string,
		@Ctx() { res }: Context
	): Promise<boolean> {
		// Находим токен в базе
		const resetToken = await prisma.passwordResetToken.findUnique({
			where: { token }
		});
		if (!resetToken || resetToken.expiresAt < new Date()) {
			throw new Error("Токен не найден или устарел");
		}
		// Шифруем новый пароль
		const hashedPassword = await bcrypt.hash(password, 10);

		// Обновляем пароль пользователя и удаляем токен сброса
		await prisma.$transaction(async (tx) => {
			await tx.user.update({
				where: { id: resetToken.userId },
				data: { password: hashedPassword }
			});

			await tx.passwordResetToken.delete({
				where: { token }
			});
		});

		// Можно залогировать пользователя (опционально)
		const user = await prisma.user.findUnique({ where: { id: resetToken.userId } });
		if (user) {
			await setAuthTokens(res, user);
		}
		return true;
	}

	@Mutation(() => Boolean)
	async verifyEmailToken(
		@Arg("token", () => String) token: string,
	): Promise<boolean> {
		// Ищем токен в БД
		const verificationToken = await prisma.emailVerificationToken.findUnique({
			where: { token },
			include: { user: true }
		});

		if (!verificationToken || verificationToken.expiresAt < new Date()) {
			throw new GraphQLError('Токен не найден или устарел', { extensions: { code: 'UNAUTHENTICATED' } });
		}

		// Если все хорошо, обновляем статус юзера и удаляем токен
		await prisma.$transaction(async (tx) => {
			await tx.user.update({
				where: { id: verificationToken.userId },
				data: { emailVerified: true }
			});

			await tx.emailVerificationToken.delete({
				where: { token }
			});
		});

		return true;
	}

	@Query(() => Boolean)
	async verifyResetToken(
		@Arg('token', () => String) token: string
	): Promise<boolean> {
		const resetToken = await prisma.passwordResetToken.findUnique({
			where: { token }
		});
		// Возвращаем true только если токен найден и он еще "живой"
		return !!resetToken && resetToken.expiresAt > new Date();
	}

	@Mutation(() => Boolean)
	async resendVerificationToken(
		@Ctx() { userId, res }: Context // Забираем userId прямо из доверенного контекста
	): Promise<boolean> {
		// Проверяем, авторизован ли пользователь вообще
		if (!userId) {
			throw new GraphQLError("Вы должны быть авторизованы!", { extensions: { code: 'UNAUTHENTICATED' } });
		}
		// Идем в базу данных и достаем email пользователя по его ID. Теперь мы на 100% уверены, что email принадлежит именно ему
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) throw new GraphQLError("Пользователь не найден!", { extensions: { code: 'UNAUTHENTICATED' } });

		// Проверяем, не верифицирован ли пользователь уже
		if (user.emailVerified)
			throw new GraphQLError("Ваш email уже верифицирован", { extensions: { code: 'BAD_USER_INPUT' } });

		// Генерируем новый токен
		const token = randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

		// Обновляем/создаем токен в базе данных
		await prisma.user.update({
			where: { id: userId },
			data: {
				emailVerificationToken: {
					upsert: {
						update: {
							token,
							expiresAt
						},
						create: {
							token,
							expiresAt,
						}
					}
				}
			}
		});

		// Имитируем отправку письма
		console.log(`--- EMAIL MOCK ---`);
		console.log(`To: ${user.email}`);
		console.log(`Link: http://localhost:3000/verify-email?token=${token}`);
		console.log(`------------------`);

		return true;
	}
}