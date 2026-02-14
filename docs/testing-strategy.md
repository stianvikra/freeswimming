# Testing Strategy

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

## Required Checks Before Merge

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test:unit`
4. `npm run build`
5. `npm run test:e2e`
6. Manual local QA on dev URL for changed user flows.
7. Manual Vercel preview QA for changed user flows (same flows verified in preview).

Useful commands:

- `npm run test:e2e:mobile` for fast mobile install/nav checks.
- `npm run test:e2e:extended` for tablet/desktop matrix checks.

## Accessibility

- Keep semantic roles and labels in forms/navigation.
- Run Playwright accessibility scan (`@axe-core/playwright`) for core pages.

## Regression Focus

- Mobile navigation states and focus behavior.
- Contact form validation and API protection (origin/rate-limit/anti-spam).
- Course navigation edge states (first/last lesson behavior).
