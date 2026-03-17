# Task Brief: AW-013 Context-Aware Admin Create, Notes, And QR (10/10)

## Metadata

- `id`: `2026-03-17-aw-013-context-aware-admin-create-notes-and-qr-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-17`
- `updated`: `2026-03-17`

## Goal

Admin can create new content in the correct context from the start, see contextual admin notes while editing, and create/manage QR links from edit surfaces without leaving the active editorial workflow.

## Why This Brief Exists

- This scope comes from a real editorial session, not speculative cleanup.
- The current admin foundations are strong, but content production still loses time to context switching:
  - new lessons are not created from the current module context by default,
  - admin notes live on separate contextual surfaces instead of the edit workflow itself,
  - QR registry and lesson-row prefill exist, but QR actions are still too detached from editing.
- A dedicated follow-up brief keeps this friction batch coherent and prevents it from being diluted inside the general backlog.

## Existing Foundations To Reuse

- Existing AW-013 parent track:
  - `docs/task-briefs/in-progress/2026-02-22-admin-full-content-edit-workflow-10-10.md`
- Existing editorial-production parent track:
  - `docs/task-briefs/in-progress/2026-02-25-content-production-v1-admin-editorial-run.md`
- Existing lesson/module workspace and edit entrypoints already live in admin.
- Existing contextual admin notes panel already exists on contextual content surfaces.
- Existing QR registry, stable redirect route (`/go/v/[slug]`), and lesson-row QR prefill flow already exist.

This brief is therefore a workflow-consolidation slice, not a greenfield QR or notes build.

## Dependencies And Boundaries

- Parent workstreams:
  - `docs/task-briefs/in-progress/2026-02-22-admin-full-content-edit-workflow-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-25-content-production-v1-admin-editorial-run.md`
- Existing QR platform contract remains authoritative:
  - `docs/task-briefs/done/2026-02-28-qr-video-redirect-links-and-admin-controls-10-10.md`
  - `docs/runbooks/qr-redirect-operations.md`
- Existing contextual-notes foundation remains authoritative:
  - `docs/task-briefs/in-progress/2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md`
