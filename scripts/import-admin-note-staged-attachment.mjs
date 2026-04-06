#!/usr/bin/env node

import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import {
  ADMIN_NOTE_ATTACHMENT_BUCKET,
  buildAdminNoteAttachmentStoragePath,
  buildAdminNoteVerificationUrl,
  normalizeAdminNoteId,
  parseStagedAdminNoteImportArgs,
  REPO_ROOT,
  requireEnvValue,
  resolveStagedAttachmentPath,
  validateStagedAdminNoteAttachment,
} from "./lib/admin-note-staged-import.mjs";

function createAdminSupabaseClient() {
  return createClient(
    requireEnvValue("NEXT_PUBLIC_SUPABASE_URL", { repoRoot: REPO_ROOT }),
    requireEnvValue("SUPABASE_SERVICE_ROLE_KEY", { repoRoot: REPO_ROOT }),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

function printUsage() {
  console.log(
    [
      "Usage:",
      "  npm run admin:notes:import-staged -- --note-id <uuid> --file .tmp/admin-note-imports/<image>",
      "  node ./scripts/import-admin-note-staged-attachment.mjs <uuid> .tmp/admin-note-imports/<image>",
      "",
      "The file must already exist under /.tmp/admin-note-imports/.",
    ].join("\n")
  );
}

async function removeUploadedStorageObject(supabase, storagePath) {
  const removeResult = await supabase.storage.from(ADMIN_NOTE_ATTACHMENT_BUCKET).remove([storagePath]);
  if (removeResult.error) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          code: "ATTACHMENT_STORAGE_ROLLBACK_FAILED",
          storagePath,
          error: removeResult.error.message,
        },
        null,
        2
      )
    );
  }
}

async function runCli() {
  const args = parseStagedAdminNoteImportArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }

  const noteId = normalizeAdminNoteId(args.noteId);
  const stagedFile = await resolveStagedAttachmentPath(args.filePath, { repoRoot: REPO_ROOT });
  const validatedAttachment = validateStagedAdminNoteAttachment({
    fileName: path.basename(stagedFile.absolutePath),
    sizeBytes: stagedFile.sizeBytes,
  });
  const supabase = createAdminSupabaseClient();

  const noteResult = await supabase
    .from("admin_notes")
    .select("id,is_done")
    .eq("id", noteId)
    .maybeSingle();

  if (noteResult.error) {
    throw new Error(`Could not load target admin note: ${noteResult.error.message}`);
  }

  if (!noteResult.data) {
    throw new Error(`Admin note was not found: ${noteId}`);
  }

  const attachmentId = crypto.randomUUID();
  const storagePath = buildAdminNoteAttachmentStoragePath({
    noteId,
    attachmentId,
    fileName: validatedAttachment.fileName,
  });

  const fileBuffer = await readFile(stagedFile.absolutePath);
  const uploadResult = await supabase.storage
    .from(ADMIN_NOTE_ATTACHMENT_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: validatedAttachment.mimeType,
      upsert: false,
    });

  if (uploadResult.error) {
    throw new Error(`Could not upload staged attachment: ${uploadResult.error.message}`);
  }

  const insertResult = await supabase
    .from("admin_note_attachments")
    .insert({
      id: attachmentId,
      note_id: noteId,
      file_name: validatedAttachment.fileName,
      mime_type: validatedAttachment.mimeType,
      size_bytes: validatedAttachment.sizeBytes,
      storage_path: storagePath,
      created_by: null,
    })
    .select("id,note_id,file_name,mime_type,size_bytes,storage_path")
    .maybeSingle();

  if (insertResult.error) {
    await removeUploadedStorageObject(supabase, storagePath);
    throw new Error(`Could not save attachment metadata: ${insertResult.error.message}`);
  }

  const verificationUrl = buildAdminNoteVerificationUrl({
    noteId,
    isDone: noteResult.data.is_done,
  });

  try {
    await unlink(stagedFile.absolutePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      JSON.stringify(
        {
          ok: false,
          code: "STAGED_FILE_CLEANUP_FAILED",
          attachmentImported: true,
          noteId,
          attachmentId,
          verificationUrl,
          stagedFilePath: stagedFile.repoRelativePath,
          error: message,
        },
        null,
        2
      )
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        noteId,
        attachmentId,
        fileName: validatedAttachment.fileName,
        mimeType: validatedAttachment.mimeType,
        sizeBytes: validatedAttachment.sizeBytes,
        stagedFilePath: stagedFile.repoRelativePath,
        stagedFileDeleted: true,
        verificationUrl,
      },
      null,
      2
    )
  );
}

runCli().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: message,
      },
      null,
      2
    )
  );
  process.exitCode = 1;
});
