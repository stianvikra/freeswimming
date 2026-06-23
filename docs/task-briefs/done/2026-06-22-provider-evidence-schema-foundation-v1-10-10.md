# Task Brief: Provider Evidence Schema Foundation V1 (10/10)

## Metadata

- `id`: `2026-06-22-provider-evidence-schema-foundation-v1-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-22`
- `updated`: `2026-06-22`
- `mode`: `runtime schema foundation / done`
- `parent`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `predecessor`: `docs/task-briefs/done/2026-06-22-provider-evidence-boundary-and-reconciliation-intake-v1-10-10.md`
- `related_blocked_briefs`:
  - `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`
  - `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-22`
- `base`: `main@509b75c1`
- `audit_status`: `ready`
- `decision`: Completed as the bounded runtime schema foundation before any provider OAuth, live Garmin calls, FIT parsing, webhook handling, matching, Calendar UI, or Stats mapping work.
- `reason`: Manual actual history is owner-scoped, editable, and fail-closed for future provider rows; this slice added separate provider evidence tables, generated types, domain guards, export/delete handling, and service/support documentation for received activity evidence.
- `must_refresh_before_execution_if`: Refresh if `completed_activity_events`, `planned_workout_instances`, Review Actual, Calendar Plan, Calendar Comparison/Stats, account export/delete, Supabase RLS/storage guidance, Garmin/Strava/Health Connect/HealthKit provider docs, route registry, external-service matrix, secret inventory, scorecard categories, or verification lanes change.

## Goal

Create the first server-canonical provider-evidence data foundation so future Garmin/Strava/Apple Health/Health Connect-style received activities can be stored, exported/deleted, diagnosed, and later reconciled without counting as completed training or overwriting manual actual history.

## Pre-Implementation Owner Explanation

Codex skal lage database- og kodekontrakten for en trygg mottaksboks for fremtidige provider-aktiviteter. Det betyr noe fordi Garmin eller andre kilder senere kan sende data som er feil, duplisert eller ufullstendig, og appen må kunne lagre dette som bevis uten å telle det som gjennomført trening. Utenfor scope er OAuth, Garmin-kall, webhooks, FIT/GPX/TCX-lagring, automatisk matching, UI, Calendar/Stats-visning, Perfect Day, performance-ratchet og `Ja.docx`.

## Current App Audit

- `completed_activity_events` is manual actual history only, with `source_kind = manual` as the only accepted source kind.
- Calendar manual completion writes one owner-scoped actual row and does not mutate planned rows, source workouts, or programs.
- Review Actual V1 edits only mapped manual actual rows and fails closed for provider/future source rows, duplicate actual rows, missing planned references, and unknown outcomes.
- Calendar Plan shows actual history as a read-only overview; Calendar does not own provider import or reconciliation UI.
- Stats Swimming remains intentionally unmapped until completed swim actuals receive an explicit comparison mapping.
- Account export is explicit field-by-field and currently does not include provider evidence because no provider evidence tables exist.
- Account deletion uses Supabase Auth deletion and must stay compatible with any new user-owned provider tables through `on delete cascade` or a documented service-role cleanup rule.
- `docs/architecture/external-service-contract-matrix.md`, `docs/architecture/secret-config-inventory.md`, and `docs/architecture/data-access-authz-cache-contract-registry.md` do not yet define provider activity evidence runtime behavior.

## Official Source Baseline

Checked on `2026-06-22`:

- Garmin Activity API: https://developer.garmin.com/gc-developer-program/activity-api/
  - Received activity side. It includes swimming, supports user-consented activity access after Garmin Connect device sync, and can expose detailed activity files such as FIT, GPX, and TCX.
- Garmin Training API: https://developer.garmin.com/gc-developer-program/training-api/
  - Send/publish side. It publishes workouts/training plans to Garmin Connect calendar/device sync and must not be treated as completion truth.
- Garmin Program FAQ: https://developer.garmin.com/gc-developer-program/program-faq/
  - Garmin Connect Developer Program is business/enterprise oriented, requires approval, and uses OAuth 2.0.
- Garmin API Brand Guidelines: https://developer.garmin.com/brand-guidelines/api-brand-guidelines/
  - Garmin-sourced and Garmin-derived displays, exports, and derived data may require attribution.
- Garmin FIT SDK: https://developer.garmin.com/fit/overview/
  - FIT is compact, interoperable, forward-compatible, and SDK/tooling backed. Detailed FIT parsing and raw file storage require a later file-evidence slice.
