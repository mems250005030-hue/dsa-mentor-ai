import type { NextRequest } from "next/server";
import { z } from "zod";
import { guarded, ok } from "@/lib/api";
import { buildReport } from "@/lib/reports";
import { requireUser } from "@/lib/security";

const periodSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);

export async function GET(request: NextRequest) {
  return guarded(request, "report-read", async () => {
    const user = await requireUser();
    const period = periodSchema.parse(request.nextUrl.searchParams.get("period") ?? "WEEKLY");
    const report = await buildReport(user.id, period);
    return ok({ report });
  });
}
