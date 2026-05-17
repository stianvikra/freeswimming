import { Suspense } from "react";
import SiteChrome from "@/components/SiteChrome";
import TrackCheckoutCancel from "@/components/analytics/TrackCheckoutCancel";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import TrackedLink from "@/components/analytics/TrackedLink";
import PageTemplate from "@/components/PageTemplate";
import PageIntro from "@/components/PageIntro";
import CheckoutButton from "@/components/my-library/CheckoutButton";
import { loadPublicCatalogOverridesCached } from "@/lib/commerce/catalog-server";
import {
  getCatalogProductsWithAvailability,
  type CatalogProductOverridesById,
  type CatalogProductAvailability,
} from "@/lib/commerce/catalog";

export const dynamic = "force-dynamic";

function getPlanCopy(product: CatalogProductAvailability) {
  switch (product.id) {
    case "guide_0_1000m":
      return {
        eyebrow: "Structured program",
        description:
          "A structured program designed to take you from starting out with freestyle to completing your first 1000m.",
        format: "Interactive plan + PDF guide",
        bestFor: "Learners who want a step-by-step path from technique lessons to longer swims.",
        deliverables: [
          "20-session structure you can follow in order",
          "Weekly progression with practical focus cues",
          "PDF access plus My Library tracking after checkout",
        ],
        proof:
          "Built to pair with the free course so drills, sessions, and progression use the same method language.",
      };
    case "guide_poolside":
      return {
        eyebrow: "Pool deck companion",
        description:
          "A compact poolside drill guide you can bring to every session when you need quick structure and reminders.",
        format: "Drill library + printable guide",
        bestFor:
          "Swimmers who already know the course basics and want a fast session script at the pool.",
        deliverables: [
          "Fast drill lookup when you are already at the pool",
          "Clear focus areas for balance, position, and timing",
          "PDF access plus My Library tracking after checkout",
        ],
        proof:
          "Uses the same balance, body-position, and timing cues as the course lessons, without adding workout admin.",
      };
    case "analysis_video":
      return {
        eyebrow: "Personal feedback",
        description:
          "Personal video feedback so you know exactly what to fix first and what to ignore for now.",
        format: "Technique review",
        bestFor:
          "Learners who have video of their stroke and need a clear priority order before the next swim.",
        deliverables: [
          "Prioritized technique feedback based on your stroke",
          "Actionable adjustments for your next sessions",
          "A focused next-step plan instead of a long list of corrections",
        ],
        proof:
          "Feedback is intentionally prioritized so you can work on the highest-impact change first.",
      };
    default:
      return {
        eyebrow: "Paid plan",
        description: "Structured paid offer with practical guidance and clear next actions.",
        format: "Freeswimming product",
        bestFor: "Swimmers who want a practical next step.",
        deliverables: ["Practical content", "Clear action steps", "Built for everyday training"],
        proof: "Built around the same Freeswimming method used across the free course.",
      };
  }
}

function PlanCard({ product }: { product: CatalogProductAvailability }) {
  const copy = getPlanCopy(product);

  return (
    <article className="relative overflow-hidden rounded-[22px] border border-slate-200/70 bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#5aa6ff] via-[#93c8ff] to-transparent opacity-70" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase">
            {copy.eyebrow}
          </div>
          <h2 className="mt-2 text-[19px] leading-tight font-semibold text-slate-900">
            {product.title}
          </h2>
        </div>
        <div className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50/85 px-3 py-1 text-[12px] font-semibold text-blue-700">
          One-time purchase
        </div>
      </div>

      <div className="mt-3">
        <div className="mt-4 border-b border-slate-200 pb-5">
          {product.available ? (
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <p className="text-[13px] leading-6 text-slate-600">
                Opens secure Stripe Checkout. Final price, promo code field, and payment details are
                confirmed before you pay.
              </p>
              <CheckoutButton
                productId={product.id}
                cancelPath="/plans"
                analyticsSource="plans"
                label="Open secure checkout"
                className="w-full sm:w-auto"
              />
            </div>
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

        <div className="mt-5">
          <p className="text-[15px] leading-7 text-slate-700">{copy.description}</p>

          <dl className="mt-5 grid gap-3 text-[14px] leading-6 text-slate-700 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-900">Format</dt>
              <dd className="mt-1">{copy.format}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Best for</dt>
              <dd className="mt-1">{copy.bestFor}</dd>
            </div>
          </dl>

          <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div>
              <div className="text-[13px] font-semibold text-slate-900">What you get</div>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-[14px] leading-6 text-slate-700">
                {copy.deliverables.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="border-t border-slate-200 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
              <div className="text-[13px] font-semibold text-slate-900">Why it helps</div>
              <p className="mt-2 text-[14px] leading-6 text-slate-700">{copy.proof}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function PlansPage() {
  let catalogOverrides: CatalogProductOverridesById = {};
  try {
    catalogOverrides = await loadPublicCatalogOverridesCached();
  } catch (error) {
    console.error("[Plans] Falling back to env catalog due override lookup failure", error);
  }

  const products = getCatalogProductsWithAvailability(process.env, catalogOverrides);
  const hasAvailableProducts = products.some((product) => product.available);
  const hasUnavailableProducts = products.some((product) => !product.available);
  const availableCount = products.filter((product) => product.available).length;

  return (
    <SiteChrome>
      <PageTemplate size="wide" topInset="flush">
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
          subtitle="Guides and feedback."
          brandMarkClassName="h-auto w-full"
          brandMarkTestId="plans-intro-brand-mark"
          belowDivider={
            <p className="text-[13px] leading-6 text-slate-600">
              Choose what fits this week. Stripe shows the final price and payment details before
              you pay.
            </p>
          }
        />

        <div className="mt-5 border-y border-slate-200 py-3 sm:py-4">
          <dl className="grid gap-2 text-[13px] leading-5 text-slate-700 sm:grid-cols-3 sm:gap-4 sm:leading-6">
            <div className="flex items-baseline justify-between gap-3 sm:block">
              <dt className="font-semibold text-slate-900">One-time checkout</dt>
              <dd className="text-right sm:mt-1 sm:text-left">No subscription.</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 sm:block">
              <dt className="font-semibold text-slate-900">Hosted by Stripe</dt>
              <dd className="text-right sm:mt-1 sm:text-left">Payment stays there.</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 sm:block">
              <dt className="font-semibold text-slate-900">Receipt and invoice</dt>
              <dd className="text-right sm:mt-1 sm:text-left">After checkout.</dd>
            </div>
          </dl>
        </div>

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

        <div className="mt-4 grid gap-7 sm:gap-4">
          {products.map((product) => (
            <PlanCard key={product.id} product={product} />
          ))}
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}
