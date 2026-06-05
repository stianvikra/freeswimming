# Task Brief: AW-006 Habits Timed Manual Time + Pending Date + Analysis Shortcut (10/10)

## Metadata

- `id`: `2026-06-05-aw-006-habits-timed-manual-time-pending-date-analysis-shortcut-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-05`
- `updated`: `2026-06-05`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-habits-timed-manual-pending-analysis`
- `execution_mode`: `end-to-end after owner explicitly said "ok gjor det du maa for aa faa det 10/10"`
- `resolved_findings`: planned `H-036`, `H-037`, `H-038`
- `deferred_findings`: sound/preferences, midnight auto-complete, Habits Advanced Motivation/history-dashboard, reminders, micro-session audio, broader analytics dashboard, and unrelated Habits redesigns remain out of scope.
- `return_checkpoint`: update the Habits parent before closeout-ready handoff.

## Brief Audit Record

- `last_audited`: `2026-06-05`
- `base`: `main@dfc6a362`
- `audit_status`: `ready`
- `decision`: Execute this as the active Habits slice, with a small persisted timer/manual source contract plus UI feedback and analysis shortcut.
- `reason`: `main` is clean and synced after Habits Persisted Litres Unit Migration PR `#991` and repo-managed closeout PR `#992`; post-merge preflight was reported green. Fresh audit found the current UI still treats manual time as additive input and stores timed progress as one `habit_check_ins.value_numeric`, so 10/10 requires explicit server-canonical timer/manual source fields before the UI can truthfully show separate sources and one total.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, `lib/habits/server.ts`, habits API/check-in storage, Supabase migrations/types, My Library calendar href contract, support docs, screenshot handoff rules, or verification lanes change before this branch is complete.

## Goal

Make timed Habits persist and display timer time and manual time as separate per-habit/per-date sources, keep the visible total deterministic, show immediate pending date feedback, and add a mobile Habits analysis shortcut using canonical calendar params.

## Pre-Implementation Owner Explanation

Vi skal gjore tid i Habits mer tillitsverdig: manual tid blir et redigerbart tall per habit og dato, timer-tid og manual-tid vises separat, og brukeren ser en tydelig total.

Hvorfor det betyr noe: Hvis en bruker endrer manual tid fra 2 til 5 minutter, skal systemet forstaa at manualdelen er 5 minutter, ikke 7. Det hindrer dobbeltelling og gjor historikken tryggere.

Utenfor scope er lyd, reminders, midnight auto-complete, Habits Advanced Motivation/history-dashboard, micro sessions/training-balloon audio, andre Habits-redesigns og stor analytics-dashboard.

Fremoverkompatibilitet: nye tidskilder maa eksplisitt mappes inn i totalberegningen for de teller; analysis-lenken bruker canonical calendar-parametre; ukjente habit units eller time sources faller trygt tilbake og krever mapping/test for de paavirker totals.

## Re-Audit Summary

- `habit_check_ins` currently stores one numeric check-in value in `value_numeric`; no persisted source split exists.
- Pre-implementation `HabitPerfectDayHub` derived timed total from saved numeric minutes plus local timer seconds, and `addManualTime` added input on top of saved/local time.
- Current historical timed behavior already blocks active timer controls on non-today selected dates; keep that rule.
- Current date navigation uses links plus `router.push`, but the selected state only reflects the loaded snapshot date. The slice needs a separate requested/pending date state so stale data is not styled as fully loaded.
- `/my-library/calendar` already owns the shared source/period/date param model. The new Habits shortcut must use `/my-library/calendar?source=habits&period=week&date=<selectedDate>`.
- Productive official help separates manual time from timer time and binds timer use to the current day, while retroactive dates use manual entry. This supports the active-timer-today/manual-history split.

## Selected Scope

- Add persisted timer/manual fields to `habit_check_ins`:
  - `timer_seconds integer not null default 0`
  - `manual_minutes integer not null default 0`
  - keep `value_numeric` as total minutes for compatibility, summaries, and older reads.
- Update generated DB types and Habits select/view/request contracts.
- Update check-in API validation so timed habits can save timer seconds and manual minutes explicitly.
- Implement manual absolute edit semantics:
  - manual input is whole minutes,
  - `0` is valid,
  - max is bounded,
  - changing `2` to `5` sets manual to `5`, not `2 + 5`.
