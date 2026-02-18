import { Suspense } from "react";
import SiteChrome from "@/components/SiteChrome";
import TrackCheckoutCancel from "@/components/analytics/TrackCheckoutCancel";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import TrackedLink from "@/components/analytics/TrackedLink";
import PageTemplate from "@/components/PageTemplate";
import PageIntro from "@/components/PageIntro";
import CheckoutButton from "@/components/my-library/CheckoutButton";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildCatalogOverridesFromRows } from "@/lib/commerce/catalog-overrides";
import {
  getCatalogProductsWithAvailability,
  type CatalogProductAvailability,
} from "@/lib/commerce/catalog";

function getPlanCopy(product: CatalogProductAvailability) {
  switch (product.id) {
    case "guide_0_1000m":
      return {
        description:
          "A structured program designed to take you from starting out with freestyle to completing your first 1000m.",
        points: [
          "20-session structure you can follow step by step",
          "Simple weekly progression with practical focus cues",
          "Built to work alongside the free course",
        ],
      };
    case "guide_poolside":
      return {
        description:
          "A compact poolside drill guide you can bring to every session when you need quick structure and reminders.",
        points: [
          "Fast drill lookup when you are already at the pool",
          "Clear focus areas for balance, position, and timing",
          "Ideal add-on when you want a practical session script",
        ],
      };
    case "analysis_video":
      return {
        description:
          "Personal video feedback so you know exactly what to fix first and what to ignore for now.",
        points: [
          "Prioritized technique feedback based on your stroke",
          "Actionable adjustments for your next sessions",
          "Ideal when you need a clear path to improve faster",
        ],
      };
    default:
      return {
        description: "Structured paid offer with practical guidance and clear next actions.",
        points: ["Practical content", "Clear action steps", "Built for everyday training"],
      };
  }
}

function PlanCard({ product }: { product: CatalogProductAvailability }) {
  const copy = getPlanCopy(product);

  return (
    <article className="bg-white/92 relative overflow-hidden rounded-[22px] border border-slate-200/70 p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#5aa6ff] via-[#93c8ff] to-transparent opacity-70" />

      <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
        {product.kind === "analysis" ? "Video feedback" : "Guide"}
      </div>
      <h2 className="mt-2 text-[18px] font-semibold text-slate-900">{product.title}</h2>
      <p className="mt-2 text-[15px] leading-7 text-slate-700">{copy.description}</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[14px] leading-6 text-slate-700">
        {copy.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <div className="mt-5">
        {product.available ? (
          <CheckoutButton productId={product.id} cancelPath="/plans" analyticsSource="plans" />
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-500"
            >
              Temporarily unavailable
            </button>
            <p className="text-xs text-slate-500">
              {product.active
                ? `Checkout setup missing (${product.missingEnvVar ?? "unknown variable"}).`
                : "This offer is hidden from new sales in admin commerce settings."}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

export default async function PlansPage() {
  const supabase = await createServerSupabaseClient();
  const { data: productRows, error: productRowsError } = await supabase
    .from("products")
    .select("id, slug, title, kind, active")
    .order("created_at", { ascending: true });

  if (productRowsError) {
    console.error("[Plans] Could not load product catalog overrides", productRowsError);
  }

  const catalogOverrides = buildCatalogOverridesFromRows(productRows ?? []);
  const products = getCatalogProductsWithAvailability(process.env, catalogOverrides);
  const hasAvailableProducts = products.some((product) => product.available);
  const hasUnavailableProducts = products.some((product) => !product.available);
  const availableCount = products.filter((product) => product.available).length;

  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <TrackEventOnMount
          eventName="plans_viewed"
          payload={{
            productCount: products.length,
            availableCount,
          }}
        />
        {hasAvailableProducts ? (
          <TrackEventOnMount
            eventName="upsell_presented"
            payload={{
              surface: "plans",
              offerCount: availableCount,
            }}
          />
        ) : null}
        <Suspense fallback={null}>
          <TrackCheckoutCancel surface="plans" />
        </Suspense>
        <PageIntro
          title="Plans"
          subtitle="Paid guides and feedback to support your next step."
          belowDivider={
            <p className="text-[13px] text-slate-600">
              Pick an option below. Final price and payment details are handled securely in
              checkout.
            </p>
          }
        />

        {!hasAvailableProducts ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
            <p className="text-sm font-medium text-rose-800">
              Plans are temporarily unavailable while checkout configuration is being finalized.
            </p>
            <p className="mt-2 text-sm text-rose-700">
              You can still contact us and we will help you manually.
            </p>
            <div className="mt-3">
              <TrackedLink
                eventName="support_clicked"
                payload={{
                  source: "plans_unavailable",
                }}
                href="/contact"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
              >
                Contact support
              </TrackedLink>
            </div>
          </div>
        ) : null}

        {hasAvailableProducts && hasUnavailableProducts ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
            <p className="text-sm text-amber-900">
              Some offers are temporarily unavailable. Available offers can still be purchased now.
            </p>
          </div>
        ) : null}

        <div className="mt-4 grid gap-4">
          {products.map((product) => (
            <PlanCard key={product.id} product={product} />
          ))}
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}
