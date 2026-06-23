# Task Brief: Garmin Provider Data Scope, Retention, And AI Readiness Audit (10/10)

## Metadata

- `id`: `2026-06-23-garmin-provider-data-scope-retention-ai-audit-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-23`
- `updated`: `2026-06-23`
- `mode`: `plan only / docs-only official-doc and local app audit`
- `parent_brief`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `related_contracts`:
  - `docs/task-briefs/planned/2026-06-23-training-history-multi-sport-activity-contract-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-23-training-history-generic-activity-data-model-foundation-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-23-calendar-stats-swim-actuals-mapping-v1-10-10.md`
- `related_blocked_briefs`:
  - `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`
  - `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-23`
- `base`: `main@fe4d632a`
- `audit_status`: `ready`
- `decision`: Use this docs-only audit before any Garmin Activity API, Health API, FIT parsing, provider runtime, AI-retrospective, multi-provider adapter, or broad health-context implementation.
- `reason`: Official Garmin docs show Activity, Health, Training, Courses, and Women's Health are separate data/product surfaces, while the app currently has provider-evidence summaries and generic activity-history rows but no token storage, raw file storage, health-context model, or AI-safe feature view. A 10/10 solution needs a Garmin-first provider model that preserves Garmin richness without hardcoding FreeSwimming to Garmin-only, plus explicit data minimization, retention, AI-use, terms, source-provenance, deletion/revocation, and database performance boundaries before requesting or storing broad provider data.
- `must_refresh_before_execution_if`: Refresh if Garmin official docs, Garmin partner/application status, API access terms, sample payloads, FIT SDK requirements, provider schemas, Apple HealthKit, Android Health Connect, Strava, Polar, Suunto, Wahoo, WHOOP, Oura, Fitbit/Google Health, swim-wearable partner/export docs, `training_activity_events`, `provider_activity_evidence`, export/delete routes, privacy/cookie copy, scorecard categories, or verification lanes change.

## Goal

Define the 10/10 Garmin/provider data scope, retention, and AI-readiness contract so FreeSwimming can later request rich Garmin data without making the database slow, storing unused sensitive data indefinitely, letting provider data silently become training truth, or blocking future Apple Health, Android Health Connect, Strava, Polar, Suunto, Wahoo, WHOOP/Oura/Fitbit, or swim-wearable adapters.

## Pre-Implementation Owner Explanation

Codex skal lage en audit-plan, ikke Garmin-kode. Vi avklarer hva Garmin kan levere, hva appen vår bør hente, hva som bare skal brukes som kortvarig rådata, hva som skal bli treningshistorikk, og hva ChatGPT/AI trygt kan bruke som sammendrag. Garmin skal være første dype kilde, men modellen skal ikke låse oss til Garmin alene når Apple Health, Health Connect, Strava, Polar, Suunto, Wahoo, recovery-wearables eller swim wearables kan bli aktuelle senere. Det betyr noe fordi mer data kan gi bedre programmer for utøverne, men helse- og aktivitetsdata må minimeres, slettes eller aggregeres riktig. Utenfor scope nå er OAuth, provider-import, FIT-parsing, UI, database-migrasjoner, nye API-ruter, og at Garmin-data teller som fasit.

## Product Decision

Recommendation: ask Garmin for broad enough access to support future coaching quality, but implement a strict product-owned data funnel.

Principle: Garmin-first, not Garmin-only.

This means:

- keep Garmin as the first deep provider audit and expected primary training-data source;
- preserve Garmin-specific richness where permitted, including FIT/activity detail and health-context summaries when approved;
- avoid reducing Garmin to the lowest common denominator of weaker providers;
- map only trusted, normalized facts into canonical FreeSwimming activity history and AI feature views;
- let future providers plug in as adapters that create evidence/context through the same product-owned model.

Do not implement "store everything forever".

10/10 target model:

1. Consent and scope:
   - request only Garmin scopes/data categories that have a named FreeSwimming purpose;
   - make activity data, health context, women's health, courses, and send-to-Garmin separate consent/product decisions.
2. Raw provider intake:
   - store raw files/payloads outside hot product tables, preferably in storage with encryption, access controls, and short retention;
   - never put raw FIT/GPX/TCX, raw Health API JSON, OAuth tokens, or full provider responses into Calendar/Trends/AI query paths.
3. Canonical training history:
   - store durable workout/activity summaries in `training_activity_events` only after explicit mapping/review rules;
   - keep Garmin provider IDs as aliases/evidence, not app identity.
4. Health context:
   - store or derive daily/weekly wellness summaries separately from training history;
   - use health metrics as context for coaching, not as proof an activity was completed.
5. AI feature view:
   - pass ChatGPT compact, typed summaries and recent trend windows, not raw provider files or full biometric timelines;
   - block provider data from third-party model processors unless provider terms, user consent, and FreeSwimming privacy disclosures allow that exact use;
   - require explicit product/legal review before sensitive categories such as menstrual cycle or pregnancy context are used.
6. Retention:
   - keep canonical activity history while the user account exists unless the user deletes it;
   - auto-delete or aggregate raw provider files, raw JSON, second-level samples, and unused unmapped evidence after bounded windows.
7. Provenance and lifecycle:
   - store original source, hub source, consent scope, import run, last-seen time, and deletion/revocation state separately from canonical activity truth;
   - never double-count the same workout when it arrives from Garmin direct, Apple Health/Health Connect, Strava, or another hub.

## Official Garmin Source Baseline

Checked on `2026-06-23` from official Garmin sources:

- Garmin Activity API: https://developer.garmin.com/gc-developer-program/activity-api/
- Garmin Health API: https://developer.garmin.com/gc-developer-program/health-api/
- Garmin Training API: https://developer.garmin.com/gc-developer-program/training-api/
- Garmin Courses API: https://developer.garmin.com/gc-developer-program/courses-api/
- Garmin Women's Health API: https://developer.garmin.com/gc-developer-program/womens-health-api/
- Garmin Connect Developer Program FAQ: https://developer.garmin.com/gc-developer-program/program-faq/
- Garmin API Brand Guidelines: https://developer.garmin.com/brand-guidelines/api-brand-guidelines/
- Garmin FIT SDK overview: https://developer.garmin.com/fit/overview/
- Garmin FIT file types: https://developer.garmin.com/fit/file-types/
- Garmin FIT cookbook: https://developer.garmin.com/fit/cookbook/

