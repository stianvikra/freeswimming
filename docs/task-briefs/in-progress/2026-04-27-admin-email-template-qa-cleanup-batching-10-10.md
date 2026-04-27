# Task Brief: Admin Email Template QA Cleanup Batching (10/10)

## Metadata

- `id`: `2026-04-27-admin-email-template-qa-cleanup-batching-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-27`
- `updated`: `2026-04-27`

## Goal

Restore the full E2E release gate by making the protected admin email-template QA cleanup route delete old test template and revision residue in bounded batches.

## Why This Brief Exists

- Controlled dependency-maintenance for PR `#361` (`jsdom` v29) exposed an unrelated deterministic full-gate blocker.
- `admin-email-templates-preview.spec.ts` fails before product assertions because `/api/admin/email-templates/test-records` returns `500` while deleting old QA/test revision rows.
- The local environment has hundreds of old `e2e_admin_email_template_*` and `aw012_publish_fallback_*` rows; deleting all revision IDs in one PostgREST `.in(...)` request returns `Bad Request`.
- The dependency PR should stay clean, so this baseline-hardening PR is split out from `main` before `#361` is resumed.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                       | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `N/A`        | N/A because this changes only protected QA cleanup behavior, not product routes, IA, labels, or navigation hierarchy.                | explicit scope rationale               | `N/A`                   |
| UX flow clarity                               | `N/A`        | N/A because no user-facing or admin UI flow copy/action layout changes.                                                              | explicit scope rationale               | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because no UI, layout, print, branding, screenshot, or visual asset changes.                                                     | explicit scope rationale               | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Cleanup still deletes only explicit QA/test keys, preserves normal operator templates, and reports deleted template/revision IDs.    | route diff + unit/e2e cleanup evidence | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin preview E2E setup/teardown should stop blocking the editor coverage because of old residue.                   | targeted Playwright run                | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered semantics, focus behavior, labels, or interaction UI changes.                                                | explicit scope rationale               | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: batching must not affect public route payloads or app CWV budgets.                                                  | perf budget in full gate               | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical QA cleanup remains confined to `admin_email_templates` and `admin_email_template_revisions`; no browser/local data. | route contract + runbook update        | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: cleanup route remains `no-store` and does not introduce cache invalidation changes.                                 | response header path review            | `4/5`                   |
| Reliability and failure handling              | `target`     | Cleanup handles large old QA/test residue without PostgREST query-limit failure and keeps existing schema/gate errors deterministic. | targeted unit + Playwright + full gate | `5/5`                   |
| Security and authz                            | `target`     | Protected cleanup remains editor/admin gated, fail-closed, and never broadens the key filter beyond explicit QA/test prefixes.       | negative-path coverage + route review  | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: cleanup logs and responses must not expose secrets, env values, or private user data.                               | log/response review                    | `4/5`                   |
| Content governance                            | `target`     | Email-template QA artifact hygiene remains documented and revision cleanup remains delete-safe.                                      | admin email-template runbook update    | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: normal email-template create/review/publish preview E2E still runs after cleanup succeeds.                          | targeted admin preview E2E             | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, canonical, or crawl behavior changes.                                               | explicit scope rationale               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-discoverable page changes.                                            | explicit scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: email-template lifecycle assertions and existing analytics behavior must remain unchanged.                          | targeted E2E and unit tests            | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, invoice, portal, refund, pricing, or revenue workflow changes.                                 | explicit commerce scope rationale      | `N/A`                   |
| Incident response and support operations      | `target`     | Runbook documents batching as the operational cleanup rule for large QA residue before dependency gates.                             | runbook + brief checkpoint             | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this does not affect reconciliation, payouts, invoices, refunds, reports, exports, or finance data.                      | explicit finance scope rationale       | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation content, metadata, or future i18n data model changes.                                     | explicit i18n scope rationale          | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next/Supabase route patterns, add no dependency, and keep cleanup in the existing protected test-records endpoint.      | package diff + route diff              | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/keep unit coverage for chunked deletes; targeted admin preview E2E passes; `verify:pre-pr` passes before PR handoff.             | command logs                           | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: batching avoids oversized requests without introducing unbounded retries or extra jobs.                             | batch size + safety cap review         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Change is small, reversible, isolated from dependency PRs, and rollback is one PR revert with no migration or secret change.         | PR diff + rollback note                | `5/5`                   |

## Data Placement And Sync Contract

