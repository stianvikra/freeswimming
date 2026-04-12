"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AdminNoteClipboardPasteButton from "@/components/admin/AdminNoteClipboardPasteButton";
import type { AdminRole } from "@/lib/admin/access";
import { hasRequiredAdminRole } from "@/lib/admin/access";
import {
  claimQuickCaptureDraftOwner,
  clearQuickCaptureDraftStore,
  createQuickCaptureInitialFormState,
  getQuickCaptureDraftOwnerId,
  isQuickCaptureDraftDirty,
  readQuickCaptureDraftStore,
  releaseQuickCaptureDraftOwner,
  type QuickCaptureFormState,
  type QuickCaptureLockedContext,
  type QuickCapturePendingImage,
  type QuickCaptureSavedNotice,
  writeQuickCaptureDraftStore,
} from "@/lib/admin/admin-note-quick-capture-draft";
import { applyAdminTabToSearchParams } from "@/lib/admin/admin-workspace";
import type { AdminCategoryRow } from "@/lib/admin/categories";
import {
  createAdminNoteStagedImages,
  extractAdminNoteClipboardImage,
  prepareAdminNoteImageFiles,
  revokeAdminNoteStagedImages,
} from "@/lib/admin/note-compose";
import type { AdminNoteContextType } from "@/lib/admin/note-context";
import { uploadAdminNoteFiles } from "@/lib/admin/notes-client";
import {
  ADMIN_NOTE_PRIORITY_VALUES,
  buildAdminNoteAttachmentEvidenceSummary,
  buildAdminNoteAttachmentOrdinalLabel,
  type AdminNoteItem,
  type AdminNotePriority,
} from "@/lib/admin/notes";
import {
  DEFAULT_ADMIN_NOTES_FILTER_STATE,
  applyAdminNotesFilterStateToSearchParams,
} from "@/lib/admin/notes-manager";