Current interpretation:

- Activity API is the receive-side workout/activity source. It covers detailed data captured during an activity, including running, cycling, swimming, yoga, strength training, activity details, and potentially FIT/GPX/TCX files.
- Health API is all-day health/wellness context, not completed workout truth. It covers steps, intensity minutes, sleep, calories, heart rate, stress, Pulse Ox, Body Battery, body composition, respiration, blood pressure, and more granular heart-rate metrics.
- Training API is the send/publish side for workouts and training plans. It does not prove the user completed the workout.
- Courses API is also a send/publish surface for courses and course points, not completed activity truth.
- Women's Health API is high-sensitivity wellness context around menstrual cycle and pregnancy tracking. It must remain blocked until a separate product/legal/consent decision exists.
- Garmin Connect Developer Program APIs use OAuth 2.0, require business/program approval, and can combine APIs in one application after approval.
- Garmin says new devices are generally supported automatically, but every future metric is not guaranteed; unknown values must fail closed.
- Some metrics/access can require license fees or minimum device-order/commercial terms; this must be checked before revenue or finance assumptions.
- FIT is compact, extensible, interoperable, and forward-compatible, but full FIT parsing must be handled as provider-aware tooling, not as ad hoc JSON in product tables.
- Garmin-sourced and Garmin-derived displays, exports, and secondary screens can require Garmin attribution.

This baseline is sufficient for this docs-only scope decision. It is not sufficient to implement live OAuth, webhook/polling import, raw file storage, FIT parsing, Health API runtime, or AI prompts without provider sample payloads and a fresh implementation brief.

## Future Provider Landscape Baseline

Checked on `2026-06-23` from official/provider-controlled sources where available:

- Apple HealthKit: https://developer.apple.com/documentation/healthkit
- Android Health Connect: https://developer.android.com/health-and-fitness/health-connect
- Google Fit: https://developers.google.com/fit
- Strava API docs: https://developers.strava.com/docs/
- Strava API Agreement: https://www.strava.com/legal/api
- Polar AccessLink API: https://www.polar.com/accesslink-api/
- Suunto API Zone: https://apizone.suunto.com/
- Wahoo Developer Portal: https://developers.wahooligan.com/
- WHOOP Developer Platform: https://developer.whoop.com/
- Oura API docs: https://cloud.ouraring.com/docs/
- Fitbit Web API: https://dev.fitbit.com/build/reference/web-api/

Current interpretation:

| Provider class                    | Examples                                | Strategic role                                                                                                                         | First FreeSwimming treatment                                                                                            |
| --------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Garmin deep source                | Garmin Activity, Health, Training, FIT  | First priority and expected richest training/provider source.                                                                          | Deep official-doc audit first; preserve Garmin-specific evidence while mapping only trusted facts to canonical history. |
| Phone health hubs                 | Apple HealthKit, Android Health Connect | High-value aggregation channels, especially when athletes use several devices.                                                         | Future hub adapters; treat as health/activity evidence with strict consent, attribution, delete, and source provenance. |
| Social/activity networks          | Strava                                  | Useful activity source and athlete ecosystem, but terms, rate limits, display/disclosure, and deletion rules are high-risk for AI use. | Future adapter only after terms audit; not primary completion truth and not raw AI source by default.                   |
| Device ecosystems                 | Polar, Suunto, Wahoo                    | Relevant for endurance athletes and multi-sport context; some providers expose workouts, FIT files, OAuth, or webhook-style updates.   | Later adapter candidates; provider-specific audits required before roadmap or implementation commitment.                |
| Recovery/wellness wearables       | WHOOP, Oura, Fitbit/Google Health       | Useful sleep, recovery, strain, readiness, HRV, and wellness context; weaker as completed swim truth.                                  | Separate health-context adapters; summarized AI context only after consent/legal/privacy review.                        |
| Swim-specific wearables/platforms | FORM, FINIS/CIYE, TritonWear, Swim.com  | Potentially valuable for swimming detail, technique, and pool-specific evidence.                                                       | No public-API assumption; audit partner access, export formats, FIT/CSV paths, or hub availability first.               |

Provider-surface caveats:

- Apple HealthKit and Android Health Connect are phone/device permission surfaces, not simple server-side OAuth integrations. A future adapter likely needs an iOS/Android native shell, trusted mobile bridge, or explicit export/import path before any backend sync can be designed.
- Health Connect includes workouts, sleep, vitals, routes, permissions, delete/sync behavior, rate limits, attribution/display guidance, and medical-record areas. Medical records and diagnostic-style data are blocked until a separate medical/legal/product decision exists.
- Google Fit APIs, including the REST API, are marked for deprecation in 2026 and new developer signup has been closed since `2024-05-01`; default future Android direction should be Health Connect, not a new Google Fit adapter.
- Fitbit's legacy Web API is moving to new Google infrastructure and is scheduled for deprecation in `2026-09`; any Fitbit work requires a fresh migration/Google Health API audit before roadmap commitment.
- Strava requires user authorization, has volume limits and display/disclosure restrictions, can change or discontinue API access, and can require deletion of Strava data when access terminates. Treat it as high terms-risk for AI/model use.
- Polar AccessLink shows a broad surface beyond exercises, including daily activity, continuous heart rate, sleep, Nightly Recharge, SleepWise, biosensing/ECG/SpO2-style data, webhooks, OAuth2, user consents, and rate limits. Treat it as a rich provider requiring the same health/medical blocking rules as Garmin Health.
- Suunto and Wahoo are workout/FIT/workout-data candidates, but require partner/application and terms review before implementation assumptions.
- WHOOP and Oura are recovery/wellness sources with OAuth/application review-style constraints; they should inform readiness context only, not completed swim truth.

Provider priority recommendation:

1. Garmin first, because it is the expected richest near-term training and health-context provider for this product direction.
2. Apple HealthKit and Android Health Connect next as hub adapters, because they can reduce the need for one-off device integrations.
3. Strava only after a dedicated terms/API audit, because it is useful but sensitive for AI, display, redistribution, and data-retention assumptions.
4. Polar, Suunto, and Wahoo after Garmin/hub foundations, as endurance and multi-sport adapter candidates.
5. WHOOP, Oura, and Fitbit/Google Health as recovery/health-context candidates, not completed-session truth.
6. Swim-specific wearables after partner/export/API evidence proves that reliable ingestion is available.

10/10 provider architecture rule:

- do not create one schema per provider unless the provider has genuinely unique durable facts that the product uses;
- do keep provider-specific raw/evidence metadata outside canonical hot tables;
- do normalize trusted common facts into `training_activity_events` and future typed detail/health-context summaries;
- do store provider terms constraints, attribution rules, consent scope, source confidence, and deletion obligations per provider;
- do let AI consume compact feature views that include provenance/confidence, not raw provider timelines.

## PR #1223 Completeness Audit Findings

Audit performed on `2026-06-23` before merge recommendation.

Result: keep PR #1223 docs-only, but strengthen the brief before merge with these requirements:

| Finding                      | Why it matters                                                                                               | Required brief rule                                                                                                              | Status after this update |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Cross-provider duplication   | The same activity can arrive from Garmin direct, Apple Health/Health Connect, Strava, Polar, or manual edit. | Future runtime must store source provenance and use duplicate correlation/source precedence before any completion/KPI/AI count.  | `covered`                |
| Hub provenance               | Apple Health and Health Connect can aggregate data from other devices/apps.                                  | Store original provider/device when available and distinguish hub source from original evidence source.                          | `covered`                |
| Provider lifecycle           | Providers can revoke access, delete data, change APIs, or stop sending updates.                              | Future adapters need disconnect/revocation/delete/tombstone handling, backfill windows, and redacted support diagnostics.        | `covered`                |
| Medical/vitals data          | Garmin, Polar, Fitbit, Health Connect, and other sources can expose blood pressure, ECG, glucose, SpO2, etc. | Medical, diagnostic, and sensitive wellness data are blocked by default from canonical history and AI until separately approved. | `covered`                |
| Location/route privacy       | FIT/GPX/TCX, Strava routes, and Health Connect routes can reveal sensitive locations.                        | Route/GPS/polyline data is sensitive raw evidence; no default hot-table storage, public display, or AI prompt use.               | `covered`                |
| AI processor and terms risk  | Provider terms may restrict disclosure, redistribution, derivative use, or third-party processor transfer.   | Every provider adapter needs a terms/AI-use review before model prompts, feature storage, or derived coaching outputs.           | `covered`                |
| Mobile hub architecture      | HealthKit and Health Connect are not the same integration shape as Garmin/Strava server APIs.                | Future hub adapters need native/mobile bridge architecture before implementation.                                                | `covered`                |
| Google/Fitbit migration risk | Google Fit and Fitbit surfaces are changing.                                                                 | Prefer Health Connect for new Android hub work; require fresh Fitbit/Google Health audit before Fitbit roadmap commitment.       | `covered`                |

## Current Local App Audit

| Surface                      | Current evidence                                                                                                                                                                                               | Implication                                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `provider_connections`       | `supabase/migrations/20260622170000_provider_evidence_schema_foundation.sql` supports `garmin_activity_api`, provider status, redacted metadata, owner RLS, and cascade delete.                                | Good connection metadata boundary, but no OAuth token vault, refresh-token rotation, revocation callback, or real provider sync yet. |
| `provider_import_runs`       | Tracks import run kind/status/counts and redacted diagnostics.                                                                                                                                                 | Good job/diagnostic shell; future runtime still needs retry/idempotency/backoff and no raw payload logs.                             |
| `provider_activity_evidence` | Stores provider activity aliases, date/time, activity/sport/sub-sport labels, duration, distance, pool fields, file state, available file kinds, and redacted summary.                                         | Correct evidence boundary for received activities; not completion truth and not enough for full health context.                      |
| `training_activity_events`   | Stores owner-scoped canonical activity rows with source, sport, mapping status, outcome, time/local date, normalized measurements, planned refs, provider evidence refs, detail kind, and support diagnostics. | Correct durable history target after mapping/review; should not receive raw Garmin payloads or Health API all-day metrics directly.  |
| Calendar Trends              | `Swimming` now counts only trusted manual swim actuals through the generic activity-history boundary.                                                                                                          | Provider/non-swim/needs-review/unmapped rows already fail closed in Trends; keep this contract.                                      |
| Export/delete                | `/api/user/export` includes `trainingActivityEvents`, provider evidence summaries, and import runs; `/api/user/delete` cascades owner rows.                                                                    | Export/delete covers current summary rows, but future token vaults/raw files/health summaries need explicit export/delete paths.     |
| GDPR runbook                 | Mentions provider evidence as redacted summaries and notes no raw FIT/GPX/TCX or token path exists in V1.                                                                                                      | Must be refreshed before raw file storage or Health API context ships.                                                               |
| Provider fixture import      | `manual_fixture` is disabled by default and swim-only.                                                                                                                                                         | Useful proof of evidence intake; not a Garmin multi-sport or health-data proof.                                                      |
| AI/retrospective             | No provider-backed AI view exists yet.                                                                                                                                                                         | Future AI must read a deliberately minimized feature view, not raw provider evidence.                                                |

## Data Scope Recommendation

