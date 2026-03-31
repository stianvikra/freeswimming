# Task Brief: Admin Notes Multi-Image And Save-Again Follow-Up (10/10)

## Metadata

- `id`: `2026-03-31-admin-notes-multi-image-and-save-again-followup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-31`
- `updated`: `2026-03-31`

## Goal

Admin notes capture supports repeated pre-save screenshots and a faster post-save quick-note loop without changing canonical note identity or reopening the larger route-surface/metadata follow-up.

## Why This Brief Exists

- The broader admin-notes ergonomics follow-up is still valid, but the next highest-value half is narrower:
  - repeated clipboard-paste or upload before save should append instead of replace,
  - quick note should feel ready for the next capture after save instead of forcing a full reopen/rebuild loop.
- These two gaps share the same local/server boundary:
  - local staged evidence before save,
  - canonical note row first,
  - attachment upload after note save,
  - explicit recovery when upload fails.
- The remaining half of the earlier planned brief still stays separate on purpose:
  - route-surface expansion,
  - richer attachment metadata / agent-readiness surfacing.

## Dependencies And Boundaries

- Parent follow-up that still owns the unsplit remainder:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-03-27-admin-notes-ergonomics-multi-image-and-route-surface-followup-10-10.md`
- Existing foundations that remain authoritative:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-25-admin-notes-image-intake-simplification-and-clipboard-paste-button-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-27-admin-notes-global-quick-capture-panel-and-manuscript-categories-10-10.md`
- In-scope surfaces for this slice:
  - `Quick note` utility panel,
  - contextual `Add note` panel,
  - Notes-tab create form.
- This slice owns:
  - pre-save staged image lists on those create flows,
  - append-not-replace behavior for repeated paste/upload,
  - explicit per-image remove behavior,
  - quick-note post-save `save and stay ready` flow,
  - help/runbook wording for the changed capture contract.
- This slice does not own:
  - quick-capture route-surface expansion,
  - richer saved attachment metadata presentation,
  - schema/storage model changes,
  - non-image attachment types,
  - reopening edit-surface attachment UX beyond parity safety.

## Admin Notes Triage Disposition

- `0d1fa716-460e-406a-a68d-28c1aaae5b22` `Mulitple Screenshots`
  - disposition: owned by this brief.
  - reason: repeated pre-save paste/upload append behavior is the central scope here.
- `40b252d8-ee9f-41ed-89ca-0eb5af8bcc89` `Quick note`
  - disposition: owned by this brief.
  - reason: post-save quick-note reuse and continued capture flow are the second half of this slice.
- `881e222b-4c14-4a23-b677-60b0713e220f` `Admin notes quick capture route-surface expansion follow-up`
  - disposition: remains with the broader planned follow-up brief.
  - reason: not needed to ship multi-image + save-again safely.