- This slice improves editorial creation/editing workflow.
- This slice does not redefine the global learner-facing "new lessons" business rule; that remains a separate follow-up track.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                               | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Editors can start the intended create/edit/QR action from the relevant module/lesson/product context in <=2 steps.                           | timed manual QA + e2e                         | `5`                     |
| UX flow clarity                               | `target`     | Create/edit/notes/QR flows have no dead ends and all changed surfaces support `loading/empty/error/retry/success`.                           | e2e + manual QA                               | `5`                     |
| Visual design quality                         | `target`     | Context create, notes, and QR surfaces feel like one coherent admin workflow with consistent hierarchy and spacing.                          | visual QA + review checklist                  | `5`                     |
| Business logic correctness and data integrity | `target`     | New lessons attach to the intended parent/module deterministically; notes/QR attachments stay bound to canonical content rows.               | unit + integration + negative-path tests      | `5`                     |
| Admin editor ergonomics                       | `target`     | High-frequency editorial tasks (create lesson, reference notes, create QR) complete without tab-hopping or re-finding context.               | timed manual QA + e2e                         | `5`                     |
| Accessibility (a11y)                          | `target`     | Keyboard and screen-reader users can create/edit content, open notes, and access QR actions with labeled controls.                           | Playwright + manual QA                        | `5`                     |
| Performance (CWV + payloads)                  | `supporting` | `/admin` route and edit panels show no material regression beyond existing verify budgets.                                                   | build + perf budgets + route smoke            | `4`                     |
| Data placement and sync boundaries            | `target`     | Parent linkage, notes, and QR attachment state remain server-canonical with deterministic admin refresh after mutation.                      | code review + tests                           | `5`                     |
| Caching and invalidation strategy             | `target`     | After save/create/update, admin surfaces show canonical notes/QR/module linkage without stale context.                                       | e2e + manual QA                               | `5`                     |
| Reliability and failure handling              | `target`     | Validation and expected failure states return actionable non-500 guidance for create, notes, and QR workflows.                               | negative-path API/e2e coverage                | `5`                     |
| Security and authz                            | `target`     | Notes and QR mutations stay role-gated and fail closed (`401/403/400`) with strict payload validation.                                       | API tests + e2e unauthorized assertions       | `5`                     |
| Privacy and compliance                        | `supporting` | Notes/QR/error states do not leak sensitive values in logs or UI.                                                                            | log review + tests                            | `4`                     |
| Content governance                            | `target`     | Notes and QR attachments remain attributable to owner/content/placement with revision-safe editorial behavior.                               | admin UI + API assertions                     | `5`                     |
| Admin workflow and editability                | `target`     | Edit surfaces provide the context editors need in one place for lessons and other in-scope content.                                          | e2e + manual QA                               | `5`                     |
| SEO and crawlability                          | `supporting` | Existing `/go/v/[slug]` routing/noindex contracts remain intact when surfaced from edit workflows.                                           | route checks + QR contract review             | `4`                     |
| AI discoverability                            | `N/A`        | Admin-only workflow slice; no change to public AI-discoverability contract beyond preserving existing content identifiers.                   | scope rationale                               | N/A                     |
| Analytics and KPI observability               | `target`     | Contextual create/note/QR actions retain or extend stable operational event/log coverage where behavior changes.                             | event/log assertions                          | `5`                     |
| Commerce and revenue ops                      | `supporting` | Product-surface QR/edit additions do not break entitlement or checkout-linked metadata.                                                      | targeted manual QA + unit checks              | `4`                     |
| Incident response and support operations      | `target`     | Help/Guide and QR runbook explain new context-aware create/notes/QR actions and recovery paths.                                              | docs + help-center assertions                 | `5`                     |
| Finance and reporting operations              | `N/A`        | No finance/reporting contract change in this editorial workflow slice; product QR/edit additions must preserve existing product identifiers. | scope rationale                               | N/A                     |
| i18n operational readiness                    | `N/A`        | No locale model change in this slice; labels/help copy must avoid introducing locale-hostile assumptions.                                    | scope rationale                               | N/A                     |
| Stack-fit and dependency discipline           | `target`     | Reuses existing admin, notes, and QR stack without unnecessary new dependencies.                                                             | dependency diff                               | `5`                     |
| Testing and QA automation                     | `target`     | Relevant unit + e2e + negative-path coverage added for create context, notes-in-edit, and QR-in-edit behavior.                               | CI green + `verify:pre-pr`/`verify:pre-merge` | `5`                     |
| Scalability and cost efficiency               | `supporting` | No new obvious N+1 or repeated fetch loops in admin edit surfaces.                                                                           | code/query review                             | `4`                     |
| DevOps and rollback readiness                 | `target`     | Existing revision restore and QR disable/rollback paths remain intact and documented after workflow changes.                                 | docs + regression tests                       | `5`                     |

## Data Placement And Sync Contract (Required For Stateful Features)

- Server-canonical data:
  - content rows and parent/child linkage,
  - note attachments and note records,
  - QR link records, status, destination, placement, and attachment metadata.
- Local-only data:
  - transient unsaved create/edit form state,
  - panel open/closed state,
  - temporary prefill values before explicit save/create.
- Sync policy:
  - new content rows save only on explicit admin action,
  - server response is the source of truth after create/update,
  - contextual notes/QR sections refresh from canonical server state after mutation,
  - expected failures keep the editor open and show deterministic recovery copy.
- Conflict and invalidation:
  - invalid parent/module or stale content references fail explicitly,
  - successful note/QR mutations invalidate and refresh the current edit context immediately,
  - published-content invalidation remains unchanged unless the slice changes published fields.
