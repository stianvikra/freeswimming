# Task Brief: Garmin Provider Prerequisites Intake (10/10)

## Metadata

- `id`: `2026-06-23-garmin-provider-prerequisites-intake-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-23`
- `updated`: `2026-06-23`
- `mode`: `docs-only provider prerequisite evidence fill`
- `parent_brief`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `depends_on`:
  - `docs/task-briefs/planned/2026-06-23-garmin-provider-data-scope-retention-ai-audit-10-10.md`
  - `docs/task-briefs/planned/2026-06-23-training-history-multi-sport-activity-contract-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-23-training-history-generic-activity-data-model-foundation-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-23-calendar-stats-swim-actuals-mapping-v1-10-10.md`
- `related_blocked_briefs`:
  - `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`
  - `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-23`
- `base`: `main@1f3b74ac`
- `audit_status`: `ready`
- `decision`: Execute this docs-only evidence-fill slice now; keep every Garmin/provider runtime path blocked until the required external evidence and owner decisions are complete.
- `reason`: PR `#1223` established the data-scope, retention, AI-use, and multi-provider architecture boundaries, and PR `#1224` created the intake shell. This slice turns the shell into an actionable evidence packet that separates confirmed public-source facts from missing provider facts, owner decisions, and runtime blockers.
- `must_refresh_before_execution_if`: Refresh if Garmin official docs, Garmin partner/application status, API access terms, credentials handling, sample payloads, FIT SDK requirements, provider schemas, source/duplicate policies, retention decisions, AI/model processor rules, privacy/cookie copy, `training_activity_events`, `provider_activity_evidence`, export/delete routes, scorecard categories, or verification lanes change.

## Goal

Create a concrete prerequisite intake checklist and decision record that tells the owner exactly what must be obtained or decided before Garmin/provider runtime work can start safely.

## Pre-Implementation Owner Explanation

Codex skal lage en forberedelsesbrief, ikke Garmin-kode. Vi samler hva som må være på plass før vi kan bygge Garmin-kobling: tilgang, prøvepayloads, FIT-filer, samtykke/terms, duplicate-regler, retention, AI-bruk og support. Det betyr noe fordi runtime uten disse faktaene kan lagre for mye sensitiv data, telle feil, bryte provider-vilkår eller gjøre databasen treg. Utenfor scope nå er OAuth, importer, migrasjoner, UI, råfil-lagring, AI-kall og reconciliation.

## Current Execution Status

This in-progress slice is docs-only and evidence-only.

Confirmed from public official sources:

- Garmin Connect Developer Program APIs are business/enterprise provider APIs, not public no-approval endpoints.
- Activity API is the receive-side activity source and can expose detailed activity data plus FIT/GPX/TCX files after user consent and device sync.
- Health API is all-day health/wellness context and includes sensitive wellness/biometric metrics; it is not completed-workout truth.
- Training API and Courses API are send/publish surfaces; they do not prove a workout was completed.
- Program APIs use OAuth 2.0 and may be combined in one application after approval.
- Garmin brand/attribution requirements apply to Garmin-sourced and Garmin-derived displays, exports, and secondary surfaces.
- FIT is compact, extensible, and forward-compatible, but parser/dependency selection remains blocked until sample files and retention decisions exist.

Missing before runtime:

- approved Garmin partner/application access and credential path;
- actual app-specific API scopes, terms, and commercial/license constraints;
- representative swim Activity API JSON and FIT files;
- source provenance and alias/correlation facts from samples;
- owner-approved duplicate/source-precedence thresholds;
- retention/export/delete/disconnect decisions for every stored data class;
- provider terms and user consent decision for AI/model processor use;
- support/rollback checklist and disabled-by-default runtime gate.

Runtime status:

- `Garmin import-only proof`: blocked.
- `Garmin Training API send proof`: blocked.
- `Raw file storage and retention foundation`: blocked.
- `Health-context summaries`: blocked.
- `AI feature-view summaries`: blocked.
- `Provider reconciliation UI`: blocked.

Next owner-facing action after this slice:

- collect the Garmin/provider evidence packet below, then choose exactly one future runtime child or keep runtime blocked.

## Product Decision

Recommendation: do this intake before any runtime implementation brief.

Runtime remains blocked until the intake has enough evidence to choose one of these next implementation paths:

1. `Garmin import-only proof`: Activity API/FIT provider-evidence import without send-job matching.
2. `Garmin Training API send proof`: send-job identity, payload fingerprint, and provider alias/correlation without completion side effects.
3. `Raw file storage and retention foundation`: storage/TTL/export/delete path for FIT/GPX/TCX and raw JSON artifacts.
4. `Health-context summaries`: daily/weekly wellness summaries separated from activity truth.
5. `AI feature-view summaries`: compact, redacted, consent-aware model context without raw provider payloads.
6. `Provider reconciliation UI`: planned/sent/received/actual comparison and review actions.

Do not choose a runtime path until the intake can state which Garmin surfaces are approved, what sample data proves, what provider terms allow, and what data may be retained or used in AI.

## Official Source Refresh

Checked on `2026-06-23` from public Garmin sources:

- Activity API: https://developer.garmin.com/gc-developer-program/activity-api/
- Health API: https://developer.garmin.com/gc-developer-program/health-api/
- Training API: https://developer.garmin.com/gc-developer-program/training-api/
- Courses API: https://developer.garmin.com/gc-developer-program/courses-api/
- Women's Health API: https://developer.garmin.com/gc-developer-program/womens-health-api/
- Program FAQ: https://developer.garmin.com/gc-developer-program/program-faq/
- API Brand Guidelines: https://developer.garmin.com/brand-guidelines/api-brand-guidelines/
- FIT SDK overview: https://developer.garmin.com/fit/overview/

Current interpretation:

| Source               | Public-source fact                                                                                           | Intake consequence                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Activity API         | Activity data includes running, cycling, swimming, yoga, strength, activity details, and FIT/GPX/TCX files.  | Activity import can be first candidate, but only after sample swim JSON/FIT evidence and consent are known. |
| Health API           | Health data includes all-day metrics such as steps, sleep, heart rate, stress, Pulse Ox, and blood pressure. | Health context must be separate from activity truth and blocked from default AI/runtime until approved.     |
| Training API         | Training API publishes workouts and training plans to Garmin Connect/device sync.                            | Send state is provider delivery only and cannot count as completion.                                        |
| Courses API          | Courses API publishes courses and course points.                                                             | Courses remain out of first swim-coaching runtime unless owner selects route/course scope.                  |
| Women's Health API   | Women's Health covers menstrual cycle and pregnancy tracking context.                                        | Blocked by default until explicit product/legal/privacy/consent approval.                                   |
| Program FAQ          | APIs use OAuth 2.0; multiple API families can be used in one application after approval.                     | OAuth/least-privilege scopes and API-family selection are prerequisite decisions.                           |
| API Brand Guidelines | Garmin attribution can be required for title-level, secondary, exported, derived, and shared displays.       | Visible UI/export/support/AI-derived copy cannot ship until attribution rules are approved.                 |
| FIT SDK              | FIT is compact, interoperable, extensible, and supports activity, course, and workout files.                 | FIT parser/storage choice must wait for sample files, dependency review, and retention/export/delete rules. |

This refresh is enough for the docs-only intake. It is not enough to implement OAuth, API routes, provider calls, FIT parsing, raw file storage, consent UI, AI prompts, or reconciliation.

## Prerequisite Intake Matrix

| Intake area                       | Required evidence before runtime                                                                                                                                                       | Runtime blocked if missing                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Garmin partner/application status | Approved app/program status, available API families, preview/prod credential path, commercial/license constraints.                                                                     | Yes, for all live Garmin calls.                |
| API surface scope                 | Explicit decision for Activity API, Health API, Training API, Courses API, Women's Health API, FIT/GPX/TCX files, and any unsupported surfaces.                                        | Yes, for scope-specific runtime.               |
| OAuth and consent                 | OAuth scopes, consent copy requirements, token refresh/revocation behavior, disconnect/delete obligations, least-privilege credential handling.                                        | Yes, for connect/import/send.                  |
| Provider terms and AI use         | Whether Garmin/provider data can be transferred to model processors, used for derived coaching, stored as features, displayed/exported, or shared with support.                        | Yes, for AI feature views and derived outputs. |
| Sample payloads                   | Activity API JSON, Health API summaries if approved, FIT swim files, GPX/TCX where relevant, malformed examples, unknown values, timezone/unit edge cases.                             | Yes, for import/FIT/parsing.                   |
| Source provenance                 | Provider user IDs, activity IDs, file IDs, device/source metadata, hub/original source where available, last-seen/deleted/revoked lifecycle markers.                                   | Yes, for duplicate and reconciliation work.    |
| Alias/correlation                 | Whether Garmin accepts client references for Training API sends, whether returned activities include any local reference, and which provider aliases are stable.                       | Yes, for sent-vs-received matching.            |
| Duplicate/source precedence       | Owner-approved thresholds for exact, likely, ambiguous, duplicate, provider-only, manual-conflict, and ignored states across Garmin direct, hubs, Strava/manual, and future providers. | Yes, for counting/reconciliation.              |
| Retention and deletion            | Raw file TTL, raw JSON TTL, unmapped evidence retention, health summary windows, tombstone retention, disconnect behavior, export/delete behavior.                                     | Yes, for raw storage and health context.       |
| Attribution and display           | Garmin branding/attribution requirements for UI, exports, secondary screens, support diagnostics, and AI-derived summaries.                                                            | Yes, for visible surfaces.                     |
| Support and rollback              | Disable flags, retry/backoff expectations, redacted diagnostics, owner/support runbook, replay policy, cleanup jobs, and rollback criteria.                                            | Yes, for production runtime.                   |

## Evidence Packet Tracker

Status meanings:

- `confirmed_public`: confirmed by public official docs only; still needs app-specific approval before runtime.
- `missing_provider`: requires Garmin partner portal, approval packet, sample payload, credential path, or non-public terms.
- `owner_decision_needed`: requires a product/privacy/support decision before runtime.
- `runtime_blocked`: no runtime child may start until this is resolved for the selected path.

