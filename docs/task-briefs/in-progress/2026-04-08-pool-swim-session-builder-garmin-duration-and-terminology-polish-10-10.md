# Task Brief: Pool Swim Session Builder Garmin Duration And Terminology Polish (10/10)

## Metadata

- `id`: `2026-04-08-pool-swim-session-builder-garmin-duration-and-terminology-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-08`
- `updated`: `2026-04-08`

## Goal

The manual pool swim-session builder uses Garmin-equivalent duration terminology and step-editing labels where the concepts map directly, and the pool step editor no longer allows mixed swim/rest timing states that Garmin would not present.

## Why This Brief Exists

- Manual owner review on `2026-04-08` surfaced a builder-quality gap on:
  - `https://freeswimming.org/my-library/workouts/e4b0eb22-20de-4880-a3a8-8494850caff2?entry=manual-pool`
- The current pool step editor still uses invented labels such as:
  - `Step timing`
  - `Distance swim`
  - `Time-based swim`
  - `Open swim`
  - `CSS send-off`
  - `Step note`
- The deeper issue is structural, not cosmetic:
  - FreeSwimming models repeat swim and repeat rest as separate steps like Garmin,
  - but it still exposes one flattened duration menu across step types,
  - so combinations like `Main + Rest time` remain possible even though Garmin separates swim-step and rest-step duration choices.
- This is owner-led builder polish based on manual review.
- It is explicitly not a new Garmin roadmap slice and must not reopen the parked follow-up brief:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-04-07-pool-swim-builder-garmin-follow-up-map-10-10.md`

## Dependencies And Boundaries

- Recently shipped pool-builder work that this slice must preserve:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-repeat-rest-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-swim-builder-step-authoring-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-builder-owner-note-3a29feae-step-detail-polish-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-08-pool-swim-session-builder-owner-notes-repeat-copy-rest-time-and-pool-size-polish-10-10.md`
- Primary implementation surfaces:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`
- Boundary decisions:
  - no open-water work,
  - no schema migration,
  - no export-format change,
  - no new contextual help surface,
  - no work on the unrelated open admin note for pool-size autofocus on this page unless directly required.

## Admin Notes Triage Disposition

- Existing open page note on this exact workout route:
  - `814ced4c-77e9-4b62-afaf-7ca8424d9ae0`
  - body: autofocus exact pool-size input when `Unspecified` is selected
  - disposition: not owned by this brief
  - reason: separate pool-size interaction note; current slice is duration/terminology and step-type clarity
- There is no existing open admin note on this page that already captures the `Step timing` Garmin-term and step-type mismatch.
- This brief therefore owns the finding directly instead of waiting on a new admin note.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Testing and QA automation`

