"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminManagerState from "@/components/admin/AdminManagerState";
import AdminNoteClipboardPasteButton from "@/components/admin/AdminNoteClipboardPasteButton";
import AdminNoteQuickCaptureLauncher from "@/components/admin/AdminNoteQuickCaptureLauncher";
import { getMobileActionGroupClass, mobileActionItemClass } from "@/components/ui/actionLayout";
import { cx } from "@/components/ui/cx";
import { hasRequiredAdminRole, type AdminRole } from "@/lib/admin/access";
import type { AdminCategoryRow } from "@/lib/admin/categories";
import {
  ADMIN_NOTES_QUERY_KEYS,
  buildAdminNoteReferenceLabel,
  buildAdminNoteRelatedJumpFilterState,
} from "@/lib/admin/notes-manager";
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

const panelShellClass = "fs-library-card fs-library-card-accent p-4 sm:p-5";
const createPanelClass = "fs-library-card fs-library-card-muted p-4 sm:p-5";
const noteRowClass = "fs-library-card p-4 sm:p-5";
const doneNoteRowClass = "fs-library-card border-emerald-200 bg-emerald-50/50 p-4 sm:p-5";
const fieldLabelClass = "space-y-1 text-xs font-semibold text-[color:var(--fs-color-ink)]";
const fieldClass =
  "h-10 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm text-[color:var(--fs-color-ink-strong)] transition-colors focus:border-[color:var(--fs-border-brand)] focus:outline-none";
const textareaClass =
  "w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 py-2 text-sm text-[color:var(--fs-color-ink-strong)] transition-colors focus:border-[color:var(--fs-border-brand)] focus:outline-none";
const checkboxClass = "h-4 w-4 rounded border-slate-300 text-[color:var(--fs-color-brand-600)]";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-9 items-center justify-center px-3 text-xs font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const primaryActionClass =
  "fs-cta-primary inline-flex min-h-9 items-center justify-center px-3 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const destructiveActionClass =
  "inline-flex min-h-9 items-center justify-center rounded-[var(--fs-radius-control)] border border-rose-200 bg-white/85 px-3 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const innerPanelBaseClass =
  "rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] p-3";
const innerPanelClass = cx(innerPanelBaseClass, "bg-white/80");
const mutedInnerPanelClass = cx(innerPanelBaseClass, "bg-slate-50/70");
const linkClass =
  "font-semibold text-[color:var(--fs-color-brand-700)] underline decoration-slate-300 underline-offset-2 transition hover:text-[color:var(--fs-color-brand-800)]";
const mutedTextClass = "text-[color:var(--fs-color-muted)]";

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

