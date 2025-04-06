import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth/next";
import { CustomPrismaAdapter } from "@/lib/auth-adapter";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide NEXTAUTH_SECRET environment variable');
}

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // 24 horas
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials');
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true
            }
          });

          if (!user || !user.password || !(await bcrypt.compare(credentials.password, user.password))) {
            throw new Error('InvalidCredentials');
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: null
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('CredentialsSignin');
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    }
  },
  events: {
    async signIn({ user }) {
      if (user.id) {
        await prisma.$executeRaw`
          UPDATE "User" 
          SET "lastLogin" = NOW() 
          WHERE id = ${parseInt(user.id)}
        `;
      }
    },
  },
  debug: false,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };