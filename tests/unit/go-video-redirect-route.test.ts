import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock, trackAnalyticsEventMock } = vi.hoisted(() => {
  return {
    createServerSupabaseClientMock: vi.fn(),
    trackAnalyticsEventMock: vi.fn(),
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("@/lib/analytics/events", () => ({
  trackAnalyticsEvent: trackAnalyticsEventMock,
}));

import { GET } from "@/app/go/v/[slug]/route";

type LinkLookupResult = {
  data: { slug: string; destination_url: string } | null;
  error: { code?: string; message?: string } | null;
};

function buildSupabaseClient(result: LinkLookupResult) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const statusEq = vi.fn().mockReturnValue({ maybeSingle });
  const slugEq = vi.fn().mockReturnValue({ eq: statusEq });
  const select = vi.fn().mockReturnValue({ eq: slugEq });
  const from = vi.fn().mockReturnValue({ select });

  return {
    from,
    select,
    slugEq,
    statusEq,
    maybeSingle,
  };
}

function routeContext(slug: string) {
  return {
    params: Promise.resolve({ slug }),
  };
}

function parseRedirectLocation(response: Response): URL {
  const location = response.headers.get("location");
  if (!location) {
    throw new Error("Expected redirect location header.");
  }

  return new URL(location);
}

describe("/go/v/[slug] route", () => {
  beforeEach(() => {
    trackAnalyticsEventMock.mockImplementation(() => {});
    vi.stubEnv("QR_REDIRECT_ALLOWED_HOSTS", "freeswimming.org,www.freeswimming.org");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("redirects to active allowlisted destination", async () => {
    const supabase = buildSupabaseClient({
      data: {
        slug: "intro-video",
        destination_url: "https://freeswimming.org/course?lesson=mod1-l1",
      },
      error: null,
    });
    createServerSupabaseClientMock.mockResolvedValueOnce(supabase);

    const response = await GET(
      new Request("https://freeswimming.org/go/v/intro-video"),
      routeContext("intro-video")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(parseRedirectLocation(response).toString()).toBe(
      "https://freeswimming.org/course?lesson=mod1-l1"
    );
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "qr_redirect_hit",
        payload: expect.objectContaining({
          slug: "intro-video",
          outcome: "success",
          destinationHost: "freeswimming.org",
        }),
      })
    );
  });

  it("redirects to unavailable fallback when slug is not found", async () => {
    const supabase = buildSupabaseClient({
      data: null,
      error: null,
    });
    createServerSupabaseClientMock.mockResolvedValueOnce(supabase);

    const response = await GET(
      new Request("https://freeswimming.org/go/v/intro-video"),
      routeContext("intro-video")
    );
    const location = parseRedirectLocation(response);

    expect(response.status).toBe(302);
    expect(location.pathname).toBe("/go/unavailable");
    expect(location.searchParams.get("slug")).toBe("intro-video");
    expect(location.searchParams.get("reason")).toBe("not_found");
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "qr_redirect_hit",
        payload: expect.objectContaining({
          slug: "intro-video",
          outcome: "fallback",
          reason: "not_found",
        }),
      })
    );
  });

  it("blocks destination host outside allowlist", async () => {
    const supabase = buildSupabaseClient({
      data: {
        slug: "intro-video",
        destination_url: "https://evil.example/phish",
      },
      error: null,
    });
    createServerSupabaseClientMock.mockResolvedValueOnce(supabase);

    const response = await GET(
      new Request("https://freeswimming.org/go/v/intro-video"),
      routeContext("intro-video")
    );
    const location = parseRedirectLocation(response);

    expect(response.status).toBe(302);
    expect(location.pathname).toBe("/go/unavailable");
    expect(location.searchParams.get("reason")).toBe("disallowed_host");
  });

  it("returns fallback when schema is not ready", async () => {
    const supabase = buildSupabaseClient({
      data: null,
      error: {
        code: "42P01",
        message: 'relation "qr_redirect_links" does not exist',
      },
    });
    createServerSupabaseClientMock.mockResolvedValueOnce(supabase);

    const response = await GET(
      new Request("https://freeswimming.org/go/v/intro-video"),
      routeContext("intro-video")
    );
    const location = parseRedirectLocation(response);

    expect(response.status).toBe(302);
    expect(location.pathname).toBe("/go/unavailable");
    expect(location.searchParams.get("reason")).toBe("schema_not_ready");
  });

  it("rejects invalid slug format before lookup", async () => {
    const response = await GET(
      new Request("https://freeswimming.org/go/v/invalid_slug"),
      routeContext("invalid_slug")
    );
    const location = parseRedirectLocation(response);

    expect(response.status).toBe(302);
    expect(location.pathname).toBe("/go/unavailable");
    expect(location.searchParams.get("reason")).toBe("invalid_slug");
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });
});
