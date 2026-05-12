#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=/dev/null
source "$(dirname "$0")/lib/bootstrap-node.sh"

read_reuse_decision_field() {
  local decision_output="${1:-}"
  local field_name="${2:-}"
  printf '%s\n' "${decision_output}" | grep -E "^${field_name}=" | head -n1 | cut -d= -f2- || true
}

read_env_file_value() {
  local key="$1"
  local file="$2"
  local raw

  [ -f "$file" ] || return 1

  raw="$(grep -E "^${key}=" "$file" | tail -n1 | cut -d= -f2- || true)"
  [ -n "$raw" ] || return 1

  # Trim matching single/double quotes if present.
  if [[ "$raw" =~ ^\".*\"$ ]]; then
    raw="${raw:1:${#raw}-2}"
  elif [[ "$raw" =~ ^\'.*\'$ ]]; then
    raw="${raw:1:${#raw}-2}"
  fi

  printf '%s' "$raw"
}

record_pre_merge_pass() {
  local verification_lane="${1:-full}"
  local private_gate_mode_override="${2:-}"
  local verification_source="${3:-fresh-run}"
  local verify_run_dir="${4:-}"
  local runs_root="artifacts/verify-pre-merge"
  local timestamp_utc
  local iso_utc
  local head_sha
  local short_sha
  local private_gate_mode="skipped"
  local marker_file

  timestamp_utc="$(date -u +"%Y%m%d-%H%M%S")"
  iso_utc="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  head_sha="$(git rev-parse HEAD 2>/dev/null || printf '')"
  short_sha="$(git rev-parse --short HEAD 2>/dev/null || printf '')"

  if [ -n "${private_gate_mode_override}" ]; then
    private_gate_mode="${private_gate_mode_override}"
  elif [ "${verification_lane}" = "docs-only" ]; then
    private_gate_mode="skipped-docs-only"
  elif [ "${SITE_LOCK_ENABLED:-0}" = "1" ]; then
    if [ "${PW_SITE_LOCK_USE_PASSWORD:-0}" = "1" ] && [ -n "${PW_SITE_LOCK_PASSWORD:-}" ]; then
      private_gate_mode="password"
    elif [ -n "${PW_SITE_LOCK_BYPASS_TOKEN:-}" ]; then
      private_gate_mode="bypass-token"
    else
      private_gate_mode="unknown"
    fi
  fi

  mkdir -p "${runs_root}"
  marker_file="${runs_root}/${timestamp_utc}.json"

  cat > "${marker_file}" <<EOF
{
  "status": "PASS",
  "timestampUtc": "${iso_utc}",
  "headSha": "${head_sha}",
  "shortSha": "${short_sha}",
  "verificationLane": "${verification_lane}",
  "siteLockEnabled": "${SITE_LOCK_ENABLED:-0}",
  "privateGateMode": "${private_gate_mode}",
  "verificationSource": "${verification_source}",
  "verifyRunDir": "${verify_run_dir}"
}
EOF

  ln -sfn "$(basename "${marker_file}")" "${runs_root}/latest.json"
  echo "[verify-pre-merge] Recorded PASS marker: ${marker_file}"
}

require_npm_runtime "[verify-pre-merge]"

bash ./scripts/lib/assert-branch-current-with-base.sh "${VERIFICATION_BASE_REF:-main}"
node ./scripts/assert-supabase-migration-drift.mjs

node ./scripts/verification-scope.mjs --summary
verification_lane="$(node ./scripts/verification-scope.mjs --lane)"
head_sha="$(git rev-parse HEAD 2>/dev/null || printf '')"
verify_step_source="fresh-run"
verify_step_run_dir=""

if [ "${verification_lane}" = "docs-only" ]; then
  reuse_decision_output="$(node ./scripts/verify-run-metadata.mjs --decision --head "${head_sha}" --lane "docs-only")"
  reuse_decision="$(read_reuse_decision_field "${reuse_decision_output}" "decision")"
  reuse_reason="$(read_reuse_decision_field "${reuse_decision_output}" "reason")"
  reuse_run_dir="$(read_reuse_decision_field "${reuse_decision_output}" "run_dir")"

  if [ "${reuse_decision}" = "reuse" ]; then
    echo "[verify-pre-merge] Step 1/2: Reusing docs-only verification PASS from ${reuse_run_dir:-artifacts/test-runs/latest} (${reuse_reason})"
    verify_step_source="reused-current-head"
    verify_step_run_dir="${reuse_run_dir}"
  else
    echo "[verify-pre-merge] Step 1/2: Docs-only verification (${reuse_reason})"
    npm run verify:docs-only
    verify_step_source="fresh-run"
    verify_step_run_dir="artifacts/test-runs/latest"
  fi

  echo "[verify-pre-merge] Step 2/2: Skipped private-gate regression (docs-only lane)."
  record_pre_merge_pass "docs-only" "skipped-docs-only" "${verify_step_source}" "${verify_step_run_dir}"
  echo "[verify-pre-merge] PASS"
  exit 0
fi

reuse_decision_output="$(node ./scripts/verify-run-metadata.mjs --decision --head "${head_sha}" --lane "full-public")"
reuse_decision="$(read_reuse_decision_field "${reuse_decision_output}" "decision")"
reuse_reason="$(read_reuse_decision_field "${reuse_decision_output}" "reason")"
reuse_run_dir="$(read_reuse_decision_field "${reuse_decision_output}" "run_dir")"

if [ "${reuse_decision}" = "reuse" ]; then
  echo "[verify-pre-merge] Step 1/2: Reusing public verify PASS from ${reuse_run_dir:-artifacts/test-runs/latest} (${reuse_reason})"
  verify_step_source="reused-current-head"
  verify_step_run_dir="${reuse_run_dir}"
else
  echo "[verify-pre-merge] Step 1/2: Public-mode full verification (${reuse_reason})"
  bash ./scripts/run-verify-open.sh
  verify_step_source="fresh-run"
  verify_step_run_dir="artifacts/test-runs/latest"
fi

if [ "${SITE_LOCK_ENABLED:-0}" = "1" ]; then
  # Automation default: wire private-gate bypass token with zero manual setup when available.
  if [ -z "${PW_SITE_LOCK_BYPASS_TOKEN:-}" ]; then
    if [ -n "${SITE_LOCK_BYPASS_TOKEN:-}" ]; then
      export PW_SITE_LOCK_BYPASS_TOKEN="${SITE_LOCK_BYPASS_TOKEN}"
      echo "[verify-pre-merge] Auto-wired PW_SITE_LOCK_BYPASS_TOKEN from SITE_LOCK_BYPASS_TOKEN."
    else
      env_local_token="$(read_env_file_value "SITE_LOCK_BYPASS_TOKEN" ".env.local" || true)"
      if [ -n "${env_local_token:-}" ]; then
        export PW_SITE_LOCK_BYPASS_TOKEN="${env_local_token}"
        echo "[verify-pre-merge] Auto-wired PW_SITE_LOCK_BYPASS_TOKEN from .env.local."
      fi
    fi
  fi

  if [ -z "${PW_SITE_LOCK_PASSWORD:-}" ] && [ -z "${PW_SITE_LOCK_BYPASS_TOKEN:-}" ]; then
    echo "[verify-pre-merge] SITE_LOCK_ENABLED=1 but no private-gate unlock test credential was provided."
    echo "[verify-pre-merge] Export PW_SITE_LOCK_PASSWORD (preferred) or PW_SITE_LOCK_BYPASS_TOKEN and rerun."
    exit 1
  fi

  if [ "${PW_SITE_LOCK_USE_PASSWORD:-0}" = "1" ] && [ -z "${PW_SITE_LOCK_PASSWORD:-}" ]; then
    echo "[verify-pre-merge] PW_SITE_LOCK_USE_PASSWORD=1 requires PW_SITE_LOCK_PASSWORD."
    exit 1
  fi

  if [ -n "${PW_SITE_LOCK_BYPASS_TOKEN:-}" ] && [ "${PW_SITE_LOCK_USE_PASSWORD:-0}" != "1" ]; then
    echo "[verify-pre-merge] Step 2/2 uses bypass-token mode by default (set PW_SITE_LOCK_USE_PASSWORD=1 to force form-unlock path)."
  elif [ -n "${PW_SITE_LOCK_PASSWORD:-}" ]; then
    echo "[verify-pre-merge] Step 2/2 uses password form-unlock mode."
  fi

  echo "[verify-pre-merge] Step 2/2: Private-gate regression"
  SITE_LOCK_ENABLED=1 npm run test:e2e:private-gate
else
  echo "[verify-pre-merge] Step 2/2: Skipped private-gate regression (SITE_LOCK_ENABLED!=1)."
  echo "[verify-pre-merge] If target environment is private-gated, rerun with SITE_LOCK_ENABLED=1 and PW_SITE_LOCK_PASSWORD or PW_SITE_LOCK_BYPASS_TOKEN set."
fi

record_pre_merge_pass "full" "" "${verify_step_source}" "${verify_step_run_dir}"

echo "[verify-pre-merge] PASS"
