# Task Brief: Workout Context Checkout Completion + Entitlement Attribution Contract V1 (10/10)

## Metadata

- `id`: `2026-06-11-workout-context-checkout-completion-entitlement-attribution-contract-v1-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-11`
- `updated`: `2026-06-11`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-measurement-contract-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-runtime-event-callsites-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-admin-analytics-mapping-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-checkout-attribution-finance-separation-contract-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-checkout-started-attribution-hardening-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-plans-checkout-attribution-bridge-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-checkout-started-admin-analytics-mapping-v1-10-10.md`
  - `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
  - `docs/architecture/workout-context-cta-measurement-contract.md`
  - `docs/architecture/external-service-contract-matrix.md`
  - `docs/architecture/data-access-authz-cache-contract-registry.md`
- `execution_mode`: `docs-contract-after-explicit-execute`
- `branch`: `workout-context-checkout-completion-entitlement-contract-v1`

## Brief Audit Record

- `last_audited`: `2026-06-11`
- `base`: clean synced `main@1a6ef169` after PR `#1084` cleaned the workout commercial analytics parent status; owner reported `npm run post-merge:preflight` clean with no closeout required. Execution started on branch `workout-context-checkout-completion-entitlement-contract-v1`.
- `audit_status`: `closed`
- `decision`: Closed by PR `#1085` / squash commit `6ca0e50d398cd8013481f44116c94beb9b196229`.
- `reason`: The owner explicitly requested execution. Workout-context CTA presentation/click telemetry, the `/plans` checkout-start attribution bridge, and read-only Admin Analytics checkout-start mapping are complete. This docs-only child created the contract needed before carrying workout-context source/placement through Stripe metadata, webhook fulfillment, entitlement diagnostics, or any dedicated Admin Analytics completion module.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, the task brief template, scorecard categories, official Stripe Checkout/webhook/idempotency/API guidance, `stripe` SDK behavior, `app/api/checkout/session/route.ts`, `app/api/stripe/webhook/route.ts`, `app/api/portal/route.ts`, `lib/commerce/checkout.ts`, `lib/commerce/catalog.ts`, `lib/commerce/entitlements.ts`, `ANALYTICS_EVENT_NAMES`, analytics persistence, `analytics_events` schema, `/api/admin/analytics/insights`, Admin Analytics UI, Help/Guide contracts, finance reconciliation scripts, external service matrix, data-access/authz/cache registry, route/label/support sweep rules, or checkout/entitlement/finance contracts change.

## Goal

Create a docs-only contract that defines if and how mapped workout-context checkout-start attribution may be carried into checkout completion and entitlement-grant interpretation without exposing provider identifiers, overstating conversion, or mixing product analytics with entitlement, Stripe, revenue, or finance truth.

## Pre-Implementation Owner Explanation

Vi lager forst en kontrakt for "checkout fullfort" og "tilgang gitt" etter workout-context CTA-en. Det betyr at vi bestemmer hvilke data som trygt kan folge fra checkout-start til Stripe-webhook og entitlement, og hva Admin Analytics aldri skal pastaa. Dette er viktig fordi fullfort checkout og gitt tilgang er mer alvorlige signaler enn klikk og checkout-start. Utenfor scope er runtime-kode, nye Stripe-webhook-endringer, nye metadatafelter, entitlement-mutasjoner, Admin Analytics UI, finance-rapportering, export, raw drilldown, nye produkter/priser, ny checkout-rute og direkte workout-context checkout.

Forward-compatibility-intent: nye produkter, CTA-plasseringer, checkout-ruter, webhook-eventer, entitlement-stater og provider-/finance-signaler skal feile lukket for dedikerte completion/entitlement KPI-er til de har eksplisitt mapping, tester, support-kopi og rollback-/repair-regler.

## Product Questions

This child answers only these contract questions:

1. What source of truth may count checkout completion for the existing workout-context handoff?
2. What source of truth may count entitlement grant, and why is that still not finance truth?
3. Which checkout/session metadata, if any, may safely carry `source=workout_context`, `placementId=workout_saved_post_success`, and `productId=guide_poolside` into provider/webhook handling?
4. Which provider IDs, customer IDs, session IDs, email values, payment details, invoice values, and user identifiers must stay out of client analytics, public responses, and raw Admin Analytics display?
5. Which unknown, missing, delayed, duplicated, provider-failed, entitlement-lagged, and reconciliation-mismatch states must be support-visible before any dashboard or runtime implementation ships?
6. Which future child must own implementation before Admin Analytics may show a dedicated workout-context checkout completion or entitlement module?

