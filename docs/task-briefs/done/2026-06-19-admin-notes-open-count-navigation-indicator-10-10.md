# Task Brief: Admin Notes Open Count Navigation Indicator

## Metadata

- `id`: `2026-06-19-admin-notes-open-count-navigation-indicator-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-19`
- `updated`: `2026-06-19`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`
- `source_audit`: `docs/task-briefs/done/2026-06-19-admin-readability-combined-score-refresh-notes-preaudit-10-10.md`
- `execution_mode`: `execute after owner approval`

## Brief Audit Record

- `last_audited`: `2026-06-19`
- `base`: `main@d9535756`
- `audit_status`: `ready`
- `decision`: Execute this Notes triage/navigation child before the broader Notes create-form density child.
- `reason`: Owner proposed that Notes should mirror the Messages count affordance by showing how many admin notes are open and opening the Notes tab on the open queue. Current Notes default filter is already `open`, but the shell has no count and `AdminWorkspace` tab changes can preserve stale Notes filters from the current URL.
- `must_refresh_before_execution_if`: Refresh if `AdminWorkspace`, `AdminNotesManager`, `lib/admin/notes-manager.ts`, admin Notes API routes, Notes status semantics, Admin Help/Guide Notes copy, Messages badge helper patterns, screenshot rules, scorecard categories, or route/label/support sweep rules change before implementation.

## Goal

Add a privacy-safe Notes navigation indicator that shows the count of open admin notes and makes the Notes tab enter the open queue by default, without changing Notes workflow semantics.

## Pre-Implementation Owner Explanation

Vi legger et lite tall paa Notes i admin-menyen, omtrent som Messages, men tallet betyr "aapne admin-notes" og ikke unread. Naar admin trykker Notes fra menyen, skal man lande i open-koeen, ikke i en gammel done/all-filtrering som hang igjen i URL-en.

Hvorfor det betyr noe: Notes er en arbeidskoe. Hvis aapne notes ikke synes i menyen, maa admin huske aa sjekke dem manuelt. Et lite tall og en trygg open-entry gjor triage raskere uten aa endre selve note-dataene.

Utenfor scope: ingen Notes create-form density, incident template layout, upload/link/edit behavior, nye statuser, polling, unread-semantikk, global/public badge, database/schema/RLS, Auth Admin, performance-budget endring eller merge uten eksplisitt approval.

Fremoverkompatibilitet: fremtidige note-statusverdier maa eksplisitt mappes til badge-semantikk. Ukjente eller deprecated statuser skal ikke gi falsk menyindikator.

## Selected Decisions

| Decision         | Recommended Default                                                                         | Reason                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Count meaning    | `open` admin notes (`is_done=false`)                                                        | Matches current Notes default queue and operator triage job.                                                 |
| Count scope      | All open notes visible in the Notes queue, including contextual notes; exclude `done` notes | Keeps the menu count aligned with the actual open Notes workload instead of only standalone dashboard notes. |
| Badge surface    | Notes admin tab only                                                                        | Keeps private admin workflow signal inside private admin.                                                    |
| Badge icon       | Reuse existing Notes `MessageSquareText` tab icon plus compact numeric badge                | Avoids adding a second icon or changing tab identity.                                                        |
| Badge cap        | `9+`                                                                                        | Keeps desktop/mobile tab layout stable.                                                                      |
| Data source      | Admin-gated aggregate summary endpoint or equivalent count-only route                       | Avoids loading full note bodies, attachments, and context details into the shell.                            |
| Refresh behavior | One fetch on admin shell mount; no polling                                                  | Same conservative model as Messages unless live alerts are later approved.                                   |
| Failure behavior | No visible badge on error/schema-missing; optional screen-reader status only                | Avoids false certainty.                                                                                      |
| Click behavior   | Selecting Notes from shell clears stale Notes filters and lands on the open queue           | Current default is open; implementation should avoid preserving old `notesStatus=done/all` unintentionally.  |

## Scope

- Add a count-only admin Notes summary contract for open notes, or reuse an existing safe count path if one exists at implementation time.
- Count all open notes that belong in the Notes queue, including contextual notes, and exclude `done` notes.
- Add a compact Notes tab badge in `AdminWorkspace`.
- Update Notes tab selection so shell entry lands on open Notes queue by default.
- Preserve deep links to a specific note/query/context when those links intentionally include filters.
- Update Help/Guide/runbook wording only if visible badge semantics need explanation.
- Add targeted route/shell/helper tests and screenshot handoff.

## Out Of Scope

- No create-form density implementation.
- No change to Notes create/edit/upload/link/delete/done/archive payloads.
- No change to admin note status model beyond using existing open/done meaning.
- No priority/SLA model, unread/new count, live polling, bulk triage, global badge, public navigation badge, or notification sound.
- No database migration, RLS, storage, generated types, service-role, authz, package, workflow, or performance-budget change.
- Do not touch `Ja.docx`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this child: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Accessibility (a11y), Performance (CWV + payloads), Data placement and sync boundaries, Caching and invalidation strategy, Reliability and failure handling, Security and authz, Privacy and compliance, Admin workflow and editability, Incident response and support operations, i18n operational readiness, Stack-fit and dependency discipline, Testing and QA automation, Scalability and cost efficiency, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                             | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Notes tab communicates open-queue work without changing admin nav IA or Notes workspace identity.                                                              | decision record + screenshots             | `5/5`                   |
| UX flow clarity                               | `target`     | Badge meaning is explicitly `open notes`, not unread/new; clicking Notes lands on open queue by default.                                                       | shell tests + Help/Guide review           | `5/5`                   |
| Visual design quality                         | `target`     | Badge is compact, capped, aligned with Messages pattern, and stable on desktop/mobile with no clipping or layout shift.                                        | screenshot handoff                        | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Count source deterministically counts open notes only and does not change note mutations, status semantics, filters, uploads, or related-note data.            | route/helper tests + diff review          | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: improves queue discovery but does not change edit/create surfaces.                                                                            | workflow rationale                        | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Notes tab accessible label states open-count meaning, capped count remains understandable, and badge does not rely on color alone.                             | shell/a11y tests                          | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Shell loads count-only data once and does not fetch note bodies, attachments, context catalog, or poll.                                                        | route payload review + build/gates        | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Open count remains server-canonical; shell count display is local/read-only derived state.                                                                     | data-boundary contract + tests            | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Summary route freshness/no-store behavior is explicit; count is refreshed on page load and does not imply live polling.                                        | route tests + docs                        | `5/5`                   |
| Reliability and failure handling              | `target`     | Summary load failure, schema-missing state, and zero-count state fail quiet without misleading badge.                                                          | route/shell failure tests                 | `5/5`                   |
| Security and authz                            | `target`     | Count route is admin viewer-gated and fails closed with deterministic unauthenticated/unauthorized behavior.                                                   | negative-path route tests                 | `5/5`                   |
| Privacy and compliance                        | `target`     | Shell receives aggregate count only; no note title/body/category/context/attachment/user payload leaks into nav.                                               | privacy review + payload tests            | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: no content publish/revision/workflow behavior change.                                                                                         | no-content-diff review                    | `4/5`                   |
| Admin workflow and editability                | `target`     | Admin can discover open Notes work faster and still use existing filters/deep links intentionally.                                                             | shell/Notes filter tests                  | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A with scope rationale: authenticated private admin navigation only; no public metadata, sitemap, robots, canonical, or crawlable route changes.             | private-admin scope review                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A with scope rationale: no public AI-facing content, structured data, entity page, or crawl-safe semantic contract changes.                                  | private-admin scope review                | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event, KPI, dashboard, or telemetry payload change by default.                                                                   | no-analytics-diff review                  | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A with scope rationale: no products, checkout, Stripe, entitlements, pricing, revenue, refund, invoice, payout, or commerce behavior changes.                | explicit commerce scope review            | `N/A`                   |
| Incident response and support operations      | `target`     | Open Notes count improves operator triage without redefining incident templates or support procedures.                                                         | Help/Guide impact review + tests          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes. | explicit finance scope review             | `N/A`                   |
| i18n operational readiness                    | `target`     | Count label and capped copy tolerate localized text without clipping; accessible label is centralized.                                                         | desktop/mobile screenshots + helper tests | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Messages badge pattern, `AdminWorkspace`, Notes contracts, and existing test stack; add no dependency.                                                   | diff/package review                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Add route/helper/shell tests for zero, positive, capped, failure, authz, and click-to-open behavior; run gates.                                                | targeted tests + verify gates             | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Count strategy stays aggregate-only and does not grow with note body/attachment payload size.                                                                  | payload/perf review                       | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Small reversible route/shell/test/docs diff with no migration, package, workflow, or config dependency.                                                        | git diff + gates + PR evidence            | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `components/admin/AdminWorkspace.tsx` tab badge pattern from Messages;
  - preserve `/admin?tab=notes` routing and client tab behavior;
  - add or reuse a route handler only for aggregate count.
- TypeScript/domain:
  - use canonical Notes open/done semantics from existing Notes contracts;
  - no stringly ad hoc status mapping.
- Supabase/data:
  - no migration/RLS/generated type expected;
  - route must use admin-gated count query only.
- External services:
  - none.
- UI system:
  - reuse existing tab icon/button/badge classes where practical;
  - screenshot handoff is required because admin navigation visuals change.
- Testing:
  - route negative paths,
  - shell badge states,
  - click-to-open queue behavior,
  - Help/Guide assertion if copy changes.

## Data Placement And Sync Contract

- Server-canonical data: admin notes and `is_done=false` open count.
- Local data: displayed count, load/failure status, and active tab selection only.
- Sync policy: shell fetches count once on mount; no live polling or cross-tab sync in this slice.
- Retention and sensitivity: aggregate count only, no note payload.
- Cache/invalidation: summary route should be dynamic/no-store or equivalent admin-fresh behavior.

## Identity And Rename Contract

- Canonical stable IDs: note IDs and admin tab query value `notes` remain unchanged.
- Human-readable labels: badge display text is derived UI only.
- Mutability rules: no note entity, status value, or filter query param is renamed.
- Rename vs repurpose: new status or unread semantics require a new mapping decision.
- Compatibility: `/admin?tab=notes` enters the open queue, while existing specific Notes deep links must continue to work when intentionally carrying filters/query/context params such as `notesStatus=done/all`.
- Observability and repair: summary failures should be test-visible and support-safe.

## Forward Compatibility Contract

- Extensibility surfaces: Notes statuses, badge label, admin tab metadata, locales, future note triage states.
- Source of truth: open count is derived from existing server-canonical Notes status/done state.
- Additive behavior: new notes automatically affect open count when they are not done.
- Explicit mapping requirements: new triage statuses, archived semantics, unread/new concepts, SLA categories, or polling require owner-approved mapping.
- Unknown or deprecated values: excluded from badge until mapped; no false visible badge.
- Test/evidence: route tests, shell rendering tests, click-to-open tests, and screenshot handoff.

## Help / Guide Impact

Expected update if visible badge semantics ship. Help/Guide or runbook should state that the Notes badge means open admin notes and is not an unread/new counter.

## Route / Label / Support Surface Sweep

Run before broad gates:

- `Notes`
- `open notes`
- `notes summary`
- `notesStatus=open`
- `admin-tab-notes`
- `admin-tab-notes-open-badge`
- `Needs reply`
- `Messages`
- `Help/Guide`
- `/admin?tab=notes`

Check at minimum `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/checklists/`, planned/in-progress/done task briefs, and Help/Guide assertions.

Execution evidence: identifiers searched were `Notes`, `open notes`, `notes summary`, `notesStatus=open`, `admin-tab-notes`, `admin-tab-notes-open-badge`, `Needs reply`, `Messages`, `Help/Guide`, and `/admin?tab=notes`. Directories/surfaces checked were `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, task briefs, and Help/Guide assertions. Fallout handled in this slice: admin shell badge/navigation, Notes summary API contract registry, Notes runbook copy, Help/Guide copy, route tests, helper tests, and shell tests.

