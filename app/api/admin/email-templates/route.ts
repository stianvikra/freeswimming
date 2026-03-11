import { NextResponse } from "next/server";
import {
  parseCreateAdminEmailTemplatePayload,
  validateAdminEmailTemplatePlaceholders,
} from "@/lib/admin/email-templates";
import { getAdminSchemaSetupMessage, isAdminEmailTemplatesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

const TEMPLATE_SELECT =
  "id,template_key,locale,status,version,subject,body,required_placeholders,optional_placeholders,last_published_at,last_published_by,created_by,updated_by,created_at,updated_at" as const;

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
    .from("admin_email_templates")
    .select(TEMPLATE_SELECT)
    .order("template_key", { ascending: true })
    .order("locale", { ascending: true });

  if (result.error) {
    if (isAdminEmailTemplatesSchemaMissing(result.error)) {
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          items: [],
          schemaReady: false,
          warning: getAdminSchemaSetupMessage("emailTemplates"),
        })
      );
    }

    console.error("[AdminEmailTemplates] Could not load templates", result.error);
    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        items: [],
        schemaReady: false,
        warning: getAdminSchemaSetupMessage("emailTemplates"),
      })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      items: result.data ?? [],
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

  const parsed = parseCreateAdminEmailTemplatePayload((payload ?? {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

  if (parsed.value.status === "published") {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "New templates must start in draft/review before publish.",
        },
        { status: 400 }
      )
    );
  }

  const placeholderValidation = validateAdminEmailTemplatePlaceholders({
    subject: parsed.value.subject,
    body: parsed.value.body,
    requiredPlaceholders: parsed.value.requiredPlaceholders,
    optionalPlaceholders: parsed.value.optionalPlaceholders,
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

  const insertResult = await supabase
    .from("admin_email_templates")
    .insert({
      template_key: parsed.value.templateKey,
      locale: parsed.value.locale,
      status: parsed.value.status,
      subject: parsed.value.subject,
      body: parsed.value.body,
      required_placeholders: parsed.value.requiredPlaceholders,
      optional_placeholders: parsed.value.optionalPlaceholders,
      version: 1,
      created_by: gate.user.id,
      updated_by: gate.user.id,
    })
    .select(TEMPLATE_SELECT)
    .single();

  if (insertResult.error || !insertResult.data) {
    if (isAdminEmailTemplatesSchemaMissing(insertResult.error)) {
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

    if (insertResult.error?.code === "23505") {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Template key+locale already exists." }, { status: 409 })
      );
    }

    console.error("[AdminEmailTemplates] Could not create template", insertResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not create template right now." }, { status: 500 })
    );
  }

  return applySupabaseCookies(
    noStoreJson(
      {
        ok: true,
        item: insertResult.data,
      },
      { status: 201 }
    )
  );
}
