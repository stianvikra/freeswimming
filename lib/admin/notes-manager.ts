import {
  resolveAdminNoteContextLabel,
  type AdminNoteContextCatalog,
} from "@/lib/admin/note-context-catalog";
import {
  ADMIN_NOTE_CONTEXT_TYPE_VALUES,
  isAdminNoteContextType,
  type AdminNoteContextType,
} from "@/lib/admin/note-context";
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