- OAuth 2.0 Security BCP, RFC 9700: https://www.rfc-editor.org/rfc/rfc9700.html
  - Future OAuth work must use secure redirect validation, PKCE/state/CSRF defenses where applicable, least-privilege scopes, secure refresh-token handling, and replay protection.
- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
  - New user-owned tables must enable RLS, use explicit authenticated owner policies, and index policy/filter columns.
- Supabase Storage access/ownership docs:
  - https://supabase.com/docs/guides/storage/security/access-control
  - https://supabase.com/docs/guides/storage/security/ownership
  - Raw provider files require separate bucket/object RLS and service-key ownership rules; this V1 must not save raw files.
- Strava Webhook Events API: https://developers.strava.com/docs/webhooks/
  - Webhooks are signals for create/update/delete/revoked-access events and may require asynchronous fetch. This supports import-run/event state separate from provider evidence and actual history.
- Android Health Connect: https://developer.android.com/health-and-fitness/health-connect
  - Health/fitness integrations are consent and permission sensitive, supporting a generic provider-evidence boundary rather than a Garmin-only schema.
- Apple HealthKit: https://developer.apple.com/documentation/healthkit/
  - Future Apple health data handling should be treated as private health/fitness data with explicit permission, attribution/source, and privacy handling before runtime.

## Best-Practice Interpretation

- Provider evidence is not actual history. It must live in separate tables and remain excluded from Calendar completion counts, Stats, streaks, Perfect Day, automated replanning, and analytics KPIs until a later reconciliation slice maps it.
- Provider evidence should be idempotent by stable provider alias, at minimum `(user_id, provider_key, provider_activity_id)`.
- Unknown provider keys, activity IDs, sport/sub-sport values, file kinds, connection statuses, import statuses, and evidence statuses must fail closed to `unmapped`, `needs_review`, `malformed`, or `unsupported`.
- V1 should store redacted summary metadata and lineage only. It must not store OAuth tokens, raw FIT/GPX/TCX files, full provider payloads, or provider secrets.
- Any future route that writes provider evidence must be private/no-store, owner-scoped, idempotent, and covered by negative-path tests before it ships.
- Export/delete must be designed in the same schema foundation so provider data does not become a GDPR/privacy blind spot.

## Scope

This planned runtime foundation owns:

- A Supabase migration for separate provider-evidence tables, likely:
  - `provider_connections` for non-secret connection metadata and disconnect/revoked/support state;
  - `provider_activity_evidence` for received activity summary evidence and provider aliases;
  - `provider_import_runs` for future backfill/webhook/import run status and redacted diagnostics.
- Explicit constraints and indexes:
  - primary key on every table;
  - `user_id` foreign key with deletion behavior documented;
  - provider/status/file-kind check constraints for supported V1 values;
  - unique idempotency guard on `(user_id, provider_key, provider_activity_id)`;
  - indexes on owner/date/provider/status fields used by future reads and RLS.
- RLS and grants:
  - RLS enabled before exposure;
  - authenticated owner-scoped `select` policies;
  - no broad client-side mutation unless a route-owned write contract is explicitly created;
  - service-role use only when documented in route registry and justified.
- Generated database types in `types/database.ts`.
- Domain helpers under a stack-native path such as `lib/my-library/provider-evidence.ts`:
  - provider registry;
  - status/file-kind unions;
  - unknown-value normalization;
  - evidence select constants;
  - schema-missing detection helpers;
  - idempotency/identity helpers.
- Account export updates:
  - include provider connections, provider activity evidence, and import-run diagnostics with private but redacted fields;
  - exclude secrets, OAuth tokens, raw provider payloads, and raw files.
- Account deletion/privacy updates:
  - ensure user-owned provider rows are deleted through cascade or documented deletion path;
  - document raw-file deletion as deferred because V1 saves no raw files.
- Docs updates:
  - `docs/api-contracts.md`;
  - `docs/architecture/external-service-contract-matrix.md`;
  - `docs/architecture/secret-config-inventory.md`;
  - `docs/architecture/data-access-authz-cache-contract-registry.md` if export/delete route contracts change;
  - `docs/runbooks/auth-account-support.md`;
  - `docs/runbooks/gdpr-data-rights.md`;
  - parent/intake/blocked brief checkpoints if needed.
- Tests:
  - migration/type/domain contract tests;
  - RLS/authz negative-path evidence where repo harness supports it;
  - idempotency/duplicate provider alias tests;
  - unknown/future value tests;
  - export payload tests;
  - existing Calendar completion and Review Actual tests proving provider evidence still does not mutate manual actual history.

