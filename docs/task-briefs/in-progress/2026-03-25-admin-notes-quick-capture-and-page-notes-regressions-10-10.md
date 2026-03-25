# Task Brief: Admin Notes Quick Capture And Page Notes Regressions (10/10)

## Metadata

- `id`: `2026-03-25-admin-notes-quick-capture-and-page-notes-regressions-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-25`
- `updated`: `2026-03-25`

## Goal

Blocking production regressions in admin quick capture and page-context notes are repaired before work resumes on broader program-builder scope.

## Why This Brief Exists

- Production verification on `2026-03-25` found that `Quick note` is not usable because text inputs lose focus after each typed character.
- Additional production verification on `2026-03-25` found that clipboard screenshot paste is not working in either `Quick note` or the main admin-notes create flow when using normal OS/browser paste shortcuts.
- The current open production notes queue also contains unresolved quick-capture/page-notes friction that now outranks planner/program follow-up work:
  - `616ba9a5-1a08-435b-beca-ba10492ff7bc` `Home page`
  - `b730efef-bdc9-43f1-b8a5-5423afd3edda` `Quick note`
- One additional production note is related but should stay under an already-open brief instead of being mixed into this repair slice:
  - `1059a360-7719-4fe7-a0f1-36807e2c2be3` `Link related notes`

## Admin-Notes Triage Disposition

- `616ba9a5-1a08-435b-beca-ba10492ff7bc` `Home page`
  - Disposition: owned by this brief.
  - Reason: `/` is an existing page-context notes surface, so this is a repair on shipped behavior rather than a net-new feature request.
- `b730efef-bdc9-43f1-b8a5-5423afd3edda` `Quick note`
  - Disposition: owned by this brief.
  - Reason: quick-capture compose/screenshot behavior is regressed on production and is now blocking normal operator use.
- `1059a360-7719-4fe7-a0f1-36807e2c2be3` `Link related notes`
  - Disposition: owned by existing brief [2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md).
  - Reason: that brief already owns related-note UX/data-model behavior and should keep that scope coherent.
- Direct production verification finding from `2026-03-25`:
  - `Quick note` text fields lose focus after each typed character and require re-click before every next keystroke.
  - Disposition: owned by this brief even though the regression is not yet represented by its own surviving prod note row.
  - Clipboard screenshot paste via normal keyboard shortcuts does not produce any visible staged image in `Quick note` or the main admin-notes create form on `freeswimming.org`.
  - Disposition: owned by this brief even though the regression is not yet represented by its own surviving prod note row.

## Dependencies And Boundaries

- Depends on:
  - [2026-03-24-admin-notes-compose-parity-and-input-stability-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-24-admin-notes-compose-parity-and-input-stability-10-10.md)
  - [2026-03-22-admin-notes-quick-capture-launcher-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-22-admin-notes-quick-capture-launcher-10-10.md)
  - [2026-03-22-admin-notes-screenshot-region-capture-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-22-admin-notes-screenshot-region-capture-10-10.md)
  - [2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md)
- This slice owns:
  - quick-capture input stability regressions,
  - clipboard screenshot-paste regressions on already-shipped note forms,
  - quick-capture screenshot/layout regressions that make the surface misleading or unusable,
  - page-context notes regressions on already-supported page routes such as `/`.
- This slice does not own:
  - new related-note data model or broader linking UX redesign,
  - new app-wide note surfaces beyond already-shipped page/context panels,
  - broader planner/program-builder completion.

## Scope

- Repair `Quick note` so title/body/category flows accept continuous typing without losing focus.
- Repair clipboard screenshot paste on shipped admin-note create surfaces so normal Cmd+V / Ctrl+V image paste works again.
- Repair shipped quick-capture behavior that prevents admins from capturing the intended underlying page content faithfully.
- Repair the home-page page-context notes surface so admins do not hit a broken notes state on `/`.
- Add regression coverage that would fail if the focus-loss, clipboard-paste, or repaired page-surface behavior returns.

