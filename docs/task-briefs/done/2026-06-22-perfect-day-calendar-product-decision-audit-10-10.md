# Task Brief: Perfect Day Calendar Product Decision Audit (10/10)

## Metadata

- `id`: `2026-06-22-perfect-day-calendar-product-decision-audit-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-22`
- `updated`: `2026-06-22`
- `mode`: `product decision / docs-only closeout`

## Brief Audit Record

- `last_audited`: `2026-06-22`
- `base`: `main@a482449d`
- `audit_status`: `done`
- `decision`: Close this product decision as `keep Perfect Day in Habits/Motivation; do not build a Calendar Perfect Day chip now`.
- `reason`: The product review is complete, Habits Add/Edit now exposes per-habit `Counts toward Perfect Day` eligibility through PR `#1214`, and the remaining Calendar value would duplicate existing Habits daily layers unless a fresh owner-selected runtime brief creates a distinct read-only Calendar meaning later.
- `must_refresh_before_execution_if`: Refresh if `/my-library/habits`, `/my-library/calendar`, `HabitPerfectDayHub`, `lib/habits/*`, `lib/my-library/calendar*`, `docs/user-flow-map.md`, Calendar parent briefs, provider evidence contracts, scorecard categories, Help/Guide copy, or online competitive/source assumptions change before a runtime slice starts.

## Goal

Decide whether Perfect Day should stay owned by Habits/Motivation only or become a distinct read-only Calendar signal with a clear source-of-truth, user meaning, fallback, and test contract.

## Pre-Implementation Owner Explanation

Codex skal sammenligne dagens FreeSwimming-app med relevante trenings- og habit-tjenester paa nett, og skrive en brief som avklarer om Perfect Day boer vises som eget Calendar-lag. Det betyr noe fordi Calendar ikke skal telle Habits dobbelt eller gi falsk trygghet om trening, helse eller provider-data. Utenfor scope er runtime-kode, UI-bygging, screenshots, Garmin/provider-runtime, performance-ratchet, PR/merge-arbeid og `Ja.docx`.

## Current App Audit

- `/my-library/habits` is the mature Perfect Day owner surface through `HabitPerfectDayHub`.
- Perfect Day today means all scheduled habits selected to count toward Perfect Day for a selected day were completed.
- Habits/Motivation already shows:
  - current perfect-day streak,
  - best perfect-day streak,
  - perfect days,
  - consistency,
  - rest days,
  - slips,
  - reset markers that restart Motivation stats without deleting check-ins.
- Calendar Plan already shows read-only daily layers for Habits and Micro Sessions.
- Calendar explicitly does not edit Habits, Perfect Day rules, Micro Session units, source workouts, or actual swim evidence.
- Calendar parent and user-flow docs state that the product decision is closed for now: Perfect Day remains in Habits/Motivation, and no Calendar chip is selected.
- Calendar Compare already includes Habits perfect-day metrics through comparison reporting, while Calendar Plan does not show Perfect Day as its own layer.
- Unknown Habit modes, cadence values, check-in statuses, reset states, and Micro Session statuses must fail closed and must not improve counts.

## Online Product Audit

Checked online on `2026-06-22`.

Sources:

- Apple Watch Activity: https://support.apple.com/guide/watch/track-daily-activity-apd3bf6d85a6/watchos
- Apple Watch measurement accuracy: https://support.apple.com/en-us/105002
- TrainingPeaks athlete features: https://www.trainingpeaks.com/athlete-features/
- MySwimPro: https://www.myswimpro.com/
- Android Health Connect: https://developer.android.com/health-and-fitness/health-connect
- Garmin Fitness Coach / Garmin Connect reporting context: https://www.techradar.com/health-fitness/smartwatches/huge-garmin-update-alert-garmin-fitness-coach-arrives-in-app-and-on-watch-and-one-of-my-favorite-features-just-got-a-big-boost-too
- Garmin race-day / Training & Planning context: https://www.techradar.com/health-fitness/garmins-underrated-race-day-training-tool-is-what-keeps-me-from-switching-to-the-apple-watch-heres-how-to-set-it-up
- Strava activity-type trend context: https://www.techradar.com/health-fitness/fitness-apps/strava-now-lets-you-track-5-much-requested-new-activities-including-the-worlds-fastest-growing-sport

