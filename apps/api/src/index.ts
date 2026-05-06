import "dotenv/config";
import "reflect-metadata";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { buildSchema } from "type-graphql";
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import { BonsaiResolver } from "@/modules/bonsai/bonsai.resolver";
import { UserResolver } from "@/modules/user/user.resolver";
import { HabitResolver } from './modules/habit/habit.resolver';
import { AuthResolver } from './modules/auth/auth.resolver';
import type { Context } from './types/context';

async function bootstrap() {
	// Строим схему из наших резолверов
	const schema = await buildSchema({
		resolvers: [BonsaiResolver, HabitResolver, UserResolver, AuthResolver],
	});

	const app = express();
	const httpServer = http.createServer(app);

	// Создаем сервер Apollo
	const server = new ApolloServer<Context>({
		schema,
	});

	// Запускаем Apollo Server
	await server.start();

	// Настраиваем Express middleware
	app.use(
		'/graphql',
		cors<cors.CorsRequest>({
			origin: ["http://localhost:3000"],
			credentials: true,
		}),
		json(),
		expressMiddleware(server, {
			context: async ({ req, res }): Promise<Context> => {
				// Берем заголовок Authorization (обычно он выглядит как "Bearer <token>")
				const authHeader = req.headers.authorization || "";
				// Удаляем "Bearer " из заголовка, чтобы остался только токен
				let token: string | undefined = authHeader.replace("Bearer ", "");

				// Если в заголовках пусто, ищем в куках
				if (!token && req.headers.cookie) {
					const cookies = cookie.parse(req.headers.cookie);
					token = cookies.auth_token;
				}

				if (token) {
					try {
						// Проверяем токен
						const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; };
						// Если токен настоящий, кладем userId в контекст
						return { userId: payload.userId, req, res };
					} catch (error) {
						// Если токен плохой или протух — просто возвращаем пустой контекст
						console.error("JWT Verification failed", error);
						return { req, res };
					}
				}
				// Если токена нет — пустой контекст
				return { req, res };
			}
		}),
	);

	// Запускаем HTTP сервер
	await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
	console.log(`➡️ Server ready at http://localhost:4000/graphql`);
}

bootstrap();