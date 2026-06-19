import type { Difficulty, Prisma, SubmissionStatus } from "@prisma/client";
import { startOfDay, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { levelFromXp } from "@/lib/utils";

const xpByDifficulty: Record<Difficulty, number> = {
  EASY: 25,
  MEDIUM: 50,
  HARD: 90
};

export async function recordSubmissionResult(input: {
  userId: string;
  problemId: string;
  topicId: string;
  difficulty: Difficulty;
  submissionId: string;
  status: SubmissionStatus;
  passedTests: number;
  totalTests: number;
}) {
  const accepted = input.status === "ACCEPTED";
  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);

  await prisma.$transaction(async (tx) => {
    const alreadySolved = await tx.solvedProblem.findUnique({
      where: { userId_problemId: { userId: input.userId, problemId: input.problemId } }
    });

    if (accepted) {
      await tx.solvedProblem.upsert({
        where: { userId_problemId: { userId: input.userId, problemId: input.problemId } },
        update: { bestSubmissionId: input.submissionId },
        create: {
          userId: input.userId,
          problemId: input.problemId,
          bestSubmissionId: input.submissionId
        }
      });
    }

    const problemUpdate: Prisma.ProblemUpdateInput = {
      submissionsCount: { increment: 1 }
    };
    if (accepted) {
      problemUpdate.acceptedCount = { increment: 1 };
    }
    await tx.problem.update({
      where: { id: input.problemId },
      data: problemUpdate
    });

    const [attempts, solvedCount, topicProblemCount] = await Promise.all([
      tx.submission.count({
        where: { userId: input.userId, problem: { topicId: input.topicId } }
      }),
      tx.solvedProblem.count({
        where: { userId: input.userId, problem: { topicId: input.topicId } }
      }),
      tx.problem.count({ where: { topicId: input.topicId } })
    ]);

    const acceptedSubmissions = await tx.submission.count({
      where: { userId: input.userId, problem: { topicId: input.topicId }, status: "ACCEPTED" }
    });

    await tx.topicProgress.upsert({
      where: { userId_topicId: { userId: input.userId, topicId: input.topicId } },
      update: {
        attempts,
        problemsSolved: solvedCount,
        completion: topicProblemCount ? Math.min(100, (solvedCount / topicProblemCount) * 100) : 0,
        accuracy: attempts ? (acceptedSubmissions / attempts) * 100 : 0,
        strengthScore: attempts ? (solvedCount * 70 + acceptedSubmissions * 30) / Math.max(1, topicProblemCount) : 0
      },
      create: {
        userId: input.userId,
        topicId: input.topicId,
        attempts,
        problemsSolved: solvedCount,
        completion: topicProblemCount ? Math.min(100, (solvedCount / topicProblemCount) * 100) : 0,
        accuracy: attempts ? (acceptedSubmissions / attempts) * 100 : 0,
        strengthScore: attempts ? (solvedCount * 70 + acceptedSubmissions * 30) / Math.max(1, topicProblemCount) : 0
      }
    });

    const xpEarned = accepted && !alreadySolved ? xpByDifficulty[input.difficulty] : 0;
    const user = await tx.user.findUniqueOrThrow({ where: { id: input.userId } });
    const lastActiveDay = user.lastActiveAt ? startOfDay(user.lastActiveAt) : null;
    const continuesStreak = lastActiveDay?.getTime() === yesterday.getTime();
    const sameDay = lastActiveDay?.getTime() === today.getTime();
    const nextStreak = sameDay ? user.currentStreak : continuesStreak ? user.currentStreak + 1 : 1;
    const nextXp = user.xp + xpEarned;

    await tx.user.update({
      where: { id: input.userId },
      data: {
        xp: nextXp,
        level: levelFromXp(nextXp),
        currentStreak: nextStreak,
        longestStreak: Math.max(user.longestStreak, nextStreak),
        lastActiveAt: new Date()
      }
    });

    await tx.activityLog.upsert({
      where: { userId_date: { userId: input.userId, date: today } },
      update: {
        solvedCount: accepted && !alreadySolved ? { increment: 1 } : undefined,
        xpEarned: xpEarned ? { increment: xpEarned } : undefined,
        minutes: { increment: 5 }
      },
      create: {
        userId: input.userId,
        date: today,
        solvedCount: accepted && !alreadySolved ? 1 : 0,
        xpEarned,
        minutes: 5
      }
    });
  });
}
