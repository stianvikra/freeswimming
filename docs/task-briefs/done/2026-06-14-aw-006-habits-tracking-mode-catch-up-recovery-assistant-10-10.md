# Task Brief: AW-006 Habits Tracking Mode Clarity + Catch-Up Recovery Assistant (10/10)

## Metadata

- `id`: `2026-06-14-aw-006-habits-tracking-mode-catch-up-recovery-assistant-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-14`
- `updated`: `2026-06-15`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_intake`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `execution_mode`: `shipped in PR #1128`
- `strict_10_10_mode`: `yes; all target categories must close at 5/5`

## Brief Audit Record

- `last_audited`: `2026-06-15`
- `base`: clean synced `main@a350a4b6`
- `audit_status`: `done`
- `decision`: Closed this bounded Habits child after PR `#1128` shipped habit-first catch-up recovery and tracking-mode clarity.
- `reason`: Current Habits now separates manual, quit/slip, and source-backed modes in the UI; catch-up writes explicit per-habit historical choices only; reset boundaries remain server-canonical; and setup-guide intent selection is preserved as planned Child T.
- `must_refresh_before_execution_if`: Refresh if `AGENTS.md`, platform scorecard categories, Habits parent intake, `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, habits API/storage contracts, `habit_check_ins`, `habit_motivation_resets`, Micro Session Habit linkage, Help/Guide content, screenshot handoff rules, or external habit-app benchmark assumptions change before execution.

## Goal

Make Habits clear and recovery-safe when users return after missed days: each habit explains whether it is manual, quit/slip-based, or source-backed, and a catch-up assistant helps users backfill, rest, leave missed days, or restart motivation stats without deleting or falsifying history.

## Pre-Implementation Owner Explanation

Vi skal gjore Habits tryggere nar brukeren ikke har vaert inne pa noen dager. Appen skal forklare hvilke habits som ma markeres manuelt, hvilke quit-habits som bare trenger `Log slip`, og hvilke habits som fullfores automatisk fra en kilde som Micro Sessions.

Hvorfor det betyr noe: hvis appen teller feil, logger slip feil, eller foreslar reset pa feil mate, mister brukeren tillit og motivasjon. Denne slicen skal gi en rolig "catch up"-flyt som lar brukeren rette opp dagene uten at gammel historikk forsvinner.

Utenfor scope er tungt dashboard, nye eksterne integrasjoner, push reminders, hard delete, eksport, og runtime setup-veileder. Setup-veilederen skal planlegges som egen child/del 2 etter at tracking- og recovery-kontrakten er trygg.

Fremoverkompatibilitet: nye habit modes, kilder, statuser og cadence-typer skal enten flyte gjennom typed contracts/view-models med trygg fallback, eller kreve eksplisitt mapping, Help/Guide-oppdatering og tester for de slippes.

## External Habit-App Audit

Audit date: `2026-06-14`. Sources are official/product-owned where practical.

| App/source                                                                                            | What works well                                                                                   | What Freeswimming should borrow                                                                      | What Freeswimming should improve                                                                                                     |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Streaks, `https://streaksapp.com/`                                                                    | Simple streak loop, clear schedules, and automatic tracking from trusted Apple Health categories. | Source-backed completion is valuable when the source is trustworthy and user-approved.               | Avoid making all auto behavior look the same; distinguish Micro Session source-backed completion from manual habits and quit habits. |
| Habitify Help, `https://intercom.help/habitify-app/en/`                                               | Clear concepts around recording progress, seeing progress, streaks, and skip behavior.            | Treat skip/rest as first-class, and make progress periods easy to understand.                        | Use product-specific labels: `Rest day`, `Slip`, `Manual`, `Source-backed`, not generic hidden state.                                |
| Loop Habit Tracker, `https://loophabits.org/` and `https://github.com/iSoron/uhabits/discussions/689` | Strong privacy posture, detailed history, flexible schedules, skip days, and transparent scoring. | Backfill/history should be editable and non-destructive.                                             | Keep top-level motivation understandable instead of relying on black-box scores.                                                     |
| Strides, `https://www.stridesapp.com/help/`                                                           | Uses setup help, skip, bad-habit logging, streak/stats, reminders, and historical editing.        | A guided setup flow is a legitimate 10/10 feature, but it depends on clear tracking semantics first. | Make the guide domain-aware for swimmers and micro-training rather than generic habit setup.                                         |
| Fabulous, `https://www.thefabulous.co/`                                                               | Wins on coaching, guided journeys, and habit formation support, not only counters.                | The setup guide should ask intent questions and recommend a small starting routine.                  | Keep Freeswimming practical and action-first; avoid a marketing-like journey that slows daily logging.                               |
| Routinery, `https://www.routinery.app/`                                                               | Guided routines, timers, reminders, and repeatable routine structure.                             | The future setup guide can help users assemble a habit routine, especially around timed habits.      | Do not turn Habits into a separate routine app; keep Micro Sessions as the structured exercise execution surface.                    |

