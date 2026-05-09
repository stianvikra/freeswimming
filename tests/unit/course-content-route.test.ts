import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  loadCourseModulesByStatusMock,
  loadPublishedCourseModulesCachedMock,
  requireAdminRoleFromSupabaseMock,
  createRouteHandlerSupabaseClientMock,
} = vi.hoisted(() => {
  return {
    loadCourseModulesByStatusMock: vi.fn(),
    loadPublishedCourseModulesCachedMock: vi.fn(),
    requireAdminRoleFromSupabaseMock: vi.fn(),
    createRouteHandlerSupabaseClientMock: vi.fn(),
  };
});

vi.mock("@/lib/admin/content-course", () => ({
  loadCourseModulesByStatus: loadCourseModulesByStatusMock,
  loadPublishedCourseModulesCached: loadPublishedCourseModulesCachedMock,
  PUBLIC_COURSE_CONTENT_REVALIDATE_SECONDS: 3600,
}));

vi.mock("@/lib/admin/server", () => ({
  requireAdminRoleFromSupabase: requireAdminRoleFromSupabaseMock,
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

import { GET } from "@/app/api/course/content/route";

function buildRequest(path: string): Request {
  return new Request(`http://127.0.0.1:3000${path}`);
}

describe("/api/course/content route", () => {
  beforeEach(() => {
    const courseModules = [
      {
        id: "mod1",
        title: "Intro",
        lessons: [
          {
            id: "mod1-l1",
            title: "Lesson",
            youtubeId: "abc123",
            goal: "Goal",
            cues: ["Cue"],
            drill: {
              title: "Drill",
              steps: ["Step"],
            },
            nextStep: "Next",
          },
        ],
      },
    ];
    loadCourseModulesByStatusMock.mockResolvedValue(courseModules);
    loadPublishedCourseModulesCachedMock.mockResolvedValue(courseModules);

    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "user-1" },
      role: "admin",
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {},
      applySupabaseCookies: <T>(response: T) => response,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns published learner content by default", async () => {
    const response = await GET(buildRequest("/api/course/content"));
    const payload = (await response.json()) as {
      ok?: boolean;
      preview?: { enabled?: boolean; mode?: string };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.preview).toEqual({
      enabled: false,
      mode: "published",
    });
    expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
    expect(loadPublishedCourseModulesCachedMock).toHaveBeenCalledTimes(1);
    expect(loadCourseModulesByStatusMock).not.toHaveBeenCalled();
    expect(requireAdminRoleFromSupabaseMock).not.toHaveBeenCalled();
  });

  it("rejects previewMode without explicit preview flag", async () => {
    const response = await GET(buildRequest("/api/course/content?previewMode=draft"));
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(payload).toMatchObject({
      ok: false,
      error: "previewMode requires preview=1.",
    });
  });

  it("returns forbidden for unauthorized preview requests", async () => {
    requireAdminRoleFromSupabaseMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      error: "Forbidden.",
    });

    const response = await GET(buildRequest("/api/course/content?preview=1&previewMode=draft"));
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(403);
    expect(payload).toMatchObject({
      ok: false,
      error: "Forbidden.",
    });
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow, noarchive");
  });

  it("returns admin preview content with noindex headers", async () => {
    const response = await GET(buildRequest("/api/course/content?preview=1&previewMode=review"));
    const payload = (await response.json()) as {
      ok?: boolean;
      preview?: { enabled?: boolean; mode?: string; statuses?: string[] };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.preview).toEqual({
      enabled: true,
      mode: "review",
      statuses: ["review"],
    });
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow, noarchive");
    expect(loadCourseModulesByStatusMock).toHaveBeenCalledWith({
      statuses: ["review"],
      fallback: [],
      autoSeedWhenEmpty: false,
    });
  });
});
