import type { NextRequest } from "next/server";
import { z } from "zod";
import { guarded, ok, parseJson } from "@/lib/api";
import { evaluateInterview } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { requireUser, sanitizeCode } from "@/lib/security";

const schema = z.object({
  answer: z.string().min(1).max(50000)
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return guarded(request, "interview-evaluate", async () => {
    const user = await requireUser();
    const input = await parseJson(request, schema);
    const interview = await prisma.mockInterview.findFirstOrThrow({
      where: { id, userId: user.id }
    });
    const answer = sanitizeCode(input.answer, 50000);
    const evaluation = await evaluateInterview({ question: interview.question, answer });
    const updated = await prisma.mockInterview.update({
      where: { id: interview.id },
      data: {
        answer,
        evaluation,
        score: Math.max(0, Math.min(100, evaluation.score)),
        recommendation: evaluation.hiringRecommendation,
        completedAt: new Date()
      }
    });
    return ok({ interview: updated });
  });
}
