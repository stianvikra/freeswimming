# Task Brief: Checkout Started Attribution Hardening V1 (10/10)

## Metadata

- `id`: `2026-06-11-checkout-started-attribution-hardening-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-11`
- `updated`: `2026-06-11`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-11-workout-checkout-attribution-finance-separation-contract-v1-10-10.md`
  - `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
  - `docs/architecture/external-service-contract-matrix.md`
  - `docs/architecture/data-access-authz-cache-contract-registry.md`
- `execution_mode`: `end-to-end-after-explicit-execute`
- `branch`: `checkout-started-attribution-hardening-v1`

## Brief Audit Record

- `last_audited`: `2026-06-11`
- `base`: clean synced `main@c60d5069` after PR `#1077` closed the Workout Checkout Attribution + Finance Separation Contract V1 brief and `npm run post-merge:preflight` was reported clean.
- `audit_status`: `ready`
- `decision`: Execute this bounded runtime child on branch `checkout-started-attribution-hardening-v1`.
- `reason`: The owner explicitly requested implementation. The workout-context CTA presentation/click telemetry, Admin Analytics mapping, and checkout/finance separation contract are complete. The existing checkout route already emits `checkout_started`, but the attribution boundary must be hardened before any workout-context CTA is linked directly to checkout or any dedicated checkout KPI is expanded.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, the task brief template, scorecard categories, official Stripe Checkout/idempotency/webhook guidance, `stripe` SDK behavior, `app/api/checkout/session/route.ts`, `components/my-library/CheckoutButton.tsx`, `lib/commerce/checkout.ts`, `lib/analytics/persistence.ts`, `ANALYTICS_EVENT_NAMES`, `analytics_events` schema/persistence, Admin Analytics insight contracts, product catalog availability rules, Help/Guide contracts, route/label/support sweep rules, or checkout/entitlement/finance contracts change.

## Goal

Harden `checkout_started` attribution for the existing `/api/checkout/session` boundary so checkout handoff is measured with privacy-safe, allowlisted source dimensions without exposing Stripe/session identifiers or implying payment, entitlement, revenue, or finance truth.

## Pre-Implementation Owner Explanation

Vi herder checkout-start-maling for checkout-ruten som allerede finnes. Det betyr at systemet kan si tryggere hvor en checkout-handoff kom fra, uten a blande det med betaling, tilgang eller inntekt. Dette matters fordi neste kommersielle steg ma kunne skille "brukeren startet checkout" fra "brukeren kjopte". Utenfor scope er direkte workout-CTA til checkout, Stripe-webhook-endringer, entitlement, finance, priser, ny dashboardmodul, export/CSV, raw drilldown og ny produktkataloglogikk.

Forward-compatibility-intent: nye checkout-kilder, CTA-plasseringer eller produkter skal bare telle i dedikerte checkout-KPI-er nar de er eksplisitt allowlistet/mappet med tester og support-kopi; ukjente verdier skal falle trygt tilbake til `unknown` eller feile lukket uten a bety kjop, tilgang, revenue eller finance truth.

## Product Questions

This child answers only these questions:

1. What is the minimal safe payload for `checkout_started`?
2. Which source values may attribute checkout handoff today?
3. How should unknown, missing, malformed, or future source/placement values behave?
4. Which Stripe/session/provider identifiers must stay out of client responses and analytics payloads?
5. Which route tests prove checkout-start attribution cannot be confused with payment success, entitlement, revenue, or finance truth?

## Planned Implementation Boundary

The implementation should harden the existing checkout handoff only:

- Use the existing `/api/checkout/session` route as the checkout-start boundary.
- Keep Stripe-hosted Checkout Sessions as the payment surface.
- Pass only low-cardinality allowlisted attribution dimensions into `checkout_started`, for example:
  - `productId`,
  - `source` with approved values such as `plans`, `library_explore`, `workout_context`, or fallback `unknown`,
  - optional mapped `placementId` when a later approved caller has one.
