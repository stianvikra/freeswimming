# Task Brief: Admin Notes Ergonomics Multi-Image And Route-Surface Follow-Up (10/10)

## Metadata

- `id`: `2026-03-27-admin-notes-ergonomics-multi-image-and-route-surface-followup-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-27`
- `updated`: `2026-03-30`

## Goal

Close the remaining operator-facing admin-notes ergonomics gaps after the quick-capture utility-panel rollout so notes are faster to capture, richer in evidence, and easier to keep using across real review sessions.

## Why This Brief Exists

- Core notes workflows, quick capture, clipboard/image intake, and linking are already shipped, but real usage still exposes a smaller follow-up wave.
- The current gaps are tightly related:
  - only one pre-save image in quick note/contextual add note,
  - pasting or uploading another screenshot currently replaces the staged image instead of appending it,
  - uncertainty around what quick note should do after save,
  - incomplete route-surface rollout for quick capture,
  - attachment metadata/agent-readiness expectations not yet made explicit enough in operator flows.
- These issues are real notes ergonomics work, but they should stay separated from the larger workout-builder UX/action batch.
- This brief intentionally owns the operator-facing remainder so the broader admin-notes system is not reopened piecemeal without explicit scope.

## Dependencies And Boundaries

- Existing storage/linking/note foundations that remain authoritative:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-25-admin-notes-image-intake-simplification-and-clipboard-paste-button-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-27-admin-notes-global-quick-capture-panel-and-manuscript-categories-10-10.md`
- Recommended boundary decisions unless owner explicitly changes them:
  - quick note still creates a normal canonical admin note,
  - canonical note identity remains note ID + canonical route/content context,
  - quick-note draft can travel across supported surfaces, but original note context stays explicit and locked unless the user intentionally changes it,
  - this slice improves ergonomics and metadata clarity; it does not replace notes with a larger ticketing system.

## Admin Notes Triage Disposition

Production admin notes reviewed against this brief on `2026-03-27`:

- `0d1fa716-460e-406a-a68d-28c1aaae5b22` `Mulitple Screenshots`
  - disposition: owned by this brief.
  - reason: pre-save multi-image evidence is the clearest remaining operator gap in quick note/contextual capture, including repeated clipboard-paste or upload flows appending instead of replacing earlier staged screenshots.
- `40b252d8-ee9f-41ed-89ca-0eb5af8bcc89` `Quick note`
  - disposition: owned by this brief.
  - reason: post-save reuse, top-of-page access expectations, and continued capture flow belong in the same ergonomics wave.
- `881e222b-4c14-4a23-b677-60b0713e220f` `Admin notes quick capture route-surface expansion follow-up`
  - disposition: owned by this brief.
  - reason: the route-surface rollout should now be handled as an explicit matrix instead of a vague future placeholder.
- `204913d0-5c97-41e8-b6f7-ab42de3bc84e` `Admin notes attachment metadata and agent-readiness follow-up`
  - disposition: owned by this brief.
  - reason: remaining operator-visible attachment metadata and structured evidence expectations belong together with multi-image capture and route rollout so the note is not only partially covered.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Incident response and support operations`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                          | Evidence                                |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Product goals and IA                          | `target`     | Admin can understand how to stage evidence, save another quick note, and where quick capture is available without hidden route-specific rules.          | IA review + manual QA                   |
