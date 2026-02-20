#!/usr/bin/env bash
set -euo pipefail

# Create/open PR with GitHub CLI when available, then open in active Safari tab.
# Falls back to Safari "new PR" URL when gh is missing or not authenticated.
#
# Usage:
#   bash scripts/pr-create-safari.sh
#   bash scripts/pr-create-safari.sh <branch>
#   bash scripts/pr-create-safari.sh --base main [branch]
#   bash scripts/pr-create-safari.sh --print [branch]

base_branch="main"
print_only=0
branch=""

while [ $# -gt 0 ]; do
  case "$1" in
    --base)
      shift
      base_branch="${1:-main}"
      ;;
    --print)
      print_only=1
      ;;
    *)
      if [ -z "$branch" ]; then
        branch="$1"
      else
        echo "[pr-create-safari] Unexpected argument: $1" >&2
        exit 1
      fi
      ;;
  esac
  shift
done

if [ -z "$branch" ]; then
  branch="$(git branch --show-current)"
fi

if [ -z "$branch" ]; then
  echo "[pr-create-safari] Could not determine current git branch." >&2
  exit 1
fi

if [ "$branch" = "$base_branch" ]; then
  echo "[pr-create-safari] Current branch is '${branch}'. Switch to a feature branch first." >&2
  exit 1
fi

open_in_safari() {
  local url="$1"
  if [ "$print_only" -eq 1 ]; then
    echo "$url"
    return 0
  fi
  bash ./scripts/open-pr-safari.sh "$url"
}

get_fallback_url() {
  bash ./scripts/open-pr-safari.sh --print "$branch"
}

existing_pr_url=""
created_pr_url=""

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    existing_pr_url="$(gh pr list --head "$branch" --state open --json url -q '.[0].url' 2>/dev/null || true)"
    if [ -z "$existing_pr_url" ]; then
      created_pr_url="$(gh pr create --base "$base_branch" --head "$branch" --fill 2>/dev/null || true)"
    fi
  fi
fi

pr_url="${created_pr_url:-$existing_pr_url}"
if [ -z "$pr_url" ]; then
  pr_url="$(get_fallback_url)"
fi

open_in_safari "$pr_url"
if [ "$print_only" -eq 1 ]; then
  exit 0
fi
echo "[pr-create-safari] Ready: ${pr_url}"
