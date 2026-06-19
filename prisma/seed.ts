import { PrismaClient } from "@prisma/client";
import { addDays, addHours, startOfDay } from "date-fns";
import { achievements, roadmapTopics, starterProblems } from "../src/lib/dsa-data";

const prisma = new PrismaClient();

async function main() {
  for (const topic of roadmapTopics) {
    const saved = await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {
        title: topic.title,
        sortOrder: topic.sortOrder,
        description: topic.description,
        theory: topic.theory,
        notes: topic.notes,
        visualGuide: topic.visualGuide,
        commonMistakes: topic.commonMistakes,
        prerequisites: topic.prerequisites,
        nextTopics: topic.nextTopics
      },
      create: {
        slug: topic.slug,
        title: topic.title,
        sortOrder: topic.sortOrder,
        description: topic.description,
        theory: topic.theory,
        notes: topic.notes,
        visualGuide: topic.visualGuide,
        commonMistakes: topic.commonMistakes,
        prerequisites: topic.prerequisites,
        nextTopics: topic.nextTopics
      }
    });

    for (const quiz of topic.quizzes) {
      await prisma.quiz.upsert({
        where: {
          id: `${topic.slug}-${quiz.question.slice(0, 24).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
        },
        update: {
          question: quiz.question,
          options: quiz.options,
          answer: quiz.answer,
          explanation: quiz.explanation,
          topicId: saved.id
        },
        create: {
          id: `${topic.slug}-${quiz.question.slice(0, 24).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          question: quiz.question,
          options: quiz.options,
          answer: quiz.answer,
          explanation: quiz.explanation,
          topicId: saved.id
        }
      });
    }
  }

  for (const problem of starterProblems) {
    const topic = await prisma.topic.findUniqueOrThrow({ where: { slug: problem.topicSlug } });
    await prisma.problem.upsert({
      where: { slug: problem.slug },
      update: {
        title: problem.title,
        difficulty: problem.difficulty,
        statement: problem.statement,
        constraints: problem.constraints,
        examples: problem.examples,
        hiddenTestCases: problem.hiddenTestCases,
        expectedComplexity: problem.expectedComplexity,
        hints: problem.hints,
        editorial: problem.editorial,
        tags: problem.tags,
        topicId: topic.id
      },
      create: {
        slug: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
        statement: problem.statement,
        constraints: problem.constraints,
        examples: problem.examples,
        hiddenTestCases: problem.hiddenTestCases,
        expectedComplexity: problem.expectedComplexity,
        hints: problem.hints,
        editorial: problem.editorial,
        tags: problem.tags,
        topicId: topic.id
      }
    });
  }

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: achievement,
      create: achievement
    });
  }

  const contestProblems = await prisma.problem.findMany({
    where: { slug: { in: ["stable-hill-count", "balanced-label-span", "broken-step-routes"] } },
    orderBy: { difficulty: "asc" }
  });

  const contest = await prisma.contest.upsert({
    where: { slug: "weekly-foundations-sprint" },
    update: {
      title: "Weekly Foundations Sprint",
      description: "A timed practice contest covering arrays, hashing, and dynamic programming fundamentals.",
      startsAt: addDays(startOfDay(new Date()), 2),
      endsAt: addHours(addDays(startOfDay(new Date()), 2), 3),
      status: "UPCOMING"
    },
    create: {
      slug: "weekly-foundations-sprint",
      title: "Weekly Foundations Sprint",
      description: "A timed practice contest covering arrays, hashing, and dynamic programming fundamentals.",
      startsAt: addDays(startOfDay(new Date()), 2),
      endsAt: addHours(addDays(startOfDay(new Date()), 2), 3),
      status: "UPCOMING"
    }
  });

  for (const [index, problem] of contestProblems.entries()) {
    await prisma.contestProblem.upsert({
      where: { contestId_problemId: { contestId: contest.id, problemId: problem.id } },
      update: { sortOrder: index + 1, points: [100, 250, 400][index] ?? 100 },
      create: {
        contestId: contest.id,
        problemId: problem.id,
        sortOrder: index + 1,
        points: [100, 250, 400][index] ?? 100
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
