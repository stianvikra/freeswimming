# Task Brief: Workout Context Checkout-Cancel Runtime Attribution V1 (10/10)

## Metadata

- `id`: `2026-06-12-workout-context-checkout-cancel-runtime-attribution-v1-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-12`
- `updated`: `2026-06-12`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-11-workout-context-plans-checkout-attribution-bridge-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-12-workout-context-checkout-cancel-decline-measurement-contract-v1-10-10.md`
  - `docs/architecture/workout-context-checkout-cancel-decline-measurement-contract.md`
  - `docs/architecture/workout-context-cta-measurement-contract.md`
  - `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
  - `docs/architecture/data-access-authz-cache-contract-registry.md`
- `execution_mode`: `end-to-end-after-explicit-execute`
- `branch`: `workout-context-checkout-cancel-runtime-attribution-v1`

## Brief Audit Record

- `last_audited`: `2026-06-12`
- `base`: clean synced `main@59801c36` after PR `#1099` added the docs-only checkout-cancel / decline measurement contract, repo-managed closeout PR `#1100` moved the child to done, and post-merge preflight was reported clean.
- `audit_status`: `ready`
- `decision`: Completed by PR `#1101` / squash commit `cd769275`.
- `reason`: The owner explicitly requested execution. The workout-context decline/cancel contract was complete, and runtime evidence showed the saved-workout CTA reached `/plans` with mapped workout-context query values while the checkout button still built a cancel return with current-surface `source=plans`. This child now preserves approved workout-context cancel attribution through the existing `/plans` checkout return before any Admin Analytics decline module or denominator includes decline.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, task brief template, scorecard categories, Codex skill/stack readiness radar, `components/analytics/TrackCheckoutCancel.tsx`, `components/my-library/CheckoutButton.tsx`, `app/plans/page.tsx`, `lib/commerce/checkout.ts`, `app/api/checkout/session/route.ts`, analytics event taxonomy, `analytics_events` schema, `/api/admin/analytics/insights`, Admin Analytics UI, Help/Guide contracts, checkout/Stripe/entitlement/finance contracts, product catalog IDs, or route/label/support sweep rules change.

## Goal

Preserve the approved workout-context source, placement, product, and reason through the existing `/plans` checkout-cancel return so future analytics can distinguish mapped workout-context checkout cancel telemetry from generic plans or My Library cancel telemetry without implying payment failure, entitlement failure, revenue, or finance truth.

## Pre-Implementation Owner Explanation

Vi planlegger et lite runtime-steg for checkout cancel etter workout-CTA-en. Det betyr at hvis en bruker gar fra lagret workout til Poolside-guide checkout via `/plans` og kommer tilbake med checkout cancelled, kan systemet male den returen som akkurat den godkjente workout-context cancel-signalen. Dette er viktig fordi vi senere kan vise decline/cancel uten a blande det med generisk plans-trafikk eller late som betaling feilet. Utenfor scope er Admin Analytics decline-modul, nye dashboard-rater, direkte checkout, Stripe/webhook-endringer, entitlement-regler, finance/revenue, export/raw drilldown, tredjeparts analytics, nye produkter/priser, ny dismiss-knapp og builder/generator UX.

Forward-compatibility-intent: nye produkter, CTA-plasseringer, checkout-kilder eller cancel/dismiss-arsaker skal ikke automatisk telle som workout-context decline; de skal feile lukket eller kreve eksplisitt mapping, tester, Help/Guide-kopi og support-regler.

## Product Questions

This child answers only these runtime questions:

1. How should the existing `/plans` checkout button preserve approved workout-context cancel attribution when the incoming plans query matches `source=workout_context`, `placementId=workout_saved_post_success`, and `productId=guide_poolside`?
2. How should `TrackCheckoutCancel` emit `upsell_declined` for the mapped checkout-cancel return without repurposing current-surface plans or My Library cancel telemetry?
3. Which source/placement/product/reason values must be allowlisted, and how do missing, malformed, unknown, future, or mismatched values fail closed?
4. How do duplicate cancel returns remain repeated best-effort telemetry or session-level suppressed telemetry without becoming unique-user conversion?
5. Which tests prove generic plans cancel, other products, unsupported placements, unsafe payload fields, checkout creation failure, provider failure, and abandoned checkout are not counted as mapped workout-context decline?

