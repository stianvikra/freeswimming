# Task Brief: Swim Session Builder Drill Name Authoring And Summary Labels (10/10)

## Metadata

- `id`: `2026-04-23-swim-session-builder-drill-name-authoring-and-summary-labels-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-23`
- `updated`: `2026-04-23`

## Goal

Let pool session authors name concrete drill steps, then show that concrete drill name in builder summaries, poolside note, PDF, and saved image output instead of a generic `Drill` label.

## Sequencing Lock

- This is a small product follow-up from the poolside note/session-step-notes work.
- Run this before the maintenance baseline because it is still part of the pre-maintenance builder/poolside findings wave.
- Do not merge this into the broader drill library/templates work; that future brief is about catalog/favorites/admin CRUD, while this brief is about one concrete authoring field in the current swim session builder.
- Do not start dependency/tooling modernization inside this brief.

## Why This Brief Exists

- Poolside note now supports step notes, but drill execution is still harder to scan when the step line only says `Drill`.
- Existing rendering already prefers `step.name` when it is a non-generic drill label, but the manual pool builder currently hides the `Step name` field.
- The correct product model is:
  - `Drill name` = what drill to do, such as `Catch drill` or `Single-arm drill`,
  - `Step note` = how to execute it, such as `Keep lead arm long and rotate from the hip`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Content governance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                       | Evidence                                                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Authors can give a drill step a concrete name without confusing it with `Step note`, `Drill Type`, stroke, equipment, or poolside focus.                             | builder QA + component/e2e coverage                                          | `5/5`                   |
| UX flow clarity                               | `target`     | `Drill name` appears only where it helps, uses clear helper copy, and the summary output is readable without duplicate `Drill` labels.                               | screenshots + e2e assertions                                                 | `5/5`                   |
| Visual design quality                         | `target`     | Edit/rearrange/view, poolside preview, PDF, and saved image remain scannable on mobile/desktop with no label wrapping regressions from realistic drill names.        | before/after or after/reference screenshots, print/image artifacts           | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing `SessionDraftStep.name` is used safely; empty/generic names fall back to existing labels; saved sessions without names continue to load unchanged.          | unit tests + saved-session regression coverage                               | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this brief changes the user-facing swim session builder, not admin content/editor CRUD.                                                                  | explicit scope rationale                                                     | `N/A`                   |
| Accessibility (a11y)                          | `target`     | New field has an accessible label, helper text where needed, keyboard flow remains stable, and summary controls keep current semantics.                              | Testing Library/a11y assertions + manual keyboard check                      | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no measurable bundle or route payload increase beyond ordinary field/rendering code; changed core routes remain within existing budgets.            | verify/perf budget output + bundle diff review                               | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Drill name persists through the existing draft/session save boundary via `step.name`; no new storage surface or sync ambiguity is introduced.                        | data contract review + save/load tests                                       | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: saved session reads/writes should use existing invalidation behavior with no new cache path.                                                        | save/load regression review                                                  | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing, generic, long, or legacy drill names render deterministically and never break builder, poolside preview, PDF, or image export.                              | unit tests + visual/export regression tests                                  | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: existing saved-session auth boundaries must remain unchanged; no new unauthenticated write path or privileged surface is introduced.                | route/API impact sweep + existing auth test review                           | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: drill names are user-authored workout content and must not leak outside existing saved-session/export surfaces.                                     | payload/export review + no new telemetry of raw names unless already covered | `4/5`                   |
| Content governance                            | `target`     | Builder/help/docs copy consistently distinguishes `Drill name`, `Drill Type`, and `Step note`; route/label/support-surface impact sweep is completed.                | docs/help impact sweep + updated tests/docs or explicit N/A rationale        | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow or editability surface is changed in this slice.                                                                                       | explicit scope rationale                                                     | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes authenticated builder/export behavior only, not public metadata or crawlable routes.                                                        | explicit scope rationale                                                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content, schema, or indexed route changes are introduced.                                                                      | explicit scope rationale                                                     | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: if existing builder analytics include step updates, they must not log raw drill names unnecessarily.                                                | analytics impact review                                                      | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice does not change checkout, billing, entitlement, pricing, or product packaging.                                                                | explicit scope rationale                                                     | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: support/help references to builder fields must stay accurate so users can recover when printed/exported drill names look wrong.                     | Help/Guide/runbook impact sweep or explicit no-impact rationale              | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not touch invoices, billing portal, financial reporting, subscriptions, or revenue recognition surfaces.                                 | explicit finance/reporting scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: labels/helper text should remain centralized enough for later localization and avoid hard-coded grammar that cannot translate cleanly.              | copy review                                                                  | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing React/TypeScript form patterns and existing `step.name`; add no dependency and no new persistence type unless a blocker is proven.                      | dependency diff + code review                                                | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/component/e2e/export tests cover drill-name visibility, fallback, no-duplicate summary labels, save/load, poolside preview, PDF, and save-image where relevant. | targeted tests + `verify:pre-pr` + `verify:pre-merge`                        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: implementation should be a small field/rendering extension and not create a second drill taxonomy or catalog.                                       | diff review                                                                  | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback should be safe because data uses an existing optional string field and legacy sessions already tolerate blank names.                       | rollback note + compatibility tests                                          | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - saved swim sessions remain canonical once persisted through the existing saved-session flow,
  - drill name uses existing `SessionDraftStep.name`.
