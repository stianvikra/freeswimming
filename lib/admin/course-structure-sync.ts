import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildCourseStructureIntegrity,
  computeNormalizedCourseStructureSortOrderUpdates,
  type CourseStructureLessonRow,
  type CourseStructureModuleRow,
} from "@/lib/admin/course-structure";
import type { Database } from "@/types/database";

type SupabaseRouteClient = SupabaseClient<Database>;

type AdminContentCourseRow = Pick<
  Database["public"]["Tables"]["admin_content_items"]["Row"],
  "id" | "content_type" | "parent_id" | "sort_order" | "created_at" | "title"
>;

type CourseStructureSyncError = {
  message?: string;
  code?: string;
};

type CourseStructureReadResult =
  | {
      ok: true;
      rows: AdminContentCourseRow[];
    }
  | {
      ok: false;
      error: CourseStructureSyncError | null;
    };

type CourseStructureApplyResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: CourseStructureSyncError | null;
    };

export type NormalizeCourseStructureResult =
  | {
      ok: true;
      integrity: ReturnType<typeof buildCourseStructureIntegrity>;
    }
  | {
      ok: false;
      error: CourseStructureSyncError | null;
    };

export type ResolveNextCourseStructureSortOrderResult =
  | {
      ok: true;
      sortOrder: number;
    }
  | {
      ok: false;
      error: CourseStructureSyncError | null;
    };

function splitCourseRows(rows: AdminContentCourseRow[]) {
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

async function readCourseRows(supabase: SupabaseRouteClient): Promise<CourseStructureReadResult> {
  const result = await supabase
    .from("admin_content_items")
    .select("id, content_type, parent_id, sort_order, created_at, title")
    .in("content_type", ["course_module", "course_lesson"]);

  if (result.error) {
    return {
      ok: false,
      error: result.error,
    };
  }

  return {
    ok: true,
    rows: (result.data ?? []) as AdminContentCourseRow[],
  };
}

async function applySortOrderUpdates(
  supabase: SupabaseRouteClient,
  actorUserId: string,
  updates: Array<{ id: string; sortOrder: number }>
): Promise<CourseStructureApplyResult> {
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
        ok: false,
        error: result.error,
      };
    }
  }

  return { ok: true };
}

export async function normalizeCourseStructureSortOrders(input: {
  supabase: SupabaseRouteClient;
  actorUserId: string;
}): Promise<NormalizeCourseStructureResult> {
  const readResult = await readCourseRows(input.supabase);
  if (!readResult.ok) {
    return readResult;
  }

  const { modules, lessons } = splitCourseRows(readResult.rows);
  const normalized = computeNormalizedCourseStructureSortOrderUpdates(modules, lessons);
  const updates = [...normalized.moduleUpdates, ...normalized.lessonUpdates];

  if (updates.length === 0) {
    return {
      ok: true,
      integrity: buildCourseStructureIntegrity(modules, lessons),
    };
  }

  const applyResult = await applySortOrderUpdates(input.supabase, input.actorUserId, updates);
  if (!applyResult.ok) {
    return applyResult;
  }

  const refreshed = await readCourseRows(input.supabase);
  if (!refreshed.ok) {
    return refreshed;
  }

  const split = splitCourseRows(refreshed.rows);
  return {
    ok: true,
    integrity: buildCourseStructureIntegrity(split.modules, split.lessons),
  };
}

export async function resolveNextCourseStructureSortOrder(input: {
  supabase: SupabaseRouteClient;
  contentType: "course_module" | "course_lesson";
  parentId?: string | null;
}): Promise<ResolveNextCourseStructureSortOrderResult> {
  const readResult = await readCourseRows(input.supabase);
  if (!readResult.ok) {
    return readResult;
  }

  const { modules, lessons } = splitCourseRows(readResult.rows);

  if (input.contentType === "course_module") {
    const nextSortOrder =
      modules.reduce((maxOrder, row) => Math.max(maxOrder, row.sortOrder), -1) + 1;
    return {
      ok: true,
      sortOrder: nextSortOrder,
    };
  }

  const targetParentId = input.parentId ?? null;
  const nextSortOrder =
    lessons
      .filter((row) => (row.parentId ?? null) === targetParentId)
      .reduce((maxOrder, row) => Math.max(maxOrder, row.sortOrder), -1) + 1;

  return {
    ok: true,
    sortOrder: nextSortOrder,
  };
}
