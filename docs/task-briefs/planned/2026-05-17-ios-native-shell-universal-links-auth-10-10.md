# Task Brief: iOS Native Shell And Universal Links Auth (10/10)

## Metadata

- `id`: `2026-05-17-ios-native-shell-universal-links-auth-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-17`
- `updated`: `2026-05-17`
- `related_active_brief`: `docs/task-briefs/in-progress/2026-05-17-auth-sign-in-link-first-otp-fallback-clarity-10-10.md`
- `suggested_branch`: `platform/ios-native-shell-universal-links-auth-2026-05-17`

## Brief Audit Record

- `last_audited`: `2026-05-17`
- `base`: `main@eae8817` plus observed iPhone Home Screen auth issue on `2026-05-17`
- `audit_status`: `blocked`
- `decision`: Keep this as the follow-up owner-visible workstream for eliminating the iPhone Home Screen one-time-code friction with native Universal Links.
- `reason`: A Safari Add to Home Screen PWA cannot reliably force Mail/Gmail/Outlook auth links to open inside the installed Home Screen web app. Apple Universal Links require a native app entitlement plus an `apple-app-site-association` file.
- `must_refresh_before_execution_if`: Refresh if Apple changes Universal Links/PWA capabilities, the auth provider changes, App Store distribution strategy changes, checkout/IAP policy changes, or the active auth-link fallback PR ships with materially different callback/session behavior.

## Goal

Ship a minimal native iOS app shell for FreeSwimming.org so installed iPhone users can tap sign-in links from email and land in the app context through Universal Links, without relying on manual one-time-code fallback for normal sign-in.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                                                                           | Evidence                                                         | Expected |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------- |
| Product goals and IA                          | `target`     | Installed iPhone users can move from email sign-in link to authenticated app context with one primary path and documented fallback.                                        | real-device QA + screenshot/video handoff                        | `5/5`    |
| UX flow clarity                               | `target`     | Mail/Gmail/Outlook link, Safari fallback, app-open fallback, and expired-link recovery each have one clear next action.                                                    | real-device scenarios + support runbook                          | `5/5`    |
| Visual design quality                         | `target`     | Native shell launch, loading, offline/error, and web content handoff feel branded and not like a broken webview wrapper.                                                   | iPhone screenshots/video + App Store preview assets if submitted | `5/5`    |
| Business logic correctness and data integrity | `target`     | Auth callback state, `next` path, cookies/session, and token handling remain deterministic with no duplicate or false sign-in state.                                       | unit/integration tests + real-device auth smoke                  | `5/5`    |
| Admin editor ergonomics                       | `N/A`        | N/A because this app-shell slice changes no admin editor creation/publish workflow.                                                                                        | explicit scope rationale                                         | `N/A`    |
| Accessibility (a11y)                          | `target`     | Native shell and web handoff support Dynamic Type expectations where native UI exists, VoiceOver labels, focus, and no trapped blank loading state.                        | iOS accessibility QA + web a11y checks                           | `5/5`    |
| Performance (CWV + payloads)                  | `target`     | App launch to useful auth/web content is fast on supported iPhones; web payload budgets do not regress for `/auth/sign-in` and `/my-library`.                              | launch timing + existing perf budgets                            | `5/5`    |
| Data placement and sync boundaries            | `target`     | Supabase/web remains server-canonical; native app does not persist raw auth tokens, one-time codes, or private profile data outside approved WebKit/session storage.       | data contract review + code review                               | `5/5`    |
| Caching and invalidation strategy             | `target`     | AASA file is served cache-correctly; web auth/session routes remain no-store; native shell has deterministic reload/retry behavior.                                        | HTTP header checks + route tests                                 | `5/5`    |
| Reliability and failure handling              | `target`     | Universal Link failure, missing app, expired link, offline launch, provider error, and App Store/TestFlight build mismatch all have recoverable paths.                     | failure-mode matrix + real-device QA                             | `5/5`    |
| Security and authz                            | `target`     | Associated Domains, Universal Link URL handling, callback params, and native bridge surface fail closed and validate exact host/path.                                      | negative-path tests + Apple associated-domain diagnostics        | `5/5`    |
| Privacy and compliance                        | `target`     | Native app privacy labels, logs, analytics, and diagnostics do not expose email links, auth tokens, one-time codes, cookies, or private training data.                     | privacy review + log redaction checks                            | `5/5`    |
| Content governance                            | `supporting` | Supporting only: app metadata, screenshots, and support docs must have owner-approved source of truth.                                                                     | App Store asset checklist                                        | `4/5`    |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, label, mutation, or publish surface changes.                                                                                                | explicit scope rationale                                         | `N/A`    |
| SEO and crawlability                          | `supporting` | Supporting only: public web SEO must not regress; AASA route must not alter sitemap/robots posture.                                                                        | sitemap/robots checks                                            | `4/5`    |
| AI discoverability                            | `N/A`        | N/A because native Universal Links do not change public AI-discoverable content or structured data.                                                                        | explicit scope rationale                                         | `N/A`    |
| Analytics and KPI observability               | `target`     | App launch, Universal Link success/failure, auth callback success/failure, and fallback-code usage are measurable with safe payloads.                                      | analytics event review + redacted logs                           | `5/5`    |
| Commerce and revenue ops                      | `target`     | App Store distribution plan explicitly handles Stripe checkout/IAP policy before exposing paid digital content inside the iOS app shell.                                   | App Review policy decision + QA path                             | `5/5`    |
| Incident response and support operations      | `target`     | Support runbook covers Universal Link diagnostics, AASA cache issues, TestFlight/App Store build mismatch, and Safari fallback.                                            | runbook update + incident checklist                              | `5/5`    |
| Finance and reporting operations              | `target`     | If checkout or entitlement access is reachable in app, revenue/reporting impact and App Store policy decision are documented before release.                               | finance/commerce decision record                                 | `5/5`    |
| i18n operational readiness                    | `supporting` | Supporting only: native shell strings and App Store metadata remain grouped and future-locale-ready; no locale blocker introduced.                                         | string inventory                                                 | `4/5`    |
| Stack-fit and dependency discipline           | `target`     | Use Apple-native Universal Links/Associated Domains, minimal native shell code, existing Next/Supabase auth, and no unnecessary cross-platform framework unless justified. | architecture review + dependency diff                            | `5/5`    |
| Testing and QA automation                     | `target`     | Web tests, route tests, AASA validation, Xcode build, TestFlight/install smoke, and real iPhone Mail-link auth pass before release.                                        | local/CI/TestFlight evidence                                     | `5/5`    |
| Scalability and cost efficiency               | `supporting` | Supporting only: native shell should add minimal operational cost; monitoring should catch auth-link failures without excessive provider calls.                            | cost/ops review                                                  | `4/5`    |
| DevOps and rollback readiness                 | `target`     | Web deploy, AASA deploy, native release, TestFlight rollback, and App Store phased rollout/withdrawal paths are documented.                                                | release/rollback checklist                                       | `5/5`    |

