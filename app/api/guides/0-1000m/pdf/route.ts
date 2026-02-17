import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { attachGuestEntitlementsByEmail } from "@/lib/commerce/entitlements";
import {
  getGuide0To1000PdfAssetPath,
  GUIDE_0_TO_1000M_PDF_DOWNLOAD_FILENAME,
  GUIDE_0_TO_1000M_PRODUCT_ID,
} from "@/lib/guides/guide-0-1000m";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonNoStore({ ok: false, error: "Unauthorized." }, 401);
  }

  if (user.email) {
    try {
      const adminSupabase = createAdminSupabaseClient();
      await attachGuestEntitlementsByEmail(adminSupabase, user.id, user.email);
    } catch (error) {
      console.error("[GuidePdfApi] Could not attach guest entitlements", error);
    }
  }

  const { data: entitlement, error: entitlementError } = await supabase
    .from("entitlements")
    .select("id")
    .eq("product_id", GUIDE_0_TO_1000M_PRODUCT_ID)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (entitlementError) {
    console.error("[GuidePdfApi] Could not load entitlement", entitlementError);
    return jsonNoStore({ ok: false, error: "Could not verify access." }, 500);
  }

  if (!entitlement) {
    return jsonNoStore({ ok: false, error: "Guide access required." }, 403);
  }

  const relativePath = getGuide0To1000PdfAssetPath();
  const absolutePath = path.join(process.cwd(), relativePath);

  try {
    const pdfBuffer = await readFile(absolutePath);
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${GUIDE_0_TO_1000M_PDF_DOWNLOAD_FILENAME}"`,
        "Content-Length": String(pdfBuffer.byteLength),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[GuidePdfApi] Could not load PDF asset", { relativePath, error });
    return jsonNoStore(
      { ok: false, error: "PDF is temporarily unavailable. Please try again shortly." },
      503
    );
  }
}
