"use client";

import React from "react";
import { ApolloLink, HttpLink } from "@apollo/client";
import {
	ApolloNextAppProvider,
	SSRMultipartLink,
	ApolloClient,
	InMemoryCache,
} from "@apollo/client-integration-nextjs";

export function ApolloWrapper({ children }: { children: React.ReactNode; }) {
	function makeClient() {
		const httpLink = new HttpLink({
			uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
		});

		return new ApolloClient({
			cache: new InMemoryCache({
				possibleTypes: {
					BonsaiResult: ["Bonsai", "BonsaiNotFoundError", "BonsaiAlreadyDeadError"],
				},
			}),
			link: typeof window === "undefined"
				? ApolloLink.from([
					new SSRMultipartLink({
						stripDefer: true,
					}),
					httpLink,
				])
				: httpLink,
		});
	}

	return (
		<ApolloNextAppProvider makeClient={makeClient}>
			{children}
		</ApolloNextAppProvider>
	);
}
