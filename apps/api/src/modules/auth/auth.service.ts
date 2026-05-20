import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { randomBytes } from 'crypto';
import jwt from "jsonwebtoken";
import { GraphQLError } from 'graphql';
import * as cookie from "cookie";
import { prisma } from "@/lib/prisma";
import { validateAuthInput, setAuthTokens } from "@/lib/auth";
import { AuthPayload } from "@/modules/auth/auth.entity";

export class AuthService {
    //Регистрация пользователя
    static async signUp(email: string, password: string, name: string | undefined, res:Response): Promise<AuthPayload> {
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

    // Вход пользователя
    static async signIn(email: string, password: string, res: Response): Promise<AuthPayload> {
        await validateAuthInput(password, email, false);
        
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("Пользователь не найден");
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error("Неверный пароль");

        const { accessToken } = await setAuthTokens(res, user);
        
        return { token: accessToken, user };
    }

    // Выход пользователя
    static async logout(req: Request, res: Response): Promise<boolean> {
       // Инвалидируем токен в базе данных
		const cookieHeader = req?.headers?.cookie;
		if (cookieHeader) {
			const cookies = cookie.parse(cookieHeader);
			const token = cookies.refresh_token;
			if (token) {
				await prisma.refreshToken.deleteMany({
					where: { token }
				});
			}
		}

		// Очищаем куки на клиенте
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

    // Обновление токена
    static async refreshToken(req: Request, res: Response): Promise<AuthPayload> {
        const cookieHeader = req?.headers?.cookie;
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
			
			// Очищаем куки в случае ошибки валидации рефреш-токена, чтобы избежать циклов
			const cookieOptions = {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax" as const,
				maxAge: 0,
				path: "/",
			};
			res?.setHeader("Set-Cookie", [
				cookie.serialize("auth_token", "", cookieOptions),
				cookie.serialize("refresh_token", "", cookieOptions),
			]);

			throw new GraphQLError('Authentication failed', { extensions: { code: 'UNAUTHENTICATED' } });
		}
    }

    // Забыли пароль
    static async forgotPassword(email: string): Promise<boolean> {
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

    // Сброс пароля
    static async resetPassword(token:string, password:string, res:Response):Promise<boolean> {
        // Находим токен в базе
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        });
        if (!resetToken || resetToken.expiresAt < new Date()) {
            throw new Error("Токен не найден или устарел");
        }
        // Шифруем новый пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Обновляем пароль пользователя, удаляем токен сброса и инвалидируем активные сессии
        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword }
            });

            await tx.passwordResetToken.delete({
                where: { token }
            });

            // Удаляем все рефреш-токены пользователя (разлогиниваем со всех устройств)
            await tx.refreshToken.deleteMany({
                where: { userId: resetToken.userId }
            });
        });

        // Можно залогировать пользователя (опционально)
        const user = await prisma.user.findUnique({ where: { id: resetToken.userId } });
        if (user) {
            await setAuthTokens(res, user);
        }
        return true;
    }

    // Верификация email
    static async verifyEmailToken(token: string, res: Response): Promise<boolean> {
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

    // Верификация reset токена
    static async verifyResetToken(token:string):Promise<boolean>{
		const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        });
        // Возвращаем true только если токен найден и он еще "живой"
        return !!resetToken && resetToken.expiresAt > new Date();
	}

    // Повторная отправка reset токена
    static async resendVerificationToken(userId: string | undefined):Promise<boolean>{
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