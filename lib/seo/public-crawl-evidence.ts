import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { COURSE_MODULES } from "@/app/course/courseData";
import {
  buildCoursePageMetadata,
  buildCourseStructuredData,
  resolveCoursePageMetadata,
} from "@/app/course/metadata";
import {
  COURSE_DEFAULT_LOCALE,
  COURSE_SITE_ORIGIN,
  buildCourseLessonHref,
  buildCourseLessonLegacyQueryPath,
  buildCourseOverviewUrl,
  getIndexableCourseLessonRoutes,
  normalizeCourseLocale,
  normalizeIndexableCourseLocale,
  resolveCourseLessonRouteBySlugs,
} from "@/lib/course/canonical-routes";
import { isSiteLockEnabled } from "@/lib/site-lock/config";

export type CrawlEvidenceStatus = "pass" | "warn" | "fail" | "blocked-external";

export type CrawlEvidenceRow = {
  surface: string;
  check: string;
  status: CrawlEvidenceStatus;
  evidence: string;
  remediation?: string;
};

export type ExternalCrawlEvidenceStep = {
  tool: string;
  target: string;
  expectedEvidence: string;
  ownerStep: string;
  status: "manual-required";
};

export type PublicSeoCrawlEvidenceReport = {
  generatedAt: string;
  siteLocked: boolean;
  routeCount: number;
  representativeLessonUrl: string | null;
  rows: CrawlEvidenceRow[];
  externalSteps: ExternalCrawlEvidenceStep[];
};

function toUrlString(value: unknown): string {
  if (value instanceof URL) return value.toString();
  return typeof value === "string" ? value : String(value);
}

function hasPrivatePath(url: string): boolean {
  return ["/admin", "/api/", "/my-library", "/checkout", "/preview-access", "/auth"].some((path) =>
    url.includes(path)
  );
}

function pushRow(
  rows: CrawlEvidenceRow[],
  condition: boolean,
  input: Omit<CrawlEvidenceRow, "status"> & {
    failEvidence?: string;
    failRemediation?: string;
  }
) {
  rows.push({
    surface: input.surface,
    check: input.check,
    status: condition ? "pass" : "fail",
    evidence: condition ? input.evidence : (input.failEvidence ?? input.evidence),
    remediation: condition ? input.remediation : (input.failRemediation ?? input.remediation),
  });
}

function graphFromStructuredData(data: unknown): Array<Record<string, unknown>> {
  if (!data || typeof data !== "object") return [];
  const graph = (data as { "@graph"?: unknown })["@graph"];
  return Array.isArray(graph) ? graph.filter((item) => item && typeof item === "object") : [];
}

function graphHasType(graph: Array<Record<string, unknown>>, type: string) {
  return graph.some((item) => item["@type"] === type);
}

function robotRuleMatches(
  rule: unknown,
  userAgent: string,
  directive: "allow" | "disallow",
  value: string
) {
  if (!rule || typeof rule !== "object") return false;
  const candidate = rule as Record<string, unknown>;
  return candidate.userAgent === userAgent && candidate[directive] === value;
}

function buildExternalSteps(targetUrl: string | null): ExternalCrawlEvidenceStep[] {
  const lessonTarget = targetUrl ?? buildCourseOverviewUrl(COURSE_DEFAULT_LOCALE);

  return [
    {
      tool: "Google Search Console URL Inspection",
      target: lessonTarget,
      expectedEvidence:
        "URL is crawlable or queued, Google-selected canonical matches the declared canonical, and rendered HTML is available.",
      ownerStep:
        "Open Search Console URL Inspection for the canonical lesson URL and record the current verdict in the PR handoff.",
      status: "manual-required",
    },
    {
      tool: "Google Rich Results Test",
      target: lessonTarget,
      expectedEvidence:
        "Structured data parses without mismatch between JSON-LD and visible lesson content.",
      ownerStep:
        "Run the canonical lesson URL or rendered HTML in Rich Results Test and record pass/warning details.",
      status: "manual-required",
    },
    {
      tool: "PageSpeed Insights",
      target: lessonTarget,
      expectedEvidence: "Core Web Vitals evidence is collected for the public lesson route.",
      ownerStep:
        "Run PageSpeed Insights for the canonical lesson URL and record mobile/desktop CWV status.",
      status: "manual-required",
    },
    {
      tool: "Bing Webmaster Tools or IndexNow",
      target: lessonTarget,
      expectedEvidence:
        "Discovery/indexing evidence is captured where account access exists, or blocker is recorded.",
      ownerStep:
        "Open Bing Webmaster Tools or IndexNow-compatible evidence path and record current discovery status.",
      status: "manual-required",
    },
  ];
}

