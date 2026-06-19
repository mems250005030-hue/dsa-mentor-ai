"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

export function ProblemGenerator({
  topics
}: {
  topics: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const [topicSlug, setTopicSlug] = useState(topics[0]?.slug ?? "");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/problems/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicSlug, difficulty })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Problem generation failed.");
      router.push(`/problems/${payload.problem.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Problem generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Problem Generator</CardTitle>
        <CardDescription>Create original DSA questions with examples, hidden tests, hints, and editorials.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <Select value={topicSlug} onChange={(event) => setTopicSlug(event.target.value)}>
          {topics.map((topic) => (
            <option key={topic.slug} value={topic.slug}>
              {topic.title}
            </option>
          ))}
        </Select>
        <Select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </Select>
        <Button onClick={generate} disabled={loading || !topicSlug}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate
        </Button>
        {error ? <p className="md:col-span-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
