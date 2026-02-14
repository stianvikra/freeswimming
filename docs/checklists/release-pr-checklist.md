# Release PR Checklist

Use this for PRs targeting `main`.

## Before Opening PR

- Branch name follows convention (for example `feat/<topic>`).
- Task brief exists in `docs/task-briefs/in-progress/`.
- Scope is focused and intentionally limited.
- `npm run verify` passes locally.

## Before Merge

- PR description includes summary, risk, and test evidence.
- Required checks are green.
- Vercel preview works (if UI changes).
- Branch protection has expected required check names.

## If CI Is Stuck

- Run `docs/runbooks/ci-unblock.md`.
- Avoid disabling protections unless urgent.

## Merge

- Prefer `Squash and merge` for clean history.
- Confirm source branch and target branch before clicking merge.

## After Merge

- Move brief to `docs/task-briefs/done/`.
- Add completion record (feature + DevOps + secrets names only).
- Re-harden any temporary protection bypasses.
- Delete merged feature branch (local + remote) when safe.
