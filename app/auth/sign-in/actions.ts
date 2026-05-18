"use server";

import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  formatLoginCodeCooldownMessage,
  getMagicLinkCadenceCooldownMs,
  MAGIC_LINK_CADENCE_WINDOW_MS,
  toRetrySeconds,
} from "@/lib/auth/magic-link-cooldown";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { classifySignInEmailError } from "@/lib/auth/sign-in-email-error";
import { buildAuthCallbackUrl, getSafeSignInContextSource } from "@/lib/auth/sign-in-context";
import { isResendRequestFlag, shouldApplyMagicLinkCooldown } from "@/lib/auth/sign-in-request";
import { reportAdminIncident, type AdminIncidentInput } from "@/lib/admin/incidents";
import { getAppUrl } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function buildSignInPath(
  nextPath: string,
  params: Record<string, string>,
  sourceInput?: string | null
) {
  const query = new URLSearchParams({ next: nextPath });
  const source = getSafeSignInContextSource(sourceInput);
  if (source) {
    query.set("source", source);
  }
  for (const [key, value] of Object.entries(params)) {
    query.set(key, value);
  }
  return `/auth/sign-in?${query.toString()}`;
}

function getIncidentPathLabel(path: string): string {
  return path.split("?")[0] || "/";
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAGIC_LINK_IP_WINDOW_MS = 60_000;
const MAGIC_LINK_IP_MAX = 12;
const MAGIC_LINK_EMAIL_WINDOW_MS = 10 * 60_000;
const MAGIC_LINK_EMAIL_MAX = 12;
const SIGN_IN_CODE_IP_WINDOW_MS = 5 * 60_000;
const SIGN_IN_CODE_IP_MAX = 12;
const SIGN_IN_CODE_EMAIL_WINDOW_MS = 10 * 60_000;
const SIGN_IN_CODE_EMAIL_MAX = 8;
const MAGIC_LINK_SESSION_COOKIE_NAME = "fs_auth_magic_link_session";
const MAGIC_LINK_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const MAGIC_LINK_SESSION_ID_PATTERN = /^[a-f0-9]{32}$/i;

type RateLimitResult =
  | {
      ok: true;
      remaining: number;
      resetAt: number;
    }
  | {
      ok: false;
      remaining: number;
      resetAt: number;
      retryAfterMs: number;
    };

type RateLimitRule = {
  key: string;
  max: number;
  windowMs: number;
};

const authHits = new Map<string, { count: number; resetAt: number }>();
const authCooldownLocks = new Map<string, number>();
const authCooldownCounters = new Map<string, { count: number; resetAt: number }>();
let hasLoggedUpstashFallback = false;

function getNormalizedEmail(formData: FormData): string {
  return String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
}

function getNextPath(formData: FormData): string {
  return getSafeNextPath(String(formData.get("next") ?? ""));
}

function getSignInSource(formData: FormData) {
  return getSafeSignInContextSource(String(formData.get("source") ?? ""));
}

function splitHeaderValue(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getClientIp(headerStore: Headers): string {
  const forwarded = splitHeaderValue(headerStore.get("x-forwarded-for"))[0];
  if (forwarded) return forwarded;

  const real = headerStore.get("x-real-ip")?.trim();
  if (real) return real;

  const cloudflare = headerStore.get("cf-connecting-ip")?.trim();
  if (cloudflare) return cloudflare;

  return "unknown";
}

function getEmailHash(email: string): string {
  return createHash("sha256").update(email).digest("hex").slice(0, 32);
}

async function getMagicLinkSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(MAGIC_LINK_SESSION_COOKIE_NAME)?.value ?? "";

  if (MAGIC_LINK_SESSION_ID_PATTERN.test(existing)) {
    return existing.toLowerCase();
  }

  const generated = randomBytes(16).toString("hex");
  cookieStore.set({
    name: MAGIC_LINK_SESSION_COOKIE_NAME,
    value: generated,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
    maxAge: MAGIC_LINK_SESSION_MAX_AGE_SECONDS,
  });

  return generated;
}

function shouldUseUpstash(): boolean {
  return (
    Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN)
  );
}

