# Task Brief: AW-006 Habits Persisted Litres Unit Migration (10/10)

## Metadata

- `id`: `2026-06-05-aw-006-habits-persisted-litres-unit-migration-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-05`
- `updated`: `2026-06-05`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-habits-litres-unit-migration`
- `execution_mode`: `end-to-end after owner explicitly approved`
- `resolved_findings`: `H-019` persisted `litres` unit boundary when implemented and validated
- `deferred_findings`: `H-005`, `H-006`, `H-010` remaining advanced motivation/reminders/export/history gaps, `H-028`
- `return_checkpoint`: update the parent brief before this child can be closeout-ready
- `next_return_target`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-05`
- `base`: `main@05b52ce3`
- `audit_status`: `ready`
- `decision`: Execute the persisted `litres` unit migration now as the next selected Habits child.
- `reason`: `main` is clean and synced after My Library Calendar Period Comparison PR `#989` and repo-managed closeout PR `#990`; post-merge preflight was reported green. Fresh audit found `litres` still blocked by `HABIT_UNIT_VALUES`, Habits add/edit unit options, support docs, and the Supabase `habit_definitions.target_unit` check constraint. The owner explicitly selected this scope and asked for end-to-end implementation.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, Habits API routes, `habit_definitions.target_unit` constraints, `types/database.ts`, Supabase migration conventions, user export payload shape, Help/Guide/support wording, screenshot handoff rules, route/label/support sweep rules, or verification lanes change before execution.

## Goal

Allow Habits users to create, edit, save, display, and support specific count targets in `litres` without weakening unit validation or changing unrelated habit behavior.

## Pre-Implementation Owner Explanation

Vi gjor `litres` til en ekte lagret Habits-enhet, slik at vannmaal kan lagres og vises aerlig i appen.

Hvorfor det betyr noe: appen skal ikke foresla eller omtale en enhet som databasen egentlig ikke kan lagre. Dette er en liten, men viktig tillits- og datakvalitetsfix.

Utenfor scope er lyd, bruker-valgt lyd, midnight auto-complete, glass-til-liter-konvertering, historikkdashboard, habit score, best streak, reminders, eksportendringer utover at eksisterende eksport leser den lagrede enheten, og serverlagrede preferanser.

