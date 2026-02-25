import { NextResponse } from "next/server";
import {
  MAX_COURSE_PROGRESS_ROWS,
  normalizeCourseProgressRows,
  type CourseProgressRow,
} from "@/lib/course/progress";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ProgressBody = {
  rows?: unknown;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isMissingDoneConfirmationColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String(error.code ?? "") : "";
  const message = "message" in error ? String(error.message ?? "") : "";

  if (code === "42703" || code === "PGRST204") {
    return message.includes("done_confirmed_at") || message.includes("done confirmed");
  }

  return false;
}

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

function normalizeRowsForResponse(rows: unknown): CourseProgressRow[] {
  return normalizeCourseProgressRows(rows, { maxRows: MAX_COURSE_PROGRESS_ROWS });
}

export async function GET() {
  const { supabase, userId } = await getSignedInUserId();
  if (!userId) {
    return jsonNoStore({ ok: false, error: "Unauthorized." }, 401);
  }

  let data: unknown = null;
  let error: unknown = null;

  {
    const result = await supabase
      .from("course_progress")
      .select("lesson_id, done, done_confirmed_at, video_seconds, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    data = result.data;
    error = result.error;
  }

  if (error && isMissingDoneConfirmationColumnError(error)) {
    const fallbackResult = await supabase
      .from("course_progress")
      .select("lesson_id, done, video_seconds, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) {
    console.error("[CourseProgressApi] Could not load progress", error);
    return jsonNoStore({ ok: false, error: "Could not load course progress." }, 500);
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

  if (body.rows.length > MAX_COURSE_PROGRESS_ROWS) {
    return jsonNoStore(
      {
        ok: false,
        error: `Too many rows. Max ${MAX_COURSE_PROGRESS_ROWS} rows per request.`,
      },
      413
    );
  }

  const normalizedRows = normalizeRowsForResponse(body.rows);
  if (normalizedRows.length === 0) {
    return jsonNoStore({ ok: true, upserted: 0 });
  }

  const rowsWithDoneConfirmation = normalizedRows.map((row) => ({
    user_id: userId,
    lesson_id: row.lessonId,
    done: row.done,
    done_confirmed_at: row.doneConfirmedAt,
    video_seconds: row.videoSeconds,
    updated_at: row.updatedAt,
  }));

  let { error } = await supabase.from("course_progress").upsert(rowsWithDoneConfirmation, {
    onConflict: "user_id,lesson_id",
  });

  if (error && isMissingDoneConfirmationColumnError(error)) {
    const rowsWithoutDoneConfirmation = normalizedRows.map((row) => ({
      user_id: userId,
      lesson_id: row.lessonId,
      done: row.done,
      video_seconds: row.videoSeconds,
      updated_at: row.updatedAt,
    }));

    ({ error } = await supabase.from("course_progress").upsert(rowsWithoutDoneConfirmation, {
      onConflict: "user_id,lesson_id",
    }));
  }

  if (error) {
    console.error("[CourseProgressApi] Could not save progress", error);
    trackAnalyticsEvent({
      eventName: "sync_failed",
      channel: "server",
      userId,
      payload: {
        syncKind: "course",
        rowCount: normalizedRows.length,
      },
    });
    return jsonNoStore({ ok: false, error: "Could not save course progress." }, 500);
  }

  trackAnalyticsEvent({
    eventName: "progress_synced",
    channel: "server",
    userId,
    payload: {
      syncKind: "course",
      rowCount: normalizedRows.length,
    },
  });

  return jsonNoStore({ ok: true, upserted: normalizedRows.length });
}
