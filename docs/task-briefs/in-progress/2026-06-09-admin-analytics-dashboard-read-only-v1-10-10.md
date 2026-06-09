# Task Brief: Admin Analytics Dashboard Read-Only V1 (10/10)

## Metadata

- `id`: `2026-06-09-admin-analytics-dashboard-read-only-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-09`
- `updated`: `2026-06-09`
- `branch`: `admin-analytics-dashboard-read-only-v1`
- `parent_brief`: `docs/task-briefs/deferred/2026-02-18-analytics-persistence-and-admin-insights.md`
- `depends_on`: `docs/task-briefs/done/2026-06-09-privacy-safe-analytics-persistence-admin-insights-v1-10-10.md`
- `execution_mode`: `owner explicitly said implement on 2026-06-09`

## Brief Audit Record

- `last_audited`: `2026-06-09`
- `base`: `main@c4da03ba`
- `audit_status`: `ready`
- `decision`: Execute this bounded analytics child brief now.
- `reason`: Owner explicitly said `implementer Admin Analytics Dashboard Read-Only V1` on `2026-06-09`. PR `#1043` and closeout PR `#1044` completed privacy-safe first-party analytics persistence and admin-only JSON insights, so the next smallest useful step is to render those existing insights for admins without adding new vendors, identifiers, CSV export, rollups, retention jobs, or finance reporting.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, admin workspace/navigation patterns, `/api/admin/analytics/insights`, `lib/analytics/admin-insights.ts`, `analytics_events` schema/RLS, public analytics privacy assessment, Help/Guide contracts, screenshot handoff rules, route/label/support sweep rules, or verification lanes change before implementation starts.

## Goal

Create an admin-only, read-only analytics dashboard that turns the existing privacy-safe insights JSON into a clear operational view for product and support decisions.

## Pre-Implementation Owner Explanation

Vi lager en enkel adminside som viser tallene som allerede lagres trygt: hvor mange events som finnes, hvilke ruter og produkter som dukker opp, en liten funnel, og om datagrunnlaget er tomt, gammelt eller begrenset av radtak. Det betyr noe fordi analytics naa er lagret i databasen, men admin trenger en lesbar visning i stedet for aa bruke ra SQL eller JSON. Utenfor scope er tredjeparts analytics, cookies, visitor-ID, kobling av anonym trafikk til brukerprofil, CSV-export, retention cleanup, materialized rollups, finance-grade rapportering og nye kommersielle CTA-/funnel-endringer.

