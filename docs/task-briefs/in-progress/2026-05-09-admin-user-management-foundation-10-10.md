# Task Brief: Admin User Management And Privacy-Safe Product Insights Foundation (10/10)

## Metadata

- `id`: `2026-05-09-admin-user-management-foundation-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-09`
- `updated`: `2026-06-09`
- `execution_mode`: `owner explicitly said execute/build/implement on 2026-06-09`

## Active Implementation Slice

- `slice`: `public-analytics-foundation`
- `branch`: `public-analytics-foundation`
- `started`: `2026-06-09`
- `base`: `main@e43a79a6`
- `scope`: privacy-first public website/sales analytics foundation only.
- `included`: Plausible-first vendor decision record, public route/product/content analytics contract, safe generic funnel events, sanitizer hardening, privacy/cookie copy updates, no approved Meta/GA4/GTM/Hotjar/Clarity loading, and future route/product fixtures.
- `excluded`: full admin `Users` module, persisted Supabase telemetry tables/rollups, dashboards/graphs beyond contract fixtures, Meta/GA4/GTM/Hotjar/Clarity, session replay/heatmaps, detailed cart/video analytics, automatic messaging, and any anonymous-public-to-user-profile bridge.

## Active Slice Evidence

- API/server failure-mode evidence:
  - no unexpected 500 behavior is introduced for `/api/analytics/event`;
  - invalid content type, invalid JSON, and invalid event names still return deterministic non-500 errors;
  - public client events intentionally record `userId: null` even when an auth cookie exists;
  - product/admin client events still attach the signed-in user ID where appropriate.
