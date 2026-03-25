# Task Brief: Admin Notes Image Intake Simplification And Clipboard Paste Button (10/10)

## Metadata

- `id`: `2026-03-25-admin-notes-image-intake-simplification-and-clipboard-paste-button-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-25`
- `updated`: `2026-03-26`

## Goal

Admin notes image intake becomes obvious and low-friction by exposing two clear attachment paths: `Upload image` and `Paste image from clipboard`.

## Why This Brief Exists

- Live operator feedback on `2026-03-25` says the shipped clipboard-paste support is too hidden because it depends on remembering `Cmd+V` / `Ctrl+V`.
- Live operator feedback on `2026-03-25` also says in-app screenshot capture is still confusing in practice because quick note can appear to cover the captured screen and the flow feels harder than normal OS screenshot-to-clipboard tools.
- The current image intake UI therefore optimizes for technical capability more than operator clarity.
- This slice keeps the already-shipped attachment model, but simplifies the visible UX so the normal admin mental model is:
  - copy screenshot to clipboard,
  - click `Paste image from clipboard`,
  - or use `Upload image`.

## Admin-Notes Triage Disposition

- Canonical reviewed production-note lineage:
  - `9c35eed6-10d3-4495-a720-53dc7947f4b0` `Admin note addition - paste image from clipboard to notes`
    - Disposition: partially covered by [2026-03-24-admin-notes-compose-parity-and-input-stability-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-24-admin-notes-compose-parity-and-input-stability-10-10.md), residual discoverability and explicit button UX now owned by this brief.
  - `b730efef-bdc9-43f1-b8a5-5423afd3edda` `Quick note`
    - Disposition: typing-focus regression was fixed in [2026-03-25-admin-notes-quick-capture-and-page-notes-regressions-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-25-admin-notes-quick-capture-and-page-notes-regressions-10-10.md), but quick-capture image-entry ergonomics remain owned by this brief.
- Direct production/operator verification on `2026-03-25`:
  - hidden clipboard image paste is too hard to discover and should become a visible button flow.
  - in-app screenshot capture should no longer be a primary visible image-intake path on admin notes surfaces.
  - Disposition: owned by this brief even though the residual operator feedback is not yet represented by a new separate surviving production note row.

## Dependencies And Boundaries

- Depends on:
  - [2026-03-24-admin-notes-compose-parity-and-input-stability-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-24-admin-notes-compose-parity-and-input-stability-10-10.md)
  - [2026-03-22-admin-notes-screenshot-region-capture-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-22-admin-notes-screenshot-region-capture-10-10.md)
  - [2026-03-25-admin-notes-quick-capture-and-page-notes-regressions-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-25-admin-notes-quick-capture-and-page-notes-regressions-10-10.md)
- This slice owns:
  - visible `Paste image from clipboard` actions on in-scope admin note forms,
  - visible `Upload image` actions on in-scope admin note forms,
  - simplifying image-entry copy so screenshot capture is no longer the primary recommended path,
  - consistent pending-image staging semantics before first note save.
- This slice does not own:
  - a new attachment storage model,
  - OCR, annotation, or screenshot editing,
  - public-user uploads,
  - broader admin-notes workflow redesign outside image intake.

## Scope

- Add a visible `Paste image from clipboard` button to:
  - quick note,
  - admin-notes create flow,
  - admin-notes edit flow.
- Add or keep a visible upload action alongside the clipboard button on the same surfaces.
- Remove visible screenshot-capture buttons from admin-notes surfaces so only two primary image-entry methods remain in the UI:
  - `Upload image`
  - `Paste image from clipboard`
- Keep existing keyboard paste support as a non-primary fallback where it already works.
- Keep the same canonical attachment lifecycle:
  - local-only staging before first save,
  - attachment upload only after canonical note save when needed,
  - normal attachment upload/delete for existing notes.

## Out Of Scope

- Rebuilding screenshot capture instead of de-emphasizing it.
- Desktop-native screenshot tooling.
- Multiple pre-save staged images on quick note/create when only one local pending image currently exists.
- Changes to related-note links, categories, or note identity rules.

## Data Placement And Sync Contract

