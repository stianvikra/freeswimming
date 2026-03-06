import { NextResponse } from "next/server";
import { isUuid } from "@/lib/admin/content";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { parseUpdateQrRedirectLinkPayload, type QrRedirectLinkRow } from "@/lib/qr-links/admin";
import { getQrRedirectSchemaSetupMessage, isQrRedirectSchemaMissing } from "@/lib/qr-links/schema";
import {
  resolveQrRedirectAllowedHosts,
  validateQrRedirectDestination,
} from "@/lib/qr-links/redirect-policy";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type DestinationValidationFailureReason =
  | "invalid_url"
  | "invalid_protocol"
  | "credentials_not_allowed"
  | "disallowed_host";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ExistingQrLinkRecord = Pick<QrRedirectLinkRow, "id" | "slug" | "status">;

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

function selectedFields() {
  return `
    id,
    slug,
    destination_url,
    status,
    content_item_id,
    content_label,
    placement_key,
    owner_user_id,
    created_by,
    updated_by,
    last_resolved_at,
    created_at,
    updated_at
  `;
}

function mapDestinationValidationReasonToError(reason: DestinationValidationFailureReason): string {
  switch (reason) {
    case "invalid_url":
      return "destinationUrl must be a valid absolute URL.";
    case "invalid_protocol":
      return "destinationUrl must use https protocol.";
    case "credentials_not_allowed":
      return "destinationUrl cannot include credentials.";
    case "disallowed_host":
      return "destinationUrl host is not allowlisted.";
    default:
      return "Invalid destinationUrl.";
  }
}

function readDestinationHost(destinationUrl: string): string {
  try {
    return new URL(destinationUrl).hostname;
  } catch {
    return "";
  }
}

async function resolveId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.id;
}

export async function PATCH(request: Request, context: RouteContext) {
  const id = await resolveId(context);
  if (!isUuid(id)) {
    return noStoreJson({ ok: false, error: "Invalid QR link id." }, { status: 400 });
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

  const parsed = parseUpdateQrRedirectLinkPayload((payload ?? {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

  const existingResult = await supabase
    .from("qr_redirect_links")
    .select("id, slug, status")
    .eq("id", id)
    .maybeSingle();

  if (existingResult.error) {
    if (isQrRedirectSchemaMissing(existingResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getQrRedirectSchemaSetupMessage(),
            code: "QR_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[AdminQrLinks] Could not read existing QR link", existingResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update QR link right now." }, { status: 500 })
    );
  }

  if (!existingResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "QR link not found." }, { status: 404 })
    );
  }

  const existingRecord = existingResult.data as unknown as ExistingQrLinkRecord;

  const updatePayload: Database["public"]["Tables"]["qr_redirect_links"]["Update"] = {
    updated_by: gate.user.id,
  };

  if (parsed.value.slug !== undefined) {
    updatePayload.slug = parsed.value.slug;
  }

  if (parsed.value.destinationUrl !== undefined) {
    const requestUrl = new URL(request.url);
    const allowedHosts = resolveQrRedirectAllowedHosts({
      rawAllowlist: process.env.QR_REDIRECT_ALLOWED_HOSTS,
      requestHostname: requestUrl.hostname,
    });
    const destinationValidation = validateQrRedirectDestination(parsed.value.destinationUrl, {
      allowedHosts,
    });
    if (!destinationValidation.ok) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: mapDestinationValidationReasonToError(destinationValidation.reason),
          },
          { status: 400 }
        )
      );
    }
    updatePayload.destination_url = destinationValidation.destinationUrl;
  }

  if (parsed.value.status !== undefined) {
    updatePayload.status = parsed.value.status;
  }

  if (parsed.value.hasContentItemId) {
    updatePayload.content_item_id = parsed.value.contentItemId ?? null;
  }

  if (parsed.value.contentLabel !== undefined) {
    updatePayload.content_label = parsed.value.contentLabel;
  }

  if (parsed.value.placementKey !== undefined) {
    updatePayload.placement_key = parsed.value.placementKey;
  }

  if (parsed.value.hasOwnerUserId) {
    updatePayload.owner_user_id = parsed.value.ownerUserId ?? null;
  }

  const updateResult = await supabase
    .from("qr_redirect_links")
    .update(updatePayload)
    .eq("id", id)
    .select(selectedFields())
    .maybeSingle();

  if (updateResult.error) {
    if (isQrRedirectSchemaMissing(updateResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getQrRedirectSchemaSetupMessage(),
            code: "QR_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    if (updateResult.error?.code === "23505") {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: "Slug already exists. Choose a unique slug.",
          },
          { status: 409 }
        )
      );
    }

    if (updateResult.error?.code === "23503") {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: "Referenced content item or owner was not found.",
          },
          { status: 400 }
        )
      );
    }

    console.error("[AdminQrLinks] Could not update QR link", updateResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update QR link right now." }, { status: 500 })
    );
  }

  if (!updateResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "QR link not found." }, { status: 404 })
    );
  }

  const updatedItem = updateResult.data as unknown as QrRedirectLinkRow;
  const previousStatus = existingRecord.status;
  const nextStatus = updatedItem.status;

  trackAnalyticsEvent({
    eventName: "qr_link_updated",
    channel: "server",
    userId: gate.user.id,
    payload: {
      qrLinkId: updatedItem.id,
      slug: updatedItem.slug,
      previousStatus,
      nextStatus,
      destinationHost: readDestinationHost(updatedItem.destination_url),
      placementKey: updatedItem.placement_key ?? "",
      contentItemId: updatedItem.content_item_id ?? "",
    },
  });

  if (previousStatus !== nextStatus) {
    trackAnalyticsEvent({
      eventName: "qr_link_status_changed",
      channel: "server",
      userId: gate.user.id,
      payload: {
        qrLinkId: updatedItem.id,
        slug: updatedItem.slug,
        previousStatus,
        nextStatus,
      },
    });
  }

  console.info("[AdminQrLinks] Updated QR link", {
    id: updatedItem.id,
    slug: updatedItem.slug,
    previousStatus,
    nextStatus,
    actorUserId: gate.user.id,
  });

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      item: updatedItem,
    })
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const id = await resolveId(context);
  if (!isUuid(id)) {
    return noStoreJson({ ok: false, error: "Invalid QR link id." }, { status: 400 });
  }

  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const gate = await requireAdminRoleFromSupabase(supabase, {
    allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
    minimumRole: "admin",
  });

  if (!gate.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: gate.error }, { status: gate.status })
    );
  }

  const deleteResult = await supabase
    .from("qr_redirect_links")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (deleteResult.error) {
    if (isQrRedirectSchemaMissing(deleteResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getQrRedirectSchemaSetupMessage(),
            code: "QR_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[AdminQrLinks] Could not delete QR link", deleteResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not delete QR link right now." }, { status: 500 })
    );
  }

  if (!deleteResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "QR link not found." }, { status: 404 })
    );
  }

  console.info("[AdminQrLinks] Deleted QR link", {
    id: deleteResult.data.id,
    actorUserId: gate.user.id,
  });

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      id: deleteResult.data.id,
    })
  );
}
