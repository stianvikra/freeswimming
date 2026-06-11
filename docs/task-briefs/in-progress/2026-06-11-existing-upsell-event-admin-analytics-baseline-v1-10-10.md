# Task Brief: Existing Upsell Event Admin Analytics Baseline V1 (10/10)

## Metadata

- `id`: `2026-06-11-existing-upsell-event-admin-analytics-baseline-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-11`
- `updated`: `2026-06-11`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-10-workout-context-upsell-placement-policy-v1-10-10.md`
  - `docs/architecture/workout-context-upsell-placement-policy.md`
- `related_briefs`:
  - `docs/task-briefs/done/2026-06-09-workout-builder-funnel-instrumentation-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-funnel-dashboard-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-source-breakdown-dashboard-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-template-usage-admin-analytics-mapping-v1-10-10.md`
- `execution_mode`: `end-to-end-after-explicit-implement`
- `branch`: `existing-upsell-event-admin-analytics-baseline-v1`

## Brief Audit Record

- `last_audited`: `2026-06-11`
- `base`: clean synced `main@13b3b072` after PR `#1067` closed the workout-context upsell placement policy closeout and `npm run post-merge:preflight` was clean.
- `audit_status`: `ready`
- `decision`: Execute this as the bounded child after the owner explicitly requested `xecute Existing Upsell Event Admin Analytics Baseline V1`.
- `reason`: Existing `upsell_presented`, `upsell_accepted`, and `upsell_declined` events already describe current `/plans` and My Library commercial surfaces, while the placement policy forbids inferring workout-context CTA performance, checkout completion, entitlement truth, or finance results from adjacent workout telemetry. A read-only Admin Analytics baseline can clarify today's commercial signals before any workout-context CTA runtime work.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, the task brief template, scorecard categories, analytics event taxonomy, `analytics_events` persistence/extraction, `/api/admin/analytics/insights`, `lib/analytics/admin-insights.ts`, `lib/analytics/admin-dashboard.ts`, `components/admin/AdminAnalyticsDashboard.tsx`, `components/analytics/TrackCheckoutCancel.tsx`, `components/my-library/CheckoutButton.tsx`, `app/plans/page.tsx`, `components/my-library/MyLibraryHub.tsx`, product catalog helpers, checkout/Stripe contracts, Admin Help/Guide contracts, screenshot handoff rules, or route/label/support sweep rules change.

## Goal

Add a read-only Admin Analytics baseline for existing `upsell_*` events so the owner can see today's commercial CTA visibility and intent signals without adding workout-context CTA behavior or treating product telemetry as checkout, entitlement, or finance truth.

## Pre-Implementation Owner Explanation

Vi lager en avgrenset Admin Analytics-baseline for `upsell_*`-hendelsene som allerede finnes pa `/plans` og My Library. Det gir et tryggere bilde av dagens kommersielle flater for vi vurderer workout-context CTA. Utenfor scope er ny workout-CTA, nye event-navn eller callsites, checkout-/Stripe-endringer, entitlement, finance, export, tredjeparts analytics, raw drilldown og builder/generator UX.

Forward-compatibility-intent: nye CTA-flater, produkt-ID-er og workout-context placements skal bare telle i en dedikert modul nar de er eksplisitt mappet med tester og support-kopi. Ukjente eller umappede values skal fa trygg unknown/fail-closed behandling, ikke bli tolket som konvertering.

## Product Questions

This child answers only these implementation questions:

1. How many existing `upsell_presented`, `upsell_accepted`, and `upsell_declined` events happened in the selected Admin Analytics range?
2. How should current `plans` and `library_explore` sources be shown without implying checkout completion, entitlement grant, revenue, or finance reconciliation?
3. How should zero, duplicate, capped, schema-missing, stale, unknown-surface, unknown-product, and failed-read states be described for admin/support?
4. Which future CTA placements or products must require explicit mapping before they can appear in a dedicated commercial baseline module?

## Planned Product Decision

If executed, this child should implement only a read-only Admin Analytics baseline for existing events and current commercial surfaces:

- Count `upsell_presented`, `upsell_accepted`, and `upsell_declined` from persisted first-party analytics rows.
- Treat `upsell_presented` as commercial surface visibility, not checkout start.
- Treat `upsell_accepted` as user click/intent, not checkout completion.
- Treat `upsell_declined` as the existing checkout-cancel return signal, not a complete measure of all users who ignored or dismissed an offer.
- Prefer safe `source` payload values for surface mapping:
  - `plans`
  - `library_explore`
  - `unknown`
- Use `surface` only as a safe fallback where current events provide it.
- Keep product identity tied to existing safe product/catalog analytics extraction, not button text.
- Do not add workout-context placement IDs, runtime CTA UI, new `upsell_*` meanings, checkout attribution, entitlement targeting, or finance reporting.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Commerce and revenue ops
- Finance and reporting operations
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                | Evidence                                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin Analytics gains one clearly labeled existing-upsell baseline that separates current commercial surfaces from future workout-context CTA work.                                               | view-model/component tests + screenshot handoff + Help/Guide copy          | `5/5`                   |
| UX flow clarity                               | `target`     | The dashboard panel explains presented, accepted, declined/cancelled, and rates without dead ends or misleading conversion language.                                                              | component tests + screenshot review                                        | `5/5`                   |
| Visual design quality                         | `target`     | The panel reuses existing Admin Analytics cards/KPI/list styling, fits desktop/mobile, and has no clipped or overlapping text.                                                                    | after/reference screenshot artifacts                                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Counts only `upsell_presented`, `upsell_accepted`, and `upsell_declined`; ratios define zero denominator behavior and never infer unique users, checkout, entitlement, revenue, or finance truth. | admin-insights/view-model tests with zero, duplicate, unknown, capped data | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: this is read-only Admin Analytics, not an admin editor or placement config workflow.                                                                                             | admin scope rationale + unchanged edit flows                               | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Changed Admin Analytics headings, lists, status text, and range states remain semantic, keyboard reachable, and screen-reader friendly.                                                           | Testing Library assertions + screenshot/manual review                      | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: reuse existing endpoint/view-model and add no chart library, vendor script, route, or dependency.                                                                                | package diff + build/perf gate                                             | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical analytics rows remain the only source; payload inspection is server-side and only safe low-cardinality aggregates reach Admin UI.                                                | data contract review + unsafe-field tests                                  | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Admin insights remain `no-store`; range changes refetch the same bounded endpoint with no new cache or background job.                                                                            | route/cache review + existing endpoint tests                               | `5/5`                   |
| Reliability and failure handling              | `target`     | Zero, capped, stale, schema-missing, unknown, and failed-read states render deterministic trust/caveat text and do not produce unexpected `500` behavior.                                         | negative-path unit/component tests                                         | `5/5`                   |
| Security and authz                            | `target`     | No public or user route access is widened; existing protected Admin Analytics endpoint remains fail-closed for unauthorized reads.                                                                | auth boundary review + existing/targeted negative-path tests               | `5/5`                   |
| Privacy and compliance                        | `target`     | Admin UI must not expose raw payload JSON, raw URLs, emails, user IDs, visitor IDs, IPs, user agents, Stripe IDs, payment details, workout content, or free text.                                 | payload-filter tests + route/support sweep                                 | `5/5`                   |
| Content governance                            | `target`     | Admin labels, Help/Guide copy, API caveats, parent checkpoint, and support interpretation all state what the baseline does and does not mean.                                                     | docs/help updates + route/label/support sweep                              | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no editable placement config, role workflow, publish flow, or support mutation ships in this baseline.                                                                           | admin workflow scope rationale                                             | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes protected Admin Analytics only and adds no public route, metadata, sitemap, robots, canonical URL, structured data, or crawlable content.                                | explicit SEO scope rationale                                               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this adds no public semantic page, public docs page, structured data, or AI-facing crawl surface.                                                                                     | explicit AI-discoverability scope rationale                                | `N/A`                   |
| Analytics and KPI observability               | `target`     | The module surfaces existing upsell visibility/intent/cancel signals with caveats and no inferred checkout, entitlement, revenue, or unique-user conversion.                                      | admin-insights/view-model/component tests + Help/Guide assertions          | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Current commercial signals stay separate from checkout start, checkout completion, entitlement grants, Stripe reconciliation, and product catalog truth.                                          | commerce boundary tests/review + API docs                                  | `5/5`                   |
| Incident response and support operations      | `target`     | Support can explain missing, unknown, stale, capped, and cancelled-return states without raw event drilldown or payment data.                                                                     | Help/Guide/runbook copy + route/support sweep                              | `5/5`                   |
| Finance and reporting operations              | `target`     | No upsell baseline value is described as revenue, refund, payout, invoice, accounting export, or Stripe reconciliation evidence.                                                                  | finance caveat in Admin/Help/API docs + tests for label text               | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: labels remain short/display-only and surface/product IDs remain locale-independent for later localization.                                                                       | copy review + identity contract                                            | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js, TypeScript, Admin Analytics endpoint, view-model, UI primitives, and tests; add no dependency, migration, vendor, or new route.                                           | changed-files/package diff + code review                                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused insight, view-model, component, unsafe-field, unknown-value, and screenshot evidence before `verify:pre-pr`; run pre-merge gate before merge.                                         | targeted tests + screenshots + `verify:pre-pr` + CI + `verify:pre-merge`   | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Aggregation stays bounded to existing range-capped rows and low-cardinality dimensions; no per-user/per-workout drilldown or warehouse/export path is introduced.                                 | query/row-cap review + tests                                               | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration, provider, env, secret, or checkout runtime change; rollback is a revert of dashboard/view-model/docs/tests.                                                                         | PR rollback note + verify gates                                            | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `components/admin/AdminAnalyticsDashboard.tsx` and the existing panel/card/list patterns.
  - Keep the dashboard read-only inside the existing Admin Analytics route and endpoint.
  - Do not add a new route, tab, chart dependency, modal, placement editor, or runtime CTA surface.
