# Task Brief: Non-Admin Test Data Email Template Cleanup (10/10)

## Metadata

- `id`: `2026-04-06-non-admin-test-data-email-template-cleanup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-06`
- `updated`: `2026-04-06`

## Goal

Production email-template data stays trustworthy because Playwright/admin QA no longer leaves test-created `admin_email_templates` rows behind, and the existing polluted legacy rows have an explicit safe cleanup path.

## Why This Brief Exists

- The remaining open production admin note queue is down to two notes, and the last technical one is:
  - `f96e7d7c-3477-417d-b96f-f2c8f876e2ab` `Non-admin test data cleanup follow-up`
- Repo reconciliation on `2026-04-06` shows:
  - `admin_content_items` test-record pollution is already handled and production currently has `0` rows matching `e2e-admin-content-*`,
  - `admin_email_templates` still contains `301` QA/test rows matching the legacy preview-test key pattern `aw012_publish_fallback_*`.
- Root cause in current code:
  - `tests/e2e/admin-email-templates-preview.spec.ts` creates a real template row with a timestamped key,
  - there is no explicit artifact contract for email-template test rows,
  - there is no deterministic cleanup step before/after the preview test.
- This slice intentionally narrows the residual note to the real remaining source of non-note production pollution instead of reopening already-fixed admin-content cleanup work.

## Dependencies And Boundaries

- Existing related cleanup lineage to reuse rather than redesign:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-24-admin-notes-e2e-artifact-cleanup-and-isolation-10-10.md`
  - `/Users/stianvikra/freeswimming/app/api/admin/content/test-records/route.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/admin-note-test-artifact-cleanup.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/admin-email-templates-preview.spec.ts`
  - `/Users/stianvikra/freeswimming/docs/runbooks/admin-email-template-governance.md`
- This slice owns:
  - explicit email-template QA/test artifact identification,
  - deterministic cleanup path for explicit email-template test rows,
  - legacy compatibility for existing `aw012_publish_fallback_*` rows,
  - Playwright prevention so future preview runs do not leave shared rows behind.
- This slice does not own:
  - public email delivery behavior,
  - template governance UX redesign,
  - broad cleanup of every possible QA row in every table,
  - deletion of real operator-authored email templates.

## Admin Notes Triage Disposition

- `f96e7d7c-3477-417d-b96f-f2c8f876e2ab` `Non-admin test data cleanup follow-up`
  - disposition: owned by this brief.
  - reason: remaining live pollution is now concretely email-template QA/test residue, not admin-note or admin-content residue.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Admin workflow and editability`
- `Incident response and support operations`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                   | Evidence                                      |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Product goals and IA                          | `target`     | Production email-template inventory no longer accumulates obvious QA/test rows from preview coverage, and the cleanup contract is explicit instead of ad hoc.    | production query + code review                |
| UX flow clarity                               | `supporting` | Supporting only: this slice should not materially change the visible admin email-template workflow beyond keeping test pollution out of the real list.           | diff review + targeted e2e                    |
| Visual design quality                         | `N/A`        | N/A because this slice is test-data hygiene and route-level cleanup, not visual/UI redesign.                                                                    | scope rationale                               |
| Business logic correctness and data integrity | `target`     | Cleanup targets only explicit QA/test template keys (new canonical prefix + legacy `aw012_publish_fallback_*`) and never matches normal operator template keys. | unit tests + production query + code review   |
| Admin editor ergonomics                       | `target`     | Real admins can trust the email-template list because QA/test residue is removable and future preview runs stop polluting the shared inventory.                  | production review + targeted e2e              |
| Accessibility (a11y)                          | `N/A`        | N/A because no operator-facing UI control or semantics change in this cleanup slice.                                                                             | scope rationale                               |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the cleanup route/helper adds no material payload or route-performance regression.                                                              | diff review + `verify:pre-pr`                 |
| Data placement and sync boundaries            | `target`     | Server-canonical template rows/revisions stay authoritative; QA artifact identifiers and cleanup bookkeeping remain explicit and deterministic.                  | brief contract + helper/route tests           |
| Caching and invalidation strategy             | `supporting` | Supporting only: cleanup requests and test reruns should not leave stale template rows visible after deterministic deletion.                                     | targeted e2e + route review                   |
| Reliability and failure handling              | `target`     | Cleanup failures surface explicit errors, and preview tests always attempt safe before/after cleanup so repeated runs do not silently pile up rows.              | unit tests + targeted e2e                     |
| Security and authz                            | `target`     | Cleanup remains protected by admin/editor auth and only affects explicit QA/test artifacts.                                                                      | route tests + existing auth pattern review    |
| Privacy and compliance                        | `supporting` | Supporting only: cleanup does not expose template bodies or other sensitive data outside existing protected admin workflows.                                     | scope review + code review                    |
| Content governance                            | `supporting` | Supporting only: QA/test template keys are clearly separated from canonical operator template keys.                                                              | helper contract + runbook update              |
| Admin workflow and editability                | `target`     | Shared admin email-template inventory reflects real work instead of accumulating hundreds of preview-test artifacts.                                             | production query + cleanup verification       |
| SEO and crawlability                          | `N/A`        | N/A because admin email-template cleanup affects no public route, metadata, or crawl contract.                                                                   | scope rationale                               |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing surface or structured public content.                                                                         | scope rationale                               |
| Analytics and KPI observability               | `supporting` | Supporting only: explicit artifact prefixes and cleanup counts make drift easier to spot even without adding new analytics events.                               | query evidence + code review                  |
| Commerce and revenue ops                      | `N/A`        | N/A because cleanup touches no pricing, billing, entitlement, or transaction workflow.                                                                           | scope rationale                               |
| Incident response and support operations      | `target`     | Operator docs record how QA email-template artifacts are identified and safely cleaned without touching real templates.                                          | runbook update                                |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, reporting, or payout flow changes in this slice.                                                                          | scope rationale                               |
| i18n operational readiness                    | `N/A`        | N/A because this slice changes no locale strategy, translation system, or public copy contract beyond internal QA key naming.                                   | scope rationale                               |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin cleanup patterns and Supabase/server primitives without adding dependencies or inventing a second cleanup system.                           | dependency diff + architecture review         |
| Testing and QA automation                     | `target`     | Coverage protects new artifact identification, cleanup route behavior, and before/after cleanup in the email-template preview e2e flow.                         | unit/e2e coverage + `verify:pre-pr` evidence  |
| Scalability and cost efficiency               | `supporting` | Supporting only: deterministic artifact cleanup avoids unbounded shared-row growth and repeated manual production triage.                                        | production query + workflow review            |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice is reversible without schema migration, and legacy cleanup matching is explicitly bounded.                                            | PR diff + rollback note                       |

