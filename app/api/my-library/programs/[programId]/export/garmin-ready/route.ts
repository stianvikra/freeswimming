import { NextResponse } from "next/server";
import { buildProgramGarminReadyExport } from "@/lib/programs/export";
import { loadProgramExportSnapshot } from "@/lib/programs/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{
    programId: string;
  }>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function noStoreJson(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { programId } = await context.params;
  if (!UUID_PATTERN.test(programId)) {
    return noStoreJson({ ok: false, error: "Invalid program id." }, 400);
  }

  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: "Unauthorized." }, 401));
  }

  const snapshot = await loadProgramExportSnapshot(supabase, user.id, programId);
  if (!snapshot.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: snapshot.error }, snapshot.status));
  }

  return applySupabaseCookies(
    noStoreJson(buildProgramGarminReadyExport(snapshot.value.program, snapshot.value.workoutsById))
  );
}