- Retention and sensitivity:
  - no secret values inside QR destination defaults,
  - admin notes remain admin-only and must not leak into public payloads.

## Identity And Rename Contract (Required When Entities Are Persisted Or Linkable)

- Canonical stable IDs:
  - content row DB ids remain canonical for attachments and admin editing,
  - existing lesson/module runtime IDs and slugs remain authoritative where already used in course/public flows,
  - QR link DB id + stable slug remain canonical for redirect operations.
- Human-readable identifiers:
  - content titles and labels remain editable,
  - QR content labels are display-only and not canonical identity.
- Mutability rules:
  - notes and QR attachments must bind to canonical content item ids, not free-text labels,
  - QR slug should stay stable once printed/shared; destination may change safely,
  - existing content rename-in-place remains allowed only when the learning object is still the same.
- Rename vs repurpose:
  - if a lesson/module/product becomes materially different, create a new entity instead of silently repurposing the old one,
  - QR links whose real-world printed meaning changes materially should become new links rather than hidden repurposes.
- Compatibility contract:
  - existing course runtime-ID alias/read-through behavior must stay intact,
  - existing `/go/v/[slug]` redirect contract remains authoritative.
- Observability and repair:
  - unresolved note/QR attachment reads or invalid content references must log deterministically and fail with guided admin recovery.

## Scope

- Context-aware create flow improvements:
  - start new lesson creation from current module context by default,
  - preserve an explicit override path when creating outside the current module is intentional,
  - reduce "create first, repair parent later" friction.
- Edit-surface contextual notes:
  - show existing contextual admin notes inside edit workflow for relevant content types,
  - allow create/edit/toggle/delete without leaving the edit context when policy permits.
- Edit-surface QR workflow:
  - show linked QR records and stable `/go/v/[slug]` info directly from edit surfaces,
  - provide quick create/manage flow from lesson/product/page edit context,
  - keep QR registry as canonical operations home while reducing editorial context switching.
- Help/Guide and workflow copy updates for changed actions and recovery behavior.

## Out Of Scope

- Global nav/dashboard active-state redesign.
- iPhone spacing/header-rhythm polish.
- Full my-library "new vs updated content" product-rule redesign.
- Replacing the QR registry as the canonical admin operations surface.
- New personalized/user-specific QR token system.

## Recommended QR Direction (Locked Unless Owner Overrides)

- QR assets should continue to encode stable freeswimming URLs:
  - `https://freeswimming.org/go/v/<slug>`
- For lesson editing, the default QR destination should be the internal learner route for that lesson:
  - example: `/course?lesson=<canonicalLessonId>`
- External video or other allowlisted HTTPS destinations should remain an advanced override, not the default.
- Best-practice reasoning:
  - stable freeswimming URLs avoid reprinting when destination changes,
  - defaulting to the internal learner route keeps lesson identity, analytics, and support context coherent,
  - advanced external override still supports video-specific use cases without making them the primary content contract.

## Acceptance Criteria

