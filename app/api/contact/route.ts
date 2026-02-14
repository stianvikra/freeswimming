// app/api/contact/route.ts
import { NextResponse } from "next/server";

type Payload = {
  variant?: "contact" | "analysis";
  name?: string;
  email?: string;
  message?: string;

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

async function sendWithResend(params: { to: string; from: string; subject: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false as const, error: "RESEND_API_KEY not set" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      text: params.text,
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return { ok: false as const, error: `Resend error: ${res.status} ${t}` };
  }

  return { ok: true as const };
}

export async function POST(req: Request) {
  // 1) Same-origin check (basic CSRF protection)
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Invalid origin." }, { status: 403 });
  }

  // 2) Content-type check
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return NextResponse.json({ ok: false, error: "Unsupported content type." }, { status: 415 });
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
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again shortly." },
      { status: 429, headers: { ...rateHeaders, "Retry-After": String(retrySeconds) } }
    );
  }

  // 4) Parse payload
  let body: Payload | null = null;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON." },
      { status: 400, headers: rateHeaders }
    );
  }

  // Honeypot: silently accept
  if (body?.company && String(body.company).trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 200, headers: rateHeaders });
  }

  // Bot timing: silently accept
  if (typeof body?.startedAt === "number") {
    const elapsed = Date.now() - body.startedAt;
    if (elapsed < 900)
      return NextResponse.json({ ok: true }, { status: 200, headers: rateHeaders });
  }

  const variant = body?.variant === "analysis" ? "analysis" : "contact";
  const name = clampString(String(body?.name || ""), 80);
  const email = clampString(String(body?.email || ""), 120);
  const message = clampString(String(body?.message || ""), 2000);

  if (name.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Please enter your name." },
      { status: 400, headers: rateHeaders }
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email." },
      { status: 400, headers: rateHeaders }
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Please write a short message." },
      { status: 400, headers: rateHeaders }
    );
  }

  // 5) Deliver via env vars
  const to = process.env.CONTACT_TO_EMAIL || "";
  const from = process.env.CONTACT_FROM_EMAIL || "Freeswimming <onboarding@resend.dev>";

  const subject =
    variant === "analysis"
      ? `Freeswimming — Video analysis request (${name})`
      : `Freeswimming — New contact message (${name})`;

  const text =
    `Variant: ${variant}\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    `IP: ${ip}\n` +
    `\nMessage:\n${message}\n`;

  // If not configured yet: log in dev, still return ok
  if (!to) {
    console.log("[ContactForm] Missing CONTACT_TO_EMAIL. Message captured:\n" + text);
    return NextResponse.json({ ok: true }, { status: 200, headers: rateHeaders });
  }

  const sendRes = await sendWithResend({ to, from, subject, text });
  if (!sendRes.ok) {
    console.error("[ContactForm] Email send failed:", sendRes.error);
    return NextResponse.json(
      { ok: false, error: "Could not send right now. Please try again." },
      { status: 500, headers: rateHeaders }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200, headers: rateHeaders });
}
