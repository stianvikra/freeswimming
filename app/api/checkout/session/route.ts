import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/supabase/env";
import { getCatalogProductById, getCatalogProducts } from "@/lib/commerce/catalog";
import { upsertCatalogProducts } from "@/lib/commerce/entitlements";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { createStripeClient } from "@/lib/stripe/server";

type CheckoutBody = {
  productId?: string;
  cancelPath?: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSafePath(input: string | undefined, fallback: string) {
  if (!input) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//")) return fallback;
  return input;
}

function getSuccessUrl(origin: string) {
  const successUrl = new URL("/checkout/success", origin).toString();
  return `${successUrl}?session_id={CHECKOUT_SESSION_ID}`;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false, error: "Unsupported content type." }, { status: 415 });
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const product = getCatalogProductById(body.productId ?? "");
  if (!product) {
    return NextResponse.json({ ok: false, error: "Unknown product." }, { status: 400 });
  }

  try {
    const adminSupabase = createAdminSupabaseClient();
    await upsertCatalogProducts(adminSupabase, getCatalogProducts());

    const productStateResult = await adminSupabase
      .from("products")
      .select("active")
      .eq("id", product.id)
      .limit(1)
      .maybeSingle();

    if (productStateResult.error) {
      console.error("[Checkout] Could not verify product active status", productStateResult.error);
      return NextResponse.json(
        { ok: false, error: "Could not verify product availability right now." },
        { status: 500 }
      );
    }

    if (productStateResult.data && !productStateResult.data.active) {
      return NextResponse.json(
        { ok: false, error: "This product is currently unavailable." },
        { status: 409 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const stripe = createStripeClient();
    const appUrl = getAppUrl();
    const cancelPath = getSafePath(body.cancelPath, "/programs");
    const sessionPayload: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      customer_creation: "always",
      allow_promotion_codes: true,
      success_url: getSuccessUrl(appUrl),
      cancel_url: new URL(cancelPath, appUrl).toString(),
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      metadata: {
        fs_product_id: product.id,
        fs_product_slug: product.slug,
        fs_product_kind: product.kind,
      },
      ...(user?.id ? { client_reference_id: user.id } : {}),
      ...(user?.email ? { customer_email: user.email } : {}),
    };

    const session = await stripe.checkout.sessions.create(sessionPayload);
    if (!session.url) {
      return NextResponse.json(
        { ok: false, error: "Checkout session missing URL." },
        { status: 500 }
      );
    }

    trackAnalyticsEvent({
      eventName: "checkout_started",
      channel: "server",
      userId: user?.id ?? null,
      payload: {
        productId: product.id,
        sessionId: session.id,
      },
    });

    return NextResponse.json({ ok: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[Checkout] Could not create checkout session", error);
    return NextResponse.json(
      { ok: false, error: "Could not create checkout session." },
      { status: 500 }
    );
  }
}
