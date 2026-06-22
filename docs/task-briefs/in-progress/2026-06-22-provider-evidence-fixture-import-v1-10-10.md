# Task Brief: Provider Evidence Fixture Import V1 (10/10)

## Metadata

- `id`: `2026-06-22-provider-evidence-fixture-import-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-22`
- `updated`: `2026-06-22`
- `mode`: `runtime fixture import / implementation`
- `parent`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `predecessor`: `docs/task-briefs/done/2026-06-22-provider-evidence-schema-foundation-v1-10-10.md`
- `related_blocked_briefs`:
  - `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`
  - `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-22`
- `base`: `main@da01bb18`
- `audit_status`: `ready`
- `decision`: Use this as the next bounded runtime slice if the owner wants to prove provider-evidence writes before real Garmin/OAuth/provider runtime.
- `reason`: Provider Evidence Schema Foundation V1 is merged and gives separate tables, export/delete coverage, typed helpers, and support docs, but the app still has no route-owned write path proving sanitized provider evidence can be inserted/upserted without becoming completion truth.
- `must_refresh_before_execution_if`: Refresh if provider evidence schema, `completed_activity_events`, account export/delete, route registry, support runbooks, Supabase RLS/service-role guidance, official provider docs, scorecard categories, verification lanes, or owner product decisions around Garmin/OAuth/UI/reconciliation change.

## Goal

Add a constrained internal fixture-import path that writes `manual_fixture` provider evidence safely and idempotently, proving provider evidence can be created, exported, deleted, and kept out of Calendar/Stats/completion truth before any real provider integration.

## Pre-Implementation Owner Explanation

Codex skal lage en trygg test-import for provider-aktiviteter uten ekte Garmin-kobling. Det betyr noe fordi vi kan bevise at dubletter, rare verdier og feil payloads blir lagret som privat evidence uten at appen teller det som gjennomført trening. Utenfor scope er Garmin/OAuth, live API-kall, FIT/GPX/TCX-lagring, matching/reconciliation, UI, Calendar/Stats, Perfect Day, performance-ratchet og `Ja.docx`.

## Current App Baseline

- Provider Evidence Schema Foundation V1 is merged in PR `#1206` and closed by PR `#1207`.
- `provider_connections`, `provider_import_runs`, and `provider_activity_evidence` exist as owner-scoped, RLS-enabled, private provider evidence summary tables.
- Existing grants expose `select` to `authenticated`; no broad client-side insert/update/delete policy exists.
- Account export reads provider evidence arrays and degrades missing provider schema to empty arrays.
- Account deletion relies on `auth.users(id) on delete cascade`; V1 stores no OAuth tokens or raw provider files.
- Calendar manual completion writes only `completed_activity_events.source_kind = manual`.
- Review Actual edits only mapped manual actual rows and fails closed for provider/future source rows.
- No provider write route, provider UI, provider job, OAuth callback, raw file storage, or reconciliation link exists.

## Official Source Baseline

Checked on `2026-06-22` during the provider audit:

- Garmin Activity API: https://developer.garmin.com/gc-developer-program/activity-api/
  - Activity API is the receive side for detailed activity data, includes swimming, and can expose FIT/GPX/TCX files after user consent and device sync.
- Garmin Training API: https://developer.garmin.com/gc-developer-program/training-api/
  - Training API is the send/publish side for workouts and plans; send state is not completion truth.
- Garmin Program FAQ: https://developer.garmin.com/gc-developer-program/program-faq/
  - Garmin Connect Developer Program is business/enterprise oriented, uses OAuth 2.0, and requires approval.
- Garmin API Brand Guidelines: https://developer.garmin.com/brand-guidelines/api-brand-guidelines/
  - Garmin-sourced and Garmin-derived title, secondary, exported, derived, and social displays may require attribution.
- Garmin FIT SDK: https://developer.garmin.com/fit/overview/
  - FIT is compact, interoperable, extensible, and SDK-backed; parsing or storage needs a separate raw-file slice.
