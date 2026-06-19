import type { NextRequest } from "next/server";
import { guarded, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/security";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return guarded(request, "contest-join", async () => {
    const user = await requireUser();
    const contest = await prisma.contest.findUniqueOrThrow({ where: { id } });
    const participant = await prisma.contestParticipant.upsert({
      where: { contestId_userId: { contestId: contest.id, userId: user.id } },
      update: {},
      create: { contestId: contest.id, userId: user.id }
    });
    await prisma.leaderboardEntry.upsert({
      where: { contestId_userId: { contestId: contest.id, userId: user.id } },
      update: {},
      create: {
        contestId: contest.id,
        userId: user.id,
        score: participant.score,
        rank: (await prisma.leaderboardEntry.count({ where: { contestId: contest.id } })) + 1
      }
    });
    return ok({ participant });
  });
}