- Keep timer and manual sources separate in the UI and show one clear total.
- Keep active timer controls today-bound; historical timed dates remain manual-editable.
- Add pending selected-date UI state:
  - amber ring while requested date is loading,
  - selected/original state only after loaded snapshot confirms that date,
  - clear fallback/error if date load fails.
- Add mobile graph/analysis action next to the calendar action with accessible name `View Habits analysis`.
- Make the mobile action row fit at narrow width with `Add habit`, calendar, and graph actions.
- Update support/user-flow docs and queue/inventory references.
- Add focused tests for total calculation, manual absolute edit, `0` behavior, integer/max validation, pending date success/failure, canonical analysis URL, and mobile/action accessibility.
- Capture screenshot handoff before `npm run verify:pre-pr`.

## Out Of Scope

- Sound, reminders, preferences, notification settings, or user-selected sounds.
- Midnight auto-complete or automatic check-in creation.
- Habits Advanced Motivation, best-streak dashboard, month/year heatmap, or broader analytics dashboard.
- Micro Sessions/training-balloon audio.
- Broad Habits redesign or unrelated card/action/token changes.
- Merging without explicit owner approval.

## Data Placement And Sync Contract

- Server-canonical data:
  - `habit_definitions`;
  - `habit_check_ins` rows keyed by `user_id`, `habit_id`, `check_in_date`;
  - `timer_seconds` for saved timer time;
  - `manual_minutes` for saved manual external time;
  - `value_numeric` as compatibility total minutes derived from mapped timed sources.
- Local data:
  - running/paused same-day timer state in localStorage before save;
  - transient manual input text and validation state;
  - requested pending date while route navigation/server load is in progress;
  - row expansion and mobile week panel UI state.
- Derived view-model:
  - total timed seconds = persisted timer seconds + persisted manual minutes \* 60 + current local timer seconds;
  - source labels for timer/manual/legacy;
  - progress-to-target and completion state;
  - analysis href.
- Sync policy:
  - local timer is not server truth until `Finish` succeeds;
  - manual edit writes an absolute integer minute value and replaces only the manual source;
  - successful mutation returns a fresh no-store snapshot;
  - if a manual save fails, keep the input/error and do not update displayed server truth;
  - if a timer finish fails, preserve local timer state for retry;
  - date navigation sets requested date immediately and only confirms selected styling after the route snapshot for that date arrives;
  - failed date load clears pending styling and shows error/fallback without pretending stale data is loaded.
- Retention and sensitivity:
  - local timer records remain per user/date and are cleared when ineligible/saved;
  - do not log raw habit names, quit goals, notes, or manual input values.
- Cache/invalidation:
  - preserve `force-dynamic` route and no-store API responses;
  - no static cache or revalidation path is added.

## Identity And Rename Contract

- Canonical stable ID:
  - habit ID remains identity for definitions, check-ins, local timer recovery, support diagnosis, and future exports.
- Human-readable identifiers:
  - habit title is editable and must not key storage or mutations.
  - labels like `Manual time`, `Timer time`, `Total`, and `View Habits analysis` are workflow labels, not identity.
- Mutability rules:
  - manual minutes are intentionally editable per habit/date;
  - timer seconds are saved by explicit timer finish for the selected today-bound timer flow;
  - renaming a habit keeps history attached.
- Rename vs repurpose policy:
  - renaming is allowed; materially repurposing a habit remains a product/support decision before history is reused.
- Compatibility contract:
  - legacy rows without source fields read as total duration minutes and remain counted;
  - new writes populate source fields and `value_numeric`;
  - future source identifiers must not silently count until mapped.
- Observability and repair:
  - support diagnoses mismatches from owner-scoped habit ID/date, `timer_seconds`, `manual_minutes`, `value_numeric`, local timer status, and redacted timestamps.

## Forward Compatibility Contract

- Extensibility surfaces:
  - habit modes, habit units, timed source fields, check-in statuses, local timer storage version, route params, calendar source/period params, analytics payload values, Help/Guide labels, and future export fields.