## Implemented Contract Boundary

This child creates a durable docs-only contract at:

- `docs/architecture/workout-context-checkout-completion-entitlement-attribution-contract.md`

The contract defines:

- current baseline from the existing checkout session route and Stripe webhook route,
- why current generic `checkout_completed` and `entitlement_granted` rows cannot be counted as dedicated workout-context completion/entitlement outcomes,
- the approved future propagation shape for low-cardinality server-owned attribution fields if a later implementation child adds it,
- why redacted provider/session IDs are not a join contract,
- whether future checkout completion attribution can use Stripe Checkout Session metadata, invoice metadata, server-side checkout records, or another server-owned join key,
- whether future entitlement attribution can be derived from fulfillment inputs without leaking Stripe/session/customer/user/email identifiers into product analytics,
- allowed and forbidden Admin Analytics interpretations for:
  - `checkout_started`,
  - `checkout_completed`,
  - `entitlement_granted`,
  - future workout-context completion/entitlement aggregates,
- required tests and support diagnostics before any runtime implementation.

The contract preserves the current Stripe-hosted Checkout Sessions pattern for one-time payments unless a later child proves a different official Stripe integration surface is safer. Stripe docs were re-checked on 2026-06-11 for Checkout, Checkout Session creation/object metadata, event types, webhook signature verification, and idempotent requests.

## Runtime Non-Decision

This child does not implement attribution propagation. It only prepares the contract for a later owner-approved implementation child.

