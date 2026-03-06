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

import { DELETE, PATCH } from "@/app/api/admin/qr-links/[id]/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function contextWithId(id: string) {
  return {
    params: Promise.resolve({ id }),
  };
}

function buildPatchSupabase({
  existingData,
  existingError = null,
  updatedData,
  updateError = null,
}: {
  existingData: unknown;
  existingError?: null | { code?: string; message?: string };
  updatedData: unknown;
  updateError?: null | { code?: string; message?: string };
}) {
  const existingMaybeSingle = vi.fn().mockResolvedValue({
    data: existingData,
    error: existingError,
  });
  const existingEq = vi.fn().mockReturnValue({ maybeSingle: existingMaybeSingle });
  const existingSelect = vi.fn().mockReturnValue({ eq: existingEq });

  const updateMaybeSingle = vi.fn().mockResolvedValue({
    data: updatedData,
    error: updateError,
  });
  const updateSelect = vi.fn().mockReturnValue({ maybeSingle: updateMaybeSingle });
  const updateEq = vi.fn().mockReturnValue({ select: updateSelect });
  const update = vi.fn().mockReturnValue({ eq: updateEq });

  const from = vi
    .fn()
    .mockReturnValueOnce({ select: existingSelect })
    .mockReturnValueOnce({ update });

  return {
    from,
    existingMaybeSingle,
    existingEq,
    existingSelect,
    update,
    updateEq,
    updateSelect,
    updateMaybeSingle,
  };
}

describe("/api/admin/qr-links/[id] route", () => {
  beforeEach(() => {
    vi.stubEnv("QR_REDIRECT_ALLOWED_HOSTS", "freeswimming.org");
    trackAnalyticsEventMock.mockImplementation(() => {});
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "admin-user-id" },
      role: "admin",
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("rejects patch when id is invalid", async () => {
    const response = await PATCH(
      new Request("https://freeswimming.org/api/admin/qr-links/not-a-uuid", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "active",
        }),
      }),
      contextWithId("not-a-uuid")
    );

    const payload = (await response.json()) as { ok?: boolean; error?: string };
    expect(response.status).toBe(400);
    expect(payload.error).toBe("Invalid QR link id.");
    expect(createRouteHandlerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("returns forbidden payload when patch gate fails", async () => {
    requireAdminRoleFromSupabaseMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      error: "Forbidden.",
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: {},
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await PATCH(
      new Request(
        "https://freeswimming.org/api/admin/qr-links/123e4567-e89b-42d3-a456-426614174000",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "disabled",
          }),
        }
      ),
      contextWithId("123e4567-e89b-42d3-a456-426614174000")
    );

    const payload = (await response.json()) as { ok?: boolean; error?: string };
    expect(response.status).toBe(403);
    expect(payload.error).toBe("Forbidden.");
  });

  it("rejects patch destination outside allowlist", async () => {
    const supabase = buildPatchSupabase({
      existingData: {
        id: "123e4567-e89b-42d3-a456-426614174000",
        slug: "intro-video",
        status: "active",
      },
      updatedData: null,
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase,
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await PATCH(
      new Request(
        "https://freeswimming.org/api/admin/qr-links/123e4567-e89b-42d3-a456-426614174000",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            destinationUrl: "https://evil.example/phish",
          }),
        }
      ),
      contextWithId("123e4567-e89b-42d3-a456-426614174000")
    );

    const payload = (await response.json()) as { ok?: boolean; error?: string };
    expect(response.status).toBe(400);
    expect(payload.error).toBe("destinationUrl host is not allowlisted.");
    expect(supabase.update).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("updates qr link status and emits update + status-changed analytics events", async () => {
    const supabase = buildPatchSupabase({
      existingData: {
        id: "123e4567-e89b-42d3-a456-426614174000",
        slug: "intro-video",
        status: "active",
      },
      updatedData: {
        id: "123e4567-e89b-42d3-a456-426614174000",
        slug: "intro-video",
        destination_url: "https://freeswimming.org/course",
        status: "disabled",
        content_item_id: null,
        placement_key: "course.lesson.share",
      },
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase,
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await PATCH(
      new Request(
        "https://freeswimming.org/api/admin/qr-links/123e4567-e89b-42d3-a456-426614174000",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "disabled",
          }),
        }
      ),
      contextWithId("123e4567-e89b-42d3-a456-426614174000")
    );

    const payload = (await response.json()) as { ok?: boolean; item?: { status?: string } };
    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.item?.status).toBe("disabled");
    expect(supabase.update).toHaveBeenCalled();
    expect(trackAnalyticsEventMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        eventName: "qr_link_updated",
        userId: "admin-user-id",
        payload: expect.objectContaining({
          slug: "intro-video",
          previousStatus: "active",
          nextStatus: "disabled",
          destinationHost: "freeswimming.org",
        }),
      })
    );
    expect(trackAnalyticsEventMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        eventName: "qr_link_status_changed",
        userId: "admin-user-id",
        payload: expect.objectContaining({
          slug: "intro-video",
          previousStatus: "active",
          nextStatus: "disabled",
        }),
      })
    );
  });

  it("returns forbidden when deleting without admin permission", async () => {
    requireAdminRoleFromSupabaseMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      error: "Forbidden.",
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: {},
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await DELETE(
      new Request(
        "https://freeswimming.org/api/admin/qr-links/123e4567-e89b-42d3-a456-426614174000",
        {
          method: "DELETE",
        }
      ),
      contextWithId("123e4567-e89b-42d3-a456-426614174000")
    );
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(403);
    expect(payload.error).toBe("Forbidden.");
  });
});