- Route/label/support sweep evidence:
  - identifiers searched: `Meta Pixel`, `GA4`, `Google Tag Manager`, `Hotjar`, `Clarity`, `Plausible`, `public_page_viewed`, `public_cta_clicked`, `product_viewed`, `routeTemplate`, `routeCategory`, `productId`, `productType`, `shop`, `catalog`, `cookies`, and `privacy`.
  - surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/runbooks/`, `docs/api-contracts.md`, and this active brief.
  - fallout handled: policy copy, API contract, runbook assessment, route/product fixtures, and tests were updated in the same slice; no active Meta/GA4/GTM/Hotjar/Clarity vendor script was found or added.
- Screenshot approval stop evidence:
  - owner screenshot approval was received after handoff for `output/public-analytics-foundation-2026-06-09-170348`;
  - mobile context screenshots were added after owner review found the tight mobile card crop too white;
  - `data-testid` hooks were added before the refreshed mobile context screenshots, and no product-rendering files changed after the final owner approval.

## Brief Audit Record

- `last_audited`: `2026-06-09`
- `base`: `main@e43a79a6`
- `audit_status`: `ready-for-owner-review`
- `decision`: Refresh the old access-only admin user brief into the durable 10/10 plan for user administration, privacy-safe usage insight, public website/sales analytics boundaries, future route/product/content analytics compatibility, course/site progress, communication preferences, admin audit logging, and current admin token/button/form design.
- `reason`: Owner asked for a 10/10 brief covering user administration, usage/site insight, sales funnel tracking, and GDPR-safe logging without violating GDPR/Norwegian/EU rules, then asked to harden the brief so future public pages, shop/catalog products such as swim mugs, courses, lessons, and more content are covered safely when the platform grows. The existing planned brief was stale, focused mostly on access grants, and did not cover first-party telemetry, public website analytics, funnel/retention metrics, course progress, online/friction signals, privacy preferences, messaging choices, admin audit log, current AW-006 admin visual direction, or route/product/content forward compatibility.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, Datatilsynet/EDPB guidance, GDPR/ePrivacy/ekom cookie guidance, Nkom cookie guidance, Plausible/Simple Analytics/Meta/Google vendor facts, admin workspace tabs, public route inventory, public route analytics registry, product/catalog helpers, shop/catalog routes, Stripe product/price metadata, public landing/plans/checkout routes, `lib/analytics/events.ts`, Supabase auth/profile tables, course lesson runtime IDs, Habits/Micro Sessions data contracts, user export/delete behavior, admin messages/email provider contracts, Help/Guide, privacy/cookie pages, screenshot handoff rules, route/label/support sweep rules, or verification lanes change before execution.

## Goal

Build a privacy-safe admin foundation where Freeswimming can understand user access, public sales funnel performance, future public route/content performance, coarse product/catalog usage, course progress, retention, friction, and follow-up needs without exposing private training/habit content or creating hidden surveillance.

## Pre-Implementation Owner Explanation

Vi lager en felles admin- og personvernmodell for alle brukere, ikke en egen testbruker-ordning. Admin skal kunne se om offentlig nettside og salgstrakt fungerer, om folk bruker appen, hvor de stopper, og om de trenger høflig oppfølging, men uten å lese private habit-navn, notater, fritekst eller full klikkhistorikk.

Hvorfor det betyr noe: før flere brukere kommer inn må vi vite om Course, Habits og Micro Sessions faktisk fungerer, samtidig som brukerne skal føle tillit og forstå hva som logges.

Utenfor scope er full session replay, heatmaps, tastetrykk, detaljerte video-analytics, private profilinnhold, automatisk massemeldinger, tredjeparts annonsepiksler/adtech, hard delete, dashboards/graphs utover første admin-oversikt, global sound settings, uploaded/user-selected sounds, og persistent Micro Sessions telemetry.

Fremoverkompatibilitet: nye offentlige sider, nettbutikkflater, produkter som svømmekrus, kurs, leksjoner, habit-typer, Micro Session-varianter, meldingstyper og analytics events skal enten flyte gjennom typed contracts, route templates, produktkatalog/runtime-ID-er og sikre fallback-regler, eller kreve eksplisitt mapping, tester, privacy/docs-oppdatering og owner-beslutning før de logges eller vises i admin.

## Product Decision

Use one general model for all users:

- no separate `Testprogram` toggle in the product;
- no generic admin access to full private profiles;
- admin sees minimized operational and product-improvement signals;
- public website/sales analytics stays separate from logged-in product/admin analytics unless a later privacy review approves a specific bridge;
- public route, product, shop, course, and content analytics must use route templates, canonical catalog/product IDs, Stripe/entitlement truth, and course/lesson runtime IDs rather than mutable titles, slugs, full URLs, or today-only hardcoded rows;
- optional communications and non-essential tracking controls live in normal privacy/product-preference surfaces;
- deeper support access, if ever needed, is explicit, time-limited, auditable, and scoped to diagnostics rather than private content.

## Regulatory Source Baseline

Primary official references to re-check before implementation:

- Datatilsynet: information and transparency for personal data processing.
- Datatilsynet: privacy by design and privacy by default.
- Datatilsynet: data minimization, including limiting collection, storage, reuse, and degree of identification.
- Datatilsynet: consent requirements for cookies and similar tracking technologies; refusal must not be harder than acceptance, consent must be active, specific, informed, documented, and easy to withdraw.
- Datatilsynet: DPIA/high-risk assessment when processing creates elevated risk for rights and freedoms.
- Nkom: whether a technical solution is covered by Norwegian cookie/similar-technology rules and whether any strictly-necessary exemption applies.
- Plausible and Simple Analytics official docs: privacy-first public website analytics capabilities, data points, hosting, cookie/storage behavior, and processor/controller claims.
- Meta/Google/Hotjar/Clarity official docs: re-check before any future ad pixel, tag manager, heatmap, replay, or behavioral advertising scope; these are not approved by this foundation.

Implementation must record a short privacy assessment before runtime logging ships. If the assessment finds high risk, complete a DPIA or narrow scope before release.

## Current Repo Context

- Existing admin shell reference:
  - `components/admin/AdminWorkspace.tsx`
  - current tab/card/action style uses `fs-library-card`, `fs-cta-*`, admin token classes, lucide icons, compact filters, and dense scan-friendly admin panels.
- Existing analytics reference:
  - `lib/analytics/events.ts`
  - `app/api/analytics/event/route.ts`
  - existing tests around safe payload sanitization and known event names.
- Existing user privacy operations references:
  - `lib/user/export.ts`
  - `lib/user/delete.ts`
  - `app/api/user/export/route.ts`
  - `app/api/user/delete/route.ts`
- Existing messaging/admin references:
  - `components/admin/AdminMessagesManager.tsx`
  - `docs/task-briefs/deferred/2026-05-06-admin-message-reply-outbound-log-10-10.md`
  - `docs/runbooks/admin-message-inbox.md`
- Existing member/course/product surfaces to instrument only through safe events:
  - `/course`, `/my-library/habits`, `/my-library/dryland`, `/my-library/calendar`, `/my-library`.
- Existing public sales/trust surfaces to instrument only through aggregate or consent-safe public events:
  - `/`, `/plans`, `/checkout/success`, `/contact`, `/privacy`, `/cookies`, `/our-method`, `/programs`, `/analysis`, `/course`, `/guides/0-1000m`, `/guides/poolside`, `/claim`, `/auth/sign-in`, `/go/unavailable`, and course/guide/product CTA locations.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Commerce and revenue ops
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                                                                                                                                          | Evidence                                                                |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Product goals and IA                          | `target`     | Admin has a clear `Users` area for identity/access, public route/product/content funnel and retention health, online/last-active state, coarse product usage, course progress, friction, support follow-up, communication preferences, and privacy status without exposing private content.                                                 | IA review + admin screenshot handoff + owner QA                         |
| UX flow clarity                               | `target`     | Admin can answer: who is active, where did they stop, what should I do next, and may I contact them; user preferences clearly explain what is logged and why.                                                                                                                                                                               | admin workflow QA + preference-copy review + e2e                        |
| Visual design quality                         | `target`     | New admin users/insights surfaces reuse current admin token/card/input/action direction; buttons use `fs-cta-*`, icon+label where useful, stable mobile action layout, and no oversized marketing-style UI.                                                                                                                                 | after/reference screenshot handoff against admin workspace              |
| Business logic correctness and data integrity | `target`     | Telemetry events, route templates, product/catalog dimensions, rollups, access grants, privacy preferences, course progress, messaging actions, and admin audit events have deterministic schemas, idempotent writes where needed, and no silent cross-user mutation.                                                                       | domain/API tests + migration constraints                                |
| Admin editor ergonomics                       | `target`     | Admin can search/filter users, inspect minimized detail, see friction/course/module status, send or draft allowed follow-up, and review audit history with minimal clicks and clear confirmations.                                                                                                                                          | admin e2e + owner QA                                                    |
| Accessibility (a11y)                          | `target`     | Admin tables/cards/detail panels, preference forms, toggles, filters, action buttons, confirmations, and status output are keyboard/screen-reader usable with valid focus and contrast.                                                                                                                                                     | a11y assertions + keyboard e2e + screenshots                            |
| Performance (CWV + payloads)                  | `target`     | Admin user/insight route uses paginated/indexed reads and rollups; client payload remains bounded; user-facing telemetry adds no visible route-speed regression.                                                                                                                                                                            | query/index review + build/perf budget evidence                         |
| Data placement and sync boundaries            | `target`     | Server-canonical vs local-only vs derived rollup data is explicit for identity, access, preferences, route/product/content telemetry, course progress, online presence, and support contact state.                                                                                                                                          | data-boundary review + tests                                            |
| Caching and invalidation strategy             | `target`     | Admin reads are dynamic/admin-scoped; event ingestion is append-only or idempotent; rollups refresh predictably; preference changes invalidate affected UI and future event collection.                                                                                                                                                     | cache/revalidation review + route tests                                 |
| Reliability and failure handling              | `target`     | Telemetry failure never blocks core user flows; admin mutations fail closed; event/rollup lag is visible; partial failures show retryable admin states.                                                                                                                                                                                     | negative-path tests + runtime guards                                    |
| Security and authz                            | `target`     | Only authorized admins can view user insights or audit logs; non-admin/editor/viewer/direct API attempts fail closed; service-role access is server-only and least-privilege guarded; unapproved third-party pixels/scripts do not load.                                                                                                    | API negative-path tests + RLS/authz review + network/CSP review         |
| Privacy and compliance                        | `target`     | Data minimization, purpose limitation, legal-basis notes, cookie/tracking consent handling, public analytics separation, retention, access logging, user rights, and no sensitive payload leakage are documented and enforced.                                                                                                              | privacy assessment + payload/log review + docs updates                  |
| Content governance                            | `supporting` | Public route labels, product display names, course lesson labels/runtime IDs, and Help/Guide/privacy copy are touched only as references; no editorial publish workflow changes ship unless needed for safe route/content analytics naming.                                                                                                 | route/content identity review + Help/Guide diff                         |
| Admin workflow and editability                | `target`     | Admin actions that affect users, access, messaging, preferences, or support notes are confirmed where risky, status-visible, reversible where practical, and audit-logged.                                                                                                                                                                  | admin e2e + audit-log tests                                             |
| SEO and crawlability                          | `N/A`        | N/A with rationale: admin user insight surfaces are private/admin-only and must not be crawlable or sitemap-visible; public metadata/SEO behavior is unchanged.                                                                                                                                                                             | private-route scope rationale                                           |
| AI discoverability                            | `N/A`        | N/A with rationale: no public AI-discoverable page, structured data, crawl-safe entity surface, or AI-facing content contract changes in this admin/privacy slice.                                                                                                                                                                          | explicit AI-discoverability scope rationale                             |
| Analytics and KPI observability               | `target`     | Day-one taxonomy covers public route-template/referrer/device/country signals, registration/login, safe product/catalog actions, public-to-product funnel cohorts, D1/D7/D30/MAU retention, course progress, friction, online/last-active, preference state, and admin contact actions with PII redaction and actionable dashboard metrics. | analytics contract tests + dashboard/future-value fixtures              |
| Commerce and revenue ops                      | `target`     | Course/subscription/shop purchase metrics derive from canonical catalog plus Stripe/entitlement truth and safe checkout events only; checkout, pricing, invoices, refunds, payouts, and finance reporting remain unchanged.                                                                                                                 | commerce impact review + Stripe/catalog event reconciliation tests      |
| Incident response and support operations      | `target`     | Support can diagnose lost access, inactivity, course friction, habit/micro-session setup friction, public/source attribution gaps, telemetry gaps, consent state, and admin misuse risk without raw DB inspection.                                                                                                                          | runbook + admin audit log + deterministic support codes                 |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this slice may read Stripe/entitlement truth for aggregate purchase metrics, but changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement mutation, or revenue operation.                                                                               | explicit finance scope rationale                                        |
| i18n operational readiness                    | `target`     | Event labels, preference copy, status labels, admin filters, and button/form text use typed label helpers and fit longer localized strings without fixed-width clipping.                                                                                                                                                                    | label contract review + mobile/desktop screenshots                      |
| Stack-fit and dependency discipline           | `target`     | Reuse Next.js, TypeScript, Supabase, existing analytics helpers, current admin workspace, `fs-cta-*`, `ui-field`, and first-party storage for product/admin analytics; if public website analytics needs a vendor, prefer Plausible first and Simple Analytics second after processor/privacy review.                                       | architecture review + package diff + vendor decision record             |
| Testing and QA automation                     | `target`     | Unit/domain/API/component/e2e coverage protects event schema, sanitization, preferences, admin access, rollups, course progress, messaging actions, audit log, and negative paths.                                                                                                                                                          | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge`              |
| Scalability and cost efficiency               | `target`     | Event writes, rollups, indexes, retention cleanup, and pagination keep cost bounded as users/events grow; no full clickstream or full-table admin load ships.                                                                                                                                                                               | query/index/retention review + load-shaped tests                        |
| DevOps and rollback readiness                 | `target`     | Schema changes are migration-backed; RLS fails closed; generated DB types update; rollback can disable telemetry collection while preserving admin access and user rights workflows.                                                                                                                                                        | migration/rollback plan + feature flag + pre-pr/pre-merge gate evidence |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Add a current-design `Users` tab to `AdminWorkspace` only during implementation.
  - Reuse existing admin manager card/action/input patterns from `AdminMessagesManager`, `AdminContentManager`, `AdminManagerState`, and the admin shell.
  - Keep user detail and insights behind protected admin route/API boundaries.
  - User-facing preference UI should live under existing profile/preferences surfaces and use existing My Library token/input/action patterns.
