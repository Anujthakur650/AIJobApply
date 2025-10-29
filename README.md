# AIJobApply Automation Platform

AIJobApply is a production-focused platform that automates the end-to-end job search lifecycle across leading job boards. It orchestrates resilient multi-site scraping, intelligent matching, adaptive application submissions, and full-funnel analytics while enforcing security, compliance, and observability from day one.

## Feature Highlights

- **Multi-site job intelligence** – Distributed Playwright scrapers with proxy rotation, CAPTCHA solving, and configurable retry policies capture structured job insights from LinkedIn, Indeed, Glassdoor, RemoteOK, and more.
- **AI-powered matching** – Semantic scoring blends vector embeddings, domain skills, experience, location, and salary signals to rank opportunities per candidate preferences.
- **Application automation** – Fuzzy field detection, profile-to-form mapping, resume uploads, and confirmation tracking deliver automated submissions across direct apply, email, and external workflows.
- **Campaign operations** – BullMQ queues coordinate rate-limited, prioritized, and recoverable campaigns with configurable daily limits and diversity controls.
- **Content generation** – Cover letter generation, resume optimization, and profile enrichment use OpenAI/Anthropic providers with deterministic templates as fallbacks.
- **Analytics & insights** – Real-time dashboards, funnel metrics, and predictive signals surface campaign performance, response velocity, and ROI outcomes.
- **Communications hub** – Email, SMS, and Slack notifications update users on key milestones, with IMAP-ready hooks for bidirectional email response tracking.
- **Compliance & security** – GDPR/CCPA-aligned consent tracking, encryption-ready storage, and guardrails for responsible automation baked into shared libraries.

## Architecture Overview

| Layer                | Description |
| -------------------- | ----------- |
| **Next.js App Router** | Modern React UI, API routes for match scoring, cover-letter generation, and analytics summarisation. |
| **Prisma ORM**          | Postgres schema covers users, profiles, campaigns, job postings, applications, notifications, analytics, and automation tasks. |
| **BullMQ + Redis**      | Queue provider module provisions named queues and workers for scraping, matching, application, notification, and analytics workloads. |
| **Content Services**    | AI-backed generation with templated fallbacks, profile optimization heuristics, and embedding upserts to vector DBs. |
| **Integrations**        | Twilio, SendGrid, Slack, OpenAI, Anthropic, Pinecone, AWS S3, PostHog, and Sentry ready for drop-in configuration. |

## Project Structure

```
src/
  app/
    api/
      analytics/summary/route.ts   # Analytics aggregation endpoint
      cover-letter/route.ts        # Cover letter generation endpoint
      matching/route.ts            # Match score endpoint
    globals.css                    # Tailwind design tokens + theming
    layout.tsx                     # Application shell metadata
    page.tsx                       # Marketing + capability overview
  lib/
    analytics/metrics.ts           # Funnel metrics + rates
    applications/                  # Automation engine + status tracker
    campaigns/campaignService.ts   # Campaign orchestration helpers
    config/env.ts                  # Zod-validated environment loader
    content/                       # Cover letter + profile optimisation
    db/prisma.ts                   # Prisma client singleton
    files/storage.ts               # S3/R2 storage utilities
    matching/                      # Semantic scoring + embeddings
    notifications/dispatcher.ts    # Email/SMS/Slack notifications
    observability/instrumentation.ts # Sentry + PostHog wiring
    queue/queueProvider.ts         # Redis-backed queue factory
    scraping/                      # Scraper types, registry, LinkedIn stub
    security/compliance.ts         # Consent + sanitisation helpers
prisma/
  schema.prisma                    # Comprehensive relational schema
  prisma.config.ts                 # Prisma CLI configuration
```

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env` and provide credentials for Postgres, Redis, storage, and external providers.
   - Required at minimum: `DATABASE_URL`, `REDIS_URL`, and secrets for any integrations you intend to exercise.

3. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to explore the UI and API endpoints:
   - `POST /api/matching` – compute suitability score for a job/profile pair.
   - `POST /api/cover-letter` – generate a contextualized cover letter.
   - `POST /api/analytics/summary` – derive funnel metrics from application logs.

## Queue & Background Jobs

The queue factory in `src/lib/queue/queueProvider.ts` provisions named queues (`scraping`, `matching`, `applications`, `notifications`, `analytics`) backed by Redis. Workers can be registered with custom processors and concurrency settings, enabling:

- Distributed scraping pipelines using Playwright and rotating proxies.
- Intelligent job matching, prioritization, and campaign scheduling.
- Automated application submissions with resiliency and retry logic.
- Notification fan-out across email, SMS, and Slack channels.

## Data Model Essentials

The Prisma schema models the platform holistically:

- **User & Profile** – role-based access, preference structures, experiences, and education history.
- **Skills & Resumes** – taxonomy-aligned skills with proficiency scoring and resume version history.
- **Job Postings & Matches** – normalized job data, match breakdowns, and campaign-ready linking.
- **Campaigns & Jobs** – orchestrated application flows with prioritisation and scheduling metadata.
- **Applications & Events** – submission lifecycle tracking, cover letter linkage, and response events.
- **Notifications & Integrations** – communication preferences and channel integrations.
- **Analytics & Automation Tasks** – roll-up metrics and queue-bound work items.

## Observability & Compliance

- **Observability** – Optional Sentry (`SENTRY_DSN`) and PostHog (`POSTHOG_API_KEY`) integrations capture errors and product analytics via `observability/instrumentation` helpers.
- **Compliance** – Consent validation and data sanitisation utilities offer GDPR/CCPA safeguards, while notification dispatchers respect opt-in channels.

## Next Steps

- Connect additional scrapers by registering new `JobBoardScraper` implementations with `scraperRegistry`.
- Implement BullMQ workers for scraping, matching, application processing, and analytics.
- Extend the UI with authenticated dashboards (NextAuth.js) and real-time performance visualizations.
- Add IMAP/SMTP listeners for inbound email response classification and calendar scheduling integrations.

> ⚠️ Many external integrations require credentials before they can execute. The code paths guard against missing configuration and fall back to safe no-op behaviour until fully wired to production infrastructure.
