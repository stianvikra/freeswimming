# Task Brief: PWA Foundation, Install, and App Shell

## Metadata

- `id`: `2026-02-15-pwa-foundation-install-and-app-shell`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-15`
- `updated`: `2026-02-17`

## Goal

FreeSwimming should have a production-grade PWA baseline: installable on supported platforms, consistent install UX, and a reliable app-shell/offline fallback foundation.

## Scope

- Validate and harden web app manifest contract:
  - stable app identity (`name`, `short_name`, `start_url`, `scope`, `display`, theme/background colors),
  - icon set quality (maskable + Apple touch icon),
  - metadata consistency across mobile and desktop install surfaces.
- Upgrade service worker from lifecycle-only to baseline app-shell strategy:
  - versioned cache namespace,
  - pre-cache essential shell assets and an offline fallback route,
  - safe cleanup of outdated caches on activate.
- Add a branded offline fallback experience:
  - clear headline,
  - short explanation,
  - primary recovery CTA (`Try again`),
  - secondary navigation CTA back to key app routes.
- Define a minimum safe fallback contract for runtime failures:
  - never show blank/white screen for `network fail + cache miss`,
  - always route to a usable offline fallback surface,
  - keep next action obvious (`Try again`, `Home`, `Menu`).
- Align install entry UX across:
  - contextual install prompt,
  - persistent menu install action,
  - mobile and desktop copy consistency.
- Ensure installed-state behavior is explicit:
  - no repeated install nudges when already installed,
  - clear "already installed" feedback in menu/prompt surfaces.
- Add/update automated tests for:
  - manifest contract,
  - service worker registration,
  - install entry availability and installed-state behavior,
  - offline fallback visibility when network is unavailable.
  - safe fallback behavior after cache/storage removal.

## Out Of Scope

- No background sync queueing.
- No push notifications.
- No deep offline-first data rewrite for all dynamic content.
- No analytics vendor migration.

## Acceptance Criteria

- Installability checks pass on supported browsers (manifest + service worker + HTTPS preview).
- Offline fallback page is reachable and usable when network is unavailable.
- Core shell routes render without crash in offline mode after first successful load.
- If cache is missing (or was cleared), users see fallback UI and recovery actions, not a broken page.
- Install action surfaces remain accessible and consistent on mobile and desktop.
- Installed users do not see repetitive install prompts.
- Actions that require server confirmation do not show permanent success if the network/server is unavailable.
- No measurable regression in Core Web Vitals or perceived page responsiveness.
- Unit + e2e tests covering manifest/install/offline behavior are green.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

## Manual QA Environments

- Local dev URL (for example `http://127.0.0.1:3000`):
  - iOS Safari,
  - Android Chromium,
  - Desktop Chrome,
  - Desktop Safari.
- Vercel preview URL from PR checks:
  - repeat same install/offline smoke flow on at least one mobile + one desktop browser.
- Storage-eviction checks (required):
  - clear website data/cache and verify fallback UX remains usable,
  - verify app recovers correctly after reconnect/reload.

## Constraints

- Keep install UX non-intrusive and aligned with current FreeSwimming design language.
- Keep runtime overhead low (small service worker footprint and predictable caching rules).
- Keep all copy concise and plain-language.
- Treat server state as source of truth; local cache is performance/offline support only.

## 10/10 Cross-Cut Categories (Apply When Relevant)

- Content governance and source-of-truth:
  - declare canonical source per changed surface; avoid split authority.
- Taxonomy and category management:
  - define/maintain consistent labels and ordering where categories exist.
- Workflow and publishing safety:
- Business logic correctness and data integrity: deterministic state transitions, invariant validation, idempotent critical mutations, and no silent data corruption paths.
  - protect rollouts with explicit gates and safe defaults.
- RBAC and auditability:
  - ensure access boundaries and logging for sensitive operations.
- UX/UI quality contract:
  - enforce clear primary actions and required states (`loading`, `empty`, `error`, `retry`).
- Performance contract:
  - define measurable budgets for changed routes/surfaces.
- Testing contract:
  - extend existing unit/e2e suites for critical + negative paths.
- Observability and KPI tracking:
  - define required signals and acceptance thresholds.
- Migration and rollback readiness:
  - document rollout, fallback, and rollback strategy.
- Definition of done quant targets:
  - include explicit measurable pass criteria for closeout.

## 10/10 UX/UI and Reliability Bar

- Install and fallback surfaces must be understandable in under 2 seconds.
- Required UI states must exist and be testable:
  - `loading`,
  - `empty` (when install not available),
  - `error`,
  - `offline`,
  - `retry`.
- New/changed interactions must preserve keyboard/focus semantics and visible focus styles.
- No white/blank screen paths are allowed for cache miss + network failure.
- Copy must be plain-language, action-oriented, and platform-specific where needed.

## Session Continuity and Recovery

- Canonical source of truth: git branch + this brief file.
- Checkpoint cadence: commit at each completed milestone or every 60-90 minutes of active coding.
- Every checkpoint should record:
  - latest commit hash,
  - completed milestone,
  - next milestone.
- Recovery protocol if session/chat is interrupted:
  1. run `git status -sb`,
  2. run `git log --oneline -n 10`,
  3. reopen this brief and continue from the recorded next milestone.

## PR Browser Rule

- Open PR create/review/merge links in Safari by default:
  - `open -a Safari "<PR_URL>"`
- Use another browser only if the owner explicitly asks for it.

## Completion Record (fill when done)

- `PR`: link to merged PR
- `merge`: source branch -> target branch
- `result`: short outcome summary

## Platform 10/10 Scorecard Linkage

- Canonical reference: `docs/quality/platform-10-10-scorecard.md`.
- This brief must mark scorecard categories as `target`/`supporting`/`N/A` and define measurable thresholds for each `target`.
- Closeout must record achieved score (`0-5`) for each target category.

## Automation Execution Contract

- Mode: `automation-first`.
- Assistant executes implementation, validation, commit/push, PR open/update, and check follow-up by default.
- Required gates:
  - before PR update/push: `npm run verify:pre-pr`
  - before merge recommendation: `npm run verify:pre-merge` and required CI green.
- Manual owner steps only when blocked by credentials, UI-only actions, or sandbox/escalation limits.