## Data Placement And Sync Contract

- Server-canonical:
  - `admin_email_templates` rows,
  - `admin_email_template_revisions` rows,
  - canonical template identities (`id`, `template_key`, `locale`).
- Local-only:
  - transient Playwright-generated unique suffixes,
  - temporary cleanup bookkeeping during test runs.
- Sync policy:
  - new QA rows must use an explicit artifact key prefix,
  - cleanup deletes only rows that match the explicit artifact contract,
  - legacy `aw012_publish_fallback_*` rows remain eligible for cleanup until the shared inventory is clean.
- Retention and safety:
  - real operator template rows remain untouched,
  - revision rows follow canonical DB cascade when matching QA template rows are deleted.

## Identity And Rename Contract

- Canonical stable IDs:
  - `admin_email_templates.id` remains the real row identity,
  - `admin_email_templates.template_key + locale` remains the operator-visible canonical template identity.
- QA/test identifiers:
  - new automated artifacts use a dedicated template-key prefix and are not valid operator keys,
  - legacy `aw012_publish_fallback_*` keys are treated as cleanup-only compatibility, not canonical future naming.
- Rename vs repurpose:
  - do not repurpose normal operator template keys into test keys,
  - do not broaden cleanup matching beyond the explicit QA/test key contract.

## Scope

- Add an explicit email-template QA/test artifact identification helper.
- Add a deterministic cleanup path for explicit QA email-template rows.
- Update email-template preview Playwright coverage to:
  - use the new artifact contract,
  - clean up before the test starts,
  - clean up again after the test finishes,
  - continue matching legacy residue so repeated runs stop compounding pollution.
- Update operator runbook guidance for recognizing/cleaning QA email-template artifacts.

## Out Of Scope

- General delete support for arbitrary email templates.
- Reworking email-template lifecycle states or preview rendering.
- Cleanup of unrelated user/library/course rows that do not currently show real residue.
- Pricing or entitlement follow-up work.

## Acceptance Criteria

1. The repo has an explicit email-template QA/test artifact contract instead of relying on anonymous timestamp keys.
2. There is a deterministic cleanup path for QA email-template rows that also covers legacy `aw012_publish_fallback_*` residue.
3. `tests/e2e/admin-email-templates-preview.spec.ts` no longer leaves durable shared template rows behind across repeated runs.
4. Production cleanup can remove the current legacy artifact rows without touching normal operator templates.
5. `npm run lint:briefs`, targeted validation, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - helper contract tests for email-template QA/test identifiers
  - cleanup-route tests
- targeted `playwright`:
  - `tests/e2e/admin-email-templates-preview.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Help/Guide And Operator Training Contract

- `Help/Guide`: `N/A`
  - no user-visible admin help copy or labeled operator action changes in the shipped UI.
- Required docs update:
  - update `/Users/stianvikra/freeswimming/docs/runbooks/admin-email-template-governance.md` with QA/test artifact cleanup guidance.

## Constraints

- Do not introduce a broad “delete any template” operator feature just to clean test rows.
- Do not match cleanup targets by fuzzy copy/body text; template-key contract must be explicit.
- Keep legacy matching narrow and removable once the backlog is gone.

## Checkpoint Log

- `2026-04-06 | planning | reconciled the final technical open production note and verified that admin-content QA pollution is already clean (0 matching rows) while admin email templates still contain 301 legacy aw012 preview artifacts; narrowed the slice to email-template artifact cleanup/prevention only | next: implement explicit artifact contract + cleanup path, update the preview e2e to self-clean, validate locally, then clean the live legacy rows and close the note`
- `2026-04-06 | implementation | added explicit email-template QA artifact helpers, a protected admin cleanup route, preview e2e before/after self-clean, negative-path coverage, and runbook guidance; local validation passed via typecheck, targeted vitest, targeted playwright, lint:briefs:all, and full verify:pre-pr (95 passed / 319 skipped) | next: commit, open PR, run verify:pre-merge, merge, then use the shipped cleanup path to purge the 301 legacy production artifacts and close the admin note`
