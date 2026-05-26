import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import TrackedLink from "@/components/analytics/TrackedLink";
import SiteChrome from "@/components/SiteChrome";
import AdminContextNotesPanel from "@/components/admin/AdminContextNotesPanel";
import GuidePdfDownloadButton from "@/components/guides/GuidePdfDownloadButton";
import { cx } from "@/components/ui/cx";
import { getLibraryItemActionCopy } from "@/lib/commerce/library-item-actions";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";
import { getCatalogProductBySlug } from "@/lib/commerce/catalog";

type Params = Promise<{ slug: string }>;

type Props = {
  params: Params;
};

export const dynamic = "force-dynamic";

function getTrackedItemEventName(targetHref: string) {
  return targetHref === "/contact" ? "support_clicked" : "item_preview_opened";
}

const primaryActionClass =
  "fs-cta-primary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const quietActionClass =
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 px-4 text-sm font-semibold text-[color:var(--fs-color-ink)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

export default async function LibraryItemPage({ params }: Props) {
  const { slug } = await params;
  const product = getCatalogProductBySlug(slug);
  if (!product) notFound();

  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(`/my-library/item/${slug}`)}`);
  }

  const { data: entitlement, error } = await supabase
    .from("entitlements")
    .select("id")
    .eq("product_id", product.id)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[LibraryItem] Could not load entitlement", error);
  }

  if (!entitlement) {
    redirect("/my-library");
  }

  const { data: productOverride, error: productOverrideError } = await supabase
    .from("products")
    .select("title")
    .eq("id", product.id)
    .limit(1)
    .maybeSingle();

  if (productOverrideError) {
    console.error("[LibraryItem] Could not load product title override", productOverrideError);
  }

  const displayTitle = productOverride?.title?.trim()
    ? productOverride.title.trim()
    : product.title;
  const actionCopy = getLibraryItemActionCopy(product.id);

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[1040px] px-4 pt-24 pb-20 sm:px-6 sm:pt-28">
        <article
          data-testid="owned-library-item-detail"
          className="fs-library-card fs-library-card-accent p-5 sm:p-6 md:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[color:var(--fs-color-brand-700)]">
                Owned item
              </p>
              <h1 className="mt-2 text-[30px] leading-tight font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
                {displayTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--fs-color-muted)]">
                {actionCopy.description}
              </p>
            </div>
            <span className="inline-flex w-fit shrink-0 rounded-[var(--fs-radius-control)] bg-white/85 px-3 py-1 text-xs font-semibold text-[color:var(--fs-color-brand-700)] ring-1 ring-[color:var(--fs-border-brand)]">
              In your library
            </span>
          </div>

          <div
            className="mt-6 flex flex-wrap items-center gap-3 border-t border-[color:var(--fs-border-soft)] pt-5"
            data-testid="owned-library-item-actions"
          >
            {actionCopy.primaryHref ? (
              <TrackedLink
                eventName={getTrackedItemEventName(actionCopy.primaryHref)}
                payload={{
                  source:
                    actionCopy.primaryHref === "/contact"
                      ? "library_item_primary_support"
                      : "library_item_primary",
                  productId: product.id,
                  target: actionCopy.primaryHref,
                }}
                href={actionCopy.primaryHref}
                className={primaryActionClass}
              >
                {actionCopy.primaryLabel}
              </TrackedLink>
            ) : null}
            {actionCopy.secondaryHref && actionCopy.secondaryLabel ? (
              <TrackedLink
                eventName={getTrackedItemEventName(actionCopy.secondaryHref)}
                payload={{
                  source:
                    actionCopy.secondaryHref === "/contact"
                      ? "library_item_secondary_support"
                      : "library_item_secondary",
                  productId: product.id,
                  target: actionCopy.secondaryHref,
                }}
                href={actionCopy.secondaryHref}
                className={secondaryActionClass}
              >
                {actionCopy.secondaryLabel}
              </TrackedLink>
            ) : null}
            {actionCopy.pdfApiHref && actionCopy.pdfFallbackFileName ? (
              <GuidePdfDownloadButton
                apiPath={actionCopy.pdfApiHref}
                fallbackFileName={actionCopy.pdfFallbackFileName}
                className="shrink-0"
              />
            ) : null}
            <Link href="/my-library" className={cx(quietActionClass, "ml-0 sm:ml-auto")}>
              Back to My Library
            </Link>
          </div>
        </article>

        <AdminContextNotesPanel
          contextType="product"
          contextRef={product.slug}
          contextLabel={`Product: ${displayTitle} (${product.slug})`}
          collapsedByDefault
          className="mt-4"
        />
      </section>
    </SiteChrome>
  );
}
