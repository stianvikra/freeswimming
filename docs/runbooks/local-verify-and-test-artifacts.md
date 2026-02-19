# Local Verify And Test Artifacts

Use this runbook for reliable local validation when private-access (site lock) is enabled in `.env.local`.

## Why

- Many E2E tests expect public pages/components.
- If `SITE_LOCK_ENABLED=1`, middleware redirects can hide those elements and create false failures.

## Commands

- Run full verify with site lock disabled for this command only:
  - `npm run verify:open`
- Run full verify with automatic local log + artifact capture:
  - `npm run verify:open:log`
- If npm is missing in a non-interactive shell, run script directly:
  - `bash ./scripts/run-verify-open.sh`
  - script auto-attempts `nvm` bootstrap before failing.
- Show summary from the latest captured verify run:
  - `npm run verify:last`

## Where results are stored

- Local path: `artifacts/test-runs/<timestamp>/`
- Files:
  - `verify.log`
  - `exit-code.txt`
  - copied Playwright output if present:
    - `test-results/`
    - `playwright-report/`
- Symlink to latest run:
  - `artifacts/test-runs/latest`

This folder is git-ignored and kept locally.

## Recommended regular cadence

- On each feature branch before PR:
  - `npm run verify:open`
- For faster inner-loop checks:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run test:e2e:mobile` (if touching mobile/nav/auth/guide flows)
- Before merge:
  - run full `npm run verify:open` again.
