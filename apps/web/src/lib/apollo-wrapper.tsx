"use client";

import React from "react";
import { ApolloLink, HttpLink, from, Observable } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
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
			credentials: 'include'
		});

		let refreshPromise: Promise<boolean> | null = null;

		const errorLink = onError(({ error, operation, forward }) => {
			if (CombinedGraphQLErrors.is(error)) {
				for (const err of error.errors) {
					const isUnauthenticated =
						err.extensions?.code === "UNAUTHENTICATED" ||
						err.message.includes("авторизуйтесь") ||
						err.message.includes("авторизованы");

					if (isUnauthenticated) {
						if (operation.operationName === "RefreshToken") return;

						if (!refreshPromise) {
							refreshPromise = (async () => {
								try {
									const response = await fetch(
										process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
										{
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({
												query: `mutation RefreshToken { refreshToken { token } }`,
											}),
											credentials: "include",
										}
									);

									const result = await response.json();
									if (result.data?.refreshToken) return true;
								} catch (e) {
									console.error("Refresh token failed", e);
								} finally {
									refreshPromise = null;
								}

								if (typeof window !== "undefined") {
									window.location.href = "/login";
								}
								return false;
							})();
						}

						return new Observable((observer) => {
							refreshPromise?.then((success) => {
								if (success) {
									const subscription = forward(operation).subscribe({
										next: observer.next.bind(observer),
										error: observer.error.bind(observer),
										complete: observer.complete.bind(observer),
									});
									return () => subscription.unsubscribe();
								} else {
									observer.error(err);
								}
							}).catch(observer.error.bind(observer));
						});
					}
				}
			} else {
				console.log(`[Network error]: ${error}`);
			}
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
				: from([errorLink, httpLink]),
		});
	}

	return (
		<ApolloNextAppProvider makeClient={makeClient}>
			{children}
		</ApolloNextAppProvider>
	);
}
