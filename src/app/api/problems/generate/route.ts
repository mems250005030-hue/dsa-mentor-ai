import type { NextRequest } from "next/server";
import { z } from "zod";
import { guarded, ok, parseJson } from "@/lib/api";
import { generateOriginalProblem } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { sanitizeText, requireUser } from "@/lib/security";
import { slugify } from "@/lib/utils";

const schema = z.object({
  topicSlug: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"])
});

export async function POST(request: NextRequest) {
  return guarded(request, "problem-generate", async () => {
    const user = await requireUser();
    const input = await parseJson(request, schema);
    const topic = await prisma.topic.findUniqueOrThrow({ where: { slug: input.topicSlug } });
    const existing = await prisma.problem.findMany({
      where: { topicId: topic.id },
      select: { title: true },
      take: 50,
      orderBy: { createdAt: "desc" }
    });

    const generated = await generateOriginalProblem({
      topic: topic.title,
      difficulty: input.difficulty,
      avoidTitles: existing.map((item) => item.title)
    });

    const baseSlug = slugify(generated.title);
    let slug = baseSlug;
    let suffix = 2;
    while (await prisma.problem.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const problem = await prisma.problem.create({
      data: {
        slug,
        title: sanitizeText(generated.title, 120),
        difficulty: generated.difficulty,
        statement: sanitizeText(generated.problemStatement, 8000),
        constraints: generated.constraints.map((item) => sanitizeText(item, 300)),
        examples: generated.examples,
        hiddenTestCases: generated.hiddenTestCases,
        expectedComplexity: sanitizeText(generated.expectedComplexity, 300),
        hints: generated.hints.map((item) => sanitizeText(item, 500)),
        editorial: sanitizeText(generated.editorial, 8000),
        tags: generated.tags.map((item) => sanitizeText(item, 40).toLowerCase()),
        topicId: topic.id,
        createdById: user.id,
        isGenerated: true
      }
    });

    return ok({ problem });
  }, undefined);
}
