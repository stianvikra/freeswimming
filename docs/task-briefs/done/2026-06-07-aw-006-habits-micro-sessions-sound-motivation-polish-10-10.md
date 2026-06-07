# Task Brief: AW-006 Habits And Micro Sessions Sound + Motivation Polish (10/10)

## Metadata

- `id`: `2026-06-07-aw-006-habits-micro-sessions-sound-motivation-polish-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-07`
- `updated`: `2026-06-07`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `end-to-end after owner said "kjor Habits Micro Sessions polish"; pause after screenshot/sound handoff before pre-PR gate because UI/UX changed`
- `target_findings`: owner-selected post-Child J correction for Habits sound quality, Micro Sessions bubble completion sound, Habits Motivation `Stats` disclosure removal, screenshot-review polish for Habits date/status/details plus Micro Sessions Bubble actions, and final Motivation disclosure/data-confidence/admin-note spacing corrections.
- `planned_resolved_findings`: Habits completion sound quality, Micro Sessions bubble completion sound, always-open top-level Habits Motivation stats, `0 days` zero-value streaks, numeric perfect-day/consistency stats with explicit early-data copy, calmer Habits date context, controlled one-open Motivation disclosures, lower-emphasis `What counts?`, direct Bubble-mode `Edit` / `Clear` actions, and tighter Habits contextual Admin notes spacing.
- `deferred_findings`: Child K `Start fresh`, reset events, database/API changes, Calendar reset markers, reminders, notifications, server-stored preferences, user-selected/uploaded sounds, global app sound settings, graph/dashboard redesign, Micro Sessions Perfect Day linkage, optional `Create habit from micro session`, habit edit/delete CRUD beyond existing Today edit/archive, stats/progress redesign, and Micro Sessions persistent timer telemetry remain out of scope.
- `return_checkpoint`: update Habits parent, AW-006 queue, design inventory, user-flow map, and support runbook before closeout.
- `next_return_target`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-07`
- `base`: `main@f1cebf78` after AW-006 Habits date/motivation clarity PR `#1005` and repo-managed closeout PR `#1006`
- `audit_status`: `ready`
- `decision`: Execute this focused polish before Child K reset implementation.
- `reason`: Owner reported the Habits completion sound still feels bad after Child J and requested the Habits Motivation `Stats` collapse removed; owner also selected Micro Sessions bubble completion sound with distinct tap/timer sound profiles. Screenshot review then identified small IA/visual polish in Habits Motivation/date context and Micro Sessions Bubble actions. This is visible/local UX polish and does not require reset/data work.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `/my-library/habits`, `HabitPerfectDayHub`, `/my-library/dryland`, `DrylandMicroPlanPanel`, localStorage preference contracts, Web Audio helper behavior, Micro Sessions bubble/timer flow, support docs, screenshot handoff rules, or verification lanes change before execution resumes.

## Goal

Make completion feedback and small control surfaces feel polished across Habits and Micro Sessions while keeping Habits Motivation stats visible without an unnecessary `Stats` disclosure.

## Pre-Implementation Owner Explanation

Vi bytter den irriterende Habits-lyden med en rolig, kort mestringslyd, legger tilsvarende valgfri lyd paa Micro Sessions-bobler, og viser Habits Motivation-statistikk aapent uten `Stats`-knappen.

Hvorfor det betyr noe: lyd skal gi tydelig, premium feedback uten aa irritere, og Motivation skal vaere rask aa lese uten ekstra trykk.

Utenfor scope er `Start fresh`, reset-historikk, database/API-endringer, Calendar reset-markorer, reminders, notifications, globale lydinnstillinger, opplastede lyder og dashboard/graf-redesign.

Fremoverkompatibilitet: nye lydhendelser maa mappes eksplisitt til en navngitt lydprofil med tester. Ukjente handlinger, skip/rest/slip/reset/undo, feil, page load og hydration skal ikke spille lyd.

Owner screenshot-review correction: Habits date/status/details should read like context instead of stacked pills/buttons, zero-value streak stats should show `0 days`, Motivation should show concrete numbers with an `Early data` explanation instead of vague `Not enough history`, `What counts?` and `More history` should behave as one-open-at-a-time controls with full-width content below, Habits contextual Admin notes should not sit behind a large empty gap, and Micro Sessions Bubble actions should be simple `Edit`/`Clear` controls rather than a `Manage micro session` accordion or normal `Pause` action.