Forward-compatibility-intent: nye godkjente events, produkter og ruter skal kunne dukke opp i generiske event-, produkt- og rutelister fra eksisterende typed contracts; nye KPI-moduler, route-kategorier, export-formater eller finance-grade rapportering krever eksplisitt mapping, brief, tester og eierbeslutning.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Admin workflow and editability
- Accessibility (a11y)
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                         | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Dashboard answers one V1 admin question set: traffic/funnel health, top events, route/product counts, freshness, and data caveats in one admin route.                                                      | route QA + component tests + screenshot handoff                    | `5/5`                   |
| UX flow clarity                               | `target`     | Read-only dashboard has a fixed information hierarchy, obvious range controls, loading/empty/error/retry/schema-missing/capped states, and no dead-end path on desktop or mobile.                          | component tests + admin QA + screenshots                           | `5/5`                   |
| Visual design quality                         | `target`     | UI reuses existing admin workspace/card/action/table language and stays quiet, dense, scan-friendly, readable, and responsive without horizontal mobile overflow.                                          | after/reference screenshot handoff                                 | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Metrics render directly from `/api/admin/analytics/insights`; no client-side reinterpretation can change event identity, user linkage, or sanitized counts.                                                | view-model tests + API contract review                             | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: this is read-only analytics, not an editor; admin still needs fast inspection, range switching, and clear caveats.                                                                        | admin QA + Help/Guide update                                       | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Tables, metric cards, range controls, retry actions, headings, and caveats are keyboard/screen-reader usable with clear labels.                                                                            | Testing Library assertions + screenshot/keyboard QA                | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | The `/admin?tab=analytics` dashboard, with `/admin/analytics` as alias, avoids new heavy chart dependencies, uses bounded JSON reads, and keeps dashboard JS/CSS within existing admin route expectations. | dependency diff + build/perf review + bounded endpoint tests       | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Analytics rows remain server-canonical; dashboard filter/range selection is local or query-only and never writes analytics state.                                                                          | data-boundary review + tests                                       | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Dashboard reads use dynamic/no-store behavior and expose `generatedAt`, `lastEventAt`, `rangeDays`, `rowCap`, and `capped` caveats visibly.                                                                | route/component tests + header review                              | `5/5`                   |
| Reliability and failure handling              | `target`     | Unauthenticated, forbidden, schema-missing, empty, capped, fetch-error, and retry states are deterministic and never show raw payload data.                                                                | negative-path tests + manual QA                                    | `5/5`                   |
| Security and authz                            | `target`     | Only admin viewer+ roles can access the dashboard and route; protected reads fail closed with `401`/`403`.                                                                                                 | admin route/auth tests + access review                             | `5/5`                   |
| Privacy and compliance                        | `target`     | Dashboard shows only aggregate/sanitized fields and never displays raw URLs, emails, IPs, user agents, visitor IDs, notes, cart data, or raw payload JSON.                                                 | privacy review + unsafe-field tests                                | `5/5`                   |
| Content governance                            | `target`     | Metric labels, caveats, and interpretation rules are documented as admin guidance and API contract notes.                                                                                                  | Help/Guide/API docs diff + assertions                              | `5/5`                   |
| Admin workflow and editability                | `target`     | Admin can inspect analytics without raw SQL/JSON and understands when data is missing, capped, stale, or schema-not-ready.                                                                                 | admin QA + Help/Guide update + screenshots                         | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this adds an admin-only protected route and changes no public metadata, sitemap, robots, canonical URL, or crawlable content.                                                                  | explicit scope rationale                                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this adds no public semantic content, structured data, public entity page, or AI-facing crawl surface.                                                                                         | explicit scope rationale                                           | `N/A`                   |
| Analytics and KPI observability               | `target`     | Persisted analytics become dashboardable through stable event, funnel, route, product, freshness, and cap views without expanding payload collection.                                                      | view-model tests + dashboard QA                                    | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: dashboard may show checkout/entitlement proxy counts but does not change Stripe truth, checkout, entitlement grants, refunds, or pricing.                                                 | commerce boundary review                                           | `4/5`                   |
| Incident response and support operations      | `target`     | Support/admin can diagnose schema readiness, last event time, capped reads, and missing events through visible caveats plus Help/Guide troubleshooting.                                                    | Help/Guide/runbook update + failure-state tests                    | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: revenue-proxy counts may inform product review, but no finance reconciliation, revenue recognition, payout, invoice, or accounting changes.                                               | explicit finance scope rationale + Help/Guide caveat               | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: dashboard copy stays structurally localizable and uses stable event/product IDs rather than translated labels as analytics identity.                                                      | copy/layout review + future-label fallback tests                   | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js App Router, admin auth/workspace patterns, TypeScript view-models, Supabase-backed insights route, and UI primitives; add no chart dependency.                                      | architecture review + dependency diff                              | `5/5`                   |
| Testing and QA automation                     | `target`     | View-model, component state, admin auth/negative paths, Help/Guide assertion, screenshot handoff, and `verify:pre-pr`/`verify:pre-merge` cover the slice.                                                  | targeted Vitest/Testing Library + screenshots + verification gates | `5/5`                   |
| Scalability and cost efficiency               | `target`     | V1 uses the existing bounded insights endpoint and avoids materialized rollups, exports, or client-heavy chart libraries until separate briefs justify them.                                               | row-cap tests + dependency/build review                            | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Route can be reverted cleanly without migration rollback; no new env vars, providers, workflows, cookies, or background jobs are introduced.                                                               | changed-files review + pre-pr/pre-merge gates + rollback note      | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Add a protected Analytics tab in the existing `/admin` workspace, with `/admin/analytics` as an alias redirect to `/admin?tab=analytics`.
  - Reuse existing admin workspace/navigation/reference surfaces instead of creating a separate design language or separate route shell.
  - Prefer a small server wrapper plus focused client component only where range switching/retry needs interactivity.
  - Keep reads dynamic/no-store and sourced from `/api/admin/analytics/insights`.
