# Task Brief: Training Stats And Habits Foundation (10/10)

## Metadata

- `id`: `2026-05-08-training-stats-and-habits-foundation-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-10`

## Goal

Create a safe foundation for `My Perfect Day`, standalone habits, and later training statistics across dryland, Micro Sessions, habits, and swim sessions without coupling the first version to a single UI gimmick.

## Product Decision

Statistics and habits are a separate slice from Micro Sessions Mobile Execution V2. V2 stores enough set-level facts to support later stats, but this brief owns the cross-domain model for `My Perfect Day`, habit check-ins, streak/consistency math, completed sets/reps/sessions, trends, and habit dashboards.

First runtime slice under this brief:

- Ship `My Perfect Day` as an authenticated My Library habits surface.
- Let users define what makes a good day through a small set of personal habits.
- Support positive actions such as sitting in a deep squat, reading, walking stairs, mobility, Micro Sessions, and drinking water.
- Support avoidance or limit habits such as `no sugar today` or `max 1 soda` without shame copy or aggressive streak loss.
- Support habit target types that later statistics can aggregate truthfully:
  - `binary` for yes/no completion,
  - `count` for how many times,
  - `duration` for how many minutes,
  - `time_of_day` for wake/sleep or other time-window habits,
  - `avoidance` for avoided/limited behaviors.
- Store raw daily check-ins separately from derived summaries so later stats can answer minutes, counts, consistency, and which days felt good without rewriting event history.
- Keep AI-generated perfect-day planning, reminders, push/email/SMS, and broad analytics dashboards out of this first slice.
- Optimize for a healthy habit loop: clarity, autonomy, recovery, and positive feedback, not manipulative addiction mechanics.

## Dependencies And Reference Surfaces

- Future data sources:
  - Micro Sessions set-unit completion from `docs/task-briefs/done/2026-05-08-micro-sessions-mobile-execution-v2-10-10.md`
  - Dryland sessions and execution state
  - Swim sessions/workouts
  - Standalone habits defined by this slice
- Current references:
  - `lib/dryland/micro-plans.ts`
  - `lib/dryland/shared.ts`
  - `lib/workouts/shared.ts`
  - `docs/quality/platform-10-10-scorecard.md`
  - `docs/task-briefs/planned/2026-05-07-home-personalization-and-training-reminders-10-10.md`

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Analytics and KPI observability
- Privacy and compliance
- Security and authz
- Reliability and failure handling
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                              | Evidence                                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `My Perfect Day` has a clear job: define and check off personal good-day habits while leaving full stats/dashboards for later.                  | IA map + owner QA + route review                              | `5/5`                   |
| UX flow clarity                               | `target`     | User can create 3-7 habits, check in today, understand week consistency, and recover/reset without shame or dead ends.                          | screenshot handoff + Playwright/component flow                | `5/5`                   |
| Visual design quality                         | `target`     | Habit cards, day score, and weekly summary are calm, scannable, responsive, and consistent with My Library visual language.                     | screenshot handoff                                            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Habit definitions, daily check-ins, target evaluation, skipped/reset days, time windows, and derived summaries are deterministic and auditable. | domain tests + data reconciliation tests                      | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is an authenticated user training-data foundation and does not change admin editor workflows.                                  | explicit scope rationale                                      | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Charts/stats have text equivalents, keyboard access, semantic headings, and do not rely on color alone.                                         | a11y tests + screenshot review                                | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Stats queries are bounded and indexed; UI adds no heavy charting dependency without explicit budget evidence.                                   | query/index review + dependency diff + perf gate              | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Raw completion events, derived summaries, local preferences, and rebuild rules have explicit source-of-truth boundaries.                        | data contract review + tests                                  | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Summaries refresh after completion events and do not display stale weekly/habit state after mutations.                                          | cache review + e2e refresh checks                             | `5/5`                   |
| Reliability and failure handling              | `target`     | Late/offline/duplicate events, timezone edges, and partial-summary rebuild failures are handled without corrupting history.                     | negative-path tests + reconciliation tests                    | `5/5`                   |
| Security and authz                            | `target`     | All stats/habit reads and writes are authenticated, owner-scoped, fail closed, and validated.                                                   | RLS/API negative-path tests                                   | `5/5`                   |
| Privacy and compliance                        | `target`     | Personal training history is minimized, private, export/deletion aware, and safe in logs/events.                                                | privacy review + export/delete impact review                  | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: habit labels and generated summaries need clear ownership, but no admin content publishing workflow is introduced.             | model review                                                  | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD or operator editing workflow is introduced.                                                                           | explicit scope rationale                                      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because stats and habits are authenticated/private and no public metadata, sitemap, robots, or crawlable pages change.                      | explicit scope rationale                                      | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content or structured data is introduced.                                                                 | explicit scope rationale                                      | `N/A`                   |
| Analytics and KPI observability               | `target`     | Raw habit/check-in facts can later answer counts, minutes, consistency, and good-day correlation without storing unnecessary sensitive details. | safe payload/data review + test fixtures                      | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this brief does not change pricing, checkout, subscriptions, entitlements, refunds, payouts, or revenue operations.                 | explicit scope rationale                                      | `N/A`                   |
| Incident response and support operations      | `target`     | Support can diagnose missing stats, rebuild summaries, timezone issues, and duplicate/missing completion events.                                | runbook/help impact + support diagnostics                     | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this training-history slice has no finance, payout, subscription, entitlement, invoice, or reconciliation impact.                   | explicit scope rationale                                      | `N/A`                   |
| i18n operational readiness                    | `target`     | Date/week labels, pluralization, units, and stats copy are designed for later localization without schema rewrites.                             | copy/timezone/unit review                                     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Prefer stack-native typed tables/views/helpers and existing UI primitives; no external analytics/charting service unless justified.             | architecture review + dependency diff                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/integration/API/e2e coverage protects event ingestion, summary derivation, timezone boundaries, authz, and UI states.                      | targeted tests + verify gates                                 | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Event volume and summaries remain bounded, indexed, and rebuildable without high-cost scans on core routes.                                     | index/query plan review + load-shape rationale                | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Migrations, backfill/rebuild, rollback, and recovery commands are documented and safe before launch.                                            | migration/rollback/backfill evidence + pre-pr/pre-merge gates | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - target `/my-library/habits` for the first user-visible `My Perfect Day` surface,
  - add a compact `/my-library` entrypoint under existing training surfaces,
  - reuse My Library shell/card primitives,
  - keep server-side data loading authenticated and owner-scoped.
