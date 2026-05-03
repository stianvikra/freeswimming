# Task Brief: Workout PDF Visual Parity With Poolside Note (10/10)

## Metadata

- `id`: `2026-04-15-workout-pdf-visual-parity-with-poolside-note-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-15`
- `updated`: `2026-05-03`

## Goal

Make the standard workout PDF feel like the same premium FreeSwimming print system as the Poolside Note, while preserving the PDF's distinct job as the fuller reference artifact.

## Why This Brief Exists

- The Poolside Note has now been pushed toward a much stronger brand and layout standard.
- The standard workout PDF still risks reading like an older parallel print surface instead of part of the same system.
- That gap creates avoidable brand inconsistency:
  - different header language,
  - different hierarchy,
  - different spacing and card treatment,
  - different print impression for two artifacts the same swimmer may see in the same workflow.
- The owner-approved direction is explicit:
  - finish and close the current builder brief first,
  - then create a separate brief for Workout PDF visual parity with Poolside Note.
- This brief exists to lock the next design/implementation slice before code changes begin.

## Dependencies And Boundaries

- Builder/runtime parent brief:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Upstream workout PDF/export delivery:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-02-28-workout-export-adapters-garmin-ready-pdf-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-02-28-workout-export-adapters-garmin-ready-pdf-10-10.md)
- Session-step reference contract:
  - [/Users/stianvikra/freeswimming/docs/design/session-step-surface-contract.md](/Users/stianvikra/freeswimming/docs/design/session-step-surface-contract.md)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/sessionStepSurfaceContract.ts](/Users/stianvikra/freeswimming/components/my-library/workouts/sessionStepSurfaceContract.ts)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/SessionStepSurfaceRenderer.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/SessionStepSurfaceRenderer.tsx)