Audit findings:

- Apple keeps daily motivation simple: Move, Exercise, and Stand rings summarize daily progress, with history, trends, awards, reminders, and a safety note that Apple Watch is not a medical device.
- Apple measurement guidance separates sensor-derived credit from user intent; accurate daily scores depend on personal info, fit, workout type, motion, and calibration.
- TrainingPeaks positions Calendar-like training around planned workouts, execution, metrics, coaching, and connected devices in one training ecosystem.
- MySwimPro is swim-specific and emphasizes personalized swim workouts, AI swim workouts/training plans, swim tracking/analytics, technique videos/drills, and sync to Apple Watch, Garmin, Wear OS, Strava, and TrainingPeaks.
- Android Health Connect reinforces that multi-app wellness data needs user permission, structured data types, data synchronization, delete support, and display/attribution rules.
- Garmin/Strava market signals show broad ecosystem pressure toward more activity types, coaching, planning, nutrition/recovery context, and device-connected data. FreeSwimming should avoid copying broad wellness dashboards unless the data boundary is explicit.

Product interpretation:

- A daily completion signal can be motivating when it is simple and visibly bounded.
- A Calendar layer is useful only if it answers a Calendar-specific question, such as "Was this date fully aligned with my routine goals?" or "Which training days had full routine support?".
- FreeSwimming should not turn Perfect Day into a generic health/readiness score, provider-derived wellness score, or swim performance KPI.
- A Calendar Perfect Day chip must be read-only, source-attributed to Habits, and unable to improve swim completion, Stats Swimming, provider evidence, streaks outside Habits, analytics KPIs, or AI replanning unless a later mapping explicitly says so.

## Final Product Decision

Decision: keep Perfect Day owned by Habits/Motivation now. Do not create a Calendar Perfect Day chip from this review.

If a future owner-selected runtime brief reopens a read-only Calendar chip, it must use this narrow meaning:

> Perfect Day on Calendar means the user's scheduled Habits that count toward Perfect Day for that date were all completed according to the Habits source contract.

Required Calendar behavior for any future runtime child:

- Month cell: optional compact read-only signal only when it adds information beyond the existing `x/y habits` daily layer.
- Selected-day detail: explain it as a Habits-owned routine signal, not training completion.
- Action: `Open source` links to Habits for editing/checking details.
- Empty/unmapped state: hide the chip or show `Review needed`; never count as success.
- No provider influence: Garmin, Apple Health, Strava, Health Connect, or manual fixture evidence cannot create a Perfect Day.
- Fresh scope: create a new bounded runtime brief, screenshot handoff, Help/Guide impact decision, and focused tests before any Calendar UI is built.

Do not build yet:

- a second Perfect Day scoring system,
- a readiness/body-battery/recovery score,
- a separate Calendar editor for habits,
- automatic replanning or swim-performance judgment,
- provider-backed Perfect Day writes.

## Current Parent/Return Path

- Calendar parent: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- Habits parent: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- Current shipped Calendar daily layers child: `docs/task-briefs/done/2026-06-20-my-library-calendar-daily-layers-micro-habits-perfect-day-10-10.md`
- Current shipped Habits Motivation/Perfect Day depth children: `docs/task-briefs/done/2026-06-05-aw-006-habits-advanced-motivation-history-depth-10-10.md`, `docs/task-briefs/done/2026-06-06-aw-006-habits-reset-stats-motivation-reset-10-10.md`, and later Habits recovery/motivation polish briefs.
- Provider runtime remains blocked by `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`.
- Performance ratchet remains held by `docs/task-briefs/planned/2026-06-19-next-performance-budget-ratchet-maintenance-10-10.md`.
- Owner decision outcome: keep Perfect Day in Habits/Motivation only for now; no active Calendar chip/runtime child is selected.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this docs-only decision brief:

- `Product goals and IA`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                        | Evidence                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Brief states whether Perfect Day is Habits-owned only or eligible for a distinct Calendar read-only meaning before runtime work starts.                                                   | product recommendation + parent/return path             | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: future UI must keep Calendar chip read-only and source-linked; this docs slice changes no flow.                                                                          | future runtime notes                                    | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this docs-only audit changes no rendered UI, styling, layout, screenshots, or visual assets.                                                                                  | visual scope rationale                                  | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Perfect Day must not count as swim completion, Stats Swimming, provider truth, analytics KPI truth, or AI replanning without explicit future mapping.                                     | product interpretation + forward compatibility contract | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is a member-facing Habits/Calendar product decision and changes no admin editor or publish workflow.                                                                     | admin non-scope rationale                               | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: future chip must be keyboard/screen-reader readable if built; this docs slice changes no accessibility surface.                                                          | future runtime notes                                    | `4/5`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this docs-only audit changes no route, bundle, media, CSS, query, cache behavior, or performance budget.                                                                      | performance non-scope rationale                         | `N/A`                   |
| Data placement and sync boundaries            | `target`     | Brief keeps Perfect Day source truth in Habits check-ins/resets and states that Calendar may only read a derived summary in future.                                                       | data placement contract                                 | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: future Calendar read must refresh after Habits check-in/reset changes; no cache behavior changes now.                                                                    | data placement contract                                 | `4/5`                   |
| Reliability and failure handling              | `target`     | Unknown/missing Habit, cadence, reset, provider, or calendar values fail closed to hidden/review states and never improve success.                                                        | current app audit + forward compatibility contract      | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: future runtime must preserve authenticated owner-scoped Habits/Calendar reads; this docs slice changes no protected path.                                                | stack gate + future validation notes                    | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: future Perfect Day Calendar display must expose only derived habit status, not private notes, raw provider payloads, health files, or sensor details.                    | privacy notes + source audit                            | `4/5`                   |
| Content governance                            | `target`     | Brief records online source baseline, local app audit, owner decision point, and return path so later Calendar work does not inherit stale assumptions.                                   | online product audit + checkpoint log                   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, actions, Help/Guide admin flows, or operator editability change in this product-decision brief.                                                     | admin workflow non-scope rationale                      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` and `/my-library/calendar` are authenticated/private and this docs slice changes no public metadata, sitemap, robots, canonical URL, or structured data. | private-route rationale                                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this docs-only private-product decision creates no public AI-discoverable page or structured public entity.                                                                   | AI/public-surface non-scope rationale                   | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: future chip view/click events, if added, need stable safe taxonomy and must not make Perfect Day a KPI truth source without mapping.                                     | future analytics notes                                  | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no checkout, pricing, entitlements, revenue workflow, catalog, Stripe, invoices, refunds, payouts, or paid-access truth.                                         | commerce non-scope rationale                            | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: future support copy should diagnose missing Habit schema, reset markers, unknown cadence, and source-owned edit path; no support workflow changes now.                   | support impact section                                  | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                           | explicit finance scope rationale                        | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: future labels such as `Perfect Day`, `Habits`, `Review needed`, and `Open source` need locale-ready copy; this docs slice adds no runtime strings.                       | future i18n notes                                       | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Future runtime must reuse `HabitPerfectDayHub`, Habits summary contracts, Calendar daily-layer/view-model patterns, and add no dependency for a chip/summary decision.                    | stack gate                                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed brief passes brief lint; future runtime requires focused unit/component tests and screenshot handoff if UI is built.                                                              | `npm run lint:briefs` plus future validation matrix     | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: future Calendar chip must derive from existing bounded day summaries and avoid N+1 habit reads; no runtime work now.                                                     | stack gate + future validation notes                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | This docs-only decision is reversible by normal git revert; future runtime must be independently revertable with no migration unless explicitly scoped.                                   | changed-files review + validation                       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Future runtime must reuse `/my-library/calendar` Plan selected-day detail and existing Calendar daily-layer patterns.
  - Do not create a second Calendar route or a second Habits editor.
  - Any future UI chip must link to `/my-library/habits?date=<date>` or the current source-owned Habits surface for edits.
- TypeScript/domain contracts:
  - Reuse Habits typed cadence/check-in/reset contracts and Calendar day-summary contracts.
  - Unknown future statuses must fail closed.
  - Perfect Day display is a derived read-only view, not a persisted Calendar entity.
- Supabase/data layer:
  - No migration in this docs slice.
  - Future runtime should read existing owner-scoped Habits/check-in/reset data through existing server helpers unless a later brief justifies a summary table.
  - Provider evidence tables must not write Perfect Day.
- External services:
  - Online audit is research only.
  - No Garmin, Strava, Apple Health, Health Connect, TrainingPeaks, MySwimPro, WHOOP, AI provider, webhook, token, or SDK integration belongs in this slice.
- UI system:
  - Future chip should reuse current Calendar daily-layer rows/chips and My Library tokens.
  - Screenshot handoff is required before PR update for any UI runtime child.
- Testing:
  - This docs-only brief: `npm run lint:briefs`, `git diff --check`.
  - Future runtime: focused Habits summary tests, Calendar daily-layer tests, unknown-value negative tests, a11y component/e2e coverage where changed, screenshot handoff, `verify:pre-pr`, CI, and `verify:pre-merge`.

## Codex Skill / Stack Readiness Radar

Capability audit:

- Available now: local shell, repo brief linting, docs-only verification lane, existing Habits/Calendar tests, and browser/web tools for online product audit.
- Available if future UI starts: current session `playwright` skill and local screenshot runbooks.
- Not needed: new Codex skills, plugins, MCP servers, dependencies, provider SDKs, or local config changes.

Systemic findings:

| Surface                     | Finding                                                                                                                          | Severity | Recommended Type                 | Owner Decision Needed                            | Follow-Up Brief Path    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ------------------------------------------------ | ----------------------- |
| Perfect Day product meaning | Owner chose to keep Perfect Day in Habits/Motivation now after eligibility clarity shipped.                                      | `high`   | `safe process/docs update`       | `no`; decision is closed for now                 | this brief              |
| Calendar source boundaries  | Online examples reward simple daily signals, but FreeSwimming must not merge habit success, swim completion, and provider truth. | `high`   | `deferred architecture decision` | `yes` only if a future Calendar chip is reopened | Fresh runtime brief TBD |
| Provider/runtime pressure   | Device ecosystems can broaden daily scoring quickly; FreeSwimming provider evidence must remain out of Perfect Day until mapped. | `medium` | `do not do`                      | `no`; already blocked                            | blocked provider briefs |

Return path:

- Owner chose `keep in Habits only`; this closeout updates Calendar parent/user-flow docs and moves the product decision to done.
- If owner later chooses `Calendar chip`, create a fresh bounded runtime brief for read-only Calendar display and screenshot handoff.
- If owner later chooses `broader daily readiness score`, create a separate product strategy brief, not a Calendar child.

## Domain Granularity Gate

- User's mental object:
  - a calendar date and whether the user's routine commitments for that date were fully satisfied.
- Canonical objects:
  - Habit definition ID,
  - Habit check-in ID,
  - Habit motivation reset ID,
  - Calendar date,
  - derived day summary.
- Child object levels:
  - date summary: `view` in future Calendar chip;
  - habit-level completion/rest/slip/timed/count evidence: `view via Habits source`, not Calendar edit;
  - motivation reset markers: `view/support-only` in Calendar, edit/reset remains in Habits;
  - source-backed Micro Session habit credit: `view via source summary`, not manual Calendar edit;
  - provider evidence: `out of scope`;
  - swim planned/actual event: `out of scope`.
- Mature reference surface:
  - `components/my-library/habits/HabitPerfectDayHub.tsx` for Perfect Day and Motivation truth.
  - `components/my-library/CalendarPlanWeekHub.tsx` and `lib/my-library/calendar-daily-layers.ts` for Calendar daily-layer display.
- Child-structure rule:
  - A future runtime UI cannot claim `10/10` from only a month-cell dot if the selected-day detail does not provide enough source context or a clear `Open source` path.

## Data Placement And Sync Contract

- Server-canonical:
  - Habit definitions,
  - Habit check-ins,
  - Habit motivation reset rows,
  - Micro Session source-backed habit credits where already mapped.
- Derived read-only:
  - Perfect Day day status,
  - perfect-day streaks,
  - consistency,
  - active habit count,
  - scheduled day denominator.
- Local-only:
  - Calendar selected date/window,
  - open/closed daily-layer UI state,
  - transient tooltip/disclosure state.
- Sync policy:
  - Habits writes own updates.
  - Calendar may read derived summaries after Habits changes.
  - Calendar must never write Habits check-ins, reset markers, or Perfect Day results.
- Conflict/failure policy:
  - unknown habit mode/cadence/status, missing reset schema, duplicate or malformed source-backed credit, future provider source, and missing selected date all fail closed to hidden/review states.
- Retention and sensitivity:
  - Perfect Day is private habit/routine data.
  - Calendar should not expose private habit notes, raw provider payloads, health files, sensor details, or analytics identifiers.
- Cache/invalidation:
  - Future runtime must preserve authenticated dynamic/private route behavior and refresh Calendar summaries after Habits mutation if a chip is built.

## Identity And Rename Contract

- Canonical stable IDs:
  - Habit IDs and check-in IDs remain source-of-truth.
  - Calendar date is a query/display filter, not entity identity.
  - Perfect Day has no persisted independent ID in this decision.
- Human-readable identifiers:
  - `Perfect Day`, habit titles, date labels, and Calendar chip labels are presentation only.
- Mutability:
  - Habit titles and setup can change in Habits.
  - Historical check-ins and reset markers remain tied to canonical habit identity.
- Rename vs repurpose:
  - Renaming a habit preserves history.
  - Repurposing a habit intent should follow existing Habits policy and should not make old days mean something new without an explicit rule.
- Compatibility:
  - Existing Habits, Motivation, Calendar Compare, and daily-layer behavior continue if no Calendar chip is built.
  - Unknown future source values remain review/unmapped.
- Observability and repair:
  - Future runtime should make missing Habit schema, unknown cadence, reset drift, and source-backed credit mismatch diagnosable in tests/support copy.

## Forward Compatibility Contract

- Extensibility surfaces:
  - habit modes,
  - cadence periods,
  - check-in statuses,
  - reset-marker semantics,
  - source-backed habit credits,
  - Calendar daily layers,
  - analytics event values,
  - provider evidence families,
  - locales.
- Source of truth:
  - Habits owns Perfect Day truth.
  - Calendar owns display of a selected date and source links.
  - Provider evidence owns received evidence only.
  - Completed swim events own actual swim history.
- Additive behavior:
  - new supported Habit cadence/status values can flow into Perfect Day only through the existing typed Habits summary contract.
  - a future Calendar chip can render any supported Perfect Day status generically once mapped.
- Explicit mapping required:
  - new providers,
  - new source-backed Habit families,
  - readiness/recovery scores,
  - swim completion/Stats mapping,
  - analytics KPI use,
  - Calendar edit actions,
  - localized copy.
- Unknown/deprecated values:
  - fail closed to `review needed`, hidden, or source-owned fallback.
  - never improve Perfect Day, swim completion, Stats, provider reconciliation, or AI replanning.
- Evidence:
  - this decision brief uses local app audit, online product audit, brief lint, and targeted source references.
  - future runtime requires future-value fixtures and unknown-value negative tests.

## Help/Guide And Support Impact

- This docs-only audit changes no Help/Guide surface.
- Future Calendar chip runtime must either:
  - update Help/Guide/support copy to explain that Perfect Day is Habits-owned and Calendar read-only, or
  - record a concrete `N/A` rationale if no user-facing copy is added.
- Support copy must distinguish:
  - `No scheduled Perfect Day-counting habits`,
  - `Review needed`,
  - reset-marker effects,
  - source-backed Micro Session Habit credit,
  - provider evidence not included.

## Route / Label / Support Surface Sweep

Future runtime must sweep before broad gates:

- identifiers:
  - `Perfect Day`,
  - `My Perfect Day`,
  - `Motivation`,
  - `Daily layers`,
  - `Habits`,
  - `Open source`,
  - `Review needed`,
  - `source=habits`,
  - `/my-library/calendar`,
  - `/my-library/habits`.
- surfaces:
  - `app/`,
  - `components/`,
  - `lib/my-library/`,
  - `lib/habits/`,
  - `tests/`,
  - `docs/user-flow-map.md`,
  - active/planned/done task briefs,
  - Help/Guide/runbooks if visible labels change.

## Scope

This docs-only decision slice owns:

- Local FreeSwimming app audit for Perfect Day/Habits/Calendar boundaries.
- Online product audit of comparable daily motivation, training calendar, swim coaching, and health data ecosystems.
- Product recommendation and decision paths.
- Scorecard, stack, domain granularity, data, identity, forward compatibility, Help/Guide, and support-sweep contracts.

## Out Of Scope

- Runtime code, UI, styles, screenshots, tests beyond brief lint/diff checks, scripts, configs, workflows, migrations, generated files, or assets.
- Creating a Calendar Perfect Day chip.
- Changing Habits Motivation calculations.
- Provider runtime, Garmin OAuth, Strava/Apple/Health Connect integration, FIT parsing, matching, or reconciliation.
- AI readiness/recovery scoring, automated replanning, or health/medical claims.
- Performance-ratchet tightening.
- Runtime PR/merge work beyond packaging this docs-only decision closeout.
- Touching `Ja.docx`.

## Acceptance Criteria

1. Brief records current FreeSwimming Perfect Day ownership and Calendar boundary.
2. Brief records online audit sources and product interpretation for comparable services.
3. Brief recommends one safe next product direction and names alternatives that must not be built accidentally.
4. Brief states data/source boundaries, identity, forward compatibility, and unknown-value fail-closed behavior.
5. Calendar parent and user-flow docs no longer treat the Perfect Day Calendar decision as still waiting for this review.
6. Brief passes changed-brief lint and diff checks.

## Validation

Docs-only validation for this slice:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`
- `npm run verify:pre-pr`
- GitHub CI
- `npm run verify:pre-merge`

