"use client";

import { useEffect, useMemo, useState } from "react";
import AdminManagerState from "@/components/admin/AdminManagerState";
import AdminContextNotesPanel from "@/components/admin/AdminContextNotesPanel";
import AdminContextQrPanel from "@/components/admin/AdminContextQrPanel";
import type { AdminRole } from "@/lib/admin/access";
import type {
  AdminContentItemRow,
  AdminContentStatus,
  AdminContentType,
} from "@/lib/admin/content";
import type {
  AdminContentMirrorMetric as MirrorMetric,
  AdminContentMirrorSnapshot as MirrorSnapshot,
} from "@/lib/admin/content-mirror";
import {
  resolveAdminContentEditNotesContext,
  resolveAdminContentEditQrContext,
} from "@/lib/admin/content-edit-context";
import {
  ALL_CONTENT_SCOPE_STORAGE_KEY,
  CONTENT_PRIMARY_VIEW_STORAGE_KEY,
  parseStoredAllContentScope,
  parseStoredContentPrimaryView,
  type ContentPrimaryView,
} from "@/lib/admin/content-view-preferences";
import {
  buildCourseStructureIntegrity,
  getAdjacentLessonId,
  getAdjacentModuleId,
  type CourseStructureLessonRow,
  type CourseStructureModuleRow,
} from "@/lib/admin/course-structure";
import {
  buildCourseWorkspaceLessonPreview,
  buildCourseWorkspaceLessonsByModuleId,
} from "@/lib/admin/course-workspace";
import type { AdminCategoryRow } from "@/lib/admin/categories";
import { buildCoursePreviewHref, resolveCoursePreviewModeFromStatus } from "@/lib/course/preview";
import { resolveCourseLessonRuntimeId } from "@/lib/course/runtime-identity";
import {
  resolveGuideDrillRuntimeId,
  resolveGuideSessionRuntimeId,
} from "@/lib/guides/runtime-identity";
import { buildAdminQrPrefillHref } from "@/lib/qr-links/admin-prefill";

const CONTENT_TYPE_OPTIONS: Array<{ value: AdminContentType; label: string }> = [
  { value: "course_module", label: "Course module" },
  { value: "course_lesson", label: "Course lesson" },
  { value: "guide_session", label: "Guide session" },
  { value: "guide_drill", label: "Guide drill" },
  { value: "page", label: "Page" },
  { value: "product", label: "Product metadata" },
];

const DEFAULT_ALL_CONTENT_SCOPE: AdminContentType = "course_module";
const ALL_CONTENT_SCOPE_OPTIONS: Array<{ value: "all" | AdminContentType; label: string }> = [
  { value: "all", label: "All content (audit)" },
  { value: "course_module", label: "Course modules" },
  { value: "course_lesson", label: "Course lessons" },
  { value: "guide_session", label: "0-1000 sessions" },
  { value: "guide_drill", label: "Poolside drills" },
  { value: "product", label: "Programs/products" },
  { value: "page", label: "Pages" },
];

const CONTENT_TYPE_LABEL: Record<AdminContentType, string> = {
  course_module: "Course module",
  course_lesson: "Course lesson",
  guide_session: "Guide session",
  guide_drill: "Guide drill",
  page: "Page",
  product: "Product metadata",
};

