# Task Brief: Pool Swim Builder Step Authoring Parity (10/10)

## Metadata

- `id`: `2026-04-07-pool-swim-builder-step-authoring-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-07`
- `updated`: `2026-04-07`

## Goal

FreeSwimming's manual `pool` step editor should read like a dedicated Garmin-style pool workout authoring surface by tightening the remaining generic labels around stroke, timing, targets, and step notes without rewriting the canonical draft model.

## Why This Brief Exists

- The pool parity wave already shipped:
  - separate `Build pool session` and `Build open water session` entry,
  - pool field-level wording cleanup,
  - repeat/final-rest parity,
  - documented compatibility guards,
  - supported stroke/drill readiness mapping,
  - truthful equipment review wording.
- `origin/main` now shows a half-completed pool step editor:
  - `Step type`, `Drill type`, `Open swim`, `Rest time`, and `Step note` are already present in pool mode,
  - but pool mode still exposes generic labels such as `Stroke pattern`, `Duration mode`, `Target mode`, and `Target notes`.
- Garmin's documented pool-workout creator language is more specific around:
  - swim/open/time/rest step timing,
  - send-off timing,
  - stroke/drill separation,
  - and `Add Step Note`.
- This slice exists to finish that remaining wording pass in the pool-only step editor without destabilizing saved workouts.

## Dependencies And Boundaries

