# Task Brief: Admin Notes Ergonomics Multi-Image And Route-Surface Follow-Up (10/10)

## Metadata

- `id`: `2026-03-27-admin-notes-ergonomics-multi-image-and-route-surface-followup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-27`
- `updated`: `2026-03-31`

## Goal

Ship the remaining operator-facing admin-notes ergonomics gaps after the multi-image/save-again slice by making quick capture available on an explicit route matrix and by making saved image evidence easier to read later without changing the canonical attachment schema.

## Why This Brief Exists

- Core notes workflows, quick capture, clipboard/image intake, linking, multi-image staging, and save-again behavior are now shipped, but real usage still exposes one smaller follow-up wave.
- The remaining gaps are tightly related:
  - quick capture/page-level notes are still missing from the intended `My Library` route matrix,
  - saved attachment cards still underspecify evidence metadata for later human review,
  - operator-visible evidence structure is not yet explicit enough for future agent-assisted reading even though the canonical attachment fields already exist.
- These issues are real notes ergonomics work, but they should stay separated from the larger workout-builder UX/action batch.
- This brief intentionally owns the operator-facing remainder so the broader admin-notes system is not reopened piecemeal without explicit scope.

## Dependencies And Boundaries

- Existing storage/linking/note foundations that remain authoritative:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-25-admin-notes-image-intake-simplification-and-clipboard-paste-button-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-27-admin-notes-global-quick-capture-panel-and-manuscript-categories-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-31-admin-notes-multi-image-and-save-again-followup-10-10.md`
- Recommended boundary decisions unless owner explicitly changes them:
  - quick note still creates a normal canonical admin note,
  - canonical note identity remains note ID + canonical route/content context,
  - quick-note draft can travel across supported surfaces, but original note context stays explicit and locked unless the user intentionally changes it,
  - route-surface expansion in this slice is explicit and bounded to selected `My Library` hubs instead of every library/detail route,
  - attachment metadata surfacing in this slice uses the existing canonical attachment row fields only; it does not add a new attachment schema,
  - this slice improves ergonomics and metadata clarity; it does not replace notes with a larger ticketing system.

## Admin Notes Triage Disposition

Production admin notes reviewed against this brief on `2026-03-27`:

- `0d1fa716-460e-406a-a68d-28c1aaae5b22` `Mulitple Screenshots`
  - disposition: closed in `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-31-admin-notes-multi-image-and-save-again-followup-10-10.md`.
  - reason: repeated pre-save image staging and append-not-replace behavior shipped in the prior slice.
- `40b252d8-ee9f-41ed-89ca-0eb5af8bcc89` `Quick note`
  - disposition: closed in `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-31-admin-notes-multi-image-and-save-again-followup-10-10.md`.
  - reason: quick-note save-again behavior shipped in the prior slice.
- `881e222b-4c14-4a23-b677-60b0713e220f` `Admin notes quick capture route-surface expansion follow-up`
  - disposition: owned by this brief.
  - reason: the remaining rollout should now be handled as an explicit selected-route matrix instead of a vague future placeholder.
- `204913d0-5c97-41e8-b6f7-ab42de3bc84e` `Admin notes attachment metadata and agent-readiness follow-up`
  - disposition: owned by this brief.
  - reason: remaining operator-visible attachment metadata and structured evidence expectations belong together with the final route rollout so the note system is not only partially covered.

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
  - existing attachment row fields already available for metadata surfacing (`file_name`, `mime_type`, `size_bytes`, `created_at`).
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

- Keep the already shipped multi-image/save-again behavior unchanged while extending route-surface coverage intentionally.
- Expand quick-capture/page-note availability through an explicit route-surface matrix:
  - keep existing dedicated contextual note surfaces on `/course`, `/guides/0-1000m`, `/guides/poolside`, and `/my-library/item/[slug]`,
  - add page-level notes + quick note through `SiteChrome` on selected `My Library` hub routes:
    - `/my-library`
    - `/my-library/goals`
    - `/my-library/training`
    - `/my-library/profile`
    - `/my-library/workouts`
    - `/my-library/dryland`
    - `/my-library/generator`
    - `/my-library/security`
- Improve operator-visible saved attachment metadata and evidence structure using existing canonical fields:
  - image order,
  - file type,
  - file size,
  - upload date,
  - clearer copy that the evidence remains admin-only.
- Keep Help/Guide and recovery/runbook language aligned with the final behavior.

## Out Of Scope

- Replacing admin notes with a full issue tracker or threaded comments system.
- Public user uploads or public note attachments.
- Non-image attachment types as a first-class system in this slice.
- New schema/storage columns, OCR, caption authoring, or AI extraction for attachments.
- Dynamic `My Library` detail routes in this wave:
  - `/my-library/programs/[programId]`
  - `/my-library/workouts/[workoutId]`
  - `/my-library/dryland/[sessionId]`
- Reopening unrelated builder or course-workspace work unless a shared bug is discovered.

## Acceptance Criteria

1. Selected `My Library` hub routes show the same page-level admin-notes surface and `Quick note` entrypoint as the supported public page surfaces, without changing dedicated contextual surfaces that already exist elsewhere.
2. Route-surface availability is documented as an explicit matrix for this slice instead of an open-ended rollout promise.
3. Saved attachment cards show metadata rich enough that the evidence remains understandable later without exposing raw storage details.
4. The richer attachment metadata comes from the existing canonical attachment fields and does not require a new schema or migration.
5. Quick note still saves a normal canonical admin note tied to an explicit context, and locked-context behavior remains truthful when moving between supported surfaces.
6. Help/Guide and runbook content are updated in the same PR for the chosen route matrix and metadata contract.
7. Relevant production admin notes listed above remain explicitly owned by this brief until shipped or intentionally split again.
8. `npm run lint:briefs`, targeted validation, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted unit tests for:
  - page-route availability logic,
  - attachment metadata rendering,
  - context label/metadata fallback behavior where relevant
- targeted e2e for:
  - quick note on a newly supported `My Library` hub route,
  - route-surface persistence/reopen behavior on the selected matrix,
  - admin help-center/update assertions
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Production review:
  - `https://freeswimming.org/admin`
  - selected `My Library` hub routes reached during real review work
