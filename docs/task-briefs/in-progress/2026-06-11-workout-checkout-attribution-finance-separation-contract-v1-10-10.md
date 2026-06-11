# Task Brief: Workout Checkout Attribution + Finance Separation Contract V1 (10/10)

## Metadata

- `id`: `2026-06-11-workout-checkout-attribution-finance-separation-contract-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-11`
- `updated`: `2026-06-11`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-measurement-contract-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-runtime-event-callsites-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-admin-analytics-mapping-v1-10-10.md`
  - `docs/architecture/workout-context-cta-measurement-contract.md`
  - `docs/architecture/external-service-contract-matrix.md`
  - `docs/architecture/data-access-authz-cache-contract-registry.md`
- `execution_mode`: `docs-contract-after-explicit-implement`
- `branch`: `workout-checkout-attribution-finance-separation-contract-v1`

## Brief Audit Record

- `last_audited`: `2026-06-11`
- `base`: clean synced `main@2be08770` after PR `#1075` closed the workout-context CTA Admin Analytics mapping brief and `npm run post-merge:preflight` was clean.
- `audit_status`: `ready`
- `decision`: Execute this docs-only contract child on branch `workout-checkout-attribution-finance-separation-contract-v1`.
- `reason`: The owner explicitly requested implementation after selecting this child. Workout-context CTA presentation/click telemetry and Admin Analytics mapping are complete, but checkout attribution, entitlement truth, Stripe reconciliation, and finance reporting remain intentionally separate. This child defines those boundaries before any new commerce implementation.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, the task brief template, scorecard categories, analytics event taxonomy, `ANALYTICS_EVENT_NAMES`, `analytics_events` schema/persistence, `/api/admin/analytics/insights`, Admin Analytics UI or Help/Guide contracts, `lib/commerce/catalog.ts`, checkout session route, Stripe webhook route, entitlement storage, finance reconciliation scripts, external service matrix, data-access/authz/cache registry, route/label/support sweep rules, or official Stripe Checkout/webhook/idempotency guidance changes.

## Goal

Create a docs-only contract that separates CTA/product telemetry, checkout attribution, entitlement truth, Stripe reconciliation, and finance reporting before any workout-context commerce implementation expands.

## Pre-Implementation Owner Explanation

Vi lager en kontrakt for hva som teller som produktinteresse, checkout-start, betalt ordre, tilgang og finance-sannhet. Det er viktig fordi klikk i Admin Analytics ikke skal tolkes som kjop, tilgang eller inntekt. Utenfor scope er runtime-kode, ny CTA, checkout-endringer, Stripe-webhooks, entitlement-endringer, priser, export, vendor analytics, raw drilldown og dashboard-endringer.

Forward-compatibility-intent: nye produkter, CTA-er, checkout-steg, entitlement-stater og finance-signaler skal enten falle inn i eksplisitte separate sannhetskilder eller kreve en ny mapping med tester, support-kopi og rollback-regler for de kan paverke dedikerte KPI-er.

## Product Questions

This child answers only these contract questions:

1. Which signal is allowed to mean CTA/product interest, and which signal may mean checkout handoff?
2. Which future event or route boundary may count checkout start, and why is it still not payment success?
3. Which server/provider signal may count checkout completion, and why is it still not full finance close?
4. Which storage surface owns entitlement truth, and why must analytics never grant or prove access?
5. Which Stripe/session/customer/invoice/payment fields are support or reconciliation evidence, and which must never enter client analytics payloads or Admin Analytics raw display?
6. Which future docs, tests, support diagnostics, and rollback rules are required before workout-context commerce code can ship?

## Implemented Contract Decision

This child creates a durable docs-only contract at:

- `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`

The contract keeps five layers separate:

