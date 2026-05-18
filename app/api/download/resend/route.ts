import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { buildAuthCallbackUrl } from "@/lib/auth/sign-in-context";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getSafeDownloadResendNextPath,
  isValidResendEmail,
  normalizeResendEmail,
  RESEND_DOWNLOAD_GENERIC_MESSAGE,
  toDownloadResendSource,
} from "@/lib/commerce/download-resend";
import { trackAnalyticsEvent } from "@/lib/analytics/events";

type ResendBody = {
  email?: string;
  nextPath?: string;
  source?: string;
};

type RateLimitRule = {
  key: string;
  max: number;
  windowMs: number;
};

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

const RESEND_IP_WINDOW_MS = 10 * 60_000;
const RESEND_IP_MAX = 10;
const RESEND_EMAIL_WINDOW_MS = 30 * 60_000;
const RESEND_EMAIL_MAX = 5;

const resendHits = new Map<string, { count: number; resetAt: number }>();
let hasLoggedUpstashFallback = false;

const GENERIC_OK_BODY = {
  ok: true,
  message: RESEND_DOWNLOAD_GENERIC_MESSAGE,
};

function jsonNoStore(
  body: unknown,
  init?: Omit<ResponseInit, "headers"> & { headers?: HeadersInit }
) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(body, { ...init, headers });
}

function splitHeaderValue(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getClientIp(request: Request): string {
  const forwarded = splitHeaderValue(request.headers.get("x-forwarded-for"))[0];
  if (forwarded) return forwarded;

  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;

  const cloudflare = request.headers.get("cf-connecting-ip")?.trim();
  if (cloudflare) return cloudflare;

  return "unknown";
}

function getEmailHash(email: string): string {
  return createHash("sha256").update(email).digest("hex").slice(0, 32);
}

function shouldUseUpstash(): boolean {
  return (
    Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN)
  );
}

function logUpstashFallbackOnce(error: unknown) {
  if (hasLoggedUpstashFallback) return;
  hasLoggedUpstashFallback = true;
  console.error("[DownloadResend] Upstash rate limit failed. Falling back to in-memory.", error);
}

