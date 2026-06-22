# Task Brief: Habits Perfect Day Eligibility Clarity (10/10)

## Metadata

- `id`: `2026-06-22-habits-perfect-day-eligibility-clarity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-22`
- `updated`: `2026-06-22`
- `branch`: `habits-perfect-day-eligibility`
- `mode`: `bounded runtime implementation`

## Brief Audit Record

- `last_audited`: `2026-06-22`
- `base`: `main@48fbff4b`
- `audit_status`: `ready`
- `decision`: Execute a narrow Habits UI/data-contract clarity slice after the owner approved the recommendation to keep Perfect Day but make eligibility explicit.
- `reason`: The backend already stores `is_perfect_day_item` and Perfect Day calculations respect it, but Add/Edit habit UI does not expose the choice clearly and create currently always sends `isPerfectDayItem: true`.
- `must_refresh_before_execution_if`: Refresh if `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, Habits APIs, Calendar daily layers, Help/Guide copy, screenshot rules, scorecard categories, or route labels change before implementation completes.

## Goal

Make Perfect Day mean "all Perfect Day-counting habits scheduled for this date are satisfied" by exposing and preserving a clear per-habit `Counts toward Perfect Day` choice in Habits Add/Edit.

## Pre-Implementation Owner Explanation

Vi gjoer Perfect Day tydeligere: ikke alle habits maa telle. I Add/Edit Habit skal brukeren kunne velge om en habit teller mot Perfect Day, slik at rene tracking- eller mindre viktige habits ikke oedelegger dagen. Dette betyr noe fordi Perfect Day skal vaere et troverdig rutinesignal, ikke en tilfeldig sum av alt brukeren logger. Utenfor scope er Calendar-chip, Garmin/provider, bred Habits-redesign, nye databaser, performance-ratchet og `Ja.docx`.

## Product Rule

Perfect Day = all scheduled habits that count toward Perfect Day are satisfied for that date.

This does not mean:

- all habits in the app,
- swim completion,
- provider evidence,
- health/readiness score,
- Calendar-owned score,
- analytics KPI truth,
- AI replanning input.

## Current App Baseline

- `habit_definitions.is_perfect_day_item` already exists.
- `buildHabitDefinitionInsert` defaults missing `isPerfectDayItem` to `true`.
- `buildHabitDefinitionUpdate` supports explicit `isPerfectDayItem`.
- Perfect Day and catch-up candidate calculations already skip habits where `isPerfectDayItem` is false.
- `HabitPerfectDayHub` Add form currently has no explicit user control and hardcodes `isPerfectDayItem: true`.
- `HabitPerfectDayHub` Edit form does not expose or send `isPerfectDayItem`.
- Micro Session-backed habits can already be `is_perfect_day_item: false` in route tests.

## Scope

- Add `isPerfectDayItem` to the local Add/Edit habit draft.
- Add a clear binary control in Add/Edit:
  - label: `Counts toward Perfect Day`,
  - default on for newly created habits,
  - off means tracking-only for Perfect Day math.
- Send `isPerfectDayItem` on create and update.
- Preserve existing server default and stored values.
- Add focused component tests for default-on create, opt-out create, and edit payload preservation.
- Update user-flow/support docs to state that Perfect Day counts only selected eligible habits.
- Update the product-decision brief checkpoint to record owner selection.

## Out Of Scope

- Calendar Perfect Day chip or Calendar UI change.
- Changing Perfect Day algorithm beyond using the existing `isPerfectDayItem` field.
- New Supabase migration or generated DB types.
- Provider/Garmin/Apple/Strava/Health Connect integration.
- Micro Session source-backed habit semantics beyond preserving current behavior.
- Broad Habits visual redesign.
- Performance-ratchet changes.
- PR merge approval.
- Touching `Ja.docx`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Accessibility (a11y)`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                              | Evidence                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Add/Edit Habits clearly define whether a habit counts toward Perfect Day without changing Calendar ownership.                                                   | UI diff + tests + user-flow doc                     | `5/5`                   |
| UX flow clarity                               | `target`     | Users can create/edit a tracking-only habit without reading docs, and Perfect Day copy stays concise.                                                           | component tests + screenshot handoff                | `5/5`                   |
| Visual design quality                         | `target`     | New binary control fits existing Habits form density, tokens, responsive layout, and avoids text overflow.                                                      | screenshot handoff                                  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Create/update payloads preserve `isPerfectDayItem`; false remains false and is not silently reset to true.                                                      | focused component tests + existing server contract  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is a member-facing Habits form slice and changes no admin editor or publish workflow.                                                          | admin non-scope rationale                           | `N/A`                   |
| Accessibility (a11y)                          | `target`     | The new binary setting has a keyboard-accessible checkbox, clear accessible name, and no serious/critical semantic regression.                                  | component query by label + screenshot/manual review | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: one small form control should not materially change route payload; full budget gate remains pre-PR.                                            | changed-files review + later `verify:pre-pr`        | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Habits remains source-of-truth; Calendar and provider evidence cannot write Perfect Day results.                                                                | data contract + docs                                | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing authenticated Habits refresh/apply-response behavior remains unchanged.                                                               | code review                                         | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing/unknown values continue to default safely through server contract; UI does not remove existing recovery/error behavior.                                 | focused tests + existing server tests               | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no new route or auth boundary; existing protected Habits APIs still own mutation.                                                              | changed-files review                                | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new private notes, provider data, sensor data, or analytics identifiers are exposed.                                                        | payload/copy review                                 | `4/5`                   |
| Content governance                            | `target`     | Product-decision and user-flow docs agree that Perfect Day counts only selected habits and Calendar remains read-only/out of scope.                             | docs diff                                           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, actions, Help/Guide admin flows, or operator editability change.                                                          | admin workflow non-scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is authenticated/private and no public metadata, sitemap, robots, canonical URL, or structured data changes.                   | private-route rationale                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this private Habits form change creates no public AI-discoverable content or structured public entity.                                              | AI/public-surface non-scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy changes; eligibility must not become KPI truth without future mapping.                                             | changed-files review                                | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no checkout, pricing, entitlements, catalog, Stripe, invoices, refunds, payouts, or paid-access truth.                                 | commerce non-scope rationale                        | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: user-flow copy gives support a clear explanation if a habit does not count toward Perfect Day.                                                 | docs/user-flow update                               | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data. | explicit finance scope rationale                    | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new English labels are simple and future-localizable; no locale system change.                                                                 | copy review                                         | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `HabitPerfectDayHub`, existing Habits API payload field, TypeScript contracts, Tailwind tokens, and add no dependency.                                    | package diff + code review                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused Habits tests pass, brief lint passes, screenshot handoff is captured before pre-PR, then required gates run after owner visual approval.                | test commands + screenshot artifacts                | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new query or table; uses existing boolean field in existing payload.                                                                        | code review                                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff is reversible by normal git revert with no migration, env, provider, dependency, or workflow changes.                                                      | git diff + validation                               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `HabitPerfectDayHub` as the mature Habits reference surface.
  - Keep Add/Edit as client-side form state posting to existing Habits APIs.
  - No route boundary or server component changes.
