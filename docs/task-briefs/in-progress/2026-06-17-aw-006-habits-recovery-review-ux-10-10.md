# Task Brief: AW-006 Habits Recovery Review UX (10/10)

## Metadata

- `id`: `2026-06-17-aw-006-habits-recovery-review-ux-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-17`
- `updated`: `2026-06-17`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_intake`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `parent_child`: Child U
- `execution_mode`: `owner said "kjor Habits Recovery Review UX 10/10"; implement scoped runtime/docs/tests on branch aw-006-habits-recovery-review-ux`
- `strict_10_10_mode`: `yes for UI/UX; no 10/10 claim until owner approves screenshots`

## Brief Audit Record

- `last_audited`: `2026-06-17`
- `base`: clean synced `main@2fe6f621` after PR `#1146`; local `Ja.docx` remains untracked and out of scope.
- `audit_status`: `in-progress`
- `decision`: Implement this bounded Habits recovery UX child now.
- `reason`: Admin note `d286e94e-20c4-4177-a2e1-28b9612907e9` asks for editable missed-day history and sick/rest handling on `/my-library/habits`; Child S made the data safe, but screenshot evidence `output/habits-tracking-mode-catch-up-2026-06-15-010508` shows the mobile catch-up UI is too long and text-heavy for a 10/10 recovery flow.
- `must_refresh_before_execution_if`: Refresh if `/my-library/habits`, `HabitPerfectDayHub`, Habits check-in/reset APIs, Micro Session source-backed habits, Help/Guide, screenshot rules, or scorecard categories change before execution.

## Goal

Make Habits recovery after time away feel calm, fast, and 10/10: one clear review flow, one missed day at a time, no repeated action wall, and no change to the safe data contract.

## Pre-Implementation Owner Explanation

Vi skal rydde opp i Habits-opplevelsen nar brukeren kommer tilbake etter flere dager borte. I stedet for at alle gamle dager apnes som en lang liste, skal brukeren fa en kort oppsummering og en enkel review-flow som tar en dato om gangen.

Hvorfor det betyr noe: dagens data er trygg, men mobil-UX-en blir for tung. Brukeren skal kunne fikse gamle dager uten a bli stresset eller usikker pa om appen skriver feil historikk.

Utenfor scope: ny datamodell, reminders, permanent delete, setup-assistant, endret reset-semantikk, Micro Sessions-regler, og implementering for eier eksplisitt sier kjor.

Fremoverkompatibilitet: nye habit modes, statuser, kilder og cadence-typer skal enten bruke eksisterende typed Habits-kontrakter automatisk, eller kreve eksplisitt mapping med trygg fallback og tester.

## Evidence

- Admin note: `History habits micro sessions` (`d286e94e-20c4-4177-a2e1-28b9612907e9`), context `/my-library/habits`.
- Relevant screenshot artifacts:
  - `output/habits-tracking-mode-catch-up-2026-06-15-010508/after-habits-habit-first-catch-up-mobile.png`
  - `output/habits-tracking-mode-catch-up-2026-06-15-010508/after-habits-reset-confirm-mobile.png`
- Audit finding: reset confirmation is acceptable; the per-day recovery panel is the problem because every missed date renders open with repeated actions.

## Scope

In scope:

- Replace the expanded catch-up action wall with a compact summary plus focused review flow.
- Show one active missed date at a time per habit, with auto-advance after action.
- Keep actions short and clear: `Done`, `Rest day`, `Leave missed`, `Open day`, and `Done today` when Today completion is visible during cleanup.
- Keep `Restart stats` secondary and confirm-gated.
- Reduce copy sharply; explain only what changes history and what does not.
- Update focused Habits tests, Help/Guide/user-flow copy, and screenshot handoff.

Out of scope:

- Schema changes unless current contracts cannot support the UX safely.
- Automatic missed/slip/done writes.
- New reminder/vacation mode.
- Setup guide / Child T.
- Broader Motivation dashboard redesign.

## Product Direction

