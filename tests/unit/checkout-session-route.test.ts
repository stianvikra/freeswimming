import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createAdminSupabaseClientMock,
  getServerSupabaseUserIfAuthCookiePresentMock,
  getAppUrlMock,
  createStripeClientMock,
  upsertCatalogProductsMock,
  trackAndPersistAnalyticsEventMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  getAppUrlMock: vi.fn(),
  createStripeClientMock: vi.fn(),
  upsertCatalogProductsMock: vi.fn(),
  trackAndPersistAnalyticsEventMock: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: createAdminSupabaseClientMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/supabase/env", () => ({
  getAppUrl: getAppUrlMock,
}));

vi.mock("@/lib/stripe/server", () => ({
  createStripeClient: createStripeClientMock,
}));

vi.mock("@/lib/commerce/entitlements", () => ({
  upsertCatalogProducts: upsertCatalogProductsMock,
}));

vi.mock("@/lib/analytics/persistence", () => ({
  trackAndPersistAnalyticsEvent: trackAndPersistAnalyticsEventMock,
}));

import { POST } from "@/app/api/checkout/session/route";

type ProductStateResult = {
  data: { active: boolean } | null;
  error: { message: string } | null;
};

function buildRequest(body: Record<string, unknown>, contentType = "application/json") {
  return new Request("https://freeswimming.example/api/checkout/session", {
    method: "POST",
    headers: {
      "content-type": contentType,
    },
    body: contentType === "application/json" ? JSON.stringify(body) : String(body.payload ?? ""),
  });
}

function buildProductStateClient(result: ProductStateResult) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const limit = vi.fn().mockReturnValue({ maybeSingle });
  const eq = vi.fn().mockReturnValue({ limit });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  return {
    supabase: { from },
    from,
    select,
    eq,
    limit,
    maybeSingle,
  };
}

function buildStripeClient(input?: { url?: string | null; reject?: boolean }) {
  const create = input?.reject
    ? vi.fn().mockRejectedValue(new Error("stripe unavailable"))
    : vi.fn().mockResolvedValue({
        id: "cs_test_should_not_leave_server",
        url:
          input && "url" in input
            ? input.url
            : "https://checkout.stripe.com/c/pay/cs_test_redirect",
      });

  return {
    checkout: {
      sessions: {
        create,
      },
    },
  };
}

