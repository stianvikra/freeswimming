# PR Flow And Chat Handoff

Use this as the canonical repo path for PR sync, merge readiness, and baton passes when a new chat is the better working mode.

## Canonical PR Flow

1. For route, label, workflow action, Help/Guide, runbook, or support-surface removals/renames/consolidations, complete `docs/runbooks/route-label-support-surface-impact-sweep.md` before broad verification.
2. Run `npm run verify:pre-pr`.
3. Run `npm run pr:create:safari`.
   - This creates a new PR when none exists.
   - This refreshes the existing PR title/body from the canonical generator by default when a PR already exists.
4. Watch required checks on the PR.
5. Run `npm run verify:pre-merge` on the current HEAD before merge recommendation.
6. Run `npm run gate:pre-merge` for the full local merge handoff, or `npm run merge:preflight` if `verify:pre-merge` already ran on the same HEAD and the PR body is already refreshed.
7. Repo owner merges from the GitHub PR page when required checks are green.
8. After merge and local sync:
   - `git checkout main`
   - `git pull --ff-only origin main`
   - `npm run post-merge:preflight`
9. If post-merge preflight reports a repo-managed docs-only closeout for the just-merged workstream, complete that closeout PR in the same chat before handoff assessment.
10. Before creating a new implementation branch or starting a new active brief, complete the mandatory chat-handoff gate below.

Use raw `gh pr create`, raw `gh pr edit`, or manual PR-body editing only when the repo entrypoint is blocked by credentials or sandbox limits.

## Why This Is The One True Path

- `npm run pr:create:safari` keeps PR body generation on the same canonical source as the linter.
- route/label/support-surface sweeps happen before broad gates, so obvious fallout is fixed in the same commit as the behavior change.
- repo scripts handle `gh` resolution and repo-standard Node bootstrap.
- `verify:pre-pr`, `verify:pre-merge`, and merge preflight stay SHA-aware and aligned.

## New-Chat Rule

Start a new chat or provide a carry-forward prompt when that is the best way to preserve momentum and reduce risk. Heavy context is one trigger, not the only trigger.

## Mandatory Handoff Gate After Merge / Before New Implementation

This gate is required after each merge + local sync and before any new implementation branch, new active brief, or major workstream pivot.

If `npm run post-merge:preflight` surfaces a repo-managed docs-only closeout for the just-merged workstream, do that closeout in the same chat first. It is part of the current workstream's closeout, not a reason to start a new chat.

Assessment:

1. State the latest stable checkpoint:
   - merged PR number,
   - merge commit,
   - local `main` sync status,
   - active branch or `main`.
2. State the next intended workstream:
   - brief path,
   - branch name if known,
   - whether the next work is docs/governance, maintenance, backend, or UI.
3. Choose one outcome:
   - `Chat: continue here` when the next step is the same workstream, context is still narrow, and no screenshot/UI implementation flow starts.
   - `Chat: start new chat` when the primary goal changes, a new implementation slice starts, docs/maintenance switches to feature work, UI work with screenshot handoff starts, several PRs/briefs are mixed in the thread, or the current thread has become hard to trust.
4. If the outcome is `Chat: start new chat`, provide a ready-to-use carry-forward prompt and stop before implementation.

Default to a new chat for:

- docs/roadmap/maintenance closeout followed by feature implementation,
- feature A followed by feature B,
- a new UI implementation slice that will require screenshot handoff,
- a post-merge state where the next branch would be unrelated to the just-merged PR,
- long threads with many PR approvals, merges, or carry-forward decisions.

The owner may explicitly override the recommendation and continue in the same chat, but the assessment must still be made and recorded in the handoff.

Strong triggers:

- `verify:pre-pr` just passed and the next step is commit/push/PR/CI follow-up,
- required CI is green and the next step is merge readiness or closeout,
- the active brief changes,
- the thread starts mixing more than one brief or a major scope pivot.
- repeated connection/tool interruptions make the current thread unreliable,
- the owner is about to travel, close the machine, or pause for a long period,
- a high-cost debugging loop has reached a stable checkpoint and should be resumed from clean state.

Before the chat break:

- update the active brief checkpoint log,
- include latest commit, completed scope, and exact next step.
- include PR URL, artifact folder, open blockers, and any owner approval state when relevant.

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