- Upstream poolside-note design system direction:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-brand-surface-reframe-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-brand-surface-reframe-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-header-clarity-and-landscape-parity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-header-clarity-and-landscape-parity-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-layout-and-preview-favicon-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-layout-and-preview-favicon-polish-10-10.md)
- Likely implementation surfaces when execution starts:
  - [/Users/stianvikra/freeswimming/lib/workouts/shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
  - [/Users/stianvikra/freeswimming/lib/brand.ts](/Users/stianvikra/freeswimming/lib/brand.ts)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts](/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked boundaries:
  - no workout schema change,
  - no Garmin/export payload contract change,
  - no builder authoring logic change unless strictly needed for PDF truthfulness,
  - no poolside-note redesign inside this brief,
  - no direct React reuse of `SessionStepSurfaceRenderer` inside the PDF HTML renderer; use its contract as the semantic reference only,
  - no new dependency.

## Product Direction Locked By This Brief

1. The standard workout PDF and Poolside Note must feel like one FreeSwimming print family.
2. They must not become copies of each other.
3. The workout PDF keeps the richer reference role:
   - fuller step detail,
   - stronger full-session readability,
   - print-safe reference use beyond pool deck glanceing.
4. The Poolside Note keeps the faster lane-side glance role.
5. Brand parity should come through:
   - shared logo system,
   - shared typographic discipline,
   - shared spacing logic,
   - shared color logic,
   - shared terminology,
   - shared print polish.
6. The PDF must not regress canonical truthfulness, export reliability, or Garmin readiness.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                  | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Workout PDF must clearly read as the fuller reference artifact within the same print family as Poolside Note, with no identity confusion between the two artifacts. | design review + screenshot QA          | `5/5`                   |
| UX flow clarity                               | `target`     | Header, totals, focus, swimmer identity, and step hierarchy must scan immediately on first read in both preview and print.                                          | local QA + e2e screenshot review       | `5/5`                   |
| Visual design quality                         | `target`     | Workout PDF must match Poolside Note brand quality without becoming a layout clone; spacing, typography, border treatment, and hierarchy must feel intentional.     | local visual QA + preview review       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | PDF copy and layout changes must preserve exact workout content, distances, rests, repeats, and canonical ordering with no export-data drift.                       | unit tests + e2e assertions            | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: builder authoring controls may be touched only insofar as PDF preview truthfulness or naming parity requires it.                                   | scope review + code review             | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Preview and print semantics must remain readable, keyboard reachable, and visually high-contrast, with no layout that hides core workout data.                      | manual QA + code review                | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: preview rendering should not introduce new heavy assets, extra fetches, or obvious route regressions.                                              | `npm run build` + local preview QA     | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Local preview state and saved canonical workout data must stay clearly separated so PDF output remains deterministic for draft vs saved states.                     | code review + e2e/manual QA            | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: save/reset/open-preview actions must invalidate stale PDF preview composition deterministically.                                                   | manual QA + existing preview tests     | `4/5`                   |
| Reliability and failure handling              | `target`     | Preview/pop-up/print flow must not blank, hang, or print empty pages on changed PDF surfaces.                                                                       | Playwright regression + manual QA      | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: private workout preview/export access model remains unchanged and must continue to fail closed.                                                    | existing auth review + scope rationale | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: visible swimmer/session information must remain intentional and limited to already-approved owner-facing print data.                               | copy review + scope rationale          | `4/5`                   |
| Content governance                            | `target`     | PDF wording and labels must align with Poolside Note terminology and canonical workout semantics; no stale internal labels or divergent naming may remain.          | copy audit + unit/e2e assertions       | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no new workflow stage is introduced; the task refines output clarity and preview parity.                                                           | scope rationale                        | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is a private authenticated preview/print artifact, not a public crawl surface.                                                                     | explicit scope rationale               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because the brief changes no public metadata or public semantic surface for model retrieval.                                                                    | explicit scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no new analytics contract is required; success is judged through design QA and regression coverage rather than new events.                              | explicit scope rationale               | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because the brief does not change pricing, entitlement, billing, or conversion behavior.                                                                        | explicit scope rationale               | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice does not change support runbooks or alerting; it improves a private print preview artifact and should remain operationally simple.           | explicit scope rationale               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, refund, or reconciliation path is changed by PDF visual parity work.                                                                | explicit scope rationale               | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because the task tightens one English-only private print artifact contract and adds no locale architecture or translation storage.                              | explicit scope rationale               | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The redesign must reuse the existing PDF rendering/export stack and brand manifest with no unnecessary dependency or alternate print engine.                        | dependency diff + code review          | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/e2e coverage must lock the new PDF hierarchy, terminology parity, preview stability, and non-empty printable output; repo verification gates must stay green.  | updated tests + verification gates     | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: parity work must not add duplicate render passes, large image bloat, or avoidable CI/runtime overhead.                                             | diff review + build review             | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the work remains code-only, rollback-safe, and isolated from data/schema migrations.                                                               | PR diff + rollback note                | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical data:
  - saved workout content, step order, and swimmer/session metadata already used by the PDF and Poolside Note flows.
- Local-only data:
  - current builder draft values before save,
  - preview-open state,
  - any local print-layout or print-style selection already supported by the surface.
- Sync policy:
  - PDF preview may reflect current local draft immediately,
  - saved canonical output must remain available and clearly distinguished where the product already separates draft vs saved,
  - visual parity work must not write back presentation-only choices into canonical workout storage.
- Retention and sensitivity:
  - no new persistent settings entity,
  - no expanded personal data footprint,
  - only already-approved owner-facing print data may appear.
- Cache/invalidation:
  - save, discard/reset, and preview reopen must rebuild deterministic PDF output from the latest applicable source state.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the canonical identity behind both the standard PDF and Poolside Note.
- Human-readable identifiers:
  - workout title and swimmer name remain renameable presentation fields,
  - PDF section labels and heading copy are presentation-only and may be improved in place.
- Mutability rules:
  - presentation labels are mutable,
  - canonical IDs and export identity remain unchanged.
- Rename vs repurpose policy:
  - visual/header/copy parity is an in-place presentation refinement,
  - it must not create a second canonical workout-PDF entity or a divergent export model.
- Compatibility contract:
  - existing preview/open/print routes must keep working,
  - PDF visual parity must not break existing print/share/export entry points.
- Observability and repair:
  - tests must catch stale labels, missing brand assets, empty preview regressions, and layout truthfulness issues.

## Scope

- Align the standard workout PDF header system with the Poolside Note brand family.
- Audit and unify terminology across the two print artifacts:
  - totals,
  - focus,
  - swimmer identity,
  - rest/repeat wording,
  - artifact labels where relevant.
- Rework PDF hierarchy, spacing, and emphasis so the page feels equally premium and deliberate.
- Ensure the PDF uses the correct brand asset/lockup strategy relative to print mode.
- Validate that the PDF preview remains stable, nonblank, and print-safe after the redesign.
- Update tests to lock the new visual/content contract.

## Out Of Scope

- Poolside Note redesign.
- Builder step-authoring UX redesign beyond PDF-truthfulness needs.
- New workout schema fields or export adapter contracts.
- Garmin-ready JSON logic changes.
- New analytics events.
- New dependency or alternate PDF engine.

## Acceptance Criteria

1. The standard workout PDF reads as the same FreeSwimming print family as the Poolside Note.
2. The PDF retains a distinct full-reference role and is not a visual clone of the Poolside Note.
3. Header hierarchy, brand treatment, and session summary blocks are visually deliberate and consistently composed.
4. Rest/repeat/totals/focus terminology is aligned where the two artifacts represent the same underlying meaning.
5. Standard PDF step grouping, rest display, and repeat copy follow the shared session-step display contract where the PDF represents the same canonical step data.
6. Preview/open/print flow remains stable and does not blank or print empty output.
7. Canonical workout content remains truthful and unchanged by the redesign.
8. Relevant tests and `verify:pre-pr` / `verify:pre-merge` pass when this brief is executed.

## Validation

- `npm run lint:briefs`
- targeted `vitest` for PDF/poolside shared print-model logic
- targeted `playwright` for workout PDF preview and print stability
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.
- Validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts/<id>`
- Preview:
  - Vercel preview URL from PR checks when the brief is executed
- Recommended matrix:
  - iPhone Safari
  - Desktop Safari
  - Desktop Chrome

## Constraints

- UI/print copy stays in English.
- Preserve canonical workout truthfulness and existing export entry points.
- Reuse the existing brand system instead of inventing a parallel PDF language.
- Do not make the workout PDF a copy-paste of Poolside Note.
- Keep the scope to PDF visual parity and print reliability.

## 10/10 Quality Bar

- The workout PDF must look intentional, premium, and fully professional in both preview and printed form.
- The reading order must be obvious within one glance.
- The page must stay calm and information-dense without feeling cramped.
- Required states remain clear:
  - loading: preview indicates progress without looking broken,
  - empty: no misleading blank artifact,
  - error: actionable message and stable UI,
  - retry: preview can be reopened without stale/blank output,
  - offline: no false success state.
- Accessibility must remain strong:
  - readable type sizes,
  - clear hierarchy,
  - high contrast,
  - keyboard-safe preview actions.
- Business logic correctness must remain deterministic:
  - no silent content drift,
  - no missing rests or repeats,
  - no preview/export mismatch.

## Completion Record

- Completed: `2026-05-03`
- Merged PR: `#580`
- Merge commit: `2a3a73c`
- Implementation commit: `aebe36e`
- Outcome: standard workout PDFs now share the Poolside Note print family through a Poolside-family header, summary strip, sectioned step rendering, and shared-contract rest/repeat semantics while keeping Poolside Note unchanged as the faster lane-side reference.
- Screenshot handoff: owner-approved after/reference captures in `/Users/stianvikra/freeswimming/output/workout-pdf-poolside-parity-2026-05-03`.
- Validation:
  - targeted TypeScript/ESLint/Vitest: PASS, including `npx vitest run tests/unit/workouts-shared.test.ts` with `45` tests;
  - `npm run verify:pre-pr`: PASS on `aebe36e`, full-public lane, `artifacts/test-runs/20260503-184819`;
  - GitHub CI for PR `#580`: PASS (`Analyze`, `CodeQL`, `Vercel`, `deploy-preview`, `e2e-smoke`, `site-lock-smoke`, `size-check`, `verify`);
  - `npm run verify:pre-merge`: PASS on `aebe36e`, marker `artifacts/verify-pre-merge/20260503-173002.json`, Playwright `107 passed`, `349 skipped`.
- Perf-budget decision: hold. The gate recommended tightening after three weekly green runs with 25.1% margin, but this PDF-only parity slice does not target route budgets; tightening belongs in a dedicated performance-governance follow-up.
- Rollback: revert merge commit `2a3a73c`; no schema, data repair, cache purge, finance action, or customer communication is required.

## Closeout Score Outcome

Critical target categories for `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

- `10/10 claim`: yes

| Category                                      | Achieved Score | Evidence                                                                                             | Notes                                                             |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#580`, approved after/reference screenshots, and Poolside Note comparison artifacts.             | Standard PDF remains the fuller reference artifact.               |
| UX flow clarity                               | `5/5`          | Screenshot approval plus generated PDF hierarchy/summary assertions.                                 | Header, totals, focus, and sections scan clearly.                 |
| Visual design quality                         | `5/5`          | Desktop/mobile standard PDF after captures compared with Poolside Note reference captures.           | Same print family without cloning Poolside Note layout.           |
| Business logic correctness and data integrity | `5/5`          | `workouts-shared` unit tests, full pre-PR gate, CI, and pre-merge gate.                              | Canonical workout content, distances, rests, repeats unchanged.   |
| Accessibility (a11y)                          | `5/5`          | Full Playwright lane and print HTML/code review.                                                     | Readable hierarchy and contrast preserved.                        |
| Data placement and sync boundaries            | `5/5`          | Code review of presentation-only `standardSections` model and unchanged persistence boundaries.      | No new persisted presentation state.                              |
| Reliability and failure handling              | `5/5`          | Full Playwright gate plus PDF export coverage in existing program/workout flows.                     | Preview/export flow stayed nonblank and deterministic.            |
| Content governance                            | `5/5`          | Copy audit and unit assertions for section labels, linked rests, interval rests, and post-set rests. | PDF wording aligns with the shared session-step display contract. |
| Stack-fit and dependency discipline           | `5/5`          | Existing PDF HTML renderer reused; no dependency or alternate print engine added.                    | React renderer remains a semantic reference, not a PDF runtime.   |
| Testing and QA automation                     | `5/5`          | Targeted tests, screenshot approval, `verify:pre-pr`, CI, and `verify:pre-merge`.                    | Local and remote gates passed before merge.                       |
| Performance (CWV + payloads)                  | `5/5`          | Build and perf budgets passed in pre-PR and pre-merge gates.                                         | Budget tightening intentionally deferred to perf governance.      |
| DevOps and rollback readiness                 | `5/5`          | Single merged PR with no migration; rollback is `git revert 2a3a73c`.                                | Post-merge preflight surfaced this lifecycle closeout.            |

## Checkpoint Log

- `2026-04-15 | planning | created the dedicated planned brief for aligning the standard workout PDF with the newer Poolside Note brand and print-system quality bar, while explicitly keeping the two artifacts distinct in job and composition | next: execute this brief separately after the current builder slice is merged or explicitly handed off`
- `2026-05-03 | in-progress | started implementation after PR #578/#579 landed; updated scope so the standard PDF follows Poolside Note visually and the shared session-step contract semantically, while keeping the React renderer out of the PDF HTML path | next: implement PDF model/rendering changes and capture after/reference screenshot handoff before pre-PR gates`
- `2026-05-03 | screenshot handoff | standard PDF now has a Poolside-family header, summary strip, sectioned step rendering, and shared-contract rest/repeat semantics while Poolside Note stays unchanged as the reference; targeted validation passed: typecheck, workouts-shared vitest, eslint on touched code/tests, and lint:briefs:all; after/reference artifacts are in /Users/stianvikra/freeswimming/output/workout-pdf-poolside-parity-2026-05-03 | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-05-03 | screenshot approved | owner approved after/reference screenshot handoff in chat | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-05-03 | pre-pr gate green | npm run verify:pre-pr passed after screenshot approval; performance budgets stayed green and are held unchanged for this PDF-only slice | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-05-03 | merged | PR #580 merged to main as 2a3a73c after owner screenshot approval, local verify:pre-pr, green CI, and local verify:pre-merge | next: post-merge preflight`
- `2026-05-03 | done | post-merge preflight surfaced this lifecycle closeout; brief moved from in-progress to done with all target categories closed at 5/5 and 10/10 claim recorded | next: docs-only closeout PR`
