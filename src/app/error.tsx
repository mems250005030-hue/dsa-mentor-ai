"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>The request failed. You can retry the page safely.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => reset()}>Retry</Button>
        </CardContent>
      </Card>
    </main>
  );
}