## Out Of Scope

- Garmin partner setup, credentials, OAuth callback routes, token storage, refresh, revocation calls, or provider API calls.
- Webhook endpoints, push subscriptions, polling, scheduled jobs, or async workers.
- Raw FIT/GPX/TCX file upload, storage buckets, parsing, lap/step mapping, or biometric detail storage.
- Garmin Training API send jobs or sent-vs-received matching.
- Reconciliation UI, Calendar provider indicators, Stats Swimming mapping, Review Actual provider compare surface, or screenshots.
- Automatic matching, confidence scoring, AI retrospective evaluation, automated replanning, or Perfect Day Calendar behavior.
- Finance/admin reporting changes beyond explicit N/A rationale.
- Performance-ratchet tightening before at least two new green weekly cycles after `2026-06-19`.
- Touching `Ja.docx`.

## Proposed V1 Data Contract

Minimum stable provider keys:

- `garmin_activity_api`
- `strava_activity_api`
- `apple_health`
- `android_health_connect`
- `manual_fixture`

Unknown provider keys must normalize to `unmapped` and remain excluded from user-visible completion counts.

Minimum connection statuses:

- `not_connected`
- `connected_metadata_only`
- `revoked`
- `disabled`
- `needs_review`
- `provider_unavailable`

Minimum evidence statuses:

- `imported`
- `needs_review`
- `duplicate_provider_activity`
- `malformed`
- `unsupported_activity`
- `ignored`
- `unmapped`

Minimum import-run statuses:

- `queued`
- `running`
- `completed`
- `completed_with_warnings`
- `failed_retryable`
- `failed_final`
- `disabled`

Minimum file states:

- `none`
- `available_from_provider`
- `deferred_storage`
- `unsupported`
- `redacted`

V1 must not persist raw files. If file metadata is stored, it is reference/status only.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                   | Evidence                                                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Provider evidence, provider connection, import run, manual actual, planned row, sent job, and reconciliation decision are named separately with no Calendar/Stats counting.      | brief scope, data contract, API/docs updates                                     | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: no user UI ships; future support/review states are named so later UI has clear source states.                                                                   | support docs and future state registry                                           | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no rendered UI, layout, print surface, screenshots, or brand assets.                                                                              | explicit visual non-scope rationale                                              | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Provider evidence is separate from manual actual history, idempotent by provider alias, and unknown values fail closed without completion/Stats side effects.                    | migration constraints, domain tests, Calendar/Review Actual regression tests     | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin CRUD/editor workflow or admin publish actions.                                                                                           | explicit admin-editor non-scope rationale                                        | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no interactive UI or semantic markup changes.                                                                                                                        | explicit a11y non-scope rationale                                                | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: route payloads must not include raw provider files; future reads must be owner/date bounded.                                                                    | query/index review and no raw-file export evidence                               | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical provider evidence, local-only UI state, raw-file deferral, manual actual history, and future reconciliation links are explicitly separated.                     | migration, data placement contract, docs                                         | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: export/delete and future provider reads use private/no-store; Calendar/Stats invalidation remains unchanged until reconciliation.                               | route registry/API docs                                                          | `4/5`                   |
| Reliability and failure handling              | `target`     | Duplicate alias, malformed evidence, unsupported sport/file, revoked connection, disabled provider, and unknown values have deterministic non-500 states.                        | negative-path unit tests and support runbook                                     | `5/5`                   |
| Security and authz                            | `target`     | New tables are owner-scoped, RLS-enabled, least-privilege, and no token/raw payload storage is introduced.                                                                       | migration policies, route/export tests, security review notes                    | `5/5`                   |
| Privacy and compliance                        | `target`     | Provider data is minimized, exportable/deletable, no secrets/raw files/log payloads are stored, and GDPR runbook covers provider evidence.                                       | export/delete tests and GDPR/runbook updates                                     | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: provider evidence references source workouts/plans only by stable IDs and does not edit content truth.                                                          | identity contract and source-separation docs                                     | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin workflow ships; support-visible diagnostics and future repair states are documented.                                                                   | support docs and external-service matrix                                         | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because provider activity evidence is private authenticated data and no public route, metadata, sitemap, or robots behavior changes.                                         | private-data rationale                                                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because provider activity/reconciliation data is private and not public AI-discoverable content.                                                                             | private-data rationale                                                           | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics events ship; future provider events must use safe aggregate taxonomy and exclude raw provider payloads.                                            | analytics boundary docs                                                          | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no checkout, pricing, entitlement grant, billing portal, revenue, refund, payout, or commerce workflow.                                           | explicit commerce non-scope rationale                                            | `N/A`                   |
| Incident response and support operations      | `target`     | Support can diagnose disconnect/revoked, disabled provider, duplicate alias, malformed evidence, unsupported activity/file, export/delete, and raw-file deferred states.         | auth-account support runbook, external-service matrix, route-label/support sweep | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: provider activity evidence is private training data and this slice does not change revenue, invoice, refund, payout, entitlement, or accounting truth. | explicit finance non-scope rationale                                             | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: provider/status/action machine IDs stay stable and display labels are not used as identity.                                                                     | domain registry and forward-compat tests                                         | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js/TypeScript/Supabase patterns, explicit migrations/RLS/generated types, no new dependency unless justified, and official-provider docs baseline.             | changed-files review, migration/types/domain tests                               | `5/5`                   |
| Testing and QA automation                     | `target`     | Include migration/domain/export/delete/unknown/idempotency tests plus existing Calendar/Review Actual regression tests and `verify:pre-pr`.                                      | test commands and CI evidence                                                    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: indexes and bounded summary fields avoid full raw payload/file storage and future expensive scans.                                                              | index review and payload minimization evidence                                   | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Migration is additive/revertable, raw files/tokens are absent, provider runtime remains disabled, and rollback does not corrupt manual history.                                  | migration review, rollback notes, pre-pr/pre-merge gates                         | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no user-facing UI is in scope;
  - no new provider route should ship in V1 unless it is internal/test-only and explicitly added to the route registry;
  - account export remains protected/private/no-store.
