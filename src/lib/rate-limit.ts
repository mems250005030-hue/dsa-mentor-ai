import type { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/security";

export async function rateLimit(request: NextRequest, route: string, key?: string) {
  const config = env();
  const windowMs = config.RATE_LIMIT_WINDOW_SECONDS * 1000;
  const max = config.RATE_LIMIT_MAX_REQUESTS;
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);
  const identifier = key ?? getClientIp(request);

  const bucket = await prisma.apiUsage.upsert({
    where: {
      key_route_windowStart: {
        key: identifier,
        route,
        windowStart
      }
    },
    create: {
      key: identifier,
      route,
      windowStart,
      count: 1
    },
    update: {
      count: { increment: 1 }
    }
  });

  if (Math.random() < 0.02) {
    await prisma.apiUsage.deleteMany({
      where: {
        windowStart: {
          lt: new Date(now - windowMs * 24)
        }
      }
    });
  }

  if (bucket.count > max) {
    return Response.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(config.RATE_LIMIT_WINDOW_SECONDS)
        }
      }
    );
  }

  return null;
}
