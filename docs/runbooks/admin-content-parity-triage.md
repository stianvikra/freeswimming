# Admin Content Parity Triage Runbook

Use this runbook for AW-012 workflow `A3` parity checks.

## Purpose

- Confirm admin workspace content still mirrors DB-canonical rows.
- Record deterministic evidence in AW-012 checkpoint logs.
- Provide a repeatable operator flow when parity drift appears.

## When To Run

- Weekly while AW-012 is `in-progress`.
- Before merge on admin/content-affecting slices.
- Immediately after schema or admin content mutation contract changes.

## Command

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use --silent
PW_PORT=3100 NEXT_DIST_DIR=.next-playwright SITE_LOCK_ENABLED=0 npx playwright test tests/e2e/admin-content-parity.spec.ts --project=desktop-chromium
```

## Pass Criteria

- Playwright run exits `0`.
- Output includes:
  - `admin content parity`
  - `1 passed`

## If It Fails

1. Capture failing output and PR/branch SHA.
2. Open remediation finding in `docs/checklists/admin-full-audit-findings-log.md` with `P1` or `P0` severity.
3. Add AW-012 checkpoint note with owner + next action.
4. Re-run `npm run verify:pre-pr` after fix and before PR update.

## Evidence Note Template (Checkpoint Entry)

- `YYYY-MM-DD | <branch-or-main@sha> | A3 parity triage run: <exact command> => PASS/FAIL (<result summary>) | next: <next step>`