Future runtime validation if owner later selects a Calendar chip:

- focused Habits summary unit tests,
- Calendar daily-layer component/unit tests,
- unknown/future value negative tests,
- owner screenshot handoff before broad gates,
- route/label/support sweep,
- Help/Guide or explicit `N/A` rationale,
- `npm run verify:pre-pr`,
- CI,
- `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-06-22 | planned | created from clean main@48fbff4b after PR #1213 closeout; owner asked for app audit plus online audit of similar services and a brief, without runtime implementation. Local audit confirmed Perfect Day is Habits/Motivation-owned and Calendar read-only; online audit covered Apple Activity, TrainingPeaks, MySwimPro, Android Health Connect, and Garmin/Strava market context | next: run changed-brief lint and diff check, then owner chooses keep-in-Habits-only, create a Calendar chip child, or broader daily-readiness product strategy`
- `2026-06-22 | owner decision | owner clarified that some habits are not meaningful enough to count toward Perfect Day and approved the recommended path: keep Perfect Day, define it as only selected eligible habits for that date, and implement explicit Add/Edit Habits eligibility before any Calendar chip | next: execute docs/task-briefs/in-progress/2026-06-22-habits-perfect-day-eligibility-clarity-10-10.md`
- `2026-06-22 | closeout selected | PR #1214 and closeout #1215 merged; owner approved the recommendation to close the product decision as keep Perfect Day in Habits/Motivation only for now, with no Calendar chip/runtime child selected | next: update Calendar parent/user-flow docs, run docs validation, commit, push, open PR, monitor CI, and run pre-merge gate`
- `2026-06-22 | pre-pr gate | local docs-only validation passed: npm run lint:briefs skipped changed-brief detection for the lifecycle move, npm run lint:briefs:all passed, git diff --check passed, stale current Perfect Day Calendar decision sweeps passed, and npm run verify:pre-pr passed on the docs-only lane | next: commit, push, open PR, monitor CI, and run pre-merge gate`

