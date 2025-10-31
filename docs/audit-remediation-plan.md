# Audit Remediation Plan – Platform Reliability, Usability & Feature Completeness

## Summary
This document translates the audit findings into an actionable roadmap for the AIJobApply preview experience. The plan focuses on stabilizing broken flows, layering onboarding and education, rounding out feature completeness, and addressing compliance/performance gaps. Each task lists the affected surfaces, recommended technical approach (aligned with Next.js 14 App Router, Tailwind CSS, and shadcn/ui primitives), and rollout notes with QA touchpoints.

## Prioritized Backlog

### P0 — Stabilize Critical User Journeys (ship in next release)

1. **Repair navigation & job deep-linking**  
   - **Affected surfaces:** `src/components/layout/site-header.tsx`, `src/app/jobs/page.tsx`, new dynamic route `src/app/jobs/[jobId]/page.tsx`, CTA buttons in `jobListings` cards.  
   - **Solution:** Audit `NAV_ITEMS` and in-page `<Link>` targets; replace placeholders with valid routes. Introduce `/jobs/[jobId]` using Next.js dynamic segments fed by `jobListings` mock IDs. Update "Review autofill" and related buttons to `router.push` into the detail route with query support for sections (e.g., `?tab=autofill`). Ensure deep-link loads corresponding card via routed param.  
   - **QA:** Manual smoke across header/footer links, verify `/jobs/job-1` renders, regression on mobile nav closing on navigation.

2. **Make queued items & follow-ups actionable**  
   - **Affected surfaces:** `src/app/applications/page.tsx`, `src/lib/data/mock-data.ts`, potential new `src/components/applications/action-menu.tsx`.  
   - **Solution:** Extend each application row with an action menu (`DropdownMenu` from shadcn/ui) linking to workflow modals (`Dialog` components) or follow-up scheduling pages. Encode mock `nextStepAction` URLs (`/workflows/:id`) and ensure CTA buttons use `next/link`. Add `aria-label`s for action buttons.  
   - **QA:** Verify actions render for each status, confirm keyboard activation triggers dialogs, ensure non-breaking fallback when data missing.

3. **Improve OAuth error handling & resilience**  
   - **Affected surfaces:** `src/app/auth/page.tsx`, `src/lib/auth.ts`, new helper in `src/lib/auth-errors.ts`.  
   - **Solution:** Wrap `signIn` calls with try/catch, map NextAuth error codes to friendly copy using `toast` from shadcn/sonner. Re-enable Google button once env vars exist; until then, detect missing credentials and show deterministic disabled state with tooltip. Capture provider errors via `NextResponse.redirect` with query `error` parameter and surface banners on load.  
   - **QA:** Unit test `mapAuthError`, manual regression for credential login success/failure, confirm Google attempt without creds yields instructive messaging instead of silent fail.

### P1 — Elevate Onboarding, Guidance & Productivity (next sprint)

4. **Launch first-time user onboarding tour**  
   - **Affected surfaces:** `src/app/dashboard/page.tsx`, `src/components/providers/app-providers.tsx`, new `src/components/onboarding/tour.tsx`, localStorage keys.  
   - **Solution:** Use a client-only tour (e.g., `@reactour/tour` or lightweight custom overlay via shadcn `Dialog` + `Carousel`) lazy-loaded with `next/dynamic`. Trigger when no `hasCompletedTour` flag is set. Steps highlight dashboard metrics, jobs filters, applications table, and settings. Provide "Replay tour" button in header help menu.  
   - **QA:** Multi-device verification (desktop/mobile), ensure focus trapping and ESC/close works, confirm flag prevents repeat.

5. **Add tooltips & inline explanations for technical vocabulary**  
   - **Affected surfaces:** `dashboard/page.tsx`, `jobs/page.tsx`, `applications/page.tsx`, `profile/page.tsx`, `src/components/ui` (add `tooltip.tsx` from shadcn).  
   - **Solution:** Import shadcn Tooltip primitive, wrap metric titles, relevance badges, status chips with definitions. Use `aria-describedby` for screen reader support and keep content concise (<120 chars).  
   - **QA:** Accessibility check for hover/focus parity, ensure tooltips dismiss on scroll/tap in mobile.

6. **Refactor tables & dialogs for mobile responsiveness**  
   - **Affected surfaces:** `applications/page.tsx`, job cards, any future modals.  
   - **Solution:** Convert application table to responsive stack: on `md` breakpoint collapse rows into cards using CSS grid + `data-[state]` attributes; maintain table semantics for desktop. For dialogs, ensure 100% width on small screens, leverage `Dialog` with `sm:max-w-full`.  
   - **QA:** Snapshot testing across breakpoints, manual VoiceOver check to ensure table headers remain associated.

