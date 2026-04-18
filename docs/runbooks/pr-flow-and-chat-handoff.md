# PR Flow And Chat Handoff

Use this as the canonical repo path for PR sync, merge readiness, and long-workstream baton passes.

## Canonical PR Flow

1. Run `npm run verify:pre-pr`.
2. Run `npm run pr:create:safari`.
   - This creates a new PR when none exists.
   - This refreshes the existing PR title/body from the canonical generator by default when a PR already exists.
3. Watch required checks on the PR.
4. Run `npm run verify:pre-merge` on the current HEAD before merge recommendation.
5. Run `npm run gate:pre-merge` for the full local merge handoff, or `npm run merge:preflight` if `verify:pre-merge` already ran on the same HEAD and the PR body is already refreshed.
6. Repo owner merges from the GitHub PR page when required checks are green.
7. After merge and local sync:
   - `git checkout main`
   - `git pull --ff-only origin main`
   - `npm run post-merge:preflight`

Use raw `gh pr create`, raw `gh pr edit`, or manual PR-body editing only when the repo entrypoint is blocked by credentials or sandbox limits.

## Why This Is The One True Path

- `npm run pr:create:safari` keeps PR body generation on the same canonical source as the linter.
- repo scripts handle `gh` resolution and repo-standard Node bootstrap.
- `verify:pre-pr`, `verify:pre-merge`, and merge preflight stay SHA-aware and aligned.

## New-Chat Rule

Start a new chat when the workstream reaches a stable checkpoint and the next primary goal changes. In practice, that means:

- `verify:pre-pr` just passed and the next step is commit/push/PR/CI follow-up,
- required CI is green and the next step is merge readiness or closeout,
- the active brief changes,
- the thread starts mixing more than one brief or a major scope pivot.

Before the chat break:

- update the active brief checkpoint log,
- include latest commit, completed scope, and exact next step.

## Carry-Forward Prompt Template

```text
Vi fortsetter i /Users/stianvikra/freeswimming.

Aktiv brief: docs/task-briefs/in-progress/<brief>.md
Branch: <branch>
PR: <url eller none>
Siste commit: <sha> <subject>

Status:
- <ferdig implementert scope>
- <validering som er kjørt>
- <åpne blokkere eller "ingen">

Neste steg:
- <eksakt neste kommando eller beslutning>

Fortsett fra siste checkpoint i briefen. Start med:
1. git status -sb
2. git log --oneline -n 10
3. åpne briefen og fortsett fra siste checkpoint
```
