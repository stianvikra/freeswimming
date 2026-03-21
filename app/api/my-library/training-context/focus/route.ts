import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { buildTrainingFocusInsert } from "@/lib/training-context/mvp";
import { isTrainingContextSchemaMissing } from "@/lib/training-context/schema";
import { loadTrainingContextSnapshot } from "@/lib/training-context/server";

type CreateFocusPayload = {
  title?: string | null;
  details?: string | null;
  goalId?: string | null;
};

const TRAINING_FOCUS_SELECT = `
  id,
  user_id,
  goal_id,
  title,
  details,
  status,
  is_primary,
  context_type,
  context_ref,
  completed_at,
  archived_at,
  created_at,
  updated_at
`;

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

  let payload: CreateFocusPayload | null = null;
  try {
    payload = (await request.json()) as CreateFocusPayload;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON." }, { status: 400 })
    );
  }

  const insertPayload = buildTrainingFocusInsert(payload ?? {});
  if (!insertPayload) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid focus payload." }, { status: 400 })
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

      console.error("[TrainingContext] Failed loading goal for focus create", goalResult.error);
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

  const openFocusResult = await supabase
    .from("training_focuses")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "open")
    .limit(1);

  if (openFocusResult.error) {
    if (isTrainingContextSchemaMissing(openFocusResult.error)) {
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

    console.error(
      "[TrainingContext] Failed loading open focuses for create",
      openFocusResult.error
    );
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load current focuses." }, { status: 500 })
    );
  }

  const hasExistingOpenFocus = (openFocusResult.data ?? []).length > 0;

  const insertResult = await supabase
    .from("training_focuses")
    .insert({
      ...insertPayload,
      is_primary: hasExistingOpenFocus ? false : true,
      user_id: user.id,
    })
    .select(TRAINING_FOCUS_SELECT)
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

    if (insertResult.error.code === "23505") {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: "Could not save focus right now. Refresh and try again.",
            code: "FOCUS_CREATE_CONFLICT",
          },
          { status: 409 }
        )
      );
    }

    console.error("[TrainingContext] Failed creating focus", insertResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not create focus right now." }, { status: 500 })
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
