import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock, trackAnalyticsEventMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  trackAnalyticsEventMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("@/lib/analytics/events", () => ({
  trackAnalyticsEvent: trackAnalyticsEventMock,
}));

import { POST } from "@/app/api/progress/guide/route";

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

describe("/api/progress/guide route", () => {
  beforeEach(() => {
    trackAnalyticsEventMock.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("writes canonical section ids for known guide rows on POST", async () => {
    const upsert = vi.fn().mockResolvedValue({
      error: null,
    });
    createServerSupabaseClientMock.mockResolvedValueOnce({
      ...buildAuthenticatedSupabaseClient("user-1"),
      from: vi.fn().mockReturnValue({ upsert }),
    });

    const response = await POST(
      new Request("http://127.0.0.1:3000/api/progress/guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: [
            {
              guideSlug: "0-1000m",
              sectionId: "guide-0-1000m-session-s04",
              completed: true,
              notes: "Remote completion",
              updatedAt: "2026-03-16T11:00:00.000Z",
            },
            {
              guideSlug: "poolside",
              sectionId: "d02",
              completed: false,
              notes: "Stay relaxed",
              updatedAt: "2026-03-16T11:01:00.000Z",
            },
          ],
        }),
      })
    );
    const payload = (await response.json()) as { ok?: boolean; upserted?: number };

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      upserted: 2,
    });
    expect(upsert).toHaveBeenCalledWith(
      [
        {
          user_id: "user-1",
          guide_slug: "0-1000m",
          section_id: "S04",
          completed: true,
          notes: "Remote completion",
          updated_at: "2026-03-16T11:00:00.000Z",
        },
        {
          user_id: "user-1",
          guide_slug: "poolside",
          section_id: "D02",
          completed: false,
          notes: "Stay relaxed",
          updated_at: "2026-03-16T11:01:00.000Z",
        },
      ],
      { onConflict: "user_id,guide_slug,section_id" }
    );
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "progress_synced",
        payload: expect.objectContaining({
          syncKind: "guide",
          rowCount: 2,
        }),
      })
    );
  });
});
