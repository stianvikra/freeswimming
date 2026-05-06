// app/api/contact/route.ts
import { NextResponse } from "next/server";
import {
  buildContactNotificationPayload,
  buildPrivacySafeRequestMetadata,
  createContactNotificationAttempt,
  storeContactIntakeMessage,
  updateContactNotificationAttempt,
  type ContactIntakeStructuredFields,
} from "@/lib/admin/contact-intake";
import { deliverMessage } from "@/lib/admin/message-delivery";
import { trackAnalyticsEvent } from "@/lib/analytics/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  variant?: "contact" | "analysis" | "goals_coaching" | "preview_access_notify";
  name?: string;
  email?: string;
  message?: string;
  goalsCoaching?: {
    primaryGoal?: string;
    level?: "learning_freestyle" | "beginner" | "intermediate" | "fast";
    trainingDaysPerWeek?: number;
    weeklyVolume?: string;
    targetDate?: string | null;
  };

  // anti-spam
  company?: string; // honeypot
  startedAt?: number | null; // client timestamp
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

function noStoreJson(
  body: Record<string, unknown>,
  init?: {
    status?: number;
    headers?: HeadersInit;
  }
) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers,
  });
}

function splitHeaderValue(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function buildAllowedOrigins(req: Request) {
  const allowed = new Set<string>();

  const fromEnv = splitHeaderValue(process.env.CONTACT_ALLOWED_ORIGINS ?? "");
  for (const origin of fromEnv) {
    try {
      allowed.add(new URL(origin).origin.toLowerCase());
    } catch {}
  }

  const forwardedHost = splitHeaderValue(req.headers.get("x-forwarded-host"))[0];
  const host = forwardedHost || req.headers.get("host") || "";
  if (!host) return allowed;

  const forwardedProto = splitHeaderValue(req.headers.get("x-forwarded-proto"))[0];
  const isLocalHost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const proto = forwardedProto || (isLocalHost ? "http" : "https");
  allowed.add(`${proto}://${host}`.toLowerCase());

  // Allow both for local development.
  if (isLocalHost) {
    allowed.add(`http://${host}`.toLowerCase());
    allowed.add(`https://${host}`.toLowerCase());
  }

  return allowed;
}

function isAllowedOrigin(req: Request) {
  const originHeader = req.headers.get("origin");
  if (!originHeader) return true;

  let origin = "";
  try {
    origin = new URL(originHeader).origin.toLowerCase();
  } catch {
    return false;
  }

  const allowedOrigins = buildAllowedOrigins(req);
  return allowedOrigins.has(origin);
}

// -------- in-memory rate limiter (fallback/dev)
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 6;
const ipHits = new Map<string, { count: number; resetAt: number }>();
let hasLoggedUpstashFallback = false;

function getIP(req: Request) {
  const fwd = splitHeaderValue(req.headers.get("x-forwarded-for"))[0];
  if (fwd) return fwd;
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function rateLimitInMemory(ip: string): RateLimitResult {
  const now = Date.now();
  const existing = ipHits.get(ip);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + RATE_WINDOW_MS;
    ipHits.set(ip, { count: 1, resetAt });
    return { ok: true as const, remaining: RATE_MAX - 1, resetAt };
  }

  if (existing.count >= RATE_MAX) {
    const retryAfterMs = Math.max(1, existing.resetAt - now);
    return { ok: false as const, remaining: 0, retryAfterMs, resetAt: existing.resetAt };
  }

  existing.count += 1;
  ipHits.set(ip, existing);
  return {
    ok: true as const,
    remaining: Math.max(0, RATE_MAX - existing.count),
    resetAt: existing.resetAt,
  };
}

async function upstashCommand(parts: string[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const endpoint = `${url.replace(/\/+$/, "")}/${parts.map((p) => encodeURIComponent(p)).join("/")}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Upstash command failed (${res.status}) ${t}`);
  }

  const json = (await res.json().catch(() => null)) as { result?: unknown } | null;
  return json?.result ?? null;
}

