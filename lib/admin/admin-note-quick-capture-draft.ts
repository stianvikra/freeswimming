import type { AdminNoteContextType } from "@/lib/admin/note-context";
import { revokeAdminNoteStagedImages, type AdminNoteStagedImage } from "@/lib/admin/note-compose";
import type { AdminNotePriority } from "@/lib/admin/notes";

const QUICK_CAPTURE_STORAGE_KEY = "fs-admin-note-quick-capture-draft-v1";

export type QuickCaptureFormState = {
  title: string;
  category: string;
  noteDate: string;
  priority: AdminNotePriority;
  body: string;
  isDone: boolean;
};

export type QuickCaptureSavedNotice = {
  id: string;
  title: string;
};

export type QuickCapturePendingImage = AdminNoteStagedImage;

export type QuickCaptureLockedContext = {
  contextType: AdminNoteContextType;
  contextRef: string;
  contextLabel: string;
};

export type QuickCapturePanelState = "open" | "collapsed";

export type QuickCaptureDraftSnapshot = {
  version: 1;
  panelState: QuickCapturePanelState;
  context: QuickCaptureLockedContext;
  formState: QuickCaptureFormState;
  createdCaptureRecovery: QuickCaptureSavedNotice | null;
  updatedAt: number;
};

export type QuickCaptureDraftStore = {
  snapshot: QuickCaptureDraftSnapshot;
  pendingImages: QuickCapturePendingImage[];
};

let memoryDraftStore: QuickCaptureDraftStore | null = null;
let memoryDraftOwnerId: string | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function writeSnapshotToSessionStorage(snapshot: QuickCaptureDraftSnapshot | null) {
  if (!isBrowser()) return;

  try {
    if (!snapshot) {
      window.sessionStorage.removeItem(QUICK_CAPTURE_STORAGE_KEY);
      return;
    }

    window.sessionStorage.setItem(QUICK_CAPTURE_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // storage is a best-effort fallback only
  }
}

function parseStoredSnapshot(raw: string | null): QuickCaptureDraftSnapshot | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as QuickCaptureDraftSnapshot;
    if (
      parsed &&
      parsed.version === 1 &&
      (parsed.panelState === "open" || parsed.panelState === "collapsed") &&
      typeof parsed.context?.contextRef === "string" &&
      typeof parsed.context?.contextLabel === "string" &&
      typeof parsed.context?.contextType === "string" &&
      typeof parsed.formState?.title === "string" &&
      typeof parsed.formState?.category === "string" &&
      typeof parsed.formState?.noteDate === "string" &&
      typeof parsed.formState?.priority === "string" &&
      typeof parsed.formState?.body === "string" &&
      typeof parsed.formState?.isDone === "boolean"
    ) {
      return parsed;
    }
  } catch {
    // ignore malformed storage
  }

  return null;
}

export function createQuickCaptureInitialFormState(today: string): QuickCaptureFormState {
  return {
    title: "",
    category: "General",
    noteDate: today,
    priority: "normal",
    body: "",
    isDone: false,
  };
}

export function isQuickCaptureDraftDirty(formState: QuickCaptureFormState, today: string): boolean {
  return (
    formState.title.trim().length > 0 ||
    formState.category.trim() !== "General" ||
    formState.noteDate !== today ||
    formState.priority !== "normal" ||
    formState.body.trim().length > 0 ||
    formState.isDone
  );
}

export function readQuickCaptureDraftStore(): QuickCaptureDraftStore | null {
  if (memoryDraftStore) {
    return memoryDraftStore;
  }

  if (!isBrowser()) {
    return null;
  }

  const snapshot = parseStoredSnapshot(window.sessionStorage.getItem(QUICK_CAPTURE_STORAGE_KEY));
  if (!snapshot) {
    return null;
  }

  memoryDraftStore = {
    snapshot,
    pendingImages: [],
  };
  return memoryDraftStore;
}

export function writeQuickCaptureDraftStore(store: QuickCaptureDraftStore | null) {
  const nextPreviewUrls = new Set((store?.pendingImages ?? []).map((image) => image.previewUrl));
  const removedImages = (memoryDraftStore?.pendingImages ?? []).filter(
    (image) => !nextPreviewUrls.has(image.previewUrl)
  );

  if (removedImages.length > 0 && isBrowser()) {
    revokeAdminNoteStagedImages(removedImages);
  }

  memoryDraftStore = store;
  writeSnapshotToSessionStorage(store?.snapshot ?? null);
}

export function clearQuickCaptureDraftStore() {
  writeQuickCaptureDraftStore(null);
  memoryDraftOwnerId = null;
}

export function claimQuickCaptureDraftOwner(ownerId: string) {
  memoryDraftOwnerId = ownerId;
}

export function releaseQuickCaptureDraftOwner(ownerId: string) {
  if (memoryDraftOwnerId === ownerId) {
    memoryDraftOwnerId = null;
  }
}

export function getQuickCaptureDraftOwnerId(): string | null {
  return memoryDraftOwnerId;
}
