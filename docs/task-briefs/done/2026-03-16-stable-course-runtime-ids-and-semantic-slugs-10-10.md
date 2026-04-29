# Task Brief: Stable Course Runtime IDs And Semantic Slugs (10/10)

## Metadata

- `id`: `2026-03-16-stable-course-runtime-ids-and-semantic-slugs-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-16`
- `updated`: `2026-04-29`

## Goal

Make course module/lesson identity 10/10 by separating stable runtime IDs from editable titles/slugs, while migrating existing data safely with backward-compatible resolution and rollback.

## Why This Brief Exists

- Current course runtime IDs (`mod1`, `mod1-l1`) and slugs (`course-module-mod1`, `course-lesson-mod1-l1`) are functional but not 10/10.
- Parts of the app still infer hierarchy from string patterns such as `mod1-l1`, which is more fragile than explicit identity and relationships.
- Editorial naming review during live content production confirmed that semantic slugs and rename-safe runtime IDs should be handled as a dedicated migration slice, not by manual admin edits.
- If we want the strongest long-term model, it is safer to migrate before high-volume course renaming/content expansion than after more data accumulates.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - `admin_content_items.id` and `parent_id` remain the canonical relational keys,
  - `admin_content_items.slug` remains the stable human-readable content key,
  - `admin_content_items.body.moduleId` and `admin_content_items.body.lessonId` become immutable runtime IDs that are independent of title, slug, and `sort_order`,
  - persisted course progress rows keyed by lesson ID,
  - note-context references, preview references, and any compatibility alias manifest introduced for migration safety.
- Local-only:
  - transient admin form drafts,
  - preview-mode local progress keys,
  - cached browser progress state during the compatibility window.
- Sync policy:
  - title and slug edits must not mutate runtime IDs,
  - runtime IDs are write-once for normal editorial flows after migration,
  - compatibility reads may accept legacy lesson IDs during migration window but must resolve to canonical current IDs before writeback,
  - migration scripts must be idempotent and rerunnable without duplicating or corrupting records.
- Retention and sensitivity:
  - migration logs must avoid PII/secrets,
  - any temporary compatibility map stays only as long as needed to preserve safe reads/redirects.
- Cache/invalidation:
  - invalidate admin content reads, `/course` content payloads, progress sync, my-library signals, preview responses, and note catalogs after migrated IDs/slugs are written,
  - old lesson-link resolution must remain deterministic during the compatibility window.

## Scope

- Define the 10/10 naming contract for:
  - course module runtime IDs,
  - course lesson runtime IDs,
  - course module/lesson slugs.
- Decide the runtime-ID shape explicitly:
  - stable semantic token if it can remain rename-safe without brittle parsing, or
  - stable opaque/alias token if that is safer for long-term compatibility.
- Remove production logic that depends on `modN` or `-l` string parsing for course hierarchy/identity where explicit data can be used instead.
- Safely migrate existing course module/lesson admin rows to stable runtime IDs and semantic slugs.
- Safely migrate or resolve downstream consumers of course lesson IDs, including:
  - progress rows,
  - my-library new-content signals,
  - goals-related lesson/module grouping,
  - admin notes/context catalogs,
  - preview/deep-link handling,
  - QR-prefill links if they depend on lesson runtime IDs.
- Introduce a backward-compatible resolution strategy for old lesson links/IDs during the migration window.
- Update admin/editor guidance and validation so editors are not asked to manage fragile internal IDs manually.

## Out Of Scope

