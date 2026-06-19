import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { ensureCatalogSeeded } from "@/lib/auto-seed";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  await ensureCatalogSeeded();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      role: true,
      xp: true,
      level: true,
      currentStreak: true,
      bannedAt: true
    }
  });

  if (!user || user.bannedAt) {
    redirect("/sign-in");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
