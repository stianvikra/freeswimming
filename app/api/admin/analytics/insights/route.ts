import { NextResponse } from "next/server";
import {
  ANALYTICS_INSIGHTS_ROW_CAP,
  buildAnalyticsInsights,
  getAnalyticsSchemaSetupMessage,
  isAnalyticsEventsSchemaMissing,
  parseAnalyticsInsightsRangeDays,
  selectAnalyticsInsightFields,
  type AnalyticsEventInsightRow,
} from "@/lib/analytics/admin-insights";
import {
  isAnalyticsRollupSchemaMissing,
  selectAnalyticsLifecycleRollupFields,
  type AnalyticsDailyRollupStatusRow,
} from "@/lib/analytics/lifecycle";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

export async function GET(request: Request) {
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

  const requestUrl = new URL(request.url);
  const rangeDays = parseAnalyticsInsightsRangeDays(requestUrl.searchParams.get("rangeDays"));
  const generatedAt = new Date();
  const sinceDate = new Date(generatedAt.getTime() - rangeDays * 24 * 60 * 60 * 1000);
  const since = sinceDate.toISOString();
  const sinceDay = since.slice(0, 10);

  const result = await supabase
    .from("analytics_events")
    .select(selectAnalyticsInsightFields())
    .gte("occurred_at", since)
    .order("occurred_at", { ascending: false })
    .limit(ANALYTICS_INSIGHTS_ROW_CAP + 1);

  if (result.error) {
    if (isAnalyticsEventsSchemaMissing(result.error)) {
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          schemaReady: false,
          warning: getAnalyticsSchemaSetupMessage(),
          generatedAt: generatedAt.toISOString(),
          rangeDays,
          items: [],
        })
      );
    }

    console.error("[AdminAnalyticsInsights] Could not load analytics insights", result.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not load analytics insights right now." },
        { status: 500 }
      )
    );
  }

  const rows = ((result.data ?? []) as unknown as AnalyticsEventInsightRow[]).slice(
    0,
    ANALYTICS_INSIGHTS_ROW_CAP
  );
  const rollupResult = await supabase
    .from("analytics_event_daily_rollups")
    .select(selectAnalyticsLifecycleRollupFields())
    .gte("rollup_day", sinceDay)
    .order("rollup_day", { ascending: false })
    .limit(rangeDays + 7);

  let rollupRows: AnalyticsDailyRollupStatusRow[] = [];
  let rollupSchemaReady = true;
  let rollupQueryOk = true;

  if (rollupResult.error) {
    if (isAnalyticsRollupSchemaMissing(rollupResult.error)) {
      rollupSchemaReady = false;
    } else {
      rollupQueryOk = false;
      console.error("[AdminAnalyticsInsights] Could not load analytics rollup status", {
        message: rollupResult.error.message,
      });
    }
  } else {
    rollupRows = (rollupResult.data ?? []) as unknown as AnalyticsDailyRollupStatusRow[];
  }

  return applySupabaseCookies(
    noStoreJson(
      buildAnalyticsInsights({
        rows,
        generatedAt,
        rangeDays,
        rollupRows,
        rollupSchemaReady,
        rollupQueryOk,
        rowCap: ANALYTICS_INSIGHTS_ROW_CAP,
        capped: (result.data ?? []).length > ANALYTICS_INSIGHTS_ROW_CAP,
      })
    )
  );
}