## Out Of Scope

- Changing the canonical related-note ownership/identity contract.
- New quick-capture rollout to additional routes.
- Program builder, planner, or export work.

## Data Placement And Sync Contract

- Server-canonical data:
  - saved admin note rows,
  - saved attachment metadata/objects,
  - page-context note records for `/` and other shipped page surfaces.
- Local-only data:
  - quick-capture open/closed state,
  - unsaved quick-capture draft values,
  - transient screenshot preview state before explicit save, including pasted clipboard images before note save.
- Sync policy:
  - input/focus fixes must not change server payload semantics,
  - page-notes fixes must keep notes reads server-canonical and deterministic,
  - no new local persistence layer is introduced for this repair.
- Retention and sensitivity:
  - existing admin-only screenshot/privacy rules remain unchanged.
- Cache/invalidation:
  - repaired surfaces still refresh through existing admin-notes APIs and should not require a manual hard reload between normal mutations.

## Identity And Rename Contract

- Canonical stable IDs:
  - `admin_note.id` remains canonical.
- Human-readable identifiers:
  - note title remains display text only.
- Mutability rules:
  - this repair does not change note identity, context identity, or rename policy.
- Rename vs repurpose policy:
  - regression fixes must preserve existing note rows instead of migrating them into new entities.
- Compatibility contract:
  - existing quick-capture/page-note rows remain valid.
