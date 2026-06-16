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

    expect(robotsPayload.rules).toEqual(
      expect.arrayContaining([
        { userAgent: "OAI-SearchBot", allow: "/" },
        { userAgent: "GPTBot", disallow: "/" },
        { userAgent: "*", allow: "/" },
      ])
    );
    expect(sitemapPayload.length).toBeGreaterThan(0);
    expect(sitemapPayload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: "https://freeswimming.org/en/course" }),
        expect.objectContaining({
          url: expect.stringContaining("https://freeswimming.org/en/course/course-module-"),
        }),
      ])
    );
    expect(sitemapPayload).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ url: "https://freeswimming.org/course" })])
    );
  });
});
