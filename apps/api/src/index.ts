import "dotenv/config";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { ApolloServer } from '@apollo/server';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { expressMiddleware } from '@as-integrations/express4';
import { BonsaiResolver } from "@/modules/bonsai/bonsai.resolver";
import { UserResolver } from "@/modules/user/user.resolver";
import { HabitResolver } from './modules/habit/habit.resolver';
import { AuthResolver } from './modules/auth/auth.resolver';
import { createContext, authRateLimitProxy } from './lib/auth';
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
		express.json(),	// Сначала читаем данные запроса...
		authRateLimitProxy, // ...затем проверяем их на лимиты
		expressMiddleware(server, {  // ...и только потом отдаем запрос в Apollo
			context: createContext,
		}),
	);

	// Запускаем HTTP сервер
	await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
	console.log(`➡️ Server ready at http://localhost:4000/graphql`);
}

bootstrap();