- Parent parity direction:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-parity-10-10.md`
- Shipped prerequisite slices:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-field-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-repeat-rest-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-compatibility-guards-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-swim-builder-supported-strokes-and-drills-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-swim-builder-equipment-compatibility-truthfulness-10-10.md`
- Primary implementation surfaces:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`
- Official parity references:
  - Garmin Support: `Pool Swim Workout Enhancements`
  - Garmin Support: `Using Pool Swim Workouts`

## Product Direction Locked By This Brief

- This slice is `pool`-only wording/authoring parity work.
- `Open water` must keep the current separate non-parity path and generic labels in this slice.
- The canonical workout draft schema stays unchanged.
- The builder may keep non-Garmin-supporting fields internally where needed, but the pool editor should describe them in Garmin-familiar language wherever a direct wording fit exists.
- This slice favors truthful UI terminology and small contextual help over hidden transformation or aggressive field removal.

## Step Authoring Decisions Locked By This Slice

1. Pool stroke wording:
   - the pool step editor should say `Stroke`, not `Stroke pattern`.
   - helper copy should use the same wording.
2. Pool timing wording:
   - the pool step editor should say `Step timing`, not `Duration mode`.
   - manual pool options should read as explicit pool step/timing concepts:
     - `Distance swim`
     - `Time-based swim`
     - `Rest time`
     - `Open swim`
     - `Send-off time`
     - `CSS send-off`
   - pool time-entry labels should distinguish swim time from rest time.
3. Pool target wording:
   - the pool step editor should say `Target`, not `Target mode`.
   - any remaining target-choice labels should read like pool-authoring cues, not generic engine modes.
4. Step note truthfulness:
   - the visible pool note field should remain `Step note`.
   - the adjacent summary field should stop pretending to be a second note surface and instead read as a short summary/cue field.
   - pool UI copy should make it clear that `Step note` is the closest match to Garmin's documented `Add Step Note`.
5. Scope limit:
   - do not remove canonical fields from persisted workout drafts in this slice.
   - do not add migrations or change API payload versions.
   - do not rewrite repeat logic or Garmin readiness logic again here.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                     | Evidence                              |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Product goals and IA                          | `target`     | Pool step editing surfaces explicit swim-workout wording so a Garmin-familiar swimmer no longer has to mentally translate generic builder terms.                 | manual QA + targeted tests            |
| UX flow clarity                               | `target`     | Pool step labels and helper copy distinguish stroke, timing, target, and step-note intent clearly without adding more clicks or hidden sub-flows.               | targeted tests + manual QA            |
| Accessibility (a11y)                          | `supporting` | Supporting only: renamed labels remain text-first, screen-reader legible, and tied to existing form controls.                                                    | label review + existing test harness  |
| Visual design quality                         | `supporting` | Supporting only: the step form still feels like the same editor and does not add noisy chrome for this wording pass.                                             | screenshot review + manual QA         |
| Business logic correctness and data integrity | `target`     | Pool step wording changes do not alter canonical payload shape, save semantics, or the persisted meaning of existing step fields.                                | unit coverage + code review           |
| Admin editor ergonomics                       | `target`     | The owner can keep authoring pool steps quickly because the wording matches the intended swim-workout mental model more closely.                                 | manual QA + targeted tests            |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: this slice stays in existing editor surfaces and does not materially change route payload or interaction cost.                                  | targeted review + verify              |
| Data placement and sync boundaries            | `target`     | The pool editor still writes to the same canonical workout draft shape with no alternate local-only step-authoring contract.                                     | brief contract + code review          |
| Caching and invalidation strategy             | `supporting` | Supporting only: no new cache boundaries are introduced because this is a client/editor wording slice on the existing save flow.                                 | scope review                          |
| Reliability and failure handling              | `target`     | Older saved workouts still load safely and keep the same editable values even though the pool editor labels become more specific.                                | regression tests + manual QA          |
| Security and authz                            | `supporting` | Supporting only: no auth boundary, route permission, or secret handling changes.                                                                                  | scope review                          |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes private workout-builder wording only and introduces no new personal-data path or disclosure behavior.                             | explicit scope rationale              |
| Content governance                            | `target`     | Garmin-like pool-step terminology stays centralized in one audited editor contract rather than drifting between UI labels and tests.                             | brief decisions + code review         |
| Admin workflow and editability                | `target`     | Pool-step editing stays reversible and familiar while internal field meaning remains intact under the renamed labels.                                            | unit coverage + manual QA             |
| SEO and crawlability                          | `N/A`        | N/A because authenticated My Library builder routes remain private and uncrawlable.                                                                               | explicit scope rationale              |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public metadata, public route, or AI-facing discoverability contract.                                                          | explicit scope rationale              |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics contract changes are needed because this slice is wording and helper-copy only.                                                    | scope review                          |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, billing, or purchase workflow changes.                                                                                       | explicit scope rationale              |
| Incident response and support operations      | `N/A`        | N/A because no Help/Guide or runbook currently references these internal pool-step labels directly, so this slice does not change operator recovery procedures. | explicit scope rationale              |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payout, billing, or reporting behavior changes.                                                                            | explicit scope rationale              |
| i18n operational readiness                    | `N/A`        | N/A because this slice adjusts centralized English pool-step wording only and keeps later localization work possible.                                             | explicit scope rationale              |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing pool/editor component and shared draft helpers; do not add a new dependency or alternate editor path.                                         | dependency diff + architecture review |
| Testing and QA automation                     | `target`     | Targeted unit/e2e coverage protects the renamed pool step labels and helper text before PR update, and `npm run verify:pre-pr` passes on the final diff.        | tests + `verify:pre-pr`               |
| Scalability and cost efficiency               | `supporting` | Supporting only: the slice remains a small wording/editor pass with no extra writes, queries, or background jobs.                                                | code review                           |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice stays fully reversible as a UI/text-only change with no schema migration.                                                             | diff review + rollback note           |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`
  - canonical saved workout drafts and their step arrays
- Local-only:
  - current editor open/closed step state
  - transient unsaved field edits before save
- Sync policy:
  - renamed pool labels map onto the same canonical draft fields as before
  - save/reopen must preserve the exact same stored values
  - no background conversion job or hidden migration runs in this slice
- Retention and sensitivity:
  - no new sensitive data class
  - no new persisted parity metadata
- Cache/invalidation:
  - existing save/refresh boundaries remain authoritative
  - label changes must not create new invalidation rules

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only stable workout identity.
- Human-readable identifiers:
  - labels such as `Step timing`, `Stroke`, `Target`, `Target summary`, and `Step note` are mutable UI wording, not canonical identifiers.
- Mutability rules:
  - pool editor wording can change in place.
  - persisted step values retain their current canonical enum/value identities in this slice.
- Rename vs repurpose policy:
  - label changes are in-place wording refinements, not a repurposing of the saved workout entity.
- Compatibility contract:
  - old saved workouts remain editable without any migration.

## Scope

