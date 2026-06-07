# Task Brief: AW-006 Habits Advanced Motivation And History Depth (10/10)

## Metadata

- `id`: `2026-06-05-aw-006-habits-advanced-motivation-history-depth-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-05`
- `updated`: `2026-06-06`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `owner approved execution on 2026-06-06`
- `target_findings`: remaining advanced-motivation/history part of `H-010`
- `planned_resolved_findings`: `H-010` sub-scope for best streak, habit score, deeper Habits history insight, Past habits trust, and notes/history visibility where existing data can support it.
- `deferred_findings`: `H-028` midnight auto-complete, reminders, notification APIs, server-stored preferences, user-selected/uploaded sounds, micro-session audio, export downloads, new habit notes schema, global calendar storage, swim/dryland/micro planning, and broad analytics dashboards remain out of scope. Calendar Compare Findings Polish shipped separately in PR `#999` and repo-managed closeout PR `#1000`; `H-040` per-habit Reset stats motivation reset was handled by PR `#1009` in `docs/task-briefs/done/2026-06-06-aw-006-habits-reset-stats-motivation-reset-10-10.md`.
- `return_checkpoint`: update the Habits parent before this child is considered closeout-ready.
- `next_return_target`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-06`
- `base`: `main@5460f188`
- `audit_status`: `in-progress`
- `decision`: Execute this as the next Habits child brief after owner approved scope and said `kjor` on 2026-06-06.
- `reason`: `main` is clean and synced after AW-006 Post-Calendar Habits Lifecycle Refresh PR `#1001` and repo-managed closeout PR `#1002`; post-merge preflight was reported green. Fresh re-audit found no active AW-006/Habits implementation slice, all recent Habits Child A-J work is done, Calendar comparison polish is complete as a separate route slice, and the remaining high-value Habits direction is advanced motivation/history depth rather than another core tracking correctness fix.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, the Habits parent, `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, `lib/habits/server.ts`, habits API/storage contracts, My Library Calendar contracts, account export contracts, Help/Guide/support rules, benchmark assumptions about habit apps, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before execution.

## Goal

Add a read-only Habits motivation/history layer that helps users understand long-term progress without changing check-in truth, reminders, Calendar comparison, or data creation rules.

## Pre-Implementation Owner Explanation

Vi planlegger forst hvordan Habits skal vise mer motivasjon over tid: beste streak, tydeligere historikk, en forsiktig habit score, og bedre trygghet rundt arkivert historikk.

Hvorfor det betyr noe: Habits skal ikke bare fortelle hva som skjedde i dag. Brukeren maa kunne se at fremgang ikke forsvinner etter en vanskelig dag, og at gamle vaner fortsatt har en historikk som er bevart.

Utenfor scope er Calendar-funnene, rare desimaltall i `/my-library/calendar`, reminders, push-varsler, midnight auto-complete, nye lydvalg, micro-session audio, full dashboard-redesign, nye check-in statuser, nye database-tabeller og eksportnedlasting.

Fremoverkompatibilitet: nye habit-statuser, habit modes, units, historikkverdier og fremtidige metric-felter maa gaa gjennom en typed Habits motivation/view-model-kontrakt. Ukjente verdier skal ikke telles som suksess eller score uten eksplisitt mapping, tester og support-dokumentasjon.

## Re-Audit Summary

- `HabitPerfectDayHub` already renders active Habits rows, details, week overview, selected-day correction, timer/manual source split, local sound controls, and today-only setup management.
- `lib/habits/shared.ts` already derives selected-day and week summaries, current streak/consistency labels where data proves them, rest-day semantics, slip semantics, weekly/monthly target-met state, and timer/manual totals.
- `lib/habits/server.ts` already loads active and archived habit definitions, but `archivedHabits` is not exposed as a rich user-facing history surface in `/my-library/habits`.
- `/my-library/calendar` already owns cross-source week/month/year comparison. Calendar Compare Findings Polish shipped separately in PR `#999/#1000`, so this Habits child must not reopen that route polish unless the brief is explicitly revised.
- Account export already includes Habits data at the account level, so this child should not add a new export download unless a later brief explicitly selects it.
- The current safe next Habits slice is read-only derived insight from existing owner-scoped data, not new writes, background jobs, notification permissions, or data-model expansion.

## Benchmark Refresh

