import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readRepoFile(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Supabase egress cache contract", () => {
  it("uses cached published course content for the public course API path", () => {
    const source = readRepoFile("app/api/course/content/route.ts");

    expect(source).toContain("loadPublishedCourseModulesCached");
    expect(source).toContain("publicCachedJson");
    expect(source).toContain("s-maxage=");
    expect(source).toContain("noStoreJson");
  });

  it("keeps the client course content fetch cacheable outside preview mode", () => {
    const source = readRepoFile("app/course/page.tsx");

    expect(source).toContain('previewEnabled ? "no-store" : "force-cache"');
    expect(source).toContain("cache: requestCache");
  });

  it("uses cached public catalog overrides on the plans page", () => {
    const source = readRepoFile("app/plans/page.tsx");

    expect(source).toContain("loadPublicCatalogOverridesCached");
    expect(source).not.toContain('from("products")');
  });
});
