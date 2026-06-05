# Task Brief: AW-006 Habits Advanced Motivation And History Depth (10/10)

## Metadata

- `id`: `2026-06-05-aw-006-habits-advanced-motivation-history-depth-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-05`
- `updated`: `2026-06-05`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `plan only until owner explicitly says execute/build/implement`
- `target_findings`: remaining advanced-motivation/history part of `H-010`
- `planned_resolved_findings`: `H-010` sub-scope for best streak, habit strength/score, deeper Habits history insight, archived-history trust, and notes/history visibility where existing data can support it.
- `deferred_findings`: `H-028` midnight auto-complete, reminders, notification APIs, server-stored preferences, user-selected/uploaded sounds, micro-session audio, broad Calendar findings polish, `/my-library/calendar` metric formatting, export downloads, new habit notes schema, global calendar storage, swim/dryland/micro planning, and broad analytics dashboards remain out of scope.
- `return_checkpoint`: update the Habits parent before this child is considered closeout-ready.
- `next_return_target`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-05`
- `base`: `main@69bddfc7`
- `audit_status`: `ready`
- `decision`: Keep this as a planned Habits child brief; do not execute until the owner explicitly asks for implementation.
- `reason`: `main` is clean and synced after PR `#997` and repo-managed closeout PR `#998`; post-merge preflight was reported green. Fresh re-audit found no active AW-006/Habits implementation slice, all recent Habits Child A-J work is done, and the remaining high-value Habits direction is advanced motivation/history depth rather than another core tracking correctness fix.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, the Habits parent, `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, `lib/habits/server.ts`, habits API/storage contracts, My Library Calendar contracts, account export contracts, Help/Guide/support rules, benchmark assumptions about habit apps, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before execution.

## Goal

Add a read-only Habits motivation/history layer that helps users understand long-term progress without changing check-in truth, reminders, Calendar comparison, or data creation rules.

## Pre-Implementation Owner Explanation

Vi planlegger forst hvordan Habits skal vise mer motivasjon over tid: beste streak, tydeligere historikk, en forsiktig habit strength/score, og bedre trygghet rundt arkivert historikk.

Hvorfor det betyr noe: Habits skal ikke bare fortelle hva som skjedde i dag. Brukeren maa kunne se at fremgang ikke forsvinner etter en vanskelig dag, og at gamle vaner fortsatt har en historikk som er bevart.

Utenfor scope er Calendar-funnene, rare desimaltall i `/my-library/calendar`, reminders, push-varsler, midnight auto-complete, nye lydvalg, micro-session audio, full dashboard-redesign, nye check-in statuser, nye database-tabeller og eksportnedlasting.

Fremoverkompatibilitet: nye habit-statuser, habit modes, units, historikkverdier og fremtidige metric-felter maa gaa gjennom en typed Habits motivation/view-model-kontrakt. Ukjente verdier skal ikke telles som suksess eller score uten eksplisitt mapping, tester og support-dokumentasjon.

## Re-Audit Summary

- `HabitPerfectDayHub` already renders active Habits rows, details, week overview, selected-day correction, timer/manual source split, local sound controls, and today-only setup management.
- `lib/habits/shared.ts` already derives selected-day and week summaries, current streak/consistency labels where data proves them, rest-day semantics, slip semantics, weekly/monthly target-met state, and timer/manual totals.
- `lib/habits/server.ts` already loads active and archived habit definitions, but `archivedHabits` is not exposed as a rich user-facing history surface in `/my-library/habits`.
- `/my-library/calendar` already owns cross-source week/month/year comparison. Calendar metric formatting and source-card polish are separate Calendar findings, not this Habits child.
- Account export already includes Habits data at the account level, so this child should not add a new export download unless a later brief explicitly selects it.
- The current safe next Habits slice is read-only derived insight from existing owner-scoped data, not new writes, background jobs, notification permissions, or data-model expansion.

## Benchmark Refresh

