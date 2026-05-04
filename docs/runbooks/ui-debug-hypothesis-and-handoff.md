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

- Store full-resolution artifacts in a stable, timestamped folder under `output/` or the relevant test artifact folder.
- Use folder names that include the scope, date, and time, for example `output/<scope>-YYYY-MM-DD-HHMMSS`.
- Give the owner a clickable absolute filesystem folder link labeled `Screenshot artifacts`; do not provide only a backticked path.
- Include `Captured: YYYY-MM-DD HH:MM` in local time next to the artifact link.
- Use filenames that include:
  - `before-` or `after-`,
  - the surface,
  - viewport/device,
  - important state or option.
- Explain whether the set is `before/after` or `after/reference`.
- In the final merge-ready handoff, repeat the same clickable `Screenshot artifacts` folder link.
- If product-rendering files, styles, assets, or export HTML change after capture, regenerate the screenshots. If no visual/rendering files changed after capture, say so explicitly in the final merge-ready handoff.
- In chat, summarize what changed and what to inspect. Do not rely on compressed chat thumbnails as the only review path.

## Freeswimming Local Screenshot Defaults

For local UI screenshot handoffs in this repo, start from the known-good Playwright path before trying browser/MCP alternatives:

1. Start the dev server bound to the same host the browser will use:

   ```bash
   env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000
   ```

2. Capture against `http://127.0.0.1:3000`, not mixed `localhost`/`127.0.0.1` hosts.

3. If Playwright browser binaries are missing, install Chromium explicitly:

   ```bash
   npx playwright install chromium
   ```

4. On macOS/Codex, run screenshot scripts with escalated permissions when Chromium launch fails with sandbox or MachPort permission errors.

5. Prefer repo-local Playwright scripts or Playwright CLI for reproducible artifacts. Do not default to MCP/browser-channel capture for handoff screenshots unless the local path is unavailable; MCP can fail when the Chrome channel is not installed and does not replace full-resolution artifact capture.

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
