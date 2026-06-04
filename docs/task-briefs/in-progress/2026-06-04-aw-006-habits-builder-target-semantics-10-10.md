# Task Brief: AW-006 Habits Builder Target Semantics (10/10)

## Metadata

- `id`: `2026-06-04-aw-006-habits-builder-target-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-04`
- `updated`: `2026-06-04`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-habits-builder-target-semantics`
- `execution_mode`: `implementation to screenshot approval; stop before npm run verify:pre-pr`

## Brief Audit Record

- `last_audited`: `2026-06-04`
- `base`: `main@30ac208`
- `audit_status`: `ready`
- `decision`: Execute Child F now on a clean branch after AW-006 Habits History Calendar PR `#983` and closeout PR `#984`.
- `reason`: `git status -sb` is clean on `aw-006-habits-builder-target-semantics`, `HEAD`, `main`, and `origin/main` all point to `30ac208`, Child A/B/C/D are done, and the owner explicitly approved Child F with added screenshot findings for count row layout, native stepper ergonomics, timed progress hierarchy, button width consistency, Habits week-bar click/swipe navigation, heading pill alignment, and Details action hierarchy.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, Habits API/storage constraints, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, screenshot rules, mobile action layout rules, or verification lanes change before screenshot handoff.

## Goal

Make habit setup and execution rows distinguish no-quantity reminders from specific count/timed targets, while making count/timed input rows, Details actions, heading metadata, and Habits week navigation feel deliberate and aligned on mobile and desktop.

## Pre-Implementation Owner Explanation

Vi rydder hvordan en vane faar maal: en enkel "drikk vann"-vane skal kunne vaere en vanlig Done-only vane uten falskt tallmaal, count-rader skal faa tryggere input/Save/Details-layout, og tidsvaner skal vise dagens progresjon som en samlet blokk.

Hvorfor det betyr noe: brukeren skal forstaa om vanen bare skal markeres som gjort, telles, eller times, uten at UI-en skaper tvil eller feilregistrering.

Utenfor scope er historikkdashboard, week/month/year comparison, lyd, reminders, eksport, nye databaser og endret timerlogikk. `litres` er ikke i dagens database-constraint og holdes utenfor denne trygge patchen med eksplisitt fremtidig mapping.

Fremoverkompatibilitet: nye target-typer eller enheter skal gaa gjennom typed mapping, eksisterende database-constraints, support-copy og tester. Ukjente enheter skal falle trygt tilbake til eksisterende label/validation, ikke telles som en kjent enhet.

## Active Findings

| ID    | Disposition | Scope decision                                                                                                                                                        |
| ----- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-019 | In scope    | Builder should make no-fixed-amount reminders a clear `Done only` / `Any amount` path and keep specific count targets explicit.                                       |
| H-021 | In scope    | Count rows such as Wall Slides should visually align input, `Save`, and `Details` instead of looking like separate controls.                                          |
| H-022 | In scope    | Native tiny number steppers should not be the primary count/timed input UX; use larger stepper controls around the value.                                             |
| H-023 | In scope    | Timed progress should present `0:00` and `of 10:00 today` as one information group with different visual weight.                                                      |
| H-024 | In scope    | Peer row actions should share height and min-width; on mobile paired actions should feel equal-width while color keeps hierarchy.                                     |
| H-025 | In scope    | The blue Habits week-bar container should support day clicks, previous/next week controls, and the intended horizontal swipe navigation.                              |
| H-026 | In scope    | Habit header pills/chips should stay right-aligned beside the heading when space allows, not default below the heading.                                               |
| H-027 | In scope    | Details action hierarchy should put completion actions first and primary; `Finish` should be blue, `Rest day` secondary, and `Reset` lower priority.                  |
| H-028 | Deferred    | Midnight auto-complete for count/timed targets requires a separate business-logic/data-integrity brief. Current completion remains derived from saved check-ins only. |

## Data Placement And Sync Contract

- Server-canonical data:
  - `habit_definitions` remains the source of truth for habit mode, type, target value, unit, cadence, and status.
  - `habit_check_ins` remains the source of truth for saved check-ins.
- Local data:
  - same-day timer localStorage remains unchanged and local-only.
  - form/input draft state remains client-only until the existing create/update/check-in APIs are submitted.
