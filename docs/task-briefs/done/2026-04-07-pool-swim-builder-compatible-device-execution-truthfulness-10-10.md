# Task Brief: Pool Swim Builder Compatible-Device Execution Truthfulness (10/10)

## Metadata

- `id`: `2026-04-07-pool-swim-builder-compatible-device-execution-truthfulness-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-07`
- `updated`: `2026-04-07`

## Goal

FreeSwimming's manual `pool` builder should stay truthful about Garmin pool-workout behaviors that still vary by device or personal CSS state, so readiness/handoff/PDF/export stop reading as universally execution-safe when Garmin's own support material documents important caveats.

## Why This Brief Exists

- The pool parity wave already shipped:
  - separate `pool` and `open water` manual entry,
  - pool field parity,
  - repeat/final-rest parity,
  - documented compatibility guards for step count and send-off placement,
  - supported stroke/drill cleanup,
  - equipment truthfulness,
  - step-authoring wording parity,
  - output/execution wording parity.
- `origin/main` now describes pool workouts more clearly, but it still overstates one class of readiness:
  - some pool features are documented by Garmin as full-featured only on compatible devices,
  - CSS-relative pool targets depend on the device's CSS behavior,
  - `Unspecified` pool size is not a completely identical execution path across pool-swim watches.
- The current readiness layer treats these shapes as fully `ready`, which is too optimistic when the target watch may simplify or reinterpret the authored workout.
- Garmin support material we already rely on documents three execution-truthfulness gaps that should now surface before handoff:
  - `Unspecified` pool size is only partially compatible across pool-swim watches; fully compatible devices keep step distances as authored, while older devices can convert distances for yard pools,
  - compatible devices can use the last rest interval in a repeat block, while older devices always skip the final rest,
  - compatible devices automatically adjust CSS-relative send-off and pace targets when CSS changes, and use `2:00/100m` if no CSS is set.

## Dependencies And Boundaries

