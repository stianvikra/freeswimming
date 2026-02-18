# Task Brief Template

Use this template when requesting coding work from an agent.
Save new briefs in `docs/task-briefs/planned/` with date-based filenames.

## Prompt Quality Gate (before sending to Codex)

Use this quick check so the task execution is precise:

- Reference exact brief path (for example `docs/task-briefs/planned/YYYY-MM-DD-xxx.md`)
- State execution mode (`end-to-end` or `plan only`)
- State deliverables (implementation, tests, commit, push, PR handoff)
- State communication style (for example: one step at a time for manual GitHub actions)
- State non-negotiables (no secrets in repo, UX quality bar, performance guardrails)
- State continuity rules (commit cadence + resume protocol if chat/session is interrupted)
- State git rhythm defaults (commit/push cadence and PR cut cadence to `main`)
- State branch hygiene cadence (post-merge cleanup + stale-branch sweep frequency)
- State PR browser rule (open PR/merge links in Safari by default unless owner requests otherwise)
- State manual QA link rule (assistant opens each QA URL in Safari before asking for `done`)
- State local tooling prerequisite (Node LTS + npm installed where local validation runs)
- State closeout gate (completion audit + final 10/10 quality/safety/perf/regression sweep + move/cleanup prompts)

Suggested prompt wrapper:

```md
Use task brief: <PATH_TO_BRIEF>
Mode: end-to-end (implement + tests + commit + push on current branch)
Communication: one manual step at a time; wait for my "done" between manual GitHub/UI steps.
Manual QA links: open each URL in Safari for me before asking for "done".
Local validation prerequisite: Node LTS + npm installed on the machine running checks.
Pre-PR validation: run `npm ci` then `npm run verify`.
Git rhythm: commit + push each validated step; ask me before opening/updating PR to main.
Handoff must include:

1. what changed
2. test evidence
3. PR URL
4. direct merge URL
5. post-merge local sync commands
6. latest checkpoint commit hash + next step if session is interrupted
   Do not store secret values in repo files.
```

## Metadata

- `id`: `YYYY-MM-DD-short-title`
- `status`: `planned | in-progress | done | blocked`
- `owner`: who is responsible
- `created`: `YYYY-MM-DD`
- `updated`: `YYYY-MM-DD`

## Goal

One sentence: what should be true after this task is done?

## Scope

Which files/features are in scope?

## Out Of Scope

What must not be changed?

## Acceptance Criteria

List measurable outcomes.

## Validation

Which commands should pass?

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`
- `npm run verify`

## Local Tooling Prerequisite (Required)

- Node.js LTS and npm must be installed on the machine used for local validation.
- Before PR handoff, run local dependency install and verification:
  - `npm ci`
  - `npm run verify`
- If assistant execution environment lacks `node`/`npm`, assistant must:
  - state that limitation explicitly,
  - ask owner to run the local commands,
  - include owner-provided command results in `Test Evidence`.

## Manual QA Environments

Required when task impacts UI/UX, install flows, runtime browser behavior, or deployment behavior.

- Local environment tested (for fast iteration):
  - URL used (for example `http://127.0.0.1:3000` or LAN URL)
  - Browsers/devices tested locally
- Vercel preview tested (for production-like verification):
  - Preview URL from PR checks
  - Browsers/devices tested on preview
- Any local vs preview differences documented (or explicitly `none`)
- Recommended browser/device matrix for UI/runtime changes:
  - iOS Safari (phone)
  - Android Chromium (phone)
  - iPad/tablet viewport
  - Desktop Chrome
  - Desktop Safari/WebKit
  - Desktop Firefox

## Constraints

Any constraints around copy, design, API compatibility, performance, or deadlines.

## 10/10 Quality Bar (Required For User-Facing Work)

List concrete quality expectations. At minimum include:

- UX clarity and primary action expectations.
- Required UI states: `loading`, `empty`, `error`, `offline`, `retry`.
- Accessibility level/semantics (keyboard, focus, labels, contrast).
- Performance expectations (Core Web Vitals or equivalent).
- Visual consistency requirements relative to existing design language.

## Security, Privacy, and Compliance (Required For Auth/Data/Payments)

State required controls for this task, for example:

- authentication and authorization boundaries,
- secret handling rules,
- data minimization/retention,
- relevant regulatory expectations (for example GDPR baseline),
- auditability/logging needs for sensitive operations.

## Observability and KPI Contract

Define:

- required events/logs (if analytics hooks exist),
- minimum operational metrics (latency/error/fulfillment),
- success KPIs and acceptable thresholds.

## Session Continuity and Recovery (Required)

Define how work remains recoverable if chat/session context is lost.

- Canonical source of truth: git branch + task brief path.
- Checkpoint cadence: commit at meaningful milestones (or at least every 60-90 minutes of active coding).
- Required checkpoint note in brief/comments:
  - latest commit hash,
  - completed step,
  - next step.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen task brief and continue from recorded next step.

## Git Rhythm Defaults (Required)

Define concrete git execution defaults so quality does not depend on memory.

- Commit + push cadence:
  - commit and push after each validated implementation step (`lint` + `typecheck` + relevant tests for that step),
  - avoid batching unrelated scope into one checkpoint commit.