- Explicit deferred data behavior:
  - this slice does not auto-create count/timed check-ins at midnight from local timer/input state.
  - automatic day-boundary completion would require timezone, offline, conflict, and consent decisions before implementation.
- Sync policy:
  - create/update/check-in mutations continue through the existing Habits API routes and return a refreshed snapshot.
  - this slice does not add retry, background sync, conflict resolution, or cache behavior.
- Retention and sensitivity:
  - habit names and quit/nutrition/health labels remain private and must not be logged in analytics or support notes.
- Cache/invalidation:
  - `/my-library/habits` remains the existing authenticated dynamic route; no new route cache strategy.

## Identity And Rename Contract

- Canonical stable ID:
  - `habit_definitions.id` remains the stable identity for check-ins, local timer recovery, support diagnosis, and row focus.
- Human-readable identifiers:
  - habit title remains editable display copy, not a route or analytics identity.
- Mutability:
  - target type/unit/value remain intentionally editable on Today through the existing edit flow.
- Rename vs repurpose:
  - renaming a habit keeps history attached.
  - materially repurposing a habit remains a product/support decision before history is reused.
- Compatibility:
  - stored/API `habit_mode = build` stays unchanged while UI says `Do`.
  - no legacy target rows are migrated in this slice.

## Forward Compatibility Contract

- Extensibility surfaces:
  - habit target choices, habit units, row actions, support docs, and localized labels.
- Source of truth:
  - mode/type/unit options come from existing typed Habits unions and database constraints.
- Additive behavior:
  - future count units that fit the existing constraint can appear through `getUnitOptions`, unit formatting, and tests.
  - new habits from the snapshot inherit row layout and action width rules automatically.
- Explicit mapping requirements:
  - `litres` or any new persisted unit requires a database constraint migration, typed mapping, format labels, support copy, and route/API tests before release.
  - future target styles beyond Done-only/specific count/timed/time-of-day/avoidance require product copy and validation tests.
- Unknown or deprecated values:
  - unknown stored units continue to fall back to safe generic labels through current view-model normalization.
  - unsupported form choices are not rendered.
- Test/evidence:
  - focused component tests for target-choice payloads, row action layout classes, and timed progress grouping.
  - route/support sweep for `Any amount`, `Done only`, `glasses`, `litres`, `Save`, `Details`, and Habits docs.

## Help / Guide Impact

Required because this changes member-facing setup semantics and support diagnosis:

- update `docs/user-flow-map.md` to describe `Done only` / `Any amount` versus specific count targets;
- update `docs/runbooks/auth-account-support.md` to remove the stale "future builder target semantics" wording and document the `litres` migration boundary;
- no admin Help Center update is required because no admin workflow label or operator action changes.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `/my-library/habits` and `HabitPerfectDayHub`;
  - preserve client/server route boundaries and existing API endpoints.
- TypeScript/domain:
  - reuse `HabitDraft`, `HabitType`, `HabitUnit`, `buildHabitDefinitionInsert`, `buildHabitDefinitionUpdate`, and existing validation.
  - do not encode new persisted unit values that the database cannot accept.
- Supabase/data:
  - no migration in this safe patch; `litres` remains documented future migration scope.
  - existing RLS/authz and generated database type shape remain unchanged.
- UI system:
  - reuse `ui-field`, `fs-cta-*`, mobile action layout classes, and lucide icons.
  - screenshot handoff type: `after/reference` against current Habits route states where practical.
- Testing:
  - focused `habit-perfect-day-hub` tests plus `habits`/route tests as needed.

## Scope

- `components/my-library/habits/HabitPerfectDayHub.tsx`
- `tests/unit/habit-perfect-day-hub.test.tsx`
- `tests/unit/habits.test.ts` and/or `tests/unit/habits-routes.test.ts` if payload or target labels change.
- `docs/user-flow-map.md`
- `docs/runbooks/auth-account-support.md`
- Habits parent, AW-006 queue, and design inventory lifecycle docs.

## Out Of Scope