- TypeScript/domain contracts:
  - Reuse the existing admin insights response contract from `lib/analytics/admin-insights.ts`.
  - Add a narrow dashboard view-model for metric cards, top lists, funnel conversion, caveats, and unknown-value fallbacks.
  - Do not infer business meaning from display labels.
- Supabase/data layer:
  - No migration in this slice.
  - The dashboard reads through the existing admin insights route and its viewer+ auth/RLS boundary.
  - Retention cleanup/materialized rollups remain separate future work.
- External services/tools:
  - No Plausible, Simple Analytics, GA4, Meta, GTM, Hotjar, Clarity, pixels, tag managers, cookies, localStorage visitor IDs, or new SDKs.
- UI system:
  - Reuse current admin card/table/action/status patterns, `fs-cta-*`, `fs-library-card`, `ui-field`, `AdminManagerState`-style empty/error/loading treatment where practical, and responsive admin layout rules.
  - Because this changes visible admin UI, implementation must pause for screenshot handoff before `npm run verify:pre-pr`.
  - Screenshot comparison type: `after/reference`, comparing the new dashboard to a mature admin manager/workspace reference surface.
- Testing:
  - Unit/component tests for view-model formatting, unknown values, empty/schema-missing/capped states, retry, accessible labels, and no raw payload rendering.
  - Route/auth tests remain aligned with `/api/admin/analytics/insights`.
  - Playwright smoke or targeted admin component tests should cover the rendered route if local auth test helpers support it.

## Dashboard UX / Readability Contract

Maturity references used for the implementation brief:

- PostHog dashboard docs show the value of a dashboard-level date range/filter model and note that smaller screens stack dashboard tiles into a single column: `https://posthog.com/docs/product-analytics/dashboards`.
- Plausible docs model explicit date ranges, metrics, dimensions, response metadata/warnings, and a strict no-PII custom-property boundary: `https://plausible.io/docs/stats-api` and `https://plausible.io/docs/custom-props/introduction`.
- Stripe dashboard/reporting docs separate operational dashboard insight from accounting-grade reporting/export workflows: `https://docs.stripe.com/dashboard` and `https://docs.stripe.com/stripe-reports`.
- These are product-pattern references only. This slice must not add those vendors, APIs, cookies, scripts, exports, or finance-reporting behavior.

Required information order:

1. Data health bar:
   - range,
   - `generatedAt`,
   - `lastEventAt`,
   - `schemaReady`,
   - `rowCap`,
   - capped/not capped.
2. KPI strip with `4-6` scan-first metrics:
   - total events,
   - last event freshness,
   - public aggregate events,
   - unique known users,
   - client/server split,
   - checkout completion rate when available.
3. Funnel:
   - public page viewed,
   - plans viewed,
   - product viewed,
   - checkout started,
   - checkout completed,
   - entitlement granted.
4. Top lists:
   - events,
   - routes,
   - products.
5. Caveats:
   - what is not counted,
   - what revenue proxy does not prove,
   - why public aggregate traffic is not linked to users,
   - how capped/schema-missing/empty data should be interpreted.

Desktop layout requirements:

- Use a compact admin dashboard layout, not a marketing or decorative analytics page.
- Keep a constrained admin content width consistent with mature admin workspace surfaces.
- KPI cards should sit in a stable grid above the detail sections.
- Funnel and top lists may sit side by side on wider desktop, but must preserve the same reading order as the required information order.
- Tables/lists must be scan-friendly with right-aligned numeric counts, short labels, and secondary caveat text.
- Avoid nested cards, decorative chart containers, gradient/orb backgrounds, and heavy chart-library visuals.
- If visual bars are useful, use lightweight CSS progress rows only.

Mobile and tablet layout requirements:

- Use one column in the same priority order as desktop.
- Do not require horizontal scrolling for tables.
- Convert top lists into compact rows/cards with label, count, and one optional secondary line.
- Range controls must remain a small segmented control or compact select; they must not become a large filter panel in V1.
- KPI cards must keep stable dimensions and readable text; long event/product/route labels must wrap or truncate with accessible full-label text.
- Primary support/retry action must remain visible without pushing the data health state out of view.

Readability and formatting requirements:

- Counts use localized readable grouping such as `1,234`.
- Percentages use whole percentages unless precision materially changes the decision.
- Dates use human-readable freshness such as `Today 14:31` or `2 days ago`; raw ISO timestamps are reserved for tooltips, details, or test fixtures.
- Unknown values render as `Unknown event`, `Unknown route`, `Unknown product`, or `Not counted`.
- Capped values show a visible caveat near affected metrics, not only at page bottom.
- Labels must not be analytics identity; stable event/route/product IDs remain the source of truth.
- Copy must stay short and operational. Do not add visible tutorial text, keyboard shortcut explanations, or product marketing language.
- Text must fit on desktop and mobile without overlapping, clipped button labels, or incoherent wrapping.

Required trust states:

- `Fresh`: schema is ready and `lastEventAt` is inside the expected recent window.
- `Quiet`: schema is ready but no recent events exist; explain that this may mean low traffic or missing instrumentation.
- `Capped`: read hit `rowCap`; explain that totals are bounded and not complete.
- `Schema missing`: migration/setup is not ready; show deterministic setup/support guidance.
- `No data yet`: schema is ready but no matching events exist for the selected range.
- `Fetch failed`: show retry and a short support diagnostic without raw error payloads.

Interaction requirements:

- Default range is `30` days.
- Range options should be the existing bounded contract, for example `7`, `30`, and `90` days.
- Range changes update dashboard data only; they must not write analytics rows, browser tracking state, or admin preferences.
- Retry refetches the same selected range.
- No edit, delete, export, raw-event drilldown, or custom dashboard-builder interaction ships in V1.

Test and screenshot evidence required for this contract:

- Component/view-model tests for desktop/mobile-friendly rendering order where practical.
- Tests for unknown event, route, and product labels.
- Tests for capped, schema-missing, no-data, quiet/fresh, and fetch-failed states.
- Tests or deterministic assertions that raw payload keys/values are not rendered.
- Screenshot handoff must include desktop, mobile or tablet, and at least one non-happy state (`empty`, `capped`, `schema-missing`, or `fetch-failed`).

## Data Placement And Sync Contract

- Server-canonical:
  - `analytics_events` rows and `/api/admin/analytics/insights` aggregate response.
- Local/browser:
  - Selected range/filter UI state only; no analytics visitor ID, public tracking storage, event mutation, or persisted admin preference is added in this slice.
- Sync policy:
  - Dashboard fetches current bounded aggregate data on load and when range changes.
  - Failed reads show retry; they do not mutate events or infer fallback counts.
- Retention and sensitivity:
  - Existing retention gap remains deferred.
  - Dashboard must never display raw payload JSON, raw URLs, emails, IPs, user agents, tokens, notes, cart details, payment/shipping details, or visitor identifiers.
- Cache/invalidation:
  - Dashboard and insights route use no-store/dynamic reads.
  - Freshness is communicated with `generatedAt` and `lastEventAt`; stale/missing data is an admin-visible caveat, not hidden state.

## Identity And Rename Contract

- Canonical stable IDs:
  - Event identity: `event_name`.
  - Route identity: `route_template`.
  - Product identity: `product_id` and `product_type` when present.
  - User counts: aggregate `uniqueKnownUsers`; public aggregate traffic stays unlinked from `user_id`.
- Human-readable identifiers:
  - Dashboard labels and Help/Guide copy are display-only and may be renamed without changing metric identity.
- Mutability rules:
  - Event names, route templates, and product IDs remain stable analytics contract values.
  - Labels can be renamed in place when the underlying event/product/route meaning is unchanged.
- Rename vs repurpose:
  - Materially different business meaning requires a new event/dimension mapping and tests, not a label rename.
- Compatibility contract:
  - Deprecated/historical values may remain visible as rows.
  - Unknown values render as safe generic labels and do not fall back to raw payload fields.
- Observability and repair:
  - Dashboard caveats expose capped reads, missing schema, no data, and last-event freshness so support can separate broken ingestion from quiet traffic.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Analytics event names, route templates/categories, product IDs/types, funnel steps, date ranges, admin navigation surfaces, metric labels, Help/Guide assertions, and future export/rollup modules.
- Source of truth:
  - Dashboard data comes from `/api/admin/analytics/insights`.
  - Event names come from the typed analytics event contract.
  - Route/product dimensions come from sanitized persisted rows and canonical public analytics/catalog payloads.