- Guide session/drill identity migrations.
- Product/page/QR registry identity migrations outside course-runtime dependencies.
- Broad SEO/marketing URL redesign.
- Manual one-off production DB editing without scripted migration and verification.
- Large content-copy rewrites unrelated to naming/identity safety.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                              | Evidence                                              |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Product goals and IA                          | `target`     | Course/admin identity model is documented so editors can rename titles/slugs without wondering if IDs change. | brief contract + admin/manual QA                      |
| UX flow clarity                               | `target`     | Rename/edit flows show no ambiguous identity side effects; no dead-end migration states.                      | admin e2e + manual QA                                 |
| Visual design quality                         | `supporting` | N/A                                                                                                           | changed UI reviewed against existing admin patterns   |
| Business logic correctness and data integrity | `target`     | Zero orphaned course/progress/note records after migration; identity writes are deterministic and idempotent. | migration tests + invariants + dry-run evidence       |
| Admin editor ergonomics                       | `target`     | Editors can update title/slug without touching internal IDs in normal workflow.                               | admin UX QA + Help/Guide assertions                   |
| Accessibility (a11y)                          | `supporting` | N/A                                                                                                           | changed form/help surfaces covered by existing checks |
| Performance (CWV + payloads)                  | `supporting` | N/A                                                                                                           | verify/perf-budget outputs                            |
| Data placement and sync boundaries            | `target`     | Runtime-ID ownership, compatibility resolution, and writeback rules are explicit and enforced.                | brief contract + integration tests                    |
| Caching and invalidation strategy             | `target`     | Migrated IDs/slugs invalidate stale course/admin/progress reads deterministically.                            | cache notes + route/integration tests                 |
| Reliability and failure handling              | `target`     | Migration can fail/retry without leaving ambiguous partial identity state or unexpected `500`s.               | migration rehearsals + negative-path tests            |
| Security and authz                            | `target`     | Migration/admin identity mutations remain role-gated and fail closed (`401/403`).                             | API negative-path tests                               |
| Privacy and compliance                        | `supporting` | N/A                                                                                                           | migration logging review                              |
| Content governance                            | `target`     | Course content identity becomes stable, explicit, revision-safe, and rename-safe.                             | schema/body contract + revision/manual QA             |
| Admin workflow and editability                | `target`     | Admin workflows keep preview/edit/reorder operations intact after stable identity migration.                  | admin e2e + regression QA                             |
| SEO and crawlability                          | `supporting` | N/A                                                                                                           | route-impact review                                   |
| AI discoverability                            | `supporting` | N/A                                                                                                           | route/content-structure review                        |
| Analytics and KPI observability               | `target`     | Events/signals that include lesson/module identity remain stable or are explicitly migrated.                  | analytics tests + event review                        |
| Commerce and revenue ops                      | `supporting` | N/A                                                                                                           | scope review confirms no checkout/catalog mutation    |
| Incident response and support operations      | `supporting` | N/A                                                                                                           | migration runbook + rollback notes                    |
| Finance and reporting operations              | `supporting` | N/A                                                                                                           | scope review confirms no finance/reporting mutation   |
| i18n operational readiness                    | `supporting` | N/A                                                                                                           | naming contract avoids locale-coupled identifiers     |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js/TypeScript/Supabase stack with no unnecessary dependencies.                              | package diff + architecture review                    |
| Testing and QA automation                     | `target`     | Critical migration, compatibility, and editor flows have unit + e2e coverage with green verify gates.         | test matrix + `verify:pre-pr`/`verify:pre-merge`      |
| Scalability and cost efficiency               | `supporting` | N/A                                                                                                           | migration/read-path review                            |
| DevOps and rollback readiness                 | `target`     | Migration has rehearsal, rollback path, and deterministic repair guidance before merge/rollout.               | runbook + migration checklist + gate evidence         |

Critical target categories for `10/10` claim:

- Business logic correctness and data integrity
- Reliability and failure handling
- Security and authz
- Testing and QA automation
- DevOps and rollback readiness

## Acceptance Criteria

1. Course module and lesson runtime IDs are stable and independent of title, slug, and `sort_order`.
2. Course titles and slugs can be renamed without requiring runtime-ID changes.
3. No production path relies on `modN` or `-l` string-shape assumptions for canonical course identity after closeout.
4. Existing course progress, my-library signals, note contexts, preview links, and admin workflows continue to resolve migrated course items with zero data loss.
5. Legacy lesson IDs/links are either resolved or redirected during an explicit compatibility window, with deterministic operator guidance.
6. Migration scripts are idempotent, reversible, and verified against a representative data snapshot before merge.
7. Help/Guide content explains the shipped naming contract and editor expectations, or explicitly hides internal IDs from routine editing if that is the chosen UX.
8. Operator guidance explicitly distinguishes `rename` from `repurpose`:
   - same learning object may keep its runtime ID while title/slug/copy evolve,
   - materially different learning objective/topic should create a new module/lesson instead of overwriting an existing runtime ID in place.
9. All target scorecard categories reach at least `4/5` for release; critical target categories must reach `5/5` for a `10/10` claim.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted migration/unit tests for course identity parsing, compatibility resolution, and data repair invariants
- targeted e2e for:
  - admin rename/edit/preview flows,
  - `/course?lesson=<legacy-id>` compatibility resolution,
  - progress persistence on migrated lessons,
  - my-library signal integrity after migration
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite (Required)

- Node.js LTS and npm installed where validation runs.
- Before PR handoff:
  - `npm ci`
  - `npm run verify:pre-pr`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin`
  - `http://127.0.0.1:3000/course`
- Preview:
  - PR Vercel URL for migration slice
- Recommended QA matrix:
  - Desktop Chromium
  - Desktop WebKit/Safari
  - Desktop Firefox
  - mobile/tablet sanity on `/course` deep-link/open-preview behavior

## Constraints