No runtime code may be changed under this brief. If execution discovers that a safe contract requires code evidence first, stop and create a separate implementation child instead of expanding this docs-only scope.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                          | Evidence                                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Contract defines the next checkout-completion/entitlement decision boundary without expanding CTA runtime, checkout, entitlement, finance, or dashboard scope.                              | architecture contract + parent checkpoint                        | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: no visible checkout or entitlement flow changes; future UI children must keep user handoff, success, pending, and repair states explicit.                                  | UI scope rationale + future screenshot rule                      | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because execution is docs-only and changes no rendered UI, CSS, assets, print/export artifact, screenshots, or product-rendering files.                                                 | explicit visual scope rationale                                  | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Contract separates checkout handoff, provider completion, entitlement grant, and finance truth with deterministic allowed/forbidden meanings and no inferred purchase/access/revenue state. | contract truth-layer matrix + route/label/support sweep          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, mutable config, placement publishing, content editing, or operator mutation workflow changes in this docs-only contract.                                       | explicit admin-editor scope rationale                            | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no visible UI, focus behavior, labels, headings, keyboard flow, or screen-reader behavior changes.                                                                              | explicit a11y scope rationale                                    | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no runtime route, bundle, query, payload, image, font, dependency, webhook, or cache behavior changes.                                                                          | docs-only changed-files review                                   | `N/A`                   |
| Data placement and sync boundaries            | `target`     | Contract states which data is analytics-canonical, checkout/session-canonical, provider-canonical, entitlement-canonical, finance-canonical, and local/browser-only.                        | data placement contract + existing architecture alignment        | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Contract requires later checkout, webhook, entitlement, dashboard, and support children to define no-store/cache, stale-state, retry, invalidation, and repair behavior.                    | cache/invalidation contract                                      | `5/5`                   |
| Reliability and failure handling              | `target`     | Contract defines deterministic handling for missing metadata, unknown attribution, provider delay, webhook retry, duplicate events, entitlement lag, repair, and reconciliation mismatch.   | failure-state matrix + future negative-path requirements         | `5/5`                   |
| Security and authz                            | `target`     | Contract preserves fail-closed checkout/webhook/entitlement boundaries, Stripe webhook verification, server-only secrets/IDs, and least-privilege future diagnostics.                       | security/authz section + data-access registry alignment          | `5/5`                   |
| Privacy and compliance                        | `target`     | Contract forbids raw Stripe IDs, checkout URLs, customer IDs, emails, user IDs, payment details, invoices, raw URLs, IPs, user agents, and raw payload JSON in product analytics/display.   | forbidden-data list + privacy boundary                           | `5/5`                   |
| Content governance                            | `target`     | Contract updates durable architecture/parent planning surfaces so support, Help/Guide, and later children inherit one interpretation of completion and entitlement attribution.             | architecture doc + parent checkpoint + lint:briefs               | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, editable placement, publish action, recovery action, or mutation state changes.                                                                              | explicit admin-workflow scope rationale                          | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route, metadata, sitemap, robots, canonical URL, structured data, or crawlable product content changes.                                                               | explicit SEO scope rationale                                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic page, public docs page, structured data, or AI-facing crawl surface changes.                                                                                 | explicit AI-discoverability scope rationale                      | `N/A`                   |
| Analytics and KPI observability               | `target`     | Contract defines which future completion/entitlement KPI layers may exist and which caveats prevent Admin Analytics from implying unique-user conversion, revenue, or finance truth.        | KPI interpretation matrix + future mapping requirements          | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Contract keeps checkout completion, entitlement grant, provider records, product catalog identity, and revenue operations separately reconcilable.                                          | commerce boundary section + Stripe/checkout baseline review      | `5/5`                   |
| Incident response and support operations      | `target`     | Contract gives support deterministic language for provider delay, webhook retry, ignored events, missing metadata, entitlement lag, repair, and reconciliation mismatch.                    | support/runbook impact section + sweep                           | `5/5`                   |
| Finance and reporting operations              | `target`     | Contract states that finance reporting depends on Stripe/accounting reconciliation and exports, not checkout completion counts, entitlement rows, or Admin Analytics modules alone.         | finance boundary section + reconciliation references             | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: machine IDs stay locale-independent and display labels remain renameable; localized purchase/support claims require a later owner-approved child.                          | identity/rename contract                                         | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Docs-only child reuses existing architecture/task-brief/service-matrix patterns and adds no dependency, runtime route, migration, vendor, Stripe API, checkout, entitlement, or UI.         | changed-files review + package diff                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass `npm run lint:briefs`; docs-only execution must run docs-only/pre-pr gates before PR, with future runtime children owning targeted code tests.                          | `npm run lint:briefs` + `git diff --check` + future verify gates | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Contract prevents raw drilldown/export/warehouse expansion and requires bounded low-cardinality attribution dimensions before any future reporting or join work.                            | query/export scope rationale + mapping rules                     | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Contract is revertable without migrations/provider/env changes; future checkout/entitlement children must define rollback, disable, repair, and support diagnostics before release.         | rollback section + no runtime changed-files evidence             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - This child is docs-only and must not change routes, server/client components, actions, API routes, cache behavior, checkout rendering, success pages, guide access pages, or Admin Analytics UI.
  - Future dashboard work must reuse `components/admin/AdminAnalyticsDashboard.tsx` and `lib/analytics/admin-dashboard.ts`.
  - Future route/API work must preserve the existing `/api/checkout/session` and `/api/stripe/webhook` boundaries unless a separate child proves a safer architecture.
- TypeScript/domain contracts:
  - This child may name future semantic boundaries but must not add event names, payload helpers, route handlers, checkout types, entitlement types, or finance schemas.
  - Future runtime work must type event names through `ANALYTICS_EVENT_NAMES`, use catalog-backed `CatalogProductId`, sanitize payloads, bound dimensions, and define zero/unknown/duplicate behavior.
- Supabase/data layer:
  - No migration, RLS change, generated DB type update, rollup job, index, entitlement mutation, raw drilldown, or export path is allowed in this docs-only child.
  - Future entitlement or provider-join work must preserve fail-closed RLS/authz and add negative-path tests before release.
- External services/tools:
  - No Stripe API, Checkout Session payload, webhook, portal, secret, SDK, finance script, vendor analytics, tag manager, cookie/consent, or provider config change is allowed.
  - Future checkout/webhook changes must re-check official Stripe docs at execution time, use the repo's Stripe-hosted Checkout Session baseline unless explicitly justified, keep secrets server-only, preserve webhook signature verification, and document idempotency/retry/support diagnostics.
- UI system:
  - No visible UI, screenshot, style, or product asset change is included.
  - Future checkout, success, access, Admin Analytics, or Help/Guide UI children require screenshot handoff and owner approval before `npm run verify:pre-pr`.
