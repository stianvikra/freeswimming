# High-Cost Debug Log

Use this log for expensive or recurring failures where the root cause, probe, and fix pattern should be reused later.

Before starting a similar investigation, scan this file for matching symptoms and probes.

## Entry Template

```md
## YYYY-MM-DD - <surface>: <short symptom>

- Surface:
- Symptom:
- Root cause:
- Fix pattern:
- Detection/probe:
- Prevention:
- Evidence:
```

## 2026-04-22 - Poolside Save Image: exported PNG crop looked shifted/clipped

- Surface: poolside note print preview, Save image export.
- Symptom: preview could look acceptable while the saved PNG still had asymmetric left/right margin, appeared shifted right, or clipped the right note edge/corner.
- Root cause: the export proof was not checking the same artifact the owner consumed. The capture path and visual preview had different boundary behavior, so preview screenshots alone could not prove the PNG crop was correct.
- Fix pattern: capture a real white export wrapper around the exact note surface, remove transform/scroll-width assumptions from the export boundary, and validate the generated PNG itself.
- Detection/probe: inspect the downloaded PNG and assert image edge pixels/bounds, not just the embedded preview. Compare note element metrics against exported image dimensions.
- Prevention: for future image/PDF/export changes, require artifact-level validation for all four edges and repeated save attempts before presenting the fix as done.
- Evidence: PR #498, closeout PR #499, and full-resolution artifacts under `/Users/stianvikra/freeswimming/output/playwright/poolside-save-image-crop-boundary-2026-04-21`.

## 2026-04-23 - Poolside Save Image: mobile export flaked only inside full verify matrix

- Surface: poolside note `Save image` Playwright coverage on mobile Chromium during full `verify:pre-merge`.
- Symptom: isolated `poolside-save-image-export` often passed, but the same flow intermittently failed in the full matrix with `NO_ENTRY button=Save image metrics=0 clicks=0 latestClick=none` even when the preview UI looked ready.
- Root cause: the test harness injected a browser-side probe into the popup document, but dev-mode full reloads inside the preview window could wipe that in-memory probe between install and assertion. That produced false negatives that looked like a product export failure.
- Fix pattern: make export probes reload-safe. Install them with `page.addInitScript`, persist probe state in `sessionStorage`, and reset probe counters only when the test explicitly asks for a new capture window, not on every document init. In addition, if the first save-image click still returns the exact diagnostic signature `NO_ENTRY ... clicks=0`, treat it as a lost-click dev-reload window and allow one explicit retry after re-waiting for embedded preview readiness.
- Detection/probe: run the failing Playwright case with `--repeat-each=5`, compare isolated vs full-matrix behavior, and inspect whether the failing artifact reports a preview URL with zero probe clicks/entries. If so, suspect probe lifecycle before product logic.
- Prevention: for popup/preview export tests, avoid one-document-only instrumentation. Treat popup reloads, Fast Refresh, and transient document swaps as first-class when designing diagnostics, and use narrow signature-based retries only when a first interaction clearly never reached the surface under test.
- Evidence: PR #507 follow-up commit after `3aa84db`, repeated repro on `tests/e2e/poolside-save-image-export.spec.ts`, and the failing debug signature `NO_ENTRY ... clicks=0`.

## 2026-04-30 - My Library Full E2E: route rendering/readiness race under full-suite load

- Surface: My Library training context and workout builder Playwright coverage in local full `verify:pre-pr` / `verify:pre-merge`.
- Symptom: targeted builder/generator tests passed, but a later full matrix run failed desktop Chromium with a mix of `page.goto: net::ERR_ABORTED`, save-response timeout, and a stale create-button test id after draft discard.
- Root cause: three separate gate issues landed together under full-suite load:
  - Next dev route rendering could still be busy after navigation, and the shared route-settle helper only watched `Compiling`, not `Rendering`.
  - The canonical builder save-flow timeout was too tight for a full-suite route after preceding My Library work.
  - The post-discard test contract assumed the browse-list create button even though the route returned to the empty-state create button.
- Fix pattern: wait for both `Compiling` and `Rendering` route indicators, add one readiness reload fallback only to the training-context client-ready helper, increase only the affected slow builder test budgets, and align create-button assertions to the route state actually under test.
- Detection/probe: rerun the failing My Library pack on the same head before changing product code:
  `tests/e2e/my-library-training-context.spec.ts` plus `tests/e2e/my-library-workout-builder.spec.ts` on `desktop-chromium`, filtered to the failed cases when possible.
- Prevention: before large session-builder changes, run the relevant My Library route-readiness pack before the broad gate; classify non-failing Next dev `ECONNRESET`/aborted noise as `watch` unless it correlates with an assertion failure.
- Evidence: PR #559, failed local run `artifacts/test-runs/20260430-143439/verify.log`, passing reruns `artifacts/test-runs/20260430-151953/verify.log` and `artifacts/test-runs/20260430-154353/verify.log`.
