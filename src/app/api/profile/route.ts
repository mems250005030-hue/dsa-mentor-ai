import type { NextRequest } from "next/server";
import { z } from "zod";
import { guarded, ok, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUser, sanitizeText } from "@/lib/security";

const schema = z.object({
  name: z.string().min(1).max(80)
});

export async function PATCH(request: NextRequest) {
  return guarded(request, "profile-update", async () => {
    const user = await requireUser();
    const input = await parseJson(request, schema);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: sanitizeText(input.name, 80) },
      select: { id: true, name: true, email: true, image: true }
    });
    return ok({ user: updated });
  });
}