Fremoverkompatibilitet: nye Habits-enheter skal gaa gjennom database-constraint, typed mapping, UI-valg, formattering, supporttekst og tester. Ukjente enheter skal fortsatt feile lukket eller falle til umapped/null, ikke telles som en kjent verdi.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Security and authz`
- `Reliability and failure handling`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                   | Evidence                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Habits specific count setup supports `litres` where users already expect water-style quantity targets, without changing route purpose or navigation.                                 | brief scope + screenshots + docs diff           | `5/5`                   |
| UX flow clarity                               | `target`     | Add/edit habit users can select `litres`; saved rows render singular/plural labels clearly with no stale future-migration copy.                                                      | component tests + screenshot handoff            | `5/5`                   |
| Visual design quality                         | `target`     | The added unit option fits the existing select/dropdown and row display without layout overflow on mobile/desktop.                                                                   | screenshot handoff + text-fit review            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | `litres` is accepted by TS validation and database constraint; unsupported units are still rejected/fail closed; existing units keep behavior.                                       | migration review + domain/route/component tests | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this child changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                                                     | explicit admin-editor scope rationale           | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Unit select remains labelled/keyboard-safe; no new unlabeled controls or inaccessible status output are introduced.                                                                  | component assertions + screenshot/manual QA     | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same threshold and evidence.                                                                                              | component assertions + screenshot/manual QA     | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: this adds no dependency and only one string value/migration; `/my-library/habits` payload and JS cost should not materially change.                                 | dependency diff + broad gate                    | `4/5`                   |
| Data placement and sync boundaries            | `target`     | `target_unit = litres` is server-canonical on `habit_definitions`; local drafts only hold unsaved form state; check-ins remain numeric values with the habit unit as context.        | data contract + tests                           | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: preserve authenticated dynamic Habits route and existing mutation snapshot refresh behavior.                                                                        | route/API diff review                           | `4/5`                   |
| Reliability and failure handling              | `target`     | Schema-missing or unsupported-unit failures remain explicit; no silent coercion from `litres` to `custom`, `glasses`, or `times`.                                                    | negative-path tests + schema/migration review   | `5/5`                   |
| Security and authz                            | `target`     | Protected Habits APIs remain fail-closed and owner-scoped; this unit expansion introduces no cross-user mutation path.                                                               | existing route auth tests + changed-path review | `5/5`                   |
| Privacy and compliance                        | `target`     | Habit titles/health-adjacent hydration data remain private; no raw habit names or sensitive values are added to public UI, logs, or analytics.                                       | privacy/analytics diff review                   | `5/5`                   |
| Content governance                            | `target`     | Parent, queue, inventory, user-flow map, support runbook, and child brief accurately reflect that persisted `litres` is now shipped.                                                 | docs diff + brief lint                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this child changes no admin workflow labels, support queue, admin notes behavior, or operator actions.                                                                   | explicit admin-workflow scope rationale         | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private/authenticated and this child changes no public metadata, sitemap, robots, canonical URL, or structured data.                             | private-route SEO rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this child changes no crawl-safe public entity model, structured data, AI-facing page copy, or public docs surface.                                                      | AI-discoverability scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing Habits analytics semantics stay stable; no raw habit/unit values beyond existing safe event shape should be added.                                         | analytics diff review                           | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this child changes no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue flow.                                                          | commerce scope rationale                        | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs explain `litres` as a supported persisted unit and keep diagnostics for unsupported/impossible unit values.                                                             | runbook diff                                    | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this child changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation. | explicit finance scope rationale                | `N/A`                   |
| i18n operational readiness                    | `target`     | `litre`/`litres` copy remains short, singular/plural safe, and routed through unit formatting rather than scattered ad hoc strings where practical.                                  | unit formatter tests + screenshot review        | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Habits domain helpers, Supabase migration discipline, generated types, existing API routes, current UI tokens, and current test stack; add no dependency.                      | code/dependency diff review                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused domain/route/component coverage plus migration/type/doc lint and required broad gates before PR/merge.                                                                   | Vitest + `lint:briefs` + `verify` gates + CI    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: this adds one enum-like text unit and no new table, index, polling, or unbounded query.                                                                             | migration/query diff review                     | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Migration is additive and rollback is documented; generated types stay in sync with the schema shape used by app/tests.                                                              | migration file + rollback notes + broad gates   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: `/my-library/habits` and `HabitPerfectDayHub`.
  - Preserve route boundaries and existing API endpoints.
  - UI change is limited to unit option/display copy.
- TypeScript/domain:
  - Update `HABIT_UNIT_VALUES`, `HabitUnit`, target validation, unit formatting, and fixtures.
  - Unknown units must not normalize to `litres`.
  - Tests must cover accepted `litres` and rejected unknown units.
- Supabase/data:
  - Add an explicit migration that replaces the `habit_definitions.target_unit` check constraint with `litres` included.
  - RLS/authz stays unchanged.
  - Generated DB types are structurally unchanged because the column remains `text`; no enum type exists.
- UI system:
  - Reuse existing `ui-field`, `NumberStepperField`, and Habits token/action classes.
  - Screenshot handoff type: `after/reference` or `before/after` for Habits add/edit unit selection and saved row display.
- Testing:
  - Unit/domain: `tests/unit/habits.test.ts`.
  - Route/API: `tests/unit/habits-routes.test.ts`.
  - Component: `tests/unit/habit-perfect-day-hub.test.tsx`.
  - Docs/brief lint and broad verification gates before PR/merge.

## Data Placement And Sync Contract

- Server-canonical:
  - `habit_definitions.target_unit = litres` for saved habit definitions.
  - `habit_check_ins.value_numeric` remains the numeric check-in value; the habit definition provides the display unit.
- Local-only:
  - add/edit habit draft state before save.
  - current local timer state remains untouched and unrelated.
- Sync policy:
  - create/update mutations continue through existing Habits API routes and return refreshed snapshots.
  - failed saves must not locally pretend that an unsupported unit was accepted.
- Retention and sensitivity:
  - hydration/nutrition habit labels and check-ins remain private authenticated data.
  - no new public pages, raw logs, or analytics payloads.
- Cache/invalidation:
  - preserve existing authenticated dynamic/no-store Habits snapshot behavior.

## Identity And Rename Contract

- Canonical stable ID:
  - `habit_definitions.id` remains the stable identity for definitions, check-ins, local timer recovery, support diagnosis, and exports.
- Human-readable identifiers:
  - habit title stays editable and is not a route or analytics identity.
  - `litres` is a typed display/storage unit, not identity.
- Mutability:
  - target unit remains editable on Today through existing edit flow.
- Rename vs repurpose:
  - changing a habit from `glasses` to `litres` keeps history attached because existing check-ins are numeric and unit context is read from the current habit definition.
  - automatic conversion between units is explicitly out of scope.
- Compatibility:
  - existing `times`, `minutes`, `seconds`, `steps`, `pages`, `glasses`, and `custom` rows remain valid.
  - unknown legacy units continue to fail closed/null in view normalization.
- Observability and repair:
  - support should diagnose impossible units through `habit_definitions.target_unit` and schema/migration state, without asking for private habit names.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Habits target units, labels, validation, support copy, route payloads, calendar/report summaries, and export payload values.
- Source of truth:
  - supported units derive from `HABIT_UNIT_VALUES` plus the Supabase constraint.
- Additive behavior:
  - newly created and edited count habits can use `litres` immediately after migration.
  - existing report/calendar/export readers pass through the stored unit/value without a new schema column.
- Explicit mapping requirements:
  - any future unit, for example `ounces` or `millilitres`, requires migration, typed mapping, formatter copy, UI option, tests, and support docs.
  - any future unit conversion requires a separate product/data migration decision.
- Unknown or deprecated values:
  - unsupported payload units remain rejected by route/domain validation.
  - unknown stored units normalize to null/generic fallback and must not be counted as a known unit.
- Test/evidence:
  - accepted `litres` fixtures plus unsupported unit negative path.

## Help / Guide Impact

Required because member-facing setup semantics and support diagnosis change:

- update `docs/user-flow-map.md` so `litres` is listed as supported, not future.
- update `docs/runbooks/auth-account-support.md` so support can promise persisted `litres` after migration and still diagnose unsupported units.
- no admin Help Center update is required because no admin workflow label or operator action changes.

## Scope

- `supabase/migrations/`
- `lib/habits/shared.ts`
- `components/my-library/habits/HabitPerfectDayHub.tsx`
- `tests/unit/habits.test.ts`
- `tests/unit/habits-routes.test.ts`
- `tests/unit/habit-perfect-day-hub.test.tsx`
- `docs/user-flow-map.md`
- `docs/runbooks/auth-account-support.md`
- Habits parent, AW-006 queue, and design inventory lifecycle docs.

## Out Of Scope

- Micro Sessions or Habits audio.
- User-selected sounds or sound uploads.
- Midnight auto-complete or background check-in creation.
- Glass-to-litres conversion or historical unit conversion.
- Habit score, best streak, notes, reminders, exports redesign, global calendar storage, or month/year heatmaps.
- New dependencies, server-stored preferences, analytics taxonomy changes, Stripe, auth, admin, finance, public SEO, or native app changes.

## Acceptance Criteria

1. Supabase migration allows `habit_definitions.target_unit = 'litres'` while preserving all existing valid units and RLS/authz behavior.
2. `HABIT_UNIT_VALUES`, domain normalization, create/update payloads, and view mapping accept `litres`.
3. Habits add/edit specific count and avoidance unit dropdowns expose `litres` where practical for hydration/quantity targets.
4. Singular/plural labels render as `litre` / `litres` in target labels, row values, summaries, and relevant tests.
5. Unsupported units are still rejected before write or normalized safely when read from legacy data.
6. Existing `glasses`, `times`, `steps`, `pages`, `custom`, `minutes`, and `seconds` behavior does not regress.
7. User-flow/support docs no longer say `litres` is future-only.
8. Parent, AW-006 queue, and design inventory record the active/done state accurately.
9. Screenshot handoff is delivered before `npm run verify:pre-pr` because this changes visible UI.

## Route / Label / Support Surface Sweep

Required before broad gates. Search terms:

- `/my-library/habits`
- `litres`
- `litre`
- `glasses`
- `custom`
- `HABIT_UNIT_VALUES`
- `target_unit`
- `Specific count`
- `Done only`
- `Any amount`
- `HabitPerfectDayHub`
- `docs/runbooks/auth-account-support.md`
- `docs/user-flow-map.md`

Surfaces:

- `app/`
- `components/`
- `lib/habits/`
- `tests/`
- `docs/task-briefs/`
- `docs/design/`
- `docs/runbooks/`
- `supabase/migrations/`
- `types/database.ts`

Evidence:

- `identifiers searched`: `/my-library/habits`, `litres`, `litre`, `glasses`, `custom`, `HABIT_UNIT_VALUES`, `target_unit`, `Specific count`, `Done only`, `Any amount`, `HabitPerfectDayHub`, `docs/runbooks/auth-account-support.md`, and `docs/user-flow-map.md`.
- `surfaces checked`: `app/`, `components/`, `lib/habits/`, `tests/`, `docs/task-briefs/`, `docs/design/`, `docs/runbooks/`, `docs/user-flow-map.md`, `supabase/migrations/`, and `types/database.ts`.
- `fallout handled`: current user-flow/support copy now lists `litres` as supported; parent, AW-006 queue, and design inventory point at done Child H after closeout; historical done-brief references intentionally remain as past-scope evidence.

## UI Screenshot Evidence

- `screenshot artifacts`: `output/habits-litres-unit-migration-2026-06-05-094124`.
- `comparison type`: `after/reference`.
- `owner screenshot approval`: owner approved the screenshot handoff on `2026-06-05` before `npm run verify:pre-pr`; owner also waived regenerating screenshots for the later capitalization-only dropdown-label polish.
- `accessibility and responsive evidence`: changed unit options remain native `select` options with stable lowercase values and capitalized visible labels; screenshots include desktop add, desktop details, desktop `glasses` reference, and mobile add form.

## Validation Plan

- Targeted:
  - `./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habits-routes.test.ts tests/unit/habit-perfect-day-hub.test.tsx`
  - `npm run lint:briefs`
  - route/label/support sweep
  - screenshot handoff for `/my-library/habits`
- Before PR:
  - `npm run verify:pre-pr`
- Before merge:
  - required CI green
  - `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-05 | in-progress | owner approved the persisted litres/unit migration end-to-end after deciding Micro Sessions Bubbles sound should be a later separate slice; branch aw-006-habits-litres-unit-migration created from clean main@05b52ce3 | next: implement migration/types/UI/tests/docs, run targeted validation, capture screenshot handoff, then stop for owner visual approval before verify:pre-pr`
- `2026-06-05 | in-progress | implemented Supabase constraint migration, typed unit mapping, Habits add/edit options, litre/litres formatter, route/domain/component tests, user-flow/support docs, parent/queue/inventory lifecycle updates; targeted Vitest passed 75/75, npm run lint:briefs:all passed 433/433, git diff --check passed, and route/support stale-copy sweep found only current supported-copy plus historical done-brief context | next: capture screenshot handoff and stop for owner visual approval before npm run verify:pre-pr`
- `2026-06-05 | screenshot-review | captured after/reference screenshot artifacts at output/habits-litres-unit-migration-2026-06-05-094124: desktop add form with Unit litres, desktop saved litres details, desktop glasses reference details, and mobile add form; local dev-login was blocked by the Supabase egress guard, so screenshots used a temporary seed-only dev preview rendering the production HabitPerfectDayHub component, and the preview files were removed before handoff | next: wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-05 | screenshot-approved | owner approved screenshot handoff, requested capitalized unit option labels, and explicitly said new screenshots were not necessary for that small dropdown-copy polish; visible labels are now capitalized while persisted values remain lowercase, targeted Habits Vitest still passed 75/75, and git diff --check passed | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-06-05 | pre-pr-fix | first npm run verify:pre-pr failed because the new Supabase migration was pending on the linked remote database; npx supabase db push --linked applied 20260605110000_habits_litres_unit.sql, and the rerun confirmed the linked remote is up to date before stopping on missing quality-gate evidence keywords now added above | next: rerun npm run verify:pre-pr`
- `2026-06-05 | pre-pr-pass | npm run verify:pre-pr passed full lane after remote migration + quality-gate fixes; evidence: artifacts/test-runs/20260605-135424/verify.log, E2E 106 passed / 530 skipped, and terminal marker [verify-open] PASS | next: commit scoped diff, push, open PR, monitor CI, then run npm run verify:pre-merge`

## Completion Record

- `completed`: `2026-06-05`
- `merged_pr`: `#991`
- `squash_commit`: `7b7ad72c9521e4130a7626cf17224a0bd6e4c987`
- `result`: Closed AW-006 Habits Persisted Litres Unit Migration. Habits can now save, edit, validate, display, and support `litres` as a real persisted unit instead of treating it as future-only copy.
- `validation`: Targeted Habits Vitest 75/75 passed; `npm run lint:briefs:all` passed; `npm run verify:pre-pr` passed full lane at `artifacts/test-runs/20260605-135424/verify.log`; PR `#991` CI passed `verify`, `e2e-smoke`, `site-lock-smoke`, `deploy-preview`, `size-check`, CodeQL, Vercel, and Vercel Preview Comments; `npm run verify:pre-merge` passed with marker `artifacts/verify-pre-merge/20260605-121654.json`.
- `10/10 claim`: yes - all critical target categories reached `5/5`; no release-blocking gaps remain for this slice.

