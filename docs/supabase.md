# Supabase Setup Guide

## Create Project

1. Create a new Supabase project.
2. Choose a region close to your Vercel deployment.
3. Save the database password securely.

## Connection Strings

Use the pooled connection string for serverless runtime:

```text
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

For local migration commands, use the direct connection string from Supabase:

```text
DIRECT_DATABASE_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
```

This project uses only `DATABASE_URL` in `schema.prisma`; run migrations from a trusted local environment with the direct URL assigned to `DATABASE_URL`, then set the pooled URL in Vercel.

## Apply Schema

```bash
DATABASE_URL="<direct-supabase-url>" npm run prisma:deploy
DATABASE_URL="<direct-supabase-url>" npm run db:seed
```

## Operational Notes

- Enable Supabase backups for production.
- Keep connection pooling enabled for Vercel.
- Rotate database credentials after sharing development access.
- Review table growth for `Submission`, `ApiUsage`, and `ActivityLog`.
- Add read replicas when analytics traffic grows.
