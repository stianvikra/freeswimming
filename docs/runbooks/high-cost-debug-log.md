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
