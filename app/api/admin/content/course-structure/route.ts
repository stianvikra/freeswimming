import { NextResponse } from "next/server";
import { hasRequiredAdminRole } from "@/lib/admin/access";
import { isUuid } from "@/lib/admin/content";
import {
  buildCourseStructureIntegrity,
  computeNormalizedCourseStructureSortOrderUpdates,
  getAdjacentLessonId,
  getAdjacentModuleId,
  type CourseStructureLessonRow,
  type CourseStructureModuleRow,
  type CourseStructureSortOrderUpdate,
} from "@/lib/admin/course-structure";
import { getAdminSchemaSetupMessage, isAdminContentSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type AdminContentRow = Pick<
  Database["public"]["Tables"]["admin_content_items"]["Row"],
  "id" | "content_type" | "parent_id" | "sort_order" | "created_at" | "title" | "status"
>;
type SupabaseRouteClient = Awaited<ReturnType<typeof createRouteHandlerSupabaseClient>>["supabase"];

type MoveDirection = "up" | "down";
type DeleteStrategy = "reassign" | "archive_lessons" | "unlink_lessons";

type CourseStructureActionPayload =
  | {
      action: "move_module";
      moduleId: string;
      direction: MoveDirection;
    }
  | {
      action: "move_lesson";
      lessonId: string;
      direction: MoveDirection;
    }
  | {
      action: "move_lesson_to_module";
      lessonId: string;
      targetModuleId: string;
      targetPosition?: "start" | "end";
    }
  | {
      action: "delete_module";
      moduleId: string;
      strategy: DeleteStrategy;
      targetModuleId?: string;
    }
  | {
      action: "normalize";
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

function parseJsonObject(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

function parseDirection(value: unknown): MoveDirection | null {
  if (value === "up" || value === "down") return value;
  return null;
}

function parseDeleteStrategy(value: unknown): DeleteStrategy | null {
  if (value === "reassign" || value === "archive_lessons" || value === "unlink_lessons") {
    return value;
  }
  return null;
}

function parseTargetPosition(value: unknown): "start" | "end" {
  return value === "start" ? "start" : "end";
}

function parseActionPayload(payload: Record<string, unknown>):
  | {
      ok: true;
      value: CourseStructureActionPayload;
    }
  | {
      ok: false;
      error: string;
    } {
  const action = typeof payload.action === "string" ? payload.action.trim() : "";
  if (action === "normalize") {
    return {
      ok: true,
      value: {
        action: "normalize",
      },
    };
  }

  if (action === "move_module") {
    const moduleId = typeof payload.moduleId === "string" ? payload.moduleId.trim() : "";
    const direction = parseDirection(payload.direction);
    if (!isUuid(moduleId)) {
      return { ok: false, error: "Invalid module id." };
    }
    if (!direction) {
      return { ok: false, error: "Invalid module move direction." };
    }
    return {
      ok: true,
      value: {
        action: "move_module",
        moduleId,
        direction,
      },
    };
  }

  if (action === "move_lesson") {
    const lessonId = typeof payload.lessonId === "string" ? payload.lessonId.trim() : "";
    const direction = parseDirection(payload.direction);
    if (!isUuid(lessonId)) {
      return { ok: false, error: "Invalid lesson id." };
    }
    if (!direction) {
      return { ok: false, error: "Invalid lesson move direction." };
    }
    return {
      ok: true,
      value: {
        action: "move_lesson",
        lessonId,
        direction,
      },
    };
  }

  if (action === "move_lesson_to_module") {
    const lessonId = typeof payload.lessonId === "string" ? payload.lessonId.trim() : "";
    const targetModuleId =
      typeof payload.targetModuleId === "string" ? payload.targetModuleId.trim() : "";
    if (!isUuid(lessonId)) {
      return { ok: false, error: "Invalid lesson id." };
    }
    if (!isUuid(targetModuleId)) {
      return { ok: false, error: "Invalid target module id." };
    }
    return {
      ok: true,
      value: {
        action: "move_lesson_to_module",
        lessonId,
        targetModuleId,
        targetPosition: parseTargetPosition(payload.targetPosition),
      },
    };
  }

  if (action === "delete_module") {
    const moduleId = typeof payload.moduleId === "string" ? payload.moduleId.trim() : "";
    const strategy = parseDeleteStrategy(payload.strategy);
    const targetModuleId =
      typeof payload.targetModuleId === "string" ? payload.targetModuleId.trim() : undefined;
    if (!isUuid(moduleId)) {
      return { ok: false, error: "Invalid module id." };
    }
    if (!strategy) {
      return { ok: false, error: "Invalid delete strategy." };
    }
    if (strategy === "reassign" && !targetModuleId) {
      return { ok: false, error: "Target module id is required for reassign strategy." };
    }
    if (targetModuleId && !isUuid(targetModuleId)) {
      return { ok: false, error: "Invalid target module id." };
    }
    return {
      ok: true,
      value: {
        action: "delete_module",
        moduleId,
        strategy,
        targetModuleId,
      },
    };
  }

  return { ok: false, error: "Unsupported course structure action." };
}

async function readCourseRows(supabase: SupabaseRouteClient) {
  const result = await supabase
    .from("admin_content_items")
    .select("id, content_type, parent_id, sort_order, created_at, title, status")
    .in("content_type", ["course_module", "course_lesson"]);

  if (result.error) {
    return {
      ok: false as const,
      error: result.error,
      rows: [] as AdminContentRow[],
    };
  }

  return {
    ok: true as const,
    error: null,
    rows: (result.data ?? []) as AdminContentRow[],
  };
}

function splitCourseRows(rows: AdminContentRow[]) {
  const modules: CourseStructureModuleRow[] = [];
  const lessons: CourseStructureLessonRow[] = [];

  for (const row of rows) {
    if (row.content_type === "course_module") {
      modules.push({
        id: row.id,
        sortOrder: row.sort_order,
        createdAt: row.created_at,
        title: row.title,
      });
      continue;
    }
    if (row.content_type === "course_lesson") {
      lessons.push({
        id: row.id,
        parentId: row.parent_id,
        sortOrder: row.sort_order,
        createdAt: row.created_at,
        title: row.title,
      });
    }
  }

  return {
    modules,
    lessons,
  };
}

async function applySortOrderUpdates(
  supabase: SupabaseRouteClient,
  actorUserId: string,
  updates: CourseStructureSortOrderUpdate[]
) {
  for (const update of updates) {
    const result = await supabase
      .from("admin_content_items")
      .update({
        sort_order: update.sortOrder,
        updated_by: actorUserId,
      })
      .eq("id", update.id)
      .select("id")
      .maybeSingle();

    if (result.error) {
      return {
        ok: false as const,
        error: result.error,
      };
    }
  }

  return {
    ok: true as const,
    error: null,
  };
}

async function normalizeSortOrders(supabase: SupabaseRouteClient, actorUserId: string) {
  const readResult = await readCourseRows(supabase);
  if (!readResult.ok) {
    return readResult;
  }

  const { modules, lessons } = splitCourseRows(readResult.rows);
  const normalized = computeNormalizedCourseStructureSortOrderUpdates(modules, lessons);
  const updates = [...normalized.moduleUpdates, ...normalized.lessonUpdates];
  if (updates.length === 0) {
    return {
      ok: true as const,
      error: null,
      integrity: buildCourseStructureIntegrity(modules, lessons),
    };
  }

  const applyResult = await applySortOrderUpdates(supabase, actorUserId, updates);
  if (!applyResult.ok) {
    return {
      ok: false as const,
      error: applyResult.error,
    };
  }

  const refreshed = await readCourseRows(supabase);
  if (!refreshed.ok) {
    return refreshed;
  }

  const split = splitCourseRows(refreshed.rows);
  return {
    ok: true as const,
    error: null,
    integrity: buildCourseStructureIntegrity(split.modules, split.lessons),
  };
}

async function moveModule(
  supabase: SupabaseRouteClient,
  actorUserId: string,
  moduleId: string,
  direction: MoveDirection
) {
  const readResult = await readCourseRows(supabase);
  if (!readResult.ok) return readResult;

  const { modules } = splitCourseRows(readResult.rows);
  const adjacentModuleId = getAdjacentModuleId(modules, moduleId, direction);
  if (!adjacentModuleId) {
    return {
      ok: false as const,
      error: { message: "Module cannot move further in that direction." },
    };
  }

  const current = modules.find((entry) => entry.id === moduleId);
  const adjacent = modules.find((entry) => entry.id === adjacentModuleId);
  if (!current || !adjacent) {
    return {
      ok: false as const,
      error: { message: "Module move target not found." },
    };
  }

  const swapResult = await applySortOrderUpdates(supabase, actorUserId, [
    { id: current.id, sortOrder: adjacent.sortOrder },
    { id: adjacent.id, sortOrder: current.sortOrder },
  ]);
  if (!swapResult.ok) {
    return {
      ok: false as const,
      error: swapResult.error,
    };
  }

  return normalizeSortOrders(supabase, actorUserId);
}

async function moveLesson(
  supabase: SupabaseRouteClient,
  actorUserId: string,
  lessonId: string,
  direction: MoveDirection
) {
  const readResult = await readCourseRows(supabase);
  if (!readResult.ok) return readResult;

  const { lessons } = splitCourseRows(readResult.rows);
  const adjacentLessonId = getAdjacentLessonId(lessons, lessonId, direction);
  if (!adjacentLessonId) {
    return {
      ok: false as const,
      error: { message: "Lesson cannot move further in that direction." },
    };
  }

  const current = lessons.find((entry) => entry.id === lessonId);
  const adjacent = lessons.find((entry) => entry.id === adjacentLessonId);
  if (!current || !adjacent) {
    return {
      ok: false as const,
      error: { message: "Lesson move target not found." },
    };
  }

  const swapResult = await applySortOrderUpdates(supabase, actorUserId, [
    { id: current.id, sortOrder: adjacent.sortOrder },
    { id: adjacent.id, sortOrder: current.sortOrder },
  ]);
  if (!swapResult.ok) {
    return {
      ok: false as const,
      error: swapResult.error,
    };
  }

  return normalizeSortOrders(supabase, actorUserId);
}

async function moveLessonToModule(
  supabase: SupabaseRouteClient,
  actorUserId: string,
  lessonId: string,
  targetModuleId: string,
  targetPosition: "start" | "end"
) {
  const readResult = await readCourseRows(supabase);
  if (!readResult.ok) return readResult;

  const { modules, lessons } = splitCourseRows(readResult.rows);
  const lesson = lessons.find((entry) => entry.id === lessonId);
  if (!lesson) {
    return {
      ok: false as const,
      error: { message: "Lesson not found." },
    };
  }

  const targetModule = modules.find((entry) => entry.id === targetModuleId);
  if (!targetModule) {
    return {
      ok: false as const,
      error: { message: "Target module not found." },
    };
  }

  const targetSiblings = lessons.filter((entry) => entry.parentId === targetModuleId);
  const nextSortOrder =
    targetPosition === "start"
      ? -1
      : targetSiblings.reduce((maxOrder, entry) => Math.max(maxOrder, entry.sortOrder), -1) + 1;

  const updateResult = await supabase
    .from("admin_content_items")
    .update({
      parent_id: targetModuleId,
      sort_order: nextSortOrder,
      updated_by: actorUserId,
    })
    .eq("id", lessonId)
    .select("id")
    .maybeSingle();

  if (updateResult.error) {
    return {
      ok: false as const,
      error: updateResult.error,
    };
  }

  return normalizeSortOrders(supabase, actorUserId);
}

async function deleteModuleWithStrategy(
  supabase: SupabaseRouteClient,
  actorUserId: string,
  payload: Extract<CourseStructureActionPayload, { action: "delete_module" }>
) {
  const readResult = await readCourseRows(supabase);
  if (!readResult.ok) return readResult;

  const { modules, lessons } = splitCourseRows(readResult.rows);
  const moduleRow = modules.find((entry) => entry.id === payload.moduleId);
  if (!moduleRow) {
    return {
      ok: false as const,
      error: { message: "Module not found." },
    };
  }

  const childLessons = lessons.filter((entry) => entry.parentId === payload.moduleId);
  if (childLessons.length > 0) {
    if (payload.strategy === "reassign") {
      if (!payload.targetModuleId) {
        return {
          ok: false as const,
          error: { message: "Target module is required for reassign." },
        };
      }
      if (payload.targetModuleId === payload.moduleId) {
        return {
          ok: false as const,
          error: { message: "Target module must be different from module being deleted." },
        };
      }
      const targetModule = modules.find((entry) => entry.id === payload.targetModuleId);
      if (!targetModule) {
        return {
          ok: false as const,
          error: { message: "Target module not found." },
        };
      }
      const reassignResult = await supabase
        .from("admin_content_items")
        .update({
          parent_id: payload.targetModuleId,
          updated_by: actorUserId,
        })
        .in(
          "id",
          childLessons.map((entry) => entry.id)
        )
        .select("id");
      if (reassignResult.error) {
        return {
          ok: false as const,
          error: reassignResult.error,
        };
      }
    } else if (payload.strategy === "archive_lessons") {
      const archiveResult = await supabase
        .from("admin_content_items")
        .update({
          status: "archived",
          parent_id: null,
          updated_by: actorUserId,
        })
        .in(
          "id",
          childLessons.map((entry) => entry.id)
        )
        .select("id");
      if (archiveResult.error) {
        return {
          ok: false as const,
          error: archiveResult.error,
        };
      }
    } else {
      const unlinkResult = await supabase
        .from("admin_content_items")
        .update({
          parent_id: null,
          updated_by: actorUserId,
        })
        .in(
          "id",
          childLessons.map((entry) => entry.id)
        )
        .select("id");
      if (unlinkResult.error) {
        return {
          ok: false as const,
          error: unlinkResult.error,
        };
      }
    }
  }

  const deleteResult = await supabase
    .from("admin_content_items")
    .delete()
    .eq("id", payload.moduleId)
    .select("id")
    .maybeSingle();

  if (deleteResult.error) {
    return {
      ok: false as const,
      error: deleteResult.error,
    };
  }
  if (!deleteResult.data) {
    return {
      ok: false as const,
      error: { message: "Module not found." },
    };
  }

  return normalizeSortOrders(supabase, actorUserId);
}

export async function POST(request: Request) {
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const gate = await requireAdminRoleFromSupabase(supabase, {
    allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
    minimumRole: "editor",
  });

  if (!gate.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: gate.error }, { status: gate.status })
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unsupported content type." }, { status: 415 })
    );
  }

  let rawPayload: unknown = null;
  try {
    rawPayload = await request.json();
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON." }, { status: 400 })
    );
  }

  const payloadObject = parseJsonObject(rawPayload);
  if (!payloadObject) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid request payload." }, { status: 400 })
    );
  }

  const parsed = parseActionPayload(payloadObject);
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

  if (parsed.value.action === "delete_module" && !hasRequiredAdminRole(gate.role, "admin")) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: "Forbidden." }, { status: 403 }));
  }

  let actionResult:
    | Awaited<ReturnType<typeof normalizeSortOrders>>
    | {
        ok: false;
        error: { message?: string } | null;
      };

  if (parsed.value.action === "normalize") {
    actionResult = await normalizeSortOrders(supabase, gate.user.id);
  } else if (parsed.value.action === "move_module") {
    actionResult = await moveModule(
      supabase,
      gate.user.id,
      parsed.value.moduleId,
      parsed.value.direction
    );
  } else if (parsed.value.action === "move_lesson") {
    actionResult = await moveLesson(
      supabase,
      gate.user.id,
      parsed.value.lessonId,
      parsed.value.direction
    );
  } else if (parsed.value.action === "move_lesson_to_module") {
    actionResult = await moveLessonToModule(
      supabase,
      gate.user.id,
      parsed.value.lessonId,
      parsed.value.targetModuleId,
      parsed.value.targetPosition ?? "end"
    );
  } else {
    actionResult = await deleteModuleWithStrategy(supabase, gate.user.id, parsed.value);
  }

  if (!actionResult.ok) {
    const error = actionResult.error;
    if (isAdminContentSchemaMissing(error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("content"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    const errorMessage =
      typeof error?.message === "string" && error.message.trim().length > 0
        ? error.message
        : "Could not update course structure right now.";

    const isNotFound = errorMessage.toLowerCase().includes("not found");
    const isValidation = errorMessage.toLowerCase().includes("cannot");
    const status = isNotFound ? 404 : isValidation ? 400 : 500;
    return applySupabaseCookies(noStoreJson({ ok: false, error: errorMessage }, { status }));
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      integrity: actionResult.integrity,
    })
  );
}
