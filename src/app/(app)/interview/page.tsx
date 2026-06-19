import { InterviewWorkbench } from "@/components/interview-workbench";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Mock Interview"
};

export default async function InterviewPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { sortOrder: "asc" },
    select: { slug: true, title: true }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">AI Mock Interview</h1>
        <p className="mt-1 text-muted-foreground">Practice interview communication, coding, complexity analysis, and edge-case handling.</p>
      </div>
      <InterviewWorkbench topics={topics} />
    </div>
  );
}
