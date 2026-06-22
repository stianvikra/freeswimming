# Task Brief: Provider Evidence Boundary And Reconciliation Intake V1 (10/10)

## Metadata

- `id`: `2026-06-22-provider-evidence-boundary-and-reconciliation-intake-v1-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-22`
- `updated`: `2026-06-22`
- `mode`: `docs/schema intake / plan only`
- `parent`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `related_blocked_briefs`:
  - `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`
  - `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-22`
- `base`: `main@84222be4`
- `audit_status`: `ready`
- `decision`: Use this as the next bounded docs/schema-intake slice before any provider runtime, Garmin import, OAuth, FIT parsing, or reconciliation matching work.
- `reason`: Review Actual Editor V1 is merged and manual actual truth is now editable, but the app still has no provider-evidence storage, provider connection contract, secret/config family, export/privacy deletion contract, or external-service matrix row for Garmin-style activity evidence.
- `must_refresh_before_execution_if`: Refresh if Garmin official docs, OAuth/security guidance, Supabase RLS guidance, `completed_activity_events`, `planned_workout_instances`, Review Actual, Calendar Plan, Calendar Comparison/Stats, export/privacy deletion, route registry, Help/Guide/support docs, scorecard categories, or verification lanes change.

## Goal

Create the canonical provider-evidence boundary for future received activity integrations so Garmin/Strava/Apple Health/Health Connect-style evidence can be stored, reviewed, exported/deleted, and later reconciled without overwriting manual actual history or planned workout truth.

## Pre-Implementation Owner Explanation

Codex skal lage en trygg kontrakt for hvordan fremtidige provider-data skal skilles fra det brukeren selv har registrert som faktisk utført trening. Det betyr noe fordi Garmin eller andre kilder kan sende tilbake avvik, dubletter eller ufullstendige aktiviteter, og appen må kunne vise dette som evidence/review uten å telle feil. Utenfor scope er live Garmin-import, OAuth, credentials, FIT-parsing, automatisk matching, UI-bygging, Perfect Day, performance-ratchet og `Ja.docx`.

## Current App Baseline

- `completed_activity_events` is manual actual history only. The DB constraint and TypeScript source-kind union currently allow only `manual`.
- `Review actual` edits only owner-scoped manual actual rows and fails closed for provider-like rows or unmapped outcomes.
- Calendar Plan renders unknown/duplicate/non-manual completion rows as review states and does not treat them as completed history.
- `docs/api-contracts.md` explicitly states that Garmin send/import/reconciliation must not write through the manual completion route.
- The Garmin Activity reconciliation brief remains blocked until partner/API access, payload/FIT samples, alias/correlation behavior, and attribution requirements are confirmed.
- External service and secret/config docs do not yet define Garmin/provider activity connection families.
- Account export currently includes workouts, dryland, habits, goals, training context, and commerce/support data, but not provider-evidence tables because those tables do not exist yet.

## Official Source Baseline

Checked on `2026-06-22`:

- Garmin Activity API: https://developer.garmin.com/gc-developer-program/activity-api/
  - Activity API is the received-activity side. It includes swimming, supports detailed activity data, can expose FIT/GPX/TCX activity files, and depends on user consent plus device sync.
- Garmin Training API: https://developer.garmin.com/gc-developer-program/training-api/
  - Training API is the send/publish side for workouts and training plans to Garmin Connect calendar/device sync. Send state is not completion truth.
- Garmin Program FAQ: https://developer.garmin.com/gc-developer-program/program-faq/
  - Garmin Connect Developer Program is business/enterprise oriented, uses OAuth 2.0, and requires approval.
- Garmin API Brand Guidelines: https://developer.garmin.com/brand-guidelines/api-brand-guidelines/
  - Garmin-sourced and Garmin-derived title, secondary, exported, derived, and social displays have attribution requirements.
- Garmin FIT SDK: https://developer.garmin.com/fit/overview/
  - FIT is the detailed file format path and must be handled through an explicit parser/file-evidence contract later.
