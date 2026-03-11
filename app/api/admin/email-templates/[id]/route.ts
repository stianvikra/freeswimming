import { NextResponse } from "next/server";
import {
  canTransitionAdminEmailTemplateStatus,
  parseUpdateAdminEmailTemplatePayload,
  resolveAdminEmailTemplateLifecycleEvents,
  validateAdminEmailTemplatePlaceholders,
} from "@/lib/admin/email-templates";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { getAdminSchemaSetupMessage, isAdminEmailTemplatesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

const TEMPLATE_SELECT =
  "id,template_key,locale,status,version,subject,body,required_placeholders,optional_placeholders,last_published_at,last_published_by,created_by,updated_by,created_at,updated_at" as const;

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function PATCH(request: Request, context: RouteContext) {
  const params = await context.params;
  const templateId = params.id;
  if (!templateId.trim()) {
    return noStoreJson({ ok: false, error: "Invalid template id." }, { status: 400 });
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

  const parsed = parseUpdateAdminEmailTemplatePayload((payload ?? {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

  const existingResult = await supabase
    .from("admin_email_templates")
    .select(TEMPLATE_SELECT)
    .eq("id", templateId)
    .maybeSingle();

  if (existingResult.error) {
    if (isAdminEmailTemplatesSchemaMissing(existingResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("emailTemplates"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[AdminEmailTemplates] Could not load existing template", existingResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load template right now." }, { status: 500 })
    );
  }

  if (!existingResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Template not found." }, { status: 404 })
    );
  }

  const existing = existingResult.data;
  if (parsed.value.expectedUpdatedAt && parsed.value.expectedUpdatedAt !== existing.updated_at) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Template was updated by another user. Reload before retry.",
        },
        { status: 409 }
      )
    );
  }

  const nextStatus = parsed.value.patch.status ?? existing.status;
  if (!canTransitionAdminEmailTemplateStatus(existing.status, nextStatus)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: `Invalid status transition (${existing.status} -> ${nextStatus}).`,
        },
        { status: 400 }
      )
    );
  }

  const nextSubject = parsed.value.patch.subject ?? existing.subject;
  const nextBody = parsed.value.patch.body ?? existing.body;
  const nextRequired =
    parsed.value.patch.requiredPlaceholders ?? existing.required_placeholders ?? [];
  const nextOptional =
    parsed.value.patch.optionalPlaceholders ?? existing.optional_placeholders ?? [];

  const placeholderValidation = validateAdminEmailTemplatePlaceholders({
    subject: nextSubject,
    body: nextBody,
    requiredPlaceholders: nextRequired,
    optionalPlaceholders: nextOptional,
  });
  if (!placeholderValidation.ok) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: placeholderValidation.error,
          details: placeholderValidation.details,
        },
        { status: 400 }
      )
    );
  }

  const isPublishing = existing.status !== "published" && nextStatus === "published";
  const now = new Date().toISOString();

  const updatePayload = {
    template_key: parsed.value.patch.templateKey ?? existing.template_key,
    locale: parsed.value.patch.locale ?? existing.locale,
    status: nextStatus,
    subject: nextSubject,
    body: nextBody,
    required_placeholders: nextRequired,
    optional_placeholders: nextOptional,
    version: isPublishing ? existing.version + 1 : existing.version,
    last_published_at: isPublishing ? now : existing.last_published_at,
    last_published_by: isPublishing ? gate.user.id : existing.last_published_by,
    updated_by: gate.user.id,
  };

  const updateResult = await supabase
    .from("admin_email_templates")
    .update(updatePayload)
    .eq("id", templateId)
    .eq("updated_at", existing.updated_at)
    .select(TEMPLATE_SELECT)
    .maybeSingle();

  if (updateResult.error) {
    if (isAdminEmailTemplatesSchemaMissing(updateResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("emailTemplates"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    if (updateResult.error.code === "23505") {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Template key+locale already exists." }, { status: 409 })
      );
    }

    console.error("[AdminEmailTemplates] Could not update template", updateResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update template right now." }, { status: 500 })
    );
  }

  if (!updateResult.data) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Template was updated by another user. Reload before retry.",
        },
        { status: 409 }
      )
    );
  }

  for (const lifecycleEvent of resolveAdminEmailTemplateLifecycleEvents({
    previousStatus: existing.status,
    nextStatus: updateResult.data.status,
  })) {
    trackAnalyticsEvent({
      eventName: lifecycleEvent.eventName,
      channel: "server",
      userId: gate.user.id,
      payload: {
        templateId: updateResult.data.id,
        templateKey: updateResult.data.template_key,
        locale: updateResult.data.locale,
        previousStatus: lifecycleEvent.previousStatus ?? "none",
        nextStatus: lifecycleEvent.nextStatus,
        version: updateResult.data.version,
      },
    });
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      item: updateResult.data,
    })
  );
}