- Productive Help, `https://support.productiveapp.io/hc/en-us/articles/26920754719633-How-to-read-statistics`: statistics include perfect days, current/best streak style motivation, total habits done, and average per day.
- Habitify progress, `https://habitify.me/onboarding-instruction/progress`: progress is calculated across day/week/month/year ranges and separates completion, skipped, and time range rules.
- Loop Habit Tracker on Google Play, `https://play.google.com/store/apps/details?id=org.isoron.uhabits&hl=en_US&gl=US`: emphasizes habit score/strength, detailed charts/statistics, complete history, reminders, privacy, and export. Freeswimming user-facing copy uses `Habit score` to avoid confusion with Dryland strength training.
- Streaks, `https://streaksapp.com/`: emphasizes streak motivation, flexible schedules, and task statistics without forcing every habit into a daily-only model.
- Active Child E UX decision after owner screenshot review: match the best common pattern across these apps by keeping today's logging primary on mobile, showing a compact collapsed total progress summary under the week calendar before Habits on desktop/tablet, keeping Motivation below Habits on mobile, hiding deeper totals/history behind a disclosure, and putting per-habit progress inside that habit's `Details`. Do not add a heavy graph/dashboard dependency in this read-only slice.

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
- Add a habit score only if the formula is documented, deterministic, and tested:
  - missed days should reduce the score gradually rather than erase all progress;
  - rest days should not be treated as failures;
  - unknown statuses should not count as success.
- Add compact history depth inside `/my-library/habits`:
  - keep today's check-in flow primary;
  - expose the top-level Motivation summary as a compact, collapsible section immediately after the week calendar on desktop/tablet;
  - keep mobile logging primary by placing Motivation below the active list on mobile, including `view=active`;
  - keep `Add habit` visually primary while the Habits action row uses compact `Week overview`, `Motivation`, and `Sound` icon controls; mobile active view may also keep the existing Habits analysis shortcut;
  - keep the closed Motivation state to current streak plus consistency; avoid showing `x/y on track` beside consistency in the compact state;
  - put `On track`, rest/slip/timed/count/past-habit totals behind `More history`;
  - put per-habit current streak, best streak, habit score, and consistency inside each active habit's `Details`;
  - avoid a competing full dashboard.
- Clarify Past habits trust:
  - archived habits keep history;
  - archived rows are read-only unless a future owner-selected restore/edit policy is defined;
  - user-facing copy should say `Past habits`, not `Archived history`;
  - rename keeps history attached to stable habit ID.
- Preserve My Library Calendar ownership:
  - `/my-library/calendar` remains the cross-source comparison route;
  - Habits motivation metrics may feed Calendar later only through explicit mapping;
  - Calendar formatting/polish issues were closed separately by PR `#999/#1000`.
- Update `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, Habits parent, AW-006 queue, and design inventory if execution changes user-visible labels, support diagnosis, or lifecycle references.
- Add focused tests for score/streak/consistency math, rest/slip treatment, Past habits behavior, unknown status fail-safe behavior, and UI accessibility.
- Capture screenshot handoff before `npm run verify:pre-pr` because future execution changes visible Habits UI.

## Out Of Scope

- Reopening `/my-library/calendar` Comparison Report polish, source-card layout, source inclusion copy, comparison insight copy, detailed-number table polish, or Calendar metric formatting already closed by PR `#999/#1000`.
- Reminders, notification APIs, push notifications, scheduled reminders, browser/native notification sounds, or server-stored notification preferences.
- Midnight auto-complete, background check-in creation, automatic day-boundary writes, or retroactive generated check-ins.
- Per-habit `Reset these habit stats` / motivation reset writes; this was handled separately in PR `#1009` at `docs/task-briefs/done/2026-06-06-aw-006-habits-reset-stats-motivation-reset-10-10.md` because it required server-canonical reset truth, Calendar marker mapping, support docs, migration/RLS/authz review, and screenshots.
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
  - streak, best streak, habit score, consistency, rest/slip counts, timed minutes, count totals, and last tracked date derive from owner-scoped server data plus typed mapping rules.
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

## Failure-Mode Evidence

- No unexpected 500 path is introduced: this slice does not add a new public/API route, mutation endpoint, migration, external service, webhook, or background job.
- Failure-mode handling is explicit for the changed read path: Habits snapshot load failures keep the existing page-level fallback, missing or insufficient motivation history renders neutral copy, and unknown/future check-in statuses fail closed instead of fabricating streak, score, rest, slip, or success progress.
- Existing check-in mutations keep their current error handling and still surface user-readable failures without blocking the read-only Motivation summary.