## Planned Implementation Boundary

The future implementation should be limited to the existing saved-workout CTA -> `/plans` -> Poolside guide checkout -> `/plans?checkout=cancelled` path:

- Reuse the current saved-workout CTA destination and `/plans` product card surface.
- Reuse `components/my-library/CheckoutButton.tsx` and `components/analytics/TrackCheckoutCancel.tsx`.
- Add typed helper behavior only where it keeps source/placement/product/reason allowlists centralized and deterministic.
- Preserve plans-surface `upsell_accepted` telemetry as plans-owned client telemetry unless a separate child changes that meaning.
- Preserve existing checkout-start, checkout-completed, and entitlement attribution boundaries.
- Emit or enrich `upsell_declined` only for the approved checkout-cancel return:
  - `source=workout_context`,
  - `placementId=workout_saved_post_success`,
  - `productId=guide_poolside`,
  - `surface=plans_checkout_return` or another contract-approved bounded surface value,
  - `reason=checkout_cancelled`.
- Keep generic `/plans?checkout=cancelled`, My Library cancel returns, other products, unknown values, malformed values, inactive/unmapped products, future placements, checkout creation failures, provider failures, webhook delays, entitlement lag, refunds, payouts, invoices, and finance states out of the mapped workout-context decline count.

Implementation must not add:

- a new checkout route,
- direct workout-context checkout,
- a visible dismiss/not-now control,
- an Admin Analytics decline module or stage-summary decline denominator,
- Stripe API/session/webhook behavior changes,
- entitlement mutation or rule changes,
- finance reporting,
- export/raw drilldown,
- vendor analytics,
- migrations/RLS/generated DB types,
- product catalog/pricing changes,
- visible redesign, copy/layout changes, or builder/generator algorithm changes.

## Implementation Checkpoint

Implemented runtime boundary:

- `lib/commerce/checkout.ts` now owns the mapped checkout-cancel constants and helpers:
  - `source=workout_context`,
  - `placementId=workout_saved_post_success`,
  - `productId=guide_poolside`,
  - `surface=plans_checkout_return`,
  - `reason=checkout_cancelled`.
- `components/my-library/CheckoutButton.tsx` preserves mapped workout-context cancel attribution in
  `cancelPath` only when the clicked product and checkout attribution match the approved Poolside
  path.
- `components/analytics/TrackCheckoutCancel.tsx` emits the mapped `upsell_declined` payload only
  when source, placement, product, surface, and reason all match; incomplete values stay as safe
  current-surface/review telemetry.
- Generic `/plans` cancel, My Library cancel, unrelated products, missing reason, future values,
  and malformed values stay out of mapped workout-context decline.
- `docs/api-contracts.md`, `docs/architecture/workout-context-checkout-cancel-decline-measurement-contract.md`,
  `docs/architecture/workout-context-cta-measurement-contract.md`,
  `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`, and
  `docs/architecture/data-access-authz-cache-contract-registry.md` now align on mapped cancel
  semantics and the no-dashboard-denominator boundary.

No Admin Analytics decline module, stage-summary decline denominator, explicit dismiss UI, direct
checkout, Stripe Session/webhook/provider behavior, entitlement rule, finance/export/vendor path,
migration/RLS/generated DB type, product/pricing change, visible UI/copy/layout change, or
builder/generator UX change was added.

UI/reference evidence:

- Reference surface: reused the existing `/plans` product card flow, shared `CheckoutButton`, and
  existing `TrackCheckoutCancel` tracker; no new markup, route, dashboard panel, visual state,
  layout, copy, CSS, print/export artifact, or brand surface was introduced.
- Screenshot approval stop: N/A because implementation changes only href/request attribution and
  client analytics payload parsing. If any rendered UI/copy/layout/style changes are added after
  this checkpoint, the owner screenshot approval stop becomes required before `npm run verify:pre-pr`.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                       | Evidence                                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The child preserves the existing workout CTA -> `/plans` purchase path while adding only the approved checkout-cancel telemetry meaning for that path.                                                   | checkout cancel contract + component/helper tests                   | `5/5`                   |