- New habit database columns, persisted `litres` unit, or migration.
- New timer source/event model, timer behavior changes, sound, reminders, exports, notes, archive-history behavior, or best-streak/habit-score dashboard.
- Midnight auto-complete or background creation of check-ins for count/timed targets.
- Week/month/year comparison, cross-product calendar storage, or swipe behavior outside the Habits week overview.
- Stripe, auth, admin, finance, public SEO, native app, or notification changes.

## Acceptance Criteria

1. Add/edit habit target selection clearly exposes no-quantity `Done only` / `Any amount` and specific target choices without forcing a false count.
2. Specific count targets still save existing numeric target/unit payloads such as `1 glasses`.
3. Count row input, `Save`, and `Details` align visually; `Save` and `Details` share height and a stable min-width on desktop and equal mobile behavior.
4. Numeric target/check-in controls use clear `-` / `+` stepper buttons instead of relying on tiny native spinners.
5. Timed progress keeps one grouped daily progress block where the current value is visually primary and the target context is secondary.
6. Habits week overview day bars and previous/next controls navigate to the correct selected-day URL, and horizontal swipe on the blue week-bar container moves to the previous/next available week without changing global calendar behavior.
7. Habit header pills/chips stay right-aligned beside the heading at normal row widths, while the heading truncates safely.
8. Details places completion actions first, makes `Finish` blue/primary, keeps `Rest day` secondary, and leaves `Reset` lower priority.
9. Existing Habits API/storage/timer/rest/slip/cadence semantics remain unchanged; midnight auto-complete is not added.
10. Screenshot handoff is delivered before `npm run verify:pre-pr`.

## Route / Label / Support Surface Sweep

- Identifiers searched:
  - `/my-library/habits`
  - `Done only`
  - `Any amount`
  - `Specific count`
  - `Fixed amount`
  - `Duration target`
  - `Manual time`
  - `Time of day`
  - `Avoid/limit`
  - `Stay under`
  - `Target`
  - `Timer target`
  - `glasses`
  - `litres`
  - `Save`
  - `Details`
  - `Wall Slides`
  - `Previous week`
  - `Next week`
  - `Week overview`
  - `swipe`
  - `Finish`
  - `Rest day`
  - `Reset`
  - `midnight`
- Surfaces checked:
  - `app/`
  - `components/`
  - `lib/`
  - `tests/`
  - `docs/`
  - `docs/runbooks/`
  - `docs/task-briefs/`
  - `docs/design/`
- Fallout handled:
  - Habits route copy, support runbook wording, design inventory, parent brief, queue brief, and focused unit tests were updated for the in-scope labels and behaviors.
  - Generic `Details`, `Finish`, and `Reset` hits in workouts, goals, admin tools, download rate limits, and historical done briefs are unrelated domain labels and were left unchanged.
  - Midnight auto-complete is explicitly deferred because no background check-in creation or server-canonical completion job is added in this slice.

## Validation

