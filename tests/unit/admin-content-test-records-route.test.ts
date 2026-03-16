import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createRouteHandlerSupabaseClientMock,
  requireAdminRoleFromSupabaseMock,
  normalizeCourseStructureSortOrdersMock,
} = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
  requireAdminRoleFromSupabaseMock: vi.fn(),
  normalizeCourseStructureSortOrdersMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/admin/server", () => ({
  requireAdminRoleFromSupabase: requireAdminRoleFromSupabaseMock,
}));

vi.mock("@/lib/admin/course-structure-sync", () => ({
  normalizeCourseStructureSortOrders: normalizeCourseStructureSortOrdersMock,
}));

import { POST } from "@/app/api/admin/content/test-records/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

describe("/api/admin/content/test-records route", () => {
  beforeEach(() => {
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "admin-user-id" },
      role: "admin",
    });
    normalizeCourseStructureSortOrdersMock.mockResolvedValue({
      ok: true,
      integrity: {
        unlinkedLessonCount: 0,
        duplicateModuleSortOrderCount: 0,
        duplicateLessonSortGroupCount: 0,
        duplicateLessonSortEntryCount: 0,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns admin gate failure when requester is not admin", async () => {
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

  it("returns zero deleted rows when no qa/test records are present", async () => {
    const ilike = vi.fn().mockResolvedValue({ data: [], error: null });
    const select = vi.fn().mockReturnValue({ ilike });
    const from = vi.fn().mockReturnValue({ select });

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
      deletedSlugs?: string[];
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      deletedCount: 0,
      deletedIds: [],
      deletedSlugs: [],
      normalizedCourseStructure: true,
      warning: null,
    });
    expect(ilike).toHaveBeenCalledWith("slug", "e2e-admin-content-%");
    expect(requireAdminRoleFromSupabaseMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ minimumRole: "admin" })
    );
    expect(normalizeCourseStructureSortOrdersMock).not.toHaveBeenCalled();
  });

  it("deletes explicit qa/test records and returns deleted metadata", async () => {
    const deleteSelect = vi.fn().mockResolvedValue({
      data: [
        {
          id: "qa-1",
          slug: "e2e-admin-content-111",
          content_type: "course_module",
        },
        {
          id: "qa-2",
          slug: "e2e-admin-content-222",
          content_type: "course_lesson",
        },
      ],
      error: null,
    });
    const inMock = vi.fn().mockReturnValue({ select: deleteSelect });
    const deleteMock = vi.fn().mockReturnValue({ in: inMock });
    const ilikeMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: "qa-1",
          slug: "e2e-admin-content-111",
          content_type: "course_module",
        },
        {
          id: "qa-2",
          slug: "e2e-admin-content-222",
          content_type: "course_lesson",
        },
      ],
      error: null,
    });
    const selectMock = vi.fn().mockReturnValue({
      ilike: ilikeMock,
      delete: deleteMock,
    });
    const from = vi.fn().mockReturnValue({
      select: selectMock,
      delete: deleteMock,
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
      deletedSlugs?: string[];
    };

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      deletedCount: 2,
      deletedIds: ["qa-1", "qa-2"],
      deletedSlugs: ["e2e-admin-content-111", "e2e-admin-content-222"],
      normalizedCourseStructure: true,
      warning: null,
      integrity: {
        unlinkedLessonCount: 0,
        duplicateModuleSortOrderCount: 0,
        duplicateLessonSortGroupCount: 0,
        duplicateLessonSortEntryCount: 0,
      },
    });
    expect(ilikeMock).toHaveBeenCalledWith("slug", "e2e-admin-content-%");
    expect(inMock).toHaveBeenCalledWith("id", ["qa-1", "qa-2"]);
    expect(normalizeCourseStructureSortOrdersMock).toHaveBeenCalledWith({
      supabase: expect.anything(),
      actorUserId: "admin-user-id",
    });
  });

  it("returns a warning when qa/test deletion succeeds but normalization fails", async () => {
    normalizeCourseStructureSortOrdersMock.mockResolvedValueOnce({
      ok: false,
      error: { message: "normalize failed" },
    });

    const deleteSelect = vi.fn().mockResolvedValue({
      data: [
        {
          id: "qa-1",
          slug: "e2e-admin-content-111",
          content_type: "course_module",
        },
      ],
      error: null,
    });
    const inMock = vi.fn().mockReturnValue({ select: deleteSelect });
    const deleteMock = vi.fn().mockReturnValue({ in: inMock });
    const ilikeMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: "qa-1",
          slug: "e2e-admin-content-111",
          content_type: "course_module",
        },
      ],
      error: null,
    });
    const selectMock = vi.fn().mockReturnValue({
      ilike: ilikeMock,
      delete: deleteMock,
    });
    const from = vi.fn().mockReturnValue({
      select: selectMock,
      delete: deleteMock,
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
      normalizedCourseStructure?: boolean;
      warning?: string | null;
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      deletedCount: 1,
      normalizedCourseStructure: false,
      warning: "QA/test records were deleted, but course order normalization failed.",
    });
  });
});