| UX flow clarity                               | `target`     | User-visible checkout, cancel return, pending, and error flows remain unchanged; no new prompt, dismiss button, dead end, or purchase claim is introduced.                                               | component/page tests + no visible UI diff review                    | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: no copy/layout/style/rendered UI change is planned; screenshot handoff becomes required if execution changes rendered UI, print, layout, brand, or product assets.                      | no-visual-diff evidence or screenshot artifacts if triggered        | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Mapped workout-context cancel is emitted only for the exact source/placement/product/reason contract; unknown/future/malformed/generic plans rows fail closed.                                           | typed helper tests + TrackCheckoutCancel/CheckoutButton/plans tests | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this child adds no admin editor, placement config, CRUD flow, publish workflow, or editable checkout setting.                                                                                | explicit admin-editor scope rationale                               | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: existing button/link semantics must remain unchanged; any future visible dismiss or dashboard UI child must validate focus, labels, headings, keyboard, and screen-reader behavior.     | component assertions + future a11y requirement                      | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, chart, bundle-heavy state, new network request, image, or font is planned; route-level performance gates must remain green.                                              | package diff + build/pre-pr gate                                    | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Browser cancel telemetry remains best-effort and low-cardinality; persisted analytics rows are server-canonical telemetry; checkout/provider/entitlement/finance truth stays separate.                   | data placement contract + payload tests                             | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no cache or revalidation change is planned; `/plans` and analytics reads keep current cache/no-store behavior.                                                                          | route/cache review                                                  | `4/5`                   |
| Reliability and failure handling              | `target`     | Duplicate, reload, missing, malformed, unknown, future, checkout-create failure, provider failure, abandoned-tab, stale/capped/schema-missing, and failed-read states must not create false decline.     | negative-path tests + support interpretation docs                   | `5/5`                   |
| Security and authz                            | `target`     | Browser-provided attribution is never trusted as product, price, provider, entitlement, or finance truth; protected checkout/admin routes keep fail-closed behavior.                                     | route/helper negative tests + no authz widening evidence            | `5/5`                   |
| Privacy and compliance                        | `target`     | Payloads exclude raw checkout URLs, query strings, referrers, Stripe IDs, payment IDs, invoice/refund/payout IDs, emails, user IDs, visitor IDs, IPs, user agents, workout text/IDs, and raw payload UI. | payload assertions + privacy docs review                            | `5/5`                   |
| Content governance                            | `target`     | API/support docs, architecture contracts, Help/Guide interpretation, and parent/child checkpoints align on the new cancel meaning and its non-finance caveats.                                           | docs updates + route/label/support sweep + lint:briefs              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin mutation, role-gated edit action, publish path, recovery action, or operator workflow changes in this child.                                                                        | explicit admin-workflow scope rationale                             | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: `/plans` query params must not create new canonical public pages, sitemap entries, metadata variants, structured data, or crawlable commerce claims.                                    | route/metadata review                                               | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: no public semantic content or AI-facing crawl surface is planned; attribution params must not create new public product claims.                                                         | public-content scope review                                         | `4/5`                   |
| Analytics and KPI observability               | `target`     | `upsell_declined` can identify the approved workout-context checkout-cancel return but no Admin Analytics decline KPI or denominator ships until a later mapping child.                                  | analytics event/payload tests + docs caveats                        | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Checkout cancel telemetry stays separate from checkout start/completion, Stripe provider truth, entitlement access, refunds, recovery, catalog/pricing, revenue, and finance truth.                      | commerce boundary review + no Stripe/finance changed-files evidence | `5/5`                   |
| Incident response and support operations      | `target`     | Support can distinguish mapped checkout-cancel return, generic plans cancel, unknown attribution, checkout unavailable, provider failure, entitlement lag, and finance states without raw identifiers.   | Help/Guide/runbook/API notes + failure-state tests                  | `5/5`                   |
| Finance and reporting operations              | `target`     | Cancel telemetry must not be used as revenue, refund, payout, invoice, accounting export, provider failure, Stripe reconciliation, or finance reporting evidence.                                        | finance caveat docs + no finance/export changed-files evidence      | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: machine keys remain locale-independent; visible localized checkout/dashboard/support copy requires a future owner-approved child if changed.                                            | copy/scope review + identity contract                               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse current Next.js routes/components, TypeScript checkout helpers, catalog IDs, analytics helpers, and Vitest stack; add no dependency, vendor, migration, or new route.                              | changed-files review + package diff                                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted helper/component/page tests plus broad gates before PR; changed briefs must pass `npm run lint:briefs`; merge readiness requires `npm run verify:pre-merge`.                                | targeted Vitest + typecheck + quality gates + verify gates          | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Attribution dimensions stay bounded and low-cardinality; no raw drilldown, per-user tracking, warehouse, export, rollup, or vendor forwarding path is added.                                             | payload review + no storage/vendor/dependency evidence              | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Change is revertable without migration, provider config, env var, dependency, or schema changes; rollback restores generic plans cancel behavior for the mapped path.                                    | PR rollback notes + no migration/env/dependency evidence            | `5/5`                   |

