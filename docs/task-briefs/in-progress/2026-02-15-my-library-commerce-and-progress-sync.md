# Task Brief: My Library, Commerce, and Progress Sync (Free + Paid)

## Metadata

- `id`: `2026-02-15-my-library-commerce-and-progress-sync`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-15`
- `updated`: `2026-02-17`

## Goal

Users can start instantly in guest mode, buy optional paid products without account friction, and optionally claim a free account for `My Library` access and cross-device progress sync.

## Scope

- Information architecture:
  - keep explicit top-level pages `Programs` and `Video Analysis`,
  - add one paid-offers hub route (`/plans`) that links to all paid offers,
  - add authenticated `My Library` route for owned content and progress.
- Commerce and access:
  - integrate Stripe Checkout for paid offers,
  - implement webhook fulfillment (`checkout.session.completed` and relevant async-success events),
  - persist entitlements in app database (server source of truth),
  - add Stripe Customer Portal link for receipts/invoice history where applicable,
  - send secure download link by email after purchase,
  - provide `resend download link` flow without requiring account,
  - define a post-MVP monetization expansion contract (add-ons + targeted discount offers) with strict UX and KPI guardrails.
- Account model:
  - free course can be browsed and progressed without account (local device),
  - guest checkout is allowed (`email + payment`),
  - account is optional and positioned as upgrade for backup/sync/library access,
  - support low-friction account claim/sign-in (magic link),
  - when account email matches purchase email, auto-attach purchases to account.
- Progress:
  - sync free-course progress (currently localStorage-backed) to server when signed in,
  - sync paid guide progress for interactive HTML versions,
  - preserve fast local UX with server reconciliation.
- `My Library` UX:
  - section order: `Owned` first, `Continue` actions prominent,
  - section order below owned: `Recommended/Not Owned` with clear buy CTA,
  - support link present on each owned item,
  - guest users see clear value prompt for account claim (`back up progress + keep downloads`),
  - use two tabs in library context:
    - `My Library` (owned/resume),
    - `Explore More` (upsell catalog),
  - if user has no owned items, default to `Explore More` while keeping `My Library` tab visible,
  - each owned item card includes:
    - `Open`,
    - `Preview` (mobile-friendly),
    - `Download again`.
- Trust/compliance:
  - add user data export endpoint/flow for app data,
  - add user data delete endpoint/flow for app data with clear retention notes for payment records.
  - implement GDPR baseline controls for EU/EEA users (privacy disclosures, lawful basis mapping, consent boundaries, and data-subject rights handling).
- Quality:
  - add/extend unit and e2e tests for purchase restore, entitlement gating, and resume flow.
  - add explicit UX state coverage for loading/empty/error/offline/retry for all new surfaces.

## Out Of Scope

- Garmin/Apple Health/third-party wearable integrations.
- Native mobile apps.
- Advanced gamification/social leaderboards.
- Full marketplace/cart with multi-item checkout complexity beyond launch needs.
- Advanced dynamic discount engine in MVP (`v1`) beyond the fixed phase-2 rules defined in this brief.
- Major redesign outside changed routes/surfaces.

## Acceptance Criteria

- A user can complete payment and see purchased item in `My Library` on refresh and on another device after sign-in.
- A user can complete payment as guest (no required pre-checkout account creation).
- A post-purchase success page always shows immediate download + clear email confirmation.
- A guest user can request `resend download link` with purchase email.
- Resend and claim endpoints are rate-limited and return non-enumerating responses (`If this email exists, we sent a link`).
- `My Library` always prioritizes `Owned` items and shows resume actions where progress exists.
- Free-course progress can resume on a second device when signed in.
- Paid interactive guide progress can resume on a second device when signed in.
- Guest users see a progress-safety prompt after exactly 3 lessons marked complete, with free-account backup CTA.
- If a guest claims/creates account using purchase email, purchases are attached automatically.
- Not-owned items are clearly purchasable from within `My Library` (no dead-end gray cards).
- `My Library` uses `My Library` + `Explore More` tab model; users with no purchases land on `Explore More` by default.
- Purchased items can be opened, previewed on mobile, and re-downloaded from `My Library`.
- `0-1000m` has both PDF and interactive web plan with 20 sessions, per-session checkbox completion, and notes.
- Signed-in progress writes are persisted to Supabase and visible on second device after sign-in.
- Database and RLS schema changes are tracked as versioned SQL migrations committed in this repository.
- Receipt/invoice self-service path is available through Stripe customer portal link.
- Data export and delete requests for app-owned user data are available and documented.
- GDPR rights workflow exists for access/export/delete requests with operational response target <= `30 days`.
- Privacy and cookie disclosures are updated to match actual data flows in this feature.
- Accessibility semantics remain intact for all new/changed UI.
- `My Library` and `/plans` include clear loading, empty, error, and recovery states (no dead-end screens).
- Existing local course progress is merged to account on first sign-in without user data loss.
- Post-login and post-password-reset users are returned to their prior intent (`/my-library`, `/course`, or checkout return path).
- Core Web Vitals on changed routes meet quality targets at p75 in field once traffic is available:
  - LCP <= `2.5s`,
  - INP <= `200ms`,
  - CLS <= `0.1`.
- `npm run verify` passes.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

## Current Delivery Status (2026-02-17)

### Implemented (verified)

- Supabase schema + RLS baseline is implemented and committed in:
  - `supabase/migrations/20260216141500_my_library_schema.sql`
- Typed DB contract exists in:
  - `types/database.ts`
- Auth/session baseline is implemented:
  - `/auth/sign-in` (code-first UX),
  - `/auth/callback` token/code handling,
  - guarded `My Library` access.
- Stripe checkout + webhook entitlement fulfillment is implemented:
  - `/api/checkout/session`,
  - `/api/stripe/webhook`,
  - idempotent entitlement write by `stripe_checkout_session_id`.
- `My Library` page exists with:
  - signed-in state,
  - `Owned` section,
  - `Explore More` section,
  - checkout CTA for not-owned products.
- `/plans` paid-offers hub route is implemented:
  - product cards for all paid offers,
  - checkout CTA wiring to `/api/checkout/session`,
  - empty/error recovery state when product env configuration is incomplete.
- Stripe billing self-service baseline is implemented:
  - `/api/portal` route with auth + safe return handling,
  - `My Library` exposes `Manage billing` action and error fallback copy.
- Download-access recovery baseline is implemented:
  - `/api/download/resend` endpoint with per-IP + per-email rate limits,
  - non-enumerating response contract (`If this email exists, we sent a secure access link.`),
  - access-link resend uses magic-link auth callback to return users to `My Library`.
- Checkout/library recovery UX baseline is implemented:
  - `/checkout/success` now includes immediate `Download from My Library` CTA,
  - `/checkout/success` includes purchase-email resend form for secure access link recovery,
  - `My Library` empty-owned state includes `already bought?` recovery resend entry,
  - `/claim` route is implemented as dedicated magic-link claim entry for guest purchasers.
- Guest purchase attach-by-email on sign-in is implemented.
- User data export API baseline is implemented:
  - `/api/user/export` authenticated endpoint,
  - returns app-owned user data (`profile`, `entitlements`, `course progress`, `guide progress`, `guide session progress`, `goals`, `download-links metadata`) with `no-store` response headers.
- User data delete API baseline is implemented:
  - `/api/user/delete` authenticated endpoint with explicit confirmation contract (`confirm: "DELETE"`),
  - deletes auth user via server-only admin client (hard delete) to remove app-owned user data through DB constraints,
  - attempts sign-out/session clear after delete.
- GDPR/privacy/cookie baseline documentation is implemented:
  - user-facing disclosure routes:
    - `/privacy`,
    - `/cookies`.
  - checkout-adjacent and account surfaces now expose policy links:
    - `/checkout/success`,
    - `/my-library`.
  - operational rights workflow runbook exists:
    - `docs/runbooks/gdpr-data-rights.md`.
- Analytics/KPI event baseline is implemented:
  - centralized analytics event contract + server logger pipeline,
  - client analytics ingestion endpoint (`POST /api/analytics/event`),
  - core event instrumentation implemented for:
    - `plans_viewed`,
    - `library_viewed`,
    - `checkout_started`,
    - `checkout_completed`,
    - `entitlement_granted`,
    - `download_link_resent`,
    - `account_claim_started`,
    - `account_claim_completed`,
    - `resume_clicked`,
    - `item_download_started`,
    - `progress_synced`,
    - `sync_failed`.
- Analytics remaining coverage is implemented:
  - library interaction event coverage:
    - `library_tab_switched` (owned/explore section-nav interactions),
    - `item_preview_opened` (owned-item primary/secondary open actions),
    - `support_clicked` (plans fallback + owned-item support actions).
  - upsell and discount telemetry coverage:
    - `upsell_presented` on plans and library explore surfaces,
    - `upsell_accepted` on checkout intent clicks from upsell surfaces,
    - `upsell_declined` on Stripe checkout cancel returns,
    - `discount_redeemed` on paid checkout webhook events with non-zero Stripe discount amount.
- Free-course account sync baseline is implemented:
  - `/api/progress/course` (authenticated read/write),
  - signed-in course clients hydrate from server and merge local progress on first sign-in,
  - local progress updates are synced back to server for cross-device continuity.
- Paid-guide progress sync API baseline is implemented:
  - `/api/progress/guide` (authenticated read/write),
  - payload normalization + row caps aligned with course-progress API guardrails.
- `0-1000m` interactive guide baseline is implemented:
  - `/guides/0-1000m` authenticated + entitlement-gated route,
  - 20-session (`S01-S20`) interactive tracker with per-session completion + notes,
  - local-first persistence + background sync to `/api/progress/guide`,
  - sync UX states include loading, offline, error, and retry.
- `0-1000m` dual-action owned-item UX is implemented:
  - owned-item detail now exposes both:
    - `Open interactive plan`,
    - `Download PDF`.
  - PDF download is served through entitlement-gated API (`/api/guides/0-1000m/pdf`) with no public paid-file exposure.
  - download UI includes explicit loading + failure state with retry option.
- Guest progress-safety milestone prompt is implemented:
  - appears after 3 completed lessons in guest mode,
  - includes free-account CTA to preserve progress across devices,
  - dismiss suppresses prompt for 7 days.
- Auth abuse controls are implemented:
  - request/verify rate limits,
  - cooldown messaging,
  - Upstash support with in-memory fallback.
- Soft-launch public UX exists with under-construction banner.

### Outstanding (blocking move to `done`)

- `My Library` item detail is still placeholder text:
  - dual-action flow is now implemented for `0-1000m`,
  - preview/download/re-download behavior for remaining owned products is still pending.
- Progress sync criteria is partially met:
  - free-course progress now supports signed-in server sync and local->account merge,
  - paid-guide interactive sync is implemented for `0-1000m`, but cross-device resume still needs manual QA confirmation.
- Goals MVP UI/state flow is not implemented.
- Library tab contract decision required:
  - implement explicit query tabs (`?tab=library|explore`) or revise contract to section layout.
- Security follow-up items remain deferred:
  - live rate-limit verification,
  - progressive Turnstile gate,
  - auth abuse observability baseline.

## Next Delivery Order (Execution)

1. Library/content slice:
   - finish remaining owned-item detail behavior in `/my-library/item/[slug]` so non-guide products avoid placeholder-only UX.
   - run cross-device manual QA for paid-guide resume behavior (`0-1000m` + `poolside`) and record results.
2. Trust/ops slice:
   - run manual QA for analytics payload correctness and privacy/cookie disclosure visibility.
3. Security hardening follow-up:
   - verify live rate-limit behavior in preview/production logs,
   - decide if progressive Turnstile activation is needed based on abuse signals.

## Manual QA Environments

- Local environment:
  - URL: `http://127.0.0.1:3000`
  - current verified manual checks:
    - buy flow -> webhook fulfilled entitlement -> `My Library` visible,
    - sign-in code flow + cooldown UX,
    - soft-launch under-construction banner visibility on public routes.
  - remaining manual checks (after pending implementation):
    - free-course progress resume across devices when signed in (server-backed),
    - paid guide progress resume (interactive guide),
    - owned item preview/download/re-download from `My Library` item detail,
    - `/plans` final UX sweep on mobile + desktop preview,
    - `/claim`, data export/delete user flows, and policy-route visibility (`/privacy`, `/cookies`) from checkout/library surfaces.
  - browsers/devices:
    - iOS Safari (phone),
    - Android Chromium (phone),
    - Desktop Chrome,
    - Desktop Safari/WebKit,
    - Desktop Firefox.
