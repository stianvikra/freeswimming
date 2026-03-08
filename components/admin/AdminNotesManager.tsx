"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  ADMIN_INCIDENT_NOTE_CATEGORY_BY_SEVERITY,
  ADMIN_INCIDENT_NOTE_CATEGORY_OPTIONS,
  INCIDENT_NOTE_SEVERITIES,
  buildIncidentNoteBodyTemplate,
  type AdminNoteRow,
  type IncidentNoteSeverity,
} from "@/lib/admin/notes";

type AdminNotesResponse =
  | {
      ok: true;
      items: AdminNoteRow[];
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
      item: AdminNoteRow;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminNoteUpdateResponse =
  | {
      ok: true;
      item: AdminNoteRow;
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

function toFormState(note: AdminNoteRow): FormState {
  return {
    title: note.title,
    category: note.category,
    noteDate: note.note_date,
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

function hasPartialContextSelection(contextType: string, contextRef: string): boolean {
  const hasType = contextType.trim().length > 0;
  const hasRef = contextRef.trim().length > 0;
  return (hasType && !hasRef) || (!hasType && hasRef);
}

function normalizeContextRef(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export default function AdminNotesManager() {
  const [items, setItems] = useState<AdminNoteRow[]>([]);
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

      setItems(payload.items);
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

  const noteSummary = useMemo(() => {
    if (items.length === 0) return "No notes yet.";
    const done = items.filter((item) => item.is_done).length;
    const open = items.length - done;
    return `${open} open · ${done} done`;
  }, [items]);

  const suggestedCategoryOptions = useMemo(() => {
    return [...categoryOptions, ...ADMIN_INCIDENT_NOTE_CATEGORY_OPTIONS]
      .map((entry) => entry.trim())
      .filter(Boolean)
      .filter((entry, index, all) => all.indexOf(entry) === index)
      .sort((left, right) => left.localeCompare(right, "nb-NO"));
  }, [categoryOptions]);

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

      setItems((prev) => [payload.item, ...prev]);
      setFormState(INITIAL_FORM);
      setActionNotice("Note saved.");
    } catch {
      setActionError("Could not save note.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(item: AdminNoteRow) {
    if (updatingId || deletingId) return;
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
    if (updatingId || deletingId) return;
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
    if (updatingId || deletingId) return;

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

      setItems((prev) =>
        prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
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

  async function toggleDone(item: AdminNoteRow) {
    if (updatingId || deletingId || editingId) return;
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

      setItems((prev) =>
        prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
      );
      setActionNotice(payload.item.is_done ? "Note marked as done." : "Note reopened.");
    } catch {
      setActionError("Could not update note.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(item: AdminNoteRow) {
    if (updatingId || deletingId) return;
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
          <ul className="mt-5 space-y-3">
            {items.map((item) => {
              const isUpdating = updatingId === item.id;
              const isDeleting = deletingId === item.id;
              const isEditing = editingId === item.id && editState !== null;
              const editContextInvalid = isEditing
                ? hasPartialContextSelection(editState.contextType, editState.contextRef)
                : false;
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
                      {item.context_type && item.context_ref ? (
                        <p className="mt-1 text-xs font-medium text-slate-600">
                          {resolveAdminNoteContextLabel({
                            catalog: contextCatalog,
                            contextType: item.context_type,
                            contextRef: item.context_ref,
                          })}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={item.is_done}
                          disabled={Boolean(updatingId || deletingId || editingId)}
                          onChange={() => {
                            void toggleDone(item);
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        {isUpdating ? "Saving…" : "Done"}
                      </label>
                      <button
                        type="button"
                        disabled={Boolean(updatingId || deletingId || editingId)}
                        onClick={() => {
                          startEdit(item);
                        }}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(updatingId || deletingId)}
                        onClick={() => {
                          void handleDelete(item);
                        }}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>

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
                          disabled={Boolean(updatingId || deletingId || editContextInvalid)}
                        >
                          {isUpdating ? "Saving…" : "Save changes"}
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={cancelEdit}
                          disabled={Boolean(updatingId || deletingId)}
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
                  ) : item.body ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{item.body}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Create note</h2>
        <p className="mt-2 text-sm text-slate-600">
          Store planning notes with category, date, and completion tracking.
        </p>
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-900">Incident quick templates</p>
          <p className="mt-1 text-xs text-amber-800">
            Use these for runbook incidents so severity, owner, and update cadence stay
            standardized.
          </p>
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
