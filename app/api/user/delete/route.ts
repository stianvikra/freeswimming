import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseUserDeleteRequestBody } from "@/lib/user/delete";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonNoStore({ ok: false, error: "Unauthorized." }, 401);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return jsonNoStore({ ok: false, error: "Unsupported content type." }, 415);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ ok: false, error: "Invalid JSON." }, 400);
  }

  const parsedBody = parseUserDeleteRequestBody(body);
  if (!parsedBody.ok) {
    return jsonNoStore({ ok: false, error: parsedBody.error }, parsedBody.status);
  }

  const adminSupabase = createAdminSupabaseClient();
  const { error } = await adminSupabase.auth.admin.deleteUser(user.id, false);
  if (error) {
    console.error("[UserDeleteApi] Could not delete user", {
      userId: user.id,
      message: error.message,
      status: error.status,
    });
    return jsonNoStore({ ok: false, error: "Could not delete user data." }, 500);
  }

  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    console.error("[UserDeleteApi] User deleted but sign-out clear failed", {
      userId: user.id,
      message: signOutError.message,
      status: signOutError.status,
    });
  }

  return jsonNoStore({
    ok: true,
    message: "Your account and app data have been deleted.",
  });
}