- TypeScript/domain contracts:
  - Extend local `HabitDraft` to include `isPerfectDayItem`.
  - Reuse existing `HabitDefinitionView.isPerfectDayItem` and `isPerfectDayItem` API payload.
  - False must remain false through edit.
- Supabase/data layer:
  - No migration; existing `habit_definitions.is_perfect_day_item` remains server-canonical.
  - Existing RLS/authz and route handlers stay unchanged.
- External services:
  - N/A; no provider, analytics vendor, email, Stripe, Garmin, or AI SDK changes.
- UI system:
  - Use a checkbox/toggle-style setting inside existing form grid.
  - Keep labels compact and aligned with existing `habitLabelClass`, `habitFieldClass`, and token spacing.
  - Screenshot handoff required because visible Habits UI changes.
- Testing:
  - Update focused `habit-perfect-day-hub` component tests.
  - Use existing server tests as contract evidence; add route tests only if server behavior changes.

## Domain Granularity Gate

- User's mental object:
  - a habit definition and whether it participates in the user's Perfect Day.
- Canonical objects:
  - `habit_definitions.id` with `is_perfect_day_item`.
  - `habit_check_ins.id` for daily evidence.
  - `habit_motivation_resets.id` for stat reset boundaries.
- Child object levels:
  - habit definition: `view`/`edit` for eligibility in Add/Edit;
  - check-in: `view`/`edit` unchanged by existing Habits controls;
  - motivation summary: `view` unchanged;
  - Calendar daily layer: `out of scope`;
  - provider evidence: `out of scope`.
- Mature reference surface:
  - `HabitPerfectDayHub` Add/Edit form and Motivation section.
- Granularity decision:
  - Active slice edits only the habit-definition eligibility flag.
  - It does not edit check-ins, reset markers, Calendar rows, or provider evidence.
- Child-structure rule:
  - Not a summary-only change; the trusted object is the habit definition, and Add/Edit exposes the boolean at that level.

## Data Placement And Sync Contract

- Server-canonical:
  - `habit_definitions.is_perfect_day_item`.
- Local-only:
  - unsaved Add/Edit draft value.
- Sync policy:
  - Create sends the selected value.
  - Edit initializes from stored habit value and sends the selected value.
  - API response snapshot remains the source of truth after save.
- Conflict/failure policy:
  - Existing API failure handling remains.
  - Missing payload continues to default server-side to `true` for backward compatibility.
- Retention and sensitivity:
  - Eligibility is private routine metadata and follows habit definition retention.
- Cache/invalidation:
  - Existing dynamic/private Habits route and apply-response refresh behavior remain unchanged.

## Identity And Rename Contract

- Canonical stable ID:
  - habit ID.
