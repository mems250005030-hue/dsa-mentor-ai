import { notFound } from "next/navigation";
import { CodingWorkspace } from "@/components/coding-workspace";
import { prisma } from "@/lib/prisma";

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = await prisma.problem.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      difficulty: true,
      statement: true,
      constraints: true,
      examples: true,
      hints: true,
      editorial: true,
      expectedComplexity: true,
      tags: true
    }
  });

  if (!problem) notFound();

  return (
    <CodingWorkspace
      problem={{
        ...problem,
        examples: problem.examples as { input: string; output: string; explanation: string }[]
      }}
    />
  );
}
