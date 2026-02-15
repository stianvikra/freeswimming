# Task Briefs

Store concrete task briefs in this folder using lifecycle subfolders.

## Lifecycle

- `planned/`: approved briefs not yet started.
- `in-progress/`: currently being implemented.
- `done/`: completed and merged work.
- `blocked/`: paused due to external dependency/decision.

Default flow:

1. create in `planned/`
2. move to `in-progress/` when implementation starts
3. move to `done/` after merge

When moving to `done/`, add a completion record:

- PR link and merge info
- delivered feature/files summary
- test evidence summary (local + Vercel preview for changed flows)
- DevOps/workflow changes
- secrets used (names only, never values)
- continuity notes (how to reconstruct context from git/PR if chat history is unavailable)

## 10/10 Brief Standard

Each new brief should explicitly include:

- measurable acceptance criteria,
- quality bar for UX/UI (including required `loading`/`empty`/`error`/`offline`/`retry` states where relevant),
- security/privacy/compliance expectations when handling auth/data/payments,
- observability/KPI contract for production-facing behavior,
- session continuity and recovery protocol (checkpoint cadence + resume steps).

## Naming Convention

- `YYYY-MM-DD-short-title.md`

Example:

- `2026-02-14-add-to-home-screen.md`

## Agent Rule

When an agent starts implementing a brief, it should move that brief from `planned/` to `in-progress/`.
After the related PR is merged, move it from `in-progress/` to `done/`.
When a PR is ready, agent handoff should include direct merge URL:
`https://github.com/stianvikra/freeswimming/pull/<PR_NUMBER>`.
After merge confirmation, agent handoff should include local sync commands:
`git checkout main`
`git pull --ff-only origin main`
`git branch -d <merged-branch>`