- TypeScript/domain contracts:
  - Use existing typed `ANALYTICS_EVENT_NAMES` event names.
  - Add narrow typed view-model helpers in `lib/analytics/admin-dashboard.ts`.
  - Add aggregation in `lib/analytics/admin-insights.ts` without exposing raw payload JSON.
  - Define ratio behavior for zero denominators and duplicate client events.
  - Safely map current low-cardinality source values: `plans`, `library_explore`, and `unknown`.
- Supabase/data layer:
  - Use existing `analytics_events` rows and bounded admin insight reads.
  - No migration, index, RLS policy, generated type update, storage object, rollup job, raw drilldown, or export path.
  - Protected admin reads must keep existing fail-closed behavior.
- External services/tools:
  - No Stripe API, checkout flow, webhook, idempotency, SDK, secret, vendor analytics, tag manager, cookie, consent banner, or finance provider change.
  - Existing checkout/Stripe events may be referenced only as interpretation boundaries.
- UI system:
  - Reuse current Admin Analytics visual language, `AdminManagerState` trust states, metric cards, lists, and caveat text.
  - Screenshot handoff type: `after/reference`, comparing the new baseline panel to the existing Admin Analytics funnel/workout-builder panels.
  - Owner screenshot approval is required before `npm run verify:pre-pr` if this child is executed.
- Testing:
  - Unit tests for admin insights aggregation, safe source/product mapping, zero denominators, duplicate events, unknown values, and unsafe payload filtering.
  - View-model tests for labels, rates, empty/capped/schema-missing/stale states, and caveats.
  - Component tests for rendered panel semantics and no misleading conversion/finance labels.
  - Screenshot artifacts for desktop, mobile, and at least one no-data or schema/trust state when practical.

## Data Placement And Sync Contract

- Server-canonical:
  - Existing persisted `analytics_events` rows remain the source of truth.
  - Existing product/catalog/checkout/entitlement/finance sources remain separate and are not joined into this baseline.
- Local/browser:
  - No browser analytics identity, cookie, visitor ID, localStorage attribution, admin preference, or user-to-public bridge is added.
  - Existing client-side `upsell_*` emission remains best-effort and may duplicate.
- Sync behavior:
  - Admin reads remain bounded aggregate reads from `/api/admin/analytics/insights`.
  - Range changes refetch the same endpoint.
  - Duplicate client events are counted as events and caveated as not unique-user conversion.
- Retention and sensitivity:
  - Existing analytics retention/rollup lifecycle applies.
  - Raw payload JSON, raw URLs/referrers, emails, user IDs, visitor IDs, IPs, user agents, Stripe IDs, payment data, workout content, support messages, and free text must not reach Admin UI.
