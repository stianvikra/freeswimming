# Task Brief: Training Stats And Habits Foundation (10/10)

## Metadata

- `id`: `2026-05-08-training-stats-and-habits-foundation-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-08`

## Goal

Create a safe foundation for training statistics and habit tracking across dryland, Micro Sessions, habits, and swim sessions without coupling the first version to a single UI gimmick.

## Product Decision

Statistics and habits are a separate slice from Micro Sessions Mobile Execution V2. V2 should store enough set-level facts to support later stats, but this brief owns the cross-domain model for streaks, weekly consistency, completed sets/reps/sessions, trends, and habit dashboards.

## Dependencies And Reference Surfaces

- Future data sources:
  - Micro Sessions set-unit completion from `docs/task-briefs/planned/2026-05-08-micro-sessions-mobile-execution-v2-10-10.md`
  - Dryland sessions and execution state
  - Swim sessions/workouts
  - Future standalone habits
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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                            | Evidence                                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Stats/habits has a clear job: show consistency, history, and progress across training surfaces without replacing builders or execution flows. | IA map + owner QA + route review                              | `5/5`                   |
| UX flow clarity                               | `target`     | User can understand current week, streak/consistency, recent completions, and next useful action without shame or dead ends.                  | screenshot handoff + Playwright flow                          | `5/5`                   |
| Visual design quality                         | `target`     | Stats cards, trend displays, and habit surfaces are calm, scannable, responsive, and consistent with My Library visual language.              | screenshot handoff                                            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Streaks, weekly consistency, set/reps/session counts, skipped days, time windows, and source events are deterministic and auditable.          | domain tests + data reconciliation tests                      | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is an authenticated user training-data foundation and does not change admin editor workflows.                                | explicit scope rationale                                      | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Charts/stats have text equivalents, keyboard access, semantic headings, and do not rely on color alone.                                       | a11y tests + screenshot review                                | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Stats queries are bounded and indexed; UI adds no heavy charting dependency without explicit budget evidence.                                 | query/index review + dependency diff + perf gate              | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Raw completion events, derived summaries, local preferences, and rebuild rules have explicit source-of-truth boundaries.                      | data contract review + tests                                  | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Summaries refresh after completion events and do not display stale weekly/habit state after mutations.                                        | cache review + e2e refresh checks                             | `5/5`                   |
| Reliability and failure handling              | `target`     | Late/offline/duplicate events, timezone edges, and partial-summary rebuild failures are handled without corrupting history.                   | negative-path tests + reconciliation tests                    | `5/5`                   |
| Security and authz                            | `target`     | All stats/habit reads and writes are authenticated, owner-scoped, fail closed, and validated.                                                 | RLS/API negative-path tests                                   | `5/5`                   |
| Privacy and compliance                        | `target`     | Personal training history is minimized, private, export/deletion aware, and safe in logs/events.                                              | privacy review + export/delete impact review                  | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: habit labels and generated summaries need clear ownership, but no admin content publishing workflow is introduced.           | model review                                                  | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD or operator editing workflow is introduced.                                                                         | explicit scope rationale                                      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because stats and habits are authenticated/private and no public metadata, sitemap, robots, or crawlable pages change.                    | explicit scope rationale                                      | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content or structured data is introduced.                                                               | explicit scope rationale                                      | `N/A`                   |
| Analytics and KPI observability               | `target`     | Event taxonomy and summary model answer consistency questions without collecting unnecessary sensitive details.                               | event taxonomy + safe payload review + test fixtures          | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this brief does not change pricing, checkout, subscriptions, entitlements, refunds, payouts, or revenue operations.               | explicit scope rationale                                      | `N/A`                   |
| Incident response and support operations      | `target`     | Support can diagnose missing stats, rebuild summaries, timezone issues, and duplicate/missing completion events.                              | runbook/help impact + support diagnostics                     | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this training-history slice has no finance, payout, subscription, entitlement, invoice, or reconciliation impact.                 | explicit scope rationale                                      | `N/A`                   |
| i18n operational readiness                    | `target`     | Date/week labels, pluralization, units, and stats copy are designed for later localization without schema rewrites.                           | copy/timezone/unit review                                     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Prefer stack-native typed tables/views/helpers and existing UI primitives; no external analytics/charting service unless justified.           | architecture review + dependency diff                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/integration/API/e2e coverage protects event ingestion, summary derivation, timezone boundaries, authz, and UI states.                    | targeted tests + verify gates                                 | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Event volume and summaries remain bounded, indexed, and rebuildable without high-cost scans on core routes.                                   | index/query plan review + load-shape rationale                | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Migrations, backfill/rebuild, rollback, and recovery commands are documented and safe before launch.                                          | migration/rollback/backfill evidence + pre-pr/pre-merge gates | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - identify the target route before implementation (`/my-library`, `/my-library/dryland`, or a future training dashboard),
  - reuse My Library shell/card primitives,
  - keep server-side data loading authenticated and owner-scoped.
