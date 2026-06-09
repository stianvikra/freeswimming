# Public Analytics Privacy Assessment

## Status

- `status`: `foundation-only`
- `updated`: `2026-06-09`
- `active_vendor`: `none`
- `preferred_vendor_candidate`: `Plausible`
- `fallback_vendor_candidate`: `Simple Analytics`

## Scope

This assessment covers the public website/sales analytics foundation only.

It approves:

- first-party safe public route/event contracts;
- generic public events such as `public_page_viewed`, `public_cta_clicked`, `product_viewed`, `checkout_started`, and `checkout_completed`;
- route-template/category dimensions;
- canonical public product/catalog dimensions;
- aggregate/cohort public funnel metrics.
- signed-in first-party product workflow events such as workout-builder start/save signals, only
  when they use safe low-cardinality dimensions and avoid private workout text.

It does not approve:

- Meta Pixel, Meta Conversions API, GA4, Google Tag Manager, Hotjar, Clarity, heatmaps, session replay, ad retargeting, or advanced matching;
- tracking cookies, localStorage visitor IDs, ad click IDs, device fingerprinting, raw IP, raw User-Agent, raw URLs, or full clickstream;
- joining anonymous public traffic to a logged-in user profile;
- detailed cart, shipping, product-personalization, or video analytics.

## Official Source Check

Checked on `2026-06-09`:

- Plausible docs: `https://plausible.io/docs/`
- Plausible data policy: `https://plausible.io/data-policy`
- Plausible custom locations: `https://plausible.io/docs/custom-locations`
- Plausible custom properties: `https://plausible.io/docs/custom-props/introduction`
- Datatilsynet cookie/sporing guidance: `https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bruk-av-informasjonskapsler-og-andre-sporingsteknologier/`
- Nkom cookie guidance: `https://nkom.no/internett/informasjonskapsler-cookies`

## Plausible Assessment

Plausible remains the first vendor candidate because official materials describe a cookieless, EU-hosted analytics product with no persistent browser storage and no raw IP/User-Agent storage in normal site analytics.

Activation is intentionally deferred. Before activation, Freeswimming must document:

- exact script/event integration mode;
- whether any browser storage, custom properties, events, ecommerce fields, raw URL values, or API forwarding is used;
- whether custom page locations replace raw dynamic URLs;
- whether a data processing agreement and processor role review are complete;
- whether `/privacy` and `/cookies` describe the active behavior;
- whether no user-profile bridge is created.

Custom properties are treated as sensitive by default because Plausible can record the raw property values Freeswimming sends. Only route templates, route categories, canonical product IDs/types, and allowlisted source/campaign fields may be sent.

## Norwegian Cookie And Consent Boundary

Nkom and Datatilsynet guidance for the 2025 rules says cookies and similar tracking technologies need consent that satisfies GDPR requirements unless a narrow strictly-necessary exemption applies.

This foundation therefore does not add non-essential cookies, localStorage visitor IDs, pixels, tag managers, or session replay. If a later vendor/script uses cookies or similar technology, the change must add an active, specific, informed, documented, and easily withdrawable consent flow before activation.

## Data Boundary

- Public anonymous route/product events stay aggregate/cohort-only.
- Logged-in product/admin events stay first-party and account-scoped where needed.
- Public anonymous events are not linked to `user_id`, email, auth session, or profile state.
- Checkout completion and entitlement metrics come from Stripe/entitlement truth, not browser-only claims.
- First-party persistence stores only sanitized `analytics_events` rows through server-owned writes.
  It does not add a public visitor ID, tracking cookie, localStorage key, vendor script, full URL,
  raw referrer, raw IP, raw User-Agent, or anonymous-public-to-profile bridge.
- Workout-builder funnel V1 may store `workout_builder_started` and `workout_builder_saved` with
  safe dimensions such as builder mode, source kind, save kind, session type, size mode, step count,
  distance, and duration. It must not store workout titles, notes, route URLs, private workout row
  IDs, or raw workout text in the analytics payload.
- Daily rollups store only aggregate counts and already-sanitized dimensions in
  `analytics_event_daily_rollups`. They do not store payload JSON, `user_id`, email, raw URL, IP,
  User-Agent, visitor ID, or private training/user content.
- Raw-event retention target is `180` days and daily rollup window target is `400` days. V1 adds
  service-role-only refresh/prune functions, but no automatic deletion job. Raw pruning must only
  happen after daily rollups cover the UTC days being deleted.

## Future Compatibility

New public pages can be counted when they register a route template, category, safe label, privacy classification, and tests.

New products such as swim mugs can be counted when they come from canonical catalog/Stripe data and expose safe product dimensions. Unknown products render as `Unknown product / not counted`.

New lessons can use coarse progress events only when stable runtime IDs exist. Lesson titles and slugs are display labels, not analytics identity.

## Release Evidence Required

Before a PR activates a public analytics vendor or new non-essential tracking behavior:

- update this assessment;
- update `/privacy` and `/cookies`;
- update the active task brief checkpoint;
- run route/label/support sweep for analytics, cookies, route templates, product IDs, and vendor names;
- add negative tests for disallowed vendors and unsafe payloads;
- run `npm run verify:pre-pr` and `npm run verify:pre-merge`.