1. Top recovery summary:
   - headline: `5 missed days`;
   - one sentence max: `No failures were saved automatically. Review what happened or leave days missed.`;
   - primary action: `Clean up missed days`;
   - secondary action: `Restart stats`.
2. Habit card:
   - collapsed by default;
   - show `5 missed days` and next day only;
   - no repeated full action stack on every date.
3. Review state:
   - one day visible;
   - actions: `Done`, `Rest day`, `Leave missed`, `Open day`;
   - after action, move to next date and update progress.
4. Data rules:
   - `Done` and `Rest day` write explicit check-ins for the historical date;
   - `Leave missed` writes nothing;
   - `Restart stats` writes reset boundaries only after confirmation;
   - selected Today snapshot stays selected after catch-up writes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for 10/10: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Accessibility, Reliability and failure handling, Privacy and compliance, Stack-fit and dependency discipline, Testing and QA automation.

| Category                                      | Mapping    | Threshold for this brief                                                                                  | Evidence                                | Expected score |
| --------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------- |
| Product goals and IA                          | target     | Recovery is a focused review flow, not a wall of controls; daily logging remains easy to reach.           | screenshots + component tests           | 5/5            |
| UX flow clarity                               | target     | User can resolve 5 missed days one at a time with no ambiguous auto-write language.                       | component tests + screenshot approval   | 5/5            |
| Visual design quality                         | target     | Mobile and desktop have compact hierarchy, no repeated action wall, no nested-card clutter, no overlap.   | screenshot handoff                      | 5/5            |
| Business logic correctness and data integrity | target     | No new automatic writes; historical writes keep correct `checkInDate` and Today snapshot.                 | route/component tests                   | 5/5            |
| Admin editor ergonomics                       | N/A        | No admin editor changes; Admin note is intake evidence only.                                              | diff review                             | N/A            |
| Accessibility (a11y)                          | target     | Review flow has labeled region/dialog semantics, keyboard-safe actions, status updates, and focus order.  | Testing Library + Playwright spot check | 5/5            |
| Performance (CWV + payloads)                  | supporting | No new dependency or heavy payload; `/my-library/habits` remains within existing My Library expectations. | dependency/build review                 | 5/5            |
| Data placement and sync boundaries            | target     | Server owns check-ins/resets; local state owns only current review step/progress.                         | brief contract + tests                  | 5/5            |
| Caching and invalidation strategy             | target     | Catch-up writes refresh selected-date snapshot and clear only resolved local review items.                | route/component tests                   | 5/5            |
| Reliability and failure handling              | target     | Failed action keeps the date in review, shows retry, and does not advance falsely.                        | negative-path tests                     | 5/5            |
| Security and authz                            | supporting | Existing owner-scoped protected routes remain unchanged; changed tests prove no authz regression.         | route test review                       | 5/5            |
| Privacy and compliance                        | target     | Analytics/support payloads avoid habit notes/free text and use safe mode/date/count fields only.          | analytics payload review                | 5/5            |
| Content governance                            | target     | Help/Guide and user-flow map describe the same recovery contract.                                         | docs diff + support sweep               | 5/5            |
| Admin workflow and editability                | N/A        | No admin workflow changes; Admin notes remain only the source of the finding.                             | explicit scope rationale                | N/A            |
| SEO and crawlability                          | N/A        | Private authenticated Habits surface; no public metadata/sitemap/crawl changes.                           | private-route rationale                 | N/A            |
| AI discoverability                            | N/A        | No public AI-discoverable surface changes.                                                                | explicit scope rationale                | N/A            |
| Analytics and KPI observability               | supporting | Existing catch-up events remain privacy-safe; add only if needed for review-step completion.              | analytics diff review                   | 5/5            |
| Commerce and revenue ops                      | N/A        | No checkout, entitlement, pricing, product, or revenue path.                                              | explicit scope rationale                | N/A            |
| Incident response and support operations      | target     | Support can explain Done/Rest/Leave missed/Restart stats from Help/Guide without private data.            | Help/Guide update                       | 5/5            |
| Finance and reporting operations              | N/A        | Scope does not touch invoices, payouts, refunds, accounting, reports, or finance data.                    | explicit finance scope rationale        | N/A            |
| i18n operational readiness                    | target     | Short labels and compact copy avoid layout-fragile text; future locales require copy mapping.             | copy review + mobile screenshots        | 5/5            |
| Stack-fit and dependency discipline           | target     | Reuse `HabitPerfectDayHub`, Habits view-models, existing APIs, UI tokens, and no new dependency.          | code review + dependency diff           | 5/5            |
| Testing and QA automation                     | target     | Focused unit/component/route coverage plus screenshot handoff; broad gates only after owner approval.     | Vitest + screenshot + verify gates      | 5/5            |
| Scalability and cost efficiency               | supporting | Review flow uses already-loaded bounded catch-up entries; no unbounded queries.                           | code/query review                       | 5/5            |
| DevOps and rollback readiness                 | target     | Revert restores old UI without data cleanup; no destructive migration.                                    | rollback note + verify gates            | 5/5            |

