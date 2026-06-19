import type { NextRequest } from "next/server";
import type { ZodSchema } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { jsonError } from "@/lib/security";

export async function parseJson<T>(request: NextRequest, schema: ZodSchema<T>) {
  const payload = await request.json();
  return schema.parse(payload);
}

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json(data, init);
}

export async function guarded(
  request: NextRequest,
  route: string,
  handler: () => Promise<Response>,
  key?: string
) {
  try {
    const limited = await rateLimit(request, route, key);
    if (limited) return limited;
    return await handler();
  } catch (error) {
    return jsonError(error);
  }
}
