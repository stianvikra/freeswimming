# Local Verify And Test Artifacts

Use this runbook for reliable local validation when private-access (site lock) is enabled in `.env.local`.

## Why

- Many E2E tests expect public pages/components.
- If `SITE_LOCK_ENABLED=1`, middleware redirects can hide those elements and create false failures.

## Commands

- Run full verify with site lock disabled for this command only:
  - `npm run verify:public`
- Run docs/governance-only verification directly:
  - `npm run verify:docs-only`
- Run full verify with automatic local log + artifact capture:
  - `npm run verify:open:log`
- Run production-start performance budget gate only:
  - `npm run test:perf:budgets`
- Run release gates with one command:
  - pre-PR: `npm run verify:pre-pr`
  - pre-merge: `npm run verify:pre-merge`
  - merge-preflight summary only: `npm run merge:preflight`
  - pure docs/governance diffs may auto-select `docs-only` inside those commands
  - code/scripts/tests/config/workflow/runtime diffs still run the full lane
  - pre-merge + PR evidence refresh + merge preflight: `npm run gate:pre-merge`
  - private-gate env when lock is enabled:
    - automation default (auto-wires token when available): `SITE_LOCK_ENABLED=1 npm run verify:pre-merge`
    - force password-flow coverage: `SITE_LOCK_ENABLED=1 PW_SITE_LOCK_USE_PASSWORD=1 PW_SITE_LOCK_PASSWORD="<password>" npm run verify:pre-merge`
- If npm is missing in a non-interactive shell, run script directly:
  - `bash ./scripts/run-verify-open.sh`
  - script auto-attempts `nvm` bootstrap before failing.
- Show summary from the latest captured verify run:
  - `npm run verify:last`

## Playwright isolation defaults (local)

To prevent local E2E from being blocked by an already running `next dev`:

- Playwright now starts its own local app server by default.
- Default port is `3100` (not `3000`).
- Default Next build dir is `.next-playwright` (isolated from normal `.next`).
- Public-mode E2E default is `SITE_LOCK_ENABLED=0`.

Codex runtime note:

- In Codex sandbox, full verify/build/e2e commands can fail on local port binding.
- Use escalation-first execution for these commands to avoid one failing attempt before rerun:
  - `npm run verify`
  - `npm run verify:pre-pr`
  - `npm run verify:pre-merge`
  - `npm run build`
  - `npm run test:e2e*` / `npx playwright test`

Optional overrides:

- Reuse an existing local server only when explicitly requested:
  - `PW_REUSE_EXISTING_SERVER=1 npm run test:e2e`
- Override test server port:
  - `PW_PORT=<port> npm run test:e2e`
- Override isolated Next output dir:
  - `NEXT_DIST_DIR=<dir> npm run test:e2e`

## Where results are stored

- Local path: `artifacts/test-runs/<timestamp>/`
- Files:
  - `verify.log`
  - `exit-code.txt`
  - `mode.txt` (`docs-only` or `full-public`)
  - `meta.json` (HEAD SHA + lane + status metadata for local reuse decisions)
  - copied Playwright output if present:
    - `test-results/`
    - `playwright-report/`
- Symlink to latest run:
  - `artifacts/test-runs/latest`

This folder is git-ignored and kept locally.

Pre-merge evidence marker (for PR body refresh automation):

- Local path: `artifacts/verify-pre-merge/`
- Files:
  - `<timestamp>.json` (contains PASS marker + head SHA + lane/mode metadata)
  - `latest.json` symlink to newest marker

## Recommended regular cadence

- On each feature branch before PR:
  - `npm run verify:pre-pr`
- For pure docs/governance closeouts:
  - `npm run verify:pre-pr` and `npm run verify:pre-merge` may auto-select docs-only.
  - `VERIFY_FORCE_FULL=1 npm run verify:pre-pr` forces the full lane when needed.
- For faster inner-loop checks:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run test:e2e:mobile` (if touching mobile/nav/auth/guide flows)
- Before merge:
  - run `npm run verify:pre-merge`.
  - if the latest local verify artifact is already a PASS for the same HEAD and lane, pre-merge now reuses that step-1 result instead of rerunning it.
  - if HEAD, lane, or status do not match, pre-merge reruns the full step-1 verification as before.
  - run `npm run merge:preflight` (or `npm run gate:pre-merge`) so the merge handoff is based on current-head local evidence.
  - if validating private unlock UX, force password mode:
    - `SITE_LOCK_ENABLED=1 PW_SITE_LOCK_USE_PASSWORD=1 PW_SITE_LOCK_PASSWORD="<password>" npm run verify:pre-merge`
- After merge and local `main` sync:
  - run `npm run post-merge:preflight` before moving briefs to `done`.

## CI and Nightly Automation

- PR/push CI now includes:
  - `test:e2e:smoke` (fast critical path)
  - `test:e2e:site-lock` (private-access gate behavior)
  - full `verify` (includes `test:perf:budgets`) and `build:webpack`
- Nightly full E2E is GitHub-hosted (not local machine):
  - workflow: `.github/workflows/nightly-e2e.yml`
  - schedule: `01:30` Norway time (CET/CEST via seasonal UTC cron)
  - manual run available via `workflow_dispatch`
  - uploads Playwright artifacts for debugging
  - uploads performance budget JSON artifact (`artifacts/perf-budget-report.json`)
  - includes both public full-matrix and private-gate smoke coverage

You do not need to keep your laptop on for nightly runs.