- OAuth 2.0 Security BCP, RFC 9700: https://www.rfc-editor.org/rfc/rfc9700.html
  - Future OAuth must use exact redirect matching, CSRF/state/PKCE protections, least privilege, and secure token handling.
- Supabase RLS and Storage docs:
  - https://supabase.com/docs/guides/database/postgres/row-level-security
  - https://supabase.com/docs/guides/storage/security/access-control
  - Route-owned writes must use explicit authz boundaries; raw file storage would need bucket/object policies and service-key discipline.
- Strava Webhooks: https://developers.strava.com/docs/webhooks/
  - Webhooks are update signals with retry/privacy semantics, supporting a run/evidence boundary rather than treating events as complete truth.
- Android Health Connect: https://developer.android.com/health-and-fitness/health-connect
  - Health/fitness data requires user permission and has sync semantics, supporting a generic provider-evidence boundary.

## Scope

This planned runtime slice owns:

- A route-owned, authenticated fixture import path for `manual_fixture` provider evidence only.
- A deterministic fixture import domain helper that:
  - validates a bounded input payload,
  - ignores or rejects caller-supplied `user_id`,
  - upserts one non-secret `provider_connections` row for `manual_fixture`,
  - creates one `provider_import_runs` row per import attempt,
  - upserts `provider_activity_evidence` rows by `(user_id, provider_key, provider_activity_id)`,
  - records duplicate/malformed/unsupported counts without throwing unexpected `500`s for expected bad fixture rows,
  - stores only redacted summary fields and file availability hints.
- A route registry/API contract update for the fixture import route.
- Support/GDPR notes explaining fixture evidence, export/delete behavior, and no completion side effect.
- Tests proving:
  - unauthenticated requests fail closed,
  - disabled/unsupported route mode fails closed if a runtime flag is used,
  - cross-user payload fields are ignored,
  - duplicate aliases are idempotent,
  - unknown provider/status/file/sport values fail closed,
  - export includes imported summaries,
  - Calendar/Review Actual/Stats do not count or edit provider evidence.

Implementation should prefer a server-only route-owned writer that uses the authenticated user's ID and does not add broad client-side insert/update RLS policies. If a runtime enable flag is introduced, it must default to disabled in production and be documented in the config/secret inventory as non-secret config.

## Out Of Scope

- Garmin partner setup, OAuth, credentials, callback routes, token storage, revocation, webhooks, polling, or API calls.
- `garmin_activity_api`, `strava_activity_api`, `apple_health`, or `android_health_connect` live imports.
- Raw FIT/GPX/TCX download, upload, parsing, storage buckets, or lap/step evidence.
- Garmin Training API send jobs or sent-vs-received matching.
- Reconciliation links, candidate matching, confidence scoring, review decisions, or actual-history mutation from provider evidence.
- Calendar provider indicators, Review Actual provider compare UI, Stats Swimming mapping, screenshots, or user-facing provider copy.
- Perfect Day product decision or Calendar Perfect Day behavior.
- Performance-ratchet tightening before at least two new weekly green cycles after `2026-06-19`.
- Touching `Ja.docx`.

## Proposed V1 Runtime Contract

- Route shape:
  - preferred: `POST /api/my-library/provider-evidence/fixture-import`;
  - private, `force-dynamic`, JSON `no-store`;
  - authenticated user only;
  - no public navigation or UI entrypoint.
- Provider:
  - only `manual_fixture` is accepted in this slice;
  - any caller-provided provider key other than `manual_fixture` is rejected or normalized to an explicit failed import result without writing evidence.
- Payload:
  - bounded activity array, for example max `10` activities per request;
  - required stable `providerActivityId`;
  - optional date/time, activity/sport/sub-sport, distance, duration, pool length, file state, file kinds, and redacted summary;
  - no raw provider payload, OAuth token, provider secret, cookie, IP, User-Agent, or raw file content.
