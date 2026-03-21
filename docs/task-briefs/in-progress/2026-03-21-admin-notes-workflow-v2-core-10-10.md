# Task Brief: Admin Notes Workflow V2 Core (10/10)

## Metadata

- `id`: `2026-03-21-admin-notes-workflow-v2-core-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-21`
- `updated`: `2026-03-21`

## Goal

Admin can manage notes at scale with visible stable note IDs, search and context filters, cleaner open-vs-done workflow, explicit severity meaning, and persistent Notes-tab continuity across refresh and return flows.

## Why This Brief Exists

- Admin notes already have a solid foundation:
  - create,
  - edit,
  - toggle done,
  - delete,
  - contextual attachment to content/page surfaces.
- Real operations now need the next layer of usability:
  - easy search,
  - filter by route/context,
  - done notes hidden by default,
  - visible stable IDs for future reference in chats/workflows,
  - persistent admin tab state on refresh,
  - clearer incident severity meaning.
- This should be split from attachments/linking so the core management upgrade can ship without waiting for storage/media work.

## Dependencies And Boundaries

- Existing foundations that remain authoritative:
  - `/Users/stianvikra/freeswimming/components/admin/AdminNotesManager.tsx`
  - `/Users/stianvikra/freeswimming/components/admin/AdminContextNotesPanel.tsx`
  - `/Users/stianvikra/freeswimming/components/admin/AdminWorkspace.tsx`
  - `/Users/stianvikra/freeswimming/lib/admin/notes.ts`
  - `/Users/stianvikra/freeswimming/app/api/admin/notes/route.ts`
  - `/Users/stianvikra/freeswimming/app/api/admin/notes/[id]/route.ts`
- Existing note-context foundations that must stay compatible:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-17-aw-013-context-aware-admin-create-notes-and-qr-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/runbooks/admin-notes-recovery.md`
  - `/Users/stianvikra/freeswimming/docs/runbooks/core-flow-incident-response.md`
- This slice owns core notes-manager workflow upgrades.
- This slice does not own:
  - image attachments,
  - linked-notes graph,
  - quick-capture launcher from every page,
  - richer priority model beyond what is needed for search/filter semantics.

## Scope

- Make note identity visible and referenceable:
  - show stable note ID in notes manager and detail/edit affordances,
  - support quick search by note ID.
- Add scalable list controls:
  - search by title/body/ID,
  - filter by `open` vs `done archive`,
  - filter by category,
  - filter by context type,
  - filter by exact route/context reference where relevant.
- Default notes manager to active work:
  - open notes shown by default,
  - done notes hidden behind explicit archive/done filter,
  - delete remains available where policy permits.
- Improve context visibility:
  - page/route-linked notes show clear normalized URL/path context,
  - filters can narrow to a specific page path or context ref.
- Persist admin workspace tab state:
  - switching to `Notes` updates URL state,
  - refresh returns to `Notes`,
  - deep links to notes filters remain possible where appropriate.
- Clarify incident templates in-product and in Help/Guide:
  - explain what `P0`, `P1`, and `P2` mean,
  - keep template usage and recovery guidance aligned.

## Out Of Scope

- Image/file attachments.
- Related-note linking.
- New quick-capture launcher across all app pages.
- Full admin dashboard redesign.
- Replacing the current canonical note schema with a new ticketing system.

## Data Placement And Sync Contract

- Server-canonical data:
  - `admin_notes` rows,
  - note ID,
  - category,
  - body,
  - done state,
  - canonical context type/ref values.
- Local-only data:
  - current search query,
  - active filter chips,
  - active admin tab URL/query state,
  - temporary optimistic list state and banners.
- Sync policy:
  - create/update/delete/toggle-done remain explicit server writes,
  - search/filter may run server-side, client-side, or hybrid, but rendered list truth must match canonical server rows after successful mutations,
  - URL tab state is client-owned navigation state and must not mutate note data.
- Retention and sensitivity:
  - done notes are hidden by default but remain recoverable through archive/done view,
  - note IDs are safe to display to admins but must not expose note content publicly.
- Cache/invalidation:
  - after note mutation, current filtered list refreshes deterministically without bouncing the user back to the `Content` tab.

## Identity And Rename Contract

- Canonical stable ID:
  - `admin_note.id` remains the only canonical stable identifier and must be visible in admin UI.
- Human-readable identifiers:
  - titles, category labels, and route labels are editable display metadata and not note identity.
- Mutability rules:
  - search/filtering and tab state must not mutate note rows,
  - `done` remains an explicit workflow state, not an inferred status from filters.
- Rename vs repurpose policy:
  - normal wording updates stay on the same note row,
  - materially different tasks should become new notes instead of silent repurpose.
- Compatibility contract:
  - existing contextual note references remain valid and searchable by canonical context type/ref,
  - visible note IDs make future agent/operator reference flows possible without copying full note text.
- Observability and repair:
  - invalid context refs or stale page bindings must surface safe labels and remain discoverable by ID for manual cleanup.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Admin editor ergonomics`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                   | Evidence                             |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Product goals and IA                          | `target`     | Admin can understand open work, done archive, context-bound notes, and note identity without scanning the entire list manually.  | IA review + manual QA + e2e          |