- PR cadence to `main`:
  - open or update PR at least once per day of active implementation,
  - cut/refresh PR after `2-4` validated checkpoint commits, or after one complete vertical slice, whichever comes first.
- Assistant prompting contract:
  - after each validated step, assistant must explicitly ask whether to commit+push now,
  - after every `2` pushed checkpoints (or one completed slice), assistant must explicitly ask whether to open/refresh PR to `main`.

## Branch Hygiene Defaults (Required)

Define when and how branch cleanup is executed so repository hygiene is consistent.

- Post-merge cleanup (same working session):
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - if remote branch still exists: `git push origin --delete <merged-branch>`
  - `git fetch --prune origin`
- Ongoing cleanup cadence:
  - run `git branch -vv` at least once per active day,
  - remove stale local branches with upstream marked `: gone` after owner confirmation.
- Safety rule:
  - avoid `git branch -D` unless owner explicitly confirms, or a dated backup/tag has been created.

## PR Browser Rule (Required)

Define the default browser for PR handoff links so collaboration is consistent.

- Default:
  - open PR create/review/merge URLs in Safari as active foreground tab/window:
    - `osascript -e 'tell application "Safari" to activate' -e 'tell application "Safari" to open location "<PR_URL>"'`
- Exception:
  - use another browser only when owner explicitly requests it.

## Manual QA URL Rule (Required)

Define how manual QA URLs are handled so owner flow is low-friction.

- Default:
  - for each manual QA step that requires opening a page, assistant opens the exact URL in Safari as active foreground tab/window:
    - `osascript -e 'tell application "Safari" to activate' -e 'tell application "Safari" to open location "<QA_URL>"'`
  - then assistant asks owner to validate the concrete expected outcome and reply `done`.
- Exception:
  - do not auto-open only if owner explicitly asks to open manually or use another browser.

## Implementation Checkpoint Log (Required For In-Progress Briefs)

Add a running log section in each in-progress brief so status survives chat loss.

- format per line:
  - `<YYYY-MM-DD> | <commit-hash or "working tree"> | <completed scope> | <next step>`
- minimum cadence:
  - add/update log after each meaningful milestone,
  - add/update before any pause/handoff.
- include both:
  - latest pushed checkpoint,
  - any important uncommitted working-tree changes (if present).

## Final Closeout Gate (Required Before Move To `done`)

Run this gate before proposing lifecycle move/cleanup:

- Completion audit:
  - verify every acceptance criterion is either complete or explicitly deferred with rationale.
  - verify outstanding/open items are empty or moved to a dedicated follow-up brief/backlog item.
- Final quality sweep (`10/10`):
  - UX/UI: check clarity and all required states (`loading`, `empty`, `error`, `offline`, `retry`) for changed surfaces.
  - Security/privacy/compliance: check changed auth/data/payment paths against brief controls.
  - Performance/ops: check no obvious regressions in changed flows (including CWV-sensitive surfaces where relevant).
  - Regression safety: verify changes do not break adjacent routes/shared components.
- Cleanup readiness:
  - confirm tests/QA evidence is captured in brief.
  - confirm branch/PR status is ready for post-merge hygiene.
- Assistant prompting contract:
  - assistant must ask owner explicitly:
    - `Do you want to move this brief to done now?`
    - `Do you want me to run post-merge local sync + branch cleanup now?`
  - if quality sweep finds gaps, assistant must propose concrete fixes or create a follow-up brief/backlog entry before moving.

## Completion Record (fill when done)

- `PR`: link to merged PR
- `merge`: source branch -> target branch
- `result`: short outcome summary

## Merge Handoff (owner action, required)

- `merge_url`: `https://github.com/stianvikra/freeswimming/pull/<PR_NUMBER>`
- `merge_when`:
  - all required checks are green,
  - local manual QA is done,
  - Vercel preview QA is done.
- `assistant_rule`:
  - final handoff must include the direct PR merge URL and a one-line reminder that merge is done in GitHub UI by repo owner.
  - when opening PR links for owner actions, open Safari by default unless owner has requested another browser.
  - after user confirms PR is merged, final handoff must include post-merge local sync commands and ask for confirmation when completed.
- `post_merge_local_sync`:
  - run:
    - `git checkout main`
    - `git pull --ff-only origin main`
    - `git branch -d <merged-branch>`
    - `git fetch --prune`
  - if remote branch still exists:
    - `git push origin --delete <merged-branch>`
  - optional verification:
    - `git branch -vv` (confirm no stale branch tracking)
  - runbook: `docs/runbooks/post-merge-local-sync.md`

### Delivered Changes

List shipped files/features.

### Test Evidence

- Local automated checks summary (`npm run verify` or explicit command list)
- Manual local QA summary (URL + browser/device coverage)
- Manual Vercel preview QA summary (preview URL + browser/device coverage)

### DevOps / Workflow Changes

Document CI, branch protection, deployment, and environment/process changes made during the task.

### Secrets Used (Names Only)

List secret names and where they are used.
Do not store secret values in this file.

### Post-Merge Notes

Anything temporary that must be reverted or re-hardened after merge.

## Lifecycle Rules

1. Start in `docs/task-briefs/planned/`.
2. Move to `docs/task-briefs/in-progress/` when coding starts.
3. Move to `docs/task-briefs/done/` when PR is merged.
4. Use `docs/task-briefs/blocked/` if paused.
