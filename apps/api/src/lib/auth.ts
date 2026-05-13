import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import express from "express";
import rateLimit from "express-rate-limit";
import type { Context } from "../types/context";
import { prisma } from './prisma';
import { AUTH_REGEX } from '@zen/shared-types';

// Лимитер
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: 'Слишком много попыток входа, попробуйте позже',
	standardHeaders: true,
	legacyHeaders: false,
});

export const authRateLimitProxy = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	// Мы проверяем, есть ли в теле запроса (req.body.query) слова "signIn" или "signUp"
	const isAuthMutation = req.body?.query?.includes('signIn') || req.body?.query?.includes('signUp');

	if (isAuthMutation) {
		// Если это вход или регистрация — вызываем наш лимитер
		return authLimiter(req, res, next);
	}
	// Если это обычный запрос — просто идем дальше
	next();
};

// Функция создания контекста
export const createContext = async ({ req, res }: { req: express.Request; res: express.Response; }): Promise<Context> => {
	const authHeader = req.headers.authorization || "";
	let token: string | undefined = authHeader.replace("Bearer ", "");

	if (!token && req.headers.cookie) {
		const cookies = cookie.parse(req.headers.cookie);
		token = cookies.auth_token;
	}

	if (token) {
		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET as string, { algorithms: ["HS256"] }) as { userId: string; };
			return { userId: payload.userId, req, res };
		} catch (error) {
			console.error("JWT Verification failed", error);
		}
	}
	return { req, res };
};

export const setAuthTokens = async (res: express.Response, user: { id: string; email: string; }) => {
	// Генерируем Access Token (короткий - 15 мин)
	const accessToken = jwt.sign(
		{ userId: user.id, email: user.email },
		process.env.JWT_SECRET as string,
		{ expiresIn: "15m", algorithm: "HS256" }
	);

	// Генерируем Refresh Token (долгий - 7 дней)
	const refreshToken = jwt.sign(
		{ userId: user.id, email: user.email },
		process.env.JWT_SECRET as string,
		{ expiresIn: "7d", algorithm: "HS256" }
	);

	// Сохраняем Refresh Token в БД
	await prisma.refreshToken.create({
		data: {
			token: refreshToken,
			userId: user.id,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через 7 дней
		},
	});

	// Устанавливаем куки
	// Access Token - для запросов в API
	res.setHeader("Set-Cookie", [
		cookie.serialize("auth_token", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 15,
			path: "/",
		}),
		// Refresh Token - для обновления сессии
		cookie.serialize("refresh_token", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7,
			path: "/",
		})
	]);

	return { accessToken, refreshToken };
};

export const validateAuthInput = async (password: string, email: string, name?: string) => {

	if (!password) {
		throw new Error("Пароль не может быть пустым");
	}
	if (!AUTH_REGEX.PASSWORD.test(password)) {
		throw new Error("Пароль должен быть не менее 8 символов, содержать как минимум одну цифру и один специальный символ");
	}
	if (!AUTH_REGEX.EMAIL.test(email)) {
		throw new Error("Неверный формат email");
	}
	if (email) {
		const user = await prisma.user.findUnique({ where: { email } });
		if (user) throw new Error("Пользователь с таким email уже существует");
	}
};