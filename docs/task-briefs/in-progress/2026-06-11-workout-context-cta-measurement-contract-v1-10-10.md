# Task Brief: Workout Context CTA Measurement Contract V1 (10/10)

## Metadata

- `id`: `2026-06-11-workout-context-cta-measurement-contract-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-11`
- `updated`: `2026-06-11`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-10-workout-context-upsell-placement-policy-v1-10-10.md`
  - `docs/architecture/workout-context-upsell-placement-policy.md`
  - `docs/task-briefs/done/2026-06-11-existing-upsell-event-admin-analytics-baseline-v1-10-10.md`
- `execution_mode`: `docs-contract-after-explicit-implement`
- `branch`: `workout-context-cta-measurement-contract-v1`

## Brief Audit Record

- `last_audited`: `2026-06-11`
- `base`: clean synced `main@a5b4760d` after PR `#1069` closed the existing upsell analytics baseline brief and `npm run post-merge:preflight` was clean.
- `audit_status`: `ready`
- `decision`: Execute this child as docs-only contract work on branch `workout-context-cta-measurement-contract-v1`.
- `reason`: Owner explicitly requested implementation. Placement policy and existing-surface Admin Analytics baseline are complete, and this child is limited to a durable measurement contract for a future workout-context CTA before any runtime CTA, event callsite, dashboard module, checkout, entitlement, Stripe, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog, or builder/generator UX change.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, the task brief template, scorecard categories, analytics event taxonomy, `ANALYTICS_EVENT_NAMES`, `analytics_events` schema/persistence, `/api/admin/analytics/insights`, Admin Analytics UI or Help/Guide contracts, `lib/commerce/catalog.ts`, checkout/Stripe/entitlement contracts, `docs/architecture/workout-context-upsell-placement-policy.md`, `docs/api-contracts.md`, screenshot handoff rules, or route/label/support sweep rules change.

## Goal

Create a docs-only measurement contract for the first workout-context CTA candidate so later runtime and dashboard children can instrument it without confusing CTA visibility, clicked intent, checkout, entitlement, Stripe reconciliation, or finance truth.

## Pre-Implementation Owner Explanation

Vi lager en kontrakt for hvordan en fremtidig workout-context CTA skal males for den bygges. Det gir trygg semantikk for placement-ID, produkt-ID, `upsell_*`-events, payload-felter og dashboard-tolkning. Utenfor scope er runtime CTA, ny UI, nye event callsites, checkout, Stripe, entitlement, finance, export, tredjeparts analytics, raw drilldown, migrasjoner, RLS og builder/generator UX.

Forward-compatibility-intent: nye CTA-plasseringer og produkter skal feile lukket eller vises som trygge unknown-diagnoser til de er eksplisitt mappet med tester, Help/Guide-kopi og support-tolkning.

## Product Questions

This child answers only these planning/contract questions:

1. Which first workout-context placement is eligible for later runtime exploration, and what stable machine `placementId` should identify it?
2. Which current catalog `productId` values may be considered for that placement, and when should missing, inactive, unknown, or unmapped products fail closed?
3. Which current or future `upsell_presented`, `upsell_accepted`, and `upsell_declined` meanings apply to workout context without changing the existing `/plans` and My Library baseline meanings?
4. Which low-cardinality payload dimensions are allowed, and which private workout, user, payment, URL, and free-text values are forbidden?
5. How should duplicate, retry, disabled, unknown, stale, capped, schema-missing, and failed-read states be interpreted by Admin Analytics and support?
6. What later child must own runtime CTA UI, event callsites, dashboard aggregation, screenshots, checkout attribution, entitlement logic, Stripe, finance, export, or vendor analytics?

## Implemented Contract Decision

This child creates only the docs-only contract at `docs/architecture/workout-context-cta-measurement-contract.md` and updates parent/API/policy references. It does not ship runtime behavior.

The contract uses the placement policy's first recommended runtime candidate as the bounded default:

- Initial placement category: saved-workout post-success state.
- Initial stable placement ID: `workout_saved_post_success`.
- Eligibility: only after successful canonical workout create/update, with save confirmation, edit/recovery/export actions remaining more prominent than any CTA.
- Forbidden states: active editing, unsaved edits, rearrange mode, validation, delete/discard, generator intake, generation/loading, provider failure, auth, entitlement, checkout recovery, support recovery, billing, finance, and admin/operator surfaces.

The contract audits the current catalog source before later runtime product mapping:

- Current candidate product IDs from `lib/commerce/catalog.ts`: `guide_0_1000m`, `guide_poolside`, `analysis_video`.
- Product identity must come from the catalog product ID, not CTA text, title, slug, route label, or Stripe price ID.
- Missing, inactive, unknown, deprecated, or unmapped product values fail closed for CTA presentation until a later runtime child defines safe behavior.

The contract defines future measurement semantics, while execution remains docs-only:

- `upsell_presented`: workout-context CTA was actually rendered in the mapped placement, not checkout start.
- `upsell_accepted`: user activated the mapped CTA, not checkout completion.
- `upsell_declined`: only an explicitly defined dismiss/cancel/return signal if a later child implements one; do not reuse checkout-cancel return semantics as all ignored users.
- Product telemetry remains separate from `checkout_started`, `checkout_completed`, `entitlement_granted`, Stripe reconciliation, revenue, refunds, payouts, invoices, and finance reporting.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                     | Evidence                                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Contract names exactly one first eligible workout-context placement and separates it from existing `/plans` and My Library commercial surfaces.                                        | architecture contract + parent checkpoint                               | `5/5`                   |
| UX flow clarity                               | `target`     | Contract states the primary workout job remains more prominent than any future CTA and lists forbidden states where no CTA may appear.                                                 | placement matrix/contract acceptance criteria                           | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: this docs-only child adds no rendered UI; future runtime/dashboard child must provide screenshot handoff using repo visual rules.                                     | screenshot N/A rationale + future screenshot rule                       | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Contract defines event meanings, duplicate/retry behavior, zero/unknown handling, and prevents counting checkout, entitlement, or finance truth as CTA performance.                    | contract tables + route/label/support sweep                             | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: no admin editor, placement config, or publish workflow changes; later editable config needs its own child.                                                            | admin workflow scope rationale                                          | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: no visible UI changes; future CTA/dashboard child must preserve headings, focus, labels, keyboard, and screen-reader flow.                                            | explicit future a11y requirement                                        | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no runtime route or bundle change; future CTA child must avoid vendor/chart/dependency bloat and set route-level budgets.                                             | docs-only changed-files review                                          | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Contract states analytics rows are server-canonical, browser CTA emissions are best-effort, and product/entitlement/finance truth comes from separate canonical systems.               | data placement section in architecture contract                         | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Contract requires later runtime/dashboard children to define cache mode, invalidation, stale-state behavior, and kill-switch behavior before release.                                  | cache/invalidation contract section                                     | `5/5`                   |
| Reliability and failure handling              | `target`     | Contract defines fail-closed behavior for unknown, disabled, inactive, schema-missing, stale, capped, failed-read, and unavailable product states.                                     | reliability/fallback matrix                                             | `5/5`                   |
| Security and authz                            | `target`     | Contract forbids widening public/admin/user access and requires later protected/runtime children to keep fail-closed authn/authz with negative tests.                                  | security/authz section + route/support sweep                            | `5/5`                   |
| Privacy and compliance                        | `target`     | Contract forbids raw workout text, private workout IDs, emails, user IDs, visitor IDs, IPs, user agents, raw URLs/referrers, payment data, Stripe IDs, and free text in CTA analytics. | forbidden payload table + privacy sweep                                 | `5/5`                   |
| Content governance                            | `target`     | Contract updates durable docs and parent checkpoint so later children inherit clear event, placement, product, and support interpretation rules.                                       | architecture doc + parent checkpoint + lint:briefs                      | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin mutation or editable placement workflow ships; future placement config/editor work needs an explicit child.                                                  | scope rationale                                                         | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this docs-only contract adds no public route, metadata, sitemap, robots, canonical URL, structured data, or crawlable product content.                                     | explicit SEO scope rationale                                            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this docs-only contract adds no public semantic page, public docs page, structured data, or AI-facing crawl surface.                                                       | explicit AI-discoverability scope rationale                             | `N/A`                   |
| Analytics and KPI observability               | `target`     | Contract defines CTA event semantics and dashboard caveats before any dedicated workout-context CTA KPI module is allowed.                                                             | event/dashboard interpretation contract                                 | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Contract keeps CTA telemetry separate from checkout start/completion, entitlement grants, product catalog truth, Stripe reconciliation, and purchase recovery.                         | commerce boundary section                                               | `5/5`                   |
| Incident response and support operations      | `target`     | Contract gives support clear explanations for absent CTA, unknown mapping, disabled placement/product, stale analytics, failed reads, and non-finance interpretation.                  | support interpretation section + sweep                                  | `5/5`                   |
| Finance and reporting operations              | `target`     | Contract explicitly states workout-context CTA telemetry is not revenue, refund, payout, invoice, accounting export, entitlement, Stripe reconciliation, or finance truth.             | finance boundary section + wording sweep                                | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: machine IDs stay locale-independent and display labels remain renameable; full localized commercial copy needs a future owner-approved child.                         | identity/rename contract                                                | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Docs-only child reuses existing architecture/task-brief patterns and adds no dependency, runtime route, migration, vendor, checkout, or UI surface.                                    | changed-files review + package diff                                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass `npm run lint:briefs`; docs-only execution also runs docs-only/pre-pr gates as required before PR.                                                                 | `npm run lint:briefs` + `git diff --check` + verify gates when executed | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Contract keeps future CTA dimensions low-cardinality and bounded; raw drilldown, export, warehouse, or per-user analytics require separate scope.                                      | payload/dimension contract                                              | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Docs-only contract is revertable without migration/provider/env changes; future runtime child must define rollback, kill switch, and support diagnostics before release.               | rollback section + no runtime changed-files evidence                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - This child is docs-only and must not change routes, server/client components, actions, API routes, cache behavior, or runtime CTA rendering.
  - Future runtime CTA work must identify the mature workout post-save/review surface and keep primary workout actions more prominent than commercial actions.
  - Future dashboard work must reuse `components/admin/AdminAnalyticsDashboard.tsx` and `lib/analytics/admin-dashboard.ts`.
