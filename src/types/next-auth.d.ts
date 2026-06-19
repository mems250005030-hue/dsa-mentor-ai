import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      xp: number;
      level: number;
      bannedAt: string | null;
    } & DefaultSession["user"];
  }
}