const STATUS_OPTIONS: Array<{ value: AdminContentStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const COURSE_CONTENT_TYPES: ReadonlySet<AdminContentType> = new Set([
  "course_module",
  "course_lesson",
]);

const STATUS_LABEL_BY_VALUE: Record<AdminContentStatus, string> = {
  draft: "Draft",
  review: "Review",
  published: "Published",
  archived: "Archived",
};

const STATUS_CHIP_CLASS_BY_VALUE: Record<AdminContentStatus, string> = {
  draft: "border-slate-300 bg-slate-100 text-slate-700",
  review: "border-amber-300 bg-amber-100 text-amber-800",
  published: "border-emerald-300 bg-emerald-100 text-emerald-800",
  archived: "border-slate-300 bg-slate-200 text-slate-700",
};

const COURSE_WORKSPACE_OVERVIEW_PREVIEW_LIMIT = 3;

type ListSortOption =
  | "default"
  | "title_asc"
  | "title_desc"
  | "updated_desc"
  | "updated_asc"
  | "status_then_order";

const SORT_OPTIONS: Array<{ value: ListSortOption; label: string }> = [
  { value: "default", label: "Default order" },
  { value: "title_asc", label: "Title (A-Z)" },
  { value: "title_desc", label: "Title (Z-A)" },
  { value: "updated_desc", label: "Last updated (newest)" },
  { value: "updated_asc", label: "Last updated (oldest)" },
  { value: "status_then_order", label: "Status then order" },
];

const STATUS_SORT_RANK: Record<AdminContentStatus, number> = {
  draft: 0,
  review: 1,
  published: 2,
  archived: 3,
};

const EDITABLE_CONTENT_TYPES: ReadonlySet<AdminContentType> = new Set([
  "course_module",
  "course_lesson",
  "guide_session",
  "guide_drill",
  "page",
  "product",
]);

const MIRROR_METRIC_KEY_BY_CONTENT_TYPE: Partial<Record<AdminContentType, MirrorMetric["key"]>> = {
  course_module: "course_module",
  course_lesson: "course_lesson",
  guide_session: "guide_session",
  guide_drill: "guide_drill",
  product: "programs",
};

type AdminContentListResponse =
  | {
      ok: true;
      role: AdminRole;
      items: AdminContentItemRow[];
      schemaReady?: boolean;
      warning?: string | null;
      mirror?: MirrorSnapshot;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentCreateResponse =
  | {
      ok: true;
      item: AdminContentItemRow;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentUpdateResponse =
  | {
      ok: true;
      item: AdminContentItemRow;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentDeleteResponse =
  | {
      ok: true;
      id: string;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentCleanupTestRecordsResponse =
  | {
      ok: true;
      deletedCount: number;
      deletedIds: string[];
      deletedSlugs: string[];
      normalizedCourseStructure?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
      candidateCount?: number;
    };

type CourseStructureActionResponse =
  | {
      ok: true;
      integrity?: {
        unlinkedLessonCount: number;
        duplicateModuleSortOrderCount: number;
        duplicateLessonSortGroupCount: number;
        duplicateLessonSortEntryCount: number;
      };
    }
  | {
      ok: false;
      error?: string;
    };

type ContentRevisionItem = {
  id: string;
  revisionNumber: number;
  action: string;
  changedByEmail: string | null;
  createdAt: string;
  snapshotTitle: string;
  snapshotStatus: string;
};

type AdminContentRevisionsResponse =
  | {
      ok: true;
      canRestore: boolean;
      items: ContentRevisionItem[];
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentRestoreResponse =
  | {
      ok: true;
      item: AdminContentItemRow;
      restoredRevisionId: string;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminCategoriesResponse =
  | {
      ok: true;
      items: AdminCategoryRow[];
      schemaReady?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
    };

type FormState = {
  contentType: AdminContentType;
  title: string;
  slug: string;
  summary: string;
  category: string;
  status: AdminContentStatus;
  parentId: string;
};

type EditFormState = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  sortOrder: string;
  parentId: string;
  lessonBody: LessonBodyEditState | null;
};

type LessonTypeOption = "learn" | "drill" | "swim" | "";
type SupportActionOption = "videoAnalysis" | "poolsideGuide" | "guide0To1000" | "contact";
type SupportPrimaryActionOption = SupportActionOption | "";

type LessonBodyEditState = {
  lessonId: string;
  lessonType: LessonTypeOption;
  drillLabel: string;
  supportStartAtLessonInModule: string;
  supportActionVideoAnalysis: boolean;
  supportActionPoolsideGuide: boolean;
  supportActionGuide0To1000: boolean;
  supportActionContact: boolean;
  supportPrimaryAction: SupportPrimaryActionOption;
  goal: string;
  displayGoal: boolean;
  displayCues: boolean;
  displayCommonMistakes: boolean;
  displayDrill: boolean;
  displayCheckpoint: boolean;
  displayNextStep: boolean;
  displaySupport: boolean;
  cues: string;
  commonMistakes: string;
  drillTitle: string;
  drillSteps: string;
  nextStep: string;
  passCriteria: string;
};

type CourseLessonWorkspaceItem = {
  id: string;
  title: string;
  slug: string;
  status: AdminContentStatus;
  sortOrder: number;
  parentId: string | null;
  moduleLabel: string | null;
  runtimeLessonId: string;
};

type CourseModuleWorkspaceItem = {
  id: string;
  title: string;
  slug: string;
  status: AdminContentStatus;
  sortOrder: number;
};

type WorkspaceLessonCreateState = {
  title: string;
  slug: string;
  summary: string;
  status: AdminContentStatus;
  parentId: string;
};

type StatusCountByState = Record<AdminContentStatus, number>;

type ContentListFocusState = {
  source: "mirror" | "workspace";
  label: string;
  detail: string;
};

type CourseStructureActionPayload =
  | {
      action: "move_module";
      moduleId: string;
      direction: "up" | "down";
    }
  | {
      action: "move_lesson";
      lessonId: string;
      direction: "up" | "down";
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
      strategy: "reassign" | "archive_lessons" | "unlink_lessons";
      targetModuleId?: string;
    }
  | {
      action: "normalize";
    };

type PendingModuleDeleteState = {
  moduleId: string;
  moduleTitle: string;
  lessonCount: number;
  strategy: "reassign" | "archive_lessons" | "unlink_lessons";
  targetModuleId: string;
};

const WORKSPACE_ALL_MODULES_ID = "__all__";
const WORKSPACE_UNLINKED_MODULE_ID = "__unlinked__";
const LESSON_TYPE_OPTIONS: Array<{ value: LessonTypeOption; label: string }> = [
  { value: "", label: "Not set" },
  { value: "learn", label: "Learn" },
  { value: "drill", label: "Drill" },
  { value: "swim", label: "Swim" },
];
const SUPPORT_ACTION_OPTIONS: Array<{ value: SupportActionOption; label: string }> = [
  { value: "videoAnalysis", label: "Video analysis" },
  { value: "poolsideGuide", label: "Poolside guide" },
  { value: "guide0To1000", label: "0-1000 guide" },
  { value: "contact", label: "Contact" },
];

const INITIAL_FORM: FormState = {
  contentType: "course_module",
  title: "",
  slug: "",
  summary: "",
  category: "General",
  status: "draft",
  parentId: "",
};

const INITIAL_WORKSPACE_LESSON_CREATE_FORM: WorkspaceLessonCreateState = {
  title: "",
  slug: "",
  summary: "",
  status: "draft",
  parentId: "",
};

function normalizeCategoryInput(value: string): string {
  const collapsed = value.trim().replace(/\s+/g, " ");
  return collapsed.length > 0 ? collapsed : "General";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeLinesInput(value: string): string[] {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function joinLines(value: string[]): string {
  return value.join("\n");
}

function createStatusCountByState(): StatusCountByState {
  return {
    draft: 0,
    review: 0,
    published: 0,
    archived: 0,
  };
}

function parseBodyString(body: unknown, key: string): string | null {
  if (!isRecord(body)) return null;
  const value = body[key];
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function parseBodyBoolean(body: unknown, key: string): boolean | null {
  if (!isRecord(body)) return null;
  const value = body[key];
  if (typeof value === "boolean") return value;
  return null;
}

function parseBodyNumber(body: unknown, key: string): number | null {
  if (!isRecord(body)) return null;
  const value = body[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseBodyStringArray(body: unknown, key: string): string[] {
  if (!isRecord(body)) return [];
  const value = body[key];
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);
}

function resolveLessonType(value: string | null): LessonTypeOption {
  if (value === "learn" || value === "drill" || value === "swim") return value;
  return "";
}

function resolveSupportPrimaryAction(value: string | null): SupportPrimaryActionOption {
  if (
    value === "videoAnalysis" ||
    value === "poolsideGuide" ||
    value === "guide0To1000" ||
    value === "contact"
  ) {
    return value;
  }
  return "";
}

function toLessonBodyEditState(item: AdminContentItemRow): LessonBodyEditState {
  const lessonId = resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim();
  const drillBody = isRecord(item.body) && isRecord(item.body.drill) ? item.body.drill : null;
  const displayBody = isRecord(item.body) && isRecord(item.body.display) ? item.body.display : null;
  const supportCardBody =
    isRecord(item.body) && isRecord(item.body.supportCard) ? item.body.supportCard : null;
  const supportActionsBody =
    supportCardBody && isRecord(supportCardBody.actions) ? supportCardBody.actions : null;
  const drillTitleRaw =
    drillBody && typeof drillBody.title === "string" ? drillBody.title.trim() : "";
  const drillStepsRaw =
    drillBody && Array.isArray(drillBody.steps)
      ? drillBody.steps
          .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
          .filter((entry) => entry.length > 0)
      : [];

  return {
    lessonId,
    lessonType: resolveLessonType(parseBodyString(item.body, "lessonType")),
    drillLabel: parseBodyString(item.body, "drillLabel") ?? "",
    supportStartAtLessonInModule: (() => {
      const value = parseBodyNumber(item.body, "supportStartAtLessonInModule");
      return value && value >= 1 ? String(Math.floor(value)) : "";
    })(),
    supportActionVideoAnalysis: parseBodyBoolean(supportActionsBody, "videoAnalysis") ?? true,
    supportActionPoolsideGuide: parseBodyBoolean(supportActionsBody, "poolsideGuide") ?? true,
    supportActionGuide0To1000: parseBodyBoolean(supportActionsBody, "guide0To1000") ?? false,
    supportActionContact: parseBodyBoolean(supportActionsBody, "contact") ?? false,
    supportPrimaryAction: resolveSupportPrimaryAction(
      parseBodyString(supportCardBody, "primaryAction")
    ),
    goal: parseBodyString(item.body, "goal") ?? item.summary ?? "",
    displayGoal: parseBodyBoolean(displayBody, "goal") ?? true,
    displayCues: parseBodyBoolean(displayBody, "cues") ?? true,
    displayCommonMistakes: parseBodyBoolean(displayBody, "commonMistakes") ?? true,
    displayDrill: parseBodyBoolean(displayBody, "drill") ?? true,
    displayCheckpoint: parseBodyBoolean(displayBody, "checkpoint") ?? true,
    displayNextStep: parseBodyBoolean(displayBody, "nextStep") ?? true,
    displaySupport: parseBodyBoolean(displayBody, "support") ?? true,
    cues: joinLines(parseBodyStringArray(item.body, "cues")),
    commonMistakes: joinLines(parseBodyStringArray(item.body, "commonMistakes")),
    drillTitle: drillTitleRaw,
    drillSteps: joinLines(drillStepsRaw),
    nextStep: parseBodyString(item.body, "nextStep") ?? "",
    passCriteria: joinLines(parseBodyStringArray(item.body, "passCriteria")),
  };
}

function normalizeLessonBodyForCompare(value: LessonBodyEditState) {
  const supportActionVideoAnalysis = value.supportActionVideoAnalysis;
  const supportActionPoolsideGuide = value.supportActionPoolsideGuide;
  const supportActionGuide0To1000 = value.supportActionGuide0To1000;
  const supportActionContact = value.supportActionContact;
  const supportPrimaryAction =
    (value.supportPrimaryAction === "videoAnalysis" && supportActionVideoAnalysis) ||
    (value.supportPrimaryAction === "poolsideGuide" && supportActionPoolsideGuide) ||
    (value.supportPrimaryAction === "guide0To1000" && supportActionGuide0To1000) ||
    (value.supportPrimaryAction === "contact" && supportActionContact)
      ? value.supportPrimaryAction
      : "";

  return {
    lessonType: value.lessonType,
    drillLabel: value.drillLabel.trim(),
    supportStartAtLessonInModule: (() => {
      const raw = value.supportStartAtLessonInModule.trim();
      if (!raw) return null;
      const parsed = Number.parseInt(raw, 10);
      return Number.isFinite(parsed) && parsed >= 1 ? parsed : Number.NaN;
    })(),
    supportActionVideoAnalysis,
    supportActionPoolsideGuide,
    supportActionGuide0To1000,
    supportActionContact,
    supportPrimaryAction,
    goal: value.goal.trim(),
    displayGoal: value.displayGoal,
    displayCues: value.displayCues,
    displayCommonMistakes: value.displayCommonMistakes,
    displayDrill: value.displayDrill,
    displayCheckpoint: value.displayCheckpoint,
    displayNextStep: value.displayNextStep,
    displaySupport: value.displaySupport,
    cues: normalizeLinesInput(value.cues),
    commonMistakes: normalizeLinesInput(value.commonMistakes),
    drillTitle: value.drillTitle.trim(),
    drillSteps: normalizeLinesInput(value.drillSteps),
    nextStep: value.nextStep.trim(),
    passCriteria: normalizeLinesInput(value.passCriteria),
  };
}

function buildLessonBodyPayload(
  existingBody: unknown,
  value: LessonBodyEditState
): Record<string, unknown> {
  const nextBody: Record<string, unknown> = isRecord(existingBody) ? { ...existingBody } : {};
  const normalized = normalizeLessonBodyForCompare(value);

  if (normalized.lessonType) {
    nextBody.lessonType = normalized.lessonType;
  } else {
    delete nextBody.lessonType;
  }
  if (normalized.drillLabel.length > 0) {
    nextBody.drillLabel = normalized.drillLabel;
  } else {
    delete nextBody.drillLabel;
  }
  if (
    typeof normalized.supportStartAtLessonInModule === "number" &&
    Number.isFinite(normalized.supportStartAtLessonInModule)
  ) {
    nextBody.supportStartAtLessonInModule = normalized.supportStartAtLessonInModule;
  } else {
    delete nextBody.supportStartAtLessonInModule;
  }
  nextBody.goal = normalized.goal;
  nextBody.cues = normalized.cues;
  nextBody.commonMistakes = normalized.commonMistakes;
  nextBody.drill = {
    title: normalized.drillTitle,
    steps: normalized.drillSteps,
  };
  const existingDisplay = isRecord(nextBody.display) ? { ...nextBody.display } : {};
  existingDisplay.goal = normalized.displayGoal;
  existingDisplay.cues = normalized.displayCues;
  existingDisplay.commonMistakes = normalized.displayCommonMistakes;
  existingDisplay.drill = normalized.displayDrill;
  existingDisplay.checkpoint = normalized.displayCheckpoint;
  existingDisplay.nextStep = normalized.displayNextStep;
  existingDisplay.support = normalized.displaySupport;
  nextBody.display = existingDisplay;
  nextBody.supportCard = {
    actions: {
      videoAnalysis: normalized.supportActionVideoAnalysis,
      poolsideGuide: normalized.supportActionPoolsideGuide,
      guide0To1000: normalized.supportActionGuide0To1000,
      contact: normalized.supportActionContact,
    },
    ...(normalized.supportPrimaryAction ? { primaryAction: normalized.supportPrimaryAction } : {}),
  };
  nextBody.nextStep = normalized.nextStep;
  if (normalized.passCriteria.length > 0) {
    nextBody.passCriteria = normalized.passCriteria;
  } else {
    delete nextBody.passCriteria;
  }

  return nextBody;
}

function lessonOpenHref(item: AdminContentItemRow): string {
  const lessonId = resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim();
  return `/course?lesson=${encodeURIComponent(lessonId)}`;
}

function lessonPreviewHref(item: AdminContentItemRow): string {
  const lessonId = resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim();
  return buildCoursePreviewHref({
    lessonId,
    mode: resolveCoursePreviewModeFromStatus(item.status),
    previewType: "lesson",
    previewRef: item.slug,
  });
}

function modulePreviewHref(item: AdminContentItemRow, lessonId: string): string {
  return buildCoursePreviewHref({
    lessonId,
    mode: resolveCoursePreviewModeFromStatus(item.status),
    previewType: "module",
    previewRef: item.slug,
  });
}

function lessonQrPrefillHref(item: AdminContentItemRow): string {
  const lessonId = resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim();
  return buildAdminQrPrefillHref({
    slugHint: lessonId,
    destinationPath: lessonOpenHref(item),
    contentItemId: item.id,
    contentLabel: item.title,
    placementKey: "course.lesson.share",
  });
}

function toEditFormState(item: AdminContentItemRow): EditFormState {
  return {
    title: item.title,
    slug: item.slug,
    summary: item.summary ?? "",
    category: item.category,
    sortOrder: String(item.sort_order),
    parentId: item.parent_id ?? "",
    lessonBody: item.content_type === "course_lesson" ? toLessonBodyEditState(item) : null,
  };
}

export default function AdminContentManager() {
  const [items, setItems] = useState<AdminContentItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [mirror, setMirror] = useState<MirrorSnapshot | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openRevisionsItemId, setOpenRevisionsItemId] = useState<string | null>(null);
  const [revisionsByItemId, setRevisionsByItemId] = useState<Record<string, ContentRevisionItem[]>>(
    {}
  );
  const [canRestoreByItemId, setCanRestoreByItemId] = useState<Record<string, boolean>>({});
  const [revisionErrorByItemId, setRevisionErrorByItemId] = useState<Record<string, string | null>>(
    {}
  );
  const [revisionsLoadingItemId, setRevisionsLoadingItemId] = useState<string | null>(null);
  const [restoringRevisionId, setRestoringRevisionId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState<EditFormState | null>(null);
  const [editBaselineState, setEditBaselineState] = useState<EditFormState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [listQuery, setListQuery] = useState("");
  const [listTypeFilter, setListTypeFilter] = useState<"all" | AdminContentType>(() => {
    if (typeof window === "undefined") return DEFAULT_ALL_CONTENT_SCOPE;
    const storedScope = parseStoredAllContentScope(
      window.localStorage.getItem(ALL_CONTENT_SCOPE_STORAGE_KEY)
    );
    return storedScope ?? DEFAULT_ALL_CONTENT_SCOPE;
  });
  const [listStatusFilter, setListStatusFilter] = useState<"all" | AdminContentStatus>("all");
  const [listSort, setListSort] = useState<ListSortOption>("default");
  const [listModuleFilter, setListModuleFilter] = useState("");
  const [listFocusState, setListFocusState] = useState<ContentListFocusState | null>(null);
  const [contentPrimaryView, setContentPrimaryView] = useState<ContentPrimaryView>(() => {
    if (typeof window === "undefined") return "course_workspace";
    const storedView = parseStoredContentPrimaryView(
      window.localStorage.getItem(CONTENT_PRIMARY_VIEW_STORAGE_KEY)
    );
    return storedView ?? "course_workspace";
  });
  const [showCourseRowsInContentList, setShowCourseRowsInContentList] = useState(false);
  const [workspaceModuleId, setWorkspaceModuleId] = useState(WORKSPACE_ALL_MODULES_ID);
  const [workspaceLessonCreateOpen, setWorkspaceLessonCreateOpen] = useState(false);
  const [workspaceLessonCreateState, setWorkspaceLessonCreateState] =
    useState<WorkspaceLessonCreateState>(INITIAL_WORKSPACE_LESSON_CREATE_FORM);
  const [workspaceLessonCreateSubmitting, setWorkspaceLessonCreateSubmitting] = useState(false);
  const [workspaceLessonCreateError, setWorkspaceLessonCreateError] = useState<string | null>(null);
  const [courseStructureBusy, setCourseStructureBusy] = useState(false);
  const [courseStructureMessage, setCourseStructureMessage] = useState<string | null>(null);
  const [lessonMoveTargetById, setLessonMoveTargetById] = useState<Record<string, string>>({});
  const [pendingModuleDelete, setPendingModuleDelete] = useState<PendingModuleDeleteState | null>(
    null
  );
  const [moduleDeleteSubmitting, setModuleDeleteSubmitting] = useState(false);
  const [cleanupSubmitting, setCleanupSubmitting] = useState(false);

  const moduleOptions = useMemo(
    () =>
      items
        .filter((item) => item.content_type === "course_module")
        .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title))
        .map((item) => ({
          id: item.id,
          label: `${item.sort_order + 1}. ${item.title}`,
        })),
    [items]
  );

  const moduleIdSet = useMemo(
    () => new Set(moduleOptions.map((entry) => entry.id)),
    [moduleOptions]
  );

  const moduleLabelById = useMemo(
    () => new Map(moduleOptions.map((entry) => [entry.id, entry.label] as const)),
    [moduleOptions]
  );

  const courseLessonWorkspaceItems = useMemo<CourseLessonWorkspaceItem[]>(
    () =>
      items
        .filter((item) => item.content_type === "course_lesson")
        .sort(
          (left, right) =>
            left.sort_order - right.sort_order || left.title.localeCompare(right.title)
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          status: item.status,
          sortOrder: item.sort_order,
          parentId: item.parent_id,
          moduleLabel: item.parent_id ? (moduleLabelById.get(item.parent_id) ?? null) : null,
          runtimeLessonId: resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim(),
        })),
    [items, moduleLabelById]
  );

  const courseModuleWorkspaceItems = useMemo<CourseModuleWorkspaceItem[]>(
    () =>
      items
        .filter((item) => item.content_type === "course_module")
        .sort(
          (left, right) =>
            left.sort_order - right.sort_order || left.title.localeCompare(right.title)
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          status: item.status,
          sortOrder: item.sort_order,
        })),
    [items]
  );

  const courseStructureModuleRows = useMemo<CourseStructureModuleRow[]>(
    () =>
      items
        .filter((item) => item.content_type === "course_module")
        .map((item) => ({
          id: item.id,
          sortOrder: item.sort_order,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          title: item.title,
        })),
    [items]
  );

  const courseStructureLessonRows = useMemo<CourseStructureLessonRow[]>(
    () =>
      items
        .filter((item) => item.content_type === "course_lesson")
        .map((item) => ({
          id: item.id,
          parentId: item.parent_id,
          sortOrder: item.sort_order,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          title: item.title,
        })),
    [items]
  );

  const courseStructureIntegrity = useMemo(
    () =>
      buildCourseStructureIntegrity(
        courseStructureModuleRows,
        courseStructureLessonRows,
        moduleIdSet
      ),
    [courseStructureLessonRows, courseStructureModuleRows, moduleIdSet]
  );

  const moduleMoveBoundsById = useMemo(() => {
    const bounds = new Map<string, { canMoveUp: boolean; canMoveDown: boolean }>();
    for (const moduleRow of courseStructureModuleRows) {
      bounds.set(moduleRow.id, {
        canMoveUp: Boolean(getAdjacentModuleId(courseStructureModuleRows, moduleRow.id, "up")),
        canMoveDown: Boolean(getAdjacentModuleId(courseStructureModuleRows, moduleRow.id, "down")),
      });
    }
    return bounds;
  }, [courseStructureModuleRows]);

  const lessonMoveBoundsById = useMemo(() => {
    const bounds = new Map<string, { canMoveUp: boolean; canMoveDown: boolean }>();
    for (const lesson of courseStructureLessonRows) {
      bounds.set(lesson.id, {
        canMoveUp: Boolean(getAdjacentLessonId(courseStructureLessonRows, lesson.id, "up")),
        canMoveDown: Boolean(getAdjacentLessonId(courseStructureLessonRows, lesson.id, "down")),
      });
    }
    return bounds;
  }, [courseStructureLessonRows]);

  const firstRuntimeLessonIdByModuleId = useMemo(() => {
    const byModuleId = new Map<string, string>();

    const sortedLessons = [...courseLessonWorkspaceItems]
      .filter((item) => item.parentId && moduleIdSet.has(item.parentId))
      .sort((left, right) => {
        const parentCompare = (left.parentId ?? "").localeCompare(right.parentId ?? "");
        if (parentCompare !== 0) return parentCompare;
        if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
        return left.title.localeCompare(right.title);
      });

    for (const lesson of sortedLessons) {
      if (!lesson.parentId) continue;
      if (byModuleId.has(lesson.parentId)) continue;
      byModuleId.set(lesson.parentId, lesson.runtimeLessonId);
    }

    return byModuleId;
  }, [courseLessonWorkspaceItems, moduleIdSet]);

  const unlinkedLessonCount = useMemo(
    () =>
      courseLessonWorkspaceItems.filter((item) => !item.parentId || !moduleIdSet.has(item.parentId))
        .length,
    [courseLessonWorkspaceItems, moduleIdSet]
  );

  const moduleStatusCounts = useMemo<StatusCountByState>(() => {
    const counts = createStatusCountByState();
    for (const moduleItem of courseModuleWorkspaceItems) {
      counts[moduleItem.status] += 1;
    }
    return counts;
  }, [courseModuleWorkspaceItems]);

  const lessonStatusCounts = useMemo<StatusCountByState>(() => {
    const counts = createStatusCountByState();
    for (const lessonItem of courseLessonWorkspaceItems) {
      counts[lessonItem.status] += 1;
    }
    return counts;
  }, [courseLessonWorkspaceItems]);

  const lessonStatusCountsByModuleId = useMemo(() => {
    const byModuleId = new Map<string, StatusCountByState>();
    for (const moduleItem of courseModuleWorkspaceItems) {
      byModuleId.set(moduleItem.id, createStatusCountByState());
    }

    for (const lessonItem of courseLessonWorkspaceItems) {
      if (!lessonItem.parentId || !byModuleId.has(lessonItem.parentId)) continue;
      const counts = byModuleId.get(lessonItem.parentId);
      if (!counts) continue;
      counts[lessonItem.status] += 1;
    }

    return byModuleId;
  }, [courseLessonWorkspaceItems, courseModuleWorkspaceItems]);

  const workspaceLessonsByModuleId = useMemo(
    () =>
      buildCourseWorkspaceLessonsByModuleId(courseModuleWorkspaceItems, courseLessonWorkspaceItems),
    [courseLessonWorkspaceItems, courseModuleWorkspaceItems]
  );

  const contentItemById = useMemo(
    () => new Map<string, AdminContentItemRow>(items.map((item) => [item.id, item])),
    [items]
  );

  const hasNonCourseItems = useMemo(
    () => items.some((item) => !COURSE_CONTENT_TYPES.has(item.content_type)),
    [items]
  );

  const hasCourseWorkspaceItems =
    schemaReady && (courseModuleWorkspaceItems.length > 0 || courseLessonWorkspaceItems.length > 0);
  const isCourseWorkspaceView =
    contentPrimaryView === "course_workspace" && hasCourseWorkspaceItems;
  const isAllContentView = !isCourseWorkspaceView;

  const shouldHideCourseRowsInCatalog =
    !showCourseRowsInContentList &&
    listTypeFilter === "all" &&
    listModuleFilter.length === 0 &&
    hasNonCourseItems;

  const workspaceLessons = useMemo(() => {
    if (!workspaceModuleId) return [];
    if (workspaceModuleId === WORKSPACE_ALL_MODULES_ID) return courseLessonWorkspaceItems;
    if (workspaceModuleId === WORKSPACE_UNLINKED_MODULE_ID) {
      return courseLessonWorkspaceItems.filter(
        (item) => !item.parentId || !moduleIdSet.has(item.parentId)
      );
    }
    return courseLessonWorkspaceItems.filter((item) => item.parentId === workspaceModuleId);
  }, [courseLessonWorkspaceItems, moduleIdSet, workspaceModuleId]);

  const workspaceScopeLabel = useMemo(() => {
    if (workspaceModuleId === WORKSPACE_ALL_MODULES_ID) {
      return `All modules (${courseLessonWorkspaceItems.length} lessons)`;
    }
    if (workspaceModuleId === WORKSPACE_UNLINKED_MODULE_ID) {
      return `Unlinked lessons (${unlinkedLessonCount})`;
    }
    return moduleLabelById.get(workspaceModuleId) ?? "Selected module";
  }, [courseLessonWorkspaceItems.length, moduleLabelById, unlinkedLessonCount, workspaceModuleId]);

  const isFocusedCourseWorkspace =
    workspaceModuleId === WORKSPACE_UNLINKED_MODULE_ID || moduleIdSet.has(workspaceModuleId);

  const filteredItems = useMemo(() => {
    const normalizedQuery = listQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (shouldHideCourseRowsInCatalog && COURSE_CONTENT_TYPES.has(item.content_type)) {
        return false;
      }
      if (listTypeFilter !== "all" && item.content_type !== listTypeFilter) return false;
      if (listModuleFilter) {
        if (item.content_type !== "course_lesson") return false;
        if (listModuleFilter === WORKSPACE_UNLINKED_MODULE_ID) {
          return !item.parent_id || !moduleIdSet.has(item.parent_id);
        }
        if (item.parent_id !== listModuleFilter) return false;
      }
      if (listStatusFilter !== "all" && item.status !== listStatusFilter) return false;
      if (!normalizedQuery) return true;
      const haystack = [
        item.title,
        item.slug,
        item.category,
        item.summary ?? "",
        CONTENT_TYPE_LABEL[item.content_type],
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [
    items,
    listModuleFilter,
    listQuery,
    listStatusFilter,
    listTypeFilter,
    moduleIdSet,
    shouldHideCourseRowsInCatalog,
  ]);

  const sortedItems = useMemo(() => {
    if (listSort === "default") return filteredItems;

    const sorted = [...filteredItems];
    sorted.sort((left, right) => {
      if (listSort === "title_asc") return left.title.localeCompare(right.title);
      if (listSort === "title_desc") return right.title.localeCompare(left.title);
      if (listSort === "updated_desc") return right.updated_at.localeCompare(left.updated_at);
      if (listSort === "updated_asc") return left.updated_at.localeCompare(right.updated_at);

      const statusDelta = STATUS_SORT_RANK[left.status] - STATUS_SORT_RANK[right.status];
      if (statusDelta !== 0) return statusDelta;
      const typeDelta = CONTENT_TYPE_LABEL[left.content_type].localeCompare(
        CONTENT_TYPE_LABEL[right.content_type]
      );
      if (typeDelta !== 0) return typeDelta;
      const orderDelta = left.sort_order - right.sort_order;
      if (orderDelta !== 0) return orderDelta;
      return left.title.localeCompare(right.title);
    });

    return sorted;
  }, [filteredItems, listSort]);

  const typeCounts = useMemo(() => {
    const counts: Record<"all" | AdminContentType, number> = {
      all: items.length,
      course_module: 0,
      course_lesson: 0,
      guide_session: 0,
      guide_drill: 0,
      page: 0,
      product: 0,
    };

    for (const item of items) {
      counts[item.content_type] += 1;
    }

    return counts;
  }, [items]);

  const isEditDirty = useMemo(() => {
    if (!editingItemId || !editFormState || !editBaselineState) return false;
    const normalize = (value: EditFormState) => ({
      title: value.title.trim(),
      slug: value.slug.trim(),
      summary: value.summary.trim(),
      category: normalizeCategoryInput(value.category),
      sortOrder: Number.parseInt(value.sortOrder, 10),
      parentId: value.parentId.trim(),
      lessonBody: value.lessonBody ? normalizeLessonBodyForCompare(value.lessonBody) : null,
    });
    const current = normalize(editFormState);
    const baseline = normalize(editBaselineState);
    return (
      current.title !== baseline.title ||
      current.slug !== baseline.slug ||
      current.summary !== baseline.summary ||
      current.category !== baseline.category ||
      current.sortOrder !== baseline.sortOrder ||
      current.parentId !== baseline.parentId ||
      JSON.stringify(current.lessonBody) !== JSON.stringify(baseline.lessonBody)
    );
  }, [editingItemId, editFormState, editBaselineState]);

  function formatRevisionDate(iso: string): string {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return "Unknown time";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsed);
  }

  async function loadItems() {
    setLoading(true);
    setError(null);
    setWarning(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminContentListResponse;
      if (!response.ok || !payload.ok) {
        setError(
          payload.ok
            ? "Could not load content list."
            : (payload.error ?? "Could not load content list.")
        );
        setItems([]);
        setAdminRole(null);
        setSchemaReady(true);
        setMirror(null);
        return;
      }
      setAdminRole(payload.role);
      setItems(payload.items);
      setSchemaReady(payload.schemaReady !== false);
      setWarning(payload.warning ?? null);
      setMirror(payload.mirror ?? null);

      const categoriesResponse = await fetch("/api/admin/categories/content", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const categoriesPayload = (await categoriesResponse.json()) as AdminCategoriesResponse;
      if (categoriesResponse.ok && categoriesPayload.ok) {
        setCategoryOptions(
          categoriesPayload.items
            .filter((item) => item.is_active)
            .map((item) => item.title)
            .filter((value, index, self) => self.indexOf(value) === index)
        );
      } else {
        setCategoryOptions([]);
      }
    } catch {
      setError("Could not load content list.");
      setItems([]);
      setAdminRole(null);
      setSchemaReady(true);
      setMirror(null);
      setCategoryOptions([]);
    } finally {
      setLoading(false);
    }
  }

  function clearModuleDeleteDialog() {
    if (moduleDeleteSubmitting) return;
    setPendingModuleDelete(null);
    setCourseStructureMessage(null);
  }

  async function runCourseStructureAction(
    payload: CourseStructureActionPayload,
    options?: {
      successNotice?: string;
      reloadItems?: boolean;
    }
  ): Promise<boolean> {
    if (courseStructureBusy || moduleDeleteSubmitting) return false;
    setCourseStructureBusy(true);
    setActionError(null);
    setCourseStructureMessage(null);
    setActionNotice(null);

    try {
      const response = await fetch("/api/admin/content/course-structure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const actionPayload = (await response.json()) as CourseStructureActionResponse;
      if (!response.ok || !actionPayload.ok) {
        setActionError(
          actionPayload.ok
            ? "Could not update course structure."
            : (actionPayload.error ?? "Could not update course structure.")
        );
        return false;
      }

      if (options?.reloadItems !== false) {
        await loadItems();
      }

      const integrity = actionPayload.integrity;
      if (integrity) {
        const fragments: string[] = [];
        if (integrity.unlinkedLessonCount > 0) {
          fragments.push(`${integrity.unlinkedLessonCount} unlinked lesson(s)`);
        }
        if (integrity.duplicateModuleSortOrderCount > 0) {
          fragments.push(
            `${integrity.duplicateModuleSortOrderCount} duplicate module sort order slot(s)`
          );
        }
        if (integrity.duplicateLessonSortGroupCount > 0) {
          fragments.push(
            `${integrity.duplicateLessonSortGroupCount} lesson group(s) with duplicate sort orders`
          );
        }
        if (fragments.length > 0) {
          setCourseStructureMessage(`Integrity check: ${fragments.join(" · ")}.`);
        }
      }

      setActionNotice(options?.successNotice ?? "Course structure updated.");
      return true;
    } catch {
      setActionError("Could not update course structure.");
      return false;
    } finally {
      setCourseStructureBusy(false);
    }
  }

  async function handleMoveModule(moduleId: string, direction: "up" | "down") {
    await runCourseStructureAction(
      {
        action: "move_module",
        moduleId,
        direction,
      },
      {
        successNotice: direction === "up" ? "Module moved up." : "Module moved down.",
      }
    );
  }

  async function handleMoveLesson(lessonId: string, direction: "up" | "down") {
    await runCourseStructureAction(
      {
        action: "move_lesson",
        lessonId,
        direction,
      },
      {
        successNotice: direction === "up" ? "Lesson moved up." : "Lesson moved down.",
      }
    );
  }

  async function handleMoveLessonToModule(lessonId: string, targetModuleId: string) {
    await runCourseStructureAction(
      {
        action: "move_lesson_to_module",
        lessonId,
        targetModuleId,
        targetPosition: "end",
      },
      {
        successNotice: "Lesson moved to target module.",
      }
    );
  }

  function openModuleDeleteDialog(item: AdminContentItemRow) {
    const lessonCount = items.filter(
      (entry) => entry.content_type === "course_lesson" && entry.parent_id === item.id
    ).length;
    const alternativeModules = moduleOptions.filter((entry) => entry.id !== item.id);
    const defaultStrategy =
      lessonCount > 0 && alternativeModules.length > 0 ? "reassign" : "archive_lessons";
    setPendingModuleDelete({
      moduleId: item.id,
      moduleTitle: item.title,
      lessonCount,
      strategy: defaultStrategy,
      targetModuleId: alternativeModules[0]?.id ?? "",
    });
    setCourseStructureMessage(null);
    setActionError(null);
  }

  async function confirmModuleDelete() {
    if (!pendingModuleDelete || moduleDeleteSubmitting) return;
    if (
      pendingModuleDelete.lessonCount > 0 &&
      pendingModuleDelete.strategy === "reassign" &&
      !pendingModuleDelete.targetModuleId
    ) {
      setCourseStructureMessage("Select target module before deleting.");
      return;
    }

    setModuleDeleteSubmitting(true);
    const ok = await runCourseStructureAction(
      {
        action: "delete_module",
        moduleId: pendingModuleDelete.moduleId,
        strategy: pendingModuleDelete.strategy,
        targetModuleId:
          pendingModuleDelete.strategy === "reassign"
            ? pendingModuleDelete.targetModuleId
            : undefined,
      },
      {
        successNotice: "Module deleted with selected lesson handling strategy.",
      }
    );
    setModuleDeleteSubmitting(false);
    if (ok) {
      setPendingModuleDelete(null);
      setCourseStructureMessage(null);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  useEffect(() => {
    if (!isEditDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEditDirty]);

  useEffect(() => {
    if (moduleOptions.length === 0 && unlinkedLessonCount === 0) {
      if (workspaceModuleId !== WORKSPACE_ALL_MODULES_ID) {
        setWorkspaceModuleId(WORKSPACE_ALL_MODULES_ID);
      }
      return;
    }

    const hasSelectedModule =
      workspaceModuleId === WORKSPACE_ALL_MODULES_ID ||
      workspaceModuleId === WORKSPACE_UNLINKED_MODULE_ID ||
      moduleOptions.some((option) => option.id === workspaceModuleId);

    if (hasSelectedModule) return;

    setWorkspaceModuleId(WORKSPACE_ALL_MODULES_ID);
  }, [moduleOptions, unlinkedLessonCount, workspaceModuleId]);

  useEffect(() => {
    if (loading) return;
    if (hasCourseWorkspaceItems) return;
    if (contentPrimaryView !== "all_content") {
      setContentPrimaryView("all_content");
    }
  }, [contentPrimaryView, hasCourseWorkspaceItems, loading]);

  useEffect(() => {
    setLessonMoveTargetById((previous) => {
      const next: Record<string, string> = {};
      const fallbackModuleId = moduleOptions[0]?.id ?? "";

      for (const lesson of courseLessonWorkspaceItems) {
        const currentParentId = lesson.parentId ?? "";
        const existingTarget = previous[lesson.id];

        if (existingTarget && moduleIdSet.has(existingTarget)) {
          next[lesson.id] = existingTarget;
          continue;
        }

        if (currentParentId && moduleIdSet.has(currentParentId)) {
          next[lesson.id] = currentParentId;
          continue;
        }

        next[lesson.id] = fallbackModuleId;
      }

      return next;
    });
  }, [courseLessonWorkspaceItems, moduleIdSet, moduleOptions]);

  useEffect(() => {
    if (!workspaceLessonCreateOpen) return;
    if (
      workspaceLessonCreateState.parentId &&
      moduleIdSet.has(workspaceLessonCreateState.parentId)
    ) {
      return;
    }

    setWorkspaceLessonCreateState((previous) => ({
      ...previous,
      parentId: moduleOptions[0]?.id ?? "",
    }));
  }, [moduleIdSet, moduleOptions, workspaceLessonCreateOpen, workspaceLessonCreateState.parentId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ALL_CONTENT_SCOPE_STORAGE_KEY, listTypeFilter);
  }, [listTypeFilter]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CONTENT_PRIMARY_VIEW_STORAGE_KEY, contentPrimaryView);
  }, [contentPrimaryView]);

  const groupedCountLabel = useMemo(() => {
    if (!schemaReady) return "Content catalog will appear after admin content setup is ready.";
    if (items.length === 0) return "No content items yet.";
    return `${items.length} content item${items.length === 1 ? "" : "s"} in admin catalog.`;
  }, [items, schemaReady]);

  const filteredCountLabel = useMemo(() => {
    if (items.length === 0) return null;
    if (filteredItems.length === items.length) return "Showing all items";
    return `Showing ${filteredItems.length} of ${items.length}`;
  }, [filteredItems.length, items.length]);

  const moduleScopeLabel = useMemo(() => {
    if (!listModuleFilter) return null;
    if (listModuleFilter === WORKSPACE_UNLINKED_MODULE_ID) return "Module scope: Unlinked lessons";
    return `Module scope: ${moduleLabelById.get(listModuleFilter) ?? "Selected module"}`;
  }, [listModuleFilter, moduleLabelById]);

  const activeMirrorMetricKey = useMemo(() => {
    if (listTypeFilter === "all") return null;
    return MIRROR_METRIC_KEY_BY_CONTENT_TYPE[listTypeFilter] ?? null;
  }, [listTypeFilter]);

  const courseStructureIntegrityFragments = useMemo(() => {
    const fragments: string[] = [];
    if (courseStructureIntegrity.unlinkedLessonCount > 0) {
      fragments.push(`${courseStructureIntegrity.unlinkedLessonCount} unlinked lesson(s)`);
    }
    if (courseStructureIntegrity.duplicateModuleSortOrderCount > 0) {
      fragments.push(
        `${courseStructureIntegrity.duplicateModuleSortOrderCount} duplicate module sort order slot(s)`
      );
    }
    if (courseStructureIntegrity.duplicateLessonSortGroupCount > 0) {
      fragments.push(
        `${courseStructureIntegrity.duplicateLessonSortGroupCount} lesson group(s) with duplicate sort orders`
      );
    }
    return fragments;
  }, [courseStructureIntegrity]);

  function canEditInline(item: AdminContentItemRow): boolean {
    return EDITABLE_CONTENT_TYPES.has(item.content_type);
  }

  function closeEditMode(force = false): boolean {
    if (!force && isEditDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Cancel edit and discard these changes?"
      );
      if (!confirmed) return false;
    }

    setEditingItemId(null);
    setEditFormState(null);
    setEditBaselineState(null);
    setEditError(null);
    return true;
  }

  function handleStartEdit(item: AdminContentItemRow) {
    if (!canEditInline(item)) {
      setActionNotice("Inline edit is not available for this content type yet.");
      return;
    }
    if (savingEditId || updatingId || deletingId || restoringRevisionId) return;
    if (!closeEditMode()) return;

    const nextState = toEditFormState(item);
    setEditingItemId(item.id);
    setEditFormState(nextState);
    setEditBaselineState(nextState);
    setActionError(null);
    setActionNotice(null);
  }

  function scrollToContentRow(itemId: string) {
    if (typeof document === "undefined") return;
    window.requestAnimationFrame(() => {
      const target = document.getElementById(`admin-content-item-${itemId}`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function scrollToContentList() {
    if (typeof document === "undefined") return;
    window.requestAnimationFrame(() => {
      const target = document.getElementById("admin-content-list-anchor");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function clearFocusMode() {
    setListFocusState(null);
    setListQuery("");
    setListTypeFilter(DEFAULT_ALL_CONTENT_SCOPE);
    setListStatusFilter("all");
    setListSort("default");
    setListModuleFilter("");
    setWorkspaceModuleId(WORKSPACE_ALL_MODULES_ID);
  }

  function handleContentPrimaryViewChange(nextView: ContentPrimaryView) {
    if (nextView === "course_workspace" && !hasCourseWorkspaceItems) return;
    setContentPrimaryView(nextView);
  }

  function handleWorkspaceScopeChange(nextWorkspaceModuleId: string) {
    setWorkspaceModuleId(nextWorkspaceModuleId);
    setListTypeFilter("course_lesson");
    setListStatusFilter("all");
    setListQuery("");
    setListSort("default");

    if (nextWorkspaceModuleId === WORKSPACE_ALL_MODULES_ID) {
      setListModuleFilter("");
      setListFocusState({
        source: "workspace",
        label: "Focus mode: all course lessons",
        detail: "Workspace and content list are synced to show all lessons.",
      });
      scrollToContentList();
      return;
    }

    if (nextWorkspaceModuleId === WORKSPACE_UNLINKED_MODULE_ID) {
      setListModuleFilter(WORKSPACE_UNLINKED_MODULE_ID);
      setListFocusState({
        source: "workspace",
        label: "Focus mode: unlinked lessons",
        detail: "Showing lessons that are not attached to a valid module yet.",
      });
      scrollToContentList();
      return;
    }

    setListModuleFilter(nextWorkspaceModuleId);
    const moduleLabel = moduleLabelById.get(nextWorkspaceModuleId) ?? "selected module";
    setListFocusState({
      source: "workspace",
      label: `Focus mode: ${moduleLabel}`,
      detail: "Workspace and content list are synced to this module.",
    });
    scrollToContentList();
  }

  function handleMirrorMetricFocus(metric: MirrorMetric) {
    const metricTypeMap: Record<MirrorMetric["key"], AdminContentType> = {
      course_module: "course_module",
      course_lesson: "course_lesson",
      guide_session: "guide_session",
      guide_drill: "guide_drill",
      programs: "product",
    };
    const targetType = metricTypeMap[metric.key];
    setContentPrimaryView("all_content");
    setListTypeFilter(targetType);
    setListStatusFilter("all");
    setListQuery("");
    setListSort("default");
    setListModuleFilter("");
    if (targetType === "course_lesson") {
      setWorkspaceModuleId(WORKSPACE_ALL_MODULES_ID);
    }
    setListFocusState({
      source: "mirror",
      label: `Focus mode: ${metric.label}`,
      detail:
        metric.status === "matched"
          ? "Counts are aligned. Use this view to spot-check content quality."
          : "Mismatch detected. Use this filtered view to resolve missing/extra records.",
    });
    scrollToContentList();
  }

  function handleManualTypeFilterChange(nextType: "all" | AdminContentType) {
    setListFocusState(null);
    setListTypeFilter(nextType);
    setListModuleFilter("");
    if (nextType === "course_lesson") {
      setWorkspaceModuleId(WORKSPACE_ALL_MODULES_ID);
    }
  }

  function handleWorkspaceFocusModule(moduleId: string) {
    focusCourseWorkspaceScope(moduleId);
  }

  function scrollToCourseWorkspace() {
    if (typeof document === "undefined") return;
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>('[data-testid="admin-course-lesson-workspace"]')
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function scrollToCourseWorkspaceFocusPanel() {
    if (typeof document === "undefined") return;
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>('[data-testid="admin-course-workspace-focus-panel"]')
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function focusCourseWorkspaceScope(nextWorkspaceModuleId: string) {
    handleWorkspaceScopeChange(nextWorkspaceModuleId);
    setContentPrimaryView("course_workspace");
    if (nextWorkspaceModuleId === WORKSPACE_ALL_MODULES_ID) {
      scrollToCourseWorkspace();
      return;
    }
    scrollToCourseWorkspaceFocusPanel();
  }

  function focusModuleEdit(moduleItem: AdminContentItemRow) {
    handleStartEdit(moduleItem);
    setContentPrimaryView("all_content");
    setWorkspaceModuleId(moduleItem.id);
    setShowCourseRowsInContentList(true);
    setListTypeFilter("course_module");
    setListStatusFilter("all");
    setListQuery("");
    setListSort("default");
    setListModuleFilter("");
    const moduleLabel = moduleLabelById.get(moduleItem.id) ?? moduleItem.title;
    setListFocusState({
      source: "workspace",
      label: `Focus mode: ${moduleLabel}`,
      detail: "Editing one module inside the course workspace.",
    });
    scrollToContentRow(moduleItem.id);
  }

  function handleWorkspaceEditModule(itemId: string) {
    const moduleItem = items.find(
      (item) => item.id === itemId && item.content_type === "course_module"
    );
    if (!moduleItem) return;
    focusModuleEdit(moduleItem);
  }

  function focusLessonEdit(lessonItem: AdminContentItemRow) {
    handleStartEdit(lessonItem);
    setContentPrimaryView("all_content");
    const moduleScope =
      lessonItem.parent_id && moduleIdSet.has(lessonItem.parent_id)
        ? lessonItem.parent_id
        : WORKSPACE_UNLINKED_MODULE_ID;
    setWorkspaceModuleId(moduleScope);
    setListTypeFilter("course_lesson");
    setListStatusFilter("all");
    setListQuery("");
    setListSort("default");
    setListModuleFilter(moduleScope);
    const moduleLabel = moduleLabelById.get(moduleScope) ?? "unlinked lessons";
    setListFocusState({
      source: "workspace",
      label: `Focus mode: ${moduleLabel}`,
      detail: "Editing one lesson inside a module-scoped workspace.",
    });
    scrollToContentRow(lessonItem.id);
  }

  function handleWorkspaceEditLesson(itemId: string) {
    const lessonItem = items.find(
      (item) => item.id === itemId && item.content_type === "course_lesson"
    );
    if (!lessonItem) return;
    focusLessonEdit(lessonItem);
  }

  function openWorkspaceLessonCreate(moduleId: string) {
    setWorkspaceModuleId(moduleId);
    setWorkspaceLessonCreateState({
      ...INITIAL_WORKSPACE_LESSON_CREATE_FORM,
      parentId: moduleId,
    });
    setWorkspaceLessonCreateError(null);
    setWorkspaceLessonCreateOpen(true);
  }

  async function createContentItem(params: {
    contentType: AdminContentType;
    title: string;
    slug: string;
    summary: string;
    category: string;
    status: AdminContentStatus;
    parentId?: string;
  }): Promise<AdminContentCreateResponse> {
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        contentType: params.contentType,
        title: params.title,
        slug: params.slug,
        summary: params.summary,
        category: params.category,
        status: params.status,
        ...(params.parentId ? { parentId: params.parentId } : {}),
      }),
    });

    return (await response.json()) as AdminContentCreateResponse;
  }

  async function handleWorkspaceLessonCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (workspaceLessonCreateSubmitting) return;

    setWorkspaceLessonCreateSubmitting(true);
    setWorkspaceLessonCreateError(null);
    setActionError(null);
    setActionNotice(null);

    try {
      const payload = await createContentItem({
        contentType: "course_lesson",
        title: workspaceLessonCreateState.title,
        slug: workspaceLessonCreateState.slug,
        summary: workspaceLessonCreateState.summary,
        category: "Course lessons",
        status: workspaceLessonCreateState.status,
        parentId: workspaceLessonCreateState.parentId,
      });

      if (!payload.ok) {
        setWorkspaceLessonCreateError(payload.error ?? "Could not create lesson.");
        return;
      }

      setItems((previous) => [payload.item, ...previous]);
      setWorkspaceLessonCreateOpen(false);
      setWorkspaceLessonCreateState({
        ...INITIAL_WORKSPACE_LESSON_CREATE_FORM,
        parentId: workspaceLessonCreateState.parentId,
      });
      setActionNotice("Lesson created in selected module. Opening editor.");
      focusLessonEdit(payload.item);
    } catch {
      setWorkspaceLessonCreateError("Could not create lesson.");
    } finally {
      setWorkspaceLessonCreateSubmitting(false);
    }
  }

  function validateEditForm(item: AdminContentItemRow, form: EditFormState): string | null {
    const title = form.title.trim();
    if (title.length < 2 || title.length > 120) {
      return "Title must be between 2 and 120 characters.";
    }

    const slug = form.slug.trim();
    if (slug.length < 2) {
      return "Slug must be at least 2 characters.";
    }

    const category = normalizeCategoryInput(form.category);
    if (category.length > 80) {
      return "Category must be 80 characters or less.";
    }

    const sortOrder = Number.parseInt(form.sortOrder, 10);
    if (!Number.isFinite(sortOrder) || sortOrder < -10000 || sortOrder > 10000) {
      return "Sort order must be between -10000 and 10000.";
    }

    if (item.content_type === "course_lesson") {
      const parentId = form.parentId.trim();
      if (!parentId) {
        return "Course lesson must be linked to a parent module.";
      }
      if (!moduleIdSet.has(parentId)) {
        return "Selected parent module is invalid.";
      }

      if (!form.lessonBody) {
        return "Lesson body editor is not ready for this lesson.";
      }

      const normalizedBody = normalizeLessonBodyForCompare(form.lessonBody);
      if (normalizedBody.goal.length < 5 || normalizedBody.goal.length > 500) {
        return "Lesson goal must be between 5 and 500 characters.";
      }
      if (normalizedBody.drillLabel.length > 40) {
        return "Section badge label must be 40 characters or less.";
      }
      if (
        Number.isNaN(normalizedBody.supportStartAtLessonInModule) ||
        (typeof normalizedBody.supportStartAtLessonInModule === "number" &&
          normalizedBody.supportStartAtLessonInModule > 200)
      ) {
        return "Extra help start lesson must be an integer between 1 and 200.";
      }
      if (normalizedBody.displayCues && normalizedBody.cues.length === 0) {
        return "Add at least one cue (one line per cue).";
      }
      if (
        normalizedBody.displayDrill &&
        (normalizedBody.drillTitle.length < 2 || normalizedBody.drillTitle.length > 120)
      ) {
        return "Drill title must be between 2 and 120 characters.";
      }
      if (normalizedBody.displayDrill && normalizedBody.drillSteps.length === 0) {
        return "Add at least one drill step (one line per step).";
      }
      if (
        normalizedBody.displayNextStep &&
        (normalizedBody.nextStep.length < 2 || normalizedBody.nextStep.length > 240)
      ) {
        return "Next step must be between 2 and 240 characters.";
      }
    }

    return null;
  }

  async function handleSaveEdit(item: AdminContentItemRow) {
    if (!editFormState || savingEditId || updatingId || deletingId || restoringRevisionId) return;
    setActionError(null);
    setActionNotice(null);
    setEditError(null);

    const validationError = validateEditForm(item, editFormState);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    const normalizedTitle = editFormState.title.trim();
    const normalizedSlug = editFormState.slug.trim();
    const normalizedSummary = editFormState.summary.trim();
    const normalizedCategory = normalizeCategoryInput(editFormState.category);
    const normalizedSortOrder = Number.parseInt(editFormState.sortOrder, 10);
    const normalizedParentId = editFormState.parentId.trim();

    const updatePayload: Record<string, unknown> = {};
    if (normalizedTitle !== item.title) {
      updatePayload.title = normalizedTitle;
    }
    if (normalizedSlug !== item.slug) {
      updatePayload.slug = normalizedSlug;
    }
    if (normalizedSummary !== (item.summary ?? "")) {
      updatePayload.summary = normalizedSummary;
    }
    if (normalizedCategory !== item.category) {
      updatePayload.category = normalizedCategory;
    }
    if (normalizedSortOrder !== item.sort_order) {
      updatePayload.sortOrder = normalizedSortOrder;
    }

    if (item.content_type === "course_lesson") {
      const itemParentId = item.parent_id ?? "";
      if (normalizedParentId !== itemParentId) {
        updatePayload.parentId = normalizedParentId || null;
      }
      if (editFormState.lessonBody) {
        updatePayload.body = buildLessonBodyPayload(item.body, editFormState.lessonBody);
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      setActionNotice("No changes to save.");
      return;
    }

    setSavingEditId(item.id);
    try {
      const response = await fetch(`/api/admin/content/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(updatePayload),
      });
      const payload = (await response.json()) as AdminContentUpdateResponse;
      if (!response.ok || !payload.ok) {
        setEditError(
          payload.ok
            ? "Could not save content changes."
            : (payload.error ?? "Could not save content changes.")
        );
        return;
      }

      setItems((prev) =>
        prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
      );

      const shouldNormalizeCourseStructure =
        (item.content_type === "course_module" || item.content_type === "course_lesson") &&
        ("sortOrder" in updatePayload || "parentId" in updatePayload);

      if (shouldNormalizeCourseStructure) {
        const normalized = await runCourseStructureAction(
          { action: "normalize" },
          {
            successNotice: "Content item updated and course order normalized.",
          }
        );
        if (!normalized) {
          setCourseStructureMessage(
            "Content item was saved, but order normalization failed. Retry normalization from course structure actions."
          );
        }
      } else {
        setActionNotice("Content item updated.");
      }

      const nextEditState = toEditFormState(payload.item);
      setEditingItemId(payload.item.id);
      setEditFormState(nextEditState);
      setEditBaselineState(nextEditState);
      setEditError(null);
    } catch {
      setEditError("Could not save content changes.");
    } finally {
      setSavingEditId(null);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setActionError(null);
    setActionNotice(null);

    try {
      if (formState.contentType === "course_lesson" && !formState.parentId.trim()) {
        setActionError("Course lessons must be created with a parent module.");
        return;
      }

      const payload = await createContentItem({
        contentType: formState.contentType,
        title: formState.title,
        slug: formState.slug,
        summary: formState.summary,
        category: formState.category,
        status: formState.status,
        parentId: formState.contentType === "course_lesson" ? formState.parentId : undefined,
      });

      if (!payload.ok) {
        setActionError(payload.error ?? "Could not create content item.");
        return;
      }

      setItems((prev) => [payload.item, ...prev]);
      if (COURSE_CONTENT_TYPES.has(payload.item.content_type)) {
        setShowCourseRowsInContentList(true);
      }
      setFormState(INITIAL_FORM);
      setActionNotice("Content item created.");
    } catch {
      setActionError("Could not create content item.");
    } finally {
      setSubmitting(false);
    }
  }

  function statusNotice(status: AdminContentStatus): string {
    if (status === "published") return "Content item published.";
    if (status === "review") return "Moved to review.";
    if (status === "archived") return "Content item archived.";
    return "Moved to draft.";
  }

  function statusActionLabel(status: AdminContentStatus): string {
    if (status === "published") return "Publish";
    if (status === "review") return "Move to review";
    if (status === "archived") return "Archive";
    return "Move to draft";
  }

  function statusLabel(status: AdminContentStatus): string {
    return STATUS_LABEL_BY_VALUE[status];
  }

  function statusChipClass(status: AdminContentStatus): string {
    return STATUS_CHIP_CLASS_BY_VALUE[status];
  }

  function statusCountSummary(counts: StatusCountByState): string {
    return STATUS_OPTIONS.map(
      (option) => `${counts[option.value]} ${option.label.toLowerCase()}`
    ).join(" · ");
  }

  function rowContextHint(item: AdminContentItemRow): string | null {
    if (item.content_type === "course_module") {
      return `Module ${item.sort_order + 1}`;
    }

    if (item.content_type === "course_lesson") {
      const parentLabel = item.parent_id ? moduleLabelById.get(item.parent_id) : null;
      const runtimeLessonId =
        resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim();
      return parentLabel
        ? `Parent: ${parentLabel} · Runtime ID: ${runtimeLessonId}`
        : `Parent module not linked · Runtime ID: ${runtimeLessonId}`;
    }

    if (item.content_type === "guide_session") {
      const weekNumber = parseBodyNumber(item.body, "weekNumber");
      const sessionId = resolveGuideSessionRuntimeId(item.body, item.slug).runtimeId;
      if (weekNumber) return `Week ${weekNumber}${sessionId ? ` · ${sessionId}` : ""}`;
      if (sessionId) return sessionId;
      return `Session ${item.sort_order + 1}`;
    }

    if (item.content_type === "guide_drill") {
      const drillId = resolveGuideDrillRuntimeId(item.body, item.slug).runtimeId;
      if (drillId) return drillId;
      return `Drill ${item.sort_order + 1}`;
    }

    if (item.content_type === "page") {
      return `Route: /${item.slug}`;
    }

    if (item.content_type === "product") {
      const productId = parseBodyString(item.body, "productId");
      return productId ? `Linked product id: ${productId}` : "Use this for product-specific copy.";
    }

    return null;
  }

  async function handleSetStatus(item: AdminContentItemRow, nextStatus: AdminContentStatus) {
    if (updatingId || deletingId) return;
    if (item.status === nextStatus) return;
    setActionError(null);
    setActionNotice(null);
    setUpdatingId(item.id);

    try {
      const response = await fetch(`/api/admin/content/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = (await response.json()) as AdminContentUpdateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not update content item."
            : (payload.error ?? "Could not update content item.")
        );
        return;
      }

      setItems((prev) =>
        prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
      );
      setActionNotice(statusNotice(nextStatus));
    } catch {
      setActionError("Could not update content item.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(item: AdminContentItemRow) {
    if (updatingId || deletingId) return;
    if (item.content_type === "course_module") {
      openModuleDeleteDialog(item);
      return;
    }
    const confirmed = window.confirm(
      `Delete "${item.title}"? This cannot be undone and removes this content record.`
    );
    if (!confirmed) return;

    setActionError(null);
    setActionNotice(null);
    setDeletingId(item.id);
    try {
      const response = await fetch(`/api/admin/content/${item.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = (await response.json()) as AdminContentDeleteResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not delete content item."
            : (payload.error ?? "Could not delete content item.")
        );
        return;
      }

      setItems((prev) => prev.filter((entry) => entry.id !== payload.id));
      setActionNotice("Content item deleted.");
    } catch {
      setActionError("Could not delete content item.");
    } finally {
      setDeletingId(null);
    }
  }

  async function loadRevisionsForItem(itemId: string, force = false): Promise<boolean> {
    if (!force && revisionsByItemId[itemId] && !revisionErrorByItemId[itemId]) {
      return true;
    }

    setRevisionsLoadingItemId(itemId);
    setActionError(null);
    setRevisionErrorByItemId((prev) => ({
      ...prev,
      [itemId]: null,
    }));
    try {
      const response = await fetch(`/api/admin/content/${itemId}/revisions`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminContentRevisionsResponse;
      if (!response.ok || !payload.ok) {
        setRevisionErrorByItemId((prev) => ({
          ...prev,
          [itemId]: payload.ok
            ? "Could not load revision history."
            : (payload.error ?? "Could not load revision history."),
        }));
        setRevisionsByItemId((prev) => ({
          ...prev,
          [itemId]: [],
        }));
        return false;
      }

      setRevisionsByItemId((prev) => ({
        ...prev,
        [itemId]: payload.items,
      }));
      setCanRestoreByItemId((prev) => ({
        ...prev,
        [itemId]: payload.canRestore,
      }));
      setRevisionErrorByItemId((prev) => ({
        ...prev,
        [itemId]: null,
      }));
      return true;
    } catch {
      setRevisionErrorByItemId((prev) => ({
        ...prev,
        [itemId]: "Could not load revision history.",
      }));
      setRevisionsByItemId((prev) => ({
        ...prev,
        [itemId]: [],
      }));
      return false;
    } finally {
      setRevisionsLoadingItemId(null);
    }
  }

  function handleToggleRevisions(itemId: string) {
    if (openRevisionsItemId === itemId) {
      setOpenRevisionsItemId(null);
      return;
    }

    setOpenRevisionsItemId(itemId);
    if (revisionsByItemId[itemId] && !revisionErrorByItemId[itemId]) {
      return;
    }

    void loadRevisionsForItem(itemId);
  }

  async function handleRestoreRevision(item: AdminContentItemRow, revisionId: string) {
    if (restoringRevisionId || updatingId || deletingId) return;
    const confirmed = window.confirm(
      `Restore "${item.title}" to this revision? Current values will be replaced.`
    );
    if (!confirmed) return;

    setActionError(null);
    setActionNotice(null);
    setRestoringRevisionId(revisionId);

    try {
      const response = await fetch(`/api/admin/content/${item.id}/revisions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ revisionId }),
      });
      const payload = (await response.json()) as AdminContentRestoreResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not restore revision."
            : (payload.error ?? "Could not restore revision.")
        );
        return;
      }

      setItems((prev) =>
        prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
      );
      await loadRevisionsForItem(item.id, true);
      setActionNotice("Revision restored.");
    } catch {
      setActionError("Could not restore revision.");
    } finally {
      setRestoringRevisionId(null);
    }
  }

  async function handleCleanupQaTestRecords() {
    if (cleanupSubmitting) return;
    const ignoredRecordCount = mirror?.summary.ignoredRecordCount ?? 0;
    if (ignoredRecordCount === 0) return;

    const confirmed = window.confirm(
      `Delete ${ignoredRecordCount} ignored QA/test content record(s)? This only removes explicit e2e-admin-content-* rows.`
    );
    if (!confirmed) return;

    setActionError(null);
    setActionNotice(null);
    setCleanupSubmitting(true);

    try {
      const response = await fetch("/api/admin/content/test-records", {
        method: "POST",
        credentials: "same-origin",
      });
      const payload = (await response.json()) as AdminContentCleanupTestRecordsResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not clean up QA/test records."
            : (payload.error ?? "Could not clean up QA/test records.")
        );
        return;
      }

      await loadItems();
      if (payload.deletedCount === 0) {
        setActionNotice("No QA/test content records needed cleanup.");
        return;
      }

      const deletedCountLabel = `Deleted ${payload.deletedCount} QA/test content record${
        payload.deletedCount === 1 ? "" : "s"
      }.`;
      if (payload.normalizedCourseStructure === false) {
        setActionNotice(
          payload.warning
            ? `${deletedCountLabel} ${payload.warning}`
            : `${deletedCountLabel} Course order normalization needs retry.`
        );
        return;
      }

      setActionNotice(
        payload.warning ? `${deletedCountLabel} ${payload.warning}` : deletedCountLabel
      );
    } catch {
      setActionError("Could not clean up QA/test records.");
    } finally {
      setCleanupSubmitting(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-content-manager">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="admin-content-list-anchor" className="text-lg font-semibold text-slate-900">
              Content items
            </h2>
            <p className="mt-2 text-sm text-slate-600">{groupedCountLabel}</p>
            {isAllContentView && filteredCountLabel ? (
              <p className="mt-1 text-xs text-slate-500">{filteredCountLabel}</p>
            ) : null}
            {isAllContentView && moduleScopeLabel ? (
              <p className="mt-1 text-xs font-medium text-blue-700">{moduleScopeLabel}</p>
            ) : null}
            {isAllContentView && schemaReady && courseLessonWorkspaceItems.length > 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                {shouldHideCourseRowsInCatalog
                  ? "Course module/lesson rows are hidden in full catalog by default. Use workspace or enable full list visibility."
                  : "Course module/lesson rows are visible in full catalog."}
              </p>
            ) : null}
            {isCourseWorkspaceView ? (
              <p className="mt-1 text-xs text-slate-500">
                Workspace-first mode for course modules and lessons.
              </p>
            ) : null}
          </div>
          {isAllContentView ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <label className="sr-only" htmlFor="admin-content-search">
                Search content items
              </label>
              <input
                id="admin-content-search"
                type="search"
                value={listQuery}
                onChange={(event) => {
                  setListFocusState(null);
                  setListQuery(event.target.value);
                }}
                placeholder="Search title, slug, category..."
                className="h-10 w-56 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 md:w-64"
              />
              <label className="sr-only" htmlFor="admin-content-type-filter">
                Filter by type
              </label>
              <select
                id="admin-content-type-filter"
                value={listTypeFilter}
                onChange={(event) =>
                  handleManualTypeFilterChange(event.target.value as "all" | AdminContentType)
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                {ALL_CONTENT_SCOPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="admin-content-status-filter">
                Filter by status
              </label>
              <select
                id="admin-content-status-filter"
                value={listStatusFilter}
                onChange={(event) => {
                  setListFocusState(null);
                  setListStatusFilter(event.target.value as "all" | AdminContentStatus);
                }}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="admin-content-sort">
                Sort content list
              </label>
              <select
                id="admin-content-sort"
                value={listSort}
                onChange={(event) => {
                  setListFocusState(null);
                  setListSort(event.target.value as ListSortOption);
                }}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void loadItems()}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            data-testid="admin-content-view-tab-course-workspace"
            onClick={() => handleContentPrimaryViewChange("course_workspace")}
            aria-pressed={isCourseWorkspaceView}
            disabled={!hasCourseWorkspaceItems}
            className={[
              "inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition",
              isCourseWorkspaceView
                ? "bg-white text-blue-800 shadow-sm"
                : "text-slate-700 hover:bg-white/70",
              !hasCourseWorkspaceItems ? "cursor-not-allowed opacity-60" : "",
            ].join(" ")}
          >
            Course Workspace
          </button>
          <button
            type="button"
            data-testid="admin-content-view-tab-all-content"
            onClick={() => handleContentPrimaryViewChange("all_content")}
            aria-pressed={isAllContentView}
            className={[
              "inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition",
              isAllContentView
                ? "bg-white text-blue-800 shadow-sm"
                : "text-slate-700 hover:bg-white/70",
            ].join(" ")}
          >
            All Content
          </button>
        </div>

        {isAllContentView ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-600">
              Content scope: choose one group to avoid long mixed scrolling. Use{" "}
              <span className="font-semibold">All content (audit)</span> only when you need full
              cross-type review.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {ALL_CONTENT_SCOPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  data-testid={`admin-content-type-chip-${option.value}`}
                  onClick={() => handleManualTypeFilterChange(option.value)}
                  className={[
                    "inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium transition",
                    listTypeFilter === option.value
                      ? "border-blue-300 bg-blue-50 text-blue-800"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {option.label} (
                  {option.value === "all" ? typeCounts.all : typeCounts[option.value]})
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {isAllContentView && listTypeFilter === "all" ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            All content audit mode is enabled. This can be a long mixed list.
          </p>
        ) : null}

        {isAllContentView && schemaReady && courseLessonWorkspaceItems.length > 0 ? (
          <label className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showCourseRowsInContentList}
              onChange={(event) => setShowCourseRowsInContentList(event.target.checked)}
              data-testid="admin-course-list-visibility-toggle"
              className="h-4 w-4 border border-slate-300"
            />
            Show course modules and lessons in full content list
          </label>
        ) : null}

        {isAllContentView && listFocusState ? (
          <div
            data-testid="admin-content-focus-mode"
            className="mt-3 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-900">{listFocusState.label}</p>
              <p className="text-xs text-blue-800">{listFocusState.detail}</p>
            </div>
            <button
              type="button"
              onClick={clearFocusMode}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-white px-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-100"
            >
              Clear focus
            </button>
          </div>
        ) : null}

        {!schemaReady && warning ? (
          <AdminManagerState tone="warning" testId="admin-content-schema-warning-state">
            {warning}
          </AdminManagerState>
        ) : null}

        {isAllContentView && schemaReady && mirror ? (
          <article className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Platform mirror snapshot</h3>
                <p className="text-xs text-slate-500">
                  {mirror.summary.mismatchCount === 0
                    ? "All aligned"
                    : `${mirror.summary.mismatchCount} mismatch${
                        mirror.summary.mismatchCount === 1 ? "" : "es"
                      }`}
                  {mirror.summary.coverageMismatchCount > 0
                    ? ` · ${mirror.summary.coverageMismatchCount} identity drift${
                        mirror.summary.coverageMismatchCount === 1 ? "" : "s"
                      }`
                    : ""}
                  {mirror.summary.ignoredRecordCount > 0
                    ? ` · ${mirror.summary.ignoredRecordCount} ignored QA/test record${
                        mirror.summary.ignoredRecordCount === 1 ? "" : "s"
                      }`
                    : ""}
                </p>
              </div>
              {mirror.summary.ignoredRecordCount > 0 ? (
                adminRole === "admin" ? (
                  <button
                    type="button"
                    onClick={handleCleanupQaTestRecords}
                    disabled={cleanupSubmitting}
                    data-testid="admin-mirror-cleanup-test-records"
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {cleanupSubmitting
                      ? "Cleaning QA/test records..."
                      : "Delete ignored QA/test records"}
                  </button>
                ) : (
                  <p className="text-xs text-slate-500">
                    Sign in as admin to delete ignored QA/test records.
                  </p>
                )
              ) : null}
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {mirror.metrics.map((metric) => (
                <li key={metric.key}>
                  <button
                    type="button"
                    data-testid={`admin-mirror-metric-${metric.key}`}
                    onClick={() => handleMirrorMetricFocus(metric)}
                    aria-pressed={activeMirrorMetricKey === metric.key}
                    className={[
                      "w-full rounded-lg border px-3 py-2 text-left text-xs transition hover:brightness-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                      metric.status === "matched"
                        ? "border-emerald-200 bg-emerald-50/70 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-900",
                      activeMirrorMetricKey === metric.key ? "ring-2 ring-blue-300" : "",
                    ].join(" ")}
                  >
                    <p className="font-semibold">{metric.label}</p>
                    <p className="mt-1">
                      Platform: {metric.platformCount} · Admin: {metric.adminCount}
                      {metric.delta !== 0
                        ? ` · Delta: ${metric.delta > 0 ? "+" : ""}${metric.delta}`
                        : ""}
                    </p>
                    {metric.coverage.missingCount > 0 ? (
                      <p className="mt-1">
                        Missing IDs: {metric.coverage.missingCount}
                        {metric.coverage.missingSamples.length > 0
                          ? ` (${metric.coverage.missingSamples.join(", ")})`
                          : ""}
                      </p>
                    ) : null}
                    {metric.coverage.extraCount > 0 ? (
                      <p className="mt-1">
                        Extra IDs: {metric.coverage.extraCount}
                        {metric.coverage.extraSamples.length > 0
                          ? ` (${metric.coverage.extraSamples.join(", ")})`
                          : ""}
                      </p>
                    ) : null}
                    {metric.coverage.ignoredCount > 0 ? (
                      <p className="mt-1">
                        Ignored QA/test IDs: {metric.coverage.ignoredCount}
                        {metric.coverage.ignoredSamples.length > 0
                          ? ` (${metric.coverage.ignoredSamples.join(", ")})`
                          : ""}
                      </p>
                    ) : null}
                    <p className="mt-2 text-[11px] font-medium opacity-80">
                      {activeMirrorMetricKey === metric.key
                        ? "Active scope"
                        : "Click to focus content list"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Snapshot checks current platform modules/lessons/guides/products against admin records
              and excludes explicit QA/test slugs such as `e2e-admin-content-*` from parity counts.
            </p>
          </article>
        ) : null}

        {isCourseWorkspaceView ? (
          <article
            className="mt-5 flex flex-col rounded-xl border border-slate-200 bg-slate-50/80 p-4"
            data-testid="admin-course-lesson-workspace"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Course workspace overview</h3>
                <span className="inline-flex h-6 items-center rounded-full border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-600">
                  {isFocusedCourseWorkspace ? "Focus mode active" : "Overview mode"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {courseLessonWorkspaceItems.length} lesson
                {courseLessonWorkspaceItems.length === 1 ? "" : "s"} ready for edit
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              {isFocusedCourseWorkspace
                ? "Overview stays compact while the selected module becomes the primary lesson workspace below."
                : "Scan modules here first, then open one module when you are ready to edit or reorder its lessons."}
            </p>

            <div
              className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2"
              data-testid="admin-course-status-overview"
            >
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                  Modules
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {courseModuleWorkspaceItems.length} total
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {statusCountSummary(moduleStatusCounts)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                  Lessons
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {courseLessonWorkspaceItems.length} total
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {statusCountSummary(lessonStatusCounts)}
                </p>
              </div>
            </div>

            {courseModuleWorkspaceItems.length > 0 ? (
              <ul
                className="mt-3 grid gap-2 lg:grid-cols-2"
                data-testid="admin-course-module-status-list"
              >
                {courseModuleWorkspaceItems.map((moduleItem) => {
                  const moduleLessonCounts =
                    lessonStatusCountsByModuleId.get(moduleItem.id) ?? createStatusCountByState();
                  const moduleLessons = workspaceLessonsByModuleId.get(moduleItem.id) ?? [];
                  const moduleLessonPreview = buildCourseWorkspaceLessonPreview(
                    moduleLessons,
                    isFocusedCourseWorkspace ? 0 : COURSE_WORKSPACE_OVERVIEW_PREVIEW_LIMIT
                  );
                  const moduleLessonCount = Object.values(moduleLessonCounts).reduce(
                    (sum, value) => sum + value,
                    0
                  );
                  const moduleScopeActive = workspaceModuleId === moduleItem.id;
                  const modulePreviewLessonId = firstRuntimeLessonIdByModuleId.get(moduleItem.id);
                  const moduleRecord = contentItemById.get(moduleItem.id) ?? null;
                  const modulePreviewUrl = modulePreviewLessonId
                    ? buildCoursePreviewHref({
                        lessonId: modulePreviewLessonId,
                        mode: resolveCoursePreviewModeFromStatus(moduleItem.status),
                        previewType: "module",
                        previewRef: moduleItem.slug,
                      })
                    : null;

                  return (
                    <li
                      key={moduleItem.id}
                      className={[
                        "rounded-lg border px-3 py-2",
                        moduleScopeActive
                          ? "border-blue-300 bg-blue-50/40"
                          : "border-slate-200 bg-white",
                      ].join(" ")}
                      data-testid="admin-course-module-status-row"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {moduleItem.sortOrder + 1}. {moduleItem.title}
                        </p>
                        <span
                          className={[
                            "inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-semibold",
                            statusChipClass(moduleItem.status),
                          ].join(" ")}
                        >
                          {statusLabel(moduleItem.status)}
                        </span>
                      </div>
                      {moduleScopeActive ? (
                        <p className="mt-1 text-[11px] font-semibold text-blue-800">
                          Active module scope
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-600">
                        {moduleLessonCount} linked lesson{moduleLessonCount === 1 ? "" : "s"} ·{" "}
                        {statusCountSummary(moduleLessonCounts)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleWorkspaceFocusModule(moduleItem.id)}
                          className="inline-flex h-7 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Open module scope
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWorkspaceEditModule(moduleItem.id)}
                          className="inline-flex h-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-medium text-blue-800 transition hover:bg-blue-100"
                        >
                          Edit module
                        </button>
                        <button
                          type="button"
                          onClick={() => openWorkspaceLessonCreate(moduleItem.id)}
                          className="inline-flex h-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100"
                        >
                          Add lesson
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!moduleRecord) return;
                            void handleDelete(moduleRecord);
                          }}
                          disabled={!moduleRecord}
                          className="inline-flex h-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                        >
                          Delete module
                        </button>
                        {modulePreviewUrl ? (
                          <a
                            href={modulePreviewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
                          >
                            Open module preview
                          </a>
                        ) : (
                          <span className="inline-flex h-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-3 text-xs font-medium text-slate-500">
                            Open module preview (no lessons)
                          </span>
                        )}
                      </div>
                      {isFocusedCourseWorkspace ? (
                        <p className="mt-3 text-[11px] text-slate-500">
                          {moduleScopeActive
                            ? "Detailed lesson order and actions are shown below in Module workspace."
                            : "Overview stays compact while one module is focused below."}
                        </p>
                      ) : (
                        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                              Lesson preview
                            </p>
                            {moduleLessonCount > 0 ? (
                              <span className="text-[11px] text-slate-500">
                                Use module scope for reordering and full lesson workspace
                              </span>
                            ) : null}
                          </div>
                          {moduleLessons.length === 0 ? (
                            <AdminManagerState
                              tone="empty"
                              density="compact"
                              className="!mt-2"
                              testId="admin-course-module-lesson-preview-empty-state"
                            >
                              No lessons linked to this module yet.
                            </AdminManagerState>
                          ) : (
                            <div
                              data-testid={`admin-course-module-lesson-preview-${moduleItem.id}`}
                            >
                              <ol className="mt-2 space-y-1">
                                {moduleLessonPreview.visibleLessons.map((lesson, lessonIndex) => {
                                  const lessonRecord = contentItemById.get(lesson.id) ?? null;

                                  return (
                                    <li
                                      key={lesson.id}
                                      data-testid="admin-course-module-lesson-preview-row"
                                      className="rounded-md border border-slate-200 bg-white px-2 py-2"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-xs font-medium text-slate-900">
                                          {lessonIndex + 1}. {lesson.title}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                          <a
                                            href={`/course?lesson=${encodeURIComponent(
                                              lesson.runtimeLessonId
                                            )}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex h-7 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50"
                                          >
                                            Open lesson
                                          </a>
                                          <button
                                            type="button"
                                            onClick={() => handleWorkspaceEditLesson(lesson.id)}
                                            className="inline-flex h-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-2.5 text-[11px] font-medium text-blue-800 transition hover:bg-blue-100"
                                          >
                                            Edit lesson
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (!lessonRecord) return;
                                              void handleDelete(lessonRecord);
                                            }}
                                            disabled={!lessonRecord}
                                            className="inline-flex h-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-[11px] font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                            Delete lesson
                                          </button>
                                        </div>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ol>
                              {moduleLessonPreview.hiddenCount > 0 ? (
                                <p className="mt-2 text-[11px] text-slate-500">
                                  {moduleLessonPreview.hiddenCount} more lesson
                                  {moduleLessonPreview.hiddenCount === 1 ? "" : "s"} in module
                                  workspace.
                                </p>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {workspaceModuleId !== WORKSPACE_ALL_MODULES_ID ? (
              <div
                className="order-first mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2"
                data-testid="admin-course-workspace-current-scope"
              >
                <div>
                  <p className="text-xs font-semibold text-blue-900">Current workspace scope</p>
                  <p className="text-xs text-blue-800">{workspaceScopeLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => focusCourseWorkspaceScope(WORKSPACE_ALL_MODULES_ID)}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-white px-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-100"
                >
                  Show all modules
                </button>
              </div>
            ) : null}

            <div
              className="order-first mt-3 rounded-xl border border-slate-200 bg-white p-3"
              data-testid="admin-course-workspace-focus-panel"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Module workspace</span>
                  <select
                    value={workspaceModuleId}
                    onChange={(event) => focusCourseWorkspaceScope(event.target.value)}
                    className="h-9 min-w-[240px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value={WORKSPACE_ALL_MODULES_ID}>
                      All modules ({courseLessonWorkspaceItems.length})
                    </option>
                    {moduleOptions.map((option) => {
                      const moduleLessonCount = courseLessonWorkspaceItems.filter(
                        (item) => item.parentId === option.id
                      ).length;
                      return (
                        <option key={option.id} value={option.id}>
                          {option.label} ({moduleLessonCount})
                        </option>
                      );
                    })}
                    {unlinkedLessonCount > 0 ? (
                      <option value={WORKSPACE_UNLINKED_MODULE_ID}>
                        Unlinked lessons ({unlinkedLessonCount})
                      </option>
                    ) : null}
                  </select>
                </label>
                {moduleIdSet.has(workspaceModuleId) ? (
                  <button
                    type="button"
                    onClick={() => openWorkspaceLessonCreate(workspaceModuleId)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    Add lesson in this module
                  </button>
                ) : null}
              </div>

              <p className="mt-2 text-xs text-slate-600">
                {workspaceModuleId === WORKSPACE_ALL_MODULES_ID
                  ? "Current workspace stays on top. Use overview below to scan modules quickly, then open a module here when you need full lesson ordering, move controls, or in-context create."
                  : workspaceModuleId === WORKSPACE_UNLINKED_MODULE_ID
                    ? "Focused exception view: repair lessons that are not attached to a valid module."
                    : "Focused module workspace: use this as the primary place to reorder, move, preview, and edit lessons in one module."}
              </p>

              {workspaceLessonCreateOpen ? (
                <form
                  className="mt-3 grid gap-3 rounded-xl border border-emerald-200 bg-slate-50 p-3 sm:grid-cols-2"
                  onSubmit={handleWorkspaceLessonCreate}
                  data-testid="admin-workspace-lesson-create-form"
                >
                  <div className="sm:col-span-2">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Create lesson in context
                    </h4>
                    <p className="mt-1 text-xs text-slate-600">
                      Start in the intended module now. You can still override the parent module
                      before save if you intentionally want another module.
                    </p>
                  </div>

                  <label className="space-y-1 text-xs font-medium text-slate-700">
                    <span>Parent module</span>
                    <select
                      value={workspaceLessonCreateState.parentId}
                      onChange={(event) =>
                        setWorkspaceLessonCreateState((previous) => ({
                          ...previous,
                          parentId: event.target.value,
                        }))
                      }
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    >
                      <option value="">Select module</option>
                      {moduleOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 text-xs font-medium text-slate-700">
                    <span>Status</span>
                    <select
                      value={workspaceLessonCreateState.status}
                      onChange={(event) =>
                        setWorkspaceLessonCreateState((previous) => ({
                          ...previous,
                          status: event.target.value as AdminContentStatus,
                        }))
                      }
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                    <span>Title</span>
                    <input
                      type="text"
                      required
                      value={workspaceLessonCreateState.title}
                      onChange={(event) =>
                        setWorkspaceLessonCreateState((previous) => ({
                          ...previous,
                          title: event.target.value,
                        }))
                      }
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      placeholder="First breaths"
                    />
                  </label>

                  <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                    <span>Slug (optional)</span>
                    <input
                      type="text"
                      value={workspaceLessonCreateState.slug}
                      onChange={(event) =>
                        setWorkspaceLessonCreateState((previous) => ({
                          ...previous,
                          slug: event.target.value,
                        }))
                      }
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      placeholder="first-breaths"
                    />
                    <p className="text-[11px] font-normal text-slate-500">
                      Slug stays human-readable. Runtime lesson ID is assigned automatically and
                      locked after creation.
                    </p>
                  </label>

                  <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                    <span>Summary</span>
                    <textarea
                      rows={3}
                      value={workspaceLessonCreateState.summary}
                      onChange={(event) =>
                        setWorkspaceLessonCreateState((previous) => ({
                          ...previous,
                          summary: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                      placeholder="What this lesson helps the swimmer do."
                    />
                  </label>

                  {workspaceLessonCreateError ? (
                    <AdminManagerState
                      tone="error"
                      announcement="polite"
                      density="compact"
                      className="!mt-0 sm:col-span-2"
                      testId="admin-workspace-lesson-create-error-state"
                    >
                      {workspaceLessonCreateError}
                    </AdminManagerState>
                  ) : null}

                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    <button
                      type="submit"
                      disabled={workspaceLessonCreateSubmitting}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {workspaceLessonCreateSubmitting ? "Creating…" : "Create lesson"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkspaceLessonCreateOpen(false);
                        setWorkspaceLessonCreateError(null);
                      }}
                      disabled={workspaceLessonCreateSubmitting}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}

              {workspaceModuleId === WORKSPACE_ALL_MODULES_ID ? (
                <p
                  className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                  data-testid="admin-course-workspace-overview-guidance"
                >
                  Overview mode now supports quick lesson open/edit/delete from each module card.
                  Choose a module above only when you need the full ordered workspace for move
                  controls, create, and deeper lesson edits.
                </p>
              ) : workspaceLessons.length === 0 ? (
                <AdminManagerState
                  tone="empty"
                  density="compact"
                  className="!mt-3"
                  testId="admin-course-workspace-empty-state"
                >
                  No lessons in this module yet.
                </AdminManagerState>
              ) : (
                <ul className="mt-3 space-y-2">
                  {workspaceLessons.map((lesson, index) => {
                    const moveBounds = lessonMoveBoundsById.get(lesson.id);
                    const selectedTargetModuleId = lessonMoveTargetById[lesson.id] ?? "";
                    const canMoveToTargetModule =
                      selectedTargetModuleId.length > 0 &&
                      selectedTargetModuleId !== (lesson.parentId ?? "");
                    const workspaceActionBusy = Boolean(
                      courseStructureBusy ||
                      moduleDeleteSubmitting ||
                      updatingId ||
                      deletingId ||
                      restoringRevisionId ||
                      savingEditId
                    );

                    return (
                      <li
                        key={lesson.id}
                        data-testid="admin-workspace-lesson-row"
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <div className="min-w-[220px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">
                              Lesson {index + 1}: {lesson.title}
                            </p>
                            <span
                              className={[
                                "inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-semibold",
                                statusChipClass(lesson.status),
                              ].join(" ")}
                            >
                              {statusLabel(lesson.status)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {lesson.moduleLabel ?? "Unlinked module"} · /{lesson.slug} · id:{" "}
                            {lesson.runtimeLessonId}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleMoveLesson(lesson.id, "up")}
                            disabled={workspaceActionBusy || !moveBounds?.canMoveUp}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Move up
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleMoveLesson(lesson.id, "down")}
                            disabled={workspaceActionBusy || !moveBounds?.canMoveDown}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Move down
                          </button>
                          <label className="sr-only" htmlFor={`workspace-move-target-${lesson.id}`}>
                            Move lesson to module
                          </label>
                          <select
                            id={`workspace-move-target-${lesson.id}`}
                            value={selectedTargetModuleId}
                            onChange={(event) =>
                              setLessonMoveTargetById((previous) => ({
                                ...previous,
                                [lesson.id]: event.target.value,
                              }))
                            }
                            disabled={workspaceActionBusy || moduleOptions.length === 0}
                            className="h-8 min-w-[170px] rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900"
                          >
                            <option value="">Select module</option>
                            {moduleOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              void handleMoveLessonToModule(lesson.id, selectedTargetModuleId)
                            }
                            disabled={workspaceActionBusy || !canMoveToTargetModule}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-medium text-indigo-800 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Move to module
                          </button>
                          <button
                            type="button"
                            onClick={() => handleWorkspaceEditLesson(lesson.id)}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-100"
                          >
                            Edit lesson
                          </button>
                          <a
                            href={buildCoursePreviewHref({
                              lessonId: lesson.runtimeLessonId,
                              mode: resolveCoursePreviewModeFromStatus(lesson.status),
                              previewType: "lesson",
                              previewRef: lesson.slug,
                            })}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
                          >
                            Open preview
                          </a>
                          <a
                            href={`/course?lesson=${encodeURIComponent(lesson.runtimeLessonId)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Open lesson
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </article>
        ) : null}

        {loading ? (
          <AdminManagerState tone="loading" testId="admin-content-loading-state">
            Loading content list…
          </AdminManagerState>
        ) : null}

        {!loading && error ? (
          <AdminManagerState
            tone="error"
            testId="admin-content-load-error-state"
            actions={
              <button
                type="button"
                onClick={() => void loadItems()}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
              >
                Retry
              </button>
            }
          >
            {error}
          </AdminManagerState>
        ) : null}

        {!loading && !error && courseStructureIntegrityFragments.length > 0 ? (
          <AdminManagerState
            tone="warning"
            testId="admin-content-course-structure-warning-state"
            className="flex flex-wrap items-center justify-between gap-3"
            actionsClassName="mt-0 flex flex-wrap gap-2"
            actions={
              <button
                type="button"
                onClick={() =>
                  void runCourseStructureAction(
                    { action: "normalize" },
                    {
                      successNotice: "Course order normalized.",
                    }
                  )
                }
                disabled={courseStructureBusy || moduleDeleteSubmitting}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-amber-200 bg-white px-3 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {courseStructureBusy ? "Normalizing…" : "Normalize order"}
              </button>
            }
          >
            Course structure integrity warning: {courseStructureIntegrityFragments.join(" · ")}.
          </AdminManagerState>
        ) : null}

        {courseStructureMessage ? (
          <p className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {courseStructureMessage}
          </p>
        ) : null}

        {actionNotice ? (
          <AdminManagerState tone="success" testId="admin-content-action-notice-state">
            {actionNotice}
          </AdminManagerState>
        ) : null}

        {isAllContentView && !loading && !error && schemaReady && items.length === 0 ? (
          <AdminManagerState tone="empty" testId="admin-content-empty-state">
            No content items created yet. Use the form below to create your first draft.
          </AdminManagerState>
        ) : null}

        {isAllContentView && !loading && !error && items.length > 0 && sortedItems.length === 0 ? (
          <AdminManagerState tone="no-results" testId="admin-content-no-results-state">
            No content items match current search/filter.
          </AdminManagerState>
        ) : null}

        {isAllContentView && !loading && !error && sortedItems.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {sortedItems.map((item) => {
              const isEditingRow = editingItemId === item.id;
              const isInlineEditable = canEditInline(item);
              const rowPreviewHref =
                item.content_type === "course_lesson"
                  ? lessonPreviewHref(item)
                  : item.content_type === "course_module"
                    ? (() => {
                        const firstLessonId = firstRuntimeLessonIdByModuleId.get(item.id);
                        if (!firstLessonId) return null;
                        return modulePreviewHref(item, firstLessonId);
                      })()
                    : null;
              const rowBusy = Boolean(
                courseStructureBusy ||
                moduleDeleteSubmitting ||
                updatingId ||
                deletingId ||
                restoringRevisionId ||
                savingEditId
              );
              const rowTypeLabel = CONTENT_TYPE_LABEL[item.content_type];
              const rowHint = rowContextHint(item);
              const editNotesContext = isEditingRow
                ? resolveAdminContentEditNotesContext(item)
                : null;
              const editQrContext = isEditingRow ? resolveAdminContentEditQrContext(item) : null;
              const courseWorkspaceScopeId =
                item.content_type === "course_module"
                  ? item.id
                  : item.content_type === "course_lesson"
                    ? item.parent_id && moduleIdSet.has(item.parent_id)
                      ? item.parent_id
                      : WORKSPACE_UNLINKED_MODULE_ID
                    : null;
              const courseWorkspaceScopeLabel =
                courseWorkspaceScopeId === WORKSPACE_UNLINKED_MODULE_ID
                  ? "unlinked lessons"
                  : courseWorkspaceScopeId
                    ? (moduleLabelById.get(courseWorkspaceScopeId) ?? "selected module")
                    : null;
              const moduleMoveBounds =
                item.content_type === "course_module"
                  ? moduleMoveBoundsById.get(item.id)
                  : undefined;
              const lessonMoveBounds =
                item.content_type === "course_lesson"
                  ? lessonMoveBoundsById.get(item.id)
                  : undefined;
              const revisionItems = revisionsByItemId[item.id] ?? [];
              const revisionError = revisionErrorByItemId[item.id] ?? null;
              const isRevisionLoading = revisionsLoadingItemId === item.id;

              return (
                <li
                  key={item.id}
                  id={`admin-content-item-${item.id}`}
                  data-testid="admin-content-item"
                  className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-[280px] flex-1">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {rowTypeLabel} · {item.category} · {item.status} · /{item.slug}
                      </p>
                      {rowHint ? <p className="mt-1 text-xs text-slate-500">{rowHint}</p> : null}

                      {isEditingRow && editFormState ? (
                        <div
                          className="mt-3 rounded-lg border border-blue-200 bg-white p-3"
                          data-testid="admin-content-edit-form"
                        >
                          {courseWorkspaceScopeId && courseWorkspaceScopeLabel ? (
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                              <div>
                                <p className="text-xs font-semibold text-slate-700">
                                  Course workspace context
                                </p>
                                <p className="text-xs text-slate-500">
                                  Return to {courseWorkspaceScopeLabel} to continue module-scoped
                                  editing.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => focusCourseWorkspaceScope(courseWorkspaceScopeId)}
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                              >
                                {courseWorkspaceScopeId === WORKSPACE_UNLINKED_MODULE_ID
                                  ? "Back to unlinked lessons"
                                  : "Back to module workspace"}
                              </button>
                            </div>
                          ) : null}
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                              <span>Title</span>
                              <input
                                type="text"
                                value={editFormState.title}
                                onChange={(event) =>
                                  setEditFormState((prev) =>
                                    prev ? { ...prev, title: event.target.value } : prev
                                  )
                                }
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                              />
                            </label>

                            <label className="space-y-1 text-xs font-medium text-slate-700">
                              <span>Slug</span>
                              <input
                                type="text"
                                value={editFormState.slug}
                                onChange={(event) =>
                                  setEditFormState((prev) =>
                                    prev ? { ...prev, slug: event.target.value } : prev
                                  )
                                }
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                              />
                              {item.content_type === "course_module" ||
                              item.content_type === "course_lesson" ? (
                                <p className="text-[11px] font-normal text-slate-500">
                                  Slug is the human-readable content key. It can be renamed
                                  carefully; internal runtime IDs stay locked after creation.
                                </p>
                              ) : null}
                            </label>

                            <label className="space-y-1 text-xs font-medium text-slate-700">
                              <span>Category</span>
                              <input
                                type="text"
                                value={editFormState.category}
                                onChange={(event) =>
                                  setEditFormState((prev) =>
                                    prev ? { ...prev, category: event.target.value } : prev
                                  )
                                }
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                              />
                            </label>

                            <label className="space-y-1 text-xs font-medium text-slate-700">
                              <span>Sort order</span>
                              <input
                                type="number"
                                value={editFormState.sortOrder}
                                onChange={(event) =>
                                  setEditFormState((prev) =>
                                    prev ? { ...prev, sortOrder: event.target.value } : prev
                                  )
                                }
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                              />
                            </label>

                            {item.content_type === "course_lesson" ? (
                              <label className="space-y-1 text-xs font-medium text-slate-700">
                                <span>Parent module</span>
                                <select
                                  value={editFormState.parentId}
                                  onChange={(event) =>
                                    setEditFormState((prev) =>
                                      prev ? { ...prev, parentId: event.target.value } : prev
                                    )
                                  }
                                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                                >
                                  <option value="">Select module</option>
                                  {moduleOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ) : null}

                            <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                              <span>Summary</span>
                              <textarea
                                rows={3}
                                value={editFormState.summary}
                                onChange={(event) =>
                                  setEditFormState((prev) =>
                                    prev ? { ...prev, summary: event.target.value } : prev
                                  )
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                              />
                            </label>

                            {item.content_type === "course_lesson" && editFormState.lessonBody ? (
                              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                                <h4 className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                  Lesson body editor
                                </h4>
                                <p className="mt-1 text-xs text-slate-500">
                                  This controls what appears in the lesson page (goal, cues, drill,
                                  checkpoint criteria, next step, support card, and section label).
                                </p>

                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                  <div className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                                    <span>Lesson runtime ID</span>
                                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900">
                                      <code>{editFormState.lessonBody.lessonId}</code>
                                    </div>
                                    <p className="text-[11px] font-normal text-slate-500">
                                      Internal ID used by open lesson links, progress, notes, and
                                      previews. It is locked after creation. Rename in place only
                                      when this is still the same learning object; if the lesson is
                                      materially different, create a new lesson instead of
                                      repurposing this one.
                                    </p>
                                  </div>

                                  <label className="space-y-1 text-xs font-medium text-slate-700">
                                    <span>Lesson type</span>
                                    <select
                                      value={editFormState.lessonBody.lessonType}
                                      onChange={(event) =>
                                        setEditFormState((prev) =>
                                          prev?.lessonBody
                                            ? {
                                                ...prev,
                                                lessonBody: {
                                                  ...prev.lessonBody,
                                                  lessonType: event.target
                                                    .value as LessonTypeOption,
                                                },
                                              }
                                            : prev
                                        )
                                      }
                                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                                    >
                                      {LESSON_TYPE_OPTIONS.map((option) => (
                                        <option key={option.value || "empty"} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  </label>

                                  <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                                    <span>Section badge label (optional)</span>
                                    <input
                                      type="text"
                                      value={editFormState.lessonBody.drillLabel}
                                      onChange={(event) =>
                                        setEditFormState((prev) =>
                                          prev?.lessonBody
                                            ? {
                                                ...prev,
                                                lessonBody: {
                                                  ...prev.lessonBody,
                                                  drillLabel: event.target.value,
                                                },
                                              }
                                            : prev
                                        )
                                      }
                                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                                      placeholder="Defaults to Learn / Drill / Swim"
                                    />
                                  </label>

                                  <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                                    <span>Extra help start lesson number in module (optional)</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={200}
                                      step={1}
                                      value={editFormState.lessonBody.supportStartAtLessonInModule}
                                      onChange={(event) =>
                                        setEditFormState((prev) =>
                                          prev?.lessonBody
                                            ? {
                                                ...prev,
                                                lessonBody: {
                                                  ...prev.lessonBody,
                                                  supportStartAtLessonInModule: event.target.value,
                                                },
                                              }
                                            : prev
                                        )
                                      }
                                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                                      placeholder="Example: 4"
                                    />
                                    <p className="text-[11px] font-medium text-slate-500">
                                      Leave empty to show extra help on all lessons where it is
                                      enabled.
                                    </p>
                                  </label>

                                  <fieldset className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 sm:col-span-2">
                                    <legend className="px-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                      Extra help actions
                                    </legend>
                                    <p className="text-xs text-slate-500">
                                      Choose which actions appear inside the extra help card and
                                      which one (if any) should be highlighted.
                                    </p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                                        <input
                                          type="checkbox"
                                          checked={
                                            editFormState.lessonBody.supportActionVideoAnalysis
                                          }
                                          onChange={(event) =>
                                            setEditFormState((prev) =>
                                              prev?.lessonBody
                                                ? {
                                                    ...prev,
                                                    lessonBody: {
                                                      ...prev.lessonBody,
                                                      supportActionVideoAnalysis:
                                                        event.target.checked,
                                                    },
                                                  }
                                                : prev
                                            )
                                          }
                                          className="h-4 w-4 rounded border border-slate-300"
                                        />
                                        <span>Show Video Analysis</span>
                                      </label>
                                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                                        <input
                                          type="checkbox"
                                          checked={
                                            editFormState.lessonBody.supportActionPoolsideGuide
                                          }
                                          onChange={(event) =>
                                            setEditFormState((prev) =>
                                              prev?.lessonBody
                                                ? {
                                                    ...prev,
                                                    lessonBody: {
                                                      ...prev.lessonBody,
                                                      supportActionPoolsideGuide:
                                                        event.target.checked,
                                                    },
                                                  }
                                                : prev
                                            )
                                          }
                                          className="h-4 w-4 rounded border border-slate-300"
                                        />
                                        <span>Show Poolside guide</span>
                                      </label>
                                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                                        <input
                                          type="checkbox"
                                          checked={
                                            editFormState.lessonBody.supportActionGuide0To1000
                                          }
                                          onChange={(event) =>
                                            setEditFormState((prev) =>
                                              prev?.lessonBody
                                                ? {
                                                    ...prev,
                                                    lessonBody: {
                                                      ...prev.lessonBody,
                                                      supportActionGuide0To1000:
                                                        event.target.checked,
                                                    },
                                                  }
                                                : prev
                                            )
                                          }
                                          className="h-4 w-4 rounded border border-slate-300"
                                        />
                                        <span>Show 0-1000 guide</span>
                                      </label>
                                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                                        <input
                                          type="checkbox"
                                          checked={editFormState.lessonBody.supportActionContact}
                                          onChange={(event) =>
                                            setEditFormState((prev) =>
                                              prev?.lessonBody
                                                ? {
                                                    ...prev,
                                                    lessonBody: {
                                                      ...prev.lessonBody,
                                                      supportActionContact: event.target.checked,
                                                    },
                                                  }
                                                : prev
                                            )
                                          }
                                          className="h-4 w-4 rounded border border-slate-300"
                                        />
                                        <span>Show Contact</span>
                                      </label>
                                    </div>

                                    <label className="space-y-1 text-xs font-medium text-slate-700">
                                      <span>Primary highlighted action (optional)</span>
                                      <select
                                        value={editFormState.lessonBody.supportPrimaryAction}
                                        onChange={(event) =>
                                          setEditFormState((prev) =>
                                            prev?.lessonBody
                                              ? {
                                                  ...prev,
                                                  lessonBody: {
                                                    ...prev.lessonBody,
                                                    supportPrimaryAction: event.target
                                                      .value as SupportPrimaryActionOption,
                                                  },
                                                }
                                              : prev
                                          )
                                        }
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                                      >
                                        <option value="">None (all neutral)</option>
                                        {SUPPORT_ACTION_OPTIONS.map((option) => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                  </fieldset>

                                  <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                                    <span>Lesson goal</span>
                                    <textarea
                                      rows={3}
                                      value={editFormState.lessonBody.goal}
                                      onChange={(event) =>
                                        setEditFormState((prev) =>
                                          prev?.lessonBody
                                            ? {
                                                ...prev,
                                                lessonBody: {
                                                  ...prev.lessonBody,
                                                  goal: event.target.value,
                                                },
                                              }
                                            : prev
                                        )
                                      }
                                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                                    />
                                  </label>

                                  <fieldset className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 sm:col-span-2">
                                    <legend className="px-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                      Section visibility
                                    </legend>
                                    <p className="text-xs text-slate-500">
                                      Use these toggles to show or hide sections on the lesson page.
                                    </p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                                        <input
                                          type="checkbox"
                                          checked={editFormState.lessonBody.displayGoal}
                                          onChange={(event) =>
                                            setEditFormState((prev) =>
                                              prev?.lessonBody
                                                ? {
                                                    ...prev,
                                                    lessonBody: {
                                                      ...prev.lessonBody,
                                                      displayGoal: event.target.checked,
                                                    },
                                                  }
                                                : prev
                                            )
                                          }
                                          className="h-4 w-4 rounded border border-slate-300"
                                        />
                                        <span>Show goal section</span>
                                      </label>
                                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                                        <input
                                          type="checkbox"
                                          checked={editFormState.lessonBody.displayCues}
                                          onChange={(event) =>
                                            setEditFormState((prev) =>
                                              prev?.lessonBody
                                                ? {
                                                    ...prev,
                                                    lessonBody: {
                                                      ...prev.lessonBody,
                                                      displayCues: event.target.checked,
                                                    },
                                                  }
                                                : prev
                                            )
                                          }
                                          className="h-4 w-4 rounded border border-slate-300"
                                        />
                                        <span>Show cues section</span>
                                      </label>
                                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                                        <input
                                          type="checkbox"
                                          checked={editFormState.lessonBody.displayCommonMistakes}
                                          onChange={(event) =>
                                            setEditFormState((prev) =>
                                              prev?.lessonBody
                                                ? {
                                                    ...prev,
                                                    lessonBody: {
                                                      ...prev.lessonBody,
                                                      displayCommonMistakes: event.target.checked,
                                                    },
                                                  }
                                                : prev
                                            )
                                          }
                                          className="h-4 w-4 rounded border border-slate-300"
                                        />
                                        <span>Show common mistakes</span>
                                      </label>
                                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                                        <input
                                          type="checkbox"
                                          checked={editFormState.lessonBody.displayDrill}
                                          onChange={(event) =>
                                            setEditFormState((prev) =>
                                              prev?.lessonBody
                                                ? {
                                                    ...prev,
                                                    lessonBody: {
                                                      ...prev.lessonBody,
                                                      displayDrill: event.target.checked,
                                                    },
                                                  }
                                                : prev
                                            )
                                          }
                                          className="h-4 w-4 rounded border border-slate-300"
                                        />
                                        <span>Show drill section</span>
                                      </label>
                                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                                        <input
                                          type="checkbox"
                                          checked={editFormState.lessonBody.displayCheckpoint}
                                          onChange={(event) =>
                                            setEditFormState((prev) =>
                                              prev?.lessonBody
                                                ? {
                                                    ...prev,
                                                    lessonBody: {
                                                      ...prev.lessonBody,
                                                      displayCheckpoint: event.target.checked,
                                                    },
                                                  }
                                                : prev
                                            )
                                          }
                                          className="h-4 w-4 rounded border border-slate-300"
                                        />
                                        <span>Show pass criteria</span>
                                      </label>
                                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                                        <input
                                          type="checkbox"
                                          checked={editFormState.lessonBody.displayNextStep}
                                          onChange={(event) =>
                                            setEditFormState((prev) =>
                                              prev?.lessonBody
                                                ? {
                                                    ...prev,
                                                    lessonBody: {
                                                      ...prev.lessonBody,
                                                      displayNextStep: event.target.checked,
                                                    },
                                                  }
                                                : prev
                                            )
                                          }
                                          className="h-4 w-4 rounded border border-slate-300"
                                        />
                                        <span>Show next step</span>
                                      </label>
                                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                                        <input
                                          type="checkbox"
                                          checked={editFormState.lessonBody.displaySupport}
                                          onChange={(event) =>
                                            setEditFormState((prev) =>
                                              prev?.lessonBody
                                                ? {
                                                    ...prev,
                                                    lessonBody: {
                                                      ...prev.lessonBody,
                                                      displaySupport: event.target.checked,
                                                    },
                                                  }
                                                : prev
                                            )
                                          }
                                          className="h-4 w-4 rounded border border-slate-300"
                                        />
                                        <span>Show extra help card</span>
                                      </label>
                                    </div>
                                  </fieldset>

                                  <label className="space-y-1 text-xs font-medium text-slate-700">
                                    <span>Cues (one per line)</span>
                                    <textarea
                                      rows={4}
                                      value={editFormState.lessonBody.cues}
                                      onChange={(event) =>
                                        setEditFormState((prev) =>
                                          prev?.lessonBody
                                            ? {
                                                ...prev,
                                                lessonBody: {
                                                  ...prev.lessonBody,
                                                  cues: event.target.value,
                                                },
                                              }
                                            : prev
                                        )
                                      }
                                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                                      placeholder="One focus at a time"
                                    />
                                  </label>

                                  <label className="space-y-1 text-xs font-medium text-slate-700">
                                    <span>Common mistakes (one per line)</span>
                                    <textarea
                                      rows={4}
                                      value={editFormState.lessonBody.commonMistakes}
                                      onChange={(event) =>
                                        setEditFormState((prev) =>
                                          prev?.lessonBody
                                            ? {
                                                ...prev,
                                                lessonBody: {
                                                  ...prev.lessonBody,
                                                  commonMistakes: event.target.value,
                                                },
                                              }
                                            : prev
                                        )
                                      }
                                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                                    />
                                  </label>

                                  <label className="space-y-1 text-xs font-medium text-slate-700">
                                    <span>Drill title</span>
                                    <input
                                      type="text"
                                      value={editFormState.lessonBody.drillTitle}
                                      onChange={(event) =>
                                        setEditFormState((prev) =>
                                          prev?.lessonBody
                                            ? {
                                                ...prev,
                                                lessonBody: {
                                                  ...prev.lessonBody,
                                                  drillTitle: event.target.value,
                                                },
                                              }
                                            : prev
                                        )
                                      }
                                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                                    />
                                  </label>

                                  <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                                    <span>Drill steps (one per line)</span>
                                    <textarea
                                      rows={4}
                                      value={editFormState.lessonBody.drillSteps}
                                      onChange={(event) =>
                                        setEditFormState((prev) =>
                                          prev?.lessonBody
                                            ? {
                                                ...prev,
                                                lessonBody: {
                                                  ...prev.lessonBody,
                                                  drillSteps: event.target.value,
                                                },
                                              }
                                            : prev
                                        )
                                      }
                                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                                    />
                                  </label>

                                  <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                                    <span>Checkpoint criteria (one per line)</span>
                                    <textarea
                                      rows={3}
                                      value={editFormState.lessonBody.passCriteria}
                                      onChange={(event) =>
                                        setEditFormState((prev) =>
                                          prev?.lessonBody
                                            ? {
                                                ...prev,
                                                lessonBody: {
                                                  ...prev.lessonBody,
                                                  passCriteria: event.target.value,
                                                },
                                              }
                                            : prev
                                        )
                                      }
                                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                                      placeholder="Do not mark done before you can swim 12.5m relaxed."
                                    />
                                  </label>

                                  <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                                    <span>Next step</span>
                                    <textarea
                                      rows={3}
                                      value={editFormState.lessonBody.nextStep}
                                      onChange={(event) =>
                                        setEditFormState((prev) =>
                                          prev?.lessonBody
                                            ? {
                                                ...prev,
                                                lessonBody: {
                                                  ...prev.lessonBody,
                                                  nextStep: event.target.value,
                                                },
                                              }
                                            : prev
                                        )
                                      }
                                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                                    />
                                  </label>
                                </div>
                              </div>
                            ) : null}
                          </div>

                          {editNotesContext ? (
                            <AdminContextNotesPanel
                              contextType={editNotesContext.contextType}
                              contextRef={editNotesContext.contextRef}
                              contextLabel={editNotesContext.contextLabel}
                              includeModuleContextForCourseLesson={
                                editNotesContext.includeModuleContextForCourseLesson
                              }
                              collapsedByDefault={false}
                              className="mt-3"
                            />
                          ) : null}

                          {editQrContext ? (
                            <AdminContextQrPanel
                              contentItemId={editQrContext.contentItemId}
                              contentLabel={editQrContext.contentLabel}
                              slugHint={editQrContext.slugHint}
                              destinationPath={editQrContext.destinationPath}
                              placementKey={editQrContext.placementKey}
                              destinationHelpText={editQrContext.destinationHelpText}
                              className="mt-3"
                            />
                          ) : null}

                          {isEditDirty ? (
                            <AdminManagerState
                              tone="warning"
                              density="compact"
                              className="!mt-3"
                              testId="admin-content-edit-dirty-state"
                            >
                              You have unsaved changes.
                            </AdminManagerState>
                          ) : null}

                          {editError ? (
                            <AdminManagerState
                              tone="error"
                              announcement="polite"
                              density="compact"
                              className="!mt-3"
                              testId="admin-content-edit-error-state"
                            >
                              {editError}
                            </AdminManagerState>
                          ) : null}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => void handleSaveEdit(item)}
                              disabled={Boolean(rowBusy)}
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {savingEditId === item.id ? "Saving…" : "Save changes"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                closeEditMode();
                              }}
                              disabled={Boolean(rowBusy)}
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span className="text-xs text-slate-500">Order: {item.sort_order}</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleStartEdit(item);
                        }}
                        disabled={Boolean(rowBusy) || (Boolean(editingItemId) && !isEditingRow)}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-white px-3 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isEditingRow ? "Editing" : isInlineEditable ? "Edit" : "Edit (soon)"}
                      </button>
                      {!isEditingRow ? (
                        <>
                          {item.content_type === "course_module" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => void handleMoveModule(item.id, "up")}
                                disabled={Boolean(rowBusy) || !moduleMoveBounds?.canMoveUp}
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Move up
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleMoveModule(item.id, "down")}
                                disabled={Boolean(rowBusy) || !moduleMoveBounds?.canMoveDown}
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Move down
                              </button>
                            </>
                          ) : null}
                          {item.content_type === "course_lesson" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => void handleMoveLesson(item.id, "up")}
                                disabled={Boolean(rowBusy) || !lessonMoveBounds?.canMoveUp}
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Move up
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleMoveLesson(item.id, "down")}
                                disabled={Boolean(rowBusy) || !lessonMoveBounds?.canMoveDown}
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Move down
                              </button>
                            </>
                          ) : null}
                          {item.content_type === "course_lesson" ||
                          item.content_type === "course_module" ? (
                            rowPreviewHref ? (
                              <a
                                href={rowPreviewHref}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
                              >
                                Open preview
                              </a>
                            ) : (
                              <span className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-3 text-xs font-medium text-slate-500">
                                Open preview (no lessons)
                              </span>
                            )
                          ) : null}
                          {item.content_type === "course_lesson" ? (
                            <a
                              href={lessonQrPrefillHref(item)}
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 px-3 text-xs font-medium text-teal-800 transition hover:bg-teal-100"
                            >
                              Create QR link
                            </a>
                          ) : null}
                          {item.content_type === "course_lesson" ? (
                            <a
                              href={lessonOpenHref(item)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              Open lesson
                            </a>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => void handleToggleRevisions(item.id)}
                            disabled={Boolean(rowBusy)}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {openRevisionsItemId === item.id ? "Hide revisions" : "Revisions"}
                          </button>
                          {STATUS_OPTIONS.filter((option) => option.value !== item.status).map(
                            (option) => (
                              <button
                                key={`${item.id}-${option.value}`}
                                type="button"
                                onClick={() => void handleSetStatus(item, option.value)}
                                disabled={Boolean(rowBusy)}
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {updatingId === item.id
                                  ? "Saving…"
                                  : statusActionLabel(option.value)}
                              </button>
                            )
                          )}
                          <button
                            type="button"
                            onClick={() => void handleDelete(item)}
                            disabled={Boolean(rowBusy)}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === item.id ? "Deleting…" : "Delete"}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {openRevisionsItemId === item.id ? (
                    <div
                      className="mt-3 rounded-lg border border-slate-200 bg-white p-3"
                      data-testid="admin-content-revision-history-panel"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Revision history
                        </h4>
                      </div>
                      {isRevisionLoading ? (
                        <AdminManagerState tone="loading" density="compact" className="!mt-2">
                          Loading revisions…
                        </AdminManagerState>
                      ) : null}
                      {!isRevisionLoading && revisionError ? (
                        <AdminManagerState
                          tone="error"
                          density="compact"
                          className="!mt-2"
                          actionsClassName="mt-2 flex flex-wrap gap-2"
                          actions={
                            <button
                              type="button"
                              onClick={() => void loadRevisionsForItem(item.id, true)}
                              className="inline-flex h-7 items-center justify-center rounded-lg border border-rose-200 bg-white px-2 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                            >
                              Retry
                            </button>
                          }
                        >
                          {revisionError}
                        </AdminManagerState>
                      ) : null}
                      {!isRevisionLoading && !revisionError && revisionItems.length === 0 ? (
                        <AdminManagerState tone="empty" density="compact" className="!mt-2">
                          No revisions yet.
                        </AdminManagerState>
                      ) : null}
                      {!isRevisionLoading && !revisionError && revisionItems.length > 0 ? (
                        <ul className="mt-2 space-y-2">
                          {revisionItems.map((revision) => (
                            <li
                              key={revision.id}
                              data-testid="admin-content-revision-item"
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                            >
                              <div>
                                <p className="text-xs font-semibold text-slate-700">
                                  Rev {revision.revisionNumber} · {revision.action}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {revision.snapshotTitle} · {revision.snapshotStatus} ·{" "}
                                  {formatRevisionDate(revision.createdAt)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {revision.changedByEmail ?? "Unknown actor"}
                                </p>
                              </div>
                              {canRestoreByItemId[item.id] ? (
                                <button
                                  type="button"
                                  onClick={() => void handleRestoreRevision(item, revision.id)}
                                  disabled={
                                    Boolean(
                                      updatingId ||
                                      deletingId ||
                                      restoringRevisionId ||
                                      savingEditId
                                    ) || revision.action === "delete"
                                  }
                                  className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-white px-3 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {restoringRevisionId === revision.id ? "Restoring…" : "Restore"}
                                </button>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      {pendingModuleDelete
        ? (() => {
            const alternativeModules = moduleOptions.filter(
              (option) => option.id !== pendingModuleDelete.moduleId
            );
            const canReassign = alternativeModules.length > 0;
            const requiresTargetModule =
              pendingModuleDelete.lessonCount > 0 && pendingModuleDelete.strategy === "reassign";
            const deleteDisabled =
              moduleDeleteSubmitting ||
              (requiresTargetModule &&
                (!pendingModuleDelete.targetModuleId ||
                  pendingModuleDelete.targetModuleId === pendingModuleDelete.moduleId));

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-6">
                <div
                  className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
                  data-testid="admin-module-delete-dialog"
                >
                  <h3 className="text-base font-semibold text-slate-900">Delete module</h3>
                  <p className="mt-2 text-sm text-slate-700">
                    Delete <span className="font-semibold">{pendingModuleDelete.moduleTitle}</span>?
                    {pendingModuleDelete.lessonCount > 0
                      ? ` ${pendingModuleDelete.lessonCount} lesson${
                          pendingModuleDelete.lessonCount === 1 ? "" : "s"
                        } will be handled based on the strategy below.`
                      : " No lessons are currently linked to this module."}
                  </p>

                  {pendingModuleDelete.lessonCount > 0 ? (
                    <fieldset className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <legend className="px-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                        Lesson handling strategy
                      </legend>
                      <label className="flex items-start gap-2 text-sm text-slate-700">
                        <input
                          type="radio"
                          name="module-delete-strategy"
                          checked={pendingModuleDelete.strategy === "reassign"}
                          disabled={!canReassign || moduleDeleteSubmitting}
                          onChange={() =>
                            setPendingModuleDelete((previous) =>
                              previous
                                ? {
                                    ...previous,
                                    strategy: "reassign",
                                    targetModuleId:
                                      previous.targetModuleId || alternativeModules[0]?.id || "",
                                  }
                                : previous
                            )
                          }
                          className="mt-1 h-4 w-4 border border-slate-300"
                        />
                        <span>
                          Reassign lessons to another module
                          {!canReassign ? " (no target module available)" : ""}
                        </span>
                      </label>
                      <label className="flex items-start gap-2 text-sm text-slate-700">
                        <input
                          type="radio"
                          name="module-delete-strategy"
                          checked={pendingModuleDelete.strategy === "archive_lessons"}
                          disabled={moduleDeleteSubmitting}
                          onChange={() =>
                            setPendingModuleDelete((previous) =>
                              previous ? { ...previous, strategy: "archive_lessons" } : previous
                            )
                          }
                          className="mt-1 h-4 w-4 border border-slate-300"
                        />
                        <span>Archive lessons and unlink from module</span>
                      </label>
                      <label className="flex items-start gap-2 text-sm text-slate-700">
                        <input
                          type="radio"
                          name="module-delete-strategy"
                          checked={pendingModuleDelete.strategy === "unlink_lessons"}
                          disabled={moduleDeleteSubmitting}
                          onChange={() =>
                            setPendingModuleDelete((previous) =>
                              previous ? { ...previous, strategy: "unlink_lessons" } : previous
                            )
                          }
                          className="mt-1 h-4 w-4 border border-slate-300"
                        />
                        <span>Unlink lessons only (keep current status)</span>
                      </label>

                      {pendingModuleDelete.strategy === "reassign" ? (
                        <label className="mt-2 block space-y-1 text-xs font-medium text-slate-700">
                          <span>Target module</span>
                          <select
                            value={pendingModuleDelete.targetModuleId}
                            onChange={(event) =>
                              setPendingModuleDelete((previous) =>
                                previous
                                  ? {
                                      ...previous,
                                      targetModuleId: event.target.value,
                                    }
                                  : previous
                              )
                            }
                            disabled={!canReassign || moduleDeleteSubmitting}
                            data-testid="admin-module-delete-target-select"
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          >
                            <option value="">Select target module</option>
                            {alternativeModules.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                    </fieldset>
                  ) : null}

                  <div className="mt-5 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={clearModuleDeleteDialog}
                      disabled={moduleDeleteSubmitting}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void confirmModuleDelete()}
                      disabled={deleteDisabled}
                      data-testid="admin-module-delete-confirm"
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {moduleDeleteSubmitting ? "Deleting module…" : "Delete module"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()
        : null}

      {isAllContentView ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Create content item</h2>
          <p className="mt-2 text-sm text-slate-600">
            Create and stage content records for modules, lessons, guides, pages, and product copy.
          </p>
          {!schemaReady ? (
            <AdminManagerState
              tone="warning"
              className="!mt-3"
              testId="admin-content-create-schema-warning-state"
            >
              Setup is not ready yet. Apply latest admin schema migrations before creating content.
            </AdminManagerState>
          ) : null}
          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={handleCreate}
            data-testid="admin-content-create-form"
          >
            <fieldset
              disabled={!schemaReady || submitting}
              className="contents disabled:cursor-not-allowed disabled:opacity-70"
            >
              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>Type</span>
                <select
                  value={formState.contentType}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      contentType: e.target.value as AdminContentType,
                    }))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                >
                  {CONTENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>Status</span>
                <select
                  value={formState.status}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      status: e.target.value as AdminContentStatus,
                    }))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {formState.contentType === "course_lesson" ? (
                <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
                  <span>Parent module</span>
                  <select
                    value={formState.parentId}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        parentId: e.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value="">Select module</option>
                    {moduleOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs font-normal text-slate-500">
                    Lessons are now created with locked module context from the start. If you want a
                    different module, choose it here before saving.
                  </p>
                </label>
              ) : null}

              <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
                <span>Title</span>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  placeholder="Module 1 foundations"
                />
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
                <span>Slug (optional)</span>
                <input
                  type="text"
                  value={formState.slug}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  placeholder="module-1-foundations"
                />
                {formState.contentType === "course_module" ||
                formState.contentType === "course_lesson" ? (
                  <p className="text-xs font-normal text-slate-500">
                    Slug is the human-readable key and can be renamed later. Internal runtime IDs
                    are assigned separately and stay fixed after creation.
                  </p>
                ) : null}
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
                <span>Summary</span>
                <textarea
                  rows={3}
                  value={formState.summary}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      summary: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  placeholder="Short purpose or editor note."
                />
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
                <span>Category</span>
                <input
                  type="text"
                  list="admin-content-category-options"
                  value={formState.category}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  placeholder="General"
                />
                <datalist id="admin-content-category-options">
                  {categoryOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </label>

              {actionError ? (
                <AdminManagerState
                  tone="error"
                  announcement="polite"
                  density="compact"
                  className="!mt-0 sm:col-span-2"
                  testId="admin-content-action-error-state"
                >
                  {actionError}
                </AdminManagerState>
              ) : null}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={!schemaReady || submitting}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {submitting ? "Saving…" : "Save content item"}
                </button>
              </div>
            </fieldset>
          </form>
        </section>
      ) : null}
    </div>
  );
}