type AdminCategoriesResponse =
  | {
      ok: true;
      items: AdminCategoryRow[];
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

type Props = {
  adminRole: AdminRole | null;
  contextType: AdminNoteContextType;
  contextRef: string;
  contextLabel: string;
  className?: string;
  triggerLabel?: string;
  triggerTestId?: string;
  description?: string;
  onSaved?: (item: AdminNoteItem) => void;
};

function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatPriorityLabel(priority: AdminNotePriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatImageCountLabel(count: number): string {
  return `${count} image${count === 1 ? "" : "s"}`;
}

function buildAdminNotesHref(params: {
  noteId: string;
  contextType: AdminNoteContextType;
  contextRef: string;
}): string {
  const withTab = applyAdminTabToSearchParams(new URLSearchParams(), "notes");
  const withFilters = applyAdminNotesFilterStateToSearchParams(withTab, {
    ...DEFAULT_ADMIN_NOTES_FILTER_STATE,
    query: params.noteId,
    contextType: params.contextType,
    contextRef: params.contextRef,
  });

  const search = withFilters.toString();
  return search ? `/admin?${search}` : "/admin";
}

function buildCurrentContext(params: Props): QuickCaptureLockedContext {
  return {
    contextType: params.contextType,
    contextRef: params.contextRef,
    contextLabel: params.contextLabel,
  };
}

function ChevronIcon({
  direction,
  className = "",
}: {
  direction: "left" | "right";
  className?: string;
}) {
  const path = direction === "left" ? "M11.5 5.5L7 10l4.5 4.5" : "M8.5 5.5L13 10l-4.5 4.5";
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminNoteQuickCaptureLauncher(props: Props) {
  const {
    adminRole,
    contextType,
    contextRef,
    contextLabel,
    className = "",
    triggerLabel = "Quick note",
    triggerTestId = "admin-note-quick-capture-trigger",
    description = "",
    onSaved,
  } = props;

  const canCreateNotes = Boolean(adminRole && hasRequiredAdminRole(adminRole, "editor"));
  const instanceId = useId();
  const datalistId = useId();
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [panelState, setPanelState] = useState<"closed" | "open" | "collapsed">("closed");
  const [draftContext, setDraftContext] = useState<QuickCaptureLockedContext>(() =>
    buildCurrentContext(props)
  );
  const [formState, setFormState] = useState<QuickCaptureFormState>(() =>
    createQuickCaptureInitialFormState(todayDateInputValue())
  );
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<QuickCaptureSavedNotice | null>(null);
  const [createdCaptureRecovery, setCreatedCaptureRecovery] =
    useState<QuickCaptureSavedNotice | null>(null);
  const [pendingImages, setPendingImages] = useState<QuickCapturePendingImage[]>([]);
  const [focusTitleOnOpen, setFocusTitleOnOpen] = useState(false);

  const open = panelState === "open";
  const minimized = panelState === "collapsed";
  const todayValue = todayDateInputValue();
  const hasDraftState = useMemo(
    () =>
      isQuickCaptureDraftDirty(formState, todayValue) ||
      pendingImages.length > 0 ||
      Boolean(createdCaptureRecovery),
    [createdCaptureRecovery, formState, pendingImages.length, todayValue]
  );
  const currentSurfaceMatchesDraftContext =
    draftContext.contextType === contextType && draftContext.contextRef === contextRef;

  const notesHref = useMemo(() => {
    const notice = savedNotice ?? createdCaptureRecovery;
    if (!notice) return null;
    return buildAdminNotesHref({
      noteId: notice.id,
      contextType: draftContext.contextType,
      contextRef: draftContext.contextRef,
    });
  }, [createdCaptureRecovery, draftContext.contextRef, draftContext.contextType, savedNotice]);

  const headerCloseActionLabel = createdCaptureRecovery
    ? "Close panel"
    : hasDraftState
      ? "Discard"
      : "Close panel";
  const closeActionLabel = createdCaptureRecovery
    ? "Close panel"
    : hasDraftState
      ? "Discard"
      : "Close panel";

  useEffect(() => {
    if (typeof document !== "undefined") {
      setPortalRoot(document.body);
    }
  }, []);

  useEffect(() => {
    if (!canCreateNotes) return;

    const currentOwnerId = getQuickCaptureDraftOwnerId();
    if (currentOwnerId && currentOwnerId !== instanceId) {
      return;
    }

    const storedDraft = readQuickCaptureDraftStore();
    if (!storedDraft) {
      return;
    }

    claimQuickCaptureDraftOwner(instanceId);
    setDraftContext(storedDraft.snapshot.context);
    setFormState(storedDraft.snapshot.formState);
    setCreatedCaptureRecovery(storedDraft.snapshot.createdCaptureRecovery);
    setPendingImages(storedDraft.pendingImages);
    setPanelState(storedDraft.snapshot.panelState);
  }, [canCreateNotes, instanceId]);

  useEffect(() => {
    return () => {
      releaseQuickCaptureDraftOwner(instanceId);
    };
  }, [instanceId]);

  useEffect(() => {
    if (readQuickCaptureDraftStore()) {
      return;
    }

    if (panelState === "closed" && !hasDraftState) {
      setDraftContext({
        contextType,
        contextRef,
        contextLabel,
      });
    }
  }, [contextLabel, contextRef, contextType, hasDraftState, panelState]);

  useEffect(() => {
    if (!savedNotice) return;

    const timeoutId = window.setTimeout(() => {
      setSavedNotice(null);
    }, 4_500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [savedNotice]);

  useEffect(() => {
    if (!open || categoryOptions.length > 0 || loadingCategories) return;

    let cancelled = false;

    async function loadCategoryOptions() {
      setLoadingCategories(true);
      try {
        const response = await fetch("/api/admin/categories/notes", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        const payload = (await response.json()) as AdminCategoriesResponse;
        if (cancelled || !response.ok || !payload.ok) {
          return;
        }

        setCategoryOptions(
          payload.items
            .filter((item) => item.is_active)
            .map((item) => item.title.trim())
            .filter(Boolean)
            .filter((value, index, all) => all.indexOf(value) === index)
        );
      } catch {
        // fallback is safe
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    void loadCategoryOptions();
    return () => {
      cancelled = true;
    };
  }, [categoryOptions.length, loadingCategories, open]);

  useEffect(() => {
    const currentOwnerId = getQuickCaptureDraftOwnerId();
    if (currentOwnerId && currentOwnerId !== instanceId) {
      return;
    }

    const shouldPersist = panelState !== "closed" || hasDraftState;
    if (!shouldPersist) {
      if (currentOwnerId === instanceId) {
        clearQuickCaptureDraftStore();
        releaseQuickCaptureDraftOwner(instanceId);
      }
      return;
    }

    claimQuickCaptureDraftOwner(instanceId);
    writeQuickCaptureDraftStore({
      snapshot: {
        version: 1,
        panelState: minimized ? "collapsed" : "open",
        context: draftContext,
        formState,
        createdCaptureRecovery,
        updatedAt: Date.now(),
      },
      pendingImages,
    });
  }, [
    createdCaptureRecovery,
    draftContext,
    formState,
    hasDraftState,
    instanceId,
    minimized,
    panelState,
    pendingImages,
  ]);

  useEffect(() => {
    if (!open || !focusTitleOnOpen) return;
    titleInputRef.current?.focus();
    setFocusTitleOnOpen(false);
  }, [focusTitleOnOpen, open]);

  if (!canCreateNotes) {
    return null;
  }

  function resetDraftState() {
    setPanelState("closed");
    setFormState(createQuickCaptureInitialFormState(todayDateInputValue()));
    setCreatedCaptureRecovery(null);
    setError(null);
    setFocusTitleOnOpen(false);
    setDraftContext(buildCurrentContext(props));
    clearPendingImages();
  }

  function appendPendingImages(files: Iterable<Blob | File>) {
    const prepared = prepareAdminNoteImageFiles({
      files,
      currentCount: pendingImages.length,
    });

    if (!prepared.ok) {
      setError(prepared.error);
      return;
    }

    if (prepared.files.length === 0) {
      return;
    }

    setError(null);
    setPendingImages((current) => [...current, ...createAdminNoteStagedImages(prepared.files)]);
  }

  function clearPendingImages() {
    setPendingImages((current) => {
      revokeAdminNoteStagedImages(current);
      return [];
    });
  }

  function removePendingImage(imageId: string) {
    let removedImage: QuickCapturePendingImage | null = null;
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

    if (createdCaptureRecovery && nextCount === 0) {
      setSavedNotice(createdCaptureRecovery);
      setCreatedCaptureRecovery(null);
      setError(null);
      setFormState(createQuickCaptureInitialFormState(todayDateInputValue()));
      setFocusTitleOnOpen(true);
    }
  }

  function notifySaved(item: AdminNoteItem) {
    if (currentSurfaceMatchesDraftContext) {
      onSaved?.(item);
    }
  }

  function openLauncher() {
    setSavedNotice(null);
    setError(null);
    setFocusTitleOnOpen(true);

    if (panelState === "collapsed") {
      setPanelState("open");
      return;
    }

    const currentOwnerId = getQuickCaptureDraftOwnerId();
    const storedDraft = readQuickCaptureDraftStore();
    if (storedDraft && (!currentOwnerId || currentOwnerId === instanceId)) {
      claimQuickCaptureDraftOwner(instanceId);
      setDraftContext(storedDraft.snapshot.context);
      setFormState(storedDraft.snapshot.formState);
      setCreatedCaptureRecovery(storedDraft.snapshot.createdCaptureRecovery);
      setPendingImages(storedDraft.pendingImages);
      setPanelState("open");
      return;
    }

    if (panelState === "closed" && !hasDraftState) {
      setDraftContext(buildCurrentContext(props));
    }

    setPanelState("open");
  }

  function minimizeLauncher() {
    if (submitting) return;
    setError(null);
    setPanelState("collapsed");
  }

  function closeLauncher() {
    if (submitting) return;
    if (createdCaptureRecovery) {
      setSavedNotice(createdCaptureRecovery);
    }
    resetDraftState();
  }

  function handleOpenInNotesClick() {
    closeLauncher();
  }

  function handleFormPaste(event: React.ClipboardEvent<HTMLFormElement>) {
    const result = extractAdminNoteClipboardImage({
      clipboardData: event.clipboardData,
    });

    if (!result.matched) {
      return;
    }

    event.preventDefault();

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(null);
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
    if (!createdCaptureRecovery || pendingImages.length === 0 || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const updatedItem = await uploadPendingImages(createdCaptureRecovery.id);
      setSavedNotice({
        id: updatedItem.id,
        title: updatedItem.title,
      });
      setCreatedCaptureRecovery(null);
      clearPendingImages();
      notifySaved(updatedItem);
      setFormState(createQuickCaptureInitialFormState(todayDateInputValue()));
      setPanelState("open");
      setFocusTitleOnOpen(true);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload images.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || createdCaptureRecovery) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          ...formState,
          contextType: draftContext.contextType,
          contextRef: draftContext.contextRef,
        }),
      });

      const payload = (await response.json()) as AdminNoteCreateResponse;
      if (!response.ok || !payload.ok) {
        setError(payload.ok ? "Could not save note." : (payload.error ?? "Could not save note."));
        return;
      }

      if (pendingImages.length > 0) {
        try {
          const updatedItem = await uploadPendingImages(payload.item.id);
          setSavedNotice({
            id: updatedItem.id,
            title: updatedItem.title,
          });
          clearPendingImages();
          setCreatedCaptureRecovery(null);
          notifySaved(updatedItem);
          setFormState(createQuickCaptureInitialFormState(todayDateInputValue()));
          setPanelState("open");
          setFocusTitleOnOpen(true);
          return;
        } catch (uploadError) {
          setCreatedCaptureRecovery({
            id: payload.item.id,
            title: payload.item.title,
          });
          setFormState(createQuickCaptureInitialFormState(todayDateInputValue()));
          notifySaved(payload.item);
          setError(
            uploadError instanceof Error
              ? `Note saved, but ${uploadError.message.toLowerCase()} Retry upload, remove staged images, or open the note in Notes.`
              : "Note saved, but image upload failed. Retry upload, remove staged images, or open the note in Notes."
          );
          return;
        }
      }

      setSavedNotice({
        id: payload.item.id,
        title: payload.item.title,
      });
      setCreatedCaptureRecovery(null);
      notifySaved(payload.item);
      setFormState(createQuickCaptureInitialFormState(todayDateInputValue()));
      setPanelState("open");
      setFocusTitleOnOpen(true);
    } catch {
      setError("Could not save note.");
    } finally {
      setSubmitting(false);
    }
  }

  const quickCaptureSurface =
    portalRoot && (open || minimized)
      ? createPortal(
          <div className="pointer-events-none fixed inset-y-0 right-0 z-[70] flex items-start justify-end">
            {minimized ? (
              <div
                className="pointer-events-auto mr-0 mt-24"
                data-testid="admin-note-quick-capture-minimized"
              >
                <button
                  type="button"
                  onClick={openLauncher}
                  data-testid="admin-note-quick-capture-resume"
                  aria-label="Resume quick note"
                  className="bg-white/96 flex h-36 w-14 translate-x-[calc(100%-1.75rem)] flex-col items-center justify-start rounded-l-[22px] border border-r-0 border-blue-200 px-2 py-3 text-blue-800 shadow-[0_18px_42px_rgba(15,23,42,0.16)] backdrop-blur transition-transform duration-200 ease-out hover:translate-x-[calc(100%-2.1rem)] hover:bg-blue-50"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                    <ChevronIcon direction="left" className="h-4 w-4" />
                  </span>
                  <span className="mt-3 text-center text-[11px] font-semibold leading-tight">
                    Quick
                    <br />
                    note
                  </span>
                </button>
              </div>
            ) : null}

            {open ? (
              <aside
                aria-label="Quick note capture panel"
                data-testid="admin-note-quick-capture-dialog"
                className="pointer-events-auto mb-3 mr-3 mt-16 flex h-[calc(100vh-5rem)] w-[min(28rem,calc(100vw-1rem))] min-w-0 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.18)]"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Quick capture
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">Admin note</h2>
                    {description.trim().length > 0 ? (
                      <p className="mt-1 text-sm text-slate-600">{description}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={minimizeLauncher}
                      aria-label="Collapse quick note"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                    >
                      <ChevronIcon direction="right" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={closeLauncher}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      {headerCloseActionLabel}
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                  {savedNotice ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                      <p className="font-semibold">Quick note saved.</p>
                      <p className="mt-1">
                        {savedNotice.title}
                        {notesHref ? (
                          <>
                            {" "}
                            <Link
                              href={notesHref}
                              onClick={handleOpenInNotesClick}
                              className="font-semibold underline underline-offset-2"
                            >
                              Open in Notes
                            </Link>
                          </>
                        ) : null}{" "}
                        Ready for another note in the same locked context.
                      </p>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Locked context
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {draftContext.contextLabel}
                    </p>
                  </div>

                  {!currentSurfaceMatchesDraftContext ? (
                    <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      You are viewing another page right now. This draft will still save to{" "}
                      <span className="font-semibold">{draftContext.contextLabel}</span>.
                    </p>
                  ) : null}

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Images
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <AdminNoteClipboardPasteButton
                          onPasteReady={async (file) => {
                            setError(null);
                            appendPendingImages([file]);
                          }}
                          onError={(message) => {
                            setError(message);
                          }}
                          disabled={submitting}
                        />
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                          <span>Upload images</span>
                          <input
                            aria-label="Upload images"
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

                    {pendingImages.length > 0 ? (
                      <div className="mt-3 space-y-3">
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-900">
                                {formatImageCountLabel(pendingImages.length)} ready to attach
                              </p>
                              <p className="mt-1 text-[11px] text-slate-600">
                                {createdCaptureRecovery
                                  ? `The saved note "${createdCaptureRecovery.title}" is waiting on the remaining staged images. Retry upload or remove any images you no longer need.`
                                  : "The next note save will upload these images as admin-only attachments."}
                              </p>
                            </div>
                            {createdCaptureRecovery ? (
                              <button
                                type="button"
                                onClick={() => {
                                  void retryPendingImageUpload();
                                }}
                                disabled={submitting}
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
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
                              className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                              data-testid="admin-note-quick-capture-image-preview"
                            >
                              <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={image.previewUrl}
                                  alt={`Pending image preview ${index + 1}`}
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
                                className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Remove image {index + 1}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {createdCaptureRecovery && notesHref ? (
                      <p className="mt-3 text-xs text-slate-600">
                        Note saved already.{" "}
                        <Link
                          href={notesHref}
                          onClick={handleOpenInNotesClick}
                          className="font-semibold text-blue-700 underline underline-offset-2"
                        >
                          Open in Notes
                        </Link>{" "}
                        if you want to finish without retrying the remaining image upload.
                      </p>
                    ) : null}
                  </div>

                  {error ? (
                    <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {error}
                    </p>
                  ) : null}

                  <form
                    className="mt-4 grid gap-3"
                    onSubmit={handleSubmit}
                    onPasteCapture={handleFormPaste}
                    data-testid="admin-note-quick-capture-form"
                  >
                    <label className="space-y-1 text-xs font-medium text-slate-700">
                      <span>Title</span>
                      <input
                        ref={titleInputRef}
                        type="text"
                        required
                        value={formState.title}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, title: event.target.value }))
                        }
                        placeholder="What should be changed?"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1 text-xs font-medium text-slate-700">
                        <span>Category</span>
                        <input
                          type="text"
                          list={datalistId}
                          value={formState.category}
                          onChange={(event) =>
                            setFormState((prev) => ({ ...prev, category: event.target.value }))
                          }
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                        />
                      </label>

                      <label className="space-y-1 text-xs font-medium text-slate-700">
                        <span>Date</span>
                        <input
                          type="date"
                          value={formState.noteDate}
                          onChange={(event) =>
                            setFormState((prev) => ({ ...prev, noteDate: event.target.value }))
                          }
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1 text-xs font-medium text-slate-700">
                        <span>Priority</span>
                        <select
                          value={formState.priority}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              priority: event.target.value as AdminNotePriority,
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

                      <label className="inline-flex items-center gap-2 self-end rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={formState.isDone}
                          onChange={(event) =>
                            setFormState((prev) => ({ ...prev, isDone: event.target.checked }))
                          }
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        Mark as done
                      </label>
                    </div>

                    <label className="space-y-1 text-xs font-medium text-slate-700">
                      <span>Text</span>
                      <textarea
                        rows={5}
                        value={formState.body}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, body: event.target.value }))
                        }
                        placeholder="Write the details you need to remember."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                      />
                    </label>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                      <div className="text-xs text-slate-500">
                        {createdCaptureRecovery ? (
                          <p>
                            The note is already saved. Retry the image upload or close and reopen it
                            from Notes.
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={closeLauncher}
                          disabled={submitting}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {closeActionLabel}
                        </button>
                        {!createdCaptureRecovery ? (
                          <button
                            type="submit"
                            disabled={submitting || Boolean(createdCaptureRecovery)}
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                          >
                            {submitting ? "Saving…" : "Save"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </form>

                  <datalist id={datalistId}>
                    {categoryOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
              </aside>
            ) : null}
          </div>,
          portalRoot
        )
      : null;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={openLauncher}
        data-testid={triggerTestId}
        className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-100"
      >
        {triggerLabel}
      </button>

      {!open && savedNotice ? (
        <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <p className="font-semibold">Quick note saved.</p>
          <p className="mt-1">
            {savedNotice.title}
            {notesHref ? (
              <>
                {" "}
                <Link
                  href={notesHref}
                  onClick={handleOpenInNotesClick}
                  className="font-semibold underline underline-offset-2"
                >
                  Open in Notes
                </Link>
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      {quickCaptureSurface}
    </div>
  );
}
