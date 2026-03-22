"use client";

import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ADMIN_NOTE_CONTEXT_TYPE_VALUES,
  type AdminNoteContextType,
} from "@/lib/admin/note-context";
import {
  buildAdminNoteContextCatalog,
  resolveAdminNoteContextLabel,
  type AdminNoteContextCatalog,
} from "@/lib/admin/note-context-catalog";
import type { AdminCategoryRow } from "@/lib/admin/categories";
import type { AdminContentItemRow } from "@/lib/admin/content";
import {
  ADMIN_INCIDENT_SEVERITY_GUIDANCE,
  DEFAULT_ADMIN_NOTES_FILTER_STATE,
  applyAdminNotesFilterStateToSearchParams,
  buildAdminNoteReferenceLabel,
  buildAdminNotesContextRefOptions,
  buildAdminNotesCounts,
  filterAdminNotes,
  parseAdminNotesFilterState,
  type AdminNotesStatusFilter,
} from "@/lib/admin/notes-manager";
import {
  ADMIN_INCIDENT_NOTE_CATEGORY_BY_SEVERITY,
  ADMIN_INCIDENT_NOTE_CATEGORY_OPTIONS,
  ADMIN_NOTE_PRIORITY_VALUES,
  INCIDENT_NOTE_SEVERITIES,
  buildIncidentNoteBodyTemplate,
  sortAdminNotesByPriorityAndNewest,
  type AdminNoteItem,
  type AdminNotePriority,
  type IncidentNoteSeverity,
} from "@/lib/admin/notes";

type AdminNotesResponse =
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