1. Admin can create a new lesson directly into the intended module context without first creating it in the wrong place.
2. Edit workflow shows the contextual information editors need in place, including admin notes for relevant content.
3. Lesson/product/page edit surfaces expose attached QR information and quick create/manage actions without forcing a separate discovery step.
4. QR create defaults follow the stable internal redirect contract and preserve existing security/allowlist rules.
5. Changed workflows preserve role gating, deterministic validation, and rollback-safe behavior.
6. Help/Guide and QR runbook are updated in the same PR when workflow labels/actions/recovery behavior change.
7. `npm run verify:pre-pr` passes before PR update and `npm run verify:pre-merge` passes before merge recommendation.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- targeted admin e2e for changed create/edit/QR/notes flows
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin`
- Preview:
  - PR Vercel preview URL
- Core manual QA paths:
  - create lesson from course workspace/module context,
  - open lesson edit and verify contextual notes presence,
  - create/manage QR from lesson edit context,
  - verify linked QR resolves via `/go/v/<slug>`.

## Constraints

- Keep the QR registry as canonical operations source-of-truth.
- Avoid broad redesign of admin navigation while solving this friction batch.
- Preserve existing visual language and editing safety patterns.
- Do not weaken QR redirect policy or host/protocol validation to make the flow feel shorter.

## 10/10 Quality Bar (Required For User-Facing Work)

- Primary editorial flows must feel linear:
  - find context -> create/edit -> verify notes/QR -> save -> continue.
- Required states on changed surfaces:
  - `loading`,
  - `empty`,
  - `error`,
  - `retry`,
  - `success`.
- Editors should not need to remember hidden context while creating or editing.
- Notes and QR sections must behave like first-class editing context, not detached utilities.
- No silent parent misplacement, hidden attachment drift, or ambiguous recovery steps.

## Risks And Mitigations

- Risk: the slice grows into a broad admin redesign.
  - Mitigation: keep scope limited to context-aware create, notes-in-edit, and QR-in-edit surfaces.
- Risk: QR workflow becomes inconsistent between registry and edit surfaces.
  - Mitigation: registry stays canonical; edit surfaces act as contextual entrypoints and status surfaces.
- Risk: parent/module defaults cause accidental wrong attachment.
  - Mitigation: prefill from current context, but keep visible parent confirmation/override before save.
- Risk: notes and QR panels increase editor clutter.
  - Mitigation: progressive disclosure with clear section hierarchy and compact defaults.

## Implementation Slices

1. Context-aware create defaults for course module -> lesson flow.
2. Contextual admin notes surfaced inside edit workflows.
3. Contextual QR status/create/manage surfaced inside edit workflows.
4. Help/Guide + runbook alignment and negative-path hardening.

## Checkpoint Log

- `2026-03-17 | done | PR #226 merged to main as \`1531588\` after local \`npm run verify:pre-pr\` passed twice on final HEAD, GitHub required checks all passed (including \`verify\` in \`7m53s\`), and local \`npm run verify:pre-merge\` passed with public verify green and private-gate follow-up correctly skipped for this non-private environment | achieved critical target categories: UX flow clarity \`5/5\`, Business logic correctness and data integrity \`5/5\`, Admin editor ergonomics \`5/5\`, Reliability and failure handling \`5/5\`, Security and authz \`5/5\`, Testing and QA automation \`5/5\` | next: resume real admin/content production and log only the next actual friction batch`
- `2026-03-17 | c4b5253 | integrated implementation + local pre-PR gate green | AW-013 implementation committed on branch \`feat/aw-013-context-aware-admin-create-notes-qr\`: context-aware lesson create now starts from the selected module with locked runtime-ID defaults, edit surfaces now expose contextual admin notes inline, and lesson/page/product edit flows now include contextual QR status/create/manage backed by filtered admin QR reads; targeted unit/e2e checks and full \`npm run verify:pre-pr\` passed (\`93\` unit files / \`403\` tests, Playwright \`81 passed\` / \`207 skipped\`) | perf trend recommendation: \`tighten\`; decision for this non-perf slice: \`hold\` and carry the tighten decision into the next perf-focused checkpoint/PR summary | next: push branch, open PR, and monitor required CI before running \`npm run verify:pre-merge\``
- `2026-03-17 | in-progress | implementation started on branch \`feat/aw-013-context-aware-admin-create-notes-qr\`; verified overlap with existing briefs/code before editing, then shipped the first integrated pass: course create route now assigns locked course runtime IDs at create-time and requires a real parent module for new lessons, course workspace gained contextual lesson create, edit surfaces gained inline contextual notes, and lesson/page/product edit surfaces gained contextual QR create/manage panels backed by filtered QR API reads; Help/Guide and QR runbook updated to describe the new workflow | next: add targeted edit-context unit coverage + admin e2e assertions, run full \`verify:pre-pr\`, then open PR`
