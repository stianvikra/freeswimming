import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/supabase/env";
import { getCatalogProductById, getCatalogProducts } from "@/lib/commerce/catalog";
import { buildCheckoutSessionPayload } from "@/lib/commerce/checkout";
import { upsertCatalogProducts } from "@/lib/commerce/entitlements";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { createStripeClient } from "@/lib/stripe/server";

type CheckoutBody = {
  productId?: string;
  cancelPath?: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const sessionPayload = buildCheckoutSessionPayload({
      appUrl,
      cancelPath: body.cancelPath,
      product,
      user,
    });

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
