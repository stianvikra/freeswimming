import { NextResponse } from "next/server";
import {
  COMPLETED_ACTIVITY_EVENT_OUTCOMES,
  COMPLETED_ACTIVITY_EVENT_SELECT,
  isCompletedActivityEventSchemaMissing,
  isManualCompletedActivityEvent,
  normalizeCompletedActivityEventOutcome,
  type CompletedActivityEventRow,
  type CompletedActivityEventOutcome,
} from "@/lib/my-library/completed-activity-events";
import { isValidMyLibraryCalendarDateKey } from "@/lib/my-library/calendar";
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
type CompletedActivityEventUpdate =
  Database["public"]["Tables"]["completed_activity_events"]["Update"];
type PlannedWorkoutInstanceRow = Database["public"]["Tables"]["planned_workout_instances"]["Row"];
type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];

type CompletionStatus = "completed" | "already_completed" | "corrected";

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
        actualStartedAt: string | null;
        actualDurationSeconds: number | null;
        actualDistanceM: number | null;
        actualEnvironment: string | null;
        actualPoolLengthM: number | null;
        actualPoolLengthUnit: string | null;
        correctionNote: string | null;
        createdAt: string;
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

function normalizeActualOutcome(value: unknown): CompletedActivityEventOutcome | null {
  const normalized = normalizeCompletedActivityEventOutcome(value);
  return normalized === "unmapped" ? null : normalized;
}

function normalizeOptionalIsoDateTime(
  value: unknown
): { ok: true; value: string | null } | { ok: false; error: string } {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: null };
  }

  if (typeof value !== "string" || value.trim().length > 120) {
    return { ok: false, error: "Choose a valid actual start time." };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, error: "Choose a valid actual start time." };
  }

  return { ok: true, value: parsed.toISOString() };
}

function normalizeOptionalNumber(
  value: unknown,
  input: {
    label: string;
    min: number;
    max: number;
    integer?: boolean;
  }
): { ok: true; value: number | null } | { ok: false; error: string } {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: null };
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { ok: false, error: `Choose a valid ${input.label}.` };
  }

  if (value < input.min || value > input.max) {
    return { ok: false, error: `Choose a valid ${input.label}.` };
  }

  if (input.integer && !Number.isInteger(value)) {
    return { ok: false, error: `Choose a valid ${input.label}.` };
  }

  return { ok: true, value };
}

function normalizeActualEnvironment(value: unknown): string | null | false {
  if (value === null || value === undefined || value === "") return null;
  return value === "pool" || value === "open_water" ? value : false;
}

function normalizeActualPoolLengthUnit(value: unknown): string | null | false {
  if (value === null || value === undefined || value === "") return null;
  return value === "m" || value === "yd" ? value : false;
}

function normalizeCorrectionNote(
  value: unknown
): { ok: true; value: string | null } | { ok: false; error: string } {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: null };
  }

  if (typeof value !== "string") {
    return { ok: false, error: "Use a valid correction note." };
  }

  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  if (trimmed.length > 1000) {
    return { ok: false, error: "Keep correction notes under 1000 characters." };
  }

  return { ok: true, value: trimmed };
}

function normalizeCorrectionPayload(
  body: Record<string, unknown>
): { ok: true; value: CompletedActivityEventUpdate } | { ok: false; error: string } {
  const outcome = normalizeActualOutcome(body.outcome);
  if (!outcome || !COMPLETED_ACTIVITY_EVENT_OUTCOMES.includes(outcome)) {
    return { ok: false, error: "Choose a supported actual outcome." };
  }

  const completedOn = typeof body.completedOn === "string" ? body.completedOn : null;
  if (!isValidMyLibraryCalendarDateKey(completedOn)) {
    return { ok: false, error: "Choose a valid actual date." };
  }

  const actualStartedAt = normalizeOptionalIsoDateTime(body.actualStartedAt);
  if (!actualStartedAt.ok) return actualStartedAt;

  const actualDurationSeconds = normalizeOptionalNumber(body.actualDurationSeconds, {
    label: "duration",
    min: 0,
    max: 86400,
    integer: true,
  });
  if (!actualDurationSeconds.ok) return actualDurationSeconds;

  const actualDistanceM = normalizeOptionalNumber(body.actualDistanceM, {
    label: "distance",
    min: 0,
    max: 100000,
  });
  if (!actualDistanceM.ok) return actualDistanceM;

  const actualPoolLengthM = normalizeOptionalNumber(body.actualPoolLengthM, {
    label: "pool length",
    min: 12.5,
    max: 500,
  });
  if (!actualPoolLengthM.ok) return actualPoolLengthM;

  const actualEnvironment = normalizeActualEnvironment(body.actualEnvironment);
  if (actualEnvironment === false) {
    return { ok: false, error: "Choose a supported actual context." };
  }

  const actualPoolLengthUnit = normalizeActualPoolLengthUnit(body.actualPoolLengthUnit);
  if (actualPoolLengthUnit === false) {
    return { ok: false, error: "Choose a supported pool unit." };
  }

  if (actualPoolLengthM.value !== null && actualPoolLengthUnit === null) {
    return { ok: false, error: "Choose a pool unit for the actual pool length." };
  }

  const correctionNote = normalizeCorrectionNote(body.correctionNote);
  if (!correctionNote.ok) return correctionNote;

  return {
    ok: true,
    value: {
      outcome,
      completed_on: completedOn,
      actual_started_at: actualStartedAt.value,
      actual_duration_seconds: actualDurationSeconds.value,
      actual_distance_m: actualDistanceM.value,
      actual_environment: actualEnvironment,
      actual_pool_length_m: actualPoolLengthM.value,
      actual_pool_length_unit: actualPoolLengthUnit,
      correction_note: correctionNote.value,
    },
  };
}

