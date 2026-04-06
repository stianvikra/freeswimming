# Task Brief: Pool Swim Builder Field Parity (10/10)

## Metadata

- `id`: `2026-04-06-pool-swim-builder-field-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-06`
- `updated`: `2026-04-06`

## Goal

FreeSwimming's manual `pool` builder looks and reads like a dedicated Garmin-style `Pool Swim` authoring surface at the field level, while `open water` keeps its separate non-parity flow.

## Why This Brief Exists

- The first parity slice already split manual entry into separate `Build pool session` and `Build open water session` actions.
- The next most visible mismatch is no longer route structure; it is the field model and wording inside the pool builder itself.
- Current manual `pool` editing still exposes generic FreeSwimming concepts that Garmin pool authoring does not emphasize in the same way:
  - `Training profile`
  - top-level `Session strokes`
  - top-level `Equipment`
  - `Pool length` wording instead of `Pool Size`
  - generic step labels like `Category`, `Focus tag`, and `Notes`
- Garmin support material for pool workouts explicitly documents pool-workout-oriented wording and choices such as:
  - `Pool Swim`
  - `Pool Size`
  - `Unspecified`
  - `Open Swim Steps`
  - `Send-off Time`
  - `Add Step Note`
- This slice deliberately stops before repeat/rest parity so the field model can be tightened without combining deep builder logic changes into the same PR.

## Dependencies And Boundaries