- Productive Help, `https://support.productiveapp.io/hc/en-us/articles/26920754719633-How-to-read-statistics`: statistics include perfect days, current/best streak style motivation, total habits done, and average per day.
- Habitify progress, `https://habitify.me/onboarding-instruction/progress`: progress is calculated across day/week/month/year ranges and separates completion, skipped, and time range rules.
- Loop Habit Tracker on Google Play, `https://play.google.com/store/apps/details?id=org.isoron.uhabits&hl=en_US&gl=US`: emphasizes habit score/strength, detailed charts/statistics, complete history, reminders, privacy, and export.
- Streaks, `https://streaksapp.com/`: emphasizes streak motivation, flexible schedules, and task statistics without forcing every habit into a daily-only model.

## Selected Scope For Future Execution

- Add a read-only Habits motivation/history view-model, derived from existing `habit_definitions` and `habit_check_ins`.
- Show conservative, explainable metrics where data is sufficient:
  - current streak,
  - best streak,
  - consistency percentage,
  - on-track days versus eligible days,
  - rest days,
  - slips,
  - timed minutes,
  - count totals,
  - last tracked date.
- Add a habit strength/score only if the formula is documented, deterministic, and tested:
  - missed days should reduce strength gradually rather than erase all progress;
  - rest days should not be treated as failures;
  - unknown statuses should not count as success.
- Add compact history depth inside `/my-library/habits`:
  - keep today's check-in flow primary;
  - expose deeper motivation in a secondary summary/details area;
  - avoid a competing full dashboard.
- Clarify archived-history trust:
  - archived habits keep history;
  - archived rows are read-only unless a future owner-selected restore/edit policy is defined;
  - rename keeps history attached to stable habit ID.
- Preserve My Library Calendar ownership:
  - `/my-library/calendar` remains the cross-source comparison route;
  - Habits motivation metrics may feed Calendar later only through explicit mapping;
  - Calendar formatting/polish issues remain a separate brief.