| Evidence item                         | Current status          | Required artifact or decision                                                                                                          | Gates runtime path                                              |
| ------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Garmin partner/application status     | `missing_provider`      | Approval status, approved app/project, evaluation/production access model, commercial/license constraints.                             | All live Garmin calls.                                          |
| Approved API families                 | `owner_decision_needed` | Select first path: Activity, Training, Health, Courses, Women's Health, FIT files, or explicit deferral.                               | All runtime scoping.                                            |
| Credentials path                      | `missing_provider`      | Secure preview/prod secret handling plan; no credentials committed to repo.                                                            | OAuth/connect/import/send.                                      |
| OAuth scope and lifecycle             | `missing_provider`      | Exact scopes, refresh/revoke behavior, disconnect obligations, token expiration handling, least-privilege review.                      | OAuth/connect/import/send.                                      |
| Consent and privacy copy requirements | `missing_provider`      | Required user-facing consent text, revocation/delete copy, privacy/cookie/processor disclosure impact.                                 | Visible consent and private provider routes.                    |
| Activity API swim JSON sample         | `missing_provider`      | One representative pool swim payload plus malformed/unknown/timezone/unit examples where available.                                    | Import-only proof, reconciliation, AI summaries.                |
| Swim FIT file sample                  | `missing_provider`      | One representative FIT swim file plus file metadata; sample is handled outside repo unless explicitly redacted and approved.           | FIT parsing, raw file storage, lap/step detail.                 |
| Health API sample summary             | `missing_provider`      | Only if Health API is selected: sample sleep/stress/recovery/body metrics with exact field and sensitivity review.                     | Health-context summaries, AI readiness.                         |
| Source provenance fields              | `missing_provider`      | Provider user/activity/file IDs, device/source/original-hub fields, last-seen/deleted/revoked markers from samples.                    | Duplicate detection, reconciliation, support diagnostics.       |
| Training alias/correlation behavior   | `missing_provider`      | Whether Garmin accepts local references on send and whether returned activities include any local/provider correlation aliases.        | Send proof, sent-vs-received matching.                          |
| Duplicate/source precedence policy    | `owner_decision_needed` | Thresholds for exact, likely, ambiguous, duplicate, provider-only, manual-conflict, ignored, and hub-vs-direct precedence.             | Calendar/Stats/KPI inclusion, reconciliation, AI feature views. |
| Retention windows                     | `owner_decision_needed` | Raw file TTL, raw JSON TTL, unmapped evidence TTL, health summary window, tombstone window, AI prompt/cache retention.                 | Raw storage, health context, AI, export/delete.                 |
| Export/delete/disconnect behavior     | `owner_decision_needed` | Data class matrix for account export, account delete, Garmin disconnect, provider delete/revocation, tombstone retention, raw purge.   | OAuth runtime, storage, GDPR support.                           |
| AI/model processor allowance          | `owner_decision_needed` | Provider terms + user consent + privacy disclosure decision for whether summarized provider data can enter model context.              | AI feature-view summaries and derived coaching.                 |
| Attribution/display requirement       | `missing_provider`      | Approved Garmin attribution rules for UI, exports, secondary screens, support diagnostics, AI-derived summaries, and shared artifacts. | Any visible Garmin-derived surface.                             |
| Support/rollback checklist            | `owner_decision_needed` | Disable flag, retry/backoff, replay, cleanup, redacted diagnostics, support runbook, incident owner, rollback criteria.                | Production runtime.                                             |
| Runtime path choice                   | `owner_decision_needed` | Choose exactly one next implementation child after evidence is complete, or keep runtime blocked.                                      | PR creation for any runtime child.                              |

## Safe Defaults Until Evidence Exists

- Runtime stays disabled and no Garmin/provider runtime branch should be started.
- No provider payloads, FIT/GPX/TCX files, OAuth tokens, credentials, raw health data, exact GPS routes, or model prompt payloads are committed.
- Manual swim actuals remain the only trusted Calendar Trends `Swimming` source.
- Provider evidence remains private evidence only and cannot mark completion.
- Health API and Women's Health API data stay blocked from default storage and AI use.
- Courses API remains out of scope unless route/course navigation becomes explicit product scope.
- Raw files are treated as short-lived private artifacts outside hot product tables.
- AI gets no provider data until terms, consent, processor allowance, minimization, and redaction are explicitly approved.
- Unknown, deprecated, duplicate, malformed, revoked, deleted, unsupported, or sensitive provider values fail closed to `unmapped`, `unsupported`, `needs_review`, `blocked`, or `ignored_duplicate`.

## Runtime Path Readiness