- Parent parity direction:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-parity-10-10.md`
- Broader active builder parent:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Likely implementation surfaces:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/lib/session-generator-v1/shared.ts`
  - `/Users/stianvikra/freeswimming/lib/workouts/manual.ts`
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`

## Product Direction Locked By This Brief

- `Pool` remains the only Garmin-parity target in the manual swim builder.
- `Open water` remains visually and behaviorally separate and is not pulled into pool wording.
- This slice changes visible pool-builder fields and copy before deeper repeat/rest semantics.
- Hidden non-parity metadata may remain in the canonical draft model temporarily if:
  - it is not shown in the manual pool UI,
  - persistence/export stays deterministic,
  - later slices can still remove or remap it safely.

## Field-Parity Decisions Locked By This Slice

1. Pool heading and framing:
   - manual `pool` builder should present itself as `Pool Swim`, not a generic swim form.
2. Pool size wording:
   - `Pool length` becomes `Pool Size` in pool mode.
   - pool quick choices should prioritize Garmin-like choices:
     - `25m`
     - `50m`
     - `Unspecified`
   - uncommon/custom pool sizes may remain available through an exact input for compatibility.
3. Unspecified pool size:
   - manual pool workouts may save with `poolLengthM: null`.
   - summaries and handoff/export text must stay truthful when pool size is unspecified.
4. Pool-only top-level cleanup:
   - remove `Training profile` from manual pool UI.
   - remove top-level `Session strokes` from manual pool UI.
   - remove top-level `Equipment` from manual pool UI.
   - leave existing open-water/general behavior alone unless a shared label change is clearly better everywhere.
5. Step wording:
   - `Category` becomes `Step type`.
   - `Focus tag` becomes `Drill type`.
   - `Notes` becomes `Step note`.
   - `Lap button press` becomes `Open swim`.
   - `Fixed rest` becomes `Rest time`.
6. Explicit deferral:
   - do not implement Garmin repeat/final-rest semantics in this slice.
   - do not claim full parity after this slice alone.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                          | Evidence                                  |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Product goals and IA                          | `target`     | Manual `pool` editing reads as a dedicated `Pool Swim` flow and no longer exposes the most confusing non-Garmin top-level controls.                                   | manual QA + targeted tests                |
| UX flow clarity                               | `target`     | A swimmer editing a pool workout can find `Pool Size`, understand `Unspecified`, and edit step fields without mentally translating generic FreeSwimming labels.        | manual QA + e2e                           |
| Accessibility (a11y)                          | `target`     | Renamed pool controls remain keyboard reachable, keep explicit labels, and preserve form semantics for `Pool Size`, `Unspecified`, and the renamed step fields.       | targeted tests + manual QA                |
| Visual design quality                         | `target`     | The pool metadata panel feels intentionally simplified rather than like a generic builder with hidden leftovers.                                                       | screenshot review + manual QA             |
| Business logic correctness and data integrity | `target`     | Pool workouts save/load deterministically with either explicit or unspecified pool size, and hidden pool metadata does not corrupt canonical workout payloads.         | unit tests + integration review           |
| Admin editor ergonomics                       | `supporting` | Supporting only: the owner can still inspect and repeatedly edit canonical pool workouts without missing critical authoring controls.                                  | manual QA                                 |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: pool field cleanup does not materially regress `/my-library` or workout-detail responsiveness.                                                        | targeted review + verify                  |
| Data placement and sync boundaries            | `target`     | The slice continues to write through the existing canonical workout contract and treats `poolLengthM: null` as an intentional server-canonical state for pool mode.   | brief contract + code review              |
| Caching and invalidation strategy             | `supporting` | Supporting only: pool field cleanup keeps existing `router.refresh` and canonical save flows intact.                                                                   | code review                               |
| Reliability and failure handling              | `target`     | Invalid custom pool size input fails clearly, while `Unspecified` remains a deliberate valid state instead of looking like missing data or a broken save.             | negative-path tests + manual QA           |
| Security and authz                            | `supporting` | Supporting only: no changed route or API weakens authenticated owner-only workout access.                                                                              | existing auth boundaries + scope review   |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes private workout-builder labels and field visibility only, not personal-data handling or public disclosure.                              | explicit scope rationale                  |
| Content governance                            | `target`     | Garmin-like wording changes in pool mode stay centralized and documented so the product does not drift into undocumented half-parity copy.                             | brief decisions + code review             |
| Admin workflow and editability                | `target`     | Pool builders can complete normal authoring without relying on hidden meaning in `Training profile`, `Session strokes`, or generic field names.                       | manual QA + targeted tests                |
| SEO and crawlability                          | `N/A`        | N/A because authenticated My Library builder routes are private and uncrawlable by design.                                                                             | explicit scope rationale                  |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing route, metadata, or discoverability contract.                                                                       | explicit scope rationale                  |
| Analytics and KPI observability               | `supporting` | Supporting only: the pool/open-water split remains interpretable after field renames even without new analytics vendor instrumentation.                                | scope review                              |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, or billing/reporting workflow changes.                                                                                  | explicit scope rationale                  |
| Incident response and support operations      | `N/A`        | N/A because this slice does not change the builder entry actions or recovery path; no Help/Guide or runbook contract currently references the renamed internal fields. | explicit scope rationale                  |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, reporting, payouts, or subscription operations are touched.                                                                     | explicit scope rationale                  |
| i18n operational readiness                    | `N/A`        | N/A because this slice adjusts internal English product copy only, but it must keep wording centralized rather than embedding semantics in scattered strings.          | explicit scope rationale                  |
| Stack-fit and dependency discipline           | `target`     | Reuse the current workout stack and canonical draft model; do not add a second persistence layer or new dependency just to rename/hide pool fields.                    | dependency diff + architecture review     |
| Testing and QA automation                     | `target`     | Coverage protects pool-only field visibility, `Unspecified` save/load behavior, and the key wording updates before PR update.                                         | unit/e2e coverage + `verify:pre-pr`       |
| Scalability and cost efficiency               | `supporting` | Supporting only: field cleanup should reduce authoring friction without adding extra API churn or duplicate builder paths.                                             | code review + manual QA                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this slice remains reversible without schema migration or destructive data backfill.                                                                   | diff review + rollback note               |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`
  - canonical workout rows and saved draft payloads in the workouts table
  - persisted `environment`, `poolLengthM`, step fields, and export/handoff payloads
- Local-only:
  - metadata panel open/closed state
  - transient pool-size input text while the user types
  - local validation and helper messaging
- Sync policy:
  - saves continue through the existing authenticated workout update/create flow
  - `poolLengthM: null` is an intentional canonical value for pool workouts when the user chooses `Unspecified`
  - field visibility changes do not create a second hidden draft entity
- Retention and sensitivity:
  - no new sensitive data class is added
  - this slice changes authoring semantics only
