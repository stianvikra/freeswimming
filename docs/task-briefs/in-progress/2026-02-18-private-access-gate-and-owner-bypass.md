# Task Brief: Private Access Gate And Owner Bypass

## Metadata

- `id`: `2026-02-18-private-access-gate-and-owner-bypass`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-18`
- `updated`: `2026-02-18`

## Goal

freeswimming.org should be private during build, with safe access only for the owner and approved testers.

## Scope

- Add a global site lock in edge/runtime routing (route guard in `proxy.ts`) with allowlist support.
- Add an owner/tester bypass flow:
  - password page (`/preview-access`) with secure session cookie,
  - optional token-based bypass for scripted QA,
  - explicit logout/clear-access action.
- Keep required system routes open:
  - Stripe webhooks,
  - auth callbacks and sign-in routes,
  - health/robots/sitemap behavior based on lock mode.
- Add a branded locked page with high-trust copy and clear next action.
- Add lock state controls via env vars:
  - `SITE_LOCK_ENABLED`,
  - `SITE_LOCK_MODE`,
  - `SITE_LOCK_PASSWORD_HASH`,
  - `SITE_LOCK_BYPASS_TOKEN`,
  - optional cookie/session overrides (`SITE_LOCK_COOKIE_NAME`, `SITE_LOCK_SESSION_MAX_AGE_SECONDS`).
- Add tests:
  - unit tests for guard decision matrix,
  - e2e for blocked visitor, successful owner unlock, and cookie persistence.
- Add runbook docs for enabling/disabling lock in local, preview, and production.

## Out Of Scope

- No redesign of core site content.
- No replacement of auth provider.
- No permanent paywall logic for product launches.

## Acceptance Criteria

- Unauthenticated public visitors are blocked when lock is enabled.
- Owner can unlock once and continue normal navigation with a secure cookie session.
- Protected state survives refresh/navigation and expires on configured timeout.
- Sensitive routes remain reachable for platform operation.
- Robots/sitemap behavior prevents accidental indexing while locked.
- Local, preview, and production behavior is deterministic and documented.
- Unit + e2e coverage for lock and bypass flows is green.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000`
  - Safari, Chrome, Firefox desktop
  - iOS Safari and Android Chromium
- Vercel preview:
  - verify lock on public URL,
  - verify owner bypass unlock and post-unlock navigation.
- Production:
  - final smoke after lock activation and after lock disable.

## Constraints

- Keep existing visual language.
- No secret values in repo.
- Lock checks must be low-latency and edge-safe.
- Do not break Stripe webhook or auth callback flows.

## 10/10 Quality Bar (Required For User-Facing Work)

- Locked page communicates state in under 2 seconds.
- Primary action is obvious: `Request access` or `Enter access`.
- Required states exist and are tested: `loading`, `empty`, `error`, `offline`, `retry`.
- Full keyboard support and visible focus on all lock/unlock controls.
- Mobile layout is production-ready on narrow widths.
- No confusing redirect loops.

## Security, Privacy, And Compliance (Required For Auth/Data/Payments)

- Password verification uses server-side hash comparison only.
- Use constant-time compare for token checks.
- Cookie is `httpOnly`, `secure` (in secure env), `sameSite=lax`, short TTL.
- Add basic rate limiting on unlock attempts.
- Never log raw password or bypass token.
- Add auditable lock/unlock operational logs with redacted context.

## Observability And KPI Contract

- Required events/logs:
  - `site_lock_blocked`,
  - `site_lock_unlocked`,
  - `site_lock_unlock_failed`.
- Minimum operational metrics:
  - unlock success rate,
  - unlock latency,
  - blocked request count by path group.
- Success KPI:
  - 0 accidental public access while lock is on,
  - owner unlock success >= 99% in manual QA.

## Session Continuity And Recovery (Required)

- Canonical source: git branch + this brief file.
- Checkpoint cadence: commit every validated milestone or every 60-90 minutes.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from next milestone.

## Git Rhythm Defaults (Required)

- Commit + push after each validated lock slice (guard, page, cookie/session, tests).
- Refresh PR after 2-4 checkpoints or one full vertical slice.
- Ask owner before PR open/refresh and before merge handoff.

## Branch Hygiene Defaults (Required)

- Post-merge:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git fetch --prune`
- Remove stale local branches with owner confirmation.

## PR Browser Rule (Required)

- Open PR/review/merge links in Safari by default:
  - `open -a Safari "<PR_URL>"`

## Implementation Checkpoint Log (Required For In-Progress Briefs)

- `2026-02-18` | `working tree` | started private access gate implementation:
  - moved brief from `planned` to `in-progress`,
  - created branch `feat/private-access-gate`,
  - added lock config/session/password modules, proxy guard wiring, preview-access page/action, metadata lock behavior, runbook, and tests.
- `2026-02-18` | `working tree` | validation pass completed:
  - `npm run lint`,
  - `npm run typecheck`,
  - `npm run test:unit`,
  - `npm run build`,
  - `npx playwright test tests/e2e/sitemap.spec.ts tests/e2e/soft-launch-banner.spec.ts tests/e2e/private-access-gate.spec.ts --project=desktop-chromium` (`private-access-gate` tests skipped unless lock env is enabled).
  - next step: checkpoint commit + push, then open PR in Safari.

## Completion Record (fill when done)

- `PR`: link to merged PR
- `merge`: source branch -> target branch
- `result`: short outcome summary
