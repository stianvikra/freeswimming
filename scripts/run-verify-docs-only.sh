#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=/dev/null
source "$(dirname "$0")/lib/bootstrap-node.sh"

require_npm_runtime "[verify-docs-only]"

write_run_metadata() {
  local verification_lane="${1:-docs-only}"
  local exit_status="${2:-1}"
  local source_command="${3:-verify:docs-only}"
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
printf "%s\n" "docs-only" > "${run_dir}/mode.txt"

echo "[verify-docs-only] Running docs-only verification lane"
echo "[verify-docs-only] Output log: ${log_file}"

status=0
if {
  node ./scripts/verification-scope.mjs --summary --assert-docs-only
  npm run lint:briefs:all
  npm run lint:admin-audit
  npm run lint:env-parity
  npm run lint:pr-body:generated
} 2>&1 | tee "${log_file}"; then
  status=0
else
  status=$?
fi

printf "%s\n" "${status}" > "${run_dir}/exit-code.txt"
write_run_metadata "docs-only" "${status}" "verify:docs-only"
ln -sfn "${timestamp}" "${runs_root}/latest"

if [ "${status}" -eq 0 ]; then
  echo "[verify-docs-only] PASS"
else
  echo "[verify-docs-only] FAIL (exit ${status})"
fi

exit "${status}"
