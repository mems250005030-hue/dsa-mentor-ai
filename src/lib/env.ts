import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(16).optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.coerce.number().default(587),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  JUDGE0_API_URL: z.string().url().default("https://judge0-ce.p.rapidapi.com"),
  JUDGE0_API_KEY: z.string().optional(),
  JUDGE0_RAPIDAPI_HOST: z.string().default("judge0-ce.p.rapidapi.com"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  ADMIN_EMAILS: z.string().default(""),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(80)
});

export function env() {
  return envSchema.parse(process.env);
}

export function requireEnv(name: keyof z.infer<typeof envSchema>) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function adminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}
