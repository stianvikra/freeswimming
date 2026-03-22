import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { buildTrainingFocusUpdate, normalizeTrainingFocusStatus } from "@/lib/training-context/mvp";
import { isTrainingContextSchemaMissing } from "@/lib/training-context/schema";
import { loadTrainingContextSnapshot } from "@/lib/training-context/server";

type Params = Promise<{ focusId: string }>;

type FocusPatchPayload = {
  action?: "complete" | "archive" | "reopen" | "set_primary" | "clear_primary";
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

function hasFocusEditFields(payload: FocusPatchPayload | null) {
  return (
    payload?.title !== undefined || payload?.details !== undefined || payload?.goalId !== undefined
  );
}

async function validateLinkedGoal(
  supabase: Awaited<ReturnType<typeof createRouteHandlerSupabaseClient>>["supabase"],
  userId: string,
  goalId: string
) {
  const goalResult = await supabase
    .from("goals")
    .select("id")
    .eq("id", goalId)
    .eq("user_id", userId)
    .maybeSingle();

  if (goalResult.error) {
    return {
      ok: false as const,
      error: goalResult.error,
      exists: false,
    };
  }

  return {
    ok: true as const,
    error: null,
    exists: Boolean(goalResult.data),
  };
}

async function maybePromoteOnlyOpenFocus(
  supabase: Awaited<ReturnType<typeof createRouteHandlerSupabaseClient>>["supabase"],
  userId: string
) {
  const openFocusesResult = await supabase
    .from("training_focuses")
    .select("id, is_primary")
    .eq("user_id", userId)
    .eq("status", "open")
    .order("updated_at", { ascending: false });

  if (openFocusesResult.error) {
    console.error(
      "[TrainingContext] Failed loading open focuses for primary normalization",
      openFocusesResult.error
    );
    return;
  }

  const openFocuses = openFocusesResult.data ?? [];
  const hasPrimary = openFocuses.some((focus) => focus.is_primary);
  if (hasPrimary || openFocuses.length !== 1) {
    return;
  }

  const promoteResult = await supabase.rpc("training_focus_set_primary", {
    p_focus_id: openFocuses[0].id,
  });

  if (promoteResult.error) {
    console.error(
      "[TrainingContext] Failed auto-promoting sole open focus to primary",
      promoteResult.error
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { focusId } = await params;
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
    );
  }

  let payload: FocusPatchPayload | null = null;
  try {
    payload = (await request.json()) as FocusPatchPayload;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON." }, { status: 400 })
    );
  }

  const hasAction = typeof payload?.action === "string";
  const hasEditFields = hasFocusEditFields(payload);
  const isValidAction =
    payload?.action === "complete" ||
    payload?.action === "archive" ||
    payload?.action === "reopen" ||
    payload?.action === "set_primary" ||
    payload?.action === "clear_primary";

  if (
    (!hasAction && !hasEditFields) ||
    (hasAction && hasEditFields) ||
    (hasAction && !isValidAction)
  ) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid focus update payload." }, { status: 400 })
    );
  }

  const focusResult = await supabase
    .from("training_focuses")
    .select(TRAINING_FOCUS_SELECT)
    .eq("id", focusId)
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

    console.error("[TrainingContext] Failed loading focus for patch", focusResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load focus right now." }, { status: 500 })
    );
  }

  if (!focusResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Focus not found." }, { status: 404 })
    );
  }

  const currentStatus = normalizeTrainingFocusStatus(focusResult.data.status);
  if (!currentStatus) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not read focus status right now." }, { status: 500 })
    );
  }

  if (hasAction) {
    if (payload.action === "set_primary") {
      if (currentStatus !== "open") {
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Only open focuses can become the primary focus." },
            { status: 409 }
          )
        );
      }

      const setPrimaryResult = await supabase.rpc("training_focus_set_primary", {
        p_focus_id: focusId,
      });

      if (setPrimaryResult.error) {
        if (isTrainingContextSchemaMissing(setPrimaryResult.error)) {
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

        console.error("[TrainingContext] Failed setting primary focus", setPrimaryResult.error);
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Could not set the primary focus right now." },
            { status: 500 }
          )
        );
      }

      const snapshot = await loadTrainingContextSnapshot(supabase, user.id);
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          snapshot,
        })
      );
    }

    if (payload.action === "clear_primary") {
      if (currentStatus !== "open") {
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Only open focuses can remove the primary focus state." },
            { status: 409 }
          )
        );
      }

      const clearPrimaryResult = await supabase
        .from("training_focuses")
        .update({ is_primary: false })
        .eq("id", focusId)
        .eq("user_id", user.id);

      if (clearPrimaryResult.error) {
        if (isTrainingContextSchemaMissing(clearPrimaryResult.error)) {
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

        console.error("[TrainingContext] Failed clearing primary focus", clearPrimaryResult.error);
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Could not clear the primary focus right now." },
            { status: 500 }
          )
        );
      }

      const snapshot = await loadTrainingContextSnapshot(supabase, user.id);
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          snapshot,
        })
      );
    }

    const nowIso = new Date().toISOString();
    const patch =
      payload.action === "complete"
        ? {
            status: "completed" as const,
            is_primary: false,
            completed_at: nowIso,
            archived_at: null,
          }
        : payload.action === "archive"
          ? {
              status: "archived" as const,
              is_primary: false,
              archived_at: nowIso,
              completed_at: null,
            }
          : {
              status: "open" as const,
              is_primary: false,
              completed_at: null,
              archived_at: null,
            };

    const updateResult = await supabase
      .from("training_focuses")
      .update(patch)
      .eq("id", focusId)
      .eq("user_id", user.id);

    if (updateResult.error) {
      if (isTrainingContextSchemaMissing(updateResult.error)) {
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

      console.error("[TrainingContext] Failed updating focus", updateResult.error);
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Could not update focus right now." }, { status: 500 })
      );
    }

    await maybePromoteOnlyOpenFocus(supabase, user.id);

    const snapshot = await loadTrainingContextSnapshot(supabase, user.id);
    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        snapshot,
      })
    );
  }

  if (currentStatus !== "open") {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Only open focuses can be edited." }, { status: 409 })
    );
  }

  const nextFocusUpdate = buildTrainingFocusUpdate({
    title: payload?.title === undefined ? focusResult.data.title : payload.title,
    details: payload?.details === undefined ? focusResult.data.details : payload.details,
    goalId: payload?.goalId === undefined ? focusResult.data.goal_id : payload.goalId,
  });

  if (!nextFocusUpdate) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Focus title must be between 3 and 140 characters." },
        { status: 400 }
      )
    );
  }

  if (nextFocusUpdate.goal_id && nextFocusUpdate.goal_id !== focusResult.data.goal_id) {
    const goalValidation = await validateLinkedGoal(supabase, user.id, nextFocusUpdate.goal_id);

    if (!goalValidation.ok) {
      if (isTrainingContextSchemaMissing(goalValidation.error)) {
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

      console.error("[TrainingContext] Failed loading goal for focus edit", goalValidation.error);
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Could not validate linked goal." }, { status: 500 })
      );
    }

    if (!goalValidation.exists) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Linked goal not found." }, { status: 404 })
      );
    }
  }

  const editResult = await supabase
    .from("training_focuses")
    .update(nextFocusUpdate)
    .eq("id", focusId)
    .eq("user_id", user.id);

  if (editResult.error) {
    if (isTrainingContextSchemaMissing(editResult.error)) {
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

    console.error("[TrainingContext] Failed editing focus", editResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not save focus changes right now." }, { status: 500 })
    );
  }

  const snapshot = await loadTrainingContextSnapshot(supabase, user.id);
  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      snapshot,
    })
  );
}