- TypeScript/domain contracts:
  - Define typed event names, payload schemas, acquisition source enums, privacy preference enums, admin audit action enums, course progress states, retention cohort buckets, friction categories, and safe unknown-value fallbacks.
  - Define a public route analytics registry with route templates, route categories, privacy classification, safe event eligibility, and current-route inventory.
  - Define canonical product/catalog dimensions for analytics: stable `product_id`, `product_type`, optional `sku`/`price_id`, entitlement/product family, safe display label, and purchase-truth source.
  - Define content/course dimensions around stable runtime IDs, not mutable titles or slugs.
  - Prefer generic analytics events with safe dimensions, for example `public_page_viewed`, `public_cta_clicked`, `product_viewed`, `checkout_started`, and `checkout_completed`, instead of creating one event name per future page/product.
  - Unknown telemetry events must fail closed or be stored only as explicitly safe generic diagnostic records after validation.
  - Payload sanitizer must reject or strip email, free text, habit names, notes, product/cart free text, raw URLs with query secrets, raw referrer paths where not allowlisted, raw User-Agent, raw IP, device fingerprints, IP-like values beyond allowed coarse diagnostics, and unapproved nested objects.
- Supabase/data layer:
  - Use explicit migrations for any new tables.
  - Candidate server-canonical tables:
    - `user_privacy_preferences`
    - `user_product_events`
    - `user_product_usage_rollups`
    - `user_course_progress_rollups`
    - optional `public_site_analytics_rollups` if public analytics is kept first-party instead of vendor-aggregate
    - optional `public_route_analytics_rollups` or route-category rollup fields if future public pages need first-party aggregate reporting
    - `admin_user_audit_log`
    - optional `user_support_contact_log`
  - RLS/authz must fail closed; owner-scoped user writes and admin-scoped reads must be tested.
  - Add indexes for user, event type, route/surface, created date, and rollup date.
- External services/tools:
  - Logged-in product/admin analytics should remain first-party Supabase events and rollups.
  - Public website/sales analytics may use a privacy-first vendor only after owner decision, processor/privacy review, policy updates, and a proof that no user-profile bridge is created.
  - If Plausible or Simple Analytics is approved, custom events must be generated from the route/product/content registry and must not forward private app data, raw URLs with query strings, user IDs, emails, free text, ad click IDs, or logged-in product context.
  - Recommended public analytics order: Plausible first, Simple Analytics second.
  - Do not install Meta Pixel, Meta Conversions API, GA4, Google Tag Manager, Hotjar, Clarity, session replay, heatmaps, behavioral ad tooling, or similar adtech in this foundation.
  - Email follow-up should use existing/manual email paths first; automatic outbound provider integration remains a child brief.
  - Future ad pixels or conversion APIs require a separate child brief, active consent flow, updated cookie/privacy policy, DPA/controller-role review, and explicit owner approval.
