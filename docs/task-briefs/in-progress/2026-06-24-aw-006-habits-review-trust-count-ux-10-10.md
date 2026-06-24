# Task Brief: AW-006 Habits Review Trust And Count UX (10/10)

## Metadata

- `id`: `2026-06-24-aw-006-habits-review-trust-count-ux-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-24`
- `updated`: `2026-06-24`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_intake`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `parent_child`: Child W
- `execution_mode`: `owner said "kjør Child W"; implement scoped runtime/docs/tests end-to-end on branch aw-006-habits-review-trust-count-ux`
- `strict_10_10_mode`: `yes; screenshot approval stop is required before PR gates`

## Brief Audit Record

- `last_audited`: `2026-06-24`
- `base`: clean synced `main@c493ce51`; branch `aw-006-habits-review-trust-count-ux`; parent intake has uncommitted 2026-06-24 audit refresh in this working tree.
- `audit_status`: `ready`
- `decision`: Execute Child W as the active Habits implementation child.
- `reason`: The 2026-06-24 Habits audit found trust gaps around local-only absence review acknowledgement, percent-first Weekly Overview copy, possible future-date check-in writes, and unclear Calendar count denominators from month-cell labels such as `4/10 habits`, `micro units`, and `Week total` rows with `No sessions`.
- `must_refresh_before_execution_if`: Refresh if `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, `lib/habits/server.ts`, `app/api/my-library/habits/check-ins/route.ts`, `lib/my-library/calendar-daily-layers.ts`, `lib/my-library/calendar.ts`, `components/my-library/CalendarPlanWeekHub.tsx`, Today/Home Habits entrypoints, Help/Guide/support docs, scorecard categories, screenshot rules, or verification lanes change before execution.

## Goal

Make Habits review and count labels trustworthy across Habits, Today/Home, Calendar, and protected writes without expanding into timezone, broad Calendar redesign, or performance work.

## Pre-Implementation Owner Explanation

Vi skal forst sikre at Habits viser og lagrer tillitsskapende sannhet: dager som er gjennomgatt skal ikke dukke opp igjen uten grunn, weekly progress skal vaere konkret antall heller enn en uklar prosent, API-et skal ikke kunne skrive fremtidige check-ins, og kalenderen skal vaere tydelig paa hva `4/10 habits`, `micro units` og `No sessions` faktisk teller.

Hvorfor det betyr noe: Habits er en tillitsflate. Hvis samme dag kommer tilbake etter review, hvis ulike flater teller forskjellig, eller hvis kalenderen viser uklare denominators, vil brukeren tvile paa statsene.

Utenfor scope er timezone/local-midnight-kontrakt, all-unresolved review backlog, setup-guide, bred Calendar-redesign, performance-optimalisering, reminders, eksport, hard delete og generell e2e-hardening.

Fremoverkompatibilitet: nye habit-typer, cadence-regler, review-statuser og Calendar-kilder skal enten flyte gjennom typed view-models automatisk, eller kreve eksplisitt mapping med fail-closed fallback og tester.

## Parent Findings Owned

| Finding | Disposition in Child W                                                                          |
| ------- | ----------------------------------------------------------------------------------------------- |
| `H-067` | Owns durable or explicitly scoped absence review acknowledgement.                               |
| `H-068` | Owns count-first Habits Weekly Overview labels.                                                 |
| `H-069` | Owns protected future-date check-in rejection.                                                  |
| `H-076` | Owns Calendar count-parity audit and any minimal label/contract fix needed to align with H-068. |

Not owned:

- `H-070`: local timezone/today boundary; Child X.
- `H-071`: widening review to all unresolved historical days; product decision before any query expansion.
- `H-072`, `H-073`, `H-075`: broader test/docs hardening; Child Y except docs touched directly by this slice.
- `H-074`: snapshot history performance; Child Z.

## Product Direction

1. Absence review acknowledgement:
   - decide whether review acknowledgement must be server-canonical now;
   - if persisted, store only the minimal owner/date/review state needed to prevent repeated prompts;
   - if intentionally local-only, document the limitation and make repeat prompts an accepted product behavior.
