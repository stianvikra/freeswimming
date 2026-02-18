import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CatalogProduct } from "@/lib/commerce/catalog";
import { trackAnalyticsEvent } from "@/lib/analytics/events";

type EntitlementUpsertInput = {
  userId: string | null;
  purchaserEmail: string;
  productId: string;
  stripeCustomerId: string | null;
  stripeCheckoutSessionId: string;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function upsertCatalogProducts(
  supabase: SupabaseClient<Database>,
  products: CatalogProduct[]
) {
  const { error } = await supabase.from("products").upsert(
    products.map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      kind: product.kind,
      stripe_price_id: product.stripePriceId,
    })),
    { onConflict: "id", ignoreDuplicates: true }
  );

  if (error) {
    throw new Error(`Could not sync product catalog: ${error.message}`);
  }
}

export async function findProfileIdByEmail(
  supabase: SupabaseClient<Database>,
  email: string
): Promise<string | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not resolve profile by email: ${error.message}`);
  }

  return data?.id ?? null;
}

export async function upsertStripeEntitlement(
  supabase: SupabaseClient<Database>,
  input: EntitlementUpsertInput
) {
  const { error } = await supabase.from("entitlements").upsert(
    {
      user_id: input.userId,
      purchaser_email: normalizeEmail(input.purchaserEmail),
      product_id: input.productId,
      source: "stripe_checkout",
      stripe_customer_id: input.stripeCustomerId,
      stripe_checkout_session_id: input.stripeCheckoutSessionId,
      granted_at: new Date().toISOString(),
    },
    { onConflict: "stripe_checkout_session_id" }
  );

  if (error) {
    throw new Error(`Could not upsert entitlement: ${error.message}`);
  }
}

export async function attachGuestEntitlementsByEmail(
  supabase: SupabaseClient<Database>,
  userId: string,
  email: string
) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return 0;

  const { data, error } = await supabase
    .from("entitlements")
    .update({ user_id: userId })
    .is("user_id", null)
    .eq("purchaser_email", normalizedEmail)
    .select("id");

  if (error) {
    throw new Error(`Could not attach guest entitlements: ${error.message}`);
  }

  const attachedEntitlementCount = data?.length ?? 0;
  if (attachedEntitlementCount > 0) {
    trackAnalyticsEvent({
      eventName: "account_claim_completed",
      channel: "server",
      userId,
      payload: {
        attachedEntitlementCount,
      },
    });
  }

  return attachedEntitlementCount;
}