- TypeScript/domain:
  - create a typed provider evidence registry and helper layer;
  - use discriminated unions or literal registries for provider keys/statuses/file states;
  - normalize unknown values to `unmapped`/`needs_review` instead of throwing or counting.
- Supabase:
  - use explicit additive migrations;
  - enable RLS before exposure;
  - use `to authenticated` owner-scoped policies and index `user_id`, provider alias, evidence date, and status fields;
  - generated DB types must be updated in the same workstream;
  - avoid storing OAuth tokens or raw provider payloads in public tables.
- External services:
  - no live provider calls in V1;
  - docs must record Garmin/Strava/Health Connect/HealthKit/OAuth source baselines;
  - external-service and secret/config docs must state that secrets/OAuth remain deferred.
- Storage:
  - no bucket or raw file object storage in V1;
  - any future raw-file slice must define bucket RLS, owner paths, service-key ownership, export/delete, retention, and file redaction before saving files.
- UI system:
  - N/A for implementation in this slice;
  - future UI must use screenshot handoff and show planned/sent/received/actual facts separately.
- Testing:
  - cheapest useful layer first: domain unit tests, export payload unit tests, schema/migration contract tests, RLS/authz coverage where supported, and targeted regression tests for Calendar completion/Review Actual.

## Skill / Capability Radar

- Available now: local shell, repo validation scripts, current official-provider browsing, `playwright` skill for later UI/screenshot slices, Stripe plugin unrelated to this provider slice.
- Evaluate later: security-specific Codex skills for OAuth/AppSec review before token/callback implementation; Playwright screenshots only when UI changes.
- Install/config changes: none. Do not install local skills/plugins/MCP servers for this brief without explicit owner approval.

Systemic findings:

| Surface                | Finding                                                                                               | Severity | Recommended Type                 | Owner Decision Needed                     | Follow-Up Brief Path                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| Provider data model    | Provider evidence needs separate tables, RLS, idempotency, export/delete, and domain helpers.         | `high`   | `bounded implementation child`   | no for schema foundation                  | this brief                                                                               |
| Provider runtime       | OAuth, live API calls, webhooks, token storage, and raw-file storage require separate security scope. | `high`   | `deferred architecture decision` | yes before runtime/provider integration   | future OAuth/provider runtime brief                                                      |
| Product reconciliation | Sent-vs-received matching still depends on provider alias/correlation facts and owner thresholds.     | `high`   | `deferred architecture decision` | yes before Garmin Activity reconciliation | `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md` |

Return path:

- Parent: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Last merged workstream: PR `#1205` (`509b75c1`) created the provider evidence intake brief.
- Completed child: this schema foundation shipped in PR `#1206` and was closed by PR `#1207`.
- Next child after audit: `docs/task-briefs/done/2026-06-22-provider-evidence-fixture-import-v1-10-10.md`.
- Next product step after this brief: choose between the bounded `manual_fixture` import proof, OAuth/provider connection runtime, raw file evidence storage, or keeping Garmin reconciliation blocked until partner/API samples exist.

