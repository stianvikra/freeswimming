# Task Brief: Admin Notes Screenshot Region Capture (10/10)

## Metadata

- `id`: `2026-03-22-admin-notes-screenshot-region-capture-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-22`
- `updated`: `2026-03-22`

## Goal

Signed-in admins can capture a screenshot directly from supported admin note flows, select the relevant region safely, preview it, and save it as a normal admin-note attachment while non-admin users never see or access the feature.

## Why This Brief Exists

- Admin notes already support image attachments, but not a true in-app capture flow.
- Quick capture and screenshot-region capture are related, but they are not the same slice:
  - quick capture solves entry and context-prefill,
  - screenshot region capture solves permission, selection, preview, and safe attachment save.
- Splitting this work keeps the browser-permission, privacy, and failure-handling risk isolated instead of mixing it into broader admin-notes or builder work.

## Dependencies And Boundaries

- Depends on:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-22-admin-notes-quick-capture-launcher-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md`
  - `/Users/stianvikra/freeswimming/components/admin/AdminNotesManager.tsx`
  - `/Users/stianvikra/freeswimming/components/admin/AdminContextNotesPanel.tsx`
  - `/Users/stianvikra/freeswimming/lib/admin/notes.ts`
  - `/Users/stianvikra/freeswimming/app/api/admin/notes/route.ts`
  - `/Users/stianvikra/freeswimming/app/api/admin/notes/[id]/route.ts`
- This slice owns:
  - admin-only screenshot-capture launcher behavior inside supported note flows,
  - permission and failure UX for browser capture,
  - region selection and pre-save preview,
  - converting an approved capture into a normal note attachment.
- This slice does not own:
  - public-user upload flows,
  - OCR/text extraction,
  - annotation/drawing tools unless explicitly added in a later slice,
  - a desktop-native cross-app capture utility outside browser-supported capture APIs.

## Scope

- Add an admin-only screenshot-capture action to supported admin note creation/edit flows.
- Support a safe capture flow where the admin can:
  - start capture,
  - choose the allowed browser capture source,
  - select or crop the relevant region,
  - preview the result before saving,
  - save it as a standard admin-note image attachment.
- Provide clear recovery for:
  - permission denied,
  - capture cancelled,
  - capture failure,
  - upload/save failure.
- Ensure delete still uses the existing canonical attachment delete lifecycle for both metadata and storage object removal.
- Keep the feature hidden from non-admin users at both UI and API level.
- Update Help/Guide and operator runbooks for supported browsers, capture limitations, and recovery behavior.

## Out Of Scope

- Public screenshot capture or user-facing note attachments.
- Full-screen annotation, freehand drawing, arrows, blur, or redaction tooling.
- Capturing arbitrary local files outside the existing image-attachment model.
- Replacing normal image upload/paste flows.
- Rolling this feature into builder or unrelated app surfaces in the same slice.

## Data Placement And Sync Contract

- Server-canonical data:
  - saved admin note rows,
  - attachment metadata rows,
  - attachment storage object keys,
  - canonical note/context references.
- Local-only data:
  - in-progress capture session state,
  - transient captured bitmap/blob before confirmation,
  - crop/selection coordinates,
  - preview URL before save,
  - unsaved note draft text.
- Sync policy:
  - no attachment row or storage object is created until explicit save,
  - cancel must discard local capture state without creating server artifacts,
  - save uses the canonical admin-note attachment lifecycle and refreshes note views deterministically,
  - failures preserve recoverable local draft state where safe, but never report success before server confirmation.
- Retention and sensitivity:
  - captures may contain sensitive internal information and must remain admin-only,
  - temporary pre-save capture data should stay in-memory or otherwise short-lived on the client and must not be persisted beyond the local editing session,
  - deleting a saved screenshot attachment must remove both metadata and storage object fully.
- Cache/invalidation:
  - notes manager, contextual notes panels, and note detail/edit views must refresh deterministically after capture save or delete,
  - cancelled or failed captures must not invalidate or mutate server-canonical note state.

## Identity And Rename Contract

- Canonical stable IDs:
  - `admin_note.id` remains the canonical note identity,
  - screenshot attachments use immutable attachment IDs after save.
- Human-readable identifiers:
  - capture labels, filenames, and preview captions are display metadata only and are never canonical identity.
- Mutability rules:
  - a screenshot attachment may be deleted, but not silently reassigned to a different note,
  - changing note text or title does not change attachment identity,
  - local crop state is ephemeral and not a persisted identifier.
- Rename vs repurpose policy:
  - minor display-label changes remain in place,
  - a materially different capture must be created as a new attachment instead of overwriting prior attachment identity in ambiguous ways.
- Compatibility contract:
  - notes with no capture attachments remain fully valid,
  - screenshot-capture-created attachments must behave like existing image attachments once saved.
- Observability and repair:
  - failed capture or upload states should be diagnosable,
  - missing-orphan mismatches between metadata and storage must still be handled by the existing attachment recovery guidance.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Security and authz`
