# Task Brief: My Library, Commerce, and Progress Sync (Free + Paid)

## Metadata

- `id`: `2026-02-15-my-library-commerce-and-progress-sync`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-15`
- `updated`: `2026-02-15`

## Goal

Users can buy optional paid products and reliably resume both free-course and paid-guide progress from a single account-backed `My Library` across devices.

## Scope

- Information architecture:
  - keep explicit top-level pages `Programs` and `Video Analysis`,
  - add one paid-offers hub route (`/plans`) that links to all paid offers,
  - add authenticated `My Library` route for owned content and progress.
- Commerce and access:
  - integrate Stripe Checkout for paid offers,
  - implement webhook fulfillment (`checkout.session.completed` and relevant async-success events),
  - persist entitlements in app database (server source of truth),
  - add Stripe Customer Portal link for receipts/invoice history where applicable.
- Account model:
  - free course can be browsed without account,
  - paid access requires account (or auto-create account at checkout email),
  - support low-friction sign-in (magic link).
- Progress:
  - sync free-course progress (currently localStorage-backed) to server when signed in,
  - sync paid guide progress for interactive HTML versions,
  - preserve fast local UX with server reconciliation.
- `My Library` UX:
  - section order: `Owned` first, `Continue` actions prominent,
  - section order below owned: `Recommended/Not Owned` with clear buy CTA,
  - support link present on each owned item.
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
- Major redesign outside changed routes/surfaces.

## Acceptance Criteria

- A user can complete payment and see purchased item in `My Library` on refresh and on another device after sign-in.
- `My Library` always prioritizes `Owned` items and shows resume actions where progress exists.
- Free-course progress can resume on a second device when signed in.
- Paid interactive guide progress can resume on a second device when signed in.
- Not-owned items are clearly purchasable from within `My Library` (no dead-end gray cards).
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

## Manual QA Environments

- Local environment:
  - URL: `http://127.0.0.1:3000`
  - flows tested:
    - buy flow -> webhook fulfilled entitlement -> `My Library` visible,
    - free-course progress resume across sign-in/sign-out states,
    - paid guide progress resume,
    - `Owned`/`Not Owned` ordering and CTA clarity.
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
- Track B: `Option A` (free browsing optional, paid ownership requires account or auto-created account).
- Track C: `Option A` (Supabase Auth + Postgres + RLS).
- Track D: `Option A` (Stripe Checkout + webhook fulfillment + entitlements table).
- Track E: `Option A` (local-first UX + debounced sync + server reconciliation).
- Track F: `Option A` (PDF + interactive HTML).
- Track G: `Option A` (manual goals + milestones/celebration).

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

## User Journey Contract (V1)

1. Free user lands on course, makes progress, and sees clear `Sign in to sync across devices` message.
2. User buys paid product via Stripe Checkout without unnecessary friction.
3. After successful purchase, user is returned to app and sees owned item in `My Library`.
4. User resumes content from `Continue` CTA exactly where they left off.
5. User can access receipts/portal and support from the same library context.
6. User on a second device can sign in and continue both free and paid progress.

## State and Recovery Matrix (Non-Negotiable)

- `webhook delay`: show "Processing purchase" state with auto-refresh + manual refresh button.
- `webhook failure`: show support path + safe retry/restore action, no false ownership granted.
- `no entitlements`: clear empty state with purchase CTAs.
- `sync conflict`: apply latest-server-write rule and show non-blocking "recent activity synced" note.
- `offline edit`: queue local change marker and sync when online, show pending badge.
- `password reset during checkout/library`: return to original intent route after auth completion.

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

## Owner Inputs Required Before Implementation

- Product catalog:
  - final product names/slugs,
  - launch prices and currency,
  - bundle policy (if any).
- Brand/copy:
  - final naming for paid hub heading (`Plans`, `Plans & Analysis`, or equivalent),
  - support email/URL to place on owned cards.
- Policy:
  - refund policy URL,
  - privacy policy URL,
  - terms URL,
  - data request contact email (privacy inbox),
  - cookie policy URL (or section anchor).
- Operations:
  - production domain URL,
  - Vercel project/environment ownership confirmed,
  - Stripe account mode confirmed (`sandbox` first, then `live`),
  - DPA acceptance confirmed for Stripe/Supabase/Vercel accounts.

## Architecture Contract (V1)

### Core routes

- `/plans`: paid-offer hub page (all upsells).
- `/my-library`: authenticated library with owned and not-owned sections.
- `/my-library/goals`: optional subview for goals and milestones.
- `/api/checkout/session`: create Stripe Checkout session for selected product.
- `/api/stripe/webhook`: process Stripe events and grant entitlements idempotently.
- `/api/portal`: create Stripe customer portal session.
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

## Analytics and KPI Contract (V1)

- Required events:
  - `plans_viewed`,
  - `checkout_started`,
  - `checkout_completed`,
  - `entitlement_granted`,
  - `library_viewed`,
  - `resume_clicked`,
  - `progress_synced`,
  - `sync_failed`,
  - `support_clicked`.
- 90-day KPI targets (initial baseline can be revised after launch data):
  - checkout completion rate from started checkout >= `55%`,
  - entitlement grant latency p95 <= `10s`,
  - weekly resume usage among buyers >= `35%`,
  - support tickets for "cannot access purchase" <= `3%` of buyers.
- Compliance guardrail:
  - analytics events must avoid direct sensitive payloads and unnecessary personal data.

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

- `Option A (Recommended, 10/10)`: account optional for free browsing, required/auto-created for paid ownership and restore.
- `Option B (8/10)`: force sign-in before any course access.
- `Option C (5/10)`: guest checkout + optional account later.

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
2. **Library (Week 2-3)**
   - `My Library` page, owned/not-owned sections, receipt portal link, support links.
3. **Progress (Week 3-4)**
   - free-course progress sync migration from localStorage,
   - paid interactive guide progress sync.
4. **Trust + QA (Week 4)**
   - data export/delete controls, tests, accessibility polish, verify gate.

## Step-By-Step Delivery Plan (Agent Execution)

For this task, delivery should follow strict one-step guidance when owner action is required.

1. Implement schema + RLS + type generation.
2. Implement auth/session wiring and guarded `My Library` route.
3. Implement Stripe checkout API + webhook idempotent fulfillment.
4. Implement entitlements query layer + owned/not-owned UI sections.
5. Implement free-course progress server sync migration path.
6. Implement paid interactive guide state + sync endpoints.
7. Implement Stripe portal link and support link on owned cards.
8. Implement goals MVP UI/state with achievement state.
9. Implement data export/delete endpoints and UI entry points.
10. Implement analytics events + operational logs for entitlement/progress flows.
11. Add/update tests, run `npm run verify`, complete manual QA matrix.

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

## Prompt Wrapper For This Brief

Use this prompt to execute the brief with the required communication style:

```md
Use task brief: docs/task-briefs/planned/2026-02-15-my-library-commerce-and-progress-sync.md
Mode: end-to-end (implement + tests + commit + push on current branch)
Communication: one actionable step at a time for manual/external actions; wait for my "done" before next step.
Non-negotiables: no secrets in repo files, preserve accessibility semantics, keep current visual language, run npm run verify.
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
