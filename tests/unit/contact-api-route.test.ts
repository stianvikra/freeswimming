import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MessageDeliveryResult } from "@/lib/admin/message-delivery";

const {
  createContactNotificationAttemptMock,
  deliverMessageMock,
  storeContactIntakeMessageMock,
  trackAnalyticsEventMock,
  updateContactNotificationAttemptMock,
} = vi.hoisted(() => ({
  createContactNotificationAttemptMock: vi.fn(),
  deliverMessageMock: vi.fn(),
  storeContactIntakeMessageMock: vi.fn(),
  trackAnalyticsEventMock: vi.fn(),
  updateContactNotificationAttemptMock: vi.fn(),
}));

vi.mock("@/lib/admin/contact-intake", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/admin/contact-intake")>();
  return {
    ...actual,
    createContactNotificationAttempt: createContactNotificationAttemptMock,
    storeContactIntakeMessage: storeContactIntakeMessageMock,
    updateContactNotificationAttempt: updateContactNotificationAttemptMock,
  };
});

vi.mock("@/lib/admin/message-delivery", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/admin/message-delivery")>();
  return {
    ...actual,
    deliverMessage: deliverMessageMock,
  };
});

vi.mock("@/lib/analytics/events", () => ({
  trackAnalyticsEvent: trackAnalyticsEventMock,
}));

import { POST } from "@/app/api/contact/route";

const acceptedDeliveryResult: MessageDeliveryResult = {
  providerKey: "resend_api",
  status: "accepted_by_provider",
  providerMessageId: "email-1",
};

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    variant: "contact",
    name: "Test User",
    email: "test@example.com",
    message: "This is a valid message for contact testing.",
    company: "",
    startedAt: Date.now() - 5000,
    ...overrides,
  };
}

function buildRequest(body: Record<string, unknown>, ip = "203.0.113.11") {
  return new Request("https://freeswimming.test/api/contact", {
    method: "POST",
    headers: {
      origin: "https://freeswimming.test",
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("/api/contact route", () => {
  beforeEach(() => {
    vi.stubEnv("CONTACT_ALLOWED_ORIGINS", "https://freeswimming.test");
    vi.stubEnv("CONTACT_TO_EMAIL", "Support <support@example.com>");
    vi.stubEnv("MESSAGE_DELIVERY_FROM_EMAIL", "Freeswimming <hello@freeswimming.org>");

    storeContactIntakeMessageMock.mockResolvedValue({
      ok: true,
      messageId: "message-1",
      storageMode: "supabase",
    });
    createContactNotificationAttemptMock.mockResolvedValue({
      ok: true,
      attemptId: "attempt-1",
    });
    deliverMessageMock.mockResolvedValue(acceptedDeliveryResult);
    updateContactNotificationAttemptMock.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("stores intake before provider notification and returns honest success", async () => {
    const response = await POST(buildRequest(validPayload(), "203.0.113.12"));
    const payload = (await response.json()) as { ok?: boolean };

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload.ok).toBe(true);
    expect(storeContactIntakeMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceVariant: "contact",
        submitterName: "Test User",
        submitterEmail: "test@example.com",
        messageBody: "This is a valid message for contact testing.",
      })
    );
    const storedInput = storeContactIntakeMessageMock.mock.calls[0][0];
    expect(JSON.stringify(storedInput.requestMetadata)).not.toContain("203.0.113.12");

    expect(createContactNotificationAttemptMock).toHaveBeenCalledWith({
      messageId: "message-1",
      requestMetadata: storedInput.requestMetadata,
    });
    expect(deliverMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptId: "attempt-1",
        target: "inbound_notification",
        messageId: "message-1",
        to: "Support <support@example.com>",
        from: "Freeswimming <hello@freeswimming.org>",
        replyTo: "test@example.com",
      })
    );
    expect(updateContactNotificationAttemptMock).toHaveBeenCalledWith({
      messageId: "message-1",
      attemptId: "attempt-1",
      result: acceptedDeliveryResult,
    });
    expect(storeContactIntakeMessageMock.mock.invocationCallOrder[0]).toBeLessThan(
      deliverMessageMock.mock.invocationCallOrder[0]
    );
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith({
      eventName: "contact_intake_accepted",
      channel: "server",
      payload: {
        sourceVariant: "contact",
        storageMode: "supabase",
        notificationStatus: "accepted_by_provider",
      },
    });
    expect(trackAnalyticsEventMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ eventName: "contact_intake_notification_failed" })
    );
  });

  it("fails user success when storage fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    storeContactIntakeMessageMock.mockResolvedValueOnce({
      ok: false,
      errorCode: "storage_insert_failed",
      redactedErrorMessage: "Database unavailable.",
    });

    const response = await POST(buildRequest(validPayload(), "203.0.113.13"));
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(500);
    expect(payload).toEqual({
      ok: false,
      error: "Could not save right now. Please try again.",
    });
    expect(createContactNotificationAttemptMock).not.toHaveBeenCalled();
    expect(deliverMessageMock).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith({
      eventName: "contact_intake_failed",
      channel: "server",
      payload: {
        sourceVariant: "contact",
        reason: "storage_insert_failed",
      },
    });
  });

  it("stores the request and records notification failure when recipient config is missing", async () => {
    vi.stubEnv("CONTACT_TO_EMAIL", "");

    const response = await POST(buildRequest(validPayload(), "203.0.113.14"));
    const payload = (await response.json()) as { ok?: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(deliverMessageMock).not.toHaveBeenCalled();
    expect(updateContactNotificationAttemptMock).toHaveBeenCalledWith({
      messageId: "message-1",
      attemptId: "attempt-1",
      result: {
        providerKey: "disabled",
        status: "disabled",
        errorCode: "provider_config_missing",
        redactedErrorMessage: "Contact notification recipient is missing.",
      },
    });
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith({
      eventName: "contact_intake_notification_failed",
      channel: "server",
      payload: {
        sourceVariant: "contact",
        status: "disabled",
        errorCode: "provider_config_missing",
      },
    });
  });

  it("keeps user success when provider delivery fails after storage", async () => {
    const providerFailure: MessageDeliveryResult = {
      providerKey: "resend_api",
      status: "failed_retryable",
      errorCode: "provider_rate_limited",
      retryAfterSeconds: 60,
      redactedErrorMessage: "Provider rate limited.",
    };
    deliverMessageMock.mockResolvedValueOnce(providerFailure);

    const response = await POST(buildRequest(validPayload(), "203.0.113.15"));
    const payload = (await response.json()) as { ok?: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(updateContactNotificationAttemptMock).toHaveBeenCalledWith({
      messageId: "message-1",
      attemptId: "attempt-1",
      result: providerFailure,
    });
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith({
      eventName: "contact_intake_notification_failed",
      channel: "server",
      payload: {
        sourceVariant: "contact",
        status: "failed_retryable",
        errorCode: "provider_rate_limited",
      },
    });
  });
});