## Implementation Evidence Notes

- API/server failure-mode evidence: summary route is admin-gated, `dynamic = "force-dynamic"`, returns `Cache-Control: no-store`, treats schema-missing as quiet `schemaReady:false`, and uses a tested non-schema failure mode that logs and returns `{ ok:false }` with status `500`; there is no unexpected 500 for the known schema-missing state.
- UI reference surface evidence: Notes badge reuses the existing Messages badge reference surface in `AdminWorkspace` and the same shared component/tab visual contract rather than introducing a new nav pattern.
- Accessibility/responsive evidence: helper tests cover capped labels such as `9 or more open notes`, shell tests cover visible badge states, and screenshot handoff covers desktop/mobile with after/reference naming.

## Screenshot Handoff Plan

- Use `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.
- Capture against local `http://127.0.0.1:3000` with `SITE_LOCK_ENABLED=0`.
- If `/dev/login` or Supabase egress blocks screenshot-only capture, use documented temporary local visual-harness fallback and remove it before validation/PR diff.
- Artifact folder: `output/admin-notes-open-count-indicator-YYYY-MM-DD-HHMMSS`.
- Required screenshots:
  - `after-admin-notes-badge-desktop.png`
  - `reference-admin-notes-zero-desktop.png`
  - `after-admin-notes-badge-mobile.png`
  - `reference-admin-notes-zero-mobile.png`
