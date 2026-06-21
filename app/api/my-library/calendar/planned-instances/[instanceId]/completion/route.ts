import { NextResponse } from "next/server";
import {
  COMPLETED_ACTIVITY_EVENT_SELECT,
  isCompletedActivityEventSchemaMissing,
  isManualCompletedActivityEvent,
  type CompletedActivityEventRow,
} from "@/lib/my-library/completed-activity-events";
import { isPlannedWorkoutInstanceStatus } from "@/lib/my-library/planned-workout-instances";
import {
  isPlannedWorkoutInstanceSchemaMissing,
  isProgramSchemaMissing,
} from "@/lib/programs/schema";
import { PLANNED_WORKOUT_INSTANCE_SELECT, PROGRAM_SELECT } from "@/lib/programs/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { isWorkoutSchemaMissing } from "@/lib/workouts/schema";
import { tryBuildWorkoutSummary, WORKOUT_SELECT } from "@/lib/workouts/server";
import type { Database, Json } from "@/types/database";

type CompletedActivityEventInsert =
  Database["public"]["Tables"]["completed_activity_events"]["Insert"];
type PlannedWorkoutInstanceRow = Database["public"]["Tables"]["planned_workout_instances"]["Row"];
type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];

type CompletionStatus = "completed" | "already_completed";

