import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import {
  isUuid,
  parseAdminMessageStatusActionPayload,
  resolveAdminMessageStatusAction,
  selectAdminMessageDeliveryAttemptFields,
  selectAdminMessageFields,
  toAdminMessageItem,
  type AdminMessageDeliveryAttemptRow,
  type AdminMessageRow,
} from "@/lib/admin/messages";
import { getAdminSchemaSetupMessage, isAdminMessagesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

async function resolveMessageId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.id;
}

async function loadDeliveryAttempts(
  supabase: Awaited<ReturnType<typeof createRouteHandlerSupabaseClient>>["supabase"],
  messageId: string
): Promise<
  | { ok: true; rows: AdminMessageDeliveryAttemptRow[] }
  | { ok: false; status: 500 | 503; error: string }
> {
  const attemptsResult = await supabase
    .from("admin_message_delivery_attempts")
    .select(selectAdminMessageDeliveryAttemptFields())
    .eq("message_id", messageId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (attemptsResult.error) {
    if (isAdminMessagesSchemaMissing(attemptsResult.error)) {
      return {
        ok: false,
        status: 503,
        error: getAdminSchemaSetupMessage("messages"),
      };
    }

    console.error("[AdminMessages] Could not load message delivery attempts", attemptsResult.error);
    return {
      ok: false,
      status: 500,
      error: "Could not load message diagnostics right now.",
    };
  }

  return {
    ok: true,
    rows: (attemptsResult.data ?? []) as unknown as AdminMessageDeliveryAttemptRow[],
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const messageId = await resolveMessageId(context);
  if (!isUuid(messageId)) {
    return noStoreJson({ ok: false, error: "Invalid message id." }, { status: 400 });
  }

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

  const messageResult = await supabase
    .from("admin_messages")
    .select(selectAdminMessageFields())
    .eq("id", messageId)
    .maybeSingle();

  if (messageResult.error) {
    if (isAdminMessagesSchemaMissing(messageResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("messages"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[AdminMessages] Could not load message", messageResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load message right now." }, { status: 500 })
    );
  }

  if (!messageResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Message not found." }, { status: 404 })
    );
  }

  const attempts = await loadDeliveryAttempts(supabase, messageId);
  if (!attempts.ok) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: attempts.error,
          ...(attempts.status === 503 ? { code: "ADMIN_SCHEMA_NOT_READY" } : {}),
        },
        { status: attempts.status }
      )
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      role: gate.role,
      item: toAdminMessageItem({
        row: messageResult.data as unknown as AdminMessageRow,
        deliveryAttempts: attempts.rows,
      }),
    })
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const messageId = await resolveMessageId(context);
  if (!isUuid(messageId)) {
    return noStoreJson({ ok: false, error: "Invalid message id." }, { status: 400 });
  }

  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const gate = await requireAdminRoleFromSupabase(supabase, {
    allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
    minimumRole: "editor",
  });

  if (!gate.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: gate.error }, { status: gate.status })
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unsupported content type." }, { status: 415 })
    );
  }

  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON." }, { status: 400 })
    );
  }

  const parsed = parseAdminMessageStatusActionPayload((payload ?? {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

  const currentResult = await supabase
    .from("admin_messages")
    .select(selectAdminMessageFields())
    .eq("id", messageId)
    .maybeSingle();

  if (currentResult.error) {
    if (isAdminMessagesSchemaMissing(currentResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("messages"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[AdminMessages] Could not load message before mutation", currentResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update message right now." }, { status: 500 })
    );
  }

  if (!currentResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Message not found." }, { status: 404 })
    );
  }

  const currentRow = currentResult.data as unknown as AdminMessageRow;
  const transition = resolveAdminMessageStatusAction(currentRow.status, parsed.value.action);
  if (!transition.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: transition.error }, { status: 400 })
    );
  }

  const updateResult = await supabase
    .from("admin_messages")
    .update({ status: transition.value.nextStatus })
    .eq("id", messageId)
    .select(selectAdminMessageFields())
    .maybeSingle();

  if (updateResult.error) {
    if (isAdminMessagesSchemaMissing(updateResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("messages"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[AdminMessages] Could not update message", updateResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update message right now." }, { status: 500 })
    );
  }

  if (!updateResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Message not found." }, { status: 404 })
    );
  }

  const attempts = await loadDeliveryAttempts(supabase, messageId);
  if (!attempts.ok) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: attempts.error,
          ...(attempts.status === 503 ? { code: "ADMIN_SCHEMA_NOT_READY" } : {}),
        },
        { status: attempts.status }
      )
    );
  }

  trackAnalyticsEvent({
    eventName: "admin_message_status_changed",
    channel: "server",
    userId: gate.user.id,
    payload: {
      action: parsed.value.action,
      previousStatus: currentRow.status,
      nextStatus: transition.value.nextStatus,
      sourceVariant: currentRow.source_variant,
      notificationStatus: currentRow.notification_status,
      hadNotificationError: Boolean(currentRow.notification_error_code),
    },
  });

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      role: gate.role,
      item: toAdminMessageItem({
        row: updateResult.data as unknown as AdminMessageRow,
        deliveryAttempts: attempts.rows,
      }),
    })
  );
}