- Additive behavior:
  - New approved events should appear in generic event-count tables automatically once the existing insights endpoint returns them.
  - New route templates and product IDs should appear in generic route/product rows without dashboard code changes.
  - New safe funnel rows can be added behind the existing view-model without changing stored payload privacy rules.
- Explicit mapping requirements:
  - New KPI modules, route-category-specific copy, CSV/export formats, materialized rollups, retention cleanup, finance-grade reporting, vendor analytics, public-to-user profile bridge, or ad attribution require a separate brief, tests, docs, and owner decision.
- Unknown or deprecated values:
  - Unknown events/products/routes render with safe generic labels such as `Unknown event`, `Unknown product`, or `Unknown route`.
  - Unsafe/missing dimensions are `not counted` rather than displayed as raw payload data.
  - Invalid event names remain rejected upstream.
- Test/evidence:
  - Include future/unknown-value fixtures for event, route, and product rows.
  - Include tests proving no raw payload field is rendered.
  - Run route/label/support sweep for dashboard route/nav/help labels before broad gates.

## Scope

- Implementation scope:
  - Add an admin-only read-only Analytics tab in the existing admin workspace.
  - Add `/admin/analytics` as an alias into the Analytics tab.
  - Add admin navigation entry consistent with current admin workspace IA.
  - Render existing admin insights data: total events, latest event, known users, public/client/server split, funnel, top events, top routes, top products, row cap/capped/freshness/schema caveats.
  - Add local range control for existing allowed `rangeDays` values.
  - Add loading, empty, schema-missing, error, retry, and capped states.
  - Implement the `Dashboard UX / Readability Contract` above for desktop, tablet/mobile, formatting, trust states, and no-horizontal-scroll behavior.
  - Hide the redundant global mobile bottom navigation on admin routes so long admin tab lists and analytics content are not covered by fixed mobile chrome.
  - Update Help/Guide/API or runbook notes for interpreting the dashboard.
  - Add focused tests and screenshot handoff.

## Out Of Scope

- New analytics vendors, third-party scripts, pixels, tag managers, cookies, visitor IDs, localStorage tracking, heatmaps, session replay, ad retargeting, or public-to-user bridge.
- New analytics persistence schema, migrations, RLS changes, materialized rollups, retention cleanup jobs, or archival policy.
- CSV export, BI warehouse, finance-grade reporting, revenue recognition, Stripe reconciliation, payout reporting, or invoice/refund workflows.
- Editing analytics events, deleting rows, changing event taxonomy, or admin CRUD for analytics.
- New commercial CTA placement rules, funnel experimentation, or workout-builder funnel implementation.
- Public page changes, SEO changes, or AI-discoverability changes.

## Acceptance Criteria

1. Admin viewer+ can open the read-only analytics dashboard; unauthenticated/forbidden users fail closed.
2. Dashboard renders the existing insights contract without raw JSON inspection.
3. Dashboard clearly shows `schemaReady: false`, empty data, capped data, stale/missing last event, fetch error, and retry states.
4. Dashboard never renders unsafe payload fields, raw URLs, emails, IPs, user agents, visitor IDs, notes, cart details, shipping/payment data, or raw payload JSON.
5. Date-range switching uses bounded allowed values and never writes analytics state.
6. New/unknown event, route, and product values render safely in generic lists.
7. Desktop and mobile/tablet layouts preserve the required information order, avoid horizontal overflow, and keep metric/list text readable.
8. Help/Guide or runbook content explains what the dashboard can and cannot be used for.
9. Screenshot handoff is owner-approved or explicitly waived before `verify:pre-pr`.

## Validation

- Brief creation:
  - `npm run lint:briefs:all`
- Later implementation:
  - targeted unit/component tests for analytics dashboard view-model and states
  - targeted readability/layout assertions for required information order, unknown values, capped caveats, and no raw payload rendering
  - targeted route/auth tests for admin-only access where touched
  - Help/Guide assertion updates if Help/Guide content changes
  - screenshot handoff with `after/reference` artifacts before `npm run verify:pre-pr`
  - `npm run lint:briefs`
  - `npm run lint:quality-gates`
  - `npm run typecheck`
  - `git diff --check`
  - `npm run verify:pre-pr`
  - PR CI
  - `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin?tab=analytics`
  - `http://127.0.0.1:3000/admin/analytics` as alias/redirect check
  - desktop Chromium and Safari/WebKit-equivalent where practical
  - mobile/tablet viewport screenshot proving single-column order and no horizontal table overflow
