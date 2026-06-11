# Codex Sandbox Approval Cadence

## Purpose

Reduce repeated safe-command prompts during Codex execution in this repo without widening approvals beyond what is reasonable.

## Core Rule

- Repo files can document preferred approval behavior.
- Repo files cannot themselves persist sandbox approvals across chats, devices, or Codex hosts.
- Actual persistence happens only when the owner approves a local command prefix through the Codex approval UI.

## Recommended Owner Habit

When Codex asks for a safe, recurring command in this repo, prefer:

- `Yes, and don't ask again`

only when the prefix is clearly narrow and reusable.

Prefer one-time approval instead when the command is:

- destructive,
- credential-sensitive,
- unusual for normal repo work,
- or broader than needed.

## Good Recurring Prefixes In This Repo

- Git sync and branch hygiene:
  - `git pull`
  - `git push`
  - `git fetch`
  - `git checkout`
  - `git switch`
  - `git worktree add`
  - `git worktree remove`
  - `git worktree prune`
  - `git branch -d`
  - `git branch -D`
- GitHub workflow:
  - `gh pr checks`
  - `gh pr view`
  - `gh pr create`
  - `gh pr edit`
  - `gh pr merge`
  - `gh run view`
  - `gh run watch`
  - `gh run rerun`
  - `gh workflow view`
  - `gh workflow list`
- Validation:
  - `npm run verify:pre-pr`
  - `npm run verify:pre-merge`
  - `npm run verify:docs-only`
  - `npm run build`
  - `npm run typecheck`
  - `npx playwright test`
  - `npx vitest run`
- Local UI development and screenshot setup:
  - `npm exec next dev`
  - `npx playwright install chromium`
- Process inspection:
  - `pgrep -af`
  - `ps -p`
  - `ps -Ao`
  - `lsof -i`
  - `lsof +D`
  - `lsof +L1`

Use one-time approval instead of recurring approval for broad or mutating command families such as
`kill`, `rm`, and `gh api` unless the exact command is narrow, tied to the active workstream, and the
target has already been identified.

## Expected Edge Cases

Even with good recurring approvals, Codex may still ask again when:

- the command shape changes materially,
- the tool touches protected `.git` internals or other restricted paths,
- a new command family appears for the first time,
- the command is safety-sensitive enough that the sandbox forces a fresh confirmation.

## What This Resolves

- fewer prompts during normal slice work,
- clearer expectation that approvals are a local tool concern,
- less confusion about whether `AGENTS.md` can replace sandbox consent.

## What This Does Not Resolve

- cross-machine automatic approval sync,
- approval persistence purely from repo text,
- destructive-command confirmation,
- credential- or secret-handling prompts.

For repeated local screenshot, browser, process-cleanup, or stuck-check patterns, use
`docs/runbooks/codex-local-automation-friction-defaults.md` before asking the owner to make another
one-off decision.