| Category | Mapping | Target Threshold (if `target`) | Evidence |
| --- | --- | --- | --- |
| Product goals and IA | `target` | Manual pool step editing uses Garmin-equivalent language for directly mapped concepts, and duration choices are structurally separated by step type instead of one mixed menu. | manual QA + code review + unit/e2e |
| UX flow clarity | `target` | Pool builders cannot author semantically mixed duration states such as `Main + Fixed Rest Time`; the correct choices appear for the chosen step type without extra explanation. | manual QA + targeted e2e |
| Visual design quality | `target` | The step editor reads cleaner because labels are shorter, more standard, and more consistent with Garmin without becoming visually denser than today. | manual QA + screenshot review |
| Business logic correctness and data integrity | `target` | Duration-mode filtering and normalization preserve canonical saved workout structure, repeat behavior, and export/handoff summaries while eliminating invalid swim/rest timing combinations. | unit tests + code review |
| Admin editor ergonomics | `target` | A builder familiar with Garmin can author pool steps without translating FreeSwimming-specific terms such as `Open swim` or `Step timing`. | manual QA + targeted tests |
| Accessibility (a11y) | `supporting` | Supporting only: renamed labels and filtered selects remain keyboard-accessible and preserve correct form labeling. | code review + tests |
| Performance (CWV + payloads) | `supporting` | Supporting only: the builder route adds no meaningful client/runtime cost for terminology and select filtering changes. | diff review |
| Data placement and sync boundaries | `target` | The slice stays UI-contract only: existing server-canonical workout fields remain authoritative, and no second timing model is introduced. | brief contract + code review |
| Caching and invalidation strategy | `supporting` | Supporting only: workout save and reload semantics stay unchanged. | integration review |
| Reliability and failure handling | `target` | Legacy mixed states are normalized deterministically in the editor so the builder does not render blank or contradictory duration controls. | unit tests + manual QA |
| Security and authz | `supporting` | Supporting only: this slice stays inside the existing authenticated builder surface. | existing boundaries |
| Privacy and compliance | `N/A` | N/A because this is copy, editor-logic, and layout polish on an authenticated owner workflow only; no new data sharing or retention behavior changes. | explicit scope rationale |
| Content governance | `supporting` | Supporting only: all newly shipped terms must be grounded in Garmin-visible wording rather than FreeSwimming-invented replacements for mapped concepts. | screenshot review + code review |
| Admin workflow and editability | `target` | High-frequency pool editing becomes more truthful and easier because swim-step and rest-step durations no longer share one misleading vocabulary set. | manual QA + targeted tests |
| SEO and crawlability | `N/A` | N/A because `/my-library/workouts/[workoutId]` is an authenticated route with no public indexing contract. | explicit scope rationale |
| AI discoverability | `N/A` | N/A because no public route, metadata, or AI-facing content surface changes. | explicit scope rationale |
| Analytics and KPI observability | `supporting` | Supporting only: no new analytics is required for this bounded editor-contract fix. | scope review |
| Commerce and revenue ops | `N/A` | N/A because no billing, pricing, entitlement, or checkout path changes. | explicit scope rationale |
| Incident response and support operations | `N/A` | N/A because this slice does not alter operational runbooks, escalation paths, or support tooling; it only tightens the owner-facing pool builder vocabulary and editing rules. | explicit scope rationale |
| Finance and reporting operations | `N/A` | N/A because no finance or reconciliation path changes. | explicit scope rationale |
| i18n operational readiness | `N/A` | N/A because this slice changes only current English builder wording and does not alter locale architecture or translation flow. | explicit scope rationale |
| Stack-fit and dependency discipline | `target` | Reuse the existing workout builder and shared normalization helpers; add no dependencies. | dependency diff + architecture review |
| Testing and QA automation | `target` | Unit and e2e coverage must assert Garmin duration labels and step-type-based filtering, and `npm run verify:pre-pr` must pass before PR update. | targeted tests + verify gate |
| Scalability and cost efficiency | `supporting` | Supporting only: UI filtering and terminology changes must not add server load or repeated writes. | code review |
| DevOps and rollback readiness | `supporting` | Supporting only: rollback remains low-risk because the slice changes no schema or external contract. | diff review |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout identity and payload
  - `steps[].category`
  - `steps[].durationMode`
  - `steps[].distanceM`
  - `steps[].timeMin`
  - `steps[].cssSendOffOffsetSeconds`
  - `steps[].repeatEndingRestMode`
- Local-only:
  - label text
  - duration-option visibility by step type
  - any editor-side normalization before save
- Sync policy:
  - label and layout changes never write by themselves,
  - step-type changes may normalize invalid manual-pool duration modes in local draft state,
  - save continues to persist the same canonical step fields as today,
  - export/handoff/poolside summaries must consume the same canonical fields with updated Garmin wording.
- Retention and sensitivity:
  - no new data class,
  - no change to deletion expectations or sensitive-field handling.
- Cache/invalidation:
  - existing workout save/update behavior remains authoritative,
  - no additional cache layer is introduced.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains canonical across builder, save, export, notes, and handoff.
- Human-readable identifiers:
  - pool builder labels are mutable UI text only.
- Mutability rules:
  - session-builder wording may change in place,
  - canonical workout field names and saved entity identity remain stable.
- Rename vs repurpose policy:
  - rename UI expressions before changing underlying data model,
  - do not repurpose the repeat/rest storage contract in this slice.
- Compatibility contract:
  - existing saved workouts must still open,
  - any legacy mixed pool-step combinations must normalize into a valid Garmin-like editor state instead of rendering contradictory controls.
- Observability and repair:
  - targeted tests must cover legacy mixed-state normalization and filtered duration options so regressions surface before PR update.

## Scope

- Replace invented manual-pool duration terms with Garmin-visible terminology where the concept maps directly.
- Rename manual-pool field labels to Garmin-style labels where clearly mapped from screenshots:
  - `Step Type`
  - `Stroke Type`
  - `Drill Type`
  - `Duration`
  - `Notes`
