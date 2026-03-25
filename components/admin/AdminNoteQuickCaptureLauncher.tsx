"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import AdminNoteScreenshotCaptureButton from "@/components/admin/AdminNoteScreenshotCaptureButton";
import type { AdminRole } from "@/lib/admin/access";
import { hasRequiredAdminRole } from "@/lib/admin/access";
import { applyAdminTabToSearchParams } from "@/lib/admin/admin-workspace";
import type { AdminCategoryRow } from "@/lib/admin/categories";
import { extractAdminNoteClipboardImage } from "@/lib/admin/note-compose";
import type { AdminNoteContextType } from "@/lib/admin/note-context";
import { uploadAdminNoteFiles } from "@/lib/admin/notes-client";
import {
  ADMIN_NOTE_PRIORITY_VALUES,
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

type FormState = {
  title: string;
  category: string;
  noteDate: string;
  priority: AdminNotePriority;
  body: string;
  isDone: boolean;
};

type SavedNotice = {
  id: string;
  title: string;
};

type PendingScreenshot = {
  file: File;
  previewUrl: string;
};

const INITIAL_CATEGORY = "General";

function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function createInitialFormState(): FormState {
  return {
    title: "",
    category: INITIAL_CATEGORY,
    noteDate: todayDateInputValue(),
    priority: "normal",
    body: "",
    isDone: false,
  };
}

function formatPriorityLabel(priority: AdminNotePriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
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

export default function AdminNoteQuickCaptureLauncher({
  adminRole,
  contextType,
  contextRef,
  contextLabel,
  className = "",
  triggerLabel = "Quick note",
  triggerTestId = "admin-note-quick-capture-trigger",
  description = "Capture a context-aware admin note without leaving this surface.",
  onSaved,
}: Props) {
  const canCreateNotes = Boolean(adminRole && hasRequiredAdminRole(adminRole, "editor"));
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(() => createInitialFormState());
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<SavedNotice | null>(null);
  const [createdCaptureRecovery, setCreatedCaptureRecovery] = useState<SavedNotice | null>(null);
  const [pendingScreenshot, setPendingScreenshot] = useState<PendingScreenshot | null>(null);
  const [imageToolsExpanded, setImageToolsExpanded] = useState(false);
  const datalistId = useId();

  const notesHref = useMemo(() => {
    const notice = savedNotice ?? createdCaptureRecovery;
    if (!notice) return null;
    return buildAdminNotesHref({
      noteId: notice.id,
      contextType,
      contextRef,
    });
  }, [contextRef, contextType, createdCaptureRecovery, savedNotice]);

  useEffect(() => {
    return () => {
      if (pendingScreenshot?.previewUrl) {
        URL.revokeObjectURL(pendingScreenshot.previewUrl);
      }
    };
  }, [pendingScreenshot]);

  useEffect(() => {
    if (pendingScreenshot || createdCaptureRecovery) {
      setImageToolsExpanded(true);
    }
  }, [createdCaptureRecovery, pendingScreenshot]);

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

  if (!canCreateNotes) {
    return null;
  }

  function setPendingScreenshotFromFile(file: File) {
    setPendingScreenshot((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return {
        file,
        previewUrl: URL.createObjectURL(file),
      };
    });
  }

  function clearPendingScreenshot() {
    setPendingScreenshot((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return null;
    });
  }

  function openLauncher() {
    setError(null);
    setSavedNotice(null);
    setCreatedCaptureRecovery(null);
    setImageToolsExpanded(false);
    setOpen(true);
  }

  function closeLauncher() {
    if (submitting) return;
    if (createdCaptureRecovery) {
      setSavedNotice(createdCaptureRecovery);
    }
    setOpen(false);
    setError(null);
    setFormState(createInitialFormState());
    setCreatedCaptureRecovery(null);
    setImageToolsExpanded(false);
    clearPendingScreenshot();
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
    setCreatedCaptureRecovery(null);
    setPendingScreenshotFromFile(result.file);
    setImageToolsExpanded(true);
  }

  async function uploadPendingScreenshot(noteId: string) {
    if (!pendingScreenshot) {
      throw new Error("No screenshot is ready to upload.");
    }

    return uploadAdminNoteFiles({
      noteId,
      files: [pendingScreenshot.file],
    });
  }

  async function retryPendingScreenshotUpload() {
    if (!createdCaptureRecovery || !pendingScreenshot || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const updatedItem = await uploadPendingScreenshot(createdCaptureRecovery.id);
      setSavedNotice({
        id: updatedItem.id,
        title: updatedItem.title,
      });
      setCreatedCaptureRecovery(null);
      clearPendingScreenshot();
      onSaved?.(updatedItem);
      setOpen(false);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload screenshot attachment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

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
          contextType,
          contextRef,
        }),
      });

      const payload = (await response.json()) as AdminNoteCreateResponse;
      if (!response.ok || !payload.ok) {
        setError(payload.ok ? "Could not save note." : (payload.error ?? "Could not save note."));
        return;
      }

      if (pendingScreenshot) {
        try {
          const updatedItem = await uploadPendingScreenshot(payload.item.id);
          setSavedNotice({
            id: updatedItem.id,
            title: updatedItem.title,
          });
          clearPendingScreenshot();
          setCreatedCaptureRecovery(null);
          onSaved?.(updatedItem);
          setOpen(false);
          setFormState(createInitialFormState());
          return;
        } catch (uploadError) {
          setCreatedCaptureRecovery({
            id: payload.item.id,
            title: payload.item.title,
          });
          setFormState(createInitialFormState());
          onSaved?.(payload.item);
          setError(
            uploadError instanceof Error
              ? `Note saved, but ${uploadError.message.toLowerCase()} Retry screenshot upload or open the note in Notes.`
              : "Note saved, but screenshot upload failed. Retry screenshot upload or open the note in Notes."
          );
          return;
        }
      }

      setSavedNotice({
        id: payload.item.id,
        title: payload.item.title,
      });
      setCreatedCaptureRecovery(null);
      onSaved?.(payload.item);
      setOpen(false);
      setFormState(createInitialFormState());
    } catch {
      setError("Could not save note.");
    } finally {
      setSubmitting(false);
    }
  }

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

      {savedNotice ? (
        <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <p className="font-semibold">Quick note saved.</p>
          <p className="mt-1">
            {savedNotice.title}
            {notesHref ? (
              <>
                {" "}
                <a href={notesHref} className="font-semibold underline underline-offset-2">
                  Open in Notes
                </a>
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      <Modal open={open} onClose={closeLauncher} ariaLabel="Quick note capture">
        <div
          className="flex h-full min-h-0 flex-col"
          data-testid="admin-note-quick-capture-dialog"
          data-admin-screenshot-hide-during-capture="true"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Quick capture
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Create note fast</h2>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
            <button
              type="button"
              onClick={closeLauncher}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Context</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{contextLabel}</p>
              <p className="mt-1 text-xs text-slate-600">
                This note will be attached to the canonical route/content context for this surface.
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Image evidence
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    Keep image tools tucked away until you need them
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Paste from clipboard anywhere in this form with Cmd+V or Ctrl+V, or open image
                    tools when you need a screenshot.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImageToolsExpanded((current) => !current)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    {imageToolsExpanded ? "Hide image tools" : "Add image"}
                  </button>
                  {imageToolsExpanded ? (
                    <AdminNoteScreenshotCaptureButton
                      buttonLabel={pendingScreenshot ? "Retake screenshot" : "Capture screenshot"}
                      onCaptureReady={async (file) => {
                        setError(null);
                        setCreatedCaptureRecovery(null);
                        setPendingScreenshotFromFile(file);
                      }}
                    />
                  ) : null}
                </div>
              </div>

              {imageToolsExpanded && !pendingScreenshot ? (
                <p className="mt-3 text-xs text-slate-600">
                  No image attached yet. Paste an image from clipboard or use screenshot capture to
                  stage one before save.
                </p>
              ) : null}

              {pendingScreenshot ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pendingScreenshot.previewUrl}
                        alt="Pending screenshot preview"
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          Screenshot ready to attach
                        </p>
                        <p className="mt-1 text-[11px] text-slate-600">
                          {createdCaptureRecovery
                            ? "The note is already saved. Retry the screenshot upload or finish without it."
                            : "The next note save will upload this screenshot as an admin-only attachment."}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {createdCaptureRecovery ? (
                        <button
                          type="button"
                          onClick={() => {
                            void retryPendingScreenshotUpload();
                          }}
                          disabled={submitting}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                          {submitting ? "Retrying…" : "Retry upload"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          if (createdCaptureRecovery) {
                            setSavedNotice(createdCaptureRecovery);
                            setCreatedCaptureRecovery(null);
                            setOpen(false);
                            setFormState(createInitialFormState());
                          }
                          clearPendingScreenshot();
                        }}
                        disabled={submitting}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remove screenshot
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {createdCaptureRecovery && notesHref ? (
                <p className="mt-3 text-xs text-slate-600">
                  Note saved already.{" "}
                  <a
                    href={notesHref}
                    className="font-semibold text-blue-700 underline underline-offset-2"
                  >
                    Open in Notes
                  </a>{" "}
                  if you want to finish without retrying the screenshot.
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
                  type="text"
                  required
                  autoFocus
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
                <p className="text-xs text-slate-500">
                  {createdCaptureRecovery
                    ? "The note is already saved. Retry the screenshot upload or close and reopen it from Notes."
                    : loadingCategories
                      ? "Loading category suggestions…"
                      : "The note stays local until you click Save note. Clipboard images stay local until the save/upload path succeeds."}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={closeLauncher}
                    disabled={submitting}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {createdCaptureRecovery ? "Done" : "Cancel"}
                  </button>
                  {!createdCaptureRecovery ? (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {submitting ? "Saving…" : "Save note"}
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
        </div>
      </Modal>
    </div>
  );
}