- Remove raw Stripe Checkout Session ID from the persisted analytics payload.
- Do not return `sessionId` to the browser unless execution audit finds an active required consumer and documents a redacted alternative.
- Keep the returned browser response to the minimum needed for redirect: `ok` and `url` on success, or `ok` and safe `error` on failure.
- Use a non-sensitive idempotency strategy for Stripe Checkout Session creation, or document code-level evidence that current SDK retry behavior provides equivalent protection for the route call.
- Preserve existing fail-closed request validation for unsupported content type, invalid JSON, unknown product, inactive product, missing product config, Stripe/provider failure, and unsafe cancel paths.
- Do not emit `checkout_completed`, `entitlement_granted`, finance, refund, payout, invoice, or reconciliation signals.

Official Stripe docs to re-check at execution time:

- Stripe Checkout: <https://docs.stripe.com/payments/checkout>
- Create a Checkout Session: <https://docs.stripe.com/api/checkout/sessions/create>
- Idempotent requests: <https://docs.stripe.com/api/idempotent_requests>
- Webhook signature verification: <https://docs.stripe.com/webhooks/signature>

## Implementation Checkpoint

Implemented runtime boundary:

- `components/my-library/CheckoutButton.tsx` now includes the existing `analyticsSource` as the
  server checkout attribution `source` in the `/api/checkout/session` request body.
- `lib/commerce/checkout.ts` owns typed allowlists for checkout attribution `source` and mapped
  `placementId`, plus `buildCheckoutStartedAnalyticsPayload`.
- `app/api/checkout/session/route.ts` now:
  - normalizes untrusted browser source/placement hints,
  - emits `checkout_started` only after Stripe returns a Checkout Session redirect URL,
  - persists only `productId`, normalized `source`, and optional approved `placementId`,
  - removes Checkout Session ID from `checkout_started` analytics payload,
  - removes `sessionId` from the browser response,
  - uses a non-sensitive Stripe idempotency key for session creation,
  - fails soft if analytics persistence throws after checkout session creation,
  - returns deterministic safe errors for unsupported content type, invalid JSON, unknown product,
    inactive product, missing product config, provider failure, and missing redirect URL.