## Product Decisions

- Use a shared client-side audio helper instead of route-local oscillator code.
- Keep all sound local-only and default off.
- Reuse the existing Habits icon toggle; remove visible `Sound on.` and `Sound off.` helper notices for normal toggles.
- Keep non-blocking guidance only for unsupported/blocked audio or failed localStorage persistence.
- Habits uses a softer `softSuccessChime` profile for completion and timed target crossing.
- Micro Sessions uses:
  - `tapComplete` for reps/tap-confirm completion;
  - `timerComplete` for duration/timer completion or timer auto-complete.
- Micro Sessions gets its own compact icon toggle because the Habits preference is not a clear global app setting.
- Habits Motivation stats are always visible. `What counts?` remains a disclosure because it is explanatory help text, not core stats.
- `What counts?` and `More history` use controlled one-open-at-a-time disclosure state; opened content spans the full Motivation width below the control row.
- Perfect-day and consistency metrics stay numeric even with sparse data. Fewer than `7` measured days shows a small amber `Early data: <n>/7 days measured.` explanation; `0/0` means no scheduled Perfect Day habits existed in the selected period.
- Habits selected date is calm text near the `Habits` heading, not a competing action pill.
- Zero perfect-day streak values show `0 days`, not `None yet`, because these are numeric stats.
- Micro Sessions Bubble mode shows compact `Edit` and `Clear` actions directly. Existing paused plans still expose `Resume`, but normal active plans do not offer a new `Pause` action.
- Habits contextual Admin notes spacing is tightened at the route chrome boundary only; admin note create/show behavior is unchanged.
- Deferred reset best-practice decision: do not delete historical check-ins by default. Future reset should use server-canonical reset events, show current post-reset metrics by default, keep `Before reset` history available, and support multiple reset boundaries with dates.
- Deferred Micro Sessions-to-Habits decision: do not auto-create habits silently. A future slice may offer explicit `Create habit from micro session` / `Link to habit` choices with opt-in semantics.

## Scope

- Add a shared audio profile helper for Web Audio playback.
- Replace the existing Habits oscillator tone with the shared `softSuccessChime` profile.
- Keep Habits sound default off, local-only, icon-only, and fail-soft.
- Remove the `Stats` toggle/collapse from top-level Habits Motivation.
- Show current perfect-day streak, best perfect-day streak, perfect days, and consistency by default.
- Show zero-value perfect-day streak metrics as `0 days`.
- Show perfect-day and consistency metrics as concrete values (`0/0`, `0/6`, `0%`) instead of vague data-sufficiency copy.
- Show a compact amber `Early data` explanation when the selected period has fewer than `7` measured days that could count toward Perfect Days. Do not rely on color alone; the text label must carry the meaning.
- Place active/past habit chips beside the `Motivation` heading.
- Keep `What counts?`, `More history`, range controls, and per-habit Details progress while making `What counts?` lower-emphasis than `More history`; only one Motivation disclosure opens at a time and its content spans the full section width.
- Replace the Habits selected-date pill with calm context text below the `Habits` heading/status.
- Tighten `/my-library/habits` contextual Admin notes spacing without changing Admin notes workflow.
- Add Micro Sessions local sound preference, icon-only control, and fail-soft playback.
- Replace the Bubble-mode `Manage micro session` accordion with a compact `Edit` / `Clear` action row.
- Keep `Resume` available for already-paused Micro Sessions, but remove normal active-state `Pause` from the visible action row.
- Play Micro Sessions sound only after server-confirmed completion:
  - tap/reps bubble or ordered completion uses `tapComplete`;
  - duration/timer bubble completion uses `timerComplete`.
- Update unit/component tests for sound profiles, Habits trigger behavior, Micro Sessions trigger behavior, negative paths, and Motivation always-open stats.
- Update docs/runbooks and AW-006 lifecycle references for the changed sound/Motivation contracts.
- Capture screenshot handoff for Habits Motivation and Micro Sessions sound controls before `npm run verify:pre-pr`.

## Out Of Scope

