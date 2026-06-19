# Installation Guide

## Prerequisites

- Node.js 20.18 or newer.
- npm 10 or newer.
- PostgreSQL 15 or newer.
- OpenAI API key.
- Judge0 API key or a self-hosted Judge0 endpoint.
- Google OAuth credentials.
- SMTP account for email magic links.

## Local Database

Start PostgreSQL with Docker:

```bash
docker compose up -d postgres
```

Create `.env`:

```bash
cp .env.example .env
```

Update these values:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dsa_mentor_ai?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-in-production-32-bytes"
OPENAI_API_KEY="sk-..."
JUDGE0_API_KEY="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
EMAIL_SERVER_HOST="..."
EMAIL_SERVER_USER="..."
EMAIL_SERVER_PASSWORD="..."
EMAIL_FROM="DSA Mentor AI <no-reply@example.com>"
```

## Install and Migrate

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Create an Admin

Set `ADMIN_EMAILS` in `.env` before the first login:

```bash
ADMIN_EMAILS="admin@example.com"
```

When that email signs in for the first time, the account is promoted to admin automatically.
