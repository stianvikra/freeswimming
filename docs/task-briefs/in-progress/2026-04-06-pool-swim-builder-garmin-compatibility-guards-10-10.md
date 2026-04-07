# Task Brief: Pool Swim Builder Garmin Compatibility Guards (10/10)

## Metadata

- `id`: `2026-04-06-pool-swim-builder-garmin-compatibility-guards-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-06`
- `updated`: `2026-04-06`

## Goal

FreeSwimming's manual `pool` builder stays truthful about documented Garmin compatibility limits by surfacing review-state guards for total authored step count and `Send-off Time` semantics before handoff/export.

## Why This Brief Exists

- The pool parity wave already shipped:
  - separate pool/open-water manual entry,
  - field-level pool wording cleanup,
  - repeat/final-rest parity for repeat blocks.
- The next remaining documented Garmin gap is not another large form rewrite. It is compatibility truthfulness around builder constraints.
- Garmin's pool-workout guidance documents two limits that FreeSwimming should no longer imply away:
  - pool workouts top out at `100` workout steps,
  - `Send-off Time` is a rest-style choice after a distance-based swim step; when used after time-based steps, open swim steps, or other rest steps, Garmin devices treat it like open rest instead of the authored send-off semantics.
- FreeSwimming currently allows these shapes to be authored without any explicit Garmin/export review signal, which makes the support outputs too optimistic.

## Dependencies And Boundaries

- Parent parity direction:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-parity-10-10.md`
- Shipped prerequisite slices:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-field-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-repeat-rest-parity-10-10.md`
- Primary implementation surfaces:
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`

## Product Direction Locked By This Brief

- This slice is `pool`-specific parity/truthfulness work.
- `Open water` keeps its current separate non-parity path and must not inherit pool-specific compatibility warnings in this slice.
- The builder may still save a workout that falls outside Garmin's current documented pool contract, but the support/readiness layer must stop calling that shape effectively handoff-ready.
- This slice prefers explicit `review` guidance over new hard save-blocks so existing canonical workouts can still load, edit, and recover safely.
- Compatibility truthfulness must propagate through:
  - readiness status,
  - support-tools status pills,
  - handoff text,
  - PDF review notice,
  - Garmin-ready export diagnostics.

## Compatibility Decisions Locked By This Slice

1. Total step cap:
   - pool workouts with more than `100` authored steps enter Garmin/export `review` state.
   - the review detail must say the set needs consolidation before Garmin handoff/export.
2. Send-off compatibility:
   - `Send-off Time` and CSS-relative send-off stay review-safe only when they are authored as rest-style steps after a distance-based swim step.
   - if authored on a non-rest step, as the first step, or after a non-distance step, readiness must explain that Garmin devices may treat it like open rest instead.
3. Scope limit:
   - do not add a new schema field or migration.
   - do not rewrite the step model again in this slice.
   - do not turn these review rules into save-blocking validation yet.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                         | Evidence                                |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Product goals and IA                          | `target`     | Pool support tools no longer imply Garmin handoff readiness for workouts that exceed the documented step cap or misuse send-off semantics.                           | manual QA + targeted tests              |
| UX flow clarity                               | `target`     | A swimmer can tell from the readiness panel why a pool workout needs review without reverse-engineering Garmin behavior.                                              | targeted tests + manual QA              |
| Accessibility (a11y)                          | `supporting` | Supporting only: readiness notices stay text-first, keyboard reachable, and screen-reader legible without adding hidden-only semantics.                              | code review + existing UI tests         |
| Visual design quality                         | `supporting` | Supporting only: the new compatibility details fit the existing support panel and do not introduce noisy new chrome.                                                  | screenshot review + manual QA           |
| Business logic correctness and data integrity | `target`     | Pool readiness/export diagnostics deterministically flag `>100` authored steps and invalid send-off placement while preserving safe save/load behavior.               | unit tests + integration review         |
| Admin editor ergonomics                       | `target`     | The owner can understand when a pool workout is Garmin-review-only without losing the ability to keep editing the same canonical workout.                             | targeted tests + manual QA              |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: aggregate readiness checks do not materially regress `/my-library` or workout-detail responsiveness.                                                 | verify + targeted review                |
| Data placement and sync boundaries            | `target`     | Compatibility guards remain derived from the canonical draft state and do not introduce a second persistence model or hidden local-only compatibility flag.           | brief contract + code review            |
| Caching and invalidation strategy             | `supporting` | Supporting only: readiness state keeps deriving from the current local draft / saved workout flow without new cache invalidation rules.                               | integration review                      |
| Reliability and failure handling              | `target`     | Out-of-contract pool workouts fail closed into `review` state with explicit reasons instead of looking Garmin-ready by accident.                                      | negative-path tests + manual QA         |
| Security and authz                            | `supporting` | Supporting only: no route/API permission boundary changes.                                                                                                             | scope review                            |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes owner-scoped workout guidance only and introduces no new sensitive data path or disclosure contract.                                   | explicit scope rationale                |
| Content governance                            | `target`     | Garmin compatibility claims stay tied to documented limits and are expressed through one centralized readiness contract.                                              | brief decisions + code review           |
| Admin workflow and editability                | `target`     | Save/reopen/edit flows remain intact while the support layer becomes more truthful about Garmin handoff constraints.                                                   | unit coverage + manual QA               |
| SEO and crawlability                          | `N/A`        | N/A because authenticated My Library builder routes remain private and uncrawlable.                                                                                    | explicit scope rationale                |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public route, metadata, or AI-facing discoverability contract.                                                                      | explicit scope rationale                |
| Analytics and KPI observability               | `supporting` | Supporting only: support-state summaries still make pool compatibility drift interpretable even without new analytics instrumentation.                                 | scope review                            |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, entitlement, checkout, or subscription reporting behavior changes.                                                                   | explicit scope rationale                |
| Incident response and support operations      | `supporting` | Supporting only: handoff/PDF/export review language must make step-cap and send-off compatibility issues diagnosable during support triage.                           | support output review                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payouts, billing, or operator reporting flow changes.                                                                           | explicit scope rationale                |
| i18n operational readiness                    | `N/A`        | N/A because this slice adjusts internal English compatibility messaging only and must keep the semantics centralized for later localization work.                      | explicit scope rationale                |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing workout readiness/export helpers; do not add a new dependency or alternate validation stack for these guards.                                      | dependency diff + architecture review   |
| Testing and QA automation                     | `target`     | Targeted coverage protects over-cap pool drafts and invalid send-off placement before PR update, and `npm run verify:pre-pr` passes on the final branch diff.       | unit coverage + `verify:pre-pr`         |
| Scalability and cost efficiency               | `supporting` | Supporting only: the new guards remain a small deterministic derived check with no extra writes or route duplication.                                                  | code review                             |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice stays reversible as a shared-logic/readiness change with no schema migration.                                                              | diff review + rollback note             |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`
  - canonical workout draft rows and their persisted step arrays