- `Start fresh`, per-habit reset events, reset markers, reset history, `Before reset` history UI, multi-reset comparison behavior, or Child K implementation.
- Supabase migrations, RLS, generated database types, or new API routes.
- Calendar Comparison behavior or metrics.
- Reminder notifications, browser Notification API, push notifications, native app sounds, or haptics.
- User-selected/uploaded sounds, sound library, volume slider, server-stored preference, or global account setting.
- Micro Sessions persisted timer state, background timers, drag/drop, stats/progress redesign, Perfect Day linkage, habit auto-creation, explicit `Create habit from micro session`, or non-bubble execution redesign.
- Habit setup CRUD beyond the existing scoped Today edit/archive behavior, including a broader delete/restore flow.
- Changing check-in truth, micro-plan truth, analytics taxonomy, auth boundaries, or support-visible private data.
- Merging without explicit owner approval.

## Acceptance Criteria

1. Habits sound stays default off and local-only.
2. Habits normal enable/disable no longer shows visible `Sound on.` / `Sound off.` helper text.
3. Habits completion/timed-target sound uses a tested soft success profile, not the old single oscillator glide.
4. Habits still plays no sound for reset, undo, rest day, slip, failed saves, page load, hydration, or historical corrections.
5. Habits Motivation shows top-level stats open by default and no `Stats` toggle is rendered.
6. `What counts?` remains accessible as a disclosure-style button and opens full-width explanatory content.
7. Habits zero-value perfect-day streaks show `0 days`.
8. Habits active/past chips sit beside `Motivation`, and selected date appears as context text instead of a heading action pill.
9. `What counts?` and `More history` are not rendered as two stacked full-width outline buttons in normal Motivation view; only one may be open at a time.
10. Micro Sessions sound stays default off, local-only, and icon-only.
11. Micro Sessions tap/reps completion plays `tapComplete` only after the server confirms completion.
12. Micro Sessions duration/timer completion plays `timerComplete` only after the server confirms completion, including auto-complete at zero.
13. Micro Sessions skip/undo/restore/error/page-load/hydration do not play sound.
14. Micro Sessions Bubble mode shows compact `Edit` and `Clear` actions without a `Manage micro session` accordion or normal active-state `Pause`.
15. Existing paused Micro Sessions still expose `Resume`; clearing still requires confirmation.
16. Browser audio/localStorage failures do not block Habits or Micro Sessions mutations.
17. Perfect days and consistency show numeric values in sparse data states, with `Early data` or `No scheduled Perfect Day days` explaining confidence.
18. Habits contextual Admin notes spacing does not leave a large empty gap below the Habits/Motivation content on mobile.
19. Screenshot handoff proves Habits Motivation stats/details/date polish and Micro Sessions sound/action placement on desktop/mobile.

## Data Placement And Sync Contract

- Server-canonical data:
  - unchanged `habit_definitions`, `habit_check_ins`, `dryland_micro_plans`, and dryland session data.
  - completion truth continues to come from existing returned snapshots/API responses.
- Local data:
  - Habits sound preference remains in browser localStorage.
  - Micro Sessions sound preference is browser localStorage only.
  - transient Web Audio playback state stays in component/helper memory.
- Sync policy:
  - no Supabase sync for sound preferences.
  - clearing browser storage resets sound preferences to off.
  - failed audio/localStorage does not roll back successful mutations.
- Retention and sensitivity:
  - do not store habit names, micro unit titles, notes, private values, or history in sound preference keys.
  - support diagnostics use only preference state, browser/device mute state, and localStorage/audio availability.
- Cache/invalidation:
  - no route/data cache behavior changes.
  - Habits and Dryland routes keep their current server/API refresh behavior.

## Identity And Rename Contract

- Canonical stable IDs:
  - no new persisted entity identity.
  - existing habit IDs and micro block IDs remain completion truth keys.
- Human-readable identifiers:
  - habit titles and micro unit titles remain display-only and must not key sound preferences.
- Mutability:
  - local sound preferences are user-toggleable and resettable by browser storage clearing.
- Rename vs repurpose:
  - habit or micro unit title edits do not affect sound preference state.
- Compatibility:
  - unsupported browsers fall back to no sound and no data behavior change.
- Observability and repair:
  - support diagnoses sound through local preference, browser audio, device mute, and storage availability, not private habit or micro unit names.

## Forward Compatibility Contract

- Automatically supported:
  - existing Habits completion/timed target events mapped in this brief.
  - existing Micro Sessions queued-to-completed tap and duration/timer events mapped in this brief.
  - future habit titles, micro unit titles, and routine titles because sound preferences do not key off labels.
  - future selected Motivation ranges that still provide `eligibleDayCount`, `onTrackDayCount`, and `consistencyPercent` through the typed summary contract.