- OAuth 2.0 Security Best Current Practice (RFC 9700): https://www.rfc-editor.org/rfc/rfc9700.html
  - Future OAuth work must use exact redirect/origin matching, CSRF protection, PKCE where applicable, and secure refresh-token handling.
- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
  - New provider tables must enable RLS, use authenticated owner-scoped policies, index policy columns, and still filter queries by `user_id`.
- Strava Webhook Events API: https://developers.strava.com/docs/webhooks/
  - Webhook events are update signals, not complete truth; apps may need to fetch current data after a create/update/delete/access-revoked signal and must respect privacy.
- Android Health Connect: https://developer.android.com/health-and-fitness/health-connect
  - Health data requires user permission, has data sync semantics, and includes data display/attribution guidance; this supports a generic provider-evidence boundary rather than Garmin-only storage.

## Best-Practice Interpretation

- Provider evidence must be a separate server-canonical object, not a new `source_kind` written into `completed_activity_events`.
- `completed_activity_events` remains the user-approved actual history row. Provider evidence can link to it only through a later reconciliation decision.
- Provider import must be idempotent by `(user_id, provider_key, provider_activity_id)` or equivalent provider alias.
- Provider events/webhooks are signals. The app must record fetch/import status, replay decisions, and malformed payload states separately from raw evidence and actual history.
- Raw provider files must be private, minimized, redacted from logs/events, and either stored behind a documented storage boundary or deferred until file retention/deletion is designed.
- Future OAuth must use server-only secrets, exact callback/origin validation, CSRF/PKCE/state protection, token encryption/rotation/revocation handling, and support-visible disconnect states.
- Garmin attribution/branding rules must be confirmed before any Garmin-sourced or Garmin-derived data appears in UI, exports, support artifacts, or screenshots.
- Unknown providers, activity types, file types, sport/sub-sport values, sync statuses, and reconciliation actions must fail closed to `unmapped`/`needs_review` and stay out of completion counts.

## Scope

This docs/schema-intake slice owns:

- A planned contract for future provider-evidence tables and boundaries.
- App impact sweep for affected routes, docs, support, export/privacy, analytics, and future migrations.
- Required updates for later runtime briefs:
  - external service matrix row,
  - secret/config inventory row,
  - route registry entries,
  - API contracts,
  - Help/Guide/support runbooks,
  - account export/privacy deletion behavior,
  - migration/RLS/index/generated-type plan,
  - negative-path test matrix.
- The decision that first provider runtime work must either:
  - stay import-only and not require Garmin send jobs, or
  - include send-job/provider-alias storage before sent-vs-received matching.

This slice may update docs only. It must not create provider tables, routes, jobs, UI, tokens, config, package dependencies, or real provider calls.

## Out Of Scope

- Garmin OAuth, credentials, token storage, revocation, webhooks, API calls, or partner setup.
- Live Activity API ingestion, FIT/GPX/TCX parsing, storage buckets, or raw provider file uploads.
- Garmin Training API send jobs or provider publish workflow.
- Automatic matching, confidence scoring, Stats Swimming aggregation, or AI retrospective evaluation.
- Review/reconciliation UI, screenshots, or user-facing copy changes.
- Perfect Day product decision or Calendar Perfect Day layer.
- Performance-ratchet tightening.
- Touching `Ja.docx`.

## App Impact Sweep

Future provider runtime can affect these surfaces and must be explicitly mapped before implementation:

| Surface                                                              | Current State                                  | Future Impact / Required Handling                                                                                                  |
| -------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `completed_activity_events`                                          | Manual actual truth only.                      | Do not store provider evidence here. Link only after explicit reconciliation.                                                      |
| `/api/my-library/calendar/planned-instances/[instanceId]/completion` | Manual mark-done/correction route.             | Must continue rejecting provider source rows and must not mutate provider evidence.                                                |
| `/my-library/calendar` Plan                                          | Shows planned rows and manual actual overview. | Provider evidence may add review indicators only after a review contract; month cells must not become import UI.                   |
| `/my-library/calendar/actuals/[instanceId]`                          | Manual actual editor.                          | Provider-backed rows stay support/review-only until a dedicated reconciliation surface exists.                                     |
| Calendar Comparison/Stats                                            | Swimming intentionally unmapped.               | Provider evidence must not count as Swimming until canonical actual-history mapping is approved.                                   |
| Account export / deletion                                            | No provider evidence exists.                   | Future provider evidence, files, aliases, and review decisions need export/delete/redaction rules or explicit retention rationale. |
| External service matrix                                              | No Garmin/provider row.                        | Runtime provider work must add service key, docs baseline, idempotency/retry, diagnostics, disable/rollback, and support impact.   |
| Secret/config inventory                                              | No Garmin/OAuth family.                        | Runtime OAuth must add server-only secret/config family and non-secret evidence rules.                                             |
| Route registry                                                       | No provider activity routes.                   | Future provider routes need auth/cache/error contract and negative-path tests.                                                     |
| Help/Guide/support                                                   | Manual actual support docs exist.              | Provider mismatch, disconnect, duplicate, malformed payload, attribution, and backfill states need support copy before UI/runtime. |
| Analytics                                                            | No provider reconciliation events.             | Future events must be safe aggregate/support taxonomy only, with no raw provider payloads or tokens.                               |

## Skill / Capability Radar

- Available now: local shell, repo brief linting, official-provider browsing, current `playwright` skill if a later UI/screenshot slice needs it, Stripe plugin unrelated to this provider slice.
- Evaluate later: security-specific Codex skills only if owner asks for a dedicated OAuth/AppSec review; no install/config changes in this slice.
- Install/config changes: none. Repo docs must not depend on local Codex skills/plugins/MCP state.

Systemic findings:

| Surface                 | Finding                                                                                            | Severity | Recommended Type                                            | Owner Decision Needed                     | Follow-Up Brief Path                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Provider data model     | Runtime reconciliation needs provider-evidence tables separate from manual actual history.         | `high`   | `bounded implementation child`                              | no for contract; yes before runtime scope | `docs/task-briefs/planned/2026-06-22-provider-evidence-boundary-and-reconciliation-intake-v1-10-10.md` |
| Provider security/ops   | OAuth/secrets/service-matrix/export/privacy are not yet modeled for Garmin/provider activity data. | `high`   | `safe process/docs update` now; later bounded runtime child | yes before OAuth/runtime                  | Future provider connection/runtime brief                                                               |
| Product matching policy | Sent-vs-received matching depends on Garmin alias/correlation facts or an import-only reduction.   | `high`   | `deferred architecture decision`                            | yes                                       | Existing blocked Garmin briefs                                                                         |

Return path:

- Parent: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Last merged workstream: PR `#1203` (`1b0f9e83`) and closeout PR `#1204` (`84222be4`).
- Current slice: docs/schema-intake only.
- Next product step after schema foundation PR `#1206` and closeout PR `#1207`: choose the bounded `manual_fixture` provider evidence import proof, Garmin partner/API unblock, or keep real provider runtime blocked.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this docs/schema-intake slice:

- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                              | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Provider evidence, manual actual, planned, sent, received, and reconciled facts are named separately with no runtime import implied.                                        | brief scope + app impact sweep            | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: future user review flow states are named, but no UI is changed in this docs-only slice.                                                                    | scope rationale + future UI boundary      | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no UI, layout, print, export rendering, or brand asset.                                                                                      | explicit visual non-scope rationale       | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Contract prevents provider evidence from overwriting manual actual history, planned rows, source workouts, or send jobs; unknown values fail closed.                        | data contract + acceptance criteria       | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice does not change admin edit/publish flows or admin CRUD UI.                                                                                           | explicit admin-editor non-scope rationale | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI or interaction semantics change.                                                                                                                 | explicit a11y non-scope rationale         | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: future provider reads/jobs must be bounded and avoid raw file payloads in UI; no route budget changes now.                                                 | stack gate + future acceptance criteria   | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical provider evidence, manual actual history, planned rows, send jobs, local review state, raw files, and export/privacy boundaries are explicit.              | Data Placement section                    | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: future import/review invalidation targets are documented; no cache behavior changes now.                                                                   | Data Placement section                    | `4/5`                   |
| Reliability and failure handling              | `target`     | Duplicate, replay, malformed payload, revoked access, missing alias, unknown provider, and ambiguous match states fail closed to review/support.                            | failure matrix + support impact           | `5/5`                   |
| Security and authz                            | `target`     | Future routes/tables require owner scope, RLS, exact redirect/origin validation, CSRF/PKCE/state, server-only secrets, and negative-path tests.                             | official-source baseline + stack gate     | `5/5`                   |
| Privacy and compliance                        | `target`     | Provider payloads/files/tokens are minimized, private, consent-aware, redacted from logs/events, and subject to export/delete/retention rules.                              | privacy contract + source baseline        | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: workout/program content remains upstream; provider evidence preserves references and does not rewrite content.                                             | identity contract                         | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: support/admin diagnostics are required later; no admin workflow is built now.                                                                              | support impact section                    | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because provider activity data is private authenticated data and no public route, metadata, sitemap, or robots behavior changes.                                        | private-data rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because provider activity/reconciliation data is private and not public AI-discoverable content.                                                                        | private-data rationale                    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: future provider events must use safe taxonomy and no raw payloads; no event emitted now.                                                                   | analytics boundary                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no checkout, pricing, entitlement grant, billing portal, revenue, refund, payout, or commerce workflow.                                      | explicit commerce non-scope rationale     | `N/A`                   |
| Incident response and support operations      | `target`     | Future provider runtime must define support-visible states for disconnect, replay, duplicate, mismatch, malformed file, attribution, backfill, and rollback/disable.        | support impact + acceptance criteria      | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this slice changes no revenue, invoice, refund, payout, entitlement reporting, accounting export, finance reconciliation, or finance truth.       | explicit finance non-scope rationale      | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: provider/status/action labels must be display text separate from stable machine IDs; no locale system changes now.                                         | forward compatibility contract            | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Uses existing Next.js/TypeScript/Supabase/docs patterns, official provider docs, no new dependency, and records external-service/secret-matrix requirements before runtime. | stack gate + changed-files review         | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed brief passes brief lint/docs validation; future runtime requires provider fixtures, RLS/authz, idempotency/replay, malformed payload, and support-surface tests.    | validation section                        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: future import/backfill must be bounded, idempotent, rate-limit aware, and avoid repeated raw file parsing; no runtime cost now.                            | stack gate                                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Provider runtime remains blocked until disable/rollback/replay/repair/export/delete paths are documented; this docs-only diff is revertable.                                | acceptance criteria + PR validation       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no UI or route implementation in this slice;
  - future reconciliation UI should use Calendar selected-day/detail or a dedicated history/reconciliation route, not month-cell editing;
  - future route handlers must be private/no-store and owner scoped.
- TypeScript/domain:
  - define typed provider keys, provider activity statuses, file kinds, reconciliation states, review actions, and unknown-value fallbacks before runtime;
  - use discriminated unions and typed adapters per provider;
  - never treat provider labels/titles as identity.
- Supabase:
  - future tables need explicit migrations, RLS enabled before exposure, `to authenticated` policies, `(select auth.uid()) = user_id`, indexes on `user_id`, provider alias, candidate match keys, and created/synced timestamps;
  - generated DB types and negative-path tests are required with any schema implementation.
- External services:
  - add provider rows to `docs/architecture/external-service-contract-matrix.md`;
  - add secret/config families to `docs/architecture/secret-config-inventory.md`;
  - use official docs, least privilege, exact redirect/origin validation, CSRF/PKCE/state, token encryption/rotation/revocation, retry/backoff, idempotency, attribution, redacted diagnostics, and disable/rollback.
- UI system:
  - no visual work in this slice;
  - future review UI must provide screenshot handoff and show planned, sent, received, reconciled, and actual facts separately.
- Testing:
  - current docs-only slice: brief lint/docs-only verification;
  - future runtime: provider fixture tests, malformed/unknown tests, duplicate/replay/idempotency tests, RLS/authz negative tests, route registry tests, export/privacy tests, support copy tests, and screenshot/e2e if UI changes.

