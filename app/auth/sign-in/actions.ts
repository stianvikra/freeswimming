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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getNormalizedEmail(formData: FormData): string {
  return String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
}

function getNextPath(formData: FormData): string {
  return getSafeNextPath(String(formData.get("next") ?? ""));
}

export async function requestMagicLink(formData: FormData) {
  const email = getNormalizedEmail(formData);
  const nextPath = getNextPath(formData);

  if (!email || !EMAIL_REGEX.test(email)) {
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

  redirect(buildSignInPath(nextPath, { sent: "1", email }));
}

export async function verifySignInCode(formData: FormData) {
  const email = getNormalizedEmail(formData);
  const token = String(formData.get("code") ?? "")
    .trim()
    .replace(/\s+/g, "");
  const nextPath = getNextPath(formData);

  if (!email || !EMAIL_REGEX.test(email)) {
    redirect(buildSignInPath(nextPath, { error: "Enter a valid email address.", sent: "1" }));
  }

  if (!/^[A-Za-z0-9]{6,10}$/.test(token)) {
    redirect(
      buildSignInPath(nextPath, {
        error: "Enter the sign-in code from your email.",
        sent: "1",
        email,
      })
    );
  }

  const supabase = await createServerSupabaseClient();
  for (const otpType of ["email", "magiclink"] as const) {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: otpType,
    });

    if (!error) {
      redirect(nextPath);
    }
  }

  redirect(
    buildSignInPath(nextPath, {
      error: "Could not verify sign-in code. Request a new email and try again.",
      sent: "1",
      email,
    })
  );
}
