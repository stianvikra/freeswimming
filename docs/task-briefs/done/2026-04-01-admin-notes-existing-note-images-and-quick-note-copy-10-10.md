# Task Brief: Admin Notes Existing-Note Images And Quick-Note Copy (10/10)

## Metadata

- `id`: `2026-04-01-admin-notes-existing-note-images-and-quick-note-copy-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-01`
- `updated`: `2026-04-02`

## Goal

Operators can add screenshots to an already-saved contextual admin note without recreating it, while quick-note surfaces become calmer and shorter without losing the actual note workflow.

## Why This Brief Exists

- The `2026-04-01` live production-note re-triage confirmed that the next highest-value admin-notes slice is not more route sprawl first; it is evidence recovery and copy calmness on the surfaces already in use.
- Two production notes clearly belong together:
  - `95f2361c-925d-42e3-a7e5-553410faec88` `Add screenshots to admin notes`
  - `85fb1d9f-efd9-4aa5-8bfe-7ab35c989b43` `Quick notes - Less is more`
- The security-surface note is the same copy problem on the same quick-note launcher:
  - `24bc6866-1b4e-41b1-9e4f-ae803bf06ca3` `Quick Note`
- This slice should land before broader route-surface expansion because it improves the workflow that already exists instead of widening a still-rougher one.

## Dependencies And Boundaries

- Existing admin-notes foundations remain authoritative:
  - `/tmp/freeswimming-admin-notes-slice-2026-04-01/docs/task-briefs/in-progress/2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md`
  - `/tmp/freeswimming-admin-notes-slice-2026-04-01/components/admin/AdminNotesManager.tsx`
  - `/tmp/freeswimming-admin-notes-slice-2026-04-01/components/admin/AdminContextNotesPanel.tsx`
  - `/tmp/freeswimming-admin-notes-slice-2026-04-01/components/admin/AdminNoteQuickCaptureLauncher.tsx`
  - `/tmp/freeswimming-admin-notes-slice-2026-04-01/docs/runbooks/admin-notes-recovery.md`
- This slice is the first execution child under the `2026-04-01` production admin-notes umbrella backlog.
- This slice owns:
  - contextual-note edit parity for image upload/delete on already-saved notes,
  - calmer quick-note headings, helper copy, and action labels on the launcher-driven surfaces,
  - help/runbook/test updates for the changed operator contract.
- This slice does not own:
  - broader quick-capture route-surface expansion,
  - new attachment schema or metadata migration,
  - related-note UX changes,
  - note-ID or taxonomy redesign beyond what is already shipped.

## Admin Notes Triage Disposition

- `95f2361c-925d-42e3-a7e5-553410faec88` `Add screenshots to admin notes`
  - disposition: owned by this brief.
  - reason: the missing workflow is specifically the contextual bottom-panel edit surface, not the full Notes manager.
- `85fb1d9f-efd9-4aa5-8bfe-7ab35c989b43` `Quick notes - Less is more`
  - disposition: owned by this brief.
  - reason: the launcher copy can be simplified without reopening route-surface or schema work.
- `24bc6866-1b4e-41b1-9e4f-ae803bf06ca3` `Quick Note`
  - disposition: owned by this brief.
  - reason: it is the same launcher/copy contract viewed from `/my-library/security`.
- `881e222b-4c14-4a23-b677-60b0713e220f` `Admin notes quick capture route-surface expansion follow-up`
  - disposition: out of scope for this slice.
  - reason: route expansion should come after the existing surfaces feel correct.
- `204913d0-5c97-41e8-b6f7-ab42de3bc84e` `Admin notes attachment metadata and agent-readiness follow-up`
  - disposition: supporting only, not fully owned here.
  - reason: this slice may improve visible attachment cards in the contextual panel, but it should not reopen the broader metadata/agent-readiness decision space.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                            | Evidence                                           |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Product goals and IA                          | `target`     | Operators understand in one scan that quick note is a lightweight admin-note capture tool and that saved contextual notes can receive more images later. | UI review + help copy + tests                      |