## Stack / Architecture Best-Practice Gate

Skill/capability audit:

- Available now: repo task-brief patterns, scorecard, checkout/cancel architecture contracts, existing Vitest/Testing Library coverage, Stripe plugin skill if future execution touches Stripe behavior.
- Evaluate later: Playwright skill only if a future execution unexpectedly changes visible UI; Stripe best-practices skill only if a future scope touches Stripe Session options, webhook behavior, provider objects, billing, refunds, payouts, invoices, or finance reconciliation.
- Install/config changes: none.

Systemic findings:

| Surface                        | Finding                                                                                                   | Severity | Recommended Type               | Owner Decision Needed | Follow-Up Brief Path        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ | --------------------- | --------------------------- |
| Analytics/KPI                  | Mapped workout-context decline needs a runtime cancel signal before Admin Analytics can count it safely.  | high     | bounded implementation child   | no                    | this brief                  |
| Commerce/support               | Checkout cancel must remain product telemetry, not provider failure, entitlement failure, or finance.     | high     | bounded implementation child   | no                    | this brief                  |
| Admin Analytics decline module | A dashboard decline KPI needs the runtime signal first plus its own denominator/copy/screenshot evidence. | medium   | deferred architecture decision | yes                   | TBD after this child closes |

Return path:

- Parent: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Status: active implementation child selected after explicit owner execution request.
- Last merged workstream: PR `#1099` (`05e5f369`) and closeout PR `#1100` (`59801c36`).
- Next planning step: complete implementation, targeted validation, broad gates, PR, CI, and pre-merge readiness without widening scope.

- React/Next.js:
  - Reuse `app/plans/page.tsx`, `components/my-library/CheckoutButton.tsx`, and `components/analytics/TrackCheckoutCancel.tsx`.
  - Keep the current server/client split: `/plans` resolves safe server-side attribution props; checkout button builds the request/cancel path; cancel tracker emits best-effort client telemetry on return.
  - Do not create a new route, shop page, Admin Analytics route, or dashboard tab.
  - Preserve current cache behavior unless execution audit proves a cache issue.
- TypeScript/domain contracts:
  - Reuse catalog-backed `CatalogProductId`.
  - Reuse or extend checkout attribution allowlists in `lib/commerce/checkout.ts` so source, placement, product, surface, and reason are bounded.
  - Keep `upsell_declined` as the event name; do not add a new event unless execution audit proves the existing event cannot preserve meaning safely.
  - Define deterministic behavior for missing, malformed, unknown, deprecated, inactive, and future values.
- Supabase/data layer:
  - No migration, RLS change, generated DB type update, rollup job, index, entitlement mutation, raw drilldown, or export path.
  - Persisted `analytics_events` rows may use existing safe dimensions and payload only.
  - Raw payload JSON must not be exposed to Admin UI.
- External services/tools:
  - No Stripe Session, webhook, billing portal, provider metadata, refund, payout, invoice, pricing, subscription, or product catalog change is planned.
  - If execution touches Stripe behavior, stop and refresh the brief with Stripe best-practice review and official docs.
- UI system:
  - No visible UI change is expected, so screenshot handoff is N/A unless rendered copy/layout/style/state changes.
  - If execution changes UI, follow the repo screenshot handoff rule before `npm run verify:pre-pr`.
- Testing:
  - Add helper tests for mapped and rejected cancel attribution.
  - Add `CheckoutButton` and `/plans` tests proving cancel path carries mapped workout-context values only for the approved Poolside guide path.
  - Add `TrackCheckoutCancel` tests proving mapped cancel emits bounded payload and generic/malformed/future values stay separate or excluded as designed.
  - Run route/label/support sweep before broad gates because event meaning and support interpretation change.

