# Task Brief: AW-011 Terms/Privacy Compliance Lifecycle (10/10)

## Metadata

- `id`: `2026-03-10-aw-011-terms-privacy-compliance-lifecycle-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-10`
- `updated`: `2026-03-12`

## Goal

Ensure Terms and Privacy policies remain accurate, versioned, and operationally maintained as product behavior changes.

## Why This Brief Exists

- AW-011 is now active with dedicated implementation checkpoints.
- Policy drift creates legal/compliance risk when product, analytics, auth, or integrations evolve.
- This brief defines measurable 10/10 thresholds and operational checkpoints.

## Scope

- Define policy ownership model and review cadence.
- Define change-log linkage between product changes and policy updates.
- Define pre-merge compliance checklist coverage for sensitive change classes:
  - auth/account flows,
  - analytics/tracking,
  - user-data export/delete,
  - third-party integrations.
- Define versioning, publication, and rollback-safe policy update process.

## Out Of Scope

- Full legal rewrite in this slice.
- Re-architecture of auth, analytics, or data model.
- Country-specific legal expansion beyond current operating scope.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - published policy version metadata (`version`, `effectiveDate`, `updatedAt`).
  - compliance review records tied to release/PR checkpoints.
- Local-only:
  - in-progress draft notes prior to policy publication.
- Sync behavior:
  - product change classes that impact policy must trigger compliance review before merge.
  - policy version update becomes canonical only on explicit publish action.
  - rollback requires explicit link to previous policy version and change rationale.
- Invalidation:
  - prior compliance snapshot is invalidated when relevant product behavior changes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                           | Evidence                                      |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Product goals and IA                          | `target`     | Policy lifecycle clearly maps ownership, review cadence, and release checkpoints end-to-end.               | lifecycle diagram + checklist                 |
| UX flow clarity                               | `supporting` | N/A                                                                                                        | N/A                                           |
| Visual design quality                         | `supporting` | N/A                                                                                                        | N/A                                           |
| Business logic correctness and data integrity | `target`     | Compliance linkage is deterministic: in-scope product change cannot bypass policy review gate.             | gate rules + PR evidence                      |
| Admin editor ergonomics                       | `supporting` | N/A                                                                                                        | N/A                                           |
| Accessibility (a11y)                          | `supporting` | N/A                                                                                                        | N/A                                           |
| Performance (CWV + payloads)                  | `supporting` | N/A                                                                                                        | N/A                                           |
| Data placement and sync boundaries            | `target`     | Policy/version metadata ownership and update flow are explicit and auditable.                              | contract section + version history checks     |
| Caching and invalidation strategy             | `target`     | Policy snapshots invalidate when relevant behavior changes; no stale policy version is treated as current. | release checklist + audit log                 |
| Reliability and failure handling              | `target`     | Missing policy-review evidence yields deterministic block with next-step guidance.                         | checklist failure output + runbook            |
| Security and authz                            | `target`     | Access to publish policy versions is role-gated with fail-closed unauthorized behavior.                    | role contract + negative-path checks          |
| Privacy and compliance                        | `target`     | Policy text remains behavior-accurate for data collection, retention, and third-party processing flows.    | diff review matrix + compliance checklist     |
| Content governance                            | `target`     | Every policy update is versioned, attributable, and linked to product-change rationale.                    | version log + PR linkage                      |
| Admin workflow and editability                | `target`     | Non-technical operators can execute policy-review checklist without legal/engineering ambiguity.           | ops runbook + dry-run evidence                |
| SEO and crawlability                          | `supporting` | N/A                                                                                                        | N/A                                           |
| AI discoverability                            | `supporting` | N/A                                                                                                        | N/A                                           |
| Analytics and KPI observability               | `supporting` | N/A                                                                                                        | N/A                                           |
| Commerce and revenue ops                      | `supporting` | No direct finance entitlement mutation in this planning slice; policy ops only.                            | scope statement + changed-files diff          |
| Incident response and support operations      | `target`     | Support can identify active policy version and recent compliance decisions in <=5 minutes.                 | runbook incident section                      |
| Finance and reporting operations              | `supporting` | No reporting pipeline mutation; compliance lifecycle governance only.                                      | scope statement + architecture review         |
| i18n operational readiness                    | `supporting` | No locale model change in this slice; policy lifecycle remains locale-extensible for future expansion.     | schema/process design notes                   |
| Stack-fit and dependency discipline           | `target`     | Implementation uses current docs/checklist/tooling stack without unnecessary dependencies.                 | package diff + architecture review            |
| Testing and QA automation                     | `target`     | Compliance checklist and policy-linkage assertions are validated in pre-PR/pre-merge gates.                | `verify:pre-pr` + `verify:pre-merge` evidence |
| Scalability and cost efficiency               | `supporting` | N/A                                                                                                        | N/A                                           |
| DevOps and rollback readiness                 | `target`     | Policy version rollback path is explicit, auditable, and release-safe.                                     | rollback procedure + version references       |

