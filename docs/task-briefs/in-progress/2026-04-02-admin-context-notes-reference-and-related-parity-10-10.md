# Task Brief: Admin Context Notes Reference And Related-Note Parity (10/10)

## Metadata

- `id`: `2026-04-02-admin-context-notes-reference-and-related-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-02`
- `updated`: `2026-04-02`

## Goal

Make saved contextual admin notes easier to reference and continue in the full Notes queue by exposing the stable note ID, an explicit `Open in Notes` jump, and visible related-note links inside the contextual panel.

## Why This Brief Exists

- The `2026-04-01` live triage left one final Package B note still open after PRs `#337` and `#339`:
  - `204913d0-5c97-41e8-b6f7-ab42de3bc84e` `Admin notes attachment metadata and agent-readiness follow-up`
- Attachment cards and evidence summaries now exist in both the full Notes manager and the contextual panel.
- The remaining parity gap is operator/agent readability:
  - contextual notes still hide the stable note reference,
  - related-note context is not visible from the contextual panel,
  - operators cannot jump directly from a contextual note into the full Notes queue for follow-up work by note ID.
- This slice intentionally finishes that remaining visibility/jump contract without reopening storage schema, OCR, or public-facing attachment work.

## Dependencies And Boundaries

- Existing admin-notes foundations remain authoritative:
  - `components/admin/AdminContextNotesPanel.tsx`
  - `components/admin/AdminNotesManager.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `lib/admin/notes-manager.ts`
  - `tests/unit/admin-context-notes-panel.test.tsx`
  - `tests/e2e/admin-help-center.spec.ts`
- Parent umbrella owner:
  - `docs/task-briefs/in-progress/2026-04-01-production-admin-notes-remaining-work-umbrella-10-10.md`
- Already-shipped lineage to consume rather than reopen:
  - `docs/task-briefs/done/2026-04-01-admin-notes-existing-note-images-and-quick-note-copy-10-10.md`
  - `docs/task-briefs/done/2026-04-02-admin-notes-my-library-detail-route-expansion-10-10.md`
- This slice owns:
  - visible note-reference surfacing in the contextual panel,
  - deterministic `Open in Notes` jump targets from contextual notes,
  - visible related-note summaries/jumps from contextual notes,
  - Help/Guide wording and automated assertions for that contract.
- This slice does not own:
  - attachment schema changes,
  - OCR/AI extraction,
  - public-route expansion,
  - removal of any builder inputs.

## Admin Notes Triage Disposition

- `204913d0-5c97-41e8-b6f7-ab42de3bc84e` `Admin notes attachment metadata and agent-readiness follow-up`
  - disposition: owned by this brief.
  - reason: the final remaining gap is agent/operator readability and deterministic continuation into the canonical Notes queue.
- `95f2361c-925d-42e3-a7e5-553410faec88` `Add screenshots to admin notes`
  - disposition: already shipped in PR `#337`.
- `881e222b-4c14-4a23-b677-60b0713e220f` `Admin notes quick capture route-surface expansion follow-up`
  - disposition: already shipped in PR `#339`.
- `85fb1d9f-efd9-4aa5-8bfe-7ab35c989b43` `Quick notes - Less is more`
  - disposition: already shipped in PR `#337`.
- `24bc6866-1b4e-41b1-9e4f-ae803bf06ca3` `Quick Note`
  - disposition: already shipped in PR `#337`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                               | Evidence                                      |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Product goals and IA                          | `target`     | Contextual notes expose enough stable reference and continuation affordance that operators do not need to switch to `/admin` blindly to identify a note.    | UI review + code review + brief               |
| UX flow clarity                               | `target`     | Every saved contextual note shows a stable note ID and a truthful jump path into the full Notes queue.                                                      | unit tests + manual review                    |
| Visual design quality                         | `supporting` | Supporting only: note-reference and related-note affordances reuse the existing admin-notes visual language.                                                | diff review + preview review                  |
| Business logic correctness and data integrity | `target`     | `Open in Notes` and related-note jumps carry the canonical note ID and correct open/done status into the Notes queue filter state.                         | unit tests + code review                      |
| Admin editor ergonomics                       | `target`     | Operators can inspect a contextual note, see its stable ID, and continue in the full Notes queue without copying raw URLs or guessing search terms.         | workflow review + targeted tests              |
| Accessibility (a11y)                          | `supporting` | Supporting only: new links/buttons remain keyboard reachable and keep descriptive labels.                                                                    | testing-library assertions + existing e2e     |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: added contextual-note metadata UI introduces no material route payload regression.                                                          | `verify:pre-pr` + diff review                 |
| Data placement and sync boundaries            | `target`     | Note IDs, related-note rows, and note status remain server-canonical; jump URLs are derived locally from the canonical row values only.                    | brief contract + code review                  |
| Caching and invalidation strategy             | `target`     | Contextual note cards reflect updated related-note/readability state immediately after the canonical note payload reloads or mutates.                       | unit tests + integration review               |
| Reliability and failure handling              | `target`     | If a related note is missing or contextual data is partial, the panel still shows stable fallback information without breaking note review.                 | unit tests + defensive rendering review       |
| Security and authz                            | `target`     | New note-reference and queue-jump affordances remain admin-only and do not expose raw storage paths or private route context outside authorized surfaces.    | scope review + existing authz contract        |
| Privacy and compliance                        | `supporting` | Supporting only: visible note references and related-note summaries stay inside existing admin-only surfaces.                                                | scope rationale + code review                 |
| Content governance                            | `target`     | Help/Guide wording explains the new contextual-note reference/jump contract in the same PR that changes the UI.                                             | docs update + automated help assertion        |
| Admin workflow and editability                | `target`     | Saved contextual notes expose the same stable note-reference mental model as the full Notes manager even when edited from an in-page surface.               | UI review + targeted tests                    |
| SEO and crawlability                          | `N/A`        | N/A because this slice only changes admin-only notes UI and internal help text.                                                                             | explicit scope rationale                      |
| AI discoverability                            | `N/A`        | N/A because no public AI-facing metadata or crawl surface changes.                                                                                           | explicit scope rationale                      |
| Analytics and KPI observability               | `supporting` | Supporting only: note IDs and related-note IDs remain queryable/searchable through the canonical Notes queue without new analytics events.                  | code review + scope rationale                 |
| Commerce and revenue ops                      | `N/A`        | N/A because no catalog, billing, or entitlement behavior changes.                                                                                            | explicit scope rationale                      |
| Incident response and support operations      | `target`     | Help/Guide clearly tells operators how contextual note IDs and related-note jumps connect back to the full Notes queue.                                     | docs update + automated help assertion        |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no finance or reconciliation workflow.                                                                                        | explicit scope rationale                      |
| i18n operational readiness                    | `N/A`        | N/A because the slice only adds short internal admin labels and no locale-sensitive formatting beyond existing note dates.                                  | explicit scope rationale                      |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing contextual panel, note-manager filter helpers, and note row data without adding dependencies or new APIs.                                | dependency diff + code review                 |
| Testing and QA automation                     | `target`     | Coverage protects note-reference visibility, related-note jumps, help-copy contract, and the slice passes `npm run verify:pre-pr`.                         | unit tests + help e2e + `verify:pre-pr`       |
| Scalability and cost efficiency               | `supporting` | Supporting only: jump-link generation is local and deterministic, with no extra storage or query fan-out.                                                   | architecture review + diff review             |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the UI-only reference/jump layer is reversible without migration or data repair.                                                           | rollback note + PR summary                    |

