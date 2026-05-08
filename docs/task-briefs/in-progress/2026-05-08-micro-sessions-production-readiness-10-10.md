# Task Brief: Micro Sessions Production Readiness (10/10)

## Metadata

- `id`: `2026-05-08-micro-sessions-production-readiness-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-08`

## Goal

Make Micro Sessions V1 usable in the real owner/staging/production environment by proving the `dryland_micro_plans` storage, RLS, API, and UI readiness path end to end.

## Product Decision

This brief must run before Micro Sessions Mobile Execution V2. The current UI exists, but the owner saw the environment-level message `Micro Sessions are still syncing in this environment`, so the next slice must verify the Supabase migration state and remove that warning as the normal user experience.

## Dependencies And Reference Surfaces

- Shipped V1 reference:
  - `docs/task-briefs/done/2026-05-07-micro-sessions-exercise-level-completion-10-10.md`
  - `docs/task-briefs/done/2026-05-08-dryland-library-ia-visual-polish-10-10.md`
- Current runtime surfaces:
  - `components/my-library/dryland/DrylandMicroPlanPanel.tsx`
  - `app/api/my-library/dryland/micro-plans/route.ts`
  - `app/api/my-library/dryland/micro-plans/[planId]/route.ts`
  - `lib/dryland/micro-plans.ts`
  - `supabase/migrations/20260508101500_dryland_micro_plans.sql`

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Incident response and support operations
- DevOps and rollback readiness
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                             | Evidence                                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Micro Sessions is clearly usable from `/my-library/dryland` with start/continue/progress states, not a sync-warning dead end.                  | owner QA + screenshot handoff + route review                | `5/5`                   |
| UX flow clarity                               | `target`     | User can create, complete, skip, undo, pause/resume, and recover from failures with one clear next action.                                     | Playwright flow + component tests                           | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: no redesign, but warning/empty/active/complete states must remain visually consistent with the dryland panel.                 | screenshot handoff                                          | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Plan creation, block update, progress math, status derivation, and idempotent retries are deterministic against the real table contract.       | domain/API tests + real-env smoke evidence                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is a user-facing My Library readiness slice and does not change admin editors or publishing workflows.                        | explicit scope rationale                                    | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Existing controls, warnings, progressbar, and status messages remain labelled, keyboard reachable, and screen-reader understandable.           | Testing Library assertions + Playwright locators            | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Readiness fixes add no heavy dependency, no polling, and keep `/my-library/dryland` within current route budgets.                              | dependency diff + build/perf gate                           | `5/5`                   |
| Data placement and sync boundaries            | `target`     | `dryland_micro_plans` is confirmed server-canonical; local optimistic state, retry, and conflict behavior are documented and verified.         | data-boundary review + API tests                            | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Authenticated micro-plan reads stay fresh after create/update and do not show stale completion after mutation.                                 | route/cache review + e2e refresh check                      | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing table, RLS denial, network failure, duplicate update, and stale plan states degrade predictably without false completion.              | negative-path tests + manual failure QA                     | `5/5`                   |
| Security and authz                            | `target`     | APIs remain authenticated, owner-scoped, fail closed, and reject cross-user source sessions or micro plans.                                    | route negative-path tests + RLS review                      | `5/5`                   |
| Privacy and compliance                        | `target`     | Personal exercise completion data stays private; logs and errors do not expose notes, load details, or user identifiers beyond diagnostics.    | code/log review                                             | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: labels are snapshots from user-authored dryland sessions; no new content workflow is introduced.                              | model review                                                | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, admin CRUD, or operator editing path is changed.                                                                | explicit scope rationale                                    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because Micro Sessions is authenticated/private and no public route metadata, sitemap, or robots behavior changes.                         | explicit scope rationale                                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content, structured data, or crawlable page is introduced.                                               | explicit scope rationale                                    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: readiness may add safe diagnostic logging, but product analytics taxonomy remains for the later stats/habits brief.           | explicit defer note + safe log review                       | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice does not change pricing, checkout, subscriptions, entitlements, refunds, payouts, or revenue operations.                | explicit scope rationale                                    | `N/A`                   |
| Incident response and support operations      | `target`     | Support can distinguish missing migration, RLS denial, API failure, and user-empty state with a documented troubleshooting path.               | runbook/help impact review + support-surface sweep          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, subscription, entitlement, invoice, or reconciliation data changes in this readiness slice.                    | explicit scope rationale                                    | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: changed user-facing status copy must remain structurally localizable, but no translation or locale routing ships here.        | copy review                                                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js, Supabase, TypeScript, Tailwind, Vitest, and Playwright patterns; add no new service or dependency.                       | dependency diff + architecture review                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover real schema readiness, happy path, failure path, authz, and the owner-visible no-sync-warning state.                               | targeted unit/API/e2e + verify gates                        | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Micro plan checks remain bounded to explicit user actions/server reads and do not introduce polling or high-write loops.                       | no-polling evidence + API review                            | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Migration state, RLS, deployment order, rollback, and environment verification are documented before the feature is considered production-use. | migration evidence + rollback note + pre-pr/pre-merge gates | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `DrylandMicroPlanPanel` and existing `/my-library/dryland` server data loading,
  - keep interactive state in the client component,
  - do not add a top-level Micro Sessions route in this readiness slice.