- Local iteration:
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/my-library/goals`
- Preview:
  - PR Vercel preview URL for the implementation branch

## Constraints

- Quick note must remain understandable as a note-capture utility, not a second separate notes system.
- Route-surface expansion should be explicit and support real review workflows, not chase every possible route in one wave.
- This slice should prefer stable `My Library` hub routes over dynamic detail-route coverage.
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
- Saved attachment cards should read like structured evidence, not anonymous thumbnails.

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

- `2026-03-31 | working tree | shipped the remaining slice scope on branch `feat/admin-notes-route-surface-metadata-2026-03-31`: selected My Library hubs now expose page-level quick note through the shared SiteChrome surface, attachment cards/staged previews show stable evidence metadata from existing canonical fields, Help/Guide and recovery docs were updated, and `lint:briefs:all`, targeted unit/e2e, `typecheck`, and `verify:pre-pr` all passed locally | next: commit, push, open PR, and watch CI`
- `2026-03-31 | working tree | moved the remaining admin-notes ergonomics follow-up into in-progress after the multi-image/save-again slice merged; narrowed this implementation wave to selected My Library route-surface expansion plus richer saved attachment metadata using the existing attachment contract | next: implement the route matrix in SiteChrome/page-note helpers, update attachment cards/copy/tests, and run targeted validation`
- `2026-03-30 | working tree | refined the planned follow-up brief so repeated screenshot paste/upload append behavior is explicit in the problem statement, admin-note triage, and acceptance criteria while keeping the owned scope unchanged | next: keep this planned until the repeated-capture loop and route-surface matrix are chosen for implementation`
- `2026-03-27 | planning | created a dedicated admin-notes ergonomics follow-up brief to own the remaining production-note batch around multi-image pre-save evidence, quick-note post-save reuse, route-surface rollout, and attachment metadata/agent-readiness expectations | next: confirm the desired repeated-capture workflow and route-surface matrix before implementation starts`
