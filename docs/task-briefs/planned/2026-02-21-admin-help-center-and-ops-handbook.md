# Task Brief: Admin Help Center And Ops Handbook

## Metadata

- `id`: `2026-02-21-admin-help-center-and-ops-handbook`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-21`
- `updated`: `2026-02-21`

## Goal

Give admins a 10/10 non-technical Help/Guide experience so they understand how freeswimming.org works, how to operate admin safely, and what to do when something fails.

## Scope

- Add a `Help/Guide` entry in admin navigation (admin-only visibility).
- Build a structured help surface in plain language:
  - app overview,
  - admin dashboard overview by tab and primary actions,
  - connected services and what each service is used for,
  - operational playbooks (`publish`, `rollback`, `notes`, `categories`, `runtime flags`),
  - troubleshooting and escalation flow.
- Include “what changed recently” and “future planned work” sections for operator context.
- Add clear writing/readability requirements for non-technical users:
  - short sentences,
  - no unexplained jargon,
  - action-first guidance.
- Add governance rule:
  - help content must be updated when admin/app workflows change.

## Out Of Scope

- Developer-only internal architecture deep-dive docs.
- Public-facing user help center.

## Acceptance Criteria

- Admin can find `Help/Guide` from admin navigation in one click.
- Core operational tasks are executable from guide steps without technical interpretation.
- Help content is structured and searchable/scannable.
- Help page supports `loading`, `empty`, `error`, `retry` states.
- Governance checklist explicitly requires updating help docs when workflows/features change.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- targeted e2e for admin help navigation and visibility rules
- `npm run verify:pre-pr`

## UX/Content Quality Bar (10/10)

- No dense text wall; content split into short sections with clear headings.
- Every section answers:
  - what this does,
  - when to use it,
  - what can go wrong,
  - how to recover.
- Examples use real app labels/buttons so admin can follow directly.

## Security And Access Control

- Help content must not expose secrets or sensitive internal endpoints.
- Admin-only operational details remain inside admin role-gated surfaces.

## Platform 10/10 Scorecard Linkage

- Canonical reference: `docs/quality/platform-10-10-scorecard.md`.
- This brief must mark scorecard categories as `target`/`supporting`/`N/A` and define measurable thresholds for each `target`.
- Closeout must record achieved score (`0-5`) for each target category.