## Stack / Architecture Best-Practice Gate

- Radar: use `docs/runbooks/codex-skill-stack-readiness-radar.md` before execution because this touches UI, recovery behavior, screenshots, Help/Guide, and tests.
- React/Next.js: reuse `HabitPerfectDayHub`; no new route unless unavoidable.
- TypeScript/domain: extend existing catch-up helpers before adding route-local branching.
- Supabase/API: prefer no migration; reuse check-in and reset-stats routes.
- UI: reuse Habits token/action primitives; no nested cards; icon + short label actions.
- Testing: component tests for collapsed summary, one-date review, auto-advance, failure retry, reset confirmation, and selected-date preservation.

Radar result:

| Surface            | Finding                                                                                                                      | Severity | Recommended Type             | Owner Decision Needed | Follow-Up Brief Path |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- | --------------------- | -------------------- |
| Habits recovery UI | Current catch-up action wall is too long on mobile; active slice should reuse `HabitPerfectDayHub` and compress review flow. | high     | bounded implementation child | no; owner said `kjor` | this brief           |
| Help/Guide/support | Recovery labels must match `Done`, `Rest day`, `Leave missed`, and `Restart stats`.                                          | medium   | bounded implementation child | no                    | this brief           |
| Local tooling      | Playwright screenshot handoff is required before PR gates.                                                                   | medium   | safe process/docs update     | no                    | N/A                  |

## Data Placement And Sync Contract

- Server-canonical: `habit_check_ins`, `habit_motivation_resets`, Micro Session source-backed credits.
- Local-only: active missed day, expanded/collapsed UI state, dismissed local review items.
- Sync: successful writes refresh the selected Today snapshot; failed writes keep the same review item.
- Retention/sensitivity: no habit notes or free-text labels in analytics beyond existing safe fields.
- Cache/invalidation: preserve current dynamic/private Habits route and write-through snapshot response.

## Identity And Rename Contract

- Habit IDs remain canonical.
- Habit titles remain display labels only and may be renamed through existing edit.
- Review entries are keyed by `habitId + date`, not title.
- Legacy/unknown statuses fail closed and do not become success states.

## Forward Compatibility Contract

- Future habit modes/statuses/source providers must map to an explicit review action set.
- Unknown modes show `Open day` only and do not expose direct `Done`.
- New recovery actions require Help/Guide copy, analytics review, and tests.
- Future locales need explicit compact-copy mapping before claiming 10/10.

## Help/Guide Impact

Required in the implementation PR:

- Explain `Done`, `Rest day`, `Leave missed`, and `Restart stats`.
- Confirm `Leave missed` writes nothing.
- Confirm reset preserves earlier history.

## Acceptance Criteria

