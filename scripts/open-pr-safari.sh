#!/usr/bin/env bash
set -euo pipefail

# Open PR URL in active Safari tab.
# Usage:
#   bash scripts/open-pr-safari.sh
#   bash scripts/open-pr-safari.sh <branch>
#   bash scripts/open-pr-safari.sh <https://github.com/.../pull/...>
#   bash scripts/open-pr-safari.sh --print [branch|url]

print_only=0
if [ "${1:-}" = "--print" ]; then
  print_only=1
  shift
fi

target="${1:-}"

is_url() {
  case "$1" in
    http://*|https://*) return 0 ;;
    *) return 1 ;;
  esac
}

get_repo_owner_and_name() {
  local origin
  origin="$(git remote get-url origin 2>/dev/null || true)"
  if [ -z "$origin" ]; then
    echo "[open-pr-safari] Could not read git origin URL." >&2
    exit 1
  fi

  if [[ "$origin" =~ ^git@github\.com:([^/]+)/(.+)$ ]]; then
    local owner="${BASH_REMATCH[1]}"
    local repo="${BASH_REMATCH[2]}"
    repo="${repo%.git}"
    printf "%s/%s\n" "$owner" "$repo"
    return 0
  fi

  if [[ "$origin" =~ ^https://github\.com/([^/]+)/(.+)$ ]]; then
    local owner="${BASH_REMATCH[1]}"
    local repo="${BASH_REMATCH[2]}"
    repo="${repo%.git}"
    printf "%s/%s\n" "$owner" "$repo"
    return 0
  fi

  echo "[open-pr-safari] Unsupported origin format: $origin" >&2
  exit 1
}

pr_url=""
branch=""

if [ -n "$target" ] && is_url "$target"; then
  pr_url="$target"
else
  if [ -n "$target" ]; then
    branch="$target"
  else
    branch="$(git branch --show-current)"
  fi

  if command -v gh >/dev/null 2>&1; then
    if [ -z "$target" ]; then
      pr_url="$(gh pr view --json url -q .url 2>/dev/null || true)"
    fi

    if [ -z "$pr_url" ]; then
      pr_url="$(gh pr list --head "$branch" --state open --json url -q '.[0].url' 2>/dev/null || true)"
    fi
  fi

  if [ -z "$pr_url" ]; then
    repo_path="$(get_repo_owner_and_name)"
    branch_encoded="${branch//\//%2F}"
    pr_url="https://github.com/${repo_path}/pull/new/${branch_encoded}"
  fi
fi

if [ "$print_only" -eq 1 ]; then
  echo "$pr_url"
  exit 0
fi

osascript \
  -e 'tell application "Safari" to activate' \
  -e 'tell application "Safari" to if (count of windows) = 0 then make new document' \
  -e "tell application \"Safari\" to set URL of front document to \"${pr_url}\""

echo "[open-pr-safari] Opened: ${pr_url}"
