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

// -------- in-memory rate limiter (dev/single node)
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 6;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function getIP(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function rateLimit(ip: string) {
  const now = Date.now();
  const existing = ipHits.get(ip);

  if (!existing || existing.resetAt <= now) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true as const };
  }

  if (existing.count >= RATE_MAX) {
    return { ok: false as const, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  ipHits.set(ip, existing);
  return { ok: true as const };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function clampString(s: string, max: number) {
  const trimmed = s.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

async function sendWithResend(params: {
  to: string;
  from: string;
  subject: string;
  text: string;
}) {
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
  const origin = req.headers.get("origin") || "";
  const host = req.headers.get("host") || "";
  if (host && origin && !origin.includes(host)) {
    return NextResponse.json({ ok: false, error: "Invalid origin." }, { status: 403 });
  }

  // 2) Content-type check
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return NextResponse.json({ ok: false, error: "Unsupported content type." }, { status: 415 });
  }

  // 3) Rate limit
  const ip = getIP(req);
  const rl = rateLimit(ip);
  if (!rl.ok) {
    const retrySeconds = Math.max(1, Math.ceil(rl.retryAfterMs / 1000));
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(retrySeconds) } }
    );
  }

  // 4) Parse payload
  let body: Payload | null = null;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  // Honeypot: silently accept
  if (body?.company && String(body.company).trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Bot timing: silently accept
  if (typeof body?.startedAt === "number") {
    const elapsed = Date.now() - body.startedAt;
    if (elapsed < 900) return NextResponse.json({ ok: true }, { status: 200 });
  }

  const variant = body?.variant === "analysis" ? "analysis" : "contact";
  const name = clampString(String(body?.name || ""), 80);
  const email = clampString(String(body?.email || ""), 120);
  const message = clampString(String(body?.message || ""), 2000);

  if (name.length < 2) {
    return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ ok: false, error: "Please write a short message." }, { status: 400 });
  }

  // 5) Deliver via env vars
  const to = process.env.CONTACT_TO_EMAIL || "";
  const from =
    process.env.CONTACT_FROM_EMAIL || "Freeswimming <onboarding@resend.dev>";

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
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const sendRes = await sendWithResend({ to, from, subject, text });
  if (!sendRes.ok) {
    console.error("[ContactForm] Email send failed:", sendRes.error);
    return NextResponse.json(
      { ok: false, error: "Could not send right now. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}