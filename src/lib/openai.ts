import { env, requireEnv } from "@/lib/env";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function openAIJson<T>(messages: ChatMessage[], temperature = 0.35): Promise<T> {
  const config = env();
  const apiKey = requireEnv("OPENAI_API_KEY");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.OPENAI_MODEL,
      temperature,
      response_format: { type: "json_object" },
      messages
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${text.slice(0, 500)}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error("OpenAI returned invalid JSON.");
  }
}

export type TeacherLesson = {
  beginner: string;
  intermediate: string;
  advanced: string;
  intuition: string;
  visualExplanation: string;
  commonMistakes: string[];
  examples: string[];
  nextTopics: string[];
};

export async function generateTeacherLesson(input: {
  topicTitle: string;
  theory: string;
  notes: string;
  visualGuide: string;
  nextTopics: string[];
}) {
  return openAIJson<TeacherLesson>([
    {
      role: "system",
      content:
        "You are DSA Mentor AI, a precise teacher. Return only JSON with beginner, intermediate, advanced, intuition, visualExplanation, commonMistakes, examples, and nextTopics."
    },
    {
      role: "user",
      content: `Teach ${input.topicTitle}. Base material:\nTheory: ${input.theory}\nNotes: ${input.notes}\nVisual guide: ${input.visualGuide}\nSuggested next topics: ${input.nextTopics.join(", ")}`
    }
  ]);
}

export type GeneratedProblem = {
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string[];
  problemStatement: string;
  constraints: string[];
  examples: { input: string; output: string; explanation: string }[];
  hiddenTestCases: { input: string; expectedOutput: string }[];
  expectedComplexity: string;
  hints: string[];
  editorial: string;
};

export async function generateOriginalProblem(input: {
  topic: string;
  difficulty: string;
  avoidTitles: string[];
}) {
  return openAIJson<GeneratedProblem>([
    {
      role: "system",
      content:
        "Generate original programming problems for a judge. Never copy known platform wording. Return strict JSON with title, difficulty, tags, problemStatement, constraints, examples, hiddenTestCases, expectedComplexity, hints, editorial. Inputs and outputs must be plain stdin/stdout strings."
    },
    {
      role: "user",
      content: `Topic: ${input.topic}\nDifficulty: ${input.difficulty}\nAvoid titles: ${input.avoidTitles.join(", ")}\nCreate one original DSA problem with 2 sample examples and at least 5 hidden test cases.`
    }
  ]);
}

export type CodeReview = {
  correctness: string;
  complexity: string;
  mistakes: string[];
  optimizations: string[];
  edgeCases: string[];
  score: number;
  summary: string;
};

export async function reviewCode(input: {
  title: string;
  statement: string;
  language: string;
  sourceCode: string;
  status: string;
  passedTests: number;
  totalTests: number;
  expectedComplexity: string;
}) {
  return openAIJson<CodeReview>([
    {
      role: "system",
      content:
        "You are an expert coding interviewer. Return only JSON with correctness, complexity, mistakes, optimizations, edgeCases, score, summary. Be specific, constructive, and concise."
    },
    {
      role: "user",
      content:
        `Problem: ${input.title}\nStatement: ${input.statement}\nExpected complexity: ${input.expectedComplexity}\n` +
        `Language: ${input.language}\nJudge status: ${input.status}; passed ${input.passedTests}/${input.totalTests}\nCode:\n${input.sourceCode.slice(0, 12000)}`
    }
  ], 0.2);
}

export type InterviewQuestion = {
  title: string;
  prompt: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  constraints: string[];
  examples: { input: string; output: string; explanation: string }[];
  followUps: string[];
};

export async function startInterviewQuestion(topic: string) {
  return openAIJson<InterviewQuestion>([
    {
      role: "system",
      content:
        "You are a senior interviewer. Return strict JSON with title, prompt, difficulty, constraints, examples, followUps. The problem must be original."
    },
    {
      role: "user",
      content: `Ask one interview-style coding question about ${topic}. Keep it solvable in 35 minutes.`
    }
  ]);
}

export type InterviewEvaluation = {
  correctness: string;
  communication: string;
  complexity: string;
  edgeCases: string[];
  score: number;
  hiringRecommendation: "STRONG_NO" | "NO" | "LEAN_NO" | "LEAN_YES" | "YES" | "STRONG_YES";
  nextPractice: string[];
};

export async function evaluateInterview(input: {
  question: unknown;
  answer: string;
}) {
  return openAIJson<InterviewEvaluation>([
    {
      role: "system",
      content:
        "You are a fair mock interview evaluator. Return strict JSON with correctness, communication, complexity, edgeCases, score, hiringRecommendation, nextPractice."
    },
    {
      role: "user",
      content: `Question JSON:\n${JSON.stringify(input.question)}\n\nCandidate solution:\n${input.answer.slice(0, 12000)}`
    }
  ], 0.2);
}