- TypeScript/domain contracts:
  - This child may name future `placementId` and payload keys, but must not add event names, types, helpers, callsites, or dashboard aggregators.
  - Future runtime work must type event names through `ANALYTICS_EVENT_NAMES`, sanitize dimensions, bound cardinality, and define deterministic unknown/fallback states.
- Supabase/data layer:
  - No migration, RLS change, generated DB type update, rollup job, index, raw drilldown, or export path is allowed in this docs-only child.
  - Future analytics reads must use bounded aggregate rows and must not expose raw payload JSON to Admin UI.
- External services/tools:
  - No Stripe API, Checkout Session, webhook, portal, entitlement, finance script, vendor analytics, tag manager, cookie/consent, secret, or SDK change.
  - Future commerce/checkout children must use official Stripe docs/SDK patterns, least-privilege secrets, idempotency, webhook verification, and finance/support diagnostics.
- UI system:
  - No visible UI, screenshot, style, or product asset change in this docs-only child.
  - Future runtime/dashboard UI children require screenshot handoff and owner approval before `npm run verify:pre-pr`.
- Testing:
  - This planned brief creation requires `npm run lint:briefs` and `git diff --check`.
  - If executed as docs-only contract, run docs-only validation and `npm run verify:pre-pr` before PR update.

## Data Placement And Sync Contract

