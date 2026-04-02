# Task Brief: Admin Notes My Library Detail Route Expansion (10/10)

## Metadata

- `id`: `2026-04-02-admin-notes-my-library-detail-route-expansion-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-02`
- `updated`: `2026-04-02`

## Goal

Allowlisted admins can use page-level `Quick note` on the remaining saved My Library detail routes that still lack it, with stable contextual labels, aligned Help/Guide copy, and regression coverage.

## Why This Brief Exists

- The `2026-04-01` live triage left one explicit admin-notes system follow-up open:
  - `881e222b-4c14-4a23-b677-60b0713e220f` `Admin notes quick capture route-surface expansion follow-up`
- Since then, two child slices landed on `main`:
  - PR `#337` recovered screenshots on existing contextual notes and simplified quick-note copy.
  - PR `#338` enabled page-level `Quick note` on `/my-library/workouts/[workoutId]` while consolidating the swim-session builder flow.
- The remaining high-value gap is now narrower:
  - saved dryland detail routes under `/my-library/dryland/[sessionId]`,
  - saved program detail routes under `/my-library/programs/[programId]`.
- This slice intentionally finishes the remaining My Library detail-route expansion before any broader route-sprawl or attachment-metadata redesign.

## Dependencies And Boundaries

- Existing admin-notes foundations remain authoritative:
  - `components/SiteChrome.tsx`
  - `lib/admin/page-note-context.ts`
  - `components/admin/AdminContextNotesPanel.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `tests/e2e/admin-contextual-notes.spec.ts`
  - `tests/unit/page-note-context.test.ts`
- Parent umbrella owner:
  - `docs/task-briefs/in-progress/2026-04-01-production-admin-notes-remaining-work-umbrella-10-10.md`
- Already-shipped child lineage to consume rather than reopen:
  - `docs/task-briefs/done/2026-04-01-admin-notes-existing-note-images-and-quick-note-copy-10-10.md`
- This slice owns:
  - My Library detail-route surface expansion for saved dryland/program routes,
  - stable context labels for those routes,
  - Help/Guide wording updates for the newly-supported surfaces,
  - targeted unit/e2e coverage.
- This slice does not own:
  - new attachment metadata, OCR, or agent-readiness schema work,
  - unrelated public-route expansion,
  - any removal of manual builder input fields.

## Admin Notes Triage Disposition

- `881e222b-4c14-4a23-b677-60b0713e220f` `Admin notes quick capture route-surface expansion follow-up`
  - disposition: owned by this brief.
  - reason: the remaining concrete product gap is missing page-level notes on the last saved My Library detail builders.
- `204913d0-5c97-41e8-b6f7-ab42de3bc84e` `Admin notes attachment metadata and agent-readiness follow-up`
  - disposition: out of scope for this slice.
  - reason: route availability can land now without reopening attachment schema/policy work.
- `95f2361c-925d-42e3-a7e5-553410faec88` `Add screenshots to admin notes`
  - disposition: already shipped in PR `#337`.
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

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                             | Evidence                                           |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Product goals and IA                          | `target`     | Saved My Library detail builders that still need lightweight operator capture expose the same page-level notes contract as the already-supported workout detail route. | UI review + code review + help copy                |
| UX flow clarity                               | `target`     | Allowlisted admins can discover and use `Quick note` on the added detail routes without generic fallback labeling or route-specific confusion.            | manual QA + targeted unit/e2e                      |
| Visual design quality                         | `supporting` | Supporting only: added route surfaces reuse the existing quick-note visual language without introducing route-specific UI drift.                           | preview review + diff review                       |
| Business logic correctness and data integrity | `target`     | New detail-route contexts normalize to deterministic canonical refs and labels, and notes saved from those routes resolve back to the correct page context. | unit tests + targeted e2e + code review            |
| Admin editor ergonomics                       | `target`     | Operators can capture page notes from saved dryland/program detail routes without detouring to `/admin` or losing route context.                          | workflow QA + targeted e2e                         |
| Accessibility (a11y)                          | `supporting` | Supporting only: the same launcher semantics, focus handling, and labels remain intact on the new route surfaces.                                         | existing launcher tests + targeted e2e             |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: route-surface expansion adds no material payload or rendering regression beyond the existing admin overlay contract.                      | `verify:pre-pr` + diff review                      |
| Data placement and sync boundaries            | `target`     | Page-note route context remains server-canonical only after save; draft text and collapsed/open UI state stay local-only.                                 | brief contract + code review + tests               |
| Caching and invalidation strategy             | `target`     | Newly-supported route contexts show saved notes deterministically after save without stale generic labels or missing route association.                    | targeted e2e + integration review                  |
| Reliability and failure handling              | `target`     | Unsupported/admin/auth routes remain blocked while newly-supported detail routes behave the same as other valid page-note surfaces.                        | unit tests + protected-route assertions            |
| Security and authz                            | `target`     | Page-level notes on these detail routes remain admin-only and continue to fail closed for unauthenticated or unauthorized flows.                           | existing authz coverage + targeted e2e             |
| Privacy and compliance                        | `supporting` | Supporting only: newly-supported route labels do not expose private user data beyond the existing admin-only route-context contract.                       | code review + scope rationale                      |
| Content governance                            | `supporting` | Supporting only: Help/Guide text lists the newly-supported routes and stays aligned with the actual route allowlist.                                       | docs update + automated help assertion             |
| Admin workflow and editability                | `target`     | The same quick-capture/edit/review workflow works on workout, dryland, and program detail routes without hidden route exceptions.                          | workflow QA + targeted e2e                         |
| SEO and crawlability                          | `N/A`        | N/A because this slice only changes admin-only note surfaces and internal help text, not public crawl/index behavior.                                     | explicit scope rationale                           |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing route, metadata, or schema contract.                                                                   | explicit scope rationale                           |
| Analytics and KPI observability               | `supporting` | Supporting only: expanded route-surface usage remains inferable through existing note context refs even without new analytics events.                       | code review + scope rationale                      |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, catalog, or billing logic changes in this route-surface slice.                                                       | explicit scope rationale                           |
| Incident response and support operations      | `target`     | Help/Guide describes the newly-supported dryland/program detail routes in the same PR that changes availability.                                           | docs update + automated help assertion             |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no reconciliation, reporting, payout, or finance-support behavior.                                                         | explicit scope rationale                           |
| i18n operational readiness                    | `N/A`        | N/A because this slice reuses existing structural labels and introduces no locale-blocking formatting or routing logic.                                   | explicit scope rationale                           |
| Stack-fit and dependency discipline           | `target`     | Reuse existing page-note context helpers, SiteChrome surfacing, and contextual notes flows without adding dependencies or a second routing system.         | dependency diff + architecture review              |
| Testing and QA automation                     | `target`     | Coverage protects page-note context labels/allowlist plus dryland/program detail quick-capture flows, and the slice passes `npm run verify:pre-pr`.      | targeted tests + `verify:pre-pr`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: this slice expands two deterministic route checks and introduces no new storage, schema, or unbounded query path.                         | diff review + route review                         |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the route-allowlist change is reversible without data migration or cross-system rollback.                                                 | PR summary + rollback note                         |