### Audit Synthesis

Successful habit apps usually do four things well:

- they separate `done`, `missed`, `skip/rest`, and `bad-habit slip`;
- they let users correct history without pretending the app knows what happened;
- they use auto-tracking only for trusted sources and label it clearly;
- they provide setup guidance so users create realistic habits with the right cadence and completion rule.

Freeswimming can be better by making the data contract stricter: no silent midnight writes for positive or negative check-ins, no local-only reset that changes real stats, no hidden slip logging, and no destructive reset of old check-ins.

## Product Decisions

1. Do not add a plain `auto increment on/off` toggle.
2. Add explicit tracking-mode language instead:
   - `Manual`: user completes with `Mark done`, `Save`, or `Finish`.
   - `Quit`: app counts clear days until the user logs `Slip`; `Log slip` is visible only for quit habits.
   - `Source-backed`: a trusted linked source, currently Micro Sessions, completes the habit; manual `Mark done` stays hidden.
3. Do not write automatic `missed`, `slip`, or `done` rows at day change.
4. Catch-up recovery writes only explicit user choices:
   - global catch-up is a summary/reset entrypoint;
   - each affected habit card owns its own catch-up dates;
   - direct `Mark done` only for the specific habit/date when that row is a manual binary habit;
   - direct `Rest day` for the specific habit/date;
   - direct `Reset stats from <date>` through motivation reset boundaries;
   - value/duration/count corrections and quit slips route through `Review day` so the user acts on the exact historical date.
5. `Leave missed` writes nothing. Missed status remains derived from missing evidence plus cadence.
6. Reset is server-canonical when it affects stats:
   - per-habit reset creates `habit_motivation_resets`;
   - all-habit recovery reset creates one reset boundary for each selected active habit;
   - earlier check-ins remain saved and visible through Calendar Comparison / complete history.
