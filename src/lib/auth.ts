import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { adminEmails } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { levelFromXp } from "@/lib/utils";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true
    })
  );
}

if (
  process.env.EMAIL_SERVER_HOST &&
  process.env.EMAIL_SERVER_USER &&
  process.env.EMAIL_SERVER_PASSWORD &&
  process.env.EMAIL_FROM
) {
  providers.push(
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in?verify=1"
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const existing = await prisma.user.findUnique({
        where: { email: user.email },
        select: { bannedAt: true }
      });
      return !existing?.bannedAt;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.xp = user.xp;
        session.user.level = levelFromXp(user.xp);
        session.user.bannedAt = user.bannedAt?.toISOString() ?? null;
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      const email = user.email?.toLowerCase();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: email && adminEmails().has(email) ? "ADMIN" : "USER",
          level: 1
        }
      });
    }
  }
};
