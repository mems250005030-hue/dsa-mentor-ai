# API Documentation

All protected endpoints require an authenticated NextAuth session. Admin endpoints require `role = ADMIN`.

## Health

`GET /api/health`

Returns app and database health.

## Auth

`GET|POST /api/auth/[...nextauth]`

NextAuth handler for Google OAuth and email magic links.

## AI Teacher

`POST /api/topics/:slug/teacher`

Generates a structured lesson for a roadmap topic.

Response:

```json
{
  "lesson": {
    "beginner": "...",
    "intermediate": "...",
    "advanced": "...",
    "intuition": "...",
    "visualExplanation": "...",
    "commonMistakes": ["..."],
    "examples": ["..."],
    "nextTopics": ["..."]
  }
}
```

## Problem Generation

`POST /api/problems/generate`

Body:

```json
{
  "topicSlug": "arrays",
  "difficulty": "MEDIUM"
}
```

Creates an original AI-generated problem and stores it in PostgreSQL.

## Run Code

`POST /api/execute`

Runs sample tests only.

Body:

```json
{
  "problemId": "problem_id",
  "language": "PYTHON",
  "sourceCode": "print('ok')"
}
```

Languages: `CPP`, `JAVA`, `PYTHON`, `JAVASCRIPT`.

## Submit Code

`POST /api/submissions`

Runs hidden tests, stores a submission, updates progress, and creates an AI review.

Body:

```json
{
  "problemId": "problem_id",
  "language": "PYTHON",
  "sourceCode": "..."
}
```

Response includes judge status, test results, runtime, memory, and `review`.

## Mock Interview

`POST /api/interview/start`

Body:

```json
{
  "topicSlug": "dynamic-programming"
}
```

`POST /api/interview/:id/evaluate`

Body:

```json
{
  "answer": "Approach, complexity, and code..."
}
```

## Profile

`PATCH /api/profile`

Body:

```json
{
  "name": "Ada Lovelace"
}
```

## Reports

`GET /api/reports?period=WEEKLY`

Periods: `DAILY`, `WEEKLY`, `MONTHLY`.

## Contests

`POST /api/contests/:id/join`

Registers the current user for a contest and creates a leaderboard entry.

## Admin

`GET /api/admin/analytics`

Returns total users, banned users, problems, submissions, accepted submissions, contests, and acceptance rate.

`GET /api/admin/users`

Returns recent users.

`PATCH /api/admin/users`

Body:

```json
{
  "userId": "user_id",
  "action": "BAN"
}
```

Actions: `BAN`, `UNBAN`, `MAKE_ADMIN`, `MAKE_USER`.

`POST /api/admin/topics`

Creates a roadmap topic.

`POST /api/admin/contests`

Creates a contest with selected problem IDs.
