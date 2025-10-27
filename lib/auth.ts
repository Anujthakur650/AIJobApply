import bcrypt from 'bcryptjs';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/sign-in'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!existingUser || !existingUser.hashedPassword) {
          throw new Error('Invalid email or password');
        }

        const passwordValid = await bcrypt.compare(credentials.password, existingUser.hashedPassword);

        if (!passwordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name ?? undefined,
          image: existingUser.image ?? undefined
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET
};

export const getServerAuthSession = () => getServerSession(authOptions);

export const getCurrentUser = async () => {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      preferences: true,
      skills: {
        include: {
          skill: true
        }
      }
    }
  });

  return user;
};