- Server-canonical:
  - Future persisted CTA analytics rows in `analytics_events`, catalog product identity from `lib/commerce/catalog.ts`, entitlement state from entitlement storage, and checkout/Stripe truth from checkout/webhook contracts.
- Local/browser:
  - Future browser CTA visibility/click emissions may be best-effort only and may duplicate on retry.
  - No analytics cookie, visitor ID, localStorage attribution, ad click ID, user-to-public bridge, or admin preference is added by this child.
- Sync behavior:
  - Future CTA event writes are product telemetry and must not mutate product catalog, checkout, entitlement, finance, or support truth.
  - Future Admin Analytics reads remain bounded aggregate reads, not raw user drilldown.
- Retention and sensitivity:
  - Existing analytics retention applies to future analytics rows unless a later child changes it.
  - Raw workout title, notes, step text, generated prompt, raw workout JSON, private workout row ID, email, user ID, visitor ID, IP, User-Agent, fingerprint, raw URL/referrer/query, cookie/localStorage attribution, ad click ID, payment method, cart details, Stripe IDs, support messages, and free text are forbidden.
- Cache/invalidation:
  - This docs-only child changes no cache.
  - Future runtime CTA child must define placement/product cache mode, invalidation, stale behavior, rollback, and kill switch before implementation.

## Identity And Rename Contract

- Canonical stable IDs:
  - Placement identity must be a stable machine `placementId`; initial candidate to validate or revise is `workout_saved_post_success`.
  - Event identity is the append-only event name: `upsell_presented`, `upsell_accepted`, `upsell_declined`.
  - Product identity is canonical `CatalogProductId`, currently one of `guide_0_1000m`, `guide_poolside`, or `analysis_video`.
- Human-readable identifiers:
  - CTA copy, dashboard labels, product titles, slugs, route labels, and Help/Guide text are display-only and renameable when meaning is unchanged.
- Mutability rules:
  - Placement IDs are write-once after they appear in analytics, docs, support diagnostics, or tests.
  - Event names are append-only; changing meaning requires a new event name or explicit alias/migration child.
  - Product IDs come from the catalog and are not replaced by text labels or Stripe price IDs.
- Rename vs repurpose:
  - Label-only copy changes are renames when the same placement/action/product meaning remains.
  - Moving a CTA to a materially different user moment, counting a different action under an existing event, or treating CTA telemetry as checkout/finance truth is repurpose and requires a new child.
- Compatibility contract:
  - Unknown, deprecated, disabled, inactive, or unmapped placement/product values fail closed for CTA presentation until mapped.
  - Unknown values may appear only as safe aggregate diagnostics after a later dashboard child maps them.
- Observability and repair:
  - Future runtime/dashboard children must expose disabled/unknown/stale states to admin/support without raw payload drilldown.
  - Legacy identifiers require alias/migration handling before they affect dedicated ratios.

## Forward Compatibility Contract

- Extensibility surfaces:
  - CTA placement IDs, product IDs, product availability, event names, payload dimensions, builder/source/template categories, checkout attribution, entitlement states, route templates, Admin Analytics modules, Help/Guide copy, locales, export formats, vendor forwarding, and finance/reporting surfaces.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Product IDs come from `lib/commerce/catalog.ts`.
  - Checkout truth comes from checkout/session and Stripe/webhook contracts.
  - Entitlement truth comes from server-canonical entitlement state.
  - Finance truth comes from Stripe/accounting reconciliation, not product telemetry.
- Additive behavior:
  - New approved event names can appear in generic Admin Analytics lists automatically.
  - New catalog products may be eligible only after a mapping child decides product/placement fit and safe fallback behavior.
  - Existing current-surface upsell baseline remains separate from future workout-context CTA metrics.
- Explicit mapping requirements:
  - New workout-context placements, new product mappings, new `upsell_*` meanings, checkout attribution, entitlement-aware targeting, finance reporting, raw drilldown, CSV/export, vendor analytics, localized commercial claims, and public landing/SEO copy require explicit owner mapping, tests, docs, and support copy.
