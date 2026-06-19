import type { NextRequest } from "next/server";
import { generateTeacherLesson } from "@/lib/openai";
import { guarded, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/security";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return guarded(request, "topic-teacher", async () => {
    const user = await requireUser();
    const topic = await prisma.topic.findUniqueOrThrow({ where: { slug } });
    const lesson = await generateTeacherLesson({
      topicTitle: topic.title,
      theory: topic.theory,
      notes: topic.notes,
      visualGuide: topic.visualGuide,
      nextTopics: topic.nextTopics
    });
    await prisma.activityLog.upsert({
      where: { userId_date: { userId: user.id, date: new Date(new Date().setHours(0, 0, 0, 0)) } },
      update: { minutes: { increment: 3 } },
      create: { userId: user.id, date: new Date(new Date().setHours(0, 0, 0, 0)), minutes: 3 }
    });
    return ok({ lesson });
  });
}