- TypeScript/domain contracts:
  - keep `DrylandMicroPlanRecord` and status helpers as canonical contracts,
  - verify plan status/progress invariants against the actual API payload shape.
- Supabase/data layer:
  - verify `supabase/migrations/20260508101500_dryland_micro_plans.sql` is applied where the owner tests,
  - confirm RLS policies fail closed and allow only owner-scoped reads/writes,
  - update generated DB types only if schema drift is found.
- UI system:
  - keep the current dryland visual language,
  - screenshot handoff is required for empty/sync, ready-empty, active, partial, and complete states.
- Testing:
  - unit/API coverage for missing table, owner-scope denial, start/update, duplicate update, and stale state,
  - Playwright or deterministic mocked browser flow for visible readiness states,
  - full pre-PR and pre-merge gates.

## Data Placement And Sync Contract

- Server-canonical:
  - `dryland_micro_plans` rows, block snapshots, block statuses, plan status, week window, and timestamps.
- Local-only:
  - temporary optimistic button state and transient message state.
- Sync policy:
  - explicit user actions create/update the server row,
  - failed writes restore last confirmed state or show retryable failure,
  - no background polling.
- Conflict policy:
  - existing active plan wins over a new start request,
  - source dryland session edits do not mutate active micro plans.
- Retention and sensitivity:
  - personal training completion data stays authenticated and owner-scoped,
  - support logs must not leak raw notes or unnecessary exercise details.
- Cache/invalidation:
  - authenticated reads stay dynamic or are explicitly refreshed after mutation.

## Identity And Rename Contract

- Canonical stable ID:
  - `dryland_micro_plans.id` and each block id in the plan snapshot.
- Human-readable identifiers:
  - plan title and block labels are display snapshots, not identity.
- Mutability rules:
  - source session rename does not rewrite an active plan unless an explicit future refresh action is implemented.
- Rename vs repurpose policy:
  - create a new plan when the weekly training intent changes materially.
- Compatibility contract:
  - existing exercise-level blocks remain readable until a later V2 migration changes the unit model.
- Observability and repair:
  - missing table/RLS/schema drift errors must be support-diagnosable without exposing secrets.

## Scope

- Verify and repair Micro Sessions V1 production readiness.
- Confirm `dryland_micro_plans` migration, RLS, API behavior, and generated types.
- Replace the sync-warning-as-normal-state with ready empty/start/continue behavior once schema is available.
- Add or update tests and support docs for readiness and failure modes.

## Out Of Scope

- Set-based completion units.
- Ordered mode set-pills.
- Game mode floating buttons.
- Habit streaks, stats dashboards, or analytics dashboards.
- Push/email/SMS/calendar/wearable reminders.
- Any new top-level route.

## Acceptance Criteria

1. Owner test environment no longer shows `Micro Sessions are still syncing` when the migration is correctly applied.
2. A signed-in user can start a micro plan from a saved dryland session.
3. The same user can complete, skip, undo, pause/resume, and see correct progress.
4. Another user's session/plan cannot be read or mutated.
5. Missing migration/RLS/network failure states are clear, retryable, and support-diagnosable.
6. Existing dryland sessions remain usable if Micro Sessions is temporarily unavailable.
7. Screenshot handoff covers mobile and desktop readiness states.

