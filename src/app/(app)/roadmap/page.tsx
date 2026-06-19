import { getServerSession } from "next-auth";
import { RoadmapGrid } from "@/components/roadmap-grid";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "DSA Roadmap"
};

export default async function RoadmapPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id as string;
  const topics = await prisma.topic.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      problems: { select: { id: true } },
      quizzes: { select: { id: true } },
      progress: { where: { userId } }
    }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">DSA Roadmap</h1>
        <p className="mt-1 text-muted-foreground">Learn topic-by-topic with theory, notes, quizzes, practice, and AI explanations.</p>
      </div>
      <RoadmapGrid
        topics={topics.map((topic) => ({
          slug: topic.slug,
          title: topic.title,
          description: topic.description,
          sortOrder: topic.sortOrder,
          completion: topic.progress[0]?.completion ?? 0,
          problems: topic.problems.length,
          quizzes: topic.quizzes.length
        }))}
      />
    </div>
  );
}
