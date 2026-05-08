import type { SupabaseClient } from "@supabase/supabase-js";
import { buildManualDrylandStarterDraft } from "@/lib/dryland/manual";
import {
  buildDrylandMicroBlocksFromDraft,
  buildDrylandMicroPlanRecord,
  buildDrylandMicroPlanWeekWindow,
} from "@/lib/dryland/micro-plans";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import {
  buildDrylandSessionRecord,
  buildDrylandSessionSummary,
  normalizeDrylandSessionDraft,
  type DrylandLibrarySnapshot,
  type DrylandSaveRequestBody,
  type DrylandSessionDraft,
  type DrylandSessionKind,
  type DrylandSourceKind,
} from "@/lib/dryland/shared";
import type { Database, Json } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;
type DrylandRow = Database["public"]["Tables"]["dryland_sessions"]["Row"];
type DrylandInsert = Database["public"]["Tables"]["dryland_sessions"]["Insert"];
type DrylandUpdate = Database["public"]["Tables"]["dryland_sessions"]["Update"];
type DrylandMicroPlanRow = Database["public"]["Tables"]["dryland_micro_plans"]["Row"];
type DrylandMicroPlanInsert = Database["public"]["Tables"]["dryland_micro_plans"]["Insert"];

export const DRYLAND_SELECT = `
  id,
  user_id,
  source_kind,
  status,
  session_kind,
  title,
  description,
  focus_text,
  exercises,
  started_at,
  completed_at,
  actual_duration_seconds,
  created_at,
  updated_at
`;

export const DRYLAND_MICRO_PLAN_SELECT = `
  id,
  user_id,
  source_dryland_session_id,
  status,
  session_kind,
  source_session_title,
  title,
  timezone,
  week_starts_at,
  week_ends_at,
  blocks,
  created_at,
  updated_at
`;

function deriveDrylandStatus(draft: DrylandSessionDraft) {
  if (draft.completedAt) return "completed";
  if (draft.startedAt) return "in_progress";
  return "draft";
}

export function buildDrylandInsert(
  userId: string,
  draft: unknown,
  sessionKind: DrylandSessionKind,
  sourceKind: DrylandSourceKind = "manual"
): DrylandInsert {
  const normalized = normalizeDrylandSessionDraft(
    draft ?? buildManualDrylandStarterDraft(sessionKind)
  );
  if (!normalized.ok) {
    throw new Error(normalized.error);
  }

  return {
    user_id: userId,
    source_kind: sourceKind,
    status: deriveDrylandStatus(normalized.value),
    session_kind: normalized.value.sessionKind,
    title: normalized.value.title,
    description: normalized.value.description,
    focus_text: normalized.value.focusText,
    exercises: normalized.value.exercises as unknown as Json,
    started_at: normalized.value.startedAt,
    completed_at: normalized.value.completedAt,
    actual_duration_seconds: normalized.value.actualDurationSeconds,
  };
}

export function buildDrylandUpdate(draft: unknown): DrylandUpdate {
  const normalized = normalizeDrylandSessionDraft(draft);
  if (!normalized.ok) {
    throw new Error(normalized.error);
  }

  return {
    status: deriveDrylandStatus(normalized.value),
    session_kind: normalized.value.sessionKind,
    title: normalized.value.title,
    description: normalized.value.description,
    focus_text: normalized.value.focusText,
    exercises: normalized.value.exercises as unknown as Json,
    started_at: normalized.value.startedAt,
    completed_at: normalized.value.completedAt,
    actual_duration_seconds: normalized.value.actualDurationSeconds,
  };
}

export function buildDrylandMicroPlanInsert(
  userId: string,
  sourceSession: DrylandRow,
  timezoneInput: unknown,
  now = new Date()
): DrylandMicroPlanInsert {
  const sourceRecord = buildDrylandSessionRecord(sourceSession);
  const blocks = buildDrylandMicroBlocksFromDraft(sourceRecord.draft);
  const weekWindow = buildDrylandMicroPlanWeekWindow(now, timezoneInput);

  return {
    user_id: userId,
    source_dryland_session_id: sourceSession.id,
    status: "active",
    session_kind: sourceRecord.draft.sessionKind,
    source_session_title: sourceRecord.draft.title,
    title: `Micro plan: ${sourceRecord.draft.title}`.slice(0, 120),
    timezone: weekWindow.timezone,
    week_starts_at: weekWindow.weekStartsAt,
    week_ends_at: weekWindow.weekEndsAt,
    blocks: blocks as unknown as Json,
  };
}