## Domain Granularity Gate

- User's mental object:
  - a received provider activity and its relationship to the planned swim, sent payload, manual actual, and user-approved actual history.
- Canonical objects:
  - planned occurrence: `planned_workout_instances.id`;
  - manual actual history: `completed_activity_events.id`;
  - source workout/program: `workouts.id` / `programs.id`;
  - future provider connection: stable internal provider connection ID;
  - future provider activity evidence: stable internal provider evidence ID plus provider activity alias;
  - future reconciliation decision: stable internal reconciliation/review ID.
- Child object levels:
  - provider connection status: `view/support-only` in future, docs-only now;
  - provider activity summary: `view/support-only` in future, docs-only now;
  - raw provider file reference: `support-only` in future, docs-only now;
  - lap/step/FIT evidence: `view/reconcile` only after sample-backed mapping; docs-only now;
  - candidate match: `reconcile` in future; docs-only now;
  - review decision: `confirm`, `detach`, `ignore`, or `correct actual` in future; docs-only now;
  - manual actual session: existing Review Actual owns `edit`;
  - planned/source workout/program: `view` only in future reconciliation; never provider-editable.
- Mature reference surface:
  - `Review actual` for manual actual correction;
  - Calendar Plan selected-day detail for planned/manual overview;
  - future provider review must adapt into those contracts or use a dedicated reconciliation route.
- Child-structure rule:
  - provider activities can contain file/lap/step child evidence; runtime cannot claim `10/10` from summary-only screenshots if child evidence is used for matching or trust.

## Data Placement And Sync Contract

Future implementation must define these boundaries before runtime:

- Server-canonical:
  - provider connection row,
  - encrypted/rotatable token reference or secret-store pointer,
  - provider activity evidence row,
  - provider aliases,
  - redacted provider metadata,
  - raw file reference where explicitly approved,
  - import/backfill run status,
  - candidate match rows,
  - reconciliation/review decisions,
  - canonical manual actual/history link only after user/system review rules approve it.
- Local-only:
  - open compare panel,
  - filters,
  - unsaved review notes,
  - transient reconnect/retry UI state.
- Sync policy:
  - import is idempotent by provider alias and user;
  - webhook/push events are signals and may trigger async fetch/import;
  - replay/backfill must not duplicate provider evidence or manual actual history;
  - revoked access disables future sync and preserves already-stored evidence under retention policy;
  - provider evidence never deletes or rewrites manual notes, manual actual session snapshots, planned rows, source workouts, or source programs.
- Conflict policy:
  - ambiguous match, provider/manual disagreement, duplicate provider activity, malformed payload, unsupported sport/sub-sport, missing provider alias, stale send snapshot, and unknown provider value all enter review/support states.
- Retention and sensitivity:
  - provider activity data is private personal training data;
  - tokens are secrets and must not enter browser, logs, analytics, screenshots, or PR artifacts;
  - raw FIT/GPX/TCX files require storage, export, deletion, retention, and redaction rules before they are saved.
- Cache/invalidation:
  - future provider writes must invalidate provider review, Calendar Plan, history/detail, export snapshot, and future Stats mapping only after canonical actual state changes.

## Identity And Rename Contract

- Canonical stable IDs:
  - provider evidence uses internal immutable IDs plus provider aliases;
  - `completed_activity_events.id` remains actual-history identity;
  - `planned_workout_instances.id` remains planned occurrence identity;
  - provider send jobs, if present, use separate delivery IDs.
- Human-readable identifiers:
  - workout titles, Garmin/Strava activity titles, device names, sport labels, and provider display names are presentation only and may change.
- Mutability:
  - provider evidence facts can be refreshed/updated from provider payloads, but raw provider aliases and imported evidence lineage must remain auditable;
  - review decisions may change reconciliation state, not raw evidence facts.
- Rename vs repurpose:
  - renaming a workout/activity label does not rebind evidence;
  - repurposing a source workout/program requires a new canonical row before future provider evidence attaches.