## Domain Granularity Gate

- User's mental object:
  - a received provider activity as evidence, not a completed FreeSwimming actual.
- Canonical objects:
  - manual actual history: `completed_activity_events.id`;
  - planned occurrence: `planned_workout_instances.id`;
  - future provider connection: `provider_connections.id`;
  - future provider received evidence: `provider_activity_evidence.id`;
  - future import/backfill run: `provider_import_runs.id`;
  - future reconciliation decision: dedicated later table/ID, not in V1 unless explicitly scoped.
- Child object levels:
  - provider connection summary: `create/view/support-only` via schema/export, no UI;
  - provider activity summary: `create/view/support-only` via schema/export, no UI;
  - provider alias/idempotency: `create/support-only`;
  - raw file reference/status: `support-only`, no file storage;
  - lap/step/FIT evidence: `out of scope`;
  - candidate match: `out of scope`;
  - review/reconciliation decision: `out of scope`;
  - manual actual session: existing Review Actual owns `edit`; this slice must not edit it.
- Mature reference surface:
  - `completed_activity_events` and Review Actual for manual actual correction;
  - Calendar Plan for planned/manual overview;
  - account export/delete routes for privacy boundaries.
- Child-structure rule:
  - V1 can claim schema/data-boundary quality without showing child FIT/lap data because raw child evidence is explicitly out of scope and not persisted.

## Data Placement And Sync Contract

- Server-canonical:
  - provider connection metadata without secrets;
  - provider activity evidence summary;
  - provider aliases and idempotency keys;
  - provider import/backfill run status and redacted diagnostics;
  - export/delete inclusion rules.
- Local-only:
  - N/A in V1; no UI or browser provider state ships.
- Deferred:
  - OAuth tokens/secrets;
  - raw provider files;
  - webhook delivery/event payload storage;
  - reconciliation decisions;
  - Calendar/Stats cache invalidation from provider evidence.
- Sync policy:
  - V1 creates schema and helper contracts only;
  - future imports must upsert/idempotently merge by provider alias and user;
  - provider evidence never deletes, rewrites, or rebases manual actual history, planned rows, workouts, or programs.
- Conflict policy:
  - duplicate provider aliases become duplicate/support states;
  - malformed/unsupported/unknown payloads stay review/support-only;
  - provider/manual disagreement is deferred to reconciliation and must not count automatically.
- Retention and sensitivity:
  - provider evidence is private training/health-adjacent personal data;
  - no tokens/raw files/raw payloads in V1;
  - provider rows must be included in authenticated export and deleted with the user.
- Cache/invalidation:
  - export/delete routes remain no-store;
  - Calendar/Review Actual/Stats invalidation remains unchanged because provider evidence is not surfaced or counted in V1.

## Identity And Rename Contract

- Canonical stable IDs:
  - each provider connection, provider evidence row, and import run has an immutable internal UUID;
  - provider activity IDs are foreign aliases, not app identity;
  - `completed_activity_events.id` remains actual-history identity;
  - `planned_workout_instances.id` remains planned occurrence identity.
- Human-readable identifiers:
  - provider display names, activity titles, workout titles, sport labels, and device names are presentation only and may change.
- Mutability:
  - provider evidence summaries may be refreshed from provider data;
  - original provider alias, provider key, import lineage, and created timestamps must remain auditable;
  - raw evidence facts must not be repurposed to represent another provider activity.
- Rename vs repurpose:
  - renaming a provider/activity label does not rebind evidence;
  - a materially different provider activity requires a new evidence row or explicit alias/merge repair contract in a later brief.
- Compatibility:
  - manual-only accounts continue to export/delete normally with empty provider arrays;
  - unknown provider keys/statuses stay hidden/review-only and do not count.
- Observability and repair:
  - duplicate aliases, orphan evidence, disabled provider, revoked connection, malformed evidence, unsupported files, and missing actual links must be diagnosable with internal IDs and redacted status codes.

## Forward Compatibility Contract

- Extensibility surfaces:
  - providers;
  - provider connection statuses;
  - provider activity aliases;
  - sport/sub-sport/activity type values;
  - raw file states;
  - import/backfill statuses;
  - future match signals;
  - future reconciliation states/actions;
  - attribution requirements;
  - analytics event values;
  - export formats;
  - locales.
