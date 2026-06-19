# Deployment Guide

## Architecture

- Vercel hosts the Next.js frontend, API routes, and scheduled report cron.
- Supabase hosts PostgreSQL.
- Prisma manages schema and migrations.
- Judge0 executes submitted code in an isolated judge service.
- OpenAI powers teaching, generation, reviews, and interview evaluation.

## Vercel Setup

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set the framework preset to Next.js.
4. Add environment variables from `.env.example`.
5. Set the production `NEXTAUTH_URL` and `APP_URL` to the Vercel domain.
6. Set `DATABASE_URL` to the Supabase pooled connection string for runtime.
7. Set a direct database URL locally when creating migrations.

Vercel uses `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

## Production Migration

Run migrations before or during deployment:

```bash
npm run prisma:deploy
```

Seed once after the first migration:

```bash
npm run db:seed
```

## Google OAuth

Set these redirect URIs in Google Cloud:

```text
http://localhost:3000/api/auth/callback/google
https://dsa-mentor-ai.vercel.app/api/auth/callback/google
```

## Email Login

Use an SMTP provider that supports authenticated sending. The email provider is enabled when these variables are present:

```text
EMAIL_SERVER_HOST
EMAIL_SERVER_PORT
EMAIL_SERVER_USER
EMAIL_SERVER_PASSWORD
EMAIL_FROM
```

## Judge0

For RapidAPI Judge0:

```text
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=...
```

For self-hosted Judge0, set `JUDGE0_API_URL` to your endpoint and omit RapidAPI variables if your deployment does not require them.

## Cron Reports

The daily report cron calls `/api/reports/cron/daily`. Set `CRON_SECRET` and configure Vercel Cron to include:

```text
Authorization: Bearer <CRON_SECRET>
```

## Docker Deployment

```bash
docker compose up --build
```

The app container runs migrations before starting the Next.js standalone server.