- UI system:
  - Use lucide icons where helpful for admin actions: search, filter, mail, shield/audit, activity, alert, clock.
  - Use toggles/checkboxes for binary preferences, segmented controls for filter modes, `ui-field`/current field classes for forms, `fs-cta-primary`/`fs-cta-secondary` for actions, and stable responsive mobile action groups.
  - Screenshot handoff is required for any UI implementation with `after/reference` against current admin workspace and profile/preferences surfaces.
- Testing:
  - Unit tests for event taxonomy, public route registry, future route fixtures, product/catalog dimensions, sanitizer, preference view-models, rollup builders, audit-log record builders, course progress mapping, and unknown-value fallback.
  - API tests for admin/non-admin deny paths, user preference updates, telemetry ingestion, retention cleanup, and audit-log writes.
  - Component/e2e tests for admin search/filter/detail, preference form, manual contact action, and audit history.

## Data Placement And Sync Contract

- Server-canonical:
  - user identity and role/access state;
  - privacy/product-improvement preferences;
  - first-party sanitized product events;
  - canonical product/catalog identity, product type, SKU/price metadata, and entitlement/purchase truth when the repo owns those contracts;
  - public route analytics registry, if implemented first-party, with route templates/categories only and no arbitrary full URLs;
  - registration/login and coarse acquisition source once the person becomes a user, when documented and retention-bound;
  - derived daily/weekly/monthly rollups;
  - free-course progress rollups;
  - D1/D7/D30 retention and MAU rollups;
  - purchase/checkout rollups derived from canonical catalog plus Stripe/entitlement truth;
  - admin audit log for viewing user detail, changing access/preference/support state, exporting/deleting/anonymizing data, or sending/drafting contact;
  - support contact log when a message is sent or manually recorded.
- Public aggregate or vendor-aggregate:
  - page views, route-template/category, referrer source, device type, country, product/category views, and public CTA/sales events may be stored only as aggregate/cohort analytics with no durable visitor profile.
  - shop/catalog page metrics may include stable product/category IDs only when they come from the canonical catalog and are classified as public commercial data.
  - if a vendor is used, Freeswimming must document whether the vendor stores cookies, localStorage, persistent IDs, raw IPs, full User-Agent, full URLs, or cross-site identifiers before activation.
- Local/browser:
  - transient UI state such as admin filters, selected row, expanded detail, pending form state, and user preference panel state;
  - strictly necessary auth/session storage remains outside this brief's new analytics scope;
  - no analytics visitor ID, ad click ID, or public-site tracking cookie/localStorage key is allowed without a separate consent-gated scope.
- Derived view-model data:
  - `active_now` from recent heartbeat or last event timestamp, with approximate copy such as `Active in last 5 minutes`;
  - `last_active_at`;
  - `course_progress_percent`;
  - public funnel counts for Landing Page -> Registration -> Habit Created -> 7-Day Retention -> Subscription Purchase;
  - route-category counts such as Marketing -> Product Detail -> Checkout Started -> Checkout Completed when a future shop/product flow exists;
  - product/category counts by canonical product ID/type, not display title or slug;
  - retention metrics: Day 1, Day 7, Day 30, and monthly active users;
  - module usage flags for Course, Habits, Micro Sessions, Calendar, My Library;
  - friction summaries such as `started_not_completed`, `repeated_error`, `inactive_after_start`, or `setup_abandoned`.
- Sync policy:
  - telemetry ingestion should be non-blocking for user flows;
  - preference changes should take effect for future optional/non-essential events immediately after save;
  - public anonymous traffic must not be later joined to a signed-in user profile unless a new privacy review approves the exact bridge;
  - public route/product views and logged-in user/product rollups must remain separate datasets unless a later brief defines the bridge, legal basis, consent requirements, retention, delete/anonymize behavior, and tests;
  - admin actions write audit records in the same server transaction when practical, or fail closed if audit logging is required and unavailable.
- Retention and sensitivity:
  - proposed initial defaults: detailed product events 90 days; aggregated public/product/retention rollups 13 months; admin audit log 24 months; support contact log 12 months unless tied to an active support case.
  - user delete/anonymization must remove or anonymize product events/rollups according to the user deletion contract.
  - no analytics payload may contain habit names, private notes, personal goals, free-text messages, email, customer address/shipping details, cart notes, full referrer URL, raw UTM values with personal data, raw IP, raw User-Agent, clipboard data, typed text, video watch traces, or full clickstream/session replay.
- Cache/invalidation:
  - admin users/insights route is dynamic and admin-scoped;
  - user preference mutation invalidates the preference panel and future telemetry eligibility;
  - rollups may lag but must show last computed timestamp.

## Identity And Rename Contract

- Canonical stable IDs:
  - `user_id` is the internal stable user identity for admin/user insight joins.
  - event IDs, preference row IDs, rollup IDs, admin audit IDs, and support contact IDs are stable internal references.
  - public route templates/categories are analytics identities for public pages, not raw URLs.
  - canonical `product_id`, `product_type`, SKU/price ID, and entitlement/product family are commercial analytics identities when they come from the product catalog or Stripe metadata.
  - course progress uses stable course/lesson runtime IDs where available.
- Human-readable identifiers:
  - email/display name are searchable labels only, not stable identity.
  - page title, route slug, product display name, lesson title, course title, habit label, and Micro Session name are display labels and must not be used as analytics identity.
  - public referrer/source/campaign labels are normalized labels only, not visitor identity.
- Mutability rules:
  - user IDs are immutable;
  - email/display name may change through auth/provider rules;
  - public page slugs may change while route templates/categories preserve analytics compatibility where the page purpose is unchanged;
  - product display names and shop slugs may change while canonical product IDs and Stripe price/product metadata preserve purchase compatibility;
  - course lesson titles may change while runtime IDs preserve progress compatibility;
  - future video asset IDs are write-once for playback analytics if that later scope is approved.
- Rename vs repurpose policy:
  - do not repurpose user records for another person.
  - do not repurpose an existing route/product/lesson identity for a materially different offering, page purpose, lesson, or commerce item.
  - simple copy/title/slug cleanup is an in-place edit when the underlying route/product/content object is the same.
  - do not treat renamed lessons as new progress objects unless a new runtime ID is intentionally created.
  - materially different course lessons, products, or Micro Session definitions require a new stable ID or documented migration.
- Compatibility contract:
  - legacy events without new schema fields must map to `unknown_not_counted` or a safe aggregate bucket.
  - unmapped public routes, course lessons, shop products, or product surfaces must not create misleading progress/completion/purchase claims.
  - unmapped public sources/campaigns must map to `unknown_source` rather than creating new free-text dimensions.
- Observability and repair:
  - unresolved event/user/route/product/lesson IDs are logged as safe admin diagnostics with counts, not raw payload dumps.

## Forward Compatibility Contract

- Extensibility surfaces:
  - admin tabs, user roles/access flags, privacy preference categories, event names, event payloads, public route templates, route categories, public source/campaign labels, product catalog IDs, product types, SKUs/price IDs, shop categories, checkout states, course IDs, lesson runtime IDs, video asset IDs, Habits statuses, Micro Session states, friction categories, communication channels, locales, retention policies, and support/audit actions.
- Source of truth:
  - event names and payload schemas come from typed contracts, not scattered strings.
  - public page analytics comes from a route-template/category registry, not raw URLs, page titles, or today's route list.
  - product/shop analytics comes from canonical product catalog data plus Stripe/entitlement metadata, not display names, slugs, button text, or browser-only purchase claims.
  - admin labels come from typed view-model helpers.
  - course progress comes from canonical course/lesson runtime IDs, not current titles.
  - allowed admin visibility comes from an explicit privacy/view-model allowlist.
- Additive behavior:
  - new safe surfaces can appear in the admin module list if they register a typed event category, display label, retention rule, privacy classification, and tests.
  - new users automatically inherit default privacy/product-improvement preferences and minimized admin visibility.
  - new public marketing pages can be counted automatically only if they use route-template labels and discard query strings except allowlisted UTM/ref/source fields.
  - new public product/shop pages can be counted automatically only if they use route templates, safe route categories, canonical public product IDs/types, and no cart/customer free text.
  - new products such as swim mugs, new guides, new lesson packs, or future merchandise can flow through generic product view/checkout/purchase rollups when they exist in the canonical catalog and the product type has a privacy classification.
  - new course lessons can flow through generic course/lesson progress rollups when stable runtime IDs are present and progress rules match the existing coarse progress contract.
- Explicit mapping requirements:
  - new event types, payload fields, private data categories, route categories, public campaign dimensions, product types, checkout/cart states, product-specific funnels, personalized offers, communication channels, admin user actions, retention changes, course/video analytics, support access, third-party processors, pixels/tags, or user-facing preference labels require explicit mapping, privacy review, tests, and Help/Guide/privacy updates.
- Unknown or deprecated values:
  - unknown event types fail closed;
  - unknown public routes render as `Unknown public surface / not counted` until registered;
  - unknown products render as `Unknown product / not counted` and cannot improve purchase, revenue, or conversion metrics;
  - unknown surface/status values render as `Unknown / not counted` in admin and cannot improve completion/friction metrics;
  - deprecated preferences keep read-through fallback until migration is complete.
- Test/evidence:
  - include unknown event and future lesson fixtures;
  - include future public route fixture such as `/shop/[productSlug]`;
  - include future product fixture such as `swim_mug` with `product_type=merchandise`;
  - include unknown route/product/status negative-path fixtures;
  - include sanitizer negative-path tests for PII/free text;
  - include route/label/support sweeps before broad gates;
  - include screenshot evidence for current admin token/button/form design.

## Public Route / Product / Content Coverage Contract

- Current public route classification:
  - marketing/trust: `/`, `/our-method`, `/programs`, `/analysis`, `/course`, `/guides/0-1000m`, `/guides/poolside`;
  - pricing/checkout: `/plans`, `/checkout/success`;
  - contact/legal/support: `/contact`, `/privacy`, `/cookies`, `/claim`, `/go/unavailable`;
  - account/auth: `/auth/sign-in`;
  - logged-in product/admin routes are not public analytics surfaces and must stay in the first-party product/admin track.
- Future public route categories:
  - supported categories are `marketing`, `pricing`, `product_detail`, `shop`, `course_landing`, `guide_landing`, `support`, `legal`, `checkout`, `auth`, and `unavailable_redirect`.
  - new categories require explicit mapping, privacy classification, Help/Guide/privacy review, and tests before they emit analytics.
