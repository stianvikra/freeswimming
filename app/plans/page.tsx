import { Suspense } from "react";
import SiteChrome from "@/components/SiteChrome";
import TrackCheckoutCancel from "@/components/analytics/TrackCheckoutCancel";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import TrackedLink from "@/components/analytics/TrackedLink";
import PageTemplate from "@/components/PageTemplate";
import PageIntro from "@/components/PageIntro";
import CheckoutButton from "@/components/my-library/CheckoutButton";
import { cx } from "@/components/ui/cx";
import { loadPublicCatalogOverridesCached } from "@/lib/commerce/catalog-server";
import {
  getCatalogProductsWithAvailability,
  type CatalogProductOverridesById,
  type CatalogProductAvailability,
} from "@/lib/commerce/catalog";
import { getPlanCopy, getPurchaseModelCopy } from "./plansPresentation";

export const dynamic = "force-dynamic";

function PlanCard({ product }: { product: CatalogProductAvailability }) {
  const copy = getPlanCopy(product);
  const purchaseModel = getPurchaseModelCopy(product);

  return (
    <article
      className={cx(
        "fs-program-card flex min-h-full flex-col p-4 sm:p-6",
        product.id === "analysis_video" ? "fs-program-card-highlight" : ""
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
            {copy.eyebrow}
          </div>
          <h2 className="mt-2 text-[length:var(--fs-text-card-title)] leading-tight font-semibold text-[color:var(--fs-color-ink-strong)]">
            {product.title}
          </h2>
        </div>
        <div className="inline-flex w-fit items-center rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-brand)] bg-[color:var(--fs-color-brand-50)] px-3 py-1 text-[12px] font-semibold text-[color:var(--fs-color-brand-700)]">
          {purchaseModel.badge}
        </div>
      </div>

      <div className="mt-3">
        <div className="mt-3 border-b border-slate-200 pb-4 sm:mt-4 sm:pb-5">
          {product.available ? (
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <p className="text-[13px] leading-6 text-[color:var(--fs-color-muted)]">
                {purchaseModel.checkoutExpectation}
              </p>
              <CheckoutButton
                productId={product.id}
                cancelPath="/plans"
                analyticsSource="plans"
                label="Open secure checkout"
                className="fs-cta-primary w-full rounded-[var(--fs-radius-control)] sm:w-auto"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                disabled
                className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-[var(--fs-radius-control)] border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-500"
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

        <div className="mt-5 flex flex-1 flex-col">
          <p className="text-[15px] leading-7 text-[color:var(--fs-color-muted)]">
            {copy.description}
          </p>

          <dl className="mt-5 grid gap-3 text-[14px] leading-6 text-slate-700 sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-[color:var(--fs-color-ink-strong)]">Format</dt>
              <dd className="mt-1">{copy.format}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[color:var(--fs-color-ink-strong)]">Best for</dt>
              <dd className="mt-1">{copy.bestFor}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                Purchase model
              </dt>
              <dd className="mt-1">
                <span className="font-semibold">{purchaseModel.label}</span>
                <span className="block text-[13px] leading-5 text-[color:var(--fs-color-muted)]">
                  {purchaseModel.detail}
                </span>
              </dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-[color:var(--fs-border-soft)] pt-4">
            <div className="text-[13px] font-semibold text-[color:var(--fs-color-ink-strong)]">
              Quick compare
            </div>
            <p className="mt-2 text-[14px] leading-6 text-[color:var(--fs-color-muted)]">
              {copy.comparisonCue}
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div>
              <div className="text-[13px] font-semibold text-[color:var(--fs-color-ink-strong)]">
                What you get
              </div>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-[14px] leading-6 text-slate-700">
                {copy.deliverables.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="border-t border-[color:var(--fs-border-soft)] pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
              <div className="text-[13px] font-semibold text-[color:var(--fs-color-ink-strong)]">
                Why it helps
              </div>
              <p className="mt-2 text-[14px] leading-6 text-[color:var(--fs-color-muted)]">
                {copy.proof}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function toAnalyticsProductIdList(products: CatalogProductAvailability[]) {
  return products.length > 0 ? products.map((product) => product.id).join(",") : null;
}

export default async function PlansPage() {
  let catalogOverrides: CatalogProductOverridesById = {};
  try {
    catalogOverrides = await loadPublicCatalogOverridesCached();
  } catch (error) {
    console.error("[Plans] Falling back to env catalog due override lookup failure", error);
  }

  const products = getCatalogProductsWithAvailability(process.env, catalogOverrides);
  const availableProducts = products.filter((product) => product.available);
  const unavailableProducts = products.filter((product) => !product.available);
  const hasAvailableProducts = availableProducts.length > 0;
  const hasUnavailableProducts = unavailableProducts.length > 0;
  const availableCount = availableProducts.length;
  const activeCount = products.filter((product) => product.active).length;
  const plansAnalyticsPayload = {
    productCount: products.length,
    availableCount,
    activeCount,
    productIds: toAnalyticsProductIdList(products),
    availableProductIds: toAnalyticsProductIdList(availableProducts),
    unavailableProductIds: toAnalyticsProductIdList(unavailableProducts),
  };

  return (
    <SiteChrome>
      <PageTemplate size="wide" topInset="flush">
        <TrackEventOnMount eventName="plans_viewed" payload={plansAnalyticsPayload} />
        {hasAvailableProducts ? (
          <TrackEventOnMount
            eventName="upsell_presented"
            payload={{
              surface: "plans",
              offerCount: availableCount,
              ...plansAnalyticsPayload,
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

        <div className="mt-4 border-y border-slate-200 py-2 sm:mt-5 sm:py-4">
          <p className="text-[13px] leading-5 text-slate-700 sm:hidden">
            Checkout model is shown on each offer and confirmed in Stripe.
          </p>
          <dl className="hidden gap-3 text-[13px] leading-5 text-slate-700 sm:grid sm:grid-cols-3 sm:gap-4 sm:leading-6">
            <div className="flex items-baseline justify-between gap-3 sm:block">
              <dt className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                Model shown per offer
              </dt>
              <dd className="text-right sm:mt-1 sm:text-left">Check each card before checkout.</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 sm:block">
              <dt className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                Hosted by Stripe
              </dt>
              <dd className="text-right sm:mt-1 sm:text-left">Payment stays there.</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 sm:block">
              <dt className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                Receipt and invoice
              </dt>
              <dd className="text-right sm:mt-1 sm:text-left">After checkout.</dd>
            </div>
          </dl>
        </div>

        {!hasAvailableProducts ? (
          <div className="mt-4 rounded-[var(--fs-radius-card)] border border-rose-200 bg-rose-50/80 p-4">
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
                className="inline-flex h-10 items-center justify-center rounded-[var(--fs-radius-control)] border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
              >
                Contact support
              </TrackedLink>
            </div>
          </div>
        ) : null}

        {hasAvailableProducts && hasUnavailableProducts ? (
          <div className="mt-4 rounded-[var(--fs-radius-card)] border border-amber-200 bg-amber-50/80 p-4">
            <p className="text-sm text-amber-900">
              Some offers are temporarily unavailable. Available offers can still be purchased now.
            </p>
          </div>
        ) : null}

        <section className="mt-4 sm:mt-5" aria-labelledby="plans-comparison-heading">
          <div className="mb-2 flex flex-col gap-1 sm:mb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="plans-comparison-heading"
                className="text-[18px] leading-tight font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[21px]"
              >
                Compare the options
              </h2>
              <p className="mt-1 hidden text-[14px] leading-6 text-[color:var(--fs-color-muted)] sm:block">
                Pick by current need first; checkout details stay inside Stripe.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:gap-4" data-testid="plans-comparison">
            {products.map((product) => (
              <PlanCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </PageTemplate>
    </SiteChrome>
  );
}
