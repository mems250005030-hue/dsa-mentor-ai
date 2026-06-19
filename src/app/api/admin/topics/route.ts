import type { NextRequest } from "next/server";
import { z } from "zod";
import { guarded, ok, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeText } from "@/lib/security";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().min(10).max(500),
  theory: z.string().min(20).max(12000),
  notes: z.string().min(20).max(12000),
  visualGuide: z.string().min(20).max(12000),
  commonMistakes: z.array(z.string().min(2).max(300)).default([]),
  prerequisites: z.array(z.string()).default([]),
  nextTopics: z.array(z.string()).default([])
});

export async function POST(request: NextRequest) {
  return guarded(request, "admin-topics-write", async () => {
    await requireAdmin();
    const input = await parseJson(request, schema);
    const sortOrder = (await prisma.topic.count()) + 1;
    const topic = await prisma.topic.create({
      data: {
        slug: slugify(input.title),
        title: sanitizeText(input.title, 80),
        sortOrder,
        description: sanitizeText(input.description, 500),
        theory: sanitizeText(input.theory, 12000),
        notes: sanitizeText(input.notes, 12000),
        visualGuide: sanitizeText(input.visualGuide, 12000),
        commonMistakes: input.commonMistakes.map((item) => sanitizeText(item, 300)),
        prerequisites: input.prerequisites,
        nextTopics: input.nextTopics
      }
    });
    return ok({ topic }, { status: 201 });
  });
}
