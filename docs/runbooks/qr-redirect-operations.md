# QR Redirect Operations Runbook

## Purpose

Operate QR redirect links safely in admin, including create/update/rollback and broken-scan troubleshooting.

## Scope

- Admin QR registry: `/admin?tab=qr-links`
- Contextual edit panels on lesson/page/product edit surfaces in `/admin?tab=content`
- Redirect runtime route: `/go/v/[slug]`
- Fallback route: `/go/unavailable`

## Safe Change Flow (Create/Update)

1. Start from the current lesson/page/product edit surface when you are doing contextual editorial work, or open `/admin?tab=qr-links` for list-first registry work.
2. Create or edit the QR link with a unique slug.
3. Use only allowlisted HTTPS destinations.
4. Prefer the stable internal Freeswimming route as default destination (for lessons: `/course?lesson=<canonicalLessonId>`). Use external video or other allowlisted HTTPS destinations only as an advanced override.
5. Save and verify link row shows expected `slug`, `status`, `placement`, and `content`.
6. Open `/go/v/<slug>` in browser to confirm redirect lands correctly.

## Rollback Flow

If a destination is wrong or unsafe in production:

1. Open affected link in admin registry.
2. Immediate rollback option A: change status to `disabled`.
3. Immediate rollback option B: restore previous safe destination URL.
4. Re-test `/go/v/<slug>` and verify fallback/success behavior.

## Broken Scan Triage

When users report a QR not working:

1. Open `/go/v/<slug>` directly.
2. If redirected to `/go/unavailable`, inspect `reason` query param.
3. Match reason to fix:
   - `invalid_slug`: QR payload malformed or wrong code.
   - `not_found`: slug missing/removed in registry.
   - `schema_not_ready`: migration/schema missing in environment.
   - `lookup_failed`: transient DB/runtime lookup error.
   - `invalid_url`: destination data invalid.
   - `invalid_protocol`: non-HTTPS destination.
   - `credentials_not_allowed`: URL contains credentials.
   - `disallowed_host`: destination host outside allowlist.

## Observability Checklist

- Redirect hits emit `qr_redirect_hit`.
- Admin create emits `qr_link_created`.
- Admin update emits `qr_link_updated`.
- Status transitions emit `qr_link_status_changed`.
- Redirect fallback logs include `[QrRedirect] Redirecting to fallback` with structured `reason` and `slug`.

## Verification Commands

```bash
npm run verify:pre-pr
npm run verify:pre-merge
```

## Incident Notes

- Never bypass host/protocol validation to unblock quickly.
- Prefer disable/rollback in registry over hotfixing QR assets.
- Keep slug stable whenever possible to avoid reprinting QR codes.
