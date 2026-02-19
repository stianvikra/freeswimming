# AGENTS.md

## Purpose

This file defines how coding agents should collaborate in this repository.

## Tech Baseline

- Next.js 16 App Router
- TypeScript (strict)
- Tailwind CSS
- Playwright E2E
- Vitest + Testing Library unit/component tests

## Repo Map

- `app/`: routes, layouts, metadata, and API handlers.
- `components/`: page-level and feature components.
- `components/ui/`: reusable UI primitives and helpers.
- `tests/unit/`: fast unit/component tests.
- `tests/e2e/`: browser flows, navigation behavior, and accessibility checks.
- `docs/`: architecture, product rules, API contracts, testing and UX principles.

## Definition Of Done

1. Requested behavior is implemented and scoped correctly.
2. Relevant tests are added or updated.
3. `npm run verify:pre-pr` passes locally; use `npm run verify:pre-merge` before merge.
4. Accessibility semantics are preserved for changed UI.
5. Related docs are updated when rules/contracts change.

## Guardrails

- Keep changes minimal and targeted.
- Avoid new dependencies unless they materially improve quality or velocity.
- Preserve existing visual language unless the task explicitly asks for redesign.
- Do not change unrelated behavior in shared components.

## Collaboration Preferences

- Default to one actionable step at a time when guiding the repository owner in UI or terminal flows.
- Keep instructions short and concrete.
- Only provide multi-step batches when explicitly requested.
- Before reporting `npm`/`node` as missing, always attempt `nvm` bootstrap first:
  - `export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"`
  - `[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"`
  - `nvm use --silent`
- At implementation checkpoints, explicitly prompt the owner to run the next recommended gate:
  - before PR update: `npm run verify:pre-pr`
  - before merge: `npm run verify:pre-merge`
- After `2` consecutive weekly green runs on baseline performance budgets:
  - explicitly prompt the owner to tighten one stretch target step.
  - record tighten/hold/revert decision in the active brief or PR summary.

## Task Brief

Use `docs/task-brief-template.md` when giving coding tasks.
Store briefs in lifecycle folders:

- `docs/task-briefs/planned/`
- `docs/task-briefs/in-progress/`
- `docs/task-briefs/done/`
- `docs/task-briefs/blocked/`

When implementation starts, move brief to `in-progress`.
When merged, move brief to `done`.