- Testing:
  - This docs-only execution requires `npm run lint:briefs` and `git diff --check`.
  - If executed as a docs-only contract, run docs-only validation and `npm run verify:pre-pr` before PR update.
  - Future runtime work must include targeted route/webhook/helper/admin tests, negative paths, and forbidden-payload assertions.

## Data Placement And Sync Contract

- Analytics-canonical:
  - Sanitized `analytics_events` rows and aggregate Admin Analytics product telemetry only.
  - `checkout_started`, `checkout_completed`, and `entitlement_granted` rows are operational signals, not finance truth.
- Checkout/session-canonical:
  - Server-owned checkout route behavior and any future server-owned attribution handoff record or metadata contract.
- Provider-canonical:
  - Stripe Checkout Session, customer, payment, invoice, refund, payout, and provider event state.
- Entitlement-canonical:
  - Server-canonical entitlement rows, attachment/repair behavior, and app-recognized access state.
- Finance-canonical:
  - Stripe/accounting reconciliation artifacts, finance exports, and owner-approved reporting scripts.
- Local/browser:
  - Browser state may emit best-effort CTA product telemetry only.
  - Browser state must not own checkout completion, entitlement, provider truth, finance truth, provider IDs, persistent attribution IDs, or reconciliation status.
- Sync behavior:
  - Checkout/session creation, webhook fulfillment, entitlement grant/repair, and finance reconciliation must stay separate retry/idempotency domains.
  - Analytics failures fail soft for product workflows and cannot block or grant commerce access.
- Retention and sensitivity:
  - Existing analytics retention applies to product telemetry.
  - Raw checkout URLs, Stripe customer/session/payment/invoice/refund/payout IDs, payment method details, cart details, emails, user IDs, visitor IDs, IPs, User-Agent, raw URLs/referrers, support free text, and finance exports are forbidden from client analytics and raw Admin Analytics display.
- Cache/invalidation:
  - This docs-only child changes no cache.
  - Future checkout, webhook, entitlement, dashboard, and finance children must state `no-store`/cache mode, invalidation, stale-state behavior, retry, and repair triggers before implementation.

## Identity And Rename Contract

- Canonical stable IDs:
  - Product identity is `CatalogProductId`, not title, slug, CTA copy, or Stripe price ID.
  - Event identity is append-only `event_name`.
  - Workout-context placement identity is the write-once mapped `placementId`, currently `workout_saved_post_success`.
  - Checkout/provider identity is Stripe/provider session/customer/payment/invoice identity and stays server-side or in provider/reconciliation systems.
  - Entitlement identity is server-canonical entitlement row identity and stable product/user/email linkage rules.
  - Finance identity is reconciliation/export identity from Stripe/accounting evidence.
- Human-readable identifiers:
  - CTA copy, checkout button text, product titles, dashboard labels, Help/Guide text, and support phrasing are display-only and renameable when meaning is unchanged.
- Mutability rules:
  - Shipped event names, provider identifiers, entitlement reconciliation keys, and finance export identifiers must not be repurposed.
  - Changing the meaning of checkout completion, entitlement grant, or finance reporting requires a new child with alias/migration/reconciliation rules.
- Rename vs repurpose:
  - Label-only copy changes are renames when the same action/source-of-truth remains.
  - Treating checkout start as completion, provider completion as guaranteed entitlement, entitlement rows as finance close, or Admin Analytics as revenue proof is repurpose and requires a new child.
- Compatibility contract:
  - Unknown products, checkout states, provider events, entitlement states, or finance statuses fail closed in dedicated KPI modules until mapped.
  - Generic diagnostics may display safe unknown categories without raw provider IDs, raw user IDs, emails, or sensitive fields.
- Observability and repair:
  - Future runtime children must expose provider delay, webhook retry, ignored provider event, missing metadata, entitlement lag, entitlement repair, stale analytics, and reconciliation mismatch states through support-safe diagnostics.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Product IDs, Stripe price/config keys, checkout attribution sources, CTA placement IDs, checkout session states, webhook event types, entitlement states, reconciliation statuses, refunds, payouts, invoices, product routes, Admin Analytics modules, Help/Guide copy, locales, exports, and vendor forwarding.