- Write behavior:
  - create/update a single `manual_fixture` connection for the authenticated user;
  - create an import-run row with counts and redacted diagnostics;
  - upsert evidence rows by `(user_id, provider_key, provider_activity_id)`;
  - use `needs_review`, `imported`, `duplicate_provider_activity`, `malformed`, `unsupported_activity`, or `unmapped` only;
  - never write `completed_activity_events`.
- Response:
  - return support-safe counts and internal evidence/run IDs only;
  - do not echo raw summaries beyond approved redacted values;
  - expected malformed/unsupported rows produce deterministic `200` with warning counts or `400` for wholly invalid requests, not unexpected `500`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

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

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                         | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Fixture import is clearly an internal provider-evidence proof path, separate from Calendar, Stats, Review Actual, Garmin, and completion truth.                                        | route contract + API docs + scope review                           | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: no visible user UI ships; API errors and support diagnostics still have deterministic next states.                                                                    | route tests + support notes                                        | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no rendered UI, layout, print surface, screenshot, or brand asset.                                                                                      | explicit visual non-scope rationale                                | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Import is idempotent by provider alias, rejects/normalizes unknown values, and never writes actual-history or planned-session truth.                                                   | domain/route tests + Calendar/Review Actual regressions            | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, admin CRUD workflow, or publish surface changes.                                                                                                          | explicit admin-editor non-scope rationale                          | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no interactive UI or semantic markup changes.                                                                                                                              | explicit a11y non-scope rationale                                  | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: payload is bounded and no raw files/blobs are stored; no route CWV budget changes.                                                                                    | payload limit tests + no UI diff                                   | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Provider connection, import run, evidence summary, manual actual history, planned rows, raw files, and local UI state remain explicitly separate.                                      | data contract + tests + export/delete docs                         | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Fixture route is private/no-store; export reflects imported evidence; Calendar/Stats invalidation remains unchanged because provider evidence is not counted.                          | route registry + export test + no Calendar mutation evidence       | `5/5`                   |
| Reliability and failure handling              | `target`     | Duplicate, malformed, unsupported, oversized, disabled, schema-missing, and unexpected DB errors produce deterministic safe responses.                                                 | negative-path route/domain tests                                   | `5/5`                   |
| Security and authz                            | `target`     | Route is authenticated, owner-scoped, ignores caller-supplied owner IDs, uses least-privilege route-owned writes, and does not add broad client-side mutation policies.                | authz tests + route registry + migration/RLS review                | `5/5`                   |
| Privacy and compliance                        | `target`     | Stores only redacted summaries and file hints, exports/deletes provider fixture evidence, and never stores secrets/raw provider payloads/raw files.                                    | export tests + GDPR/support docs + payload validation tests        | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: fixture evidence may reference presentation labels but never rewrites source workout/program content.                                                                 | identity contract + no content mutation review                     | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: support diagnostics are updated, but no admin repair UI ships.                                                                                                        | support runbook update                                             | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because fixture provider evidence is private authenticated data and no public route, metadata, sitemap, or robots behavior changes.                                                | private-data rationale                                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because fixture provider evidence is private and not public AI-discoverable content.                                                                                               | private-data rationale                                             | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no product KPI event ships; any diagnostics are support-safe counts with no raw payloads.                                                                             | logging/response review                                            | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no checkout, pricing, entitlement grant, billing portal, revenue, refund, payout, or commerce workflow.                                                 | explicit commerce non-scope rationale                              | `N/A`                   |
| Incident response and support operations      | `target`     | Support can diagnose fixture import run IDs, duplicate/malformed/unsupported counts, disabled route, export/delete inclusion, and no completion side effects.                          | auth-account support runbook + route response tests                | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: provider fixture evidence is private training data and does not change revenue, invoices, refunds, payouts, entitlement reporting, or accounting truth.      | explicit finance non-scope rationale                               | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: machine IDs stay stable and no visible localized copy ships; future visible provider labels require explicit locale mapping.                                          | domain registry + no UI copy review                                | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js route, Supabase, generated type, provider-evidence helper, export, and test patterns; no new dependency unless explicitly justified.                            | changed-files review + targeted tests                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Include route/domain/export/Calendar/Review Actual regression tests, `npm run lint:briefs`, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge`.                               | validation outputs                                                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: fixture input is bounded, no raw files/blobs are stored, and imports cannot create unbounded rows per request.                                                        | payload limit tests + query/write review                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Route can be disabled or reverted without corrupting manual history; no external provider state, tokens, queues, files, or migrations beyond optional additive config/docs are needed. | rollback note + route disable/default tests + pre-merge validation | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no UI or page surface is in scope;
  - route should be a private App Router API route with `force-dynamic`, JSON `no-store`, and authenticated user gate;
  - no Calendar or Review Actual route markup changes.
- TypeScript/domain:
  - reuse `lib/my-library/provider-evidence.ts` registries and normalization helpers;
  - add a narrow fixture import parser/helper rather than ad hoc route string manipulation;
  - return typed success/warning/error results with bounded support-safe diagnostics.
- Supabase:
  - prefer route-owned service-role writes after authenticated user gate instead of adding broad insert/update policies;
  - keep existing RLS select policies intact unless the brief is explicitly refreshed;
  - use existing generated DB types;
  - no new migration should be needed unless a runtime flag/config row or additional constraint is explicitly justified.
- External services:
  - no live external provider call;
  - official provider docs are context only and must be refreshed again before real Garmin/OAuth/runtime.
- Storage:
  - no Supabase Storage bucket, object path, raw FIT/GPX/TCX file, or raw provider payload storage.
- UI system:
  - N/A for implementation; screenshot handoff is not required unless scope changes to visible UI/print/layout/brand.
- Testing:
  - targeted route/domain/export tests;
  - Calendar completion and Review Actual regression tests;
  - negative-path authz/security tests;
  - full `verify:pre-pr` and `verify:pre-merge` because runtime route/tests are code-touching.

## Skill / Capability Radar

- Available now: local shell, repo validation scripts, official-provider browsing, existing provider-evidence helpers, current `playwright` skill for later UI/screenshot slices, Stripe plugin unrelated to this slice.
- Evaluate later: security-specific Codex skills before OAuth/token/callback work; Playwright only if future UI appears.
- Install/config changes: none. Do not install local Codex skills/plugins/MCP servers for this brief without explicit owner approval.

Systemic findings:

| Surface               | Finding                                                                                                              | Severity | Recommended Type                 | Owner Decision Needed                                      | Follow-Up Brief Path                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Provider write path   | Schema exists, but no safe write path proves idempotent provider evidence creation.                                  | `high`   | `bounded implementation child`   | no for `manual_fixture` proof after owner approves runtime | this brief                                                                               |
| Provider runtime      | OAuth, live provider calls, webhooks, token storage, and raw files remain security-sensitive and externally blocked. | `high`   | `deferred architecture decision` | yes before real provider runtime                           | future OAuth/provider runtime brief                                                      |
| Garmin reconciliation | Matching needs partner/API samples, alias/correlation facts, sent-job/import-only decision, and owner thresholds.    | `high`   | `deferred architecture decision` | yes                                                        | `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md` |

Return path:

- Parent: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Last merged workstream: PR `#1206` (`1cac3a94`) and closeout PR `#1207` (`00de10cb`).
- Current planned child: this fixture import brief.
- Next product step after this brief: owner may execute this bounded fixture import, or keep provider runtime blocked until real provider prerequisites exist.