No direct workout-context checkout, checkout completion, Stripe webhook, entitlement, finance,
vendor analytics, export, raw drilldown, migration, RLS, product catalog mutation, dashboard module,
visible UI copy/layout/style, or builder/generator algorithm scope was added.

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
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                      | Evidence                                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Checkout start becomes a clear handoff signal from the existing checkout route without changing CTA placement, purchase flow, entitlement, or finance interpretation.                                   | route contract + API/support docs + tests                                  | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: no visible UI copy or layout change is planned; checkout button behavior must remain the same redirect flow with safe failure feedback.                                                | component tests + no screenshot scope rationale                            | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because planned implementation changes no rendered UI, CSS, assets, print/export artifact, screenshots, or product-rendering files.                                                                 | explicit visual scope rationale                                            | `N/A`                   |
| Business logic correctness and data integrity | `target`     | `checkout_started` emits only after successful checkout session creation, with allowlisted attribution and no session/provider IDs in analytics.                                                        | checkout route tests + analytics payload assertions                        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, mutable config, placement publishing, or content editing workflow changes.                                                                                                 | explicit admin-editor scope rationale                                      | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no visible UI, focus behavior, labels, headings, keyboard flow, or screen-reader behavior changes are planned.                                                                              | explicit a11y scope rationale                                              | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency, bundle, query, image, or font; route response remains minimal and current performance gates must stay green.                                                        | package diff + build/pre-pr gate                                           | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Checkout attribution stays server-canonical at `/api/checkout/session`; browser can provide only untrusted source hints; Stripe/provider, entitlement, and finance truth stay separate.                 | data placement contract + negative route tests                             | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: checkout route remains dynamic/no-store style runtime behavior; no cache, revalidation, or admin insight cache behavior changes.                                                       | route/cache review                                                         | `4/5`                   |
| Reliability and failure handling              | `target`     | Expected failures return deterministic safe errors and never emit checkout-start success; analytics persistence failure must not break a successfully created checkout handoff.                         | provider failure, invalid input, product inactive, analytics-failure tests | `5/5`                   |
| Security and authz                            | `target`     | Route fails closed for invalid/unsupported inputs, trusts catalog product IDs instead of browser price IDs, keeps Stripe secrets/session IDs server-side, and preserves safe cancel path.               | route negative-path tests + code review                                    | `5/5`                   |
| Privacy and compliance                        | `target`     | Analytics payload and client response exclude raw checkout URLs beyond redirect, Checkout Session IDs, Stripe customer/payment/invoice IDs, emails, user IDs, IPs, user agents, and raw URLs/referrers. | privacy payload tests + API contract update                                | `5/5`                   |
| Content governance                            | `target`     | API/support docs and parent/child checkpoints align on checkout-start meaning and non-finance caveats.                                                                                                  | docs updates + route/label/support sweep + lint:briefs                     | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin mutation, role-gated workflow, editable config, publish action, recovery action, or operator workflow changes.                                                                     | explicit admin-workflow scope rationale                                    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route, metadata, sitemap, robots, canonical URL, structured data, or crawlable product content changes.                                                                           | explicit SEO scope rationale                                               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic page, public docs page, structured data, or AI-facing crawl surface changes.                                                                                             | explicit AI-discoverability scope rationale                                | `N/A`                   |
| Analytics and KPI observability               | `target`     | `checkout_started` becomes a safer operational handoff signal with source caveats, not checkout completion, entitlement, revenue, unique-user conversion, or finance truth.                             | analytics tests + API/support docs                                         | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Checkout handoff remains distinct from Stripe provider state, entitlement grant, revenue, refunds, payouts, invoices, accounting exports, and finance close.                                            | commerce contract review + route tests                                     | `5/5`                   |
| Incident response and support operations      | `target`     | Support can distinguish checkout unavailable/config failure, provider create failure, invalid request, analytics persistence failure, and successful handoff.                                           | Help/Guide/runbook/API notes + failure-state tests                         | `5/5`                   |
| Finance and reporting operations              | `target`     | Finance truth remains outside this slice; `checkout_started` cannot be used as revenue, refund, payout, invoice, accounting export, or reconciliation evidence.                                         | finance caveat docs + no finance/export changed-files evidence             | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: machine IDs stay locale-independent; any visible localized checkout/support copy requires a later owner-approved child.                                                                | copy/scope review                                                          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js route handler, TypeScript catalog, Stripe SDK, checkout helper, analytics persistence, and test stack; add no dependency or vendor.                                              | changed-files review + package diff                                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted route/component/helper tests plus broad repo gates before PR and pre-merge; changed brief must pass `npm run lint:briefs`.                                                                 | targeted Vitest + typecheck + quality gates + verify gates                 | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Attribution dimensions stay low-cardinality and bounded; no raw drilldown, export, warehouse, rollup, or vendor forwarding path is added.                                                               | payload review + no migration/export/dependency evidence                   | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Change is revertable without migration/provider/env changes; rollback is restoring previous route response/payload while existing checkout remains usable.                                              | PR rollback notes + no migration/env/dependency evidence                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/api/checkout/session` as the only checkout-start route touched by this child.
  - `components/my-library/CheckoutButton.tsx` may pass explicit attribution hints in the request body if needed, but must not change visible copy, layout, focus behavior, or redirect UX.
  - Do not create a new checkout route, public route, Admin Analytics route, or dashboard tab.
  - Preserve dynamic route behavior and safe JSON responses.
- TypeScript/domain contracts:
  - Introduce typed checkout attribution helpers only if they reduce duplication and bound source/placement values.
  - Use catalog-backed `CatalogProductId`, not browser-provided price IDs.
  - Keep `checkout_started` in `ANALYTICS_EVENT_NAMES`; do not add a new event name unless execution audit proves the existing event meaning cannot be safely preserved.
  - Define deterministic behavior for missing, malformed, unknown, deprecated, and future source/placement values.
- Supabase/data layer:
  - No migration, RLS change, generated DB type update, rollup job, index, entitlement mutation, raw drilldown, or export path.
  - Persisted analytics rows may use existing safe dimension columns only.
  - Raw payload JSON must not be exposed to Admin UI.
- External services/tools:
  - Re-check official Stripe Checkout Session and idempotency docs before implementation.
  - Use the existing Stripe SDK pattern and keep secrets server-side.
  - Do not change Stripe webhook fulfillment, billing portal, provider event meanings, subscription model, pricing, or product catalog config.
  - If an idempotency key is added, it must be non-sensitive, bounded, and not derived from email, user ID, raw URLs, or payment details.
- UI system:
  - No visible UI change is expected, so screenshot handoff is N/A unless implementation changes rendered checkout/button states.
  - If any visible UI changes are introduced during execution, stop and follow the screenshot handoff rule before `npm run verify:pre-pr`.
- Testing:
  - Add route tests for successful checkout session creation, attribution allowlist/fallback, no session ID in analytics, no session ID in client response, invalid JSON/content type, unknown/inactive product, unsafe cancel path, provider failure, and analytics persistence failure.
  - Update `CheckoutButton` tests only if request body attribution changes.
  - Keep Admin Analytics tests scoped to existing caveats unless a later dashboard child is explicitly approved.

## Data Placement And Sync Contract

- Server-canonical:
  - Checkout session creation route behavior.
  - Catalog product identity and active/available product status.
  - Persisted `analytics_events` rows for `checkout_started`.
- Provider-canonical:
  - Stripe Checkout Session, customer, payment, invoice, refund, payout, and provider event state.
- Finance-canonical:
  - Stripe/accounting reconciliation artifacts, finance exports, and owner-approved finance scripts.
- Analytics-canonical:
  - Sanitized, low-cardinality `checkout_started` rows and aggregate Admin Analytics counts.
- Local/browser:
  - Browser may send untrusted source/placement hints only.
  - Browser must not own checkout completion, provider truth, entitlement truth, finance truth, persistent attribution IDs, Stripe IDs, or reconciliation state.
- Sync behavior:
  - `checkout_started` emits only after a server-created checkout session with redirect URL exists.
  - Analytics persistence failure fails soft after checkout session creation and must not block redirect.
  - Duplicate route calls may create duplicate checkout-start rows unless a later child adds a durable dedupe/session model; UI pending state should still prevent normal double-clicks.
- Retention and sensitivity:
  - Existing analytics retention applies.
  - Client analytics and Admin Analytics raw display must exclude Checkout Session IDs, Stripe customer/payment/invoice/refund/payout IDs, raw checkout URL except the redirect response, email, user ID, visitor ID, IP, User-Agent, raw URL/referrer/query, payment method details, cart details, support free text, and finance export rows.
- Cache/invalidation:
  - No new cache or invalidation source is added.
  - Future dashboard/finance children must define stale/capped/read-failure behavior separately.

## Identity And Rename Contract

- Canonical stable IDs:
  - Product identity is `CatalogProductId`.
  - Checkout-start event identity is `checkout_started`.
  - Attribution source identity is the allowlisted low-cardinality `source` value.
  - Optional placement identity is the allowlisted low-cardinality `placementId`.
  - Stripe Checkout Session ID remains provider identity and is not analytics/client identity.
- Human-readable identifiers:
  - Button labels, product titles, route labels, dashboard labels, Help/Guide text, and support phrasing are display-only and renameable when meaning is unchanged.
- Mutability rules:
  - Event meaning is append-only: checkout start means server checkout handoff/session creation, not payment success.
  - Source/placement values are additive through explicit mapping.
  - Unknown source/placement values must not be silently counted as a mapped source.
- Rename vs repurpose:
  - Copy-only checkout/support wording changes are renames when route behavior and event meaning stay unchanged.
  - Treating checkout start as payment completion, entitlement grant, revenue, or finance close is repurpose and requires a new child.
- Compatibility contract:
  - Existing `/plans` and My Library checkout flows keep working.
  - Missing/unknown attribution falls back to `unknown` or is excluded from dedicated KPI modules until mapped.
  - Future workout-context direct checkout requires a separate approved child or explicit execution scope update.
- Observability and repair:
  - Future support diagnostics may show safe aggregate unknown-source counts but must not expose raw Stripe/session identifiers or raw payload JSON.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Product IDs, checkout attribution sources, CTA placement IDs, catalog availability, route labels, checkout response shape, Stripe Checkout Session create options, Admin Analytics caveats, Help/Guide copy, locales, exports, vendor forwarding, entitlement states, and finance/reporting surfaces.
- Source of truth:
  - Product IDs come from `lib/commerce/catalog.ts`.
  - Checkout-start event name comes from `ANALYTICS_EVENT_NAMES`.
  - Checkout handoff truth comes from `/api/checkout/session`.
  - Provider/payment truth comes from Stripe webhook/provider records.
  - Entitlement truth comes from server-canonical entitlement storage.
  - Finance truth comes from reconciliation/export evidence.
- Additive behavior:
  - New allowed source/placement values can be added later through typed mapping and tests.
  - Existing generic Admin Analytics event/product counts continue to include `checkout_started` rows through safe dimensions.
- Explicit mapping requirements:
  - New workout-context direct checkout, new checkout events, new source/placement values in dedicated KPIs, new products, checkout completion mapping, entitlement-aware targeting, finance reporting, refunds, payouts, invoices, raw drilldown, CSV/export, vendor analytics, localized purchase claims, or public SEO/AI commerce copy require explicit owner-approved child scope.
- Unknown or deprecated values:
  - Unknown/malformed/deprecated source or placement values fall back to `unknown` or are excluded from dedicated KPI modules.
  - Unknown product IDs fail closed and do not create checkout sessions.
  - Unknown values must not imply purchase, entitlement, revenue, refund, payout, invoice, or finance state.
- Test/evidence:
  - Include fixtures for mapped source, missing source, unknown source, malformed source, future placement, unsafe cancel path, inactive product, provider failure, analytics persistence failure, no session ID in analytics/client response, and no raw sensitive payload fields.
  - Run route/label/support sweep before broad gates because this changes checkout attribution and support interpretation.

## Scope

- Create and execute a bounded runtime hardening slice for existing checkout-start attribution only after explicit owner execution approval.
- Potential implementation files:
  - `app/api/checkout/session/route.ts`
  - `lib/commerce/checkout.ts`
  - `components/my-library/CheckoutButton.tsx` if request-body attribution needs to be passed from existing buttons
  - targeted tests under `tests/unit/`
  - `docs/api-contracts.md`, relevant Help/Guide/runbook docs, this child brief, and parent checkpoint
- Preserve existing checkout destination, Stripe-hosted Checkout Session behavior, product catalog identity, and safe cancel-path behavior.

## Out Of Scope

- Moving the workout-context CTA directly to checkout.
- New CTA placement, CTA copy, visible checkout UI, landing page, pricing, product catalog mutation, or route creation.
- Stripe webhook changes, billing portal changes, provider event meaning changes, subscriptions, Payment Element, PaymentIntents, entitlement mutation, finance reconciliation scripts, accounting export, refunds, payouts, invoices, revenue recognition, vendor analytics, raw drilldown, CSV/export, migration, RLS, generated DB types, warehouse/rollup jobs, or Admin Analytics dashboard modules.
- Adding `upsell_declined`, `checkout_completed`, or `entitlement_granted` callsites.
- Treating checkout start as payment success, entitlement access, unique-user conversion, revenue, refund, payout, invoice, or finance truth.
- Opening, pushing, or implementing this planned brief without explicit owner execution approval.

## Help / Guide Impact

- Planned brief creation: no Help/Guide product change.
- Runtime execution: update `docs/api-contracts.md` and relevant Help/Guide/runbook/support text if checkout-start attribution wording, response shape, error interpretation, or support diagnostics change.
- User-facing Help/Guide copy may be `N/A` only if execution changes no visible labels, no support-facing workflow text, and the API/support caveat updates fully cover the interpretation change.

## Screenshot / Visual Impact

- Planned brief creation: screenshot handoff is N/A because no rendered UI, print, layout, brand, style, or product asset changes.
- Planned runtime execution: screenshot handoff remains N/A if implementation only changes route/request/analytics behavior and keeps checkout button rendering unchanged.
- If execution changes visible checkout UI, CTA copy, feedback text, layout, or rendered Help/Guide content, capture screenshot handoff and wait for owner approval before `npm run verify:pre-pr`.
- Reference surface / shared component evidence: the existing shared `components/my-library/CheckoutButton.tsx` remains the reference surface and shared component; this slice changes only its JSON request body and preserves visible copy, class names, ARIA feedback, focus behavior, and redirect UX. `tests/unit/checkout-button.test.tsx` still asserts the shared primary action token contract.
- Screenshot artifacts: N/A for this implementation because no rendered UI, print, layout, brand, style, CSS class, asset, or product-rendering file changed; no artifact folder was created.
- Owner screenshot approval stop: N/A because there is no visual change to review. If any rendering/copy/style change is introduced before PR, pause for owner screenshot approval before `npm run verify:pre-pr`.

## Route / Label / Support Surface Sweep

Required before broad gates because this child changes checkout attribution and support interpretation.

Search at minimum:

- `checkout_started`
- `checkout_completed`
- `entitlement_granted`
- `upsell_accepted`
- `/api/checkout/session`
- `Checkout Session`
- `sessionId`
- `source`
- `placementId`
- `guide_poolside`
- `Stripe`
- `webhook`
- `entitlement`
- `finance`
- `revenue`
- `refund`
- `payout`
- `invoice`
- `Admin Analytics`
- `raw drilldown`
- `export`

Check at minimum:

- `app/api/checkout/`
- `components/my-library/`
- `lib/commerce/`
- `lib/analytics/`
- `lib/stripe/`
- `tests/unit/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- active/planned/done task briefs for workout, commerce, analytics, and finance surfaces.