- Vercel preview:
  - repeat critical buy/restore/resume flows on at least one mobile and one desktop browser.

## Constraints

- Preserve current brand visual language; improve clarity, not aesthetic drift.
- Keep friction low in account creation and sign-in.
- Keep server as source of truth for purchase/entitlement/progress.
- Keep local state for responsiveness, but never show permanent success without server confirmation.
- Keep implementation incremental so PWA work can continue safely in parallel.
- Keep copy plain-language and confidence-building (no vague labels or ambiguous CTA copy).
- Do not require account creation before payment completion for guest buyers; account claim can be post-purchase.

## Selected Defaults For V1 (Locked Unless Explicitly Changed)

- Track A: `Option A` (keep `Programs` + `Video Analysis`, add `/plans`, label account area `My Library`).
  - Naming note: keep `My Library` in v1 for immediate clarity; re-evaluate branded alias (`My FreeSwim`) after launch data.
- Track B: `Option A` (guest-first: free progress + guest checkout + optional account claim).
- Track C: `Option A` (Supabase Auth + Postgres + RLS).
- Track D: `Option A` (Stripe Checkout + webhook fulfillment + entitlements table).
- Track E: `Option A` (local-first UX + debounced sync + server reconciliation).
- Track F: `Option A` (PDF + interactive HTML).
- Track G: `Option A` (manual goals + milestones/celebration).
- Track H: `Option A` (phase-2 add-ons + targeted discount offers after MVP stability gate).

## GDPR Compliance Contract (V1 Baseline)

- Legal transparency:
  - update privacy policy with controller identity, purposes, legal bases, retention windows, and processor list (Stripe, Supabase, Vercel, analytics providers).
  - expose policy links in checkout-adjacent and account surfaces.
- Data minimization:
  - collect only fields required for purchase fulfillment, access control, progress sync, and support.
  - avoid storing unnecessary sensitive personal data.
- Rights handling:
  - implement authenticated self-service export and delete for app-owned data.
  - add manual request contact path for access/rectification/objection where self-service is insufficient.
  - define operational SLA target for rights requests: <= `30 days`.
- Consent boundaries:
  - non-essential cookies/trackers require consent before activation in GDPR regions.
  - essential service storage/auth cookies remain enabled for platform function.
  - marketing consent (if collected) must be explicit and revocable.
- Retention and deletion:
  - define retention schedule for progress, account metadata, and support records.
  - on account deletion, remove app-owned data and document why certain payment records may remain with Stripe for legal/accounting obligations.
