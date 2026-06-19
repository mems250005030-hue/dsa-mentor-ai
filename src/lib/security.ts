import sanitizeHtml from "sanitize-html";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export function sanitizeText(value: string, maxLength = 10000) {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {}
  })
    .replace(/\u0000/g, "")
    .slice(0, maxLength)
    .trim();
}

export function sanitizeCode(value: string, maxLength = 50000) {
  return value.replace(/\u0000/g, "").slice(0, maxLength);
}

export function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, bannedAt: true, xp: true, level: true, image: true, name: true }
  });

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  if (user.bannedAt) {
    throw new Response("Account is banned", { status: 403 });
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}

export function jsonError(error: unknown) {
  if (error instanceof Response) {
    return Response.json({ error: error.statusText || "Request failed" }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  return Response.json({ error: message }, { status: 500 });
}