| Layer                  | Source of truth                                                      | Allowed meaning                                                           | Not allowed to mean                                                                                  |
| ---------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| CTA/product telemetry  | first-party `analytics_events` with typed, sanitized dimensions      | A mapped surface rendered or a mapped CTA was clicked.                    | checkout start, checkout completion, entitlement, revenue, refund, payout, invoice, or finance truth |
| Checkout attribution   | checkout route/session creation contract                             | A checkout handoff/session was requested or created for a mapped product. | payment success, entitlement grant, invoice reconciliation, or revenue recognition                   |
| Payment/provider truth | Stripe Checkout/webhook/provider records                             | Provider-reported checkout/payment state for a session/customer/product.  | app entitlement correctness by itself, accounting close, or admin analytics conversion truth         |
| Entitlement truth      | server-canonical entitlement storage and repair/reconciliation flows | Which user/email/product access the app recognizes.                       | finance truth, refund state, payout state, or raw analytics truth                                    |
| Finance reporting      | Stripe/accounting reconciliation and finance exports/scripts         | Reconciled payment, invoice, refund, payout, and reporting evidence.      | CTA performance, unique-user conversion, or product UX success                                       |

Official Stripe Checkout, webhook signature, and idempotency docs were checked on 2026-06-11 for contract accuracy. Future checkout implementation should prefer the existing Stripe-hosted Checkout Session pattern unless a later child proves another official Stripe integration surface is safer for the product need. This child does not change the Stripe API, SDK, secrets, webhook, portal, entitlement, finance script, or checkout route.

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
- Incident response and support operations
- Finance and reporting operations
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                   | Evidence                                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Contract defines the next commerce decision boundary without expanding workout-context CTA runtime scope or confusing product interest with purchase/finance outcomes.               | architecture contract + parent checkpoint                               | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: no visible UI changes; future checkout/CTA children must preserve primary workout actions and clear handoff copy.                                                   | UI scope rationale + future screenshot rule                             | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because planned execution is docs-only and changes no rendered UI, CSS, assets, print/export artifact, screenshots, or product-rendering files.                                  | explicit visual scope rationale                                         | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Contract separates CTA, checkout, provider, entitlement, and finance truth with deterministic allowed/forbidden meanings and no inferred revenue or access state from analytics.     | contract layer table + route/label/support sweep                        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, mutable config, placement publishing, or content editing workflow changes in this docs-only contract.                                                   | explicit admin-editor scope rationale                                   | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no visible UI, focus behavior, labels, headings, keyboard flow, or screen-reader behavior changes.                                                                       | explicit a11y scope rationale                                           | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no runtime route, bundle, query, payload, image, font, dependency, or cache behavior changes.                                                                            | docs-only changed-files review                                          | `N/A`                   |
| Data placement and sync boundaries            | `target`     | Contract states which data is server-canonical, provider-canonical, finance-canonical, and best-effort analytics telemetry; browser/local state cannot own commerce truth.           | data placement section + external service matrix alignment              | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Contract requires later checkout/entitlement/dashboard children to define no-store/cache, invalidation, stale-state, retry, and repair behavior before runtime release.              | cache/invalidation contract                                             | `5/5`                   |
| Reliability and failure handling              | `target`     | Contract defines fail-closed behavior for unknown products, missing checkout config, provider failure, webhook delay, entitlement lag, reconciliation mismatch, and stale analytics. | failure/fallback matrix + support diagnostics                           | `5/5`                   |
| Security and authz                            | `target`     | Contract preserves fail-closed protected routes, server-only Stripe secrets/IDs, webhook verification, and negative-path requirements for future checkout/entitlement changes.       | security/authz section + registry references                            | `5/5`                   |
| Privacy and compliance                        | `target`     | Contract forbids raw Stripe IDs, checkout URLs, emails, payment details, invoices, user IDs, raw payload JSON, URLs/referrers, IPs, user agents, and free text in client analytics.  | forbidden data table + privacy sweep                                    | `5/5`                   |
| Content governance                            | `target`     | Contract updates durable architecture/parent planning surfaces so support and later child briefs inherit one interpretation of commerce telemetry boundaries.                        | architecture doc + parent checkpoint + lint:briefs                      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, editable placement, publish action, recovery action, or mutation state changes.                                                                       | explicit admin-workflow scope rationale                                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route, metadata, sitemap, robots, canonical URL, structured data, or crawlable product content changes.                                                        | explicit SEO scope rationale                                            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic page, public docs page, structured data, or AI-facing crawl surface changes.                                                                          | explicit AI-discoverability scope rationale                             | `N/A`                   |
| Analytics and KPI observability               | `target`     | Contract defines which KPI layers may be shown later and which labels/caveats must prevent Admin Analytics from implying checkout, entitlement, Stripe, revenue, or finance truth.   | KPI interpretation matrix + future mapping requirements                 | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Contract requires checkout attribution, product catalog identity, provider state, entitlement grants, and revenue operations to stay separately reconcilable.                        | commerce boundary section + external service contract alignment         | `5/5`                   |
| Incident response and support operations      | `target`     | Contract gives support deterministic language for checkout handoff, webhook delay, entitlement repair, reconciliation mismatch, and analytics-vs-finance interpretation.             | support/runbook impact section + sweep                                  | `5/5`                   |
| Finance and reporting operations              | `target`     | Contract states that finance reporting depends on Stripe/accounting reconciliation and exports, not CTA clicks, checkout-start counts, entitlement rows, or Admin Analytics modules. | finance boundary section + reconciliation references                    | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: machine IDs stay locale-independent and display labels remain renameable; localized checkout/support copy requires a later owner-approved child.                    | identity/rename contract                                                | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Docs-only child reuses existing architecture/task-brief/service-matrix patterns and adds no dependency, runtime route, migration, vendor, Stripe API, checkout, entitlement, or UI.  | changed-files review + package diff                                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass `npm run lint:briefs`; docs-only execution must also run docs-only/pre-pr gates before PR.                                                                       | `npm run lint:briefs` + `git diff --check` + verify gates when executed | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Contract prevents raw drilldown/export/warehouse expansion and requires bounded low-cardinality attribution dimensions before any future reporting work.                             | query/export scope rationale + mapping rules                            | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Contract is revertable without migrations/provider/env changes; future checkout/entitlement children must define rollback, disable, repair, and support diagnostics before release.  | rollback section + no runtime changed-files evidence                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - This child is docs-only and must not change routes, server/client components, actions, API routes, cache behavior, checkout rendering, or Admin Analytics UI.
  - Future checkout UI work must reuse the existing checkout button/session route pattern and keep the user handoff explicit.
  - Future dashboard work must reuse `components/admin/AdminAnalyticsDashboard.tsx` and `lib/analytics/admin-dashboard.ts`.
