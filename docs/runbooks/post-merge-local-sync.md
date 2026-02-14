# Post-Merge Local Sync Runbook

## Purpose

Keep local git state aligned with `origin/main` after each merged PR.

## Run Immediately After PR Merge

From repo root:

```bash
git checkout main
git pull --ff-only origin main
git branch -d <merged-branch>
```

Example:

```bash
git checkout main
git pull --ff-only origin main
git branch -d feat/mac-safari-install-guidance
```

## Optional Cleanup

```bash
git fetch --prune
git branch -vv
```

## Why This Is Required

- Ensures you code from latest `main`.
- Avoids accidentally continuing work on an old feature branch.
- Reduces merge conflicts and stale branch clutter.