- Remove invented duration option labels in manual pool mode:
  - `Distance swim`
  - `Time-based swim`
  - `Open swim`
  - `Rest time`
  - `CSS send-off`
- Use Garmin terminology instead:
  - `Distance`
  - `Time`
  - `Lap Button Press`
  - `Fixed Rest Time`
  - `Send-Off Time`
  - `CSS-Based Send-Off Time`
- Filter manual-pool duration choices by step type:
  - swim-style step types only see swim-valid duration choices
  - `Rest` only sees rest-valid duration choices
- Normalize invalid legacy manual-pool step-type/duration combinations in the editor so the current draft surface stays valid.
- Update manual-pool summaries, handoff/poolside lines, and pdf detail labels to use the same Garmin terminology for mapped concepts.
- Update tests for the new terminology and filtered-duration contract.

## Out Of Scope

- Open-water builder work
- New Garmin export mapping work
- New admin note creation for this finding
- Pool-size autofocus note `814ced4c-77e9-4b62-afaf-7ca8424d9ae0`
- Broader rest-step layout redesign beyond the terminology and step-type duration separation required here
- New contextual help or guide work

## Acceptance Criteria

1. Manual pool step editing shows `Duration`, not `Step timing`.
2. Manual pool notes field shows `Notes`, not `Step note`.
3. Manual pool duration menus use Garmin wording for directly mapped choices.
4. Non-rest pool step types cannot select rest-only duration modes.
5. `Rest` pool steps cannot select swim-only duration modes.
6. Existing mixed-state drafts normalize into a valid state when loaded into the manual pool editor.
7. Pool summaries, poolside text, and pdf detail labels stop using invented labels such as `Open swim`, `Step note`, and `Rest time` where Garmin terms exist.
8. Targeted tests and `npm run verify:pre-pr` pass.

## Validation

- `npm run lint:briefs:all`
- `npx vitest run tests/unit/workout-builder-hub.test.tsx tests/unit/workouts-shared.test.ts`
- `npx playwright test tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run typecheck`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed
- validation runs from repo root

## Manual QA Environments

- Garmin reference screenshots captured during owner review on `2026-04-08`
- Production comparison route:
  - `https://freeswimming.org/my-library/workouts/e4b0eb22-20de-4880-a3a8-8494850caff2?entry=manual-pool`
- Preview URL after PR push

## Constraints

- Use Garmin expressions for mapped manual-pool concepts unless the owner has explicitly chosen otherwise.
- Do not invent replacements such as `Open swim` or `Open rest`.
- Keep the builder calmer than Garmin where layout can be better without changing the underlying mental model.
- Preserve the current repeat/rest contract and canonical save/export model.

## 10/10 Quality Bar

- The pool step editor must be at least Garmin-clear in terminology and structural timing choices.
- The UI should feel cleaner than Garmin, not denser.
- A Garmin-familiar swimmer should not need to mentally translate core duration vocabulary.
- Required states remain intact:
  - loading: existing builder load state remains truthful
  - empty: existing no-session state remains truthful
  - error: invalid save states still explain what is wrong
  - retry: existing retry/save-again path remains the recovery path

## Help/Guide And Operator Training Contract

- `N/A` for this slice because:
  - no dedicated user-facing builder help surface exists yet,
  - the workflow change is covered by UI truthfulness and automated tests in this slice,
  - no admin help-center workflow or operator training guide is being used as the source-of-truth for this route today.

## Checkpoint Log

- `2026-04-08 | in-progress | created clean worktree feat/pool-builder-garmin-terms-2026-04-08 from origin/main and locked scope to manual-pool Garmin terminology + duration filtering; confirmed there is no existing open admin note covering this exact step-timing finding, only an unrelated open pool-size autofocus note on the same workout route | next: patch WorkoutEditor/shared labels and duration filtering, then update unit/e2e coverage`
- `2026-04-08 | in-progress | implemented Garmin-visible manual-pool terminology, filtered duration options by step type, updated shared Garmin/export labels, fixed deterministic catalog-test env isolation, and normalized manual-pool dirty-state comparison so hidden derived step labels do not keep canonical sessions falsely dirty; verify:pre-pr finished green (96 passed, 318 skipped, 0 failed) after targeted vitest/playwright reruns | next: commit, push, open PR, and monitor required CI before merge`
