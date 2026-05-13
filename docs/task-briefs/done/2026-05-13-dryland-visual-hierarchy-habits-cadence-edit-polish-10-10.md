# Task Brief: Dryland Visual Hierarchy And Habits Cadence Edit Polish (10/10)

## Metadata

- `id`: `2026-05-13-dryland-visual-hierarchy-habits-cadence-edit-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-13`
- `updated`: `2026-05-13`

## Goal

Make Dryland Micro Sessions calmer and easier to scan while adding limited Habits cadence/edit polish without changing the underlying database model.

## Product Decision

Use this PR as a focused pilot for reducing nested boxes, heavy lines, and noisy action states on `/my-library/dryland`, with limited `/my-library/habits` edits where the current habit model already supports the behavior. Do not broaden this PR into a whole-app visual hierarchy redesign.

Follow-up deferred brief: create an app-wide visual hierarchy and line-reduction audit only after the screenshot handoff validates this local pattern.

Monthly habit recurrence is deferred. This PR only exposes existing `schedule_days` as daily, weekly-with-weekday, and custom-days cadence.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Security and authz
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                           | Evidence                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Dryland remains the source for saved sessions and Micro Sessions; Habits edit is limited to active habit definitions and existing cadence fields.            | brief scope review + screenshot handoff                   | `5/5`                   |
| UX flow clarity                               | `target`     | Micro Session actions distinguish queued vs completed state; dryland source-session save choices are explicit; habit edit explains history is preserved.     | component tests + screenshot handoff                      | `5/5`                   |
| Visual design quality                         | `target`     | `/my-library/dryland` reduces nested borders/boxes and keeps micro plan, unit, and exercise cards readable on desktop/mobile without text overlap.           | desktop/mobile screenshots                                | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Dryland micro-plan payload semantics are unchanged; habit edits update definitions without deleting or rewriting existing check-ins/history.                 | targeted unit/component/API tests + diff review           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes authenticated user Dryland/Habits surfaces, not admin editor workflows.                                                             | explicit admin scope rationale                            | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Completion buttons expose correct pressed state, labels, and icons; new habit edit/cadence controls are keyboard reachable and labelled.                     | Testing Library assertions + screenshot review            | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, route fetch expansion beyond existing PATCH/POST paths, polling, or heavy client runtime is introduced.                      | dependency/runtime diff review + verify gate              | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Dryland sessions/micro plans and habit definitions/check-ins remain server-canonical; local state is temporary form/draft UI only.                           | brief contract + tests                                    | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: authenticated routes remain force-dynamic/no-store through existing loaders and mutation responses refresh snapshots where already defined. | route/API diff review                                     | `4/5`                   |
| Reliability and failure handling              | `target`     | Create/edit/save/reset/error states remain deterministic for Dryland Micro Sessions and Habits edit; invalid habit title/cadence handling is covered.        | targeted tests                                            | `5/5`                   |
| Security and authz                            | `target`     | Habit edit continues to use owner-scoped `PATCH /api/my-library/habits/:id`; no cross-user or unauthenticated path opens.                                    | existing + added negative/owner-scoped route tests        | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new data category, sharing path, export payload, or analytics taxonomy is introduced.                                                    | diff review                                               | `4/5`                   |
| Content governance                            | `target`     | New labels use stable product language: `MS:` prefix, current vs next micro-session copy, habit-definition edit copy, and deferred monthly note in brief.    | route/label sweep + tests                                 | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, operator action, moderation path, or admin editability changes.                                                               | explicit admin workflow scope rationale                   | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/dryland` and `/my-library/habits` are authenticated/private and no public metadata/sitemap/crawlable content changes.               | explicit private-route rationale                          | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable route, schema, or content model changes.                                                                               | explicit private-route rationale                          | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this PR intentionally adds no analytics taxonomy or KPI events.                                                                                  | explicit no-analytics scope rationale                     | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, pricing, entitlement, subscription, refund, payout, or revenue operation changes.                                                   | explicit commerce scope rationale                         | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this user UI polish does not change incident response, support diagnostics, recovery paths, or support runbooks.                                 | explicit support scope rationale                          | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no invoice, payout, refund, entitlement, subscription, reporting, or reconciliation behavior changes.                                            | explicit finance scope rationale                          | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new copy stays short, literal, and localizable; no locale routing or translation workflow ships.                                            | copy review                                               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `DrylandBuilderHub`, `DrylandMicroPlanPanel`, `DrylandSessionEditor`, `HabitPerfectDayHub`, existing API routes, and Tailwind primitives.              | code review + dependency diff                             | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted unit/component/API tests cover changed copy, controls, payloads, and state; screenshot handoff happens before `verify:pre-pr`.                      | targeted Vitest + screenshot handoff + later verify gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new storage model, polling, background jobs, or expensive runtime transforms are introduced.                                             | no-migration/no-dependency review                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a normal code/docs/test revert; no migration, config, or release sequencing is required.                                                         | no-migration review + verify gates                        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse existing authenticated routes `/my-library/dryland` and `/my-library/habits`;
  - keep server/client boundary unchanged: server loaders provide snapshots; client components handle local form state and mutations;
  - keep route data loading force-dynamic for authenticated state.
- TypeScript/domain contracts:
  - reuse `DrylandMicroPlanRecord`, `DrylandSessionDraft`, `HabitDefinitionView`, `HabitDraft`-style UI state, `HabitWeekday`, and existing validation helpers;
  - habit edit payloads must go through `buildHabitDefinitionUpdate`;
  - dryland micro plan semantics must stay owner-scoped and snapshot-based.
- Supabase/data layer:
  - no new migration because `schedule_days` already supports daily/weekly/custom;
  - no RLS/auth boundary change;
  - no generated DB type change.
- External services/tools:
  - N/A; no new external service or SDK.
- UI system:
  - reference surfaces are current `DrylandMicroPlanPanel`, `DrylandSessionEditor`, and `HabitPerfectDayHub`;
  - reduce nested boxes by lowering per-row/per-card border weight and keeping one clear container per functional area;
  - use accessible pressed states for completion controls;
  - screenshot handoff comparison type is before/after for `/my-library/dryland` and `/my-library/habits`.
- Testing:
  - update targeted component tests for Dryland Micro Sessions and Habits;
  - update route/API tests for habit edit payloads where needed;
  - capture screenshot handoff before broad PR gates.

## Data Placement And Sync Contract

- Server-canonical data:
  - `dryland_sessions`, `dryland_micro_plans`, `habit_definitions`, and `habit_check_ins` remain source-of-truth in Supabase.
- Local data:
  - temporary draft inputs, expanded/editing row state, and existing dryland local draft cache remain browser-local only.
- Sync policy:
  - Dryland saves continue to PATCH saved sessions; optional current Micro Session update rebuilds remaining queued units through the existing micro-plan PATCH.
  - Habit edits PATCH the active habit definition and reload the returned snapshot; existing check-ins/history remain attached to the same stable habit id.
- Retention and sensitivity:
  - no deletion or retention policy changes; habit check-ins are not removed by edit.
- Cache/invalidation:
  - authenticated routes remain dynamic/no-store; mutation responses return updated snapshots/plans through existing route behavior.

## Identity And Rename Contract

- Canonical stable ID:
  - Dryland sessions, micro plans, habit definitions, and habit check-ins keep their existing UUIDs.
- Human-readable identifiers:
  - Micro Session title can use the shorter `MS:` prefix and remains renameable display copy.
  - Habit title remains editable display copy and does not affect route identity.
- Mutability rules:
  - Habit definition fields in scope are editable in place when the same habit intent is preserved.
- Rename vs repurpose policy:
  - edits should update the same habit only when preserving check-in history is correct; materially different habit intent should be created as a new habit outside this PR.
- Compatibility contract:
  - no route aliases, redirects, imports, exports, or legacy id read-through changes.
- Observability and repair:
  - existing route errors and returned snapshots remain the repair surface; no new operator workflow is introduced.

## Scope

- `/my-library/dryland` visual hierarchy and nested-box reduction.
- `DrylandMicroPlanPanel` micro plan title prefix, available units, queued/completed action labels, bubble confirmation copy, and source selection density.
- `DrylandSessionEditor` copy/actions when a saved session feeds the current Micro Session.
- `DrylandBuilderHub` post-save CTA back to Micro Sessions.
- `/my-library/habits` active habit edit for title, mode/type/target/unit, category, note, start date, and schedule days.
- Add/Edit cadence controls for daily, 1x/week with weekday choice, and custom days.
- Count-habit status line grammar and weekly adherence copy.
- Targeted unit/component/API tests and screenshot handoff.

## Out Of Scope

- App-wide visual hierarchy redesign.
- New database tables, migrations, generated DB types, or monthly recurrence.
- New analytics taxonomy.
- New admin workflow.
- Dryland micro-plan progress math, release scheduling model, or persistence semantics.
- Habit history deletion or retrospective check-in rewriting.
- Unrelated redesign of My Library, Home, Admin, Course, checkout, or public marketing surfaces.

## Acceptance Criteria

1. `/my-library/dryland` shows fewer nested visible boxes/lines while preserving the existing Dryland and Micro Sessions workflows.
2. Micro plan, available units, and exercise cards are calmer and readable on desktop/mobile.
3. Queued unit labels no longer say `Done · Set ...`; completion state is green, includes a check icon, and exposes `aria-pressed`.
4. New default Micro Session titles use `MS:` as the prefix.
5. Dryland builder shows `Go to current micro session` when the saved session feeds the active Micro Session.
6. Dryland builder clearly distinguishes `Update current micro session` from `Use from next micro session`.
7. After saving a dryland session, the UI offers a relevant CTA to build, add to, or go to Micro Sessions.
8. Active Habits can be edited for title, mode/type/target/unit, category, note, start date, and schedule days.
9. Habit edit preserves existing check-ins/history and explains that behavior in UI copy.
10. Add/Edit exposes daily, 1x/week with weekday choice, and custom days using existing `schedule_days`.
11. Monthly recurrence is not built and is recorded as deferred in this brief.
12. Count habits show grammatically correct singular/plural status such as `1 glass today · 1/7 days this week`.
13. `W: Fasting` does not trigger `Give the habit a short name.` unless the submitted title is actually invalid; any real UI/state bug found is fixed within this scope.
14. Targeted tests cover changed behavior and labels.
15. Screenshot handoff is delivered before `npm run verify:pre-pr`.

## Validation

- Targeted unit/component/API tests passed:
  - `./node_modules/.bin/vitest run tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/dryland-builder-hub.test.tsx tests/unit/dryland-micro-plan-routes.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/habits-routes.test.ts tests/unit/habits.test.ts`
  - `6` files, `56` tests passed.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run lint:briefs:all` passed.
