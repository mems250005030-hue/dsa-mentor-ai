import type { NextRequest } from "next/server";
import { buildReport } from "@/lib/reports";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({ where: { bannedAt: null }, select: { id: true } });
  for (const user of users) {
    await buildReport(user.id, "DAILY");
  }
  return Response.json({ generated: users.length });
}