- Handoff type: `after/reference` unless a true before/after recapture is practical.

## Acceptance Criteria

1. Notes tab shows a compact badge only when open note count is greater than zero.
2. Badge caps at `9+` and accessible label states the open-note meaning, not unread/new semantics.
3. Summary route/data source is admin-gated, count-only, and no-store/fresh by design.
4. Failure or schema-missing state shows no misleading visible badge.
5. Selecting Notes from the admin shell lands on open queue by default and avoids stale `done/all` carryover.
6. Existing intentional Notes deep links with query/context filters still work, including explicit `notesStatus=done/all`.
7. Help/Guide explains the badge if visible copy ships.
8. Screenshot handoff is owner-approved before `npm run verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- targeted route/shell/helper tests for Notes summary and tab click behavior
- targeted Help/Guide test if copy changes
- screenshot handoff
- after owner screenshot approval: `npm run verify:pre-pr`
- PR CI
- before merge recommendation: `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-19 | planned | created from owner scope proposal during the combined admin readability audit: Notes should show open-count in the menu like Messages and open on the open admin-notes queue | next: owner decides whether to execute this child before Notes create-form density`
- `2026-06-19 | in-progress | owner approved execution and asked to add four scope clarifications: count includes open contextual notes in the same Notes queue, Help/Guide must clarify open-not-unread semantics, shell entry defaults to open while intentional deep links keep explicit filters/context, and create-form/SLA/unread/polling/bulk-triage work remains out of scope | next: implement scoped navigation/count indicator and screenshot handoff before PR gates`
- `2026-06-19 | screenshot-review | implemented count-only /api/admin/notes/summary route, Notes shell badge, click-to-open queue cleanup, Help/Guide/runbook copy, architecture registry entry, and targeted route/helper/shell/help tests; owner flagged excessive desktop whitespace in first screenshot, root cause was admin grid auto rows stretching inside min-h-screen, fixed with desktop content-start and row-2 nav/main placement; validation passed: targeted Vitest (4 files / 40 tests), targeted ESLint, npm run lint:briefs:all, npm run typecheck, git diff --check; refreshed screenshot artifacts captured at output/admin-notes-open-count-indicator-2026-06-19-144301 using temporary local harness because dev-login hit local Supabase egress guard, and the harness was removed before final diff | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-19 | pre-pr-ready | owner approved screenshot handoff; initial npm run verify:pre-pr failed on two unrelated mobile E2E timeouts, the two failed tests then passed isolated, and rerun npm run verify:pre-pr passed full-public lane at artifacts/test-runs/20260619-162246; perf budget trend again recommended tightening one stretch target after 10 consecutive weekly green runs, recorded for PR summary and deferred from this Notes-only slice | next: commit, push, open PR, monitor CI`
- `2026-06-19 | done | PR #1177 merged with squash commit 18444899 after green GitHub checks and local npm run verify:pre-merge; post-merge preflight surfaced this repo-managed docs-only closeout | next: validate closeout PR and merge if green`

