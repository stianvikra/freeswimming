import type Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createAdminSupabaseClientMock,
  findProfileIdByEmailMock,
  normalizeEmailMock,
  upsertCatalogProductsMock,
  upsertStripeEntitlementMock,
  trackAndPersistAnalyticsEventMock,
  createStripeClientMock,
  getStripeWebhookSecretMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  findProfileIdByEmailMock: vi.fn(),
  normalizeEmailMock: vi.fn((email: string) => email.trim().toLowerCase()),
  upsertCatalogProductsMock: vi.fn(),
  upsertStripeEntitlementMock: vi.fn(),
  trackAndPersistAnalyticsEventMock: vi.fn(),
  createStripeClientMock: vi.fn(),
  getStripeWebhookSecretMock: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: createAdminSupabaseClientMock,
}));

vi.mock("@/lib/commerce/entitlements", () => ({
  findProfileIdByEmail: findProfileIdByEmailMock,
  normalizeEmail: normalizeEmailMock,
  upsertCatalogProducts: upsertCatalogProductsMock,
  upsertStripeEntitlement: upsertStripeEntitlementMock,
}));

vi.mock("@/lib/analytics/persistence", () => ({
  trackAndPersistAnalyticsEvent: trackAndPersistAnalyticsEventMock,
}));

vi.mock("@/lib/stripe/server", () => ({
  createStripeClient: createStripeClientMock,
  getStripeWebhookSecret: getStripeWebhookSecretMock,
}));

import { POST } from "@/app/api/stripe/webhook/route";

const validUserId = "11111111-1111-4111-8111-111111111111";

function buildRequest(input?: { signature?: string | null }) {
  const headers = new Headers();
  if (input?.signature !== null) {
    headers.set("stripe-signature", input?.signature ?? "test_signature");
  }

  return new Request("https://freeswimming.example/api/stripe/webhook", {
    method: "POST",
    headers,
    body: JSON.stringify({ id: "evt_test" }),
  });
}

function buildCheckoutSession(input: Partial<Stripe.Checkout.Session> = {}) {
  return {
    id: "cs_test_should_not_reach_analytics",
    object: "checkout.session",
    mode: "payment",
    payment_status: "paid",
    client_reference_id: validUserId,
    customer: "cus_test_should_remain_server_side",
    customer_details: {
      email: "Buyer@Example.com",
    },
    created: Math.floor(Date.now() / 1000) - 5,
    currency: "usd",
    metadata: {
      fs_product_id: "guide_poolside",
    },
    total_details: {
      amount_discount: 0,
    },
    ...input,
  } as Stripe.Checkout.Session;
}

function buildEvent(type: Stripe.Event.Type, session: Stripe.Checkout.Session) {
  return {
    id: "evt_test",
    object: "event",
    type,
    data: {
      object: session,
    },
  } as Stripe.Event;
}

function buildLineItems(data: Stripe.LineItem[] = []): Stripe.ApiList<Stripe.LineItem> {
  return {
    object: "list",
    data,
    has_more: false,
    url: "/v1/checkout/sessions/cs_test_should_not_reach_analytics/line_items",
  };
}

function buildStripeClient(input: {
  event?: Stripe.Event;
  constructEventError?: Error;
  lineItems?: Stripe.ApiList<Stripe.LineItem>;
  lineItemsError?: Error;
}) {
  const constructEvent = input.constructEventError
    ? vi.fn().mockImplementation(() => {
        throw input.constructEventError;
      })
    : vi.fn().mockReturnValue(input.event);
  const listLineItems = input.lineItemsError
    ? vi.fn().mockRejectedValue(input.lineItemsError)
    : vi.fn().mockResolvedValue(input.lineItems ?? buildLineItems());

  return {
    stripe: {
      webhooks: {
        constructEvent,
      },
      checkout: {
        sessions: {
          listLineItems,
        },
      },
    } as unknown as Stripe,
    constructEvent,
    listLineItems,
  };
}

function getTrackedPayload(eventName: string) {
  const call = trackAndPersistAnalyticsEventMock.mock.calls.find(
    ([input]) => input.eventName === eventName
  );
  return call?.[0].payload as Record<string, unknown> | undefined;
}