- Source of truth:
  - Product IDs come from `lib/commerce/catalog.ts`.
  - Product telemetry event names come from `ANALYTICS_EVENT_NAMES`.
  - Checkout-start truth comes from `/api/checkout/session`.
  - Provider/payment truth comes from Stripe webhook/provider records.
  - Entitlement truth comes from server-canonical entitlement storage and repair flows.
  - Finance truth comes from Stripe/accounting reconciliation artifacts, not Admin Analytics.
- Additive behavior:
  - New product telemetry can appear in generic Admin Analytics lists when it passes existing safe-dimension rules.
  - New catalog products can remain unmapped for workout-context completion/entitlement KPIs until a child approves placement, checkout, entitlement, support, and finance interpretation.
- Explicit mapping requirements:
  - New dedicated completion/entitlement modules, checkout events, webhook meanings, entitlement states, finance reports, exports, raw drilldown, vendor analytics, localized purchase claims, or public SEO/AI commerce copy require explicit owner mapping, tests, docs, and support copy.
- Unknown or deprecated values:
  - Unknown, deprecated, disabled, inactive, delayed, duplicate, or unmapped products/states fail closed for dedicated KPIs and cannot imply purchase, access, refund, payout, invoice, or revenue.
  - Unknown values may appear only as support-safe aggregate diagnostics after a mapping child defines labels and privacy boundaries.
- Test/evidence:
  - This docs-only execution must pass `npm run lint:briefs` and `git diff --check`.
  - Executing the contract must include route/label/support sweep evidence.
  - Future runtime children must include fixtures for unknown product, missing metadata, missing price config, provider failure, invalid webhook signature, ignored webhook event, delayed webhook, duplicate provider event, entitlement lag, entitlement repair, stale/capped analytics reads, and forbidden payload/display fields.

## Scope

- Move this child brief to `in-progress` for explicit execution.
- Create a durable architecture contract at `docs/architecture/workout-context-checkout-completion-entitlement-attribution-contract.md`.
- Update the parent checkpoint/active-child references for this docs-only execution.
- Align with existing checkout/finance separation, workout-context CTA measurement, external service, data-access/authz/cache, checkout, entitlement, and finance boundaries.
- Define what later child briefs must own before checkout completion attribution, entitlement attribution, Admin Analytics completion/entitlement modules, Stripe metadata changes, webhook changes, support diagnostics, export, raw drilldown, vendor analytics, or finance work can ship.

## Out Of Scope

- Runtime CTA changes or new CTA placements.
- Direct workout-context checkout.
- New event names, event callsites, payload helpers, ingestion changes, or Admin Analytics aggregation/UI.
- Checkout route changes, Stripe Checkout Session payload changes, webhook handling, billing portal, entitlement mutation, finance reconciliation scripts, accounting export, refunds, payouts, invoices, product catalog mutation, pricing, vendor analytics, raw drilldown, CSV/export, migration, RLS, route changes, success-page changes, guide-access changes, or builder/generator UX changes.
- Treating `upsell_presented`, `upsell_accepted`, `checkout_started`, `checkout_completed`, or `entitlement_granted` as revenue, accounting, refund, payout, invoice, unique-user conversion, or finance truth.
- Opening, merging, or shipping runtime implementation from this docs-only brief without a separate owner-approved runtime child.

## Help / Guide Impact

- This docs-only contract execution has no visible Help/Guide product change.
- Architecture/support interpretation is updated through the new architecture contract, this brief, parent checkpoint, Admin Analytics API caveats, the external service matrix, the route registry, and the existing checkout/finance separation contract reference so support does not treat completion or entitlement signals as finance truth.
- Any future CTA, checkout, entitlement, finance, recovery, billing, dashboard, or support workflow child must update Help/Guide and relevant runbooks in the same PR or include explicit scope-specific `N/A` rationale.

## Screenshot / Visual Impact

- This docs-only contract execution: screenshot handoff is N/A because no rendered UI, print, layout, brand, style, or product asset changes.
- Future checkout, success, entitlement, Admin Analytics, Help/Guide, or billing UI work must follow the repo screenshot handoff rule, including owner approval before `npm run verify:pre-pr`.

## Route / Label / Support Surface Sweep

Required when this contract is executed because it affects support interpretation of checkout completion, Stripe webhook state, entitlement access, finance, and Admin Analytics labels.

