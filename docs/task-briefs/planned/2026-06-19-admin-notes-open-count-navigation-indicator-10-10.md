# Task Brief: Admin Notes Open Count Navigation Indicator

## Metadata

- `id`: `2026-06-19-admin-notes-open-count-navigation-indicator-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-19`
- `updated`: `2026-06-19`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`
- `source_audit`: `docs/task-briefs/done/2026-06-19-admin-readability-combined-score-refresh-notes-preaudit-10-10.md`
- `execution_mode`: `plan only until owner explicitly approves implementation`

## Brief Audit Record

- `last_audited`: `2026-06-19`
- `base`: `main@f5b9388c`
- `audit_status`: `ready`
- `decision`: Prefer this Notes triage/navigation child before the broader Notes create-form density child if the owner approves implementation.
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

| Decision         | Recommended Default                                                               | Reason                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Count meaning    | `open` admin notes (`is_done=false`)                                              | Matches current Notes default queue and operator triage job.                                                |
| Badge surface    | Notes admin tab only                                                              | Keeps private admin workflow signal inside private admin.                                                   |
| Badge icon       | Reuse existing Notes `MessageSquareText` tab icon plus compact numeric badge      | Avoids adding a second icon or changing tab identity.                                                       |
| Badge cap        | `9+`                                                                              | Keeps desktop/mobile tab layout stable.                                                                     |
| Data source      | Admin-gated aggregate summary endpoint or equivalent count-only route             | Avoids loading full note bodies, attachments, and context details into the shell.                           |
| Refresh behavior | One fetch on admin shell mount; no polling                                        | Same conservative model as Messages unless live alerts are later approved.                                  |
| Failure behavior | No visible badge on error/schema-missing; optional screen-reader status only      | Avoids false certainty.                                                                                     |
| Click behavior   | Selecting Notes from shell clears stale Notes filters and lands on the open queue | Current default is open; implementation should avoid preserving old `notesStatus=done/all` unintentionally. |

## Scope

- Add a count-only admin Notes summary contract for open notes, or reuse an existing safe count path if one exists at implementation time.
- Add a compact Notes tab badge in `AdminWorkspace`.
- Update Notes tab selection so shell entry lands on open Notes queue by default.
- Preserve deep links to a specific note/query/context when those links intentionally include filters.
- Update Help/Guide/runbook wording only if visible badge semantics need explanation.
- Add targeted route/shell/helper tests and screenshot handoff.

## Out Of Scope

- No create-form density implementation.
- No change to Notes create/edit/upload/link/delete/done/archive payloads.
- No change to admin note status model beyond using existing open/done meaning.
- No polling, unread/new count, SLA alerting, global badge, public navigation badge, or notification sound.
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
- Compatibility: existing specific Notes deep links must continue to work when intentionally carrying filters/query params.
- Observability and repair: summary failures should be test-visible and support-safe.

## Forward Compatibility Contract

- Extensibility surfaces: Notes statuses, badge label, admin tab metadata, locales, future note triage states.
- Source of truth: open count is derived from existing server-canonical Notes status/done state.
- Additive behavior: new notes automatically affect open count when they are not done.
- Explicit mapping requirements: new triage statuses, archived semantics, unread/new concepts, SLA categories, or polling require owner-approved mapping.
- Unknown or deprecated values: excluded from badge until mapped; no false visible badge.
- Test/evidence: route tests, shell rendering tests, click-to-open tests, and screenshot handoff.

## Help / Guide Impact

Expected update if visible badge semantics ship. Help/Guide or runbook should state that the Notes badge means open admin notes and is not an unread counter.

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
2. Badge caps at `9+` and accessible label states the open-note meaning.
3. Summary route/data source is admin-gated, count-only, and no-store/fresh by design.
4. Failure or schema-missing state shows no misleading visible badge.
5. Selecting Notes from the admin shell lands on open queue by default and avoids stale `done/all` carryover.
6. Existing intentional Notes deep links with query/context filters still work.
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
