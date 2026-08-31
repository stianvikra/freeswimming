import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { sendClientAnalyticsEventMock } = vi.hoisted(() => ({
  sendClientAnalyticsEventMock: vi.fn(),
}));

vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: sendClientAnalyticsEventMock,
}));

import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";

describe("TrackEventOnMount", () => {
  afterEach(() => {
    cleanup();
    sendClientAnalyticsEventMock.mockReset();
    vi.restoreAllMocks();
  });

  it("keeps legacy payload identity semantics when no timezone gate is provided", () => {
    const { rerender } = render(
      <TrackEventOnMount eventName="habits_viewed" payload={{ selectedDate: "2026-08-31" }} />
    );

    rerender(
      <TrackEventOnMount eventName="habits_viewed" payload={{ selectedDate: "2026-08-31" }} />
    );

    expect(sendClientAnalyticsEventMock).toHaveBeenCalledTimes(2);
    expect(sendClientAnalyticsEventMock).toHaveBeenNthCalledWith(1, "habits_viewed", {
      selectedDate: "2026-08-31",
    });
    expect(sendClientAnalyticsEventMock).toHaveBeenNthCalledWith(2, "habits_viewed", {
      selectedDate: "2026-08-31",
    });
  });

  it("emits a changed legacy payload again", () => {
    const { rerender } = render(
      <TrackEventOnMount eventName="habits_viewed" payload={{ selectedDate: "2026-08-30" }} />
    );

    rerender(
      <TrackEventOnMount eventName="habits_viewed" payload={{ selectedDate: "2026-08-31" }} />
    );

    expect(sendClientAnalyticsEventMock).toHaveBeenCalledTimes(2);
    expect(sendClientAnalyticsEventMock).toHaveBeenNthCalledWith(1, "habits_viewed", {
      selectedDate: "2026-08-30",
    });
    expect(sendClientAnalyticsEventMock).toHaveBeenNthCalledWith(2, "habits_viewed", {
      selectedDate: "2026-08-31",
    });
  });

  it("waits for timezone reconciliation and sends only the corrected payload", () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
      locale: "en-US",
      calendar: "gregory",
      numberingSystem: "latn",
      timeZone: "Europe/Oslo",
    });
    const { rerender } = render(
      <TrackEventOnMount
        eventName="habits_viewed"
        localDayTimezone="UTC"
        payload={{ selectedDate: "2026-08-30", completionPercent: 20 }}
      />
    );

    expect(sendClientAnalyticsEventMock).not.toHaveBeenCalled();

    rerender(
      <TrackEventOnMount
        eventName="habits_viewed"
        localDayTimezone="Europe/Oslo"
        payload={{ selectedDate: "2026-08-31", completionPercent: 40 }}
      />
    );
    rerender(
      <TrackEventOnMount
        eventName="habits_viewed"
        localDayTimezone="Europe/Oslo"
        payload={{ selectedDate: "2026-08-31", completionPercent: 60 }}
      />
    );

    expect(sendClientAnalyticsEventMock).toHaveBeenCalledTimes(1);
    expect(sendClientAnalyticsEventMock).toHaveBeenCalledWith("habits_viewed", {
      selectedDate: "2026-08-31",
      completionPercent: 40,
    });
  });
});