- Processor and transfer posture:
  - ensure DPAs are accepted with key processors (at minimum Stripe, Supabase, Vercel).
  - document cross-border transfer basis in policy as required by processor setup.
- Security and incident readiness:
  - maintain audit trail for entitlement and deletion operations.
  - include breach-response runbook reference for regulatory notification obligations.

## UX/UI Quality Bar (Must-Have For "10/10" Launch)

- Navigation and IA:
  - top-level labels remain explicit (`Programs`, `Video Analysis`, `My Library`), not generic (`Shop`, `Help`) for primary nav.
  - users can reach purchased content in 1 tap/click from `My Library`.
  - use positive language for upsell surface (`Explore More` / `Additional Learning`), avoid blunt purchase wording in core nav.
- Clarity and orientation:
  - every page has one primary action above the fold.
  - every flow step indicates "where I am" and "what happens next".
- Required UI states per surface (`/plans`, `/my-library`, guide pages):
  - loading skeleton,
  - empty state with next best action,
  - error state with retry action,
  - offline state with clear limitation copy.
- Conversion-safe checkout UX:
  - guest checkout remains straightforward,
  - no forced account sign-up before order placement,
  - account claim/create prompt appears after successful checkout.
- Progress confidence:
  - last sync timestamp shown where relevant (`Saved just now`, `Saved 2 min ago`),
  - failed sync has explicit retry state.
- Accessibility:
  - target WCAG 2.2 AA for changed surfaces,
  - keyboard access, visible focus, correct ARIA label/description mapping,
  - touch targets remain comfortably usable on mobile.
- Performance:
  - no regressions in changed flows against CWV targets in Acceptance Criteria.

## UX Copy and Trigger Contract (V1)

- Guest mode reassurance:
  - `No account needed to start.`
- Sign-in code request CTA:
  - `Request login code`
- Sign-in form behavior after code email sent:
  - do not duplicate email inputs,
  - keep a single visible email field (read-only) and one code input,
  - keep `Sign in with code` as primary (blue) CTA.
- Progress backup prompt (trigger: after 3 lessons marked complete in guest mode):
  - `Don't lose your progress if this browser clears storage.`
  - `Create a free account to back up and sync across devices.`
- Post-purchase upgrade prompt:
  - `Create a free account to keep downloads and progress synced.`
- Library claim prompt for guest buyer:
  - `Already bought this? Claim your library with email magic link.`
- Library tab labels:
  - `My Library`
  - `Explore More`
- Upsell section headline:
  - `Additional Learning`
- Naming guardrail:
  - avoid primary labels like `Shop`/`Buy` in account/library surfaces.

## User Journey Contract (V1)

1. Free user lands on course and progresses immediately in guest mode (local storage).
2. User buys paid product via guest Stripe Checkout (`email + payment` only).
3. Success page provides immediate download and confirms email delivery.
4. After 3 completed lessons, user sees optional progress-safety popup for free account backup/sync.
5. If user claims account with purchase email, purchases are attached and local progress is imported.
6. User on second device can sign in and continue both free and paid progress from `My Library`.
7. User can open/preview/download purchased guides from phone in `My Library`.

## 0-1000m Interactive Plan Draft (V1)

- Plan structure:
  - 10 weeks, 20 sessions (`2 sessions per week`),
  - session IDs: `S01` ... `S20`.
- Per-session UI fields:
  - session title,
  - focus,
  - target set/distance,
  - checkbox `Completed`,
  - notes field (free text).
- Progress behavior:
  - checking `Completed` stores completion timestamp,
  - notes auto-save locally and sync to account when signed in,
  - completion summary visible at top (`x/20 complete`).
- Device behavior:
  - works on phone first (single-column cards),
  - desktop can show week-grouped overview.
- PDF parity:
  - PDF remains downloadable,
  - interactive page acts as working tracker layer (`checkbox + notes`) for same plan.

## State and Recovery Matrix (Non-Negotiable)

- `webhook delay`: show "Processing purchase" state with auto-refresh + manual refresh button.
- `webhook failure`: show support path + safe retry/restore action, no false ownership granted.
- `no entitlements`: clear empty state with purchase CTAs.
- `no owned items`: default active tab = `Explore More`; keep `My Library` tab visible.
- `sync conflict`: apply latest-server-write rule and show non-blocking "recent activity synced" note.
- `offline edit`: queue local change marker and sync when online, show pending badge.
- `guest milestone prompt`: show once at 3 completed lessons; if dismissed, suppress for 7 days before re-show.
- `password reset during checkout/library`: return to original intent route after auth completion.
- `guest storage cleared`: show recovery prompt with account claim/sign-in and resend-download option.
- `claim email mismatch`: show explicit message and support route for manual purchase linking.
- `preview not available`: fall back to direct download with clear message and no dead-end.

## Scale and Cost Guardrails

- Default now: stay on Supabase-first architecture for speed and reliability at launch.
- Re-evaluate stack only when one or more triggers are true for 2+ consecutive months:
  - auth/DB bill growth materially outpaces revenue growth,
  - p95 API latency for core authenticated routes degrades beyond acceptable UX targets,
  - required auth/product features cannot be delivered without significant workarounds.
- If triggers are met:
  - phase 1: optimize indexes/queries/cache + reduce unnecessary writes,
  - phase 2: optimize plan/configuration on existing platform,
  - phase 3: evaluate partial migration (`Auth.js + Neon`) with explicit ROI and migration plan.
- Keep migration-ready boundaries from day one:
  - isolate auth and data access behind service/repository modules,
  - avoid vendor-specific logic spread across UI components,
  - keep Stripe entitlement logic independent from auth vendor SDK.

## Lock-In Mitigation Contract (Required)

- Business logic boundaries:
  - keep core purchase/progress/entitlement logic in app services, not in Supabase-specific UI code.
- Data access boundaries:
  - use a thin repository/data-access layer between routes/services and Supabase client.
- Schema ownership:
  - keep DB schema, indexes, and RLS policies in versioned SQL migrations committed to repo.
- Vendor feature scope:
  - avoid unnecessary Supabase-only features in core flows when equivalent portable patterns exist.
  - if a Supabase-specific feature is introduced, document why and define migration fallback.

## Owner Inputs Required Before Implementation

- Product catalog:
  - final product names/slugs,
  - launch prices and currency,
  - bundle policy (if any),
  - phase-2 upsell prices/discount windows:
    - `M1`: `0-1000m` -> `poolside` add-on price,
    - `M2`: `poolside` -> `0-1000m` add-on price,
    - `M3`: `video analysis` discount percent and validity window.
- Brand/copy:
  - final naming for paid hub heading (`Plans`, `Plans & Analysis`, or equivalent),
  - support email/URL to place on owned cards.
- Policy:
  - refund policy URL,
  - privacy policy URL (v1 default implemented at `/privacy`),
  - terms URL,
  - data request contact email (privacy inbox),
  - cookie policy URL (v1 default implemented at `/cookies`).
- Operations:
  - production domain URL,
  - Vercel project/environment ownership confirmed,
  - Stripe account mode confirmed (`sandbox` first, then `live`),
  - DPA acceptance confirmed for Stripe/Supabase/Vercel accounts.

## Architecture Contract (V1)

### Core routes