7. Local-only state is allowed only for UI prompts, dismissal, and draft catch-up choices. It must not become history or motivation truth.
8. Setup guide is a follow-up child after this brief unless the owner explicitly chooses to combine phases before execution.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode: all `target` rows must close at `5/5`. Critical target categories: Product goals and IA, UX flow clarity, Business logic correctness and data integrity, Data placement and sync boundaries, Reliability and failure handling, Security and authz, Privacy and compliance, Analytics and KPI observability, Incident response and support operations, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping | Threshold for this brief                                                                                                                                   | Evidence                                                       | Expected score |
| --------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------- |
| Product goals and IA                          | target  | Habits route clearly separates manual, quit, and source-backed tracking; catch-up appears only when useful and does not hide daily logging.                | screenshot handoff, unit/component tests, Help/Guide update    | 5/5            |
| UX flow clarity                               | target  | User can recover after 2+ missed eligible days by choosing backfill/rest/leave missed/reset without ambiguous auto-complete language.                      | component tests, e2e happy path, screenshot handoff            | 5/5            |
| Visual design quality                         | target  | Catch-up assistant and tracking-mode labels match existing Habits token/action system with no card-in-card clutter or mobile overlap.                      | screenshot handoff desktop/mobile, visual review               | 5/5            |
| Business logic correctness and data integrity | target  | No silent midnight writes; every saved check-in/reset comes from explicit user action or approved source-backed completion; reset never deletes check-ins. | domain tests, route tests, migration review if needed          | 5/5            |
| Admin editor ergonomics                       | N/A     | No admin editor surface is changed; if Help/admin support content is touched, it is covered under support operations, not admin editing.                   | route/label/support sweep confirms no admin editor changes     | N/A            |
| Accessibility (a11y)                          | target  | Catch-up assistant uses semantic dialog/region/fieldset patterns, keyboard navigation, focus restore, labels, and accessible status feedback.              | Testing Library assertions, Playwright/a11y spot check         | 5/5            |
| Performance (CWV + payloads)                  | target  | `/my-library/habits` remains within existing My Library budgets; no new dependency or heavy charting payload is added.                                     | build stats or bundle review, route smoke, verify gates        | 5/5            |
| Data placement and sync boundaries            | target  | Server owns check-ins/reset boundaries/source-backed credits; local owns only prompt dismissal/drafts/last-seen hint; failures are retryable.              | brief contract, tests for writes and local-only behavior       | 5/5            |
| Caching and invalidation strategy             | target  | Mutations refresh the selected-date snapshot; stale catch-up state is reconciled after writes and route date changes.                                      | component/route tests, manual QA                               | 5/5            |
| Reliability and failure handling              | target  | Partial save failures do not mark rows as complete; retry and per-day error states are deterministic; offline/localStorage failures degrade safely.        | negative-path tests, UI error-state tests                      | 5/5            |
| Security and authz                            | target  | Protected habit write routes stay fail-closed with user ownership checks and validated dates/statuses.                                                     | route negative-path tests                                      | 5/5            |
| Privacy and compliance                        | target  | No sensitive habit notes or raw personal text in analytics/logs; local prompt state stores only minimal dates/IDs.                                         | analytics payload review, tests/mocks                          | 5/5            |
| Content governance                            | target  | Help/Guide copy and user-flow map describe tracking modes, rest, slip, missed, reset, and source-backed completion from one source of truth.               | docs diff, route/label/support sweep                           | 5/5            |
| Admin workflow and editability                | N/A     | No admin CRUD/workflow is changed; support copy updates must not introduce admin-only operational steps.                                                   | route/label/support sweep                                      | N/A            |
| SEO and crawlability                          | N/A     | Habits is private/authenticated; no public metadata, sitemap, or crawl surface changes are expected.                                                       | diff review confirms no public route SEO changes               | N/A            |
| AI discoverability                            | N/A     | No public AI-discoverable content surface is changed; private Help/Guide copy is not a crawl target.                                                       | diff review confirms no public content/structured data changes | N/A            |
| Analytics and KPI observability               | target  | Events distinguish catch-up opened, day recovered, rest logged, slip logged, reset started, reset confirmed, and source-backed/manual mode without PII.    | analytics event tests/review                                   | 5/5            |
| Commerce and revenue ops                      | N/A     | No pricing, entitlement, checkout, product, refund, or revenue path is changed.                                                                            | diff review confirms no commerce files changed                 | N/A            |
| Incident response and support operations      | target  | Support can explain why stats changed after reset/catch-up and diagnose source-backed vs manual writes from safe event payloads.                           | Help/Guide/runbook update, safe diagnostics review             | 5/5            |
| Finance and reporting operations              | N/A     | Scope does not touch payments, invoices, payouts, refunds, or finance reports; habit stats are not finance-relevant.                                       | explicit scope rationale in PR/brief closeout                  | N/A            |
| i18n operational readiness                    | target  | Labels avoid layout-fragile text and centralize status copy so later locales can expand without breaking compact controls.                                 | copy inventory/review, screenshot mobile widths                | 5/5            |
| Stack-fit and dependency discipline           | target  | Reuse existing Habits view-model/API patterns, no new dependency, typed status handling, and Supabase discipline if schema changes are required.           | code review, typecheck, dependency diff                        | 5/5            |
| Testing and QA automation                     | target  | Domain, route, component, and focused e2e coverage protect tracking-mode, catch-up, reset, and failure paths.                                              | Vitest, Playwright, verify gates                               | 5/5            |
| Scalability and cost efficiency               | target  | Catch-up summary derives from loaded bounded habit/check-in windows; no unbounded per-day queries or client-heavy dashboard added.                         | query/code review, perf smoke                                  | 5/5            |
| DevOps and rollback readiness                 | target  | Any migration is additive and rollback-safe; feature can be disabled by reverting UI/code without destructive data cleanup.                                | migration/rollback notes, verify gates                         | 5/5            |

## Stack / Architecture Best-Practice Gate

Use `docs/runbooks/codex-skill-stack-readiness-radar.md` before execution because this is a broad UI, data-boundary, analytics, Help/Guide, and recovery-flow slice.