| UX flow clarity                               | `target`     | Quick note and contextual add note support the expected capture loop with no guessing about image limits, post-save state, or current context.          | timed manual QA + e2e                   |
| Visual design quality                         | `target`     | Multi-image evidence, metadata, and route-surface affordances stay clean and readable instead of turning notes into cluttered upload forms.             | screenshot review + manual QA           |
| Business logic correctness and data integrity | `target`     | Multi-image staging, save/reset behavior, and attachment metadata remain canonical, deterministic, and tied to the correct note/context.                | unit tests + API tests + runtime guards |
| Admin editor ergonomics                       | `target`     | Admin can keep capturing notes during real review sessions without having to reopen or rebuild the same note flow manually after every save.            | e2e + timed manual QA                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: image intake, staged evidence lists, and route-surface entrypoints must remain keyboard/touch accessible.                              | targeted e2e + code review              |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: richer pre-save evidence and broader route surfaces must not materially regress admin route responsiveness.                            | verify evidence + scope rationale       |
| Data placement and sync boundaries            | `target`     | Brief defines local staged-image state vs server-canonical attachments and clear save/reset behavior across supported surfaces.                         | brief contract + tests                  |
| Caching and invalidation strategy             | `supporting` | Supporting only: note panels and quick-capture surfaces refresh deterministically after save, attachment add/remove, or route changes.                  | code review + targeted tests            |
| Reliability and failure handling              | `target`     | Failed image staging/upload, route changes, or post-save reset behavior show explicit retry/recovery guidance instead of leaving the operator stranded. | negative-path tests + manual QA         |
| Security and authz                            | `supporting` | Supporting only: richer image intake and route-surface rollout remain admin-only and fail closed on unauthorized access.                                | existing authz tests + code review      |
| Privacy and compliance                        | `target`     | Images and attachment metadata remain internal/admin-only, and richer evidence flows do not leak into public pages or logs.                             | storage review + tests                  |
| Content governance                            | `supporting` | Supporting only: new category/metadata copy must remain coherent with canonical admin-note taxonomy and contextual note ownership.                      | copy review + parent-brief alignment    |
| Admin workflow and editability                | `target`     | Quick note/contextual add note should support repeated, low-friction evidence capture during real work without losing context or requiring detours.     | e2e + timed manual QA                   |
| SEO and crawlability                          | `N/A`        | N/A because admin-notes capture and attachment surfaces are private admin workflows with no public crawl/index contract.                                | scope rationale                         |
| AI discoverability                            | `N/A`        | N/A because this slice does not add public AI-facing discovery surfaces; it only improves internal notes capture and metadata structure.                | scope rationale                         |
| Analytics and KPI observability               | `supporting` | Supporting only: capture entrypoint usage, save-again behavior, and staged-image counts should remain measurable if analytics hooks exist.              | event review + code review              |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, refund, or entitlement logic is touched by this internal-notes ergonomics follow-up.                                   | scope rationale                         |
| Incident response and support operations      | `target`     | Help/Guide and runbooks must explain multi-image evidence, post-save quick-note behavior, route-surface availability, and attachment metadata handling. | help/runbook review + assertions        |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payout, or reporting workflow changes in this notes follow-up slice.                                             | scope rationale                         |
| i18n operational readiness                    | `N/A`        | N/A for this slice because it is internal notes ergonomics work and should not block future localization architecture beyond keeping logic out of copy. | scope rationale                         |
| Stack-fit and dependency discipline           | `target`     | Reuse existing notes, attachment, and quick-capture primitives; do not add third-party upload/state libraries without strong justification.             | dependency diff + architecture review   |
| Testing and QA automation                     | `target`     | Coverage protects multi-image pre-save flows, post-save quick-note reuse, route-surface rollout, and attachment metadata contracts.                     | unit/e2e coverage + `verify:pre-pr`     |
| Scalability and cost efficiency               | `supporting` | Supporting only: multi-image pre-save support must stay bounded and avoid runaway client memory, upload, or storage churn.                              | code review + manual QA                 |
| DevOps and rollback readiness                 | `target`     | Notes ergonomics changes remain reversible without schema ambiguity, and any attachment-metadata migration path is explicit and safe.                   | migration review + rollback notes       |

## Data Placement And Sync Contract

- Server-canonical:
  - admin note rows,
  - attachment metadata rows,
  - stored attachment object keys,
  - canonical route/content context,
  - any persisted structured attachment metadata required for operator/agent readiness.
- Local-only:
  - staged pre-save images,
  - draft title/text/priority/category inputs,
  - collapsed/open quick-note state,
  - local route-surface launcher state.
- Sync policy:
  - staged images remain local until explicit save,
  - save writes the note first and then canonicalizes attachment records according to the existing attachment contract,
  - post-save reuse/clear behavior must be explicit and deterministic,
  - route changes may preserve the draft shell, but the note context shown to the user must stay explicit.
- Retention and sensitivity:
  - images may contain sensitive internal review material and must remain admin-only,
  - abandoned staged local images must clear predictably when the user discards the draft or completes the flow.
- Cache/invalidation:
  - notes manager, contextual note panels, and quick-capture entrypoints must refresh deterministically after save or attachment changes.

## Identity And Rename Contract

- Canonical stable IDs:
  - `admin_note.id` remains canonical note identity,
  - attachment IDs remain canonical per stored image,
  - route/content context refs remain canonical context identity for where the note belongs.
- Human-readable identifiers:
  - note title, category label, and attachment filename/display metadata are operator-facing labels, not canonical identity.
- Mutability rules:
  - note wording and category remain editable in place,
  - route-surface availability may expand, but it must not silently retarget an existing saved note to a different canonical context,
  - attachment metadata may become richer, but it must not break existing attachments.
- Rename vs repurpose policy:
  - editing copy or metadata is an in-place update,
  - a materially different operational concern should still become a new note row rather than silently rewriting an unrelated note.
- Compatibility contract:
  - existing notes with a single attachment or no attachment metadata remain valid,
  - route-surface expansion must preserve the current utility-panel mental model where quick note still results in a normal admin note.
- Observability and repair:
  - broken staged-image saves, missing metadata, and stale route-surface state should surface explicit refresh/retry or recovery guidance.

## Scope

- Add pre-save multi-image support to:
  - quick note,
  - contextual `Add note` panels,
  - any directly related notes-entry surface chosen in this slice.
- Decide and implement the intended post-save quick-note behavior:
  - stay open and clear for another capture,
  - or offer an equally fast repeat-capture loop that does not require rebuilding the same entry flow manually.
