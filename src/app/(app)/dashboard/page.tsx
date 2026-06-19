import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { DifficultyStats, NextActionCard, StatCard, TopicCompletionList, WeeklyActivityGraph } from "@/components/dashboard-panels";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Dashboard"
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id as string;

  const [user, solvedCount, submissionsCount, acceptedCount, activity, topics, totalByDifficulty, solvedProblems] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      prisma.solvedProblem.count({ where: { userId } }),
      prisma.submission.count({ where: { userId } }),
      prisma.submission.count({ where: { userId, status: "ACCEPTED" } }),
      prisma.activityLog.findMany({
        where: {
          userId,
          date: {
            gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { date: "asc" }
      }),
      prisma.topic.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          problems: { select: { id: true } },
          progress: { where: { userId } }
        }
      }),
      prisma.problem.groupBy({
        by: ["difficulty"],
        _count: { difficulty: true }
      }),
      prisma.solvedProblem.findMany({
        where: { userId },
        include: { problem: { select: { difficulty: true } } }
      })
    ]);

  const solvedByDifficulty = solvedProblems.reduce<Record<string, number>>((acc, item) => {
    acc[item.problem.difficulty] = (acc[item.problem.difficulty] ?? 0) + 1;
    return acc;
  }, {});

  const topicRows = topics.map((topic) => {
    const progress = topic.progress[0];
    const completion = progress?.completion ?? 0;
    return {
      slug: topic.slug,
      title: topic.title,
      completion,
      problemsSolved: progress?.problemsSolved ?? 0,
      totalProblems: topic.problems.length
    };
  });

  const activityByDate = new Map(activity.map((item) => [format(item.date, "yyyy-MM-dd"), item]));
  const weekly = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000);
    const key = format(date, "yyyy-MM-dd");
    const item = activityByDate.get(key);
    return {
      label: format(date, "EEE"),
      solvedCount: item?.solvedCount ?? 0,
      minutes: item?.minutes ?? 0
    };
  });

  const difficultyRows = ["EASY", "MEDIUM", "HARD"].map((difficulty) => ({
    difficulty,
    solved: solvedByDifficulty[difficulty] ?? 0,
    total: totalByDifficulty.find((item) => item.difficulty === difficulty)?._count.difficulty ?? 0
  }));

  const weakTopic = topicRows
    .filter((topic) => topic.totalProblems > 0)
    .sort((a, b) => a.completion - b.completion)[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Problems Solved" value={solvedCount} icon="solved" caption="Accepted unique problems" />
        <StatCard label="Current Streak" value={`${user.currentStreak}d`} icon="streak" caption={`Best: ${user.longestStreak} days`} />
        <StatCard label="XP" value={user.xp} icon="xp" caption={`Level ${user.level}`} />
        <StatCard
          label="Accuracy"
          value={`${submissionsCount ? Math.round((acceptedCount / submissionsCount) * 100) : 0}%`}
          icon="accuracy"
          caption={`${acceptedCount}/${submissionsCount} accepted submissions`}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <WeeklyActivityGraph activity={weekly} />
        <NextActionCard weakTopic={weakTopic} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <TopicCompletionList topics={topicRows} />
        <DifficultyStats stats={difficultyRows} />
      </section>
    </div>
  );
}
