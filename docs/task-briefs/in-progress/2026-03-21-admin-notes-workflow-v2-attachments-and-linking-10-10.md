# Task Brief: Admin Notes Workflow V2 Attachments And Linking (10/10)

## Metadata

- `id`: `2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-21`
- `updated`: `2026-03-26`

## Goal

Admin notes can hold screenshot/image attachments, explicit priority, and related-note links with deletion that removes attachment data completely and safely.

## Why This Brief Exists

- Core admin notes already support text and context.
- The next real operational needs are richer:
  - screenshots for memory and debugging,
  - linked notes for follow-up chains,
  - explicit priority independent of incident category,
  - linked notes for follow-up chains.
- This scope is materially larger and riskier than core search/filter notes work because it introduces:
  - storage,
  - deletion lifecycle,
  - richer note relationships,
  - stronger data-integrity requirements than the core queue/filter slice.
- Quick capture from across the app is intentionally split into a later follow-up so storage/linking can ship without touching multiple app surfaces in the same PR.

## Admin-Notes Triage Disposition

- `1059a360-7719-4fe7-a0f1-36807e2c2be3` `Link related notes`
  - Disposition: owned by this brief.
  - Reason: the remaining production ask is related-note UX polish on top of the already-shipped linking model, not a new system outside this scope.

## Dependencies And Boundaries

- Upstream foundations that must remain authoritative:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-21-admin-notes-workflow-v2-core-10-10.md`
  - `/Users/stianvikra/freeswimming/components/admin/AdminNotesManager.tsx`
  - `/Users/stianvikra/freeswimming/components/admin/AdminContextNotesPanel.tsx`
  - `/Users/stianvikra/freeswimming/lib/admin/notes.ts`
  - `/Users/stianvikra/freeswimming/app/api/admin/notes/route.ts`
  - `/Users/stianvikra/freeswimming/app/api/admin/notes/[id]/route.ts`
- Existing contextual-note/edit-surface foundations to reuse:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-17-aw-013-context-aware-admin-create-notes-and-qr-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/runbooks/admin-notes-recovery.md`
- Recommended direction locked unless owner overrides:
  - image attachments are admin-only,
  - attachment delete must remove both the DB reference and underlying storage object,
  - note priority remains separate from incident severity/category,
  - related notes are explicit links by canonical note ID.
- This slice does not replace the note system with a full issue tracker.

## Scope

- Add admin-note image attachments:
  - upload screenshots/images to a controlled admin-only storage path,
  - show attachment previews or metadata in notes UI,
  - allow deletion from create/edit contexts,
  - deleting a note with attachments must also delete the attachment records and storage objects.
- Add note priority field:
  - recommended values: `low`, `normal`, `high`, `urgent`,
  - usable in list sorting/filtering and visible in note detail.
- Add related-note linking:
  - link a note to one or more other note IDs,
  - show related notes with safe titles/IDs,
  - avoid circular/confusing duplicates where practical through validation.
- Extend filters where needed so attachments/priority/linked-note state are discoverable from the notes manager.

## Out Of Scope

- General public user uploads.
- Arbitrary file-type attachments beyond approved image types in this slice.
- Full comment-thread system inside admin notes.
- Replacing current content/page context catalog model.
- App-wide quick-capture launcher and route-surface rollout.

## Data Placement And Sync Contract

- Server-canonical data:
  - note rows,
  - attachment metadata rows,
  - attachment storage object keys,
  - note priority,
  - related-note link rows,
  - canonical route/context refs.
- Local-only data:
  - in-progress upload state,
  - temporary preview URLs,
  - unsaved note draft text.
- Sync policy:
  - uploads happen only on explicit admin action,
  - attachment and related-note records become canonical only after server confirmation,
  - delete must remove DB link and storage object before success is reported,
- Retention and sensitivity:
  - screenshots may contain sensitive internal information and must remain admin-only,
  - deleted attachments must be fully removed from both metadata and storage, not only hidden in UI.
- Cache/invalidation:
  - notes lists, note detail views, contextual panels, and quick-capture entrypoints refresh deterministically after attachment/link/priority mutations.

## Identity And Rename Contract