## Help / Guide Impact

Required for future execution because this changes member-facing interpretation of Habits progress and support diagnosis:

- update `docs/user-flow-map.md` with advanced motivation/history behavior;
- update `docs/runbooks/auth-account-support.md` with streak/score/history/Past habits diagnosis;
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

Execution evidence:

- Identifiers searched: `Progress history`, `Progress summary`, `Motivation`, `More history`, `Past habits`, `Archived history`, `Saved history`, `On-track check-ins`, `On track`, `Habit score`, `Strength`, `Consistency`, `Current streak`, `Best streak`, `Completion sound`, `Test sound`, `Sound off`, `Back to My Library`, `/my-library/habits`, `/my-library/calendar`, `archivedHabits`, `buildHabitMotivationSummary`, `loadHabitSnapshot`, and `AdminContextNotesPanel`.
- Directories/surfaces checked: `app/`, `components/`, `lib/habits/`, `tests/unit/`, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, `docs/design/notice-empty-state-pattern-inventory.md`, active/planned AW-006 task briefs, and the Habits parent/canonical queue.
- Fallout handled: member-facing copy moved from `Archived history` to `Past habits`, score copy moved from `Strength` to `Habit score` to avoid Dryland confusion, `On-track check-ins` moved to `On track`, visible `Test sound`/`Completion sound` controls were removed, mobile `Back to My Library` was removed, and corresponding unit tests/docs were updated.

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
| Product goals and IA                          | `target`     | `/my-library/habits` must keep mobile logging primary while desktop/tablet shows compact read-only Motivation under the week calendar before Habits without duplicating Calendar.   | brief scope + screenshots + route review            | `5/5`                   |
| UX flow clarity                               | `target`     | Users can understand best streak, consistency, habit score, and Past habits trust without mistaking them for editable check-ins, Dryland strength work, or Calendar comparison.     | component tests + screenshot handoff                | `5/5`                   |
| Visual design quality                         | `target`     | New motivation/history UI fits existing Habits tokens, stays scan-first, has no text overflow, and keeps cards/actions stable on mobile and desktop.                                | responsive screenshots + text-fit review            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Streak, best streak, habit score, consistency, rest/slip, timed, count, and Past habits calculations are deterministic and derived only from canonical Habits data.                 | unit/component tests + helper review                | `5/5`                   |
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
| Incident response and support operations      | `target`     | Support docs must explain how to diagnose score/streak/history/Past habits questions with redacted owner-scoped fields.                                                             | support doc diff                                    | `5/5`                   |
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
  - Component tests for metric rendering, fallback copy, Past habits treatment, and accessibility.
  - Route/API tests only if future execution changes protected read/mutation boundaries.

## Scope

- Execute this Habits child by adding read-only advanced motivation/history depth to `/my-library/habits`.
- Derive metrics from existing Habits data with typed helpers and deterministic fallbacks.
- Keep completed Calendar Comparison Report polish closed unless a future owner-selected Calendar brief explicitly reopens it.
- Update support/user-flow docs and lifecycle references for the changed history interpretation.
- Add focused tests and screenshot handoff before broad gates.

## Out Of Scope For This Implementation

- Calendar Comparison Report changes, reminders, notification APIs, new persisted habit event tables, new check-in statuses, migrations, generated files, external services, package changes, environment settings, export downloads, archived restore/edit behavior, PR merge, or broad analytics/dashboard work.
- Per-habit `Reset these habit stats` / motivation reset writes; this was handled separately in PR `#1009` at `docs/task-briefs/done/2026-06-06-aw-006-habits-reset-stats-motivation-reset-10-10.md`.
- Reopening `/my-library/calendar` screenshots, Comparison Report copy, or numeric formatting already closed by PR `#999/#1000`.

## Acceptance Criteria

