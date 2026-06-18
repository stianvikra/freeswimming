# Task Brief: Admin Content Mirror And Status Action Density

## Metadata

- `id`: `2026-06-18-admin-content-mirror-and-status-action-density-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `execution_mode`: `plan only until owner explicitly approves implementation`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-notes-residual-disposition-intake-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `main@a0a63d58`
- `audit_status`: `draft-for-owner-audit`
- `decision`: Keep this as a separate Content admin follow-up candidate, not part of the mobile shell slice; re-audit before implementation.
- `reason`: Open note `a4677939` includes Content-specific requests: collapsible Platform mirror snapshot with mismatch summary and lower-noise status actions. These touch `AdminContentManager`, not just the shell.
- `must_refresh_before_execution_if`: Refresh if `AdminContentManager`, mirror snapshot model, content status workflow, content tests, Help/Guide content workflow, or screenshot rules change.

## Goal

Reduce Content admin action density by making mirror health scannable when collapsed and grouping low-frequency status transitions without changing content lifecycle semantics.

## Pre-Implementation Owner Explanation

Vi skiller Content-spesifikke ting fra mobilmenyen. Denne briefen handler om speil-statusen og statusknappene i Content: admin skal se om noe er feil uten at hele speil-panelet og alle statusvalg dominerer skjermen.

Hvorfor det betyr noe: Content er et viktig arbeidsområde, men mirror diagnostics og statusendringer er ikke alltid primærjobben. Riktig grouping reduserer feilklikk og scan-støy.

Utenfor scope: mobil admin-tab switcher, Quick note warning, nye content-statusverdier, publiseringslogikk, API/schema/RLS, pass-criteria scoring, message badges og merge.

Fremoverkompatibilitet: nye mirror metrics og statusverdier skal enten arve samme collapse/summary/action-group pattern eller kreve eksplisitt mapping og tester.

## Source Notes Covered

| Note ID                                | Covered Scope                                                                 | Explicit Boundary                                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `a4677939-8f6a-44ce-b585-490f65b07793` | Platform mirror snapshot collapse/summary and Content status action grouping. | Admin shell/header/mobile navigation is owned by `2026-06-18-admin-shell-mobile-discoverability-and-quick-note-context-10-10.md`. |

## Pre-Execution Audit Gate

Before implementation starts:

1. Reopen this brief, the residual intake, and the current `AdminContentManager` mirror/status code.
2. Refresh source note `a4677939` and verify whether the shell portion has already been handled elsewhere.
3. Inspect current Content desktop/mobile screenshots or capture fresh evidence for mirror/status density.
4. Confirm whether Help/Guide needs updates for status action labels, mirror diagnostics, or recovery behavior.
5. Run `npm run lint:briefs:all` and get owner approval before moving this brief to `in-progress`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this child: UX flow clarity, Visual design quality, Business logic correctness and data integrity, Admin editor ergonomics, Accessibility (a11y), Reliability and failure handling, Security and authz, Content governance, Admin workflow and editability, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                               | Evidence                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Content diagnostics and status actions are separated by frequency/risk without changing the Content workspace job.                               | screenshots + workflow review      | `5/5`                   |
| UX flow clarity                               | `target`     | Collapsed mirror state still shows mismatch/identity drift/ignored QA counts; status actions are discoverable but not a button wall.             | tests + screenshots                | `5/5`                   |
| Visual design quality                         | `target`     | Content desktop/mobile screenshots show less diagnostic/action clutter with no clipped text or overlap.                                          | before/after screenshot handoff    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Mirror metric values, focus behavior, status transitions, revisions, preview, and delete behavior remain unchanged.                              | targeted tests + diff review       | `5/5`                   |
| Admin editor ergonomics                       | `target`     | High-frequency Content editing remains fast; low-frequency status transitions are grouped safely.                                                | workflow QA + screenshots          | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Collapse/disclosure/menu controls preserve names, roles, focus, keyboard access, and status text.                                                | unit/e2e assertions                | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, fetch, or heavy client state added.                                                                              | package/diff review                | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical content/mirror data and local UI disclosure state remain distinct.                                                              | diff review                        | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing admin no-store/fetch behavior remains unchanged.                                                                       | route diff review                  | `4/5`                   |
| Reliability and failure handling              | `target`     | Existing mirror warning/error and content status feedback paths stay deterministic.                                                              | targeted tests                     | `5/5`                   |
| Security and authz                            | `target`     | Admin/editor/admin-only action boundaries remain unchanged and fail closed.                                                                      | authz diff review + existing tests | `5/5`                   |
| Privacy and compliance                        | `target`     | No private user/payment/provider/raw analytics data added to diagnostics/screenshots.                                                            | screenshot/privacy review          | `5/5`                   |
| Content governance                            | `target`     | Publish/review/archive/draft semantics stay explicit and recoverable.                                                                            | Help/Guide impact review + tests   | `5/5`                   |
| Admin workflow and editability                | `target`     | Content status/edit/preview/revision actions remain available and easier to scan.                                                                | e2e/unit + screenshots             | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: content status UI must not alter public metadata, sitemap, robots, canonical, or preview indexing.                              | public route no-change review      | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public semantic output must remain unchanged.                                                                                   | public markup no-change review     | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event or KPI change.                                                                                               | no-analytics-diff review           | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no product, checkout, Stripe, entitlement, pricing, revenue, refund, invoice, payout, or commerce behavior changes.                  | explicit commerce scope rationale  | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: mirror diagnostics support repair but no recovery procedure changes unless Help/Guide says so.                                  | support-surface sweep              | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes. | explicit finance scope rationale   | `N/A`                   |
| i18n operational readiness                    | `target`     | Collapsed labels and status menus tolerate longer labels without clipping.                                                                       | responsive screenshots             | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `AdminContentManager`, existing mirror model, status constants, and local primitives; no dependency.                                       | diff/package review                | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted Content/mirror/status tests cover changed behavior; screenshots before broad gates.                                                     | test logs + screenshots            | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: pattern should scale to more mirror metrics/statuses without new queries.                                                       | future-value review                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Small reversible UI/test diff with no migration or API dependency.                                                                               | git diff + gates                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: reuse `AdminContentManager`; no route or API changes expected.
- TypeScript/domain: preserve content status enum and mirror snapshot types.
- Supabase/data: no schema/RLS/generated type changes.
- UI system: use existing `AdminManagerState`, status chips, `fs-*` actions, and native disclosure/menu patterns.
- Testing: update mirror/status unit and e2e coverage; screenshot handoff required.

## Data Placement And Sync Contract

- Server-canonical data: admin content rows and mirror snapshot response.
- Local data: collapsed/open disclosure state or menu open state only.
- Sync policy: unchanged refresh/load behavior.
- Retention/sensitivity: no new sensitive data.
- Cache/invalidation: unchanged admin route behavior.

## Identity And Rename Contract

- Canonical IDs: content IDs, slugs, status values, mirror metric keys.
- Human-readable labels: visible status labels may be reorganized, not redefined.
- Mutability rules: no status value repurpose.
- Rename vs repurpose: new lifecycle semantics require new brief/tests.
- Compatibility: existing admin links and preview links remain.
- Observability and repair: mirror mismatch counts remain visible.

## Forward Compatibility Contract

- Extensibility surfaces: mirror metrics, content statuses, lifecycle actions, locales.
- Source of truth: mirror metrics from existing view model; statuses from status constants.
- Additive behavior: new mirror metrics join summary/detail pattern.
- Explicit mapping requirements: new status semantics or destructive actions need Help/Guide/tests.
- Unknown/deprecated values: keep safe fallback status rendering.
- Test/evidence: future metric/status fixtures or explicit rationale.

## Scope

- Content mirror snapshot summary/detail UI.
- Content row/module/lesson status action grouping.
- Relevant tests and Help/Guide fallout.

## Out Of Scope

- Admin shell mobile navigation.
- Quick note context warning.
- Content API/schema/status semantics.
- Public lesson UI/scoring changes.

## Acceptance Criteria

1. Mirror snapshot can be compact by default while mismatch counts remain visible.
2. Status transitions are grouped without hiding publish/review/archive/draft meaning.
3. Content data behavior and authz boundaries are unchanged.
4. Screenshot handoff is owner-approved before `npm run verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- targeted Content/mirror/status tests
- screenshot handoff
- after screenshot approval: `npm run verify:pre-pr`, CI, `npm run verify:pre-merge`

## Help / Guide Impact

Required if status action labels, mirror diagnostic behavior, or recovery guidance changes.

## Checkpoint Log

- `2026-06-18 | planned | split Content-specific mirror/status action items from live note a4677939 into a dedicated follow-up so the admin shell mobile slice stays narrow | next: re-audit after shell mobile discoverability before implementation`
