# Task Brief: Admin Notes Chat Screenshot Staging Import (10/10)

## Metadata

- `id`: `2026-04-05-admin-notes-chat-screenshot-staging-import-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-05`
- `updated`: `2026-04-06`

## Goal

FreeSwimming has a supported, cleanup-safe workflow for turning screenshots discussed in Codex chat into real admin-note attachments by staging the actual image files under `/.tmp/admin-note-imports/`, while chat-pasted images remain interpretation-only context.

## Why This Brief Exists

- Current session verification on `2026-04-05` established a hard boundary:
  - Codex can see and interpret a screenshot pasted into chat,
  - but Codex does not receive that chat image as a reliable local file/blob that can be uploaded directly into admin notes.
- The team still needs a practical workflow now so note triage does not stall while we discuss screenshots in chat.
- A safe staging path is simpler and more truthful than trying to scrape hidden chat internals with ad hoc scripts.
- The desired behavior is already captured by production note `4120fac6` `Chat screenshots to admin notes attachments`, but the first honest implementation step is a staging workflow, not an assumed direct chat-image bridge.

## Dependencies And Boundaries

- Existing admin-note attachment foundations remain authoritative:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md`
  - `/Users/stianvikra/freeswimming/app/api/admin/notes/[id]/attachments/route.ts`
  - `/Users/stianvikra/freeswimming/app/api/admin/notes/[id]/attachments/[attachmentId]/route.ts`
  - `/Users/stianvikra/freeswimming/components/admin/AdminNotesManager.tsx`
  - `/Users/stianvikra/freeswimming/components/admin/AdminContextNotesPanel.tsx`
- This brief owns:
  - the operator/assistant workflow contract for staged screenshot imports,
  - the repo-local temporary staging path contract,
  - cleanup expectations after successful attachment import,
  - truthful documentation that chat-image interpretation and file upload are separate capabilities.
- This brief does not own:
  - direct binary ingestion from chat attachments,
  - OCR or AI extraction from images,
  - public upload behavior,
  - storing screenshots in `app/`, `public/`, or any committed product asset path.
- Locked decisions unless owner explicitly changes them:
  - do not use Python or hidden chat/runtime internals to scrape pasted chat images,
  - the staged file path is the upload source-of-truth,
  - the same screenshot may also be pasted into chat for interpretation, but the chat copy is not the file used for upload,
  - staged screenshots stay gitignored and should be deleted after confirmed success.

## Admin Notes Triage Disposition

- `4120fac6` `Chat screenshots to admin notes attachments`
  - disposition: owned by this brief.
  - reason: the real remaining need is a supported bridge between collaborative screenshot discussion in chat and the existing admin-note attachment system, starting with a truthful staging workflow.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Privacy and compliance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                   | Evidence                                  |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Product goals and IA                          | `target`     | Operators understand the split between chat-image interpretation and staged-file upload without guessing which source is canonical.                             | brief contract + docs review              |
| UX flow clarity                               | `target`     | The screenshot workflow is one explicit path: stage file, provide note ID + file path, optionally paste into chat for interpretation, then clean up on success. | brief contract + manual workflow review   |
| Visual design quality                         | `N/A`        | N/A because this slice is primarily workflow/documentation and repo-local staging, not a new user-facing UI redesign.                                          | explicit scope rationale                  |
| Business logic correctness and data integrity | `target`     | Admin-note attachments remain sourced from real files only, never inferred from chat markup, and staging cleanup never reports success before upload confirms.  | attachment contract + implementation test |
| Admin editor ergonomics                       | `target`     | The owner can keep discussing screenshots in chat while giving Codex one stable file path for the real attachment action.                                      | manual QA                                 |
| Accessibility (a11y)                          | `N/A`        | N/A because the staging-path contract itself adds no new end-user UI control; existing admin-note attachment UI remains authoritative.                         | explicit scope rationale                  |
| Performance (CWV + payloads)                  | `N/A`        | N/A because the staging workflow should not change route payloads or Core Web Vitals.                                                                           | explicit scope rationale                  |
| Data placement and sync boundaries            | `target`     | Chat screenshots remain conversational context only, repo-local staged files remain temporary local inputs only, and canonical note attachments remain server-owned. | data contract + code review            |
| Caching and invalidation strategy             | `supporting` | Supporting only: attachment views should continue using existing notes refresh behavior after a staged-file import succeeds.                                   | existing attachment contract              |
| Reliability and failure handling              | `target`     | On upload failure, the staged file is preserved and the failure is reported explicitly; on confirmed success, cleanup is deterministic.                        | workflow test + recovery notes            |
| Security and authz                            | `target`     | Attachment uploads remain admin-only and the staging path never becomes a public asset or public URL source.                                                    | existing authz tests + scope review       |
| Privacy and compliance                        | `target`     | Sensitive screenshots stay local and gitignored before upload, and are deleted from staging after confirmed import unless failure requires retention.          | `.gitignore` + workflow contract          |
| Content governance                            | `supporting` | Supporting only: the note system remains canonical; this slice only clarifies how screenshot evidence enters it.                                               | linked brief + scope review               |
| Admin workflow and editability                | `target`     | The operator can provide a note ID and staged file path without recreating the note or misusing public/product asset folders.                                  | manual QA + brief contract                |
| SEO and crawlability                          | `N/A`        | N/A because staging files and admin-note attachments are private/admin-only concerns.                                                                           | explicit scope rationale                  |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing metadata or crawl surface.                                                                                   | explicit scope rationale                  |
| Analytics and KPI observability               | `N/A`        | N/A because no new analytics event is required for this narrow staging workflow contract.                                                                       | explicit scope rationale                  |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, entitlement, or finance behavior changes.                                                                                      | explicit scope rationale                  |
| Incident response and support operations      | `target`     | Recovery guidance clearly tells the operator what happens on success vs failure and where staged files are expected to live temporarily.                       | runbook/help update                       |
| Finance and reporting operations              | `N/A`        | N/A because no billing, reconciliation, payout, or finance reporting path changes in this screenshot-staging slice.                                            | explicit scope rationale                  |
| i18n operational readiness                    | `N/A`        | N/A because this slice adds an internal operator workflow contract only and no locale-sensitive product model.                                                  | explicit scope rationale                  |
| Stack-fit and dependency discipline           | `target`     | Reuse the current admin-note attachment stack and repo-local filesystem; do not add scraping tools or extra upload dependencies.                               | dependency diff + architecture review     |
| Testing and QA automation                     | `target`     | Coverage and/or deterministic validation protect the staging-path contract, cleanup semantics, and any helper used to import staged screenshots.               | tests + `npm run verify:pre-pr` evidence  |
| Scalability and cost efficiency               | `supporting` | Supporting only: temporary staging stays bounded and local, avoiding duplicate storage or committed screenshot churn.                                          | scope review                              |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the workflow is reversible because staged files are local-only and canonical attachment behavior stays unchanged.                             | rollback note + code review               |

## Data Placement And Sync Contract

- Server-canonical:
  - `admin_note.id`,
  - `admin_note_attachments` rows,
  - admin attachment storage object keys and canonical metadata.
- Local-only:
  - staged screenshots under `/.tmp/admin-note-imports/`,
  - chat-pasted screenshots used only for discussion/interpretation,
  - transient local path references shared with Codex during a session.
- Sync policy:
  - the owner stages a real image file locally before asking Codex to attach it,
  - Codex may use the matching chat image for interpretation, but not as upload source,
  - upload happens only on explicit note-targeted action,
  - staged file deletes only after confirmed attachment success,
  - failed uploads keep the staged file in place and return an explicit recovery message.
- Retention and sensitivity:
  - staged screenshots may contain sensitive operational information,
  - staged files must remain gitignored and local-only,
  - successful imports should clear the staged file promptly unless the owner explicitly wants to keep it.
- Cache/invalidation:
  - existing notes manager/context-panel refresh rules remain authoritative after attachment upload,
  - the staging directory itself is outside app runtime caching.

## Identity And Rename Contract

- Canonical stable IDs:
  - `admin_note.id` remains the canonical note identity,
  - attachment IDs remain canonical after the upload succeeds.
- Human-readable identifiers:
  - local staging filenames are operator convenience only and are not canonical identity,
  - note titles and screenshot filenames remain display metadata, not source-of-truth identity.
- Mutability rules:
  - a local staged filename may be renamed freely before upload,
  - the target note ID must be explicit at upload time,
  - the staging path must not be persisted as canonical attachment metadata unless already supported by the existing attachment schema.
- Rename vs repurpose policy:
  - changing a staging filename is harmless local prep,
  - changing the target note means a new explicit upload action rather than silently retargeting an in-flight import.
- Compatibility contract:
  - existing attachment flows continue to work unchanged,
  - operators who do not use chat-based collaboration can still attach screenshots through the normal UI.
- Observability and repair:
  - if a staged file is missing, unreadable, or upload fails, Codex must report the exact file/path failure and keep the local staging file untouched when possible.

## Scope

- Define `/.tmp/admin-note-imports/` as the standard repo-local staging path for screenshots that will later be attached to admin notes.
- Keep the workflow explicit:
  - optional chat paste for interpretation,
  - required staged file for real upload,
  - explicit note ID + file path as the actionable input.
- Support two operator-approved workflows going forward:
  - `Fast manual attachment path`:
    - owner describes the issue in chat,
    - Codex creates the admin note,
    - Codex returns the direct `freeswimming.org/admin?...` note link,
    - owner opens the note and pastes/uploads the screenshot manually in the UI.
  - `Assisted staged-file attachment path`:
    - owner stages a real image file under `/.tmp/admin-note-imports/`,
    - owner gives Codex the target note ID plus file path,
    - owner may also paste the same image in chat for interpretation,
    - Codex imports the staged file into the note attachment flow and then deletes the local staged file after confirmed success.
- Add repo-level protection against accidental commit of staged screenshots.
- Document cleanup semantics:
  - delete staged file after confirmed success,
  - preserve on failure and explain next step.
- Reuse the existing admin-note attachment system rather than creating a second screenshot store.

## Out Of Scope

- Direct binary ingestion from chat-pasted images.
- Any workflow that depends on Python or private chat/runtime scraping.
- Storing staging images in `app/`, `public/`, or any committed asset folder.
- New public screenshot upload features.
- OCR, captioning, or automatic structured extraction from screenshots.

## Acceptance Criteria

1. The repo defines a gitignored local staging path for admin-note screenshot imports at `/.tmp/admin-note-imports/`.
2. The workflow explicitly states that chat screenshots may be used for interpretation, but a real staged file path is required for upload.
3. The target admin note remains identified by canonical note ID, not by screenshot filename or chat context.
4. The brief explicitly preserves a faster manual path where Codex creates the note first and always returns a direct admin-note link so the owner can paste the screenshot manually with minimal clicks.
5. On confirmed staged-file upload success, the staged file is deleted; on failure, it is preserved and the failure reason is surfaced clearly.
6. After either note creation or staged-file attachment import, Codex returns a direct `freeswimming.org` admin-notes link to the targeted note for verification.
7. No solution in this slice depends on Python-based chat scraping, hidden chat internals, `app/`, or `public/` storage.
8. Help/Guide or runbook copy is updated in the same implementation PR if operator workflow wording changes beyond this planning brief.
9. `npm run lint:briefs` and relevant validation pass before any implementation PR update.

## Validation

- `npm run lint:briefs`
- targeted validation for any new helper or workflow wrapper added in implementation
- targeted admin-notes regression coverage if the import path touches attachment UI or mutation helpers
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin?tab=notes`
  - repo-local staging path `/.tmp/admin-note-imports/`
