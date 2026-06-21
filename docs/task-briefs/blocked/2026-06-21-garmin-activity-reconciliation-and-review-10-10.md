# Task Brief: Garmin Activity Reconciliation And Review (10/10)

## Metadata

- `id`: `2026-06-21-garmin-activity-reconciliation-and-review-10-10`
- `status`: `blocked`
- `owner`: `stianvikra`
- `created`: `2026-06-21`
- `updated`: `2026-06-21`
- `mode`: `blocked provider reconciliation child`
- `depends_on`:
  - `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
  - `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`
  - `docs/task-briefs/done/2026-06-20-my-library-calendar-completion-events-manual-mark-done-10-10.md`
  - `docs/task-briefs/planned/2026-06-21-training-history-actuals-corrections-plan-vs-actual-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-21`
- `base`: `main@ffd36d9e`
- `audit_status`: `blocked`
- `decision`: Keep Garmin received-activity reconciliation blocked until Garmin partner/API access, provider payload examples, and local training-history foundations exist.
- `reason`: Official Garmin docs confirm Activity API can provide detailed activity data, but FreeSwimming does not yet have Garmin send jobs, credentials, consent flow, provider samples, confirmed provider correlation behavior, or local actual-history correction semantics beyond basic manual completion.
- `must_refresh_before_execution_if`: Refresh if Garmin official docs, Activity API payloads, FIT parsing requirements, brand/attribution rules, Garmin partner status, training-history schema, send-job schema, Calendar completion behavior, scorecard categories, or support/Help contracts change.

## Goal

Reconcile received Garmin Activity API swim history against FreeSwimming planned/manual/sent workouts so users can review, correct, and trust plan-vs-actual truth without silent overwrites.

## Pre-Implementation Owner Explanation

Codex skal senere sammenligne det vi planla og eventuelt sendte til Garmin med det Garmin faktisk sender tilbake som gjennomført aktivitet. Det betyr noe fordi en sendt økt ikke alltid blir svømt akkurat som planlagt, og systemet må tåle avvik uten å telle feil. Utenfor scope mens briefen er blokkert er runtime-kode, Garmin credentials, provider-import, UI-bygging, økonomi/adminrapportering, performance-ratchet og `Ja.docx`.

## Official Garmin Source Baseline

Checked on `2026-06-21`:

- Garmin Connect Developer Program overview: https://developer.garmin.com/gc-developer-program/overview/
- Garmin Activity API: https://developer.garmin.com/gc-developer-program/activity-api/
- Garmin Training API: https://developer.garmin.com/gc-developer-program/training-api/
- Garmin Program FAQ: https://developer.garmin.com/gc-developer-program/program-faq/
- Garmin API Brand Guidelines: https://developer.garmin.com/brand-guidelines/api-brand-guidelines/
- Garmin FIT SDK overview: https://developer.garmin.com/fit/overview/

Current interpretation:

- Training API is the send/publish side for workouts and training plans.
- Activity API is the receive side for completed activities after user consent and device sync.
- Activity files such as FIT can provide detailed evidence, but exact available fields must be verified with provider samples before runtime matching.
- Garmin-sourced or Garmin-derived displays may require attribution/branding.

## Why Blocked

This work is blocked until all are true:

- Garmin partner/API access and credentials are available.
- Activity API sample payloads and FIT files for swim activities are available.
- FreeSwimming has canonical completed-history storage.
- FreeSwimming has local actual-history correction semantics for performed sessions that differ from the plan.
- FreeSwimming has Garmin send-job/provider alias storage, or this brief is explicitly reduced to import-only matching.
- Provider alias/correlation behavior is confirmed, including whether Garmin returns client/local references or only provider IDs.
- Matching thresholds are signed off by owner.
- Review/edit UX is approved with support-safe language.
- Attribution/branding requirements are confirmed for Garmin-sourced and derived data.

## Scope After Unblock

- Ingest owner-consented Garmin swim activities into provider-evidence tables.
- Store provider activity aliases, timestamps, sport/sub-sport, distance/duration, file references, and redacted provider metadata.
- Match received Garmin activities against:
  - manual completed history,
  - corrected actual-history rows,
  - planned workout instances,
  - future Garmin send jobs,
  - canonical workouts/program context.
- Compare sent-vs-received evidence where available:
  - planned date vs actual date/time,
  - intended workout ID/payload fingerprint/local correlation values where available vs received activity,
  - sport/sub-sport,
  - pool/open-water context,
  - distance/duration,
  - mapped lap/step/FIT evidence when supported.
- Produce deterministic reconciliation states:
  - `matched`,
  - `candidate_match`,
  - `needs_review`,
  - `duplicate_provider_activity`,
  - `provider_only`,
  - `manual_conflict`,
  - `ignored`.
- Add review/edit affordances that let users confirm, detach, ignore, or correct reconciliation state without mutating raw provider evidence.
- Show planned version, sent payload summary, received Garmin evidence, and canonical actual-history version as separate facts when a match is uncertain or conflicting.
- Add support diagnostics for mismatch, duplicate, missing provider reference, malformed payload, stale send snapshot, and attribution state.

## Out Of Scope

- Building Garmin Training API send itself.
- Treating send status as completion.
- Silent overwrite of manual history.
- Silent conversion of a planned workout into Garmin's received interpretation when stroke, distance, duration, or completion differs.
- Full biometric/health analytics.
- AI retrospective evaluation or adaptive replanning.
- Finance/admin reporting.
- Public SEO/AI-discoverable pages.
- Touching `Ja.docx`.

## Data Placement And Sync Contract

- Server-canonical:
  - provider connection reference,
  - provider activity ID/alias,
  - provider source kind,
  - redacted activity metadata,
  - raw file reference where needed,
  - reconciliation state,
  - candidate match references,
  - review decisions,
  - canonical history entry reference when confirmed.
- Local-only:
  - review filters,
  - open compare panel state,
  - unsaved review notes.
- Sync behavior:
  - provider import is idempotent by provider activity alias and user;
  - provider evidence is append/update-safe and never silently deletes manual history;
  - confirmed reconciliation links provider evidence to canonical history;
  - correcting the canonical actual history uses the training-history correction contract, not raw provider evidence mutation;
  - detach/ignore changes review state, not raw provider facts.
- Conflict policy:
  - ambiguous or conflicting matches enter `needs_review`;
  - provider/manual disagreement over stroke, distance, duration, actual date, or partial completion must stay reviewable;
  - duplicate provider activities are isolated from completion counts;
  - malformed or unsupported provider payloads fail closed with support diagnostics.
- Retention and sensitivity:
  - raw provider files and derived data are private and minimized;
  - logs/events must redact sensitive provider payloads;
  - Garmin attribution/brand rules apply where Garmin-sourced/derived data is visible.

## Identity And Rename Contract

- FreeSwimming history entry IDs remain canonical actual-outcome IDs.
- Garmin activity IDs are provider aliases only.
- Garmin send job IDs are provider delivery aliases only.
- Planned instance IDs identify intended occurrences only.
- Local actual-history IDs identify the user-approved actual outcome.
- Human titles/labels can change and cannot be used as match identity.
- Reconciliation may link, detach, or review relationships between canonical IDs and provider aliases, but must not repurpose raw provider evidence.
- Duplicate provider aliases, stale send payloads, orphan evidence, and unknown source kinds must be detectable and repairable.

## Forward Compatibility Contract

- Extensibility surfaces:
  - providers,
  - provider activity file types,
  - sport/sub-sport mappings,
  - match signals,
  - reconciliation states,
  - review actions,
  - attribution surfaces,
  - analytics event values,
  - locales.
- Source of truth:
  - planned truth derives from `planned_workout_instances`;
  - sent truth derives from Garmin send jobs;
  - received provider evidence derives from Activity API import tables;
  - actual outcome truth derives from training-history rows.
- Additive behavior:
  - new provider activities import as provider evidence when source kind is supported;
  - unknown activity types stay unmapped and excluded from swim completion counts.
- Explicit mapping requirements:
  - new providers, file types, match signals, reconciliation states, review actions, or attribution requirements need typed mapping, tests, support docs, and owner signoff.
- Unknown/deprecated values:
  - fail closed to `needs_review`/unmapped and do not count as completed.
- Test/evidence:
  - provider sample fixtures, unknown-value tests, replay/idempotency tests, duplicate tests, malformed file tests, and support-surface sweep.

## Plan / Sent / Received / Actual Review Model

Future runtime UI must make these four facts explicit:

- `Planned`: what FreeSwimming intended, keyed by `planned_workout_instances.id`.
- `Sent`: what FreeSwimming attempted to publish to Garmin, keyed by local send job ID and payload fingerprint.
- `Received`: what Garmin reports from the device, keyed by provider activity alias and raw/FIT evidence reference.
- `Actual`: what FreeSwimming counts after manual entry or user/provider review, keyed by actual-history ID.

If Garmin reports a wrong interpreted stroke, shorter session, stopped activity, changed distance, duplicate device upload, or ambiguous date/time, the system must show a review state. The user can confirm, detach, ignore, or correct actual history, but the raw received evidence and original plan stay available for audit/support.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim after unblock:

- Product goals and IA
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                        | Evidence                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Users can distinguish planned, sent, received, matched, and review-needed states without ambiguity.                                   | UX flow + route/state tests          | `5/5`                   |
| UX flow clarity                               | `target`     | Confirm, detach, ignore, and correct review actions have clear next steps and no dead ends.                                           | e2e + copy review                    | `5/5`                   |
| Visual design quality                         | `target`     | Compare/review UI is readable on mobile/desktop and avoids dense provider-data overload.                                              | screenshot handoff                   | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Provider imports are idempotent, matches are deterministic, and conflicts never silently overwrite manual/canonical history.          | adapter/invariant tests              | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: primary workflow is end-user review; admin/support diagnostics are secondary.                                        | scope rationale                      | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Review tables/cards/actions are keyboard and screen-reader usable.                                                                    | a11y tests                           | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Provider import/review reads are window-bounded and avoid large raw-file payloads in UI.                                              | query/payload tests                  | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Planned, sent, received provider evidence, reconciliation, and history truth stay separate.                                           | data contract + tests                | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Import/review decisions refresh history, Calendar, and reconciliation views predictably.                                              | invalidation tests                   | `5/5`                   |
| Reliability and failure handling              | `target`     | Replay, duplicate, malformed payload, missing send snapshot, provider auth failure, and ambiguous match paths fail closed.            | negative-path tests                  | `5/5`                   |
| Security and authz                            | `target`     | Provider import/review routes are owner-scoped, token-safe, and reject malformed/cross-user payloads.                                 | authz/security tests                 | `5/5`                   |
| Privacy and compliance                        | `target`     | Garmin activity data, files, derived summaries, and logs are minimized, private, consent-aware, and attribution-compliant.            | privacy/legal/log review             | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: workout/program content ownership is upstream; reconciliation preserves references.                                  | linked brief review                  | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: support/admin repair visibility is required, but no admin CRUD editor is primary.                                    | support diagnostics                  | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because Garmin reconciliation is private authenticated data and no public crawl surface changes.                                  | private-route rationale              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because Garmin activity/reconciliation data is private and not public AI-discoverable content.                                    | private-data rationale               | `N/A`                   |
| Analytics and KPI observability               | `target`     | Import, match, review, conflict, detach, and ignore events use stable safe taxonomy.                                                  | event tests                          | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: reconciliation has no checkout, billing, or entitlement mutation.                                                    | scope rationale                      | `4/5`                   |
| Incident response and support operations      | `target`     | Support can diagnose provider auth, replay, duplicate, mismatch, malformed file, attribution, and review states.                      | runbook + diagnostics                | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this brief does not change revenue, invoices, refunds, payouts, entitlement reporting, or accounting data.                | explicit finance non-scope rationale | `N/A`                   |
| i18n operational readiness                    | `target`     | Reconciliation state/review/action labels avoid identity coupling and tolerate translation expansion.                                 | copy/responsive tests                | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use official Garmin docs/FIT tooling, isolated provider adapters, existing Supabase/RLS/job patterns, and minimal dependencies.       | architecture review                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Include provider fixtures, adapter tests, authz, idempotency, malformed payloads, component/e2e, screenshot, CI, and pre-merge gates. | validation outputs                   | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Import/reconciliation jobs are idempotent, bounded, rate-limit aware, and do not repeatedly parse large files unnecessarily.          | job/cost tests                       | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Provider import can be disabled, replayed safely, rolled back, and repaired without deleting user history.                            | rollback/runbook checklist           | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - use a dedicated review surface or history detail, not overloaded month cells;
  - keep Calendar summary read-only unless review action is explicitly in selected-day detail.
- TypeScript/domain:
  - typed provider adapters, reconciliation state machine, and unknown-value fail-closed paths.
- Supabase:
  - provider evidence, reconciliation links, review decisions, and history references need explicit migrations, indexes, RLS, and generated types.
- External services:
  - re-check Garmin official docs and partner requirements before runtime;
  - use OAuth least privilege, token encryption, idempotency, replay protection, attribution compliance, and redacted diagnostics.
- Testing:
  - use provider sample fixtures and malformed/duplicate/replay tests before any live provider call.

## Help/Guide And Support-Surface Impact

- This future slice changes user recovery and support behavior, so Help/Guide/runbook impact is required.
- Route-label/support-surface sweep must include Calendar, History, Garmin, provider review labels, support runbooks, and analytics taxonomy.

## Acceptance Criteria

- The brief captures the future Garmin sent-vs-received reconciliation scope separately from manual completion and send-to-Garmin.
- Runtime implementation stays blocked until Garmin partner/API facts and local history foundations exist.
- Planned, sent, received, reconciled, reviewed, and actual outcome identities stay separate.
- The brief explicitly covers mismatched Garmin returns such as wrong stroke, partial session, stopped workout, and different distance/duration as review states.
- Unknown or conflicting provider states fail closed to review and never count as completed automatically.

## Validation

- For this docs-only brief:
  - `npm run lint:briefs`
- Future implementation:
  - provider fixture tests,
  - FIT/parser tests where applicable,
  - route/action/authz tests,
  - reconciliation invariant tests,
  - component/e2e/screenshot handoff,
  - `npm run verify:pre-pr`,
  - GitHub CI,
  - `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-06-21 | blocked | created during Calendar completion/Garmin audit after owner asked to keep future Garmin send, received history, sent-vs-received comparison, and review/edit workflow at 10/10 | next: keep blocked until Garmin partner/API access, provider payload samples, local manual completion history, and provider send-job contract exist`
- `2026-06-21 | systemic-actuals-audit | refreshed on main@ffd36d9e after owner asked how returned Garmin activities should match planned/sent workouts and how mismatches should be corrected; added local actual-correction dependency, provider correlation/fingerprint requirements, four-fact review model, and explicit no-silent-overwrite policy for wrong stroke, stopped/partial activity, or distance/duration mismatch | next: keep blocked until Garmin partner/API access, provider payload samples, provider alias/correlation behavior, local actual corrections, and send-job contract exist`
