import { getServerSession } from "next-auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { buildReport } from "@/lib/reports";

export const metadata = {
  title: "Reports"
};

type ReportData = {
  solved: number;
  attempts: number;
  accuracy: number;
  xpEarned: number;
  minutes: number;
  weakTopics: { title: string; completion: number; accuracy: number }[];
  strongTopics: { title: string; completion: number; accuracy: number }[];
  activity: { date: string; solvedCount: number; xpEarned: number; minutes: number }[];
};

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id as string;
  const [daily, weekly, monthly] = await Promise.all([
    buildReport(userId, "DAILY"),
    buildReport(userId, "WEEKLY"),
    buildReport(userId, "MONTHLY")
  ]);

  const reports = [
    { label: "Daily", report: daily },
    { label: "Weekly", report: weekly },
    { label: "Monthly", report: monthly }
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Progress Reports</h1>
        <p className="mt-1 text-muted-foreground">Daily, weekly, and monthly summaries generated from submissions and activity.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {reports.map(({ label, report }) => {
          const data = report.data as ReportData;
          return (
            <Card key={label}>
              <CardHeader>
                <CardTitle>{label} Report</CardTitle>
                <CardDescription>
                  {new Date(report.startsAt).toLocaleDateString()} - {new Date(report.endsAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="Solved" value={data.solved} />
                  <Metric label="Attempts" value={data.attempts} />
                  <Metric label="Accuracy" value={`${data.accuracy}%`} />
                  <Metric label="XP" value={data.xpEarned} />
                </div>
                <div>
                  <p className="mb-2 font-medium">Weak Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {data.weakTopics.length ? data.weakTopics.map((topic) => <Badge key={topic.title} variant="outline">{topic.title}</Badge>) : <span className="text-sm text-muted-foreground">No topic data yet</span>}
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-medium">Strong Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {data.strongTopics.length ? data.strongTopics.map((topic) => <Badge key={topic.title}>{topic.title}</Badge>) : <span className="text-sm text-muted-foreground">Solve more problems to build strengths</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