- API/server failure and negative-path evidence:
  - `tests/unit/habits-routes.test.ts` covers `401` fail-closed unauthenticated create and PATCH update paths, `400` invalid habit id before auth work, owner-scoped PATCH update that does not touch `habit_check_ins`, and stable update storage failure-mode response with no unexpected 500 message leakage.
- Screenshot handoff captured before `npm run verify:pre-pr`:
  - `output/dryland-habits-polish-2026-05-13-071953`
- After owner screenshot approval:
  - `npm run verify:pre-pr`
  - commit, push, PR
  - `npm run verify:pre-merge` before merge recommendation.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/dryland`
  - `http://127.0.0.1:3000/my-library/dryland?micro=edit`
  - `http://127.0.0.1:3000/my-library/habits`
- Screenshot handoff:
  - before/after artifacts for desktop and mobile Dryland and Habits surfaces.
- Vercel preview:
  - to be tested after PR checks if needed before merge readiness.

## Help / Guide Impact

N/A. This changes authenticated user UI labels and edit ergonomics only. It does not change support recovery behavior, admin/operator workflow labels, Help/Guide contracts, or runbook actions.

## Route / Label / Support Surface Sweep

Required before broad gates because user-facing labels and workflow actions change. Search targets include:

- `Done · Set`
- `Micro session:`
- `MS:`
- `Mark done?`
- `Use from next micro session`
- `Update current micro session`
- `Go to current micro session`
- `schedule_days`
- `Daily`
- `1x/week`
- `Custom days`
- `Give the habit a short name`
- `glasses`

