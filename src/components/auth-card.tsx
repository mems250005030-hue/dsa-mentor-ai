"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuthCard() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const verify = params.get("verify");

  async function handleEmail() {
    setLoading("email");
    await signIn("email", { email, callbackUrl: "/dashboard" });
    setLoading(null);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">DSA Mentor AI</CardTitle>
        <CardDescription>
          {verify ? "Check your inbox for a secure sign-in link." : "Sign in to continue your DSA roadmap, submissions, contests, and AI reviews."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          disabled={loading !== null}
          onClick={() => {
            setLoading("google");
            void signIn("google", { callbackUrl: "/dashboard" });
          }}
        >
          {loading === "google" ? "Opening Google..." : "Continue with Google"}
        </Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="space-y-2">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Button className="w-full" disabled={!email || loading !== null} onClick={handleEmail}>
            <Mail className="h-4 w-4" />
            {loading === "email" ? "Sending link..." : "Email magic link"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
