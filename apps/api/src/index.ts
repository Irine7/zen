import "dotenv/config";
import "reflect-metadata";
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSchema } from "type-graphql";
import { BonsaiResolver } from "@/modules/bonsai/bonsai.resolver";
import { UserResolver } from "@/modules/user/user.resolver";
import { HabitResolver } from './modules/habit/habit.resolver';

async function bootstrap() {
	// Строим схему из наших резолверов
	const schema = await buildSchema({
		resolvers: [BonsaiResolver, HabitResolver, UserResolver],
	});

	// Создаем сервер Apollo
	const server = new ApolloServer({
		schema,
	});

	// Запускаем сервер
	const url = await startStandaloneServer(server, {
		listen: { port: 4000 },
	});

	console.log(`➡️ Server ready at ${url.url}`);
}

bootstrap();