Critical target categories for `10/10` claim: `Product goals and IA`, `UX flow clarity`, `Business logic correctness and data integrity`, `Reliability and failure handling`, `Security and authz`, `Privacy and compliance`, `Commerce and revenue ops`, `Incident response and support operations`, `Stack-fit and dependency discipline`, `Testing and QA automation`, `DevOps and rollback readiness`.

## Stack / Architecture Best-Practice Gate

- Apple/iOS: use official Apple Universal Links and Associated Domains patterns. Required surfaces are iOS bundle identifier, Apple Team ID, Associated Domains entitlement, `applinks:freeswimming.org`, native URL handling, and an `apple-app-site-association` file served from the web domain.
- React/Next.js: keep the existing web app and Supabase auth as the product surface. Add only the web routes/files required for AASA and Universal Link support. Preserve `/auth/callback` safe redirect and cookie semantics.
- TypeScript/domain contracts: represent AASA content and allowed Universal Link paths as deterministic typed config if generated from the repo. Validate exact host/protocol/path for any URL handoff.
- Supabase/auth: do not replace Supabase Auth. Keep auth truth server/provider-canonical. Ensure Supabase allowed redirect URLs include the production callback URL used by Universal Links.
- Native shell: keep native code minimal, auditable, and app-bound to FreeSwimming domains. Do not introduce a native bridge that can mutate private data unless a separate security brief approves it.
- External services/tools: use official Apple Developer/Xcode/App Store Connect workflows. Document secret/certificate/profile handling; never commit signing credentials or Apple account tokens.
- UI system: native launch/loading/error states should reuse brand assets from `public/logos/brand/` where practical and be screenshot-reviewed against the web auth surface.
- Testing: require route/unit checks for AASA/auth, real-device Universal Link tests, TestFlight or App Store install smoke, and screenshot/video handoff before release.

## Data Placement And Sync Contract

- Server-canonical data: Supabase Auth session, app authorization, entitlements, profile/training data, and support diagnostics remain server/provider-owned.
- Native/local data: native app may keep only platform-required app preferences and WebKit/session storage. It must not persist raw email magic links, one-time codes, auth callback params, Supabase access/refresh tokens, private training payloads, or Stripe data in custom native storage.
- Sync policy: web app remains the sync engine. Universal Links only route the user into the auth callback/app context; they do not create separate native account state.
- Retention and sensitivity: native logs and analytics must redact URLs or strip sensitive query parameters from auth callbacks before recording diagnostics.
- Cache/invalidation: AASA file must be served with Apple-compatible content type and cache behavior; auth callback/session routes remain request-specific and no-store.

