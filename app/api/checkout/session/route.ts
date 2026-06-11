import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/supabase/env";
import {
  getCatalogProductById,
  getCatalogProducts,
  type CatalogProduct,
} from "@/lib/commerce/catalog";
import {
  buildMappedCheckoutAttribution,
  buildCheckoutSessionPayload,
  buildCheckoutStartedAnalyticsPayload,
} from "@/lib/commerce/checkout";
import { upsertCatalogProducts } from "@/lib/commerce/entitlements";
import { trackAndPersistAnalyticsEvent } from "@/lib/analytics/persistence";
import { createStripeClient } from "@/lib/stripe/server";

type CheckoutBody = {
  productId?: unknown;
  cancelPath?: unknown;
  source?: unknown;
  placementId?: unknown;
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

  let product: CatalogProduct | null;
  try {
    product = getCatalogProductById(typeof body.productId === "string" ? body.productId : "");
  } catch (error) {
    console.error("[Checkout] Could not load product catalog", {
      message: error instanceof Error ? error.message : "Unknown catalog error.",
    });
    return NextResponse.json(
      { ok: false, error: "Could not verify product availability right now." },
      { status: 500 }
    );
  }

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

    const { user } = await getServerSupabaseUserIfAuthCookiePresent();

    const stripe = createStripeClient();
    const appUrl = getAppUrl();
    const checkoutStartedPayload = buildCheckoutStartedAnalyticsPayload({
      productId: product.id,
      source: body.source,
      placementId: body.placementId,
    });
    const checkoutAttribution = buildMappedCheckoutAttribution({
      productId: product.id,
      source: body.source,
      placementId: body.placementId,
    });
    const sessionPayload = buildCheckoutSessionPayload({
      appUrl,
      cancelPath: typeof body.cancelPath === "string" ? body.cancelPath : undefined,
      product,
      checkoutAttribution,
      user,
    });

    const session = await stripe.checkout.sessions.create(sessionPayload, {
      idempotencyKey: `checkout-session:${randomUUID()}`,
    });
    if (!session.url) {
      return NextResponse.json(
        { ok: false, error: "Checkout session missing URL." },
        { status: 500 }
      );
    }

    try {
      await trackAndPersistAnalyticsEvent({
        eventName: "checkout_started",
        channel: "server",
        userId: user?.id ?? null,
        payload: checkoutStartedPayload,
      });
    } catch (error) {
      console.error("[Checkout] Could not persist checkout-start analytics", {
        productId: product.id,
        source: checkoutStartedPayload.source,
        message: error instanceof Error ? error.message : "Unknown analytics error.",
      });
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    console.error("[Checkout] Could not create checkout session", error);
    return NextResponse.json(
      { ok: false, error: "Could not create checkout session." },
      { status: 500 }
    );
  }
}