## Data Placement And Sync Contract

- Server-canonical:
  - Product identity from the catalog.
  - Checkout/session/provider truth from checkout and Stripe/webhook contracts.
  - Entitlement truth from server entitlement storage.
  - Finance truth from Stripe/accounting reconciliation artifacts.
- Analytics-canonical:
  - Persisted `analytics_events` rows for `upsell_declined` when a mapped cancel return is emitted.
  - Existing analytics retention and rollup lifecycle.
- Local/browser:
  - Best-effort checkout-cancel telemetry emission only.
  - Existing session-level duplicate suppression may remain local and non-durable.
  - No analytics cookie, visitor ID, localStorage analytics identity, ad click ID, persistent attribution ID, or user-to-public bridge.
- Sync behavior:
  - Cancel telemetry does not mutate checkout, catalog, entitlement, provider, support, or finance truth.
  - Abandoned checkout tabs, failed checkout creation, provider errors, webhook delays, and absent events remain unknown or operational states, not decline.
- Retention and sensitivity:
  - Existing analytics retention applies.
  - Payloads must exclude raw checkout URL, billing portal URL, Stripe Checkout Session ID, Stripe customer ID, payment ID, price ID, invoice/refund/payout IDs, payment method, cart details, provider responses, email, user ID, visitor ID, IP, user agent, fingerprint, cookie, localStorage identity, ad click ID, raw URL/referrer/query, raw workout title/notes/text/JSON/private row ID, support text, inferred purchase intent, entitlement state, revenue, or finance state.
- Cache/invalidation:
  - No new cache or invalidation mechanism.
  - Future Admin Analytics reads remain bounded `no-store` aggregate reads.

## Identity And Rename Contract

- Canonical stable IDs:
  - Event identity: `upsell_declined`.
  - Source identity: `workout_context`.
  - Placement identity: `workout_saved_post_success`.
  - Product identity: `guide_poolside`.
  - Surface identity: future bounded value such as `plans_checkout_return`.
  - Reason identity: `checkout_cancelled`.
- Human-readable identifiers:
  - CTA copy, checkout button text, product title, dashboard labels, Help/Guide copy, and localized display text are display-only and renameable when meaning is unchanged.
- Mutability rules:
  - Event names, source keys, placement IDs, surface keys, and reason keys are append-only after shipping.
  - Product labels may be renamed only when catalog identity and analytics identity remain stable.
  - Future products or placements require explicit mapping before they enter mapped workout-context decline.
- Rename vs repurpose:
  - Copy-only clarity is a rename.
  - Counting ignored users, all non-buyers, checkout failures, provider failures, entitlement lag, refunds, payouts, invoices, finance states, generic plans cancel, or My Library cancel as workout-context decline is repurpose and requires a new child.
- Compatibility contract:
  - Existing plans and My Library cancel telemetry keep working.
  - Unknown/future values stay out of dedicated workout-context decline metrics until mapped.
  - Future direct checkout or explicit dismiss controls require separate owner-approved children.
- Observability and repair:
  - Future dashboard/support work may expose bounded unknown/unmapped diagnostics, not raw payload JSON or provider/session identifiers.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Products/catalog items, CTA placement IDs, checkout attribution sources, plans route query params, checkout cancel params, decline reason keys, event payload dimensions, Admin Analytics modules, Help/Guide copy, locales, future shop routes, providers, exports, and finance/reporting surfaces.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Checkout attribution identity comes from `lib/commerce/checkout.ts` and architecture contracts.
  - Product IDs come from the catalog.
  - Admin counts come from `/api/admin/analytics/insights` only after a future mapping child.
  - Finance truth comes from reconciliation/export evidence, not analytics.
- Additive behavior:
  - Existing current-surface cancel telemetry and generic event lists continue to work.
  - The mapped workout-context cancel signal can later feed a dedicated module only after a separate Admin Analytics child maps denominator, zero behavior, copy, tests, and screenshots.