- Expand quick-capture route availability through an explicit route-surface matrix instead of ad hoc surface additions.
- Improve operator-visible attachment metadata and evidence structure so the saved note is clearer for later human review and future agent-assisted reading.
- Keep Help/Guide and recovery/runbook language aligned with the final behavior.

## Out Of Scope

- Replacing admin notes with a full issue tracker or threaded comments system.
- Public user uploads or public note attachments.
- Non-image attachment types as a first-class system in this slice.
- Reopening unrelated builder or course-workspace work unless a shared bug is discovered.

## Acceptance Criteria

1. Quick note and contextual `Add note` can stage more than one image before save with clear limit/error handling, including repeated clipboard-paste or upload actions appending to the staged list instead of replacing the earlier screenshot unless the operator explicitly removes it.
2. After a quick note is saved, the next-step behavior is explicit and optimized for repeated capture rather than forcing the owner to rebuild the same flow manually.
3. Quick capture route-surface availability is documented and implemented intentionally for the chosen surfaces.
4. Attachment metadata shown to operators is rich enough that saved evidence remains understandable later without opening raw storage details.
5. Quick note still saves a normal canonical admin note tied to an explicit context.
6. Help/Guide and runbook content are updated in the same PR if labels, save/reuse behavior, or route availability change.
7. Relevant production admin notes listed above remain explicitly owned by this brief until shipped or intentionally split again.
8. `npm run lint:briefs`, targeted validation, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted unit tests for:
  - staged multi-image state,
  - post-save reset/reuse behavior,
  - attachment metadata rendering,
  - route-surface availability logic
- targeted e2e for:
  - quick note multi-image capture,
  - contextual add-note multi-image capture,
  - route-surface persistence/reopen behavior,
  - admin help-center/update assertions
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Production review:
  - `https://freeswimming.org/admin`
  - relevant admin note entry surfaces encountered during real review work
- Local iteration:
  - `http://127.0.0.1:3000/admin`
- Preview:
  - PR Vercel preview URL for the implementation branch

## Constraints

- Quick note must remain understandable as a note-capture utility, not a second separate notes system.
- Multi-image support must be bounded and clear, not an unbounded drag-and-drop bucket.
- Route-surface expansion should be explicit and support real review workflows, not chase every possible route in one wave.
- Attachment metadata should help later reading without exposing raw storage implementation details.

## 10/10 Quality Bar

- Notes capture should feel lighter and more reusable after this slice, not heavier.
- Required UI states for changed surfaces:
  - `loading`
  - `empty`
  - `error`
  - `retry`
  - `success`
  - staged image pending
  - per-image remove/failure state
- Multi-image behavior must be obvious before save and predictable after save.
- Route-surface expansion should improve coverage without making note context ambiguous.

## Help/Guide And Operator Training Contract

- Required:
  - update Help/Guide and runbook copy for multi-image capture, post-save quick-note behavior, and route-surface availability in the same PR,
  - update at least one automated assertion that validates the changed help contract.

## Security, Privacy, and Compliance

- All richer image intake and metadata surfaces remain admin-only.
- Attachment/storage paths must not leak to public users or public routes.
- Unauthorized note/attachment mutations must fail closed with `401`/`403`.

## Observability and KPI Contract

- Required events/logs if analytics hooks already exist:
  - quick note opened/collapsed/reopened,
  - multi-image staged count,
  - quick note save + save-again flow,
  - route-surface quick-capture usage,
  - attachment metadata render/save failures.
- Success KPI for this slice:
  - operator can capture and reuse notes across real review sessions with richer evidence and less repeated setup.

## Session Continuity and Recovery

- Canonical source of truth: git branch + this brief path.
- Checkpoint cadence:
  - commit at each validated implementation milestone,
  - update the checkpoint log before any pause or PR handoff.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after each validated notes ergonomics slice.
- Open/update PR after one coherent vertical slice or after `2-4` validated checkpoint commits, whichever comes first.

## Automation Mode

- `automation-first`
  - assistant handles implementation, tests, git checkpoints, push, PR open/update, and CI monitoring unless blocked by credentials, UI-only approval, or an explicit owner decision.

## Branch Hygiene Defaults

- Post-merge cleanup:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git push origin --delete <merged-branch>` when appropriate

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Manual QA URL Rule

- Default UI QA links should be opened in Safari before requesting owner confirmation.

## Checkpoint Log

- `2026-03-30 | working tree | refined the planned follow-up brief so repeated screenshot paste/upload append behavior is explicit in the problem statement, admin-note triage, and acceptance criteria while keeping the owned scope unchanged | next: keep this planned until the repeated-capture loop and route-surface matrix are chosen for implementation`
- `2026-03-27 | planning | created a dedicated admin-notes ergonomics follow-up brief to own the remaining production-note batch around multi-image pre-save evidence, quick-note post-save reuse, route-surface rollout, and attachment metadata/agent-readiness expectations | next: confirm the desired repeated-capture workflow and route-surface matrix before implementation starts`
