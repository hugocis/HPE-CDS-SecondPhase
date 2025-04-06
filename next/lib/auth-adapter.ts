import { Adapter, AdapterAccount, AdapterSession, AdapterUser } from "next-auth/adapters";
import prisma from "./prisma";

export function CustomPrismaAdapter(): Adapter {
  return {
    async createUser(data: Omit<AdapterUser, "id">) {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name || "User",
          role: "USER",
          password: "" // This will be set during registration
        },
      });

      return {
        id: user.id.toString(),
        email: user.email!,
        name: user.name!,
        emailVerified: null,
        role: user.role
      };
    },

    async getUser(id: string) {
      const user = await prisma.user.findUnique({ 
        where: { 
          id: id 
        } 
      });
      if (!user) return null;

      return {
        id: user.id.toString(),
        email: user.email!,
        name: user.name!,
        emailVerified: null,
        role: user.role
      };
    },

    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;

      return {
        id: user.id.toString(),
        email: user.email!,
        name: user.name!,
        emailVerified: null,
        role: user.role
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const userAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: { user: true },
      });
      if (!userAccount) return null;
      const { user } = userAccount;

      return {
        id: user.id.toString(),
        email: user.email!,
        name: user.name!,
        emailVerified: null,
        role: user.role
      };
    },

    async updateUser(user: Partial<AdapterUser> & { id: string }) {
      const data: any = {};
      if (user.name) data.name = user.name;
      if (user.email) data.email = user.email;

      const updated = await prisma.user.update({
        where: { id: user.id },
        data
      });

      return {
        id: updated.id.toString(),
        email: updated.email!,
        name: updated.name!,
        emailVerified: null,
        role: updated.role
      };
    },

    async linkAccount(account: AdapterAccount) {
      await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      });
    },

    async createSession(session: { sessionToken: string; userId: string; expires: Date }): Promise<AdapterSession> {
      await prisma.session.create({
        data: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
      });
      return session;
    },

    async getSessionAndUser(sessionToken: string) {
      const userSession = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });

      if (!userSession) return null;

      const { user, ...session } = userSession;

      return {
        user: {
          id: user.id.toString(),
          email: user.email!,
          name: user.name!,
          emailVerified: null,
          role: user.role
        },
        session: {
          sessionToken: session.sessionToken,
          userId: user.id.toString(),
          expires: session.expires
        }
      };
    },

    async updateSession(session: Partial<AdapterSession> & { sessionToken: string }) {
      const updated = await prisma.session.update({
        where: { sessionToken: session.sessionToken },
        data: {
          expires: session.expires
        },
      });

      return {
        sessionToken: updated.sessionToken,
        userId: updated.userId.toString(),
        expires: updated.expires
      };
    },

    async deleteSession(sessionToken: string) {
      await prisma.session.delete({ where: { sessionToken } });
    }
  };
}