- `204913d0-5c97-41e8-b6f7-ab42de3bc84e` `Admin notes attachment metadata and agent-readiness follow-up`
  - disposition: remains with the broader planned follow-up brief.
  - reason: saved-metadata richness can ship after staged multi-image behavior is stable.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Incident response and support operations`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                               | Evidence                                |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| Product goals and IA                          | `target`     | Create-note surfaces explain in one scan that operators can stage multiple screenshots before save and quick note stays ready for another capture afterward. | UI review + manual QA + targeted tests  |
| UX flow clarity                               | `target`     | Repeated paste/upload appends predictably, per-image remove is explicit, and quick note save leads directly into the next capture state without dead ends.   | unit/e2e + timed manual QA              |
| Visual design quality                         | `target`     | Multi-image staging stays readable and calm, not like an unbounded uploader bucket.                                                                          | screenshot review + manual QA           |
| Business logic correctness and data integrity | `target`     | Staged image ordering, remove behavior, save/reset semantics, and upload recovery remain deterministic and tied to the correct canonical note/context.       | unit tests + code review + targeted e2e |
| Admin editor ergonomics                       | `target`     | Operators can capture several screenshots and save another quick note without reopening or rebuilding the same flow manually.                                | e2e + manual workflow timing            |
| Accessibility (a11y)                          | `supporting` | Supporting only: staged image lists, remove buttons, and save-again flow stay keyboard/touch accessible and clearly labeled.                                 | code review + targeted UI assertions    |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: pre-save multi-image staging must not add meaningful route or bundle regressions beyond bounded local preview state.                        | verify evidence + diff review           |
| Data placement and sync boundaries            | `target`     | Brief makes local staged-image lists explicit and preserves server-canonical note/attachment writes only on save/upload.                                     | brief contract + tests                  |
| Caching and invalidation strategy             | `supporting` | Supporting only: after save/retry the notes surfaces refresh deterministically through existing note mutation patterns.                                      | code review + regression tests          |
| Reliability and failure handling              | `target`     | Limit errors, upload failures, and retry/remove states stay actionable and never leave operators guessing which images are still local vs saved.             | negative-path tests + manual QA         |
| Security and authz                            | `supporting` | Supporting only: richer staged-image flows remain admin-only and fail closed on unauthorized access.                                                         | existing authz coverage + code review   |
| Privacy and compliance                        | `target`     | Pre-save screenshots remain local until explicit save/upload and no broader exposure path is introduced.                                                     | code review + tests                     |
| Content governance                            | `supporting` | Supporting only: note category/context semantics remain unchanged while capture ergonomics improve.                                                          | parent-brief alignment + copy review    |
| Admin workflow and editability                | `target`     | Quick note, contextual add note, and Notes create follow the same bounded multi-image rule so operators do not need surface-specific memory.                 | manual QA + unit/e2e                    |
| SEO and crawlability                          | `N/A`        | N/A because admin notes capture remains a private admin-only workflow with no public crawl/index contract.                                                   | explicit scope rationale                |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing discoverability surface; it only improves internal capture ergonomics.                                    | explicit scope rationale                |
| Analytics and KPI observability               | `supporting` | Supporting only: save-again and staged-image-count behavior should remain measurable if existing workflow instrumentation grows later.                       | code review + scope rationale           |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, entitlements, or revenue operations logic changes in this admin-notes slice.                                                | explicit scope rationale                |
| Incident response and support operations      | `target`     | Help/Guide and runbooks explain multi-image staging, image-limit/retry behavior, and the quick-note save-again loop in the same PR.                          | docs update + automated help assertion  |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payout, or reporting workflow changes here.                                                                           | explicit scope rationale                |
| i18n operational readiness                    | `N/A`        | N/A because this is internal admin ergonomics work and does not alter the localization model beyond keeping logic out of copy.                               | explicit scope rationale                |
| Stack-fit and dependency discipline           | `target`     | Reuse existing notes primitives and attachment APIs with no new third-party upload/state dependency.                                                         | dependency diff + code review           |
| Testing and QA automation                     | `target`     | Coverage protects append-not-replace staging, per-image remove, quick-note save-again behavior, and updated Help/Guide contract.                             | targeted tests + `verify:pre-pr`        |
| Scalability and cost efficiency               | `supporting` | Supporting only: staged-image support stays bounded by explicit max count and avoids runaway local preview memory or upload churn.                           | code review + bounded-limit assertions  |
| DevOps and rollback readiness                 | `supporting` | Supporting only: create-flow ergonomics remain reversible without schema rollback or data migration.                                                         | git diff review                         |

## Data Placement And Sync Contract

- Server-canonical:
  - `admin_notes` rows,
  - `admin_note_attachments` rows,
  - attachment storage objects,
  - saved context refs on canonical note rows.
- Local-only:
  - staged pre-save image list,
  - quick-note draft field values,
  - contextual create-form draft field values,
  - create-form save-again UI state.
- Sync policy:
  - repeated paste/upload only mutates local staged state until a note save happens,
  - note save still writes the canonical note first,
  - attachment upload still happens after note save against the saved note ID,
  - quick note save-again clears local draft fields and staged images for the next note while preserving the same locked context,
  - failed attachment upload keeps the saved note ID plus local staged images visible for retry/remove.
- Retention and sensitivity:
  - staged screenshots remain local/browser-only until explicit upload,
  - discard/remove clears the related preview URLs and local files,
  - no new persistence of staged files beyond the current browser session memory model.
- Cache/invalidation:
  - saved/retried notes continue to refresh through existing notes APIs and local state replacement.

## Identity And Rename Contract

- Canonical stable IDs:
  - `admin_note.id` remains the canonical note identity,
  - `admin_note_attachment.id` remains the canonical attachment identity after save.
- Human-readable identifiers:
  - note title, category, and attachment filename remain operator-facing labels only.
- Mutability rules:
  - this slice changes create-flow ergonomics only; it does not change note or attachment identity semantics.
- Rename vs repurpose policy:
  - each staged image that reaches upload becomes a new attachment row,
  - quick-note save-again creates a new canonical note row instead of silently editing the just-saved note.
- Compatibility contract:
  - existing notes with zero or one attachment remain valid,
  - edit-surface attachment behavior remains compatible with existing saved notes.
- Observability and repair:
  - if attachment upload fails after note save, the operator keeps an explicit retry/remove path tied to that saved note.

## Scope

- Add bounded pre-save multi-image staging to:
  - `Quick note`,
  - contextual `Add note`,
  - Notes-tab create form.
- Change repeated clipboard-paste and upload behavior from replace to append.
- Add explicit per-image remove controls and limit messaging on those create flows.
- Change quick note post-save behavior to stay open and ready for another note on the same locked context after a successful save/upload path.
- Keep/update retry behavior when note save succeeds but attachment upload fails.
- Update Help/Guide and admin-notes recovery/runbook copy for the new behavior.

## Out Of Scope

- Quick-capture route-surface expansion.
- Saved attachment metadata richness / agent-readiness surfacing.
- Changing note-edit attachment behavior beyond maintaining compatibility.
- New schema, buckets, OCR, annotation, or non-image uploads.

## Acceptance Criteria

1. `Quick note`, contextual `Add note`, and Notes create can stage more than one image before save.
2. Repeated clipboard-paste or upload appends to the staged image list until the explicit max is reached instead of replacing the prior image.
3. Operators can remove one staged image without clearing the rest of the staged list.
4. Quick note save leaves the panel ready for another note on the same locked context instead of forcing a close/reopen loop.
5. If quick note save succeeds but attachment upload fails, the retry/remove recovery still works with the staged image list and saved note ID.
6. Help/Guide and runbook wording no longer say create flows can only stage one pre-save image.
7. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/admin-note-quick-capture-launcher.test.tsx`
  - `tests/unit/admin-note-compose.test.ts`
  - targeted admin-notes create/context tests added or updated in this slice
