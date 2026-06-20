import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { isProgramSchemaMissing } from "@/lib/programs/schema";
import {
  buildProgramEditorRecord,
  buildProgramInsert,
  buildProgramSummary,
  PROGRAM_SELECT,
  syncPlannedWorkoutInstancesForProgram,
  validateProgramWorkoutOwnership,
} from "@/lib/programs/server";
import {
  buildManualProgramStarterState,
  type ProgramSaveApiResponse,
  type ProgramSaveRequestBody,
} from "@/lib/programs/shared";

function noStoreJson(
  body: ProgramSaveApiResponse | Record<string, unknown>,
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

  let body: ProgramSaveRequestBody | null = null;
  try {
    body = (await request.json()) as ProgramSaveRequestBody;
  } catch {
    body = null;
  }

  const starter = buildManualProgramStarterState();
  const hydratedBody: ProgramSaveRequestBody = {
    title: body?.title ?? starter.title,
    startsOn: body?.startsOn ?? starter.startsOn,
    weeks: body?.weeks ?? starter.weeks,
    sourceKind: "manual",
  };

  const ownershipValidation = await validateProgramWorkoutOwnership(
    supabase,
    user.id,
    hydratedBody
  );
  if (!ownershipValidation.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: ownershipValidation.error }, { status: 400 })
    );
  }

  let insertPayload;
  try {
    insertPayload = buildProgramInsert(user.id, hydratedBody, "manual");
  } catch (error) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Could not create program right now.",
        },
        { status: 400 }
      )
    );
  }

  const result = await supabase
    .from("programs")
    .insert(insertPayload)
    .select(PROGRAM_SELECT)
    .single();

  if (isProgramSchemaMissing(result.error)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Canonical program save is still syncing in this environment.",
        },
        { status: 503 }
      )
    );
  }

  if (result.error) {
    console.error("[ProgramsApi] Could not create canonical program", result.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not create program right now." }, { status: 500 })
    );
  }

  const program = buildProgramEditorRecord(result.data);
  const syncResult = await syncPlannedWorkoutInstancesForProgram(supabase, user.id, program);
  if (!syncResult.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: syncResult.error }, { status: syncResult.status })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      program,
      summary: buildProgramSummary(result.data),
    })
  );
}
