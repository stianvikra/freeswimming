import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createRouteHandlerSupabaseClientMock,
  requireAdminRoleFromSupabaseMock,
  trackAnalyticsEventMock,
} = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
  requireAdminRoleFromSupabaseMock: vi.fn(),
  trackAnalyticsEventMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/admin/server", () => ({
  requireAdminRoleFromSupabase: requireAdminRoleFromSupabaseMock,
}));

vi.mock("@/lib/analytics/events", () => ({
  trackAnalyticsEvent: trackAnalyticsEventMock,
}));

import { GET, POST } from "@/app/api/admin/qr-links/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildGetSupabase({
  data,
  error,
}: {
  data: unknown[];
  error: null | { code?: string; message?: string };
}) {
  const limit = vi.fn().mockResolvedValue({ data, error });
  const order = vi.fn().mockReturnValue({ limit });
  const select = vi.fn().mockReturnValue({ order });
  const from = vi.fn().mockReturnValue({ select });
  return { from, select, order, limit };
}

function buildPostSupabase({
  data,
  error,
}: {
  data: unknown;
  error: null | { code?: string; message?: string };
}) {
  const single = vi.fn().mockResolvedValue({ data, error });
  const select = vi.fn().mockReturnValue({ single });
  const insert = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ insert });
  return { from, insert, select, single };
}

describe("/api/admin/qr-links route", () => {
  beforeEach(() => {
    trackAnalyticsEventMock.mockImplementation(() => {});
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "admin-user-id" },
      role: "admin",
    });
    vi.stubEnv("QR_REDIRECT_ALLOWED_HOSTS", "freeswimming.org,www.freeswimming.org");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("returns unauthorized payload when admin gate fails", async () => {
    requireAdminRoleFromSupabaseMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      error: "Forbidden.",
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: {},
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await GET();
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(403);
    expect(payload).toMatchObject({
      ok: false,
      error: "Forbidden.",
    });
  });

  it("returns qr links list for authorized admin", async () => {
    const supabase = buildGetSupabase({
      data: [
        {
          id: "123e4567-e89b-42d3-a456-426614174000",
          slug: "intro-video",
          destination_url: "https://freeswimming.org/course",
          status: "active",
        },
      ],
      error: null,
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase,
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await GET();
    const payload = (await response.json()) as {
      ok?: boolean;
      items?: Array<{ slug?: string }>;
      schemaReady?: boolean;
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.schemaReady).toBe(true);
    expect(payload.items?.[0]?.slug).toBe("intro-video");
  });

  it("rejects create with disallowed destination host", async () => {
    const supabase = buildPostSupabase({
      data: null,
      error: null,
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase,
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await POST(
      new Request("https://freeswimming.org/api/admin/qr-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: "intro-video",
          destinationUrl: "https://evil.example/phish",
          status: "active",
        }),
      })
    );
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(payload).toMatchObject({
      ok: false,
      error: "destinationUrl host is not allowlisted.",
    });
    expect(supabase.insert).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("creates qr link for valid payload", async () => {
    const supabase = buildPostSupabase({
      data: {
        id: "123e4567-e89b-42d3-a456-426614174000",
        slug: "intro-video",
        destination_url: "https://freeswimming.org/course",
        status: "active",
      },
      error: null,
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase,
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await POST(
      new Request("https://freeswimming.org/api/admin/qr-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: "intro-video",
          destinationUrl: "https://freeswimming.org/course",
          status: "active",
          placementKey: "course.support-card",
        }),
      })
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      item?: { slug?: string; status?: string };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.item).toMatchObject({
      slug: "intro-video",
      status: "active",
    });
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "qr_link_created",
        userId: "admin-user-id",
        payload: expect.objectContaining({
          slug: "intro-video",
          status: "active",
          destinationHost: "freeswimming.org",
        }),
      })
    );
  });
});