async function rateLimit(ip: string): Promise<RateLimitResult> {
  const useUpstash =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (!useUpstash) {
    return rateLimitInMemory(ip);
  }

  try {
    const key = `rate:contact:${ip}`;
    const countRaw = await upstashCommand(["INCR", key]);
    const count = Number(countRaw);
    if (!Number.isFinite(count)) throw new Error("Invalid INCR response");

    let ttlMs = Number(await upstashCommand(["PTTL", key]));
    if (!Number.isFinite(ttlMs) || ttlMs < 0 || count === 1) {
      await upstashCommand(["PEXPIRE", key, String(RATE_WINDOW_MS)]);
      ttlMs = RATE_WINDOW_MS;
    }

    const resetAt = Date.now() + Math.max(1, ttlMs);
    if (count > RATE_MAX) {
      return {
        ok: false,
        remaining: 0,
        resetAt,
        retryAfterMs: Math.max(1, ttlMs),
      };
    }

    return {
      ok: true,
      remaining: Math.max(0, RATE_MAX - count),
      resetAt,
    };
  } catch (error) {
    if (!hasLoggedUpstashFallback) {
      hasLoggedUpstashFallback = true;
      console.error("[ContactForm] Upstash rate limit failed. Falling back to in-memory.", error);
    }
    return rateLimitInMemory(ip);
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function clampString(s: string, max: number) {
  const trimmed = s.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function isValidDateString(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(req: Request) {
  // 1) Same-origin check (basic CSRF protection)
  if (!isAllowedOrigin(req)) {
    return noStoreJson({ ok: false, error: "Invalid origin." }, { status: 403 });
  }

  // 2) Content-type check
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return noStoreJson({ ok: false, error: "Unsupported content type." }, { status: 415 });
  }

  // 3) Rate limit
  const ip = getIP(req);
  const rl = await rateLimit(ip);
  const rateHeaders = {
    "X-RateLimit-Limit": String(RATE_MAX),
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": String(Math.floor(rl.resetAt / 1000)),
  };
  if (!rl.ok) {
    const retrySeconds = Math.max(1, Math.ceil(rl.retryAfterMs / 1000));
    trackAnalyticsEvent({
      eventName: "contact_intake_rate_limited",
      channel: "server",
      payload: {
        sourceVariant: "unknown",
        outcome: "rate_limited",
      },
    });
    return noStoreJson(
      { ok: false, error: "Too many requests. Try again shortly." },
      { status: 429, headers: { ...rateHeaders, "Retry-After": String(retrySeconds) } }
    );
  }

  // 4) Parse payload
  let body: Payload | null = null;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return noStoreJson(
      { ok: false, error: "Invalid JSON." },
      { status: 400, headers: rateHeaders }
    );
  }

  // Honeypot: silently accept
  if (body?.company && String(body.company).trim().length > 0) {
    return noStoreJson({ ok: true }, { status: 200, headers: rateHeaders });
  }

  // Bot timing: silently accept
  if (typeof body?.startedAt === "number") {
    const elapsed = Date.now() - body.startedAt;
    if (elapsed < 900) return noStoreJson({ ok: true }, { status: 200, headers: rateHeaders });
  }

  const variant =
    body?.variant === "analysis"
      ? "analysis"
      : body?.variant === "goals_coaching"
        ? "goals_coaching"
        : body?.variant === "preview_access_notify"
          ? "preview_access_notify"
          : "contact";
  const name = clampString(String(body?.name || ""), 80);
  const email = clampString(String(body?.email || ""), 120);
  const message = clampString(String(body?.message || ""), 2000);
  const goalsCoaching = body?.goalsCoaching;

  if (name.length < 2) {
    return noStoreJson(
      { ok: false, error: "Please enter your name." },
      { status: 400, headers: rateHeaders }
    );
  }
  if (!isValidEmail(email)) {
    return noStoreJson(
      { ok: false, error: "Please enter a valid email." },
      { status: 400, headers: rateHeaders }
    );
  }
  if (variant !== "goals_coaching" && variant !== "preview_access_notify" && message.length < 10) {
    return noStoreJson(
      { ok: false, error: "Please write a short message." },
      { status: 400, headers: rateHeaders }
    );
  }

  let structuredIntake: ContactIntakeStructuredFields = {};
  if (variant === "goals_coaching") {
    const primaryGoal = clampString(String(goalsCoaching?.primaryGoal || ""), 160);
    const level = String(goalsCoaching?.level || "");
    const trainingDaysPerWeek = Number(goalsCoaching?.trainingDaysPerWeek ?? NaN);
    const weeklyVolume = clampString(String(goalsCoaching?.weeklyVolume || ""), 120);
    const targetDateRaw =
      typeof goalsCoaching?.targetDate === "string" ? goalsCoaching.targetDate : null;
    const targetDate = isValidDateString(targetDateRaw) ? targetDateRaw : null;

    const levelMap: Record<string, string> = {
      learning_freestyle: "Learning freestyle (2:00+ /100m)",
      beginner: "Beginner (1:50 /100m)",
      intermediate: "Intermediate (1:40 /100m)",
      fast: "Fast (1:30 or faster /100m)",
    };

    if (primaryGoal.length < 3) {
      return noStoreJson(
        { ok: false, error: "Please enter your primary goal." },
        { status: 400, headers: rateHeaders }
      );
    }

    if (!Object.prototype.hasOwnProperty.call(levelMap, level)) {
      return noStoreJson(
        { ok: false, error: "Please choose your current level." },
        { status: 400, headers: rateHeaders }
      );
    }

    if (
      !Number.isFinite(trainingDaysPerWeek) ||
      trainingDaysPerWeek < 1 ||
      trainingDaysPerWeek > 7
    ) {
      return noStoreJson(
        { ok: false, error: "Please choose training days per week." },
        { status: 400, headers: rateHeaders }
      );
    }

    if (weeklyVolume.length < 2) {
      return noStoreJson(
        { ok: false, error: "Please enter your current weekly volume." },
        { status: 400, headers: rateHeaders }
      );
    }

    structuredIntake = {
      primaryGoal,
      level,
      levelLabel: levelMap[level],
      trainingDaysPerWeek,
      weeklyVolume,
      targetDate,
    };
  }

  const requestMetadata = buildPrivacySafeRequestMetadata(req, ip);
  const stored = await storeContactIntakeMessage({
    sourceVariant: variant,
    submitterName: name,
    submitterEmail: email,
    messageBody: message,
    structuredIntake,
    requestMetadata,
  });

  if (!stored.ok) {
    console.error("[ContactForm] Contact intake storage failed.", {
      errorCode: stored.errorCode,
      message: stored.redactedErrorMessage,
    });
    trackAnalyticsEvent({
      eventName: "contact_intake_failed",
      channel: "server",
      payload: {
        sourceVariant: variant,
        reason: stored.errorCode,
      },
    });
    return noStoreJson(
      { ok: false, error: "Could not save right now. Please try again." },
      { status: 500, headers: rateHeaders }
    );
  }

  const attempt = await createContactNotificationAttempt({
    messageId: stored.messageId,
    requestMetadata,
  });
  let notificationStatus = "attempt_not_recorded";
  let notificationErrorCode: string | null = attempt.ok ? null : attempt.errorCode;

  if (attempt.ok) {
    const payloadResult = buildContactNotificationPayload({
      messageId: stored.messageId,
      attemptId: attempt.attemptId,
      sourceVariant: variant,
      submitterName: name,
      submitterEmail: email,
      messageBody: message,
      structuredIntake,
      requestMetadata,
    });
    const deliveryResult = payloadResult.ok
      ? await deliverMessage(payloadResult.payload)
      : payloadResult.result;
    notificationStatus = deliveryResult.status;
    notificationErrorCode = deliveryResult.errorCode ?? null;

    const updateResult = await updateContactNotificationAttempt({
      messageId: stored.messageId,
      attemptId: attempt.attemptId,
      result: deliveryResult,
    });
    if (!updateResult.ok) {
      console.error("[ContactForm] Contact notification attempt update failed.", {
        message: updateResult.redactedErrorMessage,
      });
    }
  } else {
    console.error("[ContactForm] Contact notification attempt insert failed.", {
      errorCode: attempt.errorCode,
      message: attempt.redactedErrorMessage,
    });
  }

  trackAnalyticsEvent({
    eventName: "contact_intake_accepted",
    channel: "server",
    payload: {
      sourceVariant: variant,
      storageMode: stored.storageMode,
      notificationStatus,
    },
  });

  if (notificationStatus !== "accepted_by_provider") {
    trackAnalyticsEvent({
      eventName: "contact_intake_notification_failed",
      channel: "server",
      payload: {
        sourceVariant: variant,
        status: notificationStatus,
        errorCode: notificationErrorCode,
      },
    });
  }

  return noStoreJson({ ok: true }, { status: 200, headers: rateHeaders });
}
