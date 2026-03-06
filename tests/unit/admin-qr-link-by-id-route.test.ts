import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock, requireAdminRoleFromSupabaseMock } = vi.hoisted(
  () => ({
    createRouteHandlerSupabaseClientMock: vi.fn(),
    requireAdminRoleFromSupabaseMock: vi.fn(),
  })
);

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/admin/server", () => ({
  requireAdminRoleFromSupabase: requireAdminRoleFromSupabaseMock,
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

describe("/api/admin/qr-links/[id] route", () => {
  beforeEach(() => {
    vi.stubEnv("QR_REDIRECT_ALLOWED_HOSTS", "freeswimming.org");
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

  it("updates qr link status for valid patch request", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "123e4567-e89b-42d3-a456-426614174000",
        slug: "intro-video",
        destination_url: "https://freeswimming.org/course",
        status: "disabled",
      },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ maybeSingle });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ update });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: { from },
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
    expect(update).toHaveBeenCalled();
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
