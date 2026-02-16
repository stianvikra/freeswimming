"use server";

import { createHash } from "node:crypto";
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
const MAGIC_LINK_IP_WINDOW_MS = 60_000;
const MAGIC_LINK_IP_MAX = 8;
const MAGIC_LINK_EMAIL_WINDOW_MS = 10 * 60_000;
const MAGIC_LINK_EMAIL_MAX = 4;
const SIGN_IN_CODE_IP_WINDOW_MS = 5 * 60_000;
const SIGN_IN_CODE_IP_MAX = 12;
const SIGN_IN_CODE_EMAIL_WINDOW_MS = 10 * 60_000;
const SIGN_IN_CODE_EMAIL_MAX = 8;

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
let hasLoggedUpstashFallback = false;

function getNormalizedEmail(formData: FormData): string {
  return String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
}

function getNextPath(formData: FormData): string {
  return getSafeNextPath(String(formData.get("next") ?? ""));
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

function formatRetrySeconds(retryAfterMs: number): number {
  return Math.max(1, Math.ceil(retryAfterMs / 1000));
}

function getCooldownMessage(retryAfterMs: number): string {
  const seconds = formatRetrySeconds(retryAfterMs);
  return `Please wait ${seconds} second${seconds === 1 ? "" : "s"} before requesting a new login code.`;
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
  const useUpstash =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

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
    if (!hasLoggedUpstashFallback) {
      hasLoggedUpstashFallback = true;
      console.error("[Auth] Upstash rate limit failed. Falling back to in-memory.", error);
    }

    return rateLimitInMemory(rule);
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

  if (!email || !EMAIL_REGEX.test(email)) {
    redirect(buildSignInPath(nextPath, { error: "Enter a valid email address." }));
  }

  const headerStore = await headers();
  const clientIp = getClientIp(headerStore);
  const emailHash = getEmailHash(email);
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
    redirect(
      buildSignInPath(nextPath, {
        error: getCooldownMessage(limitResult.retryAfterMs),
        email,
      })
    );
  }

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
    if (error.message.toLowerCase().includes("rate limit")) {
      redirect(
        buildSignInPath(nextPath, {
          error: "Please wait about a minute before requesting a new login code.",
          email,
        })
      );
    }

    console.error("[Auth] Could not request sign-in email.", {
      message: error.message,
      status: error.status,
      code: error.code,
    });
    redirect(
      buildSignInPath(nextPath, {
        error: "Could not send sign-in email right now. Please try again.",
        email,
      })
    );
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
      buildSignInPath(nextPath, {
        error: `Too many sign-in attempts. Wait ${formatRetrySeconds(limitResult.retryAfterMs)} seconds and try again.`,
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