Execution evidence:

- Identifiers searched: `checkout_started`, `checkout_completed`, `entitlement_granted`,
  `upsell_accepted`, `/api/checkout/session`, `Checkout Session`, `sessionId`, `source`,
  `placementId`, `guide_poolside`, `Stripe`, `webhook`, `entitlement`, `finance`, `revenue`,
  `refund`, `payout`, `invoice`, `Admin Analytics`, `raw drilldown`, and `export`.
- Surfaces checked: `app/api/checkout`, `components/my-library`, `lib/commerce`, `lib/analytics`,
  `lib/stripe`, `tests/unit`, `docs/api-contracts.md`, `docs/architecture`, `docs/runbooks`,
  `docs/task-briefs/planned`, `docs/task-briefs/in-progress`, and `docs/task-briefs/done`.
- Fallout handled: route/helper/button/tests plus API contract, external service matrix,
  data-access/authz/cache registry, parent checkpoint, and this child brief. No Help/Guide
  product copy, visible checkout UI, direct workout-context checkout, Stripe webhook, entitlement,
  finance, export, raw drilldown, dashboard, product catalog, migration, or RLS fallout was found.

## Acceptance Criteria

1. `checkout_started` is emitted only after successful Stripe Checkout Session creation with a usable redirect URL.
2. Persisted `checkout_started` analytics payload contains only approved low-cardinality attribution fields and no Stripe/session/customer/payment/invoice IDs.
3. Browser response does not expose `sessionId` unless an execution audit proves a required active consumer and documents a redacted alternative.
4. Source/placement values are allowlisted, and missing/unknown/malformed/future values fall back safely without entering dedicated mapped KPIs.
5. Invalid content type, invalid JSON, unknown product, inactive product, unsafe cancel path, provider failure, and missing checkout URL return deterministic safe errors.
6. Analytics persistence failure does not block redirect after a checkout session is created.
7. No `checkout_completed`, `entitlement_granted`, finance, export, raw drilldown, vendor analytics, migration, RLS, pricing, product catalog mutation, dashboard module, or workout-context direct checkout scope is added.
8. API/support docs explain that checkout start is handoff/session creation only, not payment success, entitlement, revenue, refund, payout, invoice, accounting export, or finance truth.
9. Targeted tests, route/label/support sweep, `npm run lint:briefs`, `npm run lint:quality-gates`, `npm run typecheck`, `git diff --check`, and `npm run verify:pre-pr` pass before PR update.
10. No unexpected 500 / failure-mode evidence: expected 500s are deterministic and covered only for missing product config, Stripe/provider create failure, and missing Checkout Session redirect URL; invalid request/product states return 400/409/415.

