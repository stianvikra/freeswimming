"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getMobileActionGroupClass,
  mobileActionItemClass,
  mobilePrimaryActionItemClass,
} from "@/components/ui/actionLayout";
import { cx } from "@/components/ui/cx";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import {
  getTrainingNoteStatusLabel,
  getTrainingNoteTypeLabel,
  TRAINING_NOTE_STATUS_VALUES,
  type TrainingNoteStatus,
} from "@/lib/training-context/mvp";
import type {
  TrainingContextSnapshot,
  TrainingFocusView,
  TrainingNoteView,
} from "@/lib/training-context/server";
import { readNavigatorOnlineState } from "@/lib/utils/navigator-online";

export type TrainingGoalPrefill = {
  goalId: string;
  intent: "focus" | "note";
};

type WorkflowIntent = TrainingGoalPrefill["intent"];

type Props = {
  initialSnapshot: TrainingContextSnapshot;
  initialGoalPrefill?: TrainingGoalPrefill | null;
};

type ApiError = {
  ok?: boolean;
  error?: string;
  snapshot?: TrainingContextSnapshot;
};

type FocusDraft = {
  title: string;
  details: string;
  goalId: string;
};

type NoteDraft = {
  noteType: "observation" | "question";
  body: string;
  goalId: string;
  focusId: string;
};

type NoteEditState = {
  body: string;
  status: TrainingNoteStatus;
  answer: string;
};

type FocusEditState = {
  title: string;
  details: string;
  goalId: string;
};

type NoteListSort = "newest" | "oldest" | "recently_edited";

type NoteListFilters = {
  search: string;
  noteType: "all" | TrainingNoteView["noteType"];
  status: "all" | TrainingNoteStatus;
  fromDate: string;
  toDate: string;
  sort: NoteListSort;
};

const FOCUS_DRAFT_STORAGE_KEY = "training-context-focus-draft";
const NOTE_DRAFT_STORAGE_KEY = "training-context-note-draft";
const DEFAULT_NOTE_LIST_FILTERS: NoteListFilters = {
  search: "",
  noteType: "all",
  status: "all",
  fromDate: "",
  toDate: "",
  sort: "newest",
};

function getDefaultFocusDraft(): FocusDraft {
  return {
    title: "",
    details: "",
    goalId: "",
  };
}

function getDefaultNoteDraft(): NoteDraft {
  return {
    noteType: "observation",
    body: "",
    goalId: "",
    focusId: "",
  };
}

function getStorageValue<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return {
      ...fallback,
      ...(JSON.parse(raw) as Record<string, unknown>),
    } as T;
  } catch {
    return fallback;
  }
}

