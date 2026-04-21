# Task Brief: Poolside Note Session And Step Notes Display Options (10/10)

## Metadata

- `id`: `2026-04-21-poolside-note-session-and-step-notes-display-options-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-21`
- `updated`: `2026-04-21`

## Goal

Let poolside note users optionally include the saved session note and relevant step notes in the printed/exported poolside note without making the default note noisy.

## Sequencing Lock

- Run this brief before:
  - [2026-04-18-maintenance-baseline-pre-live-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-04-18-maintenance-baseline-pre-live-10-10.md)
- Depends on the shipped poolside preview/export baseline:
  - [2026-04-20-poolside-note-save-as-image-export-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-20-poolside-note-save-as-image-export-10-10.md)
  - [2026-04-20-poolside-note-mobile-preview-and-save-image-reliability-followup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-20-poolside-note-mobile-preview-and-save-image-reliability-followup-10-10.md)
- Keep this as a poolside note display-options slice, not a general builder note-authoring redesign.

## Why This Brief Exists

- Poolside note currently summarizes steps, rests, totals, swimmer, and focus, but it does not expose the richer notes already useful during execution.
- Step notes are especially useful for drills because the step line may say `Drill` without telling the swimmer which drill to perform.
- Garmin can carry step notes, but watch readability is limited; the printed/exported poolside note is the better readable surface.
- Adding all notes by default would make the sheet noisy, so the best UX is opt-in presentation controls.

## Dependencies And Boundaries

- Likely implementation surfaces:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsidePreviewPageClient.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsidePreviewPageClient.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx)
  - [/Users/stianvikra/freeswimming/lib/workouts/poolside-preview.ts](/Users/stianvikra/freeswimming/lib/workouts/poolside-preview.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-poolside-preview.test.ts](/Users/stianvikra/freeswimming/tests/unit/workout-poolside-preview.test.ts)
  - [/Users/stianvikra/freeswimming/tests/e2e/poolside-save-image-export.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/poolside-save-image-export.spec.ts)
- Locked product decisions:
  - default note output stays clean and does not show extra notes unless selected,
  - presentation controls live in poolside preview because preview owns print/export layout settings,
  - session note, if enabled, renders below Focus as a separate box,
  - step notes, if enabled, render under the step line they belong to,
  - step-note modes should be:
    - `Hidden`
    - `Drill steps`
    - `All notes`
  - session-note mode should be a simple include/exclude control unless implementation shows a clearer existing pattern,
  - notes must be included in `Print / Save PDF` and `Save image` output when enabled,
  - no new note authoring model or persistence schema is introduced in this brief.

## Must Now

- Add poolside preview controls for session-note and step-note display.
- Render session note below Focus as its own readable box when enabled and present.
- Render step notes under their matching step lines when enabled.
- Keep the default output quiet and scannable.
- Ensure note output participates correctly in print, PDF, image export, portrait, and landscape layouts.
- Preserve mobile preview reliability and note-surface-only image export.

## Before Live

- Confirm drill-heavy sessions can be read without needing the watch for drill details.
- Confirm long notes do not break page width, print margins, image export bounds, or focus readability.
- Confirm no empty note boxes render when notes are absent.

## Ongoing Cadence

