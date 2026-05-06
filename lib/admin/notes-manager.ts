import {
  buildAdminNoteContextCatalog,
  resolveAdminNoteContextLabel,
  type AdminNoteContextCatalog,
} from "@/lib/admin/note-context-catalog";
import {
  ADMIN_NOTE_CONTEXT_TYPE_VALUES,
  isAdminNoteContextType,
  type AdminNoteContextType,
} from "@/lib/admin/note-context";
import type { AdminCategoryRow } from "@/lib/admin/categories";
import type { AdminContentItemRow } from "@/lib/admin/content";
import {
  isAdminNotePriority,
  type AdminNoteItem,
  type AdminNotePriority,
  type IncidentNoteSeverity,
} from "@/lib/admin/notes";

type SearchParamsLike = {
  get(name: string): string | null;
};

export const ADMIN_NOTES_STATUS_FILTER_VALUES = ["open", "done", "all"] as const;
export type AdminNotesStatusFilter = (typeof ADMIN_NOTES_STATUS_FILTER_VALUES)[number];

export type AdminNotesFilterState = {
  query: string;
  status: AdminNotesStatusFilter;
  category: string;
  priority: AdminNotePriority | "";
  contextType: AdminNoteContextType | "";
  contextRef: string;
};

export type AdminNotesContextRefOption = {
  value: string;
  label: string;
  contextType: AdminNoteContextType;
};

export type AdminNotesResponse =
  | {
      ok: true;
      items: AdminNoteItem[];
      schemaReady?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
    };

export type AdminNoteCreateResponse =
  | {
      ok: true;
      item: AdminNoteItem;
    }
  | {
      ok: false;
      error?: string;
    };

export type AdminNoteUpdateResponse =
  | {
      ok: true;
      item: AdminNoteItem | null;
    }
  | {
      ok: false;
      error?: string;
    };

export type AdminNoteDeleteResponse =
  | {
      ok: true;
      id: string;
    }
  | {
      ok: false;
      error?: string;
    };

export type AdminCategoriesResponse =
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

export type AdminContentResponse =
  | {
      ok: true;
      items: AdminContentItemRow[];
    }
  | {
      ok: false;
      error?: string;
    };

export type AdminProductRow = {
  slug: string;
  title: string;
  active: boolean;
};

export type AdminProductsResponse =
  | {
      ok: true;
      items: AdminProductRow[];
    }
  | {
      ok: false;
      error?: string;
    };

export type AdminNoteFormState = {
  title: string;
  category: string;
  noteDate: string;
  priority: AdminNotePriority;
  body: string;
  isDone: boolean;
  contextType: AdminNoteContextType | "";
  contextRef: string;
  contextModuleRef: string;
};

export type AdminNoteCreateCaptureRecovery = {
  id: string;
  title: string;
};

export const ADMIN_NOTES_QUERY_KEYS = {
  query: "notesQuery",
  status: "notesStatus",
  category: "notesCategory",
  priority: "notesPriority",
  contextType: "notesContextType",
  contextRef: "notesContextRef",
} as const;

export const DEFAULT_ADMIN_NOTES_FILTER_STATE: AdminNotesFilterState = {
  query: "",
  status: "open",
  category: "",
  priority: "",
  contextType: "",
  contextRef: "",
};

export const ADMIN_NOTES_CONTEXT_TYPE_OPTIONS: Array<{
  value: AdminNoteContextType;
  label: string;
}> = [
  { value: "course_module", label: "Course module" },
  { value: "course_lesson", label: "Course lesson" },
  { value: "guide_session", label: "0-1000 session" },
  { value: "guide_drill", label: "Poolside drill" },
  { value: "product", label: "Product page" },
  { value: "page", label: "Website page" },
];

export const EMPTY_ADMIN_NOTE_CONTEXT_CATALOG: AdminNoteContextCatalog =
  buildAdminNoteContextCatalog({
    contentItems: [],
    products: [],
  });

