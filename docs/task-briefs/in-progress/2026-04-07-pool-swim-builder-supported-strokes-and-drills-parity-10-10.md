# Task Brief: Pool Swim Builder Supported Strokes And Drills Parity (10/10)

## Metadata

- `id`: `2026-04-07-pool-swim-builder-supported-strokes-and-drills-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-07`
- `updated`: `2026-04-07`

## Goal

FreeSwimming's pool workout readiness layer stops flagging Garmin-supported stroke and drill semantics as if they still need later decomposition, while keeping genuinely unresolved compatibility warnings intact.

## Why This Brief Exists

- The pool parity wave already shipped:
  - separate pool/open-water manual entry,
  - pool field parity,
  - repeat/final-rest parity,
  - documented compatibility guards for step count and send-off semantics.
- Current readiness logic still marks some pool-step semantics as review-only even though Garmin now documents them as supported in pool workouts on compatible devices:
  - `IM by round`
  - `Reverse IM order (RIMO)`
  - drill-type distinctions such as `Kick`, `Pull`, and `Drill`
- That leaves FreeSwimming less truthful than Garmin support material and makes Garmin/export readiness look worse than it really is.
- The existing warnings for unresolved equipment metadata should remain until we have source-backed Garmin support there.

Reference sources:

- Garmin support: `Pool Swim Workout Enhancements` documents `IM by Round`, `Reverse IM Order`, `Choice`, and expanded drill support on compatible devices.
- Garmin support: `Using Pool Swim Workouts` documents broader pool-workout step behavior and compatibility framing for compatible devices.

## Dependencies And Boundaries

- Parent parity direction:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-parity-10-10.md`
- Shipped prerequisite slices:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-field-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-repeat-rest-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-compatibility-guards-10-10.md`
- Primary implementation surfaces:
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`

## Product Direction Locked By This Brief

- This slice is `pool`-specific parity/truthfulness work.
- Garmin-supported pool semantics should not enter `review` state merely because FreeSwimming used to treat them as convenience-only abstractions.
- Keep the current review warning for equipment metadata until a later source-backed slice proves Garmin/export support there.
- Do not add a device-picker or device-specific branching in this slice.
- Do not reopen send-off or step-cap compatibility logic here.

## Compatibility Decisions Locked By This Slice

1. Supported strokes:
   - `IM by round` and `Reverse IM order (RIMO)` no longer trigger Garmin/export review issues in pool mode.
2. Supported drill semantics:
   - pool step `drillType` metadata no longer triggers Garmin/export review issues on its own.
3. Still unresolved:
   - pool step equipment metadata remains review-only until we have Garmin support evidence for those mappings.
4. Scope limit:
   - do not change saved draft schema,
   - do not remove the underlying stroke/drill choices from the builder,
   - do not introduce new handoff/export schema fields just for this cleanup slice.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                      | Evidence                              |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Product goals and IA                          | `target`     | Pool readiness no longer labels Garmin-supported stroke/drill semantics as unresolved review work.                                                                 | source-backed review + targeted tests |
| UX flow clarity                               | `target`     | A swimmer can use supported pool stroke/drill choices without being told they still require later decomposition.                                                   | targeted tests + manual QA            |
| Accessibility (a11y)                          | `supporting` | Supporting only: this slice changes readiness text only and must preserve the existing text-first, screen-reader-legible support layout.                           | code review                           |
| Visual design quality                         | `supporting` | Supporting only: removing outdated warnings should simplify the existing support panel without adding new chrome.                                                   | manual QA                             |
| Business logic correctness and data integrity | `target`     | Pool readiness/export diagnostics deterministically stop raising issues for supported stroke/drill semantics while preserving unresolved equipment warnings.        | unit tests + integration review       |
| Admin editor ergonomics                       | `target`     | The owner can keep using supported Garmin-like pool authoring choices without manual translation of false warning states.                                          | targeted tests + manual QA            |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the readiness cleanup does not materially affect `/my-library` or workout-detail responsiveness.                                                  | verify + code review                  |
| Data placement and sync boundaries            | `target`     | The slice remains a derived-readiness change only and introduces no new persisted compatibility flags or duplicate draft state.                                    | brief contract + code review          |
| Caching and invalidation strategy             | `supporting` | Supporting only: readiness stays derived from current draft state with no new cache invalidation rules.                                                            | integration review                    |
| Reliability and failure handling              | `target`     | Truly unresolved compatibility gaps still fail closed into `review`, while source-backed supported semantics no longer degrade readiness incorrectly.               | negative-path tests + source review   |
| Security and authz                            | `supporting` | Supporting only: no route/API permission boundary changes.                                                                                                          | scope review                          |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes owner-scoped workout guidance only and introduces no new sensitive data path or disclosure contract.                                | explicit scope rationale              |
| Content governance                            | `target`     | Garmin compatibility messaging stays aligned to documented support material instead of stale local assumptions.                                                     | source review + code review           |
| Admin workflow and editability                | `target`     | Pool workouts with supported stroke/drill semantics remain editable and handoff-ready without unnecessary review churn.                                             | targeted tests + manual QA            |
| SEO and crawlability                          | `N/A`        | N/A because this slice changes no public route, metadata, or search/discoverability contract.                                                                      | explicit scope rationale              |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing route, metadata, or discoverability contract.                                                                   | explicit scope rationale              |
| Analytics and KPI observability               | `supporting` | Supporting only: readiness summaries remain inspectable without adding new analytics instrumentation.                                                               | scope review                          |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, entitlement, checkout, or subscription reporting path changes.                                                                    | explicit scope rationale              |
| Incident response and support operations      | `supporting` | Supporting only: support outputs should stop sending false-positive Garmin warnings for supported pool semantics.                                                   | support output review                 |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payouts, billing, or operator reporting flow changes.                                                                       | explicit scope rationale              |
| i18n operational readiness                    | `N/A`        | N/A because this slice adjusts internal English compatibility messaging only and must keep the semantics centralized for later localization work.                   | explicit scope rationale              |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing workout readiness/export helper stack; do not add new dependencies or a second compatibility engine.                                            | dependency diff + architecture review |
| Testing and QA automation                     | `target`     | Coverage protects the supported-stroke/drill cleanup and unresolved equipment warning before PR update, and `npm run verify:pre-pr` passes on the final branch.   | unit coverage + `verify:pre-pr`       |
| Scalability and cost efficiency               | `supporting` | Supporting only: the readiness cleanup remains a small deterministic derived check with no extra writes or route duplication.                                      | code review                           |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice stays reversible as a shared-logic/readiness change with no schema migration.                                                           | diff review + rollback note           |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`
  - canonical workout draft rows and their persisted step arrays