- Local-only:
  - unsaved local draft edits remain local until the existing save boundary.
- Sync policy:
  - no new sync channel,
  - edit/save/load should follow current saved-session behavior,
  - blank or generic names must not force migrations.
- Retention and sensitivity:
  - drill names are user-authored workout content and follow existing saved-session retention/export rules.
- Cache/invalidation:
  - no new cache path,
  - saved-session mutations must invalidate/refresh exactly as current title/step edits do.

## Identity And Rename Contract

- Canonical stable ID:
  - each step keeps its existing `step.id`.
- Human-readable identifiers:
  - `Drill name` is a renameable display label stored in `step.name`,
  - it is not a route slug, canonical drill catalog ID, or Garmin identity.
- Mutability rules:
  - author can edit or clear the name without changing step identity.
- Rename vs repurpose:
  - renaming a drill step label is allowed when the step remains semantically the same,
  - changing the actual training purpose still follows current step edit/delete behavior.
- Compatibility contract:
  - legacy sessions with empty/generic names render existing fallback labels,
  - no migration required.
- Observability and repair:
  - malformed names should be normalized/trimmed at render/save boundaries and covered by deterministic tests.

## Scope

- Add a user-facing optional `Drill name` authoring surface in manual pool swim session builder where drill naming is relevant.
- Store the value in existing `step.name`.
- Update summary rendering so:
  - concrete drill names replace generic `Drill`,
  - generic values like `Drill`, `Drill step`, or blank values fall back to existing labels,
  - summaries never duplicate `Drill`.
- Keep `Step note` separate and preserve current note behavior.
- Validate affected surfaces:
  - builder edit,
  - builder rearrange,
  - builder view,
  - saved session reload,
  - poolside note preview,
  - PDF/export view,
  - Save image output.
- Run route/label/support-surface impact sweep for tests, docs, Help/Guide assertions, and runbooks that mention `Drill Type`, `Step note`, step summary labels, or poolside note drill execution.

## Out Of Scope

- Drill library, templates, favorites, or admin-managed drill catalog.
- New canonical drill entity or drill ID.
- New Garmin export semantics.
- AI-generated drill-name suggestions.
- Broad builder redesign.
- Maintenance baseline or dependency/tooling modernization.

## Acceptance Criteria

