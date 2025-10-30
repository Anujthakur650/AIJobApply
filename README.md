# AIJobApply Preview Experience

This repository bootstraps the Next.js 14 preview of **AIJobApply**, an automated job application copilot. It demonstrates the navigation shell, dashboard summaries, mocked data flows, and authentication powered by NextAuth with a credentials provider. The goal is to provide a lightweight, Vercel-ready experience for validating page structure and design decisions before wiring real data sources.

## Preview Highlights

- ✅ **App Router + TypeScript** — opinionated structure with route-based layouts and metadata.
- ✅ **Tailwind CSS + shadcn/ui** — theming aligned to the AIJobApply palette (deep blue, emerald, grayscale) and Inter font.
- ✅ **NextAuth demo** — credentials provider using an in-memory user, with a Google OAuth placeholder ready once credentials are added.
- ✅ **Mocked datasets** — dashboard metrics, activity feed, job listings, applications, and profile content rendered in-memory.
- ✅ **Reusable UI primitives** — button, card, tabs, tables, avatar, badges, toast notifications, and theme toggles.
- ✅ **Healthcheck endpoint** — `GET /api/health` returns `{ ok: true }` for deployment smoke tests.

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). Navigation is fully wired between the following routes:

| Route | Description |
| --- | --- |
| `/` | Landing page with hero, feature highlights, and CTAs |
| `/auth` | Sign-in/sign-up preview powered by NextAuth credentials |
| `/dashboard` | Metrics, pipeline summary, and recent activity feed |
| `/jobs` | Curated job list with mocked relevance scores and filters |
| `/applications` | Application table showing queued, in-progress, and submitted states |
| `/profile` | Tabbed personal, experience, skill, preference, and document summaries |
| `/settings` | Account & notification placeholders |
| `/api/health` | JSON healthcheck used by CI/CD |

### Demo credentials

Use the following values to exercise authenticated areas (no persistence or database is required):

```
Email: demo@aijobapply.com
Password: password123
```

Google OAuth will become available once `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. Until then, the button is rendered as a disabled placeholder.

## Environment variables

Copy `.env.example` to `.env` and supply values as needed:

| Variable | Required | Description |
| --- | --- | --- |
| `NEXTAUTH_SECRET` | ✅ | Sign your NextAuth JWTs. Generate with `openssl rand -base64 32` for production. |
| `NEXTAUTH_URL` | ✅ | Base URL of the app (e.g. `http://localhost:3000`, or the Vercel domain). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Enable Google OAuth once credentials are available. |
| `DATABASE_URL` | Optional | Placeholder for future persistence. |
| `NEXT_PUBLIC_APP_NAME` | ✅ | Public-facing name used in metadata and UI. |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint checks |
| `npm run typecheck` | Static type analysis with TypeScript |
| `npm run format` | Verify formatting via Prettier |

## Deployment

1. Create a new project in [Vercel](https://vercel.com/import) and link it to this repository/branch.
2. Populate the environment variables listed above in the Vercel dashboard (at minimum `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `NEXT_PUBLIC_APP_NAME`).
3. Trigger a deploy (push to any branch or use the "Deploy" button). Vercel will build the project with `npm run build` and expose a preview URL for each PR along with a production deployment once merged to `main`.
4. Record the generated preview URL in the PR description or here in the README to share access with reviewers.

> ℹ️ A preview deployment becomes available immediately after the repository is linked in Vercel—no further code changes are required.

## CI

A lightweight GitHub Actions workflow (`.github/workflows/ci.yml`) installs dependencies, runs `npm run lint`, `npm run typecheck`, and `npm run build` to ensure pull requests stay healthy.
