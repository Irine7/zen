import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import express from "express";
import rateLimit from "express-rate-limit";
import type { Context } from "../types/context";

// 1. Лимитер
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
   

// 2. Функция создания контекста
export const createContext = async ({ req, res }: { req: express.Request; res: express.Response }): Promise<Context> => {
  const authHeader = req.headers.authorization || "";
  let token: string | undefined = authHeader.replace("Bearer ", "");

  if (!token && req.headers.cookie) {
    const cookies = cookie.parse(req.headers.cookie);
    token = cookies.auth_token;
  }

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      return { userId: payload.userId, req, res };
    } catch (error) {
      console.error("JWT Verification failed", error);
    }
  }
  return { req, res };
};