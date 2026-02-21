"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminCategoryRow } from "@/lib/admin/categories";
import type { AdminNoteContextType } from "@/lib/admin/note-context";
import type { AdminNoteRow } from "@/lib/admin/notes";

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

type Props = {
  contextType: AdminNoteContextType;
  contextRef: string;
  contextLabel: string;
  includeModuleContextForCourseLesson?: boolean;
  collapsedByDefault?: boolean;
  className?: string;
};

type FormState = {
  title: string;
  body: string;
  category: string;
  noteDate: string;
  isDone: boolean;
};

function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

const INITIAL_FORM: FormState = {
  title: "",
  body: "",
  category: "General",
  noteDate: todayDateInputValue(),
  isDone: false,
};

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
    body: note.body,
    category: note.category,
    noteDate: note.note_date,
    isDone: note.is_done,
  };
}

function normalizeContextRef(value: string): string {
  return value.trim().toLowerCase();
}

export default function AdminContextNotesPanel({
  contextType,
  contextRef,
  contextLabel,
  includeModuleContextForCourseLesson = false,
  collapsedByDefault = true,
  className = "",
}: Props) {
  const normalizedContextRef = useMemo(() => normalizeContextRef(contextRef), [contextRef]);

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(!collapsedByDefault);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AdminNoteRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<FormState | null>(null);

  const loadNotes = useCallback(async () => {
    if (!normalizedContextRef) {
      setAuthorized(false);
      return;
    }

    setLoading(true);
    setError(null);
    setWarning(null);
    setActionError(null);
    setActionNotice(null);
    setEditingId(null);
    setEditState(null);

    try {
      const query = new URLSearchParams({
        contextType,
        contextRef: normalizedContextRef,
      });
      if (contextType === "course_lesson" && includeModuleContextForCourseLesson) {
        query.set("includeModuleContext", "1");
      }
      const response = await fetch(`/api/admin/notes?${query.toString()}`, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      if (response.status === 401 || response.status === 403) {
        setAuthorized(false);
        setItems([]);
        setCategoryOptions([]);
        return;
      }

      const payload = (await response.json()) as AdminNotesResponse;
      if (!response.ok || !payload.ok) {
        setAuthorized(true);
        setItems([]);
        setError(
          payload.ok
            ? "Could not load context notes."
            : (payload.error ?? "Could not load context notes.")
        );
        return;
      }

      setAuthorized(true);
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
    } catch {
      setAuthorized(true);
      setItems([]);
      setCategoryOptions([]);
      setError("Could not load context notes.");
    } finally {
      setLoading(false);
    }
  }, [contextType, includeModuleContextForCourseLesson, normalizedContextRef]);

  useEffect(() => {
    setAuthorized(null);
    void loadNotes();
  }, [loadNotes]);

  function startEdit(item: AdminNoteRow) {
    if (updatingId || deletingId) return;
    setActionError(null);
    setActionNotice(null);
    setEditingId(item.id);
    setEditState(toFormState(item));
  }

  function cancelEdit() {
    if (updatingId || deletingId) return;
    setEditingId(null);
    setEditState(null);
  }

  function setEditField(updater: (prev: FormState) => FormState) {
    setEditState((prev) => (prev ? updater(prev) : prev));
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
        body: JSON.stringify({
          ...formState,
          contextType,
          contextRef: normalizedContextRef,
        }),
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
    const confirmed = window.confirm(`Delete note "${item.title}"?`);
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

  if (!normalizedContextRef || authorized === false || authorized === null) {
    return null;
  }

  const inheritedModuleCount =
    contextType === "course_lesson"
      ? items.filter((item) => item.context_type === "course_module").length
      : 0;

  return (
    <section
      data-testid="admin-context-notes-panel"
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Admin notes
          </h3>
          <p className="mt-1 text-sm text-slate-700">{contextLabel}</p>
          <p className="text-xs text-slate-500">
            {items.length} attached note(s)
            {inheritedModuleCount > 0 ? ` · ${inheritedModuleCount} inherited from module` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          data-testid="admin-context-notes-toggle"
        >
          {expanded ? "Collapse notes" : "Show notes"}
        </button>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-4">
          {!schemaReady && warning ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {warning}
            </p>
          ) : null}

          {loading ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Loading notes…
            </p>
          ) : null}

          {!loading && error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
              <p className="text-sm text-rose-700">{error}</p>
              <button
                type="button"
                onClick={() => void loadNotes()}
                className="mt-2 inline-flex h-8 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700"
              >
                Retry
              </button>
            </div>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              No admin notes attached yet.
            </p>
          ) : null}

          {actionError ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {actionError}
            </p>
          ) : null}

          {actionNotice ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {actionNotice}
            </p>
          ) : null}

          {!loading && !error && items.length > 0 ? (
            <ul className="space-y-2">
              {items.map((item) => {
                const isUpdating = updatingId === item.id;
                const isDeleting = deletingId === item.id;
                const isEditing = editingId === item.id && editState !== null;
                return (
                  <li
                    key={item.id}
                    className={`rounded-xl border px-3 py-2 ${
                      item.is_done
                        ? "border-emerald-200 bg-emerald-50/40"
                        : "border-slate-200 bg-slate-50/70"
                    }`}
                    data-testid="admin-context-note-item"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">
                          {item.category} · {formatDateLabel(item.note_date)}
                        </p>
                        {contextType === "course_lesson" &&
                        item.context_type === "course_module" ? (
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            Inherited from module
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
                          onClick={() => startEdit(item)}
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
                        onSubmit={(e) => {
                          e.preventDefault();
                          void saveEdit(item.id);
                        }}
                        data-testid="admin-context-note-edit-form"
                      >
                        <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                          <span>Edit title</span>
                          <input
                            type="text"
                            required
                            value={editState.title}
                            onChange={(e) =>
                              setEditField((prev) => ({ ...prev, title: e.target.value }))
                            }
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          />
                        </label>

                        <label className="space-y-1 text-xs font-medium text-slate-700">
                          <span>Edit category</span>
                          <input
                            type="text"
                            list="admin-context-note-category-options"
                            value={editState.category}
                            onChange={(e) =>
                              setEditField((prev) => ({ ...prev, category: e.target.value }))
                            }
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          />
                        </label>

                        <label className="space-y-1 text-xs font-medium text-slate-700">
                          <span>Edit date</span>
                          <input
                            type="date"
                            required
                            value={editState.noteDate}
                            onChange={(e) =>
                              setEditField((prev) => ({ ...prev, noteDate: e.target.value }))
                            }
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          />
                        </label>

                        <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                          <span>Edit text</span>
                          <textarea
                            rows={3}
                            value={editState.body}
                            onChange={(e) =>
                              setEditField((prev) => ({ ...prev, body: e.target.value }))
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                          />
                        </label>

                        <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 sm:col-span-2">
                          <input
                            type="checkbox"
                            checked={editState.isDone}
                            onChange={(e) =>
                              setEditField((prev) => ({ ...prev, isDone: e.target.checked }))
                            }
                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                          />
                          Mark as done
                        </label>

                        <div className="flex items-center gap-2 sm:col-span-2">
                          <button
                            type="submit"
                            disabled={Boolean(updatingId || deletingId)}
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                          >
                            {isUpdating ? "Saving…" : "Save changes"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={Boolean(updatingId || deletingId)}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : item.body ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.body}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
            <h4 className="text-sm font-semibold text-slate-900">Add note</h4>
            <p className="mt-1 text-xs text-slate-600">
              Save an admin reminder directly on this item.
            </p>
            <form
              className="mt-3 grid gap-3 sm:grid-cols-2"
              onSubmit={handleCreate}
              data-testid="admin-context-note-create-form"
            >
              <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                <span>Title</span>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="What should be changed?"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                />
              </label>

              <label className="space-y-1 text-xs font-medium text-slate-700">
                <span>Category</span>
                <input
                  type="text"
                  list="admin-context-note-category-options"
                  value={formState.category}
                  onChange={(e) => setFormState((prev) => ({ ...prev, category: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                />
              </label>

              <label className="space-y-1 text-xs font-medium text-slate-700">
                <span>Date</span>
                <input
                  type="date"
                  value={formState.noteDate}
                  onChange={(e) => setFormState((prev) => ({ ...prev, noteDate: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                />
              </label>

              <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                <span>Text</span>
                <textarea
                  rows={3}
                  value={formState.body}
                  onChange={(e) => setFormState((prev) => ({ ...prev, body: e.target.value }))}
                  placeholder="Write details you need to remember."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={formState.isDone}
                  onChange={(e) => setFormState((prev) => ({ ...prev, isDone: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Mark as done
              </label>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting || !schemaReady}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {submitting ? "Saving…" : "Save note"}
                </button>
              </div>
            </form>

            <datalist id="admin-context-note-category-options">
              {categoryOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
        </div>
      ) : null}
    </section>
  );
}
