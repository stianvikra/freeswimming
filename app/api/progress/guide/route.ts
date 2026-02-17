import { NextResponse } from "next/server";
import {
  MAX_GUIDE_PROGRESS_ROWS,
  normalizeGuideProgressRows,
  type GuideProgressRow,
} from "@/lib/course/guide-progress";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ProgressBody = {
  rows?: unknown;
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

async function getSignedInUserId() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id ?? null };
}

function normalizeRowsForResponse(rows: unknown): GuideProgressRow[] {
  return normalizeGuideProgressRows(rows, { maxRows: MAX_GUIDE_PROGRESS_ROWS });
}

export async function GET() {
  const { supabase, userId } = await getSignedInUserId();
  if (!userId) {
    return jsonNoStore({ ok: false, error: "Unauthorized." }, 401);
  }

  const { data, error } = await supabase
    .from("guide_progress")
    .select("guide_slug, section_id, completed, notes, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[GuideProgressApi] Could not load guide progress", error);
    return jsonNoStore({ ok: false, error: "Could not load guide progress." }, 500);
  }

  return jsonNoStore({
    ok: true,
    rows: normalizeRowsForResponse(data ?? []),
  });
}

export async function POST(request: Request) {
  const { supabase, userId } = await getSignedInUserId();
  if (!userId) {
    return jsonNoStore({ ok: false, error: "Unauthorized." }, 401);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return jsonNoStore({ ok: false, error: "Unsupported content type." }, 415);
  }

  let body: ProgressBody;
  try {
    body = (await request.json()) as ProgressBody;
  } catch {
    return jsonNoStore({ ok: false, error: "Invalid JSON." }, 400);
  }

  if (!Array.isArray(body.rows)) {
    return jsonNoStore({ ok: false, error: "rows must be an array." }, 400);
  }

  if (body.rows.length > MAX_GUIDE_PROGRESS_ROWS) {
    return jsonNoStore(
      {
        ok: false,
        error: `Too many rows. Max ${MAX_GUIDE_PROGRESS_ROWS} rows per request.`,
      },
      413
    );
  }

  const normalizedRows = normalizeRowsForResponse(body.rows);
  if (normalizedRows.length === 0) {
    return jsonNoStore({ ok: true, upserted: 0 });
  }

  const { error } = await supabase.from("guide_progress").upsert(
    normalizedRows.map((row) => ({
      user_id: userId,
      guide_slug: row.guideSlug,
      section_id: row.sectionId,
      completed: row.completed,
      notes: row.notes,
      updated_at: row.updatedAt,
    })),
    { onConflict: "user_id,guide_slug,section_id" }
  );

  if (error) {
    console.error("[GuideProgressApi] Could not save guide progress", error);
    trackAnalyticsEvent({
      eventName: "sync_failed",
      channel: "server",
      userId,
      payload: {
        syncKind: "guide",
        rowCount: normalizedRows.length,
      },
    });
    return jsonNoStore({ ok: false, error: "Could not save guide progress." }, 500);
  }

  trackAnalyticsEvent({
    eventName: "progress_synced",
    channel: "server",
    userId,
    payload: {
      syncKind: "guide",
      rowCount: normalizedRows.length,
    },
  });

  return jsonNoStore({ ok: true, upserted: normalizedRows.length });
}