## Validation

- `npm run lint:briefs`
- targeted Vitest for `lib/dryland/micro-plans`, routes, and panel
- targeted Playwright for `/my-library/dryland` readiness flow
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local dev with migration applied.
- Owner/staging Supabase environment where the sync warning was observed.
- Vercel preview after PR.

## Help / Guide Impact

Update relevant support docs if the user-visible sync warning, troubleshooting path, or recovery behavior changes. If no copy/support path changes, closeout must state the explicit N/A rationale.

## Route / Label / Support Surface Sweep

Run the targeted sweep for `Micro Sessions`, `dryland_micro_plans`, `/my-library/dryland`, sync warning, and support docs before broad verification.

- Identifiers searched:
  - `Micro Sessions`
  - `dryland_micro_plans`
  - `still syncing`
  - `/my-library/dryland`
  - `micro plan`
  - `micro session`
- Surfaces checked:
  - `app/`
  - `components/`
  - `lib/`
  - `tests/`
  - `docs/`
  - `supabase/`
- Fallout handled:
  - support runbook now documents the Micro Sessions sync-warning repair path,
  - route tests now cover missing-table `503` support-diagnosable responses,
  - panel test now proves ready schema shows start choices instead of the sync warning,
  - V2 planned brief now captures the deferred source-session vs generated-unit IA redesign.

## Checkpoint Log

- `2026-05-08` - Planned after owner found Micro Sessions panel showing environment sync warning and asked what to do next. Next: execute this readiness brief before V2 mobile/game execution.
- `2026-05-08` - Started on branch `fix/micro-sessions-production-readiness-2026-05-08`. Supabase preflight confirmed linked project `freeswimming-org-prod` and remote migration history was missing only `20260508101500_dryland_micro_plans`; `supabase db push --dry-run --linked` confirmed that was the only pending migration, then `supabase db push --linked` applied it and `supabase migration list --linked` confirmed local/remote parity. Generated types were checked, but the installed Supabase CLI produced a broad formatting/helper diff while existing `types/database.ts` already contains `dryland_micro_plans`; no type diff retained. Next: add readiness tests/support note, run targeted validation, and capture screenshot handoff.
- `2026-05-08` - Added readiness regressions for the no-sync-warning start state and missing-table `503` responses on `POST`/`PATCH`, plus a support runbook note for Micro Sessions sync repair. Targeted validation passed: `./node_modules/.bin/vitest run tests/unit/dryland-micro-plans.test.ts tests/unit/dryland-micro-plan-routes.test.ts tests/unit/dryland-micro-plan-panel.test.tsx` (`3` files, `14` tests) and `npm run lint:briefs:all` (`266` briefs). Route/support sweep ran for `Micro Sessions`, `dryland_micro_plans`, `/my-library/dryland`, sync warning, and support docs; fallout was limited to the runbook/tests/brief updates in this slice. Targeted Playwright dryland builder exited `0` but skipped the authenticated browser flow because local `/dev/login` still receives an HTML Supabase Auth response instead of JSON; this is the same local auth blocker from the prior dryland slice, not a Micro Sessions regression. Screenshot artifacts captured at `output/micro-sessions-production-readiness-2026-05-08-222214` with the real Micro Sessions component rendered through a temporary dev-only fixture, then the fixture was removed. Next: owner screenshot review before `npm run verify:pre-pr`.
- `2026-05-08` - Owner approved screenshot handoff. Next: run `npm run verify:pre-pr`, then commit, push, and open PR if green.
- `2026-05-08` - `npm run verify:pre-pr` passed after adding explicit route/support sweep identifiers/surfaces and clearing stale generated `.next/dev` cache from the temporary screenshot fixture. Full lane evidence: branch-current pass, quality gates pass, lint/typecheck pass, unit pass (`182` files, `981` tests), build pass, perf budgets pass, and e2e pass (`82` passed, `374` skipped by local auth/support gating). Perf trend recommended tightening after `4` weekly green runs with `20.3%` margin; decision for this readiness slice is `hold` because no route budget or runtime payload changed, and budget tightening should happen in a dedicated performance-governance slice. Next: commit, push, open PR, monitor CI, and run `npm run verify:pre-merge`.