| UX flow clarity                               | `target`     | Search, filter, open/done archive, and refresh-return flows are obvious and complete without dead ends.                          | e2e + manual QA                      |
| Visual design quality                         | `target`     | Notes manager remains readable and production-ready as more controls are added, without becoming cluttered.                      | screenshot review + manual QA        |
| Business logic correctness and data integrity | `target`     | Filtering, search, tab persistence, and visible IDs never mutate note truth and never hide recently changed canonical results.   | unit tests + runtime guards          |
| Admin editor ergonomics                       | `target`     | An operator can find, filter, reopen, mark done, or reference the right note in seconds instead of scanning a long mixed list.   | timed manual QA + e2e                |
| Accessibility (a11y)                          | `target`     | Search/filter controls, archive toggle, and ID/context affordances remain keyboard and screen-reader accessible.                 | Playwright + manual QA               |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: notes-manager upgrades must avoid obvious `/admin` render regressions or inefficient over-fetching.             | build + code review                  |
| Data placement and sync boundaries            | `target`     | Note truth remains server-canonical while search/filter/tab state stays local or URL-owned and deterministic.                    | contract review + tests              |
| Caching and invalidation strategy             | `target`     | Post-mutation list refresh respects active filters and keeps the operator in the Notes workspace instead of resetting context.   | integration review + e2e             |
| Reliability and failure handling              | `target`     | Failed loads or mutations show actionable retry guidance without losing filter context or tab location.                          | negative-path tests + manual QA      |
| Security and authz                            | `target`     | Notes list/search/filter/mutation endpoints remain admin-only and fail closed for unauthorized access.                           | API negative-path tests              |
| Privacy and compliance                        | `supporting` | Supporting only: visible IDs and route context must remain admin-only and never leak note content to public routes or logs.      | route review + test assertions       |
| Content governance                            | `target`     | Done-archive semantics, category usage, and route-context visibility remain consistent with current operational note governance. | Help/Guide + code review             |
| Admin workflow and editability                | `target`     | Core admin note management stays fast, editable, and recoverable even as note volume grows.                                      | e2e + timed manual QA                |
| SEO and crawlability                          | `N/A`        | N/A because admin notes are private admin-only surfaces with no public crawl/index contract.                                     | scope rationale                      |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing discoverability surface.                                                      | scope rationale                      |
| Analytics and KPI observability               | `supporting` | Supporting only: search/filter/done-archive actions should remain measurable enough to confirm improved operator throughput.     | analytics event review               |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, entitlement, or commercial reporting logic changes in this admin notes core slice.              | scope rationale                      |
| Incident response and support operations      | `target`     | Help/Guide and runbook content explain P0/P1/P2 meaning, archive behavior, and note lookup/recovery flow clearly.                | docs review + help-center assertions |
| Finance and reporting operations              | `N/A`        | N/A because no billing, payout, reconciliation, or finance reporting path is changed in this admin notes workflow upgrade.       | scope rationale                      |
| i18n operational readiness                    | `supporting` | Supporting only: severity/help copy and filter labels must remain localization-safe and enum-backed where possible.              | copy review                          |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing admin notes/API stack and avoid unnecessary dependencies for search/filter/tab persistence.                   | dependency diff + code review        |
| Testing and QA automation                     | `target`     | Coverage protects search/filter/archive persistence, tab refresh continuity, visible IDs, and unauthorized-path safety.          | tests + `verify:pre-pr` evidence     |
| Scalability and cost efficiency               | `supporting` | Supporting only: list controls should scale to larger note sets without brute-force client-only churn on every action.           | query review + code review           |
| DevOps and rollback readiness                 | `supporting` | Supporting only: core workflow changes remain easy to roll back without data migration if necessary.                             | release notes + diff review          |

## Acceptance Criteria

1. Every admin note shows a visible stable note ID.
2. Admin can search notes by ID and meaningful text.
3. Admin can filter by open/done archive, category, and route/context.
4. Done notes are hidden by default from the main working list but remain accessible through archive/done view.
5. Refreshing or deep-linking the admin dashboard can preserve the active `Notes` tab.
6. P0/P1/P2 meaning is explained in-product and aligned with Help/Guide/runbooks.
7. Existing delete and edit flows remain intact and more discoverable in filtered/archive contexts.
8. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - note search/filter behavior,
  - done-archive defaults,
  - admin tab URL persistence,
  - visible-ID/reference helpers
- targeted e2e for:
  - notes-tab refresh persistence,
  - search and context filtering,
  - done/archive list behavior,
  - incident-template meaning/help visibility
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
  - iPad/tablet viewport for filter/readability sanity check

## Constraints

- Keep this slice focused on core notes management and continuity.
- Do not mix media-upload work into this slice.
- Preserve current canonical note model unless a narrowly scoped field change is required for search/filter support.
- Avoid resetting the active admin tab after list mutations or refresh.

## 10/10 Quality Bar

- The operator should be able to find the right note quickly, even in a long list.
- The Notes tab should feel like a real work queue, not a flat backlog dump.
- Required states remain explicit:
  - `loading`
  - `empty`
  - `error`
  - `retry`
  - `success`
- Context and note identity must be obvious enough that future chats can reference a note by ID instead of pasting the whole body.
- No filter or refresh behavior should silently throw the operator back into the `Content` tab.

## Checkpoint Log

- `2026-03-21 | verify:pre-pr passed | full gate green after hardening admin-notes workflow reload waits and explicit timeout; local verify passed with 87 e2e passed / 243 skipped, and admin notes workflow stayed green inside full desktop Chromium coverage | next: stage slice, open PR, and record a perf-trend hold in PR summary because AW-010 stretch-target tightening is outside this admin-notes scope`
- `2026-03-21 | implementation started | moved admin notes core v2 into in-progress to ship visible note IDs, default-open work queue filters, notes-tab URL continuity, and clearer incident severity guidance before attachments/linking | next: implement notes manager filters + URL state, update Help/Guide/runbooks, and run targeted validation`
- `2026-03-21 | planning | created admin notes core v2 brief from real operational friction: visible IDs, search/filter by route and status, done hidden by default, persistent Notes-tab state, and clearer incident severity meaning | next: implement core list/search/filter/tab continuity before taking on attachments and linked-note graph work`
