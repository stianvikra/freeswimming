# Post-Merge Local Sync Runbook

## Purpose

Keep local git state aligned with `origin/main` after each merged PR.

## Run Immediately After PR Merge

From repo root:

```bash
git checkout main
git pull --ff-only origin main
npm run post-merge:preflight
git branch -d <merged-branch>
```

Example:

```bash
git checkout main
git pull --ff-only origin main
npm run post-merge:preflight
git branch -d feat/mac-safari-install-guidance
```

## Repo-Managed Closeout Follow-Up

If `npm run post-merge:preflight` reports exactly one repo-managed docs-only closeout for the just-merged workstream, complete that closeout before starting a new implementation branch.

When the owner explicitly approved the just-merged workstream PR, that approval also authorizes the assistant to auto-merge this single closeout PR after:

- the diff is confirmed docs-only lifecycle/closeout evidence,
- `npm run verify:pre-pr` passes,
- required CI is green,
- `npm run verify:pre-merge` passes on the closeout branch.

Stop and ask for explicit owner approval if the closeout is ambiguous, not tied to the just-merged workstream, touches non-docs files, fails any gate, or needs a product/scope decision.

## Optional Cleanup

```bash
git fetch --prune
git branch -vv
```

## Why This Is Required

- Ensures you code from latest `main`.
- Surfaces pending `in-progress` brief closeout commands from the just-synced merge commit.
- Avoids accidentally continuing work on an old feature branch.
- Reduces merge conflicts and stale branch clutter.
