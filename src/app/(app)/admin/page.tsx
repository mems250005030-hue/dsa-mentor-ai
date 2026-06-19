import { format } from "date-fns";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ContestCreateForm, TopicCreateForm, UserAdminActions } from "@/components/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Admin"
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [userCount, users, topics, problems, contests, submissions, accepted] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, email: true, role: true, xp: true, level: true, bannedAt: true, createdAt: true }
    }),
    prisma.topic.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, title: true, slug: true } }),
    prisma.problem.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, title: true } }),
    prisma.contest.findMany({ orderBy: { startsAt: "desc" }, take: 10 }),
    prisma.submission.count(),
    prisma.submission.count({ where: { status: "ACCEPTED" } })
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <p className="mt-1 text-muted-foreground">Manage users, roadmap topics, contests, and platform analytics.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetric label="Users" value={userCount} />
        <AdminMetric label="Topics" value={topics.length} />
        <AdminMetric label="Submissions" value={submissions} />
        <AdminMetric label="Acceptance" value={`${submissions ? Math.round((accepted / submissions) * 100) : 0}%`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>Ban accounts and update roles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="font-medium">{user.name ?? user.email ?? "User"}</p>
                  <p className="text-xs text-muted-foreground">Joined {format(user.createdAt, "PP")} · Level {user.level} · {user.xp} XP</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>{user.role}</Badge>
                    {user.bannedAt ? <Badge variant="hard">BANNED</Badge> : null}
                  </div>
                </div>
                <UserAdminActions userId={user.id} role={user.role} banned={Boolean(user.bannedAt)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Topic</CardTitle>
              <CardDescription>Add a new roadmap topic with theory, notes, and visual guidance.</CardDescription>
            </CardHeader>
            <CardContent>
              <TopicCreateForm />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Create Contest</CardTitle>
              <CardDescription>Schedule a timed contest and attach practice problems.</CardDescription>
            </CardHeader>
            <CardContent>
              <ContestCreateForm problems={problems} />
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Contest History</CardTitle>
          <CardDescription>Recent contests and schedule state.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {contests.map((contest) => (
            <div key={contest.id} className="rounded-md border p-3">
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge>{contest.status}</Badge>
                <Badge variant="outline">{format(contest.startsAt, "PP")}</Badge>
              </div>
              <p className="font-medium">{contest.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{contest.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
