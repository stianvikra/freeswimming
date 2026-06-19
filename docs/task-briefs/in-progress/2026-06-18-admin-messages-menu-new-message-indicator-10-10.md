# Task Brief: Admin Messages Menu New Message Indicator

## Metadata

- `id`: `2026-06-18-admin-messages-menu-new-message-indicator-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-19`
- `branch`: `feat/admin-messages-needs-reply-indicator`
- `execution_mode`: `end-to-end implementation until screenshot handoff; wait for owner visual approval before verify:pre-pr/PR`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-notes-residual-disposition-intake-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-19`
- `base`: `main@26688630`
- `audit_status`: `active-implementation`
- `decision`: Implement the Messages menu indicator as a `needs_reply` active-message badge only, backed by a tiny admin-gated summary endpoint. Do not introduce unread semantics, polling, dashboard replies, status migration, or global/public navigation alerts.
- `reason`: Existing Admin Messages v1 already uses `Needs reply` as the operator-owned response-intent state while email remains the reply workspace. A badge based on `new` or `unread` would invent a second triage model; a summary endpoint avoids loading full message bodies in the shell.
- `must_refresh_before_execution_if`: Refresh if `AdminWorkspace`, `AdminMessagesManager`, admin message statuses, message route contracts, Help/Guide message guidance, or admin shell data-loading rules change.

## Goal

Add a privacy-safe Messages navigation badge that shows when active admin messages need a human reply, without adding stale or misleading counts.

## Pre-Implementation Owner Explanation

Vi legger inn et lite tall på Messages i admin-menyen når det finnes meldinger som er satt til `Needs reply`.

Hvorfor det betyr noe: Et feil tall i admin-menyen kan få support til å overse meldinger eller jage gamle meldinger.

Utenfor scope: polling, unread-modell, nye statuser, dashboard replies, schema migration, global/public nav-varsling, admin shell-redesign, pass-criteria scoring og merge uten eksplisitt approval.

Fremoverkompatibilitet: nye message states må eksplisitt mappes til indikatorens kilde eller feile uten badge, slik at ukjente verdier ikke gir falsk supportsignal.

## Source Notes Covered

| Note ID                                | Covered Scope                                                    | Explicit Boundary                                                          |
| -------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `833d64f7-0a8e-4f78-916c-71a321cd96e4` | Admin Messages nav indicator/icon/count when new messages exist. | Implement as `needs_reply` active-message count only; no unread/new count. |

## Pre-Implementation Audit Gate

Completed before implementation on `2026-06-19`:

1. Reopen this brief, the residual intake, current `AdminMessagesManager`, admin shell tab metadata, and message status contracts.
2. Confirmed owner-selected semantics in chat: Messages indicator = `needs_reply` active messages, summary endpoint, no polling.
3. Inspected existing status model: `new`, `read`, `needs_reply`, `replied`, `triaged`, `archived`, `deleted`.
4. Inspected that no summary count endpoint exists; full message loading would expose unnecessary shell payload.
5. Defined failure behavior: count load failure shows no badge and only a non-visual status for tests/screen readers.

## Selected Decisions

| Decision         | Recommended Default                         | Reason                                                                                                                         |
| ---------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Count meaning    | `needs_reply` active messages               | Existing admin message workflow already has response-intent semantics; avoids inventing unread state.                          |
| Data source      | Tiny summary endpoint                       | Avoid loading message bodies, submitter email, request metadata, or diagnostics in the shell when count is all that is needed. |
| Refresh behavior | One fetch when admin shell mounts           | Avoid polling cost and stale live-alert expectations unless owner later approves live alerting.                                |
| Badge visibility | Messages tab only, not global public nav    | Keeps private admin state in private admin shell.                                                                              |
| Badge cap        | `9+`                                        | Keeps mobile nav layout stable while the accessible label preserves meaning.                                                   |
| Failure behavior | No visible badge on error or missing schema | Avoid false certainty; route still fails closed for unauthorized access.                                                       |

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this brief: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Accessibility (a11y), Performance (CWV + payloads), Reliability and failure handling, Security and authz, Privacy and compliance, Admin workflow and editability, Incident response and support operations, i18n operational readiness, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                               | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Indicator meaning is explicit and tied to admin message triage job.                                                                              | decision record                        | `5/5`                   |
| UX flow clarity                               | `target`     | Badge/count does not confuse new, unread, needs reply, archived, or deleted states.                                                              | status mapping                         | `5/5`                   |
| Visual design quality                         | `target`     | Badge is compact, does not resize the admin tab grid, caps at `9+`, and is screenshot-reviewed on desktop/mobile.                                | screenshot handoff + shell tests       | `5/5`                   |
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
| Testing and QA automation                     | `target`     | Implementation has unit/API/a11y tests for count states, failure handling, authz, schema-missing, and Help/Guide wording.                        | targeted tests + lint                  | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Count strategy avoids loading all messages in shell and defines polling/refetch cost.                                                            | performance contract                   | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Indicator can be removed/reverted without data migration.                                                                                        | rollback note                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: admin shell consumes one summary contract through `app/api/admin/messages/summary/route.ts`; no polling or global state.
- TypeScript/domain: admin message status mapping is canonical; no stringly ad hoc count.
- Supabase/data: no schema change unless unread semantics are explicitly approved.
- UI system: badge uses existing admin tab/icon rhythm and compact status-chip styling; screenshot handoff required before PR gates.
- Testing: unit/API/negative-path/a11y/Help coverage required.

## Data Placement And Sync Contract

- Server-canonical data: admin messages and status counts.
- Local data: displayed count and loading/error state only.
- Sync policy: shell fetches one `needs_reply` summary on mount; no live polling or cross-tab sync in this slice.
- Retention/sensitivity: aggregate count only.
- Cache/invalidation: summary route is `force-dynamic` and `no-store`; it is refreshed on page load only.

## Identity And Rename Contract

- Canonical IDs: message IDs/status keys remain unchanged.
- Human-readable labels: badge text is display-only.
- Mutability rules: status meanings are not repurposed.
- Rename vs repurpose: new status requires mapping.
- Compatibility: existing `/admin?tab=messages` remains.
- Observability and repair: unknown status excluded or flagged.

## Forward Compatibility Contract

- Extensibility surfaces: message statuses, badge labels, shell tab metadata, locales.
- Source of truth: `admin_messages.status = needs_reply` count.
- Additive behavior: existing future messages can use the badge automatically when their canonical status is `needs_reply`.
- Explicit mapping requirements: new statuses, unread/new semantics, polling, dashboard replies, or different support SLA categories require owner-approved mapping.
- Unknown/deprecated values: excluded from the badge and treated as no visible badge until mapped.
- Test/evidence: route summary tests, shell rendering tests, Help/Guide assertion, and screenshot handoff.

## Scope

- Add admin-gated `/api/admin/messages/summary` count endpoint for `needs_reply`.
- Add compact Messages tab badge with `9+` cap and accessible label.
- Fail quiet in the shell when summary count is unavailable.
- Update Help/Guide and admin message runbook to state badge semantics.
- Add targeted route, shell, and Help tests.

## Out Of Scope

- Email reply workflow.
- Message status migration.
- Admin shell mobile switcher.
- Polling/live alerting.
- Unread/new count semantics.
- Dashboard reply/outbound log.
- Schema migrations or generated database type changes.
- Global/public navigation badge.

## Acceptance Criteria

1. Messages badge appears only for `needs_reply` count greater than zero.
2. Badge caps at `9+` and does not destabilize mobile/desktop admin tab layout.
3. Button accessible label states the count meaning.
4. Summary endpoint is admin viewer-gated, `no-store`, and loads only aggregate count.
5. Summary schema/error failures produce no misleading badge.
6. Help/Guide and runbook clarify that the badge is not an unread counter and email remains the reply workspace.
7. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

- `./node_modules/.bin/vitest run tests/unit/admin-messages.test.ts tests/unit/admin-messages-routes.test.ts tests/unit/admin-workspace-shell.test.tsx tests/unit/admin-help-center.test.tsx`
- `npm run typecheck`
- `npm run lint:briefs`
- Route/label/support-surface impact sweep for `Needs reply`, `unread`, `Messages badge`, `message summary`, and changed admin message paths.
- Screenshot handoff for admin nav desktop/mobile.
- After owner screenshot approval: `npm run verify:pre-pr`, commit, push, PR, CI, `npm run verify:pre-merge`.

## Help / Guide Impact

Required and included in this slice because the admin navigation now exposes a support-workflow signal. Update `components/admin/AdminHelpCenter.tsx`, `tests/unit/admin-help-center.test.tsx`, and `docs/runbooks/admin-message-inbox.md` in the same PR.

## Quality Gate Evidence

- Reference surface / shared component: reuse the existing `AdminWorkspace` tab rail, `TAB_LABELS`, lucide `Inbox` tab icon, admin token classes, and `AdminMessagesManager` status model. No new nav component, badge dependency, or alternate message workflow is introduced.
- API failure-mode evidence: `/api/admin/messages/summary` is admin viewer-gated, `no-store`, and returns deterministic `401`/`403`, schema-missing warning with count `0`, and read failure `500` with a generic support-safe message. No unexpected 500 is expected for auth/schema paths; route tests cover unauthenticated access, schema missing, and successful count.
- Route/label/support sweep evidence: identifiers searched were `Needs reply`, `needs_reply`, `unread`, `Messages badge`, `message summary`, `messages/summary`, and `admin-tab-messages-needs-reply-badge`. Surfaces checked / directories/surfaces were `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, this active brief, the residual intake, and the Help/Guide assertions. Fallout handled: residual intake path/semantics, Help/Guide wording, runbook wording, data-access registry, route tests, shell tests, and Help test were updated in this PR.
- Screenshot comparison naming: screenshot handoff is `after/reference`, not before/after. Files are named `after-admin-messages-badge-desktop.png`, `reference-admin-messages-zero-desktop.png`, `after-admin-messages-badge-mobile.png`, and `reference-admin-messages-zero-mobile.png`.
- Accessibility and responsive evidence: shell tests assert the accessible label for `0`, `3`, `9+`, and error states; screenshots cover desktop and mobile badge/no-badge states.