7. **Status export & share capability**  
   - **Affected surfaces:** Applications page CTA, new API route `src/app/api/applications/export/route.ts`.  
   - **Solution:** Provide CSV/JSON export via server action pulling from mock dataset; add "Copy share link" using `navigator.share` fallback. Ensure button shows loading state and success toast.  
   - **QA:** Validate file contents, confirm share fallback in non-supporting browsers, ensure API route returns `Content-Disposition` headers.

8. **Document update toasts & external sync hooks**  
   - **Affected surfaces:** `profile/page.tsx`, new `sync` mock service in `src/lib/integrations/doc-sync.ts`.  
   - **Solution:** Attach "Sync" and "Update" buttons per document row to trigger `toast.success` using Sonner. Mock integration toggles for Google Drive/Notion via settings panel (tie into Task 9). Persist last-sync timestamps in component state for preview realism.  
   - **QA:** Confirm toasts appear once per action, ensure state resets on tab switch, verify keyboard activation.

9. **Expanded Settings granularity**  
   - **Affected surfaces:** `settings/page.tsx`, new subcomponents `notification-preferences.tsx`, `api-keys.tsx`, `integrations-grid.tsx`.  
   - **Solution:** Break page into accordions for notifications (toggle switches from shadcn `Switch`), API key management (mock key generation with `Dialog`), and third-party integrations (Slack, Notion, Google Drive) with status badges. Persist mock state in component-level `useState`.  
   - **QA:** State toggles respond instantly, copy-to-clipboard for keys works, responsive layout validated.

10. **Accessibility & privacy guidance**  
    - **Affected surfaces:** Global layout (`src/app/layout.tsx`), footer (`site-footer.tsx`), page headings.  
    - **Solution:** Audit semantic structure (ensure single `h1` per page). Add skip-to-content link, keyboard-visible focus styles, accessible labels on icon-only buttons. Introduce `/legal/privacy` static page describing privacy posture; link from footer. Provide accessible description for automation metrics referencing data sources.  
    - **QA:** Run Axe DevTools on key pages, manual keyboard nav from header to main content, confirm privacy page reachable.

### P2 — Performance & Parity Enhancements (backlog grooming)

11. **Frontend performance tuning for large datasets**  
    - **Affected surfaces:** Applications table, future modals.  
    - **Solution:** Benchmark current render with synthetic dataset; integrate windowed rendering via `@tanstack/react-table` + `react-virtualized` or lighter `@tanstack/react-virtual`. Defer heavy cards using `next/dynamic` & Suspense boundaries. Ensure fallback skeletons exist.  
    - **QA:** Capture performance traces pre/post, ensure virtualization retains keyboard navigation.

12. **Feature parity & integrations audit**  
    - **Affected surfaces:** Cross-app documentation (new `docs/integration-backlog.md`), Settings integration cards.  
    - **Solution:** Inventory competitor features; create backlog of integrations (ATS imports, calendar sync, CRM). Mark dependencies on external APIs and note placeholders requiring product input.  
    - **QA:** Product sign-off on backlog document, ensure UI toggles correspond to documented roadmap.

## Fixes, Enhancements & API Impact Summary
- **Bug fixes:** Navigation/deep-link repairs, OAuth error surfacing, actionable workflow CTAs.
- **New UX features:** Onboarding tour, contextual tooltips, responsive tables, export/share CTA, document sync toasts, expanded settings, privacy guidance. 
- **Backend/API work:** Introduce mock export route, extend auth handler for error mapping, prepare integration service stubs (doc sync, API key issuance). No database migrations required; ensure environment variables (`GOOGLE_CLIENT_ID/SECRET`) documented.

## Blockers & Dependencies
- Pending availability of Google OAuth credentials to fully enable provider login testing.
- External document sync requires scoped integration design (e.g., Drive/Dropbox API keys) — currently mocked until product finalizes provider list.
- Performance benchmarking depends on realistic dataset size metrics from product/ops to size virtualization thresholds.

## Rollout & QA Strategy
1. **Development cadence:** Ship P0 fixes in the next patch; follow with P1 enhancements in a dedicated sprint; groom P2 items into upcoming roadmap.
2. **QA touchpoints:**
   - Component-level storybook spot checks for new tooltips/modals.
   - Cross-browser manual testing (Chromium, Firefox, Safari) for navigation, exports, and auth flows.
   - Accessibility review using Axe and manual keyboard traversal before release.
   - Smoke tests on mobile breakpoints (iPhone 12, Pixel 7) after responsive refactors.
3. **Release communication:** Update changelog summarizing fixes/enhancements; note new privacy page and onboarding tour in release email. Provide enablement notes for sales/demo teams describing the expanded settings and integrations.

All items above align with the existing Next.js 14 + Tailwind + shadcn/ui stack and can be implemented incrementally without disrupting deployed previews.
