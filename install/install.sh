#!/usr/bin/env bash
# install.sh — make this repo's skills available to Claude Code on macOS/Linux.
#  - Symlinks skill/ -> ~/.claude/skills/theme-service                (create + apply themes)
#    and     a11y-way-pages/skill/ -> ~/.claude/skills/a11y-way-pages (header/footer/favicon)
#    Falls back to a copy if symlinking is unavailable.
#  - Writes ~/.claude/theme-service.local.json with this repo's path so agents can find the
#    source of truth. That file lives OUTSIDE the repo and is never committed.
#
# The config write is delegated to install/write-config.mjs — the ONE writer, shared with
# install.mjs and install.ps1. This script used to write the file itself with just
# { repo, version }, which destroyed includeBuiltinThemes and the whole history[] array
# on every run. Never reintroduce a direct write here.
#
# Re-run any time to refresh.
# Usage:  bash install/install.sh [--only <skill>] [--source <path>] [--builtins true|false]
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(dirname "$script_dir")"
claude="$HOME/.claude"
skills="$claude/skills"

# Every skill this repo ships, as "<source dir>:<name under ~/.claude/skills/>".
skill_map=(
  "skill:theme-service"
  "a11y-way-pages/skill:a11y-way-pages"
)

known_names() { for e in "${skill_map[@]}"; do printf '%s\n' "${e##*:}"; done; }

usage() {
  cat <<USAGE
theme-service installer (macOS/Linux)
  --source <path>         use a different theme-service clone as your source (default: this repo)
  --builtins <true|false> remember whether to include the origin's built-in themes when building
  --only <skill>          link just one skill ($(known_names | paste -sd'|' -)) instead of both
  --help                  show this
Links skill/ -> ~/.claude/skills/theme-service and a11y-way-pages/skill/ -> ~/.claude/skills/a11y-way-pages,
and writes ~/.claude/theme-service.local.json.
USAGE
}

only=""
builtins=""
while [ $# -gt 0 ]; do
  case "$1" in
    --only)     only="${2:-}"; shift 2 ;;
    --source)   repo="$(cd "${2:-}" && pwd)"; shift 2 ;;
    --builtins) builtins="${2:-}"; shift 2 ;;
    --help|-h)  usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 1 ;;
  esac
done

# Filter BEFORE the preflight loop, so --only a11y-way-pages does not require skill/SKILL.md.
if [ -n "$only" ]; then
  if ! known_names | grep -qx "$only"; then
    echo "--only $only: unknown skill. Known: $(known_names | paste -sd', ' -)." >&2
    exit 1
  fi
  filtered=()
  for e in "${skill_map[@]}"; do
    [ "${e##*:}" = "$only" ] && filtered+=("$e")
  done
  skill_map=("${filtered[@]}")
fi

for entry in "${skill_map[@]}"; do
  dir="${entry%%:*}"
  [ -f "$repo/$dir/SKILL.md" ] || { echo "$dir/SKILL.md not found under $repo" >&2; exit 1; }
done
mkdir -p "$skills"

linked_names=""
for entry in "${skill_map[@]}"; do
  dir="${entry%%:*}"
  name="${entry##*:}"
  source_dir="$repo/$dir"
  target="$skills/$name"

  # -L first: it sees the LINK, so a dangling one is still cleaned up rather than
  # tripping the "real directory" branch below.
  if [ -L "$target" ]; then
    rm "$target"
  elif [ -e "$target" ]; then
    echo "$target exists and is a real directory (not a link). Remove it manually, then re-run." >&2
    exit 1
  fi

  if ln -s "$source_dir" "$target" 2>/dev/null; then
    echo "Linked (symlink): $target -> $source_dir"
  else
    cp -R "$source_dir" "$target"
    echo "Copied skill into: $target (symlink unavailable; re-run install to update)"
  fi
  linked_names="${linked_names:+$linked_names+}$name"
done

# The config: read-merged by the shared writer so history[] and includeBuiltinThemes survive.
if command -v node >/dev/null 2>&1; then
  args=(--repo "$repo" --skills "$linked_names")
  if [ -n "$builtins" ]; then args+=(--builtins "$builtins"); fi
  node "$repo/install/write-config.mjs" "${args[@]}"
else
  echo "WARNING: node not found — left ~/.claude/theme-service.local.json untouched." >&2
  echo "         The skills are linked, but agents may not find the source repo." >&2
  echo "         Install Node and re-run, or set 'repo' in that file by hand." >&2
fi

echo
echo "Done. Claude Code will discover these skills on next session: $(printf '%s' "$linked_names" | tr '+' ' ' | tr ' ' ',' | sed 's/,/, /g')."