type CompletionResponse =
  | {
      ok: true;
      status: CompletionStatus;
      event: {
        id: string;
        plannedWorkoutInstanceId: string;
        workoutId: string;
        programId: string;
        outcome: string;
        sourceKind: string;
        completedOn: string;
        createdAt: string;
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

function noStoreJson(body: CompletionResponse, init?: { status?: number }) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function normalizeExpectedUpdatedAt(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= 80 ? normalized : null;
}

function isUniqueConflict(error: { code?: string | null; message?: string | null } | null) {
  return (
    error?.code === "23505" ||
    `${error?.message ?? ""}`.toLowerCase().includes("completed_activity_events_planned_unique")
  );
}

function buildEventResponse(row: CompletedActivityEventRow, status: CompletionStatus) {
  return noStoreJson({
    ok: true,
    status,
    event: {
      id: row.id,
      plannedWorkoutInstanceId: row.planned_workout_instance_id,
      workoutId: row.workout_id,
      programId: row.program_id,
      outcome: row.outcome,
      sourceKind: row.source_kind,
      completedOn: row.completed_on,
      createdAt: row.created_at,
    },
  });
}

function buildPlannedSnapshot(input: {
  instance: PlannedWorkoutInstanceRow;
  program: ProgramRow;
  workout: WorkoutRow;
}): Json {
  const workoutSummary = tryBuildWorkoutSummary(input.workout, "calendar completion snapshot");

  return {
    version: 1,
    kind: "calendar_manual_completion_planned_snapshot_v1",
    plannedWorkoutInstance: {
      id: input.instance.id,
      plannedOn: input.instance.planned_on,
      status: input.instance.status,
      dateOverrideKind: input.instance.date_override_kind,
      sourceKind: input.instance.source_kind,
      programWeekId: input.instance.program_week_id,
      programWeekIndex: input.instance.program_week_index,
      programAssignmentId: input.instance.program_assignment_id,
      dayIndex: input.instance.day_index,
      position: input.instance.position,
      updatedAt: input.instance.updated_at,
    },
    program: {
      id: input.program.id,
      title: input.program.title,
      startsOn: input.program.starts_on,
      status: input.program.status,
      sourceKind: input.program.source_kind,
      updatedAt: input.program.updated_at,
    },
    workout: workoutSummary
      ? {
          id: workoutSummary.id,
          title: workoutSummary.title,
          environment: workoutSummary.environment,
          sessionType: workoutSummary.sessionType,
          totalDistanceM: workoutSummary.totalDistanceM,
          estimatedDurationMin: workoutSummary.estimatedDurationMin,
          sourceKind: workoutSummary.sourceKind,
          status: workoutSummary.status,
          updatedAt: workoutSummary.updatedAt,
        }
      : {
          id: input.workout.id,
          title: input.workout.title,
          updatedAt: input.workout.updated_at,
        },
  };
}

async function readExistingCompletedEvent(
  supabase: Awaited<ReturnType<typeof createRouteHandlerSupabaseClient>>["supabase"],
  userId: string,
  instanceId: string
) {
  return supabase
    .from("completed_activity_events")
    .select(COMPLETED_ACTIVITY_EVENT_SELECT)
    .eq("user_id", userId)
    .eq("planned_workout_instance_id", instanceId)
    .maybeSingle();
}

export async function POST(request: Request, { params }: Props) {
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

  const expectedUpdatedAt = normalizeExpectedUpdatedAt(body.expectedUpdatedAt);
  if (!expectedUpdatedAt) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Refresh Calendar before marking this item done." },
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
    console.error("[CalendarCompletionApi] Could not load planned instance", instanceResult.error);
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
  const existingResult = await readExistingCompletedEvent(supabase, user.id, instance.id);

  if (isCompletedActivityEventSchemaMissing(existingResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Completed swim history is still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (existingResult.error) {
    console.error("[CalendarCompletionApi] Could not load completion event", existingResult.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not check completion history right now." },
        { status: 500 }
      )
    );
  }

  if (existingResult.data) {
    const existingEvent = existingResult.data as CompletedActivityEventRow;
    if (!isManualCompletedActivityEvent(existingEvent)) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "This completion state needs review before it can be changed." },
          { status: 409 }
        )
      );
    }

    return applySupabaseCookies(buildEventResponse(existingEvent, "already_completed"));
  }

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

  if (!isPlannedWorkoutInstanceStatus(instance.status)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "This plan item has a status that needs review before it can be marked done.",
        },
        { status: 409 }
      )
    );
  }

  if (instance.status !== "planned") {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Recover this plan item before marking it done." },
        { status: 409 }
      )
    );
  }

  if (!instance.workout_id) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "This plan item needs a saved workout before it can be marked done." },
        { status: 409 }
      )
    );
  }

  const [programResult, workoutResult] = await Promise.all([
    supabase
      .from("programs")
      .select(PROGRAM_SELECT)
      .eq("user_id", user.id)
      .eq("id", instance.program_id)
      .maybeSingle(),
    supabase
      .from("workouts")
      .select(WORKOUT_SELECT)
      .eq("user_id", user.id)
      .eq("id", instance.workout_id)
      .maybeSingle(),
  ]);

  if (isProgramSchemaMissing(programResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Program save is still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (isWorkoutSchemaMissing(workoutResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Canonical workout save is still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (programResult.error || workoutResult.error) {
    console.error("[CalendarCompletionApi] Could not load completion references", {
      programError: programResult.error,
      workoutError: workoutResult.error,
    });
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not verify this plan item right now." },
        { status: 500 }
      )
    );
  }

  if (!programResult.data || !workoutResult.data) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "This plan item needs its saved plan and workout before it can be marked done.",
        },
        { status: 409 }
      )
    );
  }

  const insertPayload: CompletedActivityEventInsert = {
    user_id: user.id,
    planned_workout_instance_id: instance.id,
    workout_id: instance.workout_id,
    program_id: instance.program_id,
    outcome: "completed",
    source_kind: "manual",
    completed_on: instance.planned_on,
    planned_snapshot: buildPlannedSnapshot({
      instance,
      program: programResult.data as ProgramRow,
      workout: workoutResult.data as WorkoutRow,
    }),
  };

  const insertResult = await supabase
    .from("completed_activity_events")
    .insert(insertPayload)
    .select(COMPLETED_ACTIVITY_EVENT_SELECT)
    .single();

  if (isCompletedActivityEventSchemaMissing(insertResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Completed swim history is still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (insertResult.error) {
    if (isUniqueConflict(insertResult.error)) {
      const duplicateResult = await readExistingCompletedEvent(supabase, user.id, instance.id);
      if (!duplicateResult.error && duplicateResult.data) {
        return applySupabaseCookies(
          buildEventResponse(duplicateResult.data as CompletedActivityEventRow, "already_completed")
        );
      }
    }

    console.error("[CalendarCompletionApi] Could not create completion event", insertResult.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not mark this session done right now." },
        { status: 500 }
      )
    );
  }

  return applySupabaseCookies(
    buildEventResponse(insertResult.data as CompletedActivityEventRow, "completed")
  );
}
