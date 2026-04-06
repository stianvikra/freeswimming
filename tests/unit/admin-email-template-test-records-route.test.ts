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
    const templateOrderMock = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
    const templateOrMock = vi.fn().mockReturnValue({ order: templateOrderMock });
    const templateSelectMock = vi.fn().mockReturnValue({ or: templateOrMock });

    const revisionOrderMock = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
    const revisionOrMock = vi.fn().mockReturnValue({ order: revisionOrderMock });
    const revisionSelectMock = vi.fn().mockReturnValue({ or: revisionOrMock });

    const from = vi.fn((table: string) => {
      if (table === "admin_email_templates") {
        return { select: templateSelectMock };
      }

      if (table === "admin_email_template_revisions") {
        return { select: revisionSelectMock };
      }

      throw new Error(`Unexpected table ${table}`);
    });

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
      deletedRevisionCount?: number;
      deletedRevisionIds?: string[];
    };

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      deletedCount: 0,
      deletedIds: [],
      deletedTemplateKeys: [],
      deletedRevisionCount: 0,
      deletedRevisionIds: [],
    });
    expect(templateOrMock).toHaveBeenCalledWith(
      "template_key.ilike.e2e_admin_email_template_%,template_key.ilike.aw012_publish_fallback_%"
    );
    expect(revisionOrMock).toHaveBeenCalledWith(
      "template_key.ilike.e2e_admin_email_template_%,template_key.ilike.aw012_publish_fallback_%"
    );
    expect(requireAdminRoleFromSupabaseMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ minimumRole: "editor" })
    );
  });

  it("deletes explicit qa/test template rows and returns deleted metadata", async () => {
    const deleteRevisionRows = [
      {
        id: "rev-1",
        template_id: "tmpl-1",
        template_key: "aw012_publish_fallback_1775443500161",
        locale: "nb-NO",
      },
      {
        id: "rev-2",
        template_id: "tmpl-2",
        template_key: "e2e_admin_email_template_preview_1775443500161",
        locale: "nb-NO",
      },
    ];
    const postDeleteRevisionRows = [
      {
        id: "rev-3",
        template_id: "tmpl-1",
        template_key: "aw012_publish_fallback_1775443500161",
        locale: "nb-NO",
      },
      {
        id: "rev-4",
        template_id: "tmpl-2",
        template_key: "e2e_admin_email_template_preview_1775443500161",
        locale: "nb-NO",
      },
    ];
    const deleteRevisionSelectMock = vi
      .fn()
      .mockResolvedValueOnce({ data: deleteRevisionRows, error: null })
      .mockResolvedValueOnce({ data: postDeleteRevisionRows, error: null });
    const deleteRevisionInMock = vi
      .fn()
      .mockReturnValueOnce({ select: deleteRevisionSelectMock })
      .mockReturnValueOnce({ select: deleteRevisionSelectMock });
    const deleteRevisionMock = vi.fn().mockReturnValue({ in: deleteRevisionInMock });

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
    const templateOrderMock = vi.fn().mockResolvedValue({
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
    const templateOrMock = vi.fn().mockReturnValue({ order: templateOrderMock });
    const templateSelectMock = vi.fn().mockReturnValue({ or: templateOrMock });

    const revisionOrderMock = vi.fn().mockResolvedValue({
      data: deleteRevisionRows,
      error: null,
      count: 2,
    });
    const revisionOrMock = vi.fn().mockReturnValue({ order: revisionOrderMock });
    const revisionSelectMock = vi.fn().mockReturnValue({ or: revisionOrMock });

    const from = vi.fn((table: string) => {
      if (table === "admin_email_templates") {
        return {
          select: templateSelectMock,
          delete: deleteMock,
        };
      }

      if (table === "admin_email_template_revisions") {
        return {
          select: revisionSelectMock,
          delete: deleteRevisionMock,
        };
      }

      throw new Error(`Unexpected table ${table}`);
    });

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
      deletedRevisionCount?: number;
      deletedRevisionIds?: string[];
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
      deletedRevisionCount: 4,
      deletedRevisionIds: ["rev-1", "rev-2", "rev-3", "rev-4"],
    });
    expect(inMock).toHaveBeenCalledWith("id", ["tmpl-1", "tmpl-2"]);
    expect(deleteRevisionInMock).toHaveBeenNthCalledWith(1, "id", ["rev-1", "rev-2"]);
    expect(deleteRevisionInMock).toHaveBeenNthCalledWith(2, "template_id", [
      "tmpl-1",
      "tmpl-2",
    ]);
  });

  it("deletes orphaned qa/test revisions even when no live templates remain", async () => {
    const templateOrderMock = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
    const templateOrMock = vi.fn().mockReturnValue({ order: templateOrderMock });
    const templateSelectMock = vi.fn().mockReturnValue({ or: templateOrMock });
    const deleteTemplateMock = vi.fn();

    const revisionDeleteRows = [
      {
        id: "rev-orphan-1",
        template_id: "tmpl-orphan-1",
        template_key: "aw012_publish_fallback_1775443500161",
        locale: "nb-NO",
      },
    ];
    const revisionOrderMock = vi.fn().mockResolvedValue({
      data: revisionDeleteRows,
      error: null,
      count: 1,
    });
    const revisionOrMock = vi.fn().mockReturnValue({ order: revisionOrderMock });
    const revisionSelectMock = vi.fn().mockReturnValue({ or: revisionOrMock });
    const revisionDeleteSelectMock = vi.fn().mockResolvedValue({
      data: revisionDeleteRows,
      error: null,
    });
    const revisionDeleteInMock = vi.fn().mockReturnValue({ select: revisionDeleteSelectMock });
    const revisionDeleteMock = vi.fn().mockReturnValue({ in: revisionDeleteInMock });

    const from = vi.fn((table: string) => {
      if (table === "admin_email_templates") {
        return {
          select: templateSelectMock,
          delete: deleteTemplateMock,
        };
      }

      if (table === "admin_email_template_revisions") {
        return {
          select: revisionSelectMock,
          delete: revisionDeleteMock,
        };
      }

      throw new Error(`Unexpected table ${table}`);
    });

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
      deletedRevisionCount?: number;
      deletedRevisionIds?: string[];
    };

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      deletedCount: 0,
      deletedIds: [],
      deletedTemplateKeys: [],
      deletedRevisionCount: 1,
      deletedRevisionIds: ["rev-orphan-1"],
    });
    expect(deleteTemplateMock).not.toHaveBeenCalled();
    expect(revisionDeleteInMock).toHaveBeenCalledWith("id", ["rev-orphan-1"]);
  });

  it("refuses cleanup when candidate count exceeds the safety limit", async () => {
    const templateOrderMock = vi.fn().mockResolvedValue({
      data: Array.from({ length: 501 }, (_, index) => ({
        id: `tmpl-${index}`,
        template_key: `aw012_publish_fallback_${index}`,
        locale: "nb-NO",
      })),
      error: null,
      count: 501,
    });
    const templateOrMock = vi.fn().mockReturnValue({ order: templateOrderMock });
    const templateSelectMock = vi.fn().mockReturnValue({ or: templateOrMock });

    const revisionOrderMock = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
    const revisionOrMock = vi.fn().mockReturnValue({ order: revisionOrderMock });
    const revisionSelectMock = vi.fn().mockReturnValue({ or: revisionOrMock });

    const from = vi.fn((table: string) => {
      if (table === "admin_email_templates") {
        return { select: templateSelectMock };
      }

      if (table === "admin_email_template_revisions") {
        return { select: revisionSelectMock };
      }

      throw new Error(`Unexpected table ${table}`);
    });

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