Search at minimum:

- `upsell_presented`
- `upsell_accepted`
- `upsell_declined`
- `checkout_started`
- `checkout_completed`
- `entitlement_granted`
- `discount_redeemed`
- `Checkout Session`
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
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
- `/checkout/success`
- `guide_poolside`
- `workout_context`
- `workout_saved_post_success`

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
- active/planned/done task briefs for analytics, workout, checkout, entitlement, finance, and commerce.

Planned sweep command for execution:

```sh
rg -n "upsell_presented|upsell_accepted|upsell_declined|checkout_started|checkout_completed|entitlement_granted|discount_redeemed|Checkout Session|checkout\\.session\\.completed|checkout\\.session\\.async_payment_succeeded|Stripe|webhook|entitlement|finance|reconciliation|revenue|refund|payout|invoice|Admin Analytics|/api/checkout/session|/api/stripe/webhook|/api/portal|/checkout/success|guide_poolside|workout_context|workout_saved_post_success" app components lib/analytics lib/commerce lib/stripe scripts tests docs/api-contracts.md docs/architecture docs/runbooks docs/task-briefs/planned docs/task-briefs/in-progress docs/task-briefs/done
```

Execution evidence:

- Command run: the planned `rg` sweep above.
- Result: expected broad references across checkout route docs, Stripe webhook route, analytics
  event taxonomy/persistence, Admin Analytics contracts, entitlement routes, finance reconciliation,
  tests, runbooks, and historical task briefs.
- Required fallout handled in this docs-only child:
  - new architecture contract at
    `docs/architecture/workout-context-checkout-completion-entitlement-attribution-contract.md`,
  - Admin Analytics and checkout API caveats in `docs/api-contracts.md`,
  - Stripe/analytics provider interpretation in
    `docs/architecture/external-service-contract-matrix.md`,
  - webhook/Admin Analytics route interpretation in
    `docs/architecture/data-access-authz-cache-contract-registry.md`,
  - cross-reference from
    `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`,
  - parent active-child checkpoint in
    `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`.
- No runtime route, event taxonomy, Stripe webhook, entitlement mutation, Admin Analytics UI,
  Help/Guide UI, finance script, export, migration, RLS, pricing, product catalog, or visible UI
  fallout is required for this docs-only contract.

## Acceptance Criteria

1. Child brief exists in `docs/task-briefs/done/` with parent, dependencies, audit record, scorecard mapping, architecture gate, data-boundary decisions, identity contract, forward-compatibility contract, Help/Guide impact, screenshot rationale, route/label/support sweep, acceptance criteria, validation, checkpoint log, and completion record.
2. Parent brief names this child as done while keeping active and planned child as none.
3. The execution remains docs-only with no runtime checkout, Stripe webhook, entitlement, Admin Analytics UI, finance, export, raw drilldown, product catalog, route, or UI changes.
4. The contract boundary names checkout completion and entitlement grant as separate from checkout start, CTA click, Stripe reconciliation, revenue, refund, payout, invoice, accounting, and finance truth.
5. The contract explicitly says current generic `checkout_completed` and `entitlement_granted` rows cannot be counted as dedicated workout-context completion or entitlement outcomes.
6. Sensitive provider, payment, user, email, URL/referrer, support, and finance fields are explicitly forbidden from client analytics and raw Admin Analytics display.
7. Future unknown, delayed, duplicate, missing, provider-failed, entitlement-lagged, stale, capped, and reconciliation-mismatch states have deterministic handling.
8. New products, placements, checkout routes, webhook events, entitlement states, and finance signals require explicit mapping before entering dedicated workout-context completion/entitlement KPI modules.
9. Route/label/support sweep evidence is recorded.
10. Changed briefs pass `npm run lint:briefs`.

## Validation

Docs-only contract execution:

- route/label/support sweep recorded in this brief
- `npm run lint:briefs` (pass for changed child and parent briefs on final committed pre-PR gate)
- `npm run lint:briefs:all` (pass across all brief files)
- `git diff --check` (pass)
- `npm run verify:docs-only` (pass; docs/governance-only lane)
- `npm run verify:pre-pr` (pass; docs/governance-only lane, branch current with `origin/main@1a6ef169`, log `artifacts/test-runs/20260611-203044/verify.log`)
- required PR CI checks (pass for PR `#1085`: Analyze, CodeQL, Vercel, Vercel Preview Comments, deploy-preview, e2e-smoke, site-lock-smoke, size-check, verify)
- `npm run verify:pre-merge` (pass; docs/governance-only lane, marker `artifacts/verify-pre-merge/20260611-183357.json`)

