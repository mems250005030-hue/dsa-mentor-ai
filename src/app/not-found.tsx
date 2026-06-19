import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>The page you opened does not exist or is no longer available.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