describe("/api/stripe/webhook route", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_PRICE_ID_0_1000M_GUIDE", "price_0_1000m");
    vi.stubEnv("STRIPE_PRICE_ID_POOLSIDE_GUIDE", "price_poolside");
    vi.stubEnv("STRIPE_PRICE_ID_ANALYSIS", "price_analysis");
    createAdminSupabaseClientMock.mockReturnValue({ from: vi.fn() });
    findProfileIdByEmailMock.mockResolvedValue("profile-from-email");
    upsertCatalogProductsMock.mockResolvedValue(undefined);
    upsertStripeEntitlementMock.mockResolvedValue(undefined);
    trackAndPersistAnalyticsEventMock.mockResolvedValue({ ok: true });
    getStripeWebhookSecretMock.mockReturnValue("whsec_test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("propagates mapped workout-context attribution after verified paid completion and entitlement fulfillment", async () => {
    const session = buildCheckoutSession({
      metadata: {
        fs_product_id: "guide_poolside",
        fs_attribution_source: "workout_context",
        fs_attribution_placement_id: "workout_saved_post_success",
        fs_attribution_product_id: "guide_poolside",
      },
    });
    const stripe = buildStripeClient({
      event: buildEvent("checkout.session.completed", session),
    });
    createStripeClientMock.mockReturnValue(stripe.stripe);

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(stripe.constructEvent).toHaveBeenCalledWith(
      JSON.stringify({ id: "evt_test" }),
      "test_signature",
      "whsec_test"
    );
    expect(trackAndPersistAnalyticsEventMock).toHaveBeenCalledWith({
      eventName: "checkout_completed",
      channel: "server",
      userId: validUserId,
      payload: {
        productId: "guide_poolside",
        eventType: "checkout.session.completed",
        source: "workout_context",
        placementId: "workout_saved_post_success",
      },
    });
    expect(upsertStripeEntitlementMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: validUserId,
        purchaserEmail: "buyer@example.com",
        productId: "guide_poolside",
        stripeCheckoutSessionId: "cs_test_should_not_reach_analytics",
      })
    );
    const entitlementPayload = getTrackedPayload("entitlement_granted");
    expect(entitlementPayload).toMatchObject({
      productId: "guide_poolside",
      source: "workout_context",
      placementId: "workout_saved_post_success",
      grantedLatencyMs: expect.any(Number),
    });
    expect(JSON.stringify(trackAndPersistAnalyticsEventMock.mock.calls)).not.toContain(
      "cs_test_should_not_reach_analytics"
    );
    expect(JSON.stringify(trackAndPersistAnalyticsEventMock.mock.calls)).not.toContain(
      "cus_test_should_remain_server_side"
    );
  });

  it("keeps completion and entitlement generic when attribution metadata product mismatches", async () => {
    const session = buildCheckoutSession({
      metadata: {
        fs_product_id: "guide_poolside",
        fs_attribution_source: "workout_context",
        fs_attribution_placement_id: "workout_saved_post_success",
        fs_attribution_product_id: "guide_0_1000m",
      },
    });
    const stripe = buildStripeClient({
      event: buildEvent("checkout.session.completed", session),
    });
    createStripeClientMock.mockReturnValue(stripe.stripe);

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    const checkoutPayload = getTrackedPayload("checkout_completed");
    const entitlementPayload = getTrackedPayload("entitlement_granted");
    expect(checkoutPayload).toEqual({
      productId: "guide_poolside",
      eventType: "checkout.session.completed",
    });
    expect(entitlementPayload).toMatchObject({
      productId: "guide_poolside",
      grantedLatencyMs: expect.any(Number),
    });
    expect(entitlementPayload).not.toHaveProperty("source");
    expect(entitlementPayload).not.toHaveProperty("placementId");
  });

  it("rejects invalid signatures before analytics or entitlement writes", async () => {
    const stripe = buildStripeClient({
      constructEventError: new Error("bad signature"),
    });
    createStripeClientMock.mockReturnValue(stripe.stripe);

    const response = await POST(buildRequest());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Invalid webhook signature.",
    });
    expect(trackAndPersistAnalyticsEventMock).not.toHaveBeenCalled();
    expect(upsertStripeEntitlementMock).not.toHaveBeenCalled();
  });

  it("rejects missing signatures and ignores unsupported events without writes", async () => {
    const missingSignatureResponse = await POST(buildRequest({ signature: null }));

    expect(missingSignatureResponse.status).toBe(400);
    await expect(missingSignatureResponse.json()).resolves.toEqual({
      ok: false,
      error: "Missing stripe-signature header.",
    });
    expect(createStripeClientMock).not.toHaveBeenCalled();

    const stripe = buildStripeClient({
      event: buildEvent("payment_intent.succeeded", buildCheckoutSession()),
    });
    createStripeClientMock.mockReturnValue(stripe.stripe);

    const ignoredResponse = await POST(buildRequest());

    expect(ignoredResponse.status).toBe(200);
    await expect(ignoredResponse.json()).resolves.toEqual({ ok: true, ignored: true });
    expect(trackAndPersistAnalyticsEventMock).not.toHaveBeenCalled();
    expect(upsertStripeEntitlementMock).not.toHaveBeenCalled();
  });

  it("defers non-paid completed sessions without analytics or entitlement writes", async () => {
    const session = buildCheckoutSession({ payment_status: "unpaid" });
    const stripe = buildStripeClient({
      event: buildEvent("checkout.session.completed", session),
    });
    createStripeClientMock.mockReturnValue(stripe.stripe);

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, deferred: true });
    expect(trackAndPersistAnalyticsEventMock).not.toHaveBeenCalled();
    expect(upsertStripeEntitlementMock).not.toHaveBeenCalled();
  });

  it("handles async payment success as completion input", async () => {
    const session = buildCheckoutSession({ payment_status: "unpaid" });
    const stripe = buildStripeClient({
      event: buildEvent("checkout.session.async_payment_succeeded", session),
    });
    createStripeClientMock.mockReturnValue(stripe.stripe);

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(getTrackedPayload("checkout_completed")).toMatchObject({
      productId: "guide_poolside",
      eventType: "checkout.session.async_payment_succeeded",
    });
    expect(upsertStripeEntitlementMock).toHaveBeenCalledTimes(1);
  });

  it("emits completion but not entitlement when purchaser email is missing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const session = buildCheckoutSession({
      customer_details: null,
      customer_email: null,
    });
    const stripe = buildStripeClient({
      event: buildEvent("checkout.session.completed", session),
    });
    createStripeClientMock.mockReturnValue(stripe.stripe);

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(getTrackedPayload("checkout_completed")).toMatchObject({
      productId: "guide_poolside",
      eventType: "checkout.session.completed",
    });
    expect(getTrackedPayload("entitlement_granted")).toBeUndefined();
    expect(upsertStripeEntitlementMock).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      "[StripeWebhook] Session missing purchaser email",
      expect.objectContaining({ sessionId: "cs_test_should_not_reach_analytics" })
    );
  });

  it("emits generic completion without mapped success semantics when product is unresolved", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const session = buildCheckoutSession({
      metadata: {},
    });
    const stripe = buildStripeClient({
      event: buildEvent("checkout.session.completed", session),
      lineItems: buildLineItems(),
    });
    createStripeClientMock.mockReturnValue(stripe.stripe);

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(stripe.listLineItems).toHaveBeenCalledWith("cs_test_should_not_reach_analytics", {
      limit: 1,
    });
    expect(getTrackedPayload("checkout_completed")).toEqual({
      productId: null,
      eventType: "checkout.session.completed",
    });
    expect(getTrackedPayload("entitlement_granted")).toBeUndefined();
    expect(upsertStripeEntitlementMock).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      "[StripeWebhook] Could not resolve product for session",
      expect.objectContaining({ sessionId: "cs_test_should_not_reach_analytics" })
    );
  });

  it("fails closed when provider fallback product lookup fails", async () => {
    const session = buildCheckoutSession({
      metadata: {},
    });
    const stripe = buildStripeClient({
      event: buildEvent("checkout.session.completed", session),
      lineItemsError: new Error("stripe line items unavailable"),
    });
    createStripeClientMock.mockReturnValue(stripe.stripe);

    const response = await POST(buildRequest());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Webhook fulfillment failed.",
    });
    expect(trackAndPersistAnalyticsEventMock).not.toHaveBeenCalled();
    expect(upsertStripeEntitlementMock).not.toHaveBeenCalled();
  });
});