- Unknown or deprecated values:
  - Unknown, deprecated, disabled, inactive, or unmapped placement/product/source values fail closed for CTA presentation.
  - Unknown values must not imply conversion, entitlement, revenue, or finance truth.
- Test/evidence:
  - This docs-only child must include route/label/support sweep evidence when executed.
  - Future implementation children must include fixtures for allowed placement, forbidden states, unknown placement, unknown product, inactive product, duplicate event, zero denominator, stale/capped/schema-missing reads, and unsafe payload rejection.

## Scope

- Create or update a docs-only measurement contract for workout-context CTA analytics.
- Update this child brief and parent checkpoint/next-child references.
- Define first placement/product/event/payload/dashboard/support boundaries before runtime work.
- Keep the work in docs, architecture, and planning surfaces only.

## Out Of Scope

- Runtime workout-context CTA UI.
- New event names, event callsites, payload helpers, ingestion changes, or Admin Analytics aggregation/UI.
- Checkout, Stripe, webhook, portal, entitlement, finance, accounting, refund, payout, invoice, vendor analytics, export, raw drilldown, migration, RLS, route, product catalog, or builder/generator UX changes.
- Treating builder/generator/template telemetry, checkout events, or entitlements as CTA performance.
- Opening, merging, or shipping a runtime implementation PR from this planned brief without explicit owner execution approval.

## Help / Guide Impact

- Planned brief creation: no visible Help/Guide product change.
- Docs-only contract execution: architecture/support interpretation docs were updated through the new measurement contract, placement policy reference, and API caveat. User-facing Help/Guide copy is unchanged because no visible admin/user labels or workflows changed.
- Future runtime/dashboard CTA child must update Admin Help/Guide or linked runbooks with:
  - what workout-context `upsell_presented`, `upsell_accepted`, and `upsell_declined` mean,
  - what they do not mean: unique users, checkout completion, entitlement, revenue, Stripe reconciliation, or finance truth,
  - how disabled, unknown, stale, capped, schema-missing, failed-read, duplicate, and zero states should be interpreted.

## Screenshot / Visual Impact

- Planned brief creation and docs-only contract execution: screenshot handoff is N/A because no rendered UI, print, layout, brand, style, or product asset changes.
- Future runtime/dashboard UI child:
  - must use `before/after` or `after/reference` naming as required by AGENTS.md,
  - must include desktop, mobile, and at least one non-happy/trust state when relevant,
  - must stop for owner screenshot approval before `npm run verify:pre-pr`.

## Route / Label / Support Surface Sweep

Required when this child is executed because it defines event, placement, product, support, and finance interpretation rules.

Search at minimum:

- `workout_saved_post_success`
- `upsell_presented`
- `upsell_accepted`
- `upsell_declined`
- `checkout_started`
- `checkout_completed`
- `entitlement_granted`
- `guide_0_1000m`
- `guide_poolside`
- `analysis_video`
- `workout-context`
- `Admin Analytics`
- `Help/Guide`
- `Stripe`
- `finance`
- `revenue`
- `export`
- `raw drilldown`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/commerce/`
- `lib/workouts/`
- `lib/session-generator-v1/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- relevant Help/Guide sources and assertions
- active/planned/done workout, analytics, commerce, AW-006, and AW-022 briefs.

Sweep evidence on `2026-06-11`:

- Ran `rg -l --hidden --glob '!node_modules' --glob '!.next' 'workout_saved_post_success|upsell_presented|upsell_accepted|upsell_declined|checkout_started|checkout_completed|entitlement_granted|guide_0_1000m|guide_poolside|analysis_video|workout-context|Admin Analytics|Help/Guide|Stripe|finance|revenue|export|raw drilldown' app components lib tests docs scripts package.json | sort`.
- Checked runtime, analytics, commerce, workout, generator, tests, docs, runbooks, active/planned/done briefs, and Help/Guide-related sources.
- Expected broad matches exist for existing analytics, commerce, finance, export, and Admin Analytics surfaces.
- Updated only docs/support interpretation surfaces: `docs/architecture/workout-context-cta-measurement-contract.md`, `docs/architecture/workout-context-upsell-placement-policy.md`, `docs/api-contracts.md`, this child brief, and the parent brief.
- No product route, UI label, Help/Guide visible copy, event taxonomy, runtime callsite, dashboard module, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, product catalog, or builder/generator UX update was required.

