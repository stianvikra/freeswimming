"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AdminContentItemRow,
  AdminContentStatus,
  AdminContentType,
} from "@/lib/admin/content";
import type { AdminCategoryRow } from "@/lib/admin/categories";

const CONTENT_TYPE_OPTIONS: Array<{ value: AdminContentType; label: string }> = [
  { value: "course_module", label: "Course module" },
  { value: "course_lesson", label: "Course lesson" },
  { value: "guide_session", label: "Guide session" },
  { value: "guide_drill", label: "Guide drill" },
  { value: "page", label: "Page" },
  { value: "product", label: "Product metadata" },
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

type MirrorMetric = {
  key: "course_module" | "course_lesson" | "guide_session" | "guide_drill" | "programs";
  label: string;
  platformCount: number;
  adminCount: number;
  delta: number;
  status: "matched" | "missing" | "extra" | "drift";
  coverage: {
    missingCount: number;
    extraCount: number;
    missingSamples: string[];
    extraSamples: string[];
  };
};

type MirrorSnapshot = {
  checkedAt: string;
  metrics: MirrorMetric[];
  summary: {
    matchedCount: number;
    mismatchCount: number;
    coverageMismatchCount: number;
  };
};

type AdminContentListResponse =
  | {
      ok: true;
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

type LessonBodyEditState = {
  lessonId: string;
  lessonType: LessonTypeOption;
  drillLabel: string;
  supportStartAtLessonInModule: string;
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
  sortOrder: number;
  parentId: string | null;
  moduleLabel: string | null;
  runtimeLessonId: string;
};

type ContentListFocusState = {
  source: "mirror" | "workspace";
  label: string;
  detail: string;
};

const WORKSPACE_ALL_MODULES_ID = "__all__";
const WORKSPACE_UNLINKED_MODULE_ID = "__unlinked__";
const LESSON_TYPE_OPTIONS: Array<{ value: LessonTypeOption; label: string }> = [
  { value: "", label: "Not set" },
  { value: "learn", label: "Learn" },
  { value: "drill", label: "Drill" },
  { value: "swim", label: "Swim" },
];

const INITIAL_FORM: FormState = {
  contentType: "course_module",
  title: "",
  slug: "",
  summary: "",
  category: "General",
  status: "draft",
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

function inferLessonIdFromSlug(slug: string): string {
  const match = slug.match(/course-lesson-(.+)$/i);
  if (match?.[1]) return match[1].trim();
  return slug.trim();
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

function toLessonBodyEditState(item: AdminContentItemRow): LessonBodyEditState {
  const lessonId = parseBodyString(item.body, "lessonId") ?? inferLessonIdFromSlug(item.slug);
  const drillBody = isRecord(item.body) && isRecord(item.body.drill) ? item.body.drill : null;
  const displayBody = isRecord(item.body) && isRecord(item.body.display) ? item.body.display : null;
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
  return {
    lessonId: value.lessonId.trim(),
    lessonType: value.lessonType,
    drillLabel: value.drillLabel.trim(),
    supportStartAtLessonInModule: (() => {
      const raw = value.supportStartAtLessonInModule.trim();
      if (!raw) return null;
      const parsed = Number.parseInt(raw, 10);
      return Number.isFinite(parsed) && parsed >= 1 ? parsed : Number.NaN;
    })(),
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

  nextBody.lessonId = normalized.lessonId;
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
  nextBody.nextStep = normalized.nextStep;
  if (normalized.passCriteria.length > 0) {
    nextBody.passCriteria = normalized.passCriteria;
  } else {
    delete nextBody.passCriteria;
  }

  return nextBody;
}

function lessonOpenHref(item: AdminContentItemRow): string {
  const lessonId = parseBodyString(item.body, "lessonId") ?? inferLessonIdFromSlug(item.slug);
  return `/course?lesson=${encodeURIComponent(lessonId)}`;
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
  const [revisionsLoadingItemId, setRevisionsLoadingItemId] = useState<string | null>(null);
  const [restoringRevisionId, setRestoringRevisionId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState<EditFormState | null>(null);
  const [editBaselineState, setEditBaselineState] = useState<EditFormState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [listQuery, setListQuery] = useState("");
  const [listTypeFilter, setListTypeFilter] = useState<"all" | AdminContentType>("all");
  const [listStatusFilter, setListStatusFilter] = useState<"all" | AdminContentStatus>("all");
  const [listSort, setListSort] = useState<ListSortOption>("default");
  const [listModuleFilter, setListModuleFilter] = useState("");
  const [listFocusState, setListFocusState] = useState<ContentListFocusState | null>(null);
  const [workspaceModuleId, setWorkspaceModuleId] = useState(WORKSPACE_ALL_MODULES_ID);

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
          sortOrder: item.sort_order,
          parentId: item.parent_id,
          moduleLabel: item.parent_id ? (moduleLabelById.get(item.parent_id) ?? null) : null,
          runtimeLessonId:
            parseBodyString(item.body, "lessonId") ?? inferLessonIdFromSlug(item.slug),
        })),
    [items, moduleLabelById]
  );

  const unlinkedLessonCount = useMemo(
    () =>
      courseLessonWorkspaceItems.filter((item) => !item.parentId || !moduleIdSet.has(item.parentId))
        .length,
    [courseLessonWorkspaceItems, moduleIdSet]
  );

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

  const filteredItems = useMemo(() => {
    const normalizedQuery = listQuery.trim().toLowerCase();
    return items.filter((item) => {
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
  }, [items, listModuleFilter, listQuery, listStatusFilter, listTypeFilter, moduleIdSet]);

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
        setSchemaReady(true);
        setMirror(null);
        return;
      }
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
      setSchemaReady(true);
      setMirror(null);
      setCategoryOptions([]);
    } finally {
      setLoading(false);
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
    setListTypeFilter("all");
    setListStatusFilter("all");
    setListSort("default");
    setListModuleFilter("");
    setWorkspaceModuleId(WORKSPACE_ALL_MODULES_ID);
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

  function handleWorkspaceEditLesson(itemId: string) {
    const lessonItem = items.find(
      (item) => item.id === itemId && item.content_type === "course_lesson"
    );
    if (!lessonItem) return;
    handleStartEdit(lessonItem);
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
    scrollToContentRow(itemId);
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
      if (normalizedBody.lessonId.length < 2 || normalizedBody.lessonId.length > 120) {
        return "Lesson id must be between 2 and 120 characters.";
      }
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
      closeEditMode(true);
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
      setActionNotice("Content item updated.");
      closeEditMode(true);
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
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          contentType: formState.contentType,
          title: formState.title,
          slug: formState.slug,
          summary: formState.summary,
          category: formState.category,
          status: formState.status,
        }),
      });

      const payload = (await response.json()) as AdminContentCreateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not create content item."
            : (payload.error ?? "Could not create content item.")
        );
        return;
      }

      setItems((prev) => [payload.item, ...prev]);
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

  function rowContextHint(item: AdminContentItemRow): string | null {
    if (item.content_type === "course_module") {
      return `Module ${item.sort_order + 1}`;
    }

    if (item.content_type === "course_lesson") {
      const parentLabel = item.parent_id ? moduleLabelById.get(item.parent_id) : null;
      const runtimeLessonId =
        parseBodyString(item.body, "lessonId") ?? inferLessonIdFromSlug(item.slug);
      return parentLabel
        ? `Parent: ${parentLabel} · Lesson id: ${runtimeLessonId}`
        : `Parent module not linked · Lesson id: ${runtimeLessonId}`;
    }

    if (item.content_type === "guide_session") {
      const weekNumber = parseBodyNumber(item.body, "weekNumber");
      const sessionId = parseBodyString(item.body, "sessionId");
      if (weekNumber) return `Week ${weekNumber}${sessionId ? ` · ${sessionId}` : ""}`;
      if (sessionId) return sessionId;
      return `Session ${item.sort_order + 1}`;
    }

    if (item.content_type === "guide_drill") {
      const drillId = parseBodyString(item.body, "drillId");
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
    if (!force && revisionsByItemId[itemId]) {
      return true;
    }

    setRevisionsLoadingItemId(itemId);
    setActionError(null);
    try {
      const response = await fetch(`/api/admin/content/${itemId}/revisions`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminContentRevisionsResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not load revision history."
            : (payload.error ?? "Could not load revision history.")
        );
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
      return true;
    } catch {
      setActionError("Could not load revision history.");
      return false;
    } finally {
      setRevisionsLoadingItemId(null);
    }
  }

  async function handleToggleRevisions(itemId: string) {
    if (openRevisionsItemId === itemId) {
      setOpenRevisionsItemId(null);
      return;
    }

    const loaded = await loadRevisionsForItem(itemId);
    if (!loaded) return;

    setOpenRevisionsItemId(itemId);
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

  return (
    <div className="space-y-6" data-testid="admin-content-manager">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="admin-content-list-anchor" className="text-lg font-semibold text-slate-900">
              Content items
            </h2>
            <p className="mt-2 text-sm text-slate-600">{groupedCountLabel}</p>
            {filteredCountLabel ? (
              <p className="mt-1 text-xs text-slate-500">{filteredCountLabel}</p>
            ) : null}
            {moduleScopeLabel ? (
              <p className="mt-1 text-xs font-medium text-blue-700">{moduleScopeLabel}</p>
            ) : null}
          </div>
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
              <option value="all">All types</option>
              {CONTENT_TYPE_OPTIONS.map((option) => (
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
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="admin-content-type-chip-all"
            onClick={() => handleManualTypeFilterChange("all")}
            className={[
              "inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium transition",
              listTypeFilter === "all"
                ? "border-blue-300 bg-blue-50 text-blue-800"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            All ({typeCounts.all})
          </button>
          {CONTENT_TYPE_OPTIONS.map((option) => (
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
              {option.label} ({typeCounts[option.value]})
            </button>
          ))}
        </div>

        {listFocusState ? (
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
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {warning}
          </p>
        ) : null}

        {schemaReady && mirror ? (
          <article className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
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
              </p>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {mirror.metrics.map((metric) => (
                <li key={metric.key}>
                  <button
                    type="button"
                    data-testid={`admin-mirror-metric-${metric.key}`}
                    onClick={() => handleMirrorMetricFocus(metric)}
                    className={[
                      "w-full rounded-lg border px-3 py-2 text-left text-xs transition hover:brightness-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                      metric.status === "matched"
                        ? "border-emerald-200 bg-emerald-50/70 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-900",
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
                    <p className="mt-2 text-[11px] font-medium opacity-80">
                      Click to focus content list
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Snapshot checks current platform modules/lessons/guides/products against admin
              records.
            </p>
          </article>
        ) : null}

        {schemaReady && courseLessonWorkspaceItems.length > 0 ? (
          <article
            className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4"
            data-testid="admin-course-lesson-workspace"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Module -&gt; lessons workspace
              </h3>
              <p className="text-xs text-slate-500">
                {courseLessonWorkspaceItems.length} lesson
                {courseLessonWorkspaceItems.length === 1 ? "" : "s"} ready for edit
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Pick a module scope to sync workspace and list view, then jump straight to row edit or
              open the public lesson page.
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="space-y-1 text-xs font-medium text-slate-700">
                <span>Module workspace</span>
                <select
                  value={workspaceModuleId}
                  onChange={(event) => handleWorkspaceScopeChange(event.target.value)}
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
            </div>

            {workspaceLessons.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-600">
                No lessons in this module yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {workspaceLessons.map((lesson, index) => (
                  <li
                    key={lesson.id}
                    data-testid="admin-workspace-lesson-row"
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="min-w-[220px]">
                      <p className="text-sm font-semibold text-slate-900">
                        Lesson {index + 1}: {lesson.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {lesson.moduleLabel ?? "Unlinked module"} · /{lesson.slug} · id:{" "}
                        {lesson.runtimeLessonId}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleWorkspaceEditLesson(lesson.id)}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-100"
                      >
                        Edit lesson
                      </button>
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
                ))}
              </ul>
            )}
          </article>
        ) : null}

        {loading ? (
          <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Loading content list…
          </p>
        ) : null}

        {!loading && error ? (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-sm font-medium text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => void loadItems()}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
            >
              Retry
            </button>
          </div>
        ) : null}

        {actionNotice ? (
          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {actionNotice}
          </p>
        ) : null}

        {!loading && !error && schemaReady && items.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No content items created yet. Use the form below to create your first draft.
          </p>
        ) : null}

        {!loading && !error && items.length > 0 && sortedItems.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No content items match current search/filter.
          </p>
        ) : null}

        {!loading && !error && sortedItems.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {sortedItems.map((item) => {
              const isEditingRow = editingItemId === item.id;
              const isInlineEditable = canEditInline(item);
              const rowBusy = Boolean(
                updatingId || deletingId || restoringRevisionId || savingEditId
              );
              const rowTypeLabel = CONTENT_TYPE_LABEL[item.content_type];
              const rowHint = rowContextHint(item);

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
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                  Lesson body editor
                                </h4>
                                <p className="mt-1 text-xs text-slate-500">
                                  This controls what appears in the lesson page (goal, cues, drill,
                                  checkpoint criteria, next step, support card, and section label).
                                </p>

                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                  <label className="space-y-1 text-xs font-medium text-slate-700">
                                    <span>Lesson id (for open lesson link)</span>
                                    <input
                                      type="text"
                                      value={editFormState.lessonBody.lessonId}
                                      onChange={(event) =>
                                        setEditFormState((prev) =>
                                          prev?.lessonBody
                                            ? {
                                                ...prev,
                                                lessonBody: {
                                                  ...prev.lessonBody,
                                                  lessonId: event.target.value,
                                                },
                                              }
                                            : prev
                                        )
                                      }
                                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                                    />
                                  </label>

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
                                    <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
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

                          {isEditDirty ? (
                            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                              You have unsaved changes.
                            </p>
                          ) : null}

                          {editError ? (
                            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                              {editError}
                            </p>
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
                                disabled={Boolean(updatingId || deletingId || savingEditId)}
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
                            disabled={Boolean(updatingId || deletingId || savingEditId)}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === item.id ? "Deleting…" : "Delete"}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {openRevisionsItemId === item.id ? (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Revision history
                      </h4>
                      {revisionsLoadingItemId === item.id ? (
                        <p className="mt-2 text-xs text-slate-500">Loading revisions…</p>
                      ) : null}
                      {revisionsLoadingItemId !== item.id &&
                      (revisionsByItemId[item.id] ?? []).length === 0 ? (
                        <p className="mt-2 text-xs text-slate-500">No revisions yet.</p>
                      ) : null}
                      {revisionsLoadingItemId !== item.id &&
                      (revisionsByItemId[item.id] ?? []).length > 0 ? (
                        <ul className="mt-2 space-y-2">
                          {(revisionsByItemId[item.id] ?? []).map((revision) => (
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Create content item</h2>
        <p className="mt-2 text-sm text-slate-600">
          Create and stage content records for modules, lessons, guides, pages, and product copy.
        </p>
        {!schemaReady ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Setup is not ready yet. Apply latest admin schema migrations before creating content.
          </p>
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
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
                {actionError}
              </p>
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
    </div>
  );
}