- targeted `playwright`:
  - `tests/e2e/admin-notes-workflow.spec.ts --project=desktop-chromium`
  - `tests/e2e/admin-help-center.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin`
  - contextual admin-note surfaces reached from real admin content/pages
- Preview:
  - PR Vercel preview URL after branch push
- Recommended matrix:
  - desktop Chromium for repeated capture timing,
  - iPhone Safari-width viewport for bounded staged-image layout sanity,
  - desktop Safari/WebKit for final interaction sanity.

## Constraints

- Keep the slice focused on create-flow ergonomics, not the broader admin-notes system.
- Use the existing server max (`6`) as the staged-image cap unless a concrete blocker appears.
- Quick note must remain a lightweight note-capture utility, not turn into a separate mini notes app.

## 10/10 Quality Bar

- Repeated screenshot capture should feel faster, not heavier.
- Required changed states remain explicit:
  - `empty staged list`,
  - `images staged`,
  - `per-image remove`,
  - `max reached`,
  - `save success`,
  - `save succeeded but upload retry needed`,
  - `error / retry`.
- The operator should understand in one scan that more screenshots can be added before save.
- Quick note should make the next capture obvious immediately after save.

## Help/Guide And Operator Training Contract

- Required:
  - update Help/Guide and `docs/runbooks/admin-notes-recovery.md` in the same PR,
  - update at least one automated help assertion that reflects the new multi-image/save-again contract.

## Security, Privacy, and Compliance

- All staged and saved images remain admin-only.
- No attachment/storage paths may leak into public surfaces.
- Unauthorized note and attachment mutations continue to fail closed with `401`/`403`.

## Observability and KPI Contract

- Supporting events/logs if hooks exist later:
  - staged image count,
  - quick-note save-again loop usage,
  - multi-image retry/remove failures.
- Success KPI for this slice:
  - the operator can capture several screenshots and immediately save another quick note without rebuilding the same flow.

## Session Continuity And Recovery

- Canonical source of truth:
  - git branch,
  - this brief path.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit after each validated create-flow milestone.
- Push and open/update PR after the slice passes `verify:pre-pr`.

## Automation Mode

- `automation-first`

## Branch Hygiene Defaults

- Post-merge cleanup:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Manual QA URL Rule

- Default local QA route for this slice:
  - `/admin?tab=notes`

## Checkpoint Log

- `2026-03-31 | working tree | split the next admin-notes implementation wave out of the broader planned ergonomics brief so this slice can ship bounded multi-image pre-save staging and quick-note save-again behavior first, while route-surface expansion and richer attachment metadata stay explicitly planned for the following wave | next: implement staged-image arrays across quick note/context/create, update docs/tests, and run verify:pre-pr`
- `2026-03-31 | working tree | implemented bounded multi-image staging across quick note/context/create, kept quick note open-and-ready after successful save on the same locked context, updated Help/Guide + recovery runbook, and cleared local gates via targeted vitest/playwright + full verify:pre-pr | next: review final diff, commit, and open PR`
