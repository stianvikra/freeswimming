import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetAdminIncidentMemoryForTests,
  reportAdminIncident,
  sanitizeIncidentContext,
  type AdminIncidentInput,
} from "@/lib/admin/incidents";
import type { MessageDeliveryPayload, MessageDeliveryResult } from "@/lib/admin/message-delivery";

const baseEnv = {
  INCIDENT_ALERTS_ENABLED: "1",
  INCIDENT_ALERT_TO_EMAIL: "Ops <ops@example.com>",
  MESSAGE_DELIVERY_FROM_EMAIL: "Freeswimming <hello@freeswimming.org>",
  FS_SUPABASE_ENV: "production",
};

const baseIncident: AdminIncidentInput = {
  category: "auth_sign_in_service_restricted",
  severity: "P0",
  affectedFlow: "auth_sign_in",
  context: {
    reason: "service_restricted",
    status: 402,
    nextPath: "/my-library",
  },
};

const acceptedDelivery: MessageDeliveryResult = {
  providerKey: "resend_api",
  status: "accepted_by_provider",
  providerMessageId: "email_123",
};

describe("admin incident alerts", () => {
  beforeEach(() => {
    __resetAdminIncidentMemoryForTests();
  });

  afterEach(() => {
    __resetAdminIncidentMemoryForTests();
    vi.restoreAllMocks();
  });

  it("sends one actionable alert and suppresses repeats inside the dedupe window", async () => {
    const sentPayloads: MessageDeliveryPayload[] = [];
    const deliverMessageImpl = vi.fn(async (payload: MessageDeliveryPayload) => {
      sentPayloads.push(payload);
      return acceptedDelivery;
    });
    const now = new Date("2026-05-09T10:00:00.000Z");

    const first = await reportAdminIncident(baseIncident, {
      env: baseEnv,
      now,
      deliverMessageImpl,
    });
    const second = await reportAdminIncident(baseIncident, {
      env: baseEnv,
      now: new Date("2026-05-09T10:01:00.000Z"),
      deliverMessageImpl,
    });

    expect(first).toMatchObject({
      ok: true,
      status: "sent",
      category: "auth_sign_in_service_restricted",
      count: 1,
    });
    expect(second).toMatchObject({
      ok: true,
      status: "suppressed",
      category: "auth_sign_in_service_restricted",
      count: 2,
    });
    expect(deliverMessageImpl).toHaveBeenCalledTimes(1);
    expect(sentPayloads).toHaveLength(1);
    expect(sentPayloads[0]).toMatchObject({
      target: "system_notice",
      to: "Ops <ops@example.com>",
      from: "Freeswimming <hello@freeswimming.org>",
      subject: "[Freeswimming P0] auth_sign_in_service_restricted",
    });
    expect(sentPayloads[0]?.text).toContain("Affected flow: auth_sign_in");
    expect(sentPayloads[0]?.text).toContain("Dedupe count: 1");
    expect(sentPayloads[0]?.text).toContain("docs/runbooks/core-flow-incident-response.md");
    expect(sentPayloads[0]?.text).toContain("Codex-ready prompt:");
  });

  it("redacts sensitive diagnostic keys and values deterministically", () => {
    const sanitized = sanitizeIncidentContext({
      email: "swimmer@example.com",
      token: "secret-token",
      ip: "203.0.113.42",
      note: "Email ops@example.com with Authorization: Bearer abc.def.ghi",
      nested: {
        safeReason: "service_restricted",
        cookie: "session=secret",
      },
    });
    const serialized = JSON.stringify(sanitized);

    expect(serialized).toContain("[redacted]");
    expect(serialized).toContain("[redacted-email]");
    expect(serialized).not.toContain("swimmer@example.com");
    expect(serialized).not.toContain("ops@example.com");
    expect(serialized).not.toContain("secret-token");
    expect(serialized).not.toContain("203.0.113.42");
    expect(serialized).not.toContain("abc.def.ghi");
    expect(serialized).toContain("service_restricted");
  });

  it("does not attempt delivery when incident recipient config is missing", async () => {
    const deliverMessageImpl = vi.fn(async () => acceptedDelivery);

    const result = await reportAdminIncident(baseIncident, {
      env: {
        MESSAGE_DELIVERY_FROM_EMAIL: "Freeswimming <hello@freeswimming.org>",
      },
      deliverMessageImpl,
    });

    expect(result).toEqual({
      ok: false,
      status: "disabled",
      category: "auth_sign_in_service_restricted",
      reason: "recipient_missing",
    });
    expect(deliverMessageImpl).not.toHaveBeenCalled();
  });

  it("keeps user flow safe when delivery fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const deliverMessageImpl = vi.fn(
      async () =>
        ({
          providerKey: "resend_api",
          status: "failed_retryable",
          errorCode: "provider_rate_limited",
          redactedErrorMessage: "provider rate limited",
        }) satisfies MessageDeliveryResult
    );

    const result = await reportAdminIncident(baseIncident, {
      env: baseEnv,
      deliverMessageImpl,
    });

    expect(result).toMatchObject({
      ok: false,
      status: "delivery_failed",
      category: "auth_sign_in_service_restricted",
      count: 1,
    });
    expect(consoleError).toHaveBeenCalledWith(
      "[IncidentAlert] Could not deliver admin incident alert.",
      expect.objectContaining({
        category: "auth_sign_in_service_restricted",
        status: "failed_retryable",
        errorCode: "provider_rate_limited",
      })
    );
  });
});
