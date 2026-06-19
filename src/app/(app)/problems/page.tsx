import { getServerSession } from "next-auth";
import { ProblemGenerator } from "@/components/problem-generator";
import { ProblemList } from "@/components/problem-list";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Problems"
};

export default async function ProblemsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id as string;
  const [topics, problems, solved] = await Promise.all([
    prisma.topic.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, title: true } }),
    prisma.problem.findMany({
      orderBy: [{ isGenerated: "asc" }, { difficulty: "asc" }, { createdAt: "desc" }],
      include: { topic: { select: { title: true } } }
    }),
    prisma.solvedProblem.findMany({ where: { userId }, select: { problemId: true } })
  ]);

  const solvedIds = new Set(solved.map((item) => item.problemId));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Problems</h1>
        <p className="mt-1 text-muted-foreground">Solve seeded roadmap problems or generate original practice questions with AI.</p>
      </div>
      <ProblemGenerator topics={topics} />
      <ProblemList
        problems={problems.map((problem) => ({
          ...problem,
          difficulty: problem.difficulty,
          acceptanceRate: problem.submissionsCount ? (problem.acceptedCount / problem.submissionsCount) * 100 : problem.acceptanceRate
        }))}
        solvedIds={solvedIds}
      />
    </div>
  );
}
