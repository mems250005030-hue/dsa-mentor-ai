"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Language } from "@prisma/client";
import { CheckCircle2, Loader2, Play, RotateCcw, Send, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { languageLabels, monacoLanguages, starterCode } from "@/lib/code-templates";

const MonacoPanel = dynamic(() => import("@/components/monaco-panel").then((mod) => mod.MonacoPanel), {
  ssr: false,
  loading: () => <div className="flex min-h-[420px] items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">Loading editor...</div>
});

type Example = { input: string; output: string; explanation: string };
type JudgeResponse = {
  submissionId?: string;
  status: string;
  passedTests: number;
  totalTests: number;
  runtimeMs: number | null;
  memoryKb: number | null;
  stdout: string;
  stderr: string;
  compileOutput: string;
  results: { input: string; expectedOutput: string; actualOutput: string; status: string; passed: boolean; runtimeMs: number | null; memoryKb: number | null }[];
  review?: {
    correctness: string;
    complexity: string;
    mistakes: string[];
    optimizations: string[];
    edgeCases: string[];
    score: number;
    summary: string;
  };
};

export function CodingWorkspace({
  problem
}: {
  problem: {
    id: string;
    title: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    statement: string;
    constraints: string[];
    examples: Example[];
    hints: string[];
    editorial: string;
    expectedComplexity: string;
    tags: string[];
  };
}) {
  const [language, setLanguage] = useState<Language>("PYTHON");
  const [code, setCode] = useState(starterCode.PYTHON);
  const [running, setRunning] = useState<"run" | "submit" | null>(null);
  const [result, setResult] = useState<JudgeResponse | null>(null);
  const [error, setError] = useState("");
  const languageOptions = useMemo(() => Object.entries(languageLabels) as [Language, string][], []);

  function changeLanguage(next: Language) {
    setLanguage(next);
    setCode(starterCode[next]);
  }

  async function execute(mode: "run" | "submit") {
    setRunning(mode);
    setError("");
    try {
      const endpoint = mode === "run" ? "/api/execute" : "/api/submissions";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, language, sourceCode: code })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Execution failed.");
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed.");
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-7rem)] gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant={problem.difficulty === "EASY" ? "easy" : problem.difficulty === "MEDIUM" ? "medium" : "hard"}>
                {problem.difficulty}
              </Badge>
              {problem.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-2xl font-semibold">{problem.title}</h1>
          </div>
          <div className="p-5">
            <Tabs
              tabs={[
                {
                  value: "statement",
                  label: "Problem",
                  content: (
                    <div className="space-y-5">
                      <p className="whitespace-pre-line leading-7 text-muted-foreground">{problem.statement}</p>
                      <div>
                        <h2 className="font-semibold">Examples</h2>
                        <div className="mt-3 space-y-3">
                          {problem.examples.map((example, index) => (
                            <div key={`${example.input}-${index}`} className="rounded-md bg-muted p-3 font-mono text-sm">
                              <p>
                                <span className="font-semibold">Input:</span> {example.input}
                              </p>
                              <p>
                                <span className="font-semibold">Output:</span> {example.output}
                              </p>
                              <p className="mt-2 whitespace-pre-wrap font-sans text-muted-foreground">{example.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h2 className="font-semibold">Constraints</h2>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {problem.constraints.map((constraint) => (
                            <li key={constraint}>{constraint}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                },
                {
                  value: "hints",
                  label: "Hints",
                  content: (
                    <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
                      {problem.hints.map((hint) => (
                        <li key={hint}>{hint}</li>
                      ))}
                    </ol>
                  )
                },
                {
                  value: "editorial",
                  label: "Editorial",
                  content: (
                    <div className="space-y-3 text-muted-foreground">
                      <p className="whitespace-pre-line leading-7">{problem.editorial}</p>
                      <p className="rounded-md bg-muted p-3 text-sm">
                        Expected complexity: <span className="font-medium text-foreground">{problem.expectedComplexity}</span>
                      </p>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex min-h-0 flex-col gap-4">
        <Card className="flex min-h-[520px] flex-1 flex-col">
          <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Select value={language} onChange={(event) => changeLanguage(event.target.value as Language)}>
                {languageOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setCode(starterCode[language])}>
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button variant="secondary" onClick={() => execute("run")} disabled={running !== null}>
                  {running === "run" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Run Code
                </Button>
                <Button onClick={() => execute("submit")} disabled={running !== null}>
                  {running === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <MonacoPanel language={monacoLanguages[language]} value={code} onChange={setCode} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">Console</h2>
              {result ? (
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant={result.status === "ACCEPTED" ? "easy" : "hard"}>{result.status}</Badge>
                  <Badge variant="outline">
                    {result.passedTests}/{result.totalTests} tests
                  </Badge>
                  <Badge variant="outline">{result.runtimeMs ?? 0} ms</Badge>
                  <Badge variant="outline">{result.memoryKb ?? 0} KB</Badge>
                </div>
              ) : null}
            </div>
            {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
            {result ? (
              <div className="space-y-3">
                <div className="grid gap-2 lg:grid-cols-2">
                  {result.results.map((test, index) => (
                    <div key={`${test.input}-${index}`} className="rounded-md border p-3 text-sm">
                      <div className="mb-2 flex items-center gap-2 font-medium">
                        {test.passed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}
                        Test {index + 1}: {test.status}
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">input: {test.input || "(empty)"}</p>
                      <p className="font-mono text-xs text-muted-foreground">expected: {test.expectedOutput || "(empty)"}</p>
                      <p className="font-mono text-xs text-muted-foreground">actual: {test.actualOutput || "(empty)"}</p>
                    </div>
                  ))}
                </div>
                {result.compileOutput || result.stderr ? (
                  <pre className="max-h-40 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">{result.compileOutput || result.stderr}</pre>
                ) : null}
                {result.review ? (
                  <div className="rounded-md border bg-background p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">AI Code Review</h3>
                      <Badge>{result.review.score}/100</Badge>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      <ReviewBlock title="Correctness" body={result.review.correctness} />
                      <ReviewBlock title="Complexity" body={result.review.complexity} />
                      <ReviewList title="Mistakes" items={result.review.mistakes} />
                      <ReviewList title="Optimizations" items={result.review.optimizations} />
                      <ReviewList title="Edge Cases" items={result.review.edgeCases} />
                      <ReviewBlock title="Summary" body={result.review.summary} />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Run sample tests or submit against hidden tests to see results, runtime, memory, and AI feedback.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReviewBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function ReviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
