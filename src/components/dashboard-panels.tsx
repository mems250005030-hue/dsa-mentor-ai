import Link from "next/link";
import { ArrowRight, CheckCircle2, Flame, Gauge, Target, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  caption
}: {
  label: string;
  value: string | number;
  icon: "solved" | "streak" | "xp" | "accuracy";
  caption: string;
}) {
  const Icon = icon === "solved" ? CheckCircle2 : icon === "streak" ? Flame : icon === "xp" ? Trophy : Target;
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
      </CardContent>
    </Card>
  );
}

export function WeeklyActivityGraph({
  activity
}: {
  activity: { label: string; solvedCount: number; minutes: number }[];
}) {
  const max = Math.max(1, ...activity.map((item) => item.solvedCount));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <CardDescription>Accepted problems and practice time over the last seven days.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-44 items-end gap-2">
          {activity.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end rounded-md bg-muted">
                <div
                  className="w-full rounded-md bg-primary transition-all"
                  style={{ height: `${Math.max(8, (item.solvedCount / max) * 100)}%` }}
                  title={`${item.solvedCount} solved, ${item.minutes} min`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TopicCompletionList({
  topics
}: {
  topics: { slug: string; title: string; completion: number; problemsSolved: number; totalProblems: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Topic Completion</CardTitle>
        <CardDescription>Roadmap progress by topic.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topics.slice(0, 8).map((topic) => (
          <Link key={topic.slug} href={`/roadmap/${topic.slug}`} className="block rounded-md border p-3 transition-colors hover:bg-muted">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{topic.title}</p>
                <p className="text-xs text-muted-foreground">
                  {topic.problemsSolved}/{topic.totalProblems} problems solved
                </p>
              </div>
              <span className="text-sm font-semibold">{formatPercent(topic.completion)}</span>
            </div>
            <Progress value={topic.completion} />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export function DifficultyStats({
  stats
}: {
  stats: { difficulty: string; solved: number; total: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Difficulty Stats</CardTitle>
        <CardDescription>Accepted coverage across the practice bank.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((item) => (
          <div key={item.difficulty} className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant={item.difficulty === "EASY" ? "easy" : item.difficulty === "MEDIUM" ? "medium" : "hard"}>
                {item.difficulty}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {item.solved}/{item.total}
              </span>
            </div>
            <Progress value={item.total ? (item.solved / item.total) * 100 : 0} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function NextActionCard({
  weakTopic
}: {
  weakTopic?: { slug: string; title: string; completion: number } | null;
}) {
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Recommended Focus
        </CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Keep momentum by practicing the lowest-completion topic first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={weakTopic ? `/roadmap/${weakTopic.slug}` : "/roadmap"}
          className="flex items-center justify-between rounded-md bg-white/12 p-4 transition-colors hover:bg-white/18"
        >
          <div>
            <p className="font-semibold">{weakTopic?.title ?? "Start the roadmap"}</p>
            <p className="text-sm text-primary-foreground/80">
              {weakTopic ? `${Math.round(weakTopic.completion)}% complete` : "Choose your first DSA topic"}
            </p>
          </div>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </CardContent>
    </Card>
  );
}
