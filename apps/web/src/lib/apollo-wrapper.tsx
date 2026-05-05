"use client";

import React from "react";
import { ApolloLink, HttpLink } from "@apollo/client";
import {
	ApolloNextAppProvider,
	SSRMultipartLink,
	ApolloClient,
	InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { SetContextLink } from "@apollo/client/link/context";
import { AUTH_TOKEN_KEY } from "@/constants/auth";

export function ApolloWrapper({ children }: { children: React.ReactNode; }) {
	function makeClient() {
		const httpLink = new HttpLink({
			uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
		});

		const authLink = new SetContextLink((prevContext) => {
			// Проверяем, что мы в браузере, прежде чем лезть в localStorage
			const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
			console.log(token);

			return {
				...prevContext, // сохраняем старые настройки контекста
				headers: {
					...prevContext.headers, // сохраняем старые заголовки
					authorization: token ? `Bearer ${token}` : ""
				}
			};
		});

		return new ApolloClient({
			cache: new InMemoryCache({
				possibleTypes: {
					BonsaiResult: ["Bonsai", "BonsaiNotFoundError", "BonsaiAlreadyDeadError"],
				},
			}),
			// Соединяем линки 
			link: typeof window === "undefined"
				? ApolloLink.from([
					new SSRMultipartLink({
						stripDefer: true,
					}),
					httpLink,
				])
				: authLink.concat(httpLink), // Приклеиваем авторизацию к httpLink
		});
	}

	return (
		<ApolloNextAppProvider makeClient={makeClient}>
			{children}
		</ApolloNextAppProvider>
	);
}