- Cache/invalidation:
  - Analytics ingestion and Admin Analytics reads remain `no-store`.
  - No new cache, revalidation tag, stale runtime config, or background aggregation job is introduced.

## Identity And Rename Contract

- Canonical stable IDs:
  - Event identity is the append-only event name: `upsell_presented`, `upsell_accepted`, `upsell_declined`.
  - Current commercial surface identity is the safe source/surface value, primarily `plans` and `library_explore`.
  - Product identity comes from existing safe analytics/product catalog extraction, not visible button copy.
- Human-readable identifiers:
  - Dashboard labels, CTA copy, product names, and Help/Guide text are display-only and may be renamed when meaning is unchanged.
- Mutability rules:
  - Existing event names and meanings are not changed by this child.
  - Counting a new action under an existing event or changing what `declined` means is repurpose and requires a new child.
- Rename vs repurpose:
  - Label-only clarity changes are renames.
  - Moving a CTA into workout context, adding a new placement ID, treating checkout cancel as full decline rate, or treating `accepted` as checkout completion is repurpose and requires explicit owner mapping.
- Compatibility contract:
  - Unknown, deprecated, disabled, or unmapped source/product values must render as safe unknown states or be excluded from dedicated known-surface rates with a caveat.
  - Future workout-context placement IDs require mapping before they appear in the dedicated baseline module.
- Observability and repair:
  - Unknown safe values should be countable as unknown aggregates for support, without raw payload drilldown.
  - Schema-missing, failed-read, stale, capped, and no-data states must remain visible.

## Forward Compatibility Contract

- Extensibility surfaces:
  - CTA event names, source/surface values, placement IDs, product IDs, catalog availability, checkout events, entitlement states, route templates, dashboard KPI modules, Help/Guide copy, locales, export formats, vendor forwarding, and finance/reporting surfaces.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Current source/surface values come from sanitized event payloads and analytics extraction.
  - Product identity comes from existing product/catalog analytics contracts.
  - Checkout truth comes from checkout events and Stripe/webhook contracts, not `upsell_*` events.
  - Finance truth comes from Stripe/accounting reconciliation contracts, not Admin Analytics product telemetry.
- Additive behavior:
  - New known event rows continue to appear in generic top-event lists automatically.
  - Existing `plans` and `library_explore` source values should continue to populate the baseline if current event meanings remain unchanged.
  - Safe unknown source/product values should render as unknown aggregate states rather than disappear silently.
- Explicit mapping requirements:
  - New workout-context placements, new product purchase models, new `upsell_*` meanings, new CTA source values, checkout attribution, entitlement-aware targeting, finance reporting, raw drilldown, CSV/export, vendor analytics, and localized commercial claims require explicit owner mapping, docs, and tests before release.
- Unknown or deprecated values:
  - Unknown or deprecated placement/product/source values must not imply CTA conversion.
  - Unknown values may be shown only as safe aggregate diagnostics and must be excluded from known-surface-specific rates unless a later child maps them.
- Test/evidence:
  - Future implementation must include fixtures for `plans`, `library_explore`, unknown source, unknown product, zero presented, duplicate accepted, checkout-cancel declined, capped rows, schema-missing, and unsafe payload fields.
  - Run route/label/support sweep for event taxonomy, Admin Analytics labels, Help/Guide, API docs, checkout interpretation, finance wording, and the parent brief.

## Help / Guide Impact

Planned brief creation: no visible Help/Guide change.

Execution: Admin Help/Guide or linked runbook must be updated because visible Admin Analytics labels and support interpretation will change.

If executed, this child must update Admin Help/Guide or linked runbook text for:

- what `upsell_presented`, `upsell_accepted`, and `upsell_declined` mean,
- what they do not mean: unique users, checkout completion, entitlement, revenue, Stripe reconciliation, or finance truth,
- how zero, duplicate, capped, schema-missing, stale, unknown, and failed-read states should be interpreted,
- why workout-context CTA performance is absent until a later mapped runtime child exists.

## Screenshot / Visual Impact

Required if this child is executed because it changes visible Admin Analytics UI.

- Capture folder: `output/existing-upsell-event-admin-analytics-baseline-v1-YYYY-MM-DD-HHMMSS`.
- Handoff type: `after/reference`.
- Required examples:
  - `after-existing-upsell-baseline-desktop.png`
  - `after-existing-upsell-baseline-mobile.png`
  - `after-existing-upsell-baseline-empty-or-trust-state-desktop.png`
  - `reference-admin-analytics-commercial-funnel-desktop.png`
