import { redirect } from "next/navigation";
import PoolsidePreviewPageClient from "@/components/my-library/workouts/PoolsidePreviewPageClient";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

function buildCurrentSearch(searchParams: Record<string, string | string[] | undefined>) {
  const resolved = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (typeof entry === "string") {
          resolved.append(key, entry);
        }
      });
      return;
    }

    if (typeof value === "string") {
      resolved.set(key, value);
    }
  });

  const query = resolved.toString();
  return query ? `?${query}` : "";
}

export default async function PoolsidePreviewPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const { user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!user) {
    redirect(
      `/auth/sign-in?next=${encodeURIComponent(
        `/my-library/workouts/poolside-preview${buildCurrentSearch(resolvedSearchParams)}`
      )}`
    );
  }

  return <PoolsidePreviewPageClient />;
}