describe("/api/checkout/session route", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_PRICE_ID_0_1000M_GUIDE", "price_0_1000m");
    vi.stubEnv("STRIPE_PRICE_ID_POOLSIDE_GUIDE", "price_poolside");
    vi.stubEnv("STRIPE_PRICE_ID_ANALYSIS", "price_analysis");
    getAppUrlMock.mockReturnValue("https://freeswimming.example");
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      user: {
        id: "11111111-1111-4111-8111-111111111111",
        email: "swimmer@example.com",
      },
    });
    upsertCatalogProductsMock.mockResolvedValue(undefined);
    trackAndPersistAnalyticsEventMock.mockResolvedValue({ ok: true });
    createAdminSupabaseClientMock.mockReturnValue(
      buildProductStateClient({ data: { active: true }, error: null }).supabase
    );
    createStripeClientMock.mockReturnValue(buildStripeClient());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("creates a checkout session with safe source attribution and no session id in analytics or response", async () => {
    const stripe = buildStripeClient();
    createStripeClientMock.mockReturnValue(stripe);

    const response = await POST(
      buildRequest({
        productId: "guide_poolside",
        cancelPath: "/plans",
        source: "plans",
        placementId: "workout_saved_post_success",
      })
    );
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      url: "https://checkout.stripe.com/c/pay/cs_test_redirect",
    });
    expect(JSON.stringify(payload)).not.toContain("sessionId");
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        cancel_url: "https://freeswimming.example/plans",
        line_items: [{ price: "price_poolside", quantity: 1 }],
      }),
      {
        idempotencyKey: expect.stringMatching(/^checkout-session:/),
      }
    );
    expect(trackAndPersistAnalyticsEventMock).toHaveBeenCalledWith({
      eventName: "checkout_started",
      channel: "server",
      userId: "11111111-1111-4111-8111-111111111111",
      payload: {
        productId: "guide_poolside",
        source: "plans",
      },
    });
    expect(JSON.stringify(trackAndPersistAnalyticsEventMock.mock.calls[0]?.[0])).not.toContain(
      "sessionId"
    );
    expect(JSON.stringify(trackAndPersistAnalyticsEventMock.mock.calls[0]?.[0])).not.toContain(
      "cs_test"
    );
  });

  it("keeps mapped workout-context placement and normalizes unknown checkout sources", async () => {
    await POST(
      buildRequest({
        productId: "guide_poolside",
        source: "workout_context",
        placementId: "workout_saved_post_success",
      })
    );

    expect(trackAndPersistAnalyticsEventMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        payload: {
          productId: "guide_poolside",
          source: "workout_context",
          placementId: "workout_saved_post_success",
        },
      })
    );

    trackAndPersistAnalyticsEventMock.mockClear();

    await POST(
      buildRequest({
        productId: "guide_poolside",
        source: "https://evil.example/checkout?token=secret",
        placementId: "future_unmapped_placement",
      })
    );

    expect(trackAndPersistAnalyticsEventMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        payload: {
          productId: "guide_poolside",
          source: "unknown",
        },
      })
    );
  });

  it("fails closed before provider calls for invalid request and unavailable products", async () => {
    const stripe = buildStripeClient();
    createStripeClientMock.mockReturnValue(stripe);

    const unsupportedResponse = await POST(buildRequest({ payload: "invalid" }, "text/plain"));
    expect(unsupportedResponse.status).toBe(415);
    await expect(unsupportedResponse.json()).resolves.toEqual({
      ok: false,
      error: "Unsupported content type.",
    });

    const unknownResponse = await POST(buildRequest({ productId: "missing_product" }));
    expect(unknownResponse.status).toBe(400);
    await expect(unknownResponse.json()).resolves.toEqual({
      ok: false,
      error: "Unknown product.",
    });

    createAdminSupabaseClientMock.mockReturnValue(
      buildProductStateClient({ data: { active: false }, error: null }).supabase
    );
    const inactiveResponse = await POST(buildRequest({ productId: "guide_poolside" }));
    expect(inactiveResponse.status).toBe(409);
    await expect(inactiveResponse.json()).resolves.toEqual({
      ok: false,
      error: "This product is currently unavailable.",
    });

    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
    expect(trackAndPersistAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("returns deterministic safe errors for missing config, provider failure, and missing redirect URL", async () => {
    vi.unstubAllEnvs();

    const missingConfigResponse = await POST(buildRequest({ productId: "guide_poolside" }));
    expect(missingConfigResponse.status).toBe(500);
    await expect(missingConfigResponse.json()).resolves.toEqual({
      ok: false,
      error: "Could not verify product availability right now.",
    });

    vi.stubEnv("STRIPE_PRICE_ID_0_1000M_GUIDE", "price_0_1000m");
    vi.stubEnv("STRIPE_PRICE_ID_POOLSIDE_GUIDE", "price_poolside");
    vi.stubEnv("STRIPE_PRICE_ID_ANALYSIS", "price_analysis");
    const stripeFailure = buildStripeClient({ reject: true });
    createStripeClientMock.mockReturnValue(stripeFailure);

    const providerFailureResponse = await POST(buildRequest({ productId: "guide_poolside" }));
    expect(providerFailureResponse.status).toBe(500);
    await expect(providerFailureResponse.json()).resolves.toEqual({
      ok: false,
      error: "Could not create checkout session.",
    });
    expect(trackAndPersistAnalyticsEventMock).not.toHaveBeenCalled();

    const missingUrlStripe = buildStripeClient({ url: null });
    createStripeClientMock.mockReturnValue(missingUrlStripe);

    const missingUrlResponse = await POST(buildRequest({ productId: "guide_poolside" }));
    expect(missingUrlResponse.status).toBe(500);
    await expect(missingUrlResponse.json()).resolves.toEqual({
      ok: false,
      error: "Checkout session missing URL.",
    });
    expect(trackAndPersistAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("fails soft when checkout-start analytics persistence throws after session creation", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    trackAndPersistAnalyticsEventMock.mockRejectedValue(new Error("analytics unavailable"));

    const response = await POST(
      buildRequest({
        productId: "guide_poolside",
        source: "library_explore",
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      url: "https://checkout.stripe.com/c/pay/cs_test_redirect",
    });
    expect(consoleError).toHaveBeenCalledWith(
      "[Checkout] Could not persist checkout-start analytics",
      expect.objectContaining({
        productId: "guide_poolside",
        source: "library_explore",
        message: "analytics unavailable",
      })
    );
  });
});