- Explicit mapping requirements:
  - New products, new placements, new sources, new cancel params, explicit dismiss controls, new reason keys, direct checkout, dedicated decline KPIs, finance reporting, CSV/export, raw drilldown, vendor analytics, localized commercial claims, or public landing/SEO copy require explicit mapping, tests, docs, and owner decision.
- Unknown or deprecated values:
  - Unknown source/placement/product/surface/reason values must fail closed for dedicated workout-context decline counts.
  - Unknown values must not imply conversion loss, purchase failure, entitlement failure, provider failure, revenue, refund, payout, invoice, accounting close, or finance truth.
- Test/evidence:
  - Future implementation must include mapped cancel, unmapped cancel, plans-owned cancel, My Library cancel, duplicate cancel, abandoned checkout, checkout-create failure, provider failure, unknown product, unknown placement, future source, unsafe payload, and no-private-workout-data fixtures.
  - Route/label/support sweep is required before broad gates.

## Scope

- Create/refresh typed runtime attribution behavior for the existing `/plans` checkout-cancel return.
- Update focused unit/component/page tests for checkout cancel payload construction and event emission.
- Update API/architecture/Help/Guide or runbook copy only where the runtime meaning or support interpretation changes.
- Update the parent checkpoint while this child is active and close it out after merge.

## Out Of Scope

- Widening this execution beyond the approved runtime attribution child.
- Admin Analytics decline mapping, stage summary decline denominator, dashboard UI, screenshots, or report copy.
- Direct workout-context checkout, new shop route, new products/prices, product catalog mutation, Stripe Session/webhook/provider changes, entitlement rules, finance/revenue/reporting, refunds, payouts, invoices, accounting exports, CSV/export, raw drilldown, vendor analytics, migrations, RLS, generated DB types, visible redesign, explicit dismiss UI, or builder/generator algorithm changes.
- Treating ignored users, abandoned checkout, checkout-start without completion, checkout creation failure, provider failure, payment failure, entitlement lag, refunds, or finance state as decline.

## Help / Guide Impact

- Future execution must update Admin Help/Guide or a linked runbook if operator-facing support interpretation changes.
- Required copy boundaries:
  - mapped checkout cancel means return-from-checkout only for the approved saved-workout Poolside path,
  - generic plans/My Library cancel stays separate,
  - absence of cancel is unknown,
  - counts are selected-range telemetry events, not unique users,
  - cancel is not payment failure, provider failure, entitlement failure, revenue, refund, payout, invoice, accounting export, Stripe reconciliation, or finance reporting.
- If execution changes no visible Help/Guide copy, record explicit `N/A` rationale in the child checkpoint.

## Screenshot / Visual Impact

- Planned scope has no rendered UI, print, layout, brand, style, or product asset change; screenshot handoff is N/A.
- If execution changes rendered UI, copy, layout, CSS, visual state, print/export artifact, or brand surface, capture `after/reference` or `before/after` screenshot artifacts and stop for owner approval before `npm run verify:pre-pr`.

## Route / Label / Support Surface Sweep

Required before the first broad gate because this child changes event meaning and support interpretation.

Search identifiers:

- `upsell_declined`
- `checkout_cancelled`
- `checkout=cancelled`
- `TrackCheckoutCancel`
- `CheckoutButton`
- `workout_context`
- `workout_saved_post_success`
- `guide_poolside`
- `placementId`
- `source=workout_context`
- `source=plans`
- `plans_checkout_return`
- `/plans`
- `/api/checkout/session`
- `Admin Analytics`
- `finance reporting`
- `Stripe reconciliation`
- `revenue`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/commerce/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- Help/Guide sources and assertions
- active/planned/done task briefs related to workout commercial analytics.

Sweep checkpoint:

- Command:
  `rg -n "upsell_declined|checkout_cancelled|checkout=cancelled|TrackCheckoutCancel|CheckoutButton|workout_context|workout_saved_post_success|guide_poolside|placementId|source=workout_context|source=plans|plans_checkout_return|/plans|/api/checkout/session|Admin Analytics|finance reporting|Stripe reconciliation|revenue" app components lib/analytics lib/commerce tests docs/api-contracts.md docs/architecture docs/runbooks docs/task-briefs/planned docs/task-briefs/in-progress docs/task-briefs/done`
