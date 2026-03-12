# Release PR Checklist

Use this for PRs targeting `main`.

## Before Opening PR

- Branch name follows convention (for example `feat/<topic>`).
- Task brief exists in `docs/task-briefs/in-progress/`.
- Scope is focused and intentionally limited.
- `npm run verify:pre-pr` passes locally.

## Before Merge

- PR description includes summary, risk, and test evidence.
- PR checkbox marks are evidence-bound:
  - check only items with proof in this PR (scope + command/test output + CI/QA evidence),
  - if out of scope, leave unchecked or mark `N/A` with rationale.
- Required checks are green.
- `npm run verify:pre-merge` has been run on latest local branch state.
- Recommended automation: `npm run gate:pre-merge` (runs pre-merge verify and refreshes PR body evidence on current HEAD SHA).
- For policy-impacting scope (auth/analytics/user-data rights/third-party processor changes), run:
  - `docs/checklists/policy-impact-release-review.md`
- Local manual QA is completed for changed flows (record URL + browser/device in PR).
- Vercel preview works for changed flows (record preview URL + browser/device in PR).
- QA matrix coverage is appropriate for the risk (mobile + tablet + desktop browsers when relevant).
- Branch protection has expected required check names.

## If CI Is Stuck

- Run `docs/runbooks/ci-unblock.md`.
- Avoid disabling protections unless urgent.

## Merge

- Prefer `Squash and merge` for clean history.
- Confirm source branch and target branch before clicking merge.
- Merge is performed by repo owner in GitHub UI from the PR page URL:
  - `https://github.com/stianvikra/freeswimming/pull/<PR_NUMBER>`
- Agent handoff should always include direct merge URL when PR is ready.

## After Merge

- Move brief to `docs/task-briefs/done/`.
- Add completion record (feature + DevOps + secrets names only).
- Re-harden any temporary protection bypasses.
- Delete merged feature branch (local + remote) when safe.
- Run local sync immediately:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
- Optional cleanup:
  - `git fetch --prune`
- Full guide: `docs/runbooks/post-merge-local-sync.md`
