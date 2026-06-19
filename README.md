# DSA Mentor AI

DSA Mentor AI is a production-ready LeetCode-style learning platform built with Next.js 15, React, TypeScript, TailwindCSS, ShadCN-style UI primitives, PostgreSQL, Prisma, NextAuth, Monaco Editor, Judge0, and the OpenAI API.

## Features

- Google OAuth and email magic-link authentication with NextAuth.
- Profile page with avatar, XP, level, streaks, achievements, and recent submissions.
- Dashboard with solved count, streaks, weekly activity, topic completion, difficulty stats, XP, and levels.
- Structured DSA roadmap covering Arrays, Strings, Recursion, Sorting, Searching, Linked Lists, Stacks, Queues, Trees, BST, Heaps, Hashing, Greedy, Graphs, Backtracking, Dynamic Programming, and Bit Manipulation.
- AI Teacher Mode for beginner-to-advanced explanations, intuition, visual guidance, mistakes, examples, and next topics.
- AI Problem Generator that creates original judge-ready questions with hidden tests, hints, and editorials.
- LeetCode-style coding workspace with Monaco Editor, C++17, Java 17, Python 3, JavaScript, run, submit, reset, console, runtime, memory, and test results.
- Judge0 integration for code execution.
- AI Code Review after submission with correctness, complexity, mistakes, optimizations, edge cases, and score.
- AI Mock Interview with topic selection, custom prompt, answer evaluation, and hiring recommendation.
- Progress tracking for solved problems, accuracy, time spent, weak topics, strong topics, and generated reports.
- Contest mode with timed contests, participants, leaderboards, rankings, and history.
- Admin panel for users, topics, contests, and analytics.
- Security controls: authenticated routes, admin guards, input sanitization, code-size limits, Judge0 sandboxing, rate limiting, and security headers.

## Quick Start

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Required Services

- PostgreSQL database, locally through Docker or hosted on Supabase.
- Google OAuth client for Google login.
- SMTP credentials for email magic links.
- OpenAI API key for AI teacher mode, problem generation, code review, and mock interviews.
- Judge0 API endpoint and key for code execution.

## Project Structure

```text
src/app                Next.js App Router pages and API routes
src/components         App components and ShadCN-style UI primitives
src/lib                Auth, Prisma, OpenAI, Judge0, reports, security, roadmap data
src/types              NextAuth module augmentation
prisma                 Prisma schema, migration, and seed data
docs                   Installation, deployment, Supabase, and API guides
```

## Core Commands

```bash
npm run dev              # local development
npm run build            # production build
npm run start            # start production server
npm run lint             # lint source
npm run typecheck        # TypeScript check
npm run prisma:migrate   # create and apply local migration
npm run prisma:deploy    # apply migrations in production
npm run db:seed          # seed roadmap, problems, achievements, contest
```

## Deployment

Use Vercel for the Next.js app and Supabase for PostgreSQL. See [Deployment Guide](docs/deployment.md) and [Supabase Setup](docs/supabase.md).

## API Reference

See [API Documentation](docs/api.md).
