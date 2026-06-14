import { describe, expect, it } from "vitest";
import {
  isAnalyticsEventName,
  sanitizeAnalyticsPayload,
  trackAnalyticsEvent,
} from "@/lib/analytics/events";

describe("analytics events", () => {
  it("validates known event names", () => {
    expect(isAnalyticsEventName("public_page_viewed")).toBe(true);
    expect(isAnalyticsEventName("public_cta_clicked")).toBe(true);
    expect(isAnalyticsEventName("product_viewed")).toBe(true);
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
    expect(isAnalyticsEventName("admin_message_status_changed")).toBe(true);
    expect(isAnalyticsEventName("habit_created")).toBe(true);
    expect(isAnalyticsEventName("habit_updated")).toBe(true);
    expect(isAnalyticsEventName("habit_check_in_logged")).toBe(true);
    expect(isAnalyticsEventName("habit_check_in_reset")).toBe(true);
    expect(isAnalyticsEventName("habit_stats_reset_created")).toBe(true);
    expect(isAnalyticsEventName("habit_lapse_logged")).toBe(true);
    expect(isAnalyticsEventName("habit_rest_day_logged")).toBe(true);
    expect(isAnalyticsEventName("habit_timer_saved")).toBe(true);
    expect(isAnalyticsEventName("habit_catch_up_assistant_shown")).toBe(true);
    expect(isAnalyticsEventName("habit_catch_up_day_reviewed")).toBe(true);
    expect(isAnalyticsEventName("habit_catch_up_day_left_missed")).toBe(true);
    expect(isAnalyticsEventName("habit_catch_up_reset_started")).toBe(true);
    expect(isAnalyticsEventName("habit_catch_up_reset_cancelled")).toBe(true);
    expect(isAnalyticsEventName("course_lesson_viewed")).toBe(true);
    expect(isAnalyticsEventName("course_lesson_completed")).toBe(true);
    expect(isAnalyticsEventName("course_lesson_continued")).toBe(true);
    expect(isAnalyticsEventName("course_lesson_support_clicked")).toBe(true);
    expect(isAnalyticsEventName("workout_builder_started")).toBe(true);
    expect(isAnalyticsEventName("workout_builder_template_selected")).toBe(true);
    expect(isAnalyticsEventName("workout_builder_saved")).toBe(true);
    expect(isAnalyticsEventName("unknown_event")).toBe(false);
  });

  it("sanitizes payload and redacts sensitive keys", () => {
    const payload = sanitizeAnalyticsPayload({
      productId: "guide_0_1000m",
      email: "swimmer@example.com",
      freeText: "I need help with my shoulder",
      rawUrl: "https://freeswimming.org/plans?email=swimmer@example.com",
      referrer: "https://example.com/?token=secret",
      userAgent: "Mozilla/5.0",
      ipAddress: "127.0.0.1",
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
    expect(payload.freeText).toBeUndefined();
    expect(payload.rawUrl).toBeUndefined();
    expect(payload.referrer).toBeUndefined();
    expect(payload.userAgent).toBeUndefined();
    expect(payload.ipAddress).toBeUndefined();
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
