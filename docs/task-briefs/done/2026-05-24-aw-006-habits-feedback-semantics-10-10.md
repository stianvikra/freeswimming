# Task Brief: AW-006 Habits Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-24-aw-006-habits-feedback-semantics-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-24`
- `updated`: `2026-05-24`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-habits-feedback-semantics`
- `execution_mode`: `owner approved the recommended PR-sized AW-006 slice; automate implementation through targeted QA and stop for screenshot approval before verify:pre-pr`

## Brief Audit Record

- `last_audited`: `2026-05-24`
- `base`: `main@c43c432`
- `audit_status`: `ready`
- `decision`: Execute the approved bounded `AW-006 Habits Feedback Semantics` slice now.
- `reason`: The canonical AW-006 queue and notice inventory show Profile, Goals, My Training, Dryland, and export feedback semantics as shipped, while `HabitPerfectDayHub` still renders route-local schema, empty, action success, and action error feedback with repeated ad hoc markup.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `/my-library/habits`, `HabitPerfectDayHub`, habit API/storage contracts, My Routines navigation, Help/Guide rules, screenshot handoff rules, AW-006 queue, notice inventory, or verification lanes change before screenshot handoff.

## Goal

Make `/my-library/habits` feedback states clearer, consistent, and accessible while preserving habit data, APIs, cadence, timers, check-ins, navigation, analytics, and support behavior.

## Pre-Implementation Owner Explanation

Vi rydder statusmeldinger i Habits, ikke selve vane-systemet. Det betyr at lagret, feil, sync-varsel og tom-tilstand vises mer konsekvent og lettere kan leses av hjelpeteknologi. Det betyr noe fordi Habits er en daglig brukerflate der brukeren må forstå om en handling faktisk ble lagret. Utenfor scope er habit-data, API-er, cadence/timere, check-ins, analytics, navigasjon, Help/Guide og bred design-system-refaktor.

Fremoverkompatibilitet: nye habit-typer eller cadence-varianter skal fortsette å bruke samme habits-lokale feedback-kontrakt. Nye domeneverdier som krever egen tekst eller mapping må få eksplisitt kode/test-oppdatering, mens ukjente API-feil fortsatt vises trygt som en generell recoverable error.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Data placement and sync boundaries`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                               | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/habits` remains a private daily habit tracker; feedback clarifies habit actions without adding duplicate navigation or changing My Routines IA.                     | code review + screenshot handoff            | `5/5`                   |
| UX flow clarity                               | `target`     | Schema warning, action success, action error, create notice, and no-active-habits states each show one clear state and next step where useful.                                   | unit tests + screenshot handoff             | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses one habits-local treatment aligned with recent Profile/Goals/My Training feedback semantics; no new nested cards, crowding, or mobile text overlap.                | desktop/mobile screenshots                  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Habit create/update/archive/check-in/reset/lapse payloads, cadence logic, local timer behavior, and snapshot replacement stay unchanged.                                         | targeted unit tests + code review           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, CRUD surface, publishing workflow, admin notes, QR, content manager, or operator workflow.                                             | explicit admin scope rationale              | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Dynamic success/error/warning feedback uses appropriate `role`/`aria-live`; static empty state avoids unnecessary announcements; buttons keep existing names and focus behavior. | unit assertions + screenshot review         | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for brief-lint closeout normalization of `Accessibility (a11y)`; same accessibility target and evidence.                                                               | unit assertions + screenshot review         | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: route target remains `LCP <= 2.5s`, `CLS <= 0.10`, `INP <= 200ms`, `TBT <= 200ms`; no dependency, media, fetch, or heavy client runtime is added.               | no-dependency diff + broad gates later      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical habit definitions/check-ins and local-only UI/timer state boundaries remain unchanged; feedback derives from existing mutation outcomes only.                   | data contract + code review                 | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes no route cache mode, fetch cache, revalidation trigger, mutation invalidation, CDN behavior, or stale-data policy.                                      | explicit cache scope rationale              | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable load/mutation failures remain visible near the Habits surface and do not hide schema-sync warnings or failed mutation messages.                                      | targeted tests                              | `5/5`                   |
| Security and authz                            | `target`     | Protected route/authz boundaries and API inputs stay unchanged; error copy must not reveal secrets, raw env values, session cookies, or sensitive provider details.              | code review + unchanged protected APIs      | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: feedback copy exposes no personal habit details beyond the already-visible private surface and adds no logs/events/storage.                                     | copy review                                 | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: route-local Habits feedback copy is consolidated; no CMS/admin ownership model or Help/Guide runtime content changes.                                           | code/docs diff                              | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, editable field, status transition, audit trail, Help/Guide action, or support procedure changes.                                            | explicit admin-workflow scope rationale     | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private and this changes no public route, metadata, sitemap, robots, canonical URL, or structured crawlable page content.                    | explicit SEO scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this private member route is not an AI-discovery content surface and no structured data/entity content is introduced.                                                | explicit AI-discoverability scope rationale | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing `habits_viewed` payload and habit mutation behavior stay unchanged; no new event taxonomy, dashboard, KPI, or payload values are introduced.           | code review                                 | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, portal, entitlement, price, invoice, refund, payout, or revenue reporting behavior.                                                | explicit commerce scope rationale           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery runbook, operator diagnostic, or support escalation behavior.                                               | explicit support-ops scope rationale        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                         | explicit finance scope rationale            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new or moved English strings stay concise and route-local; no locale routing or translation workflow is introduced.                                             | copy review                                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `HabitPerfectDayHub` route-local component and recent member feedback patterns; add no dependency and avoid broad app-wide Notice/EmptyState primitives.      | code review + package diff                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused unit coverage for the changed feedback semantics, run targeted Vitest and brief lint, then screenshot handoff before broad gates.                                    | targeted Vitest + screenshot artifacts      | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the change adds no backend calls, polling, storage, external service, image, job, or traffic-dependent cost.                                                    | implementation review                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff is reversible by normal git revert with no migration, env/config, provider, package, workflow, or production setting change; screenshot approval gates the PR.              | git diff + validation evidence              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces are the recent member-local feedback contracts in `GoalsHub`, `TrainingContextHub`, and `AthleteProfileHub`.
  - Keep `/my-library/habits` as a server-authenticated route with client-rendered `HabitPerfectDayHub`.
  - Do not change route boundaries, server actions, API routes, redirects, cache behavior, or My Routines navigation.
- TypeScript/domain contracts:
  - Preserve existing `HabitSnapshot`, `HabitDayItem`, cadence, timer, and check-in contracts.
  - Add only a small route-local feedback rendering helper if it reduces repeated markup.
  - Keep API error fallback deterministic and privacy-safe.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated types, storage, indexes, or Supabase query behavior changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email, analytics vendor, webhook, SDK, secret, retry, or idempotency change.
- UI system:
  - Use the existing Habits layout and Tailwind tokens.
  - Align with Profile/Goals/My Training feedback semantics without creating broad shared primitives.
  - Screenshot handoff type is `before/after` for `/my-library/habits` desktop and mobile.
- Testing:
  - Update focused `HabitPerfectDayHub` unit coverage for dynamic announcements and static empty/schema states.
  - Run screenshot handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

- Server-canonical data:
  - Habit definitions, check-ins, cadence fields, and habit snapshots remain owned by the existing authenticated API/Supabase path.
- Local data:
  - Existing UI state such as expanded rows, recently-created row highlight, add/edit forms, and same-day local timer state stays local-only.
- Sync policy:
  - Mutations continue to replace the local snapshot from the API response; this slice only changes how resulting success/error/warning/empty messages render.
- Retention and sensitivity:
  - No new persisted data, storage key, log, event, or sensitive value is introduced.
- Cache/invalidation:
  - No cache mode or invalidation behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no new persisted entity, slug, route parameter, analytics identity, operator-visible identifier, rename/repurpose policy, alias, redirect, or compatibility mapping. Existing habit IDs/titles and local UI identifiers remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Habit feedback states, habit modes, cadence labels, and mutation outcomes inside `/my-library/habits`.
- Source of truth:
  - Feedback messages continue to derive from existing route-local mutation results, API fallback errors, and current `HabitSnapshot` state.
- Additive behavior:
  - New habit definitions, cadence labels, and regular mutation errors should automatically render through the same habits-local feedback treatment.
- Explicit mapping requirements:
  - New top-level feedback categories, new unknown severity levels, or new recovery actions require explicit copy/test updates before release.
- Unknown or deprecated values:
  - Unknown API errors fall back to existing safe generic messages. Static unknown habit domain values are not reinterpreted in this slice.
- Test/evidence:
  - Unit tests prove success/error and empty/schema feedback semantics using current fixtures, and the route/label/support sweep records that no Help/Guide fallout is needed.

## Help / Guide Impact

N/A with rationale: this slice changes presentation semantics for existing Habits feedback only. It does not change user/admin workflow labels, recovery behavior, support diagnostics, Help/Guide content, or operator-facing runbook procedures. Existing support wording for Habits schema sync, modes, cadence, and check-ins remains true.

## Route / Label / Support Surface Sweep

Required before broad gates because `/my-library/habits` feedback labels and state rendering are touched.

- Identifiers to search:
  - `Habits Feedback Semantics`
  - `/my-library/habits`
  - `My Perfect Day`
  - `Habits are still syncing`
  - `No active habits`
  - `Habit added`
  - `Check-in saved`
  - `Check-in reset`
  - `Habit archived`
- Surfaces to check:
  - `app/my-library/habits/`
  - `components/my-library/habits/`
  - `tests/unit/habit-perfect-day-hub.test.tsx`
  - `tests/e2e/my-library-habits.spec.ts`
  - `docs/user-flow-map.md`
  - `docs/runbooks/auth-account-support.md`
  - AW-006 queue and notice inventory
- Expected fallout:
  - `HabitPerfectDayHub`, focused unit tests, active brief, canonical queue, and notice inventory only.
  - No API, DB, Help/Guide, support runbook, analytics, navigation, route metadata, or admin workflow update unless implementation finds a direct contradiction.

## Scope

- `components/my-library/habits/HabitPerfectDayHub.tsx`
- `tests/unit/habit-perfect-day-hub.test.tsx`
- This active brief
- Canonical AW-006 queue
- Notice/empty-state pattern inventory
- Screenshot handoff artifacts

## Out Of Scope

- Habit API routes, Supabase migrations/RLS/types, cadence/timer/check-in business logic, localStorage keys, analytics taxonomy, My Routines navigation, Home route summaries, Help/Guide runtime content, support runbooks, admin surfaces, Stripe, commerce, auth, SEO, public route metadata, broad shared Notice/EmptyState primitives, dependencies, and merge.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.

## Acceptance Criteria

1. `/my-library/habits` schema-sync warning uses the same habits-local feedback treatment as other route feedback.
2. Action success and action error messages render through one habits-local feedback helper with appropriate accessible announcements.
3. First-run/no-active-habits empty state remains static and includes one useful next action through the existing `Add habit` path.
4. New-habit row feedback remains close to the created row and retains accessible status semantics.
5. Create, edit, archive, check-in, reset, lapse, timer, cadence, and snapshot mutation logic remain unchanged.
6. Existing public/private navigation, analytics, Help/Guide, support, auth, API, and data behavior remain unchanged.
7. Focused unit tests cover the changed feedback semantics.
8. Desktop/mobile screenshot handoff shows the Habits feedback surface before broad gates.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - `./node_modules/.bin/vitest run tests/unit/habit-perfect-day-hub.test.tsx`
  - targeted route/label/support sweep listed above
  - `git diff --check`
- Screenshot handoff before `npm run verify:pre-pr`:
  - artifact folder: `output/habits-feedback-semantics-YYYY-MM-DD-HHMMSS`
  - comparison type: `before/after`
  - expected filenames: `before-habits-feedback-desktop-1440.png`, `after-habits-feedback-desktop-1440.png`, `before-habits-feedback-mobile-390.png`, `after-habits-feedback-mobile-390.png`
- After owner screenshot approval:
  - `npm run verify:pre-pr`
  - commit/push/open or update PR
  - required CI checks green
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

Node.js/npm should be loaded through the repo's normal `nvm use --silent` path before npm commands. For Codex, release-gate/dev-server commands use escalation-first strategy per repo instructions.

## Screenshot Handoff

Required because this is a user-facing UI state rendering change. Stop after targeted implementation QA and screenshot artifacts; do not run `npm run verify:pre-pr`, open/update PR, or run pre-merge until owner approves or waives the screenshot handoff.

## Checkpoint Log

- `2026-05-24 | in-progress | owner approved AW-006 Habits Feedback Semantics after clean main@c43c432 and fresh queue/design/code re-audit; created branch aw-006-habits-feedback-semantics and this active brief | next: update queue/inventory, implement habits feedback helper, run targeted tests, then capture screenshot handoff before broad gates`
- `2026-05-24 | screenshot-review | implemented a habits-local feedback helper for schema, empty, action success, and action error states; preserved create/edit/archive/check-in/reset/lapse/timer/cadence payload logic; updated AW-006 queue and notice inventory; targeted validation passed with ./node_modules/.bin/vitest run tests/unit/habit-perfect-day-hub.test.tsx (22 tests), npm run lint:briefs:all, npm run lint:quality-gates, npm run typecheck, route/label/support sweep, and git diff --check; captured before/after screenshots in output/habits-feedback-semantics-2026-05-24-205130 using main@c43c432 for before and this branch for after | next: owner screenshot approval before npm run verify:pre-pr, commit, push, PR, CI, and npm run verify:pre-merge`
- `2026-05-24 | screenshot-approved | owner approved the screenshot handoff in output/habits-feedback-semantics-2026-05-24-205130; no product-rendering files changed after capture before broad-gate start | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-24 | merged | PR #836 merged as f0a146a after npm run verify:pre-pr, green GitHub CI, refreshed screenshot artifacts in output/habits-feedback-semantics-refresh-2026-05-24-212145, and npm run verify:pre-merge passed on 1cc55a6 | next: repo-managed docs-only closeout moves this brief to done and updates canonical queue/inventory stale active references`

