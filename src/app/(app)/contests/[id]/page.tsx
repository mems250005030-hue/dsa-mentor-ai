import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function ContestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contest = await prisma.contest.findUnique({
    where: { id },
    include: {
      problems: {
        orderBy: { sortOrder: "asc" },
        include: { problem: { include: { topic: true } } }
      },
      leaderboard: {
        orderBy: { rank: "asc" },
        include: { user: { select: { name: true, email: true, image: true } } }
      }
    }
  });

  if (!contest) notFound();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge>{contest.status}</Badge>
            <Badge variant="outline">{format(contest.startsAt, "PPp")}</Badge>
          </div>
          <CardTitle className="text-2xl">{contest.title}</CardTitle>
          <CardDescription>{contest.description}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Problems</CardTitle>
            <CardDescription>Solve these during the contest window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contest.problems.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="font-medium">{item.problem.title}</p>
                  <p className="text-sm text-muted-foreground">{item.problem.topic.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.points} pts</Badge>
                  <Button asChild size="sm">
                    <Link href={`/problems/${item.problem.slug}`}>Solve</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Rankings update when contest scoring jobs run.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contest.leaderboard.length ? (
              contest.leaderboard.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">#{entry.rank} {entry.user.name ?? entry.user.email}</p>
                    <p className="text-sm text-muted-foreground">{entry.score} points</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No rankings yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
