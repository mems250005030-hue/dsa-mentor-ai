import type { NextRequest } from "next/server";
import { z } from "zod";
import { guarded, ok, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUser, sanitizeCode } from "@/lib/security";

const schema = z.object({
  problemId: z.string().min(1),
  language: z.enum(["CPP", "PYTHON"]),
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

    const examples = problem.examples as {
      input: string;
      output: string;
    }[];

    const example = examples[0];

    const language =
      input.language === "CPP"
        ? "cpp"
        : "python";

    const response = await fetch(
      "https://pleasant-product-catalyst-repeat.trycloudflare.com/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          language,
          code: sanitizeCode(input.sourceCode, 50000)
        })
      }
    );

    const data = await response.json();

    return ok({
      status: "ACCEPTED",
      passedTests: 0,
      totalTests: 0,
      runtimeMs: null,
      memoryKb: null,
      stdout: data.output || "",
      stderr: data.error || "",
      compileOutput: "",
      tokens: [],
      results: [
        {
          input: example?.input ?? "",
          expectedOutput: example?.output ?? "",
          actualOutput: data.output || "",
          status: "Executed",
          passed: false,
          runtimeMs: null,
          memoryKb: null
        }
      ]
    });
  });
}