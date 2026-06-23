# Task Brief: Garmin Provider Prerequisites Intake (10/10)

## Metadata

- `id`: `2026-06-23-garmin-provider-prerequisites-intake-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-23`
- `updated`: `2026-06-23`
- `mode`: `plan only / docs-only provider prerequisite intake`
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
- `base`: `main@fe4d632a`
- `audit_status`: `ready`
- `decision`: Use this docs-only intake as the next bounded step after the Garmin/provider data scope audit, before creating any Garmin OAuth, import, FIT parsing, raw storage, AI feature-view, or reconciliation runtime brief.
- `reason`: PR `#1223` established the data-scope, retention, AI-use, and multi-provider architecture boundaries, but runtime remains blocked until owner/provider prerequisites are collected: Garmin partner access, API terms, credentials path, sample payloads/FIT files, consent/revocation rules, duplicate/source-precedence policy, retention windows, AI processor allowance, and support/rollback requirements.
- `must_refresh_before_execution_if`: Refresh if Garmin official docs, Garmin partner/application status, API access terms, credentials handling, sample payloads, FIT SDK requirements, provider schemas, source/duplicate policies, retention decisions, AI/model processor rules, privacy/cookie copy, `training_activity_events`, `provider_activity_evidence`, export/delete routes, scorecard categories, or verification lanes change.

## Goal

Create a concrete prerequisite intake checklist and decision record that tells the owner exactly what must be obtained or decided before Garmin/provider runtime work can start safely.

## Pre-Implementation Owner Explanation

Codex skal lage en forberedelsesbrief, ikke Garmin-kode. Vi samler hva som må være på plass før vi kan bygge Garmin-kobling: tilgang, prøvepayloads, FIT-filer, samtykke/terms, duplicate-regler, retention, AI-bruk og support. Det betyr noe fordi runtime uten disse faktaene kan lagre for mye sensitiv data, telle feil, bryte provider-vilkår eller gjøre databasen treg. Utenfor scope nå er OAuth, importer, migrasjoner, UI, råfil-lagring, AI-kall og reconciliation.

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

- Create a planned docs-only intake brief for provider prerequisites.
- Convert the PR `#1223` audit outcome into an actionable evidence packet.
- Update the training-history parent so the next recommended step is prerequisite intake, not runtime.
- Keep real Garmin/provider runtime blocked.

## Out Of Scope

- Runtime implementation, migrations, tests against runtime code, UI, screenshots, PR screenshots, provider credentials, provider payload commits, and live Garmin calls.
- Moving blocked Garmin briefs to active.
- Merge or release of any provider runtime.

## Acceptance Criteria

1. Planned prerequisites-intake brief exists and links to the parent and Garmin/provider data scope audit.
2. Intake matrix covers provider access, scopes, sample payloads, terms/AI, OAuth/consent, source provenance, alias/correlation, duplicate policy, retention, attribution, support, and rollback.
3. The brief states clear runtime blockers and selectable future runtime paths.
4. Data placement, identity, forward compatibility, support, stack, and scorecard contracts are explicit.
5. Parent checkpoint points to this prerequisites intake as the recommended next decision step.
6. Changed briefs pass task-brief lint and diff checks.

## Validation

Docs-only validation required:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
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
