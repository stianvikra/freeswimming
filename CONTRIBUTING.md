# Contributing

## Prerequisites

- Node.js 24.x
- npm 11.11.0

## Local Setup

1. `npm install`
2. `cp .env.example .env.local`
3. `npm run dev`

## Branching

- Create short-lived feature branches from `main`.
- Suggested naming:
  - `feat/<short-description>`
  - `fix/<short-description>`
  - `chore/<short-description>`

## Commit Style

- Use conventional commit prefixes where possible:
  - `feat:`
  - `fix:`
  - `chore:`
  - `docs:`
  - `style:`
  - `test:`

## Quality Gate

Before opening or updating a PR, run:

```bash
npm run verify:pre-pr
```

Before merge readiness, run:

```bash
npm run verify:pre-merge
```

## Pull Requests

- Use `.github/pull_request_template.md`.
- Keep PRs small and focused.
- Target <= 500 changed lines (additions + deletions) per PR where practical.
- CI blocks PRs above 4000 changed lines.
- Include test evidence and screenshots when UI is changed.
- Split oversized work into multiple PRs.

## Documentation

Update docs when relevant:

- `docs/product-rules.md` for behavior/rule changes.
- `docs/api-contracts.md` for API shape/status/header changes.
- `docs/testing-strategy.md` when test approach changes.
- `docs/adr/` for architectural decisions.
