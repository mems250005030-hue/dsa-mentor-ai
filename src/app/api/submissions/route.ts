import type { NextRequest } from "next/server";
import { z } from "zod";
import { guarded, ok, parseJson } from "@/lib/api";
import { runJudge0 } from "@/lib/judge0";
import { reviewCode } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { recordSubmissionResult } from "@/lib/progress";
import { requireUser, sanitizeCode } from "@/lib/security";

const schema = z.object({
  problemId: z.string().min(1),
  language: z.enum(["CPP", "JAVA", "PYTHON", "JAVASCRIPT"]),
  sourceCode: z.string().min(1).max(50000)
});

export async function POST(request: NextRequest) {
  return guarded(request, "submit", async () => {
    const user = await requireUser();
    const input = await parseJson(request, schema);
    const problem = await prisma.problem.findUniqueOrThrow({
      where: { id: input.problemId },
      include: { topic: true }
    });
    const hiddenTests = problem.hiddenTestCases as { input: string; expectedOutput: string }[];
    const sourceCode = sanitizeCode(input.sourceCode, 50000);

    const result = await runJudge0({
      language: input.language,
      sourceCode,
      tests: hiddenTests
    });

    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        problemId: problem.id,
        language: input.language,
        sourceCode,
        status: result.status,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        runtimeMs: result.runtimeMs,
        memoryKb: result.memoryKb,
        score: Math.round((result.passedTests / result.totalTests) * 100),
        stdout: result.stdout,
        stderr: result.stderr,
        compileOutput: result.compileOutput,
        judge0Tokens: result.tokens
      }
    });

    await recordSubmissionResult({
      userId: user.id,
      problemId: problem.id,
      topicId: problem.topicId,
      difficulty: problem.difficulty,
      submissionId: submission.id,
      status: result.status,
      passedTests: result.passedTests,
      totalTests: result.totalTests
    });

    const review = await reviewCode({
      title: problem.title,
      statement: problem.statement,
      expectedComplexity: problem.expectedComplexity,
      language: input.language,
      sourceCode,
      status: result.status,
      passedTests: result.passedTests,
      totalTests: result.totalTests
    });

    const savedReview = await prisma.aIReview.create({
      data: {
        submissionId: submission.id,
        correctness: review.correctness,
        complexity: review.complexity,
        mistakes: review.mistakes,
        optimizations: review.optimizations,
        edgeCases: review.edgeCases,
        score: Math.max(0, Math.min(100, review.score)),
        summary: review.summary
      }
    });

    return ok({
      submissionId: submission.id,
      ...result,
      review: savedReview
    });
  });
}
