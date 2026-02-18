import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("site lock metadata route behavior", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("disallows robots and clears sitemap when site lock is enabled", () => {
    vi.stubEnv("SITE_LOCK_ENABLED", "1");
    vi.stubEnv("SITE_LOCK_MODE", "password");
    vi.stubEnv(
      "SITE_LOCK_PASSWORD_HASH",
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
    vi.stubEnv("SITE_LOCK_BYPASS_TOKEN", "token-123");

    const robotsPayload = robots();
    const sitemapPayload = sitemap();

    expect(robotsPayload.rules).toMatchObject([{ userAgent: "*", disallow: "/" }]);
    expect(sitemapPayload).toEqual([]);
  });

  it("returns public robots and sitemap when site lock is disabled", () => {
    vi.stubEnv("SITE_LOCK_ENABLED", "0");

    const robotsPayload = robots();
    const sitemapPayload = sitemap();

    expect(robotsPayload.rules).toMatchObject([{ userAgent: "*", allow: "/" }]);
    expect(sitemapPayload.length).toBeGreaterThan(0);
  });
});