- Screenshot approval stop: stop after screenshot handoff and wait for owner approval or visual corrections before `npm run verify:pre-pr`, PR creation, or `npm run verify:pre-merge`.

Screenshot evidence on `2026-06-11`:

- Artifact folder: `output/existing-upsell-event-admin-analytics-baseline-v1-2026-06-11-074931`
- Captured: `2026-06-11 07:49` local time
- Handoff type: `after/reference`
- Files captured:
  - `after-existing-upsell-baseline-desktop.png`
  - `after-existing-upsell-baseline-mobile.png`
  - `after-existing-upsell-baseline-empty-or-trust-state-desktop.png`
  - `reference-admin-analytics-commercial-funnel-desktop.png`
- Capture note: protected `/admin` requires a real admin session locally, so artifacts were captured through a temporary local screenshot harness that imported the same `AdminAnalyticsDashboard` component and stubbed only `/api/admin/analytics/insights`; the harness and capture script were removed after artifact generation.
- Owner approval status: approved in chat on `2026-06-11`; proceed to `npm run verify:pre-pr`, PR prep, CI, and pre-merge validation.

## Route / Label / Support Surface Sweep

Required before broad gates if this child is executed because it changes Admin Analytics labels, dashboard modules, Help/Guide interpretation, and commercial/support wording.

Search at minimum:

- `upsell_presented`
- `upsell_accepted`
- `upsell_declined`
- `checkout_started`
- `checkout_completed`
- `entitlement_granted`
- `Stripe`
- `finance`
- `revenue`
- `Admin Analytics`
- `Help/Guide`
- `library_explore`
- `plans`
- `workout-context`
- `CTA`

Check at minimum:

- `app/`
- `components/`
- `components/admin/`
- `components/analytics/`
- `components/my-library/`
- `lib/analytics/`
- `lib/commerce/` and `lib/admin/products.ts` as the current product/commerce catalog paths
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- active/planned/done workout, analytics, commerce, checkout, Stripe, finance, and AW-006 briefs.

Sweep evidence on `2026-06-11`:

- Command: `rg -n "upsell_presented|upsell_accepted|upsell_declined|checkout_started|checkout_completed|entitlement_granted|Stripe|finance|revenue|Admin Analytics|Help/Guide|library_explore|plans|workout-context|CTA" app components components/admin components/analytics components/my-library lib/analytics lib/commerce lib/admin/products.ts tests docs/api-contracts.md docs/architecture docs/runbooks docs/task-briefs/planned docs/task-briefs/in-progress docs/task-briefs/done`
- Findings: required fallout is limited to Admin Analytics aggregation/view-model/UI, Admin Help/Guide interpretation, API contract caveats, targeted analytics tests, this active child brief, and the parent checkpoint.
- No runtime workout-context CTA, new event callsite, checkout, Stripe, entitlement, finance, vendor analytics, export, raw drilldown, migration, RLS, product catalog mutation, route, or builder/generator UX change is required for this slice.

## Scope

- Create read-only Admin Analytics insight/view-model/UI support for existing `upsell_*` events.
- Add safe current-surface/source aggregation for `plans`, `library_explore`, and unknown.
- Add caveats for duplicate client telemetry and checkout-cancel-only decline semantics.
- Update Admin Help/Guide/API docs and parent checkpoint if implementation proceeds.
- Add targeted unit/component tests and screenshot handoff if implementation proceeds.

## Out Of Scope

- Runtime workout-context CTA UI.
- New `upsell_*` event names or changed meanings.
- New event callsites for builder/generator/workout review.
- Checkout, Stripe, webhook, entitlement, catalog mutation, pricing, finance, refunds, payouts, invoices, or accounting export changes.
- Third-party analytics/vendor forwarding.
- Raw event drilldown, CSV/export, warehouse, rollup job, migration, RLS, generated DB type update, or new admin editor.
- Builder/generator UX, template usage, workout save behavior, or workout route changes.
- Treating `upsell_accepted` as checkout completion or `upsell_declined` as all non-converting users.

## Acceptance Criteria

