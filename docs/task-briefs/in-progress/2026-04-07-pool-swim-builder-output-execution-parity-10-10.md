# Task Brief: Pool Swim Builder Output Execution Parity (10/10)

## Metadata

- `id`: `2026-04-07-pool-swim-builder-output-execution-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-07`
- `updated`: `2026-04-07`

## Goal

FreeSwimming's manual `pool` builder should describe step execution truthfully in its step cards, handoff text, PDF output, Garmin-ready export labels, and poolside note so the saved output matches the pool authoring language already shipped in the editor.

## Why This Brief Exists

- The pool parity wave already shipped:
  - separate `Build pool session` and `Build open water session` entry,
  - pool field parity,
  - repeat/final-rest parity,
  - compatibility guards,
  - supported stroke/drill readiness cleanup,
  - equipment truthfulness,
  - step-authoring wording parity.
- `origin/main` still shows a remaining half-parity gap after those slices:
  - the `pool` editor now says `Open swim`, `Rest time`, `Send-off time`, `Target summary`, and `Step note`,
  - but the derived output surfaces still say generic or stale terms such as `Lap button press`, `Fixed rest`, `Send-off`, `Target notes`, and `Notes`.
- This drift matters because a swimmer judges what the watch will actually do from:
  - the closed step-card summary,
  - handoff preview/export text,
  - PDF output,
  - Garmin-ready export preview,
  - poolside lines shown in cards and print views.
- The biggest execution mismatch is `lap_button`:
  - in `pool` mode it should read as `Open swim` for swim steps and `Open rest` for rest steps,
  - it should not be treated as a pause everywhere regardless of category.

## Dependencies And Boundaries