function logUpstashFallbackOnce(error: unknown) {
  if (hasLoggedUpstashFallback) return;
  hasLoggedUpstashFallback = true;
  console.error("[Auth] Upstash rate limit failed. Falling back to in-memory.", error);
}

function getInMemoryTtlMs(store: Map<string, number>, key: string): number {
  const resetAt = store.get(key);
  if (!resetAt) return 0;

  const ttlMs = resetAt - Date.now();
  if (ttlMs <= 0) {
    store.delete(key);
    return 0;
  }

  return ttlMs;
}

function setInMemoryTtl(store: Map<string, number>, key: string, ttlMs: number): void {
  store.set(key, Date.now() + Math.max(1, ttlMs));
}

function incrementInMemoryCounter(key: string, windowMs: number): number {
  const now = Date.now();
  const existing = authCooldownCounters.get(key);

  if (!existing || existing.resetAt <= now) {
    authCooldownCounters.set(key, { count: 1, resetAt: now + windowMs });
    return 1;
  }

  existing.count += 1;
  authCooldownCounters.set(key, existing);
  return existing.count;
}

async function upstashCommand(parts: string[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const endpoint = `${url.replace(/\/+$/, "")}/${parts.map((part) => encodeURIComponent(part)).join("/")}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Upstash command failed (${response.status}) ${text}`);
  }

  const json = (await response.json().catch(() => null)) as { result?: unknown } | null;
  return json?.result ?? null;
}

function rateLimitInMemory(rule: RateLimitRule): RateLimitResult {
  const now = Date.now();
  const existing = authHits.get(rule.key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + rule.windowMs;
    authHits.set(rule.key, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(0, rule.max - 1), resetAt };
  }

  if (existing.count >= rule.max) {
    const retryAfterMs = Math.max(1, existing.resetAt - now);
    return { ok: false, remaining: 0, resetAt: existing.resetAt, retryAfterMs };
  }

  existing.count += 1;
  authHits.set(rule.key, existing);
  return {
    ok: true,
    remaining: Math.max(0, rule.max - existing.count),
    resetAt: existing.resetAt,
  };
}

async function rateLimit(rule: RateLimitRule): Promise<RateLimitResult> {
  const useUpstash = shouldUseUpstash();

  if (!useUpstash) {
    return rateLimitInMemory(rule);
  }

  try {
    const countRaw = await upstashCommand(["INCR", rule.key]);
    const count = Number(countRaw);
    if (!Number.isFinite(count)) {
      throw new Error("Invalid INCR response");
    }

    let ttlMs = Number(await upstashCommand(["PTTL", rule.key]));
    if (!Number.isFinite(ttlMs) || ttlMs < 0 || count === 1) {
      await upstashCommand(["PEXPIRE", rule.key, String(rule.windowMs)]);
      ttlMs = rule.windowMs;
    }

    const resetAt = Date.now() + Math.max(1, ttlMs);
    if (count > rule.max) {
      return {
        ok: false,
        remaining: 0,
        resetAt,
        retryAfterMs: Math.max(1, ttlMs),
      };
    }

    return {
      ok: true,
      remaining: Math.max(0, rule.max - count),
      resetAt,
    };
  } catch (error) {
    logUpstashFallbackOnce(error);
    return rateLimitInMemory(rule);
  }
}

async function getCooldownTtlMs(key: string): Promise<number> {
  if (!shouldUseUpstash()) {
    return getInMemoryTtlMs(authCooldownLocks, key);
  }

  try {
    const ttlMs = Number(await upstashCommand(["PTTL", key]));
    if (!Number.isFinite(ttlMs) || ttlMs <= 0) return 0;
    return ttlMs;
  } catch (error) {
    logUpstashFallbackOnce(error);
    return getInMemoryTtlMs(authCooldownLocks, key);
  }
}

