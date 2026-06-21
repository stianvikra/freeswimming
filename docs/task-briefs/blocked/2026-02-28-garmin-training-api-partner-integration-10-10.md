# Task Brief: Garmin Training API Partner Integration (10/10)

## Metadata

- `id`: `2026-02-28-garmin-training-api-partner-integration-10-10`
- `status`: `blocked`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-06-21`
- `mode`: `blocked provider integration`

## Brief Audit Record

- `last_audited`: `2026-06-21`
- `base`: `main@de761db3`
- `audit_status`: `blocked`
- `decision`: Keep live Garmin Training API implementation blocked; use this brief as the send-to-Garmin provider boundary until partner/API prerequisites are concrete.
- `reason`: Official Garmin docs confirm Training API is the workout/training-plan publish path and Activity API is the received-activity path, but partner approval, credentials, swim mapping signoff, brand/attribution requirements, and provider test evidence are not available in the repo.
- `must_refresh_before_execution_if`: Refresh if Garmin official docs, Garmin partner approval, credentials, swim mapping capability, OAuth requirements, brand guidelines, provider payload samples, scorecard categories, verification lanes, or FreeSwimming workout/program/history contracts change.

## Goal

Integrate one-click `Send to Garmin` for workouts and training plans using Garmin Training API once partner access and operational prerequisites are approved, without treating send status as completion history.

## Pre-Implementation Owner Explanation

Codex skal ikke bygge Garmin-koblingen ennå. Først må Garmin-godkjenning, credentials, swim-step mapping, merke/attribution-regler og support/rollback være klare. Det betyr noe fordi sendt til Garmin bare betyr at vi har publisert en plan, ikke at økten er gjennomført. Utenfor scope mens briefen er blokkert er Garmin runtime-kode, Activity API-import, historikk-reconciliation, økonomi/adminrapportering, performance-ratchet og `Ja.docx`.

## Official Garmin Source Baseline

Checked on `2026-06-21`:

- Garmin Developers home: https://developer.garmin.com/
- Garmin Connect Developer Program overview: https://developer.garmin.com/gc-developer-program/overview/
- Garmin Training API: https://developer.garmin.com/gc-developer-program/training-api/
- Garmin Activity API: https://developer.garmin.com/gc-developer-program/activity-api/
- Garmin Program FAQ: https://developer.garmin.com/gc-developer-program/program-faq/
- Garmin API Brand Guidelines: https://developer.garmin.com/brand-guidelines/api-brand-guidelines/
- Garmin FIT SDK overview: https://developer.garmin.com/fit/overview/

Current interpretation:

- Training API publishes workouts and training plans to Garmin Connect for users to sync to compatible Garmin devices.
- Activity API provides detailed completed activity data after user consent and device sync.
- Garmin Connect Developer Program APIs use OAuth 2.0 and require business/partner approval.
- Garmin API brand guidelines include requirements for Garmin attribution on Garmin-sourced or Garmin-derived displays.
- FIT is the official activity/workout file format family that future ingestion/reconciliation must parse deliberately.

## Why Blocked

This work requires external prerequisites not guaranteed by code alone:

- Garmin partner/application approval.
- Production and preview credentials provisioned securely.
- Confirmed OAuth scope, consent, revocation, and token lifecycle.
- Confirmed Garmin branding/attribution requirements for title-level, secondary, exported, derived, and shared data displays.
- Confirmed swim workout and training-plan upload scope/limits.
- Signed-off swim step mapping matrix across Garmin-documented and observed swim concepts.
- Provider test environment or approved production-throttled evaluation path.
- Rollback/runbook approved by owner.

## Unblock Criteria

All of the following must be true:

1. Garmin partner status is approved for business use.
2. Production and preview credentials are available through secure env handling.
3. OAuth 2.0 connect/disconnect/revocation flow is approved.
4. Supported workout/program step-mapping matrix is signed off across Garmin-documented `WorkoutIntensity`, `time`, `distance`, `open`, `swim_stroke`, `SPORT_SWIMMING`, `SUB_SPORT_LAP_SWIMMING`, `SUB_SPORT_OPEN_WATER`, interval/rest structure, and the observed Garmin Connect UI swim concepts such as `Main`, lap-button, fixed-rest, send-off, CSS-based pacing, `Choice`, and `RIMO` workflows.
5. Garmin branding/attribution requirements are understood for Garmin-sourced and Garmin-derived data.
6. Queue/retry/idempotency and provider support diagnostics are approved.
7. Rollback/disable/token-revocation runbook is approved.

## Planned Scope After Unblock

- OAuth connect/disconnect flow with encrypted token storage.
- Owner-scoped provider connection state.
- Send workout and training-plan endpoints with queue/retry handling.
- Deterministic Garmin Training API adapter for supported FreeSwimming workouts/programs.
- Provider send job table with stable local job ID, provider aliases, payload snapshot/fingerprint, status, retries, and redacted provider error details.
- Sync status model such as `not_connected`, `ready`, `queued`, `sent`, `failed_retryable`, `failed_final`, and `needs_attention`.
- Deterministic failure UX and support/admin/audit visibility.
- Explicit guarantee that send status does not mark sessions complete or move them into training history.

## Explicit Non-Scope While Blocked

- Garmin Activity API completed-session ingestion.
- Matching sent Garmin workouts to received Garmin activities.
- Editing/reviewing provider-history reconciliation conflicts.
- Training-history `completed`/`cancelled`/`partial` correction workflows.
- Retrospective AI evaluation of completed sessions.
- Touching `Ja.docx`.

## Related Future Reconciliation Brief

Future Garmin received-activity matching and review is owned by:

- `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`

That brief depends on this send boundary but must remain separate because Activity API ingestion and review/edit semantics are different from Training API publish semantics.

## Data Placement And Sync Contract

- Server-canonical:
  - Garmin connection status,
  - encrypted tokens,
  - send job state,
  - payload snapshots/fingerprints,
  - provider aliases,
  - redacted audit history,
  - canonical workout/program/planned-instance references.
- Local-only:
  - transient connect/send/retry UI state,
  - temporary banners.
- Sync behavior:
  - Garmin provider state never overrides FreeSwimming canonical workout, program, planned-instance, or history identity;
  - send/retry status remains server-canonical;
  - failed provider sync must not mutate completion or workout structure state;
  - connect/disconnect/send/retry operations invalidate provider status and pending send views.
- Conflict policy:
  - duplicate send attempts use idempotency and existing send job state where possible;
  - provider rejection/failure stays provider state, not workout corruption;
  - incompatible workout mappings block with review state before send.
- Retention and sensitivity:
  - tokens are secret and encrypted;
  - raw provider payloads and errors are minimized/redacted;
  - Garmin-derived displays follow attribution/brand requirements.

## Identity And Rename Contract

- FreeSwimming workout/program/planned-instance IDs remain the canonical local source of truth.
- Garmin provider workout IDs, calendar IDs, and send job IDs are foreign aliases only.
- Garmin-facing titles may be user-friendly presentation strings but cannot replace canonical IDs.
- Renaming a workout in FreeSwimming must not create a new local canonical entity.
- Re-sending after material workout changes requires an explicit policy: update existing provider target, create new provider target, or mark old provider send as superseded.
- Provider ID drift, duplicate sends, stale payload fingerprints, and unsupported mapping states must be measurable and repairable.

## Forward Compatibility Contract

- Extensibility surfaces:
  - provider connection statuses,
  - send job statuses,
  - Garmin workout step mappings,
  - sport/sub-sport values,
  - export formats,
  - attribution surfaces,
  - analytics events,
  - support diagnostics,
  - locales.
- Source of truth:
  - workout/program structure derives from canonical FreeSwimming models;
  - send state derives from provider send jobs;
  - completion history derives from training-history rows, not send jobs.
- Additive behavior:
  - new compatible workouts/programs can be sent through the same provider adapter once mapping says `ready`;
  - new unsupported step values block with mapping-review copy until explicitly mapped.
- Explicit mapping requirements:
  - new Garmin statuses, source kinds, device capabilities, step types, attribution rules, or API payload fields require typed mapping, tests, docs, and support copy.
- Unknown/deprecated values:
  - fail closed to `needs_attention`/mapping review and do not mark completion.
- Test/evidence:
  - provider adapter fixtures, malformed response tests, retry/idempotency tests, and support diagnostics before unblock implementation can merge.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim after unblock:

- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                       | Evidence                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Connect, send, retry, and needs-attention flow is understandable in minimal steps after unblock.                                     | post-unblock UX flow spec + tests     | `5/5`                   |
| UX flow clarity                               | `target`     | Provider states have clear next actions and no dead ends.                                                                            | staged e2e + manual QA                | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: detailed visual polish belongs to post-unblock UI implementation.                                                   | screenshot handoff in child PR        | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Provider send status and external aliases never corrupt canonical local identity or completion history.                              | adapter/integration tests             | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin diagnostics are secondary to safe owner-scoped connect/send.                                                  | scope rationale                       | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Connect/send/retry controls are keyboard and screen-reader usable when implemented.                                                  | a11y tests                            | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Provider UI avoids route bloat and send jobs avoid blocking user-facing requests.                                                    | perf/job review                       | `5/5`                   |
| Data placement and sync boundaries            | `target`     | FreeSwimming canonical workout/planned/history state vs Garmin provider state ownership is explicit and tested.                      | data contract + tests                 | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Connect/send/retry changes invalidate provider status and pending send views predictably.                                            | cache/invalidation tests              | `5/5`                   |
| Reliability and failure handling              | `target`     | Retry, provider rejection, rate limit, auth failure, stale payload, and mapping review paths avoid silent failure.                   | failure-path tests                    | `5/5`                   |
| Security and authz                            | `target`     | Token handling, route authz, least-privilege scopes, and send endpoints fail closed.                                                 | security review + negative-path tests | `5/5`                   |
| Privacy and compliance                        | `target`     | Consent, token scope, stored provider metadata, attribution, and redaction rules are explicit.                                       | legal/security checklist              | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: workout/program governance is upstream, but provider mapping must honor it.                                         | linked brief review                   | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: admin audit/visibility requirements are part of post-unblock implementation.                                        | support/admin scope rationale         | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because provider integration is authenticated/private and not a public crawl surface.                                            | private-route rationale               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because Garmin send state is private provider data and not public AI-discoverable content.                                       | private-data rationale                | `N/A`                   |
| Analytics and KPI observability               | `target`     | Send/connect/retry/failure metrics use stable taxonomy and no completion KPI.                                                        | event tests                           | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: no direct billing change, though feature value may affect packaging later.                                          | scope rationale                       | `4/5`                   |
| Incident response and support operations      | `target`     | Runbook, escalation path, redacted diagnostics, and provider-failure repair actions are defined before activation.                   | runbook + support tests               | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this integration does not change revenue, invoices, refunds, payouts, entitlement reporting, or accounting data.         | explicit finance non-scope rationale  | `N/A`                   |
| i18n operational readiness                    | `target`     | Provider status/attribution/error copy avoids identity coupling and tolerates locale expansion.                                      | copy review + responsive tests        | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Prefer official Garmin docs, existing auth/job patterns, minimal dependencies, and provider adapter isolation.                       | architecture review                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Integration stubs, adapter fixtures, happy/failure paths, authz, idempotency, CI, and `verify:pre-merge` are mandatory post-unblock. | validation outputs                    | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Queue/retry behavior avoids runaway provider calls and respects throttling/rate limits.                                              | job/rate-limit tests                  | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Safe disable, token revocation, payload rollback, and provider-support procedures are approved before launch.                        | rollback/runbook checklist            | `5/5`                   |

## Risks

- Partner/API approval may not cover required swim workout/training-plan capabilities.
- Swim-workout capability mismatch between Garmin docs and Garmin Connect UI concepts.
- Branding/attribution requirements may affect UI/export surfaces.
- Rate limits, throttling, and retry behavior may constrain user experience.
- Consent/compliance gaps if token scope or provider metadata storage is too broad.

## Validation (post-unblock)

- Official Garmin docs and partner requirements refreshed.
- Provider adapter fixtures for supported swim mappings.
- Integration tests with Garmin adapter stubs.
- Authz/token negative-path tests.
- `npm run verify:pre-pr`
- GitHub CI required checks.
- staged end-to-end send test in approved environment.
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-03-20 | planning | tightened this blocked brief around Garmin Training API send-to-calendar/device delivery for workouts and programs, and explicitly separated later completed-session/history ingestion into a different history track that can depend on Garmin Activity API | next: keep this brief blocked until partner approval, auth setup, and mapping matrix signoff are concrete`
- `2026-03-22 | planning | tightened the unblock contract after reviewing Garmin swim-builder patterns so partner signoff must explicitly cover Garmin-documented `WorkoutIntensity`, `time`, `distance`, `open`, `swim_stroke`, swim sport/sub-sport, interval/rest structure, and Garmin Connect UI swim concepts like `Main`, lap-button, fixed-rest, send-off, `Choice`, and `RIMO` workflows before live send work starts | next: do not unblock provider delivery on generic Garmin-ready language alone; require a concrete step-mapping matrix`
- `2026-06-21 | audit-refresh | refreshed on main@de761db3 with official Garmin Developer Program, Training API, Activity API, FAQ, Brand Guidelines, and FIT SDK source baseline; kept live send integration blocked and separated future Activity API received-history reconciliation into docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md | next: execute Calendar Child D manual completion only after owner asks for runtime implementation`
