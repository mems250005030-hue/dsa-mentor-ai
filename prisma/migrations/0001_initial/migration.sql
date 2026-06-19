CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE "Language" AS ENUM ('CPP', 'JAVA', 'PYTHON', 'JAVASCRIPT');
CREATE TYPE "SubmissionStatus" AS ENUM ('QUEUED', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR', 'INTERNAL_ERROR');
CREATE TYPE "ContestStatus" AS ENUM ('DRAFT', 'UPCOMING', 'LIVE', 'ENDED');
CREATE TYPE "AchievementType" AS ENUM ('STREAK', 'SOLVED', 'CONTEST', 'TOPIC', 'XP');
CREATE TYPE "ReportPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "xp" INTEGER NOT NULL DEFAULT 0,
  "level" INTEGER NOT NULL DEFAULT 1,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "lastActiveAt" TIMESTAMP(3),
  "bannedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Topic" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "theory" TEXT NOT NULL,
  "notes" TEXT NOT NULL,
  "visualGuide" TEXT NOT NULL,
  "commonMistakes" TEXT[] NOT NULL,
  "prerequisites" TEXT[] NOT NULL,
  "nextTopics" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Quiz" (
  "id" TEXT NOT NULL,
  "topicId" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "options" JSONB NOT NULL,
  "answer" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Problem" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "difficulty" "Difficulty" NOT NULL,
  "statement" TEXT NOT NULL,
  "constraints" TEXT[] NOT NULL,
  "examples" JSONB NOT NULL,
  "hiddenTestCases" JSONB NOT NULL,
  "expectedComplexity" TEXT NOT NULL,
  "hints" TEXT[] NOT NULL,
  "editorial" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL,
  "topicId" TEXT NOT NULL,
  "createdById" TEXT,
  "isGenerated" BOOLEAN NOT NULL DEFAULT false,
  "acceptanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "submissionsCount" INTEGER NOT NULL DEFAULT 0,
  "acceptedCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Submission" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "problemId" TEXT NOT NULL,
  "language" "Language" NOT NULL,
  "sourceCode" TEXT NOT NULL,
  "status" "SubmissionStatus" NOT NULL DEFAULT 'QUEUED',
  "passedTests" INTEGER NOT NULL DEFAULT 0,
  "totalTests" INTEGER NOT NULL DEFAULT 0,
  "runtimeMs" INTEGER,
  "memoryKb" INTEGER,
  "score" INTEGER NOT NULL DEFAULT 0,
  "stdout" TEXT,
  "stderr" TEXT,
  "compileOutput" TEXT,
  "judge0Tokens" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIReview" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "correctness" TEXT NOT NULL,
  "complexity" TEXT NOT NULL,
  "mistakes" TEXT[] NOT NULL,
  "optimizations" TEXT[] NOT NULL,
  "edgeCases" TEXT[] NOT NULL,
  "score" INTEGER NOT NULL,
  "summary" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AIReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TopicProgress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "topicId" TEXT NOT NULL,
  "completion" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "problemsSolved" INTEGER NOT NULL DEFAULT 0,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
  "strengthScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TopicProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SolvedProblem" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "problemId" TEXT NOT NULL,
  "bestSubmissionId" TEXT,
  "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
  "solvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SolvedProblem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActivityLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "solvedCount" INTEGER NOT NULL DEFAULT 0,
  "xpEarned" INTEGER NOT NULL DEFAULT 0,
  "minutes" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Achievement" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" "AchievementType" NOT NULL,
  "xpReward" INTEGER NOT NULL,
  "unlockCondition" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserAchievement" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "achievementId" TEXT NOT NULL,
  "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Contest" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "status" "ContestStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContestProblem" (
  "id" TEXT NOT NULL,
  "contestId" TEXT NOT NULL,
  "problemId" TEXT NOT NULL,
  "points" INTEGER NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  CONSTRAINT "ContestProblem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContestParticipant" (
  "id" TEXT NOT NULL,
  "contestId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "penalty" INTEGER NOT NULL DEFAULT 0,
  "rank" INTEGER,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "ContestParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeaderboardEntry" (
  "id" TEXT NOT NULL,
  "contestId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "rank" INTEGER NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "period" "ReportPeriod" NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "data" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MockInterview" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "topicId" TEXT NOT NULL,
  "question" JSONB NOT NULL,
  "answer" TEXT,
  "evaluation" JSONB,
  "recommendation" TEXT,
  "score" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "MockInterview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApiUsage" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_xp_idx" ON "User"("xp");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");
CREATE UNIQUE INDEX "Topic_sortOrder_key" ON "Topic"("sortOrder");
CREATE INDEX "Topic_sortOrder_idx" ON "Topic"("sortOrder");
CREATE INDEX "Quiz_topicId_idx" ON "Quiz"("topicId");
CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");
CREATE INDEX "Problem_topicId_difficulty_idx" ON "Problem"("topicId", "difficulty");
CREATE INDEX "Problem_createdById_idx" ON "Problem"("createdById");
CREATE INDEX "Problem_isGenerated_idx" ON "Problem"("isGenerated");
CREATE INDEX "Submission_userId_createdAt_idx" ON "Submission"("userId", "createdAt");
CREATE INDEX "Submission_problemId_status_idx" ON "Submission"("problemId", "status");
CREATE UNIQUE INDEX "AIReview_submissionId_key" ON "AIReview"("submissionId");
CREATE UNIQUE INDEX "TopicProgress_userId_topicId_key" ON "TopicProgress"("userId", "topicId");
CREATE INDEX "TopicProgress_userId_idx" ON "TopicProgress"("userId");
CREATE UNIQUE INDEX "SolvedProblem_bestSubmissionId_key" ON "SolvedProblem"("bestSubmissionId");
CREATE UNIQUE INDEX "SolvedProblem_userId_problemId_key" ON "SolvedProblem"("userId", "problemId");
CREATE INDEX "SolvedProblem_userId_solvedAt_idx" ON "SolvedProblem"("userId", "solvedAt");
CREATE UNIQUE INDEX "ActivityLog_userId_date_key" ON "ActivityLog"("userId", "date");
CREATE INDEX "ActivityLog_date_idx" ON "ActivityLog"("date");
CREATE UNIQUE INDEX "Achievement_slug_key" ON "Achievement"("slug");
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");
CREATE UNIQUE INDEX "Contest_slug_key" ON "Contest"("slug");
CREATE INDEX "Contest_status_startsAt_idx" ON "Contest"("status", "startsAt");
CREATE UNIQUE INDEX "ContestProblem_contestId_problemId_key" ON "ContestProblem"("contestId", "problemId");
CREATE UNIQUE INDEX "ContestProblem_contestId_sortOrder_key" ON "ContestProblem"("contestId", "sortOrder");
CREATE UNIQUE INDEX "ContestParticipant_contestId_userId_key" ON "ContestParticipant"("contestId", "userId");
CREATE INDEX "ContestParticipant_contestId_score_idx" ON "ContestParticipant"("contestId", "score");
CREATE UNIQUE INDEX "LeaderboardEntry_contestId_userId_key" ON "LeaderboardEntry"("contestId", "userId");
CREATE UNIQUE INDEX "LeaderboardEntry_contestId_rank_key" ON "LeaderboardEntry"("contestId", "rank");
CREATE UNIQUE INDEX "Report_userId_period_startsAt_key" ON "Report"("userId", "period", "startsAt");
CREATE INDEX "Report_userId_period_idx" ON "Report"("userId", "period");
CREATE INDEX "MockInterview_userId_createdAt_idx" ON "MockInterview"("userId", "createdAt");
CREATE UNIQUE INDEX "ApiUsage_key_route_windowStart_key" ON "ApiUsage"("key", "route", "windowStart");
CREATE INDEX "ApiUsage_route_windowStart_idx" ON "ApiUsage"("route", "windowStart");

ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIReview" ADD CONSTRAINT "AIReview_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TopicProgress" ADD CONSTRAINT "TopicProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TopicProgress" ADD CONSTRAINT "TopicProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SolvedProblem" ADD CONSTRAINT "SolvedProblem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SolvedProblem" ADD CONSTRAINT "SolvedProblem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SolvedProblem" ADD CONSTRAINT "SolvedProblem_bestSubmissionId_fkey" FOREIGN KEY ("bestSubmissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContestProblem" ADD CONSTRAINT "ContestProblem_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContestProblem" ADD CONSTRAINT "ContestProblem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContestParticipant" ADD CONSTRAINT "ContestParticipant_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContestParticipant" ADD CONSTRAINT "ContestParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MockInterview" ADD CONSTRAINT "MockInterview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MockInterview" ADD CONSTRAINT "MockInterview_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