- Compatibility:
  - legacy/manual actual rows continue to work without provider evidence;
  - provider rows with unknown keys stay hidden/review-only until mapped.
- Observability and repair:
  - duplicate aliases, orphan evidence, stale send snapshots, revoked connections, unknown providers, malformed files, and missing actual links must be diagnosable.

## Forward Compatibility Contract

- Extensibility surfaces:
  - providers,
  - provider connection statuses,
  - provider activity aliases,
  - sport/sub-sport values,
  - raw file formats,
  - import/backfill statuses,
  - match signals,
  - reconciliation states,
  - review actions,
  - attribution requirements,
  - analytics event values,
  - export formats,
  - locales.
- Source of truth:
  - provider registry/typed unions for supported providers and states;
  - provider-evidence tables for received facts;
  - send-job tables for sent facts;
  - `completed_activity_events` for actual-history truth;
  - `planned_workout_instances` for planned occurrence truth.
- Automatic behavior:
  - supported provider evidence can be listed/reviewed generically once mapped;
  - unknown values render review/unmapped states and do not count as completed.
- Explicit mapping required:
  - new providers, new file formats, new sport mappings, new attribution requirements, new review actions, Stats mapping, export behavior, and Help/Guide copy.
- Unknown/deprecated values:
  - fail closed to `unmapped`/`needs_review`;
  - stay out of completion counts, Stats, streaks, Perfect Day, analytics KPIs, and automated replanning.
- Evidence:
  - this docs-only slice uses route/label/support sweep and brief linting;
  - runtime slices require future-value fixtures and unknown-value negative-path tests.

## Help/Guide And Support Impact

Runtime provider work will change user recovery and support behavior. Before provider runtime, update:

- `docs/runbooks/auth-account-support.md` with provider disconnect, backfill, duplicate, mismatch, malformed, attribution, raw-file, export/delete, and manual-vs-provider troubleshooting.
- Help/Guide assertions for Calendar/History/Review Actual/provider evidence wording.
- Route-label/support sweep terms:
  - `Provider evidence`,
  - `Garmin`,
  - `Activity API`,
  - `Training API`,
  - `FIT`,
  - `reconciliation`,
  - `manual actual`,
  - `provider activity`,
  - `backfill`,
  - `revoked access`,
  - `duplicate provider activity`,
  - `needs_review`.

No Help/Guide runtime copy changes are required in this docs-only slice.

## Acceptance Criteria

1. The planned brief defines provider evidence separately from manual actual history, planned rows, source workouts/programs, and future send jobs.
2. The brief blocks runtime import/OAuth/FIT/reconciliation until provider credentials, samples, alias/correlation behavior, attribution, secret/config, external-service, export/privacy, RLS, and test contracts are refreshed.
3. App impact sweep includes Calendar, Review Actual, completion API, Stats, export/privacy, external-service matrix, secret inventory, route registry, support docs, and analytics.
4. Forward compatibility states that unknown providers/states/files/actions fail closed and do not count as completion or Stats.
5. Changed docs pass brief lint and docs-only/pre-PR verification.

## Validation

Docs-only validation for this slice:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`
- `npm run verify:pre-pr`

Future runtime validation:

- provider fixture tests,
- RLS/authz negative tests,
- idempotency/replay/duplicate tests,
- malformed/unknown payload tests,
- OAuth callback/state/security tests,
- export/delete/privacy tests,
- support/runbook assertions,
- route registry updates,
- screenshot/e2e if UI changes,
- `npm run verify:pre-pr`,
- GitHub CI,
- `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-06-22 | planned | created from clean main@84222be4 after PR #1203 and closeout #1204 merged; owner approved the audit recommendation to create a docs/schema-intake brief only, not provider runtime. Scope records provider-evidence boundary, official-source baseline, app-impact sweep, scorecard, data/identity/forward-compat contracts, and explicit runtime blockers for Garmin/OAuth/FIT/reconciliation | next: link parent/blocked briefs, run docs validation, commit, push, open PR, monitor CI, and run pre-merge gate`