| UX flow clarity                               | `target`     | Quick-note surfaces remove low-value filler copy, keep the primary save/discard actions obvious, and let operators recover missing screenshots via Edit. | manual QA + targeted unit/e2e                      |
| Visual design quality                         | `target`     | The simplified launcher and contextual attachment UI feel calmer, not emptier or unfinished.                                                             | screenshot review + preview QA                     |
| Business logic correctness and data integrity | `target`     | Adding images to an existing contextual note targets the correct canonical note ID, refreshes deterministically, and preserves delete/retry semantics.  | unit tests + code review + targeted e2e            |
| Admin editor ergonomics                       | `target`     | Operators do not need to recreate a note just because they forgot the screenshot the first time.                                                         | manual workflow timing + e2e                       |
| Accessibility (a11y)                          | `supporting` | Supporting only: simplified quick-note copy and contextual image controls remain keyboard/touch accessible with clear labels.                             | code review + targeted e2e                         |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no material route-level regression beyond the existing bounded image-edit UI.                                                            | verify evidence + diff review                      |
| Data placement and sync boundaries            | `target`     | Existing-note image additions remain server-canonical only after upload success; quick-note draft/helper copy stays local-only.                           | brief contract + tests                             |
| Caching and invalidation strategy             | `target`     | Contextual note cards refresh deterministically after upload/delete without stale attachment counts or hidden images.                                     | integration review + targeted tests                |
| Reliability and failure handling              | `target`     | Upload/delete failures stay actionable and never claim success while the canonical note still lacks the intended image state.                             | negative-path tests + manual QA                    |
| Security and authz                            | `target`     | Existing-note image edits stay admin-only and fail closed on unauthorized paths.                                                                          | authz review + protected-path tests                |
| Privacy and compliance                        | `target`     | Admin-only screenshots remain private and visible only through the protected notes flows.                                                                  | code review + attachment-path tests                |
| Content governance                            | `supporting` | Supporting only: simplified copy stays aligned with the actual admin-notes workflow and Help/Guide wording.                                               | copy review + docs update                          |
| Admin workflow and editability                | `target`     | Contextual panel edit mode reaches practical feature parity for image evidence without forcing a detour into full Notes manager for common recovery.      | workflow QA + tests                                |
| SEO and crawlability                          | `N/A`        | N/A because this slice is admin-only workflow/UI work with no public crawl/index contract.                                                                | explicit scope rationale                           |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing route or schema.                                                                                        | explicit scope rationale                           |
| Analytics and KPI observability               | `supporting` | Supporting only: changed evidence-recovery behavior should remain measurable if instrumentation expands later.                                             | code review + scope rationale                      |
| Commerce and revenue ops                      | `N/A`        | N/A because this admin-notes slice changes no pricing, billing, entitlement, or revenue logic.                                                            | explicit scope rationale                           |
| Incident response and support operations      | `target`     | Help/Guide and admin-notes recovery runbook explain the new “edit existing note to add images” recovery path in the same PR.                              | docs update + automated help assertion             |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payout, refund, or reporting flow changes here.                                                                    | explicit scope rationale                           |
| i18n operational readiness                    | `N/A`        | N/A because this slice is internal admin ergonomics and keeps structural logic out of copy.                                                               | explicit scope rationale                           |
| Stack-fit and dependency discipline           | `target`     | Reuse existing note-upload primitives and contextual-panel patterns without adding new libraries.                                                          | dependency diff + code review                      |
| Testing and QA automation                     | `target`     | Coverage protects quick-note copy/action changes plus contextual existing-note image upload/delete parity and help-copy alignment.                         | targeted tests + `verify:pre-pr`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: this slice uses the existing attachment cap/storage flow and introduces no new unbounded upload path.                                    | code review + existing limit assertions            |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the UI/edit parity change remains reversible without schema rollback or data migration.                                                   | PR summary + rollback note                         |

## Data Placement And Sync Contract

- Server-canonical:
  - `admin_notes` rows,
  - `admin_note_attachments` rows,
  - attachment storage objects,
  - saved contextual note identity and context.
- Local-only:
  - quick-note draft text,
  - quick-note staged pre-save images,
  - transient success/error notices,
  - local open/collapsed panel state.
- Sync policy:
  - quick-note create still writes the note first and only then uploads staged images,
  - contextual edit image add/delete acts directly on the existing saved canonical note ID,
  - contextual note list/card state refreshes from the returned canonical note payload after image mutations.
- Retention and sensitivity:
  - images remain admin-only,
  - no raw storage paths may leak into public surfaces or UI copy.
- Cache/invalidation:
  - contextual note cards and edit forms must replace stale item state immediately after upload/delete success.

## Identity And Rename Contract

- Canonical stable IDs:
  - `admin_note.id` remains the canonical note identity,
  - `admin_note_attachment.id` remains the canonical attachment identity.
- Human-readable identifiers:
  - note titles, helper copy, button labels, and attachment filenames are display metadata only.
- Mutability rules:
  - quick-note copy may change in place,
  - adding an image to a saved contextual note must not create a second note row by accident.
- Rename vs repurpose policy:
  - upload new images onto the same note only when the operator is editing that existing note,
  - create a new note only when the operator explicitly saves a new quick note or add-note form.
- Compatibility contract:
  - existing notes with zero attachments remain valid,
  - older quick-note saves still resolve in Notes and contextual panels after copy changes.
- Observability and repair:
  - upload/delete failures surface explicit actionable messages and remain recoverable through the contextual panel or Notes manager.

## Scope

- Simplify quick-note launcher copy on the affected surfaces:
  - heading,
  - helper text,
  - image-intake copy,
  - action labels.
- Add existing-note image upload/delete controls to contextual note edit mode.
- Show saved attachment evidence in contextual note cards so the operator can confirm the result without leaving the page.
- Update Help/Guide and admin-notes recovery wording for the changed contract.
- Add/update targeted tests around the new contextual edit-image workflow and simplified launcher wording.

