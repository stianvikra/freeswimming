# Platform Architecture Stack Practice Audit - 2026-05-05

## Scope And Method

This audit is a read-only architecture inventory for the app-wide 10/10 stack-practice gate. It covers `app/`, `components/`, `lib/`, `supabase/`, `tests/`, and operational docs at commit `41bec46`.

Evidence commands used:

- `rg --files app components lib | rg '\.(ts|tsx)$' | xargs wc -l | sort -nr | head -n 40`
- `rg --files app | rg '(page|layout|route)\.(ts|tsx)$'`
- `rg -n "use client" app components lib`
- `rg -n "create.*Supabase|createAdminSupabaseClient|auth\.getUser|from\(" app components lib tests`
- `rg -n "create policy|alter table .* enable row level security|service_role|auth.uid|grant" supabase/migrations`
- `find tests/unit -type f`, `find tests/e2e -maxdepth 1 -type f -name '*.spec.ts'`

No runtime behavior, migrations, styles, user-facing labels, Help/Guide content, or dependencies are changed by this audit.

## Release-Safety Verdict

The current architecture is release-safe under the existing gates. No immediate P0 security, data-integrity, production-availability, or rollback blocker was found in this audit.

The app should not claim app-wide strict 10/10 architecture yet. The remaining gaps are concentration and drift risks rather than active production blockers:

1. Workout/session domain logic is still concentrated in very large shared and editor files.
2. Admin content and notes workflows have mature behavior, but large client managers still mix orchestration, fetch state, editing state, and rendering.
3. Supabase auth/cache discipline is materially improved after the egress work, but route-level data-access contracts should be registered before more API growth.
4. External-service contracts exist for Stripe, Resend, analytics, QR/export, and future AI surfaces, but one service matrix should own idempotency, retry, diagnostic, and launch-readiness expectations.

## Inventory Snapshot

| Surface                        | Evidence                                                           |
| ------------------------------ | ------------------------------------------------------------------ |
| App route handlers             | `69` `app/**/route.ts` files                                       |
| App pages                      | `31` `app/**/page.tsx` files                                       |
| Client modules                 | `67` `use client` modules across `app/`, `components/`, and `lib/` |
| Supabase migrations            | `32` SQL migration files                                           |
| Unit/component tests           | `173` files in `tests/unit`                                        |
| E2E specs                      | `37` top-level Playwright specs in `tests/e2e`                     |
| Largest TS/TSX concentration   | `lib/workouts/shared.ts` at `6157` lines                           |
| Largest UI concentration       | `components/my-library/workouts/WorkoutEditor.tsx` at `4808` lines |
| Largest admin UI concentration | `components/admin/AdminContentManager.tsx` at `4610` lines         |

Top concentration points:

| File                                                    | Lines  | Audit decision                                                                                                                                                                     |
| ------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/workouts/shared.ts`                                | `6157` | P1 decomposition brief: split canonical workout schema/normalization, step grouping, readiness/export, and display adapter helpers without changing persisted semantics in one PR. |
| `components/my-library/workouts/WorkoutEditor.tsx`      | `4808` | P1 decomposition brief: keep manual builder as reference surface, but extract orchestration/view-model boundaries before more session-step surfaces are added.                     |
| `components/admin/AdminContentManager.tsx`              | `4610` | P1 decomposition brief: split admin content fetch/mutation state, editor panels, status/revision controls, and course-structure orchestration.                                     |
| `app/course/page.tsx`                                   | `3259` | P2 route hardening: mature but route-heavy client page; keep public/progress sync boundaries explicit.                                                                             |
| `components/admin/AdminNotesManager.tsx`                | `2535` | P1 admin decomposition brief: keep notes workflow behavior, extract upload/link/edit state boundaries.                                                                             |
| `components/my-library/profile/AthleteProfileHub.tsx`   | `2384` | P2 profile module split only when profile/capability work resumes.                                                                                                                 |
| `components/my-library/training/TrainingContextHub.tsx` | `1985` | P2 training-context split only when history/adaptive coaching work resumes.                                                                                                        |
| `lib/session-generator-v1/server.ts`                    | `1663` | P1 workout/AI contract alignment: keep generated drafts pinned to canonical workout validation and session-step display contract.                                                  |

## Domain And Reference Surface Matrix

| Domain                            | Current source of truth                                                                  | Mature reference surface                                                                                                                                                               | Status                                                                                                                     | Follow-up                                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Swim session/workout steps        | `lib/workouts/shared.ts`, `lib/workouts/server.ts`, `lib/session-generator-v1/shared.ts` | Manual pool builder in `WorkoutEditor`; shared renderer in `components/my-library/workouts/SessionStepSurfaceRenderer.tsx`; contract in `docs/design/session-step-surface-contract.md` | Strong behavior, high concentration risk                                                                                   | `docs/task-briefs/planned/2026-05-05-workout-domain-contract-decomposition-10-10.md`                         |
| Program builder/export            | `lib/programs/shared.ts`, `lib/programs/server.ts`, `lib/programs/export.ts`             | `ProgramBuilderHub` plus program PDF/Garmin export tests                                                                                                                               | Foundation is coherent; future calendar/history work must not fork planner identity                                        | `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md` remains the feature owner |
| AI session generator              | `lib/session-generator-v1/*`, `components/my-library/generator/*`, generator route tests | Generator intake and session-step shared renderer                                                                                                                                      | V1 is bounded; future provider/service decisions need explicit matrix                                                      | Workout decomposition plus external-service contract follow-up                                               |
| My Library profile/goals/training | `lib/athlete-profile/*`, `lib/goals/*`, `lib/training-context/*`                         | Hub components with route API tests                                                                                                                                                    | Release-safe; large hubs should be split when those areas resume                                                           | Defer to next profile/history feature slice                                                                  |
| Admin content/editorial           | `lib/admin/content*`, admin content route tests, `AdminContentManager`                   | Admin workspace, content manager, content parity E2E                                                                                                                                   | Mature and well tested; component size is the main drift risk                                                              | `docs/task-briefs/in-progress/2026-05-05-admin-workspace-contract-decomposition-10-10.md`                    |
| Admin notes/support capture       | `lib/admin/notes*`, `AdminNotesManager`, `AdminContextNotesPanel`                        | Notes workflow E2E and recovery runbook                                                                                                                                                | Mature workflow; upload/link/storage state should be isolated before further additions                                     | Admin workspace decomposition brief                                                                          |
| Supabase/auth/data access         | `lib/supabase/*`, route helpers, migrations, RLS policies                                | Recent egress containment/auth-cookie helper work                                                                                                                                      | Stronger after PRs `#598`, `#600`, `#603`; route registry needed to prevent drift across `69` route handlers               | `docs/task-briefs/planned/2026-05-05-data-access-authz-cache-contract-registry-10-10.md`                     |
| Stripe/commerce                   | `lib/stripe/*`, `lib/commerce/*`, checkout/portal/webhook routes                         | Checkout Session + webhook fulfillment tests, finance reconciliation checklist                                                                                                         | Uses Stripe-hosted Checkout style and signature verification; matrix should lock idempotency/retry/diagnostic expectations | `docs/task-briefs/planned/2026-05-05-external-service-contract-observability-hardening-10-10.md`             |
| Resend/contact/download resend    | Contact and download resend API routes                                                   | Contact security E2E, download resend unit coverage                                                                                                                                    | Release-safe; retry/rate-limit/support diagnostics should be in one service matrix                                         | External-service contract brief                                                                              |
| Analytics                         | `lib/analytics/events.ts`, `/api/analytics/event`                                        | First-party typed event list and event route tests                                                                                                                                     | Good typed baseline; future feature slices should avoid route-local event names                                            | External-service contract brief                                                                              |

## Stack Surface Assessment

### React And Next.js

Pass with follow-up. App Router boundaries are clear: pages load data, API routes mutate, shared domain helpers live under `lib/`, and common UI primitives live under `components/ui`. The primary weakness is component size and client orchestration density in `WorkoutEditor`, `AdminContentManager`, `AdminNotesManager`, and `app/course/page.tsx`.

Required pattern for future UI work: identify the mature reference surface first, adapt data into its contract, and extract view-model/renderer contracts before copying UI markup.

### TypeScript And Domain Contracts

Pass with follow-up. The repo has typed domain modules for workouts, programs, dryland, goals, profile, training context, admin content, QR links, analytics, and Supabase database types. The largest risk is that canonical swim-step behavior spans `lib/workouts/shared.ts`, session-generator helpers, renderer adapters, and export code.

Required pattern: keep validation/normalization server-side, split pure deterministic helpers by responsibility, and pin route/UI adapters to shared contracts.

### Supabase, RLS, And Authz

Pass with monitoring. The migration inventory shows RLS enabled and policy-based ownership/admin checks across core tables. Recent egress work added fail-closed local/test/CI production-Supabase guardrails and auth-cookie-gated anonymous paths. Remaining risk is route-level drift as the API surface grows.

Required pattern: for every new protected route, name whether it is public optional identity, protected user-specific, admin/editor, entitlement, or service-role repair; include no-cookie and unauthorized negative tests.

### External Services

Pass with follow-up. Stripe uses the official SDK and webhook signature verification in app code; the current payment shape aligns with the Checkout Sessions preference for one-time web checkout. Resend calls are server-side with env-bound configuration and rate limits. QR, export, and analytics are first-party contracts. Future AI-provider work is intentionally not implemented yet.

Required pattern: every external service route needs a service-owner matrix entry covering official SDK/docs baseline, secret boundary, idempotency, retry/backoff, webhook/signature verification where relevant, redacted diagnostics, rollback/disable behavior, and finance/support implications.

### UI System And Accessibility

Pass with follow-up. UI primitives and reference contracts exist, especially for session-step rendering. E2E coverage includes accessibility and navigation checks. Visual regression is still capture-oriented rather than baseline-diff-oriented.

Required pattern: visual changes need `after/reference` screenshot handoff when they add or change a surface that represents an existing domain object.

### Testing And DevOps

Pass. The repo has `173` unit/component test files, `37` E2E specs, docs-only and full verification lanes, performance budgets, pre-PR/pre-merge gates, branch-protection docs, and post-merge preflight. Existing test coverage is strong enough for release safety. The next improvement is not more broad tests by default; it is sharper contract tests around extracted shared boundaries.

## Prioritized Findings

### P0 Blockers

None found.

### P1 Follow-Ups

1. Workout domain contract decomposition.
   - Reason: highest line-count concentration and most cross-surface reuse pressure.
   - Owner: `docs/task-briefs/planned/2026-05-05-workout-domain-contract-decomposition-10-10.md`.
   - Gate: no persisted workout semantics change without targeted normalization/export/negative-path tests and screenshot handoff for changed UI.

2. Admin workspace contract decomposition.
   - Reason: large mature admin managers increase drift risk for edit state, recovery, Help/Guide, and support diagnostics.
   - Owner: `docs/task-briefs/in-progress/2026-05-05-admin-workspace-contract-decomposition-10-10.md`.
   - Gate: no admin label/action/recovery change without Help/Guide and runbook impact sweep.

3. Data access authz/cache contract registry.
   - Reason: `69` API route handlers and recent Supabase egress work need a durable route classification registry.
   - Owner: `docs/task-briefs/planned/2026-05-05-data-access-authz-cache-contract-registry-10-10.md`.
   - Gate: protected route changes require no-cookie, unauthorized, forbidden, and cache/freshness evidence.

4. External service contract and observability hardening.
   - Reason: Stripe, Resend, analytics, QR/export, and future AI/provider work should share a service matrix before launch scope grows.
   - Owner: `docs/task-briefs/planned/2026-05-05-external-service-contract-observability-hardening-10-10.md`.
   - Gate: service routes require official SDK/docs baseline, secret handling, idempotency/retry, redacted diagnostics, and rollback/disable notes.

### P2 Watch Items

- `app/course/page.tsx` remains route-heavy, but current progress sync/auth behavior has tests and no urgent split is needed.
- Profile/training hubs should be decomposed when adaptive history/coaching resumes, not as standalone churn.
- Visual baseline assertions remain a testing-scorecard P1 item, but not a blocker for this docs-only audit.
- i18n readiness is acceptable at the architecture-gate level; future locale work remains governed by `docs/decisions/locale-routing-strategy.md` and `docs/decisions/locale-content-fallback-matrix.md`.

## Help, Guide, And Support Impact

N/A for this audit PR because it changes documentation and planned briefs only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery steps, or visible UI.

Future child briefs must run the route/label/support sweep when they change admin/user workflow labels, Help/Guide assertions, support actions, or runbook behavior.

## Validation Plan

Required for this audit PR:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

Because the diff is docs-only, the verification scripts may select the docs-only lane. No screenshot handoff is required.

## 10/10 Architecture Claim

10/10 claim for this audit slice: yes.

Reason: the slice's goal is to produce a measured architecture inventory and child-brief plan, not to complete all child refactors. The audit found no P0 release blocker, documented the remaining 10/10 architecture gaps, and assigned each P1 gap to a scorecard-complete child brief.

App-wide strict 10/10 architecture claim: no.

Reason: strict app-wide 10/10 requires completing the P1 decomposition and contract-registry briefs above.
