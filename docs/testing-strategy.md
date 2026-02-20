# Testing Strategy

Detailed quality scorecard and remaining 10/10 gap items:

- `docs/testing-coverage-scorecard.md`

## Test Pyramid

- Unit/component tests (Vitest + Testing Library):
  - Fast checks for UI behavior, utility functions, and edge cases.
- End-to-end tests (Playwright):
  - Full user flow, keyboard behavior, API interaction, and mobile navigation.

## What Lives Where

- `tests/unit/*`: component and utility tests.
- `tests/e2e/*`: browser-level flows and accessibility checks.

## Playwright Project Matrix

- `mobile-chromium`: Android-like mobile behavior (Pixel 7)
- `mobile-iphone-13-pro-max`: iOS Safari/WebKit mobile behavior
- `tablet-ipad-pro-11`: iPad/tablet viewport behavior
- `desktop-chromium`: desktop Chrome behavior
- `desktop-webkit`: desktop Safari/WebKit behavior
- `desktop-firefox`: desktop Firefox behavior

Project-specific scope rules:

- mobile-nav and mobile screenshot specs run only on `mobile-*` projects.
- keyboard focus trap runs only on `desktop-*` projects.
- desktop/tablet install entry smoke test runs only on `desktop-*` and `tablet-*` projects.

## Playwright Local Isolation

Local Playwright runs are isolated by default to avoid collisions with owner-run `next dev` sessions:

- default test app port: `3100` (`PW_PORT`)
- default test Next output dir: `.next-playwright` (`NEXT_DIST_DIR`)
- default local E2E mode: public (`SITE_LOCK_ENABLED=0`)
- existing local server is **not** reused unless explicitly enabled:
  - `PW_REUSE_EXISTING_SERVER=1 npm run test:e2e`

## Required Checks Before Merge

1. `npm run verify:pre-pr`
2. `npm run verify:pre-merge`
3. Manual local QA on dev URL for changed user flows.
4. Manual Vercel preview QA for changed user flows (same flows verified in preview).

Useful commands:

- `npm run test:e2e:mobile` for fast mobile install/nav checks.
- `npm run test:e2e:extended` for tablet/desktop matrix checks.
- `npm run verify:public` for full verification with public mode forced (`SITE_LOCK_ENABLED=0`).
- `npm run test:e2e:private-gate` for private access gate checks (`SITE_LOCK_ENABLED=1`, `PW_SITE_LOCK_PASSWORD` required).
- `npm run test:e2e:security` for concentrated API/access-control regressions.
- `npm run test:e2e:admin` for authenticated admin flows (foundation/parity/notes).
- `npm run verify:pre-pr` and `npm run verify:pre-merge` for release gates.

## Public vs Private Mode Test Rules

- Default CI/full product checks should run in public mode:
  - `npm run verify:public`
- Private gate behavior should be verified separately:
  - `SITE_LOCK_ENABLED=1 PW_SITE_LOCK_PASSWORD=\"<password>\" npm run test:e2e:private-gate`
- Do not rely on one mode only. Public mode catches product/UI regressions; private mode catches access-control regressions.

## Recommended Test Cadence (Best Practice)

1. On every feature slice before commit:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test:unit`
2. Before opening/updating PR:
   - `npm run verify:pre-pr`
3. Before merge to `main`:
   - `npm run verify:pre-merge`
4. Nightly/regular regression run:
   - `npm run verify:public`
   - `npm run test:e2e:extended`
   - `SITE_LOCK_ENABLED=1 PW_SITE_LOCK_PASSWORD=\"<password>\" npm run test:e2e:private-gate`
5. Dedicated admin regression (manual + nightly workflow):
   - run `.github/workflows/admin-e2e.yml`
   - requires repository secrets:
     - `CI_SUPABASE_URL`
     - `CI_SUPABASE_ANON_KEY`
     - `CI_SUPABASE_SERVICE_ROLE_KEY`
     - `CI_DEV_AUTH_BYPASS_TOKEN`
     - `CI_DEV_AUTH_BYPASS_EMAIL`
     - `CI_DEV_AUTH_BYPASS_PASSWORD`

## Performance Budget Ratchet Policy

- Start with CI-blocking baseline budgets defined in the active performance-hardening brief.
- After `2` consecutive weekly green runs on baseline:
  - assistant must explicitly ask owner whether to tighten budgets toward stretch targets.
- Tighten one step at a time to avoid flaky regressions.
- Record each tighten/hold/revert decision in the relevant brief or PR summary.

## Accessibility

- Keep semantic roles and labels in forms/navigation.
- Run Playwright accessibility scan (`@axe-core/playwright`) for core pages.

## Regression Focus

- Mobile navigation states and focus behavior.
- Contact form validation and API protection (origin/rate-limit/anti-spam).
- Course navigation edge states (first/last lesson behavior).
