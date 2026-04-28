import type { Metadata } from "next";
import { ApolloWrapper } from "@/src/lib/apollo-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zen Garden",
  description: "Grow your habits with Zen Garden",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
				<ApolloWrapper>{children}</ApolloWrapper>
			</body>
    </html>
  );
}
