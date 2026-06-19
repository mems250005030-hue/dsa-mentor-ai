import type { NextRequest } from "next/server";
import { z } from "zod";
import { guarded, ok, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeText } from "@/lib/security";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  problemIds: z.array(z.string()).min(1)
});

export async function POST(request: NextRequest) {
  return guarded(request, "admin-contests-write", async () => {
    await requireAdmin();
    const input = await parseJson(request, schema);
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);
    if (endsAt <= startsAt) {
      return Response.json({ error: "Contest end time must be after start time." }, { status: 400 });
    }
    const contest = await prisma.contest.create({
      data: {
        slug: `${slugify(input.title)}-${Date.now()}`,
        title: sanitizeText(input.title, 120),
        description: sanitizeText(input.description, 2000),
        startsAt,
        endsAt,
        status: startsAt > new Date() ? "UPCOMING" : "LIVE",
        problems: {
          create: input.problemIds.map((problemId, index) => ({
            problemId,
            sortOrder: index + 1,
            points: 100 + index * 100
          }))
        }
      }
    });
    return ok({ contest }, { status: 201 });
  });
}
