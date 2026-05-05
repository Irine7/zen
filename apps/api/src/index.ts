import "dotenv/config";
import "reflect-metadata";
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSchema } from "type-graphql";
import jwt from "jsonwebtoken";
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

	// Создаем сервер Apollo
	const server = new ApolloServer({
		schema,
	});

	// Запускаем сервер
	const url = await startStandaloneServer(server, {
		listen: { port: 4000 },
		context: async ({ req }): Promise<Context> => {
			// Берем заголовок Authorization (обычно он выглядит как "Bearer <token>")
			const authHeader = req.headers.authorization || "";
			// Удаляем "Bearer " из заголовка, чтобы остался только токен
			const token = authHeader.replace("Bearer ", "");

			if (token) {
				try {
					// Проверяем токен
					const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; };
					// Если токен настоящий, кладем userId в контекст
					return { userId: payload.userId };
				} catch (error) {
					// Если токен плохой или протух — просто возвращаем пустой контекст
					console.error("JWT Verification failed", error);
					return {};
				}
			}
			// Если токена нет — пустой контекст
			return {};
		}
	});

	console.log(`➡️ Server ready at ${url.url}`);
}

bootstrap();