| Data class                         | Garmin surface         | Recommended first treatment                                                                                             | Durable storage                                                                             | AI use                                                                      | Retention default before runtime                                                                              |
| ---------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Planned workouts/training plans    | Training API           | Send-only provider delivery state.                                                                                      | Future send-job table with payload fingerprint and provider aliases.                        | Yes, as plan intent and compliance evidence.                                | Keep send summaries while related plan/history exists; raw outbound payload snapshots need bounded retention. |
| Completed activities               | Activity API           | Import as provider evidence first.                                                                                      | `provider_activity_evidence` summary, then `training_activity_events` after mapping/review. | Yes, after normalized and mapped.                                           | Raw file cache short-lived; canonical summary retained until account deletion.                                |
| FIT/GPX/TCX files                  | Activity API / FIT SDK | Store outside hot tables only when needed for parsing/review.                                                           | Storage object + redacted file metadata, not JSON blobs in product tables.                  | Only parsed summary/features.                                               | Default `30-90 days` raw retention unless user review/support requires longer.                                |
| Lap/step/detail data               | FIT/activity details   | Parse to sport-specific detail envelopes only when the feature uses it.                                                 | Sport-specific summaries or detail snapshots behind explicit schema.                        | Yes, as compact features like pace consistency, missed repeats, load trend. | Keep derived summaries; raw second-by-second detail should expire or aggregate.                               |
| Daily health metrics               | Health API             | Separate health-context model, not activity history.                                                                    | Future `training_health_daily_summaries`-style table if approved.                           | Yes, as context such as fatigue/sleep/readiness trends.                     | Prefer rolling windows and aggregation; avoid indefinite raw daily detail unless needed.                      |
| High-resolution biometric samples  | Health API / FIT       | Block until explicit product, privacy, and cost need.                                                                   | Separate protected storage/table only if approved.                                          | Rarely; summarized features only.                                           | Short TTL or no storage by default.                                                                           |
| Medical/diagnostic-style data      | Health APIs / hubs     | Block by default: medical records, ECG, blood glucose, blood pressure, irregular rhythm, and diagnostic-style readings. | None until explicit medical/legal/product decision.                                         | No default AI use.                                                          | N/A until approved.                                                                                           |
| Women's health                     | Women's Health API     | Blocked by default.                                                                                                     | None until explicit owner/legal/consent decision.                                           | No default AI use.                                                          | N/A until approved.                                                                                           |
| Location and route data            | FIT/GPX/TCX / routes   | Treat as sensitive raw evidence.                                                                                        | Storage object/redacted route metadata only if a feature requires it.                       | No exact GPS/polyline prompt use by default.                                | Short raw retention; derived coarse location only after approval.                                             |
| Courses                            | Courses API            | Out of first Garmin coaching loop unless route/course navigation becomes product scope.                                 | Future send state only.                                                                     | Not needed for swim-first coaching now.                                     | N/A.                                                                                                          |
| Unmapped/unsupported provider rows | Activity/Health APIs   | Preserve minimal evidence and diagnostics only.                                                                         | Evidence summary with `unmapped`/`unsupported` status.                                      | No training-plan decisions.                                                 | Auto-delete or aggregate after a bounded review window.                                                       |

## Retention And Database Performance Contract

Default retention tiers to decide before runtime:

| Tier                             | Examples                                                                                 | Storage pattern                                                             | Suggested default                                                  | Deletion/aggregation rule                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Hot canonical history            | mapped activities, trusted summaries, manual corrections                                 | indexed Postgres rows (`training_activity_events` and future mapped tables) | account lifetime                                                   | delete on account delete; user correction flow controls content        |
| Warm provider evidence summaries | provider alias, date, sport, duration, distance, file availability, redacted diagnostics | indexed Postgres rows (`provider_activity_evidence`, import runs)           | account lifetime or until user disconnects plus retention decision | delete on account delete; future disconnect behavior must be explicit  |
| Raw provider files               | FIT/GPX/TCX                                                                              | storage bucket/object reference, never hot tables                           | `30-90 days` unless active review/support                          | delete after parse/review TTL; keep derived summary                    |
| Raw provider JSON                | Activity/Health API responses                                                            | avoid storing; if needed, encrypted storage with TTL                        | `0-30 days`                                                        | delete after parse/debug window                                        |
| High-frequency samples           | second-level HR, sensor samples, full lap streams                                        | derived aggregate features only by default                                  | no durable raw storage by default                                  | aggregate to day/week/activity features, then purge raw                |
| Health daily context             | sleep, stress, body battery, resting HR, steps                                           | future health-context table, separate from activity history                 | rolling `12-24 months` or explicit owner choice                    | aggregate older data to monthly/trend features                         |
| Provider lifecycle tombstones    | revoked connections, deleted provider activities, replay guard aliases, last-seen hashes | minimal metadata rows with no raw payload                                   | only as long as needed for idempotency, support, and compliance    | purge or anonymize after retention decision while preventing re-import |
| AI prompt/cache payloads         | model-ready summaries                                                                    | do not persist by default; short-lived job artifact if needed               | `0-30 days`                                                        | purge after generation/audit window                                    |

Database performance rules:

- Calendar, Trends, dashboards, and AI jobs must read bounded summaries by `user_id`, date range, source/sport, and mapping status.
- Raw files, raw JSON, and high-cardinality sensor records must not be queried by user-facing routes.
- Provider imports must run in background jobs with bounded windows, idempotent aliases, and replay-safe import runs.
- Hub/provider duplicate detection must be bounded by user, time range, source alias, sport, duration/distance, timezone, and confidence state; it must not rely on broad scans.
- Any future table with high row volume needs owner/date/source indexes and route-level query tests before it ships.
- Unknown provider values must create support diagnostics, not broad scans or runtime exceptions.

## AI / ChatGPT Readiness Contract

AI should get a product-owned feature view, not raw Garmin data.

Recommended AI context layers:

1. Athlete profile and goals:
   - current goals, competition date, constraints, equipment, pool/open-water context, recent plan.
2. Recent canonical activity history:
   - mapped activities, swim sessions, distance/duration/load, completion outcomes, trend windows.
3. Health readiness context:
   - summarized sleep/recovery/stress/load windows only after explicit health-context approval.
4. Provider confidence:
   - whether rows are manual, provider evidence, reviewed, exact match, likely match, or needs review.
5. Redaction:
   - no raw FIT files, raw JSON, OAuth tokens, provider secrets, exact GPS routes/polylines, pregnancy/cycle data, medical/diagnostic-style data, or second-level biometric streams in prompts by default.
6. Terms and processor allowance:
   - provider data can enter model context only when provider terms, user consent, and FreeSwimming privacy disclosures allow the specific AI processor and derived coaching use.

