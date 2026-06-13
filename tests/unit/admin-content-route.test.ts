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

function buildInsertChain(data: unknown, error: null | { code?: string; message?: string } = null) {
  const single = vi.fn().mockResolvedValue({ data, error });
  const select = vi.fn().mockReturnValue({ single });
  return {
    insert: vi.fn().mockReturnValue({ select }),
    select,
    single,
  };
}

function buildAdminContentSupabase(params: {
  insertData: unknown;
  courseRows?: unknown[];
  guideRows?: unknown[];
  parentRow?: unknown | null;
}) {
  const insertChain = buildInsertChain(params.insertData);
  const maybeSingle = vi.fn().mockResolvedValue({
    data: params.parentRow ?? null,
    error: null,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const inFn = vi.fn().mockResolvedValue({
    data: params.courseRows ?? [],
    error: null,
  });
  const adminSelect = vi.fn((fields: string) => {
    if (fields === "id, content_type, slug, body, parent_id") {
      return {
        eq,
        in: inFn,
      };
    }

    if (fields === "slug, body, sort_order") {
      return {
        eq: vi.fn().mockResolvedValue({
          data: params.guideRows ?? [],
          error: null,
        }),
      };
    }

    return { single: insertChain.single };
  });

  const from = vi.fn((table: string) => {
    if (table !== "admin_content_items") {
      throw new Error(`Unexpected table ${table}`);
    }

    return {
      select: adminSelect,
      insert: insertChain.insert,
    };
  });

  return {
    from,
    adminSelect,
    eq,
    maybeSingle,
    inFn,
    insert: insertChain.insert,
  };
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

  it("assigns the next course-module sort order and runtime id when omitted", async () => {
    const supabase = buildAdminContentSupabase({
      insertData: {
        id: "module-1",
        content_type: "course_module",
        parent_id: null,
        slug: "breathing-and-floating",
        title: "Breathing and Floating",
        summary: "Created by test",
        category: "General",
        body: {
          moduleId: "breathing-and-floating",
        },
        sort_order: 12,
        status: "draft",
      },
      courseRows: [
        {
          id: "existing-module",
          content_type: "course_module",
          parent_id: null,
          slug: "course-module-introduction-to-the-course",
          body: {
            moduleId: "intro-course",
          },
        },
      ],
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase,
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
          title: "Breathing and Floating",
          slug: "breathing-and-floating",
          summary: "Created by test",
          status: "draft",
        }),
      })
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      item?: { sort_order?: number; body?: { moduleId?: string } };
    };

    expect(response.status).toBe(201);
    expect(payload.ok).toBe(true);
    expect(resolveNextCourseStructureSortOrderMock).toHaveBeenCalledWith({
      supabase: expect.anything(),
      contentType: "course_module",
      parentId: null,
    });
    expect(supabase.inFn).toHaveBeenCalledWith("content_type", ["course_module", "course_lesson"]);
    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        sort_order: 12,
        body: expect.objectContaining({
          moduleId: "breathing-and-floating",
        }),
      })
    );
  });

  it("keeps an explicit sortOrder without resolving course structure defaults", async () => {
    const supabase = buildAdminContentSupabase({
      insertData: {
        id: "module-2",
        content_type: "course_module",
        parent_id: null,
        slug: "e2e-admin-content-module-2",
        title: "E2E module explicit order",
        summary: "Created by test",
        category: "General",
        body: {
          moduleId: "e2e-admin-content-module-2",
        },
        sort_order: 4,
        status: "draft",
      },
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase,
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
    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        sort_order: 4,
      })
    );
  });

  it("requires a valid course-module parent when creating a lesson", async () => {
    const supabase = buildAdminContentSupabase({
      insertData: null,
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase,
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await POST(
      new Request("http://127.0.0.1:3000/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: "course_lesson",
          title: "Breathing setup",
          slug: "breathing-setup",
          summary: "Created by test",
          status: "draft",
        }),
      })
    );
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toMatch(/parent module/i);
    expect(supabase.insert).not.toHaveBeenCalled();
  });

  it("assigns lesson runtime ids and module linkage from the selected parent module", async () => {
    const parentModuleId = "123e4567-e89b-42d3-a456-426614174000";
    const supabase = buildAdminContentSupabase({
      insertData: {
        id: "lesson-1",
        content_type: "course_lesson",
        parent_id: parentModuleId,
        slug: "breathing-and-floating-first-breaths",
        title: "First breaths",
        summary: "Created by test",
        category: "Course lessons",
        body: {
          moduleId: "breathing-and-floating",
          lessonId: "breathing-and-floating--first-breaths",
        },
        sort_order: 12,
        status: "draft",
      },
      courseRows: [
        {
          id: parentModuleId,
          content_type: "course_module",
          parent_id: null,
          slug: "breathing-and-floating",
          body: {
            moduleId: "breathing-and-floating",
          },
        },
        {
          id: "existing-lesson",
          content_type: "course_lesson",
          parent_id: parentModuleId,
          slug: "breathing-and-floating-glide",
          body: {
            moduleId: "breathing-and-floating",
            lessonId: "breathing-and-floating--glide",
          },
        },
      ],
      parentRow: {
        id: parentModuleId,
        content_type: "course_module",
        parent_id: null,
        slug: "breathing-and-floating",
        body: {
          moduleId: "breathing-and-floating",
        },
      },
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase,
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await POST(
      new Request("http://127.0.0.1:3000/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: "course_lesson",
          title: "First breaths",
          slug: "first-breaths",
          summary: "Created by test",
          status: "draft",
          parentId: parentModuleId,
        }),
      })
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      item?: { body?: { lessonId?: string; moduleId?: string } };
    };

    expect(response.status).toBe(201);
    expect(payload.ok).toBe(true);
    expect(resolveNextCourseStructureSortOrderMock).toHaveBeenCalledWith({
      supabase: expect.anything(),
      contentType: "course_lesson",
      parentId: parentModuleId,
    });
    expect(supabase.eq).toHaveBeenCalledWith("id", parentModuleId);
    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        parent_id: parentModuleId,
        body: expect.objectContaining({
          moduleId: "breathing-and-floating",
          lessonId: "breathing-and-floating--first-breaths",
        }),
      })
    );
  });

  it("rejects lesson experience corrections without matching mistakes on create", async () => {
    const parentModuleId = "123e4567-e89b-42d3-a456-426614174000";
    const supabase = buildAdminContentSupabase({
      insertData: null,
      courseRows: [
        {
          id: parentModuleId,
          content_type: "course_module",
          parent_id: null,
          slug: "breathing-and-floating",
          body: {
            moduleId: "breathing-and-floating",
          },
        },
      ],
      parentRow: {
        id: parentModuleId,
        content_type: "course_module",
        parent_id: null,
        slug: "breathing-and-floating",
        body: {
          moduleId: "breathing-and-floating",
        },
      },
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase,
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await POST(
      new Request("http://127.0.0.1:3000/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: "course_lesson",
          title: "First breaths",
          slug: "first-breaths",
          summary: "Created by test",
          status: "draft",
          parentId: parentModuleId,
          body: {
            lessonExperience: {
              commonMistakes: [{ fix: "Look down before breathing." }],
            },
          },
        }),
      })
    );
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Lesson experience correction requires a matching mistake.");
    expect(supabase.insert).not.toHaveBeenCalled();
  });

  it("rejects invalid lesson experience layout variants on create", async () => {
    const parentModuleId = "11111111-1111-4111-8111-111111111111";
    const supabase = buildAdminContentSupabase({
      insertData: null,
      parentRow: {
        id: parentModuleId,
        content_type: "course_module",
        parent_id: null,
        slug: "body-position",
        body: { moduleId: "body-position" },
      },
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase,
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await POST(
      new Request("http://127.0.0.1:3000/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: "course_lesson",
          title: "First breaths",
          slug: "first-breaths",
          summary: "Created by test",
          status: "draft",
          parentId: parentModuleId,
          body: {
            lessonExperience: {
              variant: "video",
            },
          },
        }),
      })
    );
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Lesson experience variant is invalid.");
    expect(supabase.insert).not.toHaveBeenCalled();
  });

  it("assigns guide runtime ids and next sort order when a guide session payload omits them", async () => {
    const supabase = buildAdminContentSupabase({
      insertData: {
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
      guideRows: [
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
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase,
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
    expect(supabase.adminSelect).toHaveBeenCalledWith("slug, body, sort_order");
    expect(supabase.insert).toHaveBeenCalledWith(
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