- Parent parity direction:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-parity-10-10.md`
- Shipped prerequisite slices:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-compatibility-guards-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-repeat-rest-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-swim-builder-step-authoring-parity-10-10.md`
- Primary implementation surfaces:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`
- Official parity references:
  - Garmin Support: `Pool Swim Workout Enhancements`
  - Garmin Support: `Using Pool Swim Workouts`

## Product Direction Locked By This Brief

- This is a `pool`-only output/execution slice.
- `Open water` keeps its current non-parity wording and behavior in this slice.
- The canonical workout draft schema stays unchanged.
- Existing saved workouts must keep loading and saving without migration.
- This slice must make derived output surfaces match already-shipped pool authoring language rather than inventing a second translation layer.

## Output Execution Decisions Locked By This Slice

1. Pool timing labels stay synchronized across authored inputs and derived outputs.
   - `Distance swim`
   - `Time-based swim`
   - `Rest time`
   - `Open swim`
   - `Open rest`
   - `Send-off Time`
   - `CSS send-off`
2. `lap_button` is pool-truthful:
   - `Open swim` when the step is not a rest step,
   - `Open rest` when the step is a rest step,
   - poolside pause lines only use `P:` for actual pause/rest semantics.
3. Pool note/detail labels stay synchronized across authored inputs and exports:
   - `Target summary`
   - `Step note`
4. Garmin-ready export labels may become more pool-specific, but raw enum values must remain unchanged.
5. This slice may tighten output summaries and compact labels, but it must not silently reinterpret unsupported saved states into a different canonical meaning.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                  | Evidence                              |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Product goals and IA                          | `target`     | Pool output surfaces describe the same execution concepts as the pool editor, so the builder no longer presents one wording model while export/print shows another. | manual QA + targeted tests            |
| UX flow clarity                               | `target`     | A swimmer can distinguish `Open swim`, `Open rest`, `Rest time`, and `Send-off Time` in closed cards and support-tool outputs without mentally translating generic engine terms. | targeted tests + manual QA            |
| Accessibility (a11y)                          | `supporting` | Supporting only: output text remains plain readable text in existing cards/previews/PDF, with no icon-only semantics added.                                  | label review + existing test harness  |
| Visual design quality                         | `supporting` | Supporting only: output wording becomes clearer without adding noisy chrome or expanding support tools by default.                                            | screenshot review + manual QA         |
| Business logic correctness and data integrity | `target`     | Pool output wording changes must preserve the same canonical saved values while making `lap_button` and repeat-rest output semantics more truthful.          | unit coverage + code review           |
| Admin editor ergonomics                       | `target`     | Closed cards, support tools, and printouts should reinforce the same pool mental model as the editor instead of forcing the owner to translate outputs manually. | manual QA + targeted tests            |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: this slice stays inside existing helpers and previews without materially increasing route cost.                                              | targeted review + verify              |
| Data placement and sync boundaries            | `target`     | The pool output refinements reuse the existing canonical workout draft and export contracts; no alternate local-only output model is introduced.             | brief contract + code review          |
| Caching and invalidation strategy             | `supporting` | Supporting only: helper changes reuse current save/refresh boundaries and do not introduce a new cache or invalidation surface.                              | scope review                          |
| Reliability and failure handling              | `target`     | Legacy workouts and borderline step combinations still render safely, and pool outputs fail truthfully rather than mislabeling `lap_button` or note fields. | regression tests + manual QA          |
| Security and authz                            | `supporting` | Supporting only: no auth boundary, secret handling, or protected API contract changes.                                                                        | scope review                          |
| Privacy and compliance                        | `N/A`        | N/A because this slice only changes private workout-builder wording/output semantics and introduces no new personal-data or disclosure path.                 | explicit scope rationale              |
| Content governance                            | `target`     | Pool execution wording stays centralized in shared helper logic so editor outputs, handoff text, PDF, and export labels do not drift again.                 | brief decisions + code review         |
| Admin workflow and editability                | `target`     | The owner can trust handoff/PDF/export/poolside text as a faithful summary of the authored pool workout without a second manual translation pass.            | unit coverage + manual QA             |
| SEO and crawlability                          | `N/A`        | N/A because authenticated My Library/support-tool routes remain private and uncrawlable.                                                                      | explicit scope rationale              |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public route metadata, public content, or AI-facing discoverability contract.                                              | explicit scope rationale              |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics instrumentation change is required because this slice is internal wording/output alignment.                                     | scope review                          |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, billing, or subscription workflow changes.                                                                               | explicit scope rationale              |
| Incident response and support operations      | `N/A`        | N/A because no Help/Guide or runbook currently documents these private pool output labels directly; this slice changes no operator recovery procedure.      | explicit scope rationale              |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payout, billing, or reporting behavior changes.                                                                        | explicit scope rationale              |
| i18n operational readiness                    | `N/A`        | N/A because this slice adjusts centralized English pool-output wording only and keeps future localization possible.                                           | explicit scope rationale              |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing workout/shared helper stack and do not add dependencies or a parallel export model.                                                       | dependency diff + architecture review |
| Testing and QA automation                     | `target`     | Unit/e2e coverage must protect pool output wording, `Open swim` vs `Open rest`, and pool note labels before PR update, and `npm run verify:pre-pr` must pass. | tests + `verify:pre-pr`               |
| Scalability and cost efficiency               | `supporting` | Supporting only: the slice remains helper- and copy-level work with no extra writes, background jobs, or schema cost.                                      | code review                           |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this slice remains fully reversible as helper/UI output work with no migration.                                                             | diff review + rollback note           |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`
  - canonical saved workout drafts and step arrays
  - Garmin-ready export payload shape and PDF/handoff output generation
- Local-only:
  - current editor open/closed state
  - transient support-tool expansion state
  - unsaved step edits before save
- Sync policy:
  - this slice reads the same canonical draft fields as before
  - output wording is derived at render/export time from the existing saved values
  - no migration, background rewrite, or alternate shadow output store is introduced
- Retention and sensitivity:
  - no new sensitive data class
  - no new persisted parity metadata
- Cache/invalidation:
  - existing save/refresh boundaries remain authoritative
  - helper changes must not create a second invalidation contract

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only stable workout identity.
- Human-readable identifiers:
  - labels such as `Open swim`, `Open rest`, `Send-off Time`, `Target summary`, and `Step note` are mutable output wording, not canonical identifiers.