AI must not:

- convert Health API steps/sleep/stress into completed workouts;
- treat provider evidence as truth before mapping/review;
- infer sensitive health conditions from raw metrics;
- infer exact home/work/training locations from route traces;
- produce adaptive replanning that mutates future schedules without explicit user review.

## Domain Granularity Contract

User's mental object:

- "All Garmin data that can help ChatGPT make better training programs for an athlete."

Canonical objects:

- Provider connection: future Garmin account authorization/connection.
- Provider activity evidence: raw/summary Garmin received evidence.
- Canonical activity history: mapped `training_activity_events`.
- Health context: future separate daily/period summaries, not activity truth.
- AI feature view: compact derived context for model calls.
- Provider provenance: original provider/device, hub provider, import run, consent scope, source confidence, last-seen/deleted state.

Child object levels:

| Level                     | Meaning                                                             | Active slice support                                 |
| ------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| API family                | Activity, Health, Training, Courses, Women's Health                 | `view` as docs audit                                 |
| Consent/scope             | Which Garmin data categories the user allows                        | `support-only`; no runtime consent UI                |
| Source provenance         | Original provider/device, hub source, aliases, confidence           | `support-only`; future runtime model required        |
| Provider evidence summary | Activity aliases, type, date, duration, distance, file availability | `view` through docs/local audit                      |
| Raw files/payloads        | FIT/GPX/TCX/raw JSON                                                | `out of scope`; storage/TTL contract only            |
| Canonical activity        | Mapped trusted activity row                                         | `view` contract only                                 |
| Health daily context      | sleep, stress, HR, steps, Body Battery, etc.                        | `support-only`; future model required                |
| Sensitive wellness        | menstrual cycle/pregnancy                                           | `out of scope` unless future legal/product approval  |
| AI feature view           | minimized model-ready summaries                                     | `support-only`; future implementation child required |
| Retention/deletion        | TTL, aggregation, export/delete                                     | `view` contract only                                 |

Mature reference surfaces:

- Provider evidence boundary: `provider_connections`, `provider_import_runs`, `provider_activity_evidence`, `lib/my-library/provider-evidence.ts`.
- Canonical activity foundation: `training_activity_events`, `lib/my-library/training-activity-events.ts`.
- Current user-facing swim source: Calendar Trends `Swimming` through `CalendarPeriodComparisonHub`.
- Privacy/export/delete: `docs/api-contracts.md`, `docs/runbooks/gdpr-data-rights.md`.

10/10 gate:

- No future Garmin/AI runtime may claim 10/10 if it proves only summary import while raw-data retention, health-vs-activity separation, export/delete, provider attribution, and AI prompt minimization remain undefined.

## Data Placement And Sync Contract

Server-canonical future data:

- provider connection identity and consent scope,
- import runs and redacted diagnostics,
- provider activity evidence summaries,
- provider provenance, source confidence, last-seen/deleted state, and minimal tombstones needed for idempotency/compliance,
- canonical mapped activity rows,
- health-context summaries only after explicit approval,
- AI feature snapshots only if a future brief chooses short-lived persistence.

Local-only future data:

- filters, import/review UI state, unsaved consent UI state, local sort/group preferences.

Out of hot Postgres product tables:

- OAuth tokens and secrets,
- raw Garmin payloads,
- raw FIT/GPX/TCX files,
- exact GPS routes/polylines unless explicitly approved for a route feature,
- second-level health samples,
- medical records, ECG, glucose, irregular rhythm, blood pressure, and diagnostic-style readings unless explicitly approved,
- full provider response bodies,
- model prompt/debug transcripts unless a retention and privacy contract is approved.

Sync/conflict policy:

- Provider sync creates evidence, not completion truth.
- Manual actual rows remain user-approved truth until explicit reconciliation.
- Health context informs coaching only; it never creates or completes workouts.
- Duplicate provider activities are idempotent by provider alias/user and enter duplicate/review states.
- Cross-provider duplicates must not double-count: reviewed manual/canonical rows win; exact provider matches can attach as evidence; likely matches require review; hub-only rows cannot override richer Garmin evidence without explicit reconciliation.
- Provider updates, deletes, revocations, and expired consents must update evidence/lifecycle state, purge raw provider artifacts under retention rules, and preserve only user-approved canonical history unless the user requests deletion.
- Unknown API values, unsupported metrics, missing timezone/unit data, and malformed files fail closed to `unmapped`, `unsupported`, `needs_review`, or `malformed`.

Cache/invalidation:

- Provider import and health-summary routes must be private/dynamic/no-store.
- Mapped activity writes must invalidate Calendar Trends, future history views, AI feature views, and export/delete payloads.
- Raw file deletion must not delete canonical summaries unless a user/account delete requires it.
- Provider delete/revocation writes must invalidate export/delete payloads, support diagnostics, and any AI feature snapshot that referenced the provider evidence.

## Identity And Rename Contract

- FreeSwimming stable IDs remain canonical.
- Garmin user IDs, activity IDs, workout IDs, course IDs, and file IDs are provider aliases only.
- Hub identifiers from Apple HealthKit, Health Connect, Strava, Polar, Suunto, Wahoo, WHOOP, Oura, Fitbit/Google Health, or swim wearables are also provider aliases only.
- Garmin activity titles, sport labels, device names, and display strings are not identity.
- Raw files need stable storage object IDs plus provider alias references if future runtime stores them.
- Renaming a workout/program preserves historical links; repurposing a plan/workout requires new canonical entities before provider data attaches.
- Disconnecting Garmin must not erase canonical user-approved history unless the user also asks to delete data; disconnect-retention behavior needs an explicit future decision.

## Forward Compatibility Contract

Future values expected:

- new Garmin devices, API fields, metrics, sport types, sub-sports, file kinds, activity details, health metrics, women's health fields, courses, and provider statuses;
- new providers such as Apple HealthKit, Android Health Connect, Strava, Polar, Suunto, Wahoo, WHOOP, Oura, Fitbit/Google Health, swim-specific wearables, or manual imports;
- new AI prompt feature fields, languages, privacy copy, consent states, export formats, and support diagnostics.

