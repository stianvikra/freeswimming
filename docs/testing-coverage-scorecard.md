# Testing Coverage Scorecard

This scorecard tracks current automated coverage and what is still needed for a 10/10 quality bar.

## Current Coverage (Automated)

| Area                     | Current automated coverage                                               | Status                |
| ------------------------ | ------------------------------------------------------------------------ | --------------------- |
| Functional regression    | Unit tests + Playwright flows (`tests/unit`, `tests/e2e`)                | Strong                |
| Cross-device/browser     | Playwright matrix (`mobile-*`, `tablet-*`, `desktop-*`)                  | Strong                |
| Access control/security  | Contact API origin checks, site-lock private gate, admin role/API denial | Medium-Strong         |
| Accessibility            | Axe scans on home + contact, keyboard/focus checks                       | Medium                |
| SEO/runtime indexability | `sitemap.spec.ts`, robots/sitemap routes in app                          | Medium                |
| Visual regression        | Screenshot capture spec exists (`mobile-screenshots.spec.ts`)            | Medium (capture only) |
| Performance budgets      | `test:perf:budgets` gate on `/`, `/plans`, `/course`, `/my-library`      | Medium-Strong         |

## Existing Test Inventory (No Duplicate Policy)

- Unit/component (Vitest):
  - auth/site-lock, catalog/commerce, admin access/content/products/runtime flags, goals, progress sync, analytics payloads, UI primitives.
- E2E (Playwright):
  - navigation states, install flows, accessibility checks, contact API security, sitemap, soft-launch banner, site-lock gate, admin foundation flow.

Principle:

- Extend or sharpen existing suites before adding new suites.
- Add a new suite only when a risk area has no current coverage.

## Cadence (Best Practice)

1. Per implementation step (local):
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test:unit`
2. Before PR update:
   - `npm run verify:pre-pr`
3. Before merge:
   - `npm run verify:pre-merge`
4. Nightly automation (GitHub Actions):
   - full E2E matrix in public mode
   - private-gate smoke regression

## 10/10 Gaps To Close Next

1. Performance budgets (P0)

- Keep baseline budget gate stable and continue weekly ratchet decisions toward stretch targets.
- Ensure trend reporting stays visible in CI/nightly artifacts.
- Current ratchet: JS transfer default tightened from `425kb` to `400kb` on `2026-05-04`.
- Latest maintenance audit decision: `2026-05-04` `tighten` after trend output reported `4` weekly green runs and `25.1%` worst margin.
- tracked in:
  - `docs/task-briefs/done/2026-02-19-performance-budgets-and-security-negative-path-hardening.md`

2. Visual diff assertions (P1)

- Convert screenshot capture to baseline snapshot assertions for key routes.
- Keep tolerance small; run on stable project(s) first to avoid flaky noise.
- tracked in:
  - `docs/task-briefs/planned/2026-02-18-cross-platform-ux-design-hardening.md`

3. Security hardening tests (P1)

- Add focused API tests for admin/content mutation negative paths and auth abuse/rate-limit boundaries.
- tracked in:
  - `docs/task-briefs/done/2026-02-19-performance-budgets-and-security-negative-path-hardening.md`

4. SEO metadata validation (P1)

- Add route-level assertions for canonical/meta consistency on indexable pages.
- tracked in:
  - `docs/task-briefs/planned/2026-02-18-seo-ai-discoverability-and-admin-seo-controls.md`

## Automation Status

- PR CI:
  - smoke + site-lock smoke + full verify chain.
- Nightly:
  - scheduled at 01:30 Norway time (seasonal UTC cron in workflow).
- Manual owner laptop dependency:
  - none required for nightly runs.