- Observability and repair:
  - repaired regressions must be caught by targeted regression tests so they do not silently reappear.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Admin editor ergonomics`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                               | Evidence                        |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Product goals and IA                          | `target`     | Operators can still use quick capture and shipped page-notes surfaces as intended without relearning the workflow.                                                           | manual QA + e2e                 |
| UX flow clarity                               | `target`     | Quick note fields accept continuous typing, clipboard image paste responds on shipped note forms, and repaired page-note surfaces no longer present a broken dead-end state. | regression tests + manual QA    |
| Visual design quality                         | `supporting` | Supporting only: repairs should preserve existing notes visual language instead of introducing hotfix-looking UI.                                                            | code review + screenshot review |
| Business logic correctness and data integrity | `target`     | Repair keeps canonical note payload semantics intact and does not create duplicate saves or mutated context refs while typing.                                               | unit tests + request assertions |
| Admin editor ergonomics                       | `target`     | Admin can open quick note and type normally without pointer reactivation on every character, and can stage a pasted screenshot with normal keyboard shortcuts.               | regression test + manual QA     |
| Accessibility (a11y)                          | `target`     | Repaired focus behavior remains keyboard-usable and does not trap focus on the wrong control during normal typing.                                                           | unit/e2e + focus assertions     |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: hotfix does not add noticeable client weight or repeated network fetch churn.                                                                               | build + code review             |
| Data placement and sync boundaries            | `target`     | Fixes stay within existing local draft vs server-canonical note boundaries.                                                                                                  | code review + tests             |
| Caching and invalidation strategy             | `supporting` | Supporting only: repaired note surfaces continue to refresh through existing no-store admin APIs without new invalidation complexity.                                        | code review                     |
| Reliability and failure handling              | `target`     | Existing quick-capture/page-note flows remain usable through rerenders, clipboard image paste, and do not regress into broken focus or broken surface states.                | regression tests                |
| Security and authz                            | `supporting` | Supporting only: repairs must preserve admin-only visibility and fail-closed routes.                                                                                         | existing negative-path coverage |
| Privacy and compliance                        | `supporting` | Supporting only: screenshot/privacy behavior must not widen beyond existing admin-only constraints.                                                                          | scope review                    |
| Content governance                            | `N/A`        | N/A because this repair does not change editorial governance, publishing policy, or content ownership semantics.                                                             | scope rationale                 |
| Admin workflow and editability                | `target`     | Quick capture and page-context notes remain low-friction operational tools after the repair.                                                                                 | manual QA + regression coverage |
| SEO and crawlability                          | `N/A`        | N/A because these are private admin workflows and page-note repairs do not change public crawl/index behavior.                                                               | scope rationale                 |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing discoverability surface.                                                                                                  | scope rationale                 |
| Analytics and KPI observability               | `supporting` | Supporting only: repairs should not break existing admin interaction event opportunities.                                                                                    | code review                     |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, payout, or commerce operations are changed by this repair slice.                                                                            | scope rationale                 |
| Incident response and support operations      | `target`     | Handoff and docs should make the repaired regression boundary clear so future operator triage is faster.                                                                     | brief checkpoint + handoff      |
| Finance and reporting operations              | `N/A`        | N/A because this repair does not touch finance, reconciliation, or reporting flows.                                                                                          | scope rationale                 |
| i18n operational readiness                    | `N/A`        | N/A because this regression fix changes no locale model, translation workflow, or locale-sensitive routing contract.                                                         | scope rationale                 |
| Stack-fit and dependency discipline           | `target`     | Use existing modal/admin-notes patterns with no new dependencies.                                                                                                            | dependency diff + code review   |
| Testing and QA automation                     | `target`     | Add regression coverage that would fail if quick-note typing focus, clipboard screenshot paste, or repaired page-surface behavior breaks again.                              | unit/e2e + `verify:pre-pr`      |
| Scalability and cost efficiency               | `supporting` | Supporting only: fixes should not create repeated unnecessary rerenders or duplicate network work during note entry.                                                         | code review                     |
| DevOps and rollback readiness                 | `supporting` | Supporting only: repair should be isolated enough to revert without schema or data rollback.                                                                                 | small diff + code review        |

## Acceptance Criteria

1. Quick note title/body/category entry accepts continuous typing with no focus-loss after each character.
2. Clipboard image paste via normal keyboard shortcuts stages an image on shipped admin-note create surfaces without changing canonical attachment-save semantics.
3. Quick-capture repair does not change canonical note save semantics or create duplicate note writes.
4. Home-page page-context notes surface no longer shows a broken notes state for admins on `/`.
5. Production note `1059a360-7719-4fe7-a0f1-36807e2c2be3` remains explicitly owned by the existing attachments/linking brief and is not silently absorbed here.
6. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- targeted `vitest` for quick-capture/clipboard/page-note regression coverage
- targeted `playwright` for admin notes workflow when needed
- `npm run typecheck`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Constraints

- Keep the fix minimal and regression-focused.
- Do not change unrelated admin-notes flows while repairing focus stability.
- Preserve current visual language unless the repair requires a clearer affordance for the shipped surface.

## 10/10 Quality Bar

- The operator should trust quick note immediately again.
- Required states on repaired surfaces remain explicit: `loading`, `empty`, `error`, `retry`, `success`.
- Focus behavior must feel deterministic on keyboard and pointer input.
- Clipboard screenshot paste must either stage visibly or fail with actionable recovery, never silently no-op.
- No silent duplicate saves, no fake success, and no broken page-context attachment semantics.

## Checkpoint Log

- `2026-03-25 | triage + implementation start | opened dedicated regression brief after production verification found blocking quick-note typing focus loss plus unresolved home-page/page-notes and quick-capture friction; linked related-note UX comment back to the existing attachments/linking brief instead of mixing ownership | next: patch quick-note focus regression first, add regression coverage, then reassess whether home-page page-notes repair fits the same slice before PR`
- `2026-03-25 | production verification update | confirmed a second live regression from operator testing: clipboard screenshot paste currently appears dead in both Quick note and the main admin-notes create form on freeswimming.org, so the hotfix scope now includes clipboard-paste repair alongside focus-loss and page-notes repair | next: widen clipboard image intake compatibility, harden field-level paste handling, and add regression coverage before returning to the home-page page-notes fix`
