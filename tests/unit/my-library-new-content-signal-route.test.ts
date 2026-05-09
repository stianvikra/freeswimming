import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadPublishedCourseModulesCachedMock, createRouteHandlerSupabaseClientMock } = vi.hoisted(
  () => {
    return {
      loadPublishedCourseModulesCachedMock: vi.fn(),
      createRouteHandlerSupabaseClientMock: vi.fn(),
    };
  }
);

vi.mock("@/lib/admin/content-course", () => ({
  loadPublishedCourseModulesCached: loadPublishedCourseModulesCachedMock,
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

import { GET } from "@/app/api/my-library/new-content-signal/route";

function buildSupabaseClient(userId: string | null) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: null,
    error: null,
  });
  const eq = vi.fn(() => ({
    maybeSingle,
  }));
  const select = vi.fn(() => ({
    eq,
  }));

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: userId ? { id: userId, created_at: "2026-03-01T08:00:00.000Z" } : null,
        },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      if (table !== "athlete_profiles") {
        throw new Error(`Unexpected table lookup: ${table}`);
      }
      return {
        select,
      };
    }),
  };
}

describe("/api/my-library/new-content-signal route", () => {
  beforeEach(() => {
    loadPublishedCourseModulesCachedMock.mockResolvedValue([
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
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: {
        ...buildSupabaseClient("user-1"),
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { created_at: "2026-04-02T08:00:00.000Z" },
                error: null,
              }),
            })),
          })),
        })),
      },
      applySupabaseCookies: <T>(response: T) => response,
    });
    loadPublishedCourseModulesCachedMock.mockResolvedValueOnce([
      {
        id: "mod1",
        title: "Intro",
        lessons: [
          {
            id: "mod1-l1",
            title: "Lesson 1",
            publishedAt: "2026-04-01T08:00:00.000Z",
            youtubeId: "abc123",
            goal: "Goal",
            cues: ["Cue"],
            drill: {
              title: "Drill",
              steps: ["Step"],
            },
            nextStep: "Next",
          },
          {
            id: "mod1-l2",
            title: "Lesson 2",
            publishedAt: "2026-04-03T08:00:00.000Z",
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

    const response = await GET();
    const payload = (await response.json()) as {
      ok?: boolean;
      signal?: {
        signature?: string;
        lessonCount?: number;
        firstLessonId?: string | null;
        lessons?: Array<{
          lessonId?: string;
          lessonTitle?: string;
          moduleId?: string;
          moduleTitle?: string;
          lessonToken?: string;
        }>;
      };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.signal?.lessonCount).toBe(1);
    expect(payload.signal?.firstLessonId).toBe("mod1-l2");
    expect(payload.signal?.signature?.startsWith("v1:")).toBe(true);
    expect(payload.signal?.lessons).toHaveLength(1);
    expect(payload.signal?.lessons?.[0]).toMatchObject({
      lessonId: "mod1-l2",
      lessonTitle: "Lesson 2",
      moduleId: "mod1",
      moduleTitle: "Intro",
      publishedAt: "2026-04-03T08:00:00.000Z",
    });
    expect(payload.signal?.lessons?.[0]?.lessonToken).toMatch(/^[0-9a-f]{16}$/);
    expect(loadPublishedCourseModulesCachedMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to auth-user creation when athlete profile is missing", async () => {
    loadPublishedCourseModulesCachedMock.mockResolvedValueOnce([
      {
        id: "mod1",
        title: "Intro",
        lessons: [
          {
            id: "mod1-l1",
            title: "Lesson 1",
            publishedAt: "2026-02-27T08:00:00.000Z",
            youtubeId: "abc123",
            goal: "Goal",
            cues: ["Cue"],
            drill: {
              title: "Drill",
              steps: ["Step"],
            },
            nextStep: "Next",
          },
          {
            id: "mod1-l2",
            title: "Lesson 2",
            publishedAt: "2026-03-03T08:00:00.000Z",
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

    const response = await GET();
    const payload = (await response.json()) as {
      signal?: {
        lessonCount?: number;
        firstLessonId?: string | null;
      };
    };

    expect(response.status).toBe(200);
    expect(payload.signal).toMatchObject({
      lessonCount: 1,
      firstLessonId: "mod1-l2",
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