- Source of truth:
  - active time total derives from mapped server fields plus current local timer state;
  - analysis route derives from the shared My Library calendar contract;
  - habit identity derives from stable habit ID.
- Additive behavior:
  - new timed habits returned by the current snapshot inherit source split UI automatically;
  - new valid dates in the week strip inherit pending/confirmed state automatically.
- Explicit mapping requirements:
  - new time sources, history/event tables, source enums, habit units, calendar sources, analytics values, exports, reminders, sounds, native integrations, or multi-timer mode require mapping, tests, and support docs before affecting totals.
- Unknown or deprecated values:
  - unknown source data is not counted as timer/manual truth;
  - unsupported calendar source/period params keep existing fail-closed behavior;
  - legacy timed rows can show a legacy total but do not invent timer/manual split.
- Test/evidence:
  - component/domain tests cover source totals, legacy fallback, unknown/future mapping guardrails, canonical analysis href, and pending date failure.

## Help / Guide Impact

Required because workflow labels and support diagnosis change:

- update `docs/user-flow-map.md` for manual edit semantics, source split, pending date feedback, and analysis shortcut;
- update `docs/runbooks/auth-account-support.md` for timer/manual source diagnosis and date-load failure guidance;
- update parent, queue, and design inventory with this child lifecycle reference.

## Route / Label / Support Surface Sweep

Required search terms:

- `/my-library/habits`
- `/my-library/calendar`
- `Manual time`
- `Add manual time`
- `Timer time`
- `timer_seconds`
- `manual_minutes`
- `value_numeric`
- `selectedDate`
- `requestedDate`
- `pending`
- `View Habits analysis`
- `source=habits`
- `period=week`

Required surfaces:

- `app/`
- `components/`
- `lib/`
- `tests/`
- `supabase/`
- `types/database.ts`
- `docs/task-briefs/`
- `docs/design/`
- `docs/runbooks/`
- `docs/user-flow-map.md`

Evidence from implementation sweep:

- identifiers searched: `Manual time`, `Save manual time`, `Add manual time`, `timerSeconds`, `manualMinutes`, `timer_seconds`, `manual_minutes`, `value_numeric`, `requestedDate`, `pendingSelectedDate`, `failedRequestedDate`, `View Habits analysis`, `/my-library/calendar?source=habits`, `source=habits&period=week`, `Week overview`, `Previous week`, `Next week`, `Add habit`, and `/my-library/habits`.
- surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `supabase/migrations/`, `types/database.ts`, `docs/task-briefs/`, `docs/design/`, `docs/runbooks/`, and `docs/user-flow-map.md`.
- fallout handled: Habits check-in API/domain/server contracts, `HabitPerfectDayHub`, calendar helper/consumer, Supabase migration/types, unit/component/route/calendar tests, support runbook, user-flow map, design inventory, parent brief, and AW-006 queue.

## API / Failure-Mode Evidence