## Completion Record

- `completed`: `2026-05-24`
- `merged_pr`: `#836`
- `squash_commit`: `f0a146a`
- `result`: Closed AW-006 Habits Feedback Semantics. `/my-library/habits` now uses a habits-local feedback helper for schema warning, static empty state, action success, action error, and created-row feedback semantics while preserving habit data, APIs, cadence, timers, check-ins, analytics, navigation, Help/Guide, and support behavior.
- `validation`: `./node_modules/.bin/vitest run tests/unit/habit-perfect-day-hub.test.tsx` PASS (22 tests); `npm run lint:briefs:all` PASS; `npm run lint:quality-gates` PASS; `npm run typecheck` PASS; targeted route/label/support sweep completed with no Help/Guide fallout; `git diff --check` PASS; `npm run verify:pre-pr` PASS on `1cc55a6`; GitHub CI for PR `#836` PASS including `verify`, `e2e-smoke`, `site-lock-smoke`, `deploy-preview`, `size-check`, CodeQL, and Vercel; `npm run verify:pre-merge` PASS on `1cc55a6`.
- `screenshot_artifacts`: `output/habits-feedback-semantics-refresh-2026-05-24-212145` captured `2026-05-24 21:22` after commit formatting; before/after desktop and mobile PNGs are present.
- `10/10 claim`: yes - all critical target categories reached `5/5`; supporting categories remained intentionally bounded and non-blocking.

