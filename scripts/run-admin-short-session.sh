#!/usr/bin/env bash

set -euo pipefail

if [[ -f ".env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source ".env.local"
  set +a
fi

export PW_PORT="${PW_PORT:-3100}"
export NEXT_DIST_DIR="${NEXT_DIST_DIR:-.next-playwright}"
export SITE_LOCK_ENABLED="${SITE_LOCK_ENABLED_FOR_SHORT_SESSION:-0}"
export DEV_AUTH_BYPASS_ENABLED="${DEV_AUTH_BYPASS_ENABLED:-1}"

if [[ -n "${DEV_AUTH_BYPASS_EMAIL:-}" && -z "${ADMIN_EMAIL_ALLOWLIST:-}" ]]; then
  export ADMIN_EMAIL_ALLOWLIST="${DEV_AUTH_BYPASS_EMAIL}"
fi

if [[ -z "${DEV_AUTH_BYPASS_EMAIL:-}" || -z "${DEV_AUTH_BYPASS_PASSWORD:-}" ]]; then
  echo "[admin-short-session] DEV_AUTH_BYPASS_EMAIL/DEV_AUTH_BYPASS_PASSWORD missing; authenticated write-path checks may skip."
fi

if [[ -z "${DEV_AUTH_BYPASS_TOKEN:-}" ]]; then
  echo "[admin-short-session] DEV_AUTH_BYPASS_TOKEN missing; /api/dev-login checks are unavailable."
fi

if [[ -z "${ADMIN_EMAIL_ALLOWLIST:-}" ]]; then
  echo "[admin-short-session] ADMIN_EMAIL_ALLOWLIST not set; allowlist-dependent checks may skip."
fi

echo "[admin-short-session] Running desktop short admin session with local defaults."

REPORT_DIR="${ADMIN_SHORT_SESSION_REPORT_DIR:-artifacts/test-runs/admin-short-session}"
REPORT_PATH="${REPORT_DIR}/playwright-report.json"
mkdir -p "${REPORT_DIR}"
export PLAYWRIGHT_JSON_OUTPUT_NAME="${REPORT_PATH}"

set +e
npx playwright test tests/e2e/admin-content-api-guards.spec.ts tests/e2e/admin-foundation.spec.ts --project=desktop-chromium --reporter=line,json
TEST_EXIT_CODE=$?
set -e

if [[ -f "${REPORT_PATH}" ]]; then
  node ./scripts/summarize-admin-short-session.mjs "${REPORT_PATH}" || true
else
  echo "[admin-short-session] Warning: JSON report not found at ${REPORT_PATH}; skip summary unavailable."
fi

exit "${TEST_EXIT_CODE}"
