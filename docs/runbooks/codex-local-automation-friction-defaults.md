# Codex Local Automation Friction Defaults

## Purpose

Use this runbook when normal Codex work in this repo is slowed by repeated safe prompts, local
browser/screenshot failures, stuck PR checks, stale generated local artifacts, or background
processes from the current workstream.

This runbook does not grant permissions. It tells Codex which known-good path to try first and which
approval prompts are good candidates for narrow recurring approval in the local Codex UI.

## Non-Negotiables

- Repo docs cannot auto-approve sandbox prompts. The owner must still choose approval in the local
  Codex UI.
- Do not use repo docs as permission to commit secrets, raw env values, customer data, auth tokens,
  or provider payloads.
- Do not bypass Supabase egress guards for screenshots by writing to cloud/prod services.
- Do not install browser channels, Codex skills/plugins/MCP servers, dependencies, scripts, or
  workflows from this runbook alone.
- Do not use destructive cleanup outside artifacts or processes created by the current workstream.

## Decision Ladder

1. Confirm the active brief, branch, and return path before turning a repeated friction pattern into
   work.
2. If the pattern is already documented in a specific runbook, use that runbook first.
3. If a known-good repo path exists, go directly to it instead of repeating a likely failed attempt.
4. Ask for a scoped recurring approval only when the command prefix is narrow, recurring, and normal
   for this repo.
5. Use one-time approval or stop for owner input when the command is destructive, credential
   sensitive, production-service sensitive, broad, or unusual.
6. Record any new recurring pattern in the active brief checkpoint or high-cost debug log before it
   is forgotten.

## Safe Recurring Approval Candidates

These are good candidates for `Yes, and don't ask again` when the Codex UI asks and the command is
clearly tied to the active repo/workstream:

| Area                         | Candidate Prefixes                                                                                                                                                   | Boundary                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Git sync and branch hygiene  | `git fetch`, `git pull`, `git push`, `git checkout`, `git switch`, `git branch -d`, `git branch -D`, `git worktree add`, `git worktree remove`, `git worktree prune` | normal repo branch/PR work only  |
| GitHub checks and PR flow    | `gh pr checks`, `gh pr view`, `gh pr create`, `gh pr edit`, `gh pr merge`, `gh run view`, `gh run watch`, `gh run rerun`, `gh workflow view`, `gh workflow list`     | active repo PR/run only          |
| Local validation             | `npm run verify:pre-pr`, `npm run verify:pre-merge`, `npm run verify:docs-only`, `npm run build`, `npm run typecheck`, `npx vitest run`, `npx playwright test`       | repo validation only             |
| Local UI dev and screenshots | `npm exec next dev`, `npx playwright install chromium`                                                                                                               | local dev/capture path only      |
| Process inspection           | `pgrep -af`, `ps -p`, `ps -Ao`, `lsof -i`, `lsof +D`, `lsof +L1`                                                                                                     | inspect before stopping anything |

Use one-time approval instead for:

- `kill <pid>` unless the process was clearly started by the active Codex workstream and has been
  identified first,
- broad `gh api` mutations such as close/reopen unless the action is tied to the active PR and
  check-trigger recovery,
- `rm` cleanup unless the target is an untracked/generated artifact from the current workstream,
- any command that references secrets, raw env values, production service access, or local Codex
  configuration.

## Local Screenshot Capture Defaults

For Freeswimming screenshot handoffs, use `docs/runbooks/ui-debug-hypothesis-and-handoff.md` first:

1. Start local Next on `127.0.0.1` with `SITE_LOCK_ENABLED=0`.
2. Capture against the same `127.0.0.1` host.
3. Install Playwright Chromium if the browser binary is missing.
4. On macOS/Codex, rerun the same capture command with escalation when Chromium fails with sandbox
   or MachPort permission errors.
5. Prefer repo-local Playwright capture over MCP/browser-channel capture.

If real dev login hits Supabase egress guard or cloud auth constraints in a screenshot context:

- stop that auth route instead of widening Supabase access,
- create a temporary local visual harness only when needed,
- render the real production component with deterministic mock data,
- avoid API/DB traffic and secrets,
- remove the temporary route/script before validation and PR diff,
- state the harness caveat in the screenshot handoff.

Screenshot scripts should:

- wait for concrete DOM elements or stable route-ready markers instead of defaulting to
  `networkidle`,
- hide only capture-only chrome such as the local Next dev indicator when it obscures the product
  surface,
- inspect the generated artifacts before handoff,
- regenerate artifacts after product-rendering files, styles, assets, or export HTML change.

## Local Process And Artifact Cleanup

After local dev/screenshot work:

- inspect for Next, Playwright/Chromium, capture scripts, and `gh pr checks --watch` processes that
  were started for the active workstream,
- stop only identified processes that belong to the current work,
- remove temporary visual harness files and untracked/generated local artifacts created by the
  current capture flow,
- clean stale generated Next dev type/cache artifacts only when they came from a temporary route that
  has already been removed.

Do not clean user files, unrelated generated artifacts, or unrelated long-running processes.

## GitHub Check Recovery

When required PR checks do not start:

1. Check `gh pr view`, `gh pr checks`, and relevant `gh run view` output first.
2. Confirm the branch is pushed and current with `origin/main` before assuming GitHub is stuck.
3. If the PR event appears stuck and the branch is otherwise correct, use the narrowest repo/CLI/API
   recovery available for the active PR, such as readying, rerunning, or close/reopen check-trigger
   recovery.
4. Use Safari/GitHub UI inspection only when CLI/API evidence cannot answer the question or GitHub
   requires a manual button.
5. Prefer Safari only for the one manual step at a time; do not install a Chrome channel just because
   MCP expected a different local Chrome app.

If a validation command reports `PASS` but its log reveals a real closeout or lint format problem,
fix the problem and rerun the gate before merge readiness.

## Return Path

When this runbook is used as a temporary governance/tooling interruption during a product parent:

- record the parent brief path,
- record the last merged PR/closeout if relevant,
- record that no new child is selected unless the parent says otherwise,
- return to the parent planning step after the governance/tooling slice is complete.

For the 2026-06-11 interruption, return to
`docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`.
