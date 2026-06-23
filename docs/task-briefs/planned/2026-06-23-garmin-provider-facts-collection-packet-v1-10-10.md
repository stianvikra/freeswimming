# Task Brief: Garmin Provider Facts Collection Packet V1 (10/10)

## Metadata

- `id`: `2026-06-23-garmin-provider-facts-collection-packet-v1-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-23`
- `updated`: `2026-06-23`
- `mode`: `plan only / docs-only evidence collection packet`
- `parent_brief`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-23-garmin-provider-prerequisites-intake-10-10.md`
  - `docs/task-briefs/planned/2026-06-23-garmin-provider-data-scope-retention-ai-audit-10-10.md`
  - `docs/task-briefs/planned/2026-06-23-training-history-multi-sport-activity-contract-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-23-training-history-generic-activity-data-model-foundation-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-23-calendar-stats-swim-actuals-mapping-v1-10-10.md`
- `related_blocked_briefs`:
  - `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`
  - `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-23`
- `base`: `main@8d3b77df`
- `audit_status`: `ready`
- `decision`: Use this planned packet as the next owner/provider evidence collection artifact before any Garmin OAuth, Activity API import, Training API send, FIT parsing, raw-file storage, Health API context, AI feature view, or reconciliation runtime.
- `reason`: PR `#1225` and closeout PR `#1226` closed the prerequisites intake but left live Garmin/provider work blocked until app-specific provider facts and owner decisions exist. Public Garmin docs and local FreeSwimming contracts are enough to define the collection packet, but not enough to implement runtime.
- `must_refresh_before_execution_if`: Refresh if Garmin official docs, Garmin partner/application status, API access terms, approved API families, OAuth scopes, sample payloads, FIT SDK requirements, brand guidelines, provider schemas, source/duplicate policies, retention decisions, AI/model processor rules, privacy/cookie copy, `training_activity_events`, `provider_activity_evidence`, export/delete routes, scorecard categories, or verification lanes change.

## Goal

Create the concrete owner/provider facts packet that must be filled before FreeSwimming selects a single Garmin/provider runtime child.

## Pre-Implementation Owner Explanation

Codex skal lage et arbeidsark for fakta, ikke Garmin-kode. Vi samler hva offentlige Garmin-kilder og lokale app-kontrakter allerede sier, og hvilke konkrete ting eier eller Garmin fortsatt ma levere: tilgang, scopes, provepayloads/FIT, consent/terms, duplicate-regler, retention, AI-bruk og support/rollback. Det betyr noe fordi runtime uten dette kan telle feil, lagre for mye sensitiv data eller bryte provider-vilkar. Utenfor scope er OAuth, importer, FIT-parser, radatalagring, UI, migrasjoner, AI-kall og reconciliation.

## Current Status

This packet is ready to fill, but Garmin/provider runtime remains blocked.

Confirmed from public official sources on `2026-06-23`:

- Garmin Connect Developer Program is for enterprise/business use and requires application review before access.
- Program APIs use OAuth 2.0 and may combine Health, Activity, Women's Health, Training, and Courses after approval.
- Activity API can provide detailed activity data, including running, cycling, swimming, yoga, strength, activity details, and FIT/GPX/TCX files after user consent and Garmin Connect sync.
- Health API provides all-day health/wellness JSON summaries such as steps, sleep, heart rate, stress, Pulse Ox, Body Battery, body composition, respiration, and blood pressure.
- Training API and Courses API are publish/send surfaces; they do not prove completed activity.
- Women's Health API includes menstrual cycle and pregnancy tracking context and stays blocked by default.
- Garmin API Brand Guidelines can require Garmin attribution on title-level, secondary, exported, derived, and shared displays.
- FIT is compact, interoperable, extensible, and forward-compatible for sport, fitness, and health-device data.

Confirmed from local FreeSwimming contracts:

- `provider_connections`, `provider_import_runs`, and `provider_activity_evidence` store owner-scoped redacted provider evidence summaries only.
- `training_activity_events` is the private generic activity-history foundation and can link to provider evidence only through explicit mapping/review.
- Calendar Trends `Swimming` counts only trusted manual swimming history; provider evidence, non-swim, unknown, unsupported, duplicate, orphaned, schema-drift, and needs-review rows stay excluded.
- `/api/user/export` includes private activity-history rows and redacted provider summaries, not raw provider files, OAuth tokens, provider secrets, raw payloads, cookies, IP addresses, User-Agent strings, or full provider responses.
- The GDPR runbook says V1 has no provider token bucket and no raw FIT/GPX/TCX purge path.
- The external service matrix says provider runtime sync, OAuth, webhooks, FIT/GPX/TCX download/storage, matching, and Calendar/Stats completion truth require later child briefs with fresh official-doc review.

Missing before runtime:

- Garmin partner/application approval and credential path.
- Exact approved API families and OAuth scopes.
- Representative sample payloads/files for the selected path.
- Provider terms and AI/model processor allowance.
- Consent, privacy, attribution, disconnect, deletion, and export behavior.
- Source provenance, alias/correlation facts, and duplicate/source-precedence thresholds.
- Retention windows and storage/cleanup rules for every data class.
- Support, rollback, disable, replay, and redacted diagnostics plan.

## Official Source Baseline

Checked on `2026-06-23` from official Garmin sources:

| Source                                                                                           | Current public fact                                                                                                                                     | Collection consequence                                                                                                                                     |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Garmin Activity API: https://developer.garmin.com/gc-developer-program/activity-api/             | Activity API exposes detailed data for activities such as running, cycling, swimming, yoga, and strength, with FIT/GPX/TCX full-detail files available. | Collect Activity API sample JSON and at least one swim FIT file before import/FIT/runtime work.                                                            |
| Garmin Health API: https://developer.garmin.com/gc-developer-program/health-api/                 | Health API is all-day wellness/health JSON, including sensitive metrics and second-level style data surfaces.                                           | Keep health context separate from activity truth and block default AI/runtime until metric-level purpose, consent, retention, and terms are approved.      |
| Garmin Training API: https://developer.garmin.com/gc-developer-program/training-api/             | Training API publishes workouts and training plans to Garmin Connect/device sync.                                                                       | Treat send state as delivery evidence only, not completion truth; collect local-reference and alias/correlation behavior before sent-vs-received matching. |
| Garmin Courses API: https://developer.garmin.com/gc-developer-program/courses-api/               | Courses API publishes courses and course points to Garmin Connect/device sync.                                                                          | Keep courses out of first swim coaching runtime unless route/course navigation becomes explicit product scope.                                             |
| Garmin Women's Health API: https://developer.garmin.com/gc-developer-program/womens-health-api/  | Women's Health provides menstrual cycle and pregnancy tracking context.                                                                                 | Block by default until separate product/legal/privacy/consent approval exists.                                                                             |
| Garmin Program FAQ: https://developer.garmin.com/gc-developer-program/program-faq/               | Program access is business/enterprise, application review is required, APIs use OAuth 2.0, and some metrics may require commercial terms.               | Collect approval status, approved API families, credential path, commercial constraints, and OAuth lifecycle before runtime.                               |
| Garmin API Brand Guidelines: https://developer.garmin.com/brand-guidelines/api-brand-guidelines/ | Garmin attribution requirements can apply to title-level displays, secondary screens, exported data, derived data, and social media.                    | Block visible Garmin-derived UI/export/support/AI-derived copy until attribution rules are approved.                                                       |
| Garmin FIT SDK overview: https://developer.garmin.com/fit/overview/                              | FIT stores/shares data from sport, fitness, and health devices and is compact, interoperable, extensible, and forward-compatible.                       | Parser/dependency selection must wait for sample files, dependency review, raw storage, retention, export/delete, and support rules.                       |

This baseline is enough to create this docs-only packet. It is not enough to implement live OAuth, provider calls, API routes, webhook/polling jobs, FIT parsing, raw storage, UI, consent screens, AI prompts, or reconciliation.

## Facts Collection Packet

Status meanings:

- `confirmed_public`: fact is confirmed from public official docs only.
- `confirmed_local`: fact is confirmed from current repo contracts.
- `missing_provider`: requires Garmin partner portal, app approval, credential path, sample payload, or non-public terms.
- `owner_decision_needed`: requires a FreeSwimming product/privacy/support decision.
- `runtime_blocked`: the selected runtime path cannot start until this row is resolved.

| Packet item                       | Current status          | Required artifact or decision                                                                                                                                              | Accepted evidence format                                                                                               | Gates                                                            |
| --------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Garmin application status         | `missing_provider`      | Approved app/program status, evaluation/prod access model, API family availability, and commercial/license constraints.                                                    | Redacted owner note, provider email summary, or portal screenshot stored outside repo with a text summary here.        | All live Garmin runtime.                                         |
| Approved first API family         | `owner_decision_needed` | Choose exactly one first runtime path: Activity import, Training send, raw-file foundation, health summaries, AI feature view, or reconciliation UI.                       | Brief checkpoint entry with selected path and explicit deferrals.                                                      | Runtime scoping.                                                 |
| OAuth scopes and lifecycle        | `missing_provider`      | Exact scopes, refresh/revoke behavior, disconnect behavior, token expiry, least-privilege rule, and credential storage path.                                               | Redacted provider docs/portal summary; no secret values.                                                               | Connect/import/send runtime.                                     |
| Consent and privacy copy          | `missing_provider`      | Required user consent language, revocation/delete text, privacy/cookie processor impact, and sensitive-data warnings.                                                      | Copy summary plus owner-approved disclosure decision.                                                                  | Visible connect/consent UI and private provider routes.          |
| Activity API pool swim JSON       | `missing_provider`      | Representative pool swim payload with timestamps, timezone/unit fields, sport labels, activity ID, device/source metadata, and file availability hints.                    | Redacted field inventory and fixture summary; raw payload stays outside repo unless explicitly sanitized and approved. | Import-only proof, duplicate/reconciliation tests, AI summaries. |
| Activity API open-water swim JSON | `missing_provider`      | Representative open-water swim payload, including route/location availability if present.                                                                                  | Redacted field inventory; exact GPS/polyline stays out of repo.                                                        | Swim mapping and location privacy decisions.                     |
| Swim FIT file                     | `missing_provider`      | Representative FIT swim file plus file metadata and parser/dependency constraints.                                                                                         | External secure artifact reference plus redacted field summary; raw FIT file not committed.                            | FIT parsing, raw storage, lap/step detail.                       |
| Malformed/unknown examples        | `missing_provider`      | Unknown sport/status/file-kind, malformed file/payload, missing timezone/unit, duplicate activity, deleted/revoked evidence, and provider outage examples where available. | Redacted synthetic or provider-provided examples with no secret/personal data.                                         | Negative-path and fail-closed tests.                             |
| Source provenance fields          | `missing_provider`      | Provider user ID, activity ID, file ID, device/source/original-hub fields, last-seen/deleted/revoked markers.                                                              | Field inventory table and sample redacted values/classes.                                                              | Duplicate detection, support diagnostics, reconciliation.        |
| Training send alias/correlation   | `missing_provider`      | Whether Garmin accepts client/local references on send and whether received activities include correlation aliases.                                                        | Provider docs/sample notes; no tokens or raw responses.                                                                | Training API send proof and sent-vs-received matching.           |
| Duplicate/source precedence       | `owner_decision_needed` | Exact/likely/ambiguous/manual-conflict/ignored thresholds across manual, Garmin direct, hub/provider, and future providers.                                                | Owner decision table with examples and tests required.                                                                 | Calendar/Stats/KPI inclusion and reconciliation.                 |
| Retention windows                 | `owner_decision_needed` | TTLs for raw FIT/GPX/TCX, raw JSON, unmapped evidence, tombstones, health summaries, AI prompt/cache artifacts, and support diagnostics.                                   | Owner-approved data-class matrix.                                                                                      | Raw storage, health context, AI, export/delete.                  |
| Export/delete/disconnect behavior | `owner_decision_needed` | Account export, account delete, Garmin disconnect, provider delete/revocation, tombstone retention, and raw purge behavior per data class.                                 | GDPR matrix update plan and owner decision.                                                                            | OAuth runtime, storage, support, privacy.                        |
| AI/model processor allowance      | `owner_decision_needed` | Whether normalized provider summaries may enter model context, which processors are allowed, what consent/privacy copy is required, and which data classes are blocked.    | Terms/processor decision and prompt-minimization contract.                                                             | AI feature-view summaries and derived coaching.                  |
| Attribution/display rules         | `missing_provider`      | Approved Garmin attribution treatment for UI, exports, secondary screens, support diagnostics, AI-derived summaries, and shared artifacts.                                 | Brand-guideline decision table with visible-surface examples.                                                          | Any Garmin-derived display/export.                               |
| Support/rollback checklist        | `owner_decision_needed` | Disable flag, retry/backoff, replay/idempotency, cleanup, redacted diagnostics, incident owner, support runbook, and rollback criteria.                                    | Support checklist and runbook diff plan.                                                                               | Production runtime.                                              |

