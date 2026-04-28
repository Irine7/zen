import "dotenv/config";
import "reflect-metadata";
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSchema } from "type-graphql";
import { BonsaiResolver } from "@/modules/bonsai/bonsai.resolver";

async function bootstrap() {
	// 1. Строим схему из наших резолверов
	const schema = await buildSchema({
		resolvers: [BonsaiResolver],
	});

	// 2. Создаем сервер Apollo
	const server = new ApolloServer({
		schema,
	});

	// 3. Запускаем сервер
	const url = await startStandaloneServer(server, {
		listen: { port: 4000 },
	});

	console.log(`➡️ Server ready at ${url.url}`);
}

bootstrap();