## Domain Granularity Gate

- User's mental object:
  - a received provider activity as private evidence, not a completed FreeSwimming actual.
- Canonical objects:
  - fixture connection: `provider_connections.id` with `provider_key = manual_fixture`;
  - fixture import run: `provider_import_runs.id`;
  - provider activity evidence: `provider_activity_evidence.id` plus provider activity alias;
  - manual actual history: `completed_activity_events.id`, untouched in this slice;
  - planned occurrence: `planned_workout_instances.id`, untouched in this slice.
- Child object levels:
  - provider connection summary: `create/view/support-only`;
  - import run status/counts: `create/view/support-only`;
  - provider activity summary: `create/view/support-only`;
  - raw file reference/status: `support-only`; no file storage;
  - lap/step/FIT evidence: `out of scope`;
  - candidate match/reconciliation decision: `out of scope`;
  - manual actual session: existing Review Actual owns `edit`; this slice must not edit it.
- Mature reference surface:
  - provider evidence schema/domain/export helpers from schema foundation;
  - account export/delete routes for privacy boundaries;
  - Calendar/Review Actual regressions for no-count/no-edit guarantees.
- Child-structure rule:
  - V1 can prove summary evidence writes because lap/step/FIT child evidence is explicitly out of scope and not persisted.

## Data Placement And Sync Contract

