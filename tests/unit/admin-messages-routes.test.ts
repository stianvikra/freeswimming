import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminMessageDeliveryAttemptRow, AdminMessageRow } from "@/lib/admin/messages";

const {
  createRouteHandlerSupabaseClientMock,
  requireAdminRoleFromSupabaseMock,
  trackAnalyticsEventMock,
} = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
  requireAdminRoleFromSupabaseMock: vi.fn(),
  trackAnalyticsEventMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/admin/server", () => ({
  requireAdminRoleFromSupabase: requireAdminRoleFromSupabaseMock,
}));

vi.mock("@/lib/analytics/events", () => ({
  trackAnalyticsEvent: trackAnalyticsEventMock,
}));

import { GET as listMessages } from "@/app/api/admin/messages/route";
import { GET as getMessage, PATCH as patchMessage } from "@/app/api/admin/messages/[id]/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function routeContext(id: string) {
  return {
    params: Promise.resolve({ id }),
  };
}

function buildQueryChain(result: unknown) {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    or: vi.fn(),
    lt: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    update: vi.fn(),
    maybeSingle: vi.fn(),
  };

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.in.mockReturnValue(chain);
  chain.or.mockReturnValue(chain);
  chain.lt.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.limit.mockResolvedValue(result);
  chain.maybeSingle.mockResolvedValue(result);

  return chain;
}

const baseMessage: AdminMessageRow = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  source_variant: "contact",
  submitter_name: "Test Swimmer",
  submitter_email: "swimmer@example.com",
  message_body: "Please help me with freestyle.",
  structured_intake: {},
  request_metadata: {
    originHost: "freeswimming.test",
    ipHash: "hashed-ip",
  },
  status: "new",
  notification_status: "accepted_by_provider",
  notification_error_code: null,
  created_at: "2026-05-06T18:00:00.000Z",
  updated_at: "2026-05-06T18:00:00.000Z",
};

const baseAttempt: AdminMessageDeliveryAttemptRow = {
  id: "123e4567-e89b-42d3-a456-426614174111",
  target: "inbound_notification",
  message_id: baseMessage.id,
  reply_id: null,
  provider_key: "resend_api",
  status: "accepted_by_provider",
  provider_message_id: "provider-1",
  error_code: null,
  retry_after_seconds: null,
  redacted_error_message: null,
  attempt_metadata: {},
  created_at: "2026-05-06T18:01:00.000Z",
  updated_at: "2026-05-06T18:01:00.000Z",
};

describe("admin messages routes", () => {
  beforeEach(() => {
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "admin-user-id" },
      role: "admin",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated list access", async () => {
    requireAdminRoleFromSupabaseMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      error: "Unauthorized.",
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: { from: vi.fn() },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await listMessages(
      new Request("https://freeswimming.test/api/admin/messages")
    );
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(401);
    expect(payload).toEqual({ ok: false, error: "Unauthorized." });
  });

  it("lists messages with bounded filters and redacted diagnostics", async () => {
    const listChain = buildQueryChain({
      data: [baseMessage],
      error: null,
    });
    const attemptsChain = buildQueryChain({
      data: [baseAttempt],
      error: null,
    });
    const from = vi
      .fn()
      .mockImplementationOnce(() => ({ select: listChain.select }))
      .mockImplementationOnce(() => ({ select: attemptsChain.select }));
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: { from },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await listMessages(
      new Request(
        "https://freeswimming.test/api/admin/messages?status=read&source=contact&q=swimmer&pageSize=10&before=2026-05-06T19%3A00%3A00.000Z"
      )
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      items?: Array<{ id: string; submitterEmail: string; requestDiagnostics: unknown[] }>;
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.items?.[0]).toMatchObject({
      id: baseMessage.id,
      submitterEmail: "swimmer@example.com",
      requestDiagnostics: [
        { label: "Origin host", value: "freeswimming.test" },
        { label: "IP evidence", value: "Hashed" },
      ],
    });
    expect(listChain.in).toHaveBeenCalledWith("status", ["read", "triaged"]);
    expect(listChain.eq).toHaveBeenCalledWith("source_variant", "contact");
    expect(listChain.or).toHaveBeenCalledWith(
      "submitter_email.ilike.%swimmer%,submitter_name.ilike.%swimmer%,message_body.ilike.%swimmer%"
    );
    expect(listChain.lt).toHaveBeenCalledWith("created_at", "2026-05-06T19:00:00.000Z");
    expect(listChain.limit).toHaveBeenCalledWith(11);
    expect(attemptsChain.in).toHaveBeenCalledWith("message_id", [baseMessage.id]);
  });

  it("rejects invalid message ids before auth lookup", async () => {
    const response = await getMessage(
      new Request("https://freeswimming.test/api/admin/messages/not-a-uuid"),
      routeContext("not-a-uuid")
    );
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, error: "Invalid message id." });
    expect(createRouteHandlerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported mutation actions", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: { from: vi.fn() },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchMessage(
      new Request(`https://freeswimming.test/api/admin/messages/${baseMessage.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "hard_delete" }),
      }),
      routeContext(baseMessage.id)
    );
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, error: "Unsupported message action." });
  });

  it("updates workflow status and tracks a safe analytics event", async () => {
    const currentChain = buildQueryChain({
      data: baseMessage,
      error: null,
    });
    const updatedMessage = {
      ...baseMessage,
      status: "needs_reply" as const,
      updated_at: "2026-05-06T18:05:00.000Z",
    };
    const updateChain = buildQueryChain({
      data: updatedMessage,
      error: null,
    });
    const attemptsChain = buildQueryChain({
      data: [baseAttempt],
      error: null,
    });
    const from = vi
      .fn()
      .mockImplementationOnce(() => ({ select: currentChain.select }))
      .mockImplementationOnce(() => ({ update: updateChain.update }))
      .mockImplementationOnce(() => ({ select: attemptsChain.select }));
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: { from },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchMessage(
      new Request(`https://freeswimming.test/api/admin/messages/${baseMessage.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "needs_reply" }),
      }),
      routeContext(baseMessage.id)
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      item?: { status: string; statusLabel: string };
    };

    expect(response.status).toBe(200);
    expect(payload.item).toMatchObject({
      status: "needs_reply",
      statusLabel: "Needs reply",
    });
    expect(updateChain.update).toHaveBeenCalledWith({ status: "needs_reply" });
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith({
      eventName: "admin_message_status_changed",
      channel: "server",
      userId: "admin-user-id",
      payload: {
        action: "needs_reply",
        previousStatus: "new",
        nextStatus: "needs_reply",
        sourceVariant: "contact",
        notificationStatus: "accepted_by_provider",
        hadNotificationError: false,
      },
    });
  });
});
