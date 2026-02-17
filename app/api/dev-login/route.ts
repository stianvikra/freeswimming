import { NextResponse } from "next/server";
import { getSafeNextPath } from "@/lib/auth/next-path";
import {
  getDevAuthBypassConfig,
  isDevAuthBypassEnabled,
  isDevAuthTokenValid,
  isLocalDevelopmentRequest,
} from "@/lib/auth/dev-auth-bypass";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type DevLoginBody = {
  next?: unknown;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  if (!isDevAuthBypassEnabled()) {
    return jsonNoStore({ ok: false, error: "Not found." }, 404);
  }

  if (!isLocalDevelopmentRequest(request)) {
    return jsonNoStore({ ok: false, error: "Forbidden." }, 403);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return jsonNoStore({ ok: false, error: "Unsupported content type." }, 415);
  }

  let body: DevLoginBody;
  try {
    body = (await request.json()) as DevLoginBody;
  } catch {
    return jsonNoStore({ ok: false, error: "Invalid JSON." }, 400);
  }

  const config = getDevAuthBypassConfig();
  const token = request.headers.get("x-dev-auth-token");
  if (!isDevAuthTokenValid(token, config.token)) {
    return jsonNoStore({ ok: false, error: "Unauthorized." }, 401);
  }

  const supabase = await createServerSupabaseClient();

  try {
    await supabase.auth.signOut();
  } catch {}

  const { error } = await supabase.auth.signInWithPassword({
    email: config.email,
    password: config.password,
  });

  if (error) {
    console.error("[DevLoginApi] Could not sign in with configured dev account", error);
    return jsonNoStore({ ok: false, error: "Could not sign in." }, 401);
  }

  const nextInput = typeof body.next === "string" ? body.next : "";
  const nextPath = getSafeNextPath(nextInput, "/my-library");

  return jsonNoStore({
    ok: true,
    nextPath,
    userEmail: config.email,
  });
}
