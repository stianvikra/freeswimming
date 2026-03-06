import { NextResponse } from "next/server";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { parseCreateQrRedirectLinkPayload, type QrRedirectLinkRow } from "@/lib/qr-links/admin";
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

export async function GET() {
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

  const result = await supabase
    .from("qr_redirect_links")
    .select(selectedFields())
    .order("updated_at", { ascending: false })
    .limit(500);

  if (result.error) {
    if (isQrRedirectSchemaMissing(result.error)) {
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          items: [],
          schemaReady: false,
          warning: getQrRedirectSchemaSetupMessage(),
        })
      );
    }

    console.error("[AdminQrLinks] Could not load QR links", result.error);
    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        items: [],
        schemaReady: false,
        warning: getQrRedirectSchemaSetupMessage(),
      })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      items: (result.data ?? []) as unknown as QrRedirectLinkRow[],
      schemaReady: true,
      warning: null,
    })
  );
}

export async function POST(request: Request) {
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

  const parsed = parseCreateQrRedirectLinkPayload((payload ?? {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

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

  const insertPayload: Database["public"]["Tables"]["qr_redirect_links"]["Insert"] = {
    slug: parsed.value.slug,
    destination_url: destinationValidation.destinationUrl,
    status: parsed.value.status,
    content_item_id: parsed.value.contentItemId,
    content_label: parsed.value.contentLabel,
    placement_key: parsed.value.placementKey,
    owner_user_id: parsed.value.ownerUserId,
    created_by: gate.user.id,
    updated_by: gate.user.id,
  };

  const insertResult = await supabase
    .from("qr_redirect_links")
    .insert(insertPayload)
    .select(selectedFields())
    .single();

  if (insertResult.error || !insertResult.data) {
    if (isQrRedirectSchemaMissing(insertResult.error)) {
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

    if (insertResult.error?.code === "23505") {
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

    if (insertResult.error?.code === "23503") {
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

    console.error("[AdminQrLinks] Could not create QR link", insertResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not create QR link right now." }, { status: 500 })
    );
  }

  const insertedItem = insertResult.data as unknown as QrRedirectLinkRow;

  trackAnalyticsEvent({
    eventName: "qr_link_created",
    channel: "server",
    userId: gate.user.id,
    payload: {
      qrLinkId: insertedItem.id,
      slug: insertedItem.slug,
      status: insertedItem.status,
      destinationHost: readDestinationHost(insertedItem.destination_url),
      placementKey: insertedItem.placement_key ?? "",
      contentItemId: insertedItem.content_item_id ?? "",
    },
  });
  console.info("[AdminQrLinks] Created QR link", {
    id: insertedItem.id,
    slug: insertedItem.slug,
    status: insertedItem.status,
    actorUserId: gate.user.id,
  });

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      item: insertedItem,
    })
  );
}