- Source of truth:
  - provider registry/domain helpers for supported machine values;
  - provider tables for received facts;
  - `completed_activity_events` for actual-history truth;
  - `planned_workout_instances` for planned occurrence truth.
- Additive behavior:
  - adding a supported provider/status/file state should require registry/test updates but not manual-history rewrites;
  - existing manual actual history continues to work with no provider rows.
- Explicit mapping requirements:
  - new providers, file formats, sport mappings, attribution rules, review actions, Stats mappings, UI labels, analytics payload values, and raw file handling require owner-approved mapping, tests, docs, and support copy.
- Unknown/deprecated values:
  - fail closed to `unmapped`/`needs_review`/`unsupported`;
  - stay out of completion counts, Stats, streaks, Perfect Day, analytics KPIs, exports of raw content, and automated replanning.
- Test/evidence:
  - future-value fixtures;
  - unknown-value negative-path tests;
  - export payload tests showing unknown evidence remains private and non-counting;
  - route-label/support sweep evidence.

## Help/Guide And Operator Training Contract

This slice changes support and privacy handling, but no user-facing UI labels or Help/Guide product copy.

Required same-PR updates when implemented:

- `docs/runbooks/auth-account-support.md`:
  - provider evidence, disconnected/revoked, duplicate alias, malformed evidence, unsupported file, and export/delete diagnostics.
- `docs/runbooks/gdpr-data-rights.md`:
  - provider evidence export/delete inclusion and raw-file deferred rationale.
- Help/Guide assertions:
  - `N/A` for visible product Help in this V1 because no provider UI ships.

## Security, Privacy, And Compliance

- Auth/authz:
  - all provider tables are user-owned and RLS protected;
  - no provider evidence route may expose cross-user rows;
  - service-role access is forbidden unless route registry documents the gate and tests prove it.
- Secret handling:
  - no OAuth client secrets, access tokens, refresh tokens, webhook secrets, raw provider payloads, or `.env` values in repo, logs, tests, screenshots, exports, or PR artifacts.
- Data minimization:
  - V1 stores summary evidence and redacted diagnostics only;
  - raw files and full payloads are deferred.
- GDPR/privacy:
  - provider rows must be included in authenticated export;
  - provider rows must be deleted with user account deletion or via documented cleanup;
  - raw-file retention is N/A in V1 because raw files are not stored.
- Logging:
  - logs may include internal IDs, provider key, status, bounded error code, and counts;
  - logs must not include tokens, raw payloads, raw files, exact sensitive notes, cookies, IPs, or full provider response bodies.

## Observability And KPI Contract

- Runtime analytics events are out of scope.
- Required support diagnostics:
  - duplicate provider alias count/status;
  - malformed/unsupported evidence status;
  - revoked/disabled connection state;
  - import run status/error code;
  - export/delete inclusion evidence.
- Future KPI mapping:
  - provider import, match, review, detach, ignore, and correction events require a later analytics taxonomy brief before shipping.

## Performance And Cost Contract

- Do not store raw provider files or full payload JSON in V1.
- Index owner/date/provider/status fields used by future queries.
- Keep export payload bounded to summary/provider evidence fields; no raw files or large provider blobs.
- No route-level CWV budgets change because no UI route changes.

## Acceptance Criteria

1. New provider evidence tables are separate from `completed_activity_events` and cannot be counted as manual actual history.
2. RLS, grants, constraints, indexes, and generated DB types are updated in the same implementation.
3. Domain helpers normalize provider/status/file unknowns to fail-closed states.
4. Provider evidence is idempotent by user/provider/provider activity alias.
5. Account export includes provider evidence summary fields and excludes secrets/raw payloads/raw files.
6. Account delete privacy behavior is explicit and covered by cascade or documented cleanup.
7. Calendar completion and Review Actual still reject provider/future source rows and do not mutate provider evidence.
8. External service matrix, secret inventory, API contracts, route registry where relevant, GDPR runbook, and support runbook are updated.
9. No OAuth, live provider calls, webhook endpoints, raw file storage, FIT parsing, Calendar UI, Stats mapping, or Perfect Day behavior ships.
10. `npm run lint:briefs` and `npm run verify:pre-pr` pass before PR update; `npm run verify:pre-merge` passes before merge recommendation.

## Validation

Targeted validation when implemented:

- `npm run lint:briefs`
- `git diff --check`
- domain/schema tests for provider evidence helpers and unknown-value normalization
- migration/type contract tests
- export payload tests
- Calendar completion route regression tests
- Review Actual regression tests

