# Task Brief: Course Content Live Review And Learner-Surface Polish (10/10)

## Metadata

- `id`: `2026-03-26-course-content-live-review-and-learner-surface-polish-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-26`
- `updated`: `2026-03-27`

## Goal

While live course content drafting is in progress, we should use this brief as the active 10/10 implementation slice for the confirmed current-wave learner/course-workspace/contextual-notes friction, while still logging adjacent non-blocking findings and keeping any extra scope additions explicit.

## Why This Brief Exists

- The platform is now stable enough that real content production is more valuable than speculative polish.
- Live drafting and route review will surface the highest-signal issues in `/course` and adjacent editing flows.
- Some of those issues now appear in contextual admin-note panels attached to course/page surfaces, so the intake track must be able to hold those findings too without reopening broad admin-notes work by default.
- We need one current brief that can absorb findings continuously without letting non-blocking polish outrank content progress.
- The owner has now explicitly asked to execute the current confirmed tweaks in one wave rather than leaving them as review-only findings:
  - contextual `Add note` needs image-intake parity,
  - pass-criteria completion needs a local `Done` action near the checklist,
  - contextual success notices should auto-dismiss after a short acknowledgement window,
  - contextual note compose should stay at the top but collapse when notes already exist,
  - Course Workspace overview needs more direct lesson/module actions,
  - the active/current workspace should appear above the broad overview layer.
- Additional nearby design tweaks from older briefs should be reviewed explicitly before they are pulled into this implementation scope.

## Dependencies And Boundaries

- Parent editorial-production track:
  - `docs/task-briefs/in-progress/2026-02-25-content-production-v1-admin-editorial-run.md`
- Existing course/admin content foundations remain source-of-truth workstreams:
  - `docs/task-briefs/in-progress/2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-22-admin-full-content-edit-workflow-10-10.md`
  - `docs/task-briefs/in-progress/2026-03-16-stable-course-runtime-ids-and-semantic-slugs-10-10.md`
- This brief is a live review/intake track, not permission for broad redesign.
- Blocking issues discovered here may spawn narrow implementation briefs/PRs; non-blocking findings stay logged here until reprioritized.

## Admin Notes Triage Status

Production admin notes reviewed against this scope on `2026-03-26`:

- `3b7783ba-6a98-46f9-9259-909a1a90ac9e` `NEW CONTENT NOTIFICATION`
  - disposition: out of scope for this brief for now; not a direct blocker to current course content drafting.
- `f96e7d7c-3477-417d-b96f-f2c8f876e2ab` `Non-admin test data cleanup follow-up`
  - disposition: residual non-course cleanup; out of scope.
- `e27aae0e-0eb1-4830-8cde-daf8fe63a995` `Subscription prices - Thoughs`
  - disposition: pricing/commercial scope; out of scope.
- `881e222b-4c14-4a23-b677-60b0713e220f` `Admin notes quick capture route-surface expansion follow-up`
  - disposition: admin-notes follow-up; intentionally paused unless it blocks content work.
- `204913d0-5c97-41e8-b6f7-ab42de3bc84e` `Admin notes attachment metadata and agent-readiness follow-up`
  - disposition: admin-notes follow-up; intentionally paused unless it blocks content work.

Current conclusion:

