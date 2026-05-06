import { describe, expect, it, vi } from "vitest";
import {
  buildMessageDeliveryAttemptRecord,
  createMessageDeliveryProvider,
  deliverMessage,
  getMessageDeliveryStatusLabel,
  isSensitiveMessageDeliveryField,
  redactMessageDeliveryDiagnostic,
  resolveMessageDeliveryAddressConfig,
  resolveMessageDeliveryProviderConfig,
  type MessageDeliveryPayload,
} from "@/lib/admin/message-delivery";

const basePayload: MessageDeliveryPayload = {
  attemptId: "attempt_123",
  target: "inbound_notification",
  messageId: "message_123",
  to: "Support <support@example.com>",
  from: "Freeswimming <hello@freeswimming.org>",
  replyTo: "swimmer@example.com",
  subject: "Freeswimming contact request",
  text: "Private swimmer note that must not be copied into diagnostics.",
};

describe("admin message delivery provider contract", () => {
  it("defaults to deterministic disabled state when no provider is configured", async () => {
    const result = await deliverMessage(basePayload, { env: {} });

    expect(result).toEqual({
      providerKey: "disabled",
      status: "disabled",
      errorCode: "provider_disabled",
      redactedErrorMessage: "Message delivery provider is disabled.",
    });
  });

  it("normalizes provider aliases and clamps timeout config", () => {
    const config = resolveMessageDeliveryProviderConfig({
      MESSAGE_DELIVERY_PROVIDER: "smtp",
      MESSAGE_DELIVERY_TIMEOUT_MS: "60000",
      MESSAGE_DELIVERY_SMTP_HOST: "send.one.com",
      MESSAGE_DELIVERY_SMTP_USER: "mailbox@freeswimming.org",
      MESSAGE_DELIVERY_SMTP_PASSWORD: "smtp-secret",
    });

    expect(config).toMatchObject({
      providerKey: "smtp_one_com_compatible",
      timeoutMs: 15_000,
      host: "send.one.com",
      port: 465,
      secure: true,
    });
  });

  it("resolves server-only sender defaults without requiring provider-specific history", () => {
    expect(
      resolveMessageDeliveryAddressConfig({
        MESSAGE_DELIVERY_FROM_EMAIL: "Freeswimming <hello@freeswimming.org>",
        MESSAGE_DELIVERY_REPLY_TO_EMAIL: "support@freeswimming.org",
      })
    ).toEqual({
      from: "Freeswimming <hello@freeswimming.org>",
      replyTo: "support@freeswimming.org",
      missingFields: [],
      invalidFields: [],
    });

    expect(
      resolveMessageDeliveryAddressConfig({
        CONTACT_FROM_EMAIL: "Legacy <legacy@freeswimming.org>",
      })
    ).toMatchObject({
      from: "Legacy <legacy@freeswimming.org>",
      missingFields: [],
    });

    expect(resolveMessageDeliveryAddressConfig({ MESSAGE_DELIVERY_FROM_EMAIL: "bad" })).toEqual({
      from: "bad",
      replyTo: null,
      missingFields: [],
      invalidFields: ["MESSAGE_DELIVERY_FROM_EMAIL"],
    });
  });

  it("fails closed for invalid provider config without pretending delivery succeeded", async () => {
    const fetchImpl = vi.fn();
    const result = await deliverMessage(basePayload, {
      env: {
        MESSAGE_DELIVERY_PROVIDER: "resend_api",
      },
      fetchImpl,
    });

    expect(result.status).toBe("disabled");
    expect(result.errorCode).toBe("provider_config_missing");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("sends Resend API payload with attempt-scoped idempotency and normalized result", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_123" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    const result = await deliverMessage(basePayload, {
      env: {
        MESSAGE_DELIVERY_PROVIDER: "resend_api",
        MESSAGE_DELIVERY_RESEND_API_KEY: "resend-secret",
      },
      fetchImpl,
    });

    expect(result).toEqual({
      providerKey: "resend_api",
      status: "accepted_by_provider",
      providerMessageId: "email_123",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({
      Authorization: "Bearer resend-secret",
      "Content-Type": "application/json",
      "Idempotency-Key": "attempt_123",
    });
    expect(init.cache).toBe("no-store");
    expect(JSON.parse(String(init.body))).toMatchObject({
      from: basePayload.from,
      to: [basePayload.to],
      reply_to: basePayload.replyTo,
      subject: basePayload.subject,
      text: basePayload.text,
    });
  });

  it("classifies Resend rate limits as retryable and redacts provider diagnostics", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message:
            "Could not send swimmer@example.com with token resend-secret and body Private swimmer note that must not be copied into diagnostics.",
        }),
        {
          status: 429,
          headers: {
            "content-type": "application/json",
            "retry-after": "42",
          },
        }
      )
    );

    const result = await deliverMessage(basePayload, {
      env: {
        MESSAGE_DELIVERY_PROVIDER: "resend_api",
        MESSAGE_DELIVERY_RESEND_API_KEY: "resend-secret",
      },
      fetchImpl,
    });

    expect(result).toMatchObject({
      providerKey: "resend_api",
      status: "failed_retryable",
      errorCode: "provider_rate_limited",
      retryAfterSeconds: 42,
    });
    expect(result.redactedErrorMessage).not.toContain("swimmer@example.com");
    expect(result.redactedErrorMessage).not.toContain("resend-secret");
    expect(result.redactedErrorMessage).not.toContain("Private swimmer note");
  });

  it("sends SMTP with deterministic message id and keeps provider history independent", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "<attempt_123@freeswimming.app>" });
    const smtpTransportFactory = vi.fn().mockReturnValue({ sendMail });
    const config = resolveMessageDeliveryProviderConfig({
      MESSAGE_DELIVERY_PROVIDER: "smtp_one_com_compatible",
      MESSAGE_DELIVERY_SMTP_HOST: "send.one.com",
      MESSAGE_DELIVERY_SMTP_USER: "mailbox@freeswimming.org",
      MESSAGE_DELIVERY_SMTP_PASSWORD: "smtp-secret",
    });

    const result = await createMessageDeliveryProvider(config, { smtpTransportFactory }).send(
      basePayload
    );

    expect(result).toEqual({
      providerKey: "smtp_one_com_compatible",
      status: "accepted_by_provider",
      providerMessageId: "<attempt_123@freeswimming.app>",
    });
    expect(smtpTransportFactory).toHaveBeenCalledWith(
      expect.objectContaining({
        providerKey: "smtp_one_com_compatible",
        host: "send.one.com",
        user: "mailbox@freeswimming.org",
        password: "smtp-secret",
      })
    );
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: basePayload.to,
        from: basePayload.from,
        replyTo: basePayload.replyTo,
        subject: basePayload.subject,
        text: basePayload.text,
        messageId: "<attempt_123@freeswimming.app>",
      })
    );
  });

  it("classifies SMTP auth failures as final and redacts secrets plus addresses", async () => {
    const sendMail = vi.fn().mockRejectedValue(
      Object.assign(new Error("EAUTH mailbox@freeswimming.org smtp-secret"), {
        code: "EAUTH",
      })
    );
    const config = resolveMessageDeliveryProviderConfig({
      MESSAGE_DELIVERY_PROVIDER: "smtp_one_com_compatible",
      MESSAGE_DELIVERY_SMTP_HOST: "send.one.com",
      MESSAGE_DELIVERY_SMTP_USER: "mailbox@freeswimming.org",
      MESSAGE_DELIVERY_SMTP_PASSWORD: "smtp-secret",
    });

    const result = await createMessageDeliveryProvider(config, {
      smtpTransportFactory: () => ({ sendMail }),
    }).send(basePayload);

    expect(result.status).toBe("failed_final");
    expect(result.errorCode).toBe("provider_auth_failed");
    expect(result.redactedErrorMessage).not.toContain("mailbox@freeswimming.org");
    expect(result.redactedErrorMessage).not.toContain("smtp-secret");
  });

  it("rejects invalid payloads before calling any provider", async () => {
    const fetchImpl = vi.fn();
    const result = await deliverMessage(
      {
        ...basePayload,
        to: "not-an-email",
      },
      {
        env: {
          MESSAGE_DELIVERY_PROVIDER: "resend_api",
          MESSAGE_DELIVERY_RESEND_API_KEY: "resend-secret",
        },
        fetchImpl,
      }
    );

    expect(result.status).toBe("failed_final");
    expect(result.errorCode).toBe("payload_invalid");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("builds append-only attempt record shape without message body or secrets", () => {
    const record = buildMessageDeliveryAttemptRecord(
      basePayload,
      {
        providerKey: "resend_api",
        status: "failed_retryable",
        errorCode: "provider_request_failed",
        retryAfterSeconds: 60,
        redactedErrorMessage: "Resend API 500: [redacted]",
      },
      new Date("2026-05-06T12:00:00.000Z")
    );

    expect(record).toEqual({
      attemptId: "attempt_123",
      target: "inbound_notification",
      messageId: "message_123",
      replyId: null,
      providerKey: "resend_api",
      status: "failed_retryable",
      providerMessageId: null,
      errorCode: "provider_request_failed",
      retryAfterSeconds: 60,
      redactedErrorMessage: "Resend API 500: [redacted]",
      updatedAt: "2026-05-06T12:00:00.000Z",
    });
    expect(JSON.stringify(record)).not.toContain(basePayload.text);
  });

  it("centralizes stable status labels and sensitive field checks for later UI consumers", () => {
    expect(getMessageDeliveryStatusLabel("accepted_by_provider")).toBe("Accepted by provider");
    expect(getMessageDeliveryStatusLabel("failed_retryable")).toBe("Failed, retryable");
    expect(isSensitiveMessageDeliveryField("smtpPassword")).toBe(true);
    expect(isSensitiveMessageDeliveryField("messageId")).toBe(false);
  });

  it("redacts JSON-shaped provider responses before diagnostics can be stored", () => {
    const redacted = redactMessageDeliveryDiagnostic(
      {
        email: "swimmer@example.com",
        token: "secret-token",
        text: "Private swimmer note",
        safeCode: "bad_request",
      },
      ["secret-token"]
    );

    expect(redacted).not.toContain("swimmer@example.com");
    expect(redacted).not.toContain("secret-token");
    expect(redacted).not.toContain("Private swimmer note");
    expect(redacted).toContain("safeCode");
  });
});
