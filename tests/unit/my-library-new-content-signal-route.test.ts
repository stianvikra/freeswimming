import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadCourseModulesByStatusMock, createRouteHandlerSupabaseClientMock } = vi.hoisted(() => {
  return {
    loadCourseModulesByStatusMock: vi.fn(),
    createRouteHandlerSupabaseClientMock: vi.fn(),
  };
});

vi.mock("@/lib/admin/content-course", () => ({
  loadCourseModulesByStatus: loadCourseModulesByStatusMock,
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

import { GET } from "@/app/api/my-library/new-content-signal/route";

function buildSupabaseClient(userId: string | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: userId ? { id: userId } : null,
        },
        error: null,
      }),
    },
  };
}

describe("/api/my-library/new-content-signal route", () => {
  beforeEach(() => {
    loadCourseModulesByStatusMock.mockResolvedValue([
      {
        id: "mod1",
        title: "Intro",
        lessons: [
          {
            id: "mod1-l1",
            title: "Lesson 1",
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
    ]);
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: buildSupabaseClient("user-1"),
      applySupabaseCookies: <T>(response: T) => response,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized for non-authenticated requests", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: buildSupabaseClient(null),
      applySupabaseCookies: <T>(response: T) => response,
    });

    const response = await GET();
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(401);
    expect(payload).toMatchObject({
      ok: false,
      error: "Unauthorized.",
    });
  });

  it("returns published-course signal for authenticated user", async () => {
    const response = await GET();
    const payload = (await response.json()) as {
      ok?: boolean;
      signal?: {
        signature?: string;
        lessonCount?: number;
        firstLessonId?: string | null;
      };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.signal?.lessonCount).toBe(1);
    expect(payload.signal?.firstLessonId).toBe("mod1-l1");
    expect(payload.signal?.signature?.startsWith("v1:")).toBe(true);
    expect(loadCourseModulesByStatusMock).toHaveBeenCalledWith({
      statuses: ["published"],
      fallback: [],
      autoSeedWhenEmpty: true,
    });
  });

  it("returns 500 when auth lookup fails unexpectedly", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "boom", status: 500 },
          }),
        },
      },
      applySupabaseCookies: <T>(response: T) => response,
    });

    const response = await GET();
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(500);
    expect(payload).toMatchObject({
      ok: false,
      error: "Could not verify session.",
    });
  });
});