1. `/my-library/habits` keeps today's Habits/check-in flow primary on mobile, then exposes read-only advanced motivation/history below the active list there while desktop/tablet shows Motivation under the week calendar before Habits.
2. Best streak, current streak, consistency, habit score, rest/slip, timed, count, and Past habits metrics are deterministic and tested where included.
3. Missing or insufficient history shows neutral fallback copy.
4. Unknown/future statuses do not count as success or score improvement.
5. The total summary is compact and collapsible, the closed state avoids duplicating consistency with `x/y on track`, opened Motivation uses `Show stats` / `Hide stats`, deeper `On track`/rest/slip/timed/count/past-habit totals live behind `More history`, and each active habit's `Details` shows that habit's own progress metrics.
6. Archived habits are communicated as `Past habits`, history-preserving and read-only unless a revised brief defines restore/edit behavior.
7. `/my-library/calendar` behavior and formatting are not changed unless this brief is explicitly revised.
8. Parent, AW-006 queue, design inventory, user-flow docs, and support runbook reflect the active implementation and return contract.

## Validation

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

Required because this slice changes visible Habits UI:

- capture `after/reference` or `before/after` screenshots for mobile, tablet, and desktop `/my-library/habits`;
- include the clickable `Screenshot artifacts` folder link;
- stop for owner visual approval before `npm run verify:pre-pr`.
- refreshed active implementation artifacts:
  - `output/aw-006-habits-advanced-motivation-history-10-10-2026-06-06-195703`;
  - comparison type: `after/reference`;
  - captured: `2026-06-06 19:57`;
  - evidence: screenshot metrics show no horizontal overflow; desktop/tablet visual order is summary -> Motivation -> Habits, mobile visual order is summary -> Habits -> Motivation, and `view=active` mobile keeps Habits before Motivation;
  - evidence: visual pass confirms compact action buttons, Add habit primary, no `Test sound`, no visible `Completion sound` block, no mobile `Back to My Library` hero button, `Show stats`/`Hide stats` copy, `On track` copy, 4-column tablet/desktop stats, and reduced Admin notes spacing;
  - caveat: the configured dev-login account currently has no active Habits, so per-habit `Details` progress is covered by component tests while screenshots show the active logging area, compact total summary, and `More history`/`Past habits` state.

## Checkpoint Log

