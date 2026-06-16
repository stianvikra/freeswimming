import { NextResponse, type NextRequest } from "next/server";
import { getSafeNextPath } from "@/lib/auth/next-path";
import {
  COURSE_DEFAULT_LOCALE,
  buildCourseLessonRoute,
  buildCourseOverviewPath,
} from "@/lib/course/canonical-routes";
import { getSiteLockConfig } from "@/lib/site-lock/config";
import {
  isSiteLockBypassTokenValid,
  isSiteLockPathBypassed,
  isSiteLockSessionTokenValid,
} from "@/lib/site-lock/session";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { COURSE_MODULES } from "@/app/course/courseData";

export async function proxy(request: NextRequest) {
  let config;
  try {
    config = getSiteLockConfig();
  } catch (error) {
    console.error("[SiteLock] Invalid configuration", error);
    return buildMisconfiguredResponse(request);
  }

  if (!config.enabled || isSiteLockPathBypassed(request.nextUrl.pathname)) {
    return buildUnlockedResponse(request);
  }

  if (
    isSiteLockBypassTokenValid(request.headers.get("x-site-lock-bypass-token"), config.bypassToken)
  ) {
    return buildUnlockedResponse(request);
  }

  const siteLockCookie = request.cookies.get(config.cookieName)?.value;
  if (
    await isSiteLockSessionTokenValid({
      token: siteLockCookie,
      secret: config.bypassToken,
      maxAgeSeconds: config.sessionMaxAgeSeconds,
    })
  ) {
    return buildUnlockedResponse(request);
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return buildLockedApiResponse();
  }

  return buildLockedRedirectResponse(request);
}

async function buildUnlockedResponse(request: NextRequest) {
  const courseRedirectResponse = buildCourseLegacyRedirectResponse(request);
  if (courseRedirectResponse) {
    return courseRedirectResponse;
  }

  return withCoursePreviewHeadersIfNeeded(await updateSupabaseSession(request), request);
}

function withNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

function isCoursePreviewRequest(request: NextRequest): boolean {
  return (
    request.nextUrl.pathname === "/course" && request.nextUrl.searchParams.get("preview") === "1"
  );
}

function buildCourseLegacyRedirectResponse(request: NextRequest): NextResponse | null {
  if (request.nextUrl.pathname !== "/course") return null;
  if (request.nextUrl.searchParams.get("preview") === "1") return null;

  const lessonParam = request.nextUrl.searchParams.get("lesson")?.trim();
  if (!lessonParam) return null;

  const destination = request.nextUrl.clone();
  const canonicalRoute = buildCourseLessonRoute(COURSE_MODULES, lessonParam, COURSE_DEFAULT_LOCALE);

  destination.pathname = canonicalRoute?.path ?? buildCourseOverviewPath(COURSE_DEFAULT_LOCALE);
  destination.search = "";

  return NextResponse.redirect(destination, 308);
}

function withCoursePreviewHeadersIfNeeded(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  if (!isCoursePreviewRequest(request)) {
    return response;
  }

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

function buildLockedApiResponse() {
  return withNoStoreHeaders(
    NextResponse.json(
      {
        ok: false,
        error: "This site is temporarily private while we are preparing launch.",
      },
      { status: 423 }
    )
  );
}

function buildLockedRedirectResponse(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/preview-access";
  redirectUrl.search = "";
  redirectUrl.searchParams.set(
    "next",
    getSafeNextPath(`${request.nextUrl.pathname}${request.nextUrl.search}`, "/")
  );

  return withNoStoreHeaders(NextResponse.redirect(redirectUrl, 307));
}

function buildMisconfiguredResponse(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return withNoStoreHeaders(
      NextResponse.json(
        {
          ok: false,
          error: "Site lock is misconfigured.",
        },
        { status: 503 }
      )
    );
  }

  return withNoStoreHeaders(
    new NextResponse("Site lock is misconfigured. Please contact the site owner.", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