- `Privacy and compliance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                    | Evidence                             |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Product goals and IA                          | `target`     | Admin can understand when to use screenshot capture versus normal upload or plain text note entry without route-level confusion.                  | IA review + manual QA + e2e          |
| UX flow clarity                               | `target`     | Start, permission, select, preview, save, cancel, retry, and delete feel deterministic and understandable on supported browsers.                  | e2e + manual QA                      |
| Visual design quality                         | `target`     | Capture controls, preview, and failure states feel intentional and low-noise without cluttering the notes UI.                                     | screenshot review + manual QA        |
| Business logic correctness and data integrity | `target`     | No screenshot attachment is created on cancel, unauthorized access, or failed save, and saved captures always use canonical attachment lifecycle. | unit tests + runtime guards          |
| Admin editor ergonomics                       | `target`     | Admin can capture and attach the relevant screen region faster than taking an external screenshot and re-uploading it manually.                   | timed manual QA + e2e                |
| Accessibility (a11y)                          | `target`     | Capture launcher, preview controls, crop confirmation, save/cancel, and recovery states remain keyboard and touch accessible where supported.     | Playwright + manual QA               |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: screenshot capture UI must avoid obvious `/admin` and contextual-panel payload or responsiveness regressions.                    | build + code review                  |
| Data placement and sync boundaries            | `target`     | Pre-save capture state stays local-only, while saved attachment records and storage objects remain server-canonical and deterministic.            | contract review + tests              |
| Caching and invalidation strategy             | `target`     | Saved or deleted captures refresh note lists and contextual panels deterministically without forcing a full admin workflow reset.                 | integration review + e2e             |
| Reliability and failure handling              | `target`     | Permission denied, browser rejection, cancelled capture, failed upload, and delete failure all show actionable recovery without false success.    | negative-path tests + manual QA      |
| Security and authz                            | `target`     | Capture launcher and save/delete paths are admin-only, fail closed, and never expose raw sensitive capture data to unauthorized users.            | API/UI negative-path tests           |
| Privacy and compliance                        | `target`     | Sensitive internal screenshots remain private, short-lived before save, and fully deleted from metadata and storage when removed.                 | storage review + tests               |
| Content governance                            | `supporting` | Supporting only: screenshot labels, help copy, and attachment conventions stay coherent with existing admin-notes governance.                     | Help/Guide + code review             |
| Admin workflow and editability                | `target`     | Screenshot capture complements, rather than replacing, existing note editing, upload, and attachment delete flows.                                | e2e + timed manual QA                |
| SEO and crawlability                          | `N/A`        | N/A because the screenshot capture flow is admin-only and adds no public crawl or indexable surface.                                              | scope rationale                      |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing discoverability surface.                                                                       | scope rationale                      |
| Analytics and KPI observability               | `supporting` | Supporting only: capture start, cancel, permission-denied, save, and delete events should remain measurable enough to validate workflow value.    | analytics review                     |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, payout, entitlement, or revenue operation changes in this slice.                                                 | scope rationale                      |
| Incident response and support operations      | `target`     | Help/Guide and runbooks explain supported browsers, permission-denied recovery, capture failure recovery, and attachment delete semantics.        | docs review + help-center assertions |
| Finance and reporting operations              | `N/A`        | N/A because no billing, reconciliation, payout, or finance reporting logic changes in this screenshot-capture slice.                              | scope rationale                      |
| i18n operational readiness                    | `supporting` | Supporting only: capture labels, recovery messages, and permission guidance remain localization-safe and avoid hiding logic in raw free text.     | copy review                          |
| Stack-fit and dependency discipline           | `target`     | Reuse browser-native capture capabilities and existing admin-note attachment infrastructure without unnecessary third-party capture dependencies. | dependency diff + code review        |
| Testing and QA automation                     | `target`     | Coverage protects permission-denied, cancel, crop/preview, save, delete, and unauthorized-path denial on supported surfaces.                      | tests + `verify:pre-pr` evidence     |
| Scalability and cost efficiency               | `supporting` | Supporting only: capture flow must avoid duplicate uploads, oversized accidental retention, and repeated stale attachment creation on retries.    | storage review + code review         |
| DevOps and rollback readiness                 | `target`     | Screenshot capture rollout can be disabled or rolled back cleanly without corrupting existing note or attachment data.                            | rollback checklist + runbook review  |

## Acceptance Criteria

1. Signed-in admins can launch screenshot capture from the agreed admin note surfaces.
2. Admin can select the relevant capture region, preview it, and explicitly confirm before save.
3. Cancelling capture or closing the flow creates no attachment row and no storage artifact.
4. Permission-denied and browser-capture failures show clear recovery guidance and leave the note workflow usable.
5. Saving a confirmed capture creates a normal admin-note image attachment visible in existing note UIs.
6. Deleting a saved capture still removes both metadata and underlying storage object completely.
7. Non-admin users never see capture controls and cannot use capture save/delete paths directly.
8. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - permission-denied and cancellation handling,
  - crop/preview state transitions,
  - save payload validation,
  - delete lifecycle invariants
- targeted e2e for:
  - launch capture,
  - cancel before save,
  - permission denied,
  - save capture to note,
  - delete saved capture,
  - unauthorized-path denial
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin?tab=notes`
  - relevant contextual admin-note surfaces after quick-capture launcher lands