- No currently open production admin note directly owns this learner-course/content-review scope.
- New findings discovered during live drafting may be captured here first, then either:
  - linked to an existing brief,
  - split into a new implementation brief,
  - or added as a new production admin note if cross-session/operator tracking is needed.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Content governance`
- `Admin workflow and editability`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                         | Evidence                                       |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Product goals and IA                          | `target`     | Every logged finding identifies route, user job, and intended page purpose before any fix is scoped.                                   | findings log + checkpoint notes                |
| UX flow clarity                               | `target`     | Each blocker/high-friction finding records the broken cue, intended cue, and whether it blocks continued drafting.                     | findings log + manual QA                       |
| Visual design quality                         | `target`     | Visible internal IDs, placeholder tokens, or obviously unfinished UI labels on learner surfaces are either fixed or explicitly queued. | screenshots + findings log                     |
| Business logic correctness and data integrity | `target`     | For each issue, we identify whether the root cause is content data, rendering logic, or identity leakage before implementation starts. | code trace + brief notes                       |
| Admin editor ergonomics                       | `target`     | Live content work can continue without repeated undispositioned blockers; each blocker gets same-day disposition.                      | checkpoint log + live review notes             |
| Accessibility (a11y)                          | `supporting` | Supporting only: findings should not degrade existing semantics while content review continues.                                        | code review + existing test baseline           |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: this intake brief should not trigger broad performance work unless a live blocker is discovered.                      | scope rationale                                |
| Data placement and sync boundaries            | `target`     | Each logged issue states whether the source is server-canonical content, local UI state, or mixed ownership.                           | findings log + data-boundary notes             |
| Caching and invalidation strategy             | `supporting` | Supporting only: only escalate when a finding shows stale or misleading learner/admin reads after content changes.                     | scope rationale + follow-up slice notes        |
| Reliability and failure handling              | `target`     | Blocking route/content failures discovered during drafting are either fixed immediately or logged as explicit blockers.                | findings log + checkpoint notes                |
| Security and authz                            | `supporting` | Supporting only: no auth-scope expansion is intended; any auth regression found during review becomes a separate blocker slice.        | scope rationale                                |
| Privacy and compliance                        | `N/A`        | N/A because this review concerns course content presentation/editorial flow and should not introduce new personal-data handling.       | scope rationale                                |
| Content governance                            | `target`     | Every content-facing issue is classified by canonical source field (`title`, `goal`, `drillLabel`, etc.) and owner surface.            | findings log + code/content trace              |
| Admin workflow and editability                | `target`     | Non-blocking polish does not outrank live drafting; blockers get split into focused slices with clear owner and next step.             | checkpoint notes + spawned follow-up briefs    |
| SEO and crawlability                          | `supporting` | Supporting only: only escalate if content review reveals broken metadata/indexing behavior on public routes.                           | scope rationale                                |
| AI discoverability                            | `supporting` | Supporting only: only escalate if content review reveals broken semantic structure on public course pages.                             | scope rationale                                |
| Analytics and KPI observability               | `N/A`        | N/A because this intake track does not itself add new analytics events; analytics follow-up only if a discovered issue requires it.    | scope rationale                                |
| Commerce and revenue ops                      | `N/A`        | N/A because course-content drafting review does not change pricing, checkout, or entitlements.                                         | scope rationale                                |
| Incident response and support operations      | `N/A`        | N/A for this intake brief because no new critical runbook path is introduced unless a discovered blocker later warrants its own slice. | scope rationale tied to review-only phase      |
| Finance and reporting operations              | `N/A`        | N/A because this brief does not change financial records, pricing logic, refunds, or reporting flows.                                  | scope rationale tied to non-commerce scope     |
| i18n operational readiness                    | `N/A`        | N/A because this brief is about current English content review and should not itself alter locale-routing or translation architecture. | scope rationale tied to current drafting scope |
| Stack-fit and dependency discipline           | `target`     | Any spawned fix uses existing content/admin/course patterns and adds no unnecessary dependencies.                                      | diff review + follow-up PR evidence            |
| Testing and QA automation                     | `target`     | Every implementation slice created from this brief ships with targeted tests plus `verify:pre-pr` and `verify:pre-merge`.              | child brief validation evidence + CI           |
| Scalability and cost efficiency               | `supporting` | Supporting only: no broad backend/runtime expansion should be introduced for cosmetic review findings.                                 | scope rationale                                |
| DevOps and rollback readiness                 | `supporting` | Supporting only: each spawned slice must stay revertible and isolated.                                                                 | child PR summaries + rollback notes            |

## Data Placement And Sync Contract

- Server-canonical:
  - published course modules and lessons,
  - lesson fields such as `title`, `goal`, `cues`, `drill`, `passCriteria`, `drillLabel`, and status/order metadata.
- Local-only:
  - temporary authoring observations captured in this brief,
  - browser-local learner progress and UI affordances already defined elsewhere.
- Sync policy:
  - this brief does not change runtime sync behavior directly,
  - any issue that appears to come from stale reads or invalidation drift must be called out explicitly and moved into a dedicated slice before code changes.
- Retention and sensitivity:
  - only non-secret issue descriptions and route/content observations belong here,
  - no credentials, raw tokens, or sensitive user data should be copied into the brief.
- Cache/invalidation:
  - if a finding appears only after publish/refresh lag, record the exact invalidation symptom and environment before implementation.

## Identity And Rename Contract

- Canonical stable IDs:
  - course lesson and module runtime IDs remain the source-of-truth identifiers for routing, progress, notes, and admin linkage.
- Human-readable identifiers:
  - learner-facing text such as lesson titles, module titles, and section badge labels must stay human-readable and must not expose internal-looking IDs or import artifacts.
- Mutability rules:
  - labels such as `drillLabel` are editable content fields,
  - runtime IDs are not to be repurposed as presentation labels.
- Rename vs repurpose policy:
  - editorial renames in place are acceptable when the underlying learning object is still the same,
  - materially different lessons/modules should still follow the existing create-new vs repurpose guidance in the parent editorial brief.
- Compatibility contract:
  - this intake brief does not redefine alias or redirect behavior,
  - any identity-leak or legacy-ID read discovered here must be traced before a fix is scoped.

## Scope

- Implement the confirmed current-wave changes on:
  - learner `/course` lesson completion affordances,
  - admin `Course workspace` information order and overview actions,
  - contextual admin-note panels on course/page surfaces.
- Keep the brief as the live log for additional findings discovered during the same drafting wave.
- Candidate additions from older/adjacent briefs must be listed explicitly before being pulled into this scope.

## Confirmed Now Scope

This execution wave now owns:

- learner `/course`
  - keep `Mark as done` / `Done` available beside `Pass criteria` so the user can finish from the checklist area without scrolling back up.
- admin `Course workspace`
  - move current/active workspace emphasis above the broad overview layer,
  - make overview-mode module cards expose direct lesson actions from module context:
    - `Open lesson`,
    - `Edit lesson`,
    - `Delete lesson`,
  - add module delete entry in overview mode using the existing safe delete flow.
- contextual admin-note panels
  - add visible image intake to contextual `Add note` using the same two-path model already shipped elsewhere:
    - `Paste image from clipboard`,
    - `Upload image`,
  - keep `Add note` at the top of the panel but collapse its compose body by default when notes already exist,
  - let `Quick note` collapse into a resumable right-edge draft state without losing unsaved text or a staged image,
  - auto-dismiss success notices after a short acknowledgement window while preserving explicit error notices.

## Candidate Tweak Migration Review

These are nearby design/UI tweaks from older or adjacent brief lineage that I consider small enough to potentially fold into this brief, but I am not automatically pulling them in without explicit confirmation:

1. Hide or sanitize suspicious learner-facing section badge labels when authored `drillLabel` looks like an internal/imported ID instead of human copy.
   - lineage: lesson badge label support in `2026-02-22-admin-full-content-edit-workflow-10-10.md`
2. Add lesson-level `Open preview` directly inside overview-mode module lesson preview rows, not only in focused workspace/all-content rows.
   - lineage: `2026-03-03-admin-preview-mode-and-open-lesson-preview-10-10.md`
3. Make contextual admin-note success notices location-aware so only one success surface shows at a time instead of stacked duplicates when quick note and note toggle both fire.
   - lineage: admin-notes compose/workflow parity briefs from `2026-03-24` and `2026-03-25`
4. Compact or soften overview-mode helper copy further once current workspace moves above overview, so the top of Course Workspace reads less like two competing intros.
   - lineage: `2026-03-17-admin-course-workspace-focus-mode-and-scroll-reduction-10-10.md`
5. Let `Quick note` collapse/minimize while preserving unsaved draft state and any staged image, so the owner can scroll the underlying page, gather screenshots, and reopen the same draft without losing progress.
   - lineage: admin-notes quick capture workflow shipped in `2026-03-24` and `2026-03-25` follow-up slices
6. Autofill lesson `Next step` from the next canonical lesson title, and show the next module title when the next lesson is the first lesson in a new module.
   - lineage: course content edit workflow in `2026-02-22-admin-full-content-edit-workflow-10-10.md` and current workspace/editorial drafting flow

## Out Of Scope

- Broad course redesign without proven drafting need.
- Reopening paused admin-notes follow-ups unless they block current content work.
- Program builder/planner implementation.
- Pricing, commerce, or non-course product decisions unrelated to current drafting.

## Working Intake Protocol

1. When a new issue is found, log:
   - route/surface,
   - observed behavior,
   - intended behavior,
   - severity (`P0/P1/P2`),
   - likely source (`content`, `rendering`, `identity`, `unknown`),
   - next disposition.
2. If the issue is content-only and safe to correct later in admin, do not interrupt drafting unless it is misleading enough to block review.
3. If the issue is a blocker, open a narrow implementation slice and pause only the blocked part of content work.
4. If the issue is non-blocking, keep drafting and continue adding findings here.

## Active Findings Log

| Date       | Surface                                       | Severity | Finding                                                                                                                                                                                                                                | Likely Source                                                              | Disposition                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | --------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-26 | `/course` learner lesson view                 | `P1`     | Section badge shows `Focus 1773406121479-296` instead of a human-readable cue/badge.                                                                                                                                                   | `content` or `identity` leakage via `drillLabel`                           | Keep in this brief during live drafting; decide later whether to fix in content only, add a rendering guard, or both.                                                                                                                                                                                                                                                                          |
| 2026-03-26 | contextual `Add note` on course/page surfaces | `P1`     | Bottom-of-page `Add note` form does not expose a working screenshot/image path even though explicit image intake was previously shipped for admin notes.                                                                               | `route-surface gap` or `regression` in contextual panel compose parity     | Keep in this brief for now as a live-review finding with lineage back to `/docs/task-briefs/done/2026-03-25-admin-notes-image-intake-simplification-and-clipboard-paste-button-10-10.md`; if it needs code, split a narrow contextual-note image-intake follow-up slice.                                                                                                                       |
| 2026-03-26 | `/course` learner lesson view                 | `P1`     | `Done` / `Mark as done` action is too far from `Pass criteria`; after checking boxes, the user must scroll back up to complete the action.                                                                                             | `layout/interaction` ergonomics gap                                        | Owned by this brief for now; not currently claimed by another active brief. If prioritized, split a small course completion ergonomics slice.                                                                                                                                                                                                                                                  |
| 2026-03-26 | contextual admin-note feedback states         | `P2`     | Success messages such as `Quick note saved.` and `Note marked as done.` stay pinned instead of fading after a short acknowledgement window.                                                                                            | `feedback-state UX` policy gap                                             | Keep in this brief as non-blocking polish unless repeated real use proves it is distracting enough to promote.                                                                                                                                                                                                                                                                                 |
| 2026-03-26 | contextual notes panel with existing notes    | `P1`     | When a page already has notes, `Add note` should stay at the top but collapsed so reading existing notes does not require scrolling past the full compose form, while still allowing quick reopen.                                     | `panel IA / default state` ergonomics gap                                  | Keep in this brief for now; if current-wave priority rises, split a narrow contextual-notes panel ergonomics slice rather than mixing it into unrelated admin-note work.                                                                                                                                                                                                                       |
| 2026-03-26 | admin `Course workspace overview` mode        | `P1`     | Module cards show lesson preview titles, but overview mode lacks direct lesson actions (`open`, `edit`, `delete`) from the module context and also lacks module delete entry, forcing extra context hops for common editorial cleanup. | `workspace IA/action-density` gap on top of existing hierarchy foundations | Keep in this brief for now with lineage to `/docs/task-briefs/done/2026-03-17-admin-course-workspace-hierarchy-and-lesson-visibility-10-10.md` and `/docs/task-briefs/done/2026-03-05-admin-course-reorder-delete-safety-and-integrity-10-10.md`; if prioritized, split a narrow overview-actions slice that reuses existing safe delete flows instead of inventing new destructive shortcuts. |
| 2026-03-26 | admin `Course workspace` layout order         | `P1`     | `Current workspace scope` / `Module workspace` appears below `Course workspace overview`, but in real editing flow it should sit above overview so the active working context is immediately visible before the broad scan layer.      | `workspace IA / information order` gap                                     | Keep in this brief with lineage to `/docs/task-briefs/done/2026-03-17-admin-course-workspace-focus-mode-and-scroll-reduction-10-10.md`; if prioritized, likely belongs in the same future workspace-overview ergonomics slice as direct module/lesson actions.                                                                                                                                 |
| 2026-03-26 | admin `Quick note` launcher                   | `P1`     | Quick capture stays modal/open while drafting, which makes it hard to scroll the page, collect screenshots, and then come back to the same unsaved note with its staged image intact.                                                  | `workflow/state persistence` gap in quick-capture shell                    | Promote into current brief if we continue one more admin-notes workflow patch in this wave; recommended as `now` because it directly affects live review capture during content production.                                                                                                                                                                                                    |
| 2026-03-26 | admin `Quick note` minimized state            | `P1`     | The first collapse implementation leaves a floating mini-card over arbitrary page content. Minimize should dock to the right edge and reopen from a slim handle, not obscure the page or require a movable widget.                     | `overlay IA / minimized-state UX` regression                               | Owned by this brief now as a blocker regression discovered immediately in real use; fix in place by replacing the floating minimized card with an edge-docked reopen affordance that keeps draft state intact.                                                                                                                                                                                 |
| 2026-03-26 | `/course` pass-criteria local completion CTA  | `P1`     | The new local `Mark as done` control near `Pass criteria` is visually louder and sits too high compared with the existing learner completion chip, so it reads like a new foreign control instead of the same completion action.       | `visual hierarchy / component-language drift`                              | Keep in this brief and align the local CTA to the established lesson completion style while preserving the near-checklist placement.                                                                                                                                                                                                                                                           |
| 2026-03-26 | admin lesson edit form `Next step`            | `P2`     | Lesson authors must manually type `Next step`, even when the intended next lesson/module is already deterministic from canonical course order.                                                                                         | `authoring assist / derived content cue` gap                               | Keep in this brief but defer from the current patch wave unless repeated use proves it is worth the added content-automation contract now.                                                                                                                                                                                                                                                     |

## Acceptance Criteria

1. `/course` shows `Mark as done` or `Done` beside the `Pass criteria` heading so checklist completion does not require scroll-back to the top controls, and the local CTA matches the existing learner completion visual language closely enough that it does not read as a foreign or overly loud control.
2. Course Workspace renders the active/current workspace controls above the broad overview scan layer.
3. Overview-mode module cards expose direct lesson `Open lesson`, `Edit lesson`, and `Delete lesson` actions from module context without removing existing safe focus/edit flows.
4. Overview-mode module cards expose a module delete action that reuses the existing safe module-delete strategy flow.
5. Contextual `Add note` surfaces expose visible `Paste image from clipboard` and `Upload image` actions and successfully attach one image through the existing canonical note attachment lifecycle.
6. Contextual note panels with existing notes keep `Add note` at the top but collapse the compose body by default, with an obvious reopen action.
7. Contextual success notices auto-dismiss after a short acknowledgement window while error messages remain persistent until the user acts or retries.
8. `Quick note` can collapse/minimize during drafting and reopen the same unsaved draft, including one staged image, without forcing the owner to start over, and the minimized state docks to the right edge with a slim reopen handle instead of covering arbitrary page content.
9. Relevant current production admin notes for this scope remain explicitly triaged, and candidate extra tweaks from other briefs are listed explicitly before scope expansion.
10. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted unit tests for contextual note panel image-intake/notice behavior where added
- targeted e2e for:
  - `tests/e2e/admin-contextual-notes.spec.ts`
  - `tests/e2e/admin-foundation.spec.ts`
  - `tests/e2e/course-pass-criteria-visibility.spec.ts`
  - `tests/e2e/admin-help-center.spec.ts`
  - `tests/e2e/admin-notes-workflow.spec.ts`
  - `tests/e2e/drawer-focus-trap.spec.ts`
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Manual QA Environments

- Production learner review:
  - `https://freeswimming.org/course`
