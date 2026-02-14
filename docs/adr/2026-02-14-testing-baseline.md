# 2026-02-14 Testing Baseline

## Context

The project had strong Playwright coverage but no unit/component test layer, no pre-commit checks, and no CI workflow.

## Decision

Adopt a full baseline:

- Vitest + Testing Library for unit/component tests
- `@axe-core/playwright` for accessibility checks in E2E
- Husky + lint-staged for pre-commit guardrails
- GitHub Actions CI running lint, typecheck, unit tests, build, and E2E

## Consequences

- Better confidence per change and fewer regressions.
- Slightly longer local install and CI runtime.
- Clearer quality gate for contributors.

## Status

Accepted
