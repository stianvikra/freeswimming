import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  findProfileIdByEmail,
  normalizeEmail,
  upsertCatalogProducts,
  upsertStripeEntitlement,
} from "@/lib/commerce/entitlements";
import {
  getCatalogProductById,
  getCatalogProductByStripePriceId,
  getCatalogProducts,
  type CatalogProduct,
} from "@/lib/commerce/catalog";
import { trackAndPersistAnalyticsEvent } from "@/lib/analytics/persistence";
import { getDiscountRedeemedPayload } from "@/lib/stripe/webhook-discount";
import { createStripeClient, getStripeWebhookSecret } from "@/lib/stripe/server";

const SUPPORTED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getCheckoutSessionEmail(session: Stripe.Checkout.Session): string | null {
  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) return null;

  const normalized = normalizeEmail(email);
  return normalized || null;
}

function getCheckoutSessionCustomerId(session: Stripe.Checkout.Session): string | null {
  if (typeof session.customer === "string") return session.customer;
  return null;
}

function getValidUserId(session: Stripe.Checkout.Session): string | null {
  const value = session.client_reference_id;
  if (!value) return null;

  const uuidV4Like = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Like.test(value) ? value : null;
}

async function resolveProductFromSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<CatalogProduct | null> {
  const metadataProductId = session.metadata?.fs_product_id;
  if (metadataProductId) {
    return getCatalogProductById(metadataProductId);
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
  const priceId = lineItems.data[0]?.price?.id;
  if (!priceId) return null;

  return getCatalogProductByStripePriceId(priceId);
}

async function fulfillCheckoutSession(stripe: Stripe, session: Stripe.Checkout.Session) {
  const purchaserEmail = getCheckoutSessionEmail(session);
  if (!purchaserEmail) {
    console.warn("[StripeWebhook] Session missing purchaser email", { sessionId: session.id });
    return;
  }

  const product = await resolveProductFromSession(stripe, session);
  if (!product) {
    console.warn("[StripeWebhook] Could not resolve product for session", {
      sessionId: session.id,
    });
    return;
  }

  const adminSupabase = createAdminSupabaseClient();
  await upsertCatalogProducts(adminSupabase, getCatalogProducts());

  let userId = getValidUserId(session);
  if (!userId) {
    userId = await findProfileIdByEmail(adminSupabase, purchaserEmail);
  }

  await upsertStripeEntitlement(adminSupabase, {
    userId,
    purchaserEmail,
    productId: product.id,
    stripeCustomerId: getCheckoutSessionCustomerId(session),
    stripeCheckoutSessionId: session.id,
  });

  const grantedLatencyMs = Math.max(0, Date.now() - session.created * 1000);
  await trackAndPersistAnalyticsEvent({
    eventName: "entitlement_granted",
    channel: "server",
    userId,
    payload: {
      sessionId: session.id,
      productId: product.id,
      grantedLatencyMs,
    },
  });

  console.info("[StripeWebhook] Entitlement upserted", {
    sessionId: session.id,
    productId: product.id,
    userId,
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { ok: false, error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  const body = await request.text();
  const stripe = createStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, getStripeWebhookSecret());
  } catch (error) {
    console.error("[StripeWebhook] Signature verification failed", error);
    return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 400 });
  }

  if (!SUPPORTED_EVENTS.has(event.type)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "payment") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (event.type === "checkout.session.completed" && session.payment_status !== "paid") {
      console.info("[StripeWebhook] Waiting for async payment confirmation", {
        sessionId: session.id,
        paymentStatus: session.payment_status,
      });
      return NextResponse.json({ ok: true, deferred: true });
    }

    await trackAndPersistAnalyticsEvent({
      eventName: "checkout_completed",
      channel: "server",
      userId: getValidUserId(session),
      payload: {
        sessionId: session.id,
        productId: session.metadata?.fs_product_id ?? null,
        eventType: event.type,
      },
    });

    const discountPayload = getDiscountRedeemedPayload(session);
    if (discountPayload) {
      await trackAndPersistAnalyticsEvent({
        eventName: "discount_redeemed",
        channel: "server",
        userId: getValidUserId(session),
        payload: discountPayload,
      });
    }

    await fulfillCheckoutSession(stripe, session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[StripeWebhook] Fulfillment failed", { eventType: event.type, error });
    return NextResponse.json({ ok: false, error: "Webhook fulfillment failed." }, { status: 500 });
  }
}
