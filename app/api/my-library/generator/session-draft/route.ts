import { NextResponse } from "next/server";
import { buildGeneratorHandoffPayload } from "@/lib/generator-intake/shared";
import { loadGeneratorIntakeSnapshot } from "@/lib/generator-intake/server";
import {
  buildSessionDraft,
  validateGeneratedSessionDraftOutput,
} from "@/lib/session-generator-v1/server";
import {
  normalizeSessionGeneratorFormState,
  validateSessionGeneratorFormState,
  type SessionDraftApiResponse,
  type SessionGeneratorRequestBody,
} from "@/lib/session-generator-v1/shared";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

function noStoreJson(
  body: SessionDraftApiResponse | Record<string, unknown>,
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

  let body: SessionGeneratorRequestBody;
  try {
    body = (await request.json()) as SessionGeneratorRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  const snapshot = await loadGeneratorIntakeSnapshot(supabase, user.id);
  const handoff = buildGeneratorHandoffPayload(
    snapshot,
    body.selection ?? null,
    body.overrides ?? null
  );

  if (handoff.overrides.targetType !== "session") {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error:
            "Program generation stays deferred in this slice. Switch the target back to single session.",
        },
        { status: 422 }
      )
    );
  }

  const formState = normalizeSessionGeneratorFormState(body.input ?? null, handoff);
  const validation = validateSessionGeneratorFormState(formState, handoff);

  if (!validation.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: validation.error }, { status: 400 })
    );
  }

  const draft = buildSessionDraft(handoff, validation.value);
  const outputValidation = validateGeneratedSessionDraftOutput(validation.value, draft);

  if (!outputValidation.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: outputValidation.error }, { status: 422 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      handoff,
      draft,
    })
  );
}