- Server-canonical:
  - `provider_connections` metadata for `manual_fixture`;
  - `provider_import_runs` status/counts/diagnostics;
  - `provider_activity_evidence` redacted summaries and provider aliases.
- Local-only:
  - N/A; no UI/browser state ships.
- Deferred:
  - OAuth tokens/secrets;
  - raw provider files/payloads;
  - webhook delivery/event payloads;
  - reconciliation links/review decisions;
  - Calendar/Stats invalidation from provider evidence.
- Sync policy:
  - route writes are one-shot fixture imports;
  - retry/upsert by provider activity alias and user;
  - duplicate aliases update or preserve evidence according to deterministic fixture rules and never duplicate completion truth.
- Conflict policy:
  - malformed/unsupported/unknown rows produce warning/error counts;
  - provider/manual disagreement is out of scope and must not be inferred.
- Retention and sensitivity:
  - fixture evidence is private training/health-adjacent personal data;
  - export/delete includes fixture summaries through existing provider evidence export/delete behavior;
  - no tokens/raw payloads/raw files.
- Cache/invalidation:
  - fixture route and export route are private/no-store;
  - Calendar/Review Actual/Stats invalidation is unchanged because provider evidence is not surfaced or counted.

## Identity And Rename Contract

- Canonical stable IDs:
  - each provider connection, import run, and evidence row has an immutable UUID;
  - provider activity ID is a foreign alias and idempotency key;
  - `completed_activity_events.id` remains actual-history identity.
- Human-readable identifiers:
  - fixture titles, provider display names, sport labels, and activity labels are presentation-only.
- Mutability:
  - fixture evidence summaries may be refreshed by a repeated import for the same alias;
  - provider alias, provider key, import lineage, and created timestamps must remain auditable.
- Rename vs repurpose:
  - changing fixture display text does not rebind evidence;
  - a materially different fixture activity needs a new provider activity alias.
- Compatibility:
  - manual-only accounts keep empty provider arrays;
  - future real provider rows stay separate from `manual_fixture` and require explicit mapping.
- Observability and repair:
  - duplicate aliases, malformed rows, unsupported files, disabled route, and missing evidence links must be diagnosable by support-safe IDs/counts.

## Forward Compatibility Contract

- Extensibility surfaces:
  - providers, statuses, run kinds, file states, file kinds, sport/sub-sport values, route errors, export fields, support diagnostics, analytics values, locales.
- Source of truth:
  - provider registries and schema constraints define supported machine values;
  - provider tables store received evidence;
  - completed events remain actual-history truth.
- Additive behavior:
  - new supported provider/status/file values require registry/schema/test updates but should not rewrite manual history;
  - existing fixture evidence exports/deletes with provider evidence arrays.
- Explicit mapping requirements:
  - real providers, OAuth, raw files, provider attribution, review actions, Stats mapping, UI labels, analytics events, and Help/Guide copy need owner-approved mapping before release.
- Unknown/deprecated values:
  - fail closed to `unmapped`, `needs_review`, `malformed`, or `unsupported_activity`;
  - stay out of completion counts, Stats, streaks, Perfect Day, analytics KPIs, and automated replanning.
