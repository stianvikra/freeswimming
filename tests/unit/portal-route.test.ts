import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  attachGuestEntitlementsByEmailMock,
  createAdminSupabaseClientMock,
  getServerSupabaseUserIfAuthCookiePresentMock,
  createStripeClientMock,
  getAppUrlMock,
} = vi.hoisted(() => ({
  attachGuestEntitlementsByEmailMock: vi.fn(),
  createAdminSupabaseClientMock: vi.fn(),
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  createStripeClientMock: vi.fn(),
  getAppUrlMock: vi.fn(),
}));

vi.mock("@/lib/commerce/entitlements", () => ({
  attachGuestEntitlementsByEmail: attachGuestEntitlementsByEmailMock,
  normalizeEmail: (email: string) => email.trim().toLowerCase(),
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

import { POST } from "@/app/api/portal/route";

type SupabaseResult = {
  data: Record<string, unknown> | null;
  error: { message: string } | null;
};

function buildRequest(body: Record<string, unknown>) {
  return new Request("https://freeswimming.example/api/portal", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function buildSelectMaybeSingleChain(result: SupabaseResult, shape: "existing" | "missing") {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const limit = vi.fn().mockReturnValue({ maybeSingle });

  if (shape === "existing") {
    const order = vi.fn().mockReturnValue({ limit });
    const not = vi.fn().mockReturnValue({ order });
    const eq = vi.fn().mockReturnValue({ not });
    return { eq };
  }

  const is = vi.fn().mockReturnValue({ limit });
  const eq = vi.fn().mockReturnValue({ is });
  return { eq };
}

function buildPortalSupabaseClient(input: {
  entitlementWithCustomer: SupabaseResult;
  entitlementMissingCustomer: SupabaseResult;
}) {
  const select = vi.fn((columns: string) => {
    if (columns === "stripe_customer_id") {
      return buildSelectMaybeSingleChain(input.entitlementWithCustomer, "existing");
    }
    if (columns === "id") {
      return buildSelectMaybeSingleChain(input.entitlementMissingCustomer, "missing");
    }
    throw new Error(`Unexpected select columns: ${columns}`);
  });
  const from = vi.fn((table: string) => {
    expect(table).toBe("entitlements");
    return { select };
  });

  return {
    from,
    select,
  };
}

function buildStripeClient() {
  return {
    customers: {
      list: vi.fn().mockResolvedValue({ data: [{ id: "cus_email_match" }] }),
    },
    billingPortal: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          url: "https://billing.stripe.com/session/test",
        }),
      },
    },
  };
}

describe("/api/portal route", () => {
  beforeEach(() => {
    attachGuestEntitlementsByEmailMock.mockResolvedValue(0);
    createAdminSupabaseClientMock.mockReturnValue({});
    getAppUrlMock.mockReturnValue("https://freeswimming.example");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates the billing portal for the owned entitlement customer and ignores request customer ids", async () => {
    const supabase = buildPortalSupabaseClient({
      entitlementWithCustomer: {
        data: { stripe_customer_id: "cus_owned" },
        error: null,
      },
      entitlementMissingCustomer: {
        data: null,
        error: null,
      },
    });
    const stripe = buildStripeClient();
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase,
      user: {
        id: "11111111-1111-4111-8111-111111111111",
        email: "Swimmer@Example.com",
      },
      error: null,
      hasAuthCookie: true,
    });
    createStripeClientMock.mockReturnValue(stripe);

    const response = await POST(
      buildRequest({
        returnPath: "/my-library",
        customer: "cus_attacker",
      })
    );
    const payload = (await response.json()) as { ok?: boolean; url?: string };

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      url: "https://billing.stripe.com/session/test",
    });
    expect(stripe.customers.list).not.toHaveBeenCalled();
    expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: "cus_owned",
      return_url: "https://freeswimming.example/my-library",
    });
  });

  it("does not open an email-matched Stripe customer without an owned entitlement", async () => {
    const supabase = buildPortalSupabaseClient({
      entitlementWithCustomer: {
        data: null,
        error: null,
      },
      entitlementMissingCustomer: {
        data: null,
        error: null,
      },
    });
    const stripe = buildStripeClient();
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase,
      user: {
        id: "11111111-1111-4111-8111-111111111111",
        email: "Swimmer@Example.com",
      },
      error: null,
      hasAuthCookie: true,
    });
    createStripeClientMock.mockReturnValue(stripe);

    const response = await POST(buildRequest({ returnPath: "/my-library" }));
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(404);
    expect(payload).toEqual({
      ok: false,
      error: "No Stripe billing account found for this user.",
    });
    expect(stripe.customers.list).not.toHaveBeenCalled();
    expect(stripe.billingPortal.sessions.create).not.toHaveBeenCalled();
  });
});
