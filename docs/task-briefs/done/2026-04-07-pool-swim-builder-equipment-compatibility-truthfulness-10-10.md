# Task Brief: Pool Swim Builder Equipment Compatibility Truthfulness (10/10)

## Metadata

- `id`: `2026-04-07-pool-swim-builder-equipment-compatibility-truthfulness-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-07`
- `updated`: `2026-04-07`

## Goal

FreeSwimming keeps pool-step equipment in handoff, PDF, and Garmin-ready export context while making the remaining `review` warning truthful about the actual gap: manual Garmin translation, not a missing FreeSwimming export surface.

## Why This Brief Exists

- The pool parity wave already shipped:
  - separate pool/open-water entry,
  - pool field parity,
  - repeat/final-rest parity,
  - compatibility guards for documented step-cap and send-off limits,
  - source-backed cleanup for supported pool strokes and drill semantics.
- After those slices, the main unresolved readiness warning left in pool mode is step-level equipment metadata.
- Current copy is too vague and slightly misleading:
  - it says `Garmin/PDF adapter support for equipment metadata still needs explicit review`,
  - but FreeSwimming already preserves equipment labels in handoff text, printable PDF output, and Garmin-ready JSON context.
- The real unresolved question is narrower:
  - Garmin's documented pool workout creator does not expose a matching step-level equipment field in the source-backed support material we currently rely on,
  - so equipment still needs manual Garmin translation even though FreeSwimming exports already keep the label visible for coach/manual handoff use.

## Dependencies And Boundaries

- Parent parity direction:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-parity-10-10.md`
- Shipped prerequisite slices:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-compatibility-guards-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-swim-builder-supported-strokes-and-drills-parity-10-10.md`
- Primary implementation surfaces:
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`

## Product Direction Locked By This Brief

- This slice is `pool`-specific compatibility truthfulness work.
- Step-level equipment metadata remains a `review` item in pool mode.
- FreeSwimming must stop implying that PDF/handoff/export context is missing for equipment.
- The warning must instead explain:
  - the equipment label is already preserved in FreeSwimming outputs,
  - the unresolved gap is Garmin-compatible manual translation/mapping.
- Do not add new schema fields, device pickers, or save-blocking validation.
- Do not claim Garmin support for step-level equipment metadata without source-backed documentation.

## Compatibility Decisions Locked By This Slice

1. Equipment remains `review`:
   - pool steps with non-`none` equipment still enter Garmin/export `review` state.
2. Truthful wording:
   - review detail must say the equipment label is preserved in FreeSwimming output,
   - and the remaining work is manual Garmin translation because a matching Garmin field is not documented in the support contract we currently rely on.
3. Output continuity:
   - handoff text, printable PDF review details, and Garmin-ready JSON diagnostics inherit the same truthful equipment detail from shared readiness.
4. Scope limit:
   - no change to saved draft schema,
   - no removal of step-level equipment authoring,
   - no new step-level device-specific mapping engine.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                  | Evidence                                |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Product goals and IA                          | `target`     | Pool readiness explains the real remaining equipment gap without implying that FreeSwimming handoff/PDF/export surfaces are missing.                          | source review + targeted tests          |
| UX flow clarity                               | `target`     | A swimmer can understand that equipment is preserved in FreeSwimming outputs but still needs manual Garmin translation.                                        | targeted tests + manual QA              |
| Accessibility (a11y)                          | `supporting` | Supporting only: this slice changes text only and must preserve the existing text-first, screen-reader-legible readiness panel.                               | code review                             |
| Visual design quality                         | `supporting` | Supporting only: the equipment detail should become calmer and more precise without adding new chrome.                                                         | manual QA                               |
| Business logic correctness and data integrity | `target`     | Pool readiness/export diagnostics stay `review` for equipment while accurately describing the real unresolved mapping boundary.                                | unit tests + integration review         |
| Admin editor ergonomics                       | `target`     | The owner can keep using pool equipment labels without being told that FreeSwimming's own export surfaces are missing the information.                         | targeted tests + manual QA              |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the copy refinement does not materially affect `/my-library` or workout-detail responsiveness.                                                | verify + code review                    |
| Data placement and sync boundaries            | `target`     | The slice remains a derived-readiness text change only and introduces no new persisted compatibility flags or duplicate draft state.                           | brief contract + code review            |
| Caching and invalidation strategy             | `supporting` | Supporting only: readiness stays derived from current draft state with no new cache invalidation rules.                                                        | integration review                      |
| Reliability and failure handling              | `target`     | Equipment still fails closed into `review`, but the user-facing explanation no longer overstates the unresolved surface.                                       | negative-path tests + manual QA         |
| Security and authz                            | `supporting` | Supporting only: no route/API permission boundary changes.                                                                                                      | scope review                            |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes owner-scoped workout guidance only and introduces no new sensitive data path or disclosure contract.                            | explicit scope rationale                |
| Content governance                            | `target`     | Equipment compatibility copy stays aligned to the documented Garmin pool contract and FreeSwimming's actual export behavior instead of stale umbrella wording. | source review + code review             |
| Admin workflow and editability                | `target`     | Pool workouts with equipment remain editable, exportable, and review-visible without misleading support copy.                                                  | targeted tests + manual QA              |
| SEO and crawlability                          | `N/A`        | N/A because this slice changes no public route, metadata, or search/discoverability contract.                                                                  | explicit scope rationale                |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing route, metadata, or discoverability contract.                                                               | explicit scope rationale                |
| Analytics and KPI observability               | `supporting` | Supporting only: readiness summaries remain inspectable without adding new analytics instrumentation.                                                           | scope review                            |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, entitlement, checkout, or subscription reporting path changes.                                                                | explicit scope rationale                |
| Incident response and support operations      | `supporting` | Supporting only: support output should make it clear that equipment labels are already preserved in FreeSwimming exports and only Garmin translation remains. | support output review                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payouts, billing, or operator reporting flow changes.                                                                   | explicit scope rationale                |
| i18n operational readiness                    | `N/A`        | N/A because this slice adjusts internal English compatibility messaging only and must keep the semantics centralized for later localization work.               | explicit scope rationale                |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing workout readiness/export helper stack; do not add new dependencies or a second compatibility engine.                                        | dependency diff + architecture review   |
| Testing and QA automation                     | `target`     | Coverage protects the equipment truthfulness cleanup before PR update, and `npm run verify:pre-pr` passes on the final branch diff.                            | unit coverage + `verify:pre-pr`         |
| Scalability and cost efficiency               | `supporting` | Supporting only: the copy cleanup remains a small deterministic derived check with no extra writes or route duplication.                                        | code review                             |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice stays reversible as a shared-logic/readiness change with no schema migration.                                                       | diff review + rollback note             |

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
  - labels such as `Fins`, `Kickboard`, and the equipment review copy are mutable UI labels, not identifiers.
- Mutability rules:
  - step layout and support copy remain editable in place.
- Rename vs repurpose policy:
  - changing a workout to resolve or remove an equipment compatibility warning is an in-place edit to the same workout.
- Compatibility contract:
  - older saved workouts using equipment metadata must still load safely and show the same review-state guidance, now with more truthful wording.
- Observability and repair:
  - unresolved equipment translation requirements must remain explicit until a later source-backed parity slice lands.

## Scope

- Update the shared pool equipment readiness detail so it distinguishes FreeSwimming output preservation from unresolved Garmin translation.
- Keep handoff text, printable PDF review details, and Garmin-ready JSON diagnostics aligned through the shared readiness helper.
- Refresh targeted tests and expectations that depend on the old equipment wording.

## Out Of Scope

- New schema fields or migrations
- Removing step-level equipment authoring
- Claiming Garmin support for step-level equipment metadata
- Device-picker or per-device mapping logic
- Step-cap, send-off, stroke, or drill compatibility changes
- Open-water compatibility redesign

## Acceptance Criteria

1. Pool steps with non-`none` equipment still enter Garmin/export `review` state.
2. The equipment review detail explicitly says the equipment label is already preserved in FreeSwimming output.
3. The equipment review detail explicitly says manual Garmin translation is still required because a matching Garmin field is not documented in the current pool support contract.
4. Handoff text, PDF review details, and Garmin-ready JSON diagnostics inherit the updated truthful detail.
5. Existing save/load flows stay unchanged after the copy refinement.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`
  - `tests/unit/workouts-shared.test.ts`
  - `tests/unit/workout-builder-hub.test.tsx`
