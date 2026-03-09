# Task Brief: Admin Help Center And Ops Handbook

## Metadata

- `id`: `2026-02-21-admin-help-center-and-ops-handbook`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-02-21`
- `updated`: `2026-03-09`

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

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                   | Evidence                                              |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Product goals and IA                          | `target`     | Help/Guide is discoverable in one click and presents a clear operator onboarding path.             | admin nav + help content in PR #90                    |
| UX flow clarity                               | `target`     | Core tasks can be executed from guide steps without technical interpretation.                      | help section structure + admin help e2e               |
| Visual design quality                         | `target`     | Help content remains scannable with clear section hierarchy and no dense text walls.               | card/section layout + manual QA                       |
| Business logic correctness and data integrity | `supporting` | N/A (docs/help surface only; no new data mutation logic in this brief).                            | scope review                                          |
| Admin editor ergonomics                       | `target`     | Guide maps content/operations actions to expected outcomes with explicit button glossary.          | help button glossary + workflow map                   |
| Accessibility (a11y)                          | `target`     | Help navigation and headings preserve accessible semantics for admin users.                        | admin help e2e assertions + existing admin semantics  |
| Performance (CWV + payloads)                  | `supporting` | Static help content adds no heavy runtime dependencies.                                            | dependency diff (docs/UI only)                        |
| Data placement and sync boundaries            | `supporting` | N/A (no persistence ownership or sync model changes in this brief).                                | scope review                                          |
| Caching and invalidation strategy             | `supporting` | N/A (no cache policy changes; standard deploy refresh applies).                                    | no runtime caching contract changes                   |
| Reliability and failure handling              | `supporting` | Help includes deterministic troubleshooting and recovery guidance for common admin issues.         | help troubleshooting sections                         |
| Security and authz                            | `target`     | Help remains admin-only and excludes secrets/internal sensitive operational values.                | role-gated admin route + content review               |
| Privacy and compliance                        | `supporting` | N/A (no new personal-data processing behavior introduced).                                         | scope review                                          |
| Content governance                            | `target`     | Guide-update requirement is documented for future admin/app workflow changes.                      | governance rule text + successor hardening in PR #139 |
| Admin workflow and editability                | `target`     | Guide covers content, commerce, operations, notes, categories, and rollback workflows.             | section coverage in help handbook                     |
| SEO and crawlability                          | `N/A`        | Admin-only authenticated surface; public crawlability is out of scope for this brief.              | scope rationale                                       |
| AI discoverability                            | `N/A`        | Admin-only authenticated surface; public AI discoverability is out of scope for this brief.        | scope rationale                                       |
| Analytics and KPI observability               | `supporting` | N/A (no new analytics/KPI event instrumentation in this brief).                                    | scope review                                          |
| Commerce and revenue ops                      | `supporting` | Help guidance includes where commerce actions live and how to operate safely.                      | commerce section in help guide                        |
| Incident response and support operations      | `supporting` | Help includes plain-language troubleshooting paths and escalation guidance for operator incidents. | troubleshooting + escalation sections                 |
| Finance and reporting operations              | `supporting` | No reconciliation/reporting flow changed; help clarifies finance-impacting admin actions only.     | scope rationale + commerce/ops guidance               |
| i18n operational readiness                    | `supporting` | No locale-routing/content-localization contract changed; help copy remains language-safe.          | scope rationale                                       |
| Stack-fit and dependency discipline           | `target`     | No new dependencies introduced; work remains docs/admin-help scope only.                           | package diff + changed-files list                     |
| Testing and QA automation                     | `target`     | Admin help behavior is validated via e2e and full `verify:pre-pr` / `verify:pre-merge` gates.      | test contract + gate logs                             |
| Scalability and cost efficiency               | `supporting` | Docs-first operator enablement reduces support overhead without infra cost increase.               | scope review                                          |
| DevOps and rollback readiness                 | `supporting` | Help documents rollback/recovery behavior without altering deployment/runtime controls.            | operations playbook content                           |

## Implementation Checkpoint Log

- `2026-02-21 | working tree | moved AW-004 brief to in-progress, added Help/Guide admin tab + initial non-technical ops handbook content + admin help e2e coverage | run verify:pre-pr, push + PR`
- `2026-02-22 | working tree | expanded Help/Guide to include full content-page walkthrough, button glossary, and edit-scope section in plain language; updated admin-help e2e assertions accordingly | run verify:pre-pr, push + PR`
- `2026-03-09 | 059cd81 (main) | status closeout sync: moved legacy AW-004 brief to done after confirmed merged delivery (#90) and linked later governance hardening successor (#139) | next: keep further Help/Guide evolution in dedicated successor briefs`

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

## Completion Record

- `PR`: `https://github.com/stianvikra/freeswimming/pull/90`
- `merge`: `PR #90` -> `main`
- `follow-up hardening`: `https://github.com/stianvikra/freeswimming/pull/139`
