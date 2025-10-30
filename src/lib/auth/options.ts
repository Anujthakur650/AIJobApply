import type { AuthOptions, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { env } from "@/lib/env";
import { demoUser } from "@/lib/auth/mock-data";

const providers: AuthOptions["providers"] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const isValidEmail = credentials.email.toLowerCase() === demoUser.email;
      const isValidPassword = credentials.password === demoUser.password;

      if (!isValidEmail || !isValidPassword) {
        return null;
      }

      return {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        headline: demoUser.headline,
        location: demoUser.location,
      } as User;
    },
  }),
];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: env.NEXTAUTH_SECRET,
  providers,
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as typeof user & { role?: string }).role ?? demoUser.role;
        token.headline = (user as typeof user & { headline?: string }).headline;
        token.location = (user as typeof user & { location?: string }).location;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? demoUser.role;
        session.user.headline = token.headline as string | undefined;
        session.user.location = token.location as string | undefined;
      }

      return session;
    },
  },
};