- Finish the remaining Garmin-style wording cleanup inside the manual `pool` step editor.
- Tighten pool-only helper copy around stroke, drill type, timing, target, and step note semantics.
- Keep existing saved drafts compatible and keep open-water wording unchanged.
- Update targeted unit/e2e assertions that cover manual `pool` step authoring labels.

## Out Of Scope

- Schema changes or new migrations
- New save-blocking validation rules
- Repeat/rest behavior changes
- Garmin readiness/export diagnostic rewrites
- Open-water authoring redesign
- Removal of canonical fields from the draft model

## Acceptance Criteria

1. Manual `pool` step editing says `Stroke`, `Step timing`, `Target`, `Target summary`, and `Step note`.
2. Manual `pool` timing options use explicit pool-step wording: `Distance swim`, `Time-based swim`, `Rest time`, `Open swim`, `Send-off time`, and `CSS send-off`.
3. Manual `pool` helper copy uses the same pool-step terms consistently and explains `Step note` as the closest match to Garmin's documented step-note concept.
4. Open-water and non-pool manual flows keep their current generic wording in this slice.
5. Existing save/reopen behavior and canonical payload shape stay unchanged.
6. Targeted unit/e2e coverage protects the new pool-step wording.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`
  - `tests/unit/workout-builder-hub.test.tsx`
- targeted Playwright
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be available on the validation machine.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3100/my-library`
  - desktop Chromium during implementation
- Vercel preview:
  - PR preview URL from checks

## Constraints

- Keep the slice additive and backward-compatible.
- Prefer pool-only wording branches over shared label churn when open-water still uses the generic builder.
- Do not imply stronger Garmin parity than the documented sources support.

## Help/Guide And Operator Training Contract

- `N/A` for this slice because no Help/Guide or runbook contract currently cites the internal pool-step labels being renamed here.
- If implementation uncovers a public/operator-facing help surface that already names these labels, update it in the same PR before merge.

## 10/10 Quality Bar

- Pool step editing should feel intentionally specific, not partially renamed.
- Required states:
  - loading: unchanged existing builder loading behavior
  - empty: the first pool step still opens/editors safely
  - error: invalid saved drafts still fail through existing safe boundaries, not new wording-only crashes
  - retry/offline: existing save failure behavior remains unchanged
- Accessibility:
  - renamed labels remain attached to the same controls
  - helper text remains visible plain text rather than tooltip-only
- Performance:
  - wording changes stay cheap and local to the existing step editor
- Business logic:
  - identical pool draft data produces identical saved payloads before and after this slice
  - label changes must not silently rewrite existing step values

## Checkpoint Log

- `2026-04-07 | in progress | created a dedicated step-authoring parity slice after confirming on origin/main that entry split, field parity, repeat/rest, compatibility guards, stroke/drill readiness, and equipment truthfulness were already closed; the remaining visible Garmin gap is the pool-only step-editor wording around stroke, timing, targets, and step-note semantics | next: update WorkoutEditor pool labels/helper text, refresh targeted tests, and run pre-PR verification`
- `2026-04-07 | implementation + full pre-PR gate | tightened the manual pool step editor around the remaining Garmin-like wording (`Stroke`, `Step timing`, `Target`, `Target summary`, clarified `Step note`, and explicit pool timing option labels), updated targeted unit/e2e coverage, passed npm run lint:briefs:all, npm run typecheck, targeted vitest, targeted desktop-chromium Playwright, and a full npm run verify:pre-pr (96 passed / 318 skipped); the worktree had to use local copy-on-write copies of node_modules and .env.local because Turbopack rejected symlinks outside the worktree root during build | next: inspect final diff, commit, push, and open the PR`
- `2026-04-07 | pre-merge gate green | npm run verify:pre-merge passed with 96 passed / 318 skipped, the private-gate leg was correctly skipped because SITE_LOCK_ENABLED!=1 in this local run, and all required GitHub checks for PR #382 finished green before merge | next: merge the feature PR and close out the brief`
- `2026-04-07 | merged + closeout | PR #382 merged to main as `989f34c`, the remote feature branch was deleted, and this brief moved to done to reflect the shipped pool step-authoring wording parity cleanup | next: none`
