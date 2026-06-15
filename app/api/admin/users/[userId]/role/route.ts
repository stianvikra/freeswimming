import { NextResponse } from "next/server";
import { resolveAdminRoleForUser } from "@/lib/admin/access";
import { getAdminSchemaSetupMessage, isAdminUsersSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import {
  isAdminRole,
  resolveAdminUserRoleSource,
  type AdminUserProfileSourceRow,
  type AdminUserRoleMutationApiResponse,
  type AdminUserRoleMutationPayload,
} from "@/lib/admin/users";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

const ROLE_MUTATION_REASONS: AdminUserRoleMutationPayload["reason"][] = [
  "support_access",
  "operator_change",
  "owner_request",
  "repair",
];

function noStoreJson(body: AdminUserRoleMutationApiResponse, init?: { status?: number }) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveUserId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.userId;
}

function parseRoleMutationPayload(
  payload: unknown
): { ok: true; value: AdminUserRoleMutationPayload } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Invalid role update payload." };
  }

  const record = payload as Record<string, unknown>;
  const expectedRole = record.expectedRole;
  const reason = record.reason;

  if (!isAdminRole(record.role)) {
    return { ok: false, error: "Choose a valid admin role." };
  }

  if (
    expectedRole !== null &&
    expectedRole !== "unknown" &&
    expectedRole !== undefined &&
    !isAdminRole(expectedRole)
  ) {
    return { ok: false, error: "Expected role is invalid." };
  }

  if (typeof reason !== "string" || !ROLE_MUTATION_REASONS.includes(reason as never)) {
    return { ok: false, error: "Choose a valid role-change reason." };
  }

  return {
    ok: true,
    value: {
      role: record.role,
      expectedRole:
        expectedRole === undefined
          ? null
          : (expectedRole as AdminUserRoleMutationPayload["expectedRole"]),
      reason: reason as AdminUserRoleMutationPayload["reason"],
    },
  };
}

function mapMutationError(error: { message?: string; code?: string } | null) {
  const message = error?.message ?? "";
  if (message.includes("last_admin_role_change_blocked")) {
    return {
      status: 409,
      body: {
        ok: false,
        code: "last_admin",
        error: "Role change blocked because this appears to be the last admin.",
      } satisfies AdminUserRoleMutationApiResponse,
    };
  }

  if (message.includes("target_email_required")) {
    return {
      status: 409,
      body: {
        ok: false,
        code: "email_required",
        error: "This auth user has no email, so a profile-backed role cannot be changed yet.",
      } satisfies AdminUserRoleMutationApiResponse,
    };
  }

  return {
    status: 500,
    body: {
      ok: false,
      code: "audit_or_update_failed",
      error: "Could not update user role right now.",
    } satisfies AdminUserRoleMutationApiResponse,
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const userId = await resolveUserId(context);
  if (!isUuid(userId)) {
    return noStoreJson(
      { ok: false, code: "invalid_payload", error: "Invalid user id." },
      { status: 400 }
    );
  }

  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const gate = await requireAdminRoleFromSupabase(supabase, {
    allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
    minimumRole: "admin",
  });

  if (!gate.ok) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: gate.status === 403 ? "forbidden" : "unauthorized",
          error: gate.error,
        },
        { status: gate.status }
      )
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, code: "invalid_payload", error: "Unsupported content type." },
        { status: 415 }
      )
    );
  }

  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, code: "invalid_payload", error: "Invalid JSON." }, { status: 400 })
    );
  }

  const parsed = parseRoleMutationPayload(payload);
  if (!parsed.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, code: "invalid_payload", error: parsed.error }, { status: 400 })
    );
  }

  let adminSupabase: ReturnType<typeof createAdminSupabaseClient>;
  try {
    adminSupabase = createAdminSupabaseClient();
  } catch (error) {
    console.error("[AdminUsersRole] Service-role client unavailable", error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, code: "audit_or_update_failed", error: "Could not update role right now." },
        { status: 500 }
      )
    );
  }

  const authResult = await adminSupabase.auth.admin.getUserById(userId);
  if (authResult.error || !authResult.data.user) {
    const status = authResult.error ? (authResult.error.status === 404 ? 404 : 500) : 404;
    return applySupabaseCookies(
      noStoreJson(
        status === 404
          ? { ok: false, code: "not_found", error: "Auth user was not found." }
          : {
              ok: false,
              code: "audit_or_update_failed",
              error: "Could not validate target auth user right now.",
            },
        { status }
      )
    );
  }

  const profileResult = await adminSupabase
    .from("profiles")
    .select("id, email, role, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (profileResult.error && !isAdminUsersSchemaMissing(profileResult.error)) {
    console.error("[AdminUsersRole] Could not load target profile", {
      message: profileResult.error.message,
    });
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: "audit_or_update_failed",
          error: "Could not validate current role right now.",
        },
        { status: 500 }
      )
    );
  }

  if (profileResult.error && isAdminUsersSchemaMissing(profileResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: "audit_or_update_failed",
          error: getAdminSchemaSetupMessage("users"),
        },
        { status: 503 }
      )
    );
  }

  const profile = profileResult.data as AdminUserProfileSourceRow | null;
  const currentRole =
    resolveAdminRoleForUser(authResult.data.user, {
      profileRole: profile?.role,
      allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
    }) ?? "unknown";

  if (parsed.value.expectedRole !== null && parsed.value.expectedRole !== currentRole) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: "role_conflict",
          error: "Role changed since this panel loaded. Refresh and try again.",
        },
        { status: 409 }
      )
    );
  }

  const targetEmail = authResult.data.user.email?.trim().toLowerCase() ?? "";
  if (!targetEmail) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: "email_required",
          error: "This auth user has no email, so a profile-backed role cannot be changed yet.",
        },
        { status: 409 }
      )
    );
  }

  const roleSource = resolveAdminUserRoleSource(
    authResult.data.user,
    profile?.role,
    process.env.ADMIN_EMAIL_ALLOWLIST
  );

  const mutationResult = await adminSupabase.rpc("admin_set_user_role", {
    p_target_user_id: userId,
    p_target_email: targetEmail,
    p_next_role: parsed.value.role,
    p_actor_user_id: gate.user.id,
    p_actor_email: gate.user.email ?? "",
    p_reason: parsed.value.reason,
    p_before: {
      role: currentRole,
      roleSource,
      profileEmail: profile?.email ?? null,
      profileUpdatedAt: profile?.updated_at ?? null,
    },
    p_after: {
      role: parsed.value.role,
      roleSource: "profile",
      profileEmail: targetEmail,
    },
  });

  if (mutationResult.error) {
    console.error("[AdminUsersRole] Could not update role", {
      message: mutationResult.error.message,
    });
    const mapped = mapMutationError(mutationResult.error);
    return applySupabaseCookies(noStoreJson(mapped.body, { status: mapped.status }));
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      userId,
      role: parsed.value.role,
      auditLogged: true,
    })
  );
}
