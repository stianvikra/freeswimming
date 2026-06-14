import { afterEach, describe, expect, it, vi } from "vitest";

const { getServerSupabaseUserIfAuthCookiePresentMock, trackAndPersistAnalyticsEventMock } =
  vi.hoisted(() => ({
    getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
    trackAndPersistAnalyticsEventMock: vi.fn(),
  }));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/analytics/events", () => ({
  isAnalyticsEventName: (value: string) =>
    value === "plans_viewed" || value === "library_viewed" || value === "course_lesson_completed",
}));

vi.mock("@/lib/analytics/persistence", () => ({
  trackAndPersistAnalyticsEvent: trackAndPersistAnalyticsEventMock,
}));

import { POST } from "@/app/api/analytics/event/route";

describe("/api/analytics/event route", () => {
  afterEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockReset();
    trackAndPersistAnalyticsEventMock.mockReset();
  });

  it("records anonymous client events without requiring a Supabase user lookup", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValueOnce({
      supabase: null,
      user: null,
      error: null,
      hasAuthCookie: false,
    });

    const response = await POST(
      new Request("https://freeswimming.test/api/analytics/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: "plans_viewed",
          payload: {
            source: "plans",
          },
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(getServerSupabaseUserIfAuthCookiePresentMock).toHaveBeenCalledTimes(1);
    expect(trackAndPersistAnalyticsEventMock).toHaveBeenCalledWith({
      eventName: "plans_viewed",
      channel: "client",
      userId: null,
      payload: {
        source: "plans",
      },
    });
  });

  it("does not attach logged-in user id to public client events", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValueOnce({
      supabase: {},
      user: { id: "user-123" },
      error: null,
      hasAuthCookie: true,
    });

    const response = await POST(
      new Request("https://freeswimming.test/api/analytics/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: "plans_viewed",
          payload: {
            source: "plans",
            routeTemplate: "/plans",
            productIds: "guide_poolside",
          },
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(trackAndPersistAnalyticsEventMock).toHaveBeenCalledWith({
      eventName: "plans_viewed",
      channel: "client",
      userId: null,
      payload: {
        source: "plans",
        routeTemplate: "/plans",
        productIds: "guide_poolside",
      },
    });
  });

  it("does not attach logged-in user id to course lesson KPI events", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValueOnce({
      supabase: {},
      user: { id: "user-123" },
      error: null,
      hasAuthCookie: true,
    });

    const response = await POST(
      new Request("https://freeswimming.test/api/analytics/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: "course_lesson_completed",
          payload: {
            source: "course",
            surface: "course_lesson",
            routeTemplate: "/course",
            routeCategory: "course_landing",
            lessonId: "body-position--body-position-front",
            moduleId: "body-position",
          },
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(trackAndPersistAnalyticsEventMock).toHaveBeenCalledWith({
      eventName: "course_lesson_completed",
      channel: "client",
      userId: null,
      payload: {
        source: "course",
        surface: "course_lesson",
        routeTemplate: "/course",
        routeCategory: "course_landing",
        lessonId: "body-position--body-position-front",
        moduleId: "body-position",
      },
    });
  });

  it("keeps logged-in user id for product/admin client events", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValueOnce({
      supabase: {},
      user: { id: "user-123" },
      error: null,
      hasAuthCookie: true,
    });

    const response = await POST(
      new Request("https://freeswimming.test/api/analytics/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: "library_viewed",
          payload: {
            ownedCount: 1,
          },
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(trackAndPersistAnalyticsEventMock).toHaveBeenCalledWith({
      eventName: "library_viewed",
      channel: "client",
      userId: "user-123",
      payload: {
        ownedCount: 1,
      },
    });
  });
});
