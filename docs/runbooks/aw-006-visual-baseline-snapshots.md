# AW-006 Visual Baseline Snapshots

Use this runbook when AW-006 needs a small reference screenshot set for public-route visual review.

## Scope

The pilot captures the current public AW-006 value path only:

- `/`
- `/course?lesson=<DEFAULT_LESSON_ID>`
- `/plans`
- `/programs`
- `/analysis`
- `/our-method`
- `/contact`

It captures `mobile-chromium` and `desktop-chromium` only. It is intentionally on-demand and is not a CI visual-regression gate.

## Command

Use a timestamped local output folder so artifacts cannot be confused with later commits:

```bash
SCREENSHOT_DIR=output/aw-006-visual-baseline-YYYY-MM-DD-HHMMSS npm run screenshots:aw006-baseline
```

Example:

```bash
SCREENSHOT_DIR=output/aw-006-visual-baseline-2026-05-19-143000 npm run screenshots:aw006-baseline
```

The npm script enables `FS_AW006_VISUAL_BASELINE=1` and runs:

```bash
playwright test tests/e2e/aw-006-visual-baseline-screenshots.spec.ts --project=mobile-chromium --project=desktop-chromium
```

Without that explicit enable flag, the spec skips so normal E2E gates do not capture or retain large screenshot artifacts.

## Artifact Names

The comparison type is `reference-only`.

Expected files:

- `reference-home-mobile.png`
- `reference-home-desktop.png`
- `reference-course-mobile.png`
- `reference-course-desktop.png`
- `reference-plans-mobile.png`
- `reference-plans-desktop.png`
- `reference-programs-mobile.png`
- `reference-programs-desktop.png`
- `reference-analysis-mobile.png`
- `reference-analysis-desktop.png`
- `reference-our-method-mobile.png`
- `reference-our-method-desktop.png`
- `reference-contact-mobile.png`
- `reference-contact-desktop.png`

Do not commit generated screenshots. Store handoff artifacts under `output/`.

## Handoff

For a baseline handoff, include:

- clickable `Screenshot artifacts` folder link,
- `Captured: YYYY-MM-DD HH:MM` in local time,
- comparison type: `reference-only`,
- the route and viewport matrix,
- any known caveat from local capture.

When a PR changes product-rendering files, styles, assets, or export HTML, use the normal UI screenshot handoff from `docs/runbooks/ui-debug-hypothesis-and-handoff.md` with `before/after` or `after/reference` naming. This baseline script does not replace owner screenshot approval for actual visual changes.