2. Habits Weekly Overview:
   - replace percent-first user-facing labels with count-first labels;
   - keep percent only where it is clearly an analysis/comparison metric;
   - do not change underlying Perfect Day math unless the audit proves the denominator is wrong.
3. Protected check-in writes:
   - reject future `checkInDate` values in protected write paths;
   - define "future" against the current agreed date contract for this slice;
   - keep UI future-date prevention as defense-in-depth, not the only guard.
4. Calendar count parity:
   - audit whether Calendar month cells use due habits, active habits, or Perfect Day habits in labels like `4/10 habits`;
   - audit why denominators can vary, for example `3/9 habits`, `4/10 habits`, and `5/11 habits`;
   - audit `micro units` as a distinct source label and keep it separate from habit truth;
   - audit `Week total` rows that say `No sessions` while the same week row visually contains habits or micro units;
   - fix only the minimal shared count/label contract in this child, or defer broader Calendar redesign with explicit rationale.

## Current Audit Questions To Answer Before Runtime Edits

| Surface               | Question                                                              | Required decision/evidence                                                 |
| --------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Habits review         | Does acknowledgement need to persist across day/browser/device?       | Server-canonical implementation or explicit local-only product limitation. |
| Habits weekly         | Is denominator due habits, active habits, or Perfect Day habits?      | One typed label contract and tests.                                        |
| Calendar month cell   | What does `4/10 habits` count?                                        | Same denominator language as Habits or documented adapter reason.          |
| Calendar week total   | Does `No sessions` mean no swim sessions only, or no activity at all? | Label must not contradict visible habits/micro units.                      |
| Weekly any-day habits | Does the count land on performed day, period-end missed day, or both? | Domain test evidence; no double counting.                                  |
| API writes            | Can an authenticated caller post a future check-in?                   | Negative route test and fail-closed guard.                                 |

## Current Audit Decisions

