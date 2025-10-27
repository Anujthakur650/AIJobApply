# ApplyFlow — Automated Job Application Platform

ApplyFlow is a modern, full-stack web application that helps job seekers automate their search, match with relevant opportunities, and orchestrate applications across multiple campaigns. The platform is powered by Next.js 14 with the App Router, Prisma ORM, PostgreSQL, and Tailwind CSS.

## Key capabilities

- **Profile intelligence** – Upload resumes, store multiple documents, track profile completeness, and manage professional preferences.
- **Job discovery** – Aggregate roles across boards, compute relevance scores, and surface the best matches with rich context.
- **Application operations** – Keep a unified timeline of applications, responses, and campaign-level metrics with future hooks for automation.
- **Campaign management** – Segment searches into targeted campaigns, monitor pacing, and prepare batch applications.

## Technology stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, shadcn-inspired UI primitives
- **State & data fetching**: React Query 5, React Hook Form + Zod validation, NextAuth for authentication
- **Backend**: Next.js API routes, Prisma ORM, PostgreSQL
- **Utilities**: bcrypt for password hashing, Radix UI primitives, react-hot-toast

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` (or `.env`) and update the placeholders:

   ```bash
   cp .env.example .env.local
   ```

   Required values:

   - `DATABASE_URL` — PostgreSQL connection string
   - `NEXTAUTH_SECRET` — random string used for session signing
   - `NEXTAUTH_URL` — base URL for the app (e.g., `http://localhost:3000`)

3. **Generate the Prisma client & run migrations**

   ```bash
   npx prisma migrate dev
   ```

4. **(Optional) Seed demo data**

   ```bash
   npm run prisma:seed
   ```

   This creates a demo user (`demo@applyflow.ai` / `Password123!`) and sample job postings/applications.

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Navigate to `http://localhost:3000` to explore the landing page. Sign up for a new account or sign in with the seeded user.

## Project structure

```
app/
  (auth)/...
  (dashboard)/...
  api/...
components/
  dashboard/
  providers/
  ui/
lib/
prisma/
```

- `app/` contains the App Router pages, including the marketing landing page, authentication routes, dashboard workspace, and REST-like API handlers.
- `components/` houses shared UI primitives and layout components.
- `lib/` includes Prisma and NextAuth configuration plus reusable validators/utilities.
- `prisma/` holds the database schema and seed script.

## Available scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run Next.js ESLint checks |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Apply Prisma schema changes |
| `npm run prisma:seed` | Seed the database with demo data |

## Roadmap

- Form auto-fill and automated submission workflows
- Cover letter generation using LLM prompts & structured resume data
- Browser automation workers with rate limiting and anti-detection patterns
- Enhanced analytics (funnels, cohort performance, A/B testing)
- Notifications across email, SMS, and Slack

## Security & compliance

- Authentication by NextAuth with hashed credentials via bcrypt
- Strict API access checks for authenticated routes
- Profile completeness scoring to encourage accurate data
- Document storage bucket ready for S3/R2 integration

## Contributing

1. Create a feature branch from `feat-job-automation-mvp`
2. Make changes aligned with existing code style
3. Ensure linting & TypeScript checks pass
4. Open a pull request for review

---

ApplyFlow is designed to automate the repetitive parts of job hunting while keeping candidates in control. Extend the foundation to integrate additional job boards, automation workers, and advanced analytics as you iterate beyond the MVP. Happy building!
