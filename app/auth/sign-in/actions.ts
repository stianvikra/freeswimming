"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { getAppUrl } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function buildSignInPath(nextPath: string, params: Record<string, string>) {
  const query = new URLSearchParams({ next: nextPath, ...params });
  return `/auth/sign-in?${query.toString()}`;
}

export async function requestMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const nextPath = getSafeNextPath(String(formData.get("next") ?? ""));

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(buildSignInPath(nextPath, { error: "Enter a valid email address." }));
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? getAppUrl();
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    redirect(buildSignInPath(nextPath, { error: error.message }));
  }

  redirect(buildSignInPath(nextPath, { sent: "1" }));
}