- Timed source payloads are validated before persistence and fail with deterministic `400` responses for non-timed habits, mixed timed/non-timed values, non-integer manual minutes, out-of-range manual minutes, and out-of-range timer seconds.
- Auth and ownership remain fail-closed through the existing Habits route boundary; unchanged unauthorized/forbidden paths still return controlled responses instead of open writes.
- Storage/update failures keep the existing stable failure-mode response shape with no unexpected 500 surfaced for validation or schema-contract failures; `tests/unit/habits-routes.test.ts` covers route failure handling and the new timed source negative paths.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                         | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Timed habits provide one trustworthy time-tracking job, plus one mobile route to Habits analysis, without broad dashboard scope.                                                           | brief scope + UI tests + screenshots           | `5/5`                   |
| UX flow clarity                               | `target`     | Manual edit is visibly absolute, `0` is understandable, timer/manual/total are separate but coherent, and pending date state cannot look loaded early.                                     | component tests + screenshot handoff           | `5/5`                   |
| Visual design quality                         | `target`     | Mobile/desktop Habits controls preserve My Library tokens and fit narrow width without overlap.                                                                                            | screenshot handoff + responsive assertions     | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Timer seconds, manual minutes, total minutes, legacy numeric values, date selection, failed loads, and validation bounds are deterministic and tested.                                     | unit/component/API tests                       | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                                                                 | explicit admin-editor scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | New graph/calendar/manual controls have accessible names, keyboard support, current/pending semantics, focus visibility, and no changed-surface serious/critical issue.                    | component tests + screenshot/manual QA         | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same threshold and evidence.                                                                                                    | component tests + screenshot/manual QA         | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency; `/my-library/habits` remains route-level dynamic but should not add polling or per-second server writes.                                               | diff review + build gate                       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Brief and implementation distinguish server-canonical source fields, local timer state, requested date, confirmed snapshot date, and derived totals.                                       | data contract + tests                          | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: preserve force-dynamic/no-store freshness; mutation responses remain the invalidation mechanism.                                                                          | route/API diff review                          | `4/5`                   |
| Reliability and failure handling              | `target`     | Manual save, timer finish, date-load failure, localStorage failure, and repeated date clicks have deterministic retry/fallback behavior.                                                   | component tests + route failure test           | `5/5`                   |
| Security and authz                            | `target`     | Habits API remains authenticated/owner-scoped, validates payloads, and fails closed for invalid habit/date/source updates.                                                                 | API negative-path tests + route audit          | `5/5`                   |
| Privacy and compliance                        | `target`     | No raw habit names/manual values are added to logs or analytics; private time/check-in data stays owner-scoped.                                                                            | analytics/API diff review                      | `5/5`                   |
| Content governance                            | `target`     | Parent, queue, design inventory, user-flow docs, support docs, and this brief record the new lifecycle and source contract accurately.                                                     | docs diff + `npm run lint:briefs`              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, admin editability, role-gated CRUD, or operator support action surface changes.                                                                      | explicit admin-workflow scope rationale        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` and `/my-library/calendar` are private authenticated routes and no public metadata/sitemap/robots/canonical URL changes.                                  | private-route SEO rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public docs surface, or AI-facing public page copy.                                                           | AI discoverability scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: preserve existing event privacy; source semantics may add safe booleans/source kind without raw names or values.                                                          | analytics diff review                          | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue operation changes.                                                                      | commerce scope rationale                       | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs explain timer/manual source diagnosis, pending date/load failure, legacy rows, and repair path.                                                                               | support doc diff                               | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation.             | explicit finance scope rationale               | `N/A`                   |
| i18n operational readiness                    | `target`     | New labels and action row avoid tight fixed-width assumptions and remain readable with longer localized strings.                                                                           | responsive screenshots + component assertions  | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `HabitPerfectDayHub`, Habits helpers/API, Supabase migrations, generated types, My Library calendar contract, lucide icons, and existing tests; add no dependency.                   | code diff review                               | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused tests cover requested manual/timer/date/analysis cases, targeted commands pass, screenshots are reviewed before broad gates, and later `verify:pre-pr`/CI/`verify:pre-merge` pass. | targeted Vitest + screenshot + later gates     | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no timer polling writes, no unbounded source event table in this slice, indexed existing check-in reads remain unchanged.                                                 | migration/API diff review                      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Migration is additive/backward-compatible; rollback path is documented; no destructive data rewrite; broad gates happen after screenshot approval.                                         | migration review + PR notes + validation gates | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: current `/my-library/habits` route and `HabitPerfectDayHub`.
  - Keep `app/my-library/habits/page.tsx` as authenticated server route boundary.
  - Keep route `dynamic = "force-dynamic"` and API no-store responses.
  - Pending selected date state lives in the client component and tracks requested vs confirmed snapshot date.
- TypeScript/domain contracts:
  - Extend `HabitCheckInView`, `HabitCheckInRequestBody`, and helper functions with explicit timed source fields.
  - Add deterministic helpers for total/source calculation if JSX complexity grows.
  - Unknown/future source fields must not silently count.
- Supabase/data layer:
  - Add one forward-only migration with additive columns and non-negative bounded constraints.
  - Keep RLS owner-scoped via existing `habit_check_ins` policies.
  - Update generated DB types manually to match migration, consistent with repo pattern.
- External services:
  - No new external service, SDK, vendor, notification, HealthKit/native integration, or analytics vendor.
- UI system:
  - Reuse `fs-library-card`, `fs-cta-*`, `ui-field`, segmented action layout, lucide icons, and existing mobile action sizing.
  - Screenshot handoff type: `after/reference` or `before/after` where practical for mobile/desktop Habits.
- Testing:
  - Component tests for manual edit/source display/pending date/analysis action.
  - Domain/API tests for validation and total persistence.
  - Route/calendar contract tests for canonical analysis URL.
  - Screenshot handoff before `npm run verify:pre-pr`.

## Acceptance Criteria

- Manual timed input is whole minutes, accepts `0`, rejects non-integers/out-of-range values, and saves as absolute manual minutes.
- Total time equals persisted timer seconds + persisted manual minutes + unsaved local timer seconds.
- Timer time and manual time are displayed as separate sources; total is displayed once as the primary number.
- Legacy rows with only `value_numeric` remain readable and counted without inventing source split.
- Historical timed dates allow manual edits but no active timer start/pause/finish.
- Date clicks show pending amber feedback immediately and confirmed selected state only after loaded data.
- Failed date loads show an error/fallback and do not mark stale data as confirmed for the new date.
- Mobile Habits action row includes Add Habit, calendar, and graph/analysis action without overlap at narrow width.
- Analysis link uses `/my-library/calendar?source=habits&period=week&date=<selectedDate>` and has accessible name `View Habits analysis`.
- Support/user-flow docs and parent/queue/inventory references are updated.

## Validation

Before screenshot handoff:

- `npm run lint:briefs:all`
- `npm run typecheck`
- targeted Vitest for Habits domain/API/component/calendar tests.

After screenshot approval:

- `npm run verify:pre-pr`
- commit, push, open/update PR, monitor CI
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-05 | in-progress | created active brief on branch aw-006-habits-timed-manual-pending-analysis after fresh audit and owner 10/10 approval | next: implement new source columns, API contract, UI, docs, targeted tests, then screenshot handoff`
- `2026-06-05 | in-progress | implemented new source columns, typed Habits contracts, absolute manual time UI/API behavior, pending/failed selected-date state, canonical mobile analysis shortcut, and parent/queue/support docs updates | next: run formatting, lint:briefs, targeted tests, then capture screenshot handoff`
- `2026-06-05 | validation | npm run lint:briefs:all PASS; npm run typecheck PASS; targeted Vitest PASS for Habits domain/API/server/component plus My Library calendar contract/comparison tests (7 files, 98 tests) | next: capture screenshot handoff and stop for owner visual approval before npm run verify:pre-pr`
- `2026-06-05 | screenshot | captured after/reference Habits screenshots in output/aw006-habits-manual-pending-analysis-2026-06-05-151445; deterministic dev harness used only for local screenshot capture because Supabase egress guard blocks dev auth, then removed from the diff | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-05 | approval | owner approved screenshot handoff with no visual corrections requested; no product-rendering files changed after capture | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-06-05 | supabase-schema-applied | first npm run verify:pre-pr failed because 20260605120000_habits_timed_source_totals.sql was pending on the linked remote; Supabase projects list confirmed linked project freeswimming-org-prod, migration list and dry-run showed only that migration pending, npx supabase db push --linked applied it, post-apply migration list matched local/remote at 20260605120000, dry-run reported Remote database is up to date, and linked typegen confirmed manual_minutes/timer_seconds in Row/Insert/Update | next: rerun npm run verify:pre-pr`
- `2026-06-05 | pre-pr-evidence-fix | second npm run verify:pre-pr passed branch-current and Supabase drift, then quality-gate stopped on missing explicit no unexpected 500/failure-mode and route/label/support sweep identifiers/surfaces evidence; brief now records deterministic API failure-mode behavior, identifiers searched, surfaces checked, and fallout handled | next: rerun npm run verify:pre-pr`
- `2026-06-05 | pre-pr-pass | npm run verify:pre-pr passed full lane at artifacts/test-runs/20260605-153603/verify.log with branch-current, Supabase drift up to date, quality gates, lint/typecheck, 229 unit files / 1375 tests, build, perf budgets, and Playwright 106 passed / 530 skipped; perf-budget recommendation was hold because worst margin was 13.7% vs 15.0% tighten threshold | next: rerun npm run verify:pre-pr after this checkpoint-only brief update, then commit/push/open PR`
