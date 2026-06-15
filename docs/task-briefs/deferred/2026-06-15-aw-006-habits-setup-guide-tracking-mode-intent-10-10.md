# Task Brief: AW-006 Habits Setup Guide Tracking-Mode Intent (10/10)

## Metadata

- `id`: `2026-06-15-aw-006-habits-setup-guide-tracking-mode-intent-10-10`
- `status`: `deferred`
- `owner`: `stianvikra`
- `created`: `2026-06-15`
- `updated`: `2026-06-15`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_intake`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `parent_child`: Child S, `docs/task-briefs/done/2026-06-14-aw-006-habits-tracking-mode-catch-up-recovery-assistant-10-10.md`
- `execution_mode`: `deferred; do not execute until owner rewrites/approves the product plan`
- `strict_10_10_mode`: `yes for any future execution; no 10/10 claim from the rejected attempts`

## Brief Audit Record

- `last_audited`: `2026-06-15`
- `base`: `main@63aa2ba7` after Child S closeout PR #1129
- `audit_status`: `deferred by owner after rejected implementation attempts`
- `decision`: Defer Child T. Keep this file as research and product-planning context only.
- `reason`: Child S shipped runtime tracking and catch-up recovery, but the attempted Child T assistant did not meet the owner's product bar. The owner wants to plan the assistant personally and reconsider it later. Runtime, test, analytics, and support-surface implementation changes from this attempt were removed.
- `must_refresh_before_execution_if`: Refresh if Child S ships with different labels/actions, Habits create/edit fields change, Micro Session source-backed linking changes, setup guide scope moves into another child, platform scorecard categories change, or Help/Guide requirements change.

## Deferred Owner Decision

- No implementation from this brief should proceed without a new owner-approved product plan.
- The rejected screenshots and implementation attempts are not release evidence.
- Future work should start from the owner's intended assistant flow, not from the abandoned branch implementation.

## Future Goal

Build a goal-based Habits creation assistant that turns the user's desired outcome into a concrete habit recipe: what they want to change, how Freeswimming will count success, what they will do day to day, and what happens on missed/rest/travel days.

## Pre-Implementation Owner Explanation

Vi skal lage en habit-assistant som starter med brukerens maal, ikke med interne valg. Den skal spoerre hva brukeren vil oppnaa, tolke om det handler om aa bygge noe, slutte med noe, gjoere noe over tid, eller koble til en annen Freeswimming-flyt, og deretter foreslaa en konkret habit-oppskrift.

Hvorfor det betyr noe: hvis brukeren lager feil habit, blir senere stats, catch-up og motivasjon vanskelig aa stole paa. En god assistant skal gjoere riktig valg lett, og forklare konsekvensene med menneskesprak.

Utenfor scope for denne briefen er nye paaminnelser, eksterne Health-integrasjoner, eksport, tunge dashboards, og endringer i den server-kanoniske historikken utover vanlige habit create/edit-writes.

Fremoverkompatibilitet: nye habit modes, kilder og success-regler skal enten komme fra typed mode/source contracts automatisk, eller kreve en eksplisitt guide-template mapping med fallback og tester.

## Product Decisions

0. Child T is deferred. These decisions are planning inputs, not current implementation approval.
1. The first Child T screenshot is rejected and must not proceed to PR.
2. Do not expose `auto increment on/off` or raw tracking-mode choice as the assistant's primary mental model.
3. Guide by desired outcome:
   - `Stop something`: propose `Quit` with clear-day counting and explicit `Log slip` only when it happened.
   - `Do an action`: propose a checkmark, timed, count, set-time, limit, or trusted-source recipe based on the next answer.
   - `Not sure yet`: propose a small starter habit and explain how to adjust later.
4. The assistant must generate a habit recommendation before exposing detailed settings: name, category, success rule, schedule, starting target, Perfect Day membership, rest/travel/catch-up behavior, and any source boundary.
5. Users create from the recommendation first and tune only when they choose `Adjust details`; advanced/direct fields may remain available for expert users, but the default path must feel like an assistant, not a settings form.
6. The final recommendation/create screen must answer three user questions in plain language:
   - `What do I do?`
   - `How will Freeswimming count success?`
   - `What happens if I miss, rest, travel, or log a slip?`

## Successful Habit App Assistant Audit

Sources checked for the redesign:

- Productive, `Daily Habit Tracker`, because its public onboarding asks experience, goals, and barriers before presenting a plan, and positions the product as a personal assistant for making goals real: <https://productiveapp.io/>
- Fabulous, `Build better habits & achieve your goals`, because it starts from the user's desired help area, then turns that into a journey/routine rather than a settings screen: <https://www.thefabulous.co/>
- Streaks, `The to-do list that helps you form good habits`, because it keeps the mental model simple: complete a task, extend the streak, set non-daily schedules, and use Apple Health for trusted automatic goals: <https://streaksapp.com/>
- Habitify, `Habit Tracking App for Better Daily Routines`, because it organizes habits around day structure, progress visibility, timer/notes/mood, and trusted integrations instead of exposing implementation details: <https://habitify.me/>
- Way of Life, `an elegant habit tracker that actually works`, because it emphasizes fast daily entry, good/bad habit support, trigger notes, and long-term trend visibility: <https://wayoflifeapp.com/>
- Nielsen Norman Group, `Wizards: Definition and Design Recommendations`, `Progressive Disclosure`, GOV.UK `Question pages`, and Apple HIG `Onboarding`, because they define the baseline rules for branching setup flows, self-contained questions, back paths, minimal upfront friction, and fast arrival at value.

Findings from successful habit products:

1. Winning flows ask about the user's goal, current experience, and blockers before asking for configuration.
2. The product produces a plan/recipe, not a raw settings page.
3. The success-counting rule is made obvious: complete a task, avoid/log a slip, spend time, or trust another source.
4. Good assistants start smaller than the user's ambition and let users scale later.
5. Day/time/context matters because habits live inside routines, not in an abstract settings list.
6. Fast logging is a product requirement. Setup must not create a habit that is slow or confusing to use every day.
7. Notes, mood, barriers, and trigger context are optional supporting data, not required setup blockers.
8. Health/source-backed completion is only trustworthy when the app can name the source and explain what the user does outside the Habits surface.
9. Progress/streaks/charts are motivation after creation; they should not make creation feel heavy.
10. A 10/10 assistant makes the user feel: `I know what I am trying to change, I know what counts, and I can start today.`

Implementation rules from the audit:

1. The assistant must be a diagnosis-and-recipe flow, not a tutorial or a decorated form.
2. Ask one self-contained question per screen on mobile.
3. Use plain goal language first; internal mode labels may appear only as secondary diagnostics or in Help/Guide/admin-support copy.
4. Show a generated habit recipe early, then let the user tune only meaningful fields.
5. Keep the primary path visually singular: one clear next action per step.
6. Failed save keeps the full recipe/draft and makes retry obvious.
7. Direct/expert fields stay available without competing visually with the assistant.

## 10/10 Assistant Product Plan

Required flow:

1. Goal capture:
   - ask `What do you want to change?`;
   - capture a short target-change phrase, but do not depend on free-text parsing for correctness.
2. Adaptive diagnosis:
   - ask the primary branch first: `Do you want to stop something?` or `Do you want to do an action?`;
   - keep `Not sure yet` as a secondary escape;
   - ask one follow-up based on that branch, for example the clear-day boundary, whether the action is a checkmark, minutes, count, set time, limit, or whether success happens inside another Freeswimming flow;
   - no raw `Manual`, `Quit`, `Timed`, or `Source-backed` chooser as the main step.
3. Recipe proposal:
   - show `Your starter habit` with a concrete name, action, success rule, schedule, starting target, Perfect Day membership, catch-up/rest/travel interpretation, and source boundary;
   - explain why this recipe fits the user's goal in one short sentence.
4. Create or adjust:
   - make `Create habit` the primary action on the recommendation screen;
   - keep meaningful recipe fields hidden behind `Adjust details`;
   - keep advanced fields behind `Use fields` or an equivalent expert escape;
   - save through existing Habits create/edit contracts only.

Visual/UX bar:

- mobile-first, one-column, no nested cards, no text-heavy assistant panels;
- assistant should feel decisive and calm, with concrete example copy;
- the generated recipe must be the visual center of the flow;
- no screen may require the user to understand `tracking mode` to continue;
- every screen must fit without awkward text overflow at mobile and desktop breakpoints.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode: all `target` rows must close at `5/5`. Critical target categories: Product goals and IA, UX flow clarity, Business logic correctness and data integrity, Data placement and sync boundaries, Reliability and failure handling, Security and authz, Privacy and compliance, Analytics and KPI observability, Incident response and support operations, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping    | Threshold for this brief                                                                                                                                         | Evidence                                               | Expected score |
| --------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------- |
| Product goals and IA                          | target     | Assistant starts from the user's desired outcome and produces the correct Habits recipe without exposing raw tracking modes as the primary choice.               | component tests, screenshot handoff, user-flow map     | 5/5            |
| UX flow clarity                               | target     | User can understand the recommended recipe, daily action, success-counting rule, and miss/slip/rest/travel consequences before saving.                           | component tests, screenshot handoff                    | 5/5            |
| Visual design quality                         | target     | Assistant feels like a guided product experience, not a settings form; recipe is the visual center, mobile has no overlap, and only one primary action competes. | screenshot handoff mobile/desktop                      | 5/5            |
| Business logic correctness and data integrity | target     | Guide writes the same validated habit definition fields as Add/Edit and never invents check-ins, slips, or source-backed credits.                                | route/component tests, domain invariant review         | 5/5            |
| Admin editor ergonomics                       | N/A        | No admin editor surface is changed; this is private user setup only.                                                                                             | diff review confirms no admin editor changes           | N/A            |
| Accessibility (a11y)                          | target     | Wizard steps use semantic fieldsets, labels, keyboard-safe controls, visible focus, and status feedback.                                                         | Testing Library assertions, Playwright/a11y spot check | 5/5            |
| Performance (CWV + payloads)                  | supporting | No new heavy dependency or route-level payload spike; guide reuses local UI/state and existing create/edit routes.                                               | dependency diff, build/verify gate                     | 5/5            |
| Data placement and sync boundaries            | target     | Draft choices are local-only until save; habit definitions remain server-canonical; source-backed options require a trusted server-backed link.                  | brief contract, create/edit tests                      | 5/5            |
| Caching and invalidation strategy             | supporting | Successful save refreshes the selected Habits snapshot through existing route behavior.                                                                          | component/route tests                                  | 5/5            |
| Reliability and failure handling              | target     | Failed save keeps draft choices, shows retryable error, and does not create partial hidden history.                                                              | negative-path tests                                    | 5/5            |
| Security and authz                            | target     | Protected habit create/edit routes stay owner-scoped, fail closed, and validate mode/type/cadence input.                                                         | route negative-path tests                              | 5/5            |
| Privacy and compliance                        | target     | Analytics and support diagnostics do not include habit notes or unnecessary free-text personal content.                                                          | analytics payload review/tests                         | 5/5            |
| Content governance                            | target     | Help/Guide, user-flow map, and setup copy describe the same tracking-mode contract.                                                                              | docs diff, route/label/support sweep                   | 5/5            |
| Admin workflow and editability                | N/A        | No admin CRUD/workflow is changed; owner/user setup is the only workflow.                                                                                        | explicit scope rationale                               | N/A            |
| SEO and crawlability                          | N/A        | Habits setup is private/authenticated and does not change public metadata or sitemap behavior.                                                                   | diff review confirms no public route SEO changes       | N/A            |
| AI discoverability                            | N/A        | No public AI-discoverable page or structured data surface is changed.                                                                                            | explicit scope rationale                               | N/A            |
| Analytics and KPI observability               | target     | Events distinguish assistant opened, goal selected, diagnosis answered, recipe proposed/tuned, save attempted, save failed, and save succeeded without PII.      | analytics event tests/review                           | 5/5            |
| Commerce and revenue ops                      | N/A        | No pricing, entitlement, checkout, refund, payout, or revenue path is changed.                                                                                   | explicit scope rationale                               | N/A            |
| Incident response and support operations      | target     | Support can explain why a user was guided to Quit versus Manual and diagnose mode mistakes without inspecting sensitive labels.                                  | support runbook update                                 | 5/5            |
| Finance and reporting operations              | N/A        | Scope does not touch payments, invoices, payouts, refunds, or finance reports; habit setup is not finance-relevant.                                              | explicit scope rationale                               | N/A            |
| i18n operational readiness                    | target     | Step labels and summaries avoid layout-fragile copy, and future locales can map guide templates explicitly.                                                      | mobile screenshot review, copy inventory               | 5/5            |
| Stack-fit and dependency discipline           | target     | Reuse `HabitPerfectDayHub`, existing Habits draft/create/edit contracts, TypeScript helpers, and UI primitives; no new dependency unless explicitly justified.   | code review, dependency diff, typecheck                | 5/5            |
| Testing and QA automation                     | target     | Unit/component/route coverage proves intent branching, recommendation overrides, save payloads, negative paths, and docs lint.                                   | Vitest, verify gates, screenshot handoff               | 5/5            |
| Scalability and cost efficiency               | supporting | Wizard derives options from bounded local constants/current snapshot and does not add unbounded reads.                                                           | code review                                            | 5/5            |
| DevOps and rollback readiness                 | target     | Feature can be reverted without data cleanup; no destructive migration; docs and screenshot evidence identify changed setup path.                                | rollback notes, verify gates                           | 5/5            |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `HabitPerfectDayHub` as the mature reference surface;
  - keep assistant/recipe state client-side until the existing create/edit API call;
  - do not create a parallel habit creation route unless a typed server action is required.
- TypeScript/domain:
  - derive assistant recipes from `HabitMode`, `HabitType`, cadence helpers, and source-backed metadata;
  - unknown mode/source values fail closed with review-required copy.
- Supabase/data:
  - prefer no schema change; use existing `habit_definitions` and existing source-backed link contracts;
  - if a schema change becomes necessary, it must be additive, RLS-reviewed, and covered by route tests.
- UI:
  - reuse current Habits card/action primitives;
  - use goal cards, adaptive question groups, recipe summary, and focused tuning controls;
  - screenshot handoff is `after/reference` against the existing Add habit surface.
- Testing:
  - component tests for goal diagnosis, recipe generation, tuning, review, and payloads;
  - route negative-path tests if validation changes;
  - screenshot handoff before broad gates.

## Data Placement And Sync Contract

Server-canonical data:

- saved habit definitions;
- source-backed links;
- check-ins and reset boundaries, only when existing routes explicitly write them.

Local-only data:

- wizard draft choices;
- assistant diagnosis answers;
- generated recipe state;
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
- assistant must warn or route users toward a new habit if they materially repurpose a habit, for example changing `Quit sugar` into `Read pages`.
- Compatibility:
  - legacy storage value `build` remains user-facing `Do` / `Manual`.
- Observability and repair:
  - unsupported saved values fail closed and show review-required copy rather than silently recommending a mode.

## Forward Compatibility Contract

Extensibility surfaces:

- habit modes, habit types, source-backed providers, cadence periods, Perfect Day membership, rest/travel policies, assistant goal cards, recipe templates, analytics event names, and Help/Guide labels.

Source of truth:

- typed Habits contracts in `lib/habits/shared.ts`;
- existing Habits create/edit payload contract;
- Help/Guide and user-flow map for user-facing semantics.

Additive behavior:

- a new manual habit type should appear only if the assistant can explain its success rule;
- a new source-backed provider should appear only when it has a trusted completion source and mapped guide copy;
- new cadence periods must use shared cadence helpers.

Explicit mapping requirements:

- new habit mode;
- new source-backed provider;
- new completion status;
- new goal card or recipe template;
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

- replacement of the rejected first guided setup draft with a goal-based assistant;
- goal capture, goal cards, adaptive diagnosis, generated recommendation/create screen, and focused tuning behind `Adjust details`;
- recipe outcomes for Manual, Manual timed, Quit, Source-backed, and safe `help me choose` starter habits;
- explicit fork between `Quit` slip-only, Manual daily completion, Manual timed duration, and trusted source-backed completion;
- analytics for assistant steps, recipe proposal/tuning, and save outcomes;
- Help/Guide, support runbook, user-flow map, and tests.

## Out Of Scope

- implementing this guide inside Child S;
- AI/chat-based natural-language habit generation;
- push/email reminders;
- Apple Health/Google Fit/native integrations;
- habit history delete/export;
- heavy dashboard or coaching journey;
- commerce, admin editor, public SEO pages, or finance/reporting changes;
- changing Micro Session completion rules.

## Acceptance Criteria

1. User can start from a desired goal and receive a concrete starter habit recipe without understanding internal mode names.
2. Assistant asks at most one adaptive follow-up before proposing the first recipe.
3. Recipe proposal explains the daily action, success-counting rule, cadence, starting target, Perfect Day membership, and miss/slip/rest/travel interpretation.
4. Quit recipe clearly says clear days are counted until an explicit slip is logged and does not show daily `Mark done`.
5. Manual recipe clearly says the user must explicitly complete the habit with `Mark done`, `Save`, or `Finish`.
6. Timed recipe clearly says duration/time must be saved to count.
7. Source-backed recipe is shown only for trusted linked sources and explains where completion happens.
8. `Not sure yet` produces a small safe starter habit and explains why it is low-risk.
9. User can create directly from the recommendation, or tune meaningful recipe fields behind `Adjust details` without falling into a raw settings form.
10. Save payloads match existing create/edit contracts and include no hidden check-in/slip/reset writes.
11. Failed save is retryable and keeps the full recipe/draft.
12. Help/Guide and support docs describe the same assistant/recipe contract.
13. Screenshot handoff is approved before `npm run verify:pre-pr`.
14. All target scorecard categories close at `5/5`; no 10/10 claim is allowed until owner accepts the screenshot handoff.

## Validation

- route/label/support sweep for `auto increment`, `auto-complete`, `assistant`, `goal`, `recipe`, `Quit`, `Manual`, `Timed`, `Mark done`, `Log slip`, `Source-backed`, `Perfect Day`, `Rest day`, and `catch up`;
- `npm run lint:briefs`;
- `npm run typecheck`;
- focused Vitest for Habits assistant goal diagnosis, recipe proposal/tuning, create, failed save, and route payloads;
- screenshot handoff mobile/desktop before broad gates;
- `npm run verify:pre-pr`;
- PR CI required checks;
- `npm run verify:pre-merge` before merge readiness.

## Screenshot Handoff Requirements

Required because this changes visible setup UI.

Capture `after/reference` artifacts:

- `after-habits-assistant-direction-mobile.*`
- `after-habits-assistant-question-mobile.*`
- `after-habits-assistant-recommendation-mobile.*`
- `after-habits-assistant-adjust-details-desktop.*`

Use `output/habits-goal-assistant-YYYY-MM-DD-HHMMSS`.

## Help/Guide Impact

Required in the same implementation PR:

- Quit means slip-only logging, no daily mark done.
- Manual means explicit completion.
- Manual timed means timer/manual time must be saved.
- Source-backed means trusted source completion.
- Goal assistant means Freeswimming proposes a starter recipe from the user's desired outcome, then lets the user tune it.
- Rest/travel policy is a setup choice that affects future catch-up interpretation.

## Checkpoint Log

- `2026-06-15 | planned | created from Child S screenshot review after owner clarified that setup must make Quit/slip-only vs Manual daily explicit and avoid auto on/off ambiguity | next: execute only after owner explicitly selects Child T`
- `2026-06-15 | in-progress | owner approved Child T execution and requested 10/10 wizard quality audit; branch aw-006-habits-setup-guide-intent from main@63aa2ba7; benchmark audit added from NN/g, GOV.UK, and Apple onboarding guidance | next: map existing Habits Add/Edit/Help/test surfaces`
- `2026-06-15 | redesign-required | owner rejected first screenshot handoff as 0/10 and clarified that Child T must be a goal-based habit creation assistant; audit refreshed against Productive, Fabulous, Streaks, Habitify, Way of Life, NN/g, GOV.UK, and Apple; plan reset to goal capture -> adaptive diagnosis -> generated recommendation -> create directly, with details hidden until requested | next: implement goal-based assistant redesign`
- `2026-06-15 | in-progress | first redesign attempt as a 5-step assistant was rejected because the final screen still read as an information/form review; confirmed new normal assistant flow is one question at a time, recommendation first, create directly, and fields only behind Adjust details | next: implement the confirmed 4-step assistant and regenerate screenshots`
- `2026-06-15 | in-progress | implemented confirmed 4-step flow: target change -> change type -> fit question -> recommendation/create, with recipe fields hidden behind Adjust details and tuning analytics only when adjusted details are saved; validation passed: Habits/analytics Vitest 4 files and 140 tests, typecheck, lint with 7 existing output-script warnings only, lint:briefs -- --all, git diff --check, and route/label/support sweep | next: capture screenshot handoff before npm run verify:pre-pr`
- `2026-06-15 | visual-correction | owner rejected the fit-question screenshot because it still used internal habit jargon (`slip`, `cue`) and too many abstract direction cards; changed the branch question to the real assistant decision (`Stop something`vs`Do an action`), moved minutes/count/source under `Do an action`, and changed quit recommendation labels to clear-day language | next: rerun validation and regenerate screenshot handoff`
- `2026-06-15 | screenshot-review | regenerated corrected screenshot handoff at `output/habits-goal-assistant-2026-06-15-061925`: direction now asks the real intent branch first, quit follow-up uses a concrete scrolling boundary without slip/cue jargon, recommendation is create-first with details hidden, and temporary visual harness/capture script were removed after capture; validation passed: Habits/analytics Vitest 4 files and 140 tests, typecheck, lint with 7 existing output-script warnings only, lint:briefs -- --all, and git diff --check | next: owner approval before npm run verify:pre-pr`
- `2026-06-15 | deferred-cleanup | owner decided to defer Child T because the assistant still did not match the desired product quality; removed runtime/test/analytics/support implementation changes and moved this brief to deferred as planning context only | next: owner-led redesign before any future execution`