| Candidate runtime child                     | Current readiness | Missing before a runtime brief can start                                                                                                    | Default recommendation                                                           |
| ------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `Garmin import-only proof`                  | `blocked`         | Partner approval, Activity API scope, sample swim JSON, sample swim FIT or explicit FIT deferral, consent, retention, support/rollback.     | First runtime candidate only if Activity API samples arrive before send details. |
| `Garmin Training API send proof`            | `blocked`         | Training API access, credentials, OAuth lifecycle, swim mapping, local correlation behavior, payload fingerprint policy, attribution.       | Keep blocked until partner access and send/alias facts exist.                    |
| `Raw file storage and retention foundation` | `blocked`         | Approved raw-file purpose, TTL, storage bucket/access pattern, export/delete/disconnect behavior, parser/dependency decision, cleanup job.  | Do only when FIT/raw files are needed for a selected import/review path.         |
| `Health-context summaries`                  | `blocked`         | Health API approval, metric-level purpose, consent, retention, sensitive/medical exclusions, sample summaries, export/delete, support copy. | Keep blocked until health context is explicitly selected.                        |
| `AI feature-view summaries`                 | `blocked`         | Provider terms, user consent, privacy disclosure, model-processor allowance, feature minimization, redaction tests, no raw payload use.     | Keep blocked until terms/consent approve exact model use.                        |
| `Provider reconciliation UI`                | `blocked`         | Received evidence samples, send-job or import-only decision, alias/correlation facts, duplicate thresholds, attribution, review UX brief.   | Do after import/send facts, not before.                                          |

## Owner Decision Register

Open decisions before runtime:

| Decision                  | Recommended default now                                                                                                   | Owner/provider input needed                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| First Garmin runtime path | Prefer `Garmin import-only proof` only if Activity API swim JSON/FIT samples are available first; otherwise keep blocked. | Which API family Garmin approves and which sample data arrives first.                                  |
| Health API scope          | Block by default.                                                                                                         | Whether sleep/stress/recovery/body metrics are product scope and legally/contractually allowed.        |
| Women's Health scope      | Block by default.                                                                                                         | Separate product/legal/privacy/consent approval.                                                       |
| Courses API scope         | Out of scope by default.                                                                                                  | Explicit route/course-navigation product decision.                                                     |
| Duplicate precedence      | Manual reviewed/canonical history wins; exact provider matches can attach as evidence; likely/ambiguous requires review.  | Thresholds for exact/likely/ambiguous/manual-conflict/ignored and hub-vs-direct precedence.            |
| Raw retention             | Treat raw FIT/GPX/TCX as short-lived private artifacts outside hot tables.                                                | Exact TTLs for raw files, raw JSON, unmapped evidence, tombstones, health summaries, and AI artifacts. |
| AI/model use              | Block provider data from prompts by default.                                                                              | Provider terms, user consent text, privacy/processor allowance, and minimization evidence.             |
| Disconnect/delete         | Preserve only user-approved canonical history by default; purge raw/provider artifacts under retention rules.             | Garmin-specific delete/revocation obligations and product policy for disconnect vs account delete.     |
| Attribution               | Do not expose Garmin-derived UI/export/support labels until attribution is approved.                                      | Approved brand-guideline treatment for every visible/exported/derived surface.                         |
| Support/rollback          | Runtime must be disabled by default, replay-safe, and diagnostically redacted.                                            | Incident owner, disable flag, retry/backoff, replay, cleanup, support runbook, and rollback criteria.  |

## Minimum Evidence Packet

The intake is ready to unblock a runtime child only when it includes:

- owner-approved Garmin API families for the first runtime path;
- official provider terms/API notes captured as links or summarized decisions;
- at least one representative swim Activity API payload and FIT file, or an explicit import-only deferral;
- explicit source-provenance fields available from samples;
- duplicate/source-precedence policy for manual vs Garmin direct vs hub/provider copies;
- retention windows for raw files, raw JSON, unmapped evidence, health context, AI prompt artifacts, and tombstones;
- export/delete/disconnect behavior for every stored data class;
- AI/model-processor allowance or an explicit block;
- attribution/display requirements for visible Garmin-derived data;
- rollback/support checklist and disabled-by-default runtime gate.

## Explicit Non-Scope

- Runtime code.
- Supabase migrations or generated DB type changes.
- OAuth/token storage, credentials, provider calls, webhooks, polling, queues, retry workers, or background jobs.
- Raw FIT/GPX/TCX or raw provider payload storage.
- FIT parser dependency selection or file parsing.
- UI, consent screens, Help/Guide runtime copy, screenshots, or visible provider labels.
- Calendar/Trends/Stats counting changes.
- AI prompts, model calls, adaptive replanning, or schedule mutation.
- Real Garmin reconciliation or send-to-Garmin implementation.
- Touching `Ja.docx`.

## Domain Granularity Contract

User's mental object:

- "The evidence packet that makes Garmin/provider runtime safe to start."

Canonical objects:

- Docs-only prerequisite checklist and decision record in this brief.
- Future runtime objects remain separate: provider connection, provider import run, provider activity evidence, raw file reference, canonical `training_activity_events`, health-context summary, AI feature view, send job, and reconciliation decision.

Child object levels:

| Level                        | Meaning                                                         | Active slice support                                  |
| ---------------------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| Partner/application approval | Garmin program/app access and commercial constraints.           | `support-only`; intake checklist only                 |
| API family                   | Activity, Health, Training, Courses, Women's Health, FIT files. | `view`; docs decision matrix                          |
| OAuth/consent                | Scopes, consent text, revocation, token lifecycle.              | `support-only`; no runtime UI                         |
| Sample payload/file          | JSON/FIT/GPX/TCX examples and edge cases.                       | `support-only`; no samples committed                  |
| Source provenance            | Device/source/alias/original-hub facts.                         | `support-only`; future mapping required               |
| Duplicate policy             | Match thresholds and source precedence.                         | `support-only`; owner decision required               |
| Retention/delete             | TTL, disconnect, tombstones, export/delete.                     | `support-only`; future runtime contract required      |
| AI allowance                 | Whether provider data may enter model context.                  | `support-only`; terms/legal/privacy decision required |
| Support/rollback             | Diagnostics, disable/replay/recover path.                       | `support-only`; future runbook update required        |

Mature reference surfaces:

- Provider evidence boundary: `provider_connections`, `provider_import_runs`, `provider_activity_evidence`, `lib/my-library/provider-evidence.ts`.
- Canonical activity foundation: `training_activity_events`, `lib/my-library/training-activity-events.ts`.
- Manual truth/reference UI: Review Actual and Calendar Trends swim actuals mapping.
- Provider scope audit: `docs/task-briefs/planned/2026-06-23-garmin-provider-data-scope-retention-ai-audit-10-10.md`.

10/10 gate:

- A future Garmin/provider runtime brief cannot claim 10/10 unless this intake's relevant evidence packet is complete for the selected runtime path.

## Data Placement And Sync Contract

Current docs-only slice:

- Server-canonical data: N/A; no runtime data is created.
- Local-only data: N/A; no browser/device state changes.
- Sync policy: N/A; this brief only records prerequisites.

Future runtime boundaries this intake must decide:

- OAuth tokens and secrets: encrypted secret storage only, never logs or hot product tables.
- Raw files/payloads: storage with TTL and references, not Calendar/Trends/AI query paths.
- Provider evidence summaries: private Postgres rows with owner scope and redacted diagnostics.
- Canonical history: `training_activity_events` only after mapping/review.
- Health context: separate summary model; never completion truth.
- AI context: compact feature views only when terms, consent, and privacy allow.
- Cache/invalidation: provider routes private/no-store; mapped writes invalidate history, Calendar/Trends, export/delete, and AI feature snapshots where applicable.

## Identity And Rename Contract

- FreeSwimming stable IDs remain canonical for users, planned workouts, actual history, and future send/review decisions.
- Garmin user IDs, activity IDs, workout IDs, course IDs, file IDs, device IDs, and hub IDs are provider aliases only.
- Human-readable Garmin activity titles, workout names, sport labels, device names, and display strings are not identity.
- If Garmin accepts client references, future send jobs must store the local reference and still tolerate provider responses that omit it.
- Duplicate provider aliases, stale payload fingerprints, deleted provider rows, revoked connections, and unknown source IDs must be detectable and repairable.
- Renaming FreeSwimming workouts/programs must not create new canonical entities; repurposing requires new canonical entities before provider evidence attaches.

## Forward Compatibility Contract

Future values expected:

- new Garmin API fields, file types, devices, sport/sub-sport values, health metrics, provider statuses, attribution rules, and consent states;
- future providers such as Apple HealthKit, Android Health Connect, Strava, Polar, Suunto, Wahoo, WHOOP, Oura, Fitbit/Google Health, and swim-specific wearables;
- new export formats, support diagnostics, retention tiers, AI feature fields, locales, and review actions.

Automatic behavior:

- unknown provider values stay evidence-only and cannot count as completion truth;
- manual swim actuals keep driving current Calendar Trends `Swimming`;
- provider evidence remains separate from canonical history until mapped/reviewed.

Explicit mapping required:

- every provider's terms, consent, attribution, AI-use, retention, export/delete, and disconnect behavior;
- any new sport/source/status entering Calendar, Trends, KPIs, AI recommendations, support labels, or user-facing copy;
- raw file parser selection and storage/TTL behavior;
- source precedence when the same activity arrives through direct provider, hub provider, manual correction, or future adapter.

Safe fallback:

- unknown, deprecated, malformed, or sensitive provider values fail closed to `unmapped`, `unsupported`, `needs_review`, or blocked;
- unsupported sensitive categories such as Women's Health, diagnostic-style metrics, exact GPS routes, and high-frequency biometrics remain out of default storage and AI prompts.

Proof required later:

- provider sample fixtures, unknown-value tests, duplicate/source-precedence tests, export/delete tests, retention cleanup evidence, AI prompt minimization snapshots, and route/label/support sweep.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                       | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Intake identifies the exact evidence packet needed before each Garmin/provider runtime path.                                                                                             | prerequisite matrix + acceptance criteria   | `5/5`                   |
| UX flow clarity                               | `target`     | Future user-facing consent/review/runtime paths are blocked unless next actions and missing prerequisites are explicit.                                                                  | intake matrix + non-scope                   | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this docs-only brief changes no rendered UI, layout, print, screenshot, or brand asset.                                                                                      | explicit non-visual rationale               | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Provider evidence, canonical history, health context, AI features, send jobs, and reconciliation remain separate until evidence supports mapping.                                        | data placement + identity contracts         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, CRUD flow, publishing workflow, or operator edit surface changes.                                                                                           | explicit admin-editor non-scope rationale   | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered controls or accessibility semantics change.                                                                                                                      | explicit non-UI rationale                   | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Intake blocks raw files, raw JSON, and high-cardinality samples from hot routes until storage/TTL/query rules exist.                                                                     | performance/data placement contract         | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Each future data class has a designated boundary and runtime remains blocked where the boundary is missing.                                                                              | data placement table                        | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Future runtime must use private/no-store provider reads and list invalidation targets before implementation.                                                                             | data placement contract                     | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing, malformed, duplicate, unknown, revoked, deleted, and unsupported provider states fail closed to blocked/review states.                                                          | forward compatibility + matrix              | `5/5`                   |
| Security and authz                            | `target`     | Intake requires owner-scoped routes, least-privilege OAuth, encrypted token handling, and no provider/browser IDs trusted for ownership before runtime.                                  | prerequisite matrix + stack gate            | `5/5`                   |
| Privacy and compliance                        | `target`     | Terms, consent, AI use, raw-data TTL, sensitive categories, export/delete, and disconnect behavior must be decided before storage/use.                                                   | retention/privacy sections                  | `5/5`                   |
| Content governance                            | `target`     | Brief becomes the source-of-truth gate for provider prerequisite collection before runtime briefs.                                                                                       | parent links + checkpoint                   | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: future support/admin diagnostics are required, but no admin workflow changes now.                                                                                       | support impact rationale                    | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because Garmin/provider health data is private authenticated data and no public crawl surface changes.                                                                               | private-data rationale                      | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this brief creates no public AI-discoverable content; AI here means private model context.                                                                                   | private AI-context rationale                | `N/A`                   |
| Analytics and KPI observability               | `target`     | Future provider/runtime events and KPI inclusion must be blocked unless source/status taxonomy and safe payload rules are mapped.                                                        | prerequisite matrix + forward compatibility | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Garmin access may have license/commercial terms, but this brief changes no checkout, entitlement, pricing, invoice, refund, payout, or revenue flow.                    | commercial-term intake item                 | `5/5`                   |
| Incident response and support operations      | `target`     | Runtime cannot start until disable, replay, redacted diagnostics, cleanup, rollback, and support checklist requirements are listed.                                                      | support/rollback intake item                | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this docs-only intake does not mutate revenue recognition, payouts, invoices, refunds, entitlements, or accounting data; provider license cost is vendor/product input only. | explicit finance non-scope rationale        | `N/A`                   |
| i18n operational readiness                    | `target`     | Future provider/source/status labels must be typed and translation-ready before visible copy ships.                                                                                      | forward compatibility label contract        | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Uses existing Next/Supabase/provider-evidence/activity-history contracts and blocks parser/provider dependencies until sample evidence justifies them.                                   | stack gate + no package diff                | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass task-brief lint; future runtime requires fixtures, negative paths, retention/export/delete, AI minimization, and release gates.                                      | validation section                          | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Intake requires storage/TTL/aggregation and bounded imports before any raw/high-volume provider data path can ship.                                                                      | retention/performance contract              | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Future runtime must be disabled-by-default or safely gated, replay-safe, cleanup-capable, and rollback-documented before release.                                                        | support/rollback matrix item                | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no UI changes now;
  - future consent/review/provider UI must reuse existing My Library/Calendar/Review Actual patterns and provide screenshot handoff.
- TypeScript/domain:
  - provider, source, sport, status, retention tier, and AI feature fields must use typed allowlists with unknown-safe fallback before runtime.
- Supabase/data:
  - future runtime requires explicit migrations, RLS, owner-scoped indexes, generated DB types, export/delete coverage, and negative-path tests.
- External services:
  - this brief uses PR `#1223` as the current official-doc audit baseline;
  - future runtime must refresh official Garmin docs and partner terms before implementation;
  - OAuth, webhooks/polling, retry/backoff, rate limits, token storage, and observability must be specified before code.
- UI system:
  - N/A now;
  - future visible provider copy requires route/label/support sweep, attribution review, and screenshot handoff.
- Testing:
  - docs-only: `npm run lint:briefs`, `npm run lint:briefs:all`, `git diff --check`;
  - future runtime: fixtures, malformed/unknown/duplicate/revoked/deleted payload tests, authz, export/delete, retention cleanup, AI prompt minimization, performance/query tests, `verify:pre-pr`, CI, `verify:pre-merge`.

## Codex Skill / Stack Readiness Radar

Capability audit:

- Available now: local shell, repo task-brief linting, existing task-brief and provider-evidence contracts.
- Not needed now: browser/screenshot tooling, Stripe plugin, runtime provider tooling, external provider credentials.
- Do not install or configure local Codex skills/plugins/MCP servers for this docs-only intake.

Systemic findings:

| Surface                  | Finding                                                                                                        | Severity | Recommended Type                     | Owner Decision Needed             | Follow-Up Brief Path                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ | --------------------------------- | ----------------------------------- |
| Provider access facts    | Runtime cannot start without concrete Garmin access, API scopes, terms, credentials path, and sample payloads. | `high`   | `safe process/docs update`           | yes, collect provider facts       | this brief                          |
| Security/privacy runtime | OAuth, token vault, raw files, Health API, AI use, and delete/revocation need explicit decisions before code.  | `high`   | `deferred architecture decision`     | yes, before runtime               | future selected runtime child       |
| Duplicate/source policy  | Garmin direct, hubs, manual rows, and future providers can duplicate the same activity.                        | `high`   | `bounded implementation child` later | yes, thresholds/source precedence | future reconciliation/adapter brief |

Return path:

- Parent: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Previous audit: `docs/task-briefs/planned/2026-06-23-garmin-provider-data-scope-retention-ai-audit-10-10.md`
- Next step after this intake: owner/provider evidence collection, then select one bounded runtime child or keep Garmin runtime blocked.

## Help/Guide And Support Impact

Current docs-only intake:

- No Help/Guide runtime copy changes are required.
- No support runbook changes are required until a runtime path is selected.

Future runtime:

- Update `docs/runbooks/auth-account-support.md`, `docs/api-contracts.md`, `docs/runbooks/gdpr-data-rights.md`, `docs/architecture/external-service-contract-matrix.md`, privacy/cookie surfaces, and Help/Guide assertions when visible provider labels, consent, recovery, delete/disconnect, export, or support diagnostics change.

## Route / Label / Support Surface Sweep

No route/label/support sweep is required for this docs-only brief because it does not rename or expose product labels.

Before any future runtime or UI child, run a targeted sweep for:

- `Garmin`, `Activity API`, `Health API`, `Training API`, `FIT`, `provider evidence`, `source provenance`, `duplicate`, `revocation`, `disconnect`, `retention`, `AI`, `model processor`, `export/delete`, `Calendar Trends`, `Review actual`, `manual actual`, `training_activity_events`.

## Scope

- Move the planned docs-only intake brief to in-progress and turn it into an actionable evidence packet.
- Convert the PR `#1223` and PR `#1224` audit outcomes into explicit current-status, missing-evidence, and owner-decision trackers.
- Update the training-history parent and linked provider-scope audit so the current path points to this in-progress intake, not runtime.
- Keep real Garmin/provider runtime blocked.

## Out Of Scope

- Runtime implementation, migrations, tests against runtime code, UI, screenshots, PR screenshots, provider credentials, provider payload commits, and live Garmin calls.
- Moving blocked Garmin briefs to active.
- Merge or release of any provider runtime.

## Acceptance Criteria

1. In-progress prerequisites-intake brief exists and links to the parent and Garmin/provider data scope audit.
2. Intake matrix and evidence tracker cover provider access, scopes, sample payloads, terms/AI, OAuth/consent, source provenance, alias/correlation, duplicate policy, retention, attribution, support, and rollback.
3. The brief states clear runtime blockers, safe defaults, owner decisions, and selectable future runtime paths.
4. Data placement, identity, forward compatibility, support, stack, and scorecard contracts remain explicit.
5. Parent and related audit references point to this in-progress intake as the current evidence-fill step.
6. Changed briefs pass task-brief lint, docs-only verification, and diff checks.

## Validation

Docs-only validation required:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:docs-only`
- `git diff --check`

Optional PR packaging validation:

- `npm run verify:pre-pr` docs-only lane before PR update.
- `npm run verify:pre-merge` docs-only lane before merge recommendation.

## Local Tooling Prerequisite

- Use repo-pinned Node/npm from `.nvmrc` and `packageManager`.
- Before reporting `npm`/`node` missing, bootstrap through `nvm use --silent`.

## Manual QA Environments

`N/A`; no UI, browser workflow, deployment behavior, install flow, print/export rendering, or visible route behavior changes.

No screenshot handoff is required because this is docs-only and non-visual.

## Constraints

- Do not implement Garmin runtime from this brief.
- Do not commit secrets, credentials, OAuth tokens, raw provider payloads, raw health data, FIT/GPX/TCX files, or sample data exports.
- Do not weaken the rule that provider evidence, health context, non-swim, unknown, unsupported, duplicate, unmapped, and needs-review rows do not count as completion truth.
- Do not use provider data in model prompts without provider terms, user consent, and privacy/processor approval.
- Do not touch `Ja.docx`.

## Session Continuity And Recovery

Canonical recovery order:

1. `git status -sb`
2. `git log --oneline -n 10`
3. Reopen this brief, the Garmin/provider data scope audit, and the training-history parent brief.

## Checkpoint Log

- `2026-06-23 | planned | created from clean synced main@fe4d632a after Garmin/provider data scope audit PR #1223 merged and post-merge preflight found no closeout; owner confirmed creating a prerequisites-intake brief before any Garmin runtime; decision: document the evidence packet and runtime blockers for provider access, sample payloads, consent/terms, duplicate policy, retention, AI use, and support/rollback | next: validate docs-only changes and wait for owner decision on whether to package as PR or collect provider facts`
- `2026-06-23 | in-progress | owner explicitly approved executing the docs-only prerequisites/evidence-fill slice from clean main@1f3b74ac; moved this brief to in-progress and expanded it with official-source refresh, current runtime-blocked status, evidence packet tracker, safe defaults, runtime readiness, and owner decision register | next: update linked parent/audit references, run docs-only validation, commit, push, open PR, and keep Garmin runtime blocked`
- `2026-06-23 | done | PR #1225 merged as squash commit 2247dcf3; post-merge preflight requested repo-managed docs-only closeout; moved this brief to done and recorded completion evidence | next: keep Garmin runtime blocked until provider access, sample payloads, consent/terms, duplicate policy, retention, AI-use, and support/rollback facts are collected`