- Local-only:
  - current support panel open/closed state
  - transient unsaved edits before canonical save
- Sync policy:
  - compatibility guards derive from the current draft state both before and after save
  - no extra save mutation or background sync path is introduced
  - reopening a saved workout recomputes the same readiness result from the canonical draft payload
- Retention and sensitivity:
  - no new sensitive data class
  - no new persisted compatibility metadata
- Cache/invalidation:
  - existing `router.refresh` and canonical save boundaries remain authoritative
  - readiness stays computed from current in-memory draft or loaded canonical draft

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical workout identity.
- Human-readable identifiers:
  - review labels such as `Send-off Time` and `100 workout steps` are mutable UI wording, not identifiers.
- Mutability rules:
  - step layout and support copy remain editable in place.
- Rename vs repurpose policy:
  - changing a workout to resolve a compatibility warning is an in-place edit to the same workout.
- Compatibility contract:
  - older saved workouts that already contain these shapes must still load safely and show review-state guidance instead of failing to open.
- Observability and repair:
  - review-state diagnostics must be explicit enough that the owner can repair the workout without reading code.

## Scope

- Add aggregate pool-workout readiness issues for Garmin's documented `100`-step cap.
- Add pool send-off compatibility review rules for `send_off` and `css_send_off`.
- Keep handoff/PDF/export diagnostics truthful by reusing the shared readiness report.
- Update targeted unit coverage and any affected builder-hub assertions.

## Out Of Scope

- New schema fields or migrations
- New save-blocking validation errors
- Open-water compatibility redesign
- Additional pool field-label parity work
- New repeat/rest semantics beyond what already shipped

## Acceptance Criteria

1. Pool drafts with more than `100` authored steps enter Garmin/export `review` state with an explicit step-cap detail.
2. Pool steps using `send_off` or `css_send_off` outside the documented Garmin pattern enter `review` state with an explicit compatibility detail.
3. Valid pool send-off rest usage after a distance-based swim step remains `ready`.
4. Existing save/load flows still work for reviewed workouts.
5. Handoff text, PDF review notice, and Garmin-ready export diagnostics include the same compatibility issues from the shared readiness report.
6. Open-water behavior stays unchanged in this slice.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`
  - `tests/unit/workouts-shared.test.ts`
  - `tests/unit/workout-builder-hub.test.tsx`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be available on the machine used for validation.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3100/my-library`
  - desktop Chromium during implementation
- Vercel preview:
  - PR preview URL from checks

## Constraints

- Keep the slice additive and backward-compatible.
- Prefer explicit review-state truthfulness over broad new blocking validation.
- Do not imply undocumented Garmin behavior.

## 10/10 Quality Bar

- Support tools must stay secondary, but the readiness panel should tell the truth quickly.
- Required states:
  - loading: unchanged existing builder loading behavior
  - empty: empty drafts still show the current readiness fallback
  - error: invalid Garmin-compatible shapes surface as review details, not route crashes
  - retry/offline: existing save failure behavior remains unchanged
- Accessibility:
  - compatibility details remain visible plain text inside the existing support panels
  - no interaction should be required just to preserve semantic meaning in exported outputs
- Performance:
  - readiness checks remain linear in step count and cheap relative to existing derived totals
- Business logic:
  - identical draft inputs always produce identical readiness/export diagnostics
  - save/reopen must not erase or invent compatibility warnings

## Checkpoint Log

- `2026-04-06 | in progress | created the compatibility-guards brief after the repeat/rest slice closed; scope is now narrowed to documented Garmin step-cap and send-off truthfulness in the shared readiness layer | next: implement aggregate readiness issues, update targeted tests, and run full pre-PR verification`
- `2026-04-06 | implementation + full gate | added pool-only Garmin compatibility review rules for authored step cap and send-off placement, updated shared readiness coverage plus builder-hub expectations, and passed npm run lint:briefs:all, targeted vitest, npm run typecheck, and full npm run verify:pre-pr (96 passed / 318 skipped); perf-budget trend recommendation remained hold (runs: 1/2, worst margin 36.2%) | next: inspect final diff, commit the slice, push the branch, and open the PR`