- Requires explicit mapping:
  - new sound triggers, new sound profiles, haptics, reminders, notifications, server-synced preferences, analytics payloads, locales, or global settings.
  - new Micro Sessions action states beyond queued/completed/skipped.
  - reset boundaries, multiple reset periods, Calendar reset markers, `Before reset` comparison segments, habit delete/restore semantics, or `Create habit from micro session` flows.
- Safe fallback:
  - unknown action/status does not play sound.
  - missing Motivation eligibility data shows numeric zero-state copy rather than vague history text.
  - blocked or unsupported audio shows non-blocking guidance only when needed.
  - storage failure keeps sound off for future reloads and does not block current work.
- Test/evidence:
  - profile tests verify frequency/duration/gain envelope.
  - component tests verify mapped and unmapped trigger behavior.
  - docs/support sweep records changed labels and diagnostics.

## Help / Guide Impact

Required:

- update `docs/user-flow-map.md` with open Habits Motivation stats, icon-only Habits sound, and Micro Sessions sound behavior.
- update `docs/runbooks/auth-account-support.md` with Habits/Micro Sessions local sound troubleshooting.
- Help Center/admin docs are `N/A` because this changes no admin workflow labels or operator action surface.

## Route / Label / Support Surface Sweep

Required before broad gates:

- `/my-library/habits`
- `/my-library/dryland`
- `/my-library/routines`
- `Sound on`
- `Sound off`
- `Completion sound`
- `Stats`
- `What counts?`
- `Motivation`
- `Micro Sessions`
- `Bubbles`
- `Manage micro session`
- `Edit micro session`
- `Clear micro session`
- `Pause`
- `Resume`
- `Complete?`
- `timerComplete`
- `tapComplete`
- `AudioContext`
- `localStorage`
- `Reset`
- `Undo`
- `Rest day`
- `Slip`

Required surfaces:

- `components/my-library/habits/HabitPerfectDayHub.tsx`
- `components/my-library/dryland/DrylandMicroPlanPanel.tsx`
- new shared audio helper under `lib/` or existing shared client helper surface
- `tests/unit/habit-perfect-day-hub.test.tsx`
- `tests/unit/dryland-micro-plan-panel.test.tsx`
- shared helper tests
- `docs/user-flow-map.md`
- `docs/runbooks/auth-account-support.md`
- Habits parent, AW-006 queue, and design inventory.

Completed sweep evidence:

- Identifiers searched: `/my-library/habits`, `/my-library/dryland`, `/my-library/routines`, `Sound on`, `Sound off`, `Completion sound`, `Stats`, `What counts?`, `More history`, `Motivation`, `Manage micro session`, `Edit micro session`, `Clear micro session`, `Pause`, `Resume`, `timerComplete`, `tapComplete`, `AudioContext`, `localStorage`, `Reset`, `Undo`, `Rest day`, and `Slip`.
- Surfaces checked / directories/surfaces: `components/`, `tests/unit/`, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, the active brief, the Habits parent brief, the AW-006 queue brief, and the design inventory.
- Fallout handled: product copy, component tests, user-flow map, support runbook, parent/queue/active briefs, and design inventory were updated; reset, Micro Sessions-to-Habits linkage, and habit CRUD findings were explicitly deferred.

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
- `Testing and QA automation`
- `Stack-fit and dependency discipline`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                       | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Sound improves completion feedback without creating new settings IA; Habits Motivation stats are readable without extra disclosure.      | screenshots + component tests + docs review    | `5/5`                   |
| UX flow clarity                               | `target`     | Sound controls are icon-only but accessible, default off, and feedback/error states are non-blocking; Motivation stats are always shown. | component tests + screenshot handoff           | `5/5`                   |
| Visual design quality                         | `target`     | Habits and Micro Sessions controls fit existing My Library/Dryland tokens on mobile and desktop with no text overflow.                   | responsive screenshots + text-fit review       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Sound triggers only after mapped successful completion transitions and never changes persisted habit or micro-plan truth.                | unit/component trigger tests                   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                               | explicit admin-editor scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Icon-only sound controls keep aria-label/aria-pressed; disclosures/buttons remain keyboard and screen-reader usable.                     | component tests + screenshot/manual QA         | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same threshold and evidence.                                                  | component tests + screenshot/manual QA         | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: add no dependency, no audio asset, no polling beyond existing timers, and keep helper tiny.                             | dependency diff + build/typecheck              | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Sound preferences are local-only; server-canonical completion truth remains unchanged.                                                   | brief contract + code review + tests           | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes no route read cache, server data fetch, revalidation, or invalidation behavior.                                 | cache scope rationale                          | `N/A`                   |
| Reliability and failure handling              | `target`     | Blocked audio/localStorage failure does not block completion; unsupported audio fails soft.                                              | rejection/storage tests                        | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no auth/API boundary changes; existing protected mutation paths remain unchanged.                                       | route/API diff review                          | `4/5`                   |
| Privacy and compliance                        | `target`     | Sound preferences store no private habit names, micro unit titles, notes, or history values.                                             | localStorage key/payload review + support docs | `5/5`                   |
| Content governance                            | `target`     | Parent, queue, inventory, user-flow map, support docs, and active brief record changed labels and deferred reset scope.                  | docs diff + `npm run lint:briefs`              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow labels, editable admin fields, role-gated CRUD, recovery action, or operator queue.           | explicit admin-workflow scope rationale        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` and `/my-library/dryland` are private/authenticated and no public metadata changes.                     | private-route SEO rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, public semantic page copy, structured data, or public AI-facing docs.        | AI-discoverability scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no analytics taxonomy, event payload, KPI dashboard, or persistence.                                            | analytics scope rationale                      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue flow.                    | commerce scope rationale                       | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs explain local sound diagnosis without private labels or treating sound as server data.                                      | support doc diff                               | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, or revenue operation.   | explicit finance scope rationale               | `N/A`                   |
| i18n operational readiness                    | `target`     | Icon-only sound controls reduce visible label pressure; remaining Motivation and Micro copy tolerates longer translations.               | responsive screenshots + component assertions  | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing React/client boundaries, tokens, tests, and Web Audio; add no dependency or asset.                                        | dependency diff + helper tests                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover sound profiles, Habits triggers/negative paths, Micro Sessions tap/timer triggers/negative paths, and open Motivation.       | unit/component tests + broad gates             | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is safe because no data migration/API change; reverting UI/helper restores prior local-only behavior.                           | diff review + pre-PR/pre-merge gates           | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no audio assets, no extra server calls, and no unbounded client storage growth.                                         | code review                                    | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `HabitPerfectDayHub` and `DrylandMicroPlanPanel` client boundaries.
  - keep sound state local to existing client surfaces.
  - do not add route/API/server behavior.
- TypeScript/domain contracts:
  - create a typed shared client audio profile helper.
  - make sound profile constants testable so frequency/duration/gain regressions are caught.
  - unknown profile/action values fail closed by not playing sound.
- Supabase/data layer:
  - no Supabase changes.
- External services/tools:
  - no external SDK/service.
- UI system:
  - reference surface / shared UI contract: reuse existing `HabitPerfectDayHub`, `DrylandMicroPlanPanel`, `fs-cta-*` button tokens, icon action/toggle contracts, and typed Motivation summary view-model instead of adding a new UI primitive.
  - reuse existing icon action/toggle styling and accessible names.
  - screenshot handoff is `after/reference` or `after` because the current before-state is known from existing UI and code.
- Testing:
  - focused helper/unit tests for audio profile contracts.
  - focused component tests for Habits and Micro Sessions.
  - screenshot handoff for changed visual surfaces.

## Validation

Before screenshot handoff:

- `npm run lint:briefs`
- targeted sound helper tests
- `npx vitest run tests/unit/habit-perfect-day-hub.test.tsx tests/unit/dryland-micro-plan-panel.test.tsx`
- route/label/support sweep from this brief
- local screenshot capture for `/my-library/habits` and `/my-library/dryland`

Completed evidence:

- `./node_modules/.bin/vitest run tests/unit/client-sound.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/dryland-micro-plan-panel.test.tsx` -> pass, `3` files / `88` tests.
- `./node_modules/.bin/vitest run tests/unit/client-sound.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/dryland-micro-plan-panel.test.tsx` after screenshot-review UI corrections -> pass, `3` files / `88` tests.
- `./node_modules/.bin/vitest run tests/unit/client-sound.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/dryland-micro-plan-panel.test.tsx` after final owner-approved copy/button tweaks -> pass, `3` files / `89` tests.
- `npm run typecheck` -> pass.
- `npm run lint:briefs` -> skipped because the new active brief is untracked before staging.
- `npm run lint:briefs:all` -> pass, including this active brief.
- route/label/support sweep completed across changed product, tests, docs, parent, queue, inventory, and active brief; remaining `Stats`, historical selected-date `chip`, `Pause` / `Resume`, and historical micro-audio matches are either explicit negative assertions, active acceptance criteria, timer/paused-plan contracts, or historical child records superseded by Child M.
- Product-rendering files changed after final capture for owner-approved button width/copy tweaks only; owner approved screenshot handoff and explicitly requested no new screenshots before continuing to tests/PR.
- `npm run verify:pre-pr` -> pass, full lane after removing the new `HabitPerfectDayHub` lint warning; quality-gates, lint, typecheck, unit, build, perf-budget, and e2e passed. E2E result: `106` passed, `530` skipped. Log: `artifacts/test-runs/20260607-123951/verify.log`.

After owner visual/sound approval and before PR update:

- `npm run verify:pre-pr`

Before future merge:

- required CI checks green
- `npm run verify:pre-merge`

## Screenshot Requirements

Required because this changes visible Habits and Micro Sessions UI.

Handoff must include:

- Habits Motivation desktop/mobile with stats visible and no `Stats` button;
- Habits compact sound icon state;
- Micro Sessions desktop/mobile with sound icon control and Bubbles surface;
- clickable `Screenshot artifacts` folder link and `Captured: YYYY-MM-DD HH:MM`.

Screenshot evidence:

- `output/habits-micro-polish-2026-06-07-100925`
- Captured: `2026-06-07 10:09`
- Handoff type: `after/reference`.
- Caveat: local authenticated `/my-library` screenshot flow was blocked by the Supabase egress guard because `.env.local` points at a cloud Supabase project; screenshots were captured from a temporary local fixture route that rendered the actual changed Habits and Micro Sessions components with mock owner data, then the fixture route was removed from the repo diff.
- Product-rendering files changed after capture: only the temporary fixture route was removed; no final Habits/Micro Sessions component, style, or asset files changed after capture.
- Superseded by owner screenshot-review corrections for Habits date/status/details and Micro Sessions Bubble actions; refresh screenshot evidence before pre-PR gates.

Refreshed actual-route screenshot evidence after owner approved one-time cloud Supabase smoke capture:

- `output/habits-micro-polish-actual-routes-2026-06-07-105558`
- Captured: `2026-06-07 11:02`
- Handoff type: `after-only actual-route`.
- Runtime caveat: dev server was started with `FS_ALLOW_PROD_SUPABASE=1` only for screenshot capture. No env files were changed and no cloud writes were performed.
- Data caveat: the current owner cloud data has no active habits and no active Micro Session, so actual-route screenshots prove the Habits polish and Dryland/Micro no-active state only. Micro Sessions sound/action placement remains validated by component tests unless owner explicitly approves creating/clearing a cloud test micro session.
- Invalid combined Habits + Micro Sessions fixture screenshots were superseded and are not valid handoff evidence.
- Product-rendering files changed after refreshed actual-route capture: yes, final screenshot-review corrections changed `HabitPerfectDayHub` and `SiteChrome`; this evidence is superseded until refreshed screenshots are captured.

Final refreshed actual-route screenshot evidence after owner screenshot-review corrections:

- `output/habits-micro-polish-actual-routes-2026-06-07-113407`
- Captured: `2026-06-07 12:04`
- Handoff type: `after-only actual-route`.
- Runtime caveat: dev server was started with `FS_ALLOW_PROD_SUPABASE=1` only for screenshot capture. No env files were changed and no cloud writes were performed.
- Capture caveat: route screenshots keep the real Habits mobile top/bottom nav; focused Motivation element screenshots hide fixed site chrome and the local Next dev indicator only to avoid Playwright screenshot overlay, not to change product rendering.
- Data caveat: the current owner cloud data has no active habits and no active Micro Session, so actual-route screenshots prove the Habits polish and Dryland/Micro no-active state only. Micro Sessions sound/action placement remains validated by component tests unless owner explicitly approves creating/clearing a cloud test micro session.
- Product-rendering files changed after final refreshed capture: yes, owner requested the final button-width and archived-habit copy/layout fixes and explicitly waived new screenshots before tests/merge.

Owner screenshot approval stop:

- Owner approved the final screenshot handoff on `2026-06-07` and then explicitly requested no new screenshots for the final button/copy/layout tweaks before continuing to tests/PR/merge.
- Product-rendering files changed after final capture only for approved button width, Admin notes alignment/action width, Motivation disclosure width, and archived-habit copy/chip tweaks; this is an owner-approved screenshot waiver for that final delta.

Manual sound QA:

- Owner should enable Habits sound once and confirm the preview is no longer the old bad tone.
- Owner should enable Micro Sessions sound once and confirm tap-complete and timer-complete feel distinct but calm.

## Checkpoint Log

- `2026-06-07 | in-progress | owner selected Habits + Micro Sessions polish after Child K reset scope audit; created this active brief on branch aw-006-habits-micro-sessions-sound-motivation-polish from main@f1cebf78 | next: implement shared sound helper, Habits Motivation always-open stats, Micro Sessions sound, focused tests/docs, then screenshot/sound handoff before pre-PR gate`
- `2026-06-07 | in-progress | implemented shared client sound profiles, replaced Habits sound, removed normal visible sound on/off helper text, removed the top-level Motivation Stats collapse, added Micro Sessions local sound toggle plus tap/timer completion triggers, updated tests/docs/parent/queue/inventory, and passed targeted tests plus all-brief lint | next: capture Habits and Micro Sessions screenshots and stop for owner visual/sound approval before pre-PR gates`
- `2026-06-07 | in-progress | captured screenshot handoff artifacts at output/habits-micro-polish-2026-06-07-100925 using an after/reference fixture route because authenticated local capture was blocked by Supabase egress guard; temporary fixture route was removed from the repo diff after capture | next: hand off screenshots and wait for owner visual/sound approval before npm run verify:pre-pr`
- `2026-06-07 | in-progress | owner screenshot-review added visual corrections: Habits selected date/status/details should be calmer, zero-value streak stats should show 0 days, and Micro Sessions Bubble should use direct Edit/Clear actions without a normal Pause action; implemented those corrections and passed targeted component tests | next: refresh screenshots, then stop again for owner visual/sound approval before npm run verify:pre-pr`
- `2026-06-07 | in-progress | owner added final screenshot-review findings: Motivation sparse-data copy must be concrete, What counts/More history should match button hierarchy and not open awkwardly, Admin notes spacing should not leave a large gap, and deferred reset/CRUD/micro-habit decisions must be preserved systemically; implemented controlled Motivation disclosures, numeric early-data states, route-local Admin notes spacing, and explicit deferred-scope contracts | next: rerun targeted tests/typecheck/brief lint, refresh actual-route screenshots, then stop for owner visual approval before npm run verify:pre-pr`
- `2026-06-07 | in-progress | refreshed actual-route screenshots at output/habits-micro-polish-actual-routes-2026-06-07-113407 after final UI corrections; Habits route, Motivation disclosures, More history, What counts, Admin notes spacing, and Dryland/Micro no-active state are captured, while active Micro Session sound/action placement remains component-test evidence because cloud data has no active micro plan | next: stop dev server and hand off screenshots for owner approval before npm run verify:pre-pr`
- `2026-06-07 | in-progress | owner approved screenshots and requested no new screenshots; tightened Micro empty-state CTA width, made What counts/More history equal secondary controls, simplified Early data copy, kept the amber Early data line as supporting emphasis rather than color-only meaning, and passed targeted tests/typecheck/brief lint | next: run npm run verify:pre-pr, commit, push, open/update PR, then monitor CI`
- `2026-06-07 | in-progress | npm run verify:pre-pr passed full lane after final owner-approved copy/button tweaks, screenshot waiver evidence, and removal of the new HabitPerfectDayHub lint warning | next: commit, push, open/update PR, then monitor CI`
- `2026-06-07 | in-progress | owner found final width/copy misses after PR #1007 was opened: Micro empty CTA must be full width, Admin notes must align to the Habits container with 50/50 mobile actions, What counts/More history must be equal-width controls, and archived habits must use Past habit plus completed/best/final/consistency copy; implemented those fixes and passed targeted unit tests | next: run npm run verify:pre-pr, amend/push PR #1007, monitor CI, run npm run verify:pre-merge, then merge on green gates per owner approval`
- `2026-06-07 | done | PR #1007 shipped as squash commit 0bbc9c69 after local full pre-PR, green CI, and pre-merge gate; owner explicitly waived new screenshots for final button/copy/layout fixes and approved merge on good tests | next: complete this repo-managed docs-only closeout, rerun post-merge preflight, then complete mandatory chat-handoff before any new implementation slice`