Future runtime implementation child, if later approved:

- official Stripe docs re-check at execution time
- targeted route/webhook/helper/Admin Analytics tests named in that child
- negative-path tests for invalid signature, missing metadata, unknown product, delayed/ignored provider event, provider failure, entitlement lag/repair, forbidden payload/display fields, stale/capped analytics reads, and finance-boundary caveats
- screenshot handoff if any visible UI, Admin Analytics, success-page, access-page, Help/Guide, checkout, or support-surface rendering changes
- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

## Rollback / Release Notes

- This docs-only contract execution is revertable by removing the new architecture contract, moving/removing this child lifecycle update, and reverting parent/API/matrix/registry docs references.
- It is revertable without migrations, provider changes, env changes, product catalog changes, entitlement changes, Admin Analytics changes, or runtime rollback.
- Future runtime implementation must include a disable/rollback path for metadata propagation, webhook handling, dashboard mapping, entitlement diagnostics, and support repair behavior before merge recommendation.

## Session Continuity And Recovery

- Parent path: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Done child path: `docs/task-briefs/done/2026-06-11-workout-context-checkout-completion-entitlement-attribution-contract-v1-10-10.md`
- Related durable contracts:
  - `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
  - `docs/architecture/workout-context-cta-measurement-contract.md`
  - `docs/architecture/external-service-contract-matrix.md`
  - `docs/architecture/data-access-authz-cache-contract-registry.md`
- Contract path: `docs/architecture/workout-context-checkout-completion-entitlement-attribution-contract.md`
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen the parent and this done child, then continue from the latest checkpoint.

## Checkpoint Log

- `2026-06-11 | planned child created | created this planned docs-only child from clean synced main@1a6ef169 after PR #1084 and clean post-merge preflight reported by owner; implementation is not approved yet and no runtime checkout, Stripe webhook, entitlement, Admin Analytics, finance, export, raw drilldown, product catalog, pricing, route, UI, or builder/generator scope is approved | next: wait for owner implementation approval or scope edits`
- `2026-06-11 | child moved to in-progress | owner requested execution on branch workout-context-checkout-completion-entitlement-contract-v1; child moved to docs/task-briefs/in-progress/2026-06-11-workout-context-checkout-completion-entitlement-attribution-contract-v1-10-10.md and remains docs-only with no runtime checkout, Stripe webhook, entitlement, Admin Analytics UI, finance, export, raw drilldown, product catalog, pricing, route, UI, or builder/generator scope approved | next: complete architecture contract, support sweep, docs validation, and PR prep`
- `2026-06-11 | contract drafted and support sweep recorded | added the architecture contract, updated API/matrix/route-registry/finance-separation/parent docs, and recorded route/label/support sweep evidence; current generic checkout_completed and entitlement_granted rows are explicitly not dedicated workout-context completion or entitlement outcomes | next: run docs validation and prepare PR`
- `2026-06-11 | local docs gates passed | npm run lint:briefs skipped because the lifecycle-moved brief was already staged, npm run lint:briefs:all passed, git diff --check passed, npm run verify:docs-only passed, and npm run verify:pre-pr passed in the docs/governance-only lane with branch current to origin/main@1a6ef169 | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge before merge recommendation`
- `2026-06-11 | contract child merged | PR #1085 merged at squash commit 6ca0e50d398cd8013481f44116c94beb9b196229 after green docs-only pre-pr, PR CI, and pre-merge gates; child moved to done in this repo-managed closeout and runtime checkout, Stripe webhook, entitlement, Admin Analytics modules, finance reconciliation, export, raw drilldown, vendor analytics, pricing, product catalog mutation, migration, RLS, route creation, visible redesign, and builder/generator algorithm scope remain deferred | next: complete docs-only closeout PR and rerun post-merge-preflight`

## Completion Record