Required broad gates:

- `npm run verify:pre-pr`
- GitHub CI required checks
- `npm run verify:pre-merge`

If implementation touches runtime code, tests, migrations, generated types, scripts, package/config, or workflows, this is not docs-only and must run the full lane selected by `verify:pre-pr`/`verify:pre-merge`.

## Quality Gate Evidence

- Unexpected 500/failure-mode evidence: provider evidence schema drift (`42P01`, `42703`, `PGRST204`, `PGRST205`, or provider evidence column/table hints) normalizes to empty provider export arrays, so missing provider tables do not create an unexpected 500. Unrelated provider read errors still use the existing `/api/user/export` failure mode and return the normal `500` export failure; `tests/unit/user-export-route.test.ts` covers the schema-drift no unexpected 500 path.
- Print/PDF/export artifact evidence: this slice changes JSON export payload shape only, not rendered PDF/print/image artifacts. Actual consumed artifact validation is the built export JSON contract through `buildUserExportPayload` plus `/api/user/export` route test coverage; no UI export screenshot or `ui-debug-hypothesis-and-handoff` loop is applicable.
- Owner screenshot approval / visual review stop: N/A because no rendered UI, print layout, brand asset, screenshot surface, browser flow, or visual file changed. If a later provider evidence UI appears, screenshot approval stop becomes mandatory before `verify:pre-pr`.
- Route/label/support sweep result: identifiers searched were `provider evidence`, `provider_activity`, `provider connection`, `provider import`, `Garmin`, `Activity API`, `Training API`, `FIT`, `GPX`, `TCX`, `completed_activity_events`, `manual actual`, `source_kind`, `Review actual`, `Calendar`, `Stats`, `export`, `delete`, `revoked access`, `duplicate provider activity`, `needs_review`, and `unmapped`.
- Surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `types/`, `supabase/migrations/`, `docs/`, docs runbooks, active/planned/blocked/done task briefs, API contracts, external-service matrix, secret/config inventory, route registry, GDPR runbook, and account support runbook. Fallout handled in this slice: export contract, delete/privacy boundary, provider service matrix, secret deferred family, support diagnostics, route registry, domain helpers, route test, and provider schema tests.

## Manual QA Environments

N/A for V1 because no UI, visual, print, screenshot, route-page UX, or browser workflow changes. If implementation later adds any visible provider surface, screenshot handoff becomes mandatory before `verify:pre-pr`.

## Route / Label / Support Sweep

Required sweep terms before broad gates:

- `provider evidence`
- `provider_activity`
- `provider connection`
- `provider import`
- `Garmin`
- `Activity API`
- `Training API`
- `FIT`
- `GPX`
- `TCX`
- `completed_activity_events`
- `manual actual`
- `source_kind`
- `Review actual`
- `Calendar`
- `Stats`
- `export`
- `delete`
- `revoked access`
- `duplicate provider activity`
- `needs_review`
- `unmapped`

Sweep locations:

- `app/`
- `components/`
- `lib/`
- `tests/`
- `types/`
- `supabase/migrations/`
- `docs/`
- active/planned/blocked/done task briefs.

## Session Continuity And Recovery

- Canonical source of truth:
  - branch used for implementation plus this brief path.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the checkpoint log.
- Checkpoint cadence:
  - update this brief after schema/domain/test/docs milestones;
  - record latest commit hash, completed scope, and next step before any pause.

## Git Rhythm Defaults

- Create a feature branch from fresh `main` before runtime implementation.
- Commit after each validated implementation step or one complete vertical schema/domain/test slice.
- Push before PR creation/update after `npm run verify:pre-pr` passes.
- Do not merge without explicit owner approval.
- Post-merge cleanup follows repo defaults only after owner approves merge.

## Automation Mode

- For implementation after owner approval: `automation-first`.
- Assistant owns branch, code, tests, docs, commit, push, PR creation/update, CI monitoring, `verify:pre-merge`, and merge-readiness summary.
- Pause only for sandbox approval prompts, missing credentials, missing provider facts, or real product/security decisions.
- Visual screenshot stop is N/A unless later scope adds UI.

## PR Browser Rule

- Use Safari for PR create/review/merge links when PR work starts, preferably via repo script where available.
- Do not overwrite the owner's active Safari tab unless it already belongs to the target PR.

## Manual QA URL Rule

- N/A for V1 unless implementation later adds UI or a manual route smoke.
- If a QA URL becomes necessary, assistant opens the exact URL in Safari and gives exactly one actionable validation step.

