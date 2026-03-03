import { NextResponse } from "next/server";
import { COURSE_MODULES } from "@/app/course/courseData";
import { loadCourseModulesByStatus } from "@/lib/admin/content-course";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import {
  resolveCourseContentStatusesForPreviewMode,
  resolveCoursePreviewRequest,
} from "@/lib/course/preview";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

function noStoreJson(
  body: Record<string, unknown>,
  init?: {
    status?: number;
    noindex?: boolean;
  }
) {
  const headers: HeadersInit = {
    "Cache-Control": "no-store",
  };
  if (init?.noindex) {
    headers["X-Robots-Tag"] = "noindex, nofollow, noarchive";
  }

  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers,
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const previewResolution = resolveCoursePreviewRequest({
    previewParam: requestUrl.searchParams.get("preview"),
    previewModeParam: requestUrl.searchParams.get("previewMode"),
  });

  if (!previewResolution.ok) {
    return noStoreJson(
      {
        ok: false,
        error: previewResolution.error,
      },
      { status: 400 }
    );
  }

  try {
    if (previewResolution.enabled) {
      const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
      const gate = await requireAdminRoleFromSupabase(supabase, {
        allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
        minimumRole: "viewer",
      });

      if (!gate.ok) {
        return applySupabaseCookies(
          noStoreJson(
            {
              ok: false,
              error: gate.error,
            },
            { status: gate.status, noindex: true }
          )
        );
      }

      const previewStatuses = resolveCourseContentStatusesForPreviewMode(previewResolution.mode);
      const modules = await loadCourseModulesByStatus({
        statuses: previewStatuses,
        fallback: [],
        autoSeedWhenEmpty: false,
      });

      return applySupabaseCookies(
        noStoreJson(
          {
            ok: true,
            modules,
            preview: {
              enabled: true,
              mode: previewResolution.mode,
              statuses: previewStatuses,
            },
          },
          { noindex: true }
        )
      );
    }

    const modules = await loadCourseModulesByStatus({
      statuses: ["published"],
      fallback: COURSE_MODULES,
      autoSeedWhenEmpty: true,
    });
    return noStoreJson({
      ok: true,
      modules: modules.length > 0 ? modules : COURSE_MODULES,
      preview: {
        enabled: false,
        mode: "published",
      },
    });
  } catch (error) {
    console.error("[CourseContent] Could not load course modules", error);

    if (previewResolution.enabled) {
      return noStoreJson(
        {
          ok: false,
          error: "Could not load preview content.",
        },
        { status: 500, noindex: true }
      );
    }

    return noStoreJson({
      ok: true,
      modules: COURSE_MODULES,
      preview: {
        enabled: false,
        mode: "published",
      },
    });
  }
}