- TypeScript/domain contracts:
  - define canonical habit definition, check-in, target type, and summary types,
  - define deterministic target evaluation and summary builders for daily and weekly windows,
  - define timezone and unit handling explicitly.
- Supabase/data layer:
  - add explicit migrations for habit definitions and daily check-ins,
  - use RLS and owner-scoped indexes,
  - compute V1 summaries from raw check-ins instead of storing derived summaries,
  - update generated DB types.
- Analytics:
  - first-party event taxonomy comes before external analytics vendors,
  - payloads must be safe and dashboardable.
- UI system:
  - charts must have accessible text equivalents,
  - screenshot handoff is required if any UI ships.
- Testing:
  - summary math tests,
  - timezone boundary tests,
  - authz negative-path tests,
  - e2e for visible stats states,
  - full verification gates.

## Data Placement And Sync Contract

- Server-canonical:
  - habit definitions, daily check-ins, source entity ids when habits later bind to training surfaces, check-in dates, timezone basis, and raw values.
- Local-only:
  - open composer state, unsaved form drafts, selected local date, transient loading/error UI.
- Sync policy:
  - habit definitions and check-ins are server-canonical after successful API writes,
  - V1 summaries are rebuilt deterministically from canonical habit/check-in facts,
  - duplicates are idempotently ignored or merged by stable event id.
- Conflict policy:
  - late events update affected summary windows,
  - manual corrections are explicit and auditable.
- Retention and sensitivity:
  - habit and training history are personal data,
  - nutrition/weight-loss-adjacent labels are user-authored private text and must be minimized in logs,
  - deletion/export behavior must be documented,
  - logs must avoid unnecessary exercise notes/load detail.
- Cache/invalidation:
  - summary views refresh after source mutations and support manual refresh/rebuild diagnostics.

## Identity And Rename Contract

- Canonical stable ID:
  - event id, source entity id, user id, and optional summary id.
- Human-readable identifiers:
  - habit names, exercise names, and session titles are display labels/snapshots.
- Mutability rules:
  - labels can be renamed without changing historical event identity.
- Rename vs repurpose policy:
  - materially different habit/training goal should create a new identity, not repurpose old history.
- Compatibility contract:
  - legacy Micro Sessions V1/V2 data must remain readable or migratable.
- Observability and repair:
  - missing source references degrade to snapshot labels and safe support logs.

## Scope

- Define and implement the first habits data model for `My Perfect Day`.
- Cover dryland, Micro Sessions, standalone habits, and swim sessions at the contract level.
- Build the first user-visible habits surface at `/my-library/habits`.
- Add a My Library entrypoint that summarizes current habit setup/check-in state.
- Support V1 habit creation for `binary`, `count`, `duration`, `time_of_day`, and `avoidance` targets.
- Support daily check-ins and reset/retry behavior for today.
- Show a small weekly summary derived from raw check-ins.
- Include privacy/export/delete and support diagnostics.

## Out Of Scope

- Micro Sessions game/ordered execution UI.
- Push/email/SMS reminders.
- Wearable or Garmin integration.
- Social/leaderboards.
- Commerce or entitlement changes.
- AI-generated perfect-day planning, coaching conclusions, or habit recommendations unless explicitly added later.
- Full charts, correlation analysis, or training-stat dashboards beyond the small V1 habits summary.

## Acceptance Criteria