| Category                                      | Achieved Score | Evidence                                                                              | Gaps / Notes                                                                                                  |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#991`, screenshot handoff, support/user-flow docs                                 | None.                                                                                                         |
| UX flow clarity                               | `5/5`          | Component tests and screenshot handoff                                                | None.                                                                                                         |
| Visual design quality                         | `5/5`          | Screenshot artifacts `output/habits-litres-unit-migration-2026-06-05-094124`          | Owner waived screenshot regeneration for capitalization-only dropdown-label polish.                           |
| Business logic correctness and data integrity | `5/5`          | Supabase migration, domain/route/component tests, pre-merge gates                     | None.                                                                                                         |
| Accessibility (a11y)                          | `5/5`          | Native labelled select/options preserved, component coverage, broad gates             | None.                                                                                                         |
| Accessibility                                 | `5/5`          | Same evidence as canonical `Accessibility (a11y)` row                                 | Lifecycle-lint alias only.                                                                                    |
| Data placement and sync boundaries            | `5/5`          | Server-canonical `habit_definitions.target_unit`, unchanged check-in numeric contract | No unit conversion; conversion remains intentionally out of scope.                                            |
| Reliability and failure handling              | `5/5`          | Unsupported unit negative paths and migration drift gate                              | None.                                                                                                         |
| Security and authz                            | `5/5`          | Existing owner-scoped protected Habits API tests plus unchanged RLS/authz paths       | None.                                                                                                         |
| Privacy and compliance                        | `5/5`          | No public/raw-log/analytics exposure added                                            | None.                                                                                                         |
| Content governance                            | `5/5`          | Parent, AW-006 queue, design inventory, support docs, and user-flow map updated       | This closeout moves the brief to done and clears active references.                                           |
| Incident response and support operations      | `5/5`          | `docs/runbooks/auth-account-support.md` updated for supported `litres` diagnostics    | None.                                                                                                         |
| i18n operational readiness                    | `5/5`          | Central formatter tests for `litre` / `litres`                                        | Broader locale translation remains out of scope.                                                              |
| Stack-fit and dependency discipline           | `5/5`          | Reused Habits domain helpers, existing UI controls, Supabase migration discipline     | No new dependency.                                                                                            |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, full `verify:pre-pr`, CI, and `verify:pre-merge`                     | Local auth-backed E2E flows skipped under known Supabase egress guard; CI smoke and local public lane passed. |
| DevOps and rollback readiness                 | `5/5`          | Additive migration, linked remote drift check, pre-merge marker, CI green             | None.                                                                                                         |
