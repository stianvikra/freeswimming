# Task Brief: Habits Review Fatigue And Count Prefill (10/10)

## Metadata

- `id`: `2026-06-25-habits-review-fatigue-count-prefill-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-25`
- `updated`: `2026-06-25`
- `parent_backlog`: `AW-006`
- `parent_child`: follow-up to Child W
- `branch`: `aw-006-habits-review-fatigue-count-prefill`
- `execution_mode`: `owner said "ok gjor som anbefalt"; implement scoped runtime/docs/tests end-to-end`

## Brief Audit Record

- `last_audited`: `2026-06-25`
- `base`: clean synced `main@c3f73e6e`
- `audit_status`: `ready`
- `decision`: Execute a narrow Habits follow-up to reduce review fatigue and make count habits faster to save.
- `reason`: Owner observed that the Child W review list can feel like a daily chore when a user did some habits yesterday; owner also requested numeric habit inputs to default to the target value, for example Wall slides `10/day`.
- `must_refresh_before_execution_if`: Refresh if `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, `lib/habits/server.ts`, habit check-in routes, Help/Guide/support docs, scorecard categories, screenshot rules, or verification lanes change before this branch lands.

## Goal

Habits should only show the prominent review prompt for past days with no real habit action, and count habits should open with their target value prefilled so common completions are one tap faster.

## Pre-Implementation Owner Explanation

Vi endrer Habits slik at daglige brukere ikke blir mast paa av review-listen etter en delvis brukt dag. Hvis brukeren gjorde minst en reell habit-handling i gaar, ligger resten bare i historikken. Hvis dagen ikke har noen habit-handling, dukker den fortsatt opp som review til den er sjekket. I tillegg skal tall-habits foresla maalverdien automatisk, for eksempel `10` for Wall slides, slik at brukeren bare justerer ned hvis de gjorde mindre.

Hvorfor det betyr noe: Habits skal hjelpe brukeren videre i dag, ikke skape bokforingsarbeid hver morgen.

Utenfor scope er bred Habits-redesign, timezone/local-midnight-kontrakt, Calendar-redesign, reminder-system, automatisk historikk-endring, export, performance-ratchet og `Ja.docx`.

Fremoverkompatibilitet: nye habit-typer maa enten faa en eksplisitt "teller som handling"-mapping, eller falle trygt tilbake til manuell review. Nye numeric units skal arve count-prefill naar de bruker maalverdi i samme typed contract.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Accessibility (a11y)
- Data placement and sync boundaries
- Reliability and failure handling
- Testing and QA automation
- Stack-fit and dependency discipline

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                           | Evidence                                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Prominent review is reserved for zero-action past habit days; partial-use days stay discoverable in history without becoming a daily queue.                  | component/domain tests + screenshot handoff           | `5/5`                   |
| UX flow clarity                               | `target`     | Review copy and actions make clear that review is for days with no recorded habit action; count habit save starts from the target value.                     | component tests + screenshot handoff                  | `5/5`                   |
| Visual design quality                         | `target`     | Changed Habits states fit mobile and desktop within existing My Library visual language without overlap or new card nesting.                                 | screenshot handoff                                    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | "Real habit action" is deterministic; no check-in/review acknowledgement is created automatically; count-prefill does not save until the user submits.       | unit/component tests + code review                    | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes private user Habits behavior, not admin editing surfaces or publish workflows.                                                      | explicit admin scope rationale                        | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Changed labels/buttons/inputs keep accessible names, keyboard focus, and non-color-only status meaning.                                                      | Testing Library assertions + screenshot/manual review | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for closeout-lint compatibility; same threshold and evidence as canonical `Accessibility (a11y)`.                                                  | Testing Library assertions + screenshot/manual review | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, polling, broad history query, or route payload increase beyond existing Habits client logic.                                 | dependency diff + gate evidence                       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Check-ins and review acknowledgements remain server-canonical; prefill is local transient UI state only.                                                     | data contract + tests                                 | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing Habits write refresh path remains unchanged; the review candidate filter derives from the loaded snapshot.                                          | code review + component tests                         | `5/5`                   |
| Reliability and failure handling              | `target`     | Failed writes do not corrupt history; review prompt degrades to existing snapshot behavior; count-prefill remains editable.                                  | negative/interaction tests                            | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no new protected route or permission model; existing owner-scoped write paths stay unchanged.                                               | no-new-route review + existing route tests            | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new PII, notes, sensitive logs, or analytics payload fields are added.                                                                   | payload/log review                                    | `4/5`                   |
| Content governance                            | `target`     | Help/Guide/support docs describe when review appears and what count prefill means.                                                                           | docs diff + route/label/support sweep                 | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, actions, editability, publishing, or recovery paths change.                                                            | explicit admin workflow scope rationale               | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private/authenticated and this changes no public metadata, sitemap, robots, or canonical URL behavior.                   | private-route SEO rationale                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-readable content, structured data, crawl-safe docs route, or semantic public page changes.                                          | AI-discoverability scope rationale                    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing review/check-in events stay valid; no new event taxonomy is required for this ergonomic change.                                    | analytics no-new-event review                         | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, billing, refund, invoice, payout, or revenue operation behavior changes.                                      | explicit commerce scope rationale                     | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs can explain why partial-use days do not prompt review and why zero-action days still do.                                                        | Help/Guide/runbook update                             | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no finance, reconciliation, payout, invoice, entitlement-reporting, revenue recognition, or accounting data behavior. | explicit finance scope rationale                      | `N/A`                   |
| i18n operational readiness                    | `target`     | New copy is concise, count-based, and not hardcoded to one habit title or unit; future localization can map the same review/action concepts.                 | copy review + tests                                   | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `HabitPerfectDayHub`, `HabitDayItem`, existing check-in/review contracts, and current test stack; add no dependency.                                   | code review + dependency diff                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover zero-action day review, partial-use day suppression, count-prefill for target numeric habits, and submit behavior.                               | Vitest/component tests + release gates                | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new server query or unbounded history scan; filtering stays snapshot-local.                                                              | code review                                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Revert restores prior review-candidate and empty input behavior without data cleanup or migration.                                                           | reversible diff + verify evidence                     | `5/5`                   |

## Stack / Architecture Best-Practice Gate

React/Next.js:

- Reuse `components/my-library/habits/HabitPerfectDayHub.tsx` as the reference surface.
- Keep the existing client component and API boundaries; no new route or server action.
- Preserve existing navigation/query behavior for date selection and review links.

TypeScript/domain:

- Reuse `HabitDayItem`, `HabitCheckInView`, evaluation, and cadence helpers.
- Add a typed helper for "real habit action" instead of scattering checks through JSX.
- Count-prefill must be derived from the habit target contract and remain editable before save.

Supabase/data:

- No migration or generated DB type change.
- Existing owner-scoped check-in and review acknowledgement routes remain the only write paths.

UI system:

- Reuse existing Habits controls, labels, chips, and card tokens.
- Screenshot handoff is required before `verify:pre-pr`.

Testing:

- Component/domain tests for review-candidate behavior and count-prefill.
- Existing route tests remain unchanged unless a write-path issue is found.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, repo lint/verify scripts, installed `playwright` skill for screenshot handoff.
- Evaluate later: no new Codex skill/plugin is needed.
- Install/config changes: none.

Systemic findings:

| Surface                    | Finding                                                                                          | Severity | Recommended Type                 | Owner Decision Needed | Follow-Up Brief Path |
| -------------------------- | ------------------------------------------------------------------------------------------------ | -------- | -------------------------------- | --------------------- | -------------------- |
| Habits review fatigue      | Child W's review rule can over-prompt partial-use days and make daily users feel punished.       | `high`   | `bounded implementation child`   | `no`                  | this brief           |
| Numeric habit friction     | Count habits with known target values require avoidable typing for the common "met target" case. | `medium` | `bounded implementation child`   | `no`                  | this brief           |
| Timezone/local date policy | UTC/local-midnight ambiguity can still affect edge cases, but is larger than this slice.         | `medium` | `deferred architecture decision` | `yes before Child X`  | `TBD Child X`        |

Return path:

- Parent: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- Last merged workstream: PR `#1235` and closeout PR `#1236`, main at `c3f73e6e`.
- Current child: this in-progress branch.
- Next planning step after this child: revisit timezone/local-midnight only if owner prioritizes Child X.

