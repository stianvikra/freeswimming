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

import { POST } from "@/app/api/admin/email-templates/test-records/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

describe("/api/admin/email-templates/test-records route", () => {
  beforeEach(() => {
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "editor-user-id" },
      role: "editor",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns gate failure when requester lacks edit access", async () => {
    requireAdminRoleFromSupabaseMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      error: "Forbidden.",
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: {},
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await POST();
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(403);
    expect(payload).toMatchObject({
      ok: false,
      error: "Forbidden.",
    });
  });

  it("returns zero deleted rows when no qa/test templates are present", async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
    const orMock = vi.fn().mockReturnValue({ order: orderMock });
    const selectMock = vi.fn().mockReturnValue({ or: orMock });
    const from = vi.fn().mockReturnValue({ select: selectMock });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: {
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await POST();
    const payload = (await response.json()) as {
      ok?: boolean;
      deletedCount?: number;
      deletedIds?: string[];
      deletedTemplateKeys?: string[];
    };

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      deletedCount: 0,
      deletedIds: [],
      deletedTemplateKeys: [],
    });
    expect(orMock).toHaveBeenCalledWith(
      "template_key.ilike.e2e_admin_email_template_%,template_key.ilike.aw012_publish_fallback_%"
    );
    expect(requireAdminRoleFromSupabaseMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ minimumRole: "editor" })
    );
  });

  it("deletes explicit qa/test template rows and returns deleted metadata", async () => {
    const deleteSelectMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: "tmpl-1",
          template_key: "aw012_publish_fallback_1775443500161",
          locale: "nb-NO",
        },
        {
          id: "tmpl-2",
          template_key: "e2e_admin_email_template_preview_1775443500161",
          locale: "nb-NO",
        },
      ],
      error: null,
    });
    const inMock = vi.fn().mockReturnValue({ select: deleteSelectMock });
    const deleteMock = vi.fn().mockReturnValue({ in: inMock });
    const orderMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: "tmpl-1",
          template_key: "aw012_publish_fallback_1775443500161",
          locale: "nb-NO",
        },
        {
          id: "tmpl-2",
          template_key: "e2e_admin_email_template_preview_1775443500161",
          locale: "nb-NO",
        },
      ],
      error: null,
      count: 2,
    });
    const orMock = vi.fn().mockReturnValue({ order: orderMock });
    const selectMock = vi.fn().mockReturnValue({ or: orMock });
    const from = vi
      .fn()
      .mockReturnValueOnce({ select: selectMock })
      .mockReturnValueOnce({ delete: deleteMock });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: {
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await POST();
    const payload = (await response.json()) as {
      ok?: boolean;
      deletedCount?: number;
      deletedIds?: string[];
      deletedTemplateKeys?: string[];
    };

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      deletedCount: 2,
      deletedIds: ["tmpl-1", "tmpl-2"],
      deletedTemplateKeys: [
        "aw012_publish_fallback_1775443500161",
        "e2e_admin_email_template_preview_1775443500161",
      ],
    });
    expect(inMock).toHaveBeenCalledWith("id", ["tmpl-1", "tmpl-2"]);
  });

  it("refuses cleanup when candidate count exceeds the safety limit", async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: Array.from({ length: 501 }, (_, index) => ({
        id: `tmpl-${index}`,
        template_key: `aw012_publish_fallback_${index}`,
        locale: "nb-NO",
      })),
      error: null,
      count: 501,
    });
    const orMock = vi.fn().mockReturnValue({ order: orderMock });
    const selectMock = vi.fn().mockReturnValue({ or: orMock });
    const from = vi.fn().mockReturnValue({ select: selectMock });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: {
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await POST();
    const payload = (await response.json()) as {
      ok?: boolean;
      error?: string;
      candidateCount?: number;
    };

    expect(response.status).toBe(409);
    expect(payload).toMatchObject({
      ok: false,
      error: "Refusing bulk cleanup because candidate count exceeds the safety limit.",
      candidateCount: 501,
    });
  });
});
