# Task Brief: AW-006 Habits Setup Guide Tracking-Mode Intent (10/10)

## Metadata

- `id`: `2026-06-15-aw-006-habits-setup-guide-tracking-mode-intent-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-15`
- `updated`: `2026-06-15`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_intake`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `parent_child`: Child S, `docs/task-briefs/in-progress/2026-06-14-aw-006-habits-tracking-mode-catch-up-recovery-assistant-10-10.md`
- `execution_mode`: `planned follow-up; do not implement until owner explicitly says to execute Child T`
- `strict_10_10_mode`: `yes; all target categories must close at 5/5`

## Brief Audit Record

- `last_audited`: `2026-06-15`
- `base`: `main@84fbac62` plus active Child S branch context
- `audit_status`: `ready`
- `decision`: Keep this as the planned follow-up that turns tracking-mode clarity into guided habit setup.
- `reason`: Child S clarifies runtime tracking and catch-up recovery, but setup still lets users choose modes directly. The owner specifically wants the guide to make Quit/slip-only versus Manual daily explicit rather than exposing a vague auto on/off choice.
- `must_refresh_before_execution_if`: Refresh if Child S ships with different labels/actions, Habits create/edit fields change, Micro Session source-backed linking changes, setup guide scope moves into another child, platform scorecard categories change, or Help/Guide requirements change.

## Goal

Build a Habits setup guide that asks intent first and recommends the correct tracking model, especially distinguishing `Quit` slip-only habits from `Manual` daily completion habits.

## Pre-Implementation Owner Explanation

Vi skal lage en veiviser som hjelper brukeren aa velge riktig habit-type for det de faktisk mener. Hvis brukeren vil slutte med noe, skal veiviseren forklare at `Quit` teller klare dager og at brukeren bare logger slip. Hvis brukeren vil krysse av hver bra dag, skal veiviseren anbefale `Manual`.

Hvorfor det betyr noe: feil valg ved oppsett gjoer senere stats, catch-up og motivasjon vanskelig aa stole paa.

Utenfor scope for denne briefen er nye paaminnelser, eksterne Health-integrasjoner, eksport, tunge dashboards, og endringer i den server-kanoniske historikken utover vanlige habit create/edit-writes.

Fremoverkompatibilitet: nye habit modes, kilder og success-regler skal enten komme fra typed mode/source contracts automatisk, eller kreve en eksplisitt guide-template mapping med fallback og tester.

## Product Decisions

1. Do not expose `auto increment on/off` as the primary mental model.
2. Guide by intent:
   - `I want to do something`: recommend `Manual` or `Manual timed`.
   - `I want to quit or avoid something`: recommend `Quit` with slip-only logging.
   - `This is completed from another Freeswimming flow`: recommend `Source-backed` when a trusted source exists.
3. Make the fork explicit:
   - `Quit`: no daily `Mark done`; clear days are derived until the user logs `Slip`.
   - `Manual daily`: user uses `Mark done`, `Save`, or `Finish` when the habit was completed.
4. The guide must show a readable confirmation before saving: mode, target/success rule, cadence, Perfect Day membership, source/backing rule, rest/travel policy, and what happens during catch-up.
5. Existing direct Add/Edit fields may remain available, but guided setup should be the recommended path for new users and confused mode changes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode: all `target` rows must close at `5/5`. Critical target categories: Product goals and IA, UX flow clarity, Business logic correctness and data integrity, Data placement and sync boundaries, Reliability and failure handling, Security and authz, Privacy and compliance, Analytics and KPI observability, Incident response and support operations, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping    | Threshold for this brief                                                                                                                                       | Evidence                                               | Expected score |
| --------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------- |
| Product goals and IA                          | target     | Setup guide starts from user intent and lands in the correct Habits create/edit path without hiding daily logging.                                             | component tests, screenshot handoff, user-flow map     | 5/5            |
| UX flow clarity                               | target     | User can distinguish Quit slip-only, Manual daily, Manual timed, and Source-backed before saving.                                                              | component tests, screenshot handoff                    | 5/5            |
| Visual design quality                         | target     | Guide uses existing Habits tokens/actions, compact steps, and no mobile overlap.                                                                               | screenshot handoff mobile/desktop                      | 5/5            |
| Business logic correctness and data integrity | target     | Guide writes the same validated habit definition fields as Add/Edit and never invents check-ins, slips, or source-backed credits.                              | route/component tests, domain invariant review         | 5/5            |
| Admin editor ergonomics                       | N/A        | No admin editor surface is changed; this is private user setup only.                                                                                           | diff review confirms no admin editor changes           | N/A            |
| Accessibility (a11y)                          | target     | Wizard steps use semantic fieldsets, labels, keyboard-safe controls, visible focus, and status feedback.                                                       | Testing Library assertions, Playwright/a11y spot check | 5/5            |
| Performance (CWV + payloads)                  | supporting | No new heavy dependency or route-level payload spike; guide reuses local UI/state and existing create/edit routes.                                             | dependency diff, build/verify gate                     | 5/5            |
| Data placement and sync boundaries            | target     | Draft choices are local-only until save; habit definitions remain server-canonical; source-backed options require a trusted server-backed link.                | brief contract, create/edit tests                      | 5/5            |
| Caching and invalidation strategy             | supporting | Successful save refreshes the selected Habits snapshot through existing route behavior.                                                                        | component/route tests                                  | 5/5            |
| Reliability and failure handling              | target     | Failed save keeps draft choices, shows retryable error, and does not create partial hidden history.                                                            | negative-path tests                                    | 5/5            |
| Security and authz                            | target     | Protected habit create/edit routes stay owner-scoped, fail closed, and validate mode/type/cadence input.                                                       | route negative-path tests                              | 5/5            |
| Privacy and compliance                        | target     | Analytics and support diagnostics do not include habit notes or unnecessary free-text personal content.                                                        | analytics payload review/tests                         | 5/5            |
| Content governance                            | target     | Help/Guide, user-flow map, and setup copy describe the same tracking-mode contract.                                                                            | docs diff, route/label/support sweep                   | 5/5            |
| Admin workflow and editability                | N/A        | No admin CRUD/workflow is changed; owner/user setup is the only workflow.                                                                                      | explicit scope rationale                               | N/A            |
| SEO and crawlability                          | N/A        | Habits setup is private/authenticated and does not change public metadata or sitemap behavior.                                                                 | diff review confirms no public route SEO changes       | N/A            |
| AI discoverability                            | N/A        | No public AI-discoverable page or structured data surface is changed.                                                                                          | explicit scope rationale                               | N/A            |
| Analytics and KPI observability               | target     | Events distinguish guide opened, intent selected, recommendation accepted/changed, save attempted, save failed, and save succeeded without PII.                | analytics event tests/review                           | 5/5            |
| Commerce and revenue ops                      | N/A        | No pricing, entitlement, checkout, refund, payout, or revenue path is changed.                                                                                 | explicit scope rationale                               | N/A            |
| Incident response and support operations      | target     | Support can explain why a user was guided to Quit versus Manual and diagnose mode mistakes without inspecting sensitive labels.                                | support runbook update                                 | 5/5            |
| Finance and reporting operations              | N/A        | Scope does not touch payments, invoices, payouts, refunds, or finance reports; habit setup is not finance-relevant.                                            | explicit scope rationale                               | N/A            |
| i18n operational readiness                    | target     | Step labels and summaries avoid layout-fragile copy, and future locales can map guide templates explicitly.                                                    | mobile screenshot review, copy inventory               | 5/5            |
| Stack-fit and dependency discipline           | target     | Reuse `HabitPerfectDayHub`, existing Habits draft/create/edit contracts, TypeScript helpers, and UI primitives; no new dependency unless explicitly justified. | code review, dependency diff, typecheck                | 5/5            |
| Testing and QA automation                     | target     | Unit/component/route coverage proves intent branching, recommendation overrides, save payloads, negative paths, and docs lint.                                 | Vitest, verify gates, screenshot handoff               | 5/5            |
| Scalability and cost efficiency               | supporting | Wizard derives options from bounded local constants/current snapshot and does not add unbounded reads.                                                         | code review                                            | 5/5            |
| DevOps and rollback readiness                 | target     | Feature can be reverted without data cleanup; no destructive migration; docs and screenshot evidence identify changed setup path.                              | rollback notes, verify gates                           | 5/5            |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `HabitPerfectDayHub` as the mature reference surface;
  - keep wizard state client-side until the existing create/edit API call;
  - do not create a parallel habit creation route unless a typed server action is required.
- TypeScript/domain:
  - derive guide recommendations from `HabitMode`, `HabitType`, cadence helpers, and source-backed metadata;
  - unknown mode/source values fail closed with review-required copy.
- Supabase/data:
  - prefer no schema change; use existing `habit_definitions` and existing source-backed link contracts;
  - if a schema change becomes necessary, it must be additive, RLS-reviewed, and covered by route tests.
- UI:
  - reuse current Habits card/action primitives;
  - use fieldsets/segmented choices for intent, mode, target, cadence, Perfect Day, and rest/travel policy;
  - screenshot handoff is `after/reference` against the existing Add habit surface.
- Testing:
  - component tests for the guide steps and payloads;
  - route negative-path tests if validation changes;
  - screenshot handoff before broad gates.

## Data Placement And Sync Contract

Server-canonical data:

- saved habit definitions;
- source-backed links;
- check-ins and reset boundaries, only when existing routes explicitly write them.

Local-only data:

- wizard draft choices;
- step progress;
- temporary recommendation state;
- dismissed helper copy, if added.

Sync policy:

- no server write until the final confirmation/save;
- failed saves keep the local draft and show retryable feedback;
- successful saves refresh the selected Habits snapshot through the existing write path.

Retention and sensitivity:

- do not persist sensitive free-text notes in analytics;
- do not create automatic check-ins, slips, or reset rows from guide navigation.

Cache/invalidation:

- same as existing Habits create/edit: write-through route response provides the refreshed snapshot.

## Identity And Rename Contract

- Canonical stable ID:
  - new habits receive `habit_definitions.id`; edited habits keep the same ID.
- Human-readable identifiers:
  - `title` remains editable display copy and must not become a stable key.
- Mutability:
  - mode/cadence edits are allowed only through the validated edit contract.
- Rename vs repurpose:
  - guide must warn or route users toward a new habit if they materially repurpose a habit, for example changing `Quit sugar` into `Read pages`.
- Compatibility:
  - legacy storage value `build` remains user-facing `Do` / `Manual`.
- Observability and repair:
  - unsupported saved values fail closed and show review-required copy rather than silently recommending a mode.

## Forward Compatibility Contract

Extensibility surfaces:

- habit modes, habit types, source-backed providers, cadence periods, Perfect Day membership, rest/travel policies, guide recommendation templates, analytics event names, and Help/Guide labels.

Source of truth:

- typed Habits contracts in `lib/habits/shared.ts`;
- existing Habits create/edit payload contract;
- Help/Guide and user-flow map for user-facing semantics.

Additive behavior:

- a new manual habit type should appear only if the guide can explain its success rule;
- a new source-backed provider should appear only when it has a trusted completion source and mapped guide copy;
- new cadence periods must use shared cadence helpers.

Explicit mapping requirements:

- new habit mode;
- new source-backed provider;
- new completion status;
- new guide recommendation template;
- new analytics payload field.

Unknown or deprecated values:

- do not recommend automatically;
- show a safe "review setup" fallback;
- do not count, complete, or log history from unknown values.

Test/evidence:

- future-value fixture or unknown-value negative path;
- route/label/support sweep;
- Help/Guide assertion update when copy changes.

## Scope

In scope:

- guided add-habit flow or guided panel inside existing Add habit;
- mode recommendation copy for Manual, Manual timed, Quit, and Source-backed;
- explicit fork between `Quit` slip-only and `Manual` daily completion;
- confirmation summary before save;
- analytics for guide steps and save outcomes;
- Help/Guide, support runbook, user-flow map, and tests.

## Out Of Scope

- implementing this guide inside Child S;
- push/email reminders;
- Apple Health/Google Fit/native integrations;
- habit history delete/export;
- heavy dashboard or coaching journey;
- commerce, admin editor, public SEO pages, or finance/reporting changes;
- changing Micro Session completion rules.

## Acceptance Criteria

1. User can start from intent and reach a recommended setup without understanding internal mode names.
2. Quit setup clearly says clear days are counted until an explicit slip is logged and does not show daily `Mark done`.
3. Manual setup clearly says the user must explicitly complete the habit with `Mark done`, `Save`, or `Finish`.
4. Source-backed setup is shown only for trusted linked sources and explains where completion happens.
5. Confirmation summary shows mode, success rule, cadence, Perfect Day membership, and catch-up behavior before saving.
6. Save payloads match existing create/edit contracts and include no hidden check-in/slip/reset writes.
7. Failed save is retryable and keeps the draft.
8. Help/Guide and support docs describe the same setup contract.
9. Screenshot handoff is approved before `npm run verify:pre-pr`.
10. All target scorecard categories close at `5/5`.

## Validation

- route/label/support sweep for `auto increment`, `auto-complete`, `Quit`, `Manual`, `Mark done`, `Log slip`, `Source-backed`, `Perfect Day`, `Rest day`, and `catch up`;
- `npm run lint:briefs`;
- `npm run typecheck`;
- focused Vitest for Habits guide component and route payloads;
- screenshot handoff mobile/desktop before broad gates;
- `npm run verify:pre-pr`;
- PR CI required checks;
- `npm run verify:pre-merge` before merge readiness.

## Screenshot Handoff Requirements

Required because this changes visible setup UI.

Capture `after/reference` artifacts:

- `after-habits-setup-guide-intent-mobile.*`
- `after-habits-setup-guide-quit-confirm-mobile.*`
- `after-habits-setup-guide-manual-confirm-desktop.*`
- `reference-habits-add-habit-desktop.*`

Use `output/habits-setup-guide-tracking-mode-intent-YYYY-MM-DD-HHMMSS`.

## Help/Guide Impact

Required in the same implementation PR:

- Quit means slip-only logging, no daily mark done.
- Manual means explicit completion.
- Manual timed means timer/manual time must be saved.
- Source-backed means trusted source completion.
- Rest/travel policy is a setup choice that affects future catch-up interpretation.

## Checkpoint Log

- `2026-06-15 | planned | created from Child S screenshot review after owner clarified that setup must make Quit/slip-only vs Manual daily explicit and avoid auto on/off ambiguity | next: execute only after owner explicitly selects Child T`