Capability audit for execution:

| Capability                    | Evidence                                              | Current status           | Recommended trigger                               | Boundary                                  |
| ----------------------------- | ----------------------------------------------------- | ------------------------ | ------------------------------------------------- | ----------------------------------------- |
| Playwright/browser automation | session MCP/tools + repo Playwright tests             | available                | screenshot handoff and focused Habits e2e         | does not replace screenshot approval stop |
| `playwright` Codex skill      | `/Users/stianvikra/.codex/skills/playwright/SKILL.md` | installed                | if terminal/browser screenshot fallback is needed | use repo runbooks first                   |
| Web/source audit              | official app/product sources from this brief          | available                | refresh benchmark if execution starts much later  | do not copy proprietary UX blindly        |
| Stripe plugin skills          | session metadata                                      | available but irrelevant | none                                              | do not use for this non-commerce slice    |

Systemic findings:

| Surface                    | Finding                                                                                                                 | Severity | Recommended Type             | Owner Decision Needed                         | Follow-Up Brief Path                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Habits tracking semantics  | `auto increment on/off` is too vague and risks data corruption; tracking modes need explicit contract and UI.           | high     | bounded implementation child | no; this brief chooses tracking modes         | this brief                                                                                      |
| Habits missed-day recovery | Returning after days away needs a catch-up assistant that writes only explicit choices and can reset motivation safely. | high     | bounded implementation child | no; this brief defines safe behavior          | this brief                                                                                      |
| Habit setup guidance       | Successful apps use guided setup, but it depends on stable tracking semantics first.                                    | medium   | bounded implementation child | yes; owner can choose timing after this slice | `docs/task-briefs/planned/<date>-aw-006-habits-setup-guide-assistant-10-10.md` after this brief |

Stack surfaces:

- React/Next.js:
  - reuse `/my-library/habits` and `HabitPerfectDayHub` as the mature reference surface;
  - preserve App Router server snapshot load in `app/my-library/habits/page.tsx`;
  - keep catch-up UI client-side inside existing Habits hub unless a server boundary is required for new data.
- TypeScript/domain:
  - extend typed view-models in `lib/habits/shared.ts` before adding route-local conditionals;
  - add discriminated helper output for tracking mode / catch-up eligibility;
  - unknown modes/statuses fail closed and do not improve streaks.
- Supabase/data:
  - prefer no schema change for phase 1 if existing `habit_check_ins`, `habit_motivation_resets`, and Micro Session link fields can express the behavior;
  - if schema is required, use additive migration, RLS owner checks, generated type updates, and negative-path tests.
- API/routes:
  - reuse existing check-in and reset-stats routes where possible;
  - batch catch-up writes only if required for atomicity and testability;
  - no protected route may return `500` for expected unauthorized/invalid input cases.
- UI:
  - reuse Habits card/action primitives and current token system;
  - avoid nested cards and oversized explanatory panels;
  - screenshot handoff must include mobile daily logging, desktop Motivation/catch-up, and source-backed Micro Session habit reference.
- Testing:
  - update domain tests in `tests/unit/habits.test.ts`;
  - update component tests in `tests/unit/habit-perfect-day-hub.test.tsx`;
  - update route tests in `tests/unit/habits-routes.test.ts` / `tests/unit/habits-server.test.ts` if API behavior changes;
  - update `tests/e2e/my-library-habits.spec.ts` for the primary catch-up path.

## Data Placement And Sync Contract

Server-canonical data:

- `habit_definitions`: habit identity, title, mode, cadence, source-backed linkage view, status.
- `habit_check_ins`: explicit done/value/time/rest/slip/manual/timer/source-backed evidence.
- `habit_motivation_resets`: reset boundaries used by per-habit and top-level Motivation stats.
- `micro_session_habit_links`: source-backed Micro Session relationship and active/paused state.

Local-only data:

- catch-up assistant dismissed/open state;
- draft choices before submit;
- optional `lastHabitsSeenDate` hint for prompt timing;
- existing local sound preference remains unchanged.

Sync policy:

- all meaningful habit history changes write through server routes and reload the selected snapshot;
- catch-up multi-day choices must either save with per-row status feedback or use an atomic route with deterministic rollback/error copy;
- local prompt dismissal cannot hide server failures or modify stats;
- if browser storage is unavailable, the catch-up prompt still works from server data and simply cannot remember dismissal.