## Domain Granularity Gate

- User's mental objects:
  - a habit day that may need review;
  - a habit check-in/action;
  - a numeric habit entry field.
- Canonical objects:
  - `habit_definitions.id`;
  - `habit_check_ins` rows;
  - `habit_absence_review_acknowledgements` rows.
- Child object levels:
  - habit definition: `view`; edit is out of scope;
  - check-in: `view`, `create/update` through existing controls only;
  - review acknowledgement: `create/update` only when the user explicitly checks/closes review;
  - numeric draft value: local `edit` before submit, not persisted until save.
- Mature reference surface:
  - `HabitPerfectDayHub`;
  - `lib/habits/shared.ts` view-model contracts;
  - existing Habits component tests.
- Granularity decision:
  - this slice filters which days become prominent review candidates and changes the default local input value; it does not hide child habit rows on historical dates.

## Data Placement And Sync Contract

Server-canonical:

- habit definitions;
- habit check-ins;
- review acknowledgements.

Local/transient:

- numeric input prefill before submit;
- current UI pending/error state.

Sync policy:

- no automatic check-in or review acknowledgement is written by the new filter;
- existing save/review writes remain user-triggered and refresh via existing snapshot flow.

Retention and sensitivity:

- no new stored fields, notes, secrets, or sensitive payloads.