- Local-only:
  - support panel open/closed state
  - transient unsaved edits before canonical save
- Sync policy:
  - readiness continues to derive from the current draft state both before and after save
  - no new save mutation or background sync path is introduced
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
  - labels such as `IM by round`, `Reverse IM order (RIMO)`, and drill type wording are mutable UI labels, not identifiers.
- Mutability rules:
  - step layout and support copy remain editable in place.
- Rename vs repurpose policy:
  - changing a workout to resolve or remove a compatibility warning is an in-place edit to the same workout.
- Compatibility contract:
  - older saved workouts using these supported semantics must still load safely and should no longer show stale review warnings.
- Observability and repair:
  - unsupported equipment metadata must remain explicit until its own parity slice lands.

## Scope

- Remove stale Garmin review issues for pool `IM by round`
- Remove stale Garmin review issues for pool `Reverse IM order (RIMO)`
- Remove stale Garmin review issues for pool drill-type metadata
- Keep unresolved equipment review issues intact
- Update targeted readiness coverage and any affected builder-hub assertions

## Out Of Scope

- New schema fields or migrations
- Equipment metadata parity
- Device-picker or device-specific compatibility routing
- Send-off or step-cap validation changes
- Open-water compatibility redesign

## Acceptance Criteria

1. Pool steps using `IM by round` no longer enter Garmin/export `review` state solely because of that stroke choice.
2. Pool steps using `Reverse IM order (RIMO)` no longer enter Garmin/export `review` state solely because of that stroke choice.
3. Pool steps using drill-type metadata no longer enter Garmin/export `review` state solely because of that drill labeling.
4. Pool steps using equipment metadata still enter `review` state with an explicit unresolved detail.
5. Existing save/load flows still work after the readiness cleanup.
6. Handoff/export/readiness summaries stop showing the stale stroke/drill warnings.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`
  - `tests/unit/workouts-shared.test.ts`
  - `tests/unit/workout-builder-hub.test.tsx`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3100/my-library`
  - desktop Chromium during implementation
- Vercel preview:
  - PR preview URL from checks

## Constraints

- Keep the slice additive and backward-compatible.
- Prefer source-backed truthfulness over convenience warnings inherited from older assumptions.
- Do not imply Garmin support for equipment metadata without documentation.

## 10/10 Quality Bar

- Removing stale warnings should make the support panel calmer, not noisier.
- Required states:
  - loading: unchanged existing builder loading behavior
  - empty: unchanged fallback state
  - error: genuinely unresolved compatibility gaps still surface as review details, not route crashes
  - retry/offline: existing save failure behavior remains unchanged
- Accessibility:
  - readiness details remain plain text inside the existing support panels
- Performance:
  - readiness checks remain linear in step count and cheap relative to existing derived totals
- Business logic:
  - source-backed supported semantics no longer degrade readiness
  - unresolved equipment warnings remain deterministic

## Checkpoint Log

- `2026-04-07 | in progress | created the supported-strokes-and-drills parity brief after the compatibility-guards slice closed; scope is narrowed to removing stale Garmin review warnings for source-backed pool stroke/drill semantics while leaving equipment warnings intact | next: update shared readiness logic, refresh targeted tests, and run full pre-PR verification`
- `2026-04-07 | in progress | updated shared readiness logic so pool workouts no longer flag source-backed `IM by round`, `Reverse IM order (RIMO)`, or drill-type metadata as review-only, refreshed builder-hub/workout/program export tests, and restored the printable-program contract to the new ready-state truth | next: run `npm run verify:pre-pr`, then commit/push/open PR if green`
- `2026-04-07 | in progress | full `npm run verify:pre-pr` passed after aligning the last desktop workout-builder E2E expectation with the new single-review-item truth and re-running the full matrix (`96 passed / 318 skipped`) | next: remove generated artifacts, commit, push, and open the feature PR`