## Evidence Handling Rules

Allowed in repo:

- public official URLs,
- redacted field inventories,
- sample summaries without personal data,
- owner decisions and status labels,
- provider field names when they are not secrets,
- synthetic examples created for tests after privacy review.

Not allowed in repo:

- OAuth client secrets, refresh tokens, access tokens, cookies, session identifiers, or raw env values,
- raw Garmin JSON payloads unless explicitly sanitized and approved,
- raw FIT/GPX/TCX files,
- exact GPS routes, polylines, home/work/training locations, or unredacted location traces,
- raw Health API or Women's Health payloads,
- pregnancy/cycle/medical/diagnostic-style data,
- raw model prompts or provider response bodies,
- full provider portal screenshots containing secrets, personal data, or private terms.

Artifact rule:

- Raw provider samples, if needed, must live outside the repo in an owner-approved secure location.
- The repo may store only a redacted inventory: fields present, sensitivity class, sample value class, parser requirement, and runtime implication.
- Any future sanitized fixture needs a separate implementation brief, explicit redaction proof, and tests proving it contains no secrets or sensitive personal data.

## Runtime Unblock Rules

No future runtime child may start until the selected child can answer these questions:

1. Which Garmin API family is approved and selected for this runtime child?
2. Which exact user data categories are requested, and why does FreeSwimming need each one?
3. What sample payloads prove the schema, source provenance, timezone/unit behavior, and unknown-value fallback?
4. What data is server-canonical, provider-canonical, local-only, raw-only, or not stored?
5. What data is exported, deleted, purged on disconnect, tombstoned, or retained for legal/support reasons?
6. What provider terms and user consent allow or block AI/model processor use?
7. What duplicate/source-precedence states keep Calendar, Stats, KPI, and AI outputs from double-counting?
8. What support diagnostics are safe to show, and what is the disable/rollback path?

Runtime may start only as one bounded child:

- `Garmin import-only proof`
- `Garmin Training API send proof`
- `Raw file storage and retention foundation`
- `Health-context summaries`
- `AI feature-view summaries`
- `Provider reconciliation UI`

If the packet does not clearly support exactly one child, keep Garmin/provider runtime blocked.

## Product Decision

Recommendation: collect Activity API swim evidence first if Garmin access arrives, because it is the closest provider input to actual training history.

Default order:

1. Activity API pool swim JSON + FIT field inventory.
2. OAuth/consent/disconnect scope for Activity API.
3. Source provenance and duplicate/source-precedence decisions.
4. Retention/export/delete rules for evidence and raw files.
5. AI/model processor allowance only after normalized activity summaries are understood.
6. Training API send proof only after alias/correlation behavior is known.
7. Health API and Women's Health remain blocked until separate product/legal/privacy decisions exist.

This is a recommendation, not runtime permission.

## Domain Granularity Contract

User's mental object:

- "The Garmin/provider fact packet that tells us whether a runtime slice is safe to start."

Canonical objects:

- This planned task brief as the packet index.
- Existing source briefs and contracts listed in `depends_on`.
- Future owner/provider external evidence artifacts, summarized in this brief only after redaction.

Child object levels:

| Level                    | Meaning                                                                 | Active slice support                              |
| ------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------- |
| Public source fact       | Fact available from official Garmin docs.                               | `view` and summarize.                             |
| Local contract fact      | Existing FreeSwimming schema/API/runbook constraint.                    | `view` and link.                                  |
| Provider approval fact   | Partner access, approved API families, credentials path, scopes, terms. | `support-only`; owner/provider must supply.       |
| Sample payload inventory | Field-level summary of sample JSON/FIT/GPX/TCX evidence.                | `support-only`; raw samples out of repo.          |
| Owner decision           | Retention, duplicate, AI, attribution, support, rollback choices.       | `support-only`; record only after owner decision. |
| Runtime child selection  | One bounded implementation path after packet is complete.               | `out of scope` until evidence is complete.        |

Mature reference surfaces:

- Provider prerequisites intake: `docs/task-briefs/done/2026-06-23-garmin-provider-prerequisites-intake-10-10.md`.
- Provider data scope/retention/AI audit: `docs/task-briefs/planned/2026-06-23-garmin-provider-data-scope-retention-ai-audit-10-10.md`.
- Provider evidence boundary: `provider_connections`, `provider_import_runs`, `provider_activity_evidence`, and `lib/my-library/provider-evidence.ts`.
- Generic activity foundation: `training_activity_events` and `lib/my-library/training-activity-events.ts`.
- Export/delete/privacy: `docs/api-contracts.md`, `docs/runbooks/gdpr-data-rights.md`, and `docs/architecture/external-service-contract-matrix.md`.

10/10 gate:

- This packet can claim 10/10 only as a docs-only planning artifact. It cannot claim runtime readiness until owner/provider facts are filled and a future selected child passes runtime tests.

## Data Placement And Sync Contract

Server-canonical data:

- None added by this planned docs-only packet.
- Future runtime data remains governed by `provider_activity_evidence`, `training_activity_events`, and future selected child migrations only after explicit approval.

Local-only data:

- None added.

Out of repo/hot tables:

- raw provider payloads,
- OAuth tokens/secrets,
- raw FIT/GPX/TCX files,
- exact GPS routes/polylines,
- raw health/women's health data,
- model prompts/provider responses.

Sync/conflict policy:

- Provider evidence remains evidence.
- Manual reviewed/canonical activity history remains user-approved truth.
- Unknown/duplicate/provider-only rows stay out of Calendar, Stats, KPIs, and AI until explicitly mapped.

Retention and sensitivity:

- This packet stores only redacted decisions and field inventories.
- Raw samples require owner-approved external storage and explicit TTL before runtime.

Cache/invalidation:

- N/A for active docs-only packet. Future provider routes must be private, dynamic/no-store, and owner-scoped.

## Identity And Rename Contract

- Canonical stable ID: this brief path and `id`.
- Human-readable labels: Garmin/provider packet titles are documentation labels only.
- Provider IDs: future aliases only; never app primary identity.
- Runtime child names: planning labels only until a future brief creates code/routes/data.
- Rename vs repurpose: if this packet changes from Garmin-first facts collection to a different provider or runtime implementation, create a new brief rather than repurposing this packet silently.
- Compatibility: parent and related briefs must keep pointing to this packet until a runtime child is selected or the packet is superseded.
- Observability and repair: stale/missing provider facts are tracked as `missing_provider`, `owner_decision_needed`, or `runtime_blocked`.

## Forward Compatibility Contract

Future values expected:

- new Garmin API fields, metrics, devices, file kinds, activity types, health metrics, Women's Health fields, provider statuses, OAuth scopes, and attribution rules;
- future providers such as Apple HealthKit, Android Health Connect, Strava, Polar, Suunto, Wahoo, WHOOP, Oura, Fitbit/Google Health, or swim-specific wearables;
- new source, duplicate, retention, AI feature, support, export, deletion, locale, and analytics values.

Automatic behavior:

- New public-source facts can be added as packet rows without runtime code.
- Unknown provider facts remain `missing_provider` or `runtime_blocked`.
- Unknown provider values remain evidence-only and out of completion/Stats/KPI/AI decisions.

Explicit mapping required:

- any new API family, scope, metric, sport/source value, provider status, attribution rule, consent copy, retention tier, export/delete behavior, AI processor, or visible label entering runtime;
- any sanitized fixture created from provider samples;
- any raw storage, parser dependency, cleanup job, or support diagnostic.

Safe fallback:

- missing, unknown, deprecated, or conflicting facts keep runtime blocked;
- sensitive data classes are blocked until product/legal/privacy decisions exist;
- provider evidence never becomes completion truth by default.

Proof:

- docs-only packet lint,
- links to public official sources,
- local contract references,
- future runtime child must add fixtures, unknown-value tests, authz tests, export/delete tests, retention cleanup evidence, AI prompt minimization snapshots, and route/label/support sweep.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode: all `target` categories must close at `5/5` for this docs-only planning artifact.

Critical target categories:

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                     | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Packet identifies the exact facts needed before selecting one Garmin/provider runtime child.                                                                                           | facts packet + runtime unblock rules      | `5/5`                   |
| UX flow clarity                               | `target`     | Owner can see what is confirmed, missing, owner-decided, provider-required, and runtime-blocking.                                                                                      | status meanings + packet table            | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this docs-only packet changes no rendered UI, layout, print, screenshot, or brand asset.                                                                                   | explicit non-visual rationale             | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Packet preserves separation between provider evidence, canonical activity history, send state, health context, AI features, and completion truth.                                      | data placement + unblock rules            | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, CRUD flow, publish workflow, or operator edit surface changes.                                                                                            | explicit admin-editor non-scope rationale | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered controls or accessibility semantics change.                                                                                                                    | explicit non-UI rationale                 | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Packet blocks raw files, raw JSON, and high-cardinality samples from hot routes until storage/TTL/query rules exist.                                                                   | evidence handling + data placement        | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Public facts, local contracts, provider facts, raw samples, owner decisions, and runtime data boundaries are separate.                                                                 | data placement contract                   | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Future runtime routes must be private/no-store and mapped writes must list affected Calendar/history/AI/export surfaces before implementation.                                         | data placement + future runtime rule      | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing, malformed, duplicate, unknown, revoked, deleted, unsupported, and sensitive provider facts fail closed to blocked/review states.                                              | packet statuses + safe fallback           | `5/5`                   |
| Security and authz                            | `target`     | No secrets/raw samples enter repo; future routes require owner scope, least-privilege OAuth, and fail-closed authz before runtime.                                                     | evidence handling + stack gate            | `5/5`                   |
| Privacy and compliance                        | `target`     | Consent, terms, AI use, retention, export/delete/disconnect, sensitive categories, and attribution remain blocked until decided.                                                       | packet rows + privacy contract            | `5/5`                   |
| Content governance                            | `target`     | Packet is the next canonical source-of-truth before Garmin/provider runtime child selection.                                                                                           | parent link + checkpoint                  | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: future support/admin diagnostics are required, but no admin workflow changes now.                                                                                     | support impact rationale                  | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because Garmin/provider data is private authenticated data and no public crawl surface changes.                                                                                    | private-data rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this packet creates no public AI-discoverable content; AI here means private model context.                                                                                | private AI-context rationale              | `N/A`                   |
| Analytics and KPI observability               | `target`     | Future provider/KPI inclusion is blocked unless source/status taxonomy and safe payload rules are mapped.                                                                              | packet rows + forward compatibility       | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Garmin access may have commercial/license terms, but this packet changes no checkout, entitlement, pricing, invoice, refund, payout, or revenue flow.                 | commercial-term packet row                | `5/5`                   |
| Incident response and support operations      | `target`     | Runtime cannot start until disable, replay, redacted diagnostics, cleanup, rollback, and support checklist requirements are filled.                                                    | support/rollback packet row               | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this docs-only packet does not mutate revenue recognition, payouts, invoices, refunds, entitlements, or accounting data; Garmin license cost is vendor/product input only. | explicit finance non-scope rationale      | `N/A`                   |
| i18n operational readiness                    | `target`     | Future provider/source/status labels must be typed and translation-ready before visible copy ships.                                                                                    | forward compatibility label rule          | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Uses existing Next/Supabase/provider-evidence/activity-history contracts and blocks parser/provider dependencies until sample evidence justifies them.                                 | stack gate + no package diff              | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass task-brief lint; future runtime requires fixtures, negative paths, retention/export/delete, AI minimization, and release gates.                                    | validation section                        | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Packet requires storage/TTL/aggregation and bounded imports before raw/high-volume provider data can ship.                                                                             | evidence handling + retention rows        | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Future runtime must be disabled-by-default or safely gated, replay-safe, cleanup-capable, and rollback-documented before release.                                                      | support/rollback row + runtime rules      | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no UI route changes now;
  - future consent/review/provider UI must reuse existing My Library/Calendar/Review Actual patterns and provide screenshot handoff.
