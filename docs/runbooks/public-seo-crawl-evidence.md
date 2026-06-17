# Public SEO Crawl Evidence Runbook

## Purpose

Use this runbook to prove that public Freeswimming learning pages are crawlable, canonical,
AI-discoverable, private-mode-safe, and diagnosable after route or metadata changes.

## When To Run

- After changing public course routes, metadata, sitemap, robots, structured data, canonical links,
  locale readiness, or private-mode indexing behavior.
- Before claiming SEO/AI discoverability work is merge-ready.
- Monthly when reviewing Search Console/Bing crawl health.

## Local Evidence

Start a local or preview server, then run:

```bash
npm run seo:crawl-evidence -- --base-url http://127.0.0.1:3000
```

For a preview deployment:

```bash
npm run seo:crawl-evidence -- --base-url <preview-url>
```

The command writes a timestamped folder under `output/` with:

- `public-seo-crawl-evidence.md`
- `public-seo-crawl-evidence.json`

Do not commit raw output artifacts unless a PR explicitly needs a sanitized evidence sample. The PR
summary should record the command, base URL, pass/fail summary, and any blocked external evidence.

## Required Checks

The local report must cover:

- `/sitemap.xml` includes `/en/course` and canonical course lesson URLs.
- `/sitemap.xml` excludes duplicate `/course`, `/admin`, `/api`, `/my-library`, checkout, auth, and
  preview/private paths.
- `/robots.txt` allows `OAI-SearchBot`, disallows `GPTBot`, allows default public crawlers, and
  declares the sitemap in public mode.
- `/en/course` renders a self-canonical URL and visible public course text.
- A representative `/en/course/<module>/<lesson>` route renders canonical metadata, visible lesson
  text, and parseable `LearningResource` JSON-LD.
- Known deprecated renamed lesson slugs, such as the old
  `/en/course/course-module-breathing-and-floating/course-lesson-breathing-and-floating-floating-back`
  URL, redirect to the current canonical lesson URL instead of returning 404.
- Planned `nb` course routes are not indexable until Norwegian main content is ready.
- Unknown lesson slugs fail closed instead of creating crawlable duplicate pages.

Private/site-lock behavior is also part of the release contract:

- `SITE_LOCK_ENABLED=1` should make `sitemap()` return no URLs.
- `SITE_LOCK_ENABLED=1` should make `robots()` return `Disallow: /`.
- Use `npm run test:e2e:private-gate` or targeted unit tests when private-mode behavior changes.

## External Evidence

External tools may require owner credentials. Record blockers as `blocked-external` instead of
committing secrets or raw dashboard exports.

| Tool                                 | Target                                           | Evidence To Record                                            |
| ------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------- |
| Google Search Console URL Inspection | one canonical course lesson URL                  | Google-selected canonical, crawlability, rendered HTML status |
| Google Search Console URL Inspection | one legacy/query URL when available              | whether Google resolves to the canonical lesson URL           |
| Google Rich Results Test             | one canonical course lesson URL or rendered HTML | structured-data parse status and warnings                     |
| PageSpeed Insights                   | `/en/course` and one lesson URL                  | mobile/desktop CWV status or field-data availability          |
| Bing Webmaster Tools or IndexNow     | one canonical course lesson URL                  | discovery/indexing status or account-access blocker           |

## Crawler Policy

- `OAI-SearchBot` is the ChatGPT Search crawler policy surface.
- `GPTBot` is separate and relates to model-training use, not user-triggered browsing or search
  inclusion.
- Do not change crawler policy without updating the SEO/AI parent brief, this runbook, tests, and
  PR evidence.

## Troubleshooting

| Symptom                                   | First Check                                  | Likely Fix                                                                   |
| ----------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------- |
| Lesson missing from sitemap               | `getIndexableCourseLessonRoutes` output      | derive sitemap entries from canonical route helpers                          |
| Wrong canonical in rendered HTML          | `<link rel="canonical">` and metadata helper | align route metadata with `buildCourseLessonRoute`                           |
| Legacy URL appears as canonical           | sitemap and internal link source             | keep legacy compatibility separate from canonical href generation            |
| Renamed lesson URL returns 404            | runtime identity alias maps                  | add a bounded legacy ID/slug alias to the current canonical lesson           |
| Structured data mismatch                  | JSON-LD graph vs visible lesson title/goal   | generate schema from the same public course data                             |
| Private URL appears in sitemap            | sitemap output in public/private modes       | remove protected route family from sitemap generation                        |
| Search Console says blocked by robots     | current `robots.txt` and site-lock env       | confirm `SITE_LOCK_ENABLED` and crawler rules for target environment         |
| `nb` appears before translation readiness | sitemap and locale config                    | keep planned locale out of `COURSE_INDEXABLE_LOCALES` until content is ready |

## Privacy And Security

- Do not commit Search Console, Bing, Ahrefs, Screaming Frog, or PageSpeed screenshots containing
  account identifiers, query data, cookies, tokens, or private URLs.
- Do not print or commit raw `.env` values.
- Evidence artifacts should contain public URLs/content only.

## Rollback

If the audit starts failing after a route or metadata change:

1. Revert the route/metadata/sitemap/robots/schema change.
2. Rerun `npm run seo:crawl-evidence`.
3. Confirm sitemap, canonical, robots, and JSON-LD rows return to pass.
4. Record the failure mode in the relevant task brief or PR before retrying.