export function getTodayAdminNoteDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTodayAdminNoteDateLabel(): string {
  return new Intl.DateTimeFormat("nb-NO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date());
}

export function formatAdminNoteImageCountLabel(count: number): string {
  return `${count} image${count === 1 ? "" : "s"}`;
}

export const INITIAL_ADMIN_NOTE_FORM_STATE: AdminNoteFormState = {
  title: "",
  category: "General",
  noteDate: getTodayAdminNoteDateInputValue(),
  priority: "normal",
  body: "",
  isDone: false,
  contextType: "",
  contextRef: "",
  contextModuleRef: "",
};

export function formatAdminNoteDateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("nb-NO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function toAdminNoteFormState(note: AdminNoteItem): AdminNoteFormState {
  return {
    title: note.title,
    category: note.category,
    noteDate: note.note_date,
    priority: note.priority,
    body: note.body,
    isDone: note.is_done,
    contextType:
      note.context_type &&
      ADMIN_NOTE_CONTEXT_TYPE_VALUES.includes(note.context_type as AdminNoteContextType)
        ? (note.context_type as AdminNoteContextType)
        : "",
    contextRef: note.context_ref ?? "",
    contextModuleRef: "",
  };
}

export function formatAdminNotePriorityLabel(priority: AdminNotePriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function getAdminNotePriorityBadgeClasses(priority: AdminNotePriority): string {
  switch (priority) {
    case "urgent":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "high":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "normal":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "low":
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export function hasPartialAdminNoteContextSelection(
  contextType: string,
  contextRef: string
): boolean {
  const hasType = contextType.trim().length > 0;
  const hasRef = contextRef.trim().length > 0;
  return (hasType && !hasRef) || (!hasType && hasRef);
}

export function normalizeAdminNoteContextRef(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export function areAdminNotesFilterStatesEqual(
  left: AdminNotesFilterState,
  right: AdminNotesFilterState
): boolean {
  return (
    left.query === right.query &&
    left.status === right.status &&
    left.category === right.category &&
    left.priority === right.priority &&
    left.contextType === right.contextType &&
    left.contextRef === right.contextRef
  );
}

export const ADMIN_INCIDENT_SEVERITY_GUIDANCE: Record<IncidentNoteSeverity, string> = {
  P0: "Critical outage or unsafe behavior. Core actions are blocked or data is at risk.",
  P1: "Major degradation with workaround. Core work is still possible, but unreliable.",
  P2: "Non-critical bug or UX defect. Low operational impact and no core outage.",
};

function normalizeText(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim();
}

function normalizeLowerText(value: string | null | undefined): string {
  return normalizeText(value).toLowerCase();
}

function normalizeContextRef(value: string | null | undefined): string {
  return normalizeLowerText(value);
}

export function parseAdminNotesStatusFilter(
  value: string | null | undefined
): AdminNotesStatusFilter {
  if (!value) return DEFAULT_ADMIN_NOTES_FILTER_STATE.status;
  return ADMIN_NOTES_STATUS_FILTER_VALUES.includes(value as AdminNotesStatusFilter)
    ? (value as AdminNotesStatusFilter)
    : DEFAULT_ADMIN_NOTES_FILTER_STATE.status;
}

export function parseAdminNotesFilterState(searchParams: SearchParamsLike): AdminNotesFilterState {
  const rawContextType = normalizeLowerText(searchParams.get(ADMIN_NOTES_QUERY_KEYS.contextType));
  const contextType = ADMIN_NOTE_CONTEXT_TYPE_VALUES.includes(
    rawContextType as AdminNoteContextType
  )
    ? (rawContextType as AdminNoteContextType)
    : "";
  const rawPriority = normalizeLowerText(searchParams.get(ADMIN_NOTES_QUERY_KEYS.priority));
  const priority = isAdminNotePriority(rawPriority) ? rawPriority : "";

  const contextRef = normalizeContextRef(searchParams.get(ADMIN_NOTES_QUERY_KEYS.contextRef));

  return {
    query: normalizeText(searchParams.get(ADMIN_NOTES_QUERY_KEYS.query)),
    status: parseAdminNotesStatusFilter(searchParams.get(ADMIN_NOTES_QUERY_KEYS.status)),
    category: normalizeText(searchParams.get(ADMIN_NOTES_QUERY_KEYS.category)),
    priority,
    contextType,
    contextRef: contextType ? contextRef : "",
  };
}

export function applyAdminNotesFilterStateToSearchParams(
  params: URLSearchParams,
  state: AdminNotesFilterState
): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  const normalizedQuery = normalizeText(state.query);
  const normalizedCategory = normalizeText(state.category);
  const normalizedContextRef = normalizeContextRef(state.contextRef);
  const normalizedPriority = normalizeLowerText(state.priority);

  if (normalizedQuery) {
    next.set(ADMIN_NOTES_QUERY_KEYS.query, normalizedQuery);
  } else {
    next.delete(ADMIN_NOTES_QUERY_KEYS.query);
  }

  if (state.status !== DEFAULT_ADMIN_NOTES_FILTER_STATE.status) {
    next.set(ADMIN_NOTES_QUERY_KEYS.status, state.status);
  } else {
    next.delete(ADMIN_NOTES_QUERY_KEYS.status);
  }

  if (normalizedCategory) {
    next.set(ADMIN_NOTES_QUERY_KEYS.category, normalizedCategory);
  } else {
    next.delete(ADMIN_NOTES_QUERY_KEYS.category);
  }

  if (normalizedPriority) {
    next.set(ADMIN_NOTES_QUERY_KEYS.priority, normalizedPriority);
  } else {
    next.delete(ADMIN_NOTES_QUERY_KEYS.priority);
  }

  if (state.contextType) {
    next.set(ADMIN_NOTES_QUERY_KEYS.contextType, state.contextType);
  } else {
    next.delete(ADMIN_NOTES_QUERY_KEYS.contextType);
  }

  if (state.contextType && normalizedContextRef) {
    next.set(ADMIN_NOTES_QUERY_KEYS.contextRef, normalizedContextRef);
  } else {
    next.delete(ADMIN_NOTES_QUERY_KEYS.contextRef);
  }

  return next;
}

export function buildAdminNoteReferenceLabel(noteId: string): string {
  return `Note ID ${noteId}`;
}

export function buildAdminNoteRelatedJumpFilterState(params: {
  noteId: string;
  isDone: boolean;
}): AdminNotesFilterState {
  return {
    ...DEFAULT_ADMIN_NOTES_FILTER_STATE,
    query: params.noteId,
    status: params.isDone ? "done" : "open",
  };
}

export function buildAdminNoteContextFilterLabel(params: {
  catalog: Pick<AdminNoteContextCatalog, "labelsByContextKey">;
  contextType: AdminNoteContextType;
  contextRef: string;
}): string {
  const normalizedContextRef = normalizeContextRef(params.contextRef);
  const contextLabel =
    resolveAdminNoteContextLabel({
      catalog: params.catalog,
      contextType: params.contextType,
      contextRef: normalizedContextRef,
    }) ?? `${params.contextType}: ${normalizedContextRef}`;

  if (contextLabel.toLowerCase().includes(normalizedContextRef)) {
    return contextLabel;
  }

  return `${contextLabel} (${normalizedContextRef})`;
}

function buildAdminNoteSearchIndex(params: {
  item: AdminNoteItem;
  catalog: Pick<AdminNoteContextCatalog, "labelsByContextKey">;
}): string {
  const contextLabel =
    params.item.context_type &&
    isAdminNoteContextType(params.item.context_type) &&
    params.item.context_ref
      ? buildAdminNoteContextFilterLabel({
          catalog: params.catalog,
          contextType: params.item.context_type,
          contextRef: params.item.context_ref,
        })
      : "";

  return [
    params.item.id,
    params.item.title,
    params.item.body,
    params.item.category,
    params.item.priority,
    params.item.context_type,
    params.item.context_ref,
    contextLabel,
    ...params.item.attachments.map((attachment) => attachment.file_name),
    ...params.item.related_notes.flatMap((note) => [note.id, note.title]),
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
}

export function buildAdminNotesCounts(items: AdminNoteItem[]): {
  open: number;
  done: number;
  all: number;
} {
  const done = items.filter((item) => item.is_done).length;
  return {
    open: items.length - done,
    done,
    all: items.length,
  };
}

export function filterAdminNotes(params: {
  items: AdminNoteItem[];
  filters: AdminNotesFilterState;
  catalog: Pick<AdminNoteContextCatalog, "labelsByContextKey">;
}): AdminNoteItem[] {
  const normalizedQuery = normalizeLowerText(params.filters.query);
  const normalizedCategory = normalizeLowerText(params.filters.category);
  const normalizedContextRef = normalizeContextRef(params.filters.contextRef);

  const filteredByStructuredFilters = params.items.filter((item) => {
    if (params.filters.status === "open" && item.is_done) return false;
    if (params.filters.status === "done" && !item.is_done) return false;

    if (normalizedCategory && normalizeLowerText(item.category) !== normalizedCategory) {
      return false;
    }

    if (params.filters.priority && item.priority !== params.filters.priority) {
      return false;
    }

    if (params.filters.contextType && item.context_type !== params.filters.contextType) {
      return false;
    }

    if (normalizedContextRef && normalizeContextRef(item.context_ref) !== normalizedContextRef) {
      return false;
    }

    return true;
  });

  if (!normalizedQuery) {
    return filteredByStructuredFilters;
  }

  const exactIdMatches = filteredByStructuredFilters.filter(
    (item) => normalizeLowerText(item.id) === normalizedQuery
  );
  if (exactIdMatches.length > 0) {
    return exactIdMatches;
  }

  return filteredByStructuredFilters.filter((item) =>
    buildAdminNoteSearchIndex({
      item,
      catalog: params.catalog,
    }).includes(normalizedQuery)
  );
}

export function buildAdminNotesContextRefOptions(params: {
  items: AdminNoteItem[];
  catalog: Pick<AdminNoteContextCatalog, "labelsByContextKey">;
  contextType: AdminNoteContextType | "";
}): AdminNotesContextRefOption[] {
  const options = new Map<string, AdminNotesContextRefOption>();

  for (const item of params.items) {
    if (!item.context_type || !item.context_ref) continue;
    if (!isAdminNoteContextType(item.context_type)) continue;
    if (params.contextType && item.context_type !== params.contextType) continue;

    const normalizedContextRef = normalizeContextRef(item.context_ref);
    const key = `${item.context_type}:${normalizedContextRef}`;
    if (options.has(key)) continue;

    options.set(key, {
      value: normalizedContextRef,
      contextType: item.context_type,
      label: buildAdminNoteContextFilterLabel({
        catalog: params.catalog,
        contextType: item.context_type,
        contextRef: normalizedContextRef,
      }),
    });
  }

  return [...options.values()].sort((left, right) =>
    left.label.localeCompare(right.label, "nb-NO")
  );
}
