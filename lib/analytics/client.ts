import type { AnalyticsEventName } from "@/lib/analytics/events";

type ClientPayload = Record<string, unknown> | undefined;

export async function sendClientAnalyticsEvent(
  eventName: AnalyticsEventName,
  payload?: ClientPayload
) {
  try {
    await fetch("/api/analytics/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName,
        payload,
      }),
      cache: "no-store",
      keepalive: true,
    });
  } catch {
    // Analytics failures should never block user actions.
  }
}