## Completion Record

- `completed`: `2026-06-07`
- `merged_pr`: `#1007`
- `squash_commit`: `0bbc9c69`
- `result`: Closed AW-006 Habits And Micro Sessions Sound + Motivation Polish. Habits now uses the softer local completion sound, Micro Sessions has its own local completion sound for confirmed tap/timer completions, Motivation stats stay visible without a `Stats` collapse, sparse Motivation states show concrete numbers with explicit early-data/no-scheduled-days context, the final button widths and archived-habit history copy match the app's action system, and the reset/micro-habit/CRUD questions remain deliberately deferred.
- `validation`: targeted unit tests passed; `npm run verify:pre-pr` passed full lane locally on committed HEAD `6f8eb47d` with `1398` unit tests, build, perf budgets, and E2E `106 passed / 530 skipped`; PR #1007 CI passed required checks including `verify`, `e2e-smoke`, `site-lock-smoke`, deploy preview, size-check, CodeQL, and Vercel; `npm run verify:pre-merge` passed and confirmed branch currency before merge.
- `screenshot_review`: owner approved the final screenshot handoff, then explicitly waived new screenshots for the final button/copy/layout delta before tests/merge.
- `10/10 claim`: yes - all critical target categories below reached `5/5` for this scoped UI/local-sound slice.

