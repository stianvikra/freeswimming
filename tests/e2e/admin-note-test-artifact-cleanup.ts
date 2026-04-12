import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  isAdminNoteTestArtifact,
  isAdminNoteTestArtifactForScope,
  isLegacyAdminNoteTestArtifact,
} from "@/lib/admin/admin-note-test-artifacts";
import { ADMIN_NOTE_ATTACHMENT_BUCKET } from "@/lib/admin/notes";
import type { Database } from "@/types/database";

type AdminNoteArtifactCleanupOptions = {
  scope?: string;
  includeLegacy?: boolean;
};

type AdminNoteArtifactRow = Pick<
  Database["public"]["Tables"]["admin_notes"]["Row"],
  "id" | "title" | "body"
>;
type AdminNoteAttachmentCleanupRow = Pick<
  Database["public"]["Tables"]["admin_note_attachments"]["Row"],
  "id" | "note_id" | "storage_path"
>;

type AdminNoteArtifactCleanupEnv = {
  supabaseUrl: string;
  serviceRoleKey: string;
};

type RetryableCleanupResult<T> = {
  data: T;
  error: {
    message: string;
  } | null;
};

function isTransientCleanupErrorMessage(message: string) {
  return /fetch failed|Failed to fetch|timeout|ECONNREFUSED|ECONNRESET|ENOTFOUND|EAI_AGAIN|socket hang up/i.test(
    message
  );
}

async function waitForCleanupRetry(attempt: number) {
  await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
}

async function runCleanupStepWithRetry<T>(
  run: () => PromiseLike<RetryableCleanupResult<T>>
): Promise<RetryableCleanupResult<T>> {
  let lastResult: RetryableCleanupResult<T> | null = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const result = await run();
    lastResult = result;

    if (!result.error || !isTransientCleanupErrorMessage(result.error.message) || attempt === 3) {
      return result;
    }

    await waitForCleanupRetry(attempt);
  }

  if (lastResult) {
    return lastResult;
  }

  throw new Error("Cleanup retry exhausted without a query result.");
}

function readEnvFileValue(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY") {
  for (const fileName of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), fileName);
    if (!existsSync(filePath)) continue;

    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      if (!line.startsWith(`${name}=`)) continue;

      let value = line.slice(name.length + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (value) return value;
    }
  }

  return null;
}

function requireCleanupEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY") {
  const value = process.env[name] ?? readEnvFileValue(name);
  if (!value) {
    throw new Error(`${name} is required for admin-note artifact cleanup.`);
  }
  return value;
}

function resolveCleanupEnv(): AdminNoteArtifactCleanupEnv {
  return {
    supabaseUrl: requireCleanupEnv("NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey: requireCleanupEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function isPlaceholderAdminNoteArtifactCleanupEnv(env: AdminNoteArtifactCleanupEnv) {
  try {
    const hostname = new URL(env.supabaseUrl).hostname;
    if (hostname === "example.com") {
      return true;
    }
  } catch {
    // Fall through to the explicit key guard below.
  }

  return env.serviceRoleKey === "ci-service-role-key";
}

function createCleanupSupabaseClient(env: AdminNoteArtifactCleanupEnv) {
  return createClient<Database>(env.supabaseUrl, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function selectArtifactNotes(
  notes: AdminNoteArtifactRow[],
  options: AdminNoteArtifactCleanupOptions
) {
  const scope = options.scope;
  if (!scope) {
    return notes.filter(isAdminNoteTestArtifact);
  }

  return notes.filter(
    (note) =>
      isAdminNoteTestArtifactForScope(note, scope) ||
      (options.includeLegacy ? isLegacyAdminNoteTestArtifact(note) : false)
  );
}

export async function cleanupAdminNoteTestArtifacts(options: AdminNoteArtifactCleanupOptions = {}) {
  const env = resolveCleanupEnv();
  if (isPlaceholderAdminNoteArtifactCleanupEnv(env)) {
    return {
      deletedNoteIds: [] as string[],
      skipped: "placeholder-ci-env" as const,
    };
  }

  const supabase = createCleanupSupabaseClient(env);
  const notesResult = await runCleanupStepWithRetry(() =>
    supabase
      .from("admin_notes")
      .select("id,title,body")
      .order("created_at", { ascending: false })
      .limit(400)
  );

  if (notesResult.error) {
    throw new Error(
      `Could not load admin notes for artifact cleanup: ${notesResult.error.message}`
    );
  }

  const artifactNotes = selectArtifactNotes(
    (notesResult.data ?? []) as AdminNoteArtifactRow[],
    options
  );

  if (artifactNotes.length === 0) {
    return { deletedNoteIds: [] as string[] };
  }

  const noteIds = [...new Set(artifactNotes.map((note) => note.id))];
  const attachmentsResult = await runCleanupStepWithRetry(() =>
    supabase.from("admin_note_attachments").select("id,note_id,storage_path").in("note_id", noteIds)
  );

  if (attachmentsResult.error) {
    throw new Error(
      `Could not load admin-note attachments for artifact cleanup: ${attachmentsResult.error.message}`
    );
  }

  const attachmentRows = (attachmentsResult.data ?? []) as AdminNoteAttachmentCleanupRow[];
  const storagePaths = [...new Set(attachmentRows.map((row) => row.storage_path).filter(Boolean))];

  if (storagePaths.length > 0) {
    const storageDelete = await runCleanupStepWithRetry(() =>
      supabase.storage.from(ADMIN_NOTE_ATTACHMENT_BUCKET).remove(storagePaths)
    );

    if (storageDelete.error) {
      throw new Error(
        `Could not remove admin-note artifact images from storage: ${storageDelete.error.message}`
      );
    }
  }

  const deleteLinksByNoteId = await runCleanupStepWithRetry(() =>
    supabase.from("admin_note_links").delete().in("note_id", noteIds)
  );
  if (deleteLinksByNoteId.error) {
    throw new Error(
      `Could not delete admin-note artifact links by note_id: ${deleteLinksByNoteId.error.message}`
    );
  }

  const deleteLinksByRelatedId = await runCleanupStepWithRetry(() =>
    supabase.from("admin_note_links").delete().in("related_note_id", noteIds)
  );
  if (deleteLinksByRelatedId.error) {
    throw new Error(
      `Could not delete admin-note artifact links by related_note_id: ${deleteLinksByRelatedId.error.message}`
    );
  }

  if (attachmentRows.length > 0) {
    const deleteAttachments = await runCleanupStepWithRetry(() =>
      supabase.from("admin_note_attachments").delete().in("note_id", noteIds)
    );

    if (deleteAttachments.error) {
      throw new Error(
        `Could not delete admin-note artifact attachment rows: ${deleteAttachments.error.message}`
      );
    }
  }

  const deleteNotes = await runCleanupStepWithRetry(() =>
    supabase.from("admin_notes").delete().in("id", noteIds)
  );
  if (deleteNotes.error) {
    throw new Error(`Could not delete admin-note artifacts: ${deleteNotes.error.message}`);
  }

  return { deletedNoteIds: noteIds };
}
