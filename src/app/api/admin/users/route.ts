import type { NextRequest } from "next/server";
import { z } from "zod";
import { guarded, ok, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";

const patchSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(["BAN", "UNBAN", "MAKE_ADMIN", "MAKE_USER"])
});

export async function GET(request: NextRequest) {
  return guarded(request, "admin-users-read", async () => {
    await requireAdmin();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        level: true,
        bannedAt: true,
        createdAt: true
      }
    });
    return ok({ users });
  });
}

export async function PATCH(request: NextRequest) {
  return guarded(request, "admin-users-write", async () => {
    const admin = await requireAdmin();
    const input = await parseJson(request, patchSchema);
    if (input.userId === admin.id && input.action !== "MAKE_ADMIN") {
      return Response.json({ error: "You cannot demote or ban your own active admin account." }, { status: 400 });
    }

    const data =
      input.action === "BAN"
        ? { bannedAt: new Date() }
        : input.action === "UNBAN"
          ? { bannedAt: null }
          : input.action === "MAKE_ADMIN"
            ? { role: "ADMIN" as const }
            : { role: "USER" as const };

    const user = await prisma.user.update({
      where: { id: input.userId },
      data,
      select: { id: true, name: true, email: true, role: true, bannedAt: true }
    });
    return ok({ user });
  });
}