- Server-canonical cleanup only:
  - `admin_email_templates` rows with explicit QA/test template keys,
  - `admin_email_template_revisions` rows with explicit QA/test template keys or template IDs tied to deleted QA/test templates.
- No browser state, local storage, cache ownership, sync/conflict, retention, or invalidation policy changes.
- Cleanup remains protected by the existing admin/editor gate and returns `Cache-Control: no-store`.

## Identity And Rename Contract

- No product entity identity is changed.
- Cleanup identity remains the existing explicit QA/test key contract:
  - canonical prefix `e2e_admin_email_template_*`,
  - legacy prefix `aw012_publish_fallback_*`.
- Normal operator keys such as `auth_login_code` are out of scope and must not match cleanup.

## Scope

- Batch deletes inside `/api/admin/email-templates/test-records` for:
  - pre-existing QA/test revision IDs,
  - QA/test template IDs,
  - post-template-delete revision rows by `template_id`.
- Keep existing candidate safety limits.
- Add unit coverage for large revision cleanup batches.
- Update the admin email-template runbook with the batching rule.
- Run targeted admin-email cleanup E2E and local release gates.

## Out Of Scope

- Merging dependency PR `#361`.
- Changing admin email-template UI, publish workflow, template validation, migrations, schema, auth policy, secrets, billing, analytics taxonomy, or normal template content.
- Broad cleanup of non-QA operator data.
- Raising safety caps or adding broad retries to hide failures.

## Acceptance Criteria

1. Cleanup route succeeds when old QA/test revision residue is larger than a single safe PostgREST `.in(...)` request.
2. Cleanup route still refuses candidates above existing safety caps.
3. Cleanup route remains editor/admin protected and scoped to explicit QA/test keys only.
4. Unit coverage proves batched revision deletes.
5. Targeted `admin-email-templates-preview.spec.ts --project=desktop-chromium` passes locally.
6. `npm run verify:pre-pr` passes before PR handoff.
7. PR handoff explains that dependency PR `#361` stays paused until this baseline PR is merged.

## Validation Plan

- `npm run lint:briefs`
- `npx vitest run tests/unit/admin-email-template-test-records-route.test.ts`
- `npx playwright test tests/e2e/admin-email-templates-preview.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Validation Evidence

- `npm run lint:briefs:all`: PASS for all 200 task brief files.
- `npx eslint app/api/admin/email-templates/test-records/route.ts tests/unit/admin-email-template-test-records-route.test.ts`: PASS.
- `npm run typecheck`: PASS.
- `npx vitest run tests/unit/admin-email-template-test-records-route.test.ts`: PASS, 1 file / 6 tests.
- `npx playwright test tests/e2e/admin-email-templates-preview.spec.ts --project=desktop-chromium`: PASS, 1 passed.
- First `npm run verify:pre-pr` attempt passed lint, typecheck, unit, build, perf, and the formerly blocked admin email-template E2E, then failed on one unrelated Supabase/dev-login network flake in `my-library-generator-intake.spec.ts`; targeted rerun passed.
- `npx playwright test tests/e2e/my-library-generator-intake.spec.ts --project=desktop-chromium --grep "accepts one generated session draft"`: PASS, 1 passed.
- `npm run verify:pre-pr`: pending rerun after commit.
- `npm run verify:pre-merge`: pending.

## Manual QA / Screenshot Handoff

- `N/A` because this slice changes no UI, print, layout, branding, or visual output.

## Help/Guide And Operator Training Impact

- Admin Help/Guide UI: `N/A` because operator workflow labels/actions are unchanged.
- Runbook update required and included: `docs/runbooks/admin-email-template-governance.md`.

## Checkpoint Log

- `2026-04-27 | in-progress | split out from jsdom PR #361 after full verify exposed deterministic admin email-template QA cleanup failure with PostgREST Bad Request on large revision delete; dependency branch remains local and unpushed | next: implement batched cleanup, run targeted unit/e2e, then full pre-PR gate`
- `2026-04-27 | validation | implemented batched deletes for QA/test templates and revisions, added unit coverage for 201 revision rows over three batches, and confirmed the previously failing admin-email Playwright spec passes | next: run full verify:pre-pr, commit, push, open PR, and monitor CI`
- `2026-04-27 | full-gate triage | first full verify:pre-pr attempt confirmed admin-email cleanup is fixed but hit one unrelated Supabase/dev-login DNS flake in My Library generator intake; targeted rerun passed | next: commit final diff and rerun full verify:pre-pr`