- `/plans`: paid-offer hub page (all upsells).
- `/my-library`: authenticated library with owned and not-owned sections.
- `/my-library?tab=library|explore`: tab-driven library/explore surface.
- `/my-library/item/[slug]`: owned-item detail with open/preview/download actions.
- `/my-library/goals`: optional subview for goals and milestones.
- `/checkout/success`: post-purchase success page with download now + claim account CTA.
- `/claim`: account claim entry via magic link for guest purchasers.
- `/guides/0-1000m`: interactive 20-session web plan.
- `/api/checkout/session`: create Stripe Checkout session for selected product.
- `/api/stripe/webhook`: process Stripe events and grant entitlements idempotently.
- `/api/portal`: create Stripe customer portal session.
- `/api/download/resend`: resend secure download link by purchase email.
- `/api/progress/course`: read/write free-course progress for signed-in user.
- `/api/progress/guide`: read/write paid-guide progress for signed-in user.
- `/api/user/export`: export app-owned user data.
- `/api/user/delete`: delete app-owned user data and revoke session.

### Database tables (minimum)

- `profiles`:
  - `id uuid primary key` (references auth user),
  - `email text`,
  - timestamps.
- `products`:
  - `id text primary key`,
  - `slug text unique`,
  - `title text`,
  - `kind text` (`course_addon`, `analysis`, etc.),
  - `stripe_price_id text unique`,
  - `active boolean`.
- `entitlements`:
  - `id uuid primary key`,
  - `user_id uuid`,
  - `product_id text`,
  - `source text` (`stripe_checkout`),
  - `stripe_customer_id text`,
  - `stripe_checkout_session_id text unique`,
  - `granted_at timestamptz`.
- `download_links`:
  - `id uuid primary key`,
  - `entitlement_id uuid`,
  - `token_hash text unique`,
  - `expires_at timestamptz`,
  - `used_at timestamptz nullable`.
- `course_progress`:
  - `user_id uuid`,
  - `lesson_id text`,
  - `done boolean`,
  - `video_seconds integer`,
  - `updated_at timestamptz`,
  - unique key on (`user_id`, `lesson_id`).
- `guide_progress`:
  - `user_id uuid`,
  - `guide_slug text`,
  - `section_id text`,
  - `completed boolean`,
  - `notes text`,
  - `updated_at timestamptz`,
  - unique key on (`user_id`, `guide_slug`, `section_id`).
- `guide_sessions`:
  - `guide_slug text`,
  - `session_number integer`,
  - `week_number integer`,
  - `title text`,
  - `description text`,
  - primary key on (`guide_slug`, `session_number`).
- `guide_session_progress`:
  - `user_id uuid`,
  - `guide_slug text`,
  - `session_number integer`,
  - `completed boolean`,
  - `notes text`,
  - `completed_at timestamptz nullable`,
  - `updated_at timestamptz`,
  - unique key on (`user_id`, `guide_slug`, `session_number`).
- `goals`:
  - `id uuid primary key`,
  - `user_id uuid`,
  - `title text`,
  - `target_value numeric`,
  - `target_unit text` (`m`, `minutes`, etc.),
  - `target_date date`,
  - `status text` (`active`, `achieved`, `archived`),
  - `celebrated_at timestamptz nullable`.

### Security contract

- Enable RLS on user-owned tables.
- Policy baseline:
  - `select/insert/update/delete` allowed only when `auth.uid() = user_id`.
- Webhook writes use service-role key on server only.
- Never expose service-role key to browser/client bundle.
- Verify Stripe webhook signatures on every event.
- Use idempotent fulfillment keying by `stripe_checkout_session_id` to prevent duplicate grants.
- Log fulfillment attempts/outcomes for support and reconciliation.
- Download links must be short-lived, single-purpose, and validated server-side.
- `resend` and `claim` endpoints must enforce abuse protection:
  - per-IP and per-email rate limits,
  - non-enumerating response copy,
  - audit logging of repeated attempts.

## Analytics and KPI Contract (V1)

- Required events:
  - `plans_viewed`,
  - `checkout_started`,
  - `checkout_completed`,
  - `entitlement_granted`,
  - `download_link_resent`,
  - `account_claim_started`,
  - `account_claim_completed`,
  - `library_viewed`,
  - `library_tab_switched`,
  - `item_preview_opened`,
  - `item_download_started`,
  - `resume_clicked`,
  - `progress_synced`,
  - `sync_failed`,
  - `support_clicked`,
  - `upsell_presented`,
  - `upsell_accepted`,
  - `upsell_declined`,
  - `discount_redeemed`.
- 90-day KPI targets (initial baseline can be revised after launch data):
  - checkout completion rate from started checkout >= `55%`,
  - entitlement grant latency p95 <= `10s`,
  - weekly resume usage among buyers >= `35%`,
  - support tickets for "cannot access purchase" <= `3%` of buyers.
- Compliance guardrail:
  - analytics events must avoid direct sensitive payloads and unnecessary personal data.

## Monetization Expansion Contract (Phase 2 / v1.1, Post-MVP)

- Intent:
  - increase average order value and repeat purchases without adding pre-checkout friction.
- Enablement gate (must pass before activation):
  - core checkout completion >= `55%` for at least 2 consecutive weeks,
  - "cannot access purchase" support rate <= `3%` of buyers over same period.
- Offer rollout sequence (strict order):
  1. `M1` first: when buying `0-1000m guide`, show optional add-on `poolside guide` at `USD 19` (base `USD 29`).
  2. `M2` second: when buying `poolside guide`, show optional add-on `0-1000m guide` at `USD 49` (base `USD 59`).
  3. `M3` third: after any paid purchase, offer `video analysis` at `10%` off for `48h`.
- UX guardrails (non-negotiable):
  - offers are optional and clearly dismissible,
  - only one upsell decision per step (no stacked modals),
  - keep value copy concrete (`Save $10 today`) and time-bound when relevant (`Offer expires in 48h`),
  - do not block library access or downloads behind upsell prompts.
- Stripe implementation contract:
  - implement `M1` and `M2` via Checkout `optional_items`,
  - implement `M3` via server-applied discount/coupon rule at session creation,
  - enforce eligibility server-side using entitlement state and expiry checks,
  - respect Stripe single-discount-per-session limitation and define deterministic priority (`M3` offer first, then none).
- Data and abuse controls:
  - store phase-2 offer exposure/accept/decline/redemption events with stable `offer_id`,
  - persist redemption lock to prevent repeated use of one-time discount windows per user/email.
- Phase-2 KPI targets (first 30 days after activation):
  - add-on attach rate for `M1` >= `8%`,
  - checkout completion drop vs pre-upsell baseline <= `3` percentage points,
  - AOV uplift >= `12%`,
  - `M3` conversion within 48h window >= `5%`.
- Feature-flag requirement:
  - wrap each offer (`M1`, `M2`, `M3`) behind independent flags for instant rollback.