1. Manual pool builder exposes a clear optional `Drill name` field for drill-relevant steps without adding noise to non-drill authoring.
2. Authors can enter names like `Catch drill` or `Single-arm drill` and see them in edit, rearrange, and view summaries.
3. Poolside note, PDF, and Save image output show the concrete drill name instead of generic `Drill` when present.
4. Blank, generic, duplicate, or legacy names fall back to current summary behavior.
5. `Step note` remains the place for execution instructions and is not conflated with drill identity.
6. Existing saved sessions load without migration or visual regression.
7. Long but realistic drill names wrap/truncate according to existing layout rules without clipping mobile/desktop/print/image output.
8. Tests and docs/help/runbook contracts are updated in the same PR when affected.
9. Visual screenshot handoff is completed before `verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- Route/label/support-surface impact sweep before first broad gate:
  - `rg "Drill Type|Drill name|Step note|Drill step|poolside note|session-draft-step-name|step.name" app components lib tests docs`
- Targeted tests:
  - unit tests for summary/drill-label fallback and no-duplicate behavior,
  - component tests for field visibility, editing, and accessibility label,
  - saved-session load/save regression,
  - e2e or focused Playwright coverage for builder edit/rearrange/view and poolside preview,
  - export coverage for PDF/save-image if existing helpers make this deterministic.
- Visual handoff before `verify:pre-pr`:
  - builder mobile after screenshots,
  - builder desktop after screenshots,
  - poolside preview/export after screenshots,
  - clear folder link and short explanation.
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local browser QA:
  - mobile viewport,
  - desktop viewport.
- Vercel preview QA:
  - same core states after PR checks are green.
- Required screenshot naming:
  - `after-builder-edit-drill-name-mobile.png`
  - `after-builder-view-drill-name-mobile.png`
  - `after-builder-rearrange-drill-name-mobile.png`
  - `after-poolside-note-drill-name-portrait.png`
  - `after-poolside-note-drill-name-landscape.png`
  - `after-poolside-save-image-drill-name.png`

## Constraints

- Keep copy short and product-facing.
- Do not add dependencies.
- Preserve current visual language and 8px-or-less radius rules.
- Do not make poolside output noisier by default.
- Do not make `Drill name` required.
- Do not change current Garmin meaning of `drillType`.

## Debugging And Handoff Contract

- If summary rendering or exports behave inconsistently:
  - list likely causes before changing code,
  - verify builder state, serialized draft, renderer input, preview output, PDF output, and saved-image artifact separately,
  - log reusable high-cost findings in `docs/runbooks/high-cost-debug-log.md` if debugging exceeds normal iteration.
- If context gets too heavy or a new chat is the better working mode, provide a concise handoff with:
  - active branch/PR,
  - changed files,
  - latest validation,
  - screenshot folder,
  - exact next step.

## Checkpoint Log

- `2026-04-23 | planned | created as a focused follow-up for concrete drill names in the current swim session builder; scoped to existing step.name and summary/export rendering, not drill-library/catalog work | next: run after the route-label impact-sweep closeout PR is merged and before maintenance baseline`
- `2026-04-23 | in-progress | moved to feature branch, completed route/label/support-surface impact sweep, implemented manual-pool Drill name authoring on existing step.name, preserved legacy auto-summary fallback, and added targeted builder + poolside render coverage; targeted vitest for workout-builder-hub and workouts-shared passed | next: run lint/type-focused validation, capture screenshot handoff, then wait for owner approval before verify:pre-pr`
- `2026-04-23 | visual handoff | captured clean after screenshots for builder edit/rearrange/view, poolside preview portrait/landscape, and actual save-image output under output/playwright/2026-04-23-drill-name-authoring; screenshots confirm Catch drill replaces generic Drill across changed surfaces | next: owner visual approval, then verify:pre-pr`
- `2026-04-23 | visual revision | aligned Drill name next to Drill Type at equal width on desktop/tablet while preserving stacked mobile layout; regenerated screenshot handoff and reran targeted vitest green | next: owner visual approval, then verify:pre-pr`
- `2026-04-23 | verification hardening | fixed late `verify:pre-pr`instability by hardening canonical program export auth/preview loading, adding one retry for transient session/export preview failures, and covering that retry path in`program-builder-hub`unit tests; full`npm run verify:pre-pr`passed, including the previously red`my-library-program-export`, `my-library-workout-builder`, and `poolside-save-image-export`paths | next: commit, push, update PR, monitor CI, then run`npm run verify:pre-merge` before merge recommendation`
