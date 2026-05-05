import { afterEach, describe, expect, it, vi } from "vitest";

const { getServerSupabaseUserIfAuthCookiePresentMock, trackAnalyticsEventMock } = vi.hoisted(
  () => ({
    getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
    trackAnalyticsEventMock: vi.fn(),
  })
);

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/analytics/events", () => ({
  isAnalyticsEventName: (value: string) => value === "plans_viewed",
  trackAnalyticsEvent: trackAnalyticsEventMock,
}));

import { POST } from "@/app/api/analytics/event/route";

describe("/api/analytics/event route", () => {
  afterEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockReset();
    trackAnalyticsEventMock.mockReset();
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
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith({
      eventName: "plans_viewed",
      channel: "client",
      userId: null,
      payload: {
        source: "plans",
      },
    });
  });
});