## Data Placement And Sync Contract

- Server-canonical:
  - `admin_note.id`,
  - `admin_note.is_done`,
  - `admin_note.related_notes`,
  - canonical note/search payloads returned by `/api/admin/notes`.
- Local-only:
  - derived `/admin?tab=notes...` jump URLs,
  - contextual panel expanded/editing state,
  - transient notices.
- Sync policy:
  - contextual panel renders the latest note payload it has loaded,
  - note-reference and related-note jump URLs are derived from the canonical row values only,
  - no new write path or storage model is introduced for this slice.

## Identity And Rename Contract

- Canonical stable IDs:
  - `admin_note.id` remains the stable note identity.
- Human-readable identifiers:
  - note title remains mutable display copy,
  - `Note ID <uuid>` remains a display wrapper around the stable canonical ID.
- Mutability rules:
  - note titles and body may change,
  - note ID is immutable,
  - related-note links always reference stable note IDs rather than title text.
- Compatibility contract:
  - full Notes manager search already accepts note IDs and related-note IDs,
  - contextual panel jumps must preserve that existing queue contract instead of inventing a second query format.

## Scope

- Show the stable visible note ID on saved contextual note cards.
- Add a deterministic `Open in Notes` jump from contextual notes to the full Notes queue filtered by the canonical note ID and open/done state.
- Show related-note summaries on contextual note cards with queue-jump links for those related notes.
- Update Help/Guide wording to explain the new contextual reference/jump behavior.
- Add/update targeted tests for the new contract.

## Out Of Scope

- New note schema or attachment metadata columns.
- OCR, AI extraction, captions, or public attachment behavior.
- Rebuilding the full related-note authoring UI inside the contextual panel.
- Any builder, course, or public-route changes unrelated to contextual note continuation.

## Acceptance Criteria

1. Saved contextual notes show a stable visible note ID.
2. Each saved contextual note exposes an `Open in Notes` jump that routes to the canonical Notes queue filtered by the note ID and correct open/done state.
3. Related notes are visible from the contextual panel and link into the canonical Notes queue by stable note ID.
4. Help/Guide documents the new contextual note reference/jump contract.
5. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- targeted `vitest`:
  - `tests/unit/admin-context-notes-panel.test.tsx`
- targeted `playwright`:
  - `tests/e2e/admin-help-center.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/plans`
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/admin?tab=help`
- Preview:
  - PR Vercel preview URL after branch push
- Recommended matrix:
  - desktop Chromium
  - desktop Safari/WebKit

## Constraints

- Reuse existing note-manager filter/query helpers instead of inventing a second deep-link format.
- Keep the slice UI-only: no new note or attachment schema work.
- Do not remove any existing contextual note affordance while adding reference/jump parity.

## Help/Guide And Operator Training Contract

- Required:
  - update Help/Guide wording in the same PR,
  - explain that contextual notes now show the stable note ID and a path into the full Notes queue,
  - update automated help assertions for the changed contract.

## Security, Privacy, and Compliance

- Note IDs and related-note summaries stay on existing admin-only surfaces.
- Queue jumps must not expose raw storage paths or public route secrets.
- Unauthorized note access rules remain unchanged and fail closed.

## Session Continuity And Recovery

- Canonical source of truth:
  - git branch
  - this brief path
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after one coherent validated contextual-note visibility/jump slice.
- Open/update PR only after docs, tests, and UI changes move together.

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Checkpoint Log

- `2026-04-02 | working tree | started the final Package B child slice after PR #339 merged; scope is narrowed to contextual note reference/open-in-notes/related-note parity so the remaining agent-readiness follow-up can close without reopening schema work | next: implement contextual panel reference/jump UI, update help copy, and run targeted validation`
