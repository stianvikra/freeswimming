import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/preview-access/clear/route";

describe("/preview-access/clear route", () => {
  beforeEach(() => {
    vi.stubEnv("SITE_LOCK_ENABLED", "1");
    vi.stubEnv("SITE_LOCK_MODE", "password");
    vi.stubEnv(
      "SITE_LOCK_PASSWORD_HASH",
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
    vi.stubEnv("SITE_LOCK_BYPASS_TOKEN", "token-123");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("clears preview cookie and redirects to preview-access", async () => {
    const response = await GET(
      new Request("http://127.0.0.1:3000/preview-access/clear?next=/my-library")
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "http://127.0.0.1:3000/preview-access?next=%2Fmy-library"
    );
    expect(response.headers.get("set-cookie")).toContain("fs_preview_access=");
  });
});