- Local admin/content editing when needed:
  - `http://127.0.0.1:3000/admin`
- Preview verification for any spawned fix slice:
  - PR Vercel preview URL

## Constraints

- Do not interrupt active content production for speculative cleanup.
- Prefer content correction over code changes when the issue is purely authored data.
- Prefer small, reversible implementation slices if code changes are needed.
- Preserve current visual language unless a live issue proves the existing treatment is misleading.

## 10/10 Quality Bar

- Learner-facing content should look intentional and human-authored, not like imported system data.
- Required states for this slice must still cover `loading`, `empty`, `error`, `retry`, and `success` where relevant.
- Course Workspace should privilege the active editing context over the overview scan layer.
- Contextual notes should feel fast and lightweight:
  - add quickly,
  - read existing notes without fighting the compose form,
  - get short-lived success confirmation without persistent visual noise.
- Minimized overlays should not become floating obstacles:
  - when collapsed, they should dock to a predictable edge,
  - preserve the active draft,
  - and leave the main review surface unobscured.
- No visible internal IDs, raw runtime tokens, or unexplained system labels should remain on public learner-facing surfaces once the relevant slice is closed.
- Any fix chosen from this brief must preserve business truth and content source-of-truth rules.

## Help/Guide Impact

- This implementation wave changed admin workflow guidance and recovery behavior:
  - `components/admin/AdminHelpCenter.tsx` updated to explain the new Course Workspace ordering/actions, contextual `Add note` top-collapse behavior, and `Quick note` collapse/resume workflow.
  - `docs/runbooks/admin-notes-recovery.md` updated to explain that contextual `Add note` may be collapsed before retrying image intake and that `Quick note` can be collapsed without losing a staged draft.