- Test/evidence:
  - unknown-value negative-path tests,
  - duplicate/idempotency tests,
  - export payload tests,
  - Calendar/Review Actual regression tests,
  - route-label/support sweep.

## Help/Guide And Support Impact

- Required same-PR updates when implemented:
  - `docs/api-contracts.md` for fixture import route and response contract;
  - `docs/architecture/data-access-authz-cache-contract-registry.md` for route auth/cache/error behavior;
  - `docs/runbooks/auth-account-support.md` for fixture import diagnostics and no completion side effect;
  - `docs/runbooks/gdpr-data-rights.md` only if export/delete behavior changes beyond existing provider evidence arrays.
- Help/Guide visible product copy:
  - `N/A` unless a visible provider UI or user-facing Help surface is added. This planned slice should not add one.

## Route / Label / Support Sweep

Before broad gates, search at minimum:

- `fixture import`
- `manual_fixture`
- `provider evidence`
- `provider_activity_evidence`
- `provider_connections`
- `provider_import_runs`
- `completed_activity_events`
- `source_kind`
- `Review actual`
- `Calendar`
- `Stats`
- `export`
- `delete`
- `Garmin`
- `OAuth`
- `FIT`
- `raw provider`
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

## Acceptance Criteria

1. Fixture import accepts only authenticated, owner-scoped `manual_fixture` evidence.
2. Caller-supplied owner/user IDs cannot write cross-user data.
3. Duplicate provider activity aliases are idempotent and do not create duplicate evidence rows.
4. Malformed, unsupported, oversized, unknown, and disabled states fail closed with deterministic support-safe responses.
5. No OAuth tokens, provider secrets, raw provider payloads, raw FIT/GPX/TCX files, cookies, IPs, User-Agent strings, or raw response bodies are stored, logged, returned, or exported.
6. Account export includes redacted fixture evidence summaries; account deletion remains covered by cascade or documented cleanup.
7. Calendar completion, Review Actual, Stats, streaks, Perfect Day, and analytics KPIs do not count fixture evidence as completed training.
8. Route registry, API contract, support runbook, and active brief checkpoints are updated.
9. No Garmin/OAuth/live provider/webhook/raw-file/reconciliation/UI behavior ships.
10. Relevant targeted tests, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge recommendation.

## Validation

Targeted validation when implemented:

- `npm run lint:briefs`
- `git diff --check`
- targeted provider fixture import route/domain tests
- targeted export payload tests
- Calendar completion regression tests
- Review Actual regression tests
- route-label/support sweep evidence

Required broad gates:

- `npm run verify:pre-pr`
- GitHub CI required checks
- `npm run verify:pre-merge`

Because future implementation will touch runtime code, tests, routes, docs, and possibly config, it must run the full lane selected by `verify:pre-pr`/`verify:pre-merge`.

## Automation Mode

- For implementation after owner approval: `automation-first`.
- Assistant owns branch, code, tests, docs, commit, push, PR creation/update, CI monitoring, `verify:pre-merge`, and merge-readiness summary.
- Pause only for sandbox approval prompts, missing credentials, missing provider facts, or real product/security decisions.
- Visual screenshot stop is N/A unless later scope adds UI.

## Git Rhythm Defaults

- Create a feature branch from fresh `main` before runtime implementation.
- Move this brief to `in-progress` when implementation starts.
- Commit after a validated vertical route/domain/test/docs slice.
- Push only after `npm run verify:pre-pr` passes.
- Do not merge without explicit owner approval.

## Implementation Evidence