export function buildPublicSeoCrawlEvidenceReport(
  generatedAt = new Date().toISOString()
): PublicSeoCrawlEvidenceReport {
  const rows: CrawlEvidenceRow[] = [];
  const siteLocked = isSiteLockEnabled();
  const sitemapUrls = sitemap().map((entry) => toUrlString(entry.url));
  const robotsPayload = robots();
  const robotRules = Array.isArray(robotsPayload.rules)
    ? robotsPayload.rules
    : [robotsPayload.rules];
  const routes = getIndexableCourseLessonRoutes(COURSE_MODULES, COURSE_DEFAULT_LOCALE);
  const representativeRoute = routes[0] ?? null;
  const courseOverviewUrl = buildCourseOverviewUrl(COURSE_DEFAULT_LOCALE);

  if (siteLocked) {
    pushRow(rows, sitemapUrls.length === 0, {
      surface: "private-mode sitemap",
      check: "site lock removes public sitemap URLs",
      evidence: "sitemap() returned no public URLs while site lock is enabled.",
      failEvidence: `sitemap() returned ${sitemapUrls.length} URL(s) while site lock is enabled.`,
      failRemediation: "Keep sitemap empty while private mode is enabled.",
    });
    pushRow(
      rows,
      robotRules.some((rule) => robotRuleMatches(rule, "*", "disallow", "/")),
      {
        surface: "private-mode robots",
        check: "site lock disallows all crawlers",
        evidence: "robots() returned disallow all while site lock is enabled.",
        failEvidence: "robots() did not return a global disallow rule while site lock is enabled.",
        failRemediation: "Make private-mode robots fail closed with `Disallow: /`.",
      }
    );

    return {
      generatedAt,
      siteLocked,
      routeCount: routes.length,
      representativeLessonUrl: representativeRoute?.url ?? null,
      rows,
      externalSteps: buildExternalSteps(representativeRoute?.url ?? null),
    };
  }

  pushRow(rows, sitemapUrls.includes(courseOverviewUrl), {
    surface: "public sitemap",
    check: "course overview is discoverable",
    evidence: `${courseOverviewUrl} is present in sitemap output.`,
    failEvidence: `${courseOverviewUrl} is missing from sitemap output.`,
    failRemediation: "Add the canonical course overview URL to sitemap output.",
  });

  pushRow(rows, routes.length > 0 && routes.every((route) => sitemapUrls.includes(route.url)), {
    surface: "public sitemap",
    check: "all indexable course lessons are discoverable",
    evidence: `${routes.length} indexable course lesson URL(s) are present in sitemap output.`,
    failEvidence: "One or more indexable course lesson URLs are missing from sitemap output.",
    failRemediation: "Derive sitemap lesson URLs from `getIndexableCourseLessonRoutes`.",
  });

  pushRow(rows, !sitemapUrls.includes(`${COURSE_SITE_ORIGIN}/course`), {
    surface: "public sitemap",
    check: "legacy query route is not a competing sitemap canonical",
    evidence: "Legacy `/course` URL is absent from sitemap output.",
    failEvidence: "Legacy `/course` URL appears in sitemap output.",
    failRemediation: "Keep sitemap focused on locale-ready canonical course URLs.",
  });

  pushRow(
    rows,
    sitemapUrls.every((url) => !hasPrivatePath(url)),
    {
      surface: "public sitemap",
      check: "protected routes are not leaked",
      evidence:
        "No admin, API, member, checkout, auth, or preview-access URL appears in sitemap output.",
      failEvidence: "Protected URL detected in sitemap output.",
      failRemediation: "Remove private/admin/member URLs from sitemap generation.",
    }
  );

  pushRow(
    rows,
    sitemapUrls.every((url) => !url.includes("/nb/course")),
    {
      surface: "i18n crawl readiness",
      check: "planned Norwegian locale is not published before translation readiness",
      evidence: "`nb` is supported for future routing but absent from indexable sitemap output.",
      failEvidence: "`nb` URL appears in sitemap output before translated main content is ready.",
      failRemediation:
        "Keep planned locales out of indexable output until content readiness is explicit.",
    }
  );

  pushRow(
    rows,
    robotRules.some((rule) => robotRuleMatches(rule, "OAI-SearchBot", "allow", "/")) &&
      robotRules.some((rule) => robotRuleMatches(rule, "GPTBot", "disallow", "/")) &&
      robotRules.some((rule) => robotRuleMatches(rule, "*", "allow", "/")) &&
      robotsPayload.sitemap === `${COURSE_SITE_ORIGIN}/sitemap.xml`,
    {
      surface: "robots",
      check: "crawler policy separates search inclusion from training opt-out",
      evidence:
        "robots() allows OAI-SearchBot, disallows GPTBot, allows default crawlers, and declares sitemap.",
      failEvidence: "robots() crawler policy does not match the documented public SEO/AI contract.",
      failRemediation:
        "Keep OAI-SearchBot search visibility separate from GPTBot model-training policy.",
    }
  );

  const overviewMetadata = buildCoursePageMetadata({ locale: COURSE_DEFAULT_LOCALE });
  pushRow(
    rows,
    overviewMetadata.alternates?.canonical === "/en/course" &&
      overviewMetadata.alternates.languages?.en === "/en/course" &&
      overviewMetadata.alternates.languages?.["x-default"] === "/en/course",
    {
      surface: "course overview metadata",
      check: "overview has self-canonical and active language alternates",
      evidence: "Overview metadata canonical and language alternates point to `/en/course`.",
      failEvidence: "Overview metadata canonical or language alternates are inconsistent.",
      failRemediation: "Align overview metadata with canonical route helper output.",
    }
  );

  if (representativeRoute) {
    const lessonMetadata = buildCoursePageMetadata({
      lessonParam: representativeRoute.lesson.id,
      locale: representativeRoute.locale,
    });
    const resolvedLessonMetadata = resolveCoursePageMetadata({
      lessonParam: representativeRoute.lesson.id,
      locale: representativeRoute.locale,
    });

    pushRow(
      rows,
      lessonMetadata.alternates?.canonical === representativeRoute.path &&
        resolvedLessonMetadata.description.includes(representativeRoute.lesson.goal),
      {
        surface: "course lesson metadata",
        check: "representative lesson has canonical metadata from public content",
        evidence: `${representativeRoute.lesson.id} metadata points to ${representativeRoute.path}.`,
        failEvidence: "Representative lesson metadata does not match canonical route/content.",
        failRemediation: "Derive lesson metadata from stable course data and route helpers.",
      }
    );

    const lessonGraph = graphFromStructuredData(
      buildCourseStructuredData({
        lessonParam: representativeRoute.lesson.id,
        locale: representativeRoute.locale,
      })
    );
    const learningResource = lessonGraph.find((item) => item["@type"] === "LearningResource");

    pushRow(
      rows,
      learningResource?.url === representativeRoute.url &&
        learningResource.name === representativeRoute.lesson.title &&
        learningResource.teaches === representativeRoute.lesson.goal,
      {
        surface: "structured data",
        check: "lesson JSON-LD matches visible lesson content",
        evidence: `LearningResource JSON-LD matches ${representativeRoute.lesson.title}.`,
        failEvidence: "LearningResource JSON-LD does not match representative lesson content.",
        failRemediation: "Keep JSON-LD generated from the same visible public lesson fields.",
      }
    );
  } else {
    rows.push({
      surface: "course lesson metadata",
      check: "representative lesson is available",
      status: "fail",
      evidence: "No indexable course lesson route exists.",
      remediation: "Create at least one indexable course lesson before claiming crawl evidence.",
    });
  }

  const overviewGraph = graphFromStructuredData(buildCourseStructuredData({ locale: "en" }));
  pushRow(
    rows,
    graphHasType(overviewGraph, "Course") &&
      graphHasType(overviewGraph, "WebPage") &&
      graphHasType(overviewGraph, "BreadcrumbList"),
    {
      surface: "structured data",
      check: "course overview JSON-LD exposes stable public entities",
      evidence: "Overview JSON-LD includes Course, WebPage, and BreadcrumbList nodes.",
      failEvidence: "Overview JSON-LD is missing Course, WebPage, or BreadcrumbList nodes.",
      failRemediation: "Keep structured data aligned with visible overview content.",
    }
  );

  const knownLegacyQueryPath = buildCourseLessonLegacyQueryPath("mod1-l1");
  pushRow(
    rows,
    knownLegacyQueryPath === "/course?lesson=mod1-l1" &&
      buildCourseLessonHref(COURSE_MODULES, "mod1-l1") !== knownLegacyQueryPath,
    {
      surface: "legacy route compatibility",
      check: "legacy query links remain supported without becoming canonical defaults",
      evidence:
        "`/course?lesson=mod1-l1` remains a supported legacy shape, while helper defaults to canonical href.",
      failEvidence: "Legacy route support or canonical helper default has drifted.",
      failRemediation: "Keep legacy query compatibility separate from canonical link generation.",
    }
  );

  const deprecatedBreathingFloatingRoute = resolveCourseLessonRouteBySlugs(COURSE_MODULES, {
    locale: "en",
    moduleSlug: "course-module-breathing-and-floating",
    lessonSlug: "course-lesson-breathing-and-floating-floating-back",
  });
  const bodyPositionBackPath = buildCourseLessonHref(
    COURSE_MODULES,
    "body-position--body-position-back"
  );
  pushRow(
    rows,
    deprecatedBreathingFloatingRoute.status === "redirect" &&
      deprecatedBreathingFloatingRoute.route.path === bodyPositionBackPath,
    {
      surface: "deprecated route compatibility",
      check: "known breathing-and-floating lesson redirects to current canonical route",
      evidence:
        "Owner-surfaced deprecated breathing-and-floating/floating-back route resolves to the Body Position on the Back canonical URL.",
      failEvidence:
        "Deprecated breathing-and-floating/floating-back route does not redirect to the current Body Position on the Back canonical URL.",
      failRemediation:
        "Keep renamed public lesson aliases mapped so old shared/search URLs do not become 404s.",
    }
  );

  pushRow(
    rows,
    resolveCourseLessonRouteBySlugs(COURSE_MODULES, {
      locale: "en",
      moduleSlug: "missing-module",
      lessonSlug: "missing-lesson",
    }).status === "not-found",
    {
      surface: "unknown route safety",
      check: "unknown lesson routes do not create indexable fake pages",
      evidence: "Unknown lesson slug resolves as not-found.",
      failEvidence: "Unknown lesson slug did not fail closed.",
      failRemediation: "Return not-found/noindex-safe behavior for unknown route params.",
    }
  );

  pushRow(
    rows,
    normalizeCourseLocale("nb") === "nb" && normalizeIndexableCourseLocale("nb") === null,
    {
      surface: "i18n crawl readiness",
      check: "planned locales are modeled but not indexable by default",
      evidence: "`nb` is supported for future routing and not indexable until content readiness.",
      failEvidence: "`nb` locale readiness contract has drifted.",
      failRemediation: "Keep supported locale and indexable locale contracts explicit.",
    }
  );

  return {
    generatedAt,
    siteLocked,
    routeCount: routes.length,
    representativeLessonUrl: representativeRoute?.url ?? null,
    rows,
    externalSteps: buildExternalSteps(representativeRoute?.url ?? null),
  };
}

export function summarizeCrawlEvidence(rows: CrawlEvidenceRow[]) {
  return rows.reduce(
    (summary, row) => {
      summary[row.status] += 1;
      return summary;
    },
    {
      pass: 0,
      warn: 0,
      fail: 0,
      "blocked-external": 0,
    } satisfies Record<CrawlEvidenceStatus, number>
  );
}