- Do not mutate production IDs by hand in admin while this brief is still open.
- Until this migration is implemented, treat existing module/lesson runtime IDs as attached to the original learning object:
  - minor title/copy/slug cleanup is allowed,
  - materially repurposing a module/lesson into different content should use a new row instead of overwriting the old one.
- No destructive migration may ship without:
  - a rehearsal on representative data,
  - a deterministic rollback path,
  - targeted negative-path coverage.
- If safe backward compatibility for legacy lesson IDs cannot be achieved, the slice must pause and either:
  - ship semantic slugs only, or
  - defer runtime-ID migration until a stronger compatibility plan exists.
- Avoid new dependencies unless they materially improve migration safety or verification coverage.

## 10/10 Quality Bar

- Identity is explicit, stable, and decoupled from presentation.
- Title changes do not break progress, notes, preview, deep links, or analytics.
- Slug changes are deliberate and safe; runtime IDs do not churn.
- Reorder operations only affect `sort_order`.
- If semantic runtime IDs are chosen, they are write-once and are not regenerated from title/slug edits.
- If opaque runtime IDs are chosen, operator UX still remains clear because slugs/titles carry the human-facing semantics.
- Required states on changed flows:
  - `loading`
  - `empty`
  - `error`
  - `retry`
  - `success`
- No silent fallback to the wrong course item when a legacy ID is supplied.
- Migration/repair output is operator-readable and auditable.

## Help/Guide And Operator Training Contract

- Required in the same PR if implementation starts:
  - update content/admin Help/Guide copy for runtime-ID vs slug naming rules,
  - add explicit operator warning about `rename` vs `repurpose`,
  - document whether runtime IDs are hidden or read-only in editorial flows,
  - add at least one automated assertion covering updated Help/Guide text or behavior contract.

## Security, Privacy, and Compliance

- Admin/migration endpoints must remain editor/admin-role gated.
- Compatibility resolution must validate exact expected inputs and fail closed.
- No raw secrets, tokens, or PII in migration logs.
- Any temporary alias map must be scoped narrowly and removed when no longer needed.

## Observability and KPI Contract

- Required logs/events:
  - migration summary counts,
  - compatibility alias-hit counts,
  - unresolved legacy-ID lookups,
  - any data-repair warnings/errors.
- Success thresholds:
  - zero unresolved canonical course records after migration,
  - zero unexpected `500` on covered identity read/write paths,
  - alias-hit rate trends downward during compatibility window until decommission.

## Implementation Slices

1. Identity contract and parser hardening:
   - define stable runtime-ID standard,
   - remove code that depends on `modN`/`-l` parsing where possible,
   - introduce explicit compatibility resolver interfaces.
2. Data migration and compatibility window:
   - migrate course content runtime IDs/slugs,
   - migrate dependent records,
   - preserve legacy deep-link/progress resolution safely.
3. Admin/editor UX and Help/Guide alignment:
   - expose/lock internal IDs appropriately,
   - update naming guidance,
   - add regression coverage.
4. Cleanup and closeout:
   - verify alias usage is safe,
   - decide when compatibility layer can be narrowed or removed,
   - complete rollback/runbook evidence.

## Risks And Mitigations

- Risk: breaking stored progress or deep links.
  - Mitigation: compatibility window + data migration rehearsals + invariant tests.
- Risk: partial migration leaves mixed old/new IDs.
  - Mitigation: idempotent scripts, dry-run summaries, rollback plan, and explicit completion markers.
- Risk: editor confusion if internal IDs become more visible.
  - Mitigation: hide or make read-only in normal flows, and update Help/Guide in same PR.
- Risk: choosing semantically derived runtime IDs could reintroduce rename-coupling if operators expect them to track title changes.
  - Mitigation: require an explicit ADR-like decision in implementation closeout on `semantic` vs `opaque` runtime-ID shape, and keep IDs immutable after creation either way.
- Risk: repurposing an existing module/lesson for a different learning objective could preserve old progress, notes, analytics, deep links, or QR context under the wrong semantic item.
  - Mitigation: add explicit operator warning and default workflow rule: rename in place only for the same underlying learning object; create a new module/lesson for materially different content.
- Risk: content production pauses while identity model is in flux.
  - Mitigation: keep this slice separate from editorial production and avoid manual ad hoc ID edits beforehand.

## Checkpoint Log

