import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import {
  GOALS_ACTIVE_LIMIT,
  GOAL_TEMPLATES,
  buildCustomGoalInsert,
  buildGoalView,
  buildTemplateGoalInsert,
  normalizeTargetDate,
} from "@/lib/goals/mvp";
import { countActiveGoals, loadGoalProgressContext, loadGoalViews } from "@/lib/goals/server";
import { isGoalsMvpSchemaMissing } from "@/lib/goals/schema";

type CreateTemplatePayload = {
  mode: "template";
  templateId?: string;
  targetDate?: string | null;
};

type CreateCustomPayload = {
  mode: "custom";
  title?: string;
  metric?: "distance_time" | "distance_continuous" | "count";
  targetDate?: string | null;
  distanceM?: number | null;
  timeSeconds?: number | null;
  count?: number | null;
};

type CreateGoalPayload = CreateTemplatePayload | CreateCustomPayload;

function noStoreJson(
  body: Record<string, unknown>,
  init?: {
    status?: number;
  }
) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
    );
  }

  const [goals, activeCount] = await Promise.all([
    loadGoalViews(supabase, user.id),
    countActiveGoals(supabase, user.id),
  ]);

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      goals,
      activeCount,
      activeLimit: GOALS_ACTIVE_LIMIT,
      templates: GOAL_TEMPLATES,
    })
  );
}

export async function POST(request: Request) {
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
    );
  }

  let payload: CreateGoalPayload | null = null;
  try {
    payload = (await request.json()) as CreateGoalPayload;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON." }, { status: 400 })
    );
  }

  const activeCount = await countActiveGoals(supabase, user.id);
  if (activeCount >= GOALS_ACTIVE_LIMIT) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "You already have 3 active goals. Archive one to add a new goal.",
          code: "ACTIVE_LIMIT_REACHED",
        },
        { status: 409 }
      )
    );
  }

  const targetDate = normalizeTargetDate(payload?.targetDate);
  const insertPayload =
    payload?.mode === "template"
      ? buildTemplateGoalInsert(payload.templateId ?? "", targetDate)
      : payload?.mode === "custom"
        ? buildCustomGoalInsert({
            title: payload.title ?? "",
            metric: payload.metric ?? "distance_continuous",
            targetDate,
            distanceM: payload.distanceM,
            timeSeconds: payload.timeSeconds,
            count: payload.count,
          })
        : null;

  if (!insertPayload) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Invalid goal payload. Check fields and target values." },
        { status: 400 }
      )
    );
  }

  const insertResult = await supabase
    .from("goals")
    .insert({
      ...insertPayload,
      user_id: user.id,
    })
    .select(
      `
      id,
      user_id,
      title,
      goal_type,
      source,
      target_value,
      target_unit,
      target_date,
      target_distance_m,
      target_time_seconds,
      target_count,
      target_ref,
      progress_value,
      status,
      achieved_at,
      celebrated_at,
      created_at,
      updated_at
    `
    )
    .single();

  if (insertResult.error || !insertResult.data) {
    if (isGoalsMvpSchemaMissing(insertResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: "Goals setup is still syncing. Please try again in a minute.",
            code: "GOALS_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[Goals] Failed creating goal", insertResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not create goal right now." }, { status: 500 })
    );
  }

  const context = await loadGoalProgressContext(supabase, user.id);
  const goalView = buildGoalView(insertResult.data, context);

  return applySupabaseCookies(
    noStoreJson(
      {
        ok: true,
        goal: goalView,
      },
      { status: 201 }
    )
  );
}