1. Recovery summary is compact and does not render every missed day open by default.
2. A user can review one missed day at a time and auto-advance after action.
3. `Leave missed` writes nothing.
4. `Done`/`Rest day` write the historical date and preserve Today as selected snapshot.
5. Failed writes do not advance the review state.
6. `Restart stats` remains secondary and confirm-gated.
7. Mobile screenshots show no action wall, overlap, or text-heavy clutter.

## Validation

- Focused route/label/support sweep for `Catch up`, `missed`, `Clean up`, `Done today`, `Rest day`, `Leave missed`, `Restart stats`, `Open day`, `/my-library/habits`.
- Focused Vitest for Habits UI/routes.
- Release-gate a11y focus regression check: repeated full-gate flake in shared header drawer restore-focus must be fixed in `Modal` without visual layout changes.
- Screenshot handoff before `npm run verify:pre-pr`.
- After owner screenshot approval: `npm run verify:pre-pr`, PR, CI, then `npm run verify:pre-merge`.

## Route/Label/Support Impact Sweep Evidence

- `identifiers searched`: `Review dates`, `Review date`, `5 days to review`, `missed habit dates`, `catch-up`, `missed`, `Clean up`, `Done today`, `Rest day`, `Leave missed`, `Restart stats`, `Open day`, `/my-library/habits`.
- `directories/surfaces checked`: `components/my-library/habits/`, `tests/unit/habit-perfect-day-hub.test.tsx`, `docs/api-contracts.md`, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, active Child U brief, and parent Habits UX findings brief.
- `fallout handled`: product labels, component tests, API/support docs, user-flow map, and brief acceptance text updated in the same PR scope.
- Intentional leftovers: no route rename, no Help/Guide runtime page change, no API behavior change beyond existing catch-up write contract.

## Screenshot Handoff Requirements

Required because this changes visible UI.

- `after-habits-recovery-summary-mobile.*`
- `after-habits-recovery-cleanup-day-mobile.*`
- `after-habits-recovery-reset-confirm-mobile.*`
- `reference-habits-current-catch-up-mobile.*`

Use `output/habits-recovery-review-ux-YYYY-MM-DD-HHMMSS`.

## Checkpoint Log

- `2026-06-17 | planned | created from owner request after Admin note audit and local screenshot review showed Child S data safety is solid but recovery UI is not 10/10; scope is compact summary plus one-date-at-a-time review UX only | next: wait for explicit owner execute/build/implement/kjor before moving to in-progress`
- `2026-06-17 | in-progress | owner said "kjor Habits Recovery Review UX 10/10"; moved to in-progress on branch aw-006-habits-recovery-review-ux and recorded radar result | next: implement scoped UI/tests/docs, then capture screenshot handoff before pre-PR gates`
- `2026-06-17 | in-progress | implemented compact recovery cleanup labels/layout, targeted unit/type/brief/diff checks passed, owner approved screenshot handoff at output/habits-recovery-review-ux-20260617-020152 | next: run verify:pre-pr, commit, push, open PR, and monitor CI`
- `2026-06-17 | in-progress | pre-PR gate attempt 1 failed on stale generated Next dev types from the temporary screenshot harness after the harness was removed; deleted generated .next/dev cache only | next: rerun verify:pre-pr`
- `2026-06-17 | in-progress | pre-PR gate attempt 2 passed quality gates/typecheck/unit/build/perf budgets but failed one unrelated desktop Chromium global header focus assertion on /en/course; targeted Playwright rerun of core-flow header navigation passed, classifying it as a flake | next: rerun full verify:pre-pr`
- `2026-06-17 | in-progress | perf-budget trend reported 10 consecutive weekly green runs and recommended tightening; decision for this scoped Habits UI PR is hold budget changes and record tighten prompt in PR summary because performance budgets are outside the active recovery UX slice | next: rerun full verify:pre-pr`
- `2026-06-17 | in-progress | repeated full-gate header focus failure traced to shared Modal restore-focus scheduling being canceled when visible became false; patched Modal focus restore, with targeted core-flow header navigation and drawer focus-trap Playwright checks passing | next: rerun full verify:pre-pr`