- Update `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, Habits parent, AW-006 queue, and design inventory if execution changes user-visible labels, support diagnosis, or lifecycle references.
- Add focused tests for score/streak/consistency math, rest/slip treatment, archived-history behavior, unknown status fail-safe behavior, and UI accessibility.
- Capture screenshot handoff before `npm run verify:pre-pr` because future execution changes visible Habits UI.

## Out Of Scope

- `/my-library/calendar` findings, Calendar metric formatting, source-card layout, source inclusion copy, comparison insight copy, or detailed-number table polish.
- Reminders, notification APIs, push notifications, scheduled reminders, browser/native notification sounds, or server-stored notification preferences.
- Midnight auto-complete, background check-in creation, automatic day-boundary writes, or retroactive generated check-ins.
- New persisted habit event tables, new check-in statuses, new note schema, new export download route, or account export schema changes.
- User-selected/uploaded sounds, sound library management, micro-session audio, haptics, or device-level audio controls.
- Broad global Calendar storage, swim/dryland/micro planning, work/off-work filters, month/year heatmap, or broad analytics dashboard.
- Changing Habits truth, check-in API payload semantics, timer/manual source totals, rest/slip semantics, route auth boundaries, or existing account export behavior.
- Merging without explicit owner approval.

## Data Placement And Sync Contract

- Server-canonical data:
  - existing `habit_definitions` rows,
  - existing `habit_check_ins` rows,
  - stable habit IDs,
  - timer/manual fields already persisted by Child I,
  - archived status already persisted on habit definitions.
- Local data:
  - expanded/collapsed UI state only;
  - no local-only metric truth;
  - no new local storage key unless a later UI-only preference is explicitly scoped.
- Derived view-model:
  - streak, best streak, strength/score, consistency, rest/slip counts, timed minutes, count totals, and last tracked date derive from owner-scoped server data plus typed mapping rules.
- Sync policy:
  - this child should be read-only for motivation metrics;
  - failed metric loads must not block ordinary check-ins;
  - no mutation should be introduced unless the brief is revised and owner-approved.
- Retention and sensitivity:
  - habit names, quit goals, notes, slips, rest days, and check-ins remain private user data;
  - no raw habit names or sensitive values are added to public pages, logs, analytics payloads, or support copy.
- Cache/invalidation:
  - preserve `/my-library/habits` dynamic/no-store behavior unless a future execution audit proves a safe cache boundary;
  - metric freshness should follow the same snapshot/load path as Habits check-ins.

## Identity And Rename Contract

- Canonical stable ID:
  - habit ID remains the identity for metrics, check-ins, timers, archived history, support diagnosis, future exports, and future Calendar mappings.
- Human-readable identifiers:
  - habit title is editable and display-only;
  - title must not key metrics, storage, analytics identity, or support repair.
- Mutability:
  - renaming a habit keeps all historical metrics attached to the same habit ID.
  - archiving a habit hides it from active execution but must not delete history.
- Rename vs repurpose:
  - rename in place is acceptable for the same habit intent;
  - materially repurposing a habit should create a new habit if the user wants clean future metrics.
- Compatibility:
  - legacy rows without newer source fields must still be counted through existing fallback rules where already supported.
  - unknown/future status or source values fail closed and require explicit mapping before they affect score/streak.
- Observability and repair:
  - support diagnosis should use redacted habit ID/date/status/source fields, not private habit names or raw notes.

## Forward Compatibility Contract

- Extensibility surfaces:
  - habit modes, habit types, cadence periods, day policies, units, check-in statuses, rest/slip semantics, timer/manual source values, archived status, history metrics, Calendar source mappings, analytics payload values, account export fields, Help/Guide labels, and locales.
- Source of truth:
  - Habits motivation derives from canonical Habits data and typed view-model helpers, not route-local string matching or Calendar-only metric copies.
- Additive behavior:
  - new active habits with existing supported modes/statuses should inherit the motivation view automatically.
  - new dates within loaded history ranges should flow through the same streak/score/consistency helpers.
- Explicit mapping requirements:
  - new statuses, source fields, habit modes, units, notes models, export fields, Calendar metrics, reminders, notifications, native integrations, or analytics values require mapping, tests, support docs, and owner decision before they affect user-facing motivation.
- Unknown or deprecated values:
  - unknown statuses are reported as unmapped/unsupported and do not count as done, rest, slip, or score improvement.
  - missing history data shows `Not enough history` or equivalent neutral copy, not fabricated streak/score.
- Test/evidence:
  - future execution must include fixture coverage for unknown/future status values, legacy timed rows, archived habits, rest days, slips, short history, and sufficient-history score/streak cases.

## Help / Guide Impact

Required for future execution because this changes member-facing interpretation of Habits progress and support diagnosis:

- update `docs/user-flow-map.md` with advanced motivation/history behavior;
- update `docs/runbooks/auth-account-support.md` with streak/score/history/archived-history diagnosis;
- no admin Help Center update is expected unless execution adds admin/operator workflow labels or recovery behavior.

## Route / Label / Support Surface Sweep

Required before future broad gates:

- `/my-library/habits`
- `/my-library/calendar`
- `HabitPerfectDayHub`
- `buildHabitDaySummary`
- `buildHabitWeekSummary`
- `archivedHabits`
- `best streak`
- `Current streak`
- `habit score`
- `habit strength`
- `consistency`
- `rest day`
- `slip`
- `Manual time`
- `Timer time`
- `source=habits`
- `Average on target`
- `account export`
- `habit_definitions`
- `habit_check_ins`

Required surfaces:

- `components/my-library/habits/HabitPerfectDayHub.tsx`
- `lib/habits/shared.ts`
- `lib/habits/server.ts`
- `lib/habits/schema.ts`
- `app/my-library/habits/page.tsx`
- `lib/my-library/calendar.ts` and `lib/my-library/calendar-comparison.ts` for read-only mapping review only
- `lib/user/export.ts` for unchanged export boundary review only
- `tests/unit/habits.test.ts`
- `tests/unit/habit-perfect-day-hub.test.tsx`
- Calendar tests only if future execution changes a shared helper consumed by Calendar
- `docs/user-flow-map.md`
- `docs/runbooks/auth-account-support.md`
- Habits parent, AW-006 queue, and design inventory.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Incident response and support operations`
- `i18n operational readiness`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                  | Evidence                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/habits` must show read-only motivation/history depth without replacing the primary check-in job or duplicating `/my-library/calendar` comparison.                      | brief scope + screenshots + route review            | `5/5`                   |
| UX flow clarity                               | `target`     | Users can understand best streak, consistency, score/strength, and archived-history trust without mistaking them for editable check-ins or Calendar comparison.                     | component tests + screenshot handoff                | `5/5`                   |
| Visual design quality                         | `target`     | New motivation/history UI fits existing Habits tokens, stays scan-first, has no text overflow, and keeps cards/actions stable on mobile and desktop.                                | responsive screenshots + text-fit review            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Streak, best streak, score/strength, consistency, rest/slip, timed, count, and archived-history calculations are deterministic and derived only from canonical Habits data.         | unit/component tests + helper review                | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this planned slice changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                                            | explicit admin-editor scope rationale               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Metric cards, details, disclosure controls, badges, and history summaries have accessible names, keyboard support, focus visibility, and non-color-only status.                     | component tests + screenshot/manual QA              | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same threshold and evidence.                                                                                             | component tests + screenshot/manual QA              | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: avoid heavy dashboards, new dependencies, polling, or large client payload growth; keep route-level payload impact reviewed.                                       | build/perf gate + diff review                       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Brief and implementation must separate server-canonical history, derived metrics, and local UI state; no local metric truth or hidden writes.                                       | data contract + tests                               | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: preserve dynamic/no-store Habits freshness unless a later audited cache boundary is explicitly documented and tested.                                              | route/server diff review                            | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing history, unsupported statuses, partial load failures, and old rows show neutral fallback without blocking check-ins or fabricating progress.                                | negative-path tests + support docs                  | `5/5`                   |
| Security and authz                            | `target`     | All motivation/history reads remain authenticated and owner-scoped; no new public or cross-user Habits data exposure.                                                               | route/server audit + negative-path tests if changed | `5/5`                   |
| Privacy and compliance                        | `target`     | Private habit names, quit goals, notes, slips, rest days, and check-ins are not added to public pages, unsafe logs, or analytics payloads.                                          | privacy/analytics diff review                       | `5/5`                   |
| Content governance                            | `target`     | Parent, queue, design inventory, user-flow docs, support docs, and child brief accurately record the motivation/history contract and deferred Calendar scope.                       | docs diff + `npm run lint:briefs`                   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow labels, editable admin fields, role-gated CRUD, recovery action, or operator support action surface.                                     | explicit admin-workflow scope rationale             | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private/authenticated and this child changes no public metadata, sitemap, robots, canonical URL, or structured data.                            | private-route SEO rationale                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this child changes no crawl-safe public entity model, public semantic page copy, structured data, or AI-facing public docs surface.                                     | AI-discoverability scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: preserve existing safe Habits analytics; any future metric event must avoid raw habit names, notes, or sensitive values.                                           | analytics diff review                               | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this child changes no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue flow.                                                         | commerce scope rationale                            | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs must explain how to diagnose score/streak/history/archived-history questions with redacted owner-scoped fields.                                                        | support doc diff                                    | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation.                           | explicit finance scope rationale                    | `N/A`                   |
| i18n operational readiness                    | `target`     | Labels and metric layouts must avoid fixed-width English assumptions and support longer localized strings without overflow.                                                         | responsive screenshots + component assertions       | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `HabitPerfectDayHub`, Habits domain helpers/server loader, existing My Library tokens, and current test stack; add no dependency unless explicitly justified.                 | code/dependency diff review                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused tests cover metrics, unknown values, archived history, rest/slip treatment, accessibility, screenshot handoff, `verify:pre-pr`, CI, and `verify:pre-merge`.                 | targeted tests + broad gates                        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: avoid unbounded all-history client payloads, polling, background jobs, or per-render expensive scans; define bounded read windows or server aggregation if needed. | implementation/perf review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Future execution must be rollback-safe, preferably read-only/no migration; any broader data change requires explicit migration and rollback notes before implementation.            | rollback notes + verification gates                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: `/my-library/habits` and `HabitPerfectDayHub`.
  - Keep `/my-library/habits` as the authenticated private route boundary.
  - Preserve `dynamic = "force-dynamic"` unless future execution documents a safe cache boundary.
  - Keep check-in execution primary; motivation/history should be a secondary, compact layer.
- TypeScript/domain:
  - Prefer typed Habits motivation helpers in `lib/habits/shared.ts` or a small Habits-local helper over route-local string matching.
  - Define score/streak/consistency invariants before rendering.
  - Unknown statuses or future time sources must fail closed.
- Supabase/data:
  - Planned first pass should be read-only and use existing `habit_definitions` and `habit_check_ins`.
  - No migration is expected for this slice.
  - If future execution discovers a migration is required, revise this brief before implementation.
- External services:
  - No new external service, SDK, notification provider, analytics vendor, HealthKit/native integration, or secret.
- UI system:
  - Reuse existing My Library/Habits token classes and action hierarchy.
  - Use compact metric cards or disclosures; do not add nested cards or a marketing-style dashboard.
  - Screenshot handoff type: likely `after/reference` against current Habits route.
- Testing:
  - Unit tests for motivation helpers.
  - Component tests for metric rendering, fallback copy, archived-history treatment, and accessibility.
  - Route/API tests only if future execution changes protected read/mutation boundaries.

## Scope

- Create and execute a future Habits child that adds read-only advanced motivation/history depth to `/my-library/habits`.
- Derive metrics from existing Habits data with typed helpers and deterministic fallbacks.
- Keep Calendar findings and Calendar formatting as a separate future brief.
- Update support/user-flow docs and lifecycle references when future implementation starts.
- Add focused tests and screenshot handoff before broad gates when future implementation starts.

## Out Of Scope For This Planned-Only Brief Creation

- Runtime app code, UI, CSS, tests, scripts, configs, workflows, migrations, generated files, assets, external services, package changes, environment settings, screenshots, PR creation, or merge.
- Choosing exact final visual layout before implementation audit.
- Fixing `/my-library/calendar` screenshots or numeric formatting.

## Acceptance Criteria

Planning acceptance for this brief creation:

1. The planned brief exists in `docs/task-briefs/planned/`.
2. The brief clearly separates Habits advanced motivation/history from Calendar findings polish.
3. The brief includes parent, queue, design inventory, target/deferred findings, scorecard mapping, data boundary, identity, forward compatibility, Help/Guide impact, route/label/support sweep, validation, and screenshot requirements.
4. No runtime code or product UI is changed by this planned-only task.
5. Changed briefs pass `npm run lint:briefs`.

Future execution acceptance:

1. `/my-library/habits` exposes read-only advanced motivation/history without hiding the primary check-in flow.
2. Best streak, current streak, consistency, score/strength, rest/slip, timed, count, and archived-history metrics are deterministic and tested where included.
3. Missing or insufficient history shows neutral fallback copy.
4. Unknown/future statuses do not count as success or score improvement.
5. Archived habits are communicated as history-preserving and read-only unless a revised brief defines restore/edit behavior.
6. `/my-library/calendar` behavior and formatting are not changed unless this brief is explicitly revised.

## Validation

For this planned-only brief creation:

- `npm run lint:briefs`

Before future implementation PR update:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run typecheck`
- targeted Vitest for Habits domain/component tests
- screenshot handoff and owner visual approval
- `npm run verify:pre-pr`

Before future merge:

- required PR CI checks
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands should use escalation-first strategy per repo instructions when future implementation starts.

## Screenshot Handoff

N/A for this planned-only brief creation because no UI, print, layout, brand, asset, or product-rendering file changes.

Required for future execution because the planned slice changes visible Habits UI:

- capture `after/reference` or `before/after` screenshots for mobile and desktop `/my-library/habits`;
- include the clickable `Screenshot artifacts` folder link;
- stop for owner visual approval before `npm run verify:pre-pr`.

## Checkpoint Log

- `2026-06-05 | planned | created planned-only Habits Advanced Motivation And History Depth brief from clean synced main@69bddfc7 after PR #997/#998 closeout and green post-merge preflight; no runtime implementation is active; Calendar findings and numeric formatting remain a separate future brief | next: wait for explicit owner execute/build/implement before moving this child to in-progress, or create a separate Calendar Findings Polish brief if the owner chooses Calendar first`