- TypeScript/domain contracts:
  - define canonical event and summary types,
  - define deterministic summary builders for daily, weekly, and rolling windows,
  - define timezone and unit handling explicitly.
- Supabase/data layer:
  - likely requires explicit migrations for events and/or summaries,
  - use RLS and owner-scoped indexes,
  - decide whether derived summaries are stored, computed, or hybrid,
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
  - training completion events, habit events, source entity ids, event timestamps, timezone basis, derived summaries if stored.
- Local-only:
  - dashboard filters, chart range preference, transient loading/error UI.
- Sync policy:
  - source systems write events or canonical completion state,
  - summaries are rebuilt deterministically from canonical source facts,
  - duplicates are idempotently ignored or merged by stable event id.
- Conflict policy:
  - late events update affected summary windows,
  - manual corrections are explicit and auditable.
- Retention and sensitivity:
  - training history is personal data,
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

- Define and implement the first training stats/habits data model.
- Cover dryland, Micro Sessions, future habits, and swim sessions at the contract level.
- Build first user-visible stats/habit surface only if the brief is selected for execution.
- Include privacy/export/delete and support diagnostics.

## Out Of Scope

- Micro Sessions game/ordered execution UI.
- Push/email/SMS reminders.
- Wearable or Garmin integration.
- Social/leaderboards.
- Commerce or entitlement changes.
- AI recommendations or coaching conclusions from stats unless explicitly added later.

## Acceptance Criteria

1. The data model distinguishes raw completion facts from derived summaries.
2. Stats can represent dryland, Micro Sessions, habits, and swim sessions without one-off schemas per feature.
3. Streak/weekly consistency math is deterministic and timezone-safe.
4. Duplicates, late events, skipped work, and corrections are handled explicitly.
5. User-visible stats have accessible text equivalents.
6. Privacy/export/delete impact is documented.
7. Support can diagnose missing or stale stats.
8. No external analytics/charting dependency is added without explicit rationale and budget evidence.

## Validation

- `npm run lint:briefs`
- targeted domain tests for stats/habit math
- targeted API/RLS tests if persistence changes
- targeted Playwright if UI ships
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local seeded data.
- Vercel preview.
- Owner account with real dryland/micro/swim history when available.

## Help / Guide Impact

Required if any user-visible stats/habit workflow, correction path, export/delete expectation, or support recovery behavior ships. Otherwise closeout must include explicit N/A rationale.

## Route / Label / Support Surface Sweep

Run a targeted sweep for `stats`, `habits`, `streak`, `Micro Sessions`, `Dryland Sessions`, `Swim Sessions`, `history`, `progress`, and support docs before broad verification.

## Checkpoint Log

- `2026-05-08` - Planned after owner identified the need for rewarding Micro Sessions and broader dryland/micro/habit/swim statistics. Next: keep this separate from Micro Sessions V2 execution so the data model is not rushed.