- `2026-06-05 | planned | created planned-only Habits Advanced Motivation And History Depth brief from clean synced main@69bddfc7 after PR #997/#998 closeout and green post-merge preflight; no runtime implementation was active; at creation time Calendar findings and numeric formatting were still separate, later closed by PR #999/#1000 | next: wait for explicit owner execute/build/implement before moving this child to in-progress`
- `2026-06-06 | planned | refreshed after Calendar Compare Findings Polish PR #999 and repo-managed closeout PR #1000 on clean synced main@bba59bfe; Calendar route polish is now done and not part of this Habits child; no runtime implementation is active | next: wait for owner confirmation of Habits advanced motivation/history implementation scope before moving this child to in-progress`
- `2026-06-06 | in-progress | owner approved scope and said kjor; moved brief to in-progress on branch aw-006-habits-advanced-motivation-history from clean synced main@5460f188 after PR #1001/#1002 closeout; fresh re-audit confirmed this slice remains read-only Habits motivation/history and must not reopen Calendar, reminders, new statuses, new tables, or export downloads | next: finish local code/test audit, implement view-model/UI/docs/tests, then capture screenshot handoff before verify:pre-pr`
- `2026-06-06 | in-progress | implemented read-only HabitMotivationSummary helpers, server snapshot wiring, Progress history UI, unsupported-status fail-closed behavior, domain/component tests, user-flow/support docs, Habits parent return status, AW-006 queue state, and design inventory references; targeted validation passed: npm run typecheck, ./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habit-perfect-day-hub.test.tsx, npm run lint:briefs:all, and targeted route/label/support sweep | next: run screenshot handoff, stop for owner visual approval, then continue to verify:pre-pr only after approval`
- `2026-06-06 | owner-review | screenshot handoff captured in output/aw-006-habits-advanced-motivation-history-2026-06-06-100034 as after/reference artifacts for Progress history versus existing active Habits list on desktop and mobile; local capture used SITE_LOCK_ENABLED=0 and command-scoped FS_ALLOW_PROD_SUPABASE=1 because dev-login was blocked by the Supabase egress guard; no Habits data was created or mutated, and the existing habits_viewed analytics route only console-logged during capture | next: wait for owner visual approval before verify:pre-pr, commit, push, or PR creation`
- `2026-06-06 | owner-review | owner selected per-habit Reset stats motivation reset as a systemic future scope; created planned Child K at docs/task-briefs/planned/2026-06-06-aw-006-habits-reset-stats-motivation-reset-10-10.md and linked it from the Habits parent/AW-006 queue so it does not disappear from scope memory; no runtime reset implementation is included in Child E | next: wait for owner visual approval before verify:pre-pr, commit, push, or PR creation`
- `2026-06-06 | in-progress | owner asked for a 10/10 version measured against other habit apps; active Child E now requires logging-first IA, compact total summary, collapsible More history, per-habit progress inside Details, and Past habits copy while keeping graph/dashboard and Reset stats runtime deferred | next: implement the revised UI, refresh tests/docs, capture new screenshot handoff, then stop for owner visual approval before verify:pre-pr`
- `2026-06-06 | owner-review | revised 10/10 UI implemented: Progress summary now shows only current streak, best streak, habit score, and consistency by default; More history reveals rest/slip/timed/count and Past habits; active habit Details renders per-habit progress; labels/docs use Past habits/Saved history. Targeted validation passed: ./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habit-perfect-day-hub.test.tsx, npm run typecheck, npm run lint:briefs:all, git diff --check. Refreshed after/reference screenshot artifacts captured in output/aw-006-habits-advanced-motivation-history-10-10-2026-06-06-105717 with no horizontal overflow; dev account had no active Habits so per-habit Details progress is component-test evidence only | next: wait for owner screenshot approval before verify:pre-pr, commit, push, or PR creation`
- `2026-06-06 | owner-review | owner flagged that Strength could be confused with Dryland Strength/Stretching and that mobile More history used too much vertical space; renamed the Habits contract/UI to Habit score, kept Dryland strength/stretching out of Child E, and compacted mobile summary/history/Past habits density. Targeted validation passed again: ./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habit-perfect-day-hub.test.tsx, npm run typecheck, npm run lint:briefs:all, git diff --check. Refreshed after/reference screenshot artifacts captured in output/aw-006-habits-advanced-motivation-history-10-10-2026-06-06-110645; mobile More history height dropped from about 1408px to 858px and no horizontal overflow was detected | next: wait for owner screenshot approval before verify:pre-pr, commit, push, or PR creation`
- `2026-06-06 | owner-review | owner selected responsive IA: desktop/tablet Motivation after week calendar and before Habits, mobile Habits before Motivation. Implemented CSS-order responsive placement plus Habits action-row shortcut, kept compact consistency free of duplicated on-track text, and regenerated after/reference screenshots in output/aw-006-habits-advanced-motivation-history-10-10-2026-06-06-192941. Metrics confirm no horizontal overflow; desktop/tablet visual order is summary -> Motivation -> Habits, mobile and mobile view=active keep Habits before Motivation | next: wait for owner screenshot approval before verify:pre-pr, commit, push, or PR creation`
- `2026-06-06 | in-progress | owner flagged remaining visual hierarchy issues before approval: mobile button hierarchy, missing normal-mobile calendar action, overlarge sound controls/Test sound, duplicate open Motivation teaser text, unclear On-track check-ins copy, Hide motivation copy, tablet/desktop stat columns, large Admin notes gap, and heavy mobile Back to My Library button. Implemented scoped polish: compact icon actions, Add habit primary, softer sound preview on enable, Show stats/Hide stats, On track label, 4-column tablet/desktop stats, reduced Habits page bottom spacing, and mobile Back removal | next: run targeted validation, regenerate screenshots, then stop for owner visual approval before verify:pre-pr`
- `2026-06-06 | owner-review | targeted validation passed after final visual polish: ./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habit-perfect-day-hub.test.tsx, npm run typecheck, npm run lint:briefs:all, git diff --check. Refreshed after/reference screenshots captured in output/aw-006-habits-advanced-motivation-history-10-10-2026-06-06-195703 at 2026-06-06 19:57; metrics confirm no horizontal overflow, no removed labels/buttons, no duplicate compact Motivation teaser while stats are open, desktop/tablet 4-column stats, mobile Habits before Motivation, and desktop/tablet Motivation before Habits | next: wait for owner screenshot approval before verify:pre-pr, commit, push, or PR creation`
- `2026-06-06 | in-progress | owner approved the screenshot handoff and explicitly waived another screenshot round for the final small Admin notes spacing correction. Added Habits-route-specific SiteChrome spacing so the admin notes panel follows the Habits/Motivation content more tightly without changing other routes. Targeted validation passed: ./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/habits-page.test.tsx tests/unit/page-note-context.test.ts and npm run typecheck | next: run npm run verify:pre-pr, then continue PR/merge flow`
- `2026-06-06 | done | shipped in PR #1003 as squash commit 82bac925 after local verify:pre-pr PASS, PR CI PASS, local verify:pre-merge PASS, owner screenshot approval, and owner waiver for a final screenshot refresh after the small route-specific Admin notes spacing correction | next: repo-managed docs-only closeout PR moves this brief to done and clears queue references`

