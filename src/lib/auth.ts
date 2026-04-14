import { db } from "@/db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

console.log("Inicializando NextAuth...");

const nextAuth = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
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

console.log("NextAuth keys:", Object.keys(nextAuth));
export const { handlers, signIn, signOut, auth } = nextAuth;