## Environment Variables (Names Only)

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_0_1000M_GUIDE`
- `STRIPE_PRICE_ID_POOLSIDE_GUIDE`
- `STRIPE_PRICE_ID_ANALYSIS`
- `GUIDE_0_TO_1000M_PDF_ASSET_PATH` (optional)
- `GUIDE_POOLSIDE_PDF_ASSET_PATH` (optional)
- `NEXT_PUBLIC_FS_UPSELL_M1_ENABLED` (phase 2)
- `NEXT_PUBLIC_FS_UPSELL_M2_ENABLED` (phase 2)
- `NEXT_PUBLIC_FS_UPSELL_M3_ENABLED` (phase 2)
- `STRIPE_COUPON_ID_ANALYSIS_10` (phase 2)

## External Setup Runbook (Owner + Agent, Confirmation-Gated)

Execution protocol for this task:

1. Agent gives exactly one actionable step at a time.
2. Owner performs that step and replies `done` (or shares blocker).
3. Agent verifies outcome and only then provides the next single step.
4. Repeat until checklist is complete.

### Step 1: Create Supabase project

- Owner:
  - create Supabase project in chosen region,
  - copy project URL and keys (`anon`, `service_role`) to secure notes.
- Agent:
  - confirms required keys are captured,
  - provides next step only after owner replies `done`.

### Step 2: Configure Supabase Auth

- Owner:
  - enable email magic link auth,
  - set Site URL and redirect URLs for local + production,
  - keep email template basic for v1.
- Agent:
  - confirms redirect URLs are correct,
  - provides next step after `done`.

### Step 3: Create Stripe products/prices

- Owner:
  - create products in Stripe sandbox:
    - `0-1000m guide`,
    - `poolside guide`,
    - `analysis`,
  - create one price per product and copy all `price_id` values.
- Agent:
  - maps each price ID to env var names,
  - confirms receipt email settings and post-checkout return URLs,
  - provides next step after `done`.

### Step 4: Configure Stripe webhook

- Owner:
  - create webhook endpoint for `/api/stripe/webhook`,
  - subscribe to at minimum:
    - `checkout.session.completed`,
    - `checkout.session.async_payment_succeeded`,
  - save signing secret (`whsec_...`) securely.
- Agent:
  - confirms event list and secret handling,
  - provides next step after `done`.

### Step 5: Configure Vercel environment variables

- Owner:
  - add all required env vars to `Development`, `Preview`, and `Production`,
  - redeploy preview after variables are set.
- Agent:
  - validates variable names and scope coverage,
  - provides next step after `done`.

### Step 6: Local webhook test wiring

- Owner:
  - run local app,
  - run Stripe CLI forwarding to local webhook endpoint.
- Agent:
  - validates event receipt in local logs,
  - provides next step after `done`.

Reference commands (verify latest docs before running):

```bash
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded \
  --forward-to localhost:3000/api/stripe/webhook