- Future poolside presentation options should remain preview-owned unless they change canonical workout content.
- Do not add builder controls for print-only presentation without a separate explicit brief.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                       | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Poolside note remains the readable pool-deck execution surface while notes are clearly optional presentation content, not new authoring workflow.                    | screenshot review + workflow QA                | `5/5`                   |
| UX flow clarity                               | `target`     | Users can choose whether to include session notes and which step notes to show without guessing what will appear in print/image output.                              | manual QA + targeted e2e                       | `5/5`                   |
| Visual design quality                         | `target`     | Enabled notes are readable, visually subordinate to the step/focus structure, and do not create noisy default output or clipped exports.                             | screenshot/export artifact review              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Output reflects current preview settings and existing workout note data exactly, with no write-back or mutation of canonical workout content.                        | unit coverage + route review                   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this brief changes owner-facing poolside preview/export presentation, not admin/editor publishing workflows.                                             | explicit scope rationale                       | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Note display controls and rendered note content remain labeled, keyboard reachable, focus-visible, and readable without color-only meaning.                          | semantic review + targeted QA                  | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: note rendering must avoid heavy new rendering paths and keep preview/export interaction responsive.                                                 | diff review + interaction QA                   | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Note content remains server-canonical workout data; display mode is preview-local/transient unless an existing URL/state pattern already owns presentation settings. | brief contract + code review                   | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Changing note display controls must re-render current preview/export output without stale note visibility or stale export output.                                    | route QA + export comparison                   | `5/5`                   |
| Reliability and failure handling              | `target`     | Long/missing notes must not break preview readiness, print layout, image export, or repeated save behavior.                                                          | negative-path QA + targeted tests              | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: note display remains inside the existing authenticated owner preview boundary with no new public note endpoint.                                     | auth boundary review                           | `4/5`                   |
| Privacy and compliance                        | `target`     | Notes only appear after explicit preview choice and never create a new sharing/storage path beyond owner-triggered print/image export.                               | privacy review + screenshot/export QA          | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: note output must be truthful to existing workout/session note content and avoid inventing image-only copy variants.                                 | artifact comparison + code review              | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin mutation flow, publish state, or role-gated editor changes are in scope.                                                                        | explicit scope rationale                       | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this work stays inside authenticated poolside preview/export surfaces with no public indexing contract.                                                  | explicit scope rationale                       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this brief changes no public route semantics, metadata, or AI-discoverable content surface.                                                              | explicit scope rationale                       | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because success is verified through workflow QA, screenshots, exported artifacts, and regression coverage rather than product analytics.                         | explicit scope rationale                       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, billing, or revenue workflow changes here.                                                                                      | explicit scope rationale                       | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this is a private owner-facing presentation option and does not introduce a new incident or support workflow.                                            | explicit scope rationale tied to brief scope   | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, reconciliation, or reporting path changes are involved.                                                                              | explicit scope rationale tied to brief scope   | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice standardizes current English owner-facing labels only and does not change locale architecture.                                                | explicit scope rationale tied to current scope | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The solution must reuse the current poolside preview/export renderer and add no new dependency or second renderer.                                                   | dependency diff + architecture review          | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted unit/e2e coverage plus screenshot/export artifact handoff must lock note controls, note rendering, print/image parity, and missing/long-note behavior.      | targeted tests + screenshot QA + verify        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: note display should extend current preview settings without adding parallel output systems.                                                         | architecture review                            | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this must remain a narrow reversible preview/export diff with no schema, migration, or external service dependency.                                 | PR plan + rollback review                      | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - existing saved workout/session note content,
  - existing step note content,
  - saved workout identity and step ordering.
- Local-only / preview state:
  - include session note on/off,
  - step-note display mode (`Hidden`, `Drill steps`, `All notes`),
  - rendered preview/export readiness state.
- Sync policy:
  - toggling note display changes only preview/export presentation,
  - no poolside note action writes note content back to the workout,
  - print/image export reads from the currently rendered preview state.
- Retention and sensitivity:
  - exported images/PDFs may include notes only when the owner explicitly enables them,
  - generated export data stays ephemeral as in the current export contract.
- Cache/invalidation:
  - changing note display settings invalidates the currently rendered note output naturally,
  - blank or partially ready note surfaces must not become export-ready.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this brief introduces no new persisted entity, slug, route parameter, or canonical identifier.

## Scope

- Add poolside preview presentation controls for session note and step notes.
- Render session note below Focus as a separate box when enabled and populated.
- Render step notes under their matching step line when enabled and populated.
- Support `Hidden`, `Drill steps`, and `All notes` for step notes.
- Prefer concrete drill names in the poolside step summary when present, so generic `Drill` is replaced by labels like `Catch drill`.
- Validate portrait and landscape poolside note layouts.
- Validate print/PDF and Save image output.
- Preserve existing note authoring and Garmin/export semantics.

## Out Of Scope

- New step-note authoring UI.
- New session-note authoring UI.
- Admin-managed abbreviation or note-template controls.
- Public poolside guide route changes.
- Server-side image rendering.
- Maintenance baseline or dependency modernization.