Automatic behavior:

- unknown provider activity values can remain provider evidence summaries with `unmapped`/`needs_review`;
- canonical activity rows can store known common fields without sport-specific interpretation;
- Calendar Trends and completion totals already exclude provider/non-swim/unknown/unsupported rows unless explicitly mapped.

Explicit mapping required:

- any new sport/source/status entering Calendar, Trends, AI recommendations, KPIs, or user-facing labels;
- every provider's terms, attribution, consent, AI-use, retention, disconnect, export, and deletion rules before runtime use;
- provider-specific rich fields that cannot safely fit the common activity/evidence model;
- source-precedence and duplicate-correlation rules for any provider/hub that can report the same workout as another source;
- health metrics used for coaching decisions;
- medical/diagnostic-style categories, exact location/route use, and any minor/parent/coach visibility expansion;
- women's health data collection or AI use;
- raw file storage, parser selection, file repair, and retention;
- disconnect/delete/export behavior for new provider data classes;
- Garmin attribution/branding for any Garmin-derived display/export.

Safe fallback:

- unknown or deprecated Garmin values are preserved only as redacted evidence or diagnostics;
- unknown or deprecated non-Garmin provider values follow the same evidence-only fallback and cannot force the common model to shrink Garmin data quality;
- unmapped values do not count as completed, do not improve KPI totals, and do not drive AI replanning;
- unsupported sensitive data is ignored or blocked until a future product/legal decision exists.
- provider deletes/revocations remove raw/provider artifacts by default and leave only minimal lifecycle tombstones or separately user-approved canonical history.

Proof required in future runtime:

- provider sample fixtures for Activity API and Health API;
- provider sample fixtures and terms reviews for every non-Garmin adapter before implementation;
- unknown-value tests for source/sport/metric/file kinds;
- privacy/export/delete tests for every stored data class;
- duplicate-correlation/source-precedence tests for hub and direct-provider copies of the same activity;
- revocation/delete/tombstone tests for provider lifecycle events;
- retention tests or cleanup job evidence for raw files/payloads;
- AI prompt snapshot tests proving minimization/redaction;
- route/label/support sweep for all visible consent/provider labels.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode: all `target` categories must close at `5/5` for this docs-only audit to claim 10/10 as a planning artifact.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                           | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Audit defines why "collect everything" is unsafe and replaces it with a Garmin-first, multi-provider-ready API/data-scope funnel for better AI coaching, including source provenance and provider lifecycle. | official-doc audit + local app audit      | `5/5`                   |
| UX flow clarity                               | `target`     | Future user consent/review states are separated: activity, health, women's health, send-to-Garmin, evidence, mapped truth, and AI use.                                                                       | consent/scope contract                    | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this docs-only audit changes no UI, layout, print, export rendering, screenshots, or brand assets.                                                                                               | explicit non-visual scope rationale       | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Provider data remains evidence/context until explicit mapping; Health API and wellness-hub data cannot complete workouts; duplicates cannot double-count; AI cannot mutate plans silently.                   | data scope + AI contract                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, CRUD flow, publishing workflow, or operator editing surface changes.                                                                                                            | explicit admin-editor non-scope rationale | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI or accessibility semantics change in this docs-only audit.                                                                                                                        | explicit non-UI rationale                 | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Future runtime must keep raw files/payloads out of hot route queries and read bounded summaries only.                                                                                                        | retention/performance contract            | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Raw provider data, evidence summaries, canonical activity history, health context, and AI feature views have separate ownership.                                                                             | data placement section                    | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Future provider/health reads are private/no-store and mapped writes list affected Calendar/history/AI/export surfaces.                                                                                       | cache contract                            | `5/5`                   |
| Reliability and failure handling              | `target`     | Unknown, unsupported, malformed, duplicate, missing timezone/unit, provider-deleted, revoked, and provider-unavailable states fail closed to review/diagnostics.                                             | fallback contract                         | `5/5`                   |
| Security and authz                            | `target`     | Future provider routes must be owner-scoped, token-safe, least-privilege, and must not trust provider/browser IDs for ownership.                                                                             | stack gate + future validation contract   | `5/5`                   |
| Privacy and compliance                        | `target`     | Sensitive health data, women's health data, medical/vitals data, route/location data, raw files, prompt payloads, provider terms, export/delete, and retention are minimized before runtime.                 | privacy/retention contract                | `5/5`                   |
| Content governance                            | `target`     | This planned brief becomes the source-of-truth gate before Garmin/provider/AI runtime.                                                                                                                       | parent checkpoint + related brief links   | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: future support/admin diagnostics are required, but no admin workflow is changed now.                                                                                                        | support impact section                    | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because Garmin/provider/health data is private authenticated data and creates no public crawl surface.                                                                                                   | private-data rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this audit does not create public AI-discoverable pages; AI use here is private model context.                                                                                                   | private AI-context rationale              | `N/A`                   |
| Analytics and KPI observability               | `target`     | Future provider and AI metrics need stable typed taxonomy; unmapped values cannot enter KPIs.                                                                                                                | forward compatibility + AI contract       | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Garmin and other provider access may have commercial/license terms, but no checkout, entitlement, invoice, refund, payout, or revenue behavior changes.                                     | official-doc commercial caveat            | `5/5`                   |
| Incident response and support operations      | `target`     | Support must be able to diagnose sync, duplicate, retention, delete/export, attribution, and unmapped-state issues before runtime.                                                                           | support/runbook requirements              | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this docs-only audit does not change revenue recognition, payouts, invoices, refunds, or accounting data; Garmin license-cost review is product/vendor scope, not finance reporting runtime.     | explicit finance non-scope rationale      | `N/A`                   |
| i18n operational readiness                    | `target`     | Future provider/source/metric labels must derive from typed mappings and tolerate translated consent/support copy.                                                                                           | label mapping contract                    | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use official provider docs, existing Supabase/provider-evidence/activity-history patterns, storage for raw files, and no new dependency now.                                                                 | architecture gate                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Docs-only validation passes brief lint; future runtime requires provider fixtures, retention tests, export/delete tests, AI prompt minimization tests, and release gates.                                    | validation section                        | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Raw/high-cardinality provider data must use storage/TTL/aggregation and avoid hot route scans.                                                                                                               | retention/performance contract            | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | This audit is reversible docs-only; future provider runtime must have disable flags, replay-safe jobs, cleanup jobs, and rollback notes.                                                                     | scope + future runtime gate               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no UI route changes in this audit;
  - future consent/review UI must reuse Calendar/Review Actual/provider evidence patterns and use screenshot handoff.