- targeted `playwright`
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
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
- Prefer source-backed truthfulness over unsupported new Garmin claims.
- Do not imply that FreeSwimming's own handoff/PDF/export outputs are dropping equipment context when they are not.

## 10/10 Quality Bar

- The equipment review wording should feel more precise and less alarming, not more verbose.
- Required states:
  - loading: unchanged existing builder loading behavior
  - empty: unchanged fallback state
  - error: unresolved equipment translation stays a review detail, not a route crash
  - retry/offline: existing save failure behavior remains unchanged
- Accessibility:
  - readiness details remain plain text inside the existing support panels
- Performance:
  - readiness checks remain linear in step count and cheap relative to existing derived totals
- Business logic:
  - equipment stays review-only,
  - FreeSwimming output-preservation truth is explicit,
  - no new persistence behavior is introduced

## Checkpoint Log

- `2026-04-07 | in progress | created the equipment truthfulness brief after the supported-strokes-and-drills slice closed; scope is narrowed to the one remaining pool review surface where copy still implies missing FreeSwimming export support instead of unresolved Garmin translation | next: update shared readiness wording, refresh targeted tests, and run focused validation before the full pre-PR gate`
- `2026-04-07 | implementation + targeted validation | updated the shared equipment review detail so it now says FreeSwimming already keeps equipment labels in handoff/PDF/Garmin-ready export output while manual Garmin translation still remains unresolved, then passed npm run lint:briefs:all, npm run typecheck, targeted vitest, and targeted desktop-chromium Playwright | next: run npm run verify:pre-pr on the full branch diff, then commit/push/open the PR if green`
- `2026-04-07 | full pre-PR gate green | npm run verify:pre-pr passed on the full branch diff with 96 passed / 318 skipped after the updated equipment review detail landed; no deterministic regressions surfaced in the broader regression matrix | next: commit, push, and open the feature PR, then run npm run verify:pre-merge before merge recommendation`
- `2026-04-07 | pre-merge gate green | npm run verify:pre-merge passed with 96 passed / 318 skipped, and the private-gate leg was correctly skipped because SITE_LOCK_ENABLED!=1 in this local run; perf-budget trend recommended hold, not tighten, after this first green sample on the new slice | next: keep the PR body/check evidence aligned, then wait for required GitHub checks before merge`
- `2026-04-07 | merged + closeout | PR #380 merged to main as `1fac0e7` after required GitHub checks returned green, the feature branch was deleted on origin, and this brief moved to done to reflect the shipped truthfulness cleanup for pool equipment compatibility wording | next: none`