- Server-canonical:
  - saved note rows,
  - saved attachment metadata rows,
  - saved attachment storage objects.
- Local-only:
  - in-progress quick note/create draft values,
  - one pending pre-save image file and preview before successful note save,
  - clipboard-read transient state and local button-loading state.
- Sync policy:
  - clipboard button and upload button must not create server attachments before the note exists,
  - existing-note edit flows may upload immediately because canonical note identity already exists,
  - clipboard intake and file-upload intake must converge on the same attachment validation rules.
- Retention and sensitivity:
  - copied screenshots stay local until explicit save/upload,
  - no hidden local persistence beyond the current editing session.
- Cache/invalidation:
  - successful image upload/delete still refreshes note surfaces through existing admin-note APIs.

## Identity And Rename Contract

- Canonical stable IDs:
  - `admin_note.id` remains canonical note identity.
  - `admin_note_attachment.id` remains canonical attachment identity after save.
- Human-readable identifiers:
  - attachment filenames and helper labels are display metadata only.
- Mutability rules:
  - this slice changes intake UX only, not note or attachment identity semantics.
- Rename vs repurpose policy:
  - a newly pasted or uploaded image remains a new attachment instead of repurposing an existing attachment row.
- Compatibility contract:
  - already-saved note attachments remain valid,
  - existing hidden keyboard-paste support may remain as a fallback but must not be the only discoverable path.
- Observability and repair:
  - unsupported clipboard reads, permission denial, empty clipboard, and upload failures must surface actionable recovery.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                  | Evidence                          |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Product goals and IA                          | `target`     | Operators can understand the two supported image-entry paths immediately without relying on hidden keyboard memory.                                             | UI review + manual QA             |
| UX flow clarity                               | `target`     | In-scope forms present exactly two obvious image actions, and clipboard-button failure states give clear next steps.                                            | unit/e2e + manual QA              |
| Visual design quality                         | `supporting` | Supporting only: simplified image controls should feel calmer and less cluttered than the current capture-first presentation.                                   | screenshot review                 |
| Business logic correctness and data integrity | `target`     | Clipboard-button and upload-button paths preserve the same canonical attachment validation and save semantics as existing note attachments.                     | unit tests + code review          |
| Admin editor ergonomics                       | `target`     | Admin can add an image from clipboard or file without guessing hidden shortcuts or opening an unnecessary capture flow.                                         | timed manual QA + workflow review |
| Accessibility (a11y)                          | `target`     | New image-intake buttons stay keyboard accessible with clear labels and deterministic loading/error states.                                                     | testing-library + e2e             |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: UX simplification should not add noticeable client-weight or rerender churn.                                                                   | build + code review               |
| Data placement and sync boundaries            | `target`     | Pre-save image staging remains local-only until canonical note save or existing-note attachment upload.                                                         | contract review + tests           |
| Caching and invalidation strategy             | `supporting` | Supporting only: attachment upload/delete continues using the existing deterministic admin refresh model.                                                       | code review                       |
| Reliability and failure handling              | `target`     | Empty clipboard, blocked clipboard access, invalid files, and upload failures all recover clearly without fake saved-image state.                               | unit tests + manual QA            |
| Security and authz                            | `supporting` | Supporting only: admin-only attachment restrictions remain fail-closed and unchanged by the new button UI.                                                      | existing negative-path coverage   |
| Privacy and compliance                        | `supporting` | Supporting only: clipboard images remain local until explicit save/upload and do not widen visibility beyond existing admin-only attachment rules.              | code review + tests               |
| Content governance                            | `N/A`        | N/A because this slice changes no editorial governance, publishing policy, or content ownership semantics.                                                      | scope rationale                   |
| Admin workflow and editability                | `target`     | Quick note, create, and edit image-entry workflows remain consistent enough that operators do not need surface-specific memory.                                 | manual QA + regression coverage   |
| SEO and crawlability                          | `N/A`        | N/A because admin-note image intake is private admin-only workflow with no public crawl contract.                                                               | scope rationale                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing discoverability surface.                                                                                     | scope rationale                   |
| Analytics and KPI observability               | `supporting` | Supporting only: simplified image-entry paths should remain measurable through existing workflow events or future instrumentation without adding hidden states. | code review                       |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, payout, or commerce operations change in this admin-notes image-intake slice.                                                  | scope rationale                   |
| Incident response and support operations      | `target`     | Help/Guide and runbook copy must explain the two supported image-entry paths and recovery when clipboard access fails.                                          | docs + help-center assertions     |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not touch finance, reconciliation, or reporting flows.                                                                              | scope rationale                   |
| i18n operational readiness                    | `supporting` | Supporting only: labels such as `Paste image from clipboard` and recovery copy stay locale-safe and avoid encoding logic in hidden UI.                          | copy review                       |
| Stack-fit and dependency discipline           | `target`     | Reuse browser-native clipboard APIs and existing attachment infrastructure with no new dependencies.                                                            | dependency diff + code review     |
| Testing and QA automation                     | `target`     | Coverage protects explicit clipboard-button success/failure paths plus consistent upload affordances on quick note, create, and edit surfaces.                  | tests + `verify:pre-pr`           |
| Scalability and cost efficiency               | `supporting` | Supporting only: simplified intake should not create duplicate uploads or hidden retry loops.                                                                   | code review                       |
| DevOps and rollback readiness                 | `supporting` | Supporting only: UI simplification remains isolated and easy to revert without schema or data rollback.                                                         | diff review                       |

