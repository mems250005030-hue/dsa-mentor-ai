"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JoinContestButton({ contestId, joined }: { contestId: string; joined: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function join() {
    setLoading(true);
    await fetch(`/api/contests/${contestId}/join`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button onClick={join} disabled={loading || joined} variant={joined ? "secondary" : "default"}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
      {joined ? "Joined" : "Join contest"}
    </Button>
  );
}