## Data Placement And Sync Contract

- Server-canonical:
  - `admin_notes` rows,
  - canonical page-context refs saved with note context,
  - saved dryland/program/workout entity IDs already present in route paths.
- Local-only:
  - quick-note draft text,
  - launcher open/collapsed state,
  - transient success/error notices.
- Sync policy:
  - route support is determined from canonical normalized path rules,
  - note save writes against the current normalized page ref only after explicit operator submission,
  - help text and tests must stay aligned with the route allowlist in the same slice.
- Retention and sensitivity:
  - page-route refs remain admin-only note metadata,
  - no new private payload fields or attachment data are introduced.
- Cache/invalidation:
  - contextual panel reads should reflect the correct route label and context immediately after save on the supported routes.

## Identity And Rename Contract

- Canonical stable IDs:
  - `admin_note.id` remains the note identity,
  - route-path context ref remains the canonical page-surface identity for contextual notes,
  - `programId`, `sessionId`, and `workoutId` remain the entity identifiers already used by the saved detail routes.
- Human-readable identifiers:
  - `My Library swim session detail`, `My Library dryland session detail`, and `My Library program detail` are editable display labels only.
- Mutability rules:
  - route labels may change in copy,
  - normalized route refs remain the source-of-truth for saved contextual notes,
  - the slice must not repurpose one route label to point at a different canonical route family.
- Rename vs repurpose policy:
  - add a new explicit label mapping when a new detail-route family becomes supported,
  - do not overload generic `Page: /...` fallback text for a first-class supported route.