## Completion Record

- `completed`: `2026-06-23`
- `merged_pr`: `#1225`
- `squash_commit`: `2247dcf3`
- `result`: Closed the Garmin provider prerequisites intake by turning the planned shell into an actionable evidence packet with official-source refresh, current blocked status, missing-provider facts, owner-decision register, safe defaults, and runtime-path readiness gates. No Garmin runtime, OAuth, imports, FIT parsing, raw storage, AI calls, UI, migrations, credentials, secrets, or sample payloads were added.
- `validation`: `npm run verify:docs-only` PASS (`artifacts/test-runs/20260623-142548`), `npm run verify:pre-pr` PASS on `aad7ded9`, GitHub CI PASS for PR `#1225`, `npm run verify:pre-merge` PASS (`artifacts/verify-pre-merge/20260623-122836.json`).
- `10/10 claim`: yes - all critical target categories reached `5/5` for this docs-only planning artifact; runtime remains intentionally blocked.

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

| Category                                      | Achieved Score | Evidence                                                                                                                            | Gaps / Notes                                                               |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Evidence tracker, runtime readiness table, owner decision register, PR `#1225`.                                                     | No gap for docs-only intake; provider runtime remains blocked.             |
| UX flow clarity                               | `5/5`          | Safe defaults and owner-facing next action in the done brief.                                                                       | No UI changed; future consent/review UI needs its own screenshot handoff.  |
| Business logic correctness and data integrity | `5/5`          | Provider evidence, canonical history, health context, AI feature views, send jobs, and reconciliation remain separated.             | No runtime data changed; future mappings need provider samples and tests.  |
| Performance (CWV + payloads)                  | `5/5`          | Brief blocks raw files, raw JSON, high-cardinality samples, and AI payloads from hot routes.                                        | Runtime storage/query budgets still require a future child.                |
| Data placement and sync boundaries            | `5/5`          | Data placement contract and evidence packet tracker define every future data class boundary.                                        | Provider OAuth/raw storage remains blocked.                                |
| Caching and invalidation strategy             | `5/5`          | Future provider reads must be private/no-store and mapped writes list affected surfaces.                                            | No runtime cache changed.                                                  |
| Reliability and failure handling              | `5/5`          | Unknown, duplicate, malformed, revoked, deleted, unsupported, and sensitive provider values fail closed.                            | Runtime retry/replay tests are future work after provider facts.           |
| Security and authz                            | `5/5`          | Least-privilege OAuth, encrypted token handling, owner-scoped routes, and no provider/browser ID trust are required before runtime. | No secrets, credentials, tokens, or routes were added.                     |
| Privacy and compliance                        | `5/5`          | Terms, consent, AI use, retention, export/delete/disconnect, sensitive categories, and attribution are blocked until decided.       | Legal/provider decisions still required before runtime.                    |
| Content governance                            | `5/5`          | Brief is now the source-of-truth gate before Garmin/provider runtime.                                                               | No gap for docs-only closeout.                                             |
| Analytics and KPI observability               | `5/5`          | Future KPI inclusion requires source/status taxonomy and safe payload mapping.                                                      | No analytics runtime changed.                                              |
| Incident response and support operations      | `5/5`          | Runtime must define disable flag, replay, cleanup, redacted diagnostics, support runbook, and rollback before release.              | Future support runbook update required only when runtime path is selected. |
| i18n operational readiness                    | `5/5`          | Future provider/source/status labels must be typed and translation-ready before visible copy ships.                                 | No visible copy changed.                                                   |
| Stack-fit and dependency discipline           | `5/5`          | Uses existing Next/Supabase/provider-evidence/activity-history contracts and blocks parser/provider dependencies.                   | No new dependency added.                                                   |
| Testing and QA automation                     | `5/5`          | `verify:docs-only`, `verify:pre-pr`, GitHub CI, and `verify:pre-merge` all passed.                                                  | Runtime fixture/negative-path tests remain future work.                    |
| Scalability and cost efficiency               | `5/5`          | Raw/high-volume provider data must use storage/TTL/aggregation and avoid hot route scans.                                           | Runtime cleanup jobs remain future work after owner decisions.             |
| DevOps and rollback readiness                 | `5/5`          | Docs-only rollback is revert of `2247dcf3`; future runtime must be disabled-by-default and replay-safe.                             | No runtime rollback path needed in this PR.                                |
