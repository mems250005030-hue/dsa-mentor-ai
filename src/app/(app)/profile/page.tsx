import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Profile"
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id as string;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      userAchievements: { include: { achievement: true }, orderBy: { unlockedAt: "desc" } },
      submissions: {
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { problem: { select: { title: true, slug: true } } }
      }
    }
  });

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar src={user.image} name={user.name} email={user.email} className="h-16 w-16 text-xl" />
            <div>
              <CardTitle className="text-2xl">{user.name ?? "DSA learner"}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge>Level {user.level}</Badge>
                <Badge variant="outline">{user.xp} XP</Badge>
                <Badge variant="outline">{user.currentStreak} day streak</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm name={user.name} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Unlocked milestones and rewards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.userAchievements.length ? (
              user.userAchievements.map((item) => (
                <div key={item.id} className="rounded-md border p-3">
                  <p className="font-medium">{item.achievement.name}</p>
                  <p className="text-sm text-muted-foreground">{item.achievement.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{format(item.unlockedAt, "PP")}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Solve problems and join contests to unlock achievements.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Latest judge results and scores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.submissions.map((submission) => (
              <div key={submission.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="font-medium">{submission.problem.title}</p>
                  <p className="text-xs text-muted-foreground">{format(submission.createdAt, "PPp")}</p>
                </div>
                <Badge variant={submission.status === "ACCEPTED" ? "easy" : "hard"}>{submission.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
