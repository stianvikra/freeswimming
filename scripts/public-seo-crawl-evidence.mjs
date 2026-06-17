#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PRODUCTION_ORIGIN = "https://freeswimming.org";
const DEPRECATED_BREATHING_FLOATING_PATH =
  "/en/course/course-module-breathing-and-floating/course-lesson-breathing-and-floating-floating-back";
const DEPRECATED_BREATHING_FLOATING_CANONICAL_PATH =
  "/en/course/course-module-body-position-drills/course-lesson-body-position-drills-body-position-back";

function parseArgs(argv) {
  const args = {
    baseUrl: process.env.SEO_CRAWL_BASE_URL || "http://127.0.0.1:3000",
    outputDir: "",
    json: false,
    noWrite: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--base-url") {
      args.baseUrl = argv[index + 1] || args.baseUrl;
      index += 1;
    } else if (arg === "--output-dir") {
      args.outputDir = argv[index + 1] || "";
      index += 1;
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--no-write") {
      args.noWrite = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }

  return args;
}

function usage() {
  return `Usage: node scripts/public-seo-crawl-evidence.mjs [--base-url http://127.0.0.1:3000] [--output-dir output/seo-crawl-evidence] [--json] [--no-write]

Audits a running Freeswimming dev/preview server for public SEO crawl evidence.

Examples:
  npm run seo:crawl-evidence -- --base-url http://127.0.0.1:3000
  node scripts/public-seo-crawl-evidence.mjs --base-url https://preview.example.vercel.app --json --no-write`;
}

function normalizeBaseUrl(value) {
  try {
    const url = new URL(value);
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error(`Invalid --base-url: ${value}`);
  }
}

async function fetchText(baseUrl, pathOrUrl, options = {}) {
  const target = new URL(pathOrUrl, baseUrl);
  const response = await fetch(target, {
    redirect: options.redirect || "follow",
    headers: {
      "user-agent": "freeswimming-local-seo-crawl-evidence/1.0",
    },
  });
  const text = await response.text();
  return {
    url: target.toString(),
    status: response.status,
    redirected: response.redirected,
    finalUrl: response.url,
    text,
    headers: response.headers,
  };
}

function extractSitemapLocs(xml) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1].trim());
}

function extractFirstMatch(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || "";
}

function extractMetaContent(html, nameOrProperty) {
  const escaped = nameOrProperty.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escaped}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["'][^>]*>`, "i"),
  ];
  for (const pattern of patterns) {
    const value = extractFirstMatch(html, pattern);
    if (value) return value;
  }
  return "";
}

function extractCanonical(html) {
  return extractFirstMatch(
    html,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i
  );
}

function hasHtmlTagBoundary(char) {
  return char === ">" || char === "/" || (char !== undefined && /\s/.test(char));
}

function findTagRange(html, tagName, fromIndex, closing) {
  const lowerHtml = html.toLowerCase();
  const needle = closing ? `</${tagName.toLowerCase()}` : `<${tagName.toLowerCase()}`;
  let searchIndex = fromIndex;

  while (searchIndex < html.length) {
    const start = lowerHtml.indexOf(needle, searchIndex);
    if (start === -1) return null;

    const boundaryChar = lowerHtml[start + needle.length];
    if (!hasHtmlTagBoundary(boundaryChar)) {
      searchIndex = start + needle.length;
      continue;
    }

    const end = html.indexOf(">", start + needle.length);
    if (end === -1) return null;
    return { start, end: end + 1 };
  }

  return null;
}

function removeRawTextElementBlocks(html, tagName) {
  let output = "";
  let cursor = 0;

  while (cursor < html.length) {
    const open = findTagRange(html, tagName, cursor, false);
    if (!open) break;

    output += `${html.slice(cursor, open.start)} `;
    const close = findTagRange(html, tagName, open.end, true);
    if (!close) {
      cursor = html.length;
      break;
    }
    cursor = close.end;
  }

  return output + html.slice(cursor);
}