## Completion Record

- `completed`: `2026-06-22`
- `merged_pr`: `TBD until closeout PR merges`
- `result`: Closed the Perfect Day Calendar product decision. Perfect Day remains a Habits/Motivation-owned routine signal based on selected Perfect Day-counting habits; Calendar gets no separate Perfect Day chip now.
- `validation`: `npm run lint:briefs:all` PASS, `git diff --check` PASS, targeted stale current-reference sweeps PASS, and `npm run verify:pre-pr` PASS on the docs-only lane; PR CI and `npm run verify:pre-merge` remain required before merge readiness.
- `10/10 claim`: yes - all critical target categories are scoped to this docs-only decision and have direct closeout evidence.

Critical target categories confirmed `5/5`:

- Product goals and IA
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Content governance
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Achieved Score | Evidence                                                                                                                                     | Gaps / Notes                                                                 |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Product decision is explicit: keep Perfect Day in Habits/Motivation and do not select a Calendar chip/runtime child now.                     | Future Calendar chip requires a fresh owner-selected brief.                  |
| Business logic correctness and data integrity | `5/5`          | Brief and user-flow docs keep Perfect Day out of swim completion, Stats Swimming, provider truth, analytics KPI truth, and AI replanning.    | None for this docs-only decision.                                            |
| Data placement and sync boundaries            | `5/5`          | Habits remains source-of-truth; Calendar can only read source-owned Habits daily summaries and must not write Perfect Day results.           | None for this docs-only decision.                                            |
| Reliability and failure handling              | `5/5`          | Unknown habit/provider/calendar values remain fail-closed and cannot improve Perfect Day or Calendar completion.                             | Future runtime must add focused unknown-value tests if reopened.             |
| Content governance                            | `5/5`          | Product audit, owner decision, Calendar parent, and user-flow docs are aligned around no Calendar Perfect Day layer now.                     | None for active slice.                                                       |
| Stack-fit and dependency discipline           | `5/5`          | Diff stays Markdown-only, reuses existing Habits/Calendar contracts, and adds no dependency, script, runtime code, migration, or UI surface. | None for active slice.                                                       |
| Testing and QA automation                     | `5/5`          | `npm run lint:briefs:all`, `git diff --check`, stale current-reference sweeps, and `npm run verify:pre-pr` passed on the docs-only lane.     | PR CI and `npm run verify:pre-merge` remain required before merge readiness. |
| DevOps and rollback readiness                 | `5/5`          | Decision closeout is docs-only and revertable by normal git revert, with no migration, env, deploy, package, or generated artifact impact.   | `merged_pr` remains `TBD` until the closeout PR exists.                      |