- Result: expected fallout in checkout/cancel runtime files, tests, API contracts, architecture
  contracts, parent/child briefs, and historical done briefs. No route creation, Admin Analytics
  decline module, Stripe/webhook/provider behavior, entitlement, finance/export/vendor,
  product/pricing, migration/RLS, visible UI, or builder/generator scope was found.
- Follow-up stale-phrase sweep:
  `rg -n "checkout-cancel.*future child|future child.*checkout-cancel|decline/cancel remains contract-only|checkout-cancel or explicit dismiss remains contract-only|future runtime child.*checkout-cancel|remains unmapped.*checkout" docs/api-contracts.md docs/architecture docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md docs/task-briefs/done/2026-06-12-workout-context-checkout-cancel-runtime-attribution-v1-10-10.md`
- Result: corrected stale parent wording; remaining future-child references apply only to
  dashboard denominator/support copy, explicit dismiss, or later unmapped values.

## Acceptance Criteria

1. Future execution preserves mapped workout-context cancel attribution only for the approved saved-workout CTA -> `/plans` -> Poolside guide checkout cancel path.
2. Generic plans cancel, My Library cancel, other products, missing/malformed/future values, and unmapped placements do not enter mapped workout-context decline.
3. Payloads include only bounded low-cardinality fields and exclude checkout/provider/user/workout/finance identifiers.
4. Checkout cancel is documented and tested as selected-range telemetry, not unique-user conversion, payment failure, entitlement failure, revenue, or finance truth.
5. No Admin Analytics decline module, stage-summary denominator, direct checkout, Stripe/webhook, entitlement, finance, export, vendor, migration, product/pricing, visible UI, or builder/generator scope is added.
6. Route/label/support sweep evidence is recorded if execution starts.
7. Changed briefs pass `npm run lint:briefs`.

## Validation

Planning-only creation:

- `npm run lint:briefs`
- `git diff --check`

Future implementation:

- targeted `TrackCheckoutCancel`, `CheckoutButton`, `/plans`, and checkout helper Vitest coverage
- route/label/support sweep
- `npm run typecheck`
- `npm run lint:quality-gates`
- `npm run lint:briefs`
- `git diff --check`
- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

Validation checkpoint:

- `./node_modules/.bin/vitest run tests/unit/checkout-session-payload.test.ts tests/unit/checkout-button.test.tsx tests/unit/plans-page.test.tsx tests/unit/track-checkout-cancel.test.tsx` - pass, `4` files / `30` tests.
- `npm run typecheck` - pass.
- `npm run lint:quality-gates` - pass.
- `npm run lint:briefs:all` - pass, `484` briefs checked.
- `git diff --check` - pass.
- `npm run verify:pre-pr` - pass. Full lane selected because runtime/test/docs files changed; branch was current with `origin/main`. Gate included quality gates, admin audit, environment parity, PR body validation, lint/typecheck, unit tests (`241` files / `1544` tests), production build, performance budgets, and Playwright (`106` passed / `536` skipped).
- PR CI for `#1101` - pass after one rerun of an unrelated Vitest timer flake in `PoolsidePreviewPageClient`; rerun passed `verify`, and all other checks were green.
- `npm run verify:pre-merge` - pass; branch was current with `origin/main` and reused the full public verify PASS for the same HEAD.

## Completion Record

