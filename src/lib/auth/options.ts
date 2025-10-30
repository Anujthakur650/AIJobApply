import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getEnv } from "@/lib/config/env";
import { verifyPassword } from "@/lib/auth/password";

const env = getEnv();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const baseProviders: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email and password",
    credentials: {
      email: {
        label: "Email",
        type: "email",
        placeholder: "you@example.com",
      },
      password: {
        label: "Password",
        type: "password",
        placeholder: "••••••••",
      },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);

      if (!parsed.success) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });

      if (!user?.passwordHash) {
        return null;
      }

      if (!user.emailVerified) {
        throw new Error("EMAIL_NOT_VERIFIED");
      }

      const isValid = await verifyPassword(parsed.data.password, user.passwordHash);

      if (!isValid) {
        return null;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastSignInAt: new Date() },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        role: user.role,
      } as unknown as Record<string, unknown>;
    },
  }),
];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  baseProviders.push(
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET) {
  baseProviders.push(
    LinkedInProvider({
      clientId: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: env.NEXTAUTH_SECRET,
  providers: baseProviders,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify",
    newUser: "/onboarding",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        if ((user as Record<string, unknown>).role) {
          token.role = (user as Record<string, unknown>).role;
        } else {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          });
          token.role = dbUser?.role ?? "USER";
        }
      }

      if (!token.role && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "USER";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub ?? token.id ?? "") as string;
        if (token.role) {
          session.user.role = token.role as string;
        }
      }

      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider && account.provider !== "credentials") {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: new Date(),
            lastSignInAt: new Date(),
          },
        });
      }

      return true;
    },
  },
  events: {
    async createUser({ user }) {
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });

      await prisma.onboardingProgress.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
    },
  },
};

export const getSession = () => getServerSession(authOptions);