Cache/invalidation:

- unchanged; the review filter derives from the loaded snapshot, and existing writes refresh Habits state.

## Identity And Rename Contract

No new persisted entities, routes, slugs, or operator-visible identifiers are introduced. Existing habit IDs remain the stable canonical identifiers; habit titles such as `Wall slides` remain editable display labels and are not used for logic.

## Forward Compatibility Contract

- Extensibility surfaces:
  - habit modes, habit types, numeric units, cadence periods, check-in source kinds, review statuses.
- Source of truth:
  - typed `HabitDayItem`, `HabitCheckInView`, and habit target fields.
- Additive behavior:
  - new numeric/count-like habits that expose `targetValueNumeric` through the existing contract can reuse count-prefill without title-specific code.
- Explicit mapping requirements:
  - new habit modes/source kinds must define whether they count as a real user habit action before they can suppress review.
- Unknown or deprecated values:
  - unsupported check-in source/mode values must not silently suppress review unless mapped; users can still manually review.
- Test/evidence:
  - tests for partial-use suppression, zero-action review, and target-value prefill.

## Scope

- Change Habits review candidate logic from "past unsatisfied due habits" to "past days with due unresolved habits and no real habit action".
- Treat real habit action as a saved check-in/action signal, not merely opening the Habits page.
- Prefill numeric/count entry fields with the habit target value when starting from an empty draft.
- Update relevant Help/Guide/support docs and tests.

## Out Of Scope

- Broad Habits redesign.
- Timezone/local-midnight contract.
- Calendar redesign or Calendar data model changes.
- Automatic check-in creation, automatic review acknowledgement, or history mutation.
- New reminders, exports, dependencies, migrations, analytics taxonomy, commerce, auth model, performance-ratchet, or `Ja.docx`.

## Acceptance Criteria