## Acceptance Criteria

1. Quick note, admin-notes create, and admin-notes edit surfaces expose a visible `Paste image from clipboard` action.
2. Quick note and admin-notes create surfaces expose a visible upload action alongside the clipboard button.
3. Screenshot-capture buttons are no longer visible on in-scope admin-note surfaces.
4. Clicking `Paste image from clipboard` stages or uploads an image when clipboard image data exists, using the same attachment validation rules as normal image uploads.
5. Clicking `Paste image from clipboard` with no readable image in clipboard shows actionable recovery guidance instead of silently doing nothing.
6. Existing hidden keyboard paste support may remain, but the visible UI no longer depends on it for discoverability.
7. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest` for:
  - clipboard-button file extraction and error mapping,
  - quick note image staging,
  - create/edit image-intake actions
- targeted `playwright` for admin notes workflow where stable
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Constraints

- Keep the image-intake change small and operator-focused.
- Do not reopen unrelated admin-note workflow scope.
- Preserve the canonical attachment lifecycle and validation rules.

## 10/10 Quality Bar

- Operators should no longer need to remember hidden shortcuts just to attach a clipboard screenshot.
- The visible image-entry model should be simple enough to explain in one sentence:
  - upload a file,
  - or paste from clipboard.
- Failures must tell the operator what to do next:
  - copy the screenshot first,
  - allow clipboard access,
  - or use upload instead.

## Checkpoint Log

- `2026-03-25 | in-progress | created a dedicated residual UX brief after live operator feedback showed that hidden keyboard paste is still too undiscoverable and in-app screenshot capture remains more confusing than normal OS screenshot-to-clipboard tools; decided to simplify admin notes image intake to visible upload + clipboard-paste actions before further admin-notes or planner work | next: implement explicit clipboard-paste buttons, add visible upload on quick note/create, remove visible screenshot-capture controls, and validate with targeted tests plus full verify`
- `2026-03-25 | in-progress | implemented the simplified image-intake model across quick note, create, and edit; added explicit clipboard-paste button support plus visible upload affordances; updated Help/Guide + runbook copy; verified with targeted vitest, targeted Playwright (`admin-help-center`pass,`admin-notes-workflow` 2 pass / 1 environment skip), and full \`npm run verify:pre-pr\` pass | next: commit, push, open PR, and run \`npm run verify:pre-merge\` before merge`
- `2026-03-26 | done | rebased PR #298 onto updated \`main\`, reran \`npm run verify:pre-pr\` and \`npm run verify:pre-merge\` successfully on \`fd8dff5\`, updated the PR handoff evidence, and squash-merged [#298](https://github.com/stianvikra/freeswimming/pull/298) as \`d02a1ca\` | next: none`