- Habits review acknowledgement is now server-canonical in `habit_absence_review_acknowledgements`, keyed by owner, review scope, and date. Local storage remains only as a migration/fallback cache when old snapshots do not expose the new server field.
- `Done with this day` and `Close review` upsert acknowledgement rows only; they never write `habit_check_ins`, rest days, slips, misses, or reset boundaries.
- Habits Weekly Overview and Calendar compact Habits labels split daily and weekly cadence truth: daily day chips use daily `x/y habits`, weekly completions get credit on the performed date, and unfinished weekly Habits are summarized in the week total instead of making Sunday look like a failed daily Habit.
- Calendar keeps Micro Session units as a separate source label and adds Micro week totals for completed units, distinct exercises, reps, and kg load when those values exist; empty swim totals still say `No swim sessions`.
- Protected habit check-in writes reject future `checkInDate` values before habit lookup or check-in upsert.
- Weekly any-day and monthly any-day behavior remains owned by the existing Habits day-summary contract; this child changes labels and guards, not cadence math.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                       | Evidence                                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Habits and Calendar counts express the same user-facing object level, and absence review has a clear persistence decision.                                               | component tests, Calendar count audit, screenshot handoff     | `5/5`                   |
| UX flow clarity                               | `target`     | Users can understand reviewed dates, weekly counts, Calendar habit counts, micro units, and session-only week totals without decoding percentages.                       | screenshots, user-flow/docs updates                           | `5/5`                   |
| Visual design quality                         | `target`     | Changed Habits/Calendar labels fit mobile and desktop without overlap, clutter, or ambiguous chip hierarchy.                                                             | screenshot handoff                                            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Review acknowledgement cannot silently rewrite habit history; future check-ins are rejected; count denominators are deterministic and tested.                            | domain/unit tests, route negative-path tests, component tests | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this child changes private user Habits/Calendar surfaces, not admin editor CRUD, publishing, or operator queues.                                             | explicit admin-editor scope rationale                         | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Changed labels, buttons, chips, and selected-day states have accessible names, semantic status text, visible focus, and no color-only meaning.                           | Testing Library assertions and screenshot/manual review       | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same labels, status, focus, and non-color-only requirements.                                                  | Testing Library assertions and screenshot/manual review       | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no broad history/performance refactor; changes must not add heavy dependencies or unbounded reads.                                                      | dependency diff, query/window review                          | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server/local/derived ownership is explicit for review acknowledgement, check-ins, Habits counts, Calendar counts, and micro-unit labels.                                 | data contract plus tests                                      | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Review acknowledgement and check-in writes refresh or invalidate the affected Habits/Calendar prompt/count state predictably.                                            | cache/invalidation review and tests                           | `5/5`                   |
| Reliability and failure handling              | `target`     | Failed acknowledgement/check-in writes degrade without corrupting history; unavailable local storage or route failures have deterministic UI fallback.                   | negative-path tests                                           | `5/5`                   |
| Security and authz                            | `target`     | Protected habit check-in and any acknowledgement write remain owner-scoped, authenticated, input-validated, and fail closed.                                             | route negative-path tests                                     | `5/5`                   |
| Privacy and compliance                        | `target`     | Review/count payloads and analytics/support logs store only dates/counts/status IDs where needed, not habit notes or unnecessary free text.                              | payload/log review                                            | `5/5`                   |
| Content governance                            | `target`     | API contracts, user-flow docs, Help/Guide/support text, and parent brief describe the same review/count behavior.                                                        | docs diff, route/label/support sweep, brief updates           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, role-gated admin CRUD, admin editability, or operator action queue changes.                                                        | explicit admin workflow scope rationale                       | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` and `/my-library/calendar` are private authenticated surfaces; no public metadata, sitemap, robots, or canonical URL changes.           | private-route SEO rationale                                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content, structured data, or crawl-safe public docs surface changes.                                                               | AI-discoverability scope rationale                            | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: event payloads, if touched, must distinguish review acknowledgement, count labels, and check-in rejection without PII or double-counting.               | analytics event review or no-new-event rationale              | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this child changes no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue operation.                                         | commerce scope rationale                                      | `N/A`                   |
| Incident response and support operations      | `target`     | Support can explain whether review acknowledgement is durable, what Calendar `No sessions` means, and why future check-ins are rejected.                                 | Help/Guide/support docs and runbook notes                     | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this child changes no billing provider data, invoices, payouts, refunds, finance reports, reconciliation, entitlements, or revenue operations. | explicit finance scope rationale                              | `N/A`                   |
| i18n operational readiness                    | `target`     | Count labels avoid layout-fragile wording and future locale expansion can map habit/session/micro-unit denominators explicitly.                                          | copy review plus mobile/desktop screenshots                   | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Habits helpers, Calendar daily layer adapters, route boundaries, UI primitives, and test stack; no new dependency without explicit rationale.             | code review, dependency diff                                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/domain/route/component tests cover review persistence, count labels, Calendar parity, future-date rejection, and relevant negative paths.                           | Vitest/route tests, screenshot handoff, verify gates          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no deep-history refactor here; any added reads must stay bounded to active review/month windows.                                                        | query/window review                                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Revert restores prior labels/guards without destructive data cleanup; migrations, if required for acknowledgement, are additive with rollback notes.                     | rollback notes, migration review if applicable, verify gates  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

React/Next.js:

- Reuse `/my-library/habits` and `HabitPerfectDayHub` as the Habits reference surface.
- Reuse `/my-library/calendar` month/day layer patterns; do not create a second Calendar renderer.
- Keep route/query behavior stable for selected dates and source links.

TypeScript/domain:

- Reuse `HabitDefinitionView`, `HabitCheckInView`, `HabitDayItem`, `HabitDaySummary`, cadence helpers, timer/manual helpers, and Calendar daily-layer view-models.
- Add or tighten typed helpers for count labels instead of scattering denominator logic through JSX.
- Unknown/deprecated values fail closed and do not count as done/satisfied.

Supabase/data:

- Prefer no schema change unless durable review acknowledgement requires one.
- If persistence is required, use an additive migration, RLS/authz review, generated type updates if applicable, and negative-path tests.
- Check-in route changes must stay owner-scoped and fail closed.

UI system:

- Reuse My Library tokens, Habits card/action primitives, Calendar month-cell/day-detail patterns, and compact chip/label styling.
- Changed visible surfaces require screenshot handoff before pre-PR gates.

Testing:

- Domain tests for weekly/monthly any-day and denominator semantics.
- Route tests for future check-in rejection and any review acknowledgement write.
- Component tests for Habits Weekly Overview labels and review acknowledgement behavior.
- Calendar tests for representative month-cell and week-total labels.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, repo lint/verify scripts, installed `playwright` skill for future screenshot handoff, browser tools for UI inspection if needed.
- Evaluate later: no new Codex skill/plugin is needed for this planned brief; security-focused skills can be evaluated only if the implementation adds a new protected persistence path.
- Install/config changes: none.

Systemic findings:

| Surface                      | Finding                                                                                                     | Severity | Recommended Type                 | Owner Decision Needed                                    | Follow-Up Brief Path |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | -------------------------------------------------------- | -------------------- |
| Habits review persistence    | Local-only acknowledgement can cause repeated review prompts across day/browser/device.                     | `high`   | `bounded implementation child`   | `yes if choosing local-only limitation over persistence` | this brief           |
| Count denominator contract   | Habits Weekly Overview and Calendar labels need one explicit denominator contract before UI text changes.   | `high`   | `bounded implementation child`   | `no unless audit exposes competing product meanings`     | this brief           |
| Timezone/local date boundary | UTC-based `today` can affect review and future-date semantics, but it is larger than the count/trust slice. | `medium` | `deferred architecture decision` | `yes before Child X`                                     | `TBD Child X`        |

Return path:

- Parent: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- Current status: implemented first pass; stopped at required screenshot approval gate before `npm run verify:pre-pr`, commit, push, PR creation, or merge gates.
- Last merged Habits child: Child V in PR `#1151`.
- Next planning step: owner may explicitly execute this brief, then move it to `in-progress` and refresh audit against latest `main`.