async function setCooldownTtl(key: string, ttlMs: number): Promise<void> {
  const safeTtlMs = Math.max(1, ttlMs);
  if (!shouldUseUpstash()) {
    setInMemoryTtl(authCooldownLocks, key, safeTtlMs);
    return;
  }

  try {
    await upstashCommand(["SET", key, "1", "PX", String(safeTtlMs)]);
  } catch (error) {
    logUpstashFallbackOnce(error);
    setInMemoryTtl(authCooldownLocks, key, safeTtlMs);
  }
}

async function incrementCooldownCounter(key: string, windowMs: number): Promise<number> {
  if (!shouldUseUpstash()) {
    return incrementInMemoryCounter(key, windowMs);
  }

  try {
    const countRaw = await upstashCommand(["INCR", key]);
    const count = Number(countRaw);
    if (!Number.isFinite(count)) {
      throw new Error("Invalid INCR response");
    }

    let ttlMs = Number(await upstashCommand(["PTTL", key]));
    if (!Number.isFinite(ttlMs) || ttlMs < 0 || count === 1) {
      await upstashCommand(["PEXPIRE", key, String(windowMs)]);
      ttlMs = windowMs;
    }

    if (ttlMs <= 0) {
      await upstashCommand(["PEXPIRE", key, String(windowMs)]);
    }

    return count;
  } catch (error) {
    logUpstashFallbackOnce(error);
    return incrementInMemoryCounter(key, windowMs);
  }
}

async function enforceRateLimitSet(rules: RateLimitRule[]) {
  const results = await Promise.all(rules.map((rule) => rateLimit(rule)));
  const blocked = results.filter(
    (result): result is Extract<RateLimitResult, { ok: false }> => !result.ok
  );

  if (blocked.length === 0) {
    return { ok: true as const };
  }

  const retryAfterMs = Math.max(...blocked.map((result) => result.retryAfterMs));
  return { ok: false as const, retryAfterMs };
}

export async function requestMagicLink(formData: FormData) {
  const email = getNormalizedEmail(formData);
  const nextPath = getNextPath(formData);
  const source = getSignInSource(formData);
  const isResendRequest = isResendRequestFlag(formData.get("resend"));

  if (!email || !EMAIL_REGEX.test(email)) {
    redirect(buildSignInPath(nextPath, { error: "Enter a valid email address." }, source));
  }

  const headerStore = await headers();
  const clientIp = getClientIp(headerStore);
  const emailHash = getEmailHash(email);
  const magicLinkSessionId = await getMagicLinkSessionId();
  const sessionScopedEmailHash = `${emailHash}:${magicLinkSessionId}`;
  const cooldownLockKey = `rate:auth:magic-link:cooldown:${sessionScopedEmailHash}`;
  const activeCooldownMs = await getCooldownTtlMs(cooldownLockKey);
  if (shouldApplyMagicLinkCooldown(activeCooldownMs, isResendRequest)) {
    redirect(
      buildSignInPath(
        nextPath,
        {
          error: formatLoginCodeCooldownMessage(activeCooldownMs),
          cooldownUntil: String(Date.now() + activeCooldownMs),
          sent: "1",
          email,
        },
        source
      )
    );
  }

  const limitResult = await enforceRateLimitSet([
    {
      key: `rate:auth:magic-link:ip:${clientIp}`,
      max: MAGIC_LINK_IP_MAX,
      windowMs: MAGIC_LINK_IP_WINDOW_MS,
    },
    {
      key: `rate:auth:magic-link:email:${emailHash}`,
      max: MAGIC_LINK_EMAIL_MAX,
      windowMs: MAGIC_LINK_EMAIL_WINDOW_MS,
    },
  ]);

  if (!limitResult.ok) {
    const params: Record<string, string> = {
      error: formatLoginCodeCooldownMessage(limitResult.retryAfterMs),
      cooldownUntil: String(Date.now() + limitResult.retryAfterMs),
      email,
    };
    if (isResendRequest) {
      params.sent = "1";
    }

    redirect(buildSignInPath(nextPath, params, source));
  }

  const origin = headerStore.get("origin") ?? getAppUrl();
  const emailRedirectTo = buildAuthCallbackUrl(origin, nextPath, source);

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    const classification = classifySignInEmailError(error);
    if (classification.kind === "rate_limited") {
      const params: Record<string, string> = {
        error: classification.userMessage,
        cooldownUntil: String(Date.now() + 60_000),
        email,
      };
      if (isResendRequest) {
        params.sent = "1";
      }

      redirect(buildSignInPath(nextPath, params, source));
    }

    console.error("[Auth] Could not request sign-in email.", {
      kind: classification.kind,
      message: error.message,
      status: error.status,
      code: error.code,
    });
    const incident =
      classification.kind === "service_restricted"
        ? ({
            category: "auth_sign_in_service_restricted",
            severity: "P0",
            affectedFlow: "auth_sign_in",
          } satisfies Pick<AdminIncidentInput, "category" | "severity" | "affectedFlow">)
        : classification.kind === "email_delivery"
          ? ({
              category: "auth_sign_in_email_delivery_failed",
              severity: "P1",
              affectedFlow: "auth_sign_in",
            } satisfies Pick<AdminIncidentInput, "category" | "severity" | "affectedFlow">)
          : null;

    if (incident) {
      await reportAdminIncident({
        ...incident,
        context: {
          reason: classification.kind,
          status: error.status ?? null,
          code: error.code ?? null,
          nextPath: getIncidentPathLabel(nextPath),
          resend: isResendRequest,
        },
      });
    }

    const params: Record<string, string> = {
      error: classification.userMessage,
      email,
    };
    if (isResendRequest) {
      params.sent = "1";
    }

    redirect(buildSignInPath(nextPath, params, source));
  }

  const cadenceCounterKey = `rate:auth:magic-link:cadence:${sessionScopedEmailHash}`;
  const cadenceCount = await incrementCooldownCounter(
    cadenceCounterKey,
    MAGIC_LINK_CADENCE_WINDOW_MS
  );
  const cadenceCooldownMs = getMagicLinkCadenceCooldownMs(cadenceCount);
  await setCooldownTtl(cooldownLockKey, cadenceCooldownMs);

  redirect(
    buildSignInPath(
      nextPath,
      {
        sent: "1",
        email,
        cooldownUntil: String(Date.now() + cadenceCooldownMs),
      },
      source
    )
  );
}