- TypeScript/domain contracts:
  - This child may name future semantic boundaries but must not add event names, payload helpers, route handlers, checkout types, entitlement types, or finance schemas.
  - Future runtime work must type event names through `ANALYTICS_EVENT_NAMES`, sanitize payloads, bound dimensions, and define deterministic zero/unknown/duplicate behavior.
- Supabase/data layer:
  - No migration, RLS change, generated DB type update, rollup job, index, raw drilldown, export path, entitlement mutation, or finance table change is allowed in this docs-only child.
  - Future protected commerce children must preserve fail-closed RLS/authz and add negative-path tests.
- External services/tools:
  - No Stripe API, Checkout Session payload, webhook, portal, secret, SDK, finance script, vendor analytics, tag manager, cookie/consent, or provider config change is allowed.
  - Future checkout changes must re-check official Stripe docs at execution time, use the repo's Stripe-hosted Checkout Session baseline unless explicitly justified, keep secrets server-only, preserve webhook verification, and document idempotency/retry/support diagnostics.
- UI system:
  - No visible UI, screenshot, style, or product asset change in this planned/docs-only contract.
  - Future checkout/dashboard UI children require screenshot handoff and owner approval before `npm run verify:pre-pr`.
- Testing:
  - This planned brief creation requires `npm run lint:briefs` and `git diff --check`.
  - If executed as a docs-only contract, run docs-only validation and `npm run verify:pre-pr` before PR update.

## Data Placement And Sync Contract

- Server-canonical:
  - App product catalog identity, checkout session creation records where persisted, entitlement rows, support diagnostics, and admin insight contracts.
