import type { NextRequest } from "next/server";
import { guarded, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";

export async function GET(request: NextRequest) {
  return guarded(request, "admin-analytics", async () => {
    await requireAdmin();
    const [users, bannedUsers, problems, submissions, accepted, contests] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { bannedAt: { not: null } } }),
      prisma.problem.count(),
      prisma.submission.count(),
      prisma.submission.count({ where: { status: "ACCEPTED" } }),
      prisma.contest.count()
    ]);
    return ok({
      users,
      bannedUsers,
      problems,
      submissions,
      accepted,
      contests,
      acceptanceRate: submissions ? Math.round((accepted / submissions) * 100) : 0
    });
  });
}