## Validation

Planned brief creation:

- `npm run lint:briefs`
- `git diff --check`

Future implementation:

- Targeted Vitest route/helper/component tests for checkout session attribution and failure paths
- Route/label/support-surface sweep named above
- `npm run typecheck`
- `npm run lint:quality-gates`
- `npm run lint:briefs`
- `git diff --check`
- `npm run verify:pre-pr`
- Required PR CI checks
- `npm run verify:pre-merge`

Current targeted validation:

- `./node_modules/.bin/vitest run tests/unit/checkout-session-route.test.ts tests/unit/checkout-session-payload.test.ts tests/unit/checkout-button.test.tsx` -> pass, 3 files / 14 tests.
- `npm run typecheck` -> pass.
- `npm run lint:briefs:all` -> pass.
- `git diff --check` -> pass.
- `npm run lint:quality-gates` -> first run failed on missing evidence wording only; brief evidence was updated with no code change.
- `npm run lint:quality-gates` -> pass after brief evidence wording update.
- `npm run verify:pre-pr` -> final pass, full lane, `SITE_LOCK_ENABLED=0`, 106 E2E passed / 536 skipped; lint warnings were existing output capture unused-variable warnings only.
- Flake handling: first pre-PR run hit an unrelated `habit-perfect-day-hub` unit flake that passed targeted rerun; a later pre-PR run hit unrelated `install-prompt` E2E flakes that passed targeted Playwright rerun 4/4; no code was changed for those unrelated flakes, and final `npm run verify:pre-pr` passed.

