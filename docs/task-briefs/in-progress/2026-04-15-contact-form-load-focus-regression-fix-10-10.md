# Task Brief: Contact Form Load Focus Regression Fix (10/10)

## Metadata

- `id`: `2026-04-15-contact-form-load-focus-regression-fix-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-15`
- `updated`: `2026-04-15`

## Goal

Make the contact form stop stealing focus on initial page load while preserving intentional focus recovery on validation errors and reset flows.

## Why This Brief Exists

- PR [#437](https://github.com/stianvikra/freeswimming/pull/437) is green in CI but local `verify:pre-merge` exposed a real desktop Chromium regression outside the poolside note scope:
  - [contact-form-a11y.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/contact-form-a11y.spec.ts:34) fails because the `NAME` field is already focused on `/contact` load.
- Root cause is a mount-time desktop autofocus in [ContactForm.tsx](/Users/stianvikra/freeswimming/components/ContactForm.tsx), which contradicts the intended UX and current accessibility contract.
- This fix must stay small and truthful:
  - no contact copy changes,
  - no API changes,
  - no form-flow rewrite,
  - only remove unintended initial focus while preserving focus when the form needs recovery.

## Dependencies And Boundaries

- Blocking parent PR/workstream:
  - [2026-04-15-poolside-note-header-clarity-and-landscape-parity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-header-clarity-and-landscape-parity-10-10.md)
- Primary implementation surfaces:
  - [ContactForm.tsx](/Users/stianvikra/freeswimming/components/ContactForm.tsx)
  - [contact-form-a11y.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/contact-form-a11y.spec.ts)
- Expected added coverage:
  - `tests/unit/contact-form.test.tsx`
- Locked boundaries:
  - no changes to `/api/contact`,
  - no changes to contact-field schema,
  - no changes to submit success/error copy,
  - no redesign of the contact page.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this slice:

- `UX flow clarity`
- `Accessibility (a11y)`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                         | Evidence                                  | Expected Closeout |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ----------------- |
| Product goals and IA                          | `supporting` | Contact intake should remain simple and unchanged aside from removing unwanted initial focus.                                                    | code review + targeted QA                 | `4/5`             |
| UX flow clarity                               | `target`     | Initial load must not steal focus on the first input, while invalid submit must still move focus to the relevant field.                          | unit + e2e                                | `5/5`             |
| Visual design quality                         | `supporting` | No visual regressions or layout shifts may be introduced by the focus fix.                                                                       | code review + targeted e2e                | `4/5`             |
| Business logic correctness and data integrity | `supporting` | Validation order, submit payload, and success/error states must remain unchanged.                                                                | unit + code review                        | `4/5`             |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes only a public contact-form focus behavior and does not touch admin workflows.                                     | explicit scope rationale                  | `N/A`             |
| Accessibility (a11y)                          | `target`     | The contact form must not force focus on load, and must still restore focus deliberately when validation fails.                                  | targeted Playwright + unit coverage       | `5/5`             |
| Performance (CWV + payloads)                  | `supporting` | No dependency or route-cost increase; the fix stays in existing client logic only.                                                               | diff review                               | `4/5`             |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice changes no persisted state, sync boundary, or storage contract.                                                           | explicit scope rationale                  | `N/A`             |
| Caching and invalidation strategy             | `N/A`        | N/A because no server data or cached route behavior changes here.                                                                                | explicit scope rationale                  | `N/A`             |
| Reliability and failure handling              | `target`     | Focus behavior must be deterministic across initial load and failed-submit recovery, without relying on browser-specific autofocus side effects. | targeted unit + targeted Playwright       | `5/5`             |
| Security and authz                            | `N/A`        | N/A because the slice changes no auth, authorization, or protected-route behavior.                                                               | explicit scope rationale                  | `N/A`             |
| Privacy and compliance                        | `N/A`        | N/A because no new data is collected, stored, or exposed.                                                                                        | explicit scope rationale                  | `N/A`             |
| Content governance                            | `N/A`        | N/A because this slice changes behavior, not content source-of-truth or copy policy.                                                             | explicit scope rationale                  | `N/A`             |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, CRUD flow, or operator labeling changes here.                                                                     | explicit scope rationale                  | `N/A`             |
| SEO and crawlability                          | `N/A`        | N/A because the fix changes only client-side focus behavior on an existing public route.                                                         | explicit scope rationale                  | `N/A`             |
| AI discoverability                            | `N/A`        | N/A because no public metadata or retrieval semantics change here.                                                                               | explicit scope rationale                  | `N/A`             |
| Analytics and KPI observability               | `N/A`        | N/A because the slice adds no analytics events or observability fields.                                                                          | explicit scope rationale                  | `N/A`             |
| Commerce and revenue ops                      | `N/A`        | N/A because the contact-form focus behavior has no pricing, checkout, or billing effect.                                                         | explicit scope rationale                  | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A because the fix changes no runbook, escalation, or support-operations contract; it only removes unintended autofocus on load.                | explicit scope rationale                  | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A because the slice has no reporting, payout, or finance-system impact.                                                                        | explicit scope rationale                  | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A because the slice changes no locale system, language routing, or translation contract.                                                       | explicit scope rationale                  | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | The fix must stay within the existing ContactForm component and existing test stack, with no new dependency.                                     | diff review + validation evidence         | `5/5`             |
| Testing and QA automation                     | `target`     | Add regression coverage so initial-load focus and validation-error focus are both locked before merge recommendation.                            | unit + targeted Playwright + verify gates | `5/5`             |
| Scalability and cost efficiency               | `supporting` | The fix should remove browser-dependent behavior rather than adding more conditional client complexity.                                          | code review                               | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The slice must remain a small reversible code change with no migration or deployment coordination.                                               | PR diff + rollback simplicity             | `4/5`             |

## Data Placement And Sync Contract

- `N/A`
- Rationale:
  - this slice changes client-side focus behavior only and introduces no persisted or synchronized state.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - no entities, routes, slugs, or persisted identifiers change in this fix.

## Scope

- Remove unintended initial desktop autofocus from the contact form.
- Preserve intentional focus recovery for invalid submit flows.
- Preserve intentional focus after reset.
- Add targeted regression coverage for mount focus and validation-error focus.
- Re-run relevant validation and merge gates on the active branch/PR.

## Out Of Scope

- Contact page copy changes.
- Submit API changes.
- Form-field schema or payload changes.
- Contact page visual redesign.
- Broader focus-policy refactors outside the contact form.

## Acceptance Criteria

1. `/contact` initial load does not place focus in the `NAME` field automatically.
2. Invalid submit still focuses the first invalid field.
3. Reset flow still restores focus to the `NAME` field intentionally.
4. Existing submit behavior and copy stay unchanged.
5. Targeted unit and Playwright regression coverage pass.
6. `verify:pre-pr` and `verify:pre-merge` pass after the fix.

## Validation

- targeted unit:
  - `npx vitest run tests/unit/contact-form.test.tsx`
- targeted e2e:
  - `npx playwright test tests/e2e/contact-form-a11y.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local Playwright validation for:
  - desktop Chromium `/contact`
- Optional preview QA after PR update:
  - PR #437 Vercel preview on desktop Chrome/Safari-equivalent

## Constraints

- Keep copy in English.
- Do not weaken existing validation recovery behavior.
- Do not introduce a browser-specific workaround that hides the underlying focus policy.

## 10/10 Quality Bar

- Initial page load must feel calm and not hijack keyboard focus.
- Failed submit must still recover focus deterministically to the relevant field.
- Accessibility semantics must stay intact for labels, error association, and keyboard use.
- The fix must be small, obvious, and easy to rollback.

## Help/Guide Impact

- `N/A`
- Rationale:
  - this slice changes no user-facing workflow guidance or help-center contract.

## Checkpoint Log

- `2026-04-15 | implementation start | created a scoped merge-blocker brief after local pre-merge verification found deterministic desktop Chromium autofocus on /contact load | next: remove the initial autofocus path, add regression coverage, rerun targeted checks, and close the merge gate`
- `2026-04-15 | commit e1b510d | removed mount-time autofocus from ContactForm, added targeted unit regression coverage, and passed targeted vitest, targeted Playwright, npm run verify:pre-pr, and npm run lint:briefs:all | next: push the PR #437 follow-up, rerun npm run verify:pre-merge, and confirm merge readiness`
