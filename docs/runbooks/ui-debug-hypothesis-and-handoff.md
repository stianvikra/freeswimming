# UI Debug Hypothesis And Handoff

Use this runbook for visual, screenshot, export, browser, layout, or other UI bugs where the observed artifact matters.

## When To Switch Into This Mode

Use the full loop when any of these happen:

- the same visual/export defect survives two fix attempts,
- the owner says the screenshot or saved artifact still shows the problem,
- the preview looks correct but the actual exported/downloaded artifact does not,
- a browser-specific or viewport-specific issue is suspected,
- the issue has already consumed enough time that repeating guesses is likely slower than structured triage.

## Required Debug Loop

1. Restate the exact observed failure from the latest evidence.
2. List plausible causes in likelihood order.
3. Check the most likely cause first with a deterministic probe.
4. Record whether each cause is confirmed or eliminated.
5. Apply the smallest scoped fix for the confirmed cause.
6. Re-run the exact probe that failed before.
7. Regenerate full-resolution artifacts before presenting the result.

For visual/export work, do not use "looks fine in preview" as proof if the failure is in the saved PNG, PDF, print preview, or browser-specific rendering. Validate the artifact the user will actually consume.

## Good Probes

- DOM box metrics for the intended capture/render target.
- Canvas/image dimensions and edge-pixel checks for exported images.
- Full-page and element screenshots for the same viewport.
- Console and network logs when loading state or missing data is involved.
- Repeated action checks for stale state, disabled state, and second-click behavior.
- Device/viewport matrix only after the primary cause is understood.

## Screenshot And Artifact Handoff

- Store full-resolution artifacts in a stable folder under `output/` or the relevant test artifact folder.
- Give the owner the absolute filesystem folder path.
- Use filenames that include:
  - `before-` or `after-`,
  - the surface,
  - viewport/device,
  - important state or option.
- Explain whether the set is `before/after` or `after/reference`.
- In chat, summarize what changed and what to inspect. Do not rely on compressed chat thumbnails as the only review path.

## High-Cost Bug Logging

Log expensive or recurring bugs in `docs/runbooks/high-cost-debug-log.md`.

Add an entry when:

- the bug took multiple hours or repeated correction loops,
- it exposed a reusable root cause pattern,
- it required a non-obvious probe or test,
- the same failure class could reappear elsewhere.

Each entry should include:

- date,
- surface,
- symptom,
- root cause,
- fix pattern,
- detection/probe,
- prevention test or checklist,
- links to PRs, briefs, or artifact folders.

## Session Handoff

When a new chat is the better working mode, give a carry-forward prompt before stopping.

Good triggers include:

- stable checkpoint reached and the next primary goal changes,
- CI/PR work can continue independently,
- the active brief changes,
- the thread contains too many intertwined findings,
- repeated connection/tool interruptions make the current thread risky,
- the owner is pausing, traveling, or closing the machine.

Use `docs/runbooks/pr-flow-and-chat-handoff.md` for the canonical prompt shape.
