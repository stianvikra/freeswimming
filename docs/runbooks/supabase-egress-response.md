# Supabase Egress Response Runbook

## Purpose

Diagnose and contain Supabase egress spikes before they cause plan restrictions or `402` responses.

## Immediate Triage

1. Open Supabase Dashboard -> project -> `Usage` -> `Egress`.
2. Confirm whether the spike is uncached egress, cached egress, Storage, Database/Auth/API, Edge Functions, or Realtime.
3. If production availability is at risk or Supabase has shortened the grace period, upgrade temporarily before deeper diagnosis.
4. Do not paste raw tokens, cookies, emails, user IDs, IP addresses, or full request headers into briefs, PRs, or support notes.

## Logs Explorer Queries

Use a 24-hour window first, then narrow to the highest hour.

Top request paths:

```sql
select
  request.path as path,
  request.method as method,
  response.status_code as status_code,
  count(*) as requests
from edge_logs
cross join unnest(metadata) as metadata
cross join unnest(metadata.request) as request
cross join unnest(metadata.response) as response
where timestamp >= timestamp(@iso_timestamp_start)
  and timestamp <= timestamp(@iso_timestamp_end)
group by path, method, status_code
order by requests desc
limit 25;
```

Top source classes:

```sql
select
  coalesce(headers.user_agent, headers.x_forwarded_user_agent, 'unknown') as user_agent,
  coalesce(headers.cf_ipcountry, 'unknown') as country,
  request.path as path,
  count(*) as requests
from edge_logs
cross join unnest(metadata) as metadata
cross join unnest(metadata.request) as request
cross join unnest(request.headers) as headers
where timestamp >= timestamp(@iso_timestamp_start)
  and timestamp <= timestamp(@iso_timestamp_end)
group by user_agent, country, path
order by requests desc
limit 40;
```

Hourly local Node pattern:

```sql
select
  datetime(timestamp_trunc(timestamp, hour)) as hour,
  request.path as path,
  count(*) as requests
from edge_logs
cross join unnest(metadata) as metadata
cross join unnest(metadata.request) as request
cross join unnest(request.headers) as headers
where timestamp >= timestamp(@iso_timestamp_start)
  and timestamp <= timestamp(@iso_timestamp_end)
  and coalesce(headers.user_agent, headers.x_forwarded_user_agent, 'unknown') = 'node'
group by hour, path
order by hour desc, requests desc
limit 120;
```

## Interpreting Drivers

- High `Storage` egress with large stored objects: inspect buckets and signed/public URLs.
- High `/auth/v1/user`: look for repeated `auth.getUser()` from SSR, middleware, browser chrome, tests, or local automation.
- High `/rest/v1/...`: identify which pages or API routes load those tables and whether calls are public, private, cached, or no-store.
- User-agent `node` from a local country/IP usually means local Next.js, Playwright, scripts, or test automation.
- Browser user-agents spread across countries usually indicate real users or crawlers.

## Containment

- Normal local/verify runs should use example/local/isolated Supabase settings.
- Local commands with production Supabase require `FS_ALLOW_PROD_SUPABASE=1` for that single command.
- Keep `FS_ALLOW_PROD_SUPABASE=0` in `.env.local` and CI by default.
- Set `FS_PRODUCTION_SUPABASE_URL` in local, CI, and preview config so guardrails can block exact production-origin matches even when `FS_SUPABASE_ENV=ci` or `preview`.
- If `.env.local` points at production Supabase, `npm run dev`, `npm run build`, and `npm run start` should fail before starting unless explicitly opted in.
- For intentional production smoke checks, keep the run short, record the reason, and unset the opt-in immediately afterwards.

## Finance And Escalation Thresholds

| Level                | Trigger                                                                                                | Action                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Watch                | Egress reaches `50%` of plan quota before mid-cycle, or `/auth/v1/user` rises above expected baseline. | Run Logs Explorer queries and record top sources.                                   |
| Contain              | Egress reaches `80%` of plan quota, or local `node` traffic is a top source.                           | Stop local/CI production traffic, verify guardrails, and rerun logs after one hour. |
| Protect availability | Supabase warning/grace-period reduction, or production could return `402`.                             | Upgrade temporarily or reduce traffic immediately, then complete root-cause fix.    |

Owner: operations owner for the week.

Record before/after evidence in the active task brief or PR summary using redacted counts and route names only.

## Runtime After-Metrics Capture

Use this after a containment or runtime-cache PR has been deployed long enough for Supabase logs to
refresh. Record summarized counts only; do not copy raw rows, headers, IPs, user identifiers,
emails, cookies, or tokens.

| Metric window | `/auth/v1/user` requests | Top PostgREST paths | Source classes | Decision                                           |
| ------------- | ------------------------ | ------------------- | -------------- | -------------------------------------------------- |
| Before        | `<redacted count>`       | `<path + count>`    | `<class>`      | baseline                                           |
| After         | `<redacted count>`       | `<path + count>`    | `<class>`      | hold, optimize further, temporary Pro, or rollback |

Minimum after-metrics:

- `/auth/v1/user` total and highest source class.
- Top `5` `/rest/v1/...` paths and whether each is public, protected, admin, entitlement, or user-specific.
- Whether browser anonymous traffic still creates auth calls.
- Whether local/CI `node` traffic is absent from production logs unless an intentional smoke run was approved.
- Finance decision: hold, optimize further, temporary Pro, or rollback.

## 402 Checklist

If users report failures after egress restriction:

1. Confirm Supabase project status and current plan.
2. Check whether API/Auth/Storage calls return `402`.
3. Upgrade or restore quota if production availability is impacted.
4. Disable the suspected local/automation source.
5. Rerun top path/source queries after Supabase metrics refresh.
6. Add a high-cost debug log entry if the same pattern can recur.