- Failure-mode / no unexpected 500 evidence: `tests/unit/provider-evidence-fixture-import-route.test.ts` covers disabled `403`, unauthenticated `401`, unsupported content type `415`, unsupported provider `400`, oversized payload `400`, provider schema missing `503`, malformed/unsupported row warning counts, and unexpected provider evidence write failure returning bounded `500` with support-safe code `provider_connection_write_failed`.
- Validation/invariant evidence: route tests verify caller-supplied `user_id`/`userId` is ignored, writes use authenticated `user-1`, duplicate provider activity aliases upsert idempotently, `completed_activity_events` is never touched, and redacted summaries do not persist caller `access_token`.
- Export artifact evidence: actual consumed artifact is the JSON account export payload built by `GET /api/user/export`; `tests/unit/user-export-route.test.ts` verifies imported `manual_fixture` provider connection, activity evidence, import run, and redacted summary are exported without raw token fields.
- Owner screenshot approval / visual review stop: N/A because this slice changes no rendered UI, print layout, brand asset, screenshot surface, or browser-visible provider copy; screenshot approval stop is not required unless a later provider UI/print/layout/brand surface is added.
- High-cost UI/export debug path: `ui-debug-hypothesis-and-handoff` is N/A for UI because no visual surface changed; export validation used the actual consumed artifact JSON payload test rather than a browser preview.
- Route/label/support sweep evidence: identifiers searched were `fixture import`, `manual_fixture`, `provider evidence`, `provider_activity_evidence`, `provider_connections`, `provider_import_runs`, `completed_activity_events`, `source_kind`, `Review actual`, `Calendar`, `Stats`, `export`, `delete`, `Garmin`, `OAuth`, `FIT`, `raw provider`, `needs_review`, and `unmapped`.
- Route/label/support sweep surfaces checked: directories/surfaces checked were `app/`, `components/`, `lib/`, `tests/`, `types/`, `supabase/migrations/`, `docs/`, active task briefs, planned task briefs, blocked task briefs, and done task briefs. Fallout handled in `docs/api-contracts.md`, `docs/architecture/data-access-authz-cache-contract-registry.md`, `docs/architecture/secret-config-inventory.md`, `docs/runbooks/auth-account-support.md`, route tests, export tests, and this active brief.
- Unknown runtime or repository surface classification rationale: `app/api/my-library/provider-evidence/fixture-import/route.ts` is a private authenticated API/server action surface; `lib/my-library/provider-evidence.ts` is the provider-evidence domain contract; docs changes are route/support/config governance; tests are QA automation. No runtime UI, migration, workflow, analytics, external provider, OAuth, storage bucket, or config-secret value is introduced.
- Local gate evidence: `npm run verify:pre-pr` passed on `2026-06-22` with branch-current, brief quality gate, lint, typecheck, unit, build, performance budgets, and Playwright open gate green (`111 passed`, `567 skipped` locally due environment/dev-auth gating). Performance trend reported continued green history, but tightening is intentionally held because the owner set performance-ratchet to wait for at least two new weekly green cycles after `2026-06-19`.

## Checkpoint Log

- `2026-06-22 | planned | created from clean main@00de10cb after provider schema foundation PR #1206 and closeout PR #1207 merged; audit confirmed schema/export/delete foundations are ready, Garmin/OAuth/reconciliation remain blocked, and the next safe runtime child is a bounded manual_fixture import proof with no UI or real provider calls | next: wait for owner approval to execute runtime implementation`
- `2026-06-22 | in-progress | owner approved execution from clean main@da01bb18; moved brief to in-progress and implemented POST /api/my-library/provider-evidence/fixture-import with disabled-by-default flag, auth gate, service-role writes after payload preflight, manual_fixture-only parsing, duplicate/idempotent upsert behavior, malformed/unsupported counts, redacted summaries, export route coverage, Calendar/Review Actual/Stats no-count regressions, API/registry/support/config docs; targeted Vitest passed for provider fixture import route, provider evidence contract, user export route/payload, Calendar plan, Review Actual editor, and Calendar comparison | next: run route-label/support sweep, lint/type/format checks, verify:pre-pr, commit, push, PR`
- `2026-06-22 | in-progress | route-label/support sweep, lint:briefs:all, typecheck, lint, targeted Vitest, and npm run verify:pre-pr passed; performance-ratchet hold recorded per post-2026-06-19 weekly-cycle policy | next: commit, push, open PR, monitor CI, then run verify:pre-merge`
