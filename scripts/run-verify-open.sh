#!/usr/bin/env bash
set -euo pipefail

# Try to load Node via nvm when npm is not already on PATH
if ! command -v npm >/dev/null 2>&1; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "${NVM_DIR}/nvm.sh" ]; then
    # shellcheck source=/dev/null
    . "${NVM_DIR}/nvm.sh"
    nvm use --silent >/dev/null 2>&1 || true
  fi
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[verify-open] npm not found. Load Node first (for example with nvm)."
  exit 127
fi

write_run_metadata() {
  local verification_lane="${1:-full-public}"
  local exit_status="${2:-1}"
  local source_command="${3:-verify:open}"
  local timestamp_utc
  local head_sha
  local short_sha

  timestamp_utc="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  head_sha="$(git rev-parse HEAD 2>/dev/null || printf '')"
  short_sha="$(git rev-parse --short HEAD 2>/dev/null || printf '')"

  cat > "${run_dir}/meta.json" <<EOF
{
  "status": "$([ "${exit_status}" -eq 0 ] && printf 'PASS' || printf 'FAIL')",
  "timestampUtc": "${timestamp_utc}",
  "headSha": "${head_sha}",
  "shortSha": "${short_sha}",
  "verificationLane": "${verification_lane}",
  "exitCode": ${exit_status},
  "sourceCommand": "${source_command}",
  "runDir": "${run_dir}"
}
EOF
}

timestamp="$(date +"%Y%m%d-%H%M%S")"
runs_root="artifacts/test-runs"
run_dir="${runs_root}/${timestamp}"
log_file="${run_dir}/verify.log"

mkdir -p "${run_dir}"
printf "%s\n" "full-public" > "${run_dir}/mode.txt"

echo "[verify-open] Running with SITE_LOCK_ENABLED=0"
echo "[verify-open] Output log: ${log_file}"

status=0
if SITE_LOCK_ENABLED=0 npm run verify 2>&1 | tee "${log_file}"; then
  status=0
else
  status=$?
fi

if [ -d "test-results" ]; then
  cp -R "test-results" "${run_dir}/test-results"
fi

if [ -d "playwright-report" ]; then
  cp -R "playwright-report" "${run_dir}/playwright-report"
fi

printf "%s\n" "${status}" > "${run_dir}/exit-code.txt"
write_run_metadata "full-public" "${status}" "verify:open"

ln -sfn "${timestamp}" "${runs_root}/latest"

if [ "${status}" -eq 0 ]; then
  echo "[verify-open] PASS"
else
  echo "[verify-open] FAIL (exit ${status})"
fi

exit "${status}"
