import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { buildTrainingNoteInsert } from "@/lib/training-context/mvp";
import { isTrainingContextSchemaMissing } from "@/lib/training-context/schema";
import { loadTrainingContextSnapshot } from "@/lib/training-context/server";

type CreateNotePayload = {
  noteType?: string | null;
  body?: string | null;
  goalId?: string | null;
  focusId?: string | null;
};

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

  let payload: CreateNotePayload | null = null;
  try {
    payload = (await request.json()) as CreateNotePayload;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON." }, { status: 400 })
    );
  }

  const insertPayload = buildTrainingNoteInsert(payload ?? {});
  if (!insertPayload) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid note payload." }, { status: 400 })
    );
  }

  if (insertPayload.goal_id) {
    const goalResult = await supabase
      .from("goals")
      .select("id")
      .eq("id", insertPayload.goal_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (goalResult.error) {
      if (isTrainingContextSchemaMissing(goalResult.error)) {
        return applySupabaseCookies(
          noStoreJson(
            {
              ok: false,
              error: "Training context setup is still syncing. Please try again in a minute.",
              code: "TRAINING_CONTEXT_SCHEMA_NOT_READY",
            },
            { status: 503 }
          )
        );
      }

      console.error("[TrainingContext] Failed loading goal for note create", goalResult.error);
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Could not validate linked goal." }, { status: 500 })
      );
    }

    if (!goalResult.data) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Linked goal not found." }, { status: 404 })
      );
    }
  }

  if (insertPayload.focus_id) {
    const focusResult = await supabase
      .from("training_focuses")
      .select("id")
      .eq("id", insertPayload.focus_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (focusResult.error) {
      if (isTrainingContextSchemaMissing(focusResult.error)) {
        return applySupabaseCookies(
          noStoreJson(
            {
              ok: false,
              error: "Training context setup is still syncing. Please try again in a minute.",
              code: "TRAINING_CONTEXT_SCHEMA_NOT_READY",
            },
            { status: 503 }
          )
        );
      }

      console.error("[TrainingContext] Failed loading focus for note create", focusResult.error);
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Could not validate linked focus." }, { status: 500 })
      );
    }

    if (!focusResult.data) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Linked focus not found." }, { status: 404 })
      );
    }
  }

  const insertResult = await supabase
    .from("training_notes")
    .insert({
      ...insertPayload,
      user_id: user.id,
    })
    .select("id")
    .single();

  if (insertResult.error) {
    if (isTrainingContextSchemaMissing(insertResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: "Training context setup is still syncing. Please try again in a minute.",
            code: "TRAINING_CONTEXT_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[TrainingContext] Failed creating note", insertResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not create note right now." }, { status: 500 })
    );
  }

  const snapshot = await loadTrainingContextSnapshot(supabase, user.id);
  return applySupabaseCookies(
    noStoreJson(
      {
        ok: true,
        snapshot,
      },
      { status: 201 }
    )
  );
}
