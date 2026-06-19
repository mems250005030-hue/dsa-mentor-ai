import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function RoadmapGrid({
  topics
}: {
  topics: {
    slug: string;
    title: string;
    description: string;
    sortOrder: number;
    completion: number;
    problems: number;
    quizzes: number;
  }[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {topics.map((topic) => (
        <Link key={topic.slug} href={`/roadmap/${topic.slug}`} className="group">
          <Card className="h-full transition-colors group-hover:border-primary">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline">Step {topic.sortOrder}</Badge>
                  <CardTitle className="mt-3 text-lg">{topic.title}</CardTitle>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="min-h-12 text-sm text-muted-foreground">{topic.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {topic.problems} problems
                </div>
                <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  {topic.quizzes} quizzes
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    Completion
                  </span>
                  <span className="font-medium">{Math.round(topic.completion)}%</span>
                </div>
                <Progress value={topic.completion} />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
