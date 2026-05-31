"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ImageIcon, Link2, RefreshCcw, Save, Search, Trash2, Upload } from "lucide-react";
import AdminManagerState from "@/components/admin/AdminManagerState";
import AdminNoteClipboardPasteButton from "@/components/admin/AdminNoteClipboardPasteButton";
import { cx } from "@/components/ui/cx";
import type { AdminNoteContextType } from "@/lib/admin/note-context";
import {
  createAdminNoteStagedImages,
  extractAdminNoteClipboardImage,
  prepareAdminNoteImageFiles,
  revokeAdminNoteStagedImages,
  type AdminNoteStagedImage,
} from "@/lib/admin/note-compose";
import {
  buildAdminNoteContextCatalog,
  resolveAdminNoteContextLabel,
} from "@/lib/admin/note-context-catalog";
import {
  ADMIN_INCIDENT_SEVERITY_GUIDANCE,
  ADMIN_NOTES_CONTEXT_TYPE_OPTIONS,
  DEFAULT_ADMIN_NOTES_FILTER_STATE,
  EMPTY_ADMIN_NOTE_CONTEXT_CATALOG,
  INITIAL_ADMIN_NOTE_FORM_STATE,
  applyAdminNotesFilterStateToSearchParams,
  areAdminNotesFilterStatesEqual,
  buildAdminNoteRelatedJumpFilterState,
  buildAdminNoteReferenceLabel,
  buildAdminNotesContextRefOptions,
  buildAdminNotesCounts,
  filterAdminNotes,
  formatAdminNoteDateLabel,
  formatAdminNoteImageCountLabel,
  formatAdminNotePriorityLabel,
  getAdminNotePriorityBadgeClasses,
  getTodayAdminNoteDateInputValue,
  getTodayAdminNoteDateLabel,
  hasPartialAdminNoteContextSelection,
  normalizeAdminNoteContextRef,
  parseAdminNotesFilterState,
  toAdminNoteFormState,
  type AdminCategoriesResponse,
  type AdminContentResponse,
  type AdminNoteCreateCaptureRecovery,
  type AdminNoteCreateResponse,
  type AdminNoteDeleteResponse,
  type AdminNoteFormState,
  type AdminNoteUpdateResponse,
  type AdminNotesFilterState,
  type AdminNotesResponse,
  type AdminNotesStatusFilter,
  type AdminProductsResponse,
} from "@/lib/admin/notes-manager";
import {
  ADMIN_INCIDENT_NOTE_CATEGORY_BY_SEVERITY,
  ADMIN_INCIDENT_NOTE_CATEGORY_OPTIONS,
  ADMIN_NOTE_ATTACHMENT_MAX_FILES,
  ADMIN_NOTE_PRIORITY_VALUES,
  INCIDENT_NOTE_SEVERITIES,
  buildAdminNoteAttachmentEvidenceSummary,
  buildAdminNoteAttachmentOrdinalLabel,
  buildIncidentNoteBodyTemplate,
  sortAdminNotesByPriorityAndNewest,
  type AdminNoteItem,
  type AdminNotePriority,
  type IncidentNoteSeverity,
} from "@/lib/admin/notes";
import { uploadAdminNoteFiles } from "@/lib/admin/notes-client";

type PendingScreenshot = AdminNoteStagedImage;

const managerHeaderClass = "fs-library-card fs-library-card-accent p-4 sm:p-5";
const panelCardClass = "fs-library-card p-4 sm:p-5";
const nestedPanelClass =
  "rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/86 p-3";
const mutedPanelClass =
  "rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-[rgba(255,255,255,0.68)] p-3";
const noteCardBaseClass =
  "rounded-[var(--fs-radius-card)] border px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.055)] transition-colors";
const noteCardOpenClass = "border-[color:var(--fs-border-soft)] bg-white/82";
const noteCardDoneClass = "border-emerald-200 bg-emerald-50/55";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const eyebrowClass = "text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]";
const headingClass = "text-lg font-semibold text-[color:var(--fs-color-ink-strong)]";
const smallHeadingClass = "text-sm font-semibold text-[color:var(--fs-color-ink-strong)]";
const metadataClass = "text-xs text-[color:var(--fs-color-muted)]";
const adminNotesFilterBaseClass =
  "space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]";
const adminNotesFilterSelectClass =
  "h-10 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm text-[color:var(--fs-color-ink-strong)] transition-colors focus:border-[color:var(--fs-border-brand)] focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[rgba(248,250,252,0.75)] disabled:text-[color:var(--fs-color-muted)]";
const adminNotesFilterSearchClass = `${adminNotesFilterBaseClass} min-w-[min(100%,16rem)] flex-1 basis-full sm:basis-[18rem] xl:flex-none xl:basis-[16rem]`;
const adminNotesFilterStatusClass = `${adminNotesFilterBaseClass} min-w-[min(100%,20rem)] flex-1 basis-full sm:basis-[20rem] xl:flex-none xl:basis-[20rem]`;
const adminNotesFilterCompactClass = `${adminNotesFilterBaseClass} min-w-[min(100%,10rem)] flex-1 basis-[10rem] xl:flex-none xl:basis-[10rem]`;
const adminNotesFilterContextClass = `${adminNotesFilterBaseClass} min-w-[min(100%,11rem)] flex-1 basis-[11rem] xl:flex-none xl:basis-[11rem]`;
const adminNotesFilterRouteClass = `${adminNotesFilterBaseClass} min-w-[min(100%,12rem)] flex-1 basis-[12rem] xl:flex-none xl:basis-[12rem]`;
const fieldClass =
  "h-10 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm text-[color:var(--fs-color-ink-strong)] transition-colors placeholder:text-[color:var(--fs-color-muted)] focus:border-[color:var(--fs-border-brand)] focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[rgba(248,250,252,0.75)] disabled:text-[color:var(--fs-color-muted)]";
const compactFieldClass =
  "h-9 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm text-[color:var(--fs-color-ink-strong)] transition-colors placeholder:text-[color:var(--fs-color-muted)] focus:border-[color:var(--fs-border-brand)] focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[rgba(248,250,252,0.75)] disabled:text-[color:var(--fs-color-muted)]";
const textAreaClass =
  "w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 py-2 text-sm text-[color:var(--fs-color-ink-strong)] transition-colors placeholder:text-[color:var(--fs-color-muted)] focus:border-[color:var(--fs-border-brand)] focus:outline-none focus:ring-2 focus:ring-blue-100";
const labelClass = "space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]";
const compactLabelClass = "space-y-1 text-xs font-semibold text-[color:var(--fs-color-ink)]";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactSecondaryActionClass =
  "fs-cta-secondary inline-flex min-h-9 items-center justify-center gap-2 px-3 text-xs font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactPrimaryActionClass =
  "fs-cta-primary inline-flex min-h-9 items-center justify-center gap-2 px-3 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const primaryActionClass =
  "fs-cta-primary inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const destructiveActionClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border border-rose-200 bg-white/85 px-3 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const statusFilterClass =
  "fs-library-card inline-flex min-h-10 items-center justify-center px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const statusFilterActiveClass = "fs-library-card-accent border-[color:var(--fs-border-brand)]";
const checkboxClass =
  "h-4 w-4 rounded border-[color:var(--fs-border-soft)] text-[color:var(--fs-color-brand-700)] focus:ring-blue-500";