- Canonical stable IDs:
  - `admin_note.id` remains canonical for notes,
  - each attachment gets its own immutable canonical attachment ID,
  - related-note links reference canonical note IDs only.
- Human-readable identifiers:
  - note titles and attachment filenames are display metadata and not canonical identity.
- Mutability rules:
  - priority is a semantic field and changes only through explicit admin action,
  - related-note links must not rewrite or merge note identity,
  - deleting an attachment must not silently leave an orphaned storage object.
- Rename vs repurpose policy:
  - editing note wording or priority remains in-place,
  - materially different operational concerns should create new note rows and optionally link them.
- Compatibility contract:
  - older notes with no attachments, no priority, or no related links remain fully valid.
- Observability and repair:
  - orphaned attachment records, missing storage objects, and broken related-note links must be detectable and repairable with deterministic admin guidance.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Security and authz`
- `Privacy and compliance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                      | Evidence                             |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Product goals and IA                          | `target`     | Admin can understand attachment, priority, and related-note behavior without confusing them with core note identity or done/archive state.          | IA review + manual QA + e2e          |
| UX flow clarity                               | `target`     | Admin can attach screenshots, set priority, link related notes, and save without dead ends or hidden partial states.                                | e2e + manual QA                      |
| Visual design quality                         | `target`     | Added attachment and linking controls remain readable and intentional instead of turning notes UI into clutter.                                     | screenshot review + manual QA        |
| Business logic correctness and data integrity | `target`     | Attachment lifecycle, priority updates, and related-note links are deterministic, canonical, and leave no orphaned metadata.                        | unit tests + runtime guards          |
| Admin editor ergonomics                       | `target`     | Admin can capture and revisit richer operational notes with screenshots, explicit priority, and related-note trace without confusing note identity. | timed manual QA + e2e                |
| Accessibility (a11y)                          | `target`     | Upload controls, launcher actions, priority selectors, and related-note affordances remain keyboard/touch accessible.                               | Playwright + manual QA               |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: attachments and launcher UI must avoid obvious `/admin` or route-level regressions and excessive client weight.                    | build + code review                  |
| Data placement and sync boundaries            | `target`     | Notes, attachment metadata, and related-note links are server-canonical while upload previews remain local-only.                                    | contract review + tests              |
| Caching and invalidation strategy             | `target`     | Note detail, contextual panels, and manager lists refresh deterministically after upload, delete, link, unlink, and priority changes.               | integration review + e2e             |
| Reliability and failure handling              | `target`     | Partial upload/delete failures show actionable recovery guidance and never claim full delete while storage objects still exist.                     | negative-path tests + manual QA      |
| Security and authz                            | `target`     | Attachments and richer note mutations remain admin-only, fail closed, and do not expose raw storage paths or uploads to public users.               | API/storage negative-path tests      |
| Privacy and compliance                        | `target`     | Internal screenshots stay private, are deleted fully when requested, and are never leaked into public routes, logs, or exports.                     | storage review + tests               |
| Content governance                            | `supporting` | Supporting only: priority/link semantics must remain coherent with existing note categories and operational conventions.                            | Help/Guide + code review             |
| Admin workflow and editability                | `target`     | Rich-note editing remains fast, recoverable, and clear even when screenshots, priority, and related links are added to the same note.               | e2e + timed manual QA                |
| SEO and crawlability                          | `N/A`        | N/A because attachments and admin note enrichments are private admin-only workflows with no public crawl/index contract.                            | scope rationale                      |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing discoverability surface.                                                                         | scope rationale                      |
| Analytics and KPI observability               | `supporting` | Supporting only: upload, delete, priority, and launcher actions should remain measurable enough to evaluate real operational value.                 | analytics event review               |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, payout, or commercial reporting path changes in this admin notes enhancement slice.                                | scope rationale                      |
| Incident response and support operations      | `target`     | Runbooks and Help/Guide explain screenshot handling, delete semantics, launcher recovery, and richer note triage behavior.                          | docs review + help-center assertions |
| Finance and reporting operations              | `N/A`        | N/A because no billing, reconciliation, payout, or finance reporting logic is changed by note attachments/linking work.                             | scope rationale                      |
| i18n operational readiness                    | `supporting` | Supporting only: priority labels and richer note copy must remain localization-safe and not encode logic in free text alone.                        | copy review                          |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin/storage patterns and avoid unnecessary third-party upload or issue-tracker dependencies.                                       | dependency diff + code review        |
| Testing and QA automation                     | `target`     | Coverage protects upload/delete lifecycle, orphan cleanup, related-note link safety, priority behavior, and quick-capture authz.                    | tests + `verify:pre-pr` evidence     |
| Scalability and cost efficiency               | `supporting` | Supporting only: attachment storage and quick-capture flows must avoid runaway storage retention and duplicate note/link churn.                     | storage review + code review         |
| DevOps and rollback readiness                 | `target`     | Storage-backed note enrichments include safe cleanup, repair guidance, and rollback strategy for attachment-enabled deployments.                    | rollback checklist + runbook review  |

