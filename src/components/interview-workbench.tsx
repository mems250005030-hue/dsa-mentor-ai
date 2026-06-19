"use client";

import { useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Interview = {
  id: string;
  question: {
    title: string;
    prompt: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    constraints: string[];
    examples: { input: string; output: string; explanation: string }[];
    followUps: string[];
  };
  evaluation?: {
    correctness: string;
    communication: string;
    complexity: string;
    edgeCases: string[];
    score: number;
    hiringRecommendation: string;
    nextPractice: string[];
  };
};

export function InterviewWorkbench({ topics }: { topics: { slug: string; title: string }[] }) {
  const [topicSlug, setTopicSlug] = useState(topics[0]?.slug ?? "");
  const [interview, setInterview] = useState<Interview | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState<"start" | "evaluate" | null>(null);
  const [error, setError] = useState("");

  async function start() {
    setLoading("start");
    setError("");
    setAnswer("");
    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicSlug })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to start interview.");
      setInterview(payload.interview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start interview.");
    } finally {
      setLoading(null);
    }
  }

  async function evaluate() {
    if (!interview) return;
    setLoading("evaluate");
    setError("");
    try {
      const response = await fetch(`/api/interview/${interview.id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to evaluate answer.");
      setInterview(payload.interview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to evaluate answer.");
    } finally {
      setLoading(null);
    }
  }

  const evaluation = interview?.evaluation;

  return (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Mock Interview
          </CardTitle>
          <CardDescription>Select a topic, solve the prompt, and receive a hiring-style evaluation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={topicSlug} onChange={(event) => setTopicSlug(event.target.value)}>
            {topics.map((topic) => (
              <option key={topic.slug} value={topic.slug}>
                {topic.title}
              </option>
            ))}
          </Select>
          <Button onClick={start} disabled={loading !== null || !topicSlug}>
            {loading === "start" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            Start interview
          </Button>
          {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{interview?.question.title ?? "Interview prompt"}</CardTitle>
          <CardDescription>{interview ? "Write your approach and code, then submit for evaluation." : "Start an interview to receive a custom question."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {interview ? (
            <>
              <div className="space-y-3 rounded-md border p-4">
                <Badge variant={interview.question.difficulty === "EASY" ? "easy" : interview.question.difficulty === "MEDIUM" ? "medium" : "hard"}>
                  {interview.question.difficulty}
                </Badge>
                <p className="whitespace-pre-line leading-7 text-muted-foreground">{interview.question.prompt}</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {interview.question.constraints.map((constraint) => (
                    <li key={constraint}>{constraint}</li>
                  ))}
                </ul>
              </div>
              <Textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                className="min-h-72 font-mono"
                placeholder="Explain your approach, complexity, edge cases, and code."
              />
              <Button onClick={evaluate} disabled={loading !== null || !answer.trim()}>
                {loading === "evaluate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit answer
              </Button>
            </>
          ) : null}

          {evaluation ? (
            <div className="rounded-md border bg-background p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge>{evaluation.score}/100</Badge>
                <Badge variant="outline">{evaluation.hiringRecommendation}</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <EvalBlock title="Correctness" body={evaluation.correctness} />
                <EvalBlock title="Communication" body={evaluation.communication} />
                <EvalBlock title="Complexity" body={evaluation.complexity} />
                <div>
                  <p className="font-medium">Next Practice</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {evaluation.nextPractice.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function EvalBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