Retention and sensitivity:

- no destructive reset of check-ins;
- local prompt state must not store notes, personal habit content beyond minimal IDs/dates, or raw analytics payloads;
- analytics events must not include free-text habit notes/titles unless already approved elsewhere.

Cache/invalidation:

- `/my-library/habits` remains user-specific and no-store/dynamic as today;
- successful writes refresh the selected date/week/motivation snapshot;
- route date changes reconcile catch-up eligibility against the newly loaded snapshot.

## Identity And Rename Contract

- Canonical stable ID:
  - `habit_definitions.id` remains the durable habit identity for check-ins, reset events, Micro Session links, analytics correlation, and UI focus.
- Human-readable identifiers:
  - `title` is editable display copy and must not be used as a stable key.
- Mutability:
  - habit title/notes/cadence remain editable under existing lifecycle rules;
  - tracking-mode semantics may be edited only through existing safe habit edit contracts and must not repurpose old history silently.
- Rename vs repurpose:
  - rename in place when the same real habit continues;
  - create/end/restore separate habit identity for materially different behavior that would make old check-ins misleading.
- Compatibility:
  - legacy `build` storage remains user-facing `Do`;
  - unknown status/source values fail closed and show generic non-counting copy.
- Observability and repair:
  - unsupported mode/source/status should be visible in safe diagnostics/tests and never improve streak/consistency.

## Forward Compatibility Contract

Extensibility surfaces:

- habit modes, habit types, check-in statuses, source kinds, cadence periods, Micro Session link states, Motivation ranges, analytics event names, Help/Guide labels, and future setup-guide templates.

Source of truth:

- typed constants and builders in `lib/habits/shared.ts` for modes/statuses/source kinds;
- server snapshot and route handlers for canonical writes;
- Help/Guide/user-flow map for user-facing contract.

Additive behavior:

- a new source-backed provider should render through the same source-backed tracking contract once mapped;
- new manual habit types should inherit catch-up decisions if they can express done/rest/leave-missed;
- new cadence periods must use the shared cadence window helpers before appearing in catch-up.

Explicit mapping requirements:

- new habit mode;
- new check-in status beyond logged/skipped/unsupported;
- external provider/source-backed completion;
- setup guide recommendation template;
- analytics payload field;
- Help/Guide copy for any new user-visible recovery label.

Unknown or deprecated values:

- do not count toward completion, streak, consistency, or Perfect Day;
- show generic `Unsupported` / `Not counted` copy where visible;
- log/support-diagnose safely without PII.

Test/evidence:

- unknown-value unit tests;
- future source-kind fixture if source-backed UI is generalized;
- route/label/support sweep for changed labels/actions;
- Help/Guide assertion updates for recovery-mode copy.

## Scope

In scope for execution:

- tracking-mode clarity on Habits cards/details:
  - Manual, Quit/slip, Source-backed;
  - action visibility (`Mark done`, `Finish`, `Save`, `Log slip`, `Go to Micro Sessions`) aligned to mode.
- catch-up recovery assistant for missed periods:
  - appears only when active habits have eligible missed days or recovery-worthy stale tracking;
  - shows a summary above the list and per-habit catch-up date controls inside each affected habit card;
  - lets users choose Done where supported, Rest day, Leave missed, exact-date review, or Reset stats from selected date;
  - writes only explicit choices.
- reset-safe motivation recovery:
  - per-habit and selected all-active-habit reset boundaries;
  - clear `Since <date>` / earlier history copy.
- Help/Guide and `docs/user-flow-map.md` updates for tracking modes, catch-up, rest, slips, missed, reset, and source-backed completion.
- analytics events for catch-up/recovery actions with privacy-safe payloads.
- focused tests and screenshot handoff.
- create or update a separate planned child for setup-guide assistant after implementation if owner still wants it.

## Out Of Scope

- scope expansion beyond the approved tracking-mode and catch-up recovery child;
- full setup-guide assistant runtime in this first slice;
- new push/email reminders;
- external Health/Apple/Google integrations;
- hard delete of habits or history;
- data export/CSV/PDF;
- heavy graphs/dashboard/heatmaps;
- commerce, admin editor, public SEO pages, or finance/reporting changes;
- changing Micro Session completion rules beyond clearer source-backed Habit display.

