# Task Brief: Admin Messages Menu New Message Indicator

## Metadata

- `id`: `2026-06-18-admin-messages-menu-new-message-indicator-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `execution_mode`: `decision and architecture brief; no implementation until source-of-truth is selected`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-notes-residual-disposition-intake-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `main@a0a63d58`
- `audit_status`: `draft-for-owner-audit`
- `decision`: Keep this separate from mobile tab discoverability because it needs message count semantics and cross-tab data; re-audit source-of-truth before implementation.
- `reason`: Note `833d64f7` asks for a Messages menu icon/count when new messages exist. That may require admin shell data loading, polling/refresh semantics, and unread/new status definition.
- `must_refresh_before_execution_if`: Refresh if `AdminWorkspace`, `AdminMessagesManager`, admin message statuses, message route contracts, Help/Guide message guidance, or admin shell data-loading rules change.

## Goal

Define and implement, in a later approved child, a privacy-safe Messages indicator in admin navigation when there are new messages, without adding stale or misleading counts.

## Pre-Implementation Owner Explanation

Dette er nyttig, men det er mer enn en liten ikonendring. Før vi viser et tall i menyen må vi vite hva tallet betyr: nye meldinger, needs reply, unread, unarchived, eller noe annet.

Hvorfor det betyr noe: Et feil tall i admin-menyen kan få support til å overse meldinger eller jage gamle meldinger.

Utenfor scope nå: implementation, polling, API-endringer, message status migration, unread state, email reply workflow, admin shell redesign og merge.

Fremoverkompatibilitet: nye message states må enten automatisk mappes til indikatorens kilde eller feile til “needs review” før tallet vises.

## Source Notes Covered

| Note ID                                | Covered Scope                                                    | Explicit Boundary                                        |
| -------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| `833d64f7-0a8e-4f78-916c-71a321cd96e4` | Admin Messages nav indicator/icon/count when new messages exist. | Requires source-of-truth decision before implementation. |

## Pre-Decision Audit Gate

Before implementation starts:

1. Reopen this brief, the residual intake, current `AdminMessagesManager`, admin shell tab metadata, and message status contracts.
2. Refresh source note `833d64f7`; confirm whether the desired signal is `new`, `unread`, `needs reply`, or another triage state.
3. Inspect whether a summary count already exists or whether full-message loading would be required.
4. Define freshness/failure behavior before showing any count in the shell.
5. Run `npm run lint:briefs:all` and get owner approval for count semantics before moving this brief to `in-progress`.

## Open Decisions

| Decision         | Recommended Default                                         | Reason                                                                                       |
| ---------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Count meaning    | `needs_reply` active messages                               | Existing admin message workflow already has status semantics; avoids inventing unread state. |
| Data source      | Existing admin messages endpoint or a tiny summary endpoint | Avoid loading full messages in shell if count is all that is needed.                         |
| Refresh behavior | Manual refresh or low-frequency refetch when entering admin | Avoid polling cost unless owner needs live alerting.                                         |
| Badge visibility | Messages tab only, not global public nav                    | Keeps private admin state in private admin shell.                                            |

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this brief: Product goals and IA, UX flow clarity, Business logic correctness and data integrity, Reliability and failure handling, Security and authz, Privacy and compliance, Admin workflow and editability, Incident response and support operations, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                               | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Indicator meaning is explicit and tied to admin message triage job.                                                                              | decision record                        | `5/5`                   |
| UX flow clarity                               | `target`     | Badge/count does not confuse new, unread, needs reply, archived, or deleted states.                                                              | status mapping                         | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: visual badge implementation is later scope.                                                                                     | follow-up acceptance criteria          | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Count source and status filters are deterministic and privacy-safe.                                                                              | data contract + tests                  | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: improves triage discoverability but no edit surface changes by default.                                                         | workflow rationale                     | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Future badge must have non-visual accessible label and not rely on color alone.                                                                  | a11y acceptance criteria               | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Shell indicator must not load full message payloads or poll aggressively without rationale.                                                      | perf/data-loading review               | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Message count remains server-canonical; shell display is derived/read-only.                                                                      | data-boundary contract                 | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Refresh/freshness rules are explicit before displaying count.                                                                                    | cache/refetch decision                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Count load failure fails quiet or shows a safe unknown state, never stale false certainty.                                                       | failure contract                       | `5/5`                   |
| Security and authz                            | `target`     | Count endpoint/data remains admin-gated and fail-closed.                                                                                         | authz tests                            | `5/5`                   |
| Privacy and compliance                        | `target`     | Badge exposes only aggregate admin count, no message body/email/provider details.                                                                | privacy review                         | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: no content publish/workflow changes.                                                                                            | no-content-diff review                 | `4/5`                   |
| Admin workflow and editability                | `target`     | Indicator improves route-to-message triage without changing e-mail-first reply model.                                                            | workflow review                        | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because private admin navigation changes no public metadata, sitemap, robots, canonicals, or crawlable content.                              | explicit private-admin scope rationale | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-facing content, structured data, or crawl-safe semantic contract changes.                                               | explicit private-admin scope rationale | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new KPI/event expected unless implementation later tracks triage.                                                            | analytics no-change/decision           | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no products, checkout, Stripe, entitlements, pricing, revenue, refund, invoice, payout, or commerce behavior changes.                | explicit commerce scope rationale      | `N/A`                   |
| Incident response and support operations      | `target`     | Admin can notice message work faster without visiting Messages first.                                                                            | support workflow evidence              | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes. | explicit finance scope rationale       | `N/A`                   |
| i18n operational readiness                    | `target`     | Badge labels tolerate localized count text without clipping.                                                                                     | copy/a11y contract                     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse admin message contracts and admin shell; no dependency.                                                                                    | architecture review                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Future implementation has unit/API/a11y tests for count states and failures.                                                                     | test matrix                            | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Count strategy avoids loading all messages in shell and defines polling/refetch cost.                                                            | performance contract                   | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Indicator can be removed/reverted without data migration.                                                                                        | rollback note                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: admin shell should consume a summary contract only if implementation proceeds.
- TypeScript/domain: admin message status mapping is canonical; no stringly ad hoc count.
- Supabase/data: no schema change unless unread semantics are explicitly approved.
- UI system: badge uses existing status chip/icon pattern.
- Testing: unit/API/negative-path/a11y coverage required.

## Data Placement And Sync Contract

- Server-canonical data: admin messages and status counts.
- Local data: displayed count and loading/error state only.
- Sync policy: TBD before implementation.
- Retention/sensitivity: aggregate count only.
- Cache/invalidation: explicit freshness policy required.

## Identity And Rename Contract

- Canonical IDs: message IDs/status keys remain unchanged.
- Human-readable labels: badge text is display-only.
- Mutability rules: status meanings are not repurposed.
- Rename vs repurpose: new status requires mapping.
- Compatibility: existing `/admin?tab=messages` remains.
- Observability and repair: unknown status excluded or flagged.

## Forward Compatibility Contract

- Extensibility surfaces: message statuses, badge labels, shell tab metadata, locales.
- Source of truth: admin message status counts.
- Additive behavior: new statuses require explicit mapping.
- Explicit mapping requirements: unread/new semantics, polling, or summary endpoint.
- Unknown/deprecated values: safe fallback with no misleading badge.
- Test/evidence: status fixture matrix.

## Scope

- Decision and future contract for Messages nav indicator.

## Out Of Scope

- Implementation until owner approves count semantics.
- Email reply workflow.
- Message status migration.
- Admin shell mobile switcher.

## Acceptance Criteria

1. Count meaning and source-of-truth are selected before implementation.
2. Privacy and authz boundaries are explicit.
3. Future implementation test matrix is defined.

## Validation

- `npm run lint:briefs`

## Help / Guide Impact

Required if implementation later changes Messages guidance, status labels, or triage workflow.

## Checkpoint Log

- `2026-06-18 | planned | captured live note 833d64f7 as a separate Messages indicator decision because it needs count semantics and shell data-loading boundaries | next: audit message status source-of-truth before implementation priority is set`
