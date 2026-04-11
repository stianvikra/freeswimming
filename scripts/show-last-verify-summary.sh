#!/usr/bin/env bash
set -euo pipefail

runs_root="artifacts/test-runs"

if [ ! -d "${runs_root}" ]; then
  echo "[verify-last] No runs found in ${runs_root}"
  exit 1
fi

if [ -L "${runs_root}/latest" ]; then
  latest_name="$(readlink "${runs_root}/latest")"
  run_dir="${runs_root}/${latest_name}"
else
  latest_name="$(ls -1 "${runs_root}" | sort | tail -n 1)"
  run_dir="${runs_root}/${latest_name}"
fi

if [ ! -d "${run_dir}" ]; then
  echo "[verify-last] Latest run directory not found: ${run_dir}"
  exit 1
fi

echo "[verify-last] Run: ${run_dir}"
if [ -f "${run_dir}/mode.txt" ]; then
  echo "[verify-last] Lane: $(cat "${run_dir}/mode.txt")"
fi
if [ -f "${run_dir}/exit-code.txt" ]; then
  echo "[verify-last] Exit code: $(cat "${run_dir}/exit-code.txt")"
fi

if [ ! -f "${run_dir}/verify.log" ]; then
  echo "[verify-last] No verify.log found."
  exit 0
fi

echo "[verify-last] Key lines:"
grep -E "Test Files|Tests|failed|passed|Duration|Running [0-9]+ tests|[0-9]+ failed|[0-9]+ passed" \
  "${run_dir}/verify.log" \
  | tail -n 60 || true
