"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getBrowserLocalDayTimezone,
  LOCAL_DAY_TIMEZONE_COOKIE_NAME,
  validateLocalDayTimezone,
} from "@/lib/my-library/local-day";

export const LOCAL_DAY_TIMEZONE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 360;

export function buildLocalDayTimezoneCookie(timezone: string, secure: boolean) {
  return [
    `${LOCAL_DAY_TIMEZONE_COOKIE_NAME}=${encodeURIComponent(timezone)}`,
    "Path=/",
    `Max-Age=${LOCAL_DAY_TIMEZONE_COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

export function readLocalDayTimezoneCookie(cookieHeader: string) {
  for (const part of cookieHeader.split(";")) {
    const trimmedPart = part.trim();
    const separatorIndex = trimmedPart.indexOf("=");
    if (separatorIndex < 0) continue;
    if (trimmedPart.slice(0, separatorIndex) !== LOCAL_DAY_TIMEZONE_COOKIE_NAME) continue;

    try {
      return decodeURIComponent(trimmedPart.slice(separatorIndex + 1));
    } catch {
      return null;
    }
  }

  return null;
}

export default function LocalDayTimezoneSynchronizer() {
  const router = useRouter();
  const lastAttemptedChangeRef = useRef<string | null>(null);

  useEffect(() => {
    const browserTimezone = getBrowserLocalDayTimezone();
    const cookieTimezoneResult = validateLocalDayTimezone(
      readLocalDayTimezoneCookie(document.cookie)
    );
    const cookieTimezone =
      cookieTimezoneResult.status === "valid" ? cookieTimezoneResult.timezone : null;

    if (cookieTimezone === browserTimezone) {
      lastAttemptedChangeRef.current = null;
      return;
    }

    const detectedChange = `${cookieTimezone ?? "missing"}->${browserTimezone}`;
    if (lastAttemptedChangeRef.current === detectedChange) return;
    lastAttemptedChangeRef.current = detectedChange;

    document.cookie = buildLocalDayTimezoneCookie(
      browserTimezone,
      window.location.protocol === "https:"
    );
    router.refresh();
  }, [router]);

  return null;
}