| Category                                      | Achieved Score | Evidence                                                                                                                                                                               | Gaps / Notes                                              |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR #1007 shipped the owner-selected polish while keeping Child K reset, Micro Sessions habit linkage, and broader habit CRUD out of runtime scope.                                     | No remaining gap in this slice.                           |
| UX flow clarity                               | `5/5`          | Motivation is always visible, disclosures are controlled/equal-width, sound help text is removed, and Micro Bubble actions are direct `Edit` / `Clear` with `Resume` only when paused. | No remaining gap in this slice.                           |
| Visual design quality                         | `5/5`          | Screenshot-approved route evidence plus owner-approved no-new-screenshot waiver for final full-width/equal-width button and archived-habit copy/layout fixes.                          | No remaining gap in this slice.                           |
| Business logic correctness and data integrity | `5/5`          | Sound remains local-only/fail-soft and triggers only after confirmed completion transitions; no persisted Habits/Micro truth, API, or database behavior changed.                       | No remaining gap in this slice.                           |
| Accessibility (a11y)                          | `5/5`          | Component coverage preserves accessible icon toggles, disclosure expanded state, and keyboard/button semantics; broad gates and CI passed.                                             | No remaining gap in this slice.                           |
| Accessibility                                 | `5/5`          | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same evidence applies.                                                                                                      | No remaining gap in this slice.                           |
| Data placement and sync boundaries            | `5/5`          | Local sound preferences stay local-only; server-canonical completion and Micro plan state remain unchanged.                                                                            | No remaining gap in this slice.                           |
| Reliability and failure handling              | `5/5`          | Audio/localStorage failures are covered as non-blocking; unsupported/unmapped sound actions fail closed.                                                                               | No remaining gap in this slice.                           |
| Privacy and compliance                        | `5/5`          | Local sound preference stores no private habit names, micro unit titles, notes, or history values; support docs explain this boundary.                                                 | No remaining gap in this slice.                           |
| Content governance                            | `5/5`          | Parent, queue, inventory, user-flow map, support docs, and this brief record labels, behavior, screenshot waiver, and deferred reset/linkage/CRUD decisions.                           | Closeout PR updates stale lifecycle references to `done`. |
| Incident response and support operations      | `5/5`          | Support runbook includes local Habits/Micro Sessions sound troubleshooting without treating sound as server data.                                                                      | No remaining gap in this slice.                           |
| i18n operational readiness                    | `5/5`          | Icon-only sound controls reduce visible label pressure; equal-width controls and tests protect responsive action layout.                                                               | No remaining gap in this slice.                           |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing React/client surfaces, design tokens, and Web Audio; no new dependency, asset, API, or server boundary.                                                                | No remaining gap in this slice.                           |
| Testing and QA automation                     | `5/5`          | Targeted unit/component tests plus local full `verify:pre-pr`, CI, and `verify:pre-merge` passed.                                                                                      | No remaining gap in this slice.                           |
| DevOps and rollback readiness                 | `5/5`          | No migration/API change; rollback is a normal PR revert of local UI/helper behavior.                                                                                                   | No remaining gap in this slice.                           |