## Identity And Rename Contract

- Canonical app identifier: choose and document a stable Apple Bundle ID, Apple Team ID, and App Store Connect app record before implementation. Treat Bundle ID as immutable after release.
- Associated domain identity: `freeswimming.org` is the canonical Universal Link domain; any `www` or preview domains require explicit AASA and entitlement decisions.
- Human-readable identifiers: App Store name, subtitle, and display name are owner-editable but must not change the Bundle ID or associated-domain contract.
- Rename vs repurpose: if the app changes materially beyond the FreeSwimming web shell, create a new brief and App Store metadata review instead of silently repurposing this app record.
- Compatibility: if Universal Link paths change, preserve existing accepted paths until the installed app population has upgraded or has a documented fallback.
- Observability and repair: unresolved Universal Link opens should be diagnosable through safe analytics/support events without logging raw auth links.

## Scope

- Decide distribution model: App Store public, unlisted App Store app, or TestFlight-first beta.
- Decide App Store commerce policy for current Stripe checkout and paid digital content surfaces before release.
- Create minimal iOS native shell or wrapper that opens FreeSwimming web content and handles Universal Links.
- Add Associated Domains entitlement and AASA file for production domain.
- Define and test Universal Link path coverage, starting with `/auth/callback*` and any required post-auth destinations.
- Update Supabase redirect URL/provider settings documentation for production callback and native-app auth path.
- Update support runbooks and app knowledge docs for iPhone app sign-in diagnostics.
- Add app-launch/auth-link analytics with safe payloads if the current analytics layer can support it.
- Capture real iPhone screenshots/video evidence before release.

## Out Of Scope

- Replacing Supabase Auth.
- Shipping passkeys, Face ID auth, or native credential storage.
- Building an Android app or desktop app.
- Full offline training sync.
- Native implementation of My Library, workouts, habits, or admin workflows.
- Committing Apple signing keys, certificates, profiles, App Store credentials, or raw `.env` values.

## Acceptance Criteria

1. Tapping a valid production sign-in email link on an iPhone with the native app installed opens the app context, completes callback/session handling, and lands on the safe `next` path.
2. If the native app is not installed, the link opens in Safari with the existing web fallback.
3. If the Universal Link fails, expires, or opens in Safari, the user still has the one-time-code fallback and a clear recovery path.
4. AASA file validates for `freeswimming.org`, uses exact intended path coverage, and is served with correct content type/cache behavior.
5. Native URL handling validates exact host/path, strips or avoids logging sensitive auth query params, and rejects unsupported links safely.
6. App Store/TestFlight build strategy, commerce/IAP decision, privacy labels, and rollback path are documented before release.
7. Support docs explain how to diagnose app-link failures without asking users for raw sign-in links, one-time codes, cookies, or auth errors.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`
- `curl -I https://freeswimming.org/.well-known/apple-app-site-association`
- Validate AASA JSON body against Apple Universal Links expectations.
- Xcode archive/build succeeds with no signing secrets committed.
- Real iPhone TestFlight/App Store install smoke:
  - tap sign-in email link from Apple Mail,
  - tap sign-in email link from Gmail or Outlook if supported by the owner's actual workflow,
  - verify app-open callback lands in `My Library`,
  - verify expired/invalid link returns recoverable fallback,
  - verify no raw auth URL appears in logs or analytics.
- Screenshot/video handoff before release recommendation.

## Local Tooling Prerequisite

- Node.js LTS and npm for repo validation.
- Xcode current stable release for iOS build/archive.
- Apple Developer Program access with permission to manage identifiers, Associated Domains, certificates/profiles, TestFlight, and App Store Connect metadata.
- Physical iPhone for Universal Links verification; simulator is not enough for release confidence.

## Open Decisions / Blockers

- Apple Developer account/team access and Bundle ID choice.
- Distribution choice: TestFlight-only beta, unlisted App Store app, or public App Store listing.
- Commerce policy: whether the iOS app exposes Stripe checkout/plans, hides purchase flows, or requires another App Store-compliant purchase strategy.
- Native shell approach: smallest acceptable Apple-review-safe shell versus richer native capability.
- Supported iOS version range.

## Checkpoint Log

- `2026-05-17 | planned | created follow-up after owner reported iPhone Home Screen auth link opened in Safari and required code fallback; brief captures native iOS app + Universal Links path so the product goal is not forgotten | next: resolve Apple Developer/distribution/commerce decisions before execution`
