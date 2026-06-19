import type { NextRequest } from "next/server";
import { z } from "zod";
import { guarded, ok, parseJson } from "@/lib/api";
import { startInterviewQuestion } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/security";

const schema = z.object({
  topicSlug: z.string().min(1)
});

export async function POST(request: NextRequest) {
  return guarded(request, "interview-start", async () => {
    const user = await requireUser();
    const input = await parseJson(request, schema);
    const topic = await prisma.topic.findUniqueOrThrow({ where: { slug: input.topicSlug } });
    const question = await startInterviewQuestion(topic.title);
    const interview = await prisma.mockInterview.create({
      data: {
        userId: user.id,
        topicId: topic.id,
        question
      }
    });
    return ok({ interview });
  });
}