| Category                                      | Achieved Score | Evidence                                                                                                 | Gaps / Notes |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR `#836`, code review, queue closeout, screenshot handoff                                               | None         |
| UX flow clarity                               | `5/5`          | Unit tests, screenshot handoff, PR `#836`                                                                | None         |
| Visual design quality                         | `5/5`          | Refreshed desktop/mobile screenshot artifacts and owner-approved handoff                                 | None         |
| Business logic correctness and data integrity | `5/5`          | Focused unit tests and unchanged habit API/data/cadence/timer/check-in logic                             | None         |
| Accessibility (a11y)                          | `5/5`          | Unit assertions for `role`/`aria-live`; static empty state avoids unnecessary live announcement          | None         |
| Accessibility                                 | `5/5`          | Alias row for brief-lint closeout normalization of `Accessibility (a11y)`; same accessibility evidence.  | None         |
| Data placement and sync boundaries            | `5/5`          | No server/local boundary changes; feedback derives from existing snapshot and mutation outcomes          | None         |
| Reliability and failure handling              | `5/5`          | Warning, success, error, and fallback paths covered by focused tests                                     | None         |
| Security and authz                            | `5/5`          | Protected routes/APIs unchanged; error copy stays generic and privacy-safe                               | None         |
| Stack-fit and dependency discipline           | `5/5`          | Route-local helper in `HabitPerfectDayHub`; no dependency or broad primitive added                       | None         |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, local `verify:pre-pr`, GitHub CI, and local `verify:pre-merge` all passed               | None         |
| DevOps and rollback readiness                 | `5/5`          | No migration/config/package/workflow changes; reversible by normal git revert; PR body has gate evidence | None         |