## Setup Guide Follow-Up Contract

After this brief ships or is explicitly split, use planned Child T at `docs/task-briefs/planned/2026-06-15-aw-006-habits-setup-guide-tracking-mode-intent-10-10.md` for `Habits setup guide assistant` unless the owner decides it is no longer needed.

That child should ask:

- What are you trying to do: do more, quit/avoid, or timed practice?
- What counts as success?
- How often should it count?
- Is this part of Perfect Day?
- Should a trusted source complete it automatically?
- What should happen during sickness, travel, or rest?
- What starting plan is realistic for the next 7 days?

Setup guide must output a readable confirmation before saving and must use the tracking-mode contract from this brief.

## Acceptance Criteria

1. Users can tell, without opening docs, whether a habit is manual, quit/slip-based, or source-backed.
2. `Log slip` appears only for quit habits and is explained as an explicit miss, not an auto day-change action.
3. Manual habits do not imply auto increment; they require explicit `Mark done`, `Save`, or `Finish`.
4. Source-backed Micro Session habits do not expose manual `Mark done` and explain the source completion rule.
5. Returning after 2+ eligible missed habit dates shows a summary assistant plus per-habit catch-up panels without hiding daily logging.
6. Catch-up can write explicit per-habit-date done/rest choices, route value/timed/slip corrections through the exact historical day, and leave dates missed without writing rows.
7. Reset stats can restart Motivation from a selected date without deleting check-ins; all-habit reset creates per-habit reset boundaries rather than local-only fake history.
8. Earlier history remains reachable and explainable after reset.
9. Unknown future statuses/source kinds fail closed and do not improve stats.
10. Help/Guide, user-flow map, and tests document the new contract.
11. Screenshot handoff is approved before `npm run verify:pre-pr` because this is visible UI work.
12. All target scorecard categories close at `5/5`; no `target` category may be deferred below `5/5` under this strict 10/10 brief.

## Validation

Planned-brief validation:

- `npm run lint:briefs`

Execution validation when implemented:

- targeted route/label/support sweep for `auto`, `increment`, `Mark done`, `Log slip`, `Rest day`, `Reset stats`, `Source-backed`, `Micro Sessions`, `missed`, and `catch up`;
- `npm run lint:briefs`;
- `npm run typecheck`;
- `./node_modules/.bin/vitest run tests/unit/habit-perfect-day-hub.test.tsx tests/unit/habits-routes.test.ts tests/unit/habits.test.ts tests/unit/habits-server.test.ts tests/unit/analytics-events.test.ts`;
- focused Playwright screenshot harness for `/my-library/habits` mobile/desktop catch-up states when auth/Supabase blocks screenshot-only capture;
- screenshot handoff before broad gates;
- `npm run verify:pre-pr`;
- PR CI required checks;
- `npm run verify:pre-merge` before merge readiness.

## Screenshot Handoff Requirements

Required because this changes visible UI and workflow copy.

Capture `after/reference` artifacts when practical:

- `after-habits-catch-up-mobile.*`: catch-up assistant with daily logging still first-class.
- `after-habits-tracking-mode-desktop.*`: manual/quit/source-backed labels and actions.
- `after-habits-reset-confirm-mobile.*`: reset confirmation and history-preservation clarity.
- `reference-habits-source-backed-mobile.*`: Micro Session source-backed Habit completion reference if changed surface depends on it.

Use `output/habits-tracking-mode-catch-up-YYYY-MM-DD-HHMMSS` and include the required clickable artifact link in handoff.

## Route, Label, And Support-Surface Sweep

Run `docs/runbooks/route-label-support-surface-impact-sweep.md` before the first broad gate.

Surfaces checked / directories-surfaced for this slice:

- `app/`
- `components/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- active/planned/done task briefs where Habits contracts are referenced
- Help/Guide assertions

Identifiers searched:

- `auto increment`
- `auto-complete`
- `Mark done`
- `Mark complete`
- `Log slip`
- `Rest day`
- `Reset habit stats`
- `Reset stats`
- `missed`
- `skipped`
- `source-backed`
- `Micro Sessions`
- `catch up`

## Help/Guide Impact

Required in same implementation PR.

Help/Guide must explain:

- Manual habits require explicit completion.
- Quit habits count clear days until an explicit slip is logged.
- Rest day is intentional and excluded from target/miss scoring.
- Missed days are derived when no completion/rest evidence exists.
- Reset stats restarts Motivation from a date without deleting history.
- Source-backed Micro Session habits complete from Micro Sessions and may be paused/resumed there.
- Catch-up recovery is optional and writes only the user's explicit choices.

## Analytics And Observability

Add or verify safe first-party events for:

- catch-up prompt shown;
- catch-up day reviewed;
- catch-up day left missed;
- catch-up direct day/rest choices saved through server events with `actionSource: "catch_up"`;
- quit slip or value/timed correction reviewed on the exact historical day;
- reset stats started/cancelled through client events and confirmed through server reset events with `actionSource: "catch_up"`;
- tracking-mode write context available through habit mode/source-backed server event payloads.

Payload rules:

- include mode/source/cadence/status/date range counts only;
- do not include free-text habit notes or sensitive habit titles unless existing analytics policy explicitly allows it;
- unknown status/source values must use safe generic keys.

## Risks And Guardrails

- Data corruption risk:
  - no auto writes at midnight;
  - no fake local-only reset history.
- API failure-mode evidence:
  - no unexpected 500 should be introduced for expected invalid/unauthorized habit write paths;
  - check-in and reset-stats route validation must continue returning handled JSON errors for known bad input and auth failures;
  - focused route tests in `tests/unit/habits-routes.test.ts` cover selected-date catch-up writes and reset-stat action source behavior.
- Motivation risk:
  - recovery copy should be calm, not punitive;
  - default action should be review/catch up, not reset.
- Scope risk:
  - setup guide runtime waits for follow-up child;
  - heavy dashboard/heatmap waits for a future history brief.
- Migration risk:
  - avoid schema change if existing tables can express behavior;
  - any migration must be additive and covered by RLS/type tests.

## Checkpoint Log

- `2026-06-14 | planned | created from owner request after fresh Habits audit and external app benchmark synthesis; scope is tracking-mode clarity plus catch-up recovery assistant, with setup guide as a separate child after this slice | next: wait for explicit owner execute/kjor before implementation`
- `2026-06-14 | in-progress | owner said "kjor Habits tracking mode catch-up brief"; moved child to in-progress on branch aw-006-habits-tracking-mode-catch-up and started runtime implementation | next: inspect Habits contracts, implement scoped UI/domain/API/docs/tests, then capture screenshot handoff before verify:pre-pr`
- `2026-06-15 | screenshot-handoff | implemented tracking-mode labels/copy, catch-up assistant, selected-date-preserving catch-up writes, catch-up analytics context, docs/support updates, and focused unit/route coverage. Validation passed: targeted route/label/support sweep over active Habits surfaces and docs, Prettier on changed files, focused Vitest (5 files / 139 tests), npm run typecheck, npm run lint:briefs:all, and git diff --check. Screenshot artifacts captured with a temporary local visual harness at output/habits-tracking-mode-catch-up-2026-06-15-000712; harness route/script removed after capture | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-15 | in-progress | owner screenshot review found the day-first catch-up actions ambiguous and the Quit card copy/action too duplicative. Updated scope to habit-first catch-up panels under each affected habit, card-level `Log slip` for editable Quit dates, no duplicate "days without" copy, and planned Child T for setup-guide mode intent clarity | next: update tests/docs, rerun targeted validation, regenerate screenshot handoff, and stop for visual approval`
- `2026-06-15 | screenshot-approved | regenerated after/reference artifacts at output/habits-tracking-mode-catch-up-2026-06-15-010508 after habit-first catch-up and Quit-card corrections; owner approved the screenshot handoff in chat | next: run npm run verify:pre-pr, commit, push, open/update PR, monitor CI, then run npm run verify:pre-merge`
- `2026-06-15 | pre-pr-pass | npm run verify:pre-pr passed full lane after one controlled rerun. First run failed on a transient /course axe document-title timing issue; the focused reproduction passed and the full rerun passed lint, quality gates, typecheck, 1572 unit tests, build, perf budgets, and Playwright E2E (109 passed / 557 skipped) | next: commit, push, open/update PR, monitor CI, then run npm run verify:pre-merge`
- `2026-06-15 | merged | PR #1128 shipped as squash commit a350a4b6 after required CI checks and npm run verify:pre-merge passed; post-merge preflight requested repo-managed docs-only closeout | next: move this brief to done, add Completion Record, update parent/child references, run closeout gates, and merge closeout if green`