1. The data model distinguishes habit definitions, raw daily check-ins, and derived summaries.
2. Habit targets can represent binary actions, counts, minutes/duration, time-of-day habits, and avoidance/limit habits.
3. `My Perfect Day` completion and weekly consistency math are deterministic and timezone-aware at the date-boundary level.
4. Duplicate same-day check-ins update the same habit/date record instead of creating ambiguous history.
5. User-visible summaries have accessible text equivalents and do not rely on color alone.
6. Privacy/export/delete impact is documented.
7. Support can diagnose missing/stale habits or check-ins.
8. No external analytics/charting dependency is added without explicit rationale and budget evidence.
9. Copy supports positive habit formation and avoids shame, social pressure, or manipulative streak loss.

## Validation

- `npm run lint:briefs`
- targeted domain tests for habit target and summary math
- targeted API/RLS tests if persistence changes
- targeted Playwright if UI ships
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local seeded data.
- Vercel preview.
- Owner account with real dryland/micro/swim history when available.

## Help / Guide Impact

Required: update support/runbook guidance for the `/my-library/habits` workflow, missing-schema state, check-in reset behavior, and privacy expectations.

## Route / Label / Support Surface Sweep

Run a targeted sweep for `My Perfect Day`, `Perfect Day`, `habits`, `habit`, `streak`, `consistency`, `Micro Sessions`, `Dryland Sessions`, `Swim Sessions`, `history`, `progress`, `/my-library/habits`, and support docs before broad verification.

## Checkpoint Log

- `2026-05-08` - Planned after owner identified the need for rewarding Micro Sessions and broader dryland/micro/habit/swim statistics. Next: keep this separate from Micro Sessions V2 execution so the data model is not rushed.
- `2026-05-10` - Execution started on branch `habits-perfect-day-v1` after owner asked to update and execute end-to-end. First slice is narrowed to `My Perfect Day` and standalone habit foundation: private `/my-library/habits`, habit definitions, daily check-ins, small weekly summary, My Library entrypoint, support docs, tests, screenshot handoff, and full PR gates. Later stats dashboards, AI-generated days, reminders, and correlation analysis remain out of scope. Next: implement V1 with explicit migration/RLS and owner-scoped API routes.
- `2026-05-10` - Base commit `dca72e2` (`docs: close micro sessions bubbles brief (#670)`). Implemented the V1 foundation: Supabase migration/RLS for `habit_definitions` and `habit_check_ins`, typed habit domain helpers, authenticated owner-scoped API routes, `/my-library/habits`, My Library entrypoint, first-party `habits_viewed` event, admin page-note surface, support/runbook updates, and tests for target math, summaries, UI flow, API authz, and help/page-note contracts.
- `2026-05-10` - Route/label/support sweep completed. Identifiers searched: `My Perfect Day`, `Perfect Day`, `habits`, `habit`, `streak`, `consistency`, `Micro Sessions`, `Dryland Sessions`, `Swim Sessions`, `history`, `progress`, and `/my-library/habits`. Surfaces checked: `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, task briefs, My Library entrypoints, Admin Help Center, and page-note support context. Fallout handled in product code, tests, runbooks, Admin Help Center, and the Micro Sessions V2 done brief link. No stale reference to the old planned brief path remains.
- `2026-05-10` - Targeted validation after temporary screenshot preview cleanup: `npm run typecheck` PASS; `npm run lint` PASS; `./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/habits-routes.test.ts tests/unit/page-note-context.test.ts` PASS (4 files, 13 tests); `npm run lint:briefs:all` PASS; `npm exec playwright -- test tests/e2e/my-library-habits.spec.ts tests/e2e/my-library-landing-entrypoints.spec.ts tests/e2e/admin-help-center.spec.ts --project=desktop-chromium` exited 0 with 3 skipped because local dev-login/Supabase returned HTML instead of JSON (`AuthUnknownError: Unexpected token '<'`).
- `2026-05-10` - API failure-mode evidence: habit APIs validate request shape and habit ids before writes, return `401`/`403`/`404`/`409` instead of unexpected 500s for expected authz, ownership, missing-schema, invalid-id, and active-cap failures, and keep unexpected 500 responses limited to unknown server failures. Route tests cover unauthenticated create, invalid habit id before auth, owner-scoped create, and owner-scoped check-in upsert.
- `2026-05-10` - Screenshot handoff captured at `output/habits-perfect-day-v1-2026-05-10-170752` as after/reference evidence. Caveat: local auth bypass was unavailable, so screenshots were captured through a temporary dev-only preview route rendering the same production `HabitPerfectDayHub` component and app CSS with seeded data; the preview route/script were removed before validation. Next: owner screenshot approval before `npm run verify:pre-pr`, commit, push, PR, CI, and `npm run verify:pre-merge`.
- `2026-05-10` - Owner approved screenshot handoff. `npm run verify:pre-pr` full lane PASS after brief evidence cleanup: branch-current PASS, quality-gate PASS, lint/typecheck/unit/build/perf/e2e PASS, with E2E summary 82 passed and 380 skipped because local dev-login/Supabase is unavailable for auth-dependent flows. Perf trend detected 4 consecutive weekly green runs and recommended tightening; decision for this Habits PR is `hold` because this slice does not own global public-route performance budgets, and the tighten prompt should be handled in a dedicated performance-budget follow-up or PR summary rather than mixed into the habits schema/UI change.
