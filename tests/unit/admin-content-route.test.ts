import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createRouteHandlerSupabaseClientMock,
  requireAdminRoleFromSupabaseMock,
  resolveNextCourseStructureSortOrderMock,
} = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
  requireAdminRoleFromSupabaseMock: vi.fn(),
  resolveNextCourseStructureSortOrderMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/admin/server", () => ({
  requireAdminRoleFromSupabase: requireAdminRoleFromSupabaseMock,
}));

vi.mock("@/lib/admin/course-structure-sync", () => ({
  resolveNextCourseStructureSortOrder: resolveNextCourseStructureSortOrderMock,
}));

import { POST } from "@/app/api/admin/content/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

describe("/api/admin/content route", () => {
  beforeEach(() => {
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "admin-user-id" },
      role: "admin",
    });
    resolveNextCourseStructureSortOrderMock.mockResolvedValue({
      ok: true,
      sortOrder: 12,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("assigns the next course-module sort order when the payload omits it", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: "module-1",
        content_type: "course_module",
        parent_id: null,
        slug: "e2e-admin-content-module-1",
        title: "E2E module",
        summary: "Created by test",
        category: "General",
        body: {},
        sort_order: 12,
        status: "draft",
      },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: {
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await POST(
      new Request("http://127.0.0.1:3000/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: "course_module",
          title: "E2E module",
          slug: "e2e-admin-content-module-1",
          summary: "Created by test",
          status: "draft",
        }),
      })
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      item?: { sort_order?: number };
    };

    expect(response.status).toBe(201);
    expect(payload.ok).toBe(true);
    expect(resolveNextCourseStructureSortOrderMock).toHaveBeenCalledWith({
      supabase: expect.anything(),
      contentType: "course_module",
      parentId: null,
    });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        sort_order: 12,
      })
    );
  });

  it("keeps an explicit sortOrder without resolving course structure defaults", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: "module-2",
        content_type: "course_module",
        parent_id: null,
        slug: "e2e-admin-content-module-2",
        title: "E2E module explicit order",
        summary: "Created by test",
        category: "General",
        body: {},
        sort_order: 4,
        status: "draft",
      },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: {
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await POST(
      new Request("http://127.0.0.1:3000/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: "course_module",
          title: "E2E module explicit order",
          slug: "e2e-admin-content-module-2",
          summary: "Created by test",
          status: "draft",
          sortOrder: 4,
        }),
      })
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      item?: { sort_order?: number };
    };

    expect(response.status).toBe(201);
    expect(payload.ok).toBe(true);
    expect(resolveNextCourseStructureSortOrderMock).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        sort_order: 4,
      })
    );
  });
});