- TypeScript/domain:
  - provider, source, sport, status, retention tier, AI feature, and attribution fields must use typed allowlists with unknown-safe fallback before runtime.
- Supabase/data:
  - future runtime requires explicit migrations, RLS, owner-scoped indexes, generated DB types, export/delete coverage, and negative-path tests.
- External services:
  - use official Garmin docs and provider-provided samples before Garmin runtime;
  - OAuth, webhooks/polling, retry/backoff, rate limits, token storage, observability, attribution, and revocation/delete behavior must be specified before code.
- UI system:
  - N/A now;
  - future visible provider copy requires route/label/support sweep, attribution review, and screenshot handoff.
- Testing:
  - docs-only: `npm run lint:briefs`, `npm run lint:briefs:all`, `git diff --check`;
  - future runtime: provider fixtures, malformed/unknown/duplicate/revoked/deleted payload tests, authz, export/delete, retention cleanup, AI prompt minimization, performance/query tests, `verify:pre-pr`, CI, `verify:pre-merge`.

## Codex Skill / Stack Readiness Radar

Capability audit:

- Available now: local shell, `rg`, repo task-brief linting, local task-brief/provider-evidence/activity-history contracts, and web access to official provider docs.
- Not needed now: browser/screenshot tooling, Stripe plugin, runtime provider tooling, external provider credentials.
- Do not install or configure local Codex skills/plugins/MCP servers for this docs-only packet.

Systemic findings:

| Surface                     | Finding                                                                                                                                            | Severity | Recommended Type                     | Owner Decision Needed             | Follow-Up Brief Path                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ | --------------------------------- | ----------------------------------- |
| Provider access facts       | Runtime cannot start without concrete Garmin access, API scopes, terms, credentials path, and sample payloads.                                     | `high`   | `safe process/docs update`           | yes, collect provider facts       | this packet                         |
| Raw/sensitive data handling | Raw FIT/GPX/TCX, Health API, Women's Health, location, and model-context data need storage, TTL, export/delete, and consent decisions before code. | `high`   | `deferred architecture decision`     | yes, before runtime               | future selected runtime child       |
| Duplicate/source policy     | Garmin direct, hubs, manual rows, and future providers can duplicate the same activity.                                                            | `high`   | `bounded implementation child` later | yes, thresholds/source precedence | future reconciliation/adapter brief |

Return path:

- Parent: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Previous completed intake: `docs/task-briefs/done/2026-06-23-garmin-provider-prerequisites-intake-10-10.md`
- Next step after this packet: owner/provider evidence collection; then select exactly one bounded runtime child or keep Garmin/provider runtime blocked.

## Help/Guide And Support Impact

Current docs-only packet:

- No Help/Guide runtime copy changes are required.
- No support runbook changes are required until owner/provider facts select a runtime path.

Future runtime:

- Update `docs/runbooks/auth-account-support.md`, `docs/api-contracts.md`, `docs/runbooks/gdpr-data-rights.md`, `docs/architecture/external-service-contract-matrix.md`, privacy/cookie surfaces, and Help/Guide assertions when visible provider labels, consent, recovery, delete/disconnect, export, or support diagnostics change.