1. Brief is moved to `docs/task-briefs/in-progress/` and parent brief points to it as the active child approved for implementation.
2. If executed, Admin Analytics shows existing upsell baseline totals and rates only from `upsell_presented`, `upsell_accepted`, and `upsell_declined`.
3. Current `plans` and `library_explore` sources are mapped explicitly; unknown safe values render as unknown/fallback without raw payload exposure.
4. Zero-denominator, duplicate, capped, schema-missing, stale, no-data, unknown, and failed-read states have deterministic labels and caveats.
5. The dashboard and Help/Guide copy do not imply unique-user conversion, checkout completion, entitlement, revenue, Stripe reconciliation, or finance truth.
6. No runtime workout-context CTA, checkout, Stripe, entitlement, finance, vendor, export, migration, RLS, raw drilldown, or builder/generator UX scope is added.
7. UI implementation, if later approved, includes screenshot handoff and owner approval before `npm run verify:pre-pr`.
8. Changed briefs pass `npm run lint:briefs`.

## Validation

Completed so far:

- `./node_modules/.bin/vitest run tests/unit/admin-analytics-insights.test.ts tests/unit/admin-analytics-dashboard-view-model.test.ts tests/unit/admin-analytics-dashboard.test.tsx` PASS (`3` files, `21` tests)
- `npm run typecheck` PASS
- `npm run lint:quality-gates` PASS
- `npm run lint:briefs:all` PASS, including this in-progress brief
- `git diff --check` PASS
- Route/label/support-surface sweep completed with findings recorded above
- owner screenshot approval: approved in chat on `2026-06-11`
- `npm run verify:pre-pr` PASS on `2026-06-11` (`artifacts/test-runs/20260611-085859/verify.log`; full lane with typecheck, unit tests, build, performance budgets, and Playwright)

Pending after PR creation:

- required PR CI checks
- `npm run verify:pre-merge`

## Session Continuity And Recovery

- Parent path: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Active child path: `docs/task-briefs/in-progress/2026-06-11-existing-upsell-event-admin-analytics-baseline-v1-10-10.md`
- Placement policy path: `docs/architecture/workout-context-upsell-placement-policy.md`
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this child and the parent brief, then continue from the latest checkpoint.

## Checkpoint Log

- `2026-06-11 | planned child created | created planned child brief from clean synced main@13b3b072 after PR #1067 closeout and clean post-merge preflight; implementation is not approved yet and must remain scoped to read-only Admin Analytics visibility for existing upsell events on current commercial surfaces | next: wait for owner implementation approval or scope edits`
- `2026-06-11 | child moved to in-progress | owner requested execution, branch existing-upsell-event-admin-analytics-baseline-v1 is active, and the child moved to docs/task-briefs/in-progress/2026-06-11-existing-upsell-event-admin-analytics-baseline-v1-10-10.md; scope remains read-only Admin Analytics visibility for existing upsell events and excludes runtime workout-context CTA, new event callsites/meanings, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, and builder/generator UX | next: audit existing Admin Analytics contracts and implement the baseline`
- `2026-06-11 | implementation validation before screenshot | implemented read-only existing upsell aggregation, Admin Analytics panel, Help/Guide/API-contract support copy, targeted tests, and route/label/support sweep evidence; targeted Vitest, typecheck, quality-gates, lint:briefs:all, and diff-check pass, with no runtime workout-context CTA, new event callsite, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, product catalog mutation, route, or builder/generator UX scope added | next: capture screenshot handoff and wait for owner approval before npm run verify:pre-pr`
- `2026-06-11 | screenshot approval stop | captured after/reference screenshot artifacts at output/existing-upsell-event-admin-analytics-baseline-v1-2026-06-11-074931 using the same AdminAnalyticsDashboard component with a temporary local harness removed after capture; no product rendering files changed after the final capture, and owner visual approval remains pending | next: wait for owner screenshot approval or visual corrections before npm run verify:pre-pr`
- `2026-06-11 | screenshots approved | owner approved the screenshot handoff in chat; no product rendering files changed after the final capture | next: run npm run verify:pre-pr`
- `2026-06-11 | pre-pr passed | child passed npm run verify:pre-pr full lane with typecheck, unit tests, build, performance budgets, and Playwright; scope still excludes runtime workout-context CTA, new event callsite, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, product catalog mutation, route, and builder/generator UX | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