- TypeScript/domain:
  - provider/source/sport/metric values must be typed allowlists with unknown-safe fallbacks;
  - source provenance, original provider, hub source, source confidence, provider lifecycle state, and duplicate-correlation outcome must be typed before runtime;
  - AI feature views must be typed and redacted.
- Supabase/data:
  - keep hot canonical summaries indexed by `user_id`, date, source/sport/status;
  - use separate tables/storage for raw files, health context, cleanup jobs, and token vault decisions;
  - future runtime requires migrations, RLS, generated types, and negative-path tests.
- External services:
  - use official Garmin docs and provider sample payloads before Garmin runtime;
  - use official docs, terms, partner/application requirements, and sample payloads before every non-Garmin adapter;
  - HealthKit/Health Connect adapters require a native/mobile bridge decision before backend sync design;
  - OAuth tokens need encrypted secret storage, refresh/revoke handling, least privilege, and no logs;
  - provider imports need idempotency, retries/backoff, rate-limit handling, webhook signature/replay verification where applicable, revocation/delete handling, and redacted observability.
- UI system:
  - N/A now; future visible consent/review/provider displays require screenshot handoff and Garmin attribution review.
- Testing:
  - docs-only: `npm run lint:briefs`, `npm run lint:briefs:all`, `git diff --check`;
  - future runtime: provider fixtures, malformed payloads, duplicate/replay, authz, export/delete, retention cleanup, AI prompt minimization, performance/query tests, `verify:pre-pr`, CI, `verify:pre-merge`.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, `rg`, repo task-brief linting, current session web browsing against official Garmin docs.
- Evaluate later: future visible UI/debug work can use the installed `playwright` skill; future security-sensitive provider/OAuth work may need a dedicated security audit before runtime.
- Install/config changes: none; no local Codex skill/plugin/MCP configuration is needed.

Systemic findings:

| Surface               | Finding                                                                                                                                                             | Severity | Recommended Type                                                   | Owner Decision Needed               | Follow-Up Brief Path                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------ | ----------------------------------- | ------------------------------------ |
| Garmin data scope     | Garmin can expose much more than completed swims; broad collection needs explicit data minimization, consent, retention, and AI-use boundaries.                     | `high`   | `bounded implementation child` for future runtime after this audit | yes, scope/consent/product terms    | this brief first                     |
| Multi-provider scope  | Future Strava, Apple/Google health hubs, Polar, Suunto, Wahoo, recovery wearables, and swim wearables need one adapter/evidence model, not one-off product schemas. | `high`   | `deferred architecture decision`                                   | yes, provider priority and terms    | future provider-adapter roadmap      |
| Source provenance     | Hub providers can duplicate or obscure original device/provider facts, which can corrupt completion counts and AI context if not modeled.                           | `high`   | `bounded implementation child` later                               | yes, precedence/review policy       | future provider-adapter roadmap      |
| Medical/location data | Health, wearable, and route providers can expose medical-style metrics and sensitive GPS traces.                                                                    | `high`   | `deferred architecture decision`                                   | yes, legal/privacy/product decision | future health-context child          |
| Database performance  | Raw files, raw JSON, and high-frequency samples would be expensive if stored in hot tables.                                                                         | `high`   | `deferred architecture decision`                                   | yes, storage/TTL/aggregation policy | future raw-file/health-context child |
| AI readiness          | ChatGPT should consume summarized feature views, not raw provider payloads or sensitive wellness data.                                                              | `high`   | `bounded implementation child` later                               | yes, allowed AI context and consent | future AI feature-view child         |

Return path:

- Parent: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Last merged workstream: Garmin/provider data scope audit PR `#1223`, with `main@fe4d632a` clean and synced.
- Next step after this docs-only audit: `docs/task-briefs/in-progress/2026-06-23-garmin-provider-prerequisites-intake-10-10.md` captures the evidence packet needed before any future runtime child for Garmin partner/OAuth readiness, raw file storage/retention, health-context model, AI feature-view summaries, or a separate multi-provider adapter roadmap. Garmin reconciliation remains blocked until provider access, sample payloads, alias/correlation facts, source provenance, duplicate-correlation thresholds, deletion/revocation rules, attribution/consent, and matching thresholds are concrete.

## Help/Guide And Support Impact

Current docs-only audit:

- No Help/Guide runtime copy changes are required.
- Support-facing rule is documented here: provider data stays evidence/context until a future runtime child defines diagnostics and Help/Guide copy.

Future runtime:

- Update `docs/runbooks/auth-account-support.md`, `docs/api-contracts.md`, `docs/runbooks/gdpr-data-rights.md`, `docs/architecture/external-service-contract-matrix.md`, privacy/cookie routes if consent/data processors change, and Help/Guide assertions if visible provider labels or recovery behavior change.

## Route / Label / Support Surface Sweep

Required before any future runtime or UI child:

- `rg -n "Garmin|Strava|Apple Health|HealthKit|Health Connect|Polar|Suunto|Wahoo|WHOOP|Oura|Fitbit|Google Health|FORM|provider evidence|training_activity_events|provider_activity_evidence|Health API|Activity API|FIT|AI retrospective|retention|export/delete|delete|privacy|Calendar Trends|Swimming" app components lib tests docs supabase types`
- Check at minimum `app/`, `components/`, `lib/`, `tests/`, `types/`, `supabase/migrations/`, `docs/api-contracts.md`, `docs/runbooks/auth-account-support.md`, `docs/runbooks/gdpr-data-rights.md`, `docs/architecture/external-service-contract-matrix.md`, active/planned/blocked/done task briefs, and Help/Guide assertions when relevant.
- Future runtime sweeps must also include `source provenance`, `duplicate`, `tombstone`, `revocation`, `deauthorization`, `route`, `GPS`, `polyline`, `medical`, `ECG`, `blood glucose`, `blood pressure`, and `model processor` terms.