- Preview:
  - PR preview URL after branch push
- Recommended matrix:
  - Desktop Chrome
  - Desktop Safari/WebKit
  - Desktop Firefox
  - iPad/tablet viewport for capture and preview sanity check
- Any unsupported browser/device capture behavior must be documented explicitly in the PR and Help/Guide copy.

## Constraints

- Keep the feature admin-only and fail closed everywhere.
- Prefer browser-native capture capabilities and existing attachment infrastructure over new heavy dependencies.
- Do not claim successful save before attachment metadata and storage write both succeed.
- If a browser does not support the intended region-capture flow cleanly, the fallback must be explicit rather than silent or misleading.

## 10/10 Quality Bar

- Screenshot capture must reduce admin friction without increasing privacy risk.
- The primary action should always be obvious:
  - start capture,
  - confirm region,
  - save to note,
  - or cancel safely.
- Required states remain explicit:
  - `idle`
  - `requesting permission`
  - `capturing`
  - `preview`
  - `saving`
  - `success`
  - `error`
  - `retry`
  - `permission denied`
- Error states must preserve operator trust:
  - no fake success,
  - no invisible partial save,
  - no orphaned storage on failed delete.
- Capture UI must stay consistent with existing admin visual language and avoid turning notes into a heavy design tool.

## Checkpoint Log

- `2026-03-22 | planning | created a dedicated planned brief for admin-only screenshot region capture so browser permission, crop/preview, privacy, and attachment-lifecycle risk stay isolated from quick-capture rollout and builder work | next: implement admin-notes quick-capture launcher first, then build screenshot capture on top of that launcher and existing attachment lifecycle`
- `2026-03-22 | feat/admin-notes-screenshot-capture-2026-03-22@working-tree | moved brief to in-progress and implemented browser screenshot capture preview/crop flow for Admin Notes create, edit, and quick-capture surfaces using the existing attachment lifecycle plus operator recovery states | next: finish docs alignment, run targeted validation, then clear verify:pre-pr`
- `2026-03-22 | main@9182abd | merged PR #266 for admin-only screenshot capture across Admin Notes manager and quick-capture surfaces, including preview/crop, permission-denied recovery, help/runbook updates, and unit/e2e coverage; local verify:pre-pr and verify:pre-merge plus required GitHub checks all passed before merge | next: return to the builder calendar completion slice unless a new admin-notes follow-up is intentionally prioritized`
