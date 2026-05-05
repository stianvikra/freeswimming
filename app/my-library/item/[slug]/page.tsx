import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import TrackedLink from "@/components/analytics/TrackedLink";
import SiteChrome from "@/components/SiteChrome";
import AdminContextNotesPanel from "@/components/admin/AdminContextNotesPanel";
import GuidePdfDownloadButton from "@/components/guides/GuidePdfDownloadButton";
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
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pt-28 pb-20">
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <h1 className="text-3xl font-bold text-slate-900">{displayTitle}</h1>
          <p className="mt-3 text-sm text-slate-600">{actionCopy.description}</p>

          <div className="mt-6 flex flex-wrap items-start gap-3">
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
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
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
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {actionCopy.secondaryLabel}
              </TrackedLink>
            ) : null}
            {actionCopy.pdfApiHref && actionCopy.pdfFallbackFileName ? (
              <GuidePdfDownloadButton
                apiPath={actionCopy.pdfApiHref}
                fallbackFileName={actionCopy.pdfFallbackFileName}
              />
            ) : null}
            <Link
              href="/my-library"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to My Library
            </Link>
          </div>
        </div>

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