## Scope

- Audit current official Garmin docs across Activity, Health, Training, Courses, Women's Health, FIT, Program FAQ, and API Brand Guidelines.
- Add a preliminary multi-provider landscape for Apple HealthKit, Android Health Connect, Strava, Polar, Suunto, Wahoo, WHOOP, Oura, Fitbit/Google Health, and swim-wearable candidates without authorizing runtime implementation.
- Audit PR #1223 for pre-merge completeness across source provenance, duplicate handling, provider lifecycle, medical/location sensitivity, AI terms, and hub architecture.
- Audit local app boundaries for provider evidence, canonical activity history, Calendar Trends, export/delete, GDPR runbook, and AI readiness.
- Define 10/10 data-scope, retention, database performance, AI feature-view, privacy, support, and forward-compatibility contracts.
- Update the training-history parent checkpoint so the next selected step is this audit, not the already-merged Trends child.

## Out Of Scope

- Runtime code.
- Supabase migrations or generated DB type changes.
- OAuth, tokens, secrets, provider jobs, webhooks, polling, Garmin API calls, raw file storage, FIT/GPX/TCX parsing, parser dependencies, or cleanup jobs.
- Calendar/Trends UI changes, screenshots, Help/Guide runtime copy, or user-facing consent UI.
- AI prompt implementation, model calls, adaptive replanning, or schedule mutations.
- Strava, Apple HealthKit, Health Connect, Polar, Suunto, Wahoo, WHOOP, Oura, Fitbit/Google Health, FORM, FINIS/CIYE, TritonWear, Swim.com, or other non-Garmin provider implementation.
- Finance/reporting implementation.
- Touching `Ja.docx`.

## Acceptance Criteria

1. A planned brief exists for Garmin/provider data scope, retention, and AI readiness.
2. The brief uses current official Garmin docs and distinguishes Activity, Health, Training, Courses, Women's Health, FIT, OAuth/program approval, and attribution requirements.
3. The brief audits current FreeSwimming provider-evidence, `training_activity_events`, Calendar Trends, export/delete, and GDPR boundaries.
4. The brief recommends storing durable summaries and deleting/aggregating raw unused data instead of storing everything forever.
5. The brief defines AI/ChatGPT-safe feature views and blocks raw/sensitive data from default prompts.
6. The brief states that the architecture is Garmin-first, not Garmin-only, and that future providers must use the same adapter/evidence/feature-view discipline without lowering Garmin data quality.
7. The brief records the pre-merge completeness audit and covers source provenance, duplicate handling, provider lifecycle, medical/location sensitivity, AI terms, and mobile hub architecture.
8. The brief includes data placement, identity, forward compatibility, retention, support, stack, and scorecard contracts.
9. The parent training-history brief points to this audit as the current next planning step.
10. Changed briefs pass task-brief lint and diff checks.

## Validation

Docs-only validation required:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`

Optional packaging validation:

- `npm run verify:pre-pr` docs-only lane before PR update.
- `npm run verify:pre-merge` docs-only lane before merge recommendation.

## Local Tooling Prerequisite

- Use repo-pinned Node/npm from `.nvmrc` and `packageManager`.
- Before reporting `npm`/`node` missing, bootstrap through `nvm use --silent`.

## Manual QA Environments

`N/A`; no UI, browser workflow, deployment behavior, install flow, print/export rendering, or visible route behavior changes.

No screenshot handoff is required because this is docs-only and non-visual.

## Constraints

- Do not implement Garmin runtime from this audit.
- Do not commit secrets, credentials, sample raw payloads, OAuth tokens, raw health data, or FIT files.
- Do not weaken the current rule that provider evidence and non-swim/unknown rows do not count in Calendar Trends or completion truth.
- Do not store sensitive women's health data or high-resolution biometrics without a separate owner/legal/consent decision.
- Do not store or use medical/diagnostic-style data, exact route/location traces, or provider data in model prompts without a separate owner/legal/privacy/terms decision.
- Do not touch `Ja.docx`.

## Session Continuity And Recovery

Canonical recovery order:

1. `git status -sb`
2. `git log --oneline -n 10`
3. Reopen this brief and the parent training-history brief.

## Checkpoint Log

- `2026-06-23 | planned | created from clean synced main@847a88d9 after owner asked whether Garmin should provide as much data as possible for AI/ChatGPT programming, whether that would make the database slow, whether unused old data should be auto-deleted, and whether a Garmin/app audit should happen first; decision: audit first, keep runtime blocked, and define scope/retention/AI-readiness before any provider implementation | next: run docs validation, commit, push, open PR, and wait for merge approval after gates`
- `2026-06-23 | planned | PR #1223 update requested by owner after discussing future providers such as Strava, Apple Health, Android Health Connect, Polar, Suunto, Wahoo, recovery wearables, and swim wearables; decision: keep Garmin-first, not Garmin-only, preserve Garmin richness, and add a multi-provider adapter/terms/AI/retention boundary without implementing integrations | next: run docs validation, commit, push PR update, monitor CI, and wait for merge approval after gates`
- `2026-06-23 | planned | owner requested pre-merge audit of PR #1223 to ensure the brief includes everything important; decision: strengthen the docs-only brief with source provenance, duplicate prevention, provider lifecycle/delete/revocation, medical/location blocking, AI processor/terms gating, HealthKit/Health Connect mobile-bridge caveat, and Google Fit/Fitbit migration risk | next: run docs validation, commit, push PR update, monitor CI, run pre-merge, and wait for merge approval after gates`
- `2026-06-23 | prerequisites intake linked | refreshed after Garmin/provider data scope audit PR #1223 merged; linked docs/task-briefs/in-progress/2026-06-23-garmin-provider-prerequisites-intake-10-10.md as the current docs-only evidence-packet step before any Garmin/provider runtime brief | next: collect owner/provider facts or keep Garmin runtime blocked`
