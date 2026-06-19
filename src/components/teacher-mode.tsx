"use client";

import { useState } from "react";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Lesson = {
  beginner: string;
  intermediate: string;
  advanced: string;
  intuition: string;
  visualExplanation: string;
  commonMistakes: string[];
  examples: string[];
  nextTopics: string[];
};

export function TeacherMode({ slug }: { slug: string }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadLesson() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/topics/${slug}/teacher`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to generate lesson.");
      setLesson(payload.lesson);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate lesson.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Teacher Mode
        </CardTitle>
        <CardDescription>Generate a personalized concept walkthrough from beginner to advanced level.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={loadLesson} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {lesson ? "Regenerate lesson" : "Generate AI lesson"}
        </Button>
        {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
        {lesson ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {[
              ["Beginner", lesson.beginner],
              ["Intermediate", lesson.intermediate],
              ["Advanced", lesson.advanced],
              ["Intuition", lesson.intuition],
              ["Visual Explanation", lesson.visualExplanation]
            ].map(([title, body]) => (
              <div key={title} className="rounded-md border bg-background p-4">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
            <div className="rounded-md border bg-background p-4">
              <h3 className="font-semibold">Common Mistakes</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {lesson.commonMistakes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border bg-background p-4">
              <h3 className="font-semibold">Examples</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {lesson.examples.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
