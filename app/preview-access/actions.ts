"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { getSiteLockConfig, isSiteLockEnabled } from "@/lib/site-lock/config";
import { createSiteLockSessionToken } from "@/lib/site-lock/session";
import { isSiteLockPasswordValid } from "@/lib/site-lock/password";

const INVALID_PASSWORD_ERROR = "invalid-password";

function buildPreviewAccessPath(nextPath: string, errorCode?: string): string {
  const params = new URLSearchParams({ next: nextPath });
  if (errorCode) {
    params.set("error", errorCode);
  }
  return `/preview-access?${params.toString()}`;
}

export async function requestPreviewAccess(formData: FormData) {
  const nextInput = formData.get("next");
  const passwordInput = formData.get("password");

  const nextPath = getSafeNextPath(typeof nextInput === "string" ? nextInput : null, "/");
  const password = typeof passwordInput === "string" ? passwordInput.trim() : "";

  if (!isSiteLockEnabled()) {
    redirect(nextPath);
  }

  const config = getSiteLockConfig();
  if (!password) {
    redirect(buildPreviewAccessPath(nextPath, INVALID_PASSWORD_ERROR));
  }

  const isPasswordValid = await isSiteLockPasswordValid(password, config.passwordHash);
  if (!isPasswordValid) {
    redirect(buildPreviewAccessPath(nextPath, INVALID_PASSWORD_ERROR));
  }

  const sessionToken = await createSiteLockSessionToken(config.bypassToken);
  const cookieStore = await cookies();
  cookieStore.set({
    name: config.cookieName,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
    maxAge: config.sessionMaxAgeSeconds,
  });

  redirect(nextPath);
}
