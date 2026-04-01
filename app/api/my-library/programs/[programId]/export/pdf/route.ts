import { NextResponse } from "next/server";
import { BRAND_FONT_PUBLIC_PATH, BRAND_PDF_LOGO_PATH } from "@/lib/brand";
import { buildProgramPdfHtmlDocument } from "@/lib/programs/export";
import { loadProgramExportSnapshot } from "@/lib/programs/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{
    programId: string;
  }>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function noStoreHtml(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function noStoreText(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function GET(request: Request, context: RouteContext) {
  const requestUrl = new URL(request.url);
  const { programId } = await context.params;
  if (!UUID_PATTERN.test(programId)) {
    return noStoreText("Invalid program id.", 400);
  }

  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(noStoreText("Unauthorized.", 401));
  }

  const snapshot = await loadProgramExportSnapshot(supabase, user.id, programId);
  if (!snapshot.ok) {
    return applySupabaseCookies(noStoreText(snapshot.error, snapshot.status));
  }

  return applySupabaseCookies(
    noStoreHtml(
      buildProgramPdfHtmlDocument(snapshot.value.program, snapshot.value.workoutsById, {
        logoUrl: new URL(BRAND_PDF_LOGO_PATH, requestUrl).toString(),
        fontUrl: new URL(BRAND_FONT_PUBLIC_PATH, requestUrl).toString(),
      })
    )
  );
}