- Compatibility contract:
  - existing workout-detail notes keep their current route label and behavior,
  - unsupported routes remain unsupported unless explicitly added to the allowlist.
- Observability and repair:
  - unit/e2e coverage must detect missing labels or missing support on the intended detail routes.

## Scope

- Expand page-level admin-note support to:
  - `/my-library/dryland/[sessionId]`
  - `/my-library/programs/[programId]`
- Add stable context labels for the new route families.
- Update Help/Guide wording so the documented route list matches the actual supported surfaces.
- Add/update targeted unit and e2e coverage for the new route contexts.
- Update umbrella/checkpoint docs so the prior admin-notes child brief is recorded as done and this route-expansion slice is the active successor.

## Out Of Scope

- New attachment metadata, OCR, agent-readiness policy, or schema changes.
- Any route expansion beyond the saved dryland/program detail routes in this slice.
- Public-route quick-note expansion.
- Removing any manual builder/session/program input fields.
- Reworking the full contextual note editor beyond what is already on `main`.

## Acceptance Criteria

1. Allowlisted admins see the page-level admin-notes surface on `/my-library/dryland/[sessionId]` and `/my-library/programs/[programId]`.
2. Notes saved from those routes use stable labels instead of generic `Page: /...` fallback labels.
3. Existing unsupported routes remain unsupported.
4. Help/Guide explicitly lists the newly-supported detail routes.
5. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/page-note-context.test.ts`
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
  - `http://127.0.0.1:3000/my-library/dryland/<sessionId>`
  - `http://127.0.0.1:3000/my-library/programs/<programId>`
  - `http://127.0.0.1:3000/admin?tab=help`
- Preview:
  - PR Vercel preview URL after branch push
- Recommended matrix:
  - desktop Chromium
  - desktop Safari/WebKit

## Constraints

- Keep route expansion limited to the saved dryland/program detail routes.
- Reuse the existing page-note context helpers and contextual panel behavior instead of inventing a second route-switching mechanism.
- Do not reopen screenshot recovery or quick-note copy simplification in this PR unless directly needed for the new routes.

## 10/10 Quality Bar

- The admin should not need to remember route exceptions between saved workout, dryland, and program detail builders.
- The primary `Quick note` path should appear exactly where the existing supported detail-route contract would make an operator expect it.
- Required states remain explicit:
  - `supported`
  - `unsupported`
  - `loading`
  - `save success`
  - `error`
  - `retry`
- Added route support must not regress auth-blocked/admin-blocked route rules.

## Help/Guide And Operator Training Contract

- Required:
  - update Help/Guide route-availability wording in the same PR,
  - keep route examples aligned with the actual allowlist,
  - update at least one automated assertion for the changed help contract.

## Security, Privacy, and Compliance

- Newly-supported detail routes must remain admin-only note surfaces.
- Unauthorized note mutations must continue to fail closed.
- The slice must not surface new private user fields or attachment details in route labels.

## Observability And KPI Contract

- Useful future signals if instrumentation expands later:
  - quick-note create by route family,
  - contextual note usage on saved workout/dryland/program detail routes.
- Success KPI for this slice:
  - operators can use the same page-level note workflow across all saved My Library detail builders that are intentionally supported today.

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
- Open/update PR after one coherent validated route-expansion vertical slice.

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Checkpoint Log

- `2026-04-02 | e6c9ef8 | PR #339 merged on main after local verify:pre-merge PASS and required GitHub CI green; saved dryland/program detail-route Quick note support is now live on main and the follow-up Package B remainder is narrowed to contextual note reference/related-note parity for agent-readiness | next: move this brief to done and start the final Package B child slice`
- `2026-04-02 | working tree | created the second admin-notes child slice under the production umbrella to finish My Library detail-route quick-note expansion for saved dryland/program routes after PRs #337 and #338 landed on main | next: implement route-label/allowlist updates, add targeted tests, and run targeted validation`
- `2026-04-02 | working tree | implemented saved dryland/program detail-route support, added stable context labels, updated Help/Guide route documentation, moved the prior admin-notes child brief to done, and passed targeted vitest, targeted desktop Chromium Playwright, and full npm run verify:pre-pr (95 passed, 319 skipped, 0 failed) after replacing the local worktree node_modules symlink with a physical copy for Turbopack compatibility | next: stage tracked source/brief files only, commit, push, open PR, and monitor CI`