## Acceptance Criteria

1. Poolside preview exposes a clear session-note include/exclude control.
2. Poolside preview exposes `Hidden`, `Drill steps`, and `All notes` modes for step notes.
3. Default poolside output remains unchanged/noiseless when note options are off.
4. Session note renders below Focus in its own box only when enabled and populated.
5. Step notes render directly under the step line they belong to only when enabled by the selected mode.
6. Drill-focused notes make drill execution readable from the sheet without relying on watch readability.
7. Long notes wrap within the note surface without clipping portrait, landscape, print, or image export.
8. Missing notes do not render empty boxes or layout gaps.
9. Save image and Print / Save PDF include enabled notes and preserve note-surface-only export.

## Validation

- `npm run lint:briefs`
- targeted unit coverage for:
  - session-note visibility,
  - step-note mode filtering,
  - missing/empty note suppression,
  - long-note wrapping contract where testable
- targeted Playwright coverage for:
  - mobile and desktop poolside preview controls,
  - portrait/landscape note rendering,
  - save-image export with enabled notes
- targeted screenshot/export artifact handoff with short explanation before `verify:pre-pr`
- owner screenshot approval or correction pass before `verify:pre-pr`, PR creation, and `verify:pre-merge`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Manual QA Environments

- Local:
  - poolside preview from saved workout with session note,
  - poolside preview from saved workout with drill step notes,
  - mobile portrait preview and exported PNG,
  - desktop landscape preview and print/PDF flow.
- Preview:
  - Vercel preview URL from the eventual PR checks.
- Recommended matrix:
  - iPhone-width Safari-equivalent,
  - Android Chromium-width viewport,
  - desktop Chromium,
  - desktop Safari/WebKit-equivalent.

## Constraints

- Keep default poolside note output clean.
- Do not create a second note renderer.
- Do not persist new preference state unless an existing preview-settings pattern already does so.
- Do not add new dependencies.
- Do not weaken the current mobile preview/export readiness gates.

## 10/10 Quality Bar

- Notes should help execution, especially drills, without turning the default sheet into a dense manuscript.
- Required states remain strong:
  - no notes,
  - session note only,
  - drill step notes only,
  - all step notes,
  - long notes,
  - portrait,
  - landscape,
  - image export.
- Accessibility expectations:
  - clear labels,
  - keyboard reachability,
  - visible focus,
  - readable text contrast,
  - no color-only meaning.
- Business-logic expectations:
  - no write-back from preview controls,
  - no stale export state,
  - no note content drift between preview, print, and image export.

## Help/Guide Impact

- `N/A` unless implementation adds or changes a documented Help/Guide workflow.
- If any owner-facing guide explains poolside preview/export controls, update it in the same PR.

## Checkpoint Log

- `2026-04-21 | planned | created after the poolside mobile preview/save-image reliability closeout; scope is limited to optional session note and step-note display in poolside preview/export, with maintenance baseline still sequenced after this findings-wave follow-up | next: implement end-to-end or explicitly defer before starting maintenance baseline`
- `2026-04-21 | in-progress | moved to feature branch feat/poolside-session-step-notes-2026-04-21 and started implementation; default note output remains off while preview controls, renderer options, and URL settings are being wired together | next: targeted validation, screenshots, owner review`
- `2026-04-21 | in-progress | owner review caught wording and readability issues; refined labels to Hidden/Shown and Hidden/Drill steps/All notes, increased note readability, and moved concrete drill identity into the step summary where available | next: refresh targeted tests and screenshot handoff`
- `2026-04-21 | in-progress | targeted unit validation passed (66 tests) and owner approved the refreshed screenshot handoff in output/playwright/poolside-notes-review | next: run verify:pre-pr, commit, push, and open PR`
- `2026-04-21 | done | PR #496 merged to main at e7b0a7b; local verify:pre-pr PASS, CI green, verify:pre-merge PASS, and owner-approved screenshots completed before merge; perf-budget stretch-target tightening was explicitly deferred to the maintenance baseline because this was product/UI scope | next: run standard closeout PR for lifecycle move and maintenance carry-forward`
