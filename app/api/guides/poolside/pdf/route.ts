import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { attachGuestEntitlementsByEmail } from "@/lib/commerce/entitlements";
import {
  getGuidePoolsidePdfAssetPath,
  GUIDE_POOLSIDE_PDF_DOWNLOAD_FILENAME,
  GUIDE_POOLSIDE_PRODUCT_ID,
} from "@/lib/guides/guide-poolside";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

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

export async function GET() {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    return jsonNoStore({ ok: false, error: "Unauthorized." }, 401);
  }

  if (user.email) {
    try {
      const adminSupabase = createAdminSupabaseClient();
      await attachGuestEntitlementsByEmail(adminSupabase, user.id, user.email);
    } catch (error) {
      console.error("[GuidePoolsidePdfApi] Could not attach guest entitlements", error);
    }
  }

  const { data: entitlement, error: entitlementError } = await supabase
    .from("entitlements")
    .select("id")
    .eq("product_id", GUIDE_POOLSIDE_PRODUCT_ID)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (entitlementError) {
    console.error("[GuidePoolsidePdfApi] Could not load entitlement", entitlementError);
    return jsonNoStore({ ok: false, error: "Could not verify access." }, 500);
  }

  if (!entitlement) {
    return jsonNoStore({ ok: false, error: "Guide access required." }, 403);
  }

  const relativePath = getGuidePoolsidePdfAssetPath();
  const absolutePath = path.join(/* turbopackIgnore: true */ process.cwd(), relativePath);

  try {
    const pdfBuffer = await readFile(absolutePath);
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${GUIDE_POOLSIDE_PDF_DOWNLOAD_FILENAME}"`,
        "Content-Length": String(pdfBuffer.byteLength),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[GuidePoolsidePdfApi] Could not load PDF asset", { relativePath, error });
    return jsonNoStore(
      { ok: false, error: "PDF is temporarily unavailable. Please try again shortly." },
      503
    );
  }
}