## Completion Record

- `completed`: `2026-06-19`
- `merged_pr`: `#1177`
- `squash_commit`: `18444899`
- `result`: Admin Notes now shows a compact open-count badge in the admin menu, shell entry lands on the open Notes queue by default, intentional deep links remain supported, and the desktop admin whitespace regression found during screenshot review was fixed.
- `validation`: Targeted Vitest passed for admin workspace shell, Notes routes/helpers, and Help/Guide tests; targeted ESLint, typecheck, lint:briefs:all, lint:quality-gates, and git diff --check passed; screenshot handoff was owner-approved; `npm run verify:pre-pr` passed at `artifacts/test-runs/20260619-162246`; required GitHub checks passed; `npm run verify:pre-merge` passed with marker `artifacts/verify-pre-merge/20260619-144856.json`.
- `10/10 claim`: yes - all critical target categories reached `5/5`; no active release-blocking gaps remain for this slice.

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Caching and invalidation strategy
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Admin workflow and editability
- Incident response and support operations
- i18n operational readiness
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency
- DevOps and rollback readiness

All target categories, including `Accessibility (a11y)` and `Performance (CWV + payloads)`, are scored `5/5` in the closeout table below.

| Category                                      | Achieved Score | Evidence                                                                                                             | Gaps / Notes |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR #1177 scope and screenshots show Notes menu count without changing admin IA.                                      | No gap.      |
| UX flow clarity                               | `5/5`          | Shell tests cover click-to-open queue behavior; Help/Guide copy clarifies open-not-unread semantics.                 | No gap.      |
| Visual design quality                         | `5/5`          | Owner-approved after/reference screenshot handoff at `output/admin-notes-open-count-indicator-2026-06-19-144301`.    | No gap.      |
| Business logic correctness and data integrity | `5/5`          | Route/helper tests cover open-only count, zero, capped, schema-missing, and non-schema failure behavior.             | No gap.      |
| Accessibility (a11y)                          | `5/5`          | Helper and shell tests cover accessible open-count labels and capped `9+` meaning.                                   | No gap.      |
| Performance (CWV + payloads)                  | `5/5`          | Count-only no-store route avoids note bodies, attachments, context payloads, and polling; verify gates passed.       | No gap.      |
| Data placement and sync boundaries            | `5/5`          | Brief and route contract keep count server-canonical and shell display local/read-only.                              | No gap.      |
| Caching and invalidation strategy             | `5/5`          | Summary route is `force-dynamic` with `Cache-Control: no-store`; route tests and registry updated.                   | No gap.      |
| Reliability and failure handling              | `5/5`          | Shell/route tests cover quiet zero/schema-missing/failure states without misleading visible badge.                   | No gap.      |
| Security and authz                            | `5/5`          | Admin-gated route with unauthorized negative-path tests.                                                             | No gap.      |
| Privacy and compliance                        | `5/5`          | Shell receives aggregate count only, with no note title/body/context/attachment/user payload.                        | No gap.      |
| Admin workflow and editability                | `5/5`          | Notes menu exposes open work and preserves intentional filter/deep-link workflows.                                   | No gap.      |
| Incident response and support operations      | `5/5`          | Help/Guide and Notes recovery runbook describe badge meaning for operator triage.                                    | No gap.      |
| i18n operational readiness                    | `5/5`          | Centralized label helpers and responsive screenshots cover capped label behavior.                                    | No gap.      |
| Stack-fit and dependency discipline           | `5/5`          | Reused AdminWorkspace/Messages badge pattern, existing route/test stack, and added no dependency.                    | No gap.      |
| Testing and QA automation                     | `5/5`          | Targeted tests, `npm run verify:pre-pr`, GitHub checks, and `npm run verify:pre-merge` passed.                       | No gap.      |
| Scalability and cost efficiency               | `5/5`          | Supabase head/count query keeps cost independent of note body/attachment size.                                       | No gap.      |
| DevOps and rollback readiness                 | `5/5`          | Small reversible squash commit `18444899`, no migration/package/workflow change, rollback via `git revert 18444899`. | No gap.      |
