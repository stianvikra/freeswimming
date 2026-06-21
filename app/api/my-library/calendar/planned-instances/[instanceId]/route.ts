import { NextResponse } from "next/server";
import { isPlannedWorkoutInstanceSchemaMissing } from "@/lib/programs/schema";
import { PLANNED_WORKOUT_INSTANCE_SELECT } from "@/lib/programs/server";
import {
  getMyLibraryCalendarDayIndex,
  isValidMyLibraryCalendarDateKey,
} from "@/lib/my-library/calendar";
import { isPlannedWorkoutInstanceStatus } from "@/lib/my-library/planned-workout-instances";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type PlannedWorkoutInstanceRow = Database["public"]["Tables"]["planned_workout_instances"]["Row"];
type PlannedWorkoutInstanceUpdate =
  Database["public"]["Tables"]["planned_workout_instances"]["Update"];

type PlannedWorkoutInstanceAction = "move" | "skip" | "cancel" | "recover";

type PlannedWorkoutInstanceActionResponse =
  | {
      ok: true;
      instance: {
        id: string;
        plannedOn: string;
        status: string;
        updatedAt: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

type Props = {
  params: Promise<{
    instanceId: string;
  }>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function noStoreJson(body: PlannedWorkoutInstanceActionResponse, init?: { status?: number }) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function normalizeAction(value: unknown): PlannedWorkoutInstanceAction | null {
  return value === "move" || value === "skip" || value === "cancel" || value === "recover"
    ? value
    : null;
}

function normalizeExpectedUpdatedAt(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= 80 ? normalized : null;
}

function buildUpdatePayload(
  instance: PlannedWorkoutInstanceRow,
  action: PlannedWorkoutInstanceAction,
  plannedOn: unknown
):
  | { ok: true; value: PlannedWorkoutInstanceUpdate }
  | { ok: false; status: number; error: string } {
  if (!isPlannedWorkoutInstanceStatus(instance.status)) {
    return {
      ok: false,
      status: 409,
      error: "This plan item has a status that needs review before it can be changed.",
    };
  }

  if (action === "move") {
    if (instance.status !== "planned") {
      return {
        ok: false,
        status: 409,
        error: "Recover this plan item before rescheduling it.",
      };
    }

    if (!isValidMyLibraryCalendarDateKey(plannedOn)) {
      return { ok: false, status: 400, error: "Choose a valid plan date." };
    }

    return {
      ok: true,
      value: {
        planned_on: plannedOn,
        day_index: getMyLibraryCalendarDayIndex(plannedOn),
        date_override_kind: "manual",
      },
    };
  }

  if (action === "skip") {
    if (instance.status !== "planned") {
      return {
        ok: false,
        status: 409,
        error: "Only planned items can be skipped.",
      };
    }

    return { ok: true, value: { status: "skipped" } };
  }

  if (action === "cancel") {
    if (instance.status !== "planned") {
      return {
        ok: false,
        status: 409,
        error: "Only planned items can be cancelled.",
      };
    }

    return { ok: true, value: { status: "cancelled" } };
  }

  if (instance.status !== "skipped" && instance.status !== "cancelled") {
    return {
      ok: false,
      status: 409,
      error: "Only skipped or cancelled plan items can be recovered.",
    };
  }

  return { ok: true, value: { status: "planned" } };
}

export async function PATCH(request: Request, { params }: Props) {
  const { instanceId } = await params;
  if (!UUID_PATTERN.test(instanceId)) {
    return noStoreJson({ ok: false, error: "Plan item not found." }, { status: 404 });
  }

  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  const action = normalizeAction(body.action);
  if (!action) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unsupported plan item action." }, { status: 400 })
    );
  }

  const expectedUpdatedAt = normalizeExpectedUpdatedAt(body.expectedUpdatedAt);
  if (!expectedUpdatedAt) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Refresh Calendar before changing this item." },
        { status: 400 }
      )
    );
  }

  const instanceResult = await supabase
    .from("planned_workout_instances")
    .select(PLANNED_WORKOUT_INSTANCE_SELECT)
    .eq("user_id", user.id)
    .eq("id", instanceId)
    .maybeSingle();

  if (isPlannedWorkoutInstanceSchemaMissing(instanceResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Program calendar planning is still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (instanceResult.error) {
    console.error("[CalendarPlanApi] Could not load planned instance", instanceResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load this plan item right now." }, { status: 500 })
    );
  }

  if (!instanceResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Plan item not found." }, { status: 404 })
    );
  }

  const instance = instanceResult.data as PlannedWorkoutInstanceRow;
  if (instance.updated_at !== expectedUpdatedAt) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "This plan item changed after the page loaded. Refresh Calendar and try again.",
        },
        { status: 409 }
      )
    );
  }

  const updatePayload = buildUpdatePayload(instance, action, body.plannedOn);
  if (!updatePayload.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: updatePayload.error }, { status: updatePayload.status })
    );
  }

  const updateResult = await supabase
    .from("planned_workout_instances")
    .update(updatePayload.value)
    .eq("user_id", user.id)
    .eq("id", instanceId)
    .eq("status", instance.status)
    .eq("updated_at", expectedUpdatedAt)
    .select(PLANNED_WORKOUT_INSTANCE_SELECT)
    .maybeSingle();

  if (isPlannedWorkoutInstanceSchemaMissing(updateResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Program calendar planning is still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (updateResult.error) {
    console.error("[CalendarPlanApi] Could not update planned instance", updateResult.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not update this plan item right now." },
        { status: 500 }
      )
    );
  }

  if (!updateResult.data) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "This plan item changed after the page loaded. Refresh Calendar and try again.",
        },
        { status: 409 }
      )
    );
  }

  const updatedInstance = updateResult.data as PlannedWorkoutInstanceRow;
  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      instance: {
        id: updatedInstance.id,
        plannedOn: updatedInstance.planned_on,
        status: updatedInstance.status,
        updatedAt: updatedInstance.updated_at,
      },
    })
  );
}