- Any further slice pulled from this brief must either extend the same docs in-PR or record explicit `N/A` rationale.

## Risks And Mitigations

- Risk: this becomes an unbounded catch-all brief.
  - Mitigation: keep it limited to the current live content-review wave and split blockers into narrow child slices.
- Risk: content-only issues get over-engineered in code.
  - Mitigation: classify likely source before implementation and prefer editorial fixes when sufficient.
- Risk: non-blocking polish distracts from content progress.
  - Mitigation: keep explicit `P0/P1/P2` prioritization and continue drafting unless a blocker is confirmed.

## Checkpoint Log

- `2026-03-26 | kickoff | opened active live-review brief for the current course content drafting wave so learner-surface/editorial findings can be logged continuously without outranking builder/content work by default; reviewed currently open production admin notes and confirmed none directly own this course-review scope | initial finding logged: learner lesson badge shows internal-looking label \`Focus 1773406121479-296\`, likely via content \`drillLabel\` leakage | next: continue live drafting, append findings here, and only split narrow implementation slices for proven blockers or current-wave P1s`
- `2026-03-26 | live findings appended | added four new findings from active content review: contextual Add-note image/screenshot gap, course pass-criteria completion ergonomics (`Done` should be available beside the checklist), sticky success-message behavior, and contextual notes panel default-collapse ergonomics when notes already exist; checked current brief inventory and found no active brief that explicitly owns these four items, while the Add-note image gap likely represents residual/regression lineage against the already-done image-intake brief | next: keep logging findings here during drafting; if any of the P1s becomes blocking, split a narrow implementation brief instead of broadening scope ad hoc`
- `2026-03-26 | workspace overview finding appended | logged new admin Course Workspace overview-mode friction from live editorial use: module cards need direct lesson-level `open`/`edit`/`delete`actions within module context plus a discoverable module delete action, so editors do not have to bounce into deeper scopes for common cleanup; classified as`P1` and tied it back to the already-shipped hierarchy and delete-safety briefs so any future slice can reuse existing safe destructive-action patterns | next: continue drafting and decide later whether overview-mode direct actions rise high enough to justify a dedicated implementation slice`
- `2026-03-26 | workspace order finding appended | logged additional Course Workspace IA friction from live editorial use: the active/current workspace block sits below the overview, but real working flow wants the current workspace first and the scan/overview second; classified as `P1` and linked it to the earlier focus-mode/scroll-reduction slice because this is primarily an information-order and workflow-emphasis problem, not a new data-model need | next: keep capturing workspace friction in this brief and consider grouping layout-order + direct-overview-actions into one future workspace ergonomics slice if they continue to repeat`
- `2026-03-26 | execution scope promoted | owner confirmed it is the right time to execute the current-wave learner/course-workspace/contextual-notes tweaks now instead of leaving them as review-only findings; this brief now owns the concrete implementation scope for pass-criteria local completion action, workspace order + overview actions, and contextual-note image/collapse/notice behavior, while still listing extra adjacent tweaks from older briefs explicitly before any further scope pull-in | next: implement the confirmed set, run targeted tests, then summarize optional candidate tweaks by number for a follow-up yes/no decision`
- `2026-03-26 | implementation + targeted validation | shipped the confirmed live-review slice across learner `/course`, admin Course Workspace, contextual notes, Help/Guide, and notes recovery docs: pass criteria now has a local done action, current workspace renders above overview, overview cards expose direct lesson open/edit/delete plus module delete, contextual Add note moved to the top with default collapse when notes exist, contextual create regained visible clipboard/upload image intake, and quick/contextual success notices now auto-dismiss; targeted `typecheck`, quick-capture unit coverage, and desktop Chromium Playwright for admin foundation/contextual notes/help center/course pass-criteria all passed | next: run full \`npm run verify:pre-pr\`, then summarize merge-ready scope plus optional numbered tweak candidates kept out of this pass`
- `2026-03-26 | verify follow-up + new intake | full \`npm run verify:pre-pr\` exposed one real red in desktop Chromium: the contextual lesson-notes test used a broad page-level text locator for \`Note marked as done.\`, which collided with identical text inside a long note body. Added an explicit contextual action-notice test id and scoped the e2e assertion to the panel notice itself; targeted rerun of \`tests/e2e/admin-contextual-notes.spec.ts --project=desktop-chromium\` now passes for the page-notes path and cleanly skips the lesson-notes path when the environment is not write-ready. Also logged two new live-review findings from active content production: quick-note minimize/preserve-draft request (recommended \`now\`) and lesson \`Next step\` autofill from canonical next lesson/module (recommended \`later\`). | next: decide whether to extend this brief with the quick-note minimize flow before the next full verify rerun, while keeping derived \`Next step\` autofill as a deferred authoring-assist candidate for now`
- `2026-03-26 | quick-note minimize patch | extended the current brief with a resumable quick-note flow: dirty quick-capture drafts can now collapse instead of discarding, reopen from a fixed right-edge resume card, and keep staged image evidence intact while the owner scrolls the page. Updated Help/Guide + recovery docs and added unit/e2e coverage for collapse/resume, while also aligning contextual/help-center tests with the new action labels. Targeted validation passes: \`npm run typecheck\`, \`npx vitest run tests/unit/admin-note-quick-capture-launcher.test.tsx\`, and \`npx playwright test tests/e2e/admin-notes-workflow.spec.ts tests/e2e/admin-help-center.spec.ts tests/e2e/admin-contextual-notes.spec.ts --project=desktop-chromium\`. | next: rerun full \`npm run verify:pre-pr\` once we stop adding more review-driven tweaks, then decide whether to keep \`Next step\` autofill deferred or pull it into a separate follow-up slice`
- `2026-03-26 | verify rerun prep + WebKit hardening | full \`npm run verify:pre-pr\` then fell only on the known desktop-WebKit \`drawer-focus-trap\` flake, this time before the menu trigger held focus. Hardened the test instead of changing runtime behavior by waiting for the header menu toggle to finish React hydration, bringing the page to the front before focus assertions, and polling on the active element test id rather than relying on a single immediate focus read. Targeted stress rerun \`npx playwright test tests/e2e/drawer-focus-trap.spec.ts --project=desktop-webkit --repeat-each=5\` passed 5/5. | next: rerun full \`npm run verify:pre-pr\`; if green, move straight to commit/push/PR for this live-review slice`
- `2026-03-26 | verify rerun follow-up + mobile nav hardening | the next full \`npm run verify:pre-pr\` held on the WebKit focus fix but exposed a mobile iPhone failure in \`course-nav-contextual\`: the test tried to cold-load the "last lesson" via a second \`page.goto(...lesson=...)\`, which raced with the course page's own default-lesson normalization and got interrupted back to the first lesson. Reworked the test to fetch canonical lesson ids from \`/api/course/content\` and then walk to the last lesson through the actual in-app \`Next\` action instead of relying on a second cold load. Targeted reruns passed for \`mobile-iphone-13-pro-max\`, and the combined mobile/tablet matrix now shows \`2 passed / 1 skipped\` for \`tests/e2e/course-nav-contextual.spec.ts\`. | next: rerun full \`npm run verify:pre-pr\` again; if green, proceed directly to commit/push/PR`
- `2026-03-26 | full gate green | the final full \`npm run verify:pre-pr\` passed after the WebKit focus hardening and mobile course-nav contract fix. This wave is now validation-clean with targeted unit/e2e reruns plus full public verify passing on the implementation branch. | next: commit, push, open PR, then run \`npm run verify:pre-merge\` before merge recommendation`
- `2026-03-26 | post-merge live UX regression intake | immediate real-use feedback after merge showed two design misses that should not stay shipped: the minimized quick-note state became a floating box that still covers arbitrary page content, and the local \`Pass criteria\` completion CTA is too loud/high relative to the existing learner completion chip. Reopened this brief as the active owner for a tight regression pass instead of closing lifecycle docs, and clarified the 10/10 bar so minimized overlays must dock to an edge without obscuring the review surface. | next: replace the floating minimize card with a right-edge docked reopen handle, tone down/reposition the local completion CTA, rerun targeted tests, then run full verify before opening the follow-up PR`
- `2026-03-26 | docked minimize + CTA calm-down patch | replaced the floating quick-note minimized card with a docked right-edge reopen handle so collapse no longer covers arbitrary page content, aligned the local \`Pass criteria\` completion CTA to the existing learner completion chip language/height, updated Help/Guide + recovery copy to match the docked-handle pattern, and validated with \`npm run typecheck\`, \`npx vitest run tests/unit/admin-note-quick-capture-launcher.test.tsx\`, and targeted desktop-Chromium Playwright for \`admin-help-center\`, \`admin-notes-workflow\`, and \`course-pass-criteria-visibility\`. | next: run full \`npm run verify:pre-pr\`, then push/open the regression follow-up PR once the gate is green`
- `2026-03-26 | course canonical-route guard | while rerunning full verification, desktop Chromium exposed a real \`/course\` race: contextual lesson-note creation could start while the page kept issuing repeated same-target canonical lesson \`router.replace\` calls from an alias/slug transition. Added a one-shot canonical replace guard in \`app/course/page.tsx\` so each target lesson URL is normalized only once per unresolved alias, then confirmed the fix with isolated reruns of \`tests/e2e/admin-contextual-notes.spec.ts --project=desktop-chromium\` and \`tests/e2e/course-nav-contextual.spec.ts --project=mobile-chromium --project=mobile-iphone-13-pro-max\`. | next: finish the full public verify gate and only then cut the regression follow-up PR`
- `2026-03-26 | full public verify green after regression follow-up | the regression pass is now validation-clean: full \`npm run verify:pre-pr\` passed after the docked quick-note handle, calmer local pass-criteria CTA, Help/Guide copy updates, quick-capture unit refresh, and the `/course` canonical-route guard. This follow-up slice is ready for commit/push/PR handoff rather than more in-place UX guessing. | next: commit, push, open the follow-up PR, then run \`npm run verify:pre-merge\` before merge recommendation`
- `2026-03-26 | CI timeout follow-up on PR #303 | after push, every PR check except required \`verify\` went green. The first failing job did not hit a product/assertion error; it exhausted the 45-minute GitHub budget while running \`npx playwright install --with-deps chromium webkit firefox\` on Ubuntu before the actual verify suite started. I initially tried a lighter browser-only install, but the rerun then failed deterministically with \`browserType.launch\` because the hosted runner was missing shared libraries such as \`libgtk-4.so.1\`, \`libgraphene-1.0.so.0\`, and multiple GStreamer/Flite packages. Corrected \`.github/workflows/ci.yml\` by restoring \`--with-deps\` for the verify job and raising the verify timeout budget so GitHub has enough room for both dependency provisioning and the real verify/build gates. | next: push the corrected workflow, rerun PR #303, and only merge once required \`verify\` is green on the fixed install path`
- `2026-03-26 | local gate revalidated after CI correction | reran full \`npm run verify:pre-pr\` after restoring the GitHub verify job to \`npx playwright install --with-deps chromium webkit firefox\` plus a larger timeout budget. Local product validation remains green on the same tree, confirming the CI correction did not introduce any new runtime/test regressions while we wait on GitHub's dependency provisioning path. | next: commit and push the workflow fix to PR #303, then watch the new required \`verify\` run through to completion before merge recommendation`
- `2026-03-26 | pre-merge flake hardening for mobile course nav | local \`npm run verify:pre-merge\` surfaced a real flaky assertion in \`tests/e2e/course-nav-contextual.spec.ts\` on \`mobile-chromium\`: the test assumed the full API lesson list matched the mobile surface's final reachable lesson and blindly expected \`Next\` for a fixed number of steps. Hardened the test to assert the actual user-facing contract instead: start on the first lesson with \`Menu\`, advance through reachable \`Next\` actions until the right control becomes \`Programs\`, and require at least one successful lesson transition before the final \`Prev + Programs\` state. Stress rerun \`npx playwright test tests/e2e/course-nav-contextual.spec.ts --project=mobile-chromium --repeat-each=5\` now passes 5/5. | next: run a quick mobile-project sanity on \`course-nav-contextual\`, then rerun full \`npm run verify:pre-merge\` before merge`
- `2026-03-26 | pre-merge follow-up for contextual notes stability | the next local \`npm run verify:pre-merge\` exposed a separate desktop-Chromium instability in \`tests/e2e/admin-contextual-notes.spec.ts\`: the lesson-notes path still entered through the legacy lesson id \`mod3-l1\`, which allowed canonical route normalization to land mid-form interaction, and the done-toggle helper held on to a stale note-item locator across rerenders. Hardened the spec by entering the course page with the canonical lesson id, probing the lesson context with the same canonical ref, and reacquiring the contextual note row by note text after toggle mutations before asserting checked state. Targeted rerun \`npx playwright test tests/e2e/admin-contextual-notes.spec.ts --project=desktop-chromium\` now returns \`1 passed / 1 skipped\` instead of failing, which restores the environment-aware contract for write-ready vs skip-only paths. | next: rerun full \`npm run verify:pre-merge\` one final time and merge PR \#303 if the gate stays green`
- `2026-03-27 | contextual add-note remount hardening + spec resilience | the local gate kept finding one more real instability in the course lesson contextual-note compose path: the inline \`Add note\` form could disappear mid-entry under a same-context remount/reload window, which made the desktop-Chromium lesson-notes CRUD spec fail at \`Title/Category/Priority\` field discovery. Hardened the product surface in \`components/admin/AdminContextNotesPanel.tsx\` so same-context reloads preserve compose state and cached draft visibility instead of resetting the operator shell, then tightened \`tests/e2e/admin-contextual-notes.spec.ts\` to reopen the contextual compose form deterministically when the panel has just settled, while still exercising the real lesson/page CRUD path. Stress rerun \`npx playwright test tests/e2e/admin-contextual-notes.spec.ts --project=desktop-chromium --grep "allowlisted admin can manage contextual lesson notes from course page" --repeat-each=5 --max-failures=1\` passed \`5/5\`, and the full desktop-Chromium contextual-notes file now passes again. | next: rerun full \`npm run verify:pre-merge\` on the updated tree, then commit/push the follow-up if the full local gate stays green`
- `2026-03-27 | full public verify re-cleared after contextual notes hardening | after the contextual add-note remount hardening and the updated lesson-notes test contract, full \`npm run verify:pre-pr\` passed again on the branch: lint, admin-audit, env/parity, eslint, typecheck, unit, build, perf budgets, and the full public Playwright matrix all returned green (\`89 passed / 271 skipped\`). This restores a clean PR-update gate on top of the latest local changes rather than relying on the earlier green run from before the contextual-notes fix. | next: run \`npm run verify:pre-merge\`, then commit/push/update PR \#303 only if the merge gate is also green`
- `2026-03-27 | full merge gate re-cleared after contextual notes hardening | reran full \`npm run verify:pre-merge\` on the updated tree after the contextual compose-state preservation patch and the hardened desktop/mobile Playwright specs. The full merge gate completed green, including lint/admin-audit/env parity/eslint/typecheck/unit/build/perf budgets and the public Playwright matrix, so the latest local tree is now ready for commit/push back onto PR \#303 instead of relying on an earlier remote green run from before the remount fix. | next: commit the four-file follow-up, push the branch, and wait for refreshed GitHub checks before merge`
- `2026-03-27 | done | committed the contextual compose-state + Playwright hardening follow-up as \`0954645\`, reran full \`npm run verify:pre-merge\` green on that exact tree, waited for refreshed GitHub checks to clear, and squash-merged [#303](https://github.com/stianvikra/freeswimming/pull/303) as \`37f90ef\`. This closes the docked quick-note minimize, calmer lesson-done CTA, canonical route stabilization, and contextual add-note remount resilience wave under one finished live-review slice. | next: none`