- Provider-canonical:
  - Stripe Checkout Session, customer, payment, invoice, refund, payout, and provider event state.
- Finance-canonical:
  - Stripe/accounting reconciliation artifacts, finance exports, and owner-approved reporting scripts.
- Analytics-canonical:
  - Sanitized `analytics_events` rows for product telemetry and Admin Analytics aggregate views only.
- Local/browser:
  - Future CTA click/presentation emissions may be best-effort duplicate telemetry only.
  - Browser state must not own checkout completion, entitlement, Stripe customer/session identity, finance truth, or reconciliation status.
- Sync behavior:
  - Checkout/session creation, webhook fulfillment, entitlement grant/repair, and finance reconciliation must have separate retry/idempotency contracts.
  - Analytics failures fail soft for product workflows and cannot block or grant commerce access.
- Retention and sensitivity:
  - Existing analytics retention applies to product telemetry.
  - Raw checkout URLs, Stripe customer/session/payment/invoice IDs, payment method details, cart details, emails, user IDs, visitor IDs, IPs, User-Agent, raw URLs/referrers, support free text, and finance exports are forbidden from client analytics and raw Admin Analytics display.
- Cache/invalidation:
  - This docs-only child changes no cache.
  - Future checkout, entitlement, dashboard, and finance children must state `no-store`/cache mode, invalidation, stale-state behavior, and repair triggers before implementation.

## Identity And Rename Contract

- Canonical stable IDs:
  - Product identity is `CatalogProductId`, not title, slug, CTA copy, or Stripe price ID.
  - Event identity is append-only `event_name`.
  - Checkout identity is provider/session identity kept server-side or in provider/reconciliation systems.
  - Entitlement identity is server-canonical entitlement row identity and stable product/user/email linkage rules.
  - Finance identity is reconciliation/export identity from Stripe/accounting evidence.
- Human-readable identifiers:
  - CTA copy, checkout button text, product titles, dashboard labels, Help/Guide text, and support phrasing are display-only and renameable when meaning is unchanged.
- Mutability rules:
  - Shipped event names, provider identifiers, entitlement reconciliation keys, and finance export identifiers must not be repurposed.
  - Changing the meaning of a checkout/entitlement/finance signal requires a new child with alias/migration/reconciliation rules.
- Rename vs repurpose:
  - Label-only copy changes are renames when the same action/source-of-truth remains.
  - Treating CTA clicks as checkout, checkout start as payment success, payment success as entitlement truth, or entitlement rows as finance close is repurpose and requires a new child.
- Compatibility contract:
  - Unknown products, checkout states, provider events, entitlement states, or finance statuses fail closed in dedicated KPI modules until mapped.
  - Generic diagnostics may display safe unknown categories without raw provider IDs or sensitive fields.
- Observability and repair:
  - Future runtime children must expose provider delay, entitlement lag, reconciliation mismatch, and stale analytics states through support-safe diagnostics.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Product IDs, Stripe price/config keys, checkout session states, webhook event types, entitlement states, reconciliation statuses, refunds, payouts, invoices, product routes, CTA placements, Admin Analytics modules, Help/Guide copy, locales, exports, and vendor forwarding.
- Source of truth:
  - Product IDs come from `lib/commerce/catalog.ts`.
  - Product telemetry event names come from `ANALYTICS_EVENT_NAMES`.
  - Checkout truth comes from checkout/session and Stripe webhook contracts.
  - Entitlement truth comes from server-canonical entitlement storage and repair flows.
  - Finance truth comes from Stripe/accounting reconciliation artifacts, not Admin Analytics.
- Additive behavior:
  - New product telemetry can appear in generic Admin Analytics lists when it passes existing safe-dimension rules.
  - New catalog products can remain unmapped for workout-context commerce until a child approves placement, checkout, entitlement, support, and finance interpretation.
- Explicit mapping requirements:
  - New dedicated checkout attribution modules, checkout events, webhook meanings, entitlement states, finance reports, exports, raw drilldown, vendor analytics, localized purchase claims, or public SEO/AI commerce copy require explicit owner mapping, tests, docs, and support copy.