- Parent parity direction:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-parity-10-10.md`
- Shipped prerequisite slices:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-compatibility-guards-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-repeat-rest-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-swim-builder-supported-strokes-and-drills-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-swim-builder-equipment-compatibility-truthfulness-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-swim-builder-output-execution-parity-10-10.md`
- Primary implementation surfaces:
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`
- Official parity references:
  - Garmin Support: `Pool Swim Workout Enhancements`
  - Garmin Support: `Using Pool Swim Workouts`

## Product Direction Locked By This Brief

- This slice is `pool`-only device/execution truthfulness work.
- `Open water` keeps its current separate non-parity path and must not inherit these pool-specific device cautions.
- This slice stays in the shared readiness/support-output layer:
  - readiness status,
  - handoff text,
  - printable PDF review details,
  - Garmin-ready JSON diagnostics.
- Do not add a device picker, per-watch profile, or save-blocking validation in this slice.
- Prefer explicit `review` details over silent optimism when Garmin documents that older devices or missing CSS setup can change execution.

## Execution Truthfulness Decisions Locked By This Slice

1. `Unspecified` pool size:
   - pool drafts with `poolLengthM: null` enter Garmin/export `review` state.
   - the review detail must explain:
     - Garmin documents `Unspecified` as partially compatible across pool-swim watches,
     - fully compatible devices keep authored step distances as entered,
     - older devices may convert the distance in yard pools.
2. Repeat blocks that keep the last rest:
   - pool repeat blocks ending in a rest step and using `Use last rest interval` enter Garmin/export `review` state.
   - the review detail must explain:
     - Garmin documents this behavior on compatible devices,
     - older devices skip the last rest interval instead.
3. CSS-relative pool steps:
   - pool drafts using `CSS target pace` or `CSS send-off` enter Garmin/export `review` state.
   - the review detail must explain:
     - Garmin documents that compatible devices auto-adjust these targets when CSS changes,
     - Garmin devices use `2:00/100m` if no CSS is set,
     - FreeSwimming previews use the workout's current CSS baseline and therefore need final watch confirmation before handoff.
4. Scope limit:
   - no schema change,
   - no device-picker UI,
   - no new save-blocking validation,
   - no reopening of already-shipped equipment/send-off-count rules.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                   | Evidence                                |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Product goals and IA                          | `target`     | Pool readiness stops implying universal watch behavior for `Unspecified` pool size, `Use last rest interval`, and CSS-relative targets when Garmin documents caveats. | source review + targeted tests          |
| UX flow clarity                               | `target`     | A swimmer can tell from the readiness panel why a pool workout needs device/CSS review without reverse-engineering Garmin support docs.                         | targeted tests + manual QA              |
| Accessibility (a11y)                          | `supporting` | Supporting only: readiness details remain plain text, keyboard reachable, and screen-reader legible inside the existing support panel.                          | code review + existing test harness     |
| Visual design quality                         | `supporting` | Supporting only: the new truthfulness details fit the existing support surfaces without adding noisy new chrome.                                                | screenshot review + manual QA           |
| Business logic correctness and data integrity | `target`     | Pool readiness/export diagnostics deterministically flag the documented device/CSS caveats while preserving the same canonical saved workout payload.            | unit tests + integration review         |
| Admin editor ergonomics                       | `target`     | The owner can keep editing the same workout while understanding which pool features need final device confirmation before Garmin handoff.                        | targeted tests + manual QA              |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: aggregate readiness checks remain linear in step count and do not materially regress `/my-library` or workout-detail responsiveness.            | verify + targeted review                |
| Data placement and sync boundaries            | `target`     | Device/CSS truthfulness stays derived from the canonical draft and introduces no extra persisted compatibility state or shadow output model.                     | brief contract + code review            |
| Caching and invalidation strategy             | `supporting` | Supporting only: readiness continues deriving from the current draft/save flow with no new cache invalidation rules.                                            | integration review                      |
| Reliability and failure handling              | `target`     | Out-of-contract pool execution assumptions fail closed into `review` state with explicit reasons instead of looking universally handoff-ready.                  | negative-path tests + manual QA         |
| Security and authz                            | `supporting` | Supporting only: no route/API permission boundary changes.                                                                                                       | scope review                            |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes owner-scoped workout guidance only and introduces no new sensitive data path or disclosure contract.                              | explicit scope rationale                |
| Content governance                            | `target`     | Device/CSS caveats stay centralized in one audited readiness contract instead of drifting between builder, handoff text, PDF, and export JSON.                  | brief decisions + code review           |
| Admin workflow and editability                | `target`     | Save/reopen/edit flows remain intact while the support layer becomes more truthful about device-level pool execution caveats.                                   | unit coverage + manual QA               |
| SEO and crawlability                          | `N/A`        | N/A because authenticated My Library builder routes remain private and uncrawlable.                                                                             | explicit scope rationale                |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public route, metadata, or AI-facing discoverability contract.                                                               | explicit scope rationale                |
| Analytics and KPI observability               | `supporting` | Supporting only: readiness summaries remain inspectable without adding new analytics instrumentation.                                                            | scope review                            |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, entitlement, checkout, or subscription reporting behavior changes.                                                             | explicit scope rationale                |
| Incident response and support operations      | `supporting` | Supporting only: handoff/PDF/export review language should make device/CSS caveats diagnosable during support triage.                                          | support output review                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payouts, billing, or operator reporting flow changes.                                                                    | explicit scope rationale                |
| i18n operational readiness                    | `N/A`        | N/A because this slice adjusts internal English compatibility messaging only and must keep the semantics centralized for later localization work.                | explicit scope rationale                |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing workout readiness/export helper stack; do not add new dependencies or a per-device configuration system in this slice.                       | dependency diff + architecture review   |
| Testing and QA automation                     | `target`     | Targeted coverage protects `Unspecified` pool size, `Use last rest interval`, and CSS-relative pool warnings before PR update, and `npm run verify:pre-pr` passes. | unit/e2e coverage + `verify:pre-pr`     |
| Scalability and cost efficiency               | `supporting` | Supporting only: the new guards remain a small deterministic derived check with no extra writes or route duplication.                                           | code review                             |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice stays reversible as a shared-logic/readiness change with no schema migration.                                                        | diff review + rollback note             |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`
  - canonical workout draft rows and their persisted step arrays
- Local-only:
  - support panel open/closed state
  - transient unsaved edits before canonical save
- Sync policy:
  - device/CSS cautions derive from the current draft state both before and after save
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
  - labels such as `Unspecified`, `Use last rest interval`, `CSS send-off`, and the review copy are mutable UI wording, not identifiers.