- Preview:
  - PR preview URL if an implementation branch changes operator-facing notes copy or workflow affordances.

## Constraints

- Keep the first solution truthful and boring: real file in staging, existing admin-note attachment contract, deterministic cleanup.
- Do not present chat-image interpretation as if it were a real file-upload capability.
- Keep screenshots local-only before upload and minimize the chance of accidental git inclusion.
- Prefer the faster create-note-then-return-link path when the owner is happy to paste/upload the screenshot manually.
- Use the staged-file import path only when the owner explicitly wants Codex to perform the attachment step.

## 10/10 Quality Bar

- The workflow should feel obvious enough that the owner never has to guess whether Codex is using the chat image or the staged file.
- Failure states must be explicit:
  - missing staged file,
  - unreadable path,
  - note-targeting mismatch,
  - attachment upload failure,
  - cleanup failure after successful upload.
- Security/privacy expectations must stay explicit:
  - local-only before upload,
  - gitignored staging,
  - admin-only after upload.

## Help/Guide And Operator Training Contract

- If implementation changes any visible operator wording or introduces a reusable helper workflow, update Help/Guide or the relevant runbook in the same PR.
- Wording must explicitly separate:
  - chat screenshot for discussion,
  - staged file for attachment import.
- Wording should also explicitly document the recommended low-friction default:
  - Codex creates the note,
  - Codex returns the direct note link,
  - owner pastes/uploads the screenshot manually in the note UI.

