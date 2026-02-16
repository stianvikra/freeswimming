import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCatalogProductBySlug } from "@/lib/commerce/catalog";

type Params = Promise<{ slug: string }>;

type Props = {
  params: Params;
};

export const dynamic = "force-dynamic";

export default async function LibraryItemPage({ params }: Props) {
  const { slug } = await params;
  const product = getCatalogProductBySlug(slug);
  if (!product) notFound();

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pb-20 pt-28">
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
          <p className="mt-3 text-sm text-slate-600">
            Owned item detail is active. Download/preview flows will be added in the next step.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/my-library"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to My Library
            </Link>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
