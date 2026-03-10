# Task Brief: AW-009 Admin Email Templates And Governance (10/10)

## Metadata

- `id`: `2026-03-10-aw-009-admin-email-templates-and-governance-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-10`
- `updated`: `2026-03-10`

## Goal

Provide a safe admin workflow for email-template editing, preview, and publish governance without risky ad-hoc text changes.

## Why This Brief Exists

- AW-009 is in backlog as `planned` but lacked a dedicated implementation brief.
- Messaging quality and safety need deterministic contracts before implementation starts.
- This brief defines measurable 10/10 thresholds for future execution slices.

## Scope

- Admin-managed template lifecycle:
  - `draft`,
  - `review`,
  - `published`.
- Template preview before publish.
- Placeholder/variable validation and fallback behavior.
- Change history/audit visibility for template updates.
- Governance guardrails for publish/revert operations.

## Out Of Scope

- Full marketing automation platform integration.
- Provider migration (for example replacing current mail provider).
- Unrelated auth/checkout flow redesign.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - template content and metadata (`status`, `version`, `updatedBy`, `updatedAt`).
  - publish/revert audit records.
- Local-only:
  - transient unsaved editor input and preview toggles.
- Sync behavior:
  - edits persist only on explicit save/publish actions.
  - publish requires validation pass and deterministic failure messages.
  - stale-update conflict must force reload of canonical draft before overwrite.
- Invalidation:
  - published-template update invalidates send pipeline cache/read model for that template key.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                            | Evidence                                           |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Product goals and IA                          | `target`     | Admin can find, edit, preview, and publish a template in one linear flow without external docs.             | UX flow spec + e2e journey checks                  |
| UX flow clarity                               | `target`     | No dead-end states in `draft -> review -> published` lifecycle, including validation failures.              | e2e flow + manual QA                               |
| Visual design quality                         | `supporting` | N/A                                                                                                         | N/A                                                |
| Business logic correctness and data integrity | `target`     | Template versions are deterministic; no silent overwrite or placeholder corruption after concurrent edits.  | unit/integration invariants                        |
| Admin editor ergonomics                       | `target`     | High-frequency copy updates complete with clear validation, preview, and save/publish feedback.             | usability notes + e2e coverage                     |
| Accessibility (a11y)                          | `target`     | Editor + preview + publish controls are keyboard-accessible with valid semantics and labels.                | e2e/a11y assertions + manual keyboard QA           |
| Performance (CWV + payloads)                  | `supporting` | N/A                                                                                                         | N/A                                                |
| Data placement and sync boundaries            | `target`     | Local-vs-server ownership for draft/published state is explicit and reflected in tests.                     | brief contract + integration tests                 |
| Caching and invalidation strategy             | `target`     | Newly published template is used consistently after invalidation with no stale-send content window.         | integration tests + runbook notes                  |
| Reliability and failure handling              | `target`     | Validation/provider failures return actionable errors and preserve editable draft state.                    | negative-path tests + manual QA                    |
| Security and authz                            | `target`     | Unauthorized template mutation attempts fail closed (`401/403`) and never modify canonical templates.       | API negative-path tests                            |
| Privacy and compliance                        | `target`     | Governance prevents accidental inclusion of sensitive data in templates and logs only safe metadata.        | validation rules + audit-log checks                |
| Content governance                            | `target`     | Every published template includes version, owner, and rollback-ready history.                               | data model + audit trail checks                    |
| Admin workflow and editability                | `target`     | Role-gated publish/revert workflow is deterministic and documented for operators.                           | runbook + checklist + e2e                          |
| SEO and crawlability                          | `supporting` | N/A                                                                                                         | N/A                                                |
| AI discoverability                            | `supporting` | N/A                                                                                                         | N/A                                                |
| Analytics and KPI observability               | `target`     | Template lifecycle events (`saved`, `published`, `reverted`) emit with stable non-sensitive payload schema. | event contract + tests                             |
| Commerce and revenue ops                      | `supporting` | No entitlement/finance mutation in scope; template governance only.                                         | scope and changed-files diff                       |
| Incident response and support operations      | `target`     | Support can identify active template version and rollback path in <=5 minutes during incident response.     | runbook + audit evidence                           |
| Finance and reporting operations              | `supporting` | No finance/reporting workflow mutation; email template ops are decoupled from ledger/reporting contracts.   | scope statement + architecture review              |
| i18n operational readiness                    | `supporting` | Locale/template expansion path is not blocked by this contract (keys/versioning remain locale-extensible).  | schema contract + naming rules                     |
| Stack-fit and dependency discipline           | `target`     | Implementation uses existing stack and avoids unnecessary dependencies for template editing/governance.     | package diff + architecture review                 |
| Testing and QA automation                     | `target`     | Critical template lifecycle and negative paths are covered by unit/integration/e2e before merge.            | test matrix + `verify:pre-pr` + `verify:pre-merge` |
| Scalability and cost efficiency               | `supporting` | N/A                                                                                                         | N/A                                                |
| DevOps and rollback readiness                 | `target`     | Publish/revert procedures are deterministic and validated with runbook-backed rollback steps.               | runbook + rollback checklist + test evidence       |

## Acceptance Criteria

- Admin can edit and preview templates before publish with deterministic validation.
- Publish/revert operations are role-gated and auditable.
- Placeholder integrity is enforced; invalid templates cannot publish.
- Support can identify and roll back template version quickly when needed.

## Validation

- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Constraints

- Never expose secrets or PII in template previews, logs, or artifacts.
- Preserve fail-closed behavior on unauthorized template mutations.
- Keep governance workflow readable for non-technical operators.

## 10/10 Quality Bar

- Template workflow is predictable: edit -> validate -> preview -> publish -> verify.
- Clear UX states exist for `loading`, `error`, `retry`, and `success`.
- Publish safety prevents malformed placeholder/template output.
- Rollback is as deterministic as publish.

## Checkpoint Log

- `2026-03-10 | working tree | created AW-009 planned implementation brief with scorecard-complete governance thresholds and deterministic draft/review/publish contract | next: link this brief in backlog and use it as canonical scope when implementation starts`