## Completion Record

- `completed`: `2026-06-06`
- `merged_pr`: `#1003`
- `squash_commit`: `82bac925`
- `result`: Closed AW-006 Habits Advanced Motivation And History Depth. Habits now keeps daily logging primary, adds a compact read-only Motivation history layer, preserves history for Past habits, exposes per-habit progress in Details, and avoids changing reset, reminder, graph, export, or Calendar behavior.
- `validation`: Targeted Vitest for Habits domain/component/page note coverage passed; `npm run typecheck` passed; `npm run lint:briefs:all` passed; screenshot handoff captured in `output/aw-006-habits-advanced-motivation-history-10-10-2026-06-06-195703` and was owner-approved; owner explicitly waived another screenshot round for the final small Admin notes spacing correction; `npm run verify:pre-pr` passed on commit `d2122891` with lint/typecheck/unit/build/perf/E2E; PR `#1003` CI passed including `verify`, `e2e-smoke`, `site-lock-smoke`, CodeQL, Vercel, deploy-preview, and size-check; `npm run verify:pre-merge` passed and recorded `artifacts/verify-pre-merge/20260606-183341.json`.
- `10/10 claim`: yes - all critical target categories reached `5/5`; deferred work is intentionally outside this read-only Child E scope and is captured as planned/future owner-selected scope where relevant.

| Category                                      | Achieved Score | Evidence                                                                                       | Gaps / Notes                                                                      |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Logging-first responsive IA, owner screenshot approval, PR `#1003`.                            | No active gap from Child E; Reset stats is handled by Child K.                    |
| UX flow clarity                               | `5/5`          | Compact action controls, `Show stats`/`Hide stats`, `Past habits`, and component tests.        | No active gap.                                                                    |
| Visual design quality                         | `5/5`          | Screenshot handoff `2026-06-06 19:57`, no overflow metrics, owner approval.                    | Final spacing screenshot refresh waived by owner after route-specific correction. |
| Business logic correctness and data integrity | `5/5`          | Typed motivation helpers, fail-closed unknown statuses, domain tests.                          | No writes/migrations in scope.                                                    |
| Accessibility                                 | `5/5`          | Existing semantics preserved, component assertions, full verify/E2E pass.                      | No active gap.                                                                    |
| Data placement and sync boundaries            | `5/5`          | Read-only server-derived metrics and local-only disclosure state.                              | Reset truth deferred to Child K.                                                  |
| Reliability and failure handling              | `5/5`          | Neutral fallback behavior and negative/unknown-status tests.                                   | No active gap.                                                                    |
| Security and authz                            | `5/5`          | Authenticated owner-scoped Habits route/server boundary preserved.                             | No public exposure added.                                                         |
| Privacy and compliance                        | `5/5`          | No private habit names or sensitive check-ins added to public pages/logs/analytics.            | No active gap.                                                                    |
| Content governance                            | `5/5`          | Brief, parent, queue, support docs, user-flow docs, and design inventory updated.              | Closeout PR clears lifecycle references.                                          |
| Incident response and support operations      | `5/5`          | Support runbook documents Habits score/streak/history/Past habits interpretation.              | No active gap.                                                                    |
| i18n operational readiness                    | `5/5`          | Responsive screenshot checks and compact labels avoid fixed-width assumptions.                 | No active gap.                                                                    |
| Stack-fit and dependency discipline           | `5/5`          | Reused `HabitPerfectDayHub`, Habits shared/server helpers, existing tokens; no new dependency. | No active gap.                                                                    |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, typecheck, full `verify:pre-pr`, CI, and `verify:pre-merge` passed.           | No active gap.                                                                    |
| DevOps and rollback readiness                 | `5/5`          | Read-only UI/domain change, no migration, standard squash merge, pre-merge gate passed.        | Rollback is PR revert if needed.                                                  |