- Cache/invalidation:
  - existing navigation, refresh, and canonical save boundaries remain authoritative

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical identity.
- Human-readable identifiers:
  - labels such as `Pool Swim`, `Pool Size`, `Unspecified`, `Step type`, and `Step note` are mutable UI labels, not identifiers.
- Mutability rules:
  - workout titles remain editable in place
  - pool-builder copy can change in place
- Rename vs repurpose policy:
  - this slice renames visible fields only; it does not create a new workout entity or repurpose saved IDs
- Compatibility contract:
  - older saved workouts that still contain session-type/effort/stroke allowlist metadata must continue to load safely
  - hidden metadata may remain persisted until a later schema/model cleanup slice removes or remaps it explicitly
- Observability and repair:
  - invalid custom pool size input must surface clear save validation instead of silently coercing to a misleading value

## Scope

- Manual pool-builder metadata heading/copy cleanup
- `Pool Size` wording and `Unspecified` state
- Pool-only hiding of non-parity top-level metadata sections
- Pool step-label wording cleanup where Garmin terminology is already documented
- Truthful summary/handoff/export wording for unspecified pool size
- Relevant unit + e2e coverage

## Out Of Scope

- Garmin repeat/final-rest behavior
- Step-count cap enforcement
- Yard-mode support
- Open-water builder redesign
- AI generator redesign
- Schema migration or destructive data cleanup

## Acceptance Criteria

1. Manual pool editing surfaces itself as a dedicated `Pool Swim` builder.
2. Manual pool builder shows `Pool Size` and offers `25m`, `50m`, and `Unspecified` quick choices.
3. Manual pool workouts can save and reload with `poolLengthM: null` when `Unspecified` is chosen.
4. Manual pool builder no longer shows top-level `Training profile`, `Session strokes`, or `Equipment`.
5. Pool step editing uses the updated wording for `Step type`, `Drill type`, `Step note`, `Open swim`, and `Rest time`.
6. Open-water builder behavior stays functionally unchanged.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest` for workout builder/shared contracts
- targeted Playwright for `/my-library/workouts`
- `npm run verify:pre-pr`

## Local Tooling Prerequisite

- Node.js LTS and npm must be available on the machine used for validation.
- Before PR handoff:
  - `npm run lint:briefs`
  - `npm run verify:pre-pr`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3100/my-library`
  - desktop Chromium during implementation
- Vercel preview:
  - PR preview URL from checks
- Recommended follow-up matrix:
  - desktop Chrome
  - desktop Safari/WebKit
  - iPhone Safari viewport

## Constraints

- Preserve the existing canonical workout data model for this slice.
- Prefer pool-only UI specialization over broad shared-form rewrites.
- Do not hide a field in pool mode unless the remaining persistence/export behavior stays deterministic.
- Do not claim full Garmin parity in PR copy; this is a field/wording slice only.

## 10/10 Quality Bar

- Pool mode should feel obviously more specific and calmer than the current generic swim builder.
- Required states stay clear:
  - loading: unchanged existing builder loading state remains intact
  - empty: new pool drafts still open into an editable first-step state
  - error: invalid pool size save attempts explain the fix
  - retry: save retry path remains unchanged
  - offline: existing save failure UI remains truthful
- Accessibility:
  - renamed controls keep clear labels and keyboard access
  - `Unspecified` pool-size action is discoverable and screen-reader legible
- Performance:
  - no material route-level regression on `/my-library` or workout detail
- Business logic:
  - `poolLengthM: null` is intentional, not a malformed state
  - hidden pool metadata does not create silent drift in saved workouts

## Checkpoint Log

- `2026-04-06 | in progress | created follow-up pool parity brief for field/wording cleanup after PR #370/#371 closed the entry split and moved it to in-progress | next: implement pool-only field parity and validate locally`
- `2026-04-06 | implementation + targeted validation | manual pool builder now presents Pool Swim / Pool Size with explicit Unspecified handling, hides non-parity top-level pool metadata, uses Garmin-style pool step wording, and keeps shared summaries truthful for unspecified pool size; passed npm run typecheck, targeted vitest, targeted desktop-chromium Playwright, and npm run lint:briefs:all | next: commit this slice, rerun npm run verify:pre-pr on the committed diff, then open the PR`