1. A past day with no habit check-ins/actions and unresolved due habits still appears in review until checked.
2. A past day with at least one real habit action does not appear in the prominent review list just because other habits remain unresolved.
3. Opening Habits without saving anything does not count as a real habit action.
4. Count/numeric habit entry starts with the target value when the field is otherwise empty, and the user can reduce it before saving.
5. No new persisted data is written until the user submits an existing save/review action.
6. Help/Guide/support docs match the shipped behavior.
7. Targeted tests and screenshot handoff pass before release gates.

## Validation

- `npm run lint:briefs`
- targeted Vitest for Habits component/shared tests
- `npm run typecheck`
- screenshot handoff before `npm run verify:pre-pr`
- after owner screenshot approval: `npm run verify:pre-pr`, PR, CI, `npm run verify:pre-merge`

## Manual QA Environments

- Local screenshot handoff against `http://127.0.0.1:3000` using the repo local visual/default path.
- Comparison type: `after/reference` if using fixture/harness states; `before/after` if a stable before-state capture is practical.
- Required representative screenshots:
  - Habits today with no over-prominent review after partial-use prior day;
  - Today zero-action review state with full-width `Start review` / `Dismiss`;
  - historical `Viewing · <date>` sticky/floating chip scrolled state with calmer colors, right alignment, no icon, and selected-day count copy;
  - count habit input prefilled with target value.
- Captured evidence:
  - `output/habits-review-fatigue-2026-06-25-095021/after-habits-partial-use-no-prominent-review-mobile.png`
  - `output/habits-review-fatigue-2026-06-25-095021/after-habits-zero-action-review-actions-mobile.png`
  - `output/habits-review-fatigue-2026-06-25-095021/after-habits-viewing-chip-sticky-scrolled-mobile.png`
  - `output/habits-review-fatigue-2026-06-25-095021/after-habits-count-prefill-desktop.png`
- Harness note: screenshots used a temporary local visual harness rendering the real `HabitPerfectDayHub` with deterministic fixture snapshots; the temporary route and capture script were removed before validation.

## Constraints

- Keep the patch narrow.
- Do not touch `Ja.docx`.
- Do not add dependencies.
- Do not change protected route authz or Supabase schema.
- Do not silently skip tests.

## Help/Guide And Operator Training Contract

Required because this changes user workflow expectations. Update the relevant Habits/Calendar support surface so it explains:

- review appears for past days with no recorded habit action;
- partial-use days stay in history without becoming a daily queue;
- target-value prefill is a suggestion and is saved only after user submit.

## Route, Label, And Support-Surface Sweep

- Identifiers searched:
  - `/my-library/habits`
  - `Review days`
  - `Start review`
  - `Dismiss`
  - `Done with this day`
  - `Close review`
  - `no recorded habit action`
  - `target value`
  - `Open count`
  - `Wall Slides`
  - `absence review`
  - `habit_absence_review`
  - `catch_up`
  - `Viewing`
  - stale copy `Nothing was marked failed automatically`
- Directories/surfaces checked:
  - `app/`
  - `components/`
  - `lib/`
  - `tests/`
  - `docs/api-contracts.md`
  - `docs/user-flow-map.md`
  - `docs/runbooks/auth-account-support.md`
  - active/planned/done task briefs
- Fallout handled:
  - changed product copy from automatic-failure wording to zero-action review wording;
  - changed mobile Today/Viewing context chip from sticky saturated date strip to a right-aligned sticky/floating low-emphasis status-and-jump control with matching `Label · date` copy, no icon, and no global fixed overlay;
  - added full-width Today-card `Start review` and `Dismiss` actions where `Dismiss` only acknowledges review dates;
  - updated Habits component tests for partial-use day suppression and target-value prefill;
  - updated API/support/user-flow docs to say review does not write habit history and count prefill is not persisted until `Save`;
  - left historical done-brief references unchanged as archived evidence.
- Intentional leftovers:
  - `habit_catch_up_*` analytics names remain because existing event names are still part of the historical analytics contract; this slice does not rename analytics taxonomy.

