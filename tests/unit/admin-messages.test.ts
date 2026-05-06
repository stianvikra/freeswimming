import { describe, expect, it } from "vitest";
import {
  buildAdminMessageRequestDiagnostics,
  buildAdminMessageSearchOrFilter,
  buildAdminMessageStructuredEntries,
  getAdminMessageStatusBucket,
  parseAdminMessageStatusActionPayload,
  resolveAdminMessageStatusAction,
  toAdminMessageItem,
  type AdminMessageDeliveryAttemptRow,
  type AdminMessageRow,
} from "@/lib/admin/messages";

const baseMessage: AdminMessageRow = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  source_variant: "preview_access_notify",
  submitter_name: "Test User",
  submitter_email: "test@example.com",
  message_body: "I want early access.",
  structured_intake: {
    trainingDaysPerWeek: 3,
    primaryGoal: "Swim 1000m",
  },
  request_metadata: {
    originHost: "freeswimming.test",
    contentLength: 320,
    ipHash: "hashed-ip",
    userAgentHash: "hashed-ua",
  },
  status: "new",
  notification_status: "failed_retryable",
  notification_error_code: "provider_rate_limited",
  created_at: "2026-05-06T18:00:00.000Z",
  updated_at: "2026-05-06T18:00:00.000Z",
};

const baseAttempt: AdminMessageDeliveryAttemptRow = {
  id: "123e4567-e89b-42d3-a456-426614174111",
  target: "inbound_notification",
  message_id: baseMessage.id,
  reply_id: null,
  provider_key: "resend_api",
  status: "failed_retryable",
  provider_message_id: null,
  error_code: "provider_rate_limited",
  retry_after_seconds: 60,
  redacted_error_message: "Provider rate limited.",
  attempt_metadata: {},
  created_at: "2026-05-06T18:01:00.000Z",
  updated_at: "2026-05-06T18:01:00.000Z",
};

describe("admin message helpers", () => {
  it("maps legacy triaged rows into the read bucket", () => {
    expect(getAdminMessageStatusBucket("triaged")).toBe("read");
  });

  it("keeps archived and deleted rows restore-only", () => {
    expect(resolveAdminMessageStatusAction("archived", "restore")).toEqual({
      ok: true,
      value: { nextStatus: "new" },
    });
    expect(resolveAdminMessageStatusAction("deleted", "mark_read")).toEqual({
      ok: false,
      error: "Restore deleted messages before changing their status.",
    });
    expect(resolveAdminMessageStatusAction("archived", "needs_reply")).toEqual({
      ok: false,
      error: "Restore archived messages before changing their status.",
    });
  });

  it("resolves inbox status actions deterministically", () => {
    expect(resolveAdminMessageStatusAction("new", "mark_read")).toEqual({
      ok: true,
      value: { nextStatus: "read" },
    });
    expect(resolveAdminMessageStatusAction("read", "needs_reply")).toEqual({
      ok: true,
      value: { nextStatus: "needs_reply" },
    });
    expect(resolveAdminMessageStatusAction("needs_reply", "mark_replied")).toEqual({
      ok: true,
      value: { nextStatus: "replied" },
    });
    expect(resolveAdminMessageStatusAction("replied", "archive")).toEqual({
      ok: true,
      value: { nextStatus: "archived" },
    });
    expect(resolveAdminMessageStatusAction("read", "delete")).toEqual({
      ok: true,
      value: { nextStatus: "deleted" },
    });
  });

  it("parses only supported action payloads", () => {
    expect(parseAdminMessageStatusActionPayload({ action: "archive" })).toEqual({
      ok: true,
      value: { action: "archive" },
    });
    expect(parseAdminMessageStatusActionPayload({ action: "hard_delete" })).toEqual({
      ok: false,
      error: "Unsupported message action.",
    });
  });

  it("formats structured intake and diagnostics without raw request metadata", () => {
    expect(buildAdminMessageStructuredEntries(baseMessage.structured_intake)).toEqual([
      { key: "trainingDaysPerWeek", label: "Training Days Per Week", value: "3" },
      { key: "primaryGoal", label: "Primary Goal", value: "Swim 1000m" },
    ]);
    expect(buildAdminMessageRequestDiagnostics(baseMessage.request_metadata)).toEqual([
      { label: "Origin host", value: "freeswimming.test" },
      { label: "Content length", value: "320 bytes" },
      { label: "IP evidence", value: "Hashed" },
      { label: "User agent evidence", value: "Hashed" },
    ]);
  });

  it("builds a safe bounded PostgREST search filter", () => {
    expect(buildAdminMessageSearchOrFilter("  test@example.com, hello  ")).toBe(
      "submitter_email.ilike.%test@example.com hello%,submitter_name.ilike.%test@example.com hello%,message_body.ilike.%test@example.com hello%"
    );
    expect(buildAdminMessageSearchOrFilter("a")).toBeNull();
  });

  it("creates the admin message view model", () => {
    const item = toAdminMessageItem({
      row: baseMessage,
      deliveryAttempts: [baseAttempt],
    });

    expect(item).toMatchObject({
      id: baseMessage.id,
      sourceLabel: "Early access",
      statusLabel: "New",
      notificationStatusLabel: "Retryable failure",
      messageExcerpt: "I want early access.",
    });
    expect(item.deliveryAttempts).toHaveLength(1);
    expect(item.deliveryAttempts[0]).toMatchObject({
      providerLabel: "Resend API",
      statusLabel: "Retryable failure",
      redactedErrorMessage: "Provider rate limited.",
    });
  });
});