- Mutability rules:
  - step layout and support copy remain editable in place.
- Rename vs repurpose policy:
  - changing a workout to remove a device/CSS caution is an in-place edit to the same workout.
- Compatibility contract:
  - older saved workouts that already use these shapes must still load safely and now show truthful review-state guidance instead of false universal readiness.
- Observability and repair:
  - review-state diagnostics must stay explicit enough that the owner can repair or confirm the workout without reading code.

## Scope

- Add pool-only Garmin readiness issues for:
  - `Unspecified` pool size,
  - repeat blocks that keep the last rest interval,
  - CSS-relative pace/send-off steps.
- Keep handoff/PDF/export diagnostics truthful by reusing the shared readiness report.
- Update targeted unit/component/e2e coverage for the new device/CSS review details.

## Out Of Scope

- New schema fields or migrations
- Device-picker or per-watch configuration UI
- New save-blocking validation
- Open-water compatibility redesign
- Reopening already-shipped step-cap or send-off placement rules
- Rewording the broader pool editor again

## Acceptance Criteria

1. Pool drafts with `Unspecified` pool size enter Garmin/export `review` state with an explicit partial-compatibility detail.
2. Pool repeat blocks that keep the last rest interval enter Garmin/export `review` state with an explicit older-device fallback detail.
3. Pool drafts using `CSS target pace` or `CSS send-off` enter Garmin/export `review` state with an explicit CSS/device-baseline detail.
4. Existing save/load flows still work for reviewed workouts.
5. Handoff text, PDF review notice, and Garmin-ready export diagnostics include the same device/CSS issues from the shared readiness report.
6. Open-water behavior stays unchanged in this slice.

## Validation

- `npm run lint:briefs:all`
- `npm run typecheck`
- targeted `vitest`
  - `tests/unit/workouts-shared.test.ts`
  - `tests/unit/workout-builder-hub.test.tsx`
- targeted Playwright
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
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
- Prefer source-backed execution truthfulness over new unsupported device claims.
- Do not imply a per-watch compatibility engine that the product does not actually have.

## 10/10 Quality Bar

- The new details should feel specific and useful, not like vague legalese.
- Required states:
  - loading: unchanged existing builder loading behavior
  - empty: unchanged fallback state
  - error: device/CSS caveats surface as review details, not route crashes
  - retry/offline: existing save failure behavior remains unchanged
- Accessibility:
  - compatibility details remain visible plain text inside the existing support panels
  - no extra click is required to preserve semantic meaning in exported outputs
- Performance:
  - readiness checks remain cheap relative to existing derived totals
- Business logic:
  - identical draft inputs always produce identical readiness/export diagnostics
  - save/reopen must not erase or invent device/CSS cautions

## Checkpoint Log

- `2026-04-07 | aad26ed | feature PR #386 merged to `main` after required CI returned green; the slice now ships pool-only review guards for `Unspecified` pool size, `Use last rest interval`, and CSS-relative targets, plus deterministic install-prompt gate coverage that no longer depends on the live published-course dataset | next: close out the brief in a docs-only PR`
- `2026-04-07 | 05bcceb | hardened the mobile install-prompt Playwright spec to stub deterministic course content and jump to a canonical lesson id so pre-merge no longer depends on the current published-course dataset; local `npm run verify:pre-merge` passed (`96 passed / 318 skipped`) | next: push, refresh PR checks, and merge when CI is green`
- `2026-04-07 | a1183c2 | added pool-only readiness truthfulness guards for Unspecified pool size, use-last-rest repeat blocks, and CSS-relative targets in the shared Garmin/export layer; refreshed shared + hub tests; local validation passed via lint:briefs:all, typecheck, targeted vitest, targeted Playwright, and verify:pre-pr (96 passed / 318 skipped) | next: commit, push, open PR, and monitor CI`
- `2026-04-07 | in progress | created a dedicated compatible-device execution truthfulness slice after the wording/output parity wave closed; the next source-backed Garmin gap is no longer labels, but pool features whose execution still varies by device or CSS baseline (`Unspecified` pool size, `Use last rest interval`, and CSS-relative targets) | next: update shared readiness logic, refresh targeted tests, and run the pre-PR gate`
