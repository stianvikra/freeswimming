"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminNoteClipboardPasteButton from "@/components/admin/AdminNoteClipboardPasteButton";
import AdminNoteQuickCaptureLauncher from "@/components/admin/AdminNoteQuickCaptureLauncher";
import { hasRequiredAdminRole, type AdminRole } from "@/lib/admin/access";
import type { AdminCategoryRow } from "@/lib/admin/categories";
import {
  extractAdminNoteClipboardImage,
  prepareAdminNoteImageFile,
} from "@/lib/admin/note-compose";
import type { AdminNoteContextType } from "@/lib/admin/note-context";
import { uploadAdminNoteFiles } from "@/lib/admin/notes-client";
import {
  ADMIN_NOTE_PRIORITY_VALUES,
  type AdminNoteItem,
  type AdminNotePriority,
} from "@/lib/admin/notes";

type AdminNotesResponse =
  | {
      ok: true;
      role: AdminRole;
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
      item: AdminNoteItem;
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
  priority: AdminNotePriority;
  isDone: boolean;
};

type PendingImage = {
  file: File;
  previewUrl: string;
};

type PendingImageRecovery = {
  noteId: string;
  noteTitle: string;
};

function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

const INITIAL_FORM: FormState = {
  title: "",
  body: "",
  category: "General",
  noteDate: todayDateInputValue(),
  priority: "normal",
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

function toFormState(note: AdminNoteItem): FormState {
  return {
    title: note.title,
    body: note.body,
    category: note.category,
    noteDate: note.note_date,
    priority: note.priority,
    isDone: note.is_done,
  };
}

function formatPriorityLabel(priority: AdminNotePriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
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
  const [items, setItems] = useState<AdminNoteItem[]>([]);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [createFormExpanded, setCreateFormExpanded] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<FormState | null>(null);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [pendingImageRecovery, setPendingImageRecovery] = useState<PendingImageRecovery | null>(
    null
  );

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
    setPendingImageRecovery(null);
    clearPendingImage();

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
        setAdminRole(null);
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
      setAdminRole(payload.role);
      setItems(payload.items);
      setSchemaReady(payload.schemaReady !== false);
      setWarning(payload.warning ?? null);
      setCreateFormExpanded(payload.items.length === 0);

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
      setAdminRole(null);
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

  useEffect(() => {
    return () => {
      if (pendingImage?.previewUrl) {
        URL.revokeObjectURL(pendingImage.previewUrl);
      }
    };
  }, [pendingImage]);

  useEffect(() => {
    if (!actionNotice) return;

    const timeoutId = window.setTimeout(() => {
      setActionNotice(null);
    }, 4_500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [actionNotice]);

  function setPendingImageFromFile(file: File) {
    setPendingImage((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }

      return {
        file,
        previewUrl: URL.createObjectURL(file),
      };
    });
  }

  function clearPendingImage() {
    setPendingImage((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return null;
    });
  }

  function handleCreateFormPaste(event: React.ClipboardEvent<HTMLFormElement>) {
    const result = extractAdminNoteClipboardImage({
      clipboardData: event.clipboardData,
    });

    if (!result.matched) {
      return;
    }

    event.preventDefault();

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setActionError(null);
    setPendingImageRecovery(null);
    setPendingImageFromFile(result.file);
  }

  function handlePendingImageSelection(files: FileList | null) {
    const selectedFile = files?.[0];
    if (!selectedFile) return;

    const prepared = prepareAdminNoteImageFile({
      file: selectedFile,
    });

    if (!prepared.ok) {
      setActionError(prepared.error);
      return;
    }

    setActionError(null);
    setPendingImageRecovery(null);
    setPendingImageFromFile(prepared.file);
  }

  async function uploadPendingImage(noteId: string) {
    if (!pendingImage) {
      throw new Error("No image is ready to upload.");
    }

    return uploadAdminNoteFiles({
      noteId,
      files: [pendingImage.file],
    });
  }

  async function retryPendingImageUpload() {
    if (!pendingImageRecovery || !pendingImage || submitting) return;

    setSubmitting(true);
    setActionError(null);

    try {
      const updatedItem = await uploadPendingImage(pendingImageRecovery.noteId);
      setItems((prev) => prev.map((entry) => (entry.id === updatedItem.id ? updatedItem : entry)));
      setPendingImageRecovery(null);
      clearPendingImage();
      setCreateFormExpanded(false);
      setActionNotice("Note saved.");
    } catch (uploadError) {
      setActionError(
        uploadError instanceof Error ? uploadError.message : "Could not upload image."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(item: AdminNoteItem) {
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

      if (pendingImage) {
        try {
          const updatedItem = await uploadPendingImage(payload.item.id);
          setItems((prev) => [updatedItem, ...prev.filter((entry) => entry.id !== updatedItem.id)]);
          clearPendingImage();
          setPendingImageRecovery(null);
        } catch (uploadError) {
          setItems((prev) => [
            payload.item,
            ...prev.filter((entry) => entry.id !== payload.item.id),
          ]);
          setPendingImageRecovery({
            noteId: payload.item.id,
            noteTitle: payload.item.title,
          });
          setCreateFormExpanded(true);
          setActionError(
            uploadError instanceof Error
              ? `Note saved, but ${uploadError.message.toLowerCase()} Retry image upload or remove the staged image.`
              : "Note saved, but image upload failed. Retry image upload or remove the staged image."
          );
          setFormState(INITIAL_FORM);
          return;
        }
      } else {
        setItems((prev) => [payload.item, ...prev.filter((entry) => entry.id !== payload.item.id)]);
      }

      setFormState(INITIAL_FORM);
      setPendingImageRecovery(null);
      clearPendingImage();
      setCreateFormExpanded(false);
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

  async function toggleDone(item: AdminNoteItem) {
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

  async function handleDelete(item: AdminNoteItem) {
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

      setItems((prev) => {
        const nextItems = prev.filter((entry) => entry.id !== payload.id);
        if (nextItems.length === 0) {
          setCreateFormExpanded(true);
        }
        return nextItems;
      });
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
  const canMutateNotes = Boolean(adminRole && hasRequiredAdminRole(adminRole, "editor"));

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
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AdminNoteQuickCaptureLauncher
            adminRole={adminRole}
            contextType={contextType}
            contextRef={normalizedContextRef}
            contextLabel={contextLabel}
            triggerLabel="Quick note"
            onSaved={(item) => {
              setItems((prev) => [item, ...prev.filter((entry) => entry.id !== item.id)]);
              setActionError(null);
              setCreateFormExpanded(false);
              setActionNotice("Quick note saved.");
            }}
          />
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            data-testid="admin-context-notes-toggle"
          >
            {expanded ? "Collapse notes" : "Show notes"}
          </button>
        </div>
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

          {canMutateNotes ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Add note</h4>
                  <p className="mt-1 text-xs text-slate-600">
                    Save an admin reminder directly on this item.
                  </p>
                </div>
                {items.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setCreateFormExpanded((prev) => !prev)}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    data-testid="admin-context-note-create-toggle"
                  >
                    {createFormExpanded ? "Collapse add note" : "Expand add note"}
                  </button>
                ) : null}
              </div>

              {createFormExpanded ? (
                <form
                  className="mt-3 grid gap-3 sm:grid-cols-2"
                  onSubmit={handleCreate}
                  onPasteCapture={handleCreateFormPaste}
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
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    />
                  </label>

                  <label className="space-y-1 text-xs font-medium text-slate-700">
                    <span>Date</span>
                    <input
                      type="date"
                      value={formState.noteDate}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, noteDate: e.target.value }))
                      }
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    />
                  </label>

                  <label className="space-y-1 text-xs font-medium text-slate-700">
                    <span>Priority</span>
                    <select
                      value={formState.priority}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          priority: e.target.value as AdminNotePriority,
                        }))
                      }
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
                    <span>Text</span>
                    <textarea
                      rows={3}
                      value={formState.body}
                      onChange={(e) => setFormState((prev) => ({ ...prev, body: e.target.value }))}
                      placeholder="Write details you need to remember."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                  </label>

                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Image evidence
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          Paste from clipboard or upload one image before save.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <AdminNoteClipboardPasteButton
                          buttonTestId="admin-context-note-paste-image"
                          onPasteReady={async (file) => {
                            setActionError(null);
                            setPendingImageRecovery(null);
                            setPendingImageFromFile(file);
                          }}
                          onError={(message) => {
                            setActionError(message);
                          }}
                        />
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                          <span>Upload image</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="sr-only"
                            onChange={(event) => {
                              handlePendingImageSelection(event.target.files);
                              event.currentTarget.value = "";
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {!pendingImage ? (
                      <p className="mt-3 text-xs text-slate-600">
                        No image attached yet. Copy a screenshot first if you want to paste it from
                        clipboard.
                      </p>
                    ) : (
                      <div
                        className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                        data-testid="admin-context-note-image-preview"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={pendingImage.previewUrl}
                              alt="Pending note image preview"
                              className="h-14 w-14 rounded-lg object-cover"
                            />
                            <div>
                              <p className="text-xs font-semibold text-slate-900">
                                Image ready to attach
                              </p>
                              <p className="mt-1 text-[11px] text-slate-600">
                                {pendingImageRecovery
                                  ? `The note "${pendingImageRecovery.noteTitle}" is already saved. Retry the image upload or remove the staged image.`
                                  : "The next note save will upload this image as an admin-only attachment."}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {pendingImageRecovery ? (
                              <button
                                type="button"
                                onClick={() => {
                                  void retryPendingImageUpload();
                                }}
                                disabled={submitting}
                                className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                              >
                                {submitting ? "Retrying…" : "Retry upload"}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                setPendingImageRecovery(null);
                                clearPendingImage();
                              }}
                              disabled={submitting}
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Remove image
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={formState.isDone}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, isDone: e.target.checked }))
                      }
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
              ) : (
                <p className="mt-3 text-xs text-slate-600">
                  Keep the compose form tucked away while you review existing notes, then expand it
                  again when you are ready to add a new one.
                </p>
              )}

              <datalist id="admin-context-note-category-options">
                {categoryOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
          ) : null}

          {actionError ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {actionError}
            </p>
          ) : null}

          {actionNotice ? (
            <p
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
              data-testid="admin-context-note-action-notice"
            >
              {actionNotice}
            </p>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              No admin notes attached yet.
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
                          {item.category} · {formatPriorityLabel(item.priority)} ·{" "}
                          {formatDateLabel(item.note_date)}
                        </p>
                        {contextType === "course_lesson" &&
                        item.context_type === "course_module" ? (
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            Inherited from module
                          </p>
                        ) : null}
                      </div>
                      {canMutateNotes ? (
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
                      ) : (
                        <p className="text-xs font-medium text-slate-500">Read only</p>
                      )}
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

                        <label className="space-y-1 text-xs font-medium text-slate-700">
                          <span>Priority</span>
                          <select
                            value={editState.priority}
                            onChange={(e) =>
                              setEditField((prev) => ({
                                ...prev,
                                priority: e.target.value as AdminNotePriority,
                              }))
                            }
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

          {!canMutateNotes ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Viewer role can review contextual notes here, but only editors/admins can create or
              change them.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
