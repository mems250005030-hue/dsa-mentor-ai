import type { NextRequest } from "next/server";
import { z } from "zod";
import { guarded, ok, parseJson } from "@/lib/api";
import { runJudge0 } from "@/lib/judge0";
import { prisma } from "@/lib/prisma";
import { requireUser, sanitizeCode } from "@/lib/security";

const schema = z.object({
  problemId: z.string().min(1),
  language: z.enum(["CPP", "JAVA", "PYTHON", "JAVASCRIPT"]),
  sourceCode: z.string().min(1).max(50000)
});

export async function POST(request: NextRequest) {
  return guarded(request, "execute", async () => {
    await requireUser();
    const input = await parseJson(request, schema);
    const problem = await prisma.problem.findUniqueOrThrow({
      where: { id: input.problemId },
      select: { examples: true }
    });
    const examples = problem.examples as { input: string; output: string }[];
    const result = await runJudge0({
      language: input.language,
      sourceCode: sanitizeCode(input.sourceCode, 50000),
      tests: examples.map((example) => ({ input: example.input, expectedOutput: example.output }))
    });
    return ok(result);
  });
}
