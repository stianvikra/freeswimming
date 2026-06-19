import type { AdminRole } from "@/lib/admin/access";
import type { Database } from "@/types/database";
import {
  canonicalizeAdminNoteContext,
  parseAdminNoteContextInput,
  type AdminNoteContext,
} from "@/lib/admin/note-context";

export const INCIDENT_NOTE_SEVERITIES = ["P0", "P1", "P2"] as const;
export type IncidentNoteSeverity = (typeof INCIDENT_NOTE_SEVERITIES)[number];
export const ADMIN_NOTE_PRIORITY_VALUES = ["low", "normal", "high", "urgent"] as const;
export type AdminNotePriority = (typeof ADMIN_NOTE_PRIORITY_VALUES)[number];
export const ADMIN_NOTE_ATTACHMENT_BUCKET = "admin-note-attachments";
export const ADMIN_NOTE_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
export const ADMIN_NOTE_ATTACHMENT_MAX_FILES = 6;
export const ADMIN_NOTE_ALLOWED_ATTACHMENT_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;
export type AdminNoteAttachmentMimeType = (typeof ADMIN_NOTE_ALLOWED_ATTACHMENT_MIME_TYPES)[number];

export type AdminNoteRow = Omit<Database["public"]["Tables"]["admin_notes"]["Row"], "priority"> & {
  priority: AdminNotePriority;
};
export type AdminNoteAttachmentRow = Database["public"]["Tables"]["admin_note_attachments"]["Row"];
export type AdminNoteLinkRow = Database["public"]["Tables"]["admin_note_links"]["Row"];

export type AdminNoteAttachment = Omit<AdminNoteAttachmentRow, "storage_path"> & {
  signed_url: string | null;
};

export type AdminNoteLinkedSummary = Pick<
  AdminNoteRow,
  "id" | "title" | "category" | "note_date" | "is_done" | "priority"
>;

export type AdminNoteItem = AdminNoteRow & {
  attachments: AdminNoteAttachment[];
  related_notes: AdminNoteLinkedSummary[];
};

export type AdminNotesSummaryResponse =
  | {
      ok: true;
      role: AdminRole;
      schemaReady: boolean;
      warning: string | null;
      openCount: number;
    }
  | {
      ok: false;
      error: string;
    };

export const ADMIN_INCIDENT_NOTE_CATEGORY_BY_SEVERITY: Record<IncidentNoteSeverity, string> = {
  P0: "Incident P0",
  P1: "Incident P1",
  P2: "Incident P2",
};

export const ADMIN_INCIDENT_NOTE_CATEGORY_OPTIONS = [
  ...INCIDENT_NOTE_SEVERITIES.map((severity) => ADMIN_INCIDENT_NOTE_CATEGORY_BY_SEVERITY[severity]),
  "Incident Follow-up",
] as const;

export type CreateAdminNotePayload = {
  title?: unknown;
  body?: unknown;
  category?: unknown;
  noteDate?: unknown;
  priority?: unknown;
  isDone?: unknown;
  contextType?: unknown;
  contextRef?: unknown;
};

export type UpdateAdminNotePayload = {
  title?: unknown;
  body?: unknown;
  category?: unknown;
  noteDate?: unknown;
  priority?: unknown;
  isDone?: unknown;
  contextType?: unknown;
  contextRef?: unknown;
};

type CreateAdminNoteNormalized = {
  title: string;
  body: string;
  category: string;
  noteDate: string;
  priority: AdminNotePriority;
  isDone: boolean;
  contextType: AdminNoteContext["contextType"] | null;
  contextRef: string | null;
};

type UpdateAdminNoteNormalized = {
  title?: string;
  body?: string;
  category?: string;
  noteDate?: string;
  priority?: AdminNotePriority;
  isDone?: boolean;
  contextType?: AdminNoteContext["contextType"] | null;
  contextRef?: string | null;
};

type ParseResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    };

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ADMIN_NOTES_OPEN_BADGE_MAX = 9;

export function sortAdminNotesByNewest(
  a: Pick<AdminNoteRow, "note_date" | "created_at">,
  b: Pick<AdminNoteRow, "note_date" | "created_at">
): number {
  if (a.note_date !== b.note_date) {
    return b.note_date.localeCompare(a.note_date);
  }
  return b.created_at.localeCompare(a.created_at);
}

export function sortAdminNotesByPriorityAndNewest(
  a: Pick<AdminNoteRow, "priority" | "note_date" | "created_at">,
  b: Pick<AdminNoteRow, "priority" | "note_date" | "created_at">
): number {
  if (a.priority !== b.priority) {
    return compareAdminNotePriority(a.priority, b.priority);
  }

  return sortAdminNotesByNewest(a, b);
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCategory(raw: string): string {
  const collapsed = raw.replace(/\s+/g, " ").trim();
  return collapsed.length > 0 ? collapsed : "General";
}

export function normalizeAdminNotePriority(value: unknown): AdminNotePriority | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return ADMIN_NOTE_PRIORITY_VALUES.includes(normalized as AdminNotePriority)
    ? (normalized as AdminNotePriority)
    : null;
}

export function isAdminNotePriority(value: string | null | undefined): value is AdminNotePriority {
  return Boolean(value && ADMIN_NOTE_PRIORITY_VALUES.includes(value as AdminNotePriority));
}

export function compareAdminNotePriority(
  left: AdminNotePriority,
  right: AdminNotePriority
): number {
  const rank = {
    urgent: 4,
    high: 3,
    normal: 2,
    low: 1,
  } satisfies Record<AdminNotePriority, number>;

  return rank[right] - rank[left];
}

export function buildAdminNoteAttachmentOrdinalLabel(index: number, total: number): string {
  const safeIndex = Math.max(0, index) + 1;
  const safeTotal = Math.max(1, total);
  return safeTotal > 1 ? `Image ${safeIndex} of ${safeTotal}` : `Image ${safeIndex}`;
}

export function formatAdminNoteAttachmentSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  const sizeKb = sizeBytes / 1024;
  if (sizeKb < 1024) return `${sizeKb.toFixed(1)} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
}

export function formatAdminNoteAttachmentMimeLabel(mimeType: string): string {
  const normalized = mimeType.trim().toLowerCase();
  switch (normalized) {
    case "image/png":
      return "PNG";
    case "image/jpeg":
      return "JPEG";
    case "image/webp":
      return "WEBP";
    case "image/gif":
      return "GIF";
    default: {
      const subtype = normalized.split("/")[1] ?? normalized;
      return subtype.toUpperCase() || "IMAGE";
    }
  }
}

export function formatAdminNoteAttachmentDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }
  return date.toISOString().slice(0, 10);
}

export function buildAdminNoteAttachmentEvidenceSummary(params: {
  mimeType: string;
  sizeBytes: number;
  createdAt?: string | null;
  locationLabel?: string | null;
}): string {
  const parts = [
    formatAdminNoteAttachmentMimeLabel(params.mimeType),
    formatAdminNoteAttachmentSize(params.sizeBytes),
  ];

  if (params.createdAt) {
    parts.push(`Uploaded ${formatAdminNoteAttachmentDate(params.createdAt)}`);
  }

  if (params.locationLabel) {
    parts.push(params.locationLabel);
  }

  return parts.join(" · ");
}

export function formatAdminNotesOpenBadgeCount(count: number): string | null {
  if (!Number.isFinite(count) || count <= 0) return null;
  const wholeCount = Math.floor(count);
  return wholeCount > ADMIN_NOTES_OPEN_BADGE_MAX
    ? `${ADMIN_NOTES_OPEN_BADGE_MAX}+`
    : String(wholeCount);
}

export function buildAdminNotesTabAriaLabel(count: number | null): string {
  if (!count || !Number.isFinite(count) || count <= 0) return "Notes";
  const wholeCount = Math.floor(count);
  if (wholeCount > ADMIN_NOTES_OPEN_BADGE_MAX) {
    return `Notes, ${ADMIN_NOTES_OPEN_BADGE_MAX} or more open notes`;
  }
  return wholeCount === 1 ? "Notes, 1 open note" : `Notes, ${wholeCount} open notes`;
}

export function buildAdminNotesQuickAccessAriaLabel(count: number | null): string {
  const tabLabel = buildAdminNotesTabAriaLabel(count);
  return tabLabel === "Notes" ? "Open Notes" : `Open ${tabLabel}`;
}

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function normalizeDateInput(raw: unknown): string | null {
  const value = normalizeString(raw);
  if (!value) return null;
  if (!ISO_DATE_REGEX.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return value;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildIncidentNoteBodyTemplate(severity: IncidentNoteSeverity): string {
  return [
    `Severity: ${severity}`,
    "Surface: / | /course | /my-library | /admin",
    "User impact:",
    "First seen (UTC):",
    "Owner:",
    "Mitigation status: investigating | contained | resolved",
    "Evidence:",
    "Next update (UTC):",
  ].join("\n");
}

export function buildAdminNoteLinkedSummary(
  note: Pick<AdminNoteRow, "id" | "title" | "category" | "note_date" | "is_done" | "priority">
): AdminNoteLinkedSummary {
  return {
    id: note.id,
    title: note.title,
    category: note.category,
    note_date: note.note_date,
    is_done: note.is_done,
    priority: note.priority,
  };
}

export function canonicalizeAdminNoteLinkPair(
  noteId: string,
  relatedNoteId: string
): ParseResult<{ noteId: string; relatedNoteId: string }> {
  const left = noteId.trim().toLowerCase();
  const right = relatedNoteId.trim().toLowerCase();

  if (!isUuid(left) || !isUuid(right)) {
    return { ok: false, error: "Note links require valid note IDs." };
  }

  if (left === right) {
    return { ok: false, error: "A note cannot be linked to itself." };
  }

  return left < right
    ? { ok: true, value: { noteId: left, relatedNoteId: right } }
    : { ok: true, value: { noteId: right, relatedNoteId: left } };
}

function sanitizeAttachmentFileName(fileName: string): string {
  const baseName = fileName
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return baseName || "attachment";
}

export function validateAdminNoteAttachment(params: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}): ParseResult<{
  fileName: string;
  mimeType: AdminNoteAttachmentMimeType;
  sizeBytes: number;
}> {
  const fileName = sanitizeAttachmentFileName(params.fileName);
  const mimeType = params.mimeType.trim().toLowerCase();
  const sizeBytes = Number.isFinite(params.sizeBytes) ? Math.trunc(params.sizeBytes) : 0;

  if (!ADMIN_NOTE_ALLOWED_ATTACHMENT_MIME_TYPES.includes(mimeType as AdminNoteAttachmentMimeType)) {
    return { ok: false, error: "Only PNG, JPEG, WEBP, and GIF images are allowed." };
  }

  if (sizeBytes <= 0) {
    return { ok: false, error: "Attachment file is empty." };
  }

  if (sizeBytes > ADMIN_NOTE_ATTACHMENT_MAX_BYTES) {
    return {
      ok: false,
      error: `Attachments must be ${Math.round(ADMIN_NOTE_ATTACHMENT_MAX_BYTES / (1024 * 1024))} MB or smaller.`,
    };
  }

  return {
    ok: true,
    value: {
      fileName,
      mimeType: mimeType as AdminNoteAttachmentMimeType,
      sizeBytes,
    },
  };
}

export function buildAdminNoteAttachmentStoragePath(params: {
  noteId: string;
  attachmentId: string;
  fileName: string;
}): string {
  const safeFileName = sanitizeAttachmentFileName(params.fileName);
  return `notes/${params.noteId}/${params.attachmentId}-${safeFileName}`;
}

function hasOwn(payload: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, key);
}

export function parseCreateAdminNotePayload(
  payload: CreateAdminNotePayload
): ParseResult<CreateAdminNoteNormalized> {
  const title = normalizeString(payload.title);
  if (title.length < 2 || title.length > 140) {
    return { ok: false, error: "Title must be between 2 and 140 characters." };
  }

  const body = normalizeString(payload.body);
  if (body.length > 4000) {
    return { ok: false, error: "Note text must be 4000 characters or less." };
  }

  const category = normalizeCategory(normalizeString(payload.category));
  if (category.length > 60) {
    return { ok: false, error: "Category must be 60 characters or less." };
  }

  const noteDate = normalizeDateInput(payload.noteDate) ?? todayIsoDate();
  const priority = normalizeAdminNotePriority(payload.priority) ?? "normal";
  const isDone = payload.isDone === true;
  const context = parseAdminNoteContextInput({
    contextType: payload.contextType,
    contextRef: payload.contextRef,
  });
  if (!context.ok) {
    return { ok: false, error: context.error };
  }
  const canonicalContext = canonicalizeAdminNoteContext(context.value);

  return {
    ok: true,
    value: {
      title,
      body,
      category,
      noteDate,
      priority,
      isDone,
      contextType: canonicalContext?.contextType ?? null,
      contextRef: canonicalContext?.contextRef ?? null,
    },
  };
}

export function parseUpdateAdminNotePayload(
  payload: UpdateAdminNotePayload
): ParseResult<UpdateAdminNoteNormalized> {
  const source = payload as Record<string, unknown>;
  const value: UpdateAdminNoteNormalized = {};
  let changed = 0;

  if (hasOwn(source, "title")) {
    const title = normalizeString(payload.title);
    if (title.length < 2 || title.length > 140) {
      return { ok: false, error: "Title must be between 2 and 140 characters." };
    }
    value.title = title;
    changed += 1;
  }

  if (hasOwn(source, "body")) {
    const body = normalizeString(payload.body);
    if (body.length > 4000) {
      return { ok: false, error: "Note text must be 4000 characters or less." };
    }
    value.body = body;
    changed += 1;
  }

  if (hasOwn(source, "category")) {
    const category = normalizeCategory(normalizeString(payload.category));
    if (category.length > 60) {
      return { ok: false, error: "Category must be 60 characters or less." };
    }
    value.category = category;
    changed += 1;
  }

  if (hasOwn(source, "noteDate")) {
    const noteDate = normalizeDateInput(payload.noteDate);
    if (!noteDate) {
      return { ok: false, error: "Date must use YYYY-MM-DD format." };
    }
    value.noteDate = noteDate;
    changed += 1;
  }

  if (hasOwn(source, "priority")) {
    const priority = normalizeAdminNotePriority(payload.priority);
    if (!priority) {
      return { ok: false, error: "Priority must be low, normal, high, or urgent." };
    }
    value.priority = priority;
    changed += 1;
  }

  if (hasOwn(source, "isDone")) {
    if (typeof payload.isDone !== "boolean") {
      return { ok: false, error: "Done must be true or false." };
    }
    value.isDone = payload.isDone;
    changed += 1;
  }

  if (hasOwn(source, "contextType") || hasOwn(source, "contextRef")) {
    const context = parseAdminNoteContextInput({
      contextType: payload.contextType,
      contextRef: payload.contextRef,
    });
    if (!context.ok) {
      return { ok: false, error: context.error };
    }
    const canonicalContext = canonicalizeAdminNoteContext(context.value);
    value.contextType = canonicalContext?.contextType ?? null;
    value.contextRef = canonicalContext?.contextRef ?? null;
    changed += 1;
  }

  if (changed === 0) {
    return { ok: false, error: "No updatable note fields were provided." };
  }

  return {
    ok: true,
    value,
  };
}