Sweep result on `2026-05-13`:

- Identifiers searched: `Done · Set`, `Micro session:`, `MS:`, `Mark done?`, `Use from next micro session`, `Update current micro session`, `Go to current micro session`, `schedule_days`, `Daily`, `1x/week`, `Custom days`, `Give the habit a short name`, `glasses`.
- Surfaces checked / directories-surfaces: `app/`, `components/`, `lib/`, `tests/`, and this active task brief. Help/Guide, admin, public SEO, analytics, and runbook fallout were checked by scope and are N/A because the changes are authenticated Dryland/Habits user UI and existing API behavior only.
- `Done · Set` and `Mark done?` remain only in this brief's search-target list.
- New Dryland action labels are in `DrylandMicroPlanPanel`, `DrylandSessionEditor`, `DrylandBuilderHub`, and targeted tests.
- Existing `Micro session:` remains in older unit-test fixtures for persisted/historical titles; new default title creation uses `MS:`.
- `schedule_days`, `Daily`, `1x/week`, `Custom days`, `Give the habit a short name`, and unit grammar hits are limited to habit contracts, routes, export mapping, UI, tests, and this brief.

## Checkpoint Log

- `2026-05-13 | in-progress | branch feature/dryland-hierarchy-habits-polish created from clean synced main 630dc19 after #692 and closeout #693; owner requested Dryland visual hierarchy and Micro Session action polish plus limited Habits cadence/edit work | next: implement scoped UI/domain-test updates, run targeted validation, and capture screenshot handoff before verify:pre-pr`
- `2026-05-13 | in-progress | owner asked whether line/design reduction should be app-wide; decision is to pilot in this slice and defer app-wide visual hierarchy audit to a separate follow-up brief after screenshot review | next: keep this PR scoped to Dryland + limited Habits`
- `2026-05-13 | in-progress | implemented scoped Dryland hierarchy/actions and Habits edit/cadence polish; targeted Vitest, typecheck, lint, brief lint, diff check, route/label sweep, and before/after screenshot capture passed | next: owner screenshot review before verify:pre-pr`
- `2026-05-13 | in-progress | owner approved continuing without new screenshots; green/current accent and grey-on-grey contrast fine-tuning is deferred to later page-review polish | next: run verify:pre-pr, then commit, push, and open PR`
- `2026-05-13 | in-progress | first verify:pre-pr stopped on brief quality-gate evidence wording; added explicit API negative-path/failure-mode evidence, route/label identifiers searched, and surfaces checked, plus PATCH route failure tests | next: rerun targeted route tests and verify:pre-pr`
- `2026-05-13 | in-progress | verify:pre-pr full lane passed after evidence update: lint, typecheck, 1062 unit tests, build, perf budgets, and Playwright E2E 84 passed / 402 expected skips; perf trend recommended tightening after 5 green runs, decision is hold in this UI slice and carry tighten prompt into PR summary because budget changes are out of scope | next: commit and push branch`