type AdminNoteCreateResponse =
  | {
      ok: true;
      item: AdminNoteItem;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminNoteUpdateResponse =
  | {
      ok: true;
      item: AdminNoteItem | null;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminNoteDeleteResponse =
  | {
      ok: true;
      id: string;
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

type AdminContentResponse =
  | {
      ok: true;
      items: AdminContentItemRow[];
    }
  | {
      ok: false;
      error?: string;
    };

type AdminProductRow = {
  slug: string;
  title: string;
  active: boolean;
};

type AdminProductsResponse =
  | {
      ok: true;
      items: AdminProductRow[];
    }
  | {
      ok: false;
      error?: string;
    };

type FormState = {
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

function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function todayDateLabel(): string {
  return new Intl.DateTimeFormat("nb-NO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date());
}

const INITIAL_FORM: FormState = {
  title: "",
  category: "General",
  noteDate: todayDateInputValue(),
  priority: "normal",
  body: "",
  isDone: false,
  contextType: "",
  contextRef: "",
  contextModuleRef: "",
};

const CONTEXT_TYPE_OPTIONS: Array<{ value: AdminNoteContextType; label: string }> = [
  { value: "course_module", label: "Course module" },
  { value: "course_lesson", label: "Course lesson" },
  { value: "guide_session", label: "0-1000 session" },
  { value: "guide_drill", label: "Poolside drill" },
  { value: "product", label: "Product page" },
  { value: "page", label: "Website page" },
];

const EMPTY_CONTEXT_CATALOG: AdminNoteContextCatalog = buildAdminNoteContextCatalog({
  contentItems: [],
  products: [],
});

function formatDateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("nb-NO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function toFormState(note: AdminNoteItem): FormState {
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

function formatPriorityLabel(priority: AdminNotePriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function priorityBadgeClasses(priority: AdminNotePriority): string {
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

function formatAttachmentSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  const sizeKb = sizeBytes / 1024;
  if (sizeKb < 1024) return `${sizeKb.toFixed(1)} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
}

function hasPartialContextSelection(contextType: string, contextRef: string): boolean {
  const hasType = contextType.trim().length > 0;
  const hasRef = contextRef.trim().length > 0;
  return (hasType && !hasRef) || (!hasType && hasRef);
}

function normalizeContextRef(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export default function AdminNotesManager() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<AdminNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [contextCatalog, setContextCatalog] =
    useState<AdminNoteContextCatalog>(EMPTY_CONTEXT_CATALOG);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<FormState | null>(null);
  const [uploadingNoteId, setUploadingNoteId] = useState<string | null>(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);
  const [linkingNoteId, setLinkingNoteId] = useState<string | null>(null);
  const [unlinkingKey, setUnlinkingKey] = useState<string | null>(null);
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>({});

  function sortNoteItems(nextItems: AdminNoteItem[]): AdminNoteItem[] {
    return [...nextItems].sort(sortAdminNotesByPriorityAndNewest);
  }

  const loadContextCatalog = useCallback(async () => {
    try {
      const [contentResponse, productsResponse] = await Promise.all([
        fetch("/api/admin/content", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }),
        fetch("/api/admin/products", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }),
      ]);

      const contentPayload = (await contentResponse.json()) as AdminContentResponse;
      const productsPayload = (await productsResponse.json()) as AdminProductsResponse;

      if (
        !contentResponse.ok ||
        !contentPayload.ok ||
        !productsResponse.ok ||
        !productsPayload.ok
      ) {
        setContextCatalog(EMPTY_CONTEXT_CATALOG);
        return;
      }

      setContextCatalog(
        buildAdminNoteContextCatalog({
          contentItems: contentPayload.items,
          products: productsPayload.items,
        })
      );
    } catch {
      setContextCatalog(EMPTY_CONTEXT_CATALOG);
    }
  }, []);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWarning(null);
    setEditingId(null);
    setEditState(null);
    try {
      const response = await fetch("/api/admin/notes", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminNotesResponse;
      if (!response.ok || !payload.ok) {
        setError(payload.ok ? "Could not load notes." : (payload.error ?? "Could not load notes."));
        setItems([]);
        setSchemaReady(true);
        return;
      }

      setItems(sortNoteItems(payload.items));
      setSchemaReady(payload.schemaReady !== false);
      setWarning(payload.warning ?? null);

      const categoriesResponse = await fetch("/api/admin/categories/notes", {
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

      await loadContextCatalog();
    } catch {
      setError("Could not load notes.");
      setItems([]);
      setSchemaReady(true);
      setContextCatalog(EMPTY_CONTEXT_CATALOG);
      setCategoryOptions([]);
    } finally {
      setLoading(false);
    }
  }, [loadContextCatalog]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const notesFilters = useMemo(() => parseAdminNotesFilterState(searchParams), [searchParams]);
  const deferredQuery = useDeferredValue(notesFilters.query);
  const effectiveNotesFilters = useMemo(
    () =>
      deferredQuery === notesFilters.query
        ? notesFilters
        : { ...notesFilters, query: deferredQuery },
    [deferredQuery, notesFilters]
  );
  const noteCounts = useMemo(() => buildAdminNotesCounts(items), [items]);

  const noteSummary = useMemo(() => {
    if (items.length === 0) return "No notes yet.";
    return `${noteCounts.open} open · ${noteCounts.done} done archive`;
  }, [items.length, noteCounts.done, noteCounts.open]);

  const suggestedCategoryOptions = useMemo(() => {
    return [
      ...categoryOptions,
      ...items.map((item) => item.category),
      ...ADMIN_INCIDENT_NOTE_CATEGORY_OPTIONS,
    ]
      .map((entry) => entry.trim())
      .filter(Boolean)
      .filter((entry, index, all) => all.indexOf(entry) === index)
      .sort((left, right) => left.localeCompare(right, "nb-NO"));
  }, [categoryOptions, items]);

  const contextRefOptions = useMemo(
    () =>
      buildAdminNotesContextRefOptions({
        items,
        catalog: contextCatalog,
        contextType: notesFilters.contextType,
      }),
    [contextCatalog, items, notesFilters.contextType]
  );

  const filteredItems = useMemo(
    () =>
      filterAdminNotes({
        items,
        filters: effectiveNotesFilters,
        catalog: contextCatalog,
      }),
    [contextCatalog, effectiveNotesFilters, items]
  );

  const hasActiveFilters =
    notesFilters.query !== DEFAULT_ADMIN_NOTES_FILTER_STATE.query ||
    notesFilters.status !== DEFAULT_ADMIN_NOTES_FILTER_STATE.status ||
    notesFilters.category !== DEFAULT_ADMIN_NOTES_FILTER_STATE.category ||
    notesFilters.priority !== DEFAULT_ADMIN_NOTES_FILTER_STATE.priority ||
    notesFilters.contextType !== DEFAULT_ADMIN_NOTES_FILTER_STATE.contextType ||
    notesFilters.contextRef !== DEFAULT_ADMIN_NOTES_FILTER_STATE.contextRef;

  function updateNotesFilters(next: Partial<typeof notesFilters>) {
    const nextFilters = {
      ...notesFilters,
      ...next,
    };
    if (Object.prototype.hasOwnProperty.call(next, "contextType")) {
      nextFilters.contextRef = "";
    }
    if (!nextFilters.contextType) {
      nextFilters.contextRef = "";
    }

    const nextParams = applyAdminNotesFilterStateToSearchParams(
      new URLSearchParams(searchParams.toString()),
      nextFilters
    );
    const nextHref = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
    startTransition(() => {
      router.replace(nextHref, { scroll: false });
    });
  }

  const createLessonOptions = useMemo(() => {
    if (formState.contextType !== "course_lesson") return [];
    const selectedModuleRef = normalizeContextRef(formState.contextModuleRef);
    if (!selectedModuleRef) return [];
    return contextCatalog.lessons.filter((entry) => entry.moduleRef === selectedModuleRef);
  }, [contextCatalog.lessons, formState.contextModuleRef, formState.contextType]);

  const editLessonOptions = useMemo(() => {
    if (!editState || editState.contextType !== "course_lesson") return [];
    const selectedModuleRef = normalizeContextRef(
      editState.contextModuleRef ||
        contextCatalog.lessonModuleByRef[normalizeContextRef(editState.contextRef)] ||
        ""
    );
    if (!selectedModuleRef) return [];
    return contextCatalog.lessons.filter((entry) => entry.moduleRef === selectedModuleRef);
  }, [contextCatalog.lessonModuleByRef, contextCatalog.lessons, editState]);

  const createContextInvalid = hasPartialContextSelection(
    formState.contextType,
    formState.contextRef
  );

  function setCreateContextType(nextType: AdminNoteContextType | "") {
    setFormState((prev) => ({
      ...prev,
      contextType: nextType,
      contextRef: "",
      contextModuleRef: "",
    }));
  }

  function setCreateContextRef(nextRef: string) {
    setFormState((prev) => ({
      ...prev,
      contextRef: normalizeContextRef(nextRef),
    }));
  }

  function setCreateContextModuleRef(nextRef: string) {
    setFormState((prev) => ({
      ...prev,
      contextModuleRef: normalizeContextRef(nextRef),
      contextRef: "",
    }));
  }

  function applyIncidentTemplate(severity: IncidentNoteSeverity) {
    const today = todayDateLabel();
    setFormState((prev) => ({
      ...prev,
      title: prev.title || `Incident ${severity} - ${today}`,
      category: ADMIN_INCIDENT_NOTE_CATEGORY_BY_SEVERITY[severity],
      priority: severity === "P0" ? "urgent" : severity === "P1" ? "high" : "normal",
      body: buildIncidentNoteBodyTemplate(severity),
      noteDate: todayDateInputValue(),
      isDone: false,
    }));
    setActionError(null);
    setActionNotice(`Applied ${severity} incident template.`);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setActionError(null);
    setActionNotice(null);

    try {
      const response = await fetch("/api/admin/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(formState),
      });

      const payload = (await response.json()) as AdminNoteCreateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok ? "Could not save note." : (payload.error ?? "Could not save note.")
        );
        return;
      }

      setItems((prev) =>
        sortNoteItems([...prev.filter((entry) => entry.id !== payload.item.id), payload.item])
      );
      setFormState(INITIAL_FORM);
      setActionNotice(
        payload.item.is_done
          ? "Note saved to done archive."
          : "Note saved to open work queue. Use Edit to add images or related notes."
      );
    } catch {
      setActionError("Could not save note.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(item: AdminNoteItem) {
    if (
      updatingId ||
      deletingId ||
      uploadingNoteId ||
      deletingAttachmentId ||
      linkingNoteId ||
      unlinkingKey
    )
      return;
    setActionError(null);
    setActionNotice(null);
    const nextState = toFormState(item);
    if (nextState.contextType === "course_lesson" && nextState.contextRef) {
      nextState.contextModuleRef =
        contextCatalog.lessonModuleByRef[normalizeContextRef(nextState.contextRef)] ?? "";
    }
    setEditingId(item.id);
    setEditState(nextState);
  }

  function cancelEdit() {
    if (
      updatingId ||
      deletingId ||
      uploadingNoteId ||
      deletingAttachmentId ||
      linkingNoteId ||
      unlinkingKey
    )
      return;
    setEditingId(null);
    setEditState(null);
  }

  function setEditField(updater: (prev: FormState) => FormState) {
    setEditState((prev) => (prev ? updater(prev) : prev));
  }

  function setEditContextType(nextType: AdminNoteContextType | "") {
    setEditField((prev) => ({
      ...prev,
      contextType: nextType,
      contextRef: "",
      contextModuleRef: "",
    }));
  }

  function setEditContextRef(nextRef: string) {
    setEditField((prev) => ({
      ...prev,
      contextRef: normalizeContextRef(nextRef),
    }));
  }

  function setEditContextModuleRef(nextRef: string) {
    setEditField((prev) => ({
      ...prev,
      contextModuleRef: normalizeContextRef(nextRef),
      contextRef: "",
    }));
  }

  async function saveEdit(itemId: string) {
    if (!editState) return;
    if (
      updatingId ||
      deletingId ||
      uploadingNoteId ||
      deletingAttachmentId ||
      linkingNoteId ||
      unlinkingKey
    )
      return;

    setActionError(null);
    setActionNotice(null);
    setUpdatingId(itemId);

    try {
      const response = await fetch(`/api/admin/notes/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(editState),
      });

      const payload = (await response.json()) as AdminNoteUpdateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok ? "Could not update note." : (payload.error ?? "Could not update note.")
        );
        return;
      }

      if (!payload.item) {
        setActionError("Could not update note.");
        return;
      }

      const nextItem = payload.item;

      setItems((prev) =>
        sortNoteItems(prev.map((entry) => (entry.id === nextItem.id ? nextItem : entry)))
      );
      setEditingId(null);
      setEditState(null);
      setActionNotice("Note updated.");
    } catch {
      setActionError("Could not update note.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function toggleDone(item: AdminNoteItem) {
    if (
      updatingId ||
      deletingId ||
      editingId ||
      uploadingNoteId ||
      deletingAttachmentId ||
      linkingNoteId ||
      unlinkingKey
    )
      return;
    setActionError(null);
    setActionNotice(null);
    setUpdatingId(item.id);

    try {
      const response = await fetch(`/api/admin/notes/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ isDone: !item.is_done }),
      });

      const payload = (await response.json()) as AdminNoteUpdateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok ? "Could not update note." : (payload.error ?? "Could not update note.")
        );
        return;
      }

      if (!payload.item) {
        setActionError("Could not update note.");
        return;
      }

      const nextItem = payload.item;

      setItems((prev) =>
        sortNoteItems(prev.map((entry) => (entry.id === nextItem.id ? nextItem : entry)))
      );
      setActionNotice(
        nextItem.is_done
          ? "Note marked as done and moved to done archive."
          : "Note reopened and moved to open work queue."
      );
    } catch {
      setActionError("Could not update note.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(item: AdminNoteItem) {
    if (
      updatingId ||
      deletingId ||
      uploadingNoteId ||
      deletingAttachmentId ||
      linkingNoteId ||
      unlinkingKey
    )
      return;
    const confirmed = window.confirm(`Delete note \"${item.title}\"?`);
    if (!confirmed) return;

    setActionError(null);
    setActionNotice(null);
    setDeletingId(item.id);

    try {
      const response = await fetch(`/api/admin/notes/${item.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      const payload = (await response.json()) as AdminNoteDeleteResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok ? "Could not delete note." : (payload.error ?? "Could not delete note.")
        );
        return;
      }

      setItems((prev) => prev.filter((entry) => entry.id !== payload.id));
      if (editingId === payload.id) {
        setEditingId(null);
        setEditState(null);
      }
      setActionNotice("Note deleted.");
    } catch {
      setActionError("Could not delete note.");
    } finally {
      setDeletingId(null);
    }
  }

  function applyMutatedItem(itemId: string, nextItem: AdminNoteItem | null) {
    setItems((prev) =>
      nextItem
        ? sortNoteItems(prev.map((entry) => (entry.id === itemId ? nextItem : entry)))
        : prev.filter((entry) => entry.id !== itemId)
    );

    if (!nextItem && editingId === itemId) {
      setEditingId(null);
      setEditState(null);
    }
  }

  async function uploadAttachments(item: AdminNoteItem, files: FileList | null) {
    if (!files || files.length === 0) return;
    if (uploadingNoteId || deletingAttachmentId || linkingNoteId || unlinkingKey) return;

    setActionError(null);
    setActionNotice(null);
    setUploadingNoteId(item.id);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`/api/admin/notes/${item.id}/attachments`, {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });

      const payload = (await response.json()) as AdminNoteUpdateResponse;
      if (!response.ok || !payload.ok || !payload.item) {
        setActionError(
          payload.ok
            ? "Could not upload attachments."
            : (payload.error ?? "Could not upload attachments.")
        );
        return;
      }

      applyMutatedItem(item.id, payload.item);
      setActionNotice(
        payload.item.attachments.length === 1 ? "Attachment uploaded." : "Attachments uploaded."
      );
    } catch {
      setActionError("Could not upload attachments.");
    } finally {
      setUploadingNoteId(null);
    }
  }

  async function deleteAttachment(noteId: string, attachmentId: string) {
    if (uploadingNoteId || deletingAttachmentId || linkingNoteId || unlinkingKey) return;

    setActionError(null);
    setActionNotice(null);
    setDeletingAttachmentId(attachmentId);

    try {
      const response = await fetch(`/api/admin/notes/${noteId}/attachments/${attachmentId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      const payload = (await response.json()) as AdminNoteUpdateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not delete attachment."
            : (payload.error ?? "Could not delete attachment.")
        );
        return;
      }

      applyMutatedItem(noteId, payload.item);
      setActionNotice("Attachment deleted.");
    } catch {
      setActionError("Could not delete attachment.");
    } finally {
      setDeletingAttachmentId(null);
    }
  }

  async function addRelatedNote(noteId: string) {
    const relatedNoteId = (linkDrafts[noteId] ?? "").trim();
    if (!relatedNoteId) return;
    if (uploadingNoteId || deletingAttachmentId || linkingNoteId || unlinkingKey) return;

    setActionError(null);
    setActionNotice(null);
    setLinkingNoteId(noteId);

    try {
      const response = await fetch(`/api/admin/notes/${noteId}/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ relatedNoteId }),
      });

      const payload = (await response.json()) as AdminNoteUpdateResponse;
      if (!response.ok || !payload.ok || !payload.item) {
        setActionError(
          payload.ok ? "Could not link note." : (payload.error ?? "Could not link note.")
        );
        return;
      }

      applyMutatedItem(noteId, payload.item);
      setLinkDrafts((prev) => ({ ...prev, [noteId]: "" }));
      setActionNotice("Related note linked.");
    } catch {
      setActionError("Could not link note.");
    } finally {
      setLinkingNoteId(null);
    }
  }

  async function removeRelatedNote(noteId: string, relatedNoteId: string) {
    if (uploadingNoteId || deletingAttachmentId || linkingNoteId || unlinkingKey) return;

    setActionError(null);
    setActionNotice(null);
    setUnlinkingKey(`${noteId}:${relatedNoteId}`);

    try {
      const response = await fetch(`/api/admin/notes/${noteId}/links/${relatedNoteId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      const payload = (await response.json()) as AdminNoteUpdateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok ? "Could not unlink note." : (payload.error ?? "Could not unlink note.")
        );
        return;
      }

      applyMutatedItem(noteId, payload.item);
      setActionNotice("Related note removed.");
    } catch {
      setActionError("Could not unlink note.");
    } finally {
      setUnlinkingKey(null);
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-notes-manager">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
            <p className="mt-2 text-sm text-slate-600">{noteSummary}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadNotes()}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {!schemaReady && warning ? (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {warning}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Loading notes…
          </p>
        ) : null}

        {!loading && error ? (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-sm font-medium text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => void loadNotes()}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No notes created yet. Add your first admin note below.
          </p>
        ) : null}

        {actionError ? (
          <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {actionError}
          </p>
        ) : null}

        {actionNotice ? (
          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {actionNotice}
          </p>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Work queue filters</p>
                <p className="mt-1 text-xs text-slate-600">
                  Showing {filteredItems.length} of {noteCounts.all} notes.
                </p>
              </div>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => updateNotesFilters(DEFAULT_ADMIN_NOTES_FILTER_STATE)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>Search</span>
                <input
                  type="search"
                  value={notesFilters.query}
                  onChange={(e) => updateNotesFilters({ query: e.target.value })}
                  data-testid="admin-notes-search"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  placeholder="Search note ID, title, text, attachment, or context"
                />
              </label>

              <div className="space-y-1 text-sm font-medium text-slate-700">
                <span>Status</span>
                <div
                  className="grid grid-cols-3 gap-2"
                  role="group"
                  aria-label="Notes status filter"
                >
                  {(["open", "done", "all"] as AdminNotesStatusFilter[]).map((status) => {
                    const isActive = notesFilters.status === status;
                    const count =
                      status === "open"
                        ? noteCounts.open
                        : status === "done"
                          ? noteCounts.done
                          : noteCounts.all;

                    return (
                      <button
                        key={status}
                        type="button"
                        data-testid={`admin-notes-status-${status}`}
                        onClick={() => updateNotesFilters({ status })}
                        className={[
                          "inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition",
                          isActive
                            ? "border-blue-300 bg-blue-50 text-blue-800"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
                        ].join(" ")}
                        aria-pressed={isActive}
                      >
                        {status === "open"
                          ? `Open (${count})`
                          : status === "done"
                            ? `Done archive (${count})`
                            : `All (${count})`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>Category</span>
                <select
                  value={notesFilters.category}
                  onChange={(e) => updateNotesFilters({ category: e.target.value })}
                  data-testid="admin-notes-category-filter"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                >
                  <option value="">All categories</option>
                  {suggestedCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>Priority</span>
                <select
                  value={notesFilters.priority}
                  onChange={(e) =>
                    updateNotesFilters({
                      priority: e.target.value as AdminNotePriority | "",
                    })
                  }
                  data-testid="admin-notes-priority-filter"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                >
                  <option value="">All priorities</option>
                  {ADMIN_NOTE_PRIORITY_VALUES.map((priority) => (
                    <option key={priority} value={priority}>
                      {formatPriorityLabel(priority)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>Context type</span>
                <select
                  value={notesFilters.contextType}
                  onChange={(e) =>
                    updateNotesFilters({
                      contextType: e.target.value as AdminNoteContextType | "",
                    })
                  }
                  data-testid="admin-notes-context-type-filter"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                >
                  <option value="">All context types</option>
                  {CONTEXT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>Exact route/context</span>
                <select
                  value={notesFilters.contextRef}
                  onChange={(e) => updateNotesFilters({ contextRef: e.target.value })}
                  data-testid="admin-notes-context-ref-filter"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  disabled={contextRefOptions.length === 0}
                >
                  <option value="">
                    {notesFilters.contextType ? "All selected targets" : "All routes and targets"}
                  </option>
                  {contextRefOptions.map((option) => (
                    <option key={`${option.contextType}:${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : null}

        {!loading && !error && items.length > 0 && filteredItems.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {filteredItems.map((item) => {
              const isUpdating = updatingId === item.id;
              const isDeleting = deletingId === item.id;
              const isEditing = editingId === item.id && editState !== null;
              const isUploading = uploadingNoteId === item.id;
              const isLinking = linkingNoteId === item.id;
              const editContextInvalid = isEditing
                ? hasPartialContextSelection(editState.contextType, editState.contextRef)
                : false;
              const linkableNotes = items
                .filter((entry) => entry.id !== item.id)
                .filter(
                  (entry) => !item.related_notes.some((relatedNote) => relatedNote.id === entry.id)
                )
                .sort(sortAdminNotesByPriorityAndNewest);
              return (
                <li
                  key={item.id}
                  data-testid="admin-note-item"
                  className={[
                    "rounded-xl border px-4 py-3",
                    item.is_done
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-slate-200 bg-slate-50/70",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.category} · {formatDateLabel(item.note_date)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={[
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                            priorityBadgeClasses(item.priority),
                          ].join(" ")}
                        >
                          {formatPriorityLabel(item.priority)}
                        </span>
                        {item.attachments.length > 0 ? (
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {item.attachments.length} image
                            {item.attachments.length === 1 ? "" : "s"}
                          </span>
                        ) : null}
                        {item.related_notes.length > 0 ? (
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {item.related_notes.length} related note
                            {item.related_notes.length === 1 ? "" : "s"}
                          </span>
                        ) : null}
                      </div>
                      <p
                        className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500"
                        data-testid="admin-note-id"
                      >
                        {buildAdminNoteReferenceLabel(item.id)}
                      </p>
                      {item.context_type && item.context_ref ? (
                        <>
                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {resolveAdminNoteContextLabel({
                              catalog: contextCatalog,
                              contextType: item.context_type,
                              contextRef: item.context_ref,
                            })}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            Context ref:{" "}
                            <span className="font-mono text-slate-700">{item.context_ref}</span>
                          </p>
                        </>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={item.is_done}
                          disabled={Boolean(
                            updatingId ||
                            deletingId ||
                            editingId ||
                            uploadingNoteId ||
                            deletingAttachmentId ||
                            linkingNoteId ||
                            unlinkingKey
                          )}
                          onChange={() => {
                            void toggleDone(item);
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        {isUpdating ? "Saving…" : "Done"}
                      </label>
                      <button
                        type="button"
                        disabled={Boolean(
                          updatingId ||
                          deletingId ||
                          editingId ||
                          uploadingNoteId ||
                          deletingAttachmentId ||
                          linkingNoteId ||
                          unlinkingKey
                        )}
                        onClick={() => {
                          startEdit(item);
                        }}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(
                          updatingId ||
                          deletingId ||
                          uploadingNoteId ||
                          deletingAttachmentId ||
                          linkingNoteId ||
                          unlinkingKey
                        )}
                        onClick={() => {
                          void handleDelete(item);
                        }}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>

                  {!isEditing && item.body ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{item.body}</p>
                  ) : null}

                  {!isEditing && item.attachments.length > 0 ? (
                    <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-white/80 p-3">
                      <p className="text-xs font-semibold text-slate-700">Images / screenshots</p>
                      <div className="flex flex-wrap gap-3">
                        {item.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.signed_url ?? undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex w-32 flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2"
                          >
                            {attachment.signed_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={attachment.signed_url}
                                alt={attachment.file_name}
                                className="h-20 w-full rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-20 w-full items-center justify-center rounded-md bg-slate-200 text-[11px] font-medium text-slate-600">
                                Preview unavailable
                              </div>
                            )}
                            <div className="space-y-1">
                              <p className="truncate text-[11px] font-medium text-slate-700">
                                {attachment.file_name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {formatAttachmentSize(attachment.size_bytes)}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {!isEditing && item.related_notes.length > 0 ? (
                    <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-white/80 p-3">
                      <p className="text-xs font-semibold text-slate-700">Related notes</p>
                      <div className="flex flex-wrap gap-2">
                        {item.related_notes.map((relatedNote) => (
                          <span
                            key={relatedNote.id}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-700"
                          >
                            {relatedNote.title} · {buildAdminNoteReferenceLabel(relatedNote.id)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {isEditing && editState ? (
                    <form
                      className="mt-3 grid gap-3 sm:grid-cols-2"
                      data-testid="admin-note-edit-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void saveEdit(item.id);
                      }}
                    >
                      <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                        <span>Edit title</span>
                        <input
                          type="text"
                          required
                          value={editState.title}
                          onChange={(e) => {
                            setEditField((prev) => ({ ...prev, title: e.target.value }));
                          }}
                          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                        />
                      </label>

                      <label className="space-y-1 text-xs font-medium text-slate-700">
                        <span>Edit category</span>
                        <input
                          type="text"
                          list="admin-note-category-options"
                          value={editState.category}
                          onChange={(e) => {
                            setEditField((prev) => ({ ...prev, category: e.target.value }));
                          }}
                          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                        />
                      </label>

                      <label className="space-y-1 text-xs font-medium text-slate-700">
                        <span>Edit date</span>
                        <input
                          type="date"
                          required
                          value={editState.noteDate}
                          onChange={(e) => {
                            setEditField((prev) => ({ ...prev, noteDate: e.target.value }));
                          }}
                          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                        />
                      </label>

                      <label className="space-y-1 text-xs font-medium text-slate-700">
                        <span>Priority</span>
                        <select
                          value={editState.priority}
                          onChange={(e) => {
                            setEditField((prev) => ({
                              ...prev,
                              priority: e.target.value as AdminNotePriority,
                            }));
                          }}
                          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                        >
                          {ADMIN_NOTE_PRIORITY_VALUES.map((priority) => (
                            <option key={priority} value={priority}>
                              {formatPriorityLabel(priority)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                        <span>Edit text</span>
                        <textarea
                          rows={3}
                          value={editState.body}
                          onChange={(e) => {
                            setEditField((prev) => ({ ...prev, body: e.target.value }));
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                        />
                      </label>

                      <label className="space-y-1 text-xs font-medium text-slate-700">
                        <span>Attach to (optional)</span>
                        <select
                          value={editState.contextType}
                          onChange={(e) => {
                            setEditContextType(e.target.value as AdminNoteContextType | "");
                          }}
                          data-testid="admin-note-edit-context-type"
                          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                        >
                          <option value="">No attachment</option>
                          {CONTEXT_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1 text-xs font-medium text-slate-700">
                        <span>Selected target</span>
                        {editState.contextType === "" ? (
                          <input
                            type="text"
                            value=""
                            disabled
                            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                            placeholder="No attachment"
                          />
                        ) : null}
                        {editState.contextType === "course_module" ? (
                          <select
                            value={editState.contextRef}
                            onChange={(e) => {
                              setEditContextRef(e.target.value);
                            }}
                            data-testid="admin-note-edit-context-module"
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          >
                            <option value="">Choose module</option>
                            {contextCatalog.modules.map((option) => (
                              <option key={option.ref} value={option.ref}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : null}
                        {editState.contextType === "course_lesson" ? (
                          <div className="space-y-2">
                            <select
                              value={normalizeContextRef(
                                editState.contextModuleRef ||
                                  contextCatalog.lessonModuleByRef[
                                    normalizeContextRef(editState.contextRef)
                                  ] ||
                                  ""
                              )}
                              onChange={(e) => {
                                setEditContextModuleRef(e.target.value);
                              }}
                              data-testid="admin-note-edit-context-lesson-module"
                              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                            >
                              <option value="">Choose module first</option>
                              {contextCatalog.modules.map((option) => (
                                <option key={option.ref} value={option.ref}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <select
                              value={editState.contextRef}
                              onChange={(e) => {
                                setEditContextRef(e.target.value);
                              }}
                              data-testid="admin-note-edit-context-lesson"
                              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                            >
                              <option value="">Choose lesson</option>
                              {editLessonOptions.map((option) => (
                                <option key={option.ref} value={option.ref}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : null}
                        {editState.contextType === "guide_session" ? (
                          <select
                            value={editState.contextRef}
                            onChange={(e) => {
                              setEditContextRef(e.target.value);
                            }}
                            data-testid="admin-note-edit-context-session"
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          >
                            <option value="">Choose session</option>
                            {contextCatalog.sessions.map((option) => (
                              <option key={option.ref} value={option.ref}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : null}
                        {editState.contextType === "guide_drill" ? (
                          <select
                            value={editState.contextRef}
                            onChange={(e) => {
                              setEditContextRef(e.target.value);
                            }}
                            data-testid="admin-note-edit-context-drill"
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          >
                            <option value="">Choose drill</option>
                            {contextCatalog.drills.map((option) => (
                              <option key={option.ref} value={option.ref}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : null}
                        {editState.contextType === "product" ? (
                          <select
                            value={editState.contextRef}
                            onChange={(e) => {
                              setEditContextRef(e.target.value);
                            }}
                            data-testid="admin-note-edit-context-product"
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          >
                            <option value="">Choose product</option>
                            {contextCatalog.products.map((option) => (
                              <option key={option.ref} value={option.ref}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : null}
                        {editState.contextType === "page" ? (
                          <select
                            value={editState.contextRef}
                            onChange={(e) => {
                              setEditContextRef(e.target.value);
                            }}
                            data-testid="admin-note-edit-context-page"
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          >
                            <option value="">Choose page</option>
                            {contextCatalog.pages.map((option) => (
                              <option key={option.ref} value={option.ref}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </label>

                      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3 sm:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-900">
                              Images / screenshots
                            </p>
                            <p className="mt-1 text-[11px] text-slate-600">
                              PNG, JPEG, WEBP, or GIF up to 5 MB each. Images stay admin-only.
                            </p>
                          </div>
                          <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
                            <span>{isUploading ? "Uploading…" : "Add images"}</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              multiple
                              className="sr-only"
                              data-testid="admin-note-attachment-input"
                              disabled={Boolean(
                                isUploading || deletingAttachmentId || updatingId || deletingId
                              )}
                              onChange={(e) => {
                                void uploadAttachments(item, e.target.files);
                                e.currentTarget.value = "";
                              }}
                            />
                          </label>
                        </div>

                        {item.attachments.length > 0 ? (
                          <ul className="space-y-2">
                            {item.attachments.map((attachment) => {
                              const isDeletingAttachment = deletingAttachmentId === attachment.id;
                              return (
                                <li
                                  key={attachment.id}
                                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    {attachment.signed_url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={attachment.signed_url}
                                        alt={attachment.file_name}
                                        className="h-12 w-12 rounded-md object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-200 text-[10px] font-medium text-slate-600">
                                        No preview
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-medium text-slate-700">
                                        {attachment.file_name}
                                      </p>
                                      <p className="text-[11px] text-slate-500">
                                        {formatAttachmentSize(attachment.size_bytes)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {attachment.signed_url ? (
                                      <a
                                        href={attachment.signed_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                      >
                                        Open
                                      </a>
                                    ) : null}
                                    <button
                                      type="button"
                                      data-testid="admin-note-attachment-delete"
                                      disabled={Boolean(
                                        isDeletingAttachment ||
                                        isUploading ||
                                        updatingId ||
                                        deletingId
                                      )}
                                      onClick={() => {
                                        void deleteAttachment(item.id, attachment.id);
                                      }}
                                      className="inline-flex h-8 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {isDeletingAttachment ? "Deleting…" : "Delete image"}
                                    </button>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-slate-600">No screenshots attached yet.</p>
                        )}
                      </div>

                      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3 sm:col-span-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Related notes</p>
                          <p className="mt-1 text-[11px] text-slate-600">
                            Connect follow-up notes without merging their identities.
                          </p>
                        </div>

                        {item.related_notes.length > 0 ? (
                          <ul className="space-y-2">
                            {item.related_notes.map((relatedNote) => {
                              const currentUnlinkKey = `${item.id}:${relatedNote.id}`;
                              const isUnlinking = unlinkingKey === currentUnlinkKey;
                              return (
                                <li
                                  key={relatedNote.id}
                                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                                >
                                  <div>
                                    <p className="text-xs font-medium text-slate-700">
                                      {relatedNote.title}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      {formatPriorityLabel(relatedNote.priority)} ·{" "}
                                      {buildAdminNoteReferenceLabel(relatedNote.id)}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    data-testid="admin-note-related-delete"
                                    disabled={Boolean(
                                      isUnlinking || isLinking || updatingId || deletingId
                                    )}
                                    onClick={() => {
                                      void removeRelatedNote(item.id, relatedNote.id);
                                    }}
                                    className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isUnlinking ? "Removing…" : "Remove link"}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-slate-600">No related notes linked yet.</p>
                        )}

                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                          <select
                            value={linkDrafts[item.id] ?? ""}
                            onChange={(e) => {
                              setLinkDrafts((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }));
                            }}
                            data-testid="admin-note-related-select"
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          >
                            <option value="">Choose note to link</option>
                            {linkableNotes.map((linkableNote) => (
                              <option key={linkableNote.id} value={linkableNote.id}>
                                {formatPriorityLabel(linkableNote.priority)} · {linkableNote.title}{" "}
                                · {buildAdminNoteReferenceLabel(linkableNote.id)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            data-testid="admin-note-related-add"
                            disabled={Boolean(
                              !linkDrafts[item.id] ||
                              isLinking ||
                              unlinkingKey ||
                              updatingId ||
                              deletingId
                            )}
                            onClick={() => {
                              void addRelatedNote(item.id);
                            }}
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isLinking ? "Linking…" : "Link note"}
                          </button>
                        </div>
                      </div>

                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={editState.isDone}
                          onChange={(e) => {
                            setEditField((prev) => ({ ...prev, isDone: e.target.checked }));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        Mark as done
                      </label>

                      <div className="flex items-center gap-2 sm:col-span-2">
                        <button
                          type="submit"
                          className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                          disabled={Boolean(
                            updatingId ||
                            deletingId ||
                            editContextInvalid ||
                            uploadingNoteId ||
                            deletingAttachmentId ||
                            linkingNoteId ||
                            unlinkingKey
                          )}
                        >
                          {isUpdating ? "Saving…" : "Save changes"}
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={cancelEdit}
                          disabled={Boolean(
                            updatingId ||
                            deletingId ||
                            uploadingNoteId ||
                            deletingAttachmentId ||
                            linkingNoteId ||
                            unlinkingKey
                          )}
                        >
                          Cancel
                        </button>
                      </div>
                      {editContextInvalid ? (
                        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:col-span-2">
                          Set both context type and context ref, or clear both.
                        </p>
                      ) : null}
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        {!loading && !error && items.length > 0 && filteredItems.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No notes match the current filters. Clear filters or switch to done archive to find
            older notes.
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Create note</h2>
        <p className="mt-2 text-sm text-slate-600">
          Store planning notes with category, priority, date, and completion tracking.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Save first, then use Edit on the new note to add screenshots or link related notes.
        </p>
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-900">Incident quick templates</p>
          <p className="mt-1 text-xs text-amber-800">
            Use these for runbook incidents so severity, owner, and update cadence stay
            standardized.
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {INCIDENT_NOTE_SEVERITIES.map((severity) => (
              <div
                key={severity}
                className="rounded-lg border border-amber-200 bg-white/80 px-3 py-2"
              >
                <p className="text-xs font-semibold text-amber-950">{severity}</p>
                <p className="mt-1 text-xs text-amber-900">
                  {ADMIN_INCIDENT_SEVERITY_GUIDANCE[severity]}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {INCIDENT_NOTE_SEVERITIES.map((severity) => (
              <button
                key={severity}
                type="button"
                onClick={() => applyIncidentTemplate(severity)}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
              >
                Use {severity} template
              </button>
            ))}
          </div>
        </div>

        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={handleCreate}
          data-testid="admin-notes-create-form"
        >
          <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
            <span>Title</span>
            <input
              type="text"
              required
              value={formState.title}
              onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              placeholder="Launch checklist"
            />
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Category</span>
            <input
              type="text"
              list="admin-note-category-options"
              value={formState.category}
              onChange={(e) => setFormState((prev) => ({ ...prev, category: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              placeholder="Operations"
            />
            <datalist id="admin-note-category-options">
              {suggestedCategoryOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Date</span>
            <input
              type="date"
              value={formState.noteDate}
              onChange={(e) => setFormState((prev) => ({ ...prev, noteDate: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
            />
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Priority</span>
            <select
              value={formState.priority}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  priority: e.target.value as AdminNotePriority,
                }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              {ADMIN_NOTE_PRIORITY_VALUES.map((priority) => (
                <option key={priority} value={priority}>
                  {formatPriorityLabel(priority)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
            <span>Text</span>
            <textarea
              rows={4}
              value={formState.body}
              onChange={(e) => setFormState((prev) => ({ ...prev, body: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="What to do, blockers, and owner notes."
            />
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Attach to (optional)</span>
            <select
              value={formState.contextType}
              onChange={(e) => setCreateContextType(e.target.value as AdminNoteContextType | "")}
              data-testid="admin-note-create-context-type"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              <option value="">No attachment</option>
              {CONTEXT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Selected target</span>
            {formState.contextType === "" ? (
              <input
                type="text"
                value=""
                disabled
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                placeholder="No attachment"
              />
            ) : null}
            {formState.contextType === "course_module" ? (
              <select
                value={formState.contextRef}
                onChange={(e) => setCreateContextRef(e.target.value)}
                data-testid="admin-note-create-context-module"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                <option value="">Choose module</option>
                {contextCatalog.modules.map((option) => (
                  <option key={option.ref} value={option.ref}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
            {formState.contextType === "course_lesson" ? (
              <div className="space-y-2">
                <select
                  value={formState.contextModuleRef}
                  onChange={(e) => {
                    setCreateContextModuleRef(e.target.value);
                  }}
                  data-testid="admin-note-create-context-lesson-module"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                >
                  <option value="">Choose module first</option>
                  {contextCatalog.modules.map((option) => (
                    <option key={option.ref} value={option.ref}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={formState.contextRef}
                  onChange={(e) => {
                    setCreateContextRef(e.target.value);
                  }}
                  data-testid="admin-note-create-context-lesson"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                >
                  <option value="">Choose lesson</option>
                  {createLessonOptions.map((option) => (
                    <option key={option.ref} value={option.ref}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {formState.contextType === "guide_session" ? (
              <select
                value={formState.contextRef}
                onChange={(e) => setCreateContextRef(e.target.value)}
                data-testid="admin-note-create-context-session"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                <option value="">Choose session</option>
                {contextCatalog.sessions.map((option) => (
                  <option key={option.ref} value={option.ref}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
            {formState.contextType === "guide_drill" ? (
              <select
                value={formState.contextRef}
                onChange={(e) => setCreateContextRef(e.target.value)}
                data-testid="admin-note-create-context-drill"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                <option value="">Choose drill</option>
                {contextCatalog.drills.map((option) => (
                  <option key={option.ref} value={option.ref}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
            {formState.contextType === "product" ? (
              <select
                value={formState.contextRef}
                onChange={(e) => setCreateContextRef(e.target.value)}
                data-testid="admin-note-create-context-product"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                <option value="">Choose product</option>
                {contextCatalog.products.map((option) => (
                  <option key={option.ref} value={option.ref}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
            {formState.contextType === "page" ? (
              <select
                value={formState.contextRef}
                onChange={(e) => setCreateContextRef(e.target.value)}
                data-testid="admin-note-create-context-page"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                <option value="">Choose page</option>
                {contextCatalog.pages.map((option) => (
                  <option key={option.ref} value={option.ref}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
          </label>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={formState.isDone}
              onChange={(e) => setFormState((prev) => ({ ...prev, isDone: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            Mark as done now
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting || createContextInvalid}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {submitting ? "Saving…" : "Save note"}
            </button>
          </div>
          {createContextInvalid ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 sm:col-span-2">
              Set both context type and context ref, or leave both empty.
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
