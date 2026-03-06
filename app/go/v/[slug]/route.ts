import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import {
  resolveQrRedirectAllowedHosts,
  validateQrRedirectDestination,
} from "@/lib/qr-links/redirect-policy";
import { isQrRedirectSchemaMissing } from "@/lib/qr-links/schema";
import { parseQrSlug } from "@/lib/qr-links/slug";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

type FallbackReason =
  | "invalid_slug"
  | "not_found"
  | "schema_not_ready"
  | "lookup_failed"
  | "invalid_url"
  | "invalid_protocol"
  | "credentials_not_allowed"
  | "disallowed_host";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function redirectNoStore(url: URL, status: 302 | 307) {
  return NextResponse.redirect(url, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

function buildFallbackUrl(
  requestUrl: URL,
  options: {
    slug: string | null;
    reason: FallbackReason;
  }
): URL {
  const fallbackUrl = new URL("/go/unavailable", requestUrl.origin);
  fallbackUrl.searchParams.set("reason", options.reason);

  if (options.slug) {
    fallbackUrl.searchParams.set("slug", options.slug);
    fallbackUrl.searchParams.set("retry", `/go/v/${options.slug}`);
  }

  return fallbackUrl;
}

function trackQrRedirectHit(input: {
  slug: string | null;
  outcome: "success" | "fallback";
  reason?: FallbackReason;
  destinationHost?: string;
}) {
  trackAnalyticsEvent({
    eventName: "qr_redirect_hit",
    channel: "server",
    userId: null,
    payload: {
      slug: input.slug ?? "unknown",
      outcome: input.outcome,
      reason: input.reason ?? "",
      destinationHost: input.destinationHost ?? "",
    },
  });
}

export async function GET(request: Request, context: RouteContext) {
  const requestUrl = new URL(request.url);
  const params = await context.params;
  const slug = parseQrSlug(params.slug);

  if (!slug) {
    trackQrRedirectHit({
      slug: null,
      outcome: "fallback",
      reason: "invalid_slug",
    });

    return redirectNoStore(
      buildFallbackUrl(requestUrl, {
        slug: null,
        reason: "invalid_slug",
      }),
      302
    );
  }

  const supabase = await createServerSupabaseClient();
  const linkResult = await supabase
    .from("qr_redirect_links")
    .select("slug, destination_url")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (linkResult.error) {
    const schemaNotReady = isQrRedirectSchemaMissing(linkResult.error);
    if (!schemaNotReady) {
      console.error("[QrRedirect] Could not resolve QR link", linkResult.error);
    }

    const reason: FallbackReason = schemaNotReady ? "schema_not_ready" : "lookup_failed";
    trackQrRedirectHit({
      slug,
      outcome: "fallback",
      reason,
    });

    return redirectNoStore(
      buildFallbackUrl(requestUrl, {
        slug,
        reason,
      }),
      302
    );
  }

  if (!linkResult.data) {
    trackQrRedirectHit({
      slug,
      outcome: "fallback",
      reason: "not_found",
    });

    return redirectNoStore(
      buildFallbackUrl(requestUrl, {
        slug,
        reason: "not_found",
      }),
      302
    );
  }

  const allowedHosts = resolveQrRedirectAllowedHosts({
    rawAllowlist: process.env.QR_REDIRECT_ALLOWED_HOSTS,
    requestHostname: requestUrl.hostname,
  });

  const destinationValidation = validateQrRedirectDestination(linkResult.data.destination_url, {
    allowedHosts,
  });

  if (!destinationValidation.ok) {
    console.error("[QrRedirect] Blocked unsafe destination URL", {
      slug,
      reason: destinationValidation.reason,
    });

    trackQrRedirectHit({
      slug,
      outcome: "fallback",
      reason: destinationValidation.reason,
    });

    return redirectNoStore(
      buildFallbackUrl(requestUrl, {
        slug,
        reason: destinationValidation.reason,
      }),
      302
    );
  }

  trackQrRedirectHit({
    slug,
    outcome: "success",
    destinationHost: destinationValidation.destinationHost,
  });

  return redirectNoStore(new URL(destinationValidation.destinationUrl), 307);
}