Before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/habit-perfect-day-hub.test.tsx tests/unit/habits.test.ts tests/unit/habits-routes.test.ts`
- `npm run lint:briefs`
- `git diff --check`
- screenshot capture for changed Habits surfaces

After owner screenshot approval:

- `npm run verify:pre-pr`
- PR creation/update, CI monitoring, `npm run verify:pre-merge`

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Privacy and compliance`
- `Incident response and support operations`
- `i18n operational readiness`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                       | Evidence                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Habit setup clearly separates Done-only reminders from specific count/timed targets without broad dashboard work.                                                        | component tests + screenshots         | `5/5`                   |
| UX flow clarity                               | `target`     | Add/edit, row execution, Details hierarchy, and Habits week navigation make target type, value entry, Save/Finish, Details, selected day, and week movement unambiguous. | UI tests + screenshots                | `5/5`                   |
| Visual design quality                         | `target`     | Count/timed rows use stable spacing, shared min-width actions, clear steppers, right-aligned header pills, and no overlapping text at mobile/desktop sizes.              | screenshot handoff                    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing persisted payloads remain valid; no unsupported unit is written; count/timed/binary check-ins keep current semantics.                                           | unit/route tests + diff review        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, CRUD, publish workflow, operator queue, or admin action surface changes.                                                                    | explicit admin-editor scope rationale | `N/A`                   |
| Accessibility (a11y)                          | `target`     | New target and stepper controls have labels, keyboard operability, focus-visible styling, and no lost button semantics.                                                  | component tests + screenshot review   | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same target and evidence.                                                                                     | component tests + screenshot review   | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: avoid dependency or meaningful client growth on private `/my-library/habits`.                                                                           | dependency/diff review                | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical habit definitions/check-ins, local timer state, and derived UI target labels stay separated.                                                            | data contract + tests                 | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no new cache path; existing write-through snapshot refresh stays unchanged.                                                                             | diff review                           | `4/5`                   |
| Reliability and failure handling              | `target`     | Invalid unsupported target inputs still fail through existing validation; UI does not offer unsupported persisted units.                                                 | unit/route tests                      | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: existing authenticated owner-scoped APIs remain unchanged; no new protected route.                                                                      | route diff review                     | `4/5`                   |
| Privacy and compliance                        | `target`     | Private habit titles/labels are not added to analytics/logs/public surfaces; support docs keep sensitive-habit handling.                                                 | diff review + support docs            | `5/5`                   |
| Content governance                            | `target`     | Parent, queue, inventory, user-flow map, and support runbook reflect active target semantics and future `litres` boundary.                                               | docs diff + `lint:briefs`             | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, recovery action, queue, or editability behavior changes.                                                                            | explicit admin-workflow rationale     | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private/authenticated and no metadata, sitemap, robots, canonical URL, or structured data changes.                                   | private-route rationale               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no crawl-safe public entity, structured data, public docs surface, or AI-facing content changes.                                                             | AI-discoverability scope rationale    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics taxonomy change; future target analytics would need safe typed payload mapping.                                                            | diff review                           | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, entitlement, invoice, refund, payout, catalog, or revenue operation changes.                                                            | commerce scope rationale              | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs explain Done-only/Any amount, specific count targets, and the `litres` migration boundary.                                                                  | runbook diff                          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no billing provider data, invoice/refund path, payout, finance report, entitlement truth, or revenue data changes.                             | explicit finance scope rationale      | `N/A`                   |
| i18n operational readiness                    | `target`     | Target labels and row actions avoid fixed-width assumptions and keep long labels from overflowing compact cards.                                                         | screenshot review + component tests   | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `HabitPerfectDayHub`, existing Habits helpers, My Library tokens, lucide icons, and no new dependency.                                                             | diff/dependency review                | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused Habits unit/route tests, `lint:briefs`, `git diff --check`, and screenshot handoff pass before pre-PR gate.                                                      | command output + screenshot artifacts | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new storage table, dependency, background job, or unbounded query; future units require explicit mapping.                                            | data/diff review                      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration means rollback is normal revert; if visual approval fails, patch can be revised before pre-PR/PR.                                                           | branch diff + validation plan         | `5/5`                   |

## Checkpoint Log

- `2026-06-04 | in-progress | recovered after previous chat tool-call failure; branch is clean at main@30ac208 and owner asked to continue safely to screenshot approval; created active Child F brief with H-019/H-021/H-022/H-023/H-024 scope | next: update parent/queue/inventory/docs, implement HabitPerfectDayHub target and row ergonomics, run targeted validation, then capture screenshot handoff`
- `2026-06-04 | in-progress | owner confirmed the blue Habits week-bar container is intended to support swipe and flagged non-responsive day/week navigation plus header pills falling below the heading; added H-025/H-026 to Child F scope; targeted HabitPerfectDayHub test is green at 43/43 after implementation | next: update parent/queue/inventory docs, run broader targeted validation, then capture screenshot handoff`
- `2026-06-04 | in-progress | owner approved recommended split: include Details action hierarchy in Child F and defer midnight auto-complete; Finish is now primary/blue and ordered before Rest day/Reset, while auto-complete remains a future data-integrity brief because current completion is derived from saved check-ins only | next: update parent/queue docs, rerun targeted validation, regenerate screenshot artifacts, and stop for owner approval`
- `2026-06-04 | screenshot approval | targeted Habits component test is green at 43/43, git diff whitespace check is clean, and screenshot artifacts were regenerated at output/habits-child-f-2026-06-04-180220 after removing temporary capture files; no scoped product rendering files changed after this capture | next: owner screenshot review before npm run verify:pre-pr`