export async function verifySignInCode(formData: FormData) {
  const email = getNormalizedEmail(formData);
  const token = String(formData.get("code") ?? "")
    .trim()
    .replace(/\s+/g, "");
  const nextPath = getNextPath(formData);
  const source = getSignInSource(formData);

  if (!email || !EMAIL_REGEX.test(email)) {
    redirect(
      buildSignInPath(nextPath, { error: "Enter a valid email address.", sent: "1" }, source)
    );
  }

  if (!/^[A-Za-z0-9]{6,10}$/.test(token)) {
    redirect(
      buildSignInPath(
        nextPath,
        {
          error: "Enter the one-time code from your sign-in email.",
          sent: "1",
          email,
        },
        source
      )
    );
  }

  const headerStore = await headers();
  const clientIp = getClientIp(headerStore);
  const emailHash = getEmailHash(email);
  const limitResult = await enforceRateLimitSet([
    {
      key: `rate:auth:verify-code:ip:${clientIp}`,
      max: SIGN_IN_CODE_IP_MAX,
      windowMs: SIGN_IN_CODE_IP_WINDOW_MS,
    },
    {
      key: `rate:auth:verify-code:email:${emailHash}`,
      max: SIGN_IN_CODE_EMAIL_MAX,
      windowMs: SIGN_IN_CODE_EMAIL_WINDOW_MS,
    },
  ]);

  if (!limitResult.ok) {
    redirect(
      buildSignInPath(
        nextPath,
        {
          error: `Too many sign-in attempts. Wait ${toRetrySeconds(limitResult.retryAfterMs)} seconds and try again.`,
          cooldownUntil: String(Date.now() + limitResult.retryAfterMs),
          sent: "1",
          email,
        },
        source
      )
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
    buildSignInPath(
      nextPath,
      {
        error: "Could not verify the one-time code. Request a new sign-in email and try again.",
        sent: "1",
        email,
      },
      source
    )
  );
}