- Vercel preview:
  - verify protected admin route access, dashboard loading, and no raw payload rendering.

## Screenshot Handoff Requirement

Required because the implementation changes visible admin UI.

- Capture folder: `output/admin-analytics-dashboard-read-only-v1-YYYY-MM-DD-HHMMSS`.
- Handoff type: `after/reference`.
- Required examples:
  - `after-admin-analytics-dashboard-desktop.png`
  - `after-admin-analytics-dashboard-mobile.png` or tablet if mobile admin access is intentionally secondary
  - `reference-admin-workspace-desktop.png`
  - one non-happy state: `after-admin-analytics-dashboard-empty-desktop.png`, `after-admin-analytics-dashboard-capped-desktop.png`, `after-admin-analytics-dashboard-schema-missing-desktop.png`, or `after-admin-analytics-dashboard-fetch-failed-desktop.png`
- Screenshot approval stop: stop after screenshot handoff and wait for owner approval or visual corrections before `npm run verify:pre-pr`.

## Help / Guide Impact

Required. This slice adds a visible admin analytics workflow and dashboard labels. Update admin Help/Guide or a closely linked runbook with:

- what the dashboard shows,
- what it intentionally cannot prove,
- how to interpret capped, empty, stale, or schema-missing data,
- why revenue-proxy counts are not finance reconciliation,
- why anonymous public traffic is not linked to user profiles.

Add or update at least one assertion/test that protects the Help/Guide contract if the existing test surface supports it.

## Route / Label / Support Surface Sweep

Required before the first broad gate because this adds a route/nav/support surface.

Search at minimum:

- `/admin/analytics`
- `Admin Analytics`
- `analytics dashboard`
- `admin analytics`
- `/api/admin/analytics/insights`
- `analytics_events`
- `rangeDays`
- `rowCap`
- `capped`
- `schemaReady`
- `revenue proxy`
- `finance reconciliation`

Check at minimum `app/`, `components/`, `tests/`, `docs/api-contracts.md`, `docs/runbooks/`, Help/Guide sources, and active/planned/deferred analytics briefs.