function isUniqueConflict(error: { code?: string | null; message?: string | null } | null) {
  return (
    error?.code === "23505" ||
    `${error?.message ?? ""}`.toLowerCase().includes("completed_activity_events_planned_unique")
  );
}

function buildEventResponse(row: CompletedActivityEventRow, status: CompletionStatus) {
  const outcome = normalizeCompletedActivityEventOutcome(row.outcome);
  return noStoreJson({
    ok: true,
    status,
    event: {
      id: row.id,
      plannedWorkoutInstanceId: row.planned_workout_instance_id,
      workoutId: row.workout_id,
      programId: row.program_id,
      outcome: outcome === "unmapped" ? row.outcome : outcome,
      sourceKind: row.source_kind,
      completedOn: row.completed_on,
      actualStartedAt: row.actual_started_at,
      actualDurationSeconds: row.actual_duration_seconds,
      actualDistanceM: row.actual_distance_m,
      actualEnvironment: row.actual_environment,
      actualPoolLengthM: row.actual_pool_length_m,
      actualPoolLengthUnit: row.actual_pool_length_unit,
      correctionNote: row.correction_note,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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

  const workoutRow = workoutResult.data as WorkoutRow;
  const workoutSummary = tryBuildWorkoutSummary(workoutRow, "calendar completion actual defaults");
  const insertPayload: CompletedActivityEventInsert = {
    user_id: user.id,
    planned_workout_instance_id: instance.id,
    workout_id: instance.workout_id,
    program_id: instance.program_id,
    outcome: "completed_as_planned",
    source_kind: "manual",
    completed_on: instance.planned_on,
    actual_duration_seconds:
      typeof workoutSummary?.estimatedDurationMin === "number"
        ? workoutSummary.estimatedDurationMin * 60
        : null,
    actual_distance_m: workoutSummary?.totalDistanceM ?? null,
    actual_environment: workoutSummary?.environment ?? null,
    actual_pool_length_m: workoutSummary?.poolLengthM ?? null,
    actual_pool_length_unit: workoutSummary?.poolLengthUnit ?? null,
    planned_snapshot: buildPlannedSnapshot({
      instance,
      program: programResult.data as ProgramRow,
      workout: workoutRow,
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

  const expectedActualUpdatedAt = normalizeExpectedUpdatedAt(body.expectedActualUpdatedAt);
  if (!expectedActualUpdatedAt) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Refresh Calendar before correcting this actual." },
        { status: 400 }
      )
    );
  }

  const correctionPayload = normalizeCorrectionPayload(body);
  if (!correctionPayload.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: correctionPayload.error }, { status: 400 })
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
    console.error("[CalendarCompletionApi] Could not load planned instance for correction", {
      error: instanceResult.error,
    });
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
    console.error("[CalendarCompletionApi] Could not load actual for correction", {
      error: existingResult.error,
    });
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not check completion history right now." },
        { status: 500 }
      )
    );
  }

  if (!existingResult.data) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Mark this plan item done before correcting its actual." },
        { status: 409 }
      )
    );
  }

  const existingEvent = existingResult.data as CompletedActivityEventRow;
  if (!isManualCompletedActivityEvent(existingEvent)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "This completion state needs review before it can be changed." },
        { status: 409 }
      )
    );
  }

  const updateResult = await supabase
    .from("completed_activity_events")
    .update(correctionPayload.value)
    .eq("user_id", user.id)
    .eq("planned_workout_instance_id", instance.id)
    .eq("id", existingEvent.id)
    .eq("source_kind", "manual")
    .eq("updated_at", expectedActualUpdatedAt)
    .select(COMPLETED_ACTIVITY_EVENT_SELECT)
    .maybeSingle();

  if (isCompletedActivityEventSchemaMissing(updateResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Completed swim history is still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (updateResult.error) {
    console.error("[CalendarCompletionApi] Could not correct manual actual", updateResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update this actual right now." }, { status: 500 })
    );
  }

  if (!updateResult.data) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "This actual changed after the page loaded. Refresh Calendar and try again.",
        },
        { status: 409 }
      )
    );
  }

  return applySupabaseCookies(
    buildEventResponse(updateResult.data as CompletedActivityEventRow, "corrected")
  );
}
