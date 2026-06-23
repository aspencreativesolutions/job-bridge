import NextAuth from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

export function getLinkedInCredentials() {
  const clientId =
    process.env.AUTH_LINKEDIN_ID?.trim() ||
    process.env.LINKEDIN_CLIENT_ID?.trim();
  const clientSecret =
    process.env.AUTH_LINKEDIN_SECRET?.trim() ||
    process.env.LINKEDIN_CLIENT_SECRET?.trim();

  return { clientId, clientSecret };
}

export function isLinkedInConfigured() {
  const { clientId, clientSecret } = getLinkedInCredentials();
  return Boolean(clientId && clientSecret);
}

const { clientId, clientSecret } = getLinkedInCredentials();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    LinkedIn({
      clientId: clientId ?? "missing-client-id",
      clientSecret: clientSecret ?? "missing-client-secret",
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