- `completed`: `2026-06-11`
- `merged_pr`: `#1085`
- `squash_commit`: `6ca0e50d398cd8013481f44116c94beb9b196229`
- `result`: Closed Workout Context Checkout Completion + Entitlement Attribution Contract V1. The repo now has a durable docs-only contract that says current generic `checkout_completed` and `entitlement_granted` rows are not dedicated workout-context outcomes, and future completion/entitlement attribution requires explicit server-owned, privacy-safe propagation and tests.
- `validation`: route/label/support sweep recorded; `npm run lint:briefs`, `npm run lint:briefs:all`, `git diff --check`, `npm run verify:docs-only`, `npm run verify:pre-pr`, PR #1085 CI, and `npm run verify:pre-merge` all passed for the docs-only lane.
- `10/10 claim`: yes - all critical target categories reached `5/5` for the approved docs-only contract scope.

| Category                                      | Achieved Score | Evidence                                                                                                              | Gaps / Notes                                                                                     |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Product goals and IA                          | `5/5`          | Contract artifact, parent checkpoint, PR `#1085`, squash `6ca0e50d`.                                                  | Runtime completion/entitlement implementation remains deferred to a future owner-approved child. |
| Business logic correctness and data integrity | `5/5`          | Truth-layer contract separates checkout start, provider completion, entitlement grant, and finance truth.             | No runtime data mutation was in scope.                                                           |
| Data placement and sync boundaries            | `5/5`          | Data placement contract defines analytics, checkout/session, provider, entitlement, finance, and browser boundaries.  | Future server-owned propagation needs its own schema/metadata/test child.                        |
| Caching and invalidation strategy             | `5/5`          | Contract requires future checkout, webhook, entitlement, dashboard, and support children to define cache/repair flow. | No runtime cache changed in this docs-only slice.                                                |
| Reliability and failure handling              | `5/5`          | Failure-state matrix covers missing metadata, unknown attribution, provider delay, retry, duplicate, lag, and repair. | Runtime negative-path tests are deferred to the future implementation child.                     |
| Security and authz                            | `5/5`          | Contract preserves signature verification, fail-closed provider handling, server-only secrets, and least privilege.   | No authz/runtime route changed in this docs-only slice.                                          |
| Privacy and compliance                        | `5/5`          | Forbidden-data list excludes provider IDs, emails, user IDs, raw URLs, payment data, raw payload JSON, and finance.   | Future dashboard/support work must preserve the same display boundary.                           |
| Content governance                            | `5/5`          | Architecture contract, parent brief, API caveats, service matrix, registry, and closeout record updated.              | No Help/Guide UI change was needed because no product behavior changed.                          |
| Analytics and KPI observability               | `5/5`          | KPI contract states allowed/forbidden Admin Analytics interpretations and future aggregate requirements.              | Dedicated workout-context completion/entitlement KPI modules remain deferred.                    |
| Commerce and revenue ops                      | `5/5`          | Stripe Checkout/provider baseline and commerce boundary documented without changing checkout/webhook behavior.        | Future metadata propagation requires fresh Stripe docs review and runtime tests.                 |
| Incident response and support operations      | `5/5`          | Support language and failure states distinguish provider delay, webhook retry, entitlement lag, and finance mismatch. | Future support diagnostics implementation remains deferred.                                      |
| Finance and reporting operations              | `5/5`          | Finance boundary confirms Admin Analytics counts are not revenue, refund, payout, invoice, accounting, or finance.    | Finance reconciliation/export work remains deferred.                                             |
| Stack-fit and dependency discipline           | `5/5`          | Docs-only diff reused existing architecture/brief/matrix patterns and added no dependencies.                          | None for approved docs-only scope.                                                               |
| Testing and QA automation                     | `5/5`          | `lint:briefs`, `lint:briefs:all`, `verify:docs-only`, `verify:pre-pr`, PR CI, and `verify:pre-merge` passed.          | Future runtime child must add targeted route/webhook/helper/Admin Analytics tests.               |
| Scalability and cost efficiency               | `5/5`          | Contract prevents raw drilldown/export/warehouse expansion and requires bounded low-cardinality dimensions.           | Export/warehouse/reporting expansion remains deferred.                                           |
| DevOps and rollback readiness                 | `5/5`          | Rollback notes confirm docs-only revert path with no migrations, env, provider, entitlement, or runtime rollback.     | Future runtime rollout must define disable/repair/rollback paths before merge.                   |