- Mutability rules:
  - output wording can change in place.
  - persisted step enums and saved values retain their current canonical identities in this slice.
- Rename vs repurpose policy:
  - this slice is wording and execution-summary truthfulness only; it is not a repurposing of the saved workout entity.
- Compatibility contract:
  - older workouts continue to load and export without migration.
  - unsupported legacy combinations must still render safely even when the pool wording becomes more specific.

## Scope

- Align pool-only execution wording across:
  - closed step cards
  - handoff preview/export text
  - PDF detail labels
  - Garmin-ready export labels and summaries
  - poolside preview/PDF lines
- Distinguish `Open swim` from `Open rest` in pool outputs.
- Keep open-water output wording unchanged.
- Update targeted unit/e2e coverage for the new pool-only output semantics.

## Out Of Scope

- Schema changes or new migrations
- New save-blocking validation rules
- Rewriting Garmin readiness policy again
- Open-water output redesign
- Reworking the broader pool builder IA
- Device-side execution claims beyond the documented pool authoring semantics

## Acceptance Criteria

1. Manual `pool` step cards and support-tool previews use the same execution language as the pool editor wherever those concepts overlap.
2. Pool outputs distinguish `Open swim` from `Open rest`.
3. Poolside pause lines only use `P:` for actual pause/rest semantics rather than every `lap_button` step.
4. Pool handoff/PDF detail labels say `Target summary` and `Step note`.
5. Garmin-ready export labels become pool-truthful without changing raw enum values or payload version.
6. Open-water wording and canonical saved draft shape remain unchanged.

## Validation

- `npm run lint:briefs:all`
- `npm run typecheck`
- targeted `vitest`
  - `tests/unit/workouts-shared.test.ts`
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
- Prefer shared helper alignment over sprinkling one-off wording branches throughout the UI.
- Do not imply stronger Garmin execution guarantees than the documented pool sources support.

## Help/Guide And Operator Training Contract

- `N/A` for this slice because no Help/Guide or runbook currently cites these private pool output labels directly.
- If implementation uncovers a public/operator-facing help surface that already names these outputs, update it in the same PR before merge.

## 10/10 Quality Bar

- Pool outputs should feel intentionally synchronized with the builder, not like a second generic translation layer.
- Required states:
  - loading: unchanged existing builder/support-tool loading behavior
  - empty: empty or one-step drafts still render safe summaries
  - error: malformed legacy drafts still fall through existing safe boundaries instead of crashing output builders
  - retry/offline: existing save/export failure behavior remains unchanged
- Accessibility:
  - labels remain visible plain text in previews/PDFs
  - poolside lines and handoff text remain keyboard-copyable text
- Performance:
  - helper changes stay cheap and synchronous in existing output builders
- Business logic:
  - identical saved drafts produce identical canonical values before and after this slice
  - only the wording/truthfulness of derived output changes
  - `lap_button` must not be mislabeled as a pause when the authored pool step is a swim interval

## Checkpoint Log

- `2026-04-07 | in progress | created a dedicated output/execution parity slice after confirming on origin/main that the remaining pool Garmin gap lives in closed step summaries, handoff text, PDF detail labels, Garmin-ready export labels, and poolside output; the key truthfulness fix is distinguishing Open swim from Open rest without changing the canonical draft model | next: update shared output helpers and WorkoutEditor summaries, then refresh targeted tests and run the pre-PR gate`
- `2026-04-07 | implementation + pre-PR gate | aligned pool-only execution wording across WorkoutEditor step cards, handoff text, PDF detail labels, Garmin-ready export labels, and poolside lines; added targeted unit/e2e coverage for Open swim vs Open rest and pool note labels; passed npm run lint:briefs:all, npm run typecheck, targeted vitest, targeted desktop-chromium Playwright, and npm run verify:pre-pr (96 passed / 318 skipped) | next: review final diff, commit, push, and open the feature PR`
- `2026-04-07 | committed | feature commit \`3a05313\` captured the pool output/execution parity slice after the green pre-PR gate; the branch is ready for push + PR handoff | next: push the branch, open the PR, and monitor required CI before merge`