- Executed sweep on `2026-06-09`.
- Identifiers searched: `/admin/analytics`, `Admin Analytics`, `analytics dashboard`, `admin analytics`, `/api/admin/analytics/insights`, `analytics_events`, `rangeDays`, `rowCap`, `capped`, `schemaReady`, `revenue proxy`, `Stripe reconciliation`, `not linked to user profiles`, `ADMIN_TAB_VALUES`, `TAB_LABELS`, `ADMIN_HELP_QUICK_ACTIONS`, `DASHBOARD_TABS`, `RUNBOOK_LINKS`, `CONNECTED_SERVICES`, `ADMIN_WORKSPACE_MODULE_BOUNDARIES`, `parseAdminTab`, `AdminWorkspace`, and broad `analytics`.
- Directories/surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/api-contracts.md`, `docs/runbooks/`, active/deferred/planned/done task briefs, admin Help/Guide source/tests, admin workspace source/tests, and analytics API/helper source/tests.
- Fallout handled: added `/admin/analytics` alias, Analytics admin tab wiring, admin workspace boundary metadata, Help/Guide tab/service/workflow/troubleshooting copy, API contract notes, parent analytics brief pointer, targeted unit/component assertions, and admin-only mobile chrome hiding to prevent overlay on long admin tab/dashboard content. No public route, SEO, cookie/privacy policy, analytics collection, Stripe/finance, migration, workflow, or support-runbook behavior change was required for this read-only dashboard slice.

## Security, Privacy, And Compliance

- Route and data access must fail closed to admin viewer+.
- No secrets, env values, raw Supabase credentials, or raw event payloads may be committed or displayed.
- Dashboard must preserve the V1 privacy boundary:
  - no cookies,
  - no visitor ID,
  - no public anonymous to user-profile bridge,
  - no raw URL/referrer/IP/User-Agent display,
  - no email/payment/shipping/cart/note/private training content display.
- Privacy/cookie policy pages do not need updates unless the implementation changes collection behavior, vendor usage, browser storage, or public tracking copy.

## Observability And KPI Contract

- Dashboard KPIs:
  - total accepted events,
  - latest event timestamp,
  - public aggregate vs known-user/server-client split,
  - funnel counts and conversion where already defined by the insights endpoint,
  - top event/route/product counts,
  - capped and schema-ready status.
- Success threshold:
  - admin can answer whether analytics is collecting recent safe events and where the main public/commerce activity appears without inspecting raw JSON.
- Failure threshold:
  - schema missing, no events, capped reads, and fetch errors are visible and actionable.

## Design And Usability Done Bar

- Desktop and mobile screenshots prove the same core hierarchy:
  - data health,
  - KPI strip,
  - funnel,
  - top lists,
  - caveats.
- No mobile table requires horizontal scrolling.
- No button, filter, KPI, list row, caveat, or heading has clipped or overlapping text.
- Dashboard uses at most lightweight CSS bars/progress rows; no new chart dependency ships in V1.
- Admin can answer these questions in under one minute from the first screen:
  - Is analytics collecting recent safe events?
  - Is the schema ready?
  - Are counts capped?
  - What are the highest-volume events/routes/products?
  - Where is the commerce funnel dropping?
  - What should not be treated as finance truth?

## Session Continuity And Recovery

- Canonical source of truth:
  - this brief path and the implementation branch once created.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Git Rhythm Defaults

- Implementation flow:
  - branch created from clean synced `main`,
  - this brief moved to `in-progress`,
  - implement in one bounded UI/API-doc/test slice,
  - pause after screenshot handoff,
  - after owner approval, run `npm run verify:pre-pr`,
  - commit, push, open/update PR, monitor CI,
  - run `npm run verify:pre-merge` before merge recommendation.

## Automation Mode

Automation-first after explicit implementation approval. The assistant owns implementation, tests, git, PR prep, CI monitoring, and merge-readiness summary unless blocked by sandbox approval, credentials, missing context that cannot be safely discovered, visual approval stop, or a real product decision.

## Branch Hygiene Defaults

- Post-merge:
  - sync `main`,
  - prune deleted refs,
  - run post-merge preflight,
  - complete any repo-managed docs-only closeout if surfaced and eligible,
  - perform mandatory chat-handoff assessment before starting another brief.

## PR Browser Rule

Use the repo-standard Safari PR flow, preferably `npm run pr:create:safari`, unless owner explicitly requests otherwise.

## Checkpoint Log

- `2026-06-09 | planned | created from clean synced main@c4da03ba after PR #1043 and repo-managed closeout PR #1044; scope is a future read-only admin UI over the existing privacy-safe insights endpoint, with no new vendor, cookies, visitor ID, retention, CSV, rollups, finance reporting, or public-to-user bridge | next: wait for owner to explicitly say execute/build/implement before moving to in-progress and creating the implementation branch`
- `2026-06-09 | in-progress | owner explicitly said implement; branch admin-analytics-dashboard-read-only-v1 created from main@c4da03ba with prior planned brief/parent docs changes carried forward; brief moved to in-progress | next: inspect admin workspace, analytics insights route, Help/Guide patterns, then implement UI/view-model/docs/tests`
- `2026-06-09 | implemented + screenshot stop | added read-only Analytics tab, /admin/analytics alias, dashboard view-model/component, admin mobile chrome polish, Help/Guide/API/parent brief updates, route-label-support sweep evidence, and targeted tests; local validation passed: targeted Vitest 6 files / 25 tests, npm run typecheck, npm run lint, npm run lint:briefs:all, npm run lint:quality-gates, slicewise Prettier check, git diff --check; screenshot handoff captured after/reference desktop/mobile/schema-missing artifacts in output/admin-analytics-dashboard-read-only-v1-2026-06-09-210601 using a temporary visual harness that was removed after capture | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-09 | screenshot approved | owner approved the after/reference screenshot handoff; no product-rendering files changed after capture | next: run npm run verify:pre-pr before commit/push/PR`
- `2026-06-09 | pre-pr gate passed | npm run verify:pre-pr passed full lane after rerunning an unrelated habit-perfect-day unit flake that passed in targeted isolation; branch remained current with origin/main c4da03ba | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