## Route / Label / Support Surface Sweep

No route/label/support sweep is required for this docs-only packet because it does not rename or expose product labels.

Before any future runtime or UI child, run a targeted sweep for:

- `Garmin`, `Activity API`, `Health API`, `Training API`, `Courses API`, `Women's Health`, `FIT`, `GPX`, `TCX`, `provider evidence`, `source provenance`, `duplicate`, `revocation`, `disconnect`, `retention`, `AI`, `model processor`, `export/delete`, `Calendar Trends`, `Review actual`, `manual actual`, `training_activity_events`.

## Scope

- Add this planned facts-collection packet as the current next owner/provider evidence artifact.
- Use local repo contracts and public official Garmin docs to separate confirmed facts from missing provider facts and owner decisions.
- Define evidence handling rules so private samples and secrets do not enter the repo.
- Keep every Garmin/provider runtime path blocked.

## Out Of Scope

- Runtime implementation, migrations, tests against runtime code, UI, screenshots, provider credentials, provider payload commits, raw files, and live Garmin calls.
- Moving blocked Garmin runtime briefs to active.
- Selecting, building, or merging any provider runtime child.
- Touching `Ja.docx`.

## Acceptance Criteria

1. Planned facts-collection packet exists and links to the training-history parent, Garmin/provider data audit, multi-sport contract, generic activity foundation, and prerequisites intake.
2. Packet distinguishes public official facts, local FreeSwimming facts, missing provider facts, owner decisions, and runtime blockers.
3. Packet covers provider access, API families, OAuth scopes, sample payloads/FIT, terms/AI, consent/privacy, source provenance, alias/correlation, duplicate policy, retention, attribution, support, and rollback.
4. Packet states evidence handling rules that prevent secrets, raw provider payloads, raw FIT/GPX/TCX files, exact route data, sensitive health data, and prompt payloads from entering the repo.
5. Runtime unblock rules require exactly one bounded future child or keep runtime blocked.
6. Parent training-history checkpoint points to this packet as the next owner/provider evidence collection artifact.
7. Changed briefs pass task-brief lint and diff checks.

## Validation

Docs-only validation required for this packet PR:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`

Optional PR packaging validation:

- `npm run verify:docs-only`
- `npm run verify:pre-pr` docs-only lane before PR update.
- `npm run verify:pre-merge` docs-only lane before merge recommendation.

## Local Tooling Prerequisite

- Use repo-pinned Node/npm from `.nvmrc` and `packageManager`.
- Before reporting `npm`/`node` missing, bootstrap through `nvm use --silent`.

## Manual QA Environments

`N/A`; no UI, browser workflow, deployment behavior, install flow, print/export rendering, or visible route behavior changes.

No screenshot handoff is required because this is docs-only and non-visual.

## Constraints

- Do not implement Garmin runtime from this packet.
- Do not commit secrets, credentials, OAuth tokens, raw provider payloads, raw health data, FIT/GPX/TCX files, or sample data exports.
- Do not weaken the rule that provider evidence, health context, non-swim, unknown, unsupported, duplicate, unmapped, and needs-review rows do not count as completion truth.
- Do not use provider data in model prompts without provider terms, user consent, privacy disclosure, processor approval, and prompt-minimization tests.
- Do not touch `Ja.docx`.

## Session Continuity And Recovery

Canonical recovery order:

1. `git status -sb`
2. `git log --oneline -n 10`
3. Reopen this packet, the Garmin prerequisites intake, the Garmin/provider data scope audit, and the training-history parent brief.

## Checkpoint Log

- `2026-06-23 | planned | created from clean synced main@8d3b77df after PR #1225 and repo-managed closeout PR #1226 merged; public Garmin docs and local FreeSwimming contracts were refreshed enough to create the facts packet, but Garmin runtime remains blocked until owner/provider facts are collected | next: owner/provider evidence collection, then select exactly one bounded runtime child or keep Garmin/provider runtime blocked`