## Branch Hygiene Defaults

- After merge approval and merge completion:
  - sync `main`;
  - prune deleted refs;
  - remove merged local/remote branch when safe;
  - run repo post-merge preflight;
  - then do the mandatory chat-handoff assessment.

## Implementation Checkpoint Log

- `2026-06-22 | planned | created from clean main@509b75c1 after app + official-source audit; scope is provider evidence schema/domain/export/delete/docs/tests only, with OAuth/Garmin/FIT/matching/UI/Stats explicitly out of scope | next: wait for owner approval to execute runtime implementation`
- `2026-06-22 | working tree | owner approved runtime implementation; branch provider-evidence-schema-foundation created and brief moved to in-progress | next: implement schema/domain/export/delete/docs/tests`
- `2026-06-22 | working tree | implemented additive provider_connections/provider_import_runs/provider_activity_evidence schema with owner/provider composite integrity, typed domain helpers, export/delete docs, support/privacy contracts, export route schema-drift fallback, and route/domain/export tests; targeted Vitest, typecheck, brief lint --all, and git diff --check pass | next: run npm run verify:pre-pr`
- `2026-06-22 | working tree | linked Supabase migration drift resolved by applying 20260622170000_provider_evidence_schema_foundation.sql; npm run verify:pre-pr passed full lane; perf budget reported 11 consecutive weekly green runs and recommended tightening, but decision is hold because the performance-ratchet brief must wait for at least two new green weekly cycles after 2026-06-19 | next: commit, push, open PR, monitor CI`
- `2026-06-22 | merged | PR #1206 merged at 1cac3a94 after required CI, npm run verify:pre-merge, and npm run merge:preflight passed; post-merge preflight surfaced this repo-managed docs-only lifecycle closeout | next: closeout PR`

## Completion Record

- `completed`: `2026-06-22`
- `merged_pr`: `#1206`
- `squash_commit`: `1cac3a94`
- `result`: Closed Provider Evidence Schema Foundation V1 with additive owner-scoped provider connection, import run, and provider activity evidence tables; typed provider evidence contracts; export/delete privacy coverage; support/GDPR documentation; and regression tests. Garmin/provider runtime reconciliation, OAuth, raw file storage, Calendar/Stats counting, UI review surfaces, and Perfect Day remain intentionally deferred.
- `validation`: `npm run verify:pre-pr` PASS full lane; required CI PASS (`Analyze`, `size-check`, `verify`); `npm run verify:pre-merge` PASS full lane; `npm run merge:preflight -- --assert-ready` PASS; linked Supabase migration drift PASS after applying `20260622170000_provider_evidence_schema_foundation.sql`.
- `10/10 claim`: yes - all critical target categories reached `5/5`; supporting categories remained within release gate and no scoped target category is below `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                          | Gaps / Notes |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | Provider evidence, provider connection, import run, manual actuals, sent jobs, and reconciliation decisions stay separate.        | None scoped. |
| Business logic correctness and data integrity | `5/5`          | Migration constraints, typed normalization, provider domain tests, and Calendar/Review Actual regressions passed.                 | None scoped. |
| Data placement and sync boundaries            | `5/5`          | Server-canonical provider evidence, raw-file deferral, export/delete boundary, and manual-history separation documented.          | None scoped. |
| Reliability and failure handling              | `5/5`          | Duplicate, malformed, unsupported, revoked/disabled, and unknown-value states have deterministic non-500 handling.                | None scoped. |
| Security and authz                            | `5/5`          | RLS-enabled owner policies, least-privilege grants, composite owner/provider keys, and protected export route tests.              | None scoped. |
| Privacy and compliance                        | `5/5`          | No tokens/raw provider payloads/raw files are stored; export/delete and GDPR runbook cover redacted evidence summaries.           | None scoped. |
| Incident response and support operations      | `5/5`          | Support runbook and external-service matrix cover revoked, disabled, duplicate, malformed, unsupported, and deferred file states. | None scoped. |
| Stack-fit and dependency discipline           | `5/5`          | Existing Next.js/Supabase/TypeScript patterns reused; no new dependency added; official provider docs baseline recorded.          | None scoped. |
| Testing and QA automation                     | `5/5`          | Targeted unit/regression tests, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` passed.                      | None scoped. |
| DevOps and rollback readiness                 | `5/5`          | Additive migration, linked Supabase drift check, no runtime provider activation, and merge-preflight passed.                      | None scoped. |
