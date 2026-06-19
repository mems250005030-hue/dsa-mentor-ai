import Link from "next/link";
import { CheckCircle2, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProblemList({
  problems,
  solvedIds
}: {
  problems: {
    id: string;
    slug: string;
    title: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    tags: string[];
    isGenerated: boolean;
    topic: { title: string };
    acceptanceRate: number;
  }[];
  solvedIds: Set<string>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Problems</CardTitle>
        <CardDescription>Topic-tagged problems with sample and hidden test coverage.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {problems.map((problem) => (
            <Link key={problem.id} href={`/problems/${problem.slug}`} className="grid gap-3 px-5 py-4 transition-colors hover:bg-muted md:grid-cols-[32px_1fr_150px_120px] md:items-center">
              <div className="flex h-8 w-8 items-center justify-center">
                {solvedIds.has(problem.id) ? <CheckCircle2 className="h-5 w-5 text-primary" /> : problem.isGenerated ? <Wand2 className="h-5 w-5 text-amber-600" /> : <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />}
              </div>
              <div>
                <p className="font-medium">{problem.title}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="secondary">{problem.topic.title}</Badge>
                  {problem.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Badge variant={problem.difficulty === "EASY" ? "easy" : problem.difficulty === "MEDIUM" ? "medium" : "hard"} className="w-fit">
                {problem.difficulty}
              </Badge>
              <p className="text-sm text-muted-foreground">{Math.round(problem.acceptanceRate)}% accepted</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