## Session Continuity And Recovery

- Canonical recovery order:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint
- If the working tree is dirty during implementation, summarize:
  - which staged screenshot files were intentionally kept,
  - which note imports were completed,
  - which cleanup step remains.

## Git Rhythm Defaults

- Keep this slice small:
  - one coherent workflow contract,
  - one implementation pass,
  - one validation cycle before PR update.

## PR Browser Rule

- Open PR/review links in Safari by default.

## Checkpoint Log

- `2026-04-05 | planning | captured the first truthful contract for turning chat-discussed screenshots into real admin-note attachments: staged local image is upload source-of-truth, chat image is interpretation-only, and the default low-friction path remains create-note-then-return-link for manual paste in the UI | next: implement the gitignored staging path, a helper/CLI for note-id + file-path imports, and the operator recovery wording for success/failure cleanup`
- `2026-04-06 | in-progress | reopened the slice after the swim-session builder wave closed, verified the remaining open admin notes, and chose note 4120fac6 as the next actionable implementation because it already has a narrow, dependency-light workflow contract | next: land the staging-path protection, staged-file import helper, tests, and operator docs in one small pass`
- `2026-04-06 | implementation | shipped the first supported staged-screenshot workflow: gitignored /.tmp/admin-note-imports/, a CLI helper for note-id + file-path imports with deterministic cleanup semantics, Help/Guide + recovery wording that separates chat interpretation from file upload, and targeted regression coverage for the new helper/docs contract | next: keep the tree clean, commit, push, open PR, and carry the slice through merge if CI stays green`
- `2026-04-06 | validation | targeted unit/type/help checks are green, lint:briefs:all passed, the new CLI prints stable usage, and full npm run verify:pre-pr passed (95 passed / 319 skipped) in the clean worktree | next: commit, push, open PR in Safari, and monitor required CI`