```

```bash
npx supabase init
npx supabase start
```

### Step 7: Implementation start gate

- Owner:
  - confirm external setup checklist complete.
- Agent:
  - move brief to `docs/task-briefs/in-progress/`,
  - begin implementation using single-step confirmation flow for any manual owner actions.

## Decision Options (Choose One Per Track)

### Track A: Navigation + Page Naming

- `Option A (Recommended, 10/10)`: keep `Programs` and `Video Analysis` in nav, add `/plans` hub, use `My Library` as account destination label.
- `Option B (8/10)`: add `Shop` as top-level and move all offers under it.
- `Option C (6/10)`: use `Additional Help` as top-level paid label.

### Track B: Account Requirement Model

- `Option A (Recommended, 10/10)`: guest-first flow (guest progress + guest checkout + optional account claim for backup/sync/library).
- `Option B (7/10)`: account optional for free browsing, but required/auto-created for paid ownership.
- `Option C (5/10)`: force sign-in before any purchase or course progress.

### Track C: Auth + Database Stack

- `Option A (Recommended, 9.5/10)`: Supabase Auth (magic link + OAuth) + Postgres + Row-Level Security for user-owned data.
- `Option B (9/10)`: Auth.js + Neon Postgres + Drizzle ORM (max control, more implementation effort).
- `Option C (8/10)`: Clerk + Postgres (fast managed auth, recurring cost/vendor lock).

### Track D: Payments + Entitlements

- `Option A (Recommended, 10/10)`: Stripe Checkout + webhook fulfillment + app DB entitlements table.
- `Option B (8/10)`: payment links only + manual reconciliation.
- `Option C (6/10)`: no entitlement table, infer ownership from Stripe on each request.

### Track E: Progress Sync Model

- `Option A (Recommended, 10/10)`: local-first UI + debounced server sync + conflict rule `latest server write wins`, plus manual retry state.
- `Option B (8/10)`: server-only writes (simple but worse perceived responsiveness).
- `Option C (7/10)`: local-only progress (no cross-device reliability).

### Track F: Paid Content Format

- `Option A (Recommended, 10/10)`: deliver both downloadable PDF and interactive HTML guide with checklists/notes/progress.
- `Option B (8/10)`: PDF only.
- `Option C (7/10)`: HTML only.

### Track G: Goal Tracking

- `Option A (Recommended, 9.5/10)`: support manual goals (preset + custom), progress milestones, and simple celebration states.
- `Option B (7/10)`: no goals in v1.
- `Option C (8/10)`: external wearable-only goals (defer due integration overhead).

### Track H: Monetization Expansion Timing

- `Option A (Recommended, 10/10)`: keep upsells/discounts in phase 2 after MVP stability gate; roll out `M1` -> `M2` -> `M3`.
- `Option B (7/10)`: launch all upsell/discount rules in MVP.
- `Option C (8/10)`: skip upsells entirely first 90 days and optimize only baseline conversion.

## Sequencing With Existing PWA Work

- `Recommended sequence`:
  1. Build account + entitlements + `My Library` + progress sync foundation first.
  2. Continue/install PWA baseline in parallel where non-conflicting.
  3. Implement deeper offline/data-strategy tasks after server sync contracts are in place.
- Rationale:
  - browser-managed storage can be evicted/cleared,
  - account-backed sync reduces data-loss risk and support burden before heavier PWA investment.

## Implementation Phases

1. **Foundation (Week 1-2)**
   - auth, DB schema, Stripe checkout + webhook, entitlement persistence.
   - status: `done`.
2. **Library (Week 2-3)**
   - `My Library` page, owned/not-owned sections, receipt portal link, support links.
   - status: `in-progress` (owned/explore done; portal/support/download actions pending).
3. **Progress (Week 3-4)**
   - free-course progress sync migration from localStorage,
   - paid interactive guide progress sync.
   - status: `in-progress` (free-course sync + guest backup prompt delivered; paid-guide sync pending).
4. **Trust + QA (Week 4)**
   - data export/delete controls, tests, accessibility polish, verify gate.
   - status: `in-progress` (export/delete + GDPR baseline docs delivered; analytics expansion and final QA pending).
5. **Monetization Expansion (Post-MVP)**
   - enable `M1` first behind flag and observe KPIs,
   - if stable, enable `M2`, then `M3`.
   - status: `deferred until MVP gate`.

## Step-By-Step Delivery Plan (Agent Execution)

For this task, delivery should follow strict one-step guidance when owner action is required.

1. Implement schema + RLS + type generation.
2. Implement auth/session wiring and guarded `My Library` route.
3. Implement Stripe checkout API + webhook idempotent fulfillment.
4. Implement entitlements query layer + owned/not-owned UI sections.
5. Implement `My Library` + `Explore More` tabs and mobile preview/download actions.
6. Implement free-course progress server sync migration path.
7. Implement paid interactive guide state + sync endpoints.
8. Implement `0-1000m` interactive 20-session web plan (checkboxes + notes + completion).
9. Implement Stripe portal link and support link on owned cards.
10. Implement goals MVP UI/state with achievement state.
11. Implement data export/delete endpoints and UI entry points.
12. Implement analytics events + operational logs for entitlement/progress flows.
13. Add/update tests, run `npm run verify`, complete manual QA matrix.

At each phase:

- if no owner action is required, agent proceeds directly;
- if owner action is required (dashboard/config/manual QA), agent pauses and waits for explicit owner confirmation before proceeding.

## Session Continuity and Recovery

- Canonical source of truth: git branch + this brief file path.
- Checkpoint cadence: commit at each completed milestone or every 60-90 minutes of active coding.
- Required checkpoint note in updates/handoff:
  - latest commit hash,
  - completed milestone,
  - next milestone.
- Recovery protocol if session/chat is interrupted:
  1. run `git status -sb`,
  2. run `git log --oneline -n 10`,
  3. reopen this brief and continue from the recorded next milestone.
- Branch safety:
  - push checkpoint commits to remote branch after major milestones so work survives local interruption.

## Git Rhythm (Locked For This Brief)

- Commit + push cadence:
  - commit and push after each validated implementation step,
  - minimum validation gate per step:
    - `npm run lint`,
    - `npm run typecheck`,
    - targeted tests for changed scope (unit/e2e as relevant).
- PR cadence to `main`:
  - cut or refresh PR after every `2-4` validated checkpoint commits, or one completed vertical slice, whichever comes first,
  - if active implementation continues across days, ensure PR is updated daily.
- Assistant prompt contract (required):
  - after each validated step, assistant explicitly asks: `Commit + push this checkpoint now?`,
  - after every second pushed checkpoint (or one completed slice), assistant explicitly asks:
    - `Open/update PR to main now?`
  - this prompt contract is mandatory even if owner does not explicitly request it each time.

### Branch Hygiene (Locked For This Brief)

- Post-merge cleanup (same session):
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - if remote branch remains: `git push origin --delete <merged-branch>`
  - `git fetch --prune origin`
- Daily hygiene while this brief is active:
  - run `git branch -vv` and clean stale local branches with upstream `: gone` after owner confirmation.
- Safety:
  - avoid `git branch -D` unless owner explicitly confirms, or a dated backup/tag has been created first.

## Implementation Checkpoint Log (In Progress)

- `2026-02-17` | `working tree` | analytics coverage completion slice implemented:
  - added tracked library section navigation:
    - `components/my-library/LibrarySectionTabs.tsx`,
    - `app/my-library/page.tsx` (`library_tab_switched`).
  - added tracked link wrapper for non-blocking client analytics:
    - `components/analytics/TrackedLink.tsx`.
  - added checkout-cancel analytics tracker:
    - `components/analytics/TrackCheckoutCancel.tsx`,
    - mounted in:
      - `app/plans/page.tsx`,
      - `app/my-library/page.tsx`.
  - upgraded checkout CTA analytics coverage:
    - `components/my-library/CheckoutButton.tsx` now emits:
      - `upsell_accepted`,
      - enriched checkout cancel path tags for `upsell_declined` tracking.
  - extended plans and owned-item action instrumentation:
    - `app/plans/page.tsx` (`upsell_presented`, `support_clicked`),
    - `app/my-library/item/[slug]/page.tsx` (`item_preview_opened`, `support_clicked`),
    - `app/my-library/page.tsx` (`upsell_presented`).
  - extended webhook discount telemetry:
    - `app/api/stripe/webhook/route.ts` now emits `discount_redeemed` when discount amount > 0.
  - validation run completed:
    - `npm run lint`,
    - `npm run typecheck`,
    - `npm run test:unit -- --run`.
  - next step: run preview QA pass for analytics payload sanity and open PR.
- `2026-02-17` | `working tree` | GDPR/privacy/cookie docs + workflow runbook slice implemented:
  - added user-facing legal disclosure routes:
    - `app/privacy/page.tsx`,
    - `app/cookies/page.tsx`.
  - updated policy discoverability in checkout/account surfaces:
    - `app/checkout/success/page.tsx`,
    - `app/my-library/page.tsx`.
  - updated sitemap coverage for policy routes:
    - `app/sitemap.ts`.
  - added operational GDPR rights runbook:
    - `docs/runbooks/gdpr-data-rights.md`.
  - updated in-progress brief status to mark GDPR/privacy/cookie baseline as delivered.
  - next step: close remaining analytics event coverage and related QA checks.
- `2026-02-17` | `working tree` | analytics/KPI baseline implemented:
  - added central analytics event contract + sanitizing logger:
    - `lib/analytics/events.ts`.
  - added client analytics sender + mount tracker:
    - `lib/analytics/client.ts`,
    - `components/analytics/TrackEventOnMount.tsx`.
  - added analytics ingestion endpoint:
    - `POST /api/analytics/event` (`app/api/analytics/event/route.ts`).
  - instrumented core flows:
    - checkout/session + webhook:
      - `checkout_started`,
      - `checkout_completed`,
      - `entitlement_granted`.
    - resend/claim:
      - `download_link_resent`,
      - `account_claim_started`,
      - `account_claim_completed` (on guest-entitlement attach).
    - progress APIs:
      - `progress_synced`,
      - `sync_failed`.
    - UI baseline signals:
      - `plans_viewed`,
      - `library_viewed`,
      - `resume_clicked`,
      - `item_download_started`.
  - next step: close GDPR/privacy/cookie workflow docs + runbook scope.
- `2026-02-17` | `working tree` | `/api/user/delete` endpoint implemented:
  - added authenticated delete route:
    - `app/api/user/delete/route.ts`.
  - endpoint enforces explicit destructive confirmation payload:
    - `confirm: "DELETE"`.
  - endpoint deletes auth user through admin API (hard delete), which removes user-owned app data by DB relations and clears session via sign-out attempt.
  - added delete-request parsing helper + unit tests:
    - `lib/user/delete.ts`,
    - `tests/unit/user-delete-utils.test.ts`.
  - updated API contract doc for `POST /api/user/delete`.
  - next step: implement analytics event contract baseline.
- `2026-02-17` | `working tree` | `/api/user/export` endpoint implemented:
  - added authenticated export route:
    - `app/api/user/export/route.ts`.
  - route now returns app-owned user export payload with `Cache-Control: no-store`:
    - `profile`,
    - `entitlements`,
    - `courseProgress`,
    - `guideProgress`,
    - `guideSessionProgress`,
    - `goals`,
    - `downloadLinks` metadata.
  - added export payload mapper utility + unit coverage:
    - `lib/user/export.ts`,
    - `tests/unit/user-export-payload.test.ts`.
  - updated API contract doc for `GET /api/user/export`.
  - next step: implement `/api/user/delete` endpoint contract.
- `2026-02-17` | `working tree` | `/claim` recovery route implemented:
  - added dedicated claim entry route:
    - `app/claim/page.tsx`,
    - supports safe `next` handling and optional email prefill.
  - integrated existing secure resend flow on claim page:
    - `DownloadResendForm` now supports `source: "claim_entry"`,
    - resend source normalization supports `claim_entry`.
  - checkout success page now links to dedicated claim flow for signed-out users.
  - updated unit tests for resend source normalization and claim source form submit payload.
  - next step: implement `/api/user/export` endpoint contract.
- `2026-02-17` | `working tree` | repository branch hygiene cleanup completed:
  - deleted remote merged branches:
    - `origin/feat/poolside-interactive-guide`,
    - `origin/feat/my-library-core-split`,
    - `origin/feat/my-library-guides-pdf-split`.
  - deleted stale local branches:
    - `docs/runbooks-and-task-briefs`,
    - `chore/vercel-connect-trigger`,
    - `chore/vercel-prod-env-redeploy`,
    - `backup/main-pre-sync-2026-02-14`.
  - updated task-brief standards to include explicit branch hygiene cadence in:
    - `docs/task-brief-template.md`,
    - `docs/task-briefs/README.md`,
    - this in-progress brief.
  - next step: continue remaining My Library scope from latest `main`.
- `2026-02-17` | `working tree` | cross-guide UX polish bundle (items `1-5`) implemented:
  - `0-1000m`:
    - added `Continue where you left off` CTA tied to persisted last opened session,
    - upgraded fullscreen session mode controls to consistent sticky order:
      - `Previous` -> `Next` -> `Mark complete` -> `Close`,
    - completed-week collapse state now persists across visits,
    - added completion `Undo` toast after marking session complete.
  - `poolside`:
    - added `Continue where you left off` CTA tied to persisted last drill,
    - added persisted completed-drill visibility toggle in overview,
    - added completion `Undo` toast after marking drill complete,
    - upgraded visual fullscreen with:
      - swipe between visuals,
      - double-tap zoom,
      - pinch-to-zoom,
      - sticky controls using the same order as `0-1000m`.
  - language/button-order consistency improved across guides (removed mixed `Forrige/Neste` vs English labels in critical nav controls).
  - next step: run manual mobile + desktop QA focused on gesture behavior and fullscreen control ergonomics.
- `2026-02-17` | `working tree` | `0-1000m` fullscreen session-mode + completed-collapse UX delivered:
  - added fullscreen session flow in `0-1000m` tracker:
    - open one session at a time,
    - `Forrige`/`Neste` in fullscreen,
    - `Close` returns to overview.
  - added overview behavior for completed sessions:
    - completed sessions are collapsed by default per week,
    - explicit `Show completed` / `Hide completed` toggle keeps reopening simple.
  - retained completion + notes editing in both overview and fullscreen views with existing sync model.
  - added helper/test coverage for completion split and next-incomplete selection:
    - `lib/guides/guide-tracker-ui.ts`,
    - `tests/unit/guide-tracker-ui.test.ts`.
  - next step: run manual QA for fullscreen + collapse behavior on mobile + desktop.
- `2026-02-17` | `working tree` | poolside interactive + dual-action baseline implemented:
  - added entitlement-gated interactive route: `/guides/poolside`,
  - added entitlement-gated PDF route: `GET /api/guides/poolside/pdf`,
  - added poolside guide domain data (`12` drills) and safe PDF asset path handling (`GUIDE_POOLSIDE_PDF_ASSET_PATH` optional),
  - added dummy visual assets and placeholder PDF for iterative content replacement,
  - delivered one-drill-per-view UX with:
    - `Forrige`/`Neste` navigation,
    - swipe navigation,
    - `Drills overview`,
    - completion tracking,
    - fullscreen `Visual view` mode,
    - progress sync to `/api/progress/guide` with offline/error/retry states.
  - updated `My Library` item detail action mapping:
    - `guide_0_1000m`: `Open interactive plan` + `Download PDF`,
    - `guide_poolside`: `Open interactive guide` + `Download PDF`,
    - `analysis_video`: `Open video analysis` + `Contact support`.
  - added/updated tests:
    - `tests/unit/guide-poolside-plan.test.ts`,
    - `tests/unit/library-item-actions.test.ts`.
  - validation run completed:
    - `npm run lint`,
    - `npm run typecheck`,
    - `npm run test:unit -- --run tests/unit/guide-poolside-plan.test.ts tests/unit/library-item-actions.test.ts`.
  - next step: run manual mobile + desktop QA for poolside UX and cut checkpoint PR.
- `2026-02-17` | `working tree` | poolside scope decision locked before implementation:
  - owner confirmed `Poolside = PDF + interactive now`,
  - interactive requirements locked:
    - one drill per page,
    - `Forrige`/`Neste` navigation,
    - swipe navigation,
    - `Drills overview` with completion visibility,
    - `Visual view` fullscreen image mode on phone portrait/landscape,
    - dummy visuals now; final focus-mark visuals later.
  - next step: implement `/guides/poolside` interactive flow + entitlement-gated PDF endpoint.
- `2026-02-17` | `working tree` | `0-1000m` dual-action UX + protected PDF download complete:
  - added secure entitlement-gated PDF endpoint: `GET /api/guides/0-1000m/pdf`,
  - added private PDF asset path handling with safe path validation (`GUIDE_0_TO_1000M_PDF_ASSET_PATH` optional override),
  - updated owned-item detail to show dual actions for `0-1000m`:
    - `Open interactive plan`,
    - `Download PDF`.
  - updated `/guides/0-1000m` header actions with direct `Download PDF` and `Back to My Library`,
  - added tests for:
    - guide pdf asset path safety,
    - download button success/error behavior.
  - validation run completed:
    - `npm run lint`,
    - `npm run typecheck`,
    - `npm run test:unit`.
  - next step: implement preview/download/re-download behavior for remaining owned products in `/my-library/item/[slug]`.
- `2026-02-17` | `working tree` | `/guides/0-1000m` interactive plan baseline complete:
  - added authenticated + entitlement-gated `/guides/0-1000m` route,
  - delivered 20-session interactive tracker (`S01-S20`) with per-session completion and notes,
  - guide tracker now stores progress locally and syncs to `/api/progress/guide` with loading/offline/error/retry states,
  - wired `My Library` item detail for `guide_0_1000m` to open the interactive plan.
  - validation run completed:
    - `npm run lint`,
    - `npm run typecheck`,
    - `npm run test:unit`.
  - next step: implement owned item preview/download/re-download in `/my-library/item/[slug]`.
- `2026-02-17` | `working tree` | `/api/progress/guide` baseline contract complete:
  - added `GET/POST /api/progress/guide` with auth guard, `no-store` responses, JSON/content-type validation, and explicit `401/415/413/500` handling,
  - added shared guide-progress normalization module with row de-duplication, identifier bounds, and stable sort behavior,
  - POST now upserts normalized guide progress rows by (`user_id`, `guide_slug`, `section_id`) in `guide_progress`.
  - updated API contract docs with request/response/status details for `/api/progress/guide`.
  - validation run completed:
    - `npm run lint`,
    - `npm run typecheck`,
    - `npm run test:unit`.
  - next step: implement `/guides/0-1000m` interactive 20-session plan and connect client sync to `/api/progress/guide`.
- `2026-02-17` | `working tree` | `/api/download/resend` + checkout/library recovery slice complete:
  - added `POST /api/download/resend` with JSON/content-type guard, `no-store` responses, and non-enumerating success copy,
  - endpoint enforces per-IP + per-email rate limits (Upstash-first with in-memory fallback),
  - resend now verifies entitlement by purchase email and sends magic-link access flow back to `next` path,
  - added reusable `DownloadResendForm` client component and connected it to:
    - `/checkout/success` recovery module,
    - `My Library` empty-owned recovery module.
  - updated `/checkout/success` with immediate `Download from My Library` CTA and clearer post-payment confirmation copy.
  - validation run completed:
    - `npm run lint`,
    - `npm run typecheck`,
    - `npm run test:unit`.
  - next step: implement `/api/progress/guide` baseline contract.
- `2026-02-17` | `working tree` | `/api/portal` implementation complete:
  - added `POST /api/portal` with auth guard, `no-store` headers, safe local `returnPath` handling, and explicit `401/404/500` responses,
  - customer resolution now checks entitlement `stripe_customer_id` first, then Stripe customer lookup by signed-in email fallback,
  - best-effort persistence of fallback `stripe_customer_id` to entitlements for subsequent requests,
  - added helper utils + unit tests for safe return path and active customer selection,
  - wired `My Library` `Manage billing` action to call `/api/portal` and redirect on success with user-visible fallback error copy.
  - validation run completed:
    - `npm run lint`,
    - `npm run typecheck`,
    - `npm run test:unit`.
  - next step: implement `/api/download/resend` and connect success/library recovery flows.
- `2026-02-17` | `working tree` | progress-sync + backup-prompt slice in implementation:
  - added `/api/progress/course` authenticated read/write route,
  - added shared course-progress normalization/merge helpers + unit tests,
  - wired `/course` to hydrate from account, merge local progress, and sync updates for signed-in users,
  - added guest milestone backup prompt after 3 completed lessons with free-account CTA and 7-day dismiss cooldown.
  - validation run completed:
    - `npm run lint`,
    - `npm run typecheck`,
    - `npm run test:unit`,
    - `npm run build`,
    - `npx playwright test tests/e2e/install-prompt.spec.ts --project=mobile-chromium`.
  - next step: implement `/api/portal` using the commerce quality contract before `/api/progress/guide`.
- `2026-02-16` | `44cecac` | completed core implementation through:
  - Supabase schema + RLS baseline,
  - auth/session wiring + guarded `My Library`,
  - Stripe checkout + webhook fulfillment,
  - library owned/explore rendering,
  - auto-attach guest purchases by email on sign-in.
- `2026-02-16` | `7f291be` | added auth resilience improvements:
  - sign-in page now supports both magic-link and one-time code entry,
  - callback now handles both `code` and `token_hash + type` verification paths,
  - fallback error copy updated to guide users toward code-based recovery.
- `2026-02-16` | `1172c41` | sign-in UX refinement:
  - changed CTA to `Request login code`,
  - removed duplicate email inputs in post-send state,
  - made `Sign in with code` primary blue button.
- `2026-02-16` | `1172c41` | library/home continuity UX refinement:
  - `My Library` now includes a `Continue Free Course` card that resumes from saved lesson on this device,
  - home now includes a discrete `Log in to My Library` CTA,
  - mobile home now keeps hamburger menu accessible for direct navigation.
- `2026-02-16` | `3aa4c47` | auth-state clarity refinement:
  - `/auth/sign-in` now redirects immediately to the safe `next` path when user is already signed in,
  - home CTA now changes to `Open My Library` when user already has an active session.
- `2026-02-16` | `3aa4c47` | signed-in visibility refinement:
  - top header now shows a signed-in status chip/dot linking to `My Library` whenever a session is active.
- `2026-02-16` | `75ef38c` | auth abuse protection refinement:
  - added sign-in request and code verification rate limits (IP + hashed email), with Upstash support and safe in-memory fallback,
  - replaced raw provider auth errors with user-friendly cooldown/generic messages to improve UX and reduce abuse signal leakage.
- `2026-02-16` | `ce9e82e` | auth cooldown UX + cadence refinement (merged via PR #19):
  - sign-in cooldown now returns `cooldownUntil` and the error banner counts down live in the UI (no manual refresh needed),
  - added stepped per-email resend cadence for login code requests (`30s` -> `60s` -> `5m`) while retaining hard anti-abuse limits.
- `2026-02-16` | `ec8d2fb` | soft-launch public UX refinement:
  - added a visible public-beta status banner on public routes with direct access links to `Login/My Library` and `Programs`,
  - added a utility footer on public routes with clear `Login/My Library` and `Contact` actions,
  - made header auth action explicit (`Login` when signed out, `My Library` when signed in) to improve navigation clarity,
  - increased mobile screenshot E2E timeout to avoid false failures while capturing full-page core-flow snapshots.
- `2026-02-16` | `7cd6190` | soft-launch simplification per owner direction (merged via PR #21):
  - replaced `Public beta` copy with a simple `under construction` banner on public routes,
  - removed extra banner CTA buttons (`Login`, `Programs`) to reduce noise,
  - removed the temporary utility footer links (`Login`, `Contact`),
  - refined top-right header login chip visual style for cleaner alignment with topbar.

## Security Hardening Follow-Up Tracker

### Completed In This Brief

- `75ef38c`: auth request rate limits added for sign-in email requests (IP + hashed email).
- `75ef38c`: auth verify rate limits added for sign-in code attempts (IP + hashed email).
- `75ef38c`: auth error UX hardened to friendly/generic cooldown copy (reduced provider leakage to user-facing UI).
- `75ef38c`: env access helper fixed for `NEXT_PUBLIC_*` runtime safety in client/server contexts.
- `ce9e82e` (includes PR #19 scope): cooldown error now includes live countdown behavior via `cooldownUntil` parameter.
- `ce9e82e` (includes PR #19 scope): login code resend cadence now uses progressive cooldown (`30s`, `60s`, then `5m`) for better UX and lower provider abuse risk.

### Deferred (Required Before "done" Or Immediately After Launch)

- Verify live rate-limit behavior in preview/prod logs (confirm block + cooldown UX on abuse pattern).
- Add progressive challenge (Cloudflare Turnstile) only when suspicious behavior threshold is met.
- Add auth abuse observability baseline (simple counters + alert rule for sustained auth abuse spikes).

### Trigger For Turnstile Activation

- Any of the following sustained for >= `24h`:
- repeated auth request bursts from limited IP/email pools despite rate limits,
- elevated sign-in provider throttling events impacting normal users,
- materially increased `429` rate on auth endpoints relative to baseline.

### Mandatory Prompt Before Moving Brief To `done`

- `Have we configured Upstash in all Vercel environments and verified it with a live auth cooldown test?`
- `Do current auth abuse metrics require enabling progressive Turnstile now, or can it remain deferred with monitoring?`

## Prompt Wrapper For This Brief

Use this prompt to execute the brief with the required communication style:

```md
Use task brief: docs/task-briefs/in-progress/2026-02-15-my-library-commerce-and-progress-sync.md
Mode: end-to-end (implement + tests + commit + push on current branch)
Communication: one actionable step at a time for manual/external actions; wait for my "done" before next step.
Non-negotiables: no secrets in repo files, preserve accessibility semantics, keep current visual language, run npm run verify.
Git rhythm: commit + push each validated step; ask me explicitly before PR cut/refresh to main.
```

## External References (Primary)

- Stripe Checkout fulfillment and webhooks: `https://docs.stripe.com/checkout/fulfillment`
- Stripe CLI forwarding and webhook testing: `https://docs.stripe.com/stripe-cli/use-cli`
- Stripe customer portal configuration: `https://docs.stripe.com/customer-management/configure-portal`
- Stripe dashboard webhook endpoint setup: `https://docs.stripe.com/development/dashboard/webhooks`
- Stripe webhook signature verification: `https://docs.stripe.com/webhooks/signature`
- Supabase auth magic link: `https://supabase.com/docs/guides/auth/auth-magic-link`
- Supabase CLI local development: `https://supabase.com/docs/guides/local-development/cli/getting-started`
- Supabase MAU usage docs (cost monitoring): `https://supabase.com/docs/guides/platform/manage-your-usage/monthly-active-users`
- Supabase API security + RLS requirements: `https://supabase.com/docs/guides/api/securing-your-api`
- Stripe GDPR and privacy center: `https://stripe.com/privacy-center/legal`
- MDN storage quotas and eviction criteria: `https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria`
- WebKit guidance on script-writable storage retention behavior: `https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/`
- Vercel environment variables: `https://vercel.com/docs/environment-variables`
- Core Web Vitals thresholds (LCP/INP/CLS): `https://web.dev/articles/vitals`
- Baymard checkout UX evidence (guest checkout/account timing): `https://baymard.com/blog/current-state-of-checkout-ux`
- GDPR official text (Regulation (EU) 2016/679): `https://eur-lex.europa.eu/eli/reg/2016/679/oj`

## Completion Record (fill when done)

- `PR`: link to merged PR
- `merge`: source branch -> target branch
- `result`: short outcome summary