- Automatic page coverage:
  - a new public page can be counted automatically when it registers a route template, route category, safe display label, consent/legal-basis classification, and tests.
  - route templates must strip query strings except allowlisted `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, and `ref`.
  - full URLs, raw referrer paths, search queries, account identifiers, auth tokens, and arbitrary route params must not be stored.
- Product/shop coverage:
  - product analytics uses generic events and safe dimensions: `product_id`, `product_type`, optional `sku`/`price_id`, public category, and normalized source/campaign.
  - future products such as swim mugs, new guides, lesson packs, analysis packages, or subscriptions are counted through the canonical product catalog and Stripe/entitlement truth, not through today-only event names.
  - browser events can show intent only, such as product viewed or checkout started; checkout completed, purchase, subscription, refund, and entitlement metrics must reconcile to Stripe/entitlement truth.
  - unknown or archived products must render as `Unknown product / not counted` until mapped or migrated.
- Content/course coverage:
  - public course/guide landing pages use route templates and public category analytics.
  - logged-in course progress uses stable course/lesson runtime IDs, not lesson titles or slugs.
  - adding lessons with the same coarse progress model can use existing generic events; changing pass criteria, video telemetry, lesson sections, or personalization requires explicit mapping and privacy review.
- Safe generic event model:
  - public website/sales analytics should prefer `public_page_viewed`, `public_cta_clicked`, `product_viewed`, `checkout_started`, and `checkout_completed` with safe dimensions over page/product-specific event names.
  - if a future shop adds cart behavior, `product_added_to_cart` and cart-step events require a separate mapping and sanitizer review before activation.
  - new funnels should be represented as approved route/product/category stages, not as a durable per-visitor browsing trail.
- Privacy matrix:
  - each route category, event, and dimension must be classified as strictly necessary, public aggregate/product improvement, consent-required, or disallowed before runtime logging ships.
  - no future route/product/content addition may create a bridge from anonymous public traffic to a logged-in user profile without a new privacy review, legal-basis/consent decision, retention rule, delete/anonymize handling, and tests.

## Privacy And Consent Model

- Required/necessary operations:
  - auth/session, security, role/access, account state, user rights, basic support diagnostics, and error logging may be necessary to provide and secure the service, subject to final legal-basis review.
- Product improvement operations:
  - first-party coarse route/product/content usage and friction signals must be transparent, minimized, retention-bound, and documented.
  - if implementation uses cookies or similar technology beyond strictly necessary storage, consent must be active, specific, equally easy to reject, documented, and easy to withdraw.
- Communication operations:
  - email/in-app preferences must distinguish transactional/service messages from optional tips, feedback requests, and product updates.
  - no "we saw you did not..." copy; admin-facing suggested follow-up should use respectful language such as "Would you share quick feedback on Habits/Micro Sessions?"
- Support access:
  - no default admin access to private profiles;
  - any future deeper support access must be explicit, time-limited, auditable, revocable, and scoped to diagnostics.

## Public Website And Sales Analytics Boundary

Day-one analytics requirements must be split into two privacy-safe tracks:

- Public website/sales analytics:
  - recommended install decision: Plausible first, Simple Analytics second if Plausible does not fit;
  - traffic signals: route-template page views, route category, normalized referrer source, coarse device type, and country-level location only;
  - prefer generic public actions: `public_page_viewed`, `public_cta_clicked`, `product_viewed`, `checkout_started`, and `checkout_completed`;
  - day-one mapped actions may include `landing_page_viewed`, `plans_viewed`, `course_cta_clicked`, `contact_clicked`, `checkout_started`, and `checkout_completed` only if the event contract maps them to safe route/product categories;
  - public campaign fields: allowlisted `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `ref`, and normalized referrer domain/source only;
  - route labels must use route templates or safe page categories, not full URLs with arbitrary query strings;
  - product labels must use canonical catalog IDs/types, not mutable product names, shop slugs, or button copy;
  - country is derived and stored as country code/name only; raw IP must not be stored in Freeswimming analytics tables;
  - device type is `mobile`, `tablet`, `desktop`, or `unknown`; raw User-Agent must not be stored;
  - no durable visitor ID, fingerprint, cross-site ID, ad click ID, or public-site user profile is allowed without a separate consent-gated brief.
- Logged-in product/admin analytics:
  - keep first-party Supabase events and rollups as the source of truth;
  - required user action signals: `registration_completed`, `login_completed`, `habit_created`, `habit_completed` or canonical check-in equivalent, `micro_session_completed`, `course_viewed`, `course_purchased`, and `subscription_purchased`;
  - habit and micro-session events may include stable safe IDs/status categories only when approved, never habit names, notes, target text, or user free text;
  - course purchase/subscription purchase metrics must reconcile to Stripe webhook/entitlement truth rather than browser-only events.

Funnel and retention rules:

- Required funnel:
  - Landing Page -> Registration -> Habit Created -> 7-Day Retention -> Subscription Purchase.
- Future public/shop funnel templates may be added as route/category stages, for example Marketing Page -> Product Detail -> Checkout Started -> Checkout Completed, but cannot become a durable per-visitor browsing trail.
- The public-to-registration part is aggregate/cohort-based by default, not a per-visitor trail.
- After registration, retention can be calculated from first-party user activity rollups, with transparent privacy copy and delete/anonymization handling.
- Acquisition source may be attached at registration only as a coarse source/campaign cohort when documented; do not backfill anonymous pre-registration browsing into the user profile.
- Required retention metrics:
  - Day 1 retention;
  - Day 7 retention;
  - Day 30 retention;
  - monthly active users.
- Retention calculations must count activity days and approved coarse events, not exact clickstream or session replay.

Vendor and pixel decision:

- Do not install Meta Pixel, Meta Conversions API, GA4, Google Tag Manager, Hotjar, Clarity, or session replay/heatmap tooling in this foundation.
- Meta/Google/ad pixels may be reconsidered only after Freeswimming is actively running paid acquisition that needs ad-platform optimization, and only in a separate child brief with explicit consent gating, policy updates, DPA/controller-role review, no advanced matching in the first version, no private app data, and owner approval.
- A privacy-first public analytics vendor still needs a documented Norwegian/ePrivacy assessment before activation; "cookieless" is not accepted as automatic proof of legality.

## Allowed And Disallowed Signals

Allowed for the first implementation when privacy review passes:

- public route-template page views, route category, normalized referrer source, coarse device type, and country-level location;
- public funnel events: landing page viewed, plans viewed, course CTA clicked, contact clicked, checkout started, checkout completed;
- generic public/product events: public page viewed, public CTA clicked, product viewed, checkout started, checkout completed, with safe route/product dimensions;
- registration/login events as first-party account events;
- retention metrics: Day 1, Day 7, Day 30, and monthly active users;
- `last_active_at`
- approximate `active_last_5_min` / `active_today`
- route/surface viewed at coarse level: Course, Habits, Micro Sessions, Calendar, My Library, Plans where already safe
- product/course/guide/shop item viewed at public aggregate level when derived from canonical public catalog data
- course viewed, course purchased, shop item purchased, and subscription purchased when derived from safe catalog/Stripe/entitlement truth
- free-course progress: course started, lesson opened, lesson completed, lesson reopened, progress percent, last course activity
- Habits/Micro Sessions usage flags and lifecycle events without private names/content
- habit created, habit completed/check-in, and Micro Session completed without private names/content
- friction markers: setup started but not completed, repeated retry/error, abandoned timer/session, no activity after first start
- admin actions: user detail viewed, access changed, privacy status viewed, message drafted/sent, export/delete initiated

Disallowed in this foundation:

- habit names, private notes, training goal text, free-text message bodies in analytics;
- customer address, shipping details, cart notes, product personalization text, or payment details;
- exact clickstream, heatmaps, session recordings, keystrokes, form field values, clipboard data;
- detailed video watch percentage, pause/rewind heatmaps, second-level rewatch behavior;
- raw IP, raw User-Agent, precise geolocation, full referrer URLs, device fingerprinting, durable visitor IDs, or cross-site identifiers beyond narrow security diagnostics;
- hidden profiling or automated decisions about a person;
- third-party ad/behavioral tracking pixels, advanced matching, Conversions API forwarding, or ad-platform retargeting.

Deferred until content/video is stable and a new brief approves it:

- detailed video analytics;
- lesson section-level replay/rewatch telemetry;
- automated nudges based on video behavior;
- cross-device session replay;
- deeper support access.

## Admin UI Scope

First implementation should create a `Users` admin module with current admin design:

- summary band:
  - public funnel health, D1/D7/D30 retention, MAU, active now, active today, inactive after first start, course started, Habits tried, Micro Sessions tried;
- user list:
  - search, filters, role/status/privacy state, last active, coarse module usage, course progress;
- user detail:
  - account/access state, preference state, coarse activity timeline, course progress, friction summary, support/contact history, admin audit history;
- actions:
  - `Refresh`, `View audit`, `Draft email` or `Open email`, safe access changes if included, and `Export/anonymize` links only if existing user-rights flows support them;
- forms/buttons:
  - token-native `fs-cta-primary`/`fs-cta-secondary`, `ui-field`, stable icon+label buttons, confirmation forms for risky admin actions, and no text overflow on mobile/desktop.

## Messaging Decision

- First choice: manual email follow-up or email draft/open-in-inbox action.
- In-app messages are a later product/support child once notification surfaces, user preference copy, delivery/read semantics, rate limits, and audit logging are defined.
- Automatic outbound email is deferred unless the existing admin message delivery/provider contract is explicitly expanded.
- Any sent/drafted contact creates an admin audit record and, when sent through the app, a support contact record.

## Course Progress Decision

- Include coarse free-course progress in this foundation because it answers whether users reach the learning path.
- Use stable course/lesson runtime IDs where possible.
- Log:
  - `course_viewed`
  - `course_started`
  - `lesson_opened`
  - `lesson_completed`
  - `lesson_reopened`
  - `course_progress_rollup_updated`
  - `course_purchased` or `subscription_purchased` only from Stripe/entitlement truth
- Do not log detailed video playback analytics until videos and lesson structure are stable.

## Help / Guide Impact

Required in the same implementation PR:

- admin Help/Guide section for Users, insights, privacy status, audit log, and allowed follow-up actions;
- privacy policy/product-improvement explanation for users;
- public analytics explanation for page views, referrers, device type, country, funnel metrics, and retention cohorts;
- cookie/tracking consent copy if non-essential cookies or similar technology are introduced;
- cookie policy update before any public analytics vendor or non-essential tracking script activates;
- support runbook for user rights, deletion/anonymization, telemetry gaps, attribution gaps, and misuse investigation;
- route/label/support surface sweep for changed workflow labels and preference copy.

## Route / Label / Support Surface Sweep

Run before broad gates for these terms:

- `Users`
- `user management`
- `privacy preferences`
- `product improvement`
- `analytics`
- `telemetry`
- `public analytics`
- `Plausible`
- `Simple Analytics`
- `Meta Pixel`
- `GA4`
- `Google Tag Manager`
- `Hotjar`
- `Clarity`
- `referrer`
- `utm_`
- `country`
- `device type`
- `route template`
- `route category`
- `public_page_viewed`
- `public_cta_clicked`
- `product_viewed`
- `product_id`
- `product_type`
- `sku`
- `price_id`
- `shop`
- `catalog`
- `registration_completed`
- `login_completed`
- `last_active`
- `active now`
- `landing_page_viewed`
- `plans_viewed`
- `course_cta_clicked`
- `checkout_started`
- `checkout_completed`
- `course_started`
- `course_viewed`
- `course_purchased`
- `shop_item_purchased`
- `subscription_purchased`
- `lesson_opened`
- `lesson_completed`
- `habit_created`
- `habit_completed`
- `micro_session_completed`
- `retention`
- `monthly active users`
- `micro_session`
- `admin audit`
- `support contact`
- `email follow-up`
- `in-app message`
- `cookie`
- `privacy`
- `delete user`
- `export user`
- `/our-method`
- `/programs`
- `/analysis`
- `/course`
- `/guides/0-1000m`
- `/guides/poolside`
- `/claim`
- `/auth/sign-in`
- `/go/unavailable`
- `/shop`