function setStorageValue(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function clearStorageValue(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function getNoteStatusOptions(noteType: TrainingNoteView["noteType"]): TrainingNoteStatus[] {
  if (noteType === "question") {
    return ["unanswered", "answered", "no_answer_needed"];
  }
  return ["open", "actioned", "no_action_needed"];
}

function createNoteEditState(note: TrainingNoteView): NoteEditState {
  return {
    body: note.body,
    status: note.status,
    answer: note.answer ?? "",
  };
}

function createFocusEditState(focus: TrainingFocusView): FocusEditState {
  return {
    title: focus.title,
    details: focus.details ?? "",
    goalId: focus.goalId ?? "",
  };
}

function getPreviewText(value: string | null | undefined, fallback: string, maxLength = 96) {
  const normalized = value?.trim() ?? "";
  if (normalized.length === 0) return fallback;
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}...`;
}

type TrainingContextFeedbackTone = "warning" | "error" | "success" | "info" | "empty";
type TrainingContextFeedbackAnnouncement = "polite" | "assertive" | "none";

const trainingContextFeedbackToneClass: Record<TrainingContextFeedbackTone, string> = {
  warning:
    "rounded-[var(--fs-radius-card)] border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800",
  error:
    "rounded-[var(--fs-radius-card)] border border-[color:var(--fs-color-danger-200)] bg-[color:var(--fs-color-danger-50)] p-4 text-sm text-[color:var(--fs-color-danger-700)]",
  success:
    "rounded-[var(--fs-radius-card)] border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800",
  info: "rounded-[var(--fs-radius-card)] border border-[color:var(--fs-border-brand)] bg-[color:var(--fs-color-brand-50)] p-4 text-sm text-[color:var(--fs-color-brand-700)]",
  empty:
    "rounded-[var(--fs-radius-card)] border border-dashed border-[color:var(--fs-border-soft)] bg-[rgba(248,250,252,0.78)] p-5 text-sm text-[color:var(--fs-color-muted)]",
};

const trainingPanelClass = "fs-library-card p-4 sm:p-5";
const trainingAccentPanelClass = "fs-library-card fs-library-card-accent p-4 sm:p-5";
const trainingMutedPanelClass = "fs-library-card fs-library-card-muted p-4 sm:p-5";
const trainingNestedCardClass = "fs-library-card p-4";
const trainingNestedMutedCardClass = "fs-library-card fs-library-card-muted p-4";
const trainingFieldClass = "ui-field mt-2 rounded-[var(--fs-radius-control)] font-normal";
const trainingLabelClass = "block text-sm font-medium text-[color:var(--fs-color-muted)]";
const trainingActionBaseClass =
  "inline-flex min-h-10 items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const trainingPrimaryActionClass = cx("fs-cta-primary", trainingActionBaseClass);
const trainingSecondaryActionClass = cx("fs-cta-secondary hover:bg-white", trainingActionBaseClass);
const trainingBrandSecondaryActionClass = cx(
  "fs-cta-secondary border-[color:var(--fs-border-brand)] text-[color:var(--fs-color-brand-700)] hover:bg-[color:var(--fs-color-brand-50)]",
  trainingActionBaseClass
);
const trainingSuccessSecondaryActionClass = cx(
  "fs-cta-secondary border-emerald-200 text-emerald-700 hover:bg-emerald-50",
  trainingActionBaseClass
);
const trainingWarningSecondaryActionClass = cx(
  "fs-cta-secondary border-amber-200 text-amber-800 hover:bg-amber-50",
  trainingActionBaseClass
);
const trainingDangerSecondaryActionClass = cx("fs-cta-danger", trainingActionBaseClass);
const trainingMobilePrimaryActionClass = cx(
  trainingPrimaryActionClass,
  mobilePrimaryActionItemClass
);
const trainingMobileSecondaryActionClass = cx(trainingSecondaryActionClass, mobileActionItemClass);
const trainingMobileBrandSecondaryActionClass = cx(
  trainingBrandSecondaryActionClass,
  mobileActionItemClass
);
const trainingMobileSuccessSecondaryActionClass = cx(
  trainingSuccessSecondaryActionClass,
  mobileActionItemClass
);
const trainingChipClass =
  "inline-flex rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/85 px-3 py-1 text-xs font-semibold text-[color:var(--fs-color-muted)]";
const trainingBrandChipClass =
  "inline-flex rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-brand)] bg-white/90 px-3 py-1 text-xs font-semibold text-[color:var(--fs-color-brand-700)]";
const trainingSuccessChipClass =
  "inline-flex rounded-[var(--fs-radius-control)] border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700";
const trainingWarningChipClass =
  "inline-flex rounded-[var(--fs-radius-control)] border border-amber-200 bg-white/90 px-3 py-1 text-xs font-semibold text-amber-700";

function getDefaultTrainingContextFeedbackAnnouncement(
  tone: TrainingContextFeedbackTone
): TrainingContextFeedbackAnnouncement {
  if (tone === "error") return "assertive";
  if (tone === "empty") return "none";
  return "polite";
}

function TrainingContextFeedback({
  tone,
  children,
  action,
  testId,
  announcement,
  className = "",
}: {
  tone: TrainingContextFeedbackTone;
  children: ReactNode;
  action?: ReactNode;
  testId?: string;
  announcement?: TrainingContextFeedbackAnnouncement;
  className?: string;
}) {
  const resolvedAnnouncement = announcement ?? getDefaultTrainingContextFeedbackAnnouncement(tone);

  return (
    <div
      className={`${trainingContextFeedbackToneClass[tone]} ${className}`.trim()}
      data-feedback-tone={tone}
      data-testid={testId}
      role={
        resolvedAnnouncement === "none"
          ? undefined
          : resolvedAnnouncement === "assertive"
            ? "alert"
            : "status"
      }
      aria-live={resolvedAnnouncement === "none" ? undefined : resolvedAnnouncement}
      aria-atomic={resolvedAnnouncement === "none" ? undefined : "true"}
    >
      {children}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

function getPrefillMessage(
  goalTitle: string,
  intent: WorkflowIntent,
  hadExistingLocalDraft: boolean
) {
  const workflowLabel = intent === "focus" ? "focus" : "note";
  return hadExistingLocalDraft
    ? `${goalTitle} was selected from Goals for your next ${workflowLabel}. Existing draft text stayed in place.`
    : `${goalTitle} was selected from Goals for your next ${workflowLabel}. Start in the highlighted ${workflowLabel} form below.`;
}

function hasFocusDraftContent(draft: FocusDraft) {
  return (
    draft.title.trim().length > 0 ||
    draft.details.trim().length > 0 ||
    draft.goalId.trim().length > 0
  );
}

function hasNoteDraftContent(draft: NoteDraft) {
  return (
    draft.body.trim().length > 0 ||
    draft.goalId.trim().length > 0 ||
    draft.focusId.trim().length > 0
  );
}

function getFocusComposerSummary(draft: FocusDraft, goalTitle: string | null) {
  if (draft.title.trim().length > 0) {
    return `Draft ready: ${draft.title.trim()}`;
  }

  if (draft.details.trim().length > 0) {
    return `Draft detail saved: ${getPreviewText(draft.details, "", 80)}`;
  }

  if (goalTitle) {
    return `Selected goal: ${goalTitle}`;
  }

  return "Open when you want to capture the next cue for the pool.";
}

function getNoteComposerSummary(
  draft: NoteDraft,
  goalTitle: string | null,
  focusTitle: string | null
) {
  if (draft.body.trim().length > 0) {
    return `Draft ready: ${getPreviewText(draft.body, "", 90)}`;
  }

  if (focusTitle) {
    return `Selected focus: ${focusTitle}`;
  }

  if (goalTitle) {
    return `Selected goal: ${goalTitle}`;
  }

  return "Open when you want to save an observation or question.";
}

function formatTrainingNoteTimestamp(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "Unknown date";
  return `${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(timestamp))} UTC`;
}

function buildTrainingNoteSearchText(note: TrainingNoteView) {
  return [
    note.noteTypeLabel,
    note.statusLabel,
    note.body,
    note.answer ?? "",
    note.goalTitle ?? "",
    note.focusTitle ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export default function TrainingContextHub({ initialSnapshot, initialGoalPrefill }: Props) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [isOnline, setIsOnline] = useState(true);
  const [clientReady, setClientReady] = useState(false);
  const [focusDraft, setFocusDraft] = useState<FocusDraft>(getDefaultFocusDraft);
  const [noteDraft, setNoteDraft] = useState<NoteDraft>(getDefaultNoteDraft);
  const [editingFocusId, setEditingFocusId] = useState<string | null>(null);
  const [focusEditState, setFocusEditState] = useState<FocusEditState | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteEditState, setNoteEditState] = useState<NoteEditState | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [contextMessage, setContextMessage] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [preferredWorkflowIntent, setPreferredWorkflowIntent] = useState<WorkflowIntent | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingFocusCreate, setPendingFocusCreate] = useState(false);
  const [pendingFocusActionId, setPendingFocusActionId] = useState<string | null>(null);
  const [pendingFocusSaveId, setPendingFocusSaveId] = useState<string | null>(null);
  const [showFocusHistory, setShowFocusHistory] = useState(false);
  const [pendingNoteCreate, setPendingNoteCreate] = useState(false);
  const [pendingNoteSaveId, setPendingNoteSaveId] = useState<string | null>(null);
  const [showFocusComposer, setShowFocusComposer] = useState(true);
  const [showNoteComposer, setShowNoteComposer] = useState(true);
  const [noteListFilters, setNoteListFilters] =
    useState<NoteListFilters>(DEFAULT_NOTE_LIST_FILTERS);

  useEffect(() => {
    setIsOnline(readNavigatorOnlineState());
    const restoredFocusDraft = getStorageValue(FOCUS_DRAFT_STORAGE_KEY, getDefaultFocusDraft());
    const restoredNoteDraft = getStorageValue(NOTE_DRAFT_STORAGE_KEY, getDefaultNoteDraft());
    const nextFocusDraft = { ...restoredFocusDraft };
    const nextNoteDraft = { ...restoredNoteDraft };
    const restoredFocusHasDraft = hasFocusDraftContent(restoredFocusDraft);
    const restoredNoteHasDraft = hasNoteDraftContent(restoredNoteDraft);

    let nextSelectedGoalId = "";
    let nextContextMessage = "";
    let nextPreferredWorkflowIntent: WorkflowIntent | null = null;
    let nextShowFocusComposer = restoredFocusHasDraft || initialSnapshot.openFocuses.length === 0;
    let nextShowNoteComposer = restoredNoteHasDraft || initialSnapshot.recentNotes.length === 0;

    if (initialGoalPrefill?.goalId) {
      const prefilledGoal = initialSnapshot.goalOptions.find(
        (goal) => goal.id === initialGoalPrefill.goalId
      );

      if (prefilledGoal) {
        nextPreferredWorkflowIntent = initialGoalPrefill.intent;
        const hadExistingLocalDraft = restoredFocusHasDraft || restoredNoteHasDraft;

        nextSelectedGoalId = prefilledGoal.id;
        if (!nextFocusDraft.goalId) {
          nextFocusDraft.goalId = prefilledGoal.id;
        }
        if (!nextNoteDraft.goalId) {
          nextNoteDraft.goalId = prefilledGoal.id;
        }

        nextContextMessage = getPrefillMessage(
          prefilledGoal.title,
          initialGoalPrefill.intent,
          hadExistingLocalDraft
        );
        if (initialGoalPrefill.intent === "focus") {
          nextShowFocusComposer = true;
        } else {
          nextShowNoteComposer = true;
        }
      } else {
        nextContextMessage =
          "The goal selected from Goals is no longer available. Pick another goal below.";
      }
    }

    setFocusDraft(nextFocusDraft);
    setNoteDraft(nextNoteDraft);
    setSelectedGoalId(nextSelectedGoalId);
    setPreferredWorkflowIntent(nextPreferredWorkflowIntent);
    setContextMessage(nextContextMessage);
    setShowFocusComposer(nextShowFocusComposer);
    setShowNoteComposer(nextShowNoteComposer);
    setClientReady(true);

    function onOnline() {
      setIsOnline(true);
    }

    function onOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [
    initialGoalPrefill?.goalId,
    initialGoalPrefill?.intent,
    initialSnapshot.goalOptions,
    initialSnapshot.openFocuses.length,
    initialSnapshot.recentNotes.length,
  ]);

  useEffect(() => {
    setStorageValue(FOCUS_DRAFT_STORAGE_KEY, focusDraft);
  }, [focusDraft]);

  useEffect(() => {
    setStorageValue(NOTE_DRAFT_STORAGE_KEY, noteDraft);
  }, [noteDraft]);

  const goalOptionById = useMemo(
    () => new Map(snapshot.goalOptions.map((goal) => [goal.id, goal] as const)),
    [snapshot.goalOptions]
  );

  const selectedGoal = selectedGoalId ? (goalOptionById.get(selectedGoalId) ?? null) : null;

  async function parseError(response: Response, fallback: string) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;
    return payload?.error || fallback;
  }

  function applyGoalContext(goalId: string, intent: "focus" | "note") {
    const goal = goalOptionById.get(goalId);
    if (!goal) {
      setContextMessage("That goal is no longer available. Pick another goal below.");
      return;
    }

    setSelectedGoalId(goal.id);
    setPreferredWorkflowIntent(intent);
    setActionError("");
    setActionSuccess("");

    if (intent === "focus") {
      setShowFocusComposer(true);
      setFocusDraft((prev) => ({ ...prev, goalId: goal.id }));
      setContextMessage(
        `${goal.title} is selected for your next focus. Start in the highlighted focus form below.`
      );
      return;
    }

    setShowNoteComposer(true);
    setNoteDraft((prev) => ({ ...prev, goalId: goal.id }));
    setContextMessage(
      `${goal.title} is selected for your next note. Start in the highlighted note form below.`
    );
  }

  function clearGoalContext() {
    const currentGoalId = selectedGoalId;
    setSelectedGoalId("");
    setPreferredWorkflowIntent(null);
    setContextMessage("Goal context cleared. You can still link a goal manually from either form.");
    setFocusDraft((prev) => (prev.goalId === currentGoalId ? { ...prev, goalId: "" } : prev));
    setNoteDraft((prev) => (prev.goalId === currentGoalId ? { ...prev, goalId: "" } : prev));
  }

  async function refreshSnapshot() {
    setIsRefreshing(true);
    setActionError("");

    try {
      const response = await fetch("/api/my-library/training-context", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not refresh Focus and Notes right now."));
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setActionError("Could not refresh Focus and Notes right now.");
        return;
      }

      setSnapshot(payload.snapshot);
      void sendClientAnalyticsEvent("training_context_refreshed", {
        noteCount: payload.snapshot.recentNotes.length,
        hasPrimaryFocus: Boolean(payload.snapshot.primaryFocus),
        openFocusCount: payload.snapshot.openFocuses.length,
      });
    } catch {
      setActionError("Could not refresh Focus and Notes right now.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function createFocus(e: React.FormEvent) {
    e.preventDefault();
    if (!isOnline) {
      setActionError("You are offline. Reconnect before saving a new focus.");
      return;
    }

    setPendingFocusCreate(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch("/api/my-library/training-context/focus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: focusDraft.title,
          details: focusDraft.details,
          goalId: focusDraft.goalId || null,
        }),
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not save focus right now."));
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setActionError("Could not save focus right now.");
        return;
      }

      setSnapshot(payload.snapshot);
      setFocusDraft(getDefaultFocusDraft());
      clearStorageValue(FOCUS_DRAFT_STORAGE_KEY);
      setActionSuccess(
        payload.snapshot.primaryFocus
          ? "Focus saved."
          : "Focus saved. Choose a primary focus when you want one cue used elsewhere in My Library."
      );
      void sendClientAnalyticsEvent("training_focus_created", {
        linkedGoal: Boolean(focusDraft.goalId),
        openFocusCount: payload.snapshot.openFocuses.length,
        hasPrimaryFocus: Boolean(payload.snapshot.primaryFocus),
      });
    } catch {
      setActionError("Could not save focus right now.");
    } finally {
      setPendingFocusCreate(false);
    }
  }

  async function updateFocusStatus(
    focusId: string,
    action: "complete" | "archive" | "reopen" | "set_primary" | "clear_primary"
  ) {
    if (!isOnline) {
      setActionError("You are offline. Reconnect before updating focus.");
      return;
    }

    setPendingFocusActionId(focusId);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch(`/api/my-library/training-context/focus/${focusId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not update focus right now."));
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setActionError("Could not update focus right now.");
        return;
      }

      setSnapshot(payload.snapshot);
      if (editingFocusId === focusId) {
        setEditingFocusId(null);
        setFocusEditState(null);
      }
      setActionSuccess(
        action === "complete"
          ? "Focus marked completed."
          : action === "archive"
            ? "Focus archived."
            : action === "reopen"
              ? "Focus reopened."
              : action === "clear_primary"
                ? "Primary focus removed."
                : "Primary focus updated."
      );
      void sendClientAnalyticsEvent(
        action === "set_primary" || action === "clear_primary"
          ? "training_focus_primary_updated"
          : "training_focus_resolved",
        {
          action,
          openFocusCount: payload.snapshot.openFocuses.length,
          hasPrimaryFocus: Boolean(payload.snapshot.primaryFocus),
        }
      );
    } catch {
      setActionError("Could not update focus right now.");
    } finally {
      setPendingFocusActionId(null);
    }
  }

  async function createNote(e: React.FormEvent) {
    e.preventDefault();
    if (!isOnline) {
      setActionError("You are offline. Reconnect before saving a note.");
      return;
    }

    setPendingNoteCreate(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch("/api/my-library/training-context/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteType: noteDraft.noteType,
          body: noteDraft.body,
          goalId: noteDraft.goalId || null,
          focusId: noteDraft.focusId || null,
        }),
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not save note right now."));
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setActionError("Could not save note right now.");
        return;
      }

      setSnapshot(payload.snapshot);
      setNoteDraft(getDefaultNoteDraft());
      clearStorageValue(NOTE_DRAFT_STORAGE_KEY);
      setActionSuccess(
        noteDraft.noteType === "question" ? "Question saved." : "Observation saved."
      );
      void sendClientAnalyticsEvent("training_note_created", {
        noteType: noteDraft.noteType,
        linkedGoal: Boolean(noteDraft.goalId),
        linkedFocus: Boolean(noteDraft.focusId),
      });
    } catch {
      setActionError("Could not save note right now.");
    } finally {
      setPendingNoteCreate(false);
    }
  }

  function openFocusEditor(focus: TrainingFocusView) {
    setEditingFocusId(focus.id);
    setFocusEditState(createFocusEditState(focus));
    setActionError("");
    setActionSuccess("");
  }

  async function saveFocus(focusId: string) {
    if (!focusEditState) return;
    if (!isOnline) {
      setActionError("You are offline. Reconnect before updating focus.");
      return;
    }

    setPendingFocusSaveId(focusId);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch(`/api/my-library/training-context/focus/${focusId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: focusEditState.title,
          details: focusEditState.details,
          goalId: focusEditState.goalId || null,
        }),
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not save focus changes right now."));
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setActionError("Could not save focus changes right now.");
        return;
      }

      setSnapshot(payload.snapshot);
      setEditingFocusId(null);
      setFocusEditState(null);
      setActionSuccess("Focus updated.");
      void sendClientAnalyticsEvent("training_focus_updated", {
        linkedGoal: Boolean(focusEditState.goalId),
        openFocusCount: payload.snapshot.openFocuses.length,
        hasPrimaryFocus: Boolean(payload.snapshot.primaryFocus),
      });
    } catch {
      setActionError("Could not save focus changes right now.");
    } finally {
      setPendingFocusSaveId(null);
    }
  }

  function openNoteEditor(note: TrainingNoteView) {
    setEditingNoteId(note.id);
    setNoteEditState(createNoteEditState(note));
    setActionError("");
    setActionSuccess("");
  }

  async function saveNote(noteId: string) {
    if (!noteEditState) return;
    if (!isOnline) {
      setActionError("You are offline. Reconnect before updating a note.");
      return;
    }

    setPendingNoteSaveId(noteId);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch(`/api/my-library/training-context/notes/${noteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: noteEditState.body,
          status: noteEditState.status,
          answer: noteEditState.answer,
        }),
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not update note right now."));
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setActionError("Could not update note right now.");
        return;
      }

      setSnapshot(payload.snapshot);
      setEditingNoteId(null);
      setNoteEditState(null);
      setActionSuccess("Note updated.");
      void sendClientAnalyticsEvent("training_note_updated", {
        status: noteEditState.status,
      });
    } catch {
      setActionError("Could not update note right now.");
    } finally {
      setPendingNoteSaveId(null);
    }
  }

  const focusOptions = [...snapshot.openFocuses, ...snapshot.focusHistory];
  const selectedFocus = snapshot.activeFocus;
  const primaryFocus = snapshot.primaryFocus;
  const editingFocus =
    editingFocusId !== null
      ? (snapshot.openFocuses.find((focus) => focus.id === editingFocusId) ?? null)
      : null;
  const editingNote =
    editingNoteId !== null
      ? (snapshot.recentNotes.find((note) => note.id === editingNoteId) ?? null)
      : null;
  const getGoalOption = (goalId: string | null | undefined) =>
    goalId ? (goalOptionById.get(goalId) ?? null) : null;
  const overviewGoal =
    [
      selectedGoal,
      getGoalOption(focusEditState?.goalId),
      getGoalOption(focusDraft.goalId),
      getGoalOption(noteDraft.goalId),
      getGoalOption(selectedFocus?.goalId),
      getGoalOption(snapshot.recentNotes[0]?.goalId),
    ].find((goal) => goal !== null) ?? null;
  const overviewFocusTitle =
    editingFocus && focusEditState
      ? focusEditState.title.trim() || editingFocus.title
      : (selectedFocus?.title ?? null);
  const overviewNoteText =
    editingNote && noteEditState
      ? noteEditState.body.trim() || editingNote.body
      : (snapshot.recentNotes[0]?.body ?? null);
  const primaryOpenFocus = snapshot.openFocuses.find((focus) => focus.isPrimary) ?? null;
  const nonPrimaryOpenFocuses = snapshot.openFocuses.filter((focus) => !focus.isPrimary);
  const focusDraftHasContent = hasFocusDraftContent(focusDraft);
  const noteDraftHasContent = hasNoteDraftContent(noteDraft);
  const focusComposerSummary = getFocusComposerSummary(
    focusDraft,
    focusDraft.goalId ? (goalOptionById.get(focusDraft.goalId)?.title ?? null) : null
  );
  const noteComposerSummary = getNoteComposerSummary(
    noteDraft,
    noteDraft.goalId ? (goalOptionById.get(noteDraft.goalId)?.title ?? null) : null,
    noteDraft.focusId
      ? (focusOptions.find((focus) => focus.id === noteDraft.focusId)?.title ?? null)
      : null
  );
  const availableNoteStatuses = useMemo(
    () =>
      TRAINING_NOTE_STATUS_VALUES.filter((status) =>
        snapshot.recentNotes.some((note) => note.status === status)
      ),
    [snapshot.recentNotes]
  );
  const hasActiveNoteFilters =
    noteListFilters.search.trim().length > 0 ||
    noteListFilters.noteType !== "all" ||
    noteListFilters.status !== "all" ||
    noteListFilters.fromDate.length > 0 ||
    noteListFilters.toDate.length > 0 ||
    noteListFilters.sort !== "newest";
  const filteredRecentNotes = useMemo(() => {
    const search = noteListFilters.search.trim().toLowerCase();

    return [...snapshot.recentNotes]
      .filter((note) => {
        if (noteListFilters.noteType !== "all" && note.noteType !== noteListFilters.noteType) {
          return false;
        }

        if (noteListFilters.status !== "all" && note.status !== noteListFilters.status) {
          return false;
        }

        const noteCreatedDate = note.createdAt.slice(0, 10);
        if (noteListFilters.fromDate && noteCreatedDate < noteListFilters.fromDate) {
          return false;
        }
        if (noteListFilters.toDate && noteCreatedDate > noteListFilters.toDate) {
          return false;
        }

        if (search.length > 0 && !buildTrainingNoteSearchText(note).includes(search)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (noteListFilters.sort === "oldest") {
          return a.createdAt.localeCompare(b.createdAt);
        }

        if (noteListFilters.sort === "recently_edited") {
          const updatedComparison = b.updatedAt.localeCompare(a.updatedAt);
          if (updatedComparison !== 0) return updatedComparison;
          return b.createdAt.localeCompare(a.createdAt);
        }

        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [noteListFilters, snapshot.recentNotes]);

  function renderFocusCard(focus: TrainingFocusView, options?: { featured?: boolean }) {
    const isEditing = editingFocusId === focus.id && focusEditState !== null;
    const isStatusPending = pendingFocusActionId === focus.id;
    const isSavePending = pendingFocusSaveId === focus.id;

    return (
      <article
        key={focus.id}
        data-testid={`training-focus-card-${focus.id}`}
        className={cx(
          options?.featured ? trainingAccentPanelClass : trainingNestedMutedCardClass,
          "h-full"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
            {isEditing ? focusEditState.title || focus.title : focus.title}
          </h4>
          <span className={trainingChipClass}>{focus.statusLabel}</span>
          {focus.isPrimary ? <span className={trainingSuccessChipClass}>Primary</span> : null}
        </div>

        {isEditing ? (
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className={trainingLabelClass}>Focus title</span>
              <input
                value={focusEditState.title}
                onChange={(e) =>
                  setFocusEditState((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                }
                className={trainingFieldClass}
              />
            </label>

            <label className="block">
              <span className={trainingLabelClass}>Optional detail</span>
              <textarea
                value={focusEditState.details}
                onChange={(e) =>
                  setFocusEditState((prev) => (prev ? { ...prev, details: e.target.value } : prev))
                }
                rows={3}
                className={trainingFieldClass}
              />
            </label>

            <label className="block">
              <span className={trainingLabelClass}>Optional linked goal</span>
              <select
                data-testid={`training-focus-edit-goal-select-${focus.id}`}
                value={focusEditState.goalId}
                onChange={(e) =>
                  setFocusEditState((prev) => (prev ? { ...prev, goalId: e.target.value } : prev))
                }
                className={trainingFieldClass}
              >
                <option value="">No linked goal</option>
                {snapshot.goalOptions.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title} ({goal.statusLabel})
                  </option>
                ))}
              </select>
            </label>

            <div className={getMobileActionGroupClass(5, { desktopJustify: "start" })}>
              <button
                type="button"
                onClick={() => void saveFocus(focus.id)}
                disabled={isSavePending}
                className={trainingMobilePrimaryActionClass}
              >
                {isSavePending ? "Saving..." : "Save focus"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingFocusId(null);
                  setFocusEditState(null);
                }}
                className={trainingMobileSecondaryActionClass}
              >
                Cancel
              </button>
              {focus.isPrimary ? (
                <button
                  type="button"
                  data-testid={`training-focus-clear-primary-${focus.id}`}
                  onClick={() => void updateFocusStatus(focus.id, "clear_primary")}
                  disabled={isStatusPending}
                  className={trainingMobileSuccessSecondaryActionClass}
                >
                  {isStatusPending ? "Saving..." : "Remove primary"}
                </button>
              ) : (
                <button
                  type="button"
                  data-testid={`training-focus-set-primary-${focus.id}`}
                  onClick={() => void updateFocusStatus(focus.id, "set_primary")}
                  disabled={isStatusPending}
                  className={trainingMobileBrandSecondaryActionClass}
                >
                  {isStatusPending ? "Saving..." : "Set primary"}
                </button>
              )}
              <button
                type="button"
                data-testid={`training-focus-complete-${focus.id}`}
                onClick={() => void updateFocusStatus(focus.id, "complete")}
                disabled={isStatusPending}
                className={trainingMobilePrimaryActionClass}
              >
                {isStatusPending ? "Saving..." : "Mark completed"}
              </button>
              <button
                type="button"
                data-testid={`training-focus-archive-${focus.id}`}
                onClick={() => void updateFocusStatus(focus.id, "archive")}
                disabled={isStatusPending}
                className={trainingMobileSecondaryActionClass}
              >
                Archive
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
              {focus.details ?? "No extra detail saved for this focus yet."}
            </p>
            {focus.goalTitle ? (
              <p className="mt-2 text-xs text-[color:var(--fs-color-muted)]">
                Goal: {focus.goalTitle}
              </p>
            ) : null}
            <div
              className={cx(
                "mt-4",
                getMobileActionGroupClass(focus.isPrimary ? 4 : 2, { desktopJustify: "start" })
              )}
            >
              <button
                type="button"
                onClick={() => openFocusEditor(focus)}
                className={trainingMobileSecondaryActionClass}
              >
                Edit focus
              </button>
              {focus.isPrimary ? (
                <>
                  <button
                    type="button"
                    data-testid={`training-focus-clear-primary-${focus.id}`}
                    onClick={() => void updateFocusStatus(focus.id, "clear_primary")}
                    disabled={isStatusPending}
                    className={trainingMobileSuccessSecondaryActionClass}
                  >
                    {isStatusPending ? "Saving..." : "Remove primary"}
                  </button>
                  <button
                    type="button"
                    data-testid={`training-focus-complete-${focus.id}`}
                    onClick={() => void updateFocusStatus(focus.id, "complete")}
                    disabled={isStatusPending}
                    className={trainingMobilePrimaryActionClass}
                  >
                    {isStatusPending ? "Saving..." : "Mark completed"}
                  </button>
                  <button
                    type="button"
                    data-testid={`training-focus-archive-${focus.id}`}
                    onClick={() => void updateFocusStatus(focus.id, "archive")}
                    disabled={isStatusPending}
                    className={trainingMobileSecondaryActionClass}
                  >
                    Archive
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  data-testid={`training-focus-set-primary-${focus.id}`}
                  onClick={() => void updateFocusStatus(focus.id, "set_primary")}
                  disabled={isStatusPending}
                  className={trainingMobileBrandSecondaryActionClass}
                >
                  {isStatusPending ? "Saving..." : "Set primary"}
                </button>
              )}
            </div>
            {!focus.isPrimary ? (
              <p className="mt-3 text-xs text-[color:var(--fs-color-muted)]">
                Complete or archive from Edit focus when this cue is done.
              </p>
            ) : null}
          </>
        )}
      </article>
    );
  }

  return (
    <div
      className="space-y-8"
      data-testid="training-context-hub"
      data-client-ready={clientReady ? "true" : "false"}
    >
      {!snapshot.schemaReady ? (
        <TrainingContextFeedback
          tone="warning"
          testId="training-schema-warning"
          action={
            <button
              type="button"
              onClick={() => void refreshSnapshot()}
              className={trainingWarningSecondaryActionClass}
            >
              {isRefreshing ? "Refreshing..." : "Retry"}
            </button>
          }
        >
          <h2 className="text-lg font-semibold text-[color:var(--fs-color-ink-strong)]">
            My Training is syncing
          </h2>
          <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
            The new training-context tables are not ready in this environment yet. Refresh after the
            migration has finished.
          </p>
        </TrainingContextFeedback>
      ) : null}

      {isOnline ? null : (
        <TrainingContextFeedback tone="warning" testId="training-offline-feedback">
          You are offline. Existing Focus and Notes stay visible, but save/update actions are paused
          until you reconnect.
        </TrainingContextFeedback>
      )}

      {snapshot.loadError ? (
        <TrainingContextFeedback
          tone="error"
          testId="training-load-error"
          action={
            <button
              type="button"
              onClick={() => void refreshSnapshot()}
              className={trainingDangerSecondaryActionClass}
            >
              {isRefreshing ? "Refreshing..." : "Retry"}
            </button>
          }
        >
          <p className="text-sm font-medium">{snapshot.loadError}</p>
        </TrainingContextFeedback>
      ) : null}

      {contextMessage ? (
        <TrainingContextFeedback tone="info" testId="training-context-message">
          <p className="text-sm font-medium">{contextMessage}</p>
        </TrainingContextFeedback>
      ) : null}

      {actionError ? (
        <TrainingContextFeedback tone="error" testId="training-action-error">
          <p className="text-sm font-medium">{actionError}</p>
        </TrainingContextFeedback>
      ) : null}

      {actionSuccess ? (
        <TrainingContextFeedback tone="success" testId="training-action-success">
          <p className="text-sm font-medium">{actionSuccess}</p>
        </TrainingContextFeedback>
      ) : null}

      <section className={trainingAccentPanelClass}>
        <h2 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
          Today at a glance
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <a
            href="#training-goals-section"
            data-testid="training-overview-card-goals"
            className={cx(trainingNestedCardClass, "transition-colors hover:bg-white")}
          >
            <p className="text-xs font-semibold text-[color:var(--fs-color-brand-700)] uppercase">
              Goals
            </p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
              {overviewGoal ? overviewGoal.title : "No goal selected yet"}
            </p>
            <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
              {overviewGoal
                ? `Current goal context${overviewGoal.statusLabel ? ` • ${overviewGoal.statusLabel}` : ""}`
                : "Choose a goal below when you want a little longer-term context."}
            </p>
          </a>
          <a
            href="#training-focus-section"
            data-testid="training-overview-card-focus"
            className={cx(trainingNestedCardClass, "transition-colors hover:bg-white")}
          >
            <p className="text-xs font-semibold text-emerald-700 uppercase">Focus</p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
              {snapshot.focusNeedsPrimarySelection
                ? "Choose a primary focus"
                : (overviewFocusTitle ?? "No open focus yet")}
            </p>
            <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
              {snapshot.focusNeedsPrimarySelection
                ? `${snapshot.openFocuses.length} open focuses need one explicit primary cue.`
                : primaryFocus
                  ? "Primary focus for the rest of My Library."
                  : selectedFocus
                    ? "Current focus cue shown from your open focus list."
                    : "Add the next cue you want to carry into the pool."}
            </p>
          </a>
          <a
            href="#training-notes-section"
            data-testid="training-overview-card-notes"
            className={cx(trainingNestedCardClass, "transition-colors hover:bg-white")}
          >
            <p className="text-xs font-semibold text-amber-700 uppercase">Notes</p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
              {snapshot.recentNotes.length > 0 ? "Latest note" : "No notes yet"}
            </p>
            <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
              {getPreviewText(
                overviewNoteText,
                "Save what you noticed or what you want to check later.",
                110
              )}
            </p>
          </a>
        </div>
      </section>

      <section
        id="training-goals-section"
        data-testid="training-goals-section"
        className={trainingAccentPanelClass}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--fs-color-ink-strong)]">
              Start from a goal
            </h2>
            <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
              Goals stay long-term. Use one here when you want the next focus or note to start with
              the right context.
            </p>
          </div>
          {selectedGoal ? (
            <button
              type="button"
              onClick={clearGoalContext}
              className={trainingSecondaryActionClass}
            >
              Clear selection
            </button>
          ) : null}
        </div>

        {selectedGoal ? (
          <div
            className={cx("mt-4", trainingNestedCardClass)}
            data-testid="training-context-selected-goal"
          >
            <p className="text-xs font-semibold text-[color:var(--fs-color-brand-700)] uppercase">
              Selected goal
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                {selectedGoal.title}
              </h3>
              <span className={trainingBrandChipClass}>{selectedGoal.statusLabel}</span>
            </div>
          </div>
        ) : null}
        {snapshot.goalOptions.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.goalOptions.map((goal) => {
              const isSelected = selectedGoalId === goal.id;

              return (
                <article
                  key={goal.id}
                  data-testid={`training-goal-context-card-${goal.id}`}
                  className={cx(
                    trainingNestedCardClass,
                    isSelected ? "border-[color:var(--fs-border-brand)]" : ""
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                      {goal.title}
                    </h3>
                    <span className={trainingChipClass}>{goal.statusLabel}</span>
                  </div>
                  <div
                    className={cx(
                      "mt-4",
                      getMobileActionGroupClass(2, { desktopJustify: "start" })
                    )}
                  >
                    <button
                      type="button"
                      data-testid={`training-goal-context-use-focus-${goal.id}`}
                      onClick={() => applyGoalContext(goal.id, "focus")}
                      className={trainingMobilePrimaryActionClass}
                    >
                      Use for focus
                    </button>
                    <button
                      type="button"
                      data-testid={`training-goal-context-use-note-${goal.id}`}
                      onClick={() => applyGoalContext(goal.id, "note")}
                      className={trainingMobileSecondaryActionClass}
                    >
                      Use for note
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <TrainingContextFeedback
            tone="empty"
            testId="training-goals-empty-state"
            className="mt-4"
          >
            <p className="text-sm text-[color:var(--fs-color-muted)]">
              No active goals are available here yet. Create one in Goals first, then come back to
              connect it to a focus or note.
            </p>
            <div className="mt-4">
              <Link href="/my-library/goals" className={trainingSecondaryActionClass}>
                Open Goals
              </Link>
            </div>
          </TrainingContextFeedback>
        )}
      </section>

      <section
        id="training-focus-section"
        data-testid="training-focus-section"
        className={trainingPanelClass}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--fs-color-ink-strong)]">Focus</h2>
            <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
              Keep the main cue clear and keep supporting focuses close by when you still need them.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshSnapshot()}
            className={trainingSecondaryActionClass}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-4">
            {snapshot.focusNeedsPrimarySelection ? (
              <TrainingContextFeedback
                tone="warning"
                testId="training-primary-focus-warning"
                className="p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                    Choose a primary focus
                  </h3>
                  <span className={trainingWarningChipClass}>Action needed</span>
                </div>
                <p className="mt-2 text-sm text-amber-800">
                  You have {snapshot.openFocuses.length} open focuses and no primary focus selected
                  yet. Pick one below before other My Library surfaces try to use a single current
                  cue.
                </p>
              </TrainingContextFeedback>
            ) : primaryOpenFocus ? (
              <div
                className={cx(trainingNestedMutedCardClass, "border-emerald-200 bg-emerald-50/60")}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                    Primary focus
                  </h3>
                  <span className={trainingSuccessChipClass}>Used across My Library</span>
                </div>
                <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
                  Keep one clear cue here when other My Library surfaces need a single current
                  focus.
                </p>
              </div>
            ) : selectedFocus ? (
              <div
                className={cx(trainingNestedMutedCardClass, "border-emerald-200 bg-emerald-50/60")}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                    {primaryFocus ? "Primary focus" : "Current focus cue"}
                  </h3>
                  <span className={trainingSuccessChipClass}>{selectedFocus.title}</span>
                </div>
                <p className="mt-3 text-sm text-[color:var(--fs-color-muted)]">
                  {selectedFocus.details ??
                    "This is the clearest current cue available across your open focus list."}
                </p>
                {selectedFocus.goalTitle ? (
                  <p className="mt-3 text-xs font-medium text-[color:var(--fs-color-muted)]">
                    Linked goal: {selectedFocus.goalTitle}
                  </p>
                ) : null}
              </div>
            ) : (
              <TrainingContextFeedback tone="empty" testId="training-focus-empty-state">
                <h3 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                  No open focus yet
                </h3>
                <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
                  Add the next technical or tactical cue you want to carry into the pool.
                </p>
              </TrainingContextFeedback>
            )}

            {snapshot.focusHistory.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowFocusHistory((prev) => !prev)}
                className={trainingSecondaryActionClass}
              >
                {showFocusHistory ? "Hide completed & archived" : "Show completed & archived"}
              </button>
            ) : null}
          </div>

          <div
            className={cx(
              preferredWorkflowIntent === "focus"
                ? trainingAccentPanelClass
                : trainingMutedPanelClass,
              "transition"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                  Add focus
                </h3>
                {preferredWorkflowIntent === "focus" ? (
                  <span
                    data-testid="training-focus-intent-badge"
                    className={trainingBrandChipClass}
                  >
                    From Goals
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                data-testid="training-focus-form-toggle"
                aria-expanded={showFocusComposer}
                aria-controls="training-focus-form"
                onClick={() => setShowFocusComposer((prev) => !prev)}
                className={trainingSecondaryActionClass}
              >
                {showFocusComposer
                  ? "Collapse"
                  : focusDraftHasContent
                    ? "Resume draft"
                    : "Add focus"}
              </button>
            </div>
            <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
              {showFocusComposer
                ? "Saving a new focus will never auto-complete or auto-archive the ones you already have."
                : focusComposerSummary}
            </p>
            {preferredWorkflowIntent === "focus" ? (
              <p className="mt-2 text-sm font-medium text-[color:var(--fs-color-brand-700)]">
                This is the recommended next step for the selected goal. The note form stays
                available below if you want to capture an observation or question too.
              </p>
            ) : null}
            {focusDraft.goalId ? (
              <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
                This focus will support:{" "}
                <span className="font-medium text-[color:var(--fs-color-ink-strong)]">
                  {goalOptionById.get(focusDraft.goalId)?.title ?? "Selected goal"}
                </span>
              </p>
            ) : null}
            {showFocusComposer ? (
              <form
                id="training-focus-form"
                onSubmit={createFocus}
                data-testid="training-focus-form"
                data-goal-intent-highlight={preferredWorkflowIntent === "focus" ? "true" : "false"}
                className="mt-4 space-y-4"
              >
                <label className={trainingLabelClass}>
                  Focus title
                  <input
                    value={focusDraft.title}
                    onChange={(e) => setFocusDraft((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Exhale calmly before turning to breathe"
                    className={trainingFieldClass}
                  />
                </label>

                <label className={trainingLabelClass}>
                  Optional detail
                  <textarea
                    value={focusDraft.details}
                    onChange={(e) =>
                      setFocusDraft((prev) => ({ ...prev, details: e.target.value }))
                    }
                    rows={3}
                    placeholder="What do you want to watch for in the next session?"
                    className={trainingFieldClass}
                  />
                </label>

                <label className={trainingLabelClass}>
                  Optional linked goal
                  <select
                    data-testid="training-focus-goal-select"
                    value={focusDraft.goalId}
                    onChange={(e) => setFocusDraft((prev) => ({ ...prev, goalId: e.target.value }))}
                    className={trainingFieldClass}
                  >
                    <option value="">No linked goal</option>
                    {snapshot.goalOptions.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title} ({goal.statusLabel})
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="submit"
                  disabled={!snapshot.schemaReady || pendingFocusCreate}
                  className={trainingMobilePrimaryActionClass}
                >
                  {pendingFocusCreate ? "Saving..." : "Save open focus"}
                </button>
              </form>
            ) : null}
          </div>
        </div>

        {primaryOpenFocus ? (
          <div className="mt-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase">
                Primary focus
              </h3>
              <div className="mt-3">{renderFocusCard(primaryOpenFocus, { featured: true })}</div>
            </div>

            {nonPrimaryOpenFocuses.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase">
                  Other open focuses
                </h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {nonPrimaryOpenFocuses.map((focus) => renderFocusCard(focus))}
                </div>
              </div>
            ) : null}
          </div>
        ) : snapshot.openFocuses.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-sm font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase">
              Open focus list
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {snapshot.openFocuses.map((focus) => renderFocusCard(focus))}
            </div>
          </div>
        ) : null}

        {showFocusHistory && snapshot.focusHistory.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-sm font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase">
              Completed & archived
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {snapshot.focusHistory.map((focus) => (
                <article key={focus.id} className={trainingNestedMutedCardClass}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                      {focus.title}
                    </h4>
                    <span className={trainingChipClass}>{focus.statusLabel}</span>
                  </div>
                  {focus.goalTitle ? (
                    <p className="mt-2 text-xs text-[color:var(--fs-color-muted)]">
                      Goal: {focus.goalTitle}
                    </p>
                  ) : null}
                  <div
                    className={cx(
                      "mt-4",
                      getMobileActionGroupClass(1, { desktopJustify: "start" })
                    )}
                  >
                    <button
                      type="button"
                      data-testid={`training-focus-reopen-${focus.id}`}
                      onClick={() => void updateFocusStatus(focus.id, "reopen")}
                      disabled={pendingFocusActionId === focus.id}
                      className={trainingMobileSecondaryActionClass}
                    >
                      {pendingFocusActionId === focus.id ? "Saving..." : "Reopen"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section
        id="training-notes-section"
        data-testid="training-notes-section"
        className={trainingPanelClass}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--fs-color-ink-strong)]">Notes</h2>
            <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
              Keep short observations and questions close to the training moment, then answer or
              close them later.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className={trainingNestedMutedCardClass}>
              <p className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                {snapshot.unresolvedObservationCount}
              </p>
              <p className="text-xs text-[color:var(--fs-color-muted)]">Open observations</p>
            </div>
            <div className={trainingNestedMutedCardClass}>
              <p className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                {snapshot.unansweredQuestionCount}
              </p>
              <p className="text-xs text-[color:var(--fs-color-muted)]">Unanswered questions</p>
            </div>
          </div>
        </div>

        <div
          className={cx(
            "mt-5 transition",
            preferredWorkflowIntent === "note" ? trainingAccentPanelClass : trainingMutedPanelClass
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                Add note
              </h3>
              {preferredWorkflowIntent === "note" ? (
                <span data-testid="training-note-intent-badge" className={trainingBrandChipClass}>
                  From Goals
                </span>
              ) : null}
            </div>
            <button
              type="button"
              data-testid="training-note-form-toggle"
              aria-expanded={showNoteComposer}
              aria-controls="training-note-form"
              onClick={() => setShowNoteComposer((prev) => !prev)}
              className={trainingSecondaryActionClass}
            >
              {showNoteComposer ? "Collapse" : noteDraftHasContent ? "Resume draft" : "Add note"}
            </button>
          </div>
          <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
            {showNoteComposer
              ? "Use this for a quick observation or a question you want to answer later."
              : noteComposerSummary}
          </p>
          {preferredWorkflowIntent === "note" ? (
            <p className="mt-2 text-sm font-medium text-[color:var(--fs-color-brand-700)]">
              This is the recommended next step for the selected goal. Use it for an observation or
              question without changing the goal itself.
            </p>
          ) : null}
          {noteDraft.goalId ? (
            <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
              This note is linked to:{" "}
              <span className="font-medium text-[color:var(--fs-color-ink-strong)]">
                {goalOptionById.get(noteDraft.goalId)?.title ?? "Selected goal"}
              </span>
            </p>
          ) : null}
          {showNoteComposer ? (
            <form
              id="training-note-form"
              onSubmit={createNote}
              data-testid="training-note-form"
              data-goal-intent-highlight={preferredWorkflowIntent === "note" ? "true" : "false"}
              className="mt-4"
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <label className={trainingLabelClass}>
                  Type
                  <select
                    value={noteDraft.noteType}
                    onChange={(e) =>
                      setNoteDraft((prev) => ({
                        ...prev,
                        noteType: e.target.value as NoteDraft["noteType"],
                      }))
                    }
                    className={trainingFieldClass}
                  >
                    <option value="observation">{getTrainingNoteTypeLabel("observation")}</option>
                    <option value="question">{getTrainingNoteTypeLabel("question")}</option>
                  </select>
                </label>

                <label className={trainingLabelClass}>
                  Optional linked goal
                  <select
                    data-testid="training-note-goal-select"
                    value={noteDraft.goalId}
                    onChange={(e) => setNoteDraft((prev) => ({ ...prev, goalId: e.target.value }))}
                    className={trainingFieldClass}
                  >
                    <option value="">No linked goal</option>
                    {snapshot.goalOptions.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title} ({goal.statusLabel})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={cx("mt-4", trainingLabelClass)}>
                {noteDraft.noteType === "question" ? "Question" : "Observation"}
                <textarea
                  value={noteDraft.body}
                  onChange={(e) => setNoteDraft((prev) => ({ ...prev, body: e.target.value }))}
                  rows={4}
                  placeholder={
                    noteDraft.noteType === "question"
                      ? "What do you want to check later?"
                      : "What did you notice in the pool?"
                  }
                  className={trainingFieldClass}
                />
              </label>

              <label className={cx("mt-4", trainingLabelClass)}>
                Optional linked focus
                <select
                  value={noteDraft.focusId}
                  onChange={(e) => setNoteDraft((prev) => ({ ...prev, focusId: e.target.value }))}
                  className={trainingFieldClass}
                >
                  <option value="">No linked focus</option>
                  {focusOptions.map((focus) => (
                    <option key={focus.id} value={focus.id}>
                      {focus.title}
                      {focus.isPrimary ? " (Primary)" : ""}
                      {` (${focus.statusLabel})`}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                disabled={!snapshot.schemaReady || pendingNoteCreate}
                className={cx("mt-4", trainingMobilePrimaryActionClass)}
              >
                {pendingNoteCreate ? "Saving..." : "Save note"}
              </button>
            </form>
          ) : null}
        </div>

        {snapshot.recentNotes.length === 0 ? (
          <TrainingContextFeedback
            tone="empty"
            testId="training-notes-empty-state"
            className="mt-5 p-6"
          >
            <p className="text-sm text-[color:var(--fs-color-muted)]">
              No notes yet. Start with the first observation or question that comes up in the pool.
            </p>
          </TrainingContextFeedback>
        ) : (
          <div className="mt-5 space-y-4">
            <div data-testid="training-note-filters" className={trainingNestedMutedCardClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                    Find a note faster
                  </h3>
                  <p className="mt-1 text-sm text-[color:var(--fs-color-muted)]">
                    Search by keyword or narrow the list by type, status, date, and sort order.
                  </p>
                </div>
                {hasActiveNoteFilters ? (
                  <button
                    type="button"
                    onClick={() => setNoteListFilters(DEFAULT_NOTE_LIST_FILTERS)}
                    className={trainingMobileSecondaryActionClass}
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <label className={cx("xl:col-span-2", trainingLabelClass)}>
                  Search notes
                  <input
                    type="search"
                    data-testid="training-note-search-input"
                    value={noteListFilters.search}
                    onChange={(e) =>
                      setNoteListFilters((prev) => ({ ...prev, search: e.target.value }))
                    }
                    placeholder="Search text, answers, goals, or focus"
                    className={trainingFieldClass}
                  />
                </label>

                <label className={trainingLabelClass}>
                  Type
                  <select
                    data-testid="training-note-type-filter"
                    value={noteListFilters.noteType}
                    onChange={(e) =>
                      setNoteListFilters((prev) => ({
                        ...prev,
                        noteType: e.target.value as NoteListFilters["noteType"],
                      }))
                    }
                    className={trainingFieldClass}
                  >
                    <option value="all">All types</option>
                    <option value="observation">Observations</option>
                    <option value="question">Questions</option>
                  </select>
                </label>

                <label className={trainingLabelClass}>
                  Status
                  <select
                    data-testid="training-note-status-filter"
                    value={noteListFilters.status}
                    onChange={(e) =>
                      setNoteListFilters((prev) => ({
                        ...prev,
                        status: e.target.value as NoteListFilters["status"],
                      }))
                    }
                    className={trainingFieldClass}
                  >
                    <option value="all">All statuses</option>
                    {availableNoteStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getTrainingNoteStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={trainingLabelClass}>
                  From date
                  <input
                    type="date"
                    data-testid="training-note-from-date-filter"
                    value={noteListFilters.fromDate}
                    onChange={(e) =>
                      setNoteListFilters((prev) => ({ ...prev, fromDate: e.target.value }))
                    }
                    className={trainingFieldClass}
                  />
                </label>

                <label className={trainingLabelClass}>
                  To date
                  <input
                    type="date"
                    data-testid="training-note-to-date-filter"
                    value={noteListFilters.toDate}
                    onChange={(e) =>
                      setNoteListFilters((prev) => ({ ...prev, toDate: e.target.value }))
                    }
                    className={trainingFieldClass}
                  />
                </label>

                <label className={trainingLabelClass}>
                  Sort
                  <select
                    data-testid="training-note-sort-filter"
                    value={noteListFilters.sort}
                    onChange={(e) =>
                      setNoteListFilters((prev) => ({
                        ...prev,
                        sort: e.target.value as NoteListSort,
                      }))
                    }
                    className={trainingFieldClass}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="recently_edited">Recently edited</option>
                  </select>
                </label>
              </div>

              <p className="mt-3 text-sm text-[color:var(--fs-color-muted)]">
                Showing {filteredRecentNotes.length} of {snapshot.recentNotes.length} notes.
              </p>
            </div>

            {filteredRecentNotes.length === 0 ? (
              <TrainingContextFeedback
                tone="empty"
                testId="training-notes-no-results-state"
                className="p-6"
              >
                <p className="text-sm text-[color:var(--fs-color-muted)]">
                  No notes match the current filters. Clear or widen them to bring notes back into
                  view.
                </p>
              </TrainingContextFeedback>
            ) : null}

            {filteredRecentNotes.map((note) => {
              const isEditing = editingNoteId === note.id && noteEditState !== null;
              const currentStatusLabel = isEditing
                ? getTrainingNoteStatusLabel(noteEditState.status)
                : note.statusLabel;

              return (
                <article
                  key={note.id}
                  data-testid={`training-note-card-${note.id}`}
                  className={trainingNestedCardClass}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={trainingBrandChipClass}>{note.noteTypeLabel}</span>
                    <span className={trainingChipClass}>{currentStatusLabel}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-[color:var(--fs-color-muted)]">
                    <span>Logged {formatTrainingNoteTimestamp(note.createdAt)}</span>
                    <span>Last edited {formatTrainingNoteTimestamp(note.updatedAt)}</span>
                  </div>

                  {isEditing ? (
                    <div className="mt-4 space-y-4">
                      <label className={trainingLabelClass}>
                        Text
                        <textarea
                          value={noteEditState.body}
                          onChange={(e) =>
                            setNoteEditState((prev) =>
                              prev ? { ...prev, body: e.target.value } : prev
                            )
                          }
                          rows={4}
                          className={trainingFieldClass}
                        />
                      </label>

                      <label className={trainingLabelClass}>
                        Status
                        <select
                          value={noteEditState.status}
                          onChange={(e) =>
                            setNoteEditState((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    status: e.target.value as TrainingNoteStatus,
                                    answer:
                                      e.target.value === "answered"
                                        ? prev.answer
                                        : note.noteType === "question" &&
                                            e.target.value !== "answered"
                                          ? ""
                                          : prev.answer,
                                  }
                                : prev
                            )
                          }
                          className={trainingFieldClass}
                        >
                          {getNoteStatusOptions(note.noteType).map((status) => (
                            <option key={status} value={status}>
                              {getTrainingNoteStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </label>

                      {note.noteType === "question" ? (
                        <label className={trainingLabelClass}>
                          Answer
                          <textarea
                            value={noteEditState.answer}
                            onChange={(e) =>
                              setNoteEditState((prev) =>
                                prev ? { ...prev, answer: e.target.value } : prev
                              )
                            }
                            rows={3}
                            placeholder="Write the answer when you have tested or reviewed it."
                            className={trainingFieldClass}
                          />
                        </label>
                      ) : null}

                      <div className={getMobileActionGroupClass(2, { desktopJustify: "start" })}>
                        <button
                          type="button"
                          onClick={() => void saveNote(note.id)}
                          disabled={pendingNoteSaveId === note.id}
                          className={trainingMobilePrimaryActionClass}
                        >
                          {pendingNoteSaveId === note.id ? "Saving..." : "Save note"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(null);
                            setNoteEditState(null);
                          }}
                          className={trainingMobileSecondaryActionClass}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-[color:var(--fs-color-ink)]">
                        {note.body}
                      </p>
                      {note.answer ? (
                        <div className={cx("mt-3", trainingNestedMutedCardClass)}>
                          <p className="text-xs font-semibold tracking-wide text-[color:var(--fs-color-brand-700)] uppercase">
                            Answer
                          </p>
                          <p className="mt-2 text-sm whitespace-pre-wrap text-[color:var(--fs-color-ink)]">
                            {note.answer}
                          </p>
                        </div>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-[color:var(--fs-color-muted)]">
                        {note.goalTitle ? <span>Goal: {note.goalTitle}</span> : null}
                        {note.focusTitle ? <span>Focus: {note.focusTitle}</span> : null}
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => openNoteEditor(note)}
                          className={trainingSecondaryActionClass}
                        >
                          Edit note
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
