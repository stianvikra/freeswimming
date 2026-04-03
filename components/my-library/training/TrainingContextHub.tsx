"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  const [noteListFilters, setNoteListFilters] = useState<NoteListFilters>(DEFAULT_NOTE_LIST_FILTERS);

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
  const overviewGoal =
    selectedGoal ??
    (focusEditState?.goalId ? (goalOptionById.get(focusEditState.goalId) ?? null) : null) ??
    (focusDraft.goalId ? (goalOptionById.get(focusDraft.goalId) ?? null) : null) ??
    (noteDraft.goalId ? (goalOptionById.get(noteDraft.goalId) ?? null) : null) ??
    (selectedFocus?.goalId ? (goalOptionById.get(selectedFocus.goalId) ?? null) : null) ??
    (snapshot.recentNotes[0]?.goalId
      ? (goalOptionById.get(snapshot.recentNotes[0].goalId) ?? null)
      : null);
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
        className={`rounded-2xl border p-4 ${
          options?.featured
            ? "border-white/90 bg-white/90 shadow-[0_10px_30px_rgba(16,24,40,0.06)]"
            : "border-slate-200 bg-slate-50/50"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold text-slate-900">
            {isEditing ? focusEditState.title || focus.title : focus.title}
          </h4>
          <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            {focus.statusLabel}
          </span>
          {focus.isPrimary ? (
            <span className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
              Primary
            </span>
          ) : null}
        </div>

        {isEditing ? (
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Focus title</span>
              <input
                value={focusEditState.title}
                onChange={(e) =>
                  setFocusEditState((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Optional detail</span>
              <textarea
                value={focusEditState.details}
                onChange={(e) =>
                  setFocusEditState((prev) => (prev ? { ...prev, details: e.target.value } : prev))
                }
                rows={3}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Optional linked goal</span>
              <select
                data-testid={`training-focus-edit-goal-select-${focus.id}`}
                value={focusEditState.goalId}
                onChange={(e) =>
                  setFocusEditState((prev) => (prev ? { ...prev, goalId: e.target.value } : prev))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
              >
                <option value="">No linked goal</option>
                {snapshot.goalOptions.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title} ({goal.statusLabel})
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void saveFocus(focus.id)}
                disabled={isSavePending}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavePending ? "Saving..." : "Save focus"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingFocusId(null);
                  setFocusEditState(null);
                }}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              {focus.isPrimary ? (
                <button
                  type="button"
                  data-testid={`training-focus-clear-primary-${focus.id}`}
                  onClick={() => void updateFocusStatus(focus.id, "clear_primary")}
                  disabled={isStatusPending}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isStatusPending ? "Saving..." : "Remove primary"}
                </button>
              ) : (
                <button
                  type="button"
                  data-testid={`training-focus-set-primary-${focus.id}`}
                  onClick={() => void updateFocusStatus(focus.id, "set_primary")}
                  disabled={isStatusPending}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isStatusPending ? "Saving..." : "Set primary"}
                </button>
              )}
              <button
                type="button"
                data-testid={`training-focus-complete-${focus.id}`}
                onClick={() => void updateFocusStatus(focus.id, "complete")}
                disabled={isStatusPending}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStatusPending ? "Saving..." : "Mark completed"}
              </button>
              <button
                type="button"
                data-testid={`training-focus-archive-${focus.id}`}
                onClick={() => void updateFocusStatus(focus.id, "archive")}
                disabled={isStatusPending}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Archive
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-700">
              {focus.details ?? "No extra detail saved for this focus yet."}
            </p>
            {focus.goalTitle ? (
              <p className="mt-2 text-xs text-slate-600">Goal: {focus.goalTitle}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openFocusEditor(focus)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isStatusPending ? "Saving..." : "Remove primary"}
                  </button>
                  <button
                    type="button"
                    data-testid={`training-focus-complete-${focus.id}`}
                    onClick={() => void updateFocusStatus(focus.id, "complete")}
                    disabled={isStatusPending}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isStatusPending ? "Saving..." : "Mark completed"}
                  </button>
                  <button
                    type="button"
                    data-testid={`training-focus-archive-${focus.id}`}
                    onClick={() => void updateFocusStatus(focus.id, "archive")}
                    disabled={isStatusPending}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isStatusPending ? "Saving..." : "Set primary"}
                </button>
              )}
            </div>
            {!focus.isPrimary ? (
              <p className="mt-3 text-xs text-slate-500">
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
        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Focus & Notes are syncing</h2>
          <p className="mt-2 text-sm text-slate-700">
            The new training-context tables are not ready in this environment yet. Refresh after the
            migration has finished.
          </p>
          <button
            type="button"
            onClick={() => void refreshSnapshot()}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-amber-50"
          >
            {isRefreshing ? "Refreshing..." : "Retry"}
          </button>
        </section>
      ) : null}

      {isOnline ? null : (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800">
          You are offline. Existing Focus and Notes stay visible, but save/update actions are paused
          until you reconnect.
        </section>
      )}

      {snapshot.loadError ? (
        <section className="rounded-2xl border border-red-200 bg-red-50/80 p-4">
          <p className="text-sm font-medium text-red-700">{snapshot.loadError}</p>
          <button
            type="button"
            onClick={() => void refreshSnapshot()}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-red-50"
          >
            {isRefreshing ? "Refreshing..." : "Retry"}
          </button>
        </section>
      ) : null}

      {contextMessage ? (
        <section className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4">
          <p className="text-sm font-medium text-blue-800">{contextMessage}</p>
        </section>
      ) : null}

      {actionError ? (
        <section className="rounded-2xl border border-red-200 bg-red-50/80 p-4">
          <p className="text-sm font-medium text-red-700">{actionError}</p>
        </section>
      ) : null}

      {actionSuccess ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-sm font-medium text-emerald-700">{actionSuccess}</p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <h2 className="text-base font-semibold text-slate-900">Today at a glance</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <a
            href="#training-goals-section"
            data-testid="training-overview-card-goals"
            className="rounded-2xl border border-white/80 bg-white/85 p-4 transition hover:border-blue-200 hover:bg-white"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Goals</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {overviewGoal ? overviewGoal.title : "No goal selected yet"}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {overviewGoal
                ? `Current goal context${overviewGoal.statusLabel ? ` • ${overviewGoal.statusLabel}` : ""}`
                : "Choose a goal below when you want a little longer-term context."}
            </p>
          </a>
          <a
            href="#training-focus-section"
            data-testid="training-overview-card-focus"
            className="rounded-2xl border border-white/80 bg-white/85 p-4 transition hover:border-emerald-200 hover:bg-white"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Focus</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {snapshot.focusNeedsPrimarySelection
                ? "Choose a primary focus"
                : (overviewFocusTitle ?? "No open focus yet")}
            </p>
            <p className="mt-2 text-sm text-slate-700">
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
            className="rounded-2xl border border-white/80 bg-white/85 p-4 transition hover:border-amber-200 hover:bg-white"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Notes</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {snapshot.recentNotes.length > 0 ? "Latest note" : "No notes yet"}
            </p>
            <p className="mt-2 text-sm text-slate-700">
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
        className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Start from a goal</h2>
            <p className="mt-2 text-sm text-slate-600">
              Goals stay long-term. Use one here when you want the next focus or note to start with
              the right context.
            </p>
          </div>
          {selectedGoal ? (
            <button
              type="button"
              onClick={clearGoalContext}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Clear selection
            </button>
          ) : null}
        </div>

        {selectedGoal ? (
          <div
            className="mt-4 rounded-2xl border border-blue-200 bg-white/90 p-4"
            data-testid="training-context-selected-goal"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Selected goal
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">{selectedGoal.title}</h3>
              <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {selectedGoal.statusLabel}
              </span>
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
                  className={`rounded-2xl border p-4 ${
                    isSelected
                      ? "border-blue-300 bg-white shadow-[0_8px_24px_rgba(37,99,235,0.08)]"
                      : "border-white/80 bg-white/85"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{goal.title}</h3>
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {goal.statusLabel}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid={`training-goal-context-use-focus-${goal.id}`}
                      onClick={() => applyGoalContext(goal.id, "focus")}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                      Use for focus
                    </button>
                    <button
                      type="button"
                      data-testid={`training-goal-context-use-note-${goal.id}`}
                      onClick={() => applyGoalContext(goal.id, "note")}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Use for note
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-white/90 p-5">
            <p className="text-sm text-slate-700">
              No active goals are available here yet. Create one in Goals first, then come back to
              connect it to a focus or note.
            </p>
            <Link
              href="/my-library/goals"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Open Goals
            </Link>
          </div>
        )}
      </section>

      <section
        id="training-focus-section"
        data-testid="training-focus-section"
        className="rounded-2xl border border-slate-200 bg-white p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Focus</h2>
            <p className="mt-2 text-sm text-slate-600">
              Keep the main cue clear and keep supporting focuses close by when you still need them.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshSnapshot()}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-4">
            {snapshot.focusNeedsPrimarySelection ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">Choose a primary focus</h3>
                  <span className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                    Action needed
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  You have {snapshot.openFocuses.length} open focuses and no primary focus selected
                  yet. Pick one below before other My Library surfaces try to use a single current
                  cue.
                </p>
              </div>
            ) : primaryOpenFocus ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">Primary focus</h3>
                  <span className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                    Used across My Library
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  Keep one clear cue here when other My Library surfaces need a single current
                  focus.
                </p>
              </div>
            ) : selectedFocus ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">
                    {primaryFocus ? "Primary focus" : "Current focus cue"}
                  </h3>
                  <span className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                    {selectedFocus.title}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-700">
                  {selectedFocus.details ??
                    "This is the clearest current cue available across your open focus list."}
                </p>
                {selectedFocus.goalTitle ? (
                  <p className="mt-3 text-xs font-medium text-slate-600">
                    Linked goal: {selectedFocus.goalTitle}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
                <h3 className="text-base font-semibold text-slate-900">No open focus yet</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Add the next technical or tactical cue you want to carry into the pool.
                </p>
              </div>
            )}

            {snapshot.focusHistory.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowFocusHistory((prev) => !prev)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {showFocusHistory ? "Hide completed & archived" : "Show completed & archived"}
              </button>
            ) : null}
          </div>

          <div
            className={`rounded-2xl border p-5 transition ${
              preferredWorkflowIntent === "focus"
                ? "border-blue-300 bg-blue-50/60 shadow-[0_12px_36px_rgba(37,99,235,0.08)]"
                : "border-slate-200 bg-slate-50/60"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">Add focus</h3>
                {preferredWorkflowIntent === "focus" ? (
                  <span
                    data-testid="training-focus-intent-badge"
                    className="inline-flex rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700"
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
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {showFocusComposer
                  ? "Collapse"
                  : focusDraftHasContent
                    ? "Resume draft"
                    : "Add focus"}
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {showFocusComposer
                ? "Saving a new focus will never auto-complete or auto-archive the ones you already have."
                : focusComposerSummary}
            </p>
            {preferredWorkflowIntent === "focus" ? (
              <p className="mt-2 text-sm font-medium text-blue-700">
                This is the recommended next step for the selected goal. The note form stays
                available below if you want to capture an observation or question too.
              </p>
            ) : null}
            {focusDraft.goalId ? (
              <p className="mt-2 text-sm text-slate-600">
                This focus will support:{" "}
                <span className="font-medium text-slate-900">
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
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Focus title</span>
                  <input
                    value={focusDraft.title}
                    onChange={(e) => setFocusDraft((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Exhale calmly before turning to breathe"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Optional detail</span>
                  <textarea
                    value={focusDraft.details}
                    onChange={(e) =>
                      setFocusDraft((prev) => ({ ...prev, details: e.target.value }))
                    }
                    rows={3}
                    placeholder="What do you want to watch for in the next session?"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Optional linked goal</span>
                  <select
                    data-testid="training-focus-goal-select"
                    value={focusDraft.goalId}
                    onChange={(e) => setFocusDraft((prev) => ({ ...prev, goalId: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
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
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
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
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Primary focus
              </h3>
              <div className="mt-3">{renderFocusCard(primaryOpenFocus, { featured: true })}</div>
            </div>

            {nonPrimaryOpenFocuses.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
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
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Open focus list
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {snapshot.openFocuses.map((focus) => renderFocusCard(focus))}
            </div>
          </div>
        ) : null}

        {showFocusHistory && snapshot.focusHistory.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Completed & archived
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {snapshot.focusHistory.map((focus) => (
                <article
                  key={focus.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{focus.title}</h4>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {focus.statusLabel}
                    </span>
                  </div>
                  {focus.goalTitle ? (
                    <p className="mt-2 text-xs text-slate-600">Goal: {focus.goalTitle}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid={`training-focus-reopen-${focus.id}`}
                      onClick={() => void updateFocusStatus(focus.id, "reopen")}
                      disabled={pendingFocusActionId === focus.id}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
        className="rounded-2xl border border-slate-200 bg-white p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
            <p className="mt-2 text-sm text-slate-600">
              Keep short observations and questions close to the training moment, then answer or
              close them later.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">{snapshot.unresolvedObservationCount}</p>
              <p className="text-xs text-slate-600">Open observations</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">{snapshot.unansweredQuestionCount}</p>
              <p className="text-xs text-slate-600">Unanswered questions</p>
            </div>
          </div>
        </div>

        <div
          className={`mt-5 rounded-2xl border p-5 transition ${
            preferredWorkflowIntent === "note"
              ? "border-blue-300 bg-blue-50/60 shadow-[0_12px_36px_rgba(37,99,235,0.08)]"
              : "border-slate-200 bg-slate-50/60"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">Add note</h3>
              {preferredWorkflowIntent === "note" ? (
                <span
                  data-testid="training-note-intent-badge"
                  className="inline-flex rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700"
                >
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
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {showNoteComposer ? "Collapse" : noteDraftHasContent ? "Resume draft" : "Add note"}
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {showNoteComposer
              ? "Use this for a quick observation or a question you want to answer later."
              : noteComposerSummary}
          </p>
          {preferredWorkflowIntent === "note" ? (
            <p className="mt-2 text-sm font-medium text-blue-700">
              This is the recommended next step for the selected goal. Use it for an observation or
              question without changing the goal itself.
            </p>
          ) : null}
          {noteDraft.goalId ? (
            <p className="mt-2 text-sm text-slate-600">
              This note is linked to:{" "}
              <span className="font-medium text-slate-900">
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
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Type</span>
                  <select
                    value={noteDraft.noteType}
                    onChange={(e) =>
                      setNoteDraft((prev) => ({
                        ...prev,
                        noteType: e.target.value as NoteDraft["noteType"],
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  >
                    <option value="observation">{getTrainingNoteTypeLabel("observation")}</option>
                    <option value="question">{getTrainingNoteTypeLabel("question")}</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Optional linked goal</span>
                  <select
                    data-testid="training-note-goal-select"
                    value={noteDraft.goalId}
                    onChange={(e) => setNoteDraft((prev) => ({ ...prev, goalId: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
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

              <label className="mt-4 block">
                <span className="text-sm font-medium text-slate-700">
                  {noteDraft.noteType === "question" ? "Question" : "Observation"}
                </span>
                <textarea
                  value={noteDraft.body}
                  onChange={(e) => setNoteDraft((prev) => ({ ...prev, body: e.target.value }))}
                  rows={4}
                  placeholder={
                    noteDraft.noteType === "question"
                      ? "What do you want to check later?"
                      : "What did you notice in the pool?"
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                />
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-medium text-slate-700">Optional linked focus</span>
                <select
                  value={noteDraft.focusId}
                  onChange={(e) => setNoteDraft((prev) => ({ ...prev, focusId: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
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
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingNoteCreate ? "Saving..." : "Save note"}
              </button>
            </form>
          ) : null}
        </div>

        {snapshot.recentNotes.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6">
            <p className="text-sm text-slate-600">
              No notes yet. Start with the first observation or question that comes up in the pool.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div
              data-testid="training-note-filters"
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Find a note faster</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Search by keyword or narrow the list by type, status, date, and sort order.
                  </p>
                </div>
                {hasActiveNoteFilters ? (
                  <button
                    type="button"
                    onClick={() => setNoteListFilters(DEFAULT_NOTE_LIST_FILTERS)}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <label className="block xl:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Search notes</span>
                  <input
                    type="search"
                    data-testid="training-note-search-input"
                    value={noteListFilters.search}
                    onChange={(e) =>
                      setNoteListFilters((prev) => ({ ...prev, search: e.target.value }))
                    }
                    placeholder="Search text, answers, goals, or focus"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Type</span>
                  <select
                    data-testid="training-note-type-filter"
                    value={noteListFilters.noteType}
                    onChange={(e) =>
                      setNoteListFilters((prev) => ({
                        ...prev,
                        noteType: e.target.value as NoteListFilters["noteType"],
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  >
                    <option value="all">All types</option>
                    <option value="observation">Observations</option>
                    <option value="question">Questions</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Status</span>
                  <select
                    data-testid="training-note-status-filter"
                    value={noteListFilters.status}
                    onChange={(e) =>
                      setNoteListFilters((prev) => ({
                        ...prev,
                        status: e.target.value as NoteListFilters["status"],
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  >
                    <option value="all">All statuses</option>
                    {availableNoteStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getTrainingNoteStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">From date</span>
                  <input
                    type="date"
                    data-testid="training-note-from-date-filter"
                    value={noteListFilters.fromDate}
                    onChange={(e) =>
                      setNoteListFilters((prev) => ({ ...prev, fromDate: e.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">To date</span>
                  <input
                    type="date"
                    data-testid="training-note-to-date-filter"
                    value={noteListFilters.toDate}
                    onChange={(e) =>
                      setNoteListFilters((prev) => ({ ...prev, toDate: e.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Sort</span>
                  <select
                    data-testid="training-note-sort-filter"
                    value={noteListFilters.sort}
                    onChange={(e) =>
                      setNoteListFilters((prev) => ({
                        ...prev,
                        sort: e.target.value as NoteListSort,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="recently_edited">Recently edited</option>
                  </select>
                </label>
              </div>

              <p className="mt-3 text-sm text-slate-600">
                Showing {filteredRecentNotes.length} of {snapshot.recentNotes.length} notes.
              </p>
            </div>

            {filteredRecentNotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6">
                <p className="text-sm text-slate-600">
                  No notes match the current filters. Clear or widen them to bring notes back into
                  view.
                </p>
              </div>
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
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                      {note.noteTypeLabel}
                    </span>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {currentStatusLabel}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>Logged {formatTrainingNoteTimestamp(note.createdAt)}</span>
                    <span>Last edited {formatTrainingNoteTimestamp(note.updatedAt)}</span>
                  </div>

                  {isEditing ? (
                    <div className="mt-4 space-y-4">
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Text</span>
                        <textarea
                          value={noteEditState.body}
                          onChange={(e) =>
                            setNoteEditState((prev) =>
                              prev ? { ...prev, body: e.target.value } : prev
                            )
                          }
                          rows={4}
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Status</span>
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
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                        >
                          {getNoteStatusOptions(note.noteType).map((status) => (
                            <option key={status} value={status}>
                              {getTrainingNoteStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </label>

                      {note.noteType === "question" ? (
                        <label className="block">
                          <span className="text-sm font-medium text-slate-700">Answer</span>
                          <textarea
                            value={noteEditState.answer}
                            onChange={(e) =>
                              setNoteEditState((prev) =>
                                prev ? { ...prev, answer: e.target.value } : prev
                              )
                            }
                            rows={3}
                            placeholder="Write the answer when you have tested or reviewed it."
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                          />
                        </label>
                      ) : null}

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void saveNote(note.id)}
                          disabled={pendingNoteSaveId === note.id}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {pendingNoteSaveId === note.id ? "Saving..." : "Save note"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(null);
                            setNoteEditState(null);
                          }}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                        {note.body}
                      </p>
                      {note.answer ? (
                        <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                            Answer
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                            {note.answer}
                          </p>
                        </div>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                        {note.goalTitle ? <span>Goal: {note.goalTitle}</span> : null}
                        {note.focusTitle ? <span>Focus: {note.focusTitle}</span> : null}
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => openNoteEditor(note)}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
