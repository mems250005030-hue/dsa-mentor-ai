import type { ReportPeriod } from "@prisma/client";
import { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { prisma } from "@/lib/prisma";

function periodRange(period: ReportPeriod, anchor = new Date()) {
  if (period === "DAILY") {
    return { startsAt: startOfDay(anchor), endsAt: endOfDay(anchor) };
  }
  if (period === "WEEKLY") {
    return { startsAt: startOfWeek(anchor, { weekStartsOn: 1 }), endsAt: endOfWeek(anchor, { weekStartsOn: 1 }) };
  }
  return { startsAt: startOfMonth(anchor), endsAt: endOfMonth(anchor) };
}

export async function buildReport(userId: string, period: ReportPeriod, anchor = new Date()) {
  const { startsAt, endsAt } = periodRange(period, anchor);
  const [activity, submissions, progress] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId, date: { gte: startsAt, lte: endsAt } },
      orderBy: { date: "asc" }
    }),
    prisma.submission.findMany({
      where: { userId, createdAt: { gte: startsAt, lte: endsAt } },
      include: { problem: { include: { topic: true } } }
    }),
    prisma.topicProgress.findMany({
      where: { userId },
      include: { topic: true },
      orderBy: { completion: "asc" }
    })
  ]);

  const solved = submissions.filter((submission) => submission.status === "ACCEPTED").length;
  const attempts = submissions.length;
  const weakTopics = progress.slice(0, 5).map((item) => ({
    title: item.topic.title,
    completion: item.completion,
    accuracy: item.accuracy
  }));
  const strongTopics = [...progress]
    .sort((a, b) => b.strengthScore - a.strengthScore)
    .slice(0, 5)
    .map((item) => ({
      title: item.topic.title,
      completion: item.completion,
      accuracy: item.accuracy
    }));

  const data = {
    solved,
    attempts,
    accuracy: attempts ? Math.round((solved / attempts) * 100) : 0,
    xpEarned: activity.reduce((sum, item) => sum + item.xpEarned, 0),
    minutes: activity.reduce((sum, item) => sum + item.minutes, 0),
    weakTopics,
    strongTopics,
    activity: activity.map((item) => ({
      date: item.date,
      solvedCount: item.solvedCount,
      xpEarned: item.xpEarned,
      minutes: item.minutes
    }))
  };

  return prisma.report.upsert({
    where: { userId_period_startsAt: { userId, period, startsAt } },
    update: { endsAt, data },
    create: { userId, period, startsAt, endsAt, data }
  });
}
