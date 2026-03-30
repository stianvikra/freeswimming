# Task Brief: Mac Safari Install Guidance

## Metadata

- `id`: `2026-02-14-mac-safari-install-guidance`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-02-14`
- `updated`: `2026-02-17`

## Goal

Desktop users should get clear, platform-aware install guidance and post-install clarity, instead of generic fallback messaging.

## Scope

- Detect Mac Safari as a separate fallback case in install flow.
- Define platform detection contract explicitly:
  - `isMacSafari` when user agent indicates Safari on macOS and browser is not Chrome/Edge/Firefox variants.
  - `isIOSSafari` remains existing iOS/iPadOS Safari handling.
  - `canNativePrompt` remains based on captured `beforeinstallprompt`.
- Show concise, platform-specific instructions for Safari on macOS:
  - open `File`,
  - choose `Add to Dock`,
  - confirm add/install.
- Keep existing native install flow unchanged for browsers with `beforeinstallprompt`.
- Keep existing iOS Safari fallback unchanged.
- Improve unsupported-browser fallback copy so users know which browsers support install best.
- Add a short post-install success confirmation message (for accepted install flow), with platform-appropriate next step hint (for example open from Dock/Start).
- Apply guidance in both entry points:
  - contextual prompt,
  - persistent menu install action.
- Keep visual style aligned with current FreeSwimming design system.
- Add/adjust tests for:
  - Mac Safari fallback visibility/flow,
  - no regression for iOS fallback,
  - no regression for native install-capable browsers.
- Update related docs/checklists if fallback behavior changes.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                              | Evidence                            |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Product goals and IA                          | `target`     | Platform-specific install fallback presents one clear path for Mac Safari without disrupting existing routes. | scope + acceptance criteria         |
| UX flow clarity                               | `target`     | Mac Safari, iOS Safari, native-prompt browsers, and unsupported browsers each show unambiguous next actions.  | state rules + manual QA matrix      |
| Visual design quality                         | `target`     | Safari guidance and success states stay visually consistent with the existing install surfaces.               | scope + completion record           |
| Business logic correctness and data integrity | `target`     | Platform detection and fallback branching remain deterministic across both install entry points.              | acceptance criteria + updated tests |
| Admin editor ergonomics                       | `N/A`        | N/A                                                                                                           | N/A                                 |
| Accessibility (a11y)                          | `target`     | Guidance, dismiss, and success states preserve focus order, labels, contrast, and keyboard access.            | acceptance criteria + manual QA     |
| Performance (CWV + payloads)                  | `supporting` | Added platform guidance does not introduce measurable runtime overhead or layout instability.                 | constraints + validation            |
| Data placement and sync boundaries            | `target`     | Entry-point behavior and installed-state feedback remain local UI concerns only.                              | state rules                         |
| Caching and invalidation strategy             | `supporting` | Existing install-state and cooldown semantics remain unchanged by the Mac Safari fallback.                    | state rules + QA matrix             |
| Reliability and failure handling              | `target`     | Safari users no longer hit a generic dead end when manual install is possible.                                | acceptance criteria + rollout notes |
| Security and authz                            | `supporting` | No auth, entitlement, or admin boundary changes are introduced in this guidance-only slice.                   | out-of-scope + constraints          |
| Privacy and compliance                        | `supporting` | No new personal data collection or sensitive payload persistence is introduced.                               | scope review                        |
| Content governance                            | `supporting` | Final install strings remain consistent across both entry points and supported platforms.                     | UX copy contract                    |
| Admin workflow and editability                | `N/A`        | N/A                                                                                                           | N/A                                 |
| SEO and crawlability                          | `supporting` | Browser-specific install copy does not affect public crawl/index behavior.                                    | scope review                        |
| AI discoverability                            | `N/A`        | N/A                                                                                                           | N/A                                 |
| Analytics and KPI observability               | `supporting` | Install result buckets remain measurable when analytics hooks exist.                                          | event tracking section              |
| Commerce and revenue ops                      | `N/A`        | N/A                                                                                                           | N/A                                 |
| Incident response and support operations      | `supporting` | Rollback path preserves existing generic fallback if a platform-specific regression appears.                  | rollout and rollback                |
| Finance and reporting operations              | `N/A`        | N/A because this guidance update does not change billing, payouts, or finance reconciliation.                 | explicit scope rationale            |
| i18n operational readiness                    | `supporting` | Platform-aware copy stays concise and structurally ready for later localization.                              | UX copy contract                    |
| Stack-fit and dependency discipline           | `target`     | Fix stays within current install-flow components and maintainable platform detection rules.                   | scope + delivered changes           |
| Testing and QA automation                     | `target`     | Regression coverage protects Mac Safari fallback and existing iOS/native install flows.                       | completion record + test evidence   |
| Scalability and cost efficiency               | `supporting` | Guidance changes avoid any meaningful new server or runtime cost.                                             | architecture review                 |
| DevOps and rollback readiness                 | `supporting` | Existing feature controls keep the fallback behavior reversible.                                              | rollout and rollback                |

## UX Copy Contract (final strings)

Use these exact messages unless implementation constraints require small wording adjustments:

- Mac Safari fallback title:
  - `Install on Mac (Safari)`
- Mac Safari fallback body (steps):
  - `Open File in Safari`
  - `Choose Add to Dock`
  - `Click Add`
- Unsupported-browser message:
  - `Install is not available in this browser yet. For best support, use Safari, Chrome, or Edge.`
- Post-install success confirmation:
  - `App installed. You can open FreeSwimming from your Dock, Start menu, or home screen.`

## Out Of Scope

- No major redesign of install prompt UI.
- No analytics vendor changes.
- No service worker/manifest architecture changes.
- No browser-specific hacks outside maintainable detection/flow rules.
- No OS-level placement controls (desktop/start menu/dock placement remains browser/OS-managed).
- No deep user-agent fingerprinting beyond minimal install-flow detection.

## Acceptance Criteria

- Mac Safari does not show generic "Install is not available..." when manual install is possible via Safari UI.
- Users see short, actionable Mac Safari instructions within the existing install surfaces.
- iOS Safari behavior remains correct and unchanged.
- Chrome/Edge native install behavior remains correct and unchanged.
- Unsupported browsers get clear, short guidance (instead of dead-end generic message).
- After successful install acceptance, user sees a short confirmation with where to find/open the app next.
- Copy is short, plain-language, and understandable in under 2 seconds.
- No layout instability or degraded page performance.
- A11y semantics remain intact (focus, labels, contrast, keyboard behavior).
- Relevant unit/e2e tests pass.
- Action outcomes are deterministic across entry points (contextual prompt + menu action) and documented.

## State Rules

When user taps install from prompt/menu:

- Native install available and user accepts:
  - show success confirmation message once,
  - close contextual prompt if open,
  - keep menu action available but indicate installed state when applicable.
- Native install available and user dismisses:
  - respect existing dismiss behavior/cooldown rules,
  - avoid immediate re-prompting.
- Mac Safari fallback path:
  - show Safari-specific install steps (not generic unsupported).
- Unsupported browser:
  - show unsupported-browser guidance message (with recommended browsers).

When user taps `Not now` or close:

- Contextual prompt:
  - preserve existing cooldown semantics.
- Menu action:
  - dismiss current guidance without blocking future manual access.

## Validation

Which commands should pass?

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

## Constraints

- Keep UX non-intrusive and aligned with existing app style.
- Prefer deterministic, maintainable platform checks.
- Do not introduce measurable runtime overhead.
- Keep copy platform-aware but minimal.

## PR Browser Rule

- Open PR create/review/merge links in Safari by default:
  - `open -a Safari "<PR_URL>"`
- Use another browser only if the owner explicitly asks for it.

## Manual QA Matrix

Run and record pass/fail:

- macOS Safari:
  - menu install opens Mac Safari guide,
  - contextual prompt install opens Mac Safari guide,
  - no generic unsupported message for Safari.
- macOS Chrome:
  - native install prompt path still works.
- Windows Edge/Chrome:
  - native install prompt path still works.
- iOS Safari:
  - existing iOS instructions remain unchanged.
- Android Chrome:
  - native install prompt path remains unchanged.

Also verify:

- `Not now` + cooldown behavior unchanged.
- Installed state suppresses inappropriate prompts.
- No visual regressions in prompt/menu surfaces.

## Event Tracking (if analytics hooks exist)

Track these events (no new vendor required):

- `install_prompt_viewed`
  - props: `entry_point` (`contextual`|`menu`), `platform_bucket`
- `install_prompt_action_clicked`
  - props: `action` (`install`|`not_now`|`close`), `entry_point`, `platform_bucket`
- `install_result`
  - props: `result` (`accepted`|`dismissed`|`ios_instructions`|`mac_safari_instructions`|`unsupported`), `entry_point`
- `install_success_message_shown`
  - props: `entry_point`, `platform_bucket`

If no analytics hooks exist in current stack, skip implementation and document as deferred.

## Rollout and Rollback

- Rollout:
  - ship behind existing install prompt feature controls where applicable.
- Rollback:
  - preserve ability to disable contextual install prompt quickly via existing feature flag path,
  - keep manual menu entry functional when contextual flow is disabled,
  - fallback to previous generic message behavior if severe regression is detected.

## Completion Record

- `PR`: `https://github.com/stianvikra/freeswimming/pull/10` (feature) and follow-up `https://github.com/stianvikra/freeswimming/pull/11` (workflow/docs hardening)
- `merge`: `feat/mac-safari-install-guidance` -> `main`
- `result`: Mac Safari-specific install guidance shipped across install entry points with updated install copy, deterministic platform handling, and expanded test coverage.