## Acceptance Criteria

1. Admin can attach one or more approved images/screenshots to a note.
2. Deleting an attachment removes both the note metadata reference and the underlying storage object.
3. Deleting a note with attachments removes attachment records and storage objects fully.
4. Admin can assign and edit explicit priority without conflating it with incident category/severity.
5. Admin can link related notes by canonical note ID and revisit those links later.
6. Non-admin users never see attachment data.
7. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - attachment payload validation,
  - priority normalization,
  - related-note link invariants,
  - delete lifecycle/orphan cleanup
- targeted e2e for:
  - screenshot upload/delete,
  - note delete with attachments,
  - related-note linking flow,
  - unauthorized-path denial
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin?tab=notes`
- Preview:
  - PR preview URL after branch push
- Recommended matrix:
  - Desktop Chrome
  - Desktop Safari/WebKit
  - Desktop Firefox
  - iPad/tablet viewport for upload and launcher sanity check

## Constraints

- Keep upload scope to approved image formats first.
- Delete must mean real delete, not UI hide-only behavior.
- Preserve current admin note foundations and avoid turning this slice into a general-purpose ticketing system.

## 10/10 Quality Bar

- Richer notes must improve operational memory, not create clutter or hidden risk.
- The operator should trust delete semantics completely.
- Required states remain explicit:
  - `loading`
  - `empty`
  - `error`
  - `retry`
  - `success`
  - upload pending
- Attachments and links must never make note identity ambiguous.

## Checkpoint Log

- `2026-03-22 | scope split | moved attachments/linking brief into in-progress and explicitly split app-wide quick capture into a follow-up slice so storage lifecycle, priority, and related-note integrity can ship first without broad route-surface risk | next: implement schema + API + UI foundations for attachments, priority, and related-note links`
- `2026-03-22 | implementation + verify | implemented attachment storage/delete lifecycle, priority, related-note linking, hydration, help/runbook updates, and authz negative-path coverage; local npm run verify:pre-pr passed | perf-budget trend recommended tighten, decision: hold for this slice because it does not change public core-route perf targets, and revisit tightening in the next AW-010 performance checkpoint/PR summary | next: run final diff review, commit, push, and open/update PR`
- `2026-03-21 | planning | created separate advanced admin notes brief for screenshots, related-note links, explicit priority, and app-wide admin quick capture so storage-backed lifecycle risk does not block core notes search/filter continuity work | next: ship admin notes core first, then implement attachment/linking/launcher work with full delete-lifecycle coverage`
- `2026-03-26 | in-progress | production note \`1059a360-7719-4fe7-a0f1-36807e2c2be3\` is now the active owned follow-up under this brief: linked note titles now jump directly to the related note in the queue while keeping \`Note ID …\` as non-clickable metadata, with help/runbook copy and regression coverage updated to match | next: run targeted tests, then full \`npm run verify:pre-pr\`, commit, push, and open/update PR`
- `2026-03-26 | verify complete | exact note-ID search now resolves linked-note jumps to the target note instead of leaving referring notes in the filtered queue; targeted vitest/typecheck/playwright checks and full \`npm run verify:pre-pr\` all passed for the related-note jump polish | next: commit, push, open/update PR, and wait on required CI before recommending merge`