async function upstashCommand(parts: string[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const endpoint = `${url.replace(/\/+$/, "")}/${parts.map((part) => encodeURIComponent(part)).join("/")}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
  const existing = resendHits.get(rule.key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + rule.windowMs;
    resendHits.set(rule.key, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(0, rule.max - 1), resetAt };
  }

  if (existing.count >= rule.max) {
    const retryAfterMs = Math.max(1, existing.resetAt - now);
    return { ok: false, remaining: 0, resetAt: existing.resetAt, retryAfterMs };
  }

  existing.count += 1;
  resendHits.set(rule.key, existing);
  return {
    ok: true,
    remaining: Math.max(0, rule.max - existing.count),
    resetAt: existing.resetAt,
  };
}

async function rateLimit(rule: RateLimitRule): Promise<RateLimitResult> {
  if (!shouldUseUpstash()) {
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

async function enforceRateLimitSet(rules: RateLimitRule[]) {
  const results = await Promise.all(rules.map((rule) => rateLimit(rule)));
  const blocked = results.filter(
    (result): result is Extract<RateLimitResult, { ok: false }> => !result.ok
  );
  const minRemaining = Math.min(...results.map((result) => result.remaining));
  const maxResetAt = Math.max(...results.map((result) => result.resetAt));

  if (blocked.length === 0) {
    return { ok: true as const, remaining: Math.max(0, minRemaining), resetAt: maxResetAt };
  }

  const retryAfterMs = Math.max(...blocked.map((result) => result.retryAfterMs));
  return {
    ok: false as const,
    remaining: 0,
    resetAt: maxResetAt,
    retryAfterMs,
  };
}

function getRetryAfterSeconds(retryAfterMs: number): number {
  return Math.max(1, Math.ceil(retryAfterMs / 1000));
}

function getRequestOrigin(request: Request): string {
  const headerOrigin = request.headers.get("origin");
  if (!headerOrigin) return getAppUrl();

  try {
    const parsed = new URL(headerOrigin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return getAppUrl();
    }

    return parsed.origin;
  } catch {
    return getAppUrl();
  }
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return jsonNoStore({ ok: false, error: "Unsupported content type." }, { status: 415 });
  }

  let body: ResendBody;
  try {
    body = (await request.json()) as ResendBody;
  } catch {
    return jsonNoStore({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const email = normalizeResendEmail(String(body.email ?? ""));
  if (!email || !isValidResendEmail(email)) {
    return jsonNoStore({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  const source = toDownloadResendSource(body.source);
  const nextPath = getSafeDownloadResendNextPath(body.nextPath);
  const emailHash = getEmailHash(email);
  const clientIp = getClientIp(request);
  const limitResult = await enforceRateLimitSet([
    {
      key: `rate:download:resend:ip:${clientIp}`,
      max: RESEND_IP_MAX,
      windowMs: RESEND_IP_WINDOW_MS,
    },
    {
      key: `rate:download:resend:email:${emailHash}`,
      max: RESEND_EMAIL_MAX,
      windowMs: RESEND_EMAIL_WINDOW_MS,
    },
  ]);

  const rateHeaders = {
    "X-RateLimit-Limit": String(Math.min(RESEND_IP_MAX, RESEND_EMAIL_MAX)),
    "X-RateLimit-Remaining": String(limitResult.remaining),
    "X-RateLimit-Reset": String(Math.floor(limitResult.resetAt / 1000)),
  };

  if (!limitResult.ok) {
    const retryAfter = getRetryAfterSeconds(limitResult.retryAfterMs);
    return jsonNoStore(
      { ok: false, error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          ...rateHeaders,
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  if (source === "claim_entry") {
    trackAnalyticsEvent({
      eventName: "account_claim_started",
      channel: "server",
      payload: {
        nextPath,
      },
    });
  }

  try {
    const adminSupabase = createAdminSupabaseClient();
    const { data: entitlement, error: entitlementError } = await adminSupabase
      .from("entitlements")
      .select("id")
      .eq("purchaser_email", email)
      .limit(1)
      .maybeSingle();

    if (entitlementError) {
      console.error("[DownloadResend] Could not check entitlement by email", {
        source,
        emailHash,
        error: entitlementError.message,
      });
      return jsonNoStore(GENERIC_OK_BODY, { headers: rateHeaders });
    }

    if (!entitlement) {
      console.info("[DownloadResend] No entitlement match for resend request", {
        source,
        emailHash,
      });
      return jsonNoStore(GENERIC_OK_BODY, { headers: rateHeaders });
    }

    const origin = getRequestOrigin(request);
    const emailRedirectTo = buildAuthCallbackUrl(origin, nextPath, source);
    const supabase = await createServerSupabaseClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        shouldCreateUser: true,
      },
    });

    if (otpError) {
      const isRateLimited = otpError.message.toLowerCase().includes("rate limit");
      if (isRateLimited) {
        return jsonNoStore(
          { ok: false, error: "Too many requests. Please try again shortly." },
          {
            status: 429,
            headers: {
              ...rateHeaders,
              "Retry-After": "60",
            },
          }
        );
      }

      console.error("[DownloadResend] Could not send access link", {
        source,
        emailHash,
        message: otpError.message,
      });
      return jsonNoStore(GENERIC_OK_BODY, { headers: rateHeaders });
    }

    console.info("[DownloadResend] Access link sent", {
      source,
      emailHash,
      nextPath,
    });
    trackAnalyticsEvent({
      eventName: "download_link_resent",
      channel: "server",
      payload: {
        source,
        nextPath,
      },
    });
    return jsonNoStore(GENERIC_OK_BODY, { headers: rateHeaders });
  } catch (error) {
    console.error("[DownloadResend] Unexpected resend failure", { source, emailHash, error });
    return jsonNoStore(GENERIC_OK_BODY, { headers: rateHeaders });
  }
}
