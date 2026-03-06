# Core Flow Incident Response Runbook

## Purpose

Provide a deterministic first-response flow for production incidents on core routes:

- `/`
- `/course`
- `/my-library`
- `/admin`

## Severity Definitions

- `P0`: critical outage or unsafe behavior (users/admin cannot complete core actions, auth/entitlement failure, data corruption risk).
- `P1`: major degradation with workaround (core action possible but unreliable/slow/error-prone).
- `P2`: non-critical bug or UX defect with low operational impact.

## First 10 Minutes (Required)

1. Confirm scope:
   - route(s) affected,
   - user segment (public/signed-in/admin),
   - first seen time.
2. Capture evidence:
   - failing URL,
   - screenshot/video,
   - browser/device,
   - exact error message (no secrets).
3. Classify severity (`P0`, `P1`, `P2`) and assign owner.
4. Verify current deploy and checks:
   - open active production deployment in Vercel,
   - check latest `main` PR/commit checks on GitHub.
5. Pick immediate containment:
   - rollback deployment, or
   - disable risky behavior through existing runtime/admin controls.

## Route Triage Matrix

| Surface       | Primary failure signals                                             | First checks                                                                                |
| ------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `/`           | Blank render, nav broken, core CTA broken                           | Verify latest deployment, console/runtime errors, route load in desktop+mobile              |
| `/course`     | Lesson load fails, progress save fails, support card actions broken | Confirm `/api/course/content` and `/api/progress/course` behavior; validate auth path       |
| `/my-library` | Library list missing, entitlement mismatch, retry loops             | Confirm library reads + entitlement state and recent commerce changes                       |
| `/admin`      | Access gate loops, content mutations fail, save errors              | Confirm auth role path, admin API responses (`401/403` vs `500`), schema readiness warnings |

## Containment And Rollback

1. If `P0` and recent deploy is suspected:
   - rollback in Vercel first,
   - re-test impacted route.
2. If mutation risk exists:
   - stop ongoing admin edits for impacted area,
   - preserve data integrity (no manual hot edits without traceability).
3. If issue is isolated and safe:
   - keep deploy and ship hotfix PR with explicit negative-path tests.

## Communication Contract

- Open one incident note with:
  - timestamp,
  - severity,
  - owner,
  - user impact,
  - mitigation status.
- Update every 30 minutes until mitigated.
- Close incident with:
  - root cause,
  - fix PR link,
  - follow-up brief (if structural gap remains).

## Verification Gates Before Incident Closure

- Local gate: `npm run verify:pre-pr`
- Merge gate for fix branch: `npm run verify:pre-merge`
- Required PR checks green.
- Manual smoke on affected route(s) in production.

## Security/Privacy Guardrails

- Never paste secrets, raw tokens, or full personal data in incident notes.
- Keep logs/screenshots redacted.
- Unauthorized/forbidden paths must remain fail-closed (`401/403`), not downgraded for convenience.