## Checkpoint Log

- `2026-06-11 | planned child created | owner requested creation of Checkout Started Attribution Hardening V1 from clean synced main@c60d5069 after PR #1077 and clean post-merge preflight; implementation is not approved yet and must remain scoped to existing checkout-start attribution hardening with no direct workout-context checkout, checkout completion, entitlement, finance, export, raw drilldown, vendor analytics, dashboard, pricing, product catalog, migration, RLS, or visible UI scope | next: wait for owner implementation approval or scope edits`
- `2026-06-11 | child moved to in-progress | owner requested implementation on branch checkout-started-attribution-hardening-v1; child moved to docs/task-briefs/in-progress/2026-06-11-checkout-started-attribution-hardening-v1-10-10.md and remains scoped to existing checkout-start attribution hardening with no direct workout-context checkout, checkout completion, Stripe webhook, entitlement, finance, export, raw drilldown, vendor analytics, dashboard, pricing, product catalog, migration, RLS, or visible UI scope | next: audit checkout route/test patterns and implement the minimal safe hardening`
- `2026-06-11 | implementation and pre-PR validation | implemented checkout-start attribution helper, route hardening, CheckoutButton request-source pass-through, API/architecture docs, and targeted tests in implementation commit fcfbf838; targeted Vitest, typecheck, lint:briefs:all, route/label/support sweep, diff-check, lint:quality-gates, and final npm run verify:pre-pr passed; unrelated unit/E2E flakes passed targeted reruns without code changes; no visible UI/rendering files changed beyond CheckoutButton request-body behavior, so screenshot artifacts and owner screenshot approval are N/A | next: push, open PR, monitor CI, then run verify:pre-merge`
