import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { attachGuestEntitlementsByEmail, normalizeEmail } from "@/lib/commerce/entitlements";
import { getSafePortalReturnPath, pickActiveStripeCustomerId } from "@/lib/commerce/portal";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createStripeClient } from "@/lib/stripe/server";

type PortalBody = {
  returnPath?: string;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

async function resolveStripeCustomerId(params: {
  stripe: Stripe;
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  userId: string;
  userEmail: string | null;
}): Promise<string | null> {
  const { stripe, supabase, userId, userEmail } = params;

  const { data: entitlementWithCustomer, error: entitlementError } = await supabase
    .from("entitlements")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .not("stripe_customer_id", "is", null)
    .order("granted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (entitlementError) {
    throw new Error(`Could not resolve entitlement customer id: ${entitlementError.message}`);
  }

  const existingCustomerId = entitlementWithCustomer?.stripe_customer_id?.trim();
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const normalizedEmail = userEmail ? normalizeEmail(userEmail) : "";
  if (!normalizedEmail) {
    return null;
  }

  const { data: ownedEntitlementMissingCustomer, error: missingCustomerError } = await supabase
    .from("entitlements")
    .select("id")
    .eq("user_id", userId)
    .is("stripe_customer_id", null)
    .limit(1)
    .maybeSingle();

  if (missingCustomerError) {
    throw new Error(
      `Could not verify owned entitlement before customer fallback: ${missingCustomerError.message}`
    );
  }

  if (!ownedEntitlementMissingCustomer) {
    return null;
  }

  const customers = await stripe.customers.list({
    email: normalizedEmail,
    limit: 10,
  });

  const fallbackCustomerId = pickActiveStripeCustomerId(customers.data);
  if (!fallbackCustomerId) {
    return null;
  }

  // Best effort persistence for faster future portal opens.
  const { error: persistError } = await supabase
    .from("entitlements")
    .update({ stripe_customer_id: fallbackCustomerId })
    .eq("user_id", userId)
    .is("stripe_customer_id", null);

  if (persistError) {
    console.error("[PortalApi] Could not persist stripe_customer_id fallback", persistError);
  }

  return fallbackCustomerId;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return jsonNoStore({ ok: false, error: "Unsupported content type." }, 415);
  }

  let body: PortalBody;
  try {
    body = (await request.json()) as PortalBody;
  } catch {
    return jsonNoStore({ ok: false, error: "Invalid JSON." }, 400);
  }

  const returnPath = getSafePortalReturnPath(body.returnPath, "/my-library");
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonNoStore({ ok: false, error: "Unauthorized." }, 401);
  }

  if (user.email) {
    try {
      const adminSupabase = createAdminSupabaseClient();
      await attachGuestEntitlementsByEmail(adminSupabase, user.id, user.email);
    } catch (error) {
      console.error("[PortalApi] Could not attach guest entitlements by email", error);
    }
  }

  try {
    const stripe = createStripeClient();
    const customerId = await resolveStripeCustomerId({
      stripe,
      supabase,
      userId: user.id,
      userEmail: user.email ?? null,
    });

    if (!customerId) {
      return jsonNoStore(
        {
          ok: false,
          error: "No Stripe billing account found for this user.",
        },
        404
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: new URL(returnPath, getAppUrl()).toString(),
    });

    if (!portalSession.url) {
      return jsonNoStore(
        {
          ok: false,
          error: "Could not create billing portal session.",
        },
        500
      );
    }

    return jsonNoStore({ ok: true, url: portalSession.url });
  } catch (error) {
    console.error("[PortalApi] Could not create billing portal session", error);
    return jsonNoStore({ ok: false, error: "Could not create billing portal session." }, 500);
  }
}
