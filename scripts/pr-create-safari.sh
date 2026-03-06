#!/usr/bin/env bash
set -euo pipefail

# Create/open PR with GitHub CLI when available, then open in active Safari tab.
# Falls back to Safari "new PR" URL when gh is missing or not authenticated.
#
# Usage:
#   bash scripts/pr-create-safari.sh
#   bash scripts/pr-create-safari.sh <branch>
#   bash scripts/pr-create-safari.sh --base main [branch]
#   bash scripts/pr-create-safari.sh --refresh-body [branch]
#   bash scripts/pr-create-safari.sh --print [branch]

base_branch="main"
print_only=0
branch=""
refresh_body=0

while [ $# -gt 0 ]; do
  case "$1" in
    --base)
      shift
      base_branch="${1:-main}"
      ;;
    --refresh-body)
      refresh_body=1
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

generate_body_file() {
  local file_path
  file_path="$(mktemp -t pr-body.XXXXXX.md)"
  if command -v node >/dev/null 2>&1; then
    if node ./scripts/generate-pr-body.mjs --base "$base_branch" --output "$file_path" >/dev/null 2>&1; then
      echo "$file_path"
      return 0
    fi
  fi
  rm -f "$file_path"
  echo ""
}

existing_pr_url=""
created_pr_url=""
generated_body_file=""
generated_title=""

generated_title="$(git log -1 --pretty=%s 2>/dev/null || true)"
generated_body_file="$(generate_body_file)"

cleanup_generated_file() {
  if [ -n "$generated_body_file" ] && [ -f "$generated_body_file" ]; then
    rm -f "$generated_body_file"
  fi
}
trap cleanup_generated_file EXIT

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    existing_pr_url="$(gh pr list --head "$branch" --state open --json url -q '.[0].url' 2>/dev/null || true)"
    if [ -z "$existing_pr_url" ]; then
      if [ -n "$generated_body_file" ] && [ -n "$generated_title" ]; then
        created_pr_url="$(
          gh pr create \
            --base "$base_branch" \
            --head "$branch" \
            --title "$generated_title" \
            --body-file "$generated_body_file" \
            2>/dev/null || true
        )"
      else
        created_pr_url="$(gh pr create --base "$base_branch" --head "$branch" --fill 2>/dev/null || true)"
      fi
    elif [ "$refresh_body" -eq 1 ] && [ -n "$generated_body_file" ] && [ -n "$generated_title" ]; then
      gh pr edit "$existing_pr_url" --title "$generated_title" --body-file "$generated_body_file" >/dev/null 2>&1 || true
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
