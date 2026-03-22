import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";
import {
  ADMIN_NOTE_ATTACHMENT_BUCKET,
  buildAdminNoteLinkedSummary,
  compareAdminNotePriority,
  type AdminNoteAttachment,
  type AdminNoteAttachmentRow,
  type AdminNoteItem,
  type AdminNoteLinkRow,
  type AdminNoteRow,
} from "@/lib/admin/notes";

type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

type HydrateAdminNotesResult =
  | {
      ok: true;
      items: AdminNoteItem[];
    }
  | {
      ok: false;
      error: PostgrestLikeError;
    };

export function selectAdminNoteFields() {
  return `
    id,
    title,
    body,
    category,
    priority,
    note_date,
    is_done,
    context_type,
    context_ref,
    created_by,
    updated_by,
    created_at,
    updated_at
  `;
}

function selectAdminNoteAttachmentFields() {
  return `
    id,
    note_id,
    file_name,
    mime_type,
    size_bytes,
    storage_path,
    created_at,
    created_by
  `;
}

function selectAdminNoteLinkFields() {
  return `
    note_id,
    related_note_id,
    created_at,
    created_by
  `;
}

function sortLinkedNotes(
  left: AdminNoteItem["related_notes"][number],
  right: AdminNoteItem["related_notes"][number]
) {
  if (left.priority !== right.priority) {
    return compareAdminNotePriority(left.priority, right.priority);
  }

  if (left.note_date !== right.note_date) {
    return right.note_date.localeCompare(left.note_date);
  }

  return right.id.localeCompare(left.id);
}

async function buildAttachmentPayload(
  rows: AdminNoteAttachmentRow[]
): Promise<AdminNoteAttachment[]> {
  if (rows.length === 0) return [];

  const adminSupabase = createAdminSupabaseClient();

  return Promise.all(
    rows.map(async (row) => {
      const signed = await adminSupabase.storage
        .from(ADMIN_NOTE_ATTACHMENT_BUCKET)
        .createSignedUrl(row.storage_path, 60 * 60);

      if (signed.error) {
        console.error("[AdminNotes] Could not sign attachment URL", {
          attachmentId: row.id,
          noteId: row.note_id,
          error: signed.error,
        });
      }

      return {
        id: row.id,
        note_id: row.note_id,
        file_name: row.file_name,
        mime_type: row.mime_type,
        size_bytes: row.size_bytes,
        created_at: row.created_at,
        created_by: row.created_by,
        signed_url: signed.data?.signedUrl ?? null,
      };
    })
  );
}

export async function hydrateAdminNoteRows(params: {
  supabase: SupabaseClient<Database>;
  rows: AdminNoteRow[];
}): Promise<HydrateAdminNotesResult> {
  if (params.rows.length === 0) {
    return { ok: true, items: [] };
  }

  const noteIds = params.rows.map((row) => row.id);

  const attachmentsResult = await params.supabase
    .from("admin_note_attachments")
    .select(selectAdminNoteAttachmentFields())
    .in("note_id", noteIds)
    .order("created_at", { ascending: true });

  if (attachmentsResult.error) {
    return { ok: false, error: attachmentsResult.error };
  }

  const idsCsv = noteIds.join(",");
  const linksResult = await params.supabase
    .from("admin_note_links")
    .select(selectAdminNoteLinkFields())
    .or(`note_id.in.(${idsCsv}),related_note_id.in.(${idsCsv})`)
    .order("created_at", { ascending: true });

  if (linksResult.error) {
    return { ok: false, error: linksResult.error };
  }

  const linkRows = (linksResult.data ?? []) as unknown as AdminNoteLinkRow[];
  const relatedNoteIds = new Set<string>();
  for (const link of linkRows) {
    relatedNoteIds.add(link.note_id);
    relatedNoteIds.add(link.related_note_id);
  }

  const missingRelatedIds = [...relatedNoteIds].filter((id) => !noteIds.includes(id));
  let relatedLookupRows: AdminNoteRow[] = [];
  if (missingRelatedIds.length > 0) {
    const relatedNotesResult = await params.supabase
      .from("admin_notes")
      .select(selectAdminNoteFields())
      .in("id", missingRelatedIds);

    if (relatedNotesResult.error) {
      return { ok: false, error: relatedNotesResult.error };
    }

    relatedLookupRows = (relatedNotesResult.data ?? []) as unknown as AdminNoteRow[];
  }

  const noteLookup = new Map<string, AdminNoteRow>(
    [...params.rows, ...relatedLookupRows].map((row) => [row.id, row])
  );

  const attachmentRows = (attachmentsResult.data ?? []) as unknown as AdminNoteAttachmentRow[];
  const attachmentPayload = await buildAttachmentPayload(attachmentRows);
  const attachmentsByNoteId = new Map<string, AdminNoteAttachment[]>();
  for (const attachment of attachmentPayload) {
    const bucket = attachmentsByNoteId.get(attachment.note_id) ?? [];
    bucket.push(attachment);
    attachmentsByNoteId.set(attachment.note_id, bucket);
  }

  const relatedByNoteId = new Map<string, AdminNoteItem["related_notes"]>();
  for (const link of linkRows) {
    const left = noteLookup.get(link.note_id);
    const right = noteLookup.get(link.related_note_id);
    if (!left || !right) continue;

    const leftBucket = relatedByNoteId.get(left.id) ?? [];
    if (!leftBucket.some((entry) => entry.id === right.id)) {
      leftBucket.push(buildAdminNoteLinkedSummary(right));
      relatedByNoteId.set(left.id, leftBucket);
    }

    const rightBucket = relatedByNoteId.get(right.id) ?? [];
    if (!rightBucket.some((entry) => entry.id === left.id)) {
      rightBucket.push(buildAdminNoteLinkedSummary(left));
      relatedByNoteId.set(right.id, rightBucket);
    }
  }

  return {
    ok: true,
    items: params.rows.map((row) => ({
      ...row,
      attachments: attachmentsByNoteId.get(row.id) ?? [],
      related_notes: [...(relatedByNoteId.get(row.id) ?? [])].sort(sortLinkedNotes),
    })),
  };
}

export async function loadHydratedAdminNoteById(params: {
  supabase: SupabaseClient<Database>;
  noteId: string;
}): Promise<
  | {
      ok: true;
      item: AdminNoteItem | null;
    }
  | {
      ok: false;
      error: PostgrestLikeError;
    }
> {
  const result = await params.supabase
    .from("admin_notes")
    .select(selectAdminNoteFields())
    .eq("id", params.noteId)
    .maybeSingle();

  if (result.error) {
    return { ok: false, error: result.error };
  }

  if (!result.data) {
    return { ok: true, item: null };
  }

  const hydrated = await hydrateAdminNoteRows({
    supabase: params.supabase,
    rows: [result.data as unknown as AdminNoteRow],
  });

  if (!hydrated.ok) {
    return hydrated;
  }

  return {
    ok: true,
    item: hydrated.items[0] ?? null,
  };
}