## Domain Granularity Gate

- User's mental objects:
  - a habit day needing review;
  - a habit completion/check-in;
  - a daily/weekly habit count shown in Calendar;
  - a Calendar day/week summary with sessions, habits, and micro units.
- Canonical objects:
  - `habit_definitions.id`;
  - habit check-in rows and dates;
  - optional review acknowledgement rows if persisted;
  - Calendar daily layer view-model rows derived from source-owned data.
- Child object levels:
  - habit definition: `view`, `edit` out of scope unless required by review flow;
  - check-in: `view`, `create/update` only through existing check-in route and future-date guard;
  - review acknowledgement: `create/update` if persisted, otherwise explicitly local-only;
  - day summary: `view`;
  - week/month summary: `view`;
  - Calendar micro-unit summary: `view` only;
  - swim session week-total text: `view` label clarification only, no swim-session mutation.
- Mature reference surfaces:
  - `components/my-library/habits/HabitPerfectDayHub.tsx`;
  - `lib/habits/shared.ts`;
  - `lib/my-library/calendar-daily-layers.ts`;
  - `components/my-library/CalendarPlanWeekHub.tsx`;
  - `lib/my-library/today.ts`.
- Child-structure rule:
  - Count labels must expose enough object context that users know what the numerator and denominator refer to, even when child habit rows are not expanded in Calendar.

## Data Placement And Sync Contract

Server-canonical:

- habit definitions;
- habit check-ins;
- reset boundaries;
- durable review acknowledgement, if Child W chooses persistence;
- any Calendar daily layer values derived from source-owned server data.

Local-only:

- transient UI state;
- local sound/preferences out of scope;
- review acknowledgement only if explicitly accepted as a product limitation and documented/tested.

Derived view-model:

- Habits weekly counts;
- Calendar daily/month-cell habit labels;
- Calendar micro-unit labels;
- Calendar week-total session labels.

Sync policy:

- Check-in writes must reject future dates and refresh affected Habits/Calendar state.
- Review acknowledgement persistence, if added, must be owner-scoped and idempotent for the same date/window.
- Calendar count labels must derive from the same server snapshot or typed adapter as the owning source.

Retention and sensitivity:

- Persist only owner ID, date/window, acknowledgement state, and timestamps if adding review persistence.
- Do not log habit notes, private habit titles, free-text goal content, or raw source payloads in analytics/support events.

Cache/invalidation:

- Changed mutations must invalidate or refresh the affected Habits snapshot and any Calendar day/week count derived from it.
- No broad cache invalidation for unrelated source systems.

## Identity And Rename Contract

- Canonical stable IDs:
  - habit rows use `habit_definitions.id`;
  - check-ins use their persisted row IDs where available plus habit/date semantics;
  - review acknowledgement uses owner/date/window identity if persisted;
  - Calendar count rows use date/source-kind plus source-owned IDs where available.
- Human-readable identifiers:
  - habit title, Calendar chip labels, and `Week total` text are display copy only.
- Mutability:
  - habit titles remain renameable and must not affect count identity;
  - review acknowledgement can be updated/revoked only if the implementation scopes that action.
- Rename vs repurpose:
  - repurposing habits is out of scope; existing history safety rules still apply.
- Compatibility:
  - old local-only review keys must fail safely if the implementation migrates to server-canonical acknowledgement.
  - legacy Calendar labels must not be counted as identity.

## Forward Compatibility Contract

Extensibility surfaces:

- habit modes/types/cadence policies;
- review acknowledgement statuses;
- Calendar source kinds;
- Calendar count denominator labels;
- micro-unit statuses;
- future locales;
- analytics payload values.

Source of truth:

- typed Habits helpers in `lib/habits/shared.ts`;
- Calendar daily-layer adapters in `lib/my-library/calendar-daily-layers.ts`;
- protected API route validation for writes.

Additive behavior:

- new mapped habit types should appear in count labels through shared helpers;
- new Calendar source kinds should not appear in aggregate labels until mapped;
- new review statuses must fail closed until support/docs/tests are updated.

Explicit mapping requirements:

- new habit mode/cadence;
- new Calendar layer source;
- new denominator label;
- new review acknowledgement state;
- new analytics event value.

Unknown or deprecated values:

- do not count as done/satisfied;
- show generic review-required or unmapped state where needed;
- avoid misleading success copy.

Test/evidence:

- future/unknown value fixture for count/status mapping or explicit N/A rationale;
- representative daily, weekly any-day, weekly fixed-day, and monthly any-day fixtures.

## Help / Guide Impact

Required if implementation changes behavior or copy:

- Explain whether reviewed dates persist across devices.
- Explain what Weekly Overview counts.
- Explain what Calendar `x/y habits`, `micro units`, `Week total`, and `No sessions` mean.
- Explain future-date rejection only if surfaced to users.

## Route / Label / Support Surface Sweep

Required before broad gates if executed.

Minimum search terms:

- `/my-library/habits`
- `/my-library/calendar`
- `Weekly Overview`
- `completionPercent`
- `x/y habits`
- `/10 habits`
- `/11 habits`
- `micro units`
- `Week total`
- `No sessions`
- `absence review`
- `reviewed`
- `Done with this day`
- `Close review`
- `checkInDate`
- `getTodayCalendarDate`
- `habit_catch_up`

Minimum surfaces:

- `app/`
- `components/`
- `lib/habits/`
- `lib/my-library/`
- `tests/`
- `docs/api-contracts.md`
- `docs/user-flow-map.md`
- `docs/runbooks/`
- `docs/task-briefs/`

Execution evidence:

- Identifiers searched: `/my-library/habits`, `/my-library/calendar`, `Weekly Overview`, `completionPercent`, `x/y habits`, `/10 habits`, `/11 habits`, `micro units`, `Week total`, `No sessions`, `absence review`, `reviewed`, `Done with this day`, `Close review`, `checkInDate`, `getTodayCalendarDate`, `habit_catch_up`, plus the stale `target habits` and `On-target habits` copy.
- Surfaces checked / directories/surfaces: `app/`, `components/`, `lib/habits/`, `lib/my-library/`, `tests/`, `docs/api-contracts.md`, `docs/user-flow-map.md`, `docs/runbooks/`, `docs/task-briefs/`, and active Habits/Calendar support docs.
- Fallout handled: stale target-habit wording was removed from product/tests/docs, Calendar `No sessions` copy was narrowed to `No swim sessions`, Micro Session labels stayed separate from Habit labels, and support/user-flow docs now describe Today/History review navigation and review progress.

## API / Server Failure-Mode Evidence

- No unexpected 500 is introduced for validation/auth failures: absence-review route rejects unauthenticated users with `401`, invalid JSON/date/status payloads with `400`, and future review dates with `400`; check-in route rejects invalid habit IDs and future `checkInDate` before DB writes.
- Expected 500/failure-mode behavior remains deterministic for true Supabase write failures: routes return stable error copy, skip follow-up snapshot refresh/analytics where appropriate, and existing route tests assert the failure mode for habit update/reset/check-in write failures.
- New absence-review write path is fail-closed and owner-scoped: tests prove it upserts only `habit_absence_review_acknowledgements`, does not touch `habit_check_ins`, uses user-owned rows, and loads the refreshed snapshot only after successful acknowledgement persistence.

## Scope

In scope:

- Create/refresh implementation plan for H-067, H-068, H-069, and H-076.
- Audit current count derivation before runtime edits.
- Implement durable or explicitly scoped review acknowledgement if approved during execution.
- Make Habits Weekly Overview count-first.
- Add protected future-date check-in rejection.
- Align or explicitly defer Calendar count labels needed for count parity.
- Update targeted tests and docs for changed behavior.

Out of scope:

- Timezone/local-midnight contract (`H-070`).
- All-unresolved historical review backlog expansion (`H-071`).
- Broader Home hash/e2e/docs hardening (`H-072`, `H-073`, `H-075`) beyond directly touched docs.
- Snapshot history performance refactor (`H-074`).
- Broad Calendar redesign, new dashboards, reminders, exports, hard delete, setup assistant, provider/native sync, or new analytics dashboard.
- Merge without explicit owner approval.

## Acceptance Criteria

1. Child W records a pre-edit audit answering all `Current Audit Questions To Answer Before Runtime Edits`.
2. Review acknowledgement is either server-canonical and owner-scoped or explicitly documented/tested as local-only with accepted limitations.
3. Already reviewed past dates do not reappear in the next review prompt under the chosen persistence contract.
4. Habits Weekly Overview uses count-first labels and no longer relies on visible percent as the primary user-facing progress text.
5. Calendar month/day/week habit labels use an explicit denominator contract or are intentionally deferred with evidence.
6. `micro units` remain visually and semantically distinct from habit counts.
7. `Week total` / `No sessions` labels do not imply no activity when they mean no swim sessions only.
8. Protected check-in writes reject future dates fail-closed, with negative route tests.
9. Today/Home and Calendar regression tests prove count language stays aligned where the same object is shown.
10. UI changes have screenshot handoff and owner approval before `npm run verify:pre-pr`.

## Validation

Required for planned brief creation and execution pickup:

- `git diff --check`
- `npm run lint:briefs`
- `npm run lint:briefs:all`

Required if this brief is executed:

- targeted route/label/support sweep from this brief;
- targeted Vitest for Habits domain/count semantics;
- targeted route tests for check-in future-date rejection and any review acknowledgement route;
- targeted component tests for `HabitPerfectDayHub`;
- targeted Calendar daily-layer/month-cell tests if Calendar labels change;
- screenshot handoff for changed Habits/Calendar UI;
- `npm run verify:pre-pr` after owner screenshot approval;
- required CI green;
- `npm run verify:pre-merge` before merge.

