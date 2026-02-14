#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: bash scripts/task-brief-move.sh <file-name.md> <planned|in-progress|done|blocked>"
  exit 1
fi

name="$1"
target="$2"
base="docs/task-briefs"

case "${target}" in
planned | in-progress | done | blocked) ;;
*)
  echo "Invalid target '${target}'. Use: planned, in-progress, done, blocked."
  exit 1
  ;;
esac

# Find the brief in any lifecycle folder.
source_path="$(
  find "${base}" -type f -name "${name}" \
    ! -path "${base}/README.md" \
    ! -path "${base}/${target}/${name}" \
    | head -n 1
)"

if [[ -z "${source_path}" ]]; then
  if [[ -f "${base}/${target}/${name}" ]]; then
    echo "Brief is already in ${target}: ${base}/${target}/${name}"
    exit 0
  fi
  echo "Could not find brief named '${name}' under ${base}/."
  exit 1
fi

dest_path="${base}/${target}/${name}"
mkdir -p "$(dirname "${dest_path}")"
mv "${source_path}" "${dest_path}"
echo "Moved: ${source_path} -> ${dest_path}"