## Acceptance Criteria

- Policy ownership and review cadence are explicit.
- Product-change classes that require policy review are explicitly gated.
- Policy versioning, publication, and rollback process are deterministic.
- Compliance evidence is linked to PR/release checkpoints.

## Deliverables (Slice 1)

- `docs/runbooks/terms-privacy-compliance-lifecycle.md`
- `docs/checklists/policy-impact-release-review.md`
- `docs/checklists/release-pr-checklist.md` linkage to policy-impact checklist
- `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md` lifecycle updates for AW-011 (`planned` -> `in-progress`)

## Deliverables (Slice 2)

- hard PR-body policy-impact enforcement in `scripts/lint-pr-body-sections.mjs`:
  - required `Policy impact` + `Policy version note` summary fields,
  - required structured `Policy-impact checklist` evidence in test section,
  - file-scope inference that blocks false `Policy impact: no` declarations.
- generated PR-body local lint gate in `scripts/lint-generated-pr-body.mjs` wired into `verify`/`verify:pre-pr`.
- PR template + generator updates for structured policy-impact metadata:
  - `.github/pull_request_template.md`
  - `scripts/generate-pr-body.mjs`
- regression coverage for new enforcement rules:
  - `tests/unit/pr-body-lint-policy-impact.test.ts`

## Validation

- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Constraints

- Do not include legal secrets or privileged consultation notes in repo artifacts.
- Keep checklist language operational and unambiguous for non-technical owners.
- Avoid weak “best effort” criteria; require deterministic evidence.

## 10/10 Quality Bar

- Policy lifecycle remains synchronized with shipped behavior.
- Compliance review is predictable, repeatable, and evidence-based.
- Version history enables fast rollback and support traceability.
- Release flow blocks non-compliant policy-impacting changes.

## Checkpoint Log

- `2026-03-12 | docs/aw-011-policy-enforcement-slice-2 | completed AW-011 slice-2 hard enforcement baseline: added deterministic policy-impact inference + required PR fields/checklist evidence, wired generated-body policy lint into verify:pre-pr, updated PR template/generator, and validated with npm run verify:pre-pr (PASS) | next: open PR and run gate:pre-merge`
- `2026-03-12 | docs/aw-011-policy-lifecycle-slice-1 | completed AW-011 slice-1 docs baseline: added policy lifecycle runbook + policy-impact release checklist, linked release checklist and GDPR runbook, and verified with npm run verify:pre-pr (PASS) | next: open PR and run gate:pre-merge`
- `2026-03-12 | docs/aw-011-policy-lifecycle-slice-1 | started AW-011 slice-1: moved brief to in-progress, set backlog lifecycle to in-progress, and started policy-lifecycle runbook + release compliance checklist baseline | next: run lint:briefs + verify:pre-pr, then open PR`
- `2026-03-10 | working tree | created AW-011 planned implementation brief with scorecard-complete compliance lifecycle thresholds and deterministic policy versioning/rollback contract | next: link this brief in backlog and use it as canonical scope when implementation starts`