- Unknown or deprecated values:
  - Unknown, deprecated, disabled, inactive, or unmapped products/states fail closed for dedicated KPIs and cannot imply purchase, access, or revenue.
  - Unknown values may appear only as support-safe aggregate diagnostics after a mapping child defines labels and privacy boundaries.
- Test/evidence:
  - This planned creation must pass `npm run lint:briefs` and `git diff --check`.
  - Executing the contract must include route/label/support sweep evidence.
  - Future runtime children must include unknown product, missing price config, checkout provider failure, delayed webhook, entitlement lag, duplicate analytics, stale/capped reads, and forbidden-payload fixtures where relevant.

## Scope

- Create a docs-only checkout attribution and finance separation contract.
- Update this child brief and parent checkpoint/next-child references.
- Align with existing workout-context CTA measurement, external service, data-access/authz/cache, checkout, entitlement, and finance boundaries.
- Define what later child briefs must own before checkout attribution, entitlement, Stripe, finance, export, raw drilldown, or dashboard work can ship.

## Out Of Scope

- Runtime CTA changes or new CTA placements.
- New event names, event callsites, payload helpers, ingestion changes, or Admin Analytics aggregation/UI.
- Checkout route changes, Stripe Checkout Session payload changes, webhook handling, billing portal, entitlement mutation, finance reconciliation scripts, accounting export, refunds, payouts, invoices, product catalog mutation, pricing, vendor analytics, raw drilldown, CSV/export, migration, RLS, route changes, or builder/generator UX changes.
- Treating `upsell_presented`, `upsell_accepted`, `checkout_started`, `checkout_completed`, or `entitlement_granted` as revenue, accounting, refund, payout, invoice, or finance truth.
- Opening, merging, or shipping runtime implementation from this planned brief without explicit owner execution approval.

## Help / Guide Impact

- Planned brief creation: no visible Help/Guide product change.
- Docs-only contract execution: architecture/support interpretation is updated through `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`, this brief, parent checkpoint, and the Admin Analytics API caveat reference. User-facing Help/Guide copy is unchanged because no visible labels, admin copy, support recovery paths, checkout wording, or workflow behavior changed.
- Any future CTA, checkout, entitlement, finance, recovery, or billing workflow child must update Help/Guide and relevant runbooks in the same PR or include explicit `N/A` rationale.

## Screenshot / Visual Impact

- Planned brief creation and docs-only contract execution: screenshot handoff is N/A because no rendered UI, print, layout, brand, style, or product asset changes.
- Future CTA, checkout, Admin Analytics, Help/Guide, or billing UI work must follow the repo screenshot handoff rule, including owner approval before `npm run verify:pre-pr`.

## Route / Label / Support Surface Sweep

Required when this contract is executed because it affects support interpretation of checkout, Stripe, entitlement, finance, and Admin Analytics labels.

Execution evidence:

- Command: `rg -n "upsell_presented|upsell_accepted|upsell_declined|checkout_started|checkout_completed|entitlement_granted|Checkout Session|Stripe|webhook|entitlement|finance|reconciliation|revenue|refund|payout|invoice|Admin Analytics|/api/checkout/session|/api/stripe/webhook|/api/portal" app components lib/analytics lib/commerce lib/stripe scripts tests docs/api-contracts.md docs/architecture docs/runbooks docs/task-briefs/planned docs/task-briefs/in-progress docs/task-briefs/done`
- Result: expected existing commerce, analytics, entitlement, finance, support, and task-brief references only. No runtime route, label, Help/Guide, checkout, Stripe, entitlement, finance, export, dashboard, or support workflow fallout required for this docs-only contract beyond the new architecture contract, API-contract caveat reference, parent pointer, and this brief.

Search at minimum:

- `upsell_presented`
- `upsell_accepted`
- `upsell_declined`
- `checkout_started`
- `checkout_completed`
- `entitlement_granted`
- `Checkout Session`
- `Stripe`
- `webhook`
- `entitlement`
- `finance`
- `reconciliation`
- `revenue`
- `refund`
- `payout`
- `invoice`
- `Admin Analytics`
- `/api/checkout/session`
- `/api/stripe/webhook`
- `/api/portal`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/commerce/`
- `lib/stripe/`
- `scripts/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- Help/Guide sources and assertions
- active/planned/done analytics, commerce, workout, entitlement, and finance task briefs.

## Acceptance Criteria

1. The child remains docs-only unless the owner explicitly approves execution, and execution remains docs-only unless a later child approves runtime commerce work.
2. Contract defines separate meanings and sources of truth for CTA telemetry, checkout attribution, provider payment state, entitlement truth, and finance reporting.
3. Contract states that product analytics and Admin Analytics cannot prove checkout completion, entitlement access, Stripe reconciliation, revenue, refunds, payouts, invoices, accounting exports, or finance truth.
4. Contract names the future implementation prerequisites for checkout attribution, webhook/entitlement handling, support diagnostics, rollback, and tests.
5. Contract includes data placement, identity/rename, forward-compatibility, Help/Guide impact, route/label/support sweep, and validation rules.
6. No runtime CTA, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog, pricing, dashboard, or builder/generator UX scope is added.
7. Changed briefs pass `npm run lint:briefs`.

## Validation

Docs-only contract execution:

- `npm run lint:briefs:all`
- `npm run verify:docs-only`
- `git diff --check`
- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

Future runtime children:

- targeted unit/component/e2e tests named in the child brief
- checkout/provider/entitlement/finance negative-path tests when touched
- route/label/support-surface sweep
- screenshot handoff when UI/rendering changes
- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

## Session Continuity And Recovery

- Parent path: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Active child path: `docs/task-briefs/in-progress/2026-06-11-workout-checkout-attribution-finance-separation-contract-v1-10-10.md`
- Architecture contract path: `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
- Latest completed child path: `docs/task-briefs/done/2026-06-11-workout-context-cta-admin-analytics-mapping-v1-10-10.md`
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this child, the parent brief, and the latest completed child brief.

## Checkpoint Log

- `2026-06-11 | planned child created | created this planned child from clean synced main@2be08770 after PR #1075 and clean post-merge preflight; implementation is not approved yet and scope remains docs-only contract work with no runtime CTA, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog, pricing, dashboard, or builder/generator UX changes | next: wait for owner implementation approval or scope edits`
- `2026-06-11 | child moved to in-progress | owner requested implementation on branch workout-checkout-attribution-finance-separation-contract-v1; child moved to in-progress and remains docs-only, with no runtime CTA, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog, pricing, dashboard, or builder/generator UX scope approved | next: create architecture contract and run route/label/support sweep`
- `2026-06-11 | contract drafted | added docs/architecture/workout-checkout-attribution-finance-separation-contract.md and updated support interpretation references; official Stripe Checkout, webhook signature, and idempotency docs were checked for contract boundaries, but no provider behavior changed | next: run route/label/support sweep and docs validation gates`
- `2026-06-11 | docs validation passed | route/label/support sweep found only expected existing commerce, analytics, entitlement, finance, support, and task-brief references; npm run lint:briefs:all, npm run verify:docs-only, git diff --check, and trailing-whitespace checks passed for the docs-only contract with no runtime scope added | next: run npm run verify:pre-pr before commit/push`
- `2026-06-11 | pre-pr passed | npm run verify:pre-pr passed the docs-only lane and confirmed branch workout-checkout-attribution-finance-separation-contract-v1 contains current origin/main@2be08770; scope remains docs-only with no runtime CTA, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog, pricing, dashboard, or builder/generator UX changes | next: commit, push, open PR, monitor CI, and run pre-merge gate`
- `2026-06-11 | PR checkpoint amended | initial PR #1076 CI and npm run verify:pre-merge passed before the checkpoint amend; the amended branch keeps scope docs-only with no runtime CTA, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog, pricing, dashboard, or builder/generator UX changes | next: rerun pre-pr/pre-merge on the amended branch, update PR #1076, and wait for owner merge approval`