## Acceptance Criteria

1. A docs-only measurement contract exists or this child records a clear blocker before runtime CTA work.
2. The contract names exactly one first eligible placement category and a stable `placementId`, or records why that decision is blocked.
3. The contract audits current catalog product IDs and defines exact mapping/fail-closed behavior for missing, inactive, unknown, deprecated, and unmapped products.
4. `upsell_presented`, `upsell_accepted`, and `upsell_declined` workout-context meanings are explicit and do not change current `/plans` or My Library baseline semantics.
5. Forbidden payload values and allowed low-cardinality dimensions are documented.
6. Checkout, Stripe, entitlement, finance, vendor analytics, export, raw drilldown, migration, RLS, route, product catalog, runtime CTA, Admin Analytics UI, and builder/generator UX remain out of scope.
7. Help/Guide/support and route/label/support sweep impact is recorded.
8. Changed briefs pass `npm run lint:briefs`.

## Validation

Planned brief creation:

- `npm run lint:briefs`
- `git diff --check`

Docs-only contract execution:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`
- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

Runtime implementation is intentionally not part of this child.

Validation evidence:

- `npm run lint:briefs:all` passed on `2026-06-11`.
- `git diff --check` and `git diff --cached --check` passed on `2026-06-11`.
- `npm run lint:briefs` was run before the branch had committed diff and reported no changed task briefs; `npm run verify:pre-pr` will rerun the branch-level brief gate before PR update.
- Pending after commit: `npm run verify:pre-pr`, required PR CI checks, and `npm run verify:pre-merge`.

## Session Continuity And Recovery

- Canonical parent path: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Active child path: `docs/task-briefs/in-progress/2026-06-11-workout-context-cta-measurement-contract-v1-10-10.md`
- Contract path: `docs/architecture/workout-context-cta-measurement-contract.md`
- Existing placement policy: `docs/architecture/workout-context-upsell-placement-policy.md`
- Latest completed child path: `docs/task-briefs/done/2026-06-11-existing-upsell-event-admin-analytics-baseline-v1-10-10.md`
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. Reopen this child brief, the parent brief, placement policy, and latest completed child, then continue from the latest checkpoint.

## Checkpoint Log

- `2026-06-11 | planned child created | created planned child brief from clean synced main@a5b4760d after PR #1069 and clean post-merge preflight; implementation is not approved yet and must remain docs-only contract work unless the owner explicitly requests execution; no runtime CTA, event callsite, dashboard, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog, or builder/generator UX scope approved | next: wait for owner implementation approval or scope edits`
- `2026-06-11 | child moved to in-progress | owner requested implementation of Workout Context CTA Measurement Contract V1 on branch workout-context-cta-measurement-contract-v1; child moved to docs/task-briefs/in-progress/2026-06-11-workout-context-cta-measurement-contract-v1-10-10.md and remains docs-only, with no runtime workout-context CTA, new event callsites, Admin Analytics runtime modules, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog mutation, or builder/generator UX scope approved | next: complete docs contract, targeted validation, pre-pr gate, PR, CI, and pre-merge gate`
- `2026-06-11 | docs contract implemented before validation | added docs/architecture/workout-context-cta-measurement-contract.md, updated placement policy and API caveats to point future runtime work at the contract, and recorded route/label/support sweep evidence; no runtime workout-context CTA, new event callsites, Admin Analytics runtime modules, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog mutation, or builder/generator UX scope was added | next: run targeted docs validation and pre-pr gate`
