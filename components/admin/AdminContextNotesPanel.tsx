"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminNoteClipboardPasteButton from "@/components/admin/AdminNoteClipboardPasteButton";
import AdminNoteQuickCaptureLauncher from "@/components/admin/AdminNoteQuickCaptureLauncher";
import { hasRequiredAdminRole, type AdminRole } from "@/lib/admin/access";
import type { AdminCategoryRow } from "@/lib/admin/categories";
import {
  createAdminNoteStagedImages,
  extractAdminNoteClipboardImage,
  prepareAdminNoteImageFiles,
  revokeAdminNoteStagedImages,
  type AdminNoteStagedImage,
} from "@/lib/admin/note-compose";
import type { AdminNoteContextType } from "@/lib/admin/note-context";
import { uploadAdminNoteFiles } from "@/lib/admin/notes-client";
import {
  ADMIN_NOTE_ATTACHMENT_MAX_FILES,
  ADMIN_NOTE_PRIORITY_VALUES,
  buildAdminNoteAttachmentEvidenceSummary,
  buildAdminNoteAttachmentOrdinalLabel,
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

type PendingImage = AdminNoteStagedImage;

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

type ContextualCreateDraftSnapshot = {
  formState: FormState;
  createFormExpanded: boolean;
};

const contextualCreateDraftCache = new Map<string, ContextualCreateDraftSnapshot>();

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

function formatImageCountLabel(count: number): string {
  return `${count} image${count === 1 ? "" : "s"}`;
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
  const contextKey = `${contextType}:${normalizedContextRef}`;
  const cachedCreateDraft = contextualCreateDraftCache.get(contextKey);

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
  const [formState, setFormState] = useState<FormState>(
    () => cachedCreateDraft?.formState ?? INITIAL_FORM
  );
  const [createFormExpanded, setCreateFormExpanded] = useState(
    () => cachedCreateDraft?.createFormExpanded ?? true
  );
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingNoteId, setUploadingNoteId] = useState<string | null>(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<FormState | null>(null);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [pendingImageRecovery, setPendingImageRecovery] = useState<PendingImageRecovery | null>(
    null
  );
  const lastLoadedContextKeyRef = useRef<string | null>(null);
  const createDraftPresentRef = useRef(false);
  const pendingImagesRef = useRef<PendingImage[]>([]);

  useEffect(() => {
    createDraftPresentRef.current =
      formState.title.trim().length > 0 ||
      formState.body.trim().length > 0 ||
      formState.category !== INITIAL_FORM.category ||
      formState.noteDate !== INITIAL_FORM.noteDate ||
      formState.priority !== INITIAL_FORM.priority ||
      formState.isDone !== INITIAL_FORM.isDone ||
      pendingImages.length > 0 ||
      pendingImageRecovery !== null;
  }, [formState, pendingImageRecovery, pendingImages.length]);

  useEffect(() => {
    const cachedDraft = contextualCreateDraftCache.get(contextKey);
    setFormState(cachedDraft?.formState ?? INITIAL_FORM);
    setCreateFormExpanded(cachedDraft?.createFormExpanded ?? true);
  }, [contextKey]);

  useEffect(() => {
    contextualCreateDraftCache.set(contextKey, {
      formState,
      createFormExpanded,
    });
  }, [contextKey, createFormExpanded, formState]);

  const loadNotes = useCallback(async () => {
    if (!normalizedContextRef) {
      setAuthorized(false);
      return;
    }

    const nextContextKey = `${contextType}:${normalizedContextRef}`;
    const previousContextKey = lastLoadedContextKeyRef.current;
    const contextChanged = previousContextKey !== null && previousContextKey !== nextContextKey;
    const preserveComposeDraft = createDraftPresentRef.current;

    setLoading(true);
    setError(null);
    setWarning(null);

    if (contextChanged) {
      setItems([]);
      setCategoryOptions([]);
      setEditingId(null);
      setEditState(null);
      setActionError(null);
      setActionNotice(null);

      if (!preserveComposeDraft) {
        setFormState(INITIAL_FORM);
        setPendingImageRecovery(null);
        clearPendingImages();
      }
    }

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
      const cachedDraft = contextualCreateDraftCache.get(nextContextKey);
      if (previousContextKey === null) {
        setCreateFormExpanded(cachedDraft?.createFormExpanded ?? payload.items.length === 0);
      } else if (contextChanged) {
        setCreateFormExpanded(preserveComposeDraft ? true : payload.items.length === 0);
      }
      lastLoadedContextKeyRef.current = nextContextKey;

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
    void loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);

  useEffect(() => {
    return () => {
      revokeAdminNoteStagedImages(pendingImagesRef.current);
    };
  }, []);

  useEffect(() => {
    if (!actionNotice) return;

    const timeoutId = window.setTimeout(() => {
      setActionNotice(null);
    }, 4_500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [actionNotice]);

  function appendPendingImages(files: Iterable<Blob | File>) {
    const prepared = prepareAdminNoteImageFiles({
      files,
      currentCount: pendingImages.length,
    });

    if (!prepared.ok) {
      setActionError(prepared.error);
      return;
    }

    if (prepared.files.length === 0) {
      return;
    }

    setActionError(null);
    setPendingImages((current) => [...current, ...createAdminNoteStagedImages(prepared.files)]);
  }

  function clearPendingImages() {
    setPendingImages((current) => {
      revokeAdminNoteStagedImages(current);
      return [];
    });
  }

  function removePendingImage(imageId: string) {
    let removedImage: PendingImage | null = null;
    let nextCount = 0;

    setPendingImages((current) => {
      const next = current.filter((image) => {
        if (image.id === imageId) {
          removedImage = image;
          return false;
        }
        return true;
      });
      nextCount = next.length;
      return next;
    });

    if (removedImage) {
      revokeAdminNoteStagedImages([removedImage]);
    }

    if (pendingImageRecovery && nextCount === 0) {
      setPendingImageRecovery(null);
      setActionError(null);
      setActionNotice("Note saved without staged images.");
      setCreateFormExpanded(false);
    }
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
    appendPendingImages([result.file]);
  }

  function handlePendingImageSelection(files: FileList | null) {
    if (!files || files.length === 0) return;
    appendPendingImages(Array.from(files));
  }

  async function uploadPendingImages(noteId: string) {
    if (pendingImages.length === 0) {
      throw new Error("No images are ready to upload.");
    }

    return uploadAdminNoteFiles({
      noteId,
      files: pendingImages.map((image) => image.file),
    });
  }

  async function retryPendingImageUpload() {
    if (!pendingImageRecovery || pendingImages.length === 0 || submitting) return;

    setSubmitting(true);
    setActionError(null);

    try {
      const updatedItem = await uploadPendingImages(pendingImageRecovery.noteId);
      setItems((prev) => prev.map((entry) => (entry.id === updatedItem.id ? updatedItem : entry)));
      setPendingImageRecovery(null);
      clearPendingImages();
      setCreateFormExpanded(false);
      setActionNotice(
        pendingImages.length === 1
          ? "Image attached to saved note."
          : "Images attached to saved note."
      );
    } catch (uploadError) {
      setActionError(
        uploadError instanceof Error ? uploadError.message : "Could not upload images."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(item: AdminNoteItem) {
    if (updatingId || deletingId || uploadingNoteId || deletingAttachmentId) return;
    setActionError(null);
    setActionNotice(null);
    setEditingId(item.id);
    setEditState(toFormState(item));
  }

  function cancelEdit() {
    if (updatingId || deletingId || uploadingNoteId || deletingAttachmentId) return;
    setEditingId(null);
    setEditState(null);
  }

  function setEditField(updater: (prev: FormState) => FormState) {
    setEditState((prev) => (prev ? updater(prev) : prev));
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || pendingImageRecovery) return;
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

      if (pendingImages.length > 0) {
        try {
          const updatedItem = await uploadPendingImages(payload.item.id);
          setItems((prev) => [updatedItem, ...prev.filter((entry) => entry.id !== updatedItem.id)]);
          clearPendingImages();
          setPendingImageRecovery(null);
          setActionNotice(
            pendingImages.length === 1
              ? "Note saved with image attached."
              : "Note saved with images attached."
          );
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
              ? `Note saved, but ${uploadError.message.toLowerCase()} Retry upload or remove the staged images.`
              : "Note saved, but image upload failed. Retry upload or remove the staged images."
          );
          setFormState(INITIAL_FORM);
          return;
        }
      } else {
        setItems((prev) => [payload.item, ...prev.filter((entry) => entry.id !== payload.item.id)]);
        setActionNotice("Note saved.");
      }

      setFormState(INITIAL_FORM);
      setPendingImageRecovery(null);
      clearPendingImages();
      setCreateFormExpanded(false);
    } catch {
      setActionError("Could not save note.");
    } finally {
      setSubmitting(false);
    }
  }

  async function saveEdit(itemId: string) {
    if (!editState) return;
    if (updatingId || deletingId || uploadingNoteId || deletingAttachmentId) return;

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
    if (updatingId || deletingId || editingId || uploadingNoteId || deletingAttachmentId) return;
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
    if (updatingId || deletingId || uploadingNoteId || deletingAttachmentId) return;
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

  function applyMutatedItem(itemId: string, nextItem: AdminNoteItem | null) {
    setItems((prev) =>
      nextItem
        ? prev.map((entry) => (entry.id === itemId ? nextItem : entry))
        : prev.filter((entry) => entry.id !== itemId)
    );

    if (!nextItem && editingId === itemId) {
      setEditingId(null);
      setEditState(null);
    }
  }

  async function uploadFilesForNote(itemId: string, files: File[]) {
    if (files.length === 0) return null;
    if (uploadingNoteId || deletingAttachmentId || updatingId || deletingId) return null;

    setActionError(null);
    setActionNotice(null);
    setUploadingNoteId(itemId);

    try {
      const updatedItem = await uploadAdminNoteFiles({
        noteId: itemId,
        files,
      });
      applyMutatedItem(itemId, updatedItem);
      setActionNotice(updatedItem.attachments.length === 1 ? "Image uploaded." : "Images uploaded.");
      return updatedItem;
    } catch (uploadError) {
      setActionError(
        uploadError instanceof Error ? uploadError.message : "Could not upload images."
      );
      return null;
    } finally {
      setUploadingNoteId(null);
    }
  }

  async function uploadAttachments(item: AdminNoteItem, files: FileList | null) {
    if (!files || files.length === 0) return;
    await uploadFilesForNote(item.id, Array.from(files));
  }

  function handleEditFormPaste(item: AdminNoteItem, event: React.ClipboardEvent<HTMLFormElement>) {
    const result = extractAdminNoteClipboardImage({
      clipboardData: event.clipboardData,
    });

    if (!result.matched) {
      return;
    }

    event.preventDefault();

    if (!result.ok) {
      setActionError(result.error);
      setActionNotice(null);
      return;
    }

    void uploadFilesForNote(item.id, [result.file]);
  }

  async function deleteAttachment(noteId: string, attachmentId: string) {
    if (uploadingNoteId || deletingAttachmentId || updatingId || deletingId) return;

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
          payload.ok ? "Could not delete image." : (payload.error ?? "Could not delete image.")
        );
        return;
      }

      applyMutatedItem(noteId, {
        ...payload.item,
        attachments: payload.item.attachments.filter(
          (attachment) => attachment.id !== attachmentId
        ),
      });
      setActionNotice("Image deleted.");
    } catch {
      setActionError("Could not delete image.");
    } finally {
      setDeletingAttachmentId(null);
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
                          Paste from clipboard or upload up to {ADMIN_NOTE_ATTACHMENT_MAX_FILES}{" "}
                          images before save.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <AdminNoteClipboardPasteButton
                          buttonTestId="admin-context-note-paste-image"
                          onPasteReady={async (file) => {
                            setActionError(null);
                            appendPendingImages([file]);
                          }}
                          onError={(message) => {
                            setActionError(message);
                          }}
                          disabled={submitting}
                        />
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                          <span>Upload images</span>
                          <input
                            type="file"
                            multiple
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="sr-only"
                            disabled={submitting}
                            onChange={(event) => {
                              handlePendingImageSelection(event.target.files);
                              event.currentTarget.value = "";
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {pendingImages.length === 0 ? (
                      <p className="mt-3 text-xs text-slate-600">
                        No images attached yet. Copy a screenshot first if you want to paste it from
                        clipboard, or upload up to {ADMIN_NOTE_ATTACHMENT_MAX_FILES} files.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-900">
                                {formatImageCountLabel(pendingImages.length)} ready to attach
                              </p>
                              <p className="mt-1 text-[11px] text-slate-600">
                                {pendingImageRecovery
                                  ? `The note "${pendingImageRecovery.noteTitle}" is already saved. Retry upload or remove any staged images you no longer need.`
                                  : "The next note save will upload these images as admin-only attachments."}
                              </p>
                            </div>
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
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {pendingImages.map((image, index) => (
                            <div
                              key={image.id}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                              data-testid="admin-context-note-image-preview"
                            >
                              <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={image.previewUrl}
                                  alt={`Pending note image preview ${index + 1}`}
                                  className="h-14 w-14 rounded-lg object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-slate-900">
                                    {buildAdminNoteAttachmentOrdinalLabel(
                                      index,
                                      pendingImages.length
                                    )}
                                  </p>
                                  <p className="mt-1 truncate text-[11px] text-slate-600">
                                    {image.file.name}
                                  </p>
                                  <p className="mt-1 text-[11px] text-slate-500">
                                    {buildAdminNoteAttachmentEvidenceSummary({
                                      mimeType: image.file.type,
                                      sizeBytes: image.file.size,
                                      locationLabel: "Staged locally",
                                    })}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  removePendingImage(image.id);
                                }}
                                disabled={submitting}
                                className="mt-3 inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Remove image {index + 1}
                              </button>
                            </div>
                          ))}
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
                      disabled={submitting || !schemaReady || Boolean(pendingImageRecovery)}
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
                const isUploading = uploadingNoteId === item.id;
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
                              disabled={Boolean(
                                updatingId ||
                                  deletingId ||
                                  editingId ||
                                  uploadingNoteId ||
                                  deletingAttachmentId
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
                                deletingAttachmentId
                            )}
                            onClick={() => startEdit(item)}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(
                              updatingId || deletingId || uploadingNoteId || deletingAttachmentId
                            )}
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
                        onPasteCapture={(event) => handleEditFormPaste(item, event)}
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

                      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3 sm:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-900">Images</p>
                            <p className="mt-1 text-[11px] text-slate-600">
                              Add or remove image evidence on this saved note.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <AdminNoteClipboardPasteButton
                              buttonTestId="admin-context-note-edit-paste-image"
                              onPasteReady={async (file) => {
                                setActionError(null);
                                setActionNotice(null);
                                await uploadFilesForNote(item.id, [file]);
                              }}
                              onError={(message) => {
                                setActionError(message);
                                setActionNotice(null);
                              }}
                              disabled={Boolean(
                                isUploading || deletingAttachmentId || updatingId || deletingId
                              )}
                            />
                            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                              <span>{isUploading ? "Uploading…" : "Upload images"}</span>
                              <input
                                type="file"
                                multiple
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                className="sr-only"
                                aria-label="Upload images to saved note"
                                data-testid="admin-context-note-edit-attachment-input"
                                disabled={Boolean(
                                  isUploading || deletingAttachmentId || updatingId || deletingId
                                )}
                                onChange={(event) => {
                                  void uploadAttachments(item, event.target.files);
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {item.attachments.length > 0 ? (
                          <ul className="space-y-2">
                            {item.attachments.map((attachment, index) => {
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
                                      <p className="text-[11px] font-semibold text-slate-900">
                                        {buildAdminNoteAttachmentOrdinalLabel(
                                          index,
                                          item.attachments.length
                                        )}
                                      </p>
                                      <p className="truncate text-xs font-medium text-slate-700">
                                        {attachment.file_name}
                                      </p>
                                      <p className="text-[11px] text-slate-500">
                                        {buildAdminNoteAttachmentEvidenceSummary({
                                          mimeType: attachment.mime_type,
                                          sizeBytes: attachment.size_bytes,
                                          createdAt: attachment.created_at,
                                        })}
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
                                      data-testid="admin-context-note-attachment-delete"
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
                          <p className="text-[11px] text-slate-600">No images attached yet.</p>
                        )}
                      </div>

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
                          disabled={Boolean(
                            updatingId || deletingId || uploadingNoteId || deletingAttachmentId
                          )}
                          className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                          {isUpdating ? "Saving…" : "Save changes"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={Boolean(
                            updatingId || deletingId || uploadingNoteId || deletingAttachmentId
                          )}
                          className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                      </form>
                    ) : (
                      <div className="mt-2 space-y-3">
                        {item.body ? (
                          <p className="whitespace-pre-wrap text-sm text-slate-700">{item.body}</p>
                        ) : null}

                        {item.attachments.length > 0 ? (
                          <div className="space-y-2 rounded-lg border border-slate-200 bg-white/80 p-3">
                            <p className="text-xs font-semibold text-slate-700">
                              Admin-only images
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {item.attachments.map((attachment, index) => (
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
                                    <p className="text-[11px] font-semibold text-slate-900">
                                      {buildAdminNoteAttachmentOrdinalLabel(
                                        index,
                                        item.attachments.length
                                      )}
                                    </p>
                                    <p className="truncate text-[11px] font-medium text-slate-700">
                                      {attachment.file_name}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {buildAdminNoteAttachmentEvidenceSummary({
                                        mimeType: attachment.mime_type,
                                        sizeBytes: attachment.size_bytes,
                                        createdAt: attachment.created_at,
                                      })}
                                    </p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
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