export function normalizeDrylandSourceKind(
  value: DrylandSaveRequestBody["sourceKind"]
): DrylandSourceKind {
  return value === "manual" ? "manual" : "manual";
}

export function normalizeDrylandSessionKindInput(
  value: DrylandSaveRequestBody["sessionKind"]
): DrylandSessionKind {
  return value === "stretching" ? "stretching" : "strength";
}

export async function loadDrylandLibrarySnapshot(
  supabase: TypedSupabaseClient,
  userId: string,
  selectedSessionId: string | null
): Promise<DrylandLibrarySnapshot> {
  const [recentResult, selectedResult, microPlanResult] = await Promise.all([
    supabase
      .from("dryland_sessions")
      .select(DRYLAND_SELECT)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(8),
    selectedSessionId
      ? supabase
          .from("dryland_sessions")
          .select(DRYLAND_SELECT)
          .eq("user_id", userId)
          .eq("id", selectedSessionId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("dryland_micro_plans")
      .select(DRYLAND_MICRO_PLAN_SELECT)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (isDrylandSchemaMissing(recentResult.error) || isDrylandSchemaMissing(selectedResult.error)) {
    return {
      schemaReady: false,
      microPlanSchemaReady: false,
      loadError: null,
      microPlanLoadError: null,
      selectedSession: null,
      selectedSessionMissing: false,
      recentSessions: [],
      microPlan: null,
    };
  }

  const microPlanSchemaReady = !isDrylandSchemaMissing(microPlanResult.error);

  if (recentResult.error) {
    console.error("[Dryland] Could not load dryland sessions", recentResult.error);
    return {
      schemaReady: true,
      microPlanSchemaReady,
      loadError: "Could not load saved dryland sessions right now.",
      microPlanLoadError: null,
      selectedSession: null,
      selectedSessionMissing: false,
      recentSessions: [],
      microPlan: null,
    };
  }

  if (selectedResult.error) {
    console.error("[Dryland] Could not load selected dryland session", selectedResult.error);
    return {
      schemaReady: true,
      microPlanSchemaReady,
      loadError: "Could not open that dryland session right now.",
      microPlanLoadError: null,
      selectedSession: null,
      selectedSessionMissing: false,
      recentSessions: (recentResult.data ?? []).map((row) =>
        buildDrylandSessionSummary(row as DrylandRow)
      ),
      microPlan: null,
    };
  }

  const microPlanLoadError =
    microPlanResult.error && microPlanSchemaReady
      ? "Could not load your micro session plan right now."
      : null;

  if (microPlanResult.error && microPlanSchemaReady) {
    console.error("[Dryland] Could not load dryland micro plan", microPlanResult.error);
  }

  try {
    return {
      schemaReady: true,
      microPlanSchemaReady,
      loadError: null,
      microPlanLoadError,
      selectedSession: selectedResult.data
        ? buildDrylandSessionRecord(selectedResult.data as DrylandRow)
        : null,
      selectedSessionMissing: Boolean(selectedSessionId && !selectedResult.data),
      recentSessions: (recentResult.data ?? []).map((row) =>
        buildDrylandSessionSummary(row as DrylandRow)
      ),
      microPlan:
        microPlanResult.data && !microPlanLoadError
          ? buildDrylandMicroPlanRecord(microPlanResult.data as DrylandMicroPlanRow)
          : null,
    };
  } catch (error) {
    console.error("[Dryland] Could not normalize saved dryland session", error);
    return {
      schemaReady: true,
      microPlanSchemaReady,
      loadError: "Could not read one of your saved dryland sessions right now.",
      microPlanLoadError,
      selectedSession: null,
      selectedSessionMissing: false,
      recentSessions: [],
      microPlan: null,
    };
  }
}
