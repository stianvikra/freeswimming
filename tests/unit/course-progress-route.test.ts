import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock, loadCourseModulesByStatusMock, trackAnalyticsEventMock } =
  vi.hoisted(() => {
    return {
      createServerSupabaseClientMock: vi.fn(),
      loadCourseModulesByStatusMock: vi.fn(),
      trackAnalyticsEventMock: vi.fn(),
    };
  });

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("@/lib/admin/content-course", () => ({
  loadCourseModulesByStatus: loadCourseModulesByStatusMock,
}));

vi.mock("@/lib/analytics/events", () => ({
  trackAnalyticsEvent: trackAnalyticsEventMock,
}));

import { GET, POST } from "@/app/api/progress/course/route";

function buildAuthenticatedSupabaseClient(userId: string | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: userId ? { id: userId } : null,
        },
      }),
    },
  };
}

function buildGetSupabase(rows: unknown) {
  const order = vi.fn().mockResolvedValue({
    data: rows,
    error: null,
  });
  const eq = vi.fn().mockReturnValue({ order });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  return {
    ...buildAuthenticatedSupabaseClient("user-1"),
    from,
    select,
    eq,
    order,
  };
}

function buildPostSupabase() {
  const upsert = vi.fn().mockResolvedValue({
    error: null,
  });
  const from = vi.fn().mockReturnValue({ upsert });

  return {
    ...buildAuthenticatedSupabaseClient("user-1"),
    from,
    upsert,
  };
}

describe("/api/progress/course route", () => {
  beforeEach(() => {
    loadCourseModulesByStatusMock.mockResolvedValue([
      {
        id: "intro-course",
        title: "Intro",
        lessons: [
          {
            id: "intro-course--welcome-course-structure",
            legacyIds: ["mod1-l1"],
            title: "Welcome",
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
    trackAnalyticsEventMock.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("merges legacy and canonical lesson ids onto the canonical lesson id on GET", async () => {
    const supabase = buildGetSupabase([
      {
        lesson_id: "mod1-l1",
        done: true,
        video_seconds: 8,
        updated_at: "2026-03-16T10:00:00.000Z",
      },
      {
        lesson_id: "intro-course--welcome-course-structure",
        done: false,
        video_seconds: 22,
        updated_at: "2026-03-16T10:05:00.000Z",
      },
    ]);
    createServerSupabaseClientMock.mockResolvedValueOnce(supabase);

    const response = await GET();
    const payload = (await response.json()) as {
      ok?: boolean;
      rows?: Array<{
        lessonId?: string;
        done?: boolean;
        videoSeconds?: number;
      }>;
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      rows: [
        {
          lessonId: "intro-course--welcome-course-structure",
          done: true,
          videoSeconds: 22,
        },
      ],
    });
    expect(loadCourseModulesByStatusMock).toHaveBeenCalledWith({
      statuses: ["published"],
      fallback: expect.any(Array),
      autoSeedWhenEmpty: false,
    });
  });

  it("writes canonical lesson ids on POST even when the client sends a legacy lesson id", async () => {
    const supabase = buildPostSupabase();
    createServerSupabaseClientMock.mockResolvedValueOnce(supabase);

    const response = await POST(
      new Request("http://127.0.0.1:3000/api/progress/course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: [
            {
              lessonId: "mod1-l1",
              done: true,
              videoSeconds: 12,
              updatedAt: "2026-03-16T11:00:00.000Z",
            },
          ],
        }),
      })
    );
    const payload = (await response.json()) as { ok?: boolean; upserted?: number };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      upserted: 1,
    });
    expect(supabase.upsert).toHaveBeenCalledWith(
      [
        {
          user_id: "user-1",
          lesson_id: "intro-course--welcome-course-structure",
          done: true,
          done_confirmed_at: null,
          video_seconds: 12,
          updated_at: "2026-03-16T11:00:00.000Z",
        },
      ],
      {
        onConflict: "user_id,lesson_id",
      }
    );
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "progress_synced",
        payload: expect.objectContaining({
          syncKind: "course",
          rowCount: 1,
        }),
      })
    );
  });
});
