import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAnalyticsEventName, trackAnalyticsEvent } from "@/lib/analytics/events";

type AnalyticsEventBody = {
  eventName?: unknown;
  payload?: unknown;
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
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return jsonNoStore({ ok: false, error: "Unsupported content type." }, 415);
  }

  let body: AnalyticsEventBody;
  try {
    body = (await request.json()) as AnalyticsEventBody;
  } catch {
    return jsonNoStore({ ok: false, error: "Invalid JSON." }, 400);
  }

  const eventName = String(body.eventName ?? "");
  if (!isAnalyticsEventName(eventName)) {
    return jsonNoStore({ ok: false, error: "Invalid event name." }, 400);
  }

  const payload =
    body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
      ? (body.payload as Record<string, unknown>)
      : undefined;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  trackAnalyticsEvent({
    eventName,
    channel: "client",
    userId: user?.id ?? null,
    payload,
  });

  return jsonNoStore({ ok: true });
}
