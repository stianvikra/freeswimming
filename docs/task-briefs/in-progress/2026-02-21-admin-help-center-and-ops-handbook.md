# Task Brief: Admin Help Center And Ops Handbook

## Metadata

- `id`: `2026-02-21-admin-help-center-and-ops-handbook`
- `status`: `in-progress`
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
  - full Content-page behavior map (snapshot, list, workflow actions, create form),
  - explicit button glossary (what each button does, when to use it, expected result),
  - explicit "what can be edited now vs later" section so admin knows current limits,
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
- Button meanings are explicit for Content/Operations/Notes/Categories/Commerce actions.
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
- Help content explicitly documents current edit capabilities and not-yet-shipped edit flows.

## Security And Access Control

- Help content must not expose secrets or sensitive internal endpoints.
- Admin-only operational details remain inside admin role-gated surfaces.

## Scorecard Mapping (Target/Supporting/N-A)

| Category                       | Mapping      | Target Threshold                                                                      |
| ------------------------------ | ------------ | ------------------------------------------------------------------------------------- |
| UX flow and action clarity     | `target`     | Help/Guide discoverable in one click; users complete key tasks from guide steps only. |
| UI/design consistency          | `target`     | Uses existing admin visual language and readable structure across desktop/mobile.     |
| Admin workflow and editability | `target`     | Guide covers content, commerce, operations, notes, categories, and rollback path.     |
| Security/privacy               | `target`     | No secrets/internal sensitive values shown; admin-only surface remains role-gated.    |
| Testing/QA automation          | `target`     | Add/extend admin e2e for help-tab discovery and core section visibility.              |
| Performance/payload            | `supporting` | Static content only, no added heavy dependencies.                                     |
| Reliability/error handling     | `supporting` | Sectioned content remains readable and deterministic even if other admin APIs fail.   |
| SEO/AI discoverability         | `N/A`        | Internal admin-only surface (public SEO/AI scoring handled in SEO brief).             |

## Implementation Checkpoint Log

- `2026-02-21 | working tree | moved AW-004 brief to in-progress, added Help/Guide admin tab + initial non-technical ops handbook content + admin help e2e coverage | run verify:pre-pr, push + PR`
- `2026-02-22 | working tree | expanded Help/Guide to include full content-page walkthrough, button glossary, and edit-scope section in plain language; updated admin-help e2e assertions accordingly | run verify:pre-pr, push + PR`

## Platform 10/10 Scorecard Linkage

- Canonical reference: `docs/quality/platform-10-10-scorecard.md`.
- This brief must mark scorecard categories as `target`/`supporting`/`N/A` and define measurable thresholds for each `target`.
- Closeout must record achieved score (`0-5`) for each target category.

## Automation Execution Contract

- Mode: `automation-first`.
- Assistant executes implementation, validation, commit/push, PR open/update, and check follow-up by default.
- Required gates:
  - before PR update/push: `npm run verify:pre-pr`
  - before merge recommendation: `npm run verify:pre-merge` and required CI green.
- Manual owner steps only when blocked by credentials, UI-only actions, or sandbox/escalation limits.