Minimum surfaces:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/admin/`
- `lib/user/`
- public route registry/catalog helpers, if present
- public routes: `/`, `/plans`, `/checkout/success`, `/contact`, `/privacy`, `/cookies`, `/our-method`, `/programs`, `/analysis`, `/course`, `/guides/0-1000m`, `/guides/poolside`, `/claim`, `/auth/sign-in`, `/go/unavailable`, and any future `/shop` or product detail route
- Stripe/catalog/entitlement helpers, if product/shop dimensions are touched
- `tests/`
- `docs/task-briefs/`
- `docs/design/`
- `docs/runbooks/`
- `app/privacy/page.tsx`
- Help/Guide assertions.

## Scope

- Refresh this planned brief as the canonical 10/10 scope.
- Future implementation scope may include:
  - admin `Users` IA and current-design UI;
  - public website/sales analytics boundary and vendor decision record;
  - public route analytics registry with current route classification and future route-template fallback;
  - canonical product/catalog/shop analytics dimensions for future products and merchandise;
  - day-one public traffic, funnel, registration/login, product action, purchase, retention, and MAU metrics;
  - first-party privacy-safe event taxonomy and sanitizer;
  - user privacy/product-improvement preferences;
  - user list/detail with minimized insights;
  - online/last-active approximation;
  - course progress rollups;
  - route/product/content forward compatibility fixtures and unknown-value handling;
  - Habits/Micro Sessions coarse usage and friction rollups;
  - admin audit log;
  - manual email/draft support action;
  - retention/anonymization hooks;
  - public analytics privacy/cookie policy updates if a vendor or non-essential script is approved;
  - Help/Guide/privacy/runbook updates;
  - tests, screenshots, verification gates, PR/CI/pre-merge when owner executes.

## Out Of Scope

- Runtime code changes from this planning-only update.
- Starting implementation without explicit owner `execute/build/implement`.
- Full clickstream, heatmaps, session replay, keystrokes, form-field recording, clipboard recording.
- Private habit names, notes, training goals, message bodies, or personal profile content in analytics/admin insights.
- Detailed video playback analytics until videos/lessons are stable and a separate brief approves it.
- Meta Pixel, Meta Conversions API, GA4, Google Tag Manager, Hotjar, Clarity, ad tracking, behavioral marketing pixels, advanced matching, retargeting, or session replay.
- Installing a public analytics vendor without a documented owner decision, processor/privacy review, policy update, and proof that anonymous public traffic is not bridged to user profiles.
- Shipping product-specific shop/cart funnels, product personalization tracking, shipping/customer-address analytics, or per-product ad optimization without a separate mapping/privacy review.
- Treating new public pages, product slugs, page titles, lesson titles, or product display names as stable analytics identities.
- Automatic outbound messaging or in-app messaging platform.
- Generic admin access to full user profiles.
- Hard delete/permanent deletion beyond existing user-rights flow integration.
- Finance/revenue reporting changes.
- Global sound settings, uploaded/user-selected sounds, exports redesign, persistent Micro Sessions telemetry, or broad graphs/dashboard work.

## Acceptance Criteria

1. Brief remains planned and implementation waits for explicit owner instruction.
2. Future implementation starts with a privacy assessment and records legal-basis/consent/retention decisions before runtime logging ships.
3. Admin `Users` module shows only minimized identity/access/usage/friction/support data.
4. User-facing preference/privacy copy explains product-improvement logging in clear language.
5. First-party events are typed, sanitized, retention-bound, and tested.
6. Public website/sales analytics tracks route-template page views, route category, referrer source, device type, country, safe CTA/product/checkout events, and UTM/source/referrer fields only as aggregate or consent-safe data.
7. Registration, login, habit created/completed, Micro Session completed, product viewed, course viewed, course purchased, shop item purchased, subscription purchased, D1/D7/D30 retention, and MAU are available as first-party or public-aggregate privacy-safe metrics according to the data-boundary contract.
8. Landing Page -> Registration -> Habit Created -> 7-Day Retention -> Subscription Purchase is measurable as a cohort funnel without durable anonymous visitor profiling.
9. Future public route coverage is registry-based: current routes are classified, future `/shop/[productSlug]`-style routes have a safe template/category path, and unknown routes render as `Unknown public surface / not counted`.
10. Future product/shop coverage is catalog-based: a future `swim_mug` fixture or equivalent product can be counted through generic product events only when canonical product ID/type and privacy classification exist; unknown products render as `Unknown product / not counted`.
11. Course progress is coarse and stable-ID based; future lesson fixtures prove renamed/new lessons do not depend on titles/slugs, and detailed video analytics remain deferred.
12. Admin audit log records admin access to user detail and user-affecting actions.
13. Non-admin/editor/viewer/anonymous access to user insights and audit logs fails closed.
14. New UI uses current admin token/button/form design and passes screenshot handoff before PR update.
15. Help/Guide/privacy/runbook impacts are updated in the same implementation PR.

## Validation

For this planning update:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`

For future implementation:

- targeted domain/unit tests for event taxonomy, public route registry, future `/shop/[productSlug]` route fixture, future `swim_mug` product fixture, sanitizer, public source normalization, preferences, rollups, retention cohorts, course progress, purchase reconciliation, audit log, and unknown fallbacks;
- network/CSP or equivalent tests proving Meta/GA4/GTM/Hotjar/Clarity scripts do not load in the foundation;
- targeted admin API negative-path tests;
- targeted component/e2e tests for Users admin workflows and preference form;
- screenshot handoff before `npm run verify:pre-pr`;
- `npm run verify:pre-pr`;
- required PR CI;
- `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-05-09 | planned | initial access-management foundation created; scope focused on roles/access and test users as child capability | next: refresh before use`
- `2026-06-09 | planned | refreshed from clean synced main@91c9ba12 after owner requested a 10/10 brief for admin user management, usage/site insight, GDPR-safe logging, admin audit, messaging choice, and current admin button/form design; no implementation is active | next: wait for explicit execute/build/implement before moving brief to in-progress or changing runtime code`
- `2026-06-09 | planned | updated plan-only with public website/sales analytics audit: day-one traffic/action/funnel/retention metrics, Plausible-first/Simple-Analytics-second recommendation, no Meta/GA4/GTM/Hotjar/Clarity in foundation, and explicit public-vs-product data boundary | next: run brief lint/diff checks, then wait for owner review or explicit execute/build/implement`
- `2026-06-09 | planned | hardened forward compatibility on synced main@e43a79a6 after owner asked whether future pages, shop products such as swim mugs, courses, lessons, and more content will be covered; added public route/product/content coverage contract, canonical catalog/runtime-ID rules, generic event model, current-route classification, future `/shop/[productSlug]`and`swim_mug` fixture requirements, and unknown route/product fallback rules; no runtime implementation is active | next: run brief lint/diff checks, then wait for owner review or explicit execute/build/implement`
- `2026-06-09 | in-progress | owner said execute/build/implement; moved brief to in-progress and implemented the public-analytics-foundation slice: route/product/content analytics registry, Plausible-first not-activated vendor decision, sanitizer hardening, public client event no-user bridge, `/plans`route-template payload, privacy/cookie copy, API/runbook docs, future`/shop/[productSlug]`and`swim_mug` fixtures, and negative-path tests; validation passed: targeted vitest 7 files / 25 tests, npm run typecheck, npm run lint:briefs:all, git diff --check, route/label/support sweep | next: capture screenshot handoff for changed privacy/cookie policy surfaces and wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-09 | screenshot-superseded | owner approved the initial screenshot handoff in output/public-analytics-foundation-2026-06-09-170348, but pre-commit formatting later touched a policy rendering file, so that visual evidence was superseded by a fresh capture | next: use the refreshed screenshot handoff as canonical visual approval`
- `2026-06-09 | pre-pr-green | npm run verify:pre-pr passed locally after the initial screenshot checkpoint: branch-current, quality gates, admin audit, env parity, eslint, typecheck, unit, build, performance budgets, and Playwright e2e (106 passed / 530 skipped); rerun is required after the final screenshot checkpoint and amended commit | next: record final screenshot approval, amend commit, rerun npm run verify:pre-pr, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-06-09 | final-screenshot-approved | owner approved refreshed screenshot handoff in output/public-analytics-foundation-2026-06-09-171837 after hook formatting touched app/privacy/page.tsx; mobile context screenshots confirm the policy pages are not blank/white, and no product-rendering files changed after this approved capture | next: amend commit, rerun npm run verify:pre-pr, push, open PR, monitor CI, then run npm run verify:pre-merge`