export default function AdminNotesManager() {
  const pathname = usePathname() ?? "/admin";
  const rawSearchParams = useSearchParams();
  const searchParams = useMemo(() => rawSearchParams ?? new URLSearchParams(), [rawSearchParams]);
  const [items, setItems] = useState<AdminNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [contextCatalog, setContextCatalog] = useState(EMPTY_ADMIN_NOTE_CONTEXT_CATALOG);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [formState, setFormState] = useState<AdminNoteFormState>(INITIAL_ADMIN_NOTE_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<AdminNoteFormState | null>(null);
  const [uploadingNoteId, setUploadingNoteId] = useState<string | null>(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);
  const [linkingNoteId, setLinkingNoteId] = useState<string | null>(null);
  const [unlinkingKey, setUnlinkingKey] = useState<string | null>(null);
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>({});
  const [createPendingScreenshots, setCreatePendingScreenshots] = useState<PendingScreenshot[]>([]);
  const [createCaptureRecovery, setCreateCaptureRecovery] =
    useState<AdminNoteCreateCaptureRecovery | null>(null);
  const createPendingScreenshotsRef = useRef<PendingScreenshot[]>([]);

  useEffect(() => {
    createPendingScreenshotsRef.current = createPendingScreenshots;
  }, [createPendingScreenshots]);

  useEffect(() => {
    return () => {
      revokeAdminNoteStagedImages(createPendingScreenshotsRef.current);
    };
  }, []);

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
        setContextCatalog(EMPTY_ADMIN_NOTE_CONTEXT_CATALOG);
        return;
      }

      setContextCatalog(
        buildAdminNoteContextCatalog({
          contentItems: contentPayload.items,
          products: productsPayload.items,
        })
      );
    } catch {
      setContextCatalog(EMPTY_ADMIN_NOTE_CONTEXT_CATALOG);
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
      setContextCatalog(EMPTY_ADMIN_NOTE_CONTEXT_CATALOG);
      setCategoryOptions([]);
    } finally {
      setLoading(false);
    }
  }, [loadContextCatalog]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const parsedNotesFilters = useMemo(
    () => parseAdminNotesFilterState(searchParams),
    [searchParams]
  );
  const [notesFilters, setNotesFilters] = useState(parsedNotesFilters);
  const [searchDraft, setSearchDraft] = useState(parsedNotesFilters.query);
  const deferredSearchDraft = useDeferredValue(searchDraft);
  const effectiveNotesFilters = useMemo(
    () => ({ ...notesFilters, query: deferredSearchDraft }),
    [deferredSearchDraft, notesFilters]
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

  const updateNotesFilters = useCallback(
    (next: Partial<AdminNotesFilterState>) => {
      setNotesFilters((currentFilters) => {
        const nextFilters = {
          ...currentFilters,
          ...next,
        };
        if (Object.prototype.hasOwnProperty.call(next, "contextType")) {
          nextFilters.contextRef = "";
        }
        if (!nextFilters.contextType) {
          nextFilters.contextRef = "";
        }

        const nextParams = applyAdminNotesFilterStateToSearchParams(
          new URLSearchParams(window.location.search),
          nextFilters
        );
        const nextHref = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
        window.history.replaceState(window.history.state, "", nextHref);
        return nextFilters;
      });
    },
    [pathname]
  );

  const jumpToRelatedNote = useCallback(
    (relatedNote: AdminNoteItem["related_notes"][number]) => {
      const nextFilters = buildAdminNoteRelatedJumpFilterState({
        noteId: relatedNote.id,
        isDone: relatedNote.is_done,
      });
      setSearchDraft(nextFilters.query);
      setEditingId(null);
      setEditState(null);
      updateNotesFilters(nextFilters);
    },
    [updateNotesFilters]
  );

  useEffect(() => {
    setNotesFilters((currentFilters) =>
      areAdminNotesFilterStatesEqual(currentFilters, parsedNotesFilters)
        ? currentFilters
        : parsedNotesFilters
    );
  }, [parsedNotesFilters]);

  useEffect(() => {
    setSearchDraft((currentDraft) =>
      currentDraft === parsedNotesFilters.query ? currentDraft : parsedNotesFilters.query
    );
  }, [parsedNotesFilters.query]);

  const createLessonOptions = useMemo(() => {
    if (formState.contextType !== "course_lesson") return [];
    const selectedModuleRef = normalizeAdminNoteContextRef(formState.contextModuleRef);
    if (!selectedModuleRef) return [];
    return contextCatalog.lessons.filter((entry) => entry.moduleRef === selectedModuleRef);
  }, [contextCatalog.lessons, formState.contextModuleRef, formState.contextType]);

  const editLessonOptions = useMemo(() => {
    if (!editState || editState.contextType !== "course_lesson") return [];
    const selectedModuleRef = normalizeAdminNoteContextRef(
      editState.contextModuleRef ||
        contextCatalog.lessonModuleByRef[normalizeAdminNoteContextRef(editState.contextRef)] ||
        ""
    );
    if (!selectedModuleRef) return [];
    return contextCatalog.lessons.filter((entry) => entry.moduleRef === selectedModuleRef);
  }, [contextCatalog.lessonModuleByRef, contextCatalog.lessons, editState]);

  const createContextInvalid = hasPartialAdminNoteContextSelection(
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
      contextRef: normalizeAdminNoteContextRef(nextRef),
    }));
  }

  function setCreateContextModuleRef(nextRef: string) {
    setFormState((prev) => ({
      ...prev,
      contextModuleRef: normalizeAdminNoteContextRef(nextRef),
      contextRef: "",
    }));
  }

  function appendCreatePendingScreenshots(files: Iterable<Blob | File>) {
    const prepared = prepareAdminNoteImageFiles({
      files,
      currentCount: createPendingScreenshots.length,
    });

    if (!prepared.ok) {
      setActionError(prepared.error);
      setActionNotice(null);
      return;
    }

    if (prepared.files.length === 0) {
      return;
    }

    setActionError(null);
    setActionNotice(
      `${formatAdminNoteImageCountLabel(createPendingScreenshots.length + prepared.files.length)} ready to attach on the next note save.`
    );
    setCreatePendingScreenshots((current) => [
      ...current,
      ...createAdminNoteStagedImages(prepared.files),
    ]);
  }

  function clearCreatePendingScreenshots() {
    setCreatePendingScreenshots((current) => {
      revokeAdminNoteStagedImages(current);
      return [];
    });
  }

  function removeCreatePendingScreenshot(imageId: string) {
    let removedImage: PendingScreenshot | null = null;
    let nextCount = 0;

    setCreatePendingScreenshots((current) => {
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

    if (createCaptureRecovery && nextCount === 0) {
      setCreateCaptureRecovery(null);
      setActionError(null);
      setActionNotice("Note saved without staged images. Use Edit to attach more later if needed.");
    } else if (nextCount > 0) {
      setActionNotice(
        `${formatAdminNoteImageCountLabel(nextCount)} still staged for the next save.`
      );
    } else {
      setActionNotice(null);
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
      setActionNotice(null);
      return;
    }

    setActionError(null);
    appendCreatePendingScreenshots([result.file]);
  }

  function handleCreateImageSelection(files: FileList | null) {
    if (!files || files.length === 0) return;
    appendCreatePendingScreenshots(Array.from(files));
  }

  async function uploadCreatePendingScreenshots(noteId: string) {
    if (createPendingScreenshots.length === 0) {
      throw new Error("No images are ready to upload.");
    }

    return uploadAdminNoteFiles({
      noteId,
      files: createPendingScreenshots.map((image) => image.file),
    });
  }

  async function retryCreatePendingScreenshotUpload() {
    if (!createCaptureRecovery || createPendingScreenshots.length === 0 || submitting) return;

    setSubmitting(true);
    setActionError(null);
    setActionNotice(null);

    try {
      const updatedItem = await uploadCreatePendingScreenshots(createCaptureRecovery.id);
      setItems((prev) =>
        sortNoteItems(prev.map((entry) => (entry.id === updatedItem.id ? updatedItem : entry)))
      );
      clearCreatePendingScreenshots();
      setCreateCaptureRecovery(null);
      setActionNotice(
        createPendingScreenshots.length === 1
          ? "Image attached to the saved note."
          : "Images attached to the saved note."
      );
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not upload images.");
    } finally {
      setSubmitting(false);
    }
  }

  function applyIncidentTemplate(severity: IncidentNoteSeverity) {
    const today = getTodayAdminNoteDateLabel();
    setFormState((prev) => ({
      ...prev,
      title: prev.title || `Incident ${severity} - ${today}`,
      category: ADMIN_INCIDENT_NOTE_CATEGORY_BY_SEVERITY[severity],
      priority: severity === "P0" ? "urgent" : severity === "P1" ? "high" : "normal",
      body: buildIncidentNoteBodyTemplate(severity),
      noteDate: getTodayAdminNoteDateInputValue(),
      isDone: false,
    }));
    setActionError(null);
    setActionNotice(`Applied ${severity} incident template.`);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || createCaptureRecovery) return;
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

      if (createPendingScreenshots.length > 0) {
        try {
          const updatedItem = await uploadCreatePendingScreenshots(payload.item.id);
          setItems((prev) =>
            sortNoteItems([...prev.filter((entry) => entry.id !== updatedItem.id), updatedItem])
          );
          clearCreatePendingScreenshots();
          setCreateCaptureRecovery(null);
          setFormState(INITIAL_ADMIN_NOTE_FORM_STATE);
          setActionNotice(
            createPendingScreenshots.length === 1
              ? "Note saved with image attached."
              : "Note saved with images attached."
          );
          return;
        } catch (uploadError) {
          setItems((prev) =>
            sortNoteItems([...prev.filter((entry) => entry.id !== payload.item.id), payload.item])
          );
          setCreateCaptureRecovery({
            id: payload.item.id,
            title: payload.item.title,
          });
          setFormState(INITIAL_ADMIN_NOTE_FORM_STATE);
          setActionError(
            uploadError instanceof Error
              ? `Note saved, but ${uploadError.message.toLowerCase()} Retry upload below or remove staged images before creating another note.`
              : "Note saved, but image upload failed. Retry upload below or remove staged images before creating another note."
          );
          return;
        }
      }

      setItems((prev) =>
        sortNoteItems([...prev.filter((entry) => entry.id !== payload.item.id), payload.item])
      );
      setFormState(INITIAL_ADMIN_NOTE_FORM_STATE);
      setCreateCaptureRecovery(null);
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
    const nextState = toAdminNoteFormState(item);
    if (nextState.contextType === "course_lesson" && nextState.contextRef) {
      nextState.contextModuleRef =
        contextCatalog.lessonModuleByRef[normalizeAdminNoteContextRef(nextState.contextRef)] ?? "";
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

  function setEditField(updater: (prev: AdminNoteFormState) => AdminNoteFormState) {
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
      contextRef: normalizeAdminNoteContextRef(nextRef),
    }));
  }

  function setEditContextModuleRef(nextRef: string) {
    setEditField((prev) => ({
      ...prev,
      contextModuleRef: normalizeAdminNoteContextRef(nextRef),
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

      setItems((prev) =>
        prev
          .filter((entry) => entry.id !== payload.id)
          .map((entry) => ({
            ...entry,
            related_notes: entry.related_notes.filter(
              (relatedNote) => relatedNote.id !== payload.id
            ),
          }))
      );
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

  async function uploadFilesForNote(itemId: string, files: File[]) {
    if (files.length === 0) return;
    if (uploadingNoteId || deletingAttachmentId || linkingNoteId || unlinkingKey) return;

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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not upload images.";
      setActionError(message);
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
          payload.ok ? "Could not delete image." : (payload.error ?? "Could not delete image.")
        );
        return;
      }

      applyMutatedItem(noteId, payload.item);
      setActionNotice("Image deleted.");
    } catch {
      setActionError("Could not delete image.");
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
      <section className="space-y-4">
        <div className={managerHeaderClass} data-testid="admin-notes-manager-header">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={eyebrowClass}>Admin workspace</p>
              <h2 className={cx("mt-1", headingClass)}>Notes</h2>
              <p className={cx("mt-2 max-w-2xl", mutedTextClass)}>{noteSummary}</p>
            </div>
            <button type="button" onClick={() => void loadNotes()} className={secondaryActionClass}>
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>

        {!schemaReady && warning ? (
          <AdminManagerState tone="warning">{warning}</AdminManagerState>
        ) : null}

        {loading ? <AdminManagerState tone="loading">Loading notes…</AdminManagerState> : null}

        {!loading && error ? (
          <AdminManagerState
            tone="error"
            actions={
              <button
                type="button"
                onClick={() => void loadNotes()}
                className={destructiveActionClass}
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Retry
              </button>
            }
          >
            {error}
          </AdminManagerState>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <AdminManagerState tone="empty" testId="admin-notes-empty-state">
            No notes created yet. Add your first admin note below.
          </AdminManagerState>
        ) : null}

        {actionError ? (
          <AdminManagerState tone="error" announcement="polite">
            {actionError}
          </AdminManagerState>
        ) : null}

        {actionNotice ? <AdminManagerState tone="success">{actionNotice}</AdminManagerState> : null}

        {!loading && !error && items.length > 0 ? (
          <div className={cx("mt-5 space-y-4", mutedPanelClass)}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={smallHeadingClass}>Work queue filters</p>
                <p className={cx("mt-1", metadataClass)}>
                  Showing {filteredItems.length} of {noteCounts.all} notes.
                </p>
              </div>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchDraft("");
                    updateNotesFilters(DEFAULT_ADMIN_NOTES_FILTER_STATE);
                  }}
                  className={compactSecondaryActionClass}
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            <div
              className="flex flex-wrap items-end gap-3"
              data-testid="admin-notes-filter-controls"
            >
              <label className={adminNotesFilterSearchClass}>
                <span>Search</span>
                <span className="relative block">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[color:var(--fs-color-muted)]"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchDraft}
                    onChange={(e) => {
                      const nextQuery = e.target.value;
                      setSearchDraft(nextQuery);
                      updateNotesFilters({ query: nextQuery });
                    }}
                    data-testid="admin-notes-search"
                    className={cx(fieldClass, "pl-9")}
                    placeholder="Search notes"
                  />
                </span>
              </label>

              <div className={adminNotesFilterStatusClass} data-testid="admin-notes-status-filter">
                <span>Status</span>
                <div
                  className="grid grid-cols-[1fr_1.45fr_1fr] gap-2"
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
                        className={cx(statusFilterClass, isActive && statusFilterActiveClass)}
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

              <label className={adminNotesFilterCompactClass}>
                <span>Category</span>
                <select
                  value={notesFilters.category}
                  onChange={(e) => updateNotesFilters({ category: e.target.value })}
                  data-testid="admin-notes-category-filter"
                  className={adminNotesFilterSelectClass}
                >
                  <option value="">All categories</option>
                  {suggestedCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className={adminNotesFilterCompactClass}>
                <span>Priority</span>
                <select
                  value={notesFilters.priority}
                  onChange={(e) =>
                    updateNotesFilters({
                      priority: e.target.value as AdminNotePriority | "",
                    })
                  }
                  data-testid="admin-notes-priority-filter"
                  className={adminNotesFilterSelectClass}
                >
                  <option value="">All priorities</option>
                  {ADMIN_NOTE_PRIORITY_VALUES.map((priority) => (
                    <option key={priority} value={priority}>
                      {formatAdminNotePriorityLabel(priority)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={adminNotesFilterContextClass}>
                <span>Context type</span>
                <select
                  value={notesFilters.contextType}
                  onChange={(e) =>
                    updateNotesFilters({
                      contextType: e.target.value as AdminNoteContextType | "",
                    })
                  }
                  data-testid="admin-notes-context-type-filter"
                  className={adminNotesFilterSelectClass}
                >
                  <option value="">All context types</option>
                  {ADMIN_NOTES_CONTEXT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={adminNotesFilterRouteClass}>
                <span>Exact route/context</span>
                <select
                  value={notesFilters.contextRef}
                  onChange={(e) => updateNotesFilters({ contextRef: e.target.value })}
                  data-testid="admin-notes-context-ref-filter"
                  className={adminNotesFilterSelectClass}
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
                ? hasPartialAdminNoteContextSelection(editState.contextType, editState.contextRef)
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
                  className={cx(
                    noteCardBaseClass,
                    item.is_done ? noteCardDoneClass : noteCardOpenClass
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                        {item.title}
                      </p>
                      <p className={cx("mt-1", metadataClass)}>
                        {item.category} · {formatAdminNoteDateLabel(item.note_date)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={[
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                            getAdminNotePriorityBadgeClasses(item.priority),
                          ].join(" ")}
                        >
                          {formatAdminNotePriorityLabel(item.priority)}
                        </span>
                        {item.attachments.length > 0 ? (
                          <span className="inline-flex items-center rounded-full border border-[color:var(--fs-border-soft)] bg-white/86 px-2 py-0.5 text-[11px] font-medium text-[color:var(--fs-color-ink)]">
                            {item.attachments.length} image
                            {item.attachments.length === 1 ? "" : "s"}
                          </span>
                        ) : null}
                        {item.related_notes.length > 0 ? (
                          <span className="inline-flex items-center rounded-full border border-[color:var(--fs-border-soft)] bg-white/86 px-2 py-0.5 text-[11px] font-medium text-[color:var(--fs-color-ink)]">
                            {item.related_notes.length} related note
                            {item.related_notes.length === 1 ? "" : "s"}
                          </span>
                        ) : null}
                      </div>
                      <p
                        className="mt-1 text-[11px] font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase"
                        data-testid="admin-note-id"
                      >
                        {buildAdminNoteReferenceLabel(item.id)}
                      </p>
                      {item.context_type && item.context_ref ? (
                        <>
                          <p className="mt-1 text-xs font-medium text-[color:var(--fs-color-muted)]">
                            {resolveAdminNoteContextLabel({
                              catalog: contextCatalog,
                              contextType: item.context_type,
                              contextRef: item.context_ref,
                            })}
                          </p>
                          <p className="mt-1 text-[11px] text-[color:var(--fs-color-muted)]">
                            Context ref:{" "}
                            <span className="font-mono text-[color:var(--fs-color-ink)]">
                              {item.context_ref}
                            </span>
                          </p>
                        </>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--fs-color-ink)]">
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
                          deletingAttachmentId ||
                          linkingNoteId ||
                          unlinkingKey
                        )}
                        onClick={() => {
                          startEdit(item);
                        }}
                        className={compactSecondaryActionClass}
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
                        className={destructiveActionClass}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>

                  {!isEditing && item.body ? (
                    <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-[color:var(--fs-color-ink)]">
                      {item.body}
                    </p>
                  ) : null}

                  {!isEditing && item.attachments.length > 0 ? (
                    <div className={cx("mt-3 space-y-2", nestedPanelClass)}>
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
                            className="group flex w-32 flex-col gap-2 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/82 p-2 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                          >
                            {attachment.signed_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={attachment.signed_url}
                                alt={attachment.file_name}
                                className="h-20 w-full rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-20 w-full items-center justify-center rounded-md bg-[rgba(226,232,240,0.72)] text-[11px] font-medium text-[color:var(--fs-color-muted)]">
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
                              <p className="text-[10px] text-[color:var(--fs-color-muted)]">
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

                  {!isEditing && item.related_notes.length > 0 ? (
                    <div className={cx("mt-3 space-y-2", nestedPanelClass)}>
                      <p className="text-xs font-semibold text-[color:var(--fs-color-ink)]">
                        Related notes
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.related_notes.map((relatedNote) => (
                          <div
                            key={relatedNote.id}
                            className="rounded-full border border-[color:var(--fs-border-soft)] bg-white/78 px-3 py-1 text-[11px] text-[color:var(--fs-color-ink)]"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                jumpToRelatedNote(relatedNote);
                              }}
                              className="font-semibold text-[color:var(--fs-color-brand-700)] underline decoration-[color:var(--fs-border-brand)] underline-offset-2 transition hover:text-blue-800 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                            >
                              {relatedNote.title}
                            </button>
                            <span className="text-[color:var(--fs-color-muted)]">
                              {" "}
                              · {buildAdminNoteReferenceLabel(relatedNote.id)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {isEditing && editState ? (
                    <form
                      className="mt-3 grid gap-3 sm:grid-cols-2"
                      data-testid="admin-note-edit-form"
                      onPasteCapture={(event) => handleEditFormPaste(item, event)}
                      onSubmit={(e) => {
                        e.preventDefault();
                        void saveEdit(item.id);
                      }}
                    >
                      <label className={cx(compactLabelClass, "sm:col-span-2")}>
                        <span>Edit title</span>
                        <input
                          type="text"
                          required
                          value={editState.title}
                          onChange={(e) => {
                            setEditField((prev) => ({ ...prev, title: e.target.value }));
                          }}
                          className={compactFieldClass}
                        />
                      </label>

                      <label className={compactLabelClass}>
                        <span>Edit category</span>
                        <input
                          type="text"
                          list="admin-note-category-options"
                          value={editState.category}
                          onChange={(e) => {
                            setEditField((prev) => ({ ...prev, category: e.target.value }));
                          }}
                          className={compactFieldClass}
                        />
                      </label>

                      <label className={compactLabelClass}>
                        <span>Edit date</span>
                        <input
                          type="date"
                          required
                          value={editState.noteDate}
                          onChange={(e) => {
                            setEditField((prev) => ({ ...prev, noteDate: e.target.value }));
                          }}
                          className={compactFieldClass}
                        />
                      </label>

                      <label className={compactLabelClass}>
                        <span>Priority</span>
                        <select
                          value={editState.priority}
                          onChange={(e) => {
                            setEditField((prev) => ({
                              ...prev,
                              priority: e.target.value as AdminNotePriority,
                            }));
                          }}
                          className={compactFieldClass}
                        >
                          {ADMIN_NOTE_PRIORITY_VALUES.map((priority) => (
                            <option key={priority} value={priority}>
                              {formatAdminNotePriorityLabel(priority)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className={cx(compactLabelClass, "sm:col-span-2")}>
                        <span>Edit text</span>
                        <textarea
                          rows={3}
                          value={editState.body}
                          onChange={(e) => {
                            setEditField((prev) => ({ ...prev, body: e.target.value }));
                          }}
                          className={textAreaClass}
                        />
                      </label>

                      <label className={compactLabelClass}>
                        <span>Attach to (optional)</span>
                        <select
                          value={editState.contextType}
                          onChange={(e) => {
                            setEditContextType(e.target.value as AdminNoteContextType | "");
                          }}
                          data-testid="admin-note-edit-context-type"
                          className={compactFieldClass}
                        >
                          <option value="">No attachment</option>
                          {ADMIN_NOTES_CONTEXT_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className={compactLabelClass}>
                        <span>Selected target</span>
                        {editState.contextType === "" ? (
                          <input
                            type="text"
                            value=""
                            disabled
                            className={compactFieldClass}
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
                            className={compactFieldClass}
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
                              value={normalizeAdminNoteContextRef(
                                editState.contextModuleRef ||
                                  contextCatalog.lessonModuleByRef[
                                    normalizeAdminNoteContextRef(editState.contextRef)
                                  ] ||
                                  ""
                              )}
                              onChange={(e) => {
                                setEditContextModuleRef(e.target.value);
                              }}
                              data-testid="admin-note-edit-context-lesson-module"
                              className={compactFieldClass}
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
                              className={compactFieldClass}
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
                            className={compactFieldClass}
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
                            className={compactFieldClass}
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
                            className={compactFieldClass}
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
                            className={compactFieldClass}
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

                      <div className={cx("space-y-2 sm:col-span-2", nestedPanelClass)}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-[color:var(--fs-color-ink-strong)]">
                              Images
                            </p>
                            <p className="mt-1 text-[11px] text-[color:var(--fs-color-muted)]">
                              PNG, JPEG, WEBP, or GIF up to 5 MB each. Upload images or paste one
                              image from clipboard directly.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <AdminNoteClipboardPasteButton
                              className={compactSecondaryActionClass}
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
                              className={cx(compactSecondaryActionClass, "cursor-pointer py-2")}
                            >
                              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{isUploading ? "Uploading…" : "Upload images"}</span>
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
                        </div>

                        {item.attachments.length > 0 ? (
                          <ul className="space-y-2">
                            {item.attachments.map((attachment, index) => {
                              const isDeletingAttachment = deletingAttachmentId === attachment.id;
                              return (
                                <li
                                  key={attachment.id}
                                  className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/82 px-3 py-2"
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
                                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[rgba(226,232,240,0.72)] text-[10px] font-medium text-[color:var(--fs-color-muted)]">
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
                                      <p className="text-[11px] text-[color:var(--fs-color-muted)]">
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
                                        className={compactSecondaryActionClass}
                                      >
                                        <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
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
                                      className={destructiveActionClass}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                      {isDeletingAttachment ? "Deleting…" : "Delete image"}
                                    </button>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-[color:var(--fs-color-muted)]">
                            No images attached yet.
                          </p>
                        )}
                      </div>

                      <div className={cx("space-y-2 sm:col-span-2", nestedPanelClass)}>
                        <div>
                          <p className="text-xs font-semibold text-[color:var(--fs-color-ink-strong)]">
                            Related notes
                          </p>
                          <p className="mt-1 text-[11px] text-[color:var(--fs-color-muted)]">
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
                                  className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/82 px-3 py-2"
                                >
                                  <div>
                                    <p className="text-xs font-medium text-[color:var(--fs-color-ink)]">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          jumpToRelatedNote(relatedNote);
                                        }}
                                        className="text-left font-semibold text-[color:var(--fs-color-brand-700)] underline decoration-[color:var(--fs-border-brand)] underline-offset-2 transition hover:text-blue-800 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                                      >
                                        {relatedNote.title}
                                      </button>
                                    </p>
                                    <p className="text-[11px] text-[color:var(--fs-color-muted)]">
                                      {formatAdminNotePriorityLabel(relatedNote.priority)} ·{" "}
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
                                    className={compactSecondaryActionClass}
                                  >
                                    {isUnlinking ? "Removing…" : "Remove link"}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-[color:var(--fs-color-muted)]">
                            No related notes linked yet.
                          </p>
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
                            className={compactFieldClass}
                          >
                            <option value="">Choose note to link</option>
                            {linkableNotes.map((linkableNote) => (
                              <option key={linkableNote.id} value={linkableNote.id}>
                                {formatAdminNotePriorityLabel(linkableNote.priority)} ·{" "}
                                {linkableNote.title} ·{" "}
                                {buildAdminNoteReferenceLabel(linkableNote.id)}
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
                            className={compactSecondaryActionClass}
                          >
                            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                            {isLinking ? "Linking…" : "Link note"}
                          </button>
                        </div>
                      </div>

                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--fs-color-ink)] sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={editState.isDone}
                          onChange={(e) => {
                            setEditField((prev) => ({ ...prev, isDone: e.target.checked }));
                          }}
                          className={checkboxClass}
                        />
                        Mark as done
                      </label>

                      <div className="flex items-center gap-2 sm:col-span-2">
                        <button
                          type="submit"
                          className={compactPrimaryActionClass}
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
                          <Save className="h-3.5 w-3.5" aria-hidden="true" />
                          {isUpdating ? "Saving…" : "Save changes"}
                        </button>
                        <button
                          type="button"
                          className={compactSecondaryActionClass}
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
                        <p className="rounded-[var(--fs-radius-control)] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:col-span-2">
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
          <AdminManagerState tone="no-results" testId="admin-notes-no-results-state">
            No notes match the current filters. Clear filters or switch to done archive to find
            older notes.
          </AdminManagerState>
        ) : null}
      </section>

      <section className={panelCardClass} data-testid="admin-notes-create-panel">
        <h2 className={headingClass}>Create note</h2>
        <p className={cx("mt-2", mutedTextClass)}>
          Store planning notes with category, priority, date, and completion tracking.
        </p>
        <p className={cx("mt-2", metadataClass)}>
          Stage up to {ADMIN_NOTE_ATTACHMENT_MAX_FILES} images before save if needed, then use Edit
          to attach more images or link related notes afterward.
        </p>
        <div className="mt-3 rounded-[var(--fs-radius-control)] border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-900">Incident quick templates</p>
          <p className="mt-1 text-xs text-amber-800">
            Use these for runbook incidents so severity, owner, and update cadence stay
            standardized.
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {INCIDENT_NOTE_SEVERITIES.map((severity) => (
              <div
                key={severity}
                className="rounded-[var(--fs-radius-control)] border border-amber-200 bg-white/85 px-3 py-2"
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
                className="inline-flex min-h-9 items-center justify-center rounded-[var(--fs-radius-control)] border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
              >
                Use {severity} template
              </button>
            ))}
          </div>
        </div>

        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onPasteCapture={handleCreateFormPaste}
          onSubmit={handleCreate}
          data-testid="admin-notes-create-form"
        >
          <label className={cx(labelClass, "sm:col-span-2")}>
            <span>Title</span>
            <input
              type="text"
              required
              value={formState.title}
              onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
              className={fieldClass}
              placeholder="Launch checklist"
            />
          </label>

          <label className={labelClass}>
            <span>Category</span>
            <input
              type="text"
              list="admin-note-category-options"
              value={formState.category}
              onChange={(e) => setFormState((prev) => ({ ...prev, category: e.target.value }))}
              className={fieldClass}
              placeholder="Operations"
            />
            <datalist id="admin-note-category-options">
              {suggestedCategoryOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>

          <label className={labelClass}>
            <span>Date</span>
            <input
              type="date"
              value={formState.noteDate}
              onChange={(e) => setFormState((prev) => ({ ...prev, noteDate: e.target.value }))}
              className={fieldClass}
            />
          </label>

          <label className={labelClass}>
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
                  {formatAdminNotePriorityLabel(priority)}
                </option>
              ))}
            </select>
          </label>

          <label className={cx(labelClass, "sm:col-span-2")}>
            <span>Text</span>
            <textarea
              rows={4}
              value={formState.body}
              onChange={(e) => setFormState((prev) => ({ ...prev, body: e.target.value }))}
              className={textAreaClass}
              placeholder="What to do, blockers, and owner notes."
            />
          </label>

          <div className={cx("space-y-3 p-4 sm:col-span-2", nestedPanelClass)}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={smallHeadingClass}>Image (optional)</p>
                <p className={cx("mt-1", metadataClass)}>
                  Copy a screenshot or image to clipboard, then paste it here, or upload up to{" "}
                  {ADMIN_NOTE_ATTACHMENT_MAX_FILES} files before save.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <AdminNoteClipboardPasteButton
                  className={compactSecondaryActionClass}
                  onPasteReady={async (file) => {
                    setActionError(null);
                    appendCreatePendingScreenshots([file]);
                  }}
                  onError={(message) => {
                    setActionError(message);
                    setActionNotice(null);
                  }}
                  disabled={Boolean(submitting)}
                />
                <label className={cx(compactSecondaryActionClass, "cursor-pointer py-2")}>
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Upload images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    disabled={Boolean(submitting)}
                    onChange={(event) => {
                      handleCreateImageSelection(event.target.files);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
            </div>

            {createPendingScreenshots.length > 0 ? (
              <div className="space-y-3">
                <div className={nestedPanelClass}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[color:var(--fs-color-ink-strong)]">
                        {formatAdminNoteImageCountLabel(createPendingScreenshots.length)} ready to
                        attach
                      </p>
                      <p className="mt-1 text-[11px] text-[color:var(--fs-color-muted)]">
                        {createCaptureRecovery
                          ? `Saved note "${createCaptureRecovery.title}" is waiting on the remaining staged images. Retry upload or remove any images you no longer need.`
                          : "These images stay local until this note save finishes successfully."}
                      </p>
                    </div>
                    {createCaptureRecovery ? (
                      <button
                        type="button"
                        onClick={() => {
                          void retryCreatePendingScreenshotUpload();
                        }}
                        disabled={submitting}
                        className={compactPrimaryActionClass}
                      >
                        <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                        {submitting ? "Retrying…" : "Retry upload"}
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {createPendingScreenshots.map((image, index) => (
                    <div key={image.id} className={nestedPanelClass}>
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.previewUrl}
                          alt={`Pending image preview ${index + 1}`}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[color:var(--fs-color-ink-strong)]">
                            {buildAdminNoteAttachmentOrdinalLabel(
                              index,
                              createPendingScreenshots.length
                            )}
                          </p>
                          <p className="mt-1 truncate text-[11px] text-[color:var(--fs-color-muted)]">
                            {image.file.name}
                          </p>
                          <p className="mt-1 text-[11px] text-[color:var(--fs-color-muted)]">
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
                          removeCreatePendingScreenshot(image.id);
                        }}
                        disabled={submitting}
                        className={cx("mt-3", compactSecondaryActionClass)}
                      >
                        Remove image {index + 1}
                      </button>
                    </div>
                  ))}
                </div>

                {createCaptureRecovery ? (
                  <p className="text-[11px] text-[color:var(--fs-color-muted)]">
                    Saved note: {createCaptureRecovery.title}. Retry the upload here or use Edit
                    from the work queue later.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <label className={labelClass}>
            <span>Attach to (optional)</span>
            <select
              value={formState.contextType}
              onChange={(e) => setCreateContextType(e.target.value as AdminNoteContextType | "")}
              data-testid="admin-note-create-context-type"
              className={fieldClass}
            >
              <option value="">No attachment</option>
              {ADMIN_NOTES_CONTEXT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            <span>Selected target</span>
            {formState.contextType === "" ? (
              <input
                type="text"
                value=""
                disabled
                className={fieldClass}
                placeholder="No attachment"
              />
            ) : null}
            {formState.contextType === "course_module" ? (
              <select
                value={formState.contextRef}
                onChange={(e) => setCreateContextRef(e.target.value)}
                data-testid="admin-note-create-context-module"
                className={fieldClass}
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
                  className={fieldClass}
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
                  className={fieldClass}
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
                className={fieldClass}
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
                className={fieldClass}
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
                className={fieldClass}
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
                className={fieldClass}
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

          <label className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--fs-color-ink)] sm:col-span-2">
            <input
              type="checkbox"
              checked={formState.isDone}
              onChange={(e) => setFormState((prev) => ({ ...prev, isDone: e.target.checked }))}
              className={checkboxClass}
            />
            Mark as done now
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting || createContextInvalid || Boolean(createCaptureRecovery)}
              className={primaryActionClass}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {submitting ? "Saving…" : "Save note"}
            </button>
          </div>
          {createContextInvalid ? (
            <p className="rounded-[var(--fs-radius-control)] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 sm:col-span-2">
              Set both context type and context ref, or leave both empty.
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
