import { describe, expect, it } from "vitest";
import {
  isAnalyticsEventName,
  sanitizeAnalyticsPayload,
  trackAnalyticsEvent,
} from "@/lib/analytics/events";

describe("analytics events", () => {
  it("validates known event names", () => {
    expect(isAnalyticsEventName("checkout_started")).toBe(true);
    expect(isAnalyticsEventName("entitlement_granted")).toBe(true);
    expect(isAnalyticsEventName("qr_redirect_hit")).toBe(true);
    expect(isAnalyticsEventName("qr_link_created")).toBe(true);
    expect(isAnalyticsEventName("qr_link_updated")).toBe(true);
    expect(isAnalyticsEventName("qr_link_status_changed")).toBe(true);
    expect(isAnalyticsEventName("email_template_saved")).toBe(true);
    expect(isAnalyticsEventName("email_template_published")).toBe(true);
    expect(isAnalyticsEventName("email_template_reverted")).toBe(true);
    expect(isAnalyticsEventName("contact_intake_accepted")).toBe(true);
    expect(isAnalyticsEventName("contact_intake_notification_failed")).toBe(true);
    expect(isAnalyticsEventName("unknown_event")).toBe(false);
  });

  it("sanitizes payload and redacts sensitive keys", () => {
    const payload = sanitizeAnalyticsPayload({
      productId: "guide_0_1000m",
      email: "swimmer@example.com",
      rowCount: 4,
      ok: true,
      nested: { ignored: true },
      tokenValue: "secret-token",
      longText: "a".repeat(300),
    });

    expect(payload).toMatchObject({
      productId: "guide_0_1000m",
      email: "[redacted]",
      rowCount: 4,
      ok: true,
      tokenValue: "[redacted]",
    });
    expect(typeof payload.longText).toBe("string");
    expect(String(payload.longText).length).toBeLessThanOrEqual(201);
    expect(payload.nested).toBeUndefined();
  });

  it("builds tracked event record with sanitized payload", () => {
    const record = trackAnalyticsEvent({
      eventName: "progress_synced",
      channel: "server",
      userId: "user-123",
      payload: {
        syncKind: "course",
        email: "swimmer@example.com",
      },
    });

    expect(record.eventName).toBe("progress_synced");
    expect(record.userId).toBe("user-123");
    expect(record.payload).toEqual({
      syncKind: "course",
      email: "[redacted]",
    });
    expect(record.occurredAt).toBeTruthy();
  });
});
