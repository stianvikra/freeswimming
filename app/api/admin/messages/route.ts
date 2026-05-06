import { NextResponse } from "next/server";
import {
  buildAdminMessageSearchOrFilter,
  parseAdminMessageCursor,
  parseAdminMessagePageSize,
  parseAdminMessageSourceFilter,
  parseAdminMessageStatusFilter,
  selectAdminMessageDeliveryAttemptFields,
  selectAdminMessageFields,
  toAdminMessageItem,
  type AdminMessageDeliveryAttemptRow,
  type AdminMessageRow,
} from "@/lib/admin/messages";
import { getAdminSchemaSetupMessage, isAdminMessagesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

function noStoreJson(
  body: Record<string, unknown>,
  init?: {
    status?: number;
  }
) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function groupAttemptsByMessageId(
  rows: AdminMessageDeliveryAttemptRow[]
): Map<string, AdminMessageDeliveryAttemptRow[]> {
  const grouped = new Map<string, AdminMessageDeliveryAttemptRow[]>();
  for (const row of rows) {
    const current = grouped.get(row.message_id) ?? [];
    current.push(row);
    grouped.set(row.message_id, current);
  }
  return grouped;
}

export async function GET(request: Request) {
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const gate = await requireAdminRoleFromSupabase(supabase, {
    allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
    minimumRole: "viewer",
  });

  if (!gate.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: gate.error }, { status: gate.status })
    );
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = parseAdminMessageStatusFilter(searchParams.get("status"));
  const sourceFilter = parseAdminMessageSourceFilter(searchParams.get("source"));
  const pageSize = parseAdminMessagePageSize(searchParams.get("pageSize"));
  const beforeCursor = parseAdminMessageCursor(searchParams.get("before"));
  const searchFilter = buildAdminMessageSearchOrFilter(searchParams.get("q") ?? "");

  let query = supabase.from("admin_messages").select(selectAdminMessageFields());

  if (statusFilter === "read") {
    query = query.in("status", ["read", "triaged"]);
  } else if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (sourceFilter !== "all") {
    query = query.eq("source_variant", sourceFilter);
  }

  if (searchFilter) {
    query = query.or(searchFilter);
  }

  if (beforeCursor) {
    query = query.lt("created_at", beforeCursor);
  }

  const result = await query.order("created_at", { ascending: false }).limit(pageSize + 1);

  if (result.error) {
    if (isAdminMessagesSchemaMissing(result.error)) {
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          role: gate.role,
          items: [],
          schemaReady: false,
          warning: getAdminSchemaSetupMessage("messages"),
          pageSize,
          nextCursor: null,
        })
      );
    }

    console.error("[AdminMessages] Could not load messages", result.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load messages right now." }, { status: 500 })
    );
  }

  const rows = ((result.data ?? []) as unknown as AdminMessageRow[]).slice(0, pageSize);
  const nextCursor =
    (result.data ?? []).length > pageSize ? (rows[rows.length - 1]?.created_at ?? null) : null;
  const messageIds = rows.map((row) => row.id);
  let attemptsByMessageId = new Map<string, AdminMessageDeliveryAttemptRow[]>();

  if (messageIds.length > 0) {
    const attemptsResult = await supabase
      .from("admin_message_delivery_attempts")
      .select(selectAdminMessageDeliveryAttemptFields())
      .in("message_id", messageIds)
      .order("created_at", { ascending: false })
      .limit(Math.min(messageIds.length * 8, 200));

    if (attemptsResult.error) {
      if (isAdminMessagesSchemaMissing(attemptsResult.error)) {
        return applySupabaseCookies(
          noStoreJson({
            ok: true,
            role: gate.role,
            items: [],
            schemaReady: false,
            warning: getAdminSchemaSetupMessage("messages"),
            pageSize,
            nextCursor: null,
          })
        );
      }

      console.error(
        "[AdminMessages] Could not load message delivery attempts",
        attemptsResult.error
      );
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Could not load message diagnostics right now." },
          { status: 500 }
        )
      );
    }

    attemptsByMessageId = groupAttemptsByMessageId(
      (attemptsResult.data ?? []) as unknown as AdminMessageDeliveryAttemptRow[]
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      role: gate.role,
      items: rows.map((row) =>
        toAdminMessageItem({
          row,
          deliveryAttempts: attemptsByMessageId.get(row.id) ?? [],
        })
      ),
      schemaReady: true,
      warning: null,
      pageSize,
      nextCursor,
    })
  );
}