- Human-readable identifiers:
  - habit title remains renameable presentation text.
  - `Counts toward Perfect Day` is a setting label, not identity.
- Mutability:
  - eligibility can be changed on Today through existing Edit habit setup rules.
- Rename vs repurpose:
  - renaming a habit keeps eligibility and history.
  - repurposing a habit's intent should continue to use existing Habits policy; this slice does not change history semantics.
- Compatibility:
  - existing habits keep stored values.
  - old clients omitting the field still default to true server-side.
- Observability and repair:
  - tests lock false payload behavior so tracking-only habits are not reset into Perfect Day by edit.

## Forward Compatibility Contract

- Extensibility surfaces:
  - habit modes,
  - habit cadence rules,
  - source-backed habits,
  - future Calendar daily layers,
  - analytics events,
  - locale strings.
- Source of truth:
  - Habits owns eligibility.
  - Calendar may only read derived summaries in future.
- Additive behavior:
  - future habit modes can use the same boolean once their satisfaction rules are mapped.
- Explicit mapping required:
  - provider-backed habits,
  - Calendar chip display,
  - analytics KPI use,
  - automated replanning,
  - localized labels.
- Unknown/deprecated values:
  - unknown Habit states remain out of success counts through existing fail-closed behavior.
- Evidence:
  - focused create/edit payload tests and user-flow docs.

## Help / Guide And Support Impact

- Update `docs/user-flow-map.md` in this PR because a user-facing setup label changes.
- No admin Help/Guide update is required because this is a private member Habits form and existing support docs do not expose this specific setup field.
- Future Help/Guide update is required if Calendar later shows a Perfect Day chip.

## Route / Label / Support Surface Sweep

Identifiers to sweep:

- `Perfect Day`
- `My Perfect Day`
- `isPerfectDayItem`
- `is_perfect_day_item`
- `Counts toward Perfect Day`
- `tracking-only`
- `Add habit`
- `Edit this habit`
- `/my-library/habits`
- `/my-library/calendar`

Surfaces:

- `components/my-library/habits/`
- `lib/habits/`
- `tests/unit/habit-perfect-day-hub.test.tsx`
- `tests/unit/habits*.test.ts`
- `docs/user-flow-map.md`
- relevant task briefs

## Manual QA And Screenshot Contract

UI change: screenshot handoff is required before `npm run verify:pre-pr`, PR creation/update, and `npm run verify:pre-merge`.

Handoff type: `after/reference`, showing:

- Add Habit form with the new setting.
- Edit Habit form with the stored value visible.
- Reference Motivation/Perfect Day summary showing source ownership remains in Habits.

## Acceptance Criteria

1. Add Habit form exposes `Counts toward Perfect Day` and defaults on.
2. User can turn it off before create; create payload sends `isPerfectDayItem: false`.
3. Edit Habit form initializes from stored value and sends the selected value on save.
4. Existing Perfect Day/Motivation/catch-up semantics continue to rely on `isPerfectDayItem`.
5. Calendar behavior does not change.
6. Focused tests pass.
7. Screenshot handoff is captured and owner-approved before pre-PR gates.

## Validation

Targeted during implementation:

- `./node_modules/.bin/vitest run tests/unit/habit-perfect-day-hub.test.tsx`
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`

After screenshot approval:

- `npm run verify:pre-pr`
- GitHub CI
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-22 | in-progress | owner said "Ok gjør som anbefalt" after approving the recommendation to keep Perfect Day but make per-habit eligibility explicit; branch habits-perfect-day-eligibility created from clean main@48fbff4b carrying the planned product-decision brief | next: implement Add/Edit eligibility UI, update tests/docs, run targeted validation, then capture screenshot handoff and stop for owner visual approval`
- `2026-06-22 | implementation checkpoint | Add/Edit Habit now exposes Counts toward Perfect Day, create/update payloads preserve isPerfectDayItem, Motivation What counts copy and user-flow/API docs now define Perfect Day as scheduled Perfect Day-counting habits only; focused Vitest, lint:briefs:all, and git diff --check passed, while lint:briefs found no committed branch diff before commit | next: capture screenshot handoff and stop for owner visual approval before pre-PR gates`
- `2026-06-22 | screenshot checkpoint | screenshot handoff captured at output/habits-perfect-day-eligibility-2026-06-22-180142 using a temporary local visual harness because dev-login was blocked by local Supabase egress guard; harness/script were removed and only screenshot artifacts remain | next: owner visual approval, then run npm run verify:pre-pr before commit/push/PR`
- `2026-06-22 | owner screenshot approval stop satisfied | owner approved screenshot handoff in chat; no product-rendering files changed after capture | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, then run npm run verify:pre-merge for merge readiness`
- `2026-06-22 | pre-PR gate passed | npm run verify:pre-pr passed after the owner screenshot approval stop; route perf budgets passed, and the perf-budget tighten recommendation is held out of scope because the active performance-ratchet decision waits for two new green weekly cycles after 2026-06-19 | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge for merge readiness`