## Checkpoint Log

- `2026-06-18 | planned | captured live note 833d64f7 as a separate Messages indicator decision because it needs count semantics and shell data-loading boundaries | next: audit message status source-of-truth before implementation priority is set`
- `2026-06-19 | in-progress | owner approved scope: Messages indicator = needs_reply active messages, summary endpoint, no polling; branch feat/admin-messages-needs-reply-indicator created from clean main@26688630 and brief moved to in-progress | next: implement summary endpoint, shell badge, Help/runbook updates, targeted tests, then screenshot handoff before verify:pre-pr`
- `2026-06-19 | screenshot-handoff-ready | implemented admin-gated needs_reply summary route, compact Messages nav badge with 9+ cap, fail-quiet shell behavior, Help/Guide + runbook wording, data-access registry entry, residual-intake path update, and targeted route/shell/Help tests; validation passed: vitest targeted suite 29 passed, npm run typecheck passed, npm run lint:briefs -- --all passed, git diff --check passed; route/label/support sweep covered Needs reply, needs_reply, unread, Messages badge, message summary, messages/summary, and admin-tab-messages-needs-reply-badge across app/components/lib/tests/docs; screenshot artifacts captured at output/admin-messages-needs-reply-indicator-2026-06-19-060546 using temporary local visual harness because /dev/login was blocked by local Supabase egress guard; harness files were removed before handoff; no product-rendering files changed after final capture, only docs/brief/architecture evidence changed | next: owner reviews screenshot handoff before npm run verify:pre-pr`
- `2026-06-19 | screenshot-approved | owner approved screenshot handoff and approved merge when tests/CI are good; no product-rendering files changed after final screenshot capture, only docs/brief/architecture evidence changed | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, run npm run verify:pre-merge, then merge if green`
- `2026-06-19 | pre-pr-green | npm run verify:pre-pr passed on full lane: lint/quality gates, typecheck, unit, build, perf-budget, and Playwright completed with 111 passed and 567 skipped locally; perf-budget trend recommended tightening one stretch target after consecutive green runs, but this PR holds performance budgets unchanged because the active scope is the admin Messages indicator and records the tighten decision as a follow-up prompt in the PR summary | next: commit, push, open PR, monitor CI, run npm run verify:pre-merge, then merge if green`