function extractJsonLd(html) {
  const scripts = [];
  let cursor = 0;

  while (cursor < html.length) {
    const open = findTagRange(html, "script", cursor, false);
    if (!open) break;

    const close = findTagRange(html, "script", open.end, true);
    if (!close) {
      cursor = open.end;
      continue;
    }

    const openTag = html.slice(open.start, open.end);
    if (/\btype\s*=\s*["']application\/ld\+json["']/i.test(openTag)) {
      scripts.push(html.slice(open.end, close.start).trim());
    }

    cursor = close.end;
  }

  return scripts;
}

function stripTags(html) {
  return removeRawTextElementBlocks(removeRawTextElementBlocks(html, "script"), "style")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function productionUrlToLocalPath(url) {
  const parsed = new URL(url);
  if (parsed.origin !== PRODUCTION_ORIGIN) return null;
  return `${parsed.pathname}${parsed.search}`;
}

function row(rows, condition, surface, check, evidence, remediation = "") {
  rows.push({
    surface,
    check,
    status: condition ? "pass" : "fail",
    evidence,
    remediation: condition ? "" : remediation,
  });
}

function summarize(rows) {
  return rows.reduce(
    (summary, item) => {
      summary[item.status] += 1;
      return summary;
    },
    { pass: 0, warn: 0, fail: 0, "blocked-external": 0 }
  );
}

function markdownTableCell(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

function markdownReport(report) {
  const lines = [
    "# Public SEO Crawl Evidence",
    "",
    `- Generated: ${report.generatedAt}`,
    `- Base URL: ${report.baseUrl}`,
    `- Representative lesson: ${report.representativeLessonPath || "not found"}`,
    `- Summary: ${report.summary.pass} pass, ${report.summary.fail} fail, ${report.summary.warn} warn, ${report.summary["blocked-external"]} blocked external`,
    "",
    "## Local Evidence",
    "",
    "| Surface | Check | Status | Evidence | Remediation |",
    "| ------- | ----- | ------ | -------- | ----------- |",
    ...report.rows.map(
      (item) =>
        `| ${markdownTableCell(item.surface)} | ${markdownTableCell(item.check)} | ${markdownTableCell(item.status)} | ${markdownTableCell(item.evidence)} | ${markdownTableCell(item.remediation)} |`
    ),
    "",
    "## External Manual Evidence",
    "",
    "| Tool | Target | Expected Evidence | Owner Step |",
    "| ---- | ------ | ----------------- | ---------- |",
    ...report.externalSteps.map(
      (item) =>
        `| ${markdownTableCell(item.tool)} | ${markdownTableCell(item.target)} | ${markdownTableCell(item.expectedEvidence)} | ${markdownTableCell(item.ownerStep)} |`
    ),
    "",
  ];
  return `${lines.join("\n")}\n`;
}

async function buildReport(baseUrl) {
  const rows = [];
  const sitemap = await fetchText(baseUrl, "/sitemap.xml");
  const robots = await fetchText(baseUrl, "/robots.txt");
  const sitemapLocs = extractSitemapLocs(sitemap.text);
  const courseOverviewPath = "/en/course";
  const representativeLessonUrl =
    sitemapLocs.find((loc) => {
      const pathValue = productionUrlToLocalPath(loc);
      return pathValue?.startsWith("/en/course/") && pathValue.split("/").length >= 5;
    }) || "";
  const representativeLessonPath = representativeLessonUrl
    ? productionUrlToLocalPath(representativeLessonUrl)
    : null;

  row(
    rows,
    sitemap.status === 200 && sitemapLocs.includes(`${PRODUCTION_ORIGIN}${courseOverviewPath}`),
    "sitemap",
    "course overview is present",
    `sitemap returned ${sitemap.status} with ${sitemapLocs.length} URL(s).`,
    "Expected /en/course in sitemap.xml."
  );
  row(
    rows,
    Boolean(representativeLessonPath),
    "sitemap",
    "representative canonical lesson is present",
    representativeLessonPath
      ? `Found representative lesson ${representativeLessonPath}.`
      : "No representative lesson URL found in sitemap.",
    "Expected at least one canonical /en/course/<module>/<lesson> URL in sitemap.xml."
  );
  row(
    rows,
    !sitemapLocs.includes(`${PRODUCTION_ORIGIN}/course`) &&
      sitemapLocs.every((loc) => !loc.includes("/admin") && !loc.includes("/my-library")),
    "sitemap",
    "sitemap excludes duplicate legacy and private routes",
    "Checked sitemap for /course, /admin, and /my-library leakage.",
    "Remove duplicate legacy or private URLs from sitemap output."
  );
  row(
    rows,
    robots.status === 200 &&
      robots.text.includes("User-Agent: OAI-SearchBot") &&
      robots.text.includes("User-Agent: GPTBot") &&
      robots.text.includes("Disallow: /") &&
      robots.text.includes(`${PRODUCTION_ORIGIN}/sitemap.xml`),
    "robots",
    "AI crawler policy and sitemap are declared",
    "Checked robots.txt for OAI-SearchBot, GPTBot, Disallow, and sitemap.",
    "Keep OAI-SearchBot search visibility and GPTBot training policy explicit."
  );

  const overview = await fetchText(baseUrl, courseOverviewPath);
  const overviewCanonical = extractCanonical(overview.text);
  const overviewText = stripTags(overview.text);
  row(
    rows,
    overview.status === 200 &&
      overviewCanonical === `${PRODUCTION_ORIGIN}${courseOverviewPath}` &&
      overviewText.includes("Freestyle Course"),
    "course overview",
    "rendered HTML has canonical URL and visible learning text",
    `status=${overview.status}, canonical=${overviewCanonical || "missing"}.`,
    "Expected rendered /en/course HTML to include canonical and public course text."
  );

  if (representativeLessonPath) {
    const lesson = await fetchText(baseUrl, representativeLessonPath);
    const lessonCanonical = extractCanonical(lesson.text);
    const lessonDescription = extractMetaContent(lesson.text, "description");
    const jsonLdScripts = extractJsonLd(lesson.text);
    const visibleText = stripTags(lesson.text);
    let hasLearningResource = false;
    let jsonLdParseError = "";

    for (const script of jsonLdScripts) {
      try {
        const parsed = JSON.parse(script);
        const graph = Array.isArray(parsed?.["@graph"]) ? parsed["@graph"] : [];
        hasLearningResource =
          hasLearningResource || graph.some((item) => item?.["@type"] === "LearningResource");
      } catch (error) {
        jsonLdParseError = error instanceof Error ? error.message : String(error);
      }
    }

    row(
      rows,
      lesson.status === 200 &&
        lessonCanonical === representativeLessonUrl &&
        lessonDescription.length > 0 &&
        visibleText.length > 500,
      "course lesson",
      "rendered HTML has canonical metadata and visible lesson text",
      `status=${lesson.status}, canonical=${lessonCanonical || "missing"}, description=${lessonDescription ? "present" : "missing"}.`,
      "Expected representative lesson HTML to expose canonical metadata and visible text."
    );
    row(
      rows,
      jsonLdScripts.length > 0 && hasLearningResource && !jsonLdParseError,
      "structured data",
      "lesson JSON-LD parses and includes LearningResource",
      `jsonLdScripts=${jsonLdScripts.length}, learningResource=${hasLearningResource}.`,
      jsonLdParseError || "Expected parseable LearningResource JSON-LD on canonical lesson route."
    );
  }

  const nbRoute = await fetchText(baseUrl, "/nb/course", { redirect: "manual" });
  row(
    rows,
    nbRoute.status === 404 || nbRoute.status === 307 || nbRoute.status === 308,
    "i18n crawl readiness",
    "planned nb locale is not indexable before translation readiness",
    `GET /nb/course returned ${nbRoute.status}.`,
    "Expected nb route to remain non-indexable until Norwegian main content is ready."
  );

  const unknownRoute = await fetchText(baseUrl, "/en/course/missing-module/missing-lesson", {
    redirect: "manual",
  });
  row(
    rows,
    unknownRoute.status === 404,
    "unknown route safety",
    "unknown lesson route fails closed",
    `GET /en/course/missing-module/missing-lesson returned ${unknownRoute.status}.`,
    "Expected unknown lesson route to return 404."
  );

  const deprecatedBreathingFloatingRoute = await fetchText(
    baseUrl,
    DEPRECATED_BREATHING_FLOATING_PATH,
    {
      redirect: "manual",
    }
  );
  const deprecatedBreathingFloatingLocation =
    deprecatedBreathingFloatingRoute.headers.get("location") || "";
  row(
    rows,
    [307, 308].includes(deprecatedBreathingFloatingRoute.status) &&
      deprecatedBreathingFloatingLocation === DEPRECATED_BREATHING_FLOATING_CANONICAL_PATH,
    "deprecated route compatibility",
    "known breathing-and-floating lesson redirects to current canonical route",
    `GET ${DEPRECATED_BREATHING_FLOATING_PATH} returned ${deprecatedBreathingFloatingRoute.status} with location=${deprecatedBreathingFloatingLocation || "missing"}.`,
    `Expected redirect to ${DEPRECATED_BREATHING_FLOATING_CANONICAL_PATH}.`
  );

  const externalSteps = [
    {
      tool: "Google Search Console URL Inspection",
      target: representativeLessonUrl || `${PRODUCTION_ORIGIN}${courseOverviewPath}`,
      expectedEvidence:
        "Google-selected canonical matches the declared canonical and rendered HTML is available.",
      ownerStep:
        "Inspect the target URL in Search Console and record the verdict in the PR handoff.",
    },
    {
      tool: "Google Rich Results Test",
      target: representativeLessonUrl || `${PRODUCTION_ORIGIN}${courseOverviewPath}`,
      expectedEvidence: "Structured data parses and matches visible public lesson content.",
      ownerStep:
        "Run the target URL or rendered HTML in Rich Results Test and record warnings/errors.",
    },
    {
      tool: "PageSpeed Insights",
      target: representativeLessonUrl || `${PRODUCTION_ORIGIN}${courseOverviewPath}`,
      expectedEvidence:
        "Core Web Vitals evidence is captured for mobile and desktop where available.",
      ownerStep: "Run PageSpeed Insights and record CWV status or field-data availability.",
    },
    {
      tool: "Bing Webmaster Tools or IndexNow",
      target: representativeLessonUrl || `${PRODUCTION_ORIGIN}${courseOverviewPath}`,
      expectedEvidence:
        "Discovery/indexing status is captured, or credential blocker is documented.",
      ownerStep: "Check Bing/IndexNow evidence if account access exists.",
    },
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    representativeLessonPath,
    rows,
    externalSteps,
  };
  report.summary = summarize(rows);
  return report;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const baseUrl = normalizeBaseUrl(args.baseUrl);
  const report = await buildReport(baseUrl);
  const markdown = markdownReport(report);

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(markdown);
  }

  if (!args.noWrite) {
    const timestamp = report.generatedAt.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const outputDir =
      args.outputDir || path.join("output", `public-seo-crawl-evidence-${timestamp}`);
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, "public-seo-crawl-evidence.md"), markdown);
    await writeFile(
      path.join(outputDir, "public-seo-crawl-evidence.json"),
      JSON.stringify(report, null, 2)
    );
    console.error(`[seo-crawl-evidence] Wrote ${outputDir}`);
  }

  if (report.summary.fail > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`[seo-crawl-evidence] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