- `completed`: `2026-06-12`
- `merged_pr`: `#1101`
- `squash_commit`: `cd769275`
- `result`: Closed Workout Context Checkout-Cancel Runtime Attribution V1. The existing saved-workout CTA -> `/plans` -> Poolside guide checkout-cancel path now carries bounded workout-context attribution for `upsell_declined`, while generic cancel telemetry, Admin Analytics decline denominator, Stripe/provider truth, entitlement truth, and finance reporting remain separate.
- `validation`: Targeted Vitest (`4` files / `30` tests), `npm run typecheck`, `npm run lint:quality-gates`, `npm run lint:briefs:all`, `git diff --check`, `npm run verify:pre-pr`, PR CI, and `npm run verify:pre-merge` passed. PR CI needed one rerun for an unrelated late Vitest timer after all unit tests had passed; rerun passed.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                 | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------ | ------------ |
| Product goals and IA                          | `5/5`          | PR `#1101`, checkout helper/component/page tests, API/architecture docs  | None         |
| UX flow clarity                               | `5/5`          | No visible UI/copy/layout changed; existing checkout flows preserved     | None         |
| Business logic correctness and data integrity | `5/5`          | Typed helper tests and cancel tracker negative-path coverage             | None         |
| Data placement and sync boundaries            | `5/5`          | Browser telemetry kept separate from checkout/provider/entitlement truth | None         |
| Reliability and failure handling              | `5/5`          | Missing/malformed/future/generic values fail closed in tests             | None         |
| Security and authz                            | `5/5`          | No authz widening; checkout/admin truth remains server-owned             | None         |
| Privacy and compliance                        | `5/5`          | Payload tests and docs exclude raw checkout/user/provider/finance IDs    | None         |
| Content governance                            | `5/5`          | Parent, API contracts, architecture contracts, and support caveats align | None         |
| Analytics and KPI observability               | `5/5`          | `upsell_declined` mapped only for exact source/placement/product/reason  | None         |
| Commerce and revenue ops                      | `5/5`          | No Stripe/session/webhook/catalog/price/finance changes                  | None         |
| Incident response and support operations      | `5/5`          | Support docs distinguish mapped cancel from generic/provider/finance     | None         |
| Finance and reporting operations              | `5/5`          | Finance/revenue/export remains explicitly out of scope                   | None         |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing Next.js components, TypeScript helpers, and tests        | None         |
| Testing and QA automation                     | `5/5`          | Targeted tests, full local gates, PR CI, and pre-merge gate passed       | None         |
| Scalability and cost efficiency               | `5/5`          | Low-cardinality bounded payload; no storage/vendor/export expansion      | None         |
| DevOps and rollback readiness                 | `5/5`          | Revert-only rollback; no migration/env/dependency cleanup needed         | None         |

## Rollback

- Planning-only rollback: delete this planned brief and restore the parent to no planned child.
- Future implementation rollback: revert the cancel attribution runtime changes and docs/tests; existing generic plans and My Library cancel telemetry should continue to work without migration, provider, env, schema, or dependency cleanup.

## Checkpoint Log

- `2026-06-12 | planned child created | after PR #1099 and repo-managed closeout PR #1100 merged, re-audited the parent and selected this as the next bounded analytics child. Scope is future runtime attribution for the existing mapped workout-context checkout-cancel return only, with no Admin Analytics decline module, direct checkout, Stripe/webhook, entitlement-rule, finance/export/vendor/product/builder scope approved | next: wait for explicit owner execute/build/implement instruction or scope edits`
- `2026-06-12 | child in progress | owner requested execution on branch workout-context-checkout-cancel-runtime-attribution-v1; active child remains scoped to runtime attribution for the existing mapped workout-context checkout-cancel return only, with no Admin Analytics decline module, direct checkout, Stripe/webhook, entitlement-rule, finance/export/vendor/product/builder scope approved | next: implement typed attribution helpers/callsites/tests/docs and run validation`
- `2026-06-12 | implementation checkpoint | implemented mapped checkout-cancel constants/helpers, cancelPath enrichment for the approved Poolside workout-context path, mapped cancel tracker parsing, focused tests, API/architecture/support docs, and route/label/support sweep evidence. Targeted Vitest passed for checkout payload, checkout button, plans page, and cancel tracker. No Admin Analytics decline module, direct checkout, Stripe/webhook, entitlement-rule, finance/export/vendor/product/builder scope was added | next: run typecheck, quality gates, brief lint, diff-check, verify:pre-pr, commit, push, PR, CI, and verify:pre-merge`
- `2026-06-12 | pre-pr gate passed | npm run verify:pre-pr passed the full lane on branch workout-context-checkout-cancel-runtime-attribution-v1 after focused tests, typecheck, quality gates, all-brief lint, and diff-check also passed. No screenshot handoff was required because no rendered UI/copy/layout/style changed | next: commit, push, open PR, monitor CI, and run verify:pre-merge before merge readiness`
- `2026-06-12 | merged | PR #1101 merged at squash commit cd769275 after green local pre-pr, PR CI, and pre-merge gates. The only CI rerun was for an unrelated Vitest late-timer flake after all unit tests passed; rerun passed. No rendered UI/copy/layout/style changed, so screenshot handoff remained N/A | next: repo-managed docs-only closeout`