## Security, Privacy, And Compliance

- No new protected route, auth boundary, secret handling, or PII payload.
- Existing write paths remain authenticated and owner-scoped.
- Do not log habit notes or sensitive free text.

## Observability And KPI Contract

- No new analytics event is required.
- Existing check-in and review events continue to describe explicit user actions.

## Session Continuity And Recovery

- Canonical source of truth: this branch plus this brief.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Git Rhythm Defaults

- Commit and push after scoped implementation and validation.
- Open/update PR after screenshot approval and `npm run verify:pre-pr`.
- No merge without explicit owner approval.

## Automation Mode

Automation-first, except screenshot approval stop. Assistant owns implementation, targeted tests, screenshot artifact creation, PR prep, and gates when allowed by sandbox/credentials. Pause only for sandbox approval, screenshot review, missing credentials, or a real product decision.

## 10/10 Quality Bar

- The review prompt must feel like a recovery aid for missed days, not a daily punishment.
- Numeric prefill must be editable and must not persist until save.
- UI must stay mobile-readable and accessible.
- Business logic must be deterministic and covered by tests.
- The implementation must be reversible without data cleanup.

## Checkpoint Log

- `2026-06-25 | in-progress` - created branch and active brief from clean `main@c3f73e6e`; next: implement review candidate and count-prefill logic, then run targeted tests and screenshot handoff.
- `2026-06-25 | implemented-first-pass` - changed Habits review candidates to exclude partial-use days with recorded check-ins, prefills count inputs from target value without auto-saving, updated component tests plus API/user-flow/support docs, and passed targeted `npm exec vitest run tests/unit/habit-perfect-day-hub.test.tsx`, `npm run typecheck`, and `git diff --check`; `npm run lint:quality-gates` is expected to remain blocked until screenshot artifacts are captured and approved | next: run remaining focused lint, capture screenshot handoff, then stop for owner visual approval before `npm run verify:pre-pr`.
- `2026-06-25 | screenshot-handoff-ready` - captured after/reference screenshots in `output/habits-review-fatigue-2026-06-25-080157` for partial-use suppression, zero-action review, and count target prefill; temporary harness was removed and capture-only analytics was stubbed on the final run | next: run quality-gate confirmation, then hand off screenshots for owner approval before `npm run verify:pre-pr`.
- `2026-06-25 | screenshot-corrections` - owner rejected the first visual pass because the Today pill felt stuck in its own blue container and asked to check History plus add full-width `Start review` / `Dismiss` actions; updated mobile date chip styling and Today review actions with tests/docs | next: run targeted validation and regenerate screenshot handoff before `npm run verify:pre-pr`.
- `2026-06-25 | screenshot-handoff-refreshed` - fixed historical count copy from `Today` to `This day`, passed targeted Habits tests/typecheck, regenerated after/reference artifacts in `output/habits-review-fatigue-2026-06-25-082321`, and removed the temporary screenshot harness | next: owner screenshot approval before `npm run verify:pre-pr`.
- `2026-06-25 | viewing-chip-finalized` - renamed the mobile historical chip and Weekly Overview historical badge to `Viewing`, removed the date-chip icon, right-aligned the mobile date chip, regenerated final after/reference artifacts in `output/habits-review-fatigue-2026-06-25-090741`, and removed the temporary screenshot harness | next: owner screenshot approval before `npm run verify:pre-pr`.
- `2026-06-25 | sticky-floating-chip-finalized` - changed the mobile date chip to a compact sticky/floating control with zero layout height, kept it inside the Habits surface rather than global fixed overlay, captured scrolled sticky evidence in `output/habits-review-fatigue-2026-06-25-095021`, and removed the temporary screenshot harness | next: owner screenshot approval before `npm run verify:pre-pr`.
- `2026-06-25 | screenshot-approved-and-pre-pr-green` - owner approved the final screenshot handoff and approved merge on good tests; `npm run verify:pre-pr` passed the full lane (`lint`, `typecheck`, unit, build, perf budgets, and Playwright with 111 passed / 567 skipped locally). Perf budgets reported `tighten` after 11 consecutive weekly green runs with 15.4% margin; decision for this Habits PR is to defer actual budget tightening to the planned performance-ratchet maintenance slice so this runtime/UI change stays scoped | next: commit, push, open PR, monitor CI, then run `npm run verify:pre-merge`.

