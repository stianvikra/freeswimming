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

  it("assigns guide runtime ids and next sort order when a guide session payload omits them", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: "guide-session-21",
        content_type: "guide_session",
        parent_id: null,
        slug: "new-guide-session",
        title: "New guide session",
        summary: "Created by test",
        category: "Guide sessions",
        body: {
          guideSlug: "0-1000m",
          sessionId: "S21",
        },
        sort_order: 20,
        status: "draft",
      },
      error: null,
    });
    const insert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ single }),
    });

    const guideEq = vi.fn().mockResolvedValue({
      data: [
        {
          slug: "guide-0-1000m-session-s19",
          body: {
            guideSlug: "0-1000m",
            sessionId: "S19",
          },
          sort_order: 18,
        },
        {
          slug: "guide-0-1000m-session-s20",
          body: {
            guideSlug: "0-1000m",
            sessionId: "S20",
          },
          sort_order: 19,
        },
      ],
      error: null,
    });
    const select = vi.fn().mockReturnValue({
      eq: guideEq,
    });

    const from = vi.fn((table: string) => {
      if (table === "admin_content_items") {
        return {
          select,
          insert,
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

    const response = await POST(
      new Request("http://127.0.0.1:3000/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: "guide_session",
          title: "New guide session",
          slug: "new-guide-session",
          summary: "Created by test",
          status: "draft",
        }),
      })
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      item?: { sort_order?: number; body?: { sessionId?: string } };
    };

    expect(response.status).toBe(201);
    expect(payload.ok).toBe(true);
    expect(resolveNextCourseStructureSortOrderMock).not.toHaveBeenCalled();
    expect(select).toHaveBeenCalledWith("slug, body, sort_order");
    expect(guideEq).toHaveBeenCalledWith("content_type", "guide_session");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        sort_order: 20,
        body: expect.objectContaining({
          guideSlug: "0-1000m",
          sessionId: "S21",
        }),
      })
    );
  });
});
