import type { Language, SubmissionStatus } from "@prisma/client";
import { env } from "@/lib/env";

export type JudgeTestCase = {
  input: string;
  expectedOutput: string;
};

export type JudgeResult = {
  status: SubmissionStatus;
  passedTests: number;
  totalTests: number;
  runtimeMs: number | null;
  memoryKb: number | null;
  stdout: string;
  stderr: string;
  compileOutput: string;
  tokens: string[];
  results: {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    status: string;
    passed: boolean;
    runtimeMs: number | null;
    memoryKb: number | null;
  }[];
};

const languageIds: Record<Language, number> = {
  CPP: 54,
  JAVA: 62,
  PYTHON: 71,
  JAVASCRIPT: 63
};

function normalizeOutput(value: string | null | undefined) {
  return (value ?? "").replace(/\r\n/g, "\n").trim();
}

function mapJudgeStatus(statusId: number | undefined): SubmissionStatus {
  if (statusId === 3) return "ACCEPTED";
  if (statusId === 4) return "WRONG_ANSWER";
  if (statusId === 5) return "TIME_LIMIT_EXCEEDED";
  if (statusId === 6) return "COMPILATION_ERROR";
  if (statusId && statusId >= 7 && statusId <= 12) return "RUNTIME_ERROR";
  return "INTERNAL_ERROR";
}

export async function runJudge0(input: {
  language: Language;
  sourceCode: string;
  tests: JudgeTestCase[];
}) {
  if (input.sourceCode.length > 50000) {
    throw new Error("Source code is too large. Limit submissions to 50 KB.");
  }
  if (input.tests.length === 0) {
    throw new Error("No test cases were supplied.");
  }

  const config = env();
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (config.JUDGE0_API_KEY) {
    headers["X-RapidAPI-Key"] = config.JUDGE0_API_KEY;
    headers["X-RapidAPI-Host"] = config.JUDGE0_RAPIDAPI_HOST;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const results = [];
    for (const test of input.tests) {
      const response = await fetch(`${config.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          language_id: languageIds[input.language],
          source_code: input.sourceCode,
          stdin: test.input,
          expected_output: test.expectedOutput,
          cpu_time_limit: 3,
          wall_time_limit: 6,
          memory_limit: 256000,
          enable_network: false
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Judge0 request failed: ${response.status} ${text.slice(0, 300)}`);
      }

      const payload = (await response.json()) as {
        token?: string;
        stdout?: string;
        stderr?: string;
        compile_output?: string;
        time?: string;
        memory?: number;
        status?: { id?: number; description?: string };
      };
      const actualOutput = normalizeOutput(payload.stdout);
      const expectedOutput = normalizeOutput(test.expectedOutput);
      const status = mapJudgeStatus(payload.status?.id);
      const passed = status === "ACCEPTED" && actualOutput === expectedOutput;

      results.push({
        input: test.input,
        expectedOutput,
        actualOutput,
        status: payload.status?.description ?? status,
        passed,
        runtimeMs: payload.time ? Math.round(Number(payload.time) * 1000) : null,
        memoryKb: payload.memory ?? null,
        token: payload.token ?? "",
        stderr: normalizeOutput(payload.stderr),
        compileOutput: normalizeOutput(payload.compile_output)
      });
    }

    const passedTests = results.filter((result) => result.passed).length;
    const firstFailed = results.find((result) => !result.passed);
    const status: SubmissionStatus = passedTests === input.tests.length ? "ACCEPTED" : mapStatusFromResult(firstFailed);
    const runtimeValues = results.map((result) => result.runtimeMs).filter((value): value is number => value !== null);
    const memoryValues = results.map((result) => result.memoryKb).filter((value): value is number => value !== null);

    return {
      status,
      passedTests,
      totalTests: input.tests.length,
      runtimeMs: runtimeValues.length ? Math.max(...runtimeValues) : null,
      memoryKb: memoryValues.length ? Math.max(...memoryValues) : null,
      stdout: results.map((result) => result.actualOutput).join("\n---\n"),
      stderr: results.map((result) => result.stderr).filter(Boolean).join("\n"),
      compileOutput: results.map((result) => result.compileOutput).filter(Boolean).join("\n"),
      tokens: results.map((result) => result.token).filter(Boolean),
      results: results.map(({ token: _token, stderr: _stderr, compileOutput: _compileOutput, ...result }) => result)
    } satisfies JudgeResult;
  } finally {
    clearTimeout(timeout);
  }
}

function mapStatusFromResult(
  result:
    | {
        status: string;
      }
    | undefined
) {
  const status = result?.status.toLowerCase() ?? "";
  if (status.includes("compilation")) return "COMPILATION_ERROR";
  if (status.includes("time")) return "TIME_LIMIT_EXCEEDED";
  if (status.includes("runtime") || status.includes("signal") || status.includes("exit")) return "RUNTIME_ERROR";
  return "WRONG_ANSWER";
}