function buildAdminNotesQueueHref(noteId: string, isDone: boolean): string {
  const filters = buildAdminNoteRelatedJumpFilterState({
    noteId,
    isDone,
  });
  const params = new URLSearchParams([["tab", "notes"]]);
  params.set(ADMIN_NOTES_QUERY_KEYS.query, filters.query);
  params.set(ADMIN_NOTES_QUERY_KEYS.status, filters.status);
  return `/admin?${params.toString()}`;
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
      setActionNotice(
        updatedItem.attachments.length === 1 ? "Image uploaded." : "Images uploaded."
      );
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
    <section data-testid="admin-context-notes-panel" className={cx(panelShellClass, className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
            Admin notes
          </h3>
          <p className="mt-1 text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
            {contextLabel}
          </p>
          <p className={cx("text-xs", mutedTextClass)}>
            {items.length} attached note(s)
            {inheritedModuleCount > 0 ? ` · ${inheritedModuleCount} inherited from module` : ""}
          </p>
        </div>
        <div
          className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end"
          data-testid="admin-context-notes-actions"
        >
          <AdminNoteQuickCaptureLauncher
            adminRole={adminRole}
            contextType={contextType}
            contextRef={normalizedContextRef}
            contextLabel={contextLabel}
            triggerLabel="Quick note"
            className="min-w-0"
            triggerClassName={cx(primaryActionClass, "w-full")}
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
            className={cx(secondaryActionClass, "w-full")}
            data-testid="admin-context-notes-toggle"
          >
            {expanded ? "Collapse notes" : "Show notes"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-4">
          {!schemaReady && warning ? (
            <AdminManagerState tone="warning" density="compact" className="!mt-0">
              {warning}
            </AdminManagerState>
          ) : null}

          {loading ? (
            <AdminManagerState tone="loading" density="compact" className="!mt-0">
              Loading notes…
            </AdminManagerState>
          ) : null}

          {!loading && error ? (
            <AdminManagerState
              tone="error"
              density="compact"
              className="!mt-0"
              actionsClassName="mt-2"
              actions={
                <button
                  type="button"
                  onClick={() => void loadNotes()}
                  className={destructiveActionClass}
                >
                  Retry
                </button>
              }
            >
              {error}
            </AdminManagerState>
          ) : null}

          {canMutateNotes ? (
            <div className={createPanelClass} data-testid="admin-context-note-create-panel">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                    Add note
                  </h4>
                  <p className={cx("mt-1 text-xs", mutedTextClass)}>
                    Save an admin reminder directly on this item.
                  </p>
                </div>
                {items.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setCreateFormExpanded((prev) => !prev)}
                    className={secondaryActionClass}
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
                  <label className={cx(fieldLabelClass, "sm:col-span-2")}>
                    <span>Title</span>
                    <input
                      type="text"
                      required
                      value={formState.title}
                      onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="What should be changed?"
                      className={fieldClass}
                    />
                  </label>

                  <label className={fieldLabelClass}>
                    <span>Category</span>
                    <input
                      type="text"
                      list="admin-context-note-category-options"
                      value={formState.category}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className={fieldClass}
                    />
                  </label>

                  <label className={fieldLabelClass}>
                    <span>Date</span>
                    <input
                      type="date"
                      value={formState.noteDate}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, noteDate: e.target.value }))
                      }
                      className={fieldClass}
                    />
                  </label>

                  <label className={fieldLabelClass}>
                    <span>Priority</span>
                    <select
                      value={formState.priority}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          priority: e.target.value as AdminNotePriority,
                        }))
                      }
                      className={fieldClass}
                    >
                      {ADMIN_NOTE_PRIORITY_VALUES.map((priority) => (
                        <option key={priority} value={priority}>
                          {formatPriorityLabel(priority)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={cx(fieldLabelClass, "sm:col-span-2")}>
                    <span>Text</span>
                    <textarea
                      rows={3}
                      value={formState.body}
                      onChange={(e) => setFormState((prev) => ({ ...prev, body: e.target.value }))}
                      placeholder="Write details you need to remember."
                      className={textareaClass}
                    />
                  </label>

                  <div className={cx(innerPanelClass, "sm:col-span-2")}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-[color:var(--fs-color-ink-strong)]">
                          Image evidence
                        </p>
                        <p className={cx("mt-1 text-xs", mutedTextClass)}>
                          Paste from clipboard or upload up to {ADMIN_NOTE_ATTACHMENT_MAX_FILES}{" "}
                          images before save.
                        </p>
                      </div>
                      <div className={getMobileActionGroupClass(2, { stackOnMobile: true })}>
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
                        <label
                          className={cx(
                            secondaryActionClass,
                            mobileActionItemClass,
                            "cursor-pointer"
                          )}
                        >
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
                      <p className={cx("mt-3 text-xs", mutedTextClass)}>
                        No images attached yet. Copy a screenshot first if you want to paste it from
                        clipboard, or upload up to {ADMIN_NOTE_ATTACHMENT_MAX_FILES} files.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        <div className={mutedInnerPanelClass}>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-[color:var(--fs-color-ink-strong)]">
                                {formatImageCountLabel(pendingImages.length)} ready to attach
                              </p>
                              <p className={cx("mt-1 text-[11px]", mutedTextClass)}>
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
                                className={primaryActionClass}
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
                              className={mutedInnerPanelClass}
                              data-testid="admin-context-note-image-preview"
                            >
                              <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={image.previewUrl}
                                  alt={`Pending note image preview ${index + 1}`}
                                  className="h-14 w-14 rounded-[var(--fs-radius-control)] object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-[color:var(--fs-color-ink-strong)]">
                                    {buildAdminNoteAttachmentOrdinalLabel(
                                      index,
                                      pendingImages.length
                                    )}
                                  </p>
                                  <p className={cx("mt-1 truncate text-[11px]", mutedTextClass)}>
                                    {image.file.name}
                                  </p>
                                  <p className={cx("mt-1 text-[11px]", mutedTextClass)}>
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
                                className={cx(secondaryActionClass, "mt-3")}
                              >
                                Remove image {index + 1}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs font-medium text-[color:var(--fs-color-ink)] sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={formState.isDone}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, isDone: e.target.checked }))
                      }
                      className={checkboxClass}
                    />
                    Mark as done
                  </label>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={submitting || !schemaReady || Boolean(pendingImageRecovery)}
                      className={primaryActionClass}
                    >
                      {submitting ? "Saving…" : "Save note"}
                    </button>
                  </div>
                </form>
              ) : (
                <p className={cx("mt-3 text-xs", mutedTextClass)}>
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
            <AdminManagerState
              tone="error"
              announcement="polite"
              density="compact"
              className="!mt-0"
            >
              {actionError}
            </AdminManagerState>
          ) : null}

          {actionNotice ? (
            <AdminManagerState
              tone="success"
              density="compact"
              className="!mt-0"
              testId="admin-context-note-action-notice"
            >
              {actionNotice}
            </AdminManagerState>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <AdminManagerState
              tone="empty"
              density="compact"
              className="!mt-0"
              testId="admin-context-notes-empty-state"
            >
              No admin notes attached yet.
            </AdminManagerState>
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
                    className={item.is_done ? doneNoteRowClass : noteRowClass}
                    data-testid="admin-context-note-item"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                          {item.title}
                        </p>
                        <p className={cx("text-xs", mutedTextClass)}>
                          {item.category} · {formatPriorityLabel(item.priority)} ·{" "}
                          {formatDateLabel(item.note_date)}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                          <span className={cx("font-medium", mutedTextClass)}>
                            {buildAdminNoteReferenceLabel(item.id)}
                          </span>
                          <a
                            href={buildAdminNotesQueueHref(item.id, item.is_done)}
                            className={linkClass}
                          >
                            Open in Notes
                          </a>
                        </div>
                        {contextType === "course_lesson" &&
                        item.context_type === "course_module" ? (
                          <p className={cx("text-[11px] font-semibold", mutedTextClass)}>
                            Inherited from module
                          </p>
                        ) : null}
                      </div>
                      {canMutateNotes ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-2 text-xs font-medium text-[color:var(--fs-color-ink)]">
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
                              className={checkboxClass}
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
                            className={secondaryActionClass}
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
                            className={destructiveActionClass}
                          >
                            {isDeleting ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      ) : (
                        <p className={cx("text-xs font-semibold", mutedTextClass)}>Read only</p>
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
                        <label className={cx(fieldLabelClass, "sm:col-span-2")}>
                          <span>Edit title</span>
                          <input
                            type="text"
                            required
                            value={editState.title}
                            onChange={(e) =>
                              setEditField((prev) => ({ ...prev, title: e.target.value }))
                            }
                            className={fieldClass}
                          />
                        </label>

                        <label className={fieldLabelClass}>
                          <span>Edit category</span>
                          <input
                            type="text"
                            list="admin-context-note-category-options"
                            value={editState.category}
                            onChange={(e) =>
                              setEditField((prev) => ({ ...prev, category: e.target.value }))
                            }
                            className={fieldClass}
                          />
                        </label>

                        <label className={fieldLabelClass}>
                          <span>Edit date</span>
                          <input
                            type="date"
                            required
                            value={editState.noteDate}
                            onChange={(e) =>
                              setEditField((prev) => ({ ...prev, noteDate: e.target.value }))
                            }
                            className={fieldClass}
                          />
                        </label>

                        <label className={fieldLabelClass}>
                          <span>Priority</span>
                          <select
                            value={editState.priority}
                            onChange={(e) =>
                              setEditField((prev) => ({
                                ...prev,
                                priority: e.target.value as AdminNotePriority,
                              }))
                            }
                            className={fieldClass}
                          >
                            {ADMIN_NOTE_PRIORITY_VALUES.map((priority) => (
                              <option key={priority} value={priority}>
                                {formatPriorityLabel(priority)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className={cx(fieldLabelClass, "sm:col-span-2")}>
                          <span>Edit text</span>
                          <textarea
                            rows={3}
                            value={editState.body}
                            onChange={(e) =>
                              setEditField((prev) => ({ ...prev, body: e.target.value }))
                            }
                            className={textareaClass}
                          />
                        </label>

                        <div className={cx(mutedInnerPanelClass, "space-y-2 sm:col-span-2")}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-[color:var(--fs-color-ink-strong)]">
                                Images
                              </p>
                              <p className={cx("mt-1 text-[11px]", mutedTextClass)}>
                                Add or remove image evidence on this saved note.
                              </p>
                            </div>
                            <div className={getMobileActionGroupClass(2, { stackOnMobile: true })}>
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
                              <label
                                className={cx(
                                  secondaryActionClass,
                                  mobileActionItemClass,
                                  "cursor-pointer"
                                )}
                              >
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
                                    className={cx(
                                      innerPanelClass,
                                      "flex flex-wrap items-center justify-between gap-3"
                                    )}
                                  >
                                    <div className="flex min-w-0 items-center gap-3">
                                      {attachment.signed_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={attachment.signed_url}
                                          alt={attachment.file_name}
                                          className="h-12 w-12 rounded-[var(--fs-radius-control)] object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-[var(--fs-radius-control)] bg-slate-200 text-[10px] font-medium text-slate-600">
                                          No preview
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-semibold text-[color:var(--fs-color-ink-strong)]">
                                          {buildAdminNoteAttachmentOrdinalLabel(
                                            index,
                                            item.attachments.length
                                          )}
                                        </p>
                                        <p className="truncate text-xs font-medium text-[color:var(--fs-color-ink)]">
                                          {attachment.file_name}
                                        </p>
                                        <p className={cx("text-[11px]", mutedTextClass)}>
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
                                          className={secondaryActionClass}
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
                                        className={destructiveActionClass}
                                      >
                                        {isDeletingAttachment ? "Deleting…" : "Delete image"}
                                      </button>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className={cx("text-[11px]", mutedTextClass)}>
                              No images attached yet.
                            </p>
                          )}
                        </div>

                        <label className="inline-flex items-center gap-2 text-xs font-medium text-[color:var(--fs-color-ink)] sm:col-span-2">
                          <input
                            type="checkbox"
                            checked={editState.isDone}
                            onChange={(e) =>
                              setEditField((prev) => ({ ...prev, isDone: e.target.checked }))
                            }
                            className={checkboxClass}
                          />
                          Mark as done
                        </label>

                        <div className="flex items-center gap-2 sm:col-span-2">
                          <button
                            type="submit"
                            disabled={Boolean(
                              updatingId || deletingId || uploadingNoteId || deletingAttachmentId
                            )}
                            className={primaryActionClass}
                          >
                            {isUpdating ? "Saving…" : "Save changes"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={Boolean(
                              updatingId || deletingId || uploadingNoteId || deletingAttachmentId
                            )}
                            className={secondaryActionClass}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-2 space-y-3">
                        {item.body ? (
                          <p className="text-sm whitespace-pre-wrap text-[color:var(--fs-color-ink)]">
                            {item.body}
                          </p>
                        ) : null}

                        {item.related_notes.length > 0 ? (
                          <div className={cx(innerPanelClass, "space-y-2")}>
                            <p className="text-xs font-semibold text-[color:var(--fs-color-ink)]">
                              Related notes
                            </p>
                            <ul className="space-y-2">
                              {item.related_notes.map((relatedNote) => (
                                <li key={relatedNote.id} className={mutedInnerPanelClass}>
                                  <a
                                    href={buildAdminNotesQueueHref(
                                      relatedNote.id,
                                      relatedNote.is_done
                                    )}
                                    className={cx(linkClass, "text-xs")}
                                  >
                                    {relatedNote.title}
                                  </a>
                                  <p className={cx("mt-1 text-[11px]", mutedTextClass)}>
                                    {formatPriorityLabel(relatedNote.priority)} ·{" "}
                                    {buildAdminNoteReferenceLabel(relatedNote.id)}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {item.attachments.length > 0 ? (
                          <div className={cx(innerPanelClass, "space-y-2")}>
                            <p className="text-xs font-semibold text-[color:var(--fs-color-ink)]">
                              Admin-only images
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {item.attachments.map((attachment, index) => (
                                <a
                                  key={attachment.id}
                                  href={attachment.signed_url ?? undefined}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={cx(
                                    mutedInnerPanelClass,
                                    "group flex w-32 flex-col gap-2 p-2"
                                  )}
                                >
                                  {attachment.signed_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={attachment.signed_url}
                                      alt={attachment.file_name}
                                      className="h-20 w-full rounded-[var(--fs-radius-control)] object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-20 w-full items-center justify-center rounded-[var(--fs-radius-control)] bg-slate-200 text-[11px] font-medium text-slate-600">
                                      Preview unavailable
                                    </div>
                                  )}
                                  <div className="space-y-1">
                                    <p className="text-[11px] font-semibold text-[color:var(--fs-color-ink-strong)]">
                                      {buildAdminNoteAttachmentOrdinalLabel(
                                        index,
                                        item.attachments.length
                                      )}
                                    </p>
                                    <p className="truncate text-[11px] font-medium text-[color:var(--fs-color-ink)]">
                                      {attachment.file_name}
                                    </p>
                                    <p className={cx("text-[10px]", mutedTextClass)}>
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
            <p className={cx(mutedInnerPanelClass, "text-sm", mutedTextClass)}>
              Viewer role can review contextual notes here, but only editors/admins can create or
              change them.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
