# Task Brief: Workout Domain Contract Decomposition (10/10)

## Metadata

- `id`: `2026-05-05-workout-domain-contract-decomposition-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-05`
- `updated`: `2026-05-05`

## Goal

Decompose the swim workout/session domain contract so manual builder, AI session generation, saved-workout view, program builder, poolside note, PDF, and Garmin-ready export reuse smaller typed boundaries without changing persisted semantics.

## Why This Brief Exists

The platform architecture audit found the highest architecture concentration in:

- `lib/workouts/shared.ts` at `6157` lines,
- `components/my-library/workouts/WorkoutEditor.tsx` at `4808` lines,
- `lib/session-generator-v1/server.ts` at `1663` lines,
- `lib/session-generator-v1/shared.ts` at `1526` lines,
- `components/my-library/workouts/sessionStepSurfaceContract.ts` at `1252` lines.

The current behavior is release-safe, but future AI/program/export work should not keep adding logic to the same files.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                        | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Each changed workout/session consumer names its reference surface and adapter contract before implementation.                             | architecture diff + brief review         | `5/5`                   |
| UX flow clarity                               | `target`     | Manual builder, saved view, AI preview, program cards, poolside/PDF/export keep equivalent step meaning after extraction.                 | targeted unit tests + screenshot handoff | `5/5`                   |
| Visual design quality                         | `target`     | Any changed step UI reuses `SessionStepSurfaceRenderer` or documents a justified exception with `after/reference` screenshots.            | screenshot artifacts + code review       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Normalization, totals, repeat/rest grouping, readiness, export diagnostics, and persistence semantics remain byte/behavior compatible.    | golden tests + route/export tests        | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin does not own workout authoring in this slice, but support diagnostics must stay readable if touched.               | scope review                             | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Changed step controls preserve keyboard order, labels, and focus behavior.                                                                | component tests + targeted Playwright    | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Core changed routes stay within budgets and avoid adding more than `10%` JS transfer for the affected entrypoint.                         | perf budget output + bundle diff         | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Persisted workout/session draft data remains server-canonical; local editor draft state remains local until explicit save.                | data-boundary review + persistence tests | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Save/update/delete/export reads keep current cache/freshness behavior and invalidate affected workout/program surfaces deterministically. | route tests + cache notes                | `5/5`                   |
| Reliability and failure handling              | `target`     | Invalid stored/generated drafts fail with deterministic repair guidance, not blank UI or silent coercion.                                 | negative-path tests                      | `5/5`                   |
| Security and authz                            | `target`     | Protected workout routes continue to fail closed for unauthenticated/unauthorized users.                                                  | negative-path route tests                | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new sensitive fields should be logged or exported beyond existing workout/profile context.                            | payload/log review                       | `4/5`                   |
| Content governance                            | `target`     | The canonical step display/export contract remains documented in `docs/design/session-step-surface-contract.md`.                          | doc diff + contract tests                | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin CRUD workflow changes are intended.                                                                             | scope rationale                          | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because authenticated workout/session surfaces are not public crawl targets in this refactor.                                         | explicit scope rationale                 | `N/A`                   |
| AI discoverability                            | `supporting` | Supporting only: AI session output consumes this private contract; no public AI-discoverable surface changes.                             | generator contract tests                 | `4/5`                   |
| Analytics and KPI observability               | `target`     | Existing generate/save/export events remain stable and safe; new events require typed event names.                                        | analytics tests + event diff             | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: no checkout or entitlement mutation is owned by this slice.                                                              | scope rationale                          | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: export/readiness failures must leave operator-readable diagnostics if touched.                                           | diagnostics review                       | `4/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance ledger or reconciliation data changes; exports must not affect entitlement reporting.                         | explicit finance scope rationale         | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: extracted labels and diagnostics should remain centralized enough for later localization.                                | copy/constant review                     | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing React/Next/TypeScript helpers and add no dependency for decomposition.                                                       | package diff + code review               | `5/5`                   |
| Testing and QA automation                     | `target`     | Shared contracts get focused unit/component tests; route tests cover only route-specific behavior.                                        | targeted tests + `verify:pre-pr`         | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Extraction reduces duplication and avoids new expensive recomputation on editor/render/export paths.                                      | perf review + unit coverage              | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Refactor ships in reversible slices with no schema migration unless separately briefed.                                                   | PR plan + rollback notes                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - keep `WorkoutEditor` as the mature reference surface for edit behavior,
  - keep route pages responsible for data loading and shared renderers responsible for display only.
- TypeScript/domain:
  - split pure normalization, totals, display sections, readiness diagnostics, and export adapters into named modules.
- Supabase:
  - no schema/RLS change in the first decomposition slice unless explicitly added.
- UI:
  - reuse `components/my-library/workouts/SessionStepSurfaceRenderer.tsx`.
- Testing:
  - extend `tests/unit/workouts-shared.test.ts`, `tests/unit/session-step-surface-contract.test.ts`, route tests, and E2E only where behavior changes.

## Data Placement And Sync Contract

- Server-canonical:
  - persisted workout/session drafts and saved workout metadata in Supabase.
- Local-only:
  - unsaved manual editor drafts, temporary display mode, and transient preview state.
- Sync policy:
  - no hidden save during decomposition; explicit save/update/delete remains the only persistence boundary.
- Cache/invalidation:
  - changed read/export paths must keep current dynamic/private behavior unless a child PR explicitly changes it with tests.

## Identity And Rename Contract

- Canonical stable ID:
  - saved workout IDs remain immutable and independent of title, pool size, or step order.
- Human-readable identifiers:
  - title and labels remain editable presentation.
- Rename vs repurpose:
  - semantic replacement of a saved workout should remain an explicit save/update workflow, not an implicit ID rewrite.
- Compatibility:
  - stored legacy drafts must normalize or fail with deterministic repair guidance.

## Scope

- Workout/session shared domain helpers.
- Manual workout editor adapter boundaries.
- AI generated session draft validation/display handoff.
- Saved workout quick view, program scheduled-workout cards, poolside/PDF/export consumers where touched by extraction.

## Active Slice

- First implementation slice extracts the workout persistence normalization contract from `lib/workouts/shared.ts` into `lib/workouts/persistence.ts`.
- No UI, PDF HTML, step renderer, route behavior, schema, RLS, or persisted semantics change in this slice.
- Compatibility is preserved through a `shared.ts` re-export while server-side persistence callers move to the direct module boundary.
- Server failure-mode evidence: `buildWorkoutInsert`, `buildWorkoutUpdate`, and stored-row hydration still route invalid drafts through the same deterministic `{ ok: false, error }` persistence contract; this refactor adds no unexpected 500 path or new API/server action branch.

## Out Of Scope

- New workout features.
- Garmin partner API delivery.
- Schema/RLS migrations unless a later slice explicitly owns them.
- Broad visual redesign.

## Acceptance Criteria

1. The first implementation slice removes at least one meaningful responsibility from `lib/workouts/shared.ts` or `WorkoutEditor` without behavior drift.
2. Shared session-step contracts remain the only reference for equivalent step displays.
3. Persisted workout data, export payloads, and invalid-draft handling remain deterministic.
4. Targeted tests prove behavior parity before broad gates.

## Validation

- `npm run lint:briefs`
- targeted unit/component tests for changed contracts
- targeted E2E/screenshot handoff for changed visual surfaces
- `npm run verify:pre-pr`

## Checkpoint Log

- `2026-05-05 | done | merged PR #610 at 4ade1b4 | persistence normalization extracted to lib/workouts/persistence.ts with compatibility re-export, targeted tests, verify:pre-pr, verify:pre-merge, and required CI green | next: no follow-up required for this slice`
- `2026-05-05 | in-progress | branch feat/workout-domain-contract-decomposition-2026-05-05 | first slice selected: extract persistence normalization from shared workout domain helpers without UI or schema behavior changes | next: run targeted unit/type validation, then pre-PR gate`
- `2026-05-05 | planned | created by platform architecture audit as the highest-priority decomposition follow-up for workout/session domain concentration | next: execute after current audit PR is merged and before adding broad AI/program step-surface scope`
