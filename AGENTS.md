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
3. `npm run verify` passes locally.
4. Accessibility semantics are preserved for changed UI.
5. Related docs are updated when rules/contracts change.

## Guardrails

- Keep changes minimal and targeted.
- Avoid new dependencies unless they materially improve quality or velocity.
- Preserve existing visual language unless the task explicitly asks for redesign.
- Do not change unrelated behavior in shared components.

## Task Brief

Use `docs/task-brief-template.md` when giving coding tasks to an agent.
