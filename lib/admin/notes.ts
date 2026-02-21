import type { Database } from "@/types/database";
import { parseAdminNoteContextInput, type AdminNoteContext } from "@/lib/admin/note-context";

export type AdminNoteRow = Database["public"]["Tables"]["admin_notes"]["Row"];

export type CreateAdminNotePayload = {
  title?: unknown;
  body?: unknown;
  category?: unknown;
  noteDate?: unknown;
  isDone?: unknown;
  contextType?: unknown;
  contextRef?: unknown;
};

export type UpdateAdminNotePayload = {
  title?: unknown;
  body?: unknown;
  category?: unknown;
  noteDate?: unknown;
  isDone?: unknown;
  contextType?: unknown;
  contextRef?: unknown;
};

type CreateAdminNoteNormalized = {
  title: string;
  body: string;
  category: string;
  noteDate: string;
  isDone: boolean;
  contextType: AdminNoteContext["contextType"] | null;
  contextRef: string | null;
};

type UpdateAdminNoteNormalized = {
  title?: string;
  body?: string;
  category?: string;
  noteDate?: string;
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

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCategory(raw: string): string {
  const collapsed = raw.replace(/\s+/g, " ").trim();
  return collapsed.length > 0 ? collapsed : "General";
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
  const isDone = payload.isDone === true;
  const context = parseAdminNoteContextInput({
    contextType: payload.contextType,
    contextRef: payload.contextRef,
  });
  if (!context.ok) {
    return { ok: false, error: context.error };
  }

  return {
    ok: true,
    value: {
      title,
      body,
      category,
      noteDate,
      isDone,
      contextType: context.value?.contextType ?? null,
      contextRef: context.value?.contextRef ?? null,
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
    value.contextType = context.value?.contextType ?? null;
    value.contextRef = context.value?.contextRef ?? null;
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
