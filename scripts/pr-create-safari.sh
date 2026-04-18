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
#   bash scripts/pr-create-safari.sh --no-refresh-body [branch]
#   bash scripts/pr-create-safari.sh --print [branch]

# shellcheck source=/dev/null
source "$(dirname "$0")/lib/resolve-gh-cli.sh"
# shellcheck source=/dev/null
source "$(dirname "$0")/lib/bootstrap-node.sh"

base_branch="main"
print_only=0
branch=""
refresh_body=1

while [ $# -gt 0 ]; do
  case "$1" in
    --base)
      shift
      base_branch="${1:-main}"
      ;;
    --refresh-body)
      refresh_body=1
      ;;
    --no-refresh-body)
      refresh_body=0
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

  require_node_runtime "[pr-create-safari]" || return 1

  file_path="$(mktemp "${TMPDIR:-/tmp}/pr-body.XXXXXX.md")"
  if node ./scripts/generate-pr-body.mjs --base "$base_branch" --output "$file_path" >/dev/null; then
    echo "$file_path"
    return 0
  fi

  rm -f "$file_path"
  echo "[pr-create-safari] Failed to generate PR body from ./scripts/generate-pr-body.mjs." >&2
  return 1
}

existing_pr_url=""
created_pr_url=""
generated_body_file=""
generated_title=""
gh_bin=""
gh_fallback_reason=""
gh_resolution_message=""

cleanup_generated_file() {
  if [ -n "$generated_body_file" ] && [ -f "$generated_body_file" ]; then
    rm -f "$generated_body_file"
  fi
}
trap cleanup_generated_file EXIT

gh_bin="$(resolve_gh_bin 2>/dev/null || true)"

if [ -n "$gh_bin" ] && gh_cli_is_authenticated "$gh_bin"; then
  generated_title="$(git log -1 --pretty=%s 2>/dev/null || true)"
  if [ -z "$generated_title" ]; then
    echo "[pr-create-safari] Could not determine PR title from the latest commit subject." >&2
    exit 1
  fi

  if ! generated_body_file="$(generate_body_file)"; then
    exit 1
  fi

  existing_pr_url="$("$gh_bin" pr list --head "$branch" --state open --json url -q '.[0].url' 2>/dev/null || true)"
  if [ -z "$existing_pr_url" ]; then
    created_pr_url="$(
      "$gh_bin" pr create \
        --base "$base_branch" \
        --head "$branch" \
        --title "$generated_title" \
        --body-file "$generated_body_file"
    )"

    if [ -z "$created_pr_url" ]; then
      echo "[pr-create-safari] GitHub CLI did not return a PR URL after create. Confirm the branch is pushed and gh auth is valid." >&2
      exit 1
    fi

    gh_resolution_message="Created PR via GitHub CLI (${gh_bin}) with canonical generated title/body."
  elif [ "$refresh_body" -eq 1 ]; then
    "$gh_bin" pr edit "$existing_pr_url" --title "$generated_title" --body-file "$generated_body_file" >/dev/null
    gh_resolution_message="Using existing PR via GitHub CLI (${gh_bin}) and refreshed PR metadata from the canonical generator."
  else
    gh_resolution_message="Using existing PR via GitHub CLI (${gh_bin}) without metadata refresh."
  fi
elif [ -n "$gh_bin" ]; then
  gh_fallback_reason="GitHub CLI found at ${gh_bin} but auth is unavailable."
else
  gh_fallback_reason="GitHub CLI not found on PATH or common Homebrew locations."
fi

pr_url="${created_pr_url:-$existing_pr_url}"
if [ -z "$pr_url" ]; then
  if [ "$print_only" -ne 1 ] && [ -n "$gh_fallback_reason" ]; then
    echo "[pr-create-safari] ${gh_fallback_reason} Falling back to Safari PR URL without automated PR-body sync."
  fi
  pr_url="$(get_fallback_url)"
elif [ "$print_only" -ne 1 ] && [ -n "$gh_resolution_message" ]; then
  echo "[pr-create-safari] ${gh_resolution_message}"
fi

open_in_safari "$pr_url"
if [ "$print_only" -eq 1 ]; then
  exit 0
fi
echo "[pr-create-safari] Ready: ${pr_url}"
