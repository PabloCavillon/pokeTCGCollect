import { db } from "@/db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

let nextAuth;
try {
	nextAuth = NextAuth({
		adapter: DrizzleAdapter(db),
		providers: [
			Google({
				clientId: process.env.GOOGLE_CLIENT_ID!,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			}),
		],
		callbacks: {
			session({ session, user }) {
				session.user.id = user.id;
				return session;
			},
		},
	});
} catch (err) {
	console.error("NextAuth init error:", err);
	throw err;
}


export const { handlers, signIn, signOut, auth } = nextAuth;