## Screenshot Handoff Requirements

Required if execution changes visible UI.

- Comparison type: `before/after` for changed Habits Weekly Overview and Calendar month/day labels where possible; otherwise `after/reference`.
- Artifact folder: `output/habits-review-trust-count-ux-YYYY-MM-DD-HHMMSS`.
- Required representative screenshots:
  - `after-habits-weekly-overview-mobile.*`
  - `after-habits-weekly-overview-desktop.*`
  - `after-calendar-month-counts-desktop.*` if Calendar labels change
  - `after-calendar-selected-day-mobile.*` if Calendar selected-day labels change
- Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, or `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-06-24 | planned | created Child W from the refreshed Habits parent audit on clean main@c493ce51; owns H-067/H-068/H-069 plus H-076 Calendar count-parity audit gate; no runtime implementation started | next: wait for explicit owner execute/build/implement/kjor before moving to in-progress and refreshing current code/test audit`
- `2026-06-24 | in-progress | owner said "kjør Child W"; switched to branch aw-006-habits-review-trust-count-ux, moved this brief to in-progress, and started the required current code/test audit before runtime edits | next: record audit decisions, implement scoped changes, run targeted validation, and capture screenshot handoff before pre-PR gates`
- `2026-06-24 | implemented-first-pass | recorded audit decisions, added additive server acknowledgement storage/API for absence review, changed Habits/Calendar labels to count-first language, clarified swim-only week totals, added future check-in rejection, and updated targeted docs/tests | next: run targeted tests, fix findings, then capture screenshot handoff before pre-PR gates`
- `2026-06-24 | screenshot-handoff | targeted Vitest, typecheck, brief lint, route/label sweep, and diff whitespace checks passed; captured after/reference artifacts in output/habits-review-trust-count-ux-2026-06-24-170637 using a temporary local visual harness with production Habits/Calendar components; removed the capture-only route after screenshots, with no product-rendering file changes after final capture | next: wait for owner screenshot approval or concrete visual corrections before running npm run verify:pre-pr`
- `2026-06-24 | screenshot-correction | corrected Daily/Weekly/Micro copy fallout, removed stale count wording, right-aligned the mobile Today/History sticky pill in its own sticky row, reran typecheck/targeted Vitest/brief lint/diff whitespace/text sweep, and captured updated after/reference artifacts in output/habits-review-trust-count-ux-2026-06-24-182911; removed the capture-only route after screenshots | next: wait for owner screenshot approval or concrete visual corrections before running npm run verify:pre-pr`
- `2026-06-24 | visual-state-correction | upgraded the mobile sticky date pill to distinct visual states: blue active Today and amber History, both right-aligned with icons; captured updated after/reference artifacts in output/habits-review-trust-count-ux-2026-06-24-183651 and removed the capture-only route after screenshots | next: wait for owner screenshot approval or concrete visual corrections before running npm run verify:pre-pr`
- `2026-06-24 | interaction-correction | changed the mobile sticky Today pill into a scroll-to-top control, changed the History pill into a jump-to-review control, added review progress plus blue Today/Back to Today actions inside the review list, updated focused tests/docs, and captured owner-preapproved after/reference artifacts in output/habits-review-trust-count-ux-2026-06-24-185741; removed the capture-only route after screenshots | next: run pre-PR gate, push, open/update PR, monitor CI, then run pre-merge and merge if green`
- `2026-06-24 | pre-pr-pass | applied the additive Supabase migration to linked remote, reran npm run verify:pre-pr, and the full lane passed: quality gates, lint, typecheck, 1731 unit tests, build, perf budgets, and 111/111 runnable e2e tests with 567 expected skips; perf budget trend reported 11 consecutive weekly green runs and recommends tightening one stretch target next, but this Habits PR intentionally records that as a follow-up decision instead of widening runtime scope | next: commit, push, open/update PR, monitor CI, run pre-merge, then merge if green`