## Completion Record

- `completed`: `2026-06-25`
- `merged_pr`: `#1237`
- `squash_commit`: `e469a4b5`
- `result`: Habits now treats review as a recovery aid for zero-action missed days instead of a daily bookkeeping queue for partial-use days, while count habits prefill the target value as an editable local suggestion before `Save`.
- `validation`: targeted Habits Vitest, `npm run typecheck`, `npm run lint`, `npm run lint:briefs:all`, `git diff --check`, owner-approved screenshot handoff, `npm run verify:pre-pr`, CI for PR `#1237`, and `npm run verify:pre-merge`.
- `screenshot_artifacts`: `output/habits-review-fatigue-2026-06-25-095021`
- `perf_budget_decision`: `npm run verify:pre-pr` and `npm run verify:pre-merge` both reported `tighten` after 11 consecutive weekly green runs with 15.4% margin; actual budget tightening is deferred to the planned performance-ratchet maintenance slice to keep this Habits PR scoped.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                         | Gaps / Notes                                  |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Product goals and IA                          | `5/5`          | Partial-use days with recorded actions are suppressed from prominent review; zero-action missed days still show. | None.                                         |
| UX flow clarity                               | `5/5`          | Review copy, full-width `Start review` / `Dismiss`, and editable count target prefill shipped with screenshots.  | None.                                         |
| Visual design quality                         | `5/5`          | Owner-approved final mobile/desktop artifacts at `output/habits-review-fatigue-2026-06-25-095021`.               | No rendering files changed after screenshot.  |
| Business logic correctness and data integrity | `5/5`          | Unit/component tests cover zero-action review, partial-use suppression, editable prefill, and no auto-save.      | None.                                         |
| Accessibility (a11y)                          | `5/5`          | Existing accessible labels/buttons preserved; Testing Library assertions and full gates passed.                  | None.                                         |
| Accessibility                                 | `5/5`          | Same evidence as `Accessibility (a11y)` for closeout-lint alias compatibility.                                   | None.                                         |
| Data placement and sync boundaries            | `5/5`          | Check-ins/review acknowledgements remain server-canonical; prefill stays local transient state.                  | None.                                         |
| Caching and invalidation strategy             | `5/5`          | Existing Habits refresh path unchanged; review filtering derives from loaded snapshot.                           | None.                                         |
| Reliability and failure handling              | `5/5`          | Failed writes keep existing error behavior; no new persisted data or migration.                                  | None.                                         |
| Content governance                            | `5/5`          | API/user-flow/support docs and parent intake were updated for review and count-prefill semantics.                | None.                                         |
| Incident response and support operations      | `5/5`          | Support runbook explains partial-use days, zero-action review, and unsaved count-prefill behavior.               | None.                                         |
| i18n operational readiness                    | `5/5`          | New copy is concise and not title/unit-specific; `Today` / `Viewing` use shared date format.                     | None.                                         |
| Stack-fit and dependency discipline           | `5/5`          | Reused `HabitPerfectDayHub` and existing Habits contracts; no dependency or schema changes.                      | None.                                         |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, full local gates, CI, and `verify:pre-merge` passed.                                            | Local dev-auth-dependent E2E remains skipped. |
| DevOps and rollback readiness                 | `5/5`          | Single reversible runtime/docs/test commit; revert restores old review-candidate and empty-input behavior.       | None.                                         |
