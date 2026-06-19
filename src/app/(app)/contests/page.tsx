import Link from "next/link";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { JoinContestButton } from "@/components/join-contest-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Contests"
};

export default async function ContestsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id as string;
  const contests = await prisma.contest.findMany({
    orderBy: { startsAt: "asc" },
    include: {
      problems: true,
      participants: { where: { userId } },
      leaderboard: { take: 3, orderBy: { rank: "asc" }, include: { user: { select: { name: true, email: true } } } }
    }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Contest Mode</h1>
        <p className="mt-1 text-muted-foreground">Timed contests with rankings, leaderboards, and contest history.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {contests.map((contest) => (
          <Card key={contest.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{contest.status}</Badge>
                <Badge variant="outline">{contest.problems.length} problems</Badge>
              </div>
              <CardTitle>{contest.title}</CardTitle>
              <CardDescription>{contest.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-md bg-muted p-3">
                  <p className="text-muted-foreground">Starts</p>
                  <p className="font-medium">{format(contest.startsAt, "PPp")}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-muted-foreground">Ends</p>
                  <p className="font-medium">{format(contest.endsAt, "PPp")}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <JoinContestButton contestId={contest.id} joined={contest.participants.length > 0} />
                <Link href={`/contests/${contest.id}`} className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted">
                  View leaderboard
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