### Delivered Changes

- Shipped Mac Safari-specific install guidance across contextual and menu flows:
  - `components/install/install-context.tsx`
  - `components/MenuDrawer.tsx`
  - `app/course/page.tsx`
- Preserved iOS Safari and native install-capable browser flows while improving unsupported-browser guidance copy.
- Added/updated tests for install behavior and regression protection:
  - `tests/unit/install-context.test.ts`
  - `tests/e2e/install-entry-desktop-tablet.spec.ts`
  - `tests/e2e/install-prompt.spec.ts`
  - `tests/e2e/course-nav-contextual.spec.ts`
  - `tests/e2e/drawer-focus-trap.spec.ts`
  - `tests/e2e/mobile-nav.spec.ts`
  - `tests/e2e/mobile-nav-state.spec.ts`
  - `tests/e2e/mobile-screenshots.spec.ts`
  - `tests/e2e/a11y-home.spec.ts`
  - `tests/e2e/project-guards.ts`
- Updated QA/testing and task-brief process docs to align with release expectations:
  - `docs/checklists/release-pr-checklist.md`
  - `docs/task-brief-template.md`
  - `docs/task-briefs/README.md`
  - `docs/testing-strategy.md`
  - `.github/pull_request_template.md`

### Test Evidence

- Automated test coverage was expanded in the merged implementation PR (`#10`) across unit and e2e install flows.
- CI/workflow follow-up hardening merged in PR (`#11`) to reinforce handoff and local-sync process.
- This completion record does not include command-by-command historical logs; verification should be referenced from the merged PR checks.

### DevOps / Workflow Changes

- CI and workflow updates included:
  - `.github/workflows/ci.yml`
  - `.github/pull_request_template.md`
- Added post-merge local sync runbook:
  - `docs/runbooks/post-merge-local-sync.md`
- Updated task-brief lifecycle/process documentation used for future PR handoffs.

### Secrets Used (Names Only)

- No new secrets were introduced by this task brief scope.
- Existing repository/CI secrets (if any) remain managed outside the repository.

## Session Continuity Notes

- Canonical historical source of truth:
  - merged PRs:
    - `https://github.com/stianvikra/freeswimming/pull/10`
    - `https://github.com/stianvikra/freeswimming/pull/11`
  - commit history on `main`,
  - this done brief completion record.
- If context reconstruction is needed:
  1. `git log --oneline --decorate -- app/course/page.tsx components/MenuDrawer.tsx components/install/install-context.tsx`,
  2. review PR #10 and #11 checks/discussion,
  3. use this brief `Delivered Changes` and `Test Evidence` sections as scope baseline.

### Post-Merge Notes

- Brief lifecycle status was updated from `in-progress` to `done` after merge.
