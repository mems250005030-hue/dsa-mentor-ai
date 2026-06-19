import { prisma } from "@/lib/prisma";

export async function GET() {
  const startedAt = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  return Response.json({
    status: "ok",
    database: "ok",
    latencyMs: Date.now() - startedAt,
    timestamp: new Date().toISOString()
  });
}
