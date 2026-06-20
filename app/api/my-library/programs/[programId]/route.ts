import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { isProgramSchemaMissing } from "@/lib/programs/schema";
import {
  buildProgramEditorRecord,
  buildProgramSummary,
  buildProgramUpdate,
  PROGRAM_SELECT,
  syncPlannedWorkoutInstancesForProgram,
  validateProgramWorkoutOwnership,
} from "@/lib/programs/server";
import type { ProgramSaveApiResponse, ProgramSaveRequestBody } from "@/lib/programs/shared";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      programId: string;
    }>;
  }
) {
  const { programId } = await context.params;

  if (!UUID_PATTERN.test(programId)) {
    return noStoreJson({ ok: false, error: "Program not found." }, { status: 404 });
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

  let body: ProgramSaveRequestBody;
  try {
    body = (await request.json()) as ProgramSaveRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  const ownershipValidation = await validateProgramWorkoutOwnership(supabase, user.id, body);
  if (!ownershipValidation.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: ownershipValidation.error }, { status: 400 })
    );
  }

  let updatePayload;
  try {
    updatePayload = buildProgramUpdate(body);
  } catch (error) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Could not save program right now.",
        },
        { status: 400 }
      )
    );
  }

  const result = await supabase
    .from("programs")
    .update(updatePayload)
    .eq("user_id", user.id)
    .eq("id", programId)
    .select(PROGRAM_SELECT)
    .maybeSingle();

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
    console.error("[ProgramsApi] Could not save canonical program", result.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not save program right now." }, { status: 500 })
    );
  }

  if (!result.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Program not found." }, { status: 404 })
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