## Completion Record

- `completed`: `2026-06-15`
- `merged_pr`: `#1128`
- `squash_commit`: `a350a4b6`
- `result`: Closed AW-006 Habits Tracking Mode Clarity + Catch-Up Recovery Assistant. Habits now show clear manual, quit/slip, and source-backed tracking semantics; catch-up recovery lives under the affected habit; historical recovery writes only explicit user choices; and reset/catch-up support copy preserves old history instead of faking local-only stats.
- `validation`: Focused Vitest passed for Habit UI/routes/analytics (`5` files / `139` tests); `npm run typecheck`, `npm run lint:briefs:all`, and `git diff --check` passed; screenshot handoff approved at `output/habits-tracking-mode-catch-up-2026-06-15-010508`; `npm run verify:pre-pr` passed full lane for HEAD `7ba188fb`; PR CI run `27515596679` passed; `npm run verify:pre-merge` passed on branch current with `origin/main@84fbac62` before merge.
- `10/10 claim`: yes - all critical target categories closed at `5/5`.

Critical target categories confirmed `5/5`:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Achieved Score | Evidence                                                                                                                            | Gaps / Notes |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | Habit cards separate manual, quit/slip, and source-backed modes; catch-up appears only for relevant gaps.                           | None         |
| UX flow clarity                               | `5/5`          | Owner-approved screenshots show habit-first catch-up, direct Quit `Log slip`, reset confirmation, and source-backed reference.      | None         |
| Visual design quality                         | `5/5`          | Screenshot artifacts at `output/habits-tracking-mode-catch-up-2026-06-15-010508`; no product rendering files changed after capture. | None         |
| Business logic correctness and data integrity | `5/5`          | Route tests cover selected-date catch-up writes and reset action source behavior; no midnight auto-write introduced.                | None         |
| Accessibility (a11y)                          | `5/5`          | `npm run verify:pre-pr` full lane passed Playwright/a11y coverage after targeted transient reproduction passed.                     | None         |
| Performance (CWV + payloads)                  | `5/5`          | Full verify perf budgets passed; no new dependency or heavy dashboard payload was added.                                            | None         |
| Data placement and sync boundaries            | `5/5`          | Server remains canonical for check-ins and reset boundaries; dismissed catch-up entries are local UI state only.                    | None         |
| Caching and invalidation strategy             | `5/5`          | Mutations refresh the selected-date snapshot through existing Habits update flow; tests cover date-preserving writes.               | None         |
| Reliability and failure handling              | `5/5`          | Catch-up dismisses only after successful writes; leave-missed writes nothing; reset confirmation stays explicit.                    | None         |
| Security and authz                            | `5/5`          | Existing protected routes remain owner-scoped and fail closed; changed route tests passed.                                          | None         |
| Privacy and compliance                        | `5/5`          | Analytics payloads use counts/modes/dates and do not add habit notes or free-text content.                                          | None         |
| Content governance                            | `5/5`          | Help/Guide, API contract, user-flow map, and active briefs were updated with the same tracking-mode contract.                       | None         |
| Analytics and KPI observability               | `5/5`          | `lib/analytics/events.ts` and analytics tests cover catch-up prompt/action/reset context without PII.                               | None         |
| Incident response and support operations      | `5/5`          | Support runbook explains catch-up/reset history behavior and how to diagnose mode/source-backed writes.                             | None         |
| i18n operational readiness                    | `5/5`          | Labels/copy are explicit and compact; future mode/source changes require typed mapping or fallback.                                 | None         |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing `HabitPerfectDayHub`, Habits APIs, route contracts, and TypeScript helpers; no dependency added.                    | None         |
| Testing and QA automation                     | `5/5`          | Focused Vitest, typecheck, brief lint, full `verify:pre-pr`, CI, and `verify:pre-merge` passed.                                     | None         |
| Scalability and cost efficiency               | `5/5`          | Recovery derives from loaded bounded habit/check-in state and adds no unbounded queries or chart work.                              | None         |
| DevOps and rollback readiness                 | `5/5`          | No migration or destructive data cleanup required; reverting PR #1128 removes the UI/API additions cleanly.                         | None         |