## Out Of Scope

- Route-surface expansion to additional pages.
- New attachment schema, OCR, metadata migration, or agent-readiness policy.
- Related-note UX beyond keeping compatibility.
- Reworking full Notes manager behavior that already has attachment edit support.

## Acceptance Criteria

1. An operator can open an existing contextual note in the bottom page panel, click `Edit`, and upload one or more images onto that saved note.
2. An operator can delete an attachment from that contextual edit surface and see the note update deterministically.
3. The contextual note card shows saved image evidence after upload so the operator can confirm the result without leaving the page.
4. Quick-note launcher copy on the targeted surfaces no longer uses the removed filler phrases from the production notes.
5. Quick-note primary actions use the simpler requested labels (`Save`, `Discard`) without breaking the save-again workflow.
6. Help/Guide and `docs/runbooks/admin-notes-recovery.md` describe the existing-note image recovery path.
7. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/admin-note-quick-capture-launcher.test.tsx`
  - `tests/unit/admin-context-notes-panel.test.tsx`
- targeted `playwright`:
  - `tests/e2e/admin-contextual-notes.spec.ts --project=desktop-chromium`
  - `tests/e2e/admin-help-center.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/plans`
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/my-library/security`
  - `http://127.0.0.1:3000/admin?tab=help`
- Preview:
  - PR Vercel preview URL after branch push
- Recommended matrix:
  - desktop Chromium
  - desktop Safari/WebKit
  - iPhone Safari-width viewport for quick-note copy/layout sanity

## Constraints

- Keep the slice focused on evidence recovery and quick-note calmness.
- Do not widen route availability in the same PR.
- Reuse the full Notes manager attachment workflow patterns instead of inventing another upload path.

## 10/10 Quality Bar

- The operator should feel less friction, not less capability.
- Quick note should read like a lightweight admin tool, not a verbose wizard.
- Required states remain explicit:
  - `loading`
  - `empty`
  - `error`
  - `retry`
  - `save success`
  - `upload failed`
  - `image present`
  - `image deleted`
- The saved-note image recovery path should be obvious enough that the operator no longer recreates notes unnecessarily.

## Help/Guide And Operator Training Contract

- Required:
  - update Help/Guide note-capture guidance in the same PR,
  - update `docs/runbooks/admin-notes-recovery.md`,
  - update at least one automated assertion for the changed help contract.

## Security, Privacy, and Compliance

- Attachment upload/delete from contextual edit mode must remain admin-only.
- Unauthorized note or attachment mutations must continue to return `401`/`403`, not `500`.
- Simplified copy must not hide the admin-only nature of the evidence flow.

## Observability And KPI Contract

- Useful future events/logs if hooks expand later:
  - contextual existing-note image upload started/completed/failed,
  - contextual attachment delete started/completed/failed,
  - quick-note save/discard usage after copy simplification.
- Success KPI for this slice:
  - operators can recover a missing screenshot by editing the existing contextual note instead of recreating the note.

## Session Continuity And Recovery

- Canonical source of truth:
  - git branch
  - this brief path
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after each validated implementation step for this slice.
- Open/update PR after one coherent validated admin-notes vertical slice.

## Automation Mode

- `automation-first`
  - assistant handles implementation, tests, git checkpoints, push, PR open/update, and CI monitoring unless blocked by credentials, UI-only approval, or explicit owner decision.

## Branch Hygiene Defaults

- Post-merge cleanup:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git push origin --delete <merged-branch>` when appropriate

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Manual QA URL Rule

- Open the exact local/preview URL in Safari before requesting owner validation when manual QA is needed.

## Checkpoint Log

- `2026-04-01 | working tree | created the first in-progress child slice under the production admin-notes umbrella, focused on contextual existing-note image recovery plus quick-note copy simplification | next: implement contextual attachment edit parity, update docs/tests, and run targeted validation`
- `2026-04-02 | 1f960e4 | implemented contextual existing-note image upload/delete parity, simplified quick-note copy/actions, updated Help/Guide + recovery wording, and passed targeted desktop Chromium admin-notes coverage plus full npm run verify:pre-pr | next: commit the validated slice, push the worktree branch, and open/update the PR`
- `2026-04-02 | 99ae6a3 | hardened contextual attachment delete state against stale hydrated responses, added a unit regression covering stale delete payloads, and passed isolated Playwright repros plus full npm run verify:pre-merge in a clean PR worktree | next: commit the regression fix, push the branch, and recheck PR status`
- `2026-04-02 | a43722c | PR #337 merged to main; the slice shipped existing-note image recovery, calmer quick-note copy/actions, help/runbook updates, and delete-state hardening | next: move this brief to done and continue with the narrower route-surface expansion follow-up`

## Completion Record

- `PR`: `#337`
- `merge`: `2026-04-02`
- `merge_commit`: `a43722ceeb9391e632675cbf277815692d2937db`
- `result`: `merged to main`
