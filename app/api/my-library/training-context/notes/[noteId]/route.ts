import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import {
  isValidTrainingNoteState,
  normalizeNullableText,
  normalizeTrainingNoteStatus,
  resolveTrainingNoteResolvedAt,
  type TrainingNoteRow,
} from "@/lib/training-context/mvp";
import { isTrainingContextSchemaMissing } from "@/lib/training-context/schema";
import { loadTrainingContextSnapshot } from "@/lib/training-context/server";

type Params = Promise<{ noteId: string }>;

type NotePatchPayload = {
  body?: string | null;
  status?: string | null;
  answer?: string | null;
};

const TRAINING_NOTE_SELECT = `
  id,
  user_id,
  goal_id,
  focus_id,
  note_type,
  status,
  body,
  answer,
  context_type,
  context_ref,
  resolved_at,
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

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { noteId } = await params;
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
    );
  }

  let payload: NotePatchPayload | null = null;
  try {
    payload = (await request.json()) as NotePatchPayload;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON." }, { status: 400 })
    );
  }

  const noteResult = await supabase
    .from("training_notes")
    .select(TRAINING_NOTE_SELECT)
    .eq("id", noteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (noteResult.error) {
    if (isTrainingContextSchemaMissing(noteResult.error)) {
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

    console.error("[TrainingContext] Failed loading note for patch", noteResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load note right now." }, { status: 500 })
    );
  }

  const existing = noteResult.data as TrainingNoteRow | null;
  if (!existing) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Note not found." }, { status: 404 })
    );
  }

  const nextBody = payload?.body === undefined ? existing.body : (payload.body?.trim() ?? "");
  if (nextBody.length < 3 || nextBody.length > 2000) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Note text must be between 3 and 2000 characters." },
        { status: 400 }
      )
    );
  }

  const nextStatus = normalizeTrainingNoteStatus(payload?.status) ?? existing.status;
  const nextAnswer =
    payload?.answer === undefined ? existing.answer : normalizeNullableText(payload.answer);

  if (!isValidTrainingNoteState(existing.note_type, nextStatus, nextAnswer)) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid note status or answer." }, { status: 400 })
    );
  }

  const nowIso = new Date().toISOString();
  const updateResult = await supabase
    .from("training_notes")
    .update({
      body: nextBody,
      status: nextStatus,
      answer: nextAnswer,
      resolved_at: resolveTrainingNoteResolvedAt(nextStatus, nowIso),
    })
    .eq("id", noteId)
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

    console.error("[TrainingContext] Failed updating note", updateResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update note right now." }, { status: 500 })
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