- `2026-03-16 | planned | created dedicated 10/10 follow-up brief after editorial naming review confirmed current course runtime IDs/slugs are functional but not rename-safe/semantic enough for a long-term 10/10 content model; explicit decision: do not change runtime IDs manually during active content production | next: decide whether to execute this migration before more course renaming/high-volume course content edits`
- `2026-03-16 | in-progress | started slice 1 parser-hardening implementation: centralize course runtime-ID resolution, remove the most brittle slug/-l assumptions from admin/goals note-context paths, and keep migration risk low before any data rewrite | next: add targeted semantic-ID unit coverage and validate no existing admin/course regressions`
- `2026-03-16 | in-progress | slice 1 validation complete: added shared runtime-ID helpers, hardened admin/goals/note-context consumers away from the most brittle `-l`parsing, and passed targeted vitest, targeted eslint,`npm run typecheck`, and full `npm run verify:pre-pr` (`81 passed`, `207 skipped`in Playwright); note:`lint:briefs`diff-mode still skips this newly added brief until it is tracked, but`lint:briefs:all`confirmed this brief itself passes while unrelated legacy briefs still fail repo-wide; perf-budget trend recommended`tighten`, decision: `hold` in this non-perf identity slice and carry that decision into PR closeout | next: decide whether slice 2 should prioritize compatibility alias/read-through migration or editor-facing runtime-ID lock/read-only UX`
- `2026-03-16 | in-progress | started canonical migration slice on branch `feat/course-runtime-id-canonical-migration`: introduced an explicit legacy->canonical runtime-ID/slug manifest, switched exported fallback course data and platform seed rows to canonical semantic runtime IDs with legacy aliases, added in-place admin content repair before import/seed, canonicalized course-note context storage/lookup, and added canonical course-progress/export repair so legacy lesson IDs are merged forward instead of lingering in active flows; targeted vitest, targeted eslint, and `npm run typecheck`all passed locally after the migration wiring | next: run full`npm run verify:pre-pr`, then decide whether remaining alias cleanup stays as post-merge observability/closeout or needs one more implementation pass before PR`
- `2026-03-16 | in-progress | canonical migration slice passed full local pre-PR gate on branch `feat/course-runtime-id-canonical-migration`: `npm run verify:pre-pr`passed after aligning`course-progress-sync` e2e with canonical lesson writeback (`89`unit files green,`379`unit tests green,`81 passed / 207 skipped`in Playwright); explicit brief-lint invocation still reported "No changed task briefs found" because the script's changed-file mode is not picking up this newly tracked brief path, so gate evidence is recorded here instead of relying on diff-mode output; perf-budget trend again recommended`tighten`, decision: `hold`in this non-perf runtime-ID slice and carry the tighten decision into PR summary/follow-up | next: commit, push, and open PR; if CI stays green, run`npm run verify:pre-merge` before merge recommendation`
- `2026-03-16 | in-progress | slice 2 implementation landed locally: added legacy lesson-ID alias metadata on published course modules/lessons, canonical lesson-ID read-through in /course deep-link + local progress hydration + progress API GET/POST paths, and alias-aware goals/module lookup support via shared runtime helpers; targeted vitest (28 tests), targeted eslint, and npm run typecheck all passed locally | next: run npm run verify:pre-pr, then open/update PR if green`
- `2026-03-16 | in-progress | slice 2 gate pass: npm run verify:pre-pr passed end-to-end, including lint/admin/env/pr-body, eslint, typecheck, 89 unit test files / 372 tests, build, perf budgets, and Playwright (`81 passed`, `207 skipped`); perf-budget trend again recommended `tighten`, decision: `hold` in this non-perf compatibility slice and carry the tighten prompt into the next perf-relevant PR/brief update | next: inspect final diff, commit, push, and open PR`
- `2026-03-16 | in-progress | slice 3 implementation + gate pass: lesson runtime IDs are now read-only in editorial UI, normal admin PATCH edits preserve immutable course runtime IDs server-side, and Help/Guide + create/edit copy now explain slug vs runtime ID plus rename-vs-repurpose rules; targeted vitest, targeted eslint, npm run typecheck, admin-short e2e, and final npm run verify:pre-pr all passed (`81 passed`, `207 skipped`); one earlier verify run hit a desktop admin-notes `ECONNRESET`probe, and the required single rerun confirmed flake rather than a deterministic regression | perf-budget trend again recommended`tighten`, decision: `hold` in this non-perf editor-UX slice and carry the tighten prompt into the next perf-relevant PR/brief update | next: inspect final diff, commit, push, and open PR`
- `2026-04-29 | done | lifecycle closeout confirmed the stable course runtime-ID work shipped across PR #218 (`baf5d95` parser/runtime resolution hardening), PR #219 (`38b1780` legacy lesson-ID compatibility), PR #220 (`678af89` admin runtime-ID lock + Help/Guide), and PR #221 (`58581d4`canonical runtime IDs, semantic slugs, alias/read-through repair, progress, export, and note-context wiring); historical GitHub checks are green for all four PRs, and remaining`modN`/`modN-lN` usage is explicit legacy compatibility rather than canonical identity | next: use scoped follow-up briefs only for future alias-window narrowing or observability cleanup`
