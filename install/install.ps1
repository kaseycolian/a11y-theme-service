<#
  install.ps1 — make this repo's skills available to Claude Code on Windows.
  - Links skill/ -> ~/.claude/skills/theme-service                 (create + apply themes)
    and  a11y-way-pages/skill/ -> ~/.claude/skills/a11y-way-pages  (header/footer/favicon)
    as directory JUNCTIONS, which need no admin; falls back to a copy if that fails.
  - Writes ~/.claude/theme-service.local.json with this repo's path so agents can find
    the source of truth. This file lives OUTSIDE the repo and is never committed.

  The config write is delegated to install/write-config.mjs — the ONE writer, shared with
  install.mjs and install.sh. This script used to write the file itself with only
  { repo, version }, which destroyed includeBuiltinThemes and the whole history[] array;
  and it wrote UTF-8 *with BOM*, which makes JSON.parse throw in install.mjs and
  tools/build-final.mjs (both swallow it, so the config silently reverted to defaults).
  Never reintroduce a direct write here.

  Re-run any time to refresh.
  Usage:  pwsh -File install/install.ps1 [-Only <skill>] [-Source <path>] [-Builtins true|false]
#>
[CmdletBinding()]
param(
  [string]$Only,
  [string]$Source,
  [ValidateSet('true', 'false')][string]$Builtins,
  [switch]$Help
)
$ErrorActionPreference = 'Stop'

$repo   = if ($Source) { (Resolve-Path $Source).Path } else { Split-Path -Parent $PSScriptRoot }
$claude = Join-Path $env:USERPROFILE '.claude'
$skills = Join-Path $claude 'skills'

# Every skill this repo ships: source directory -> name under ~/.claude/skills/.
$skillMap = [ordered]@{
  'skill'                = 'theme-service'
  'a11y-way-pages/skill' = 'a11y-way-pages'
}

if ($Help) {
  Write-Host @"
theme-service installer (Windows)
  -Source <path>          use a different theme-service clone as your source (default: this repo)
  -Builtins <true|false>  remember whether to include the origin's built-in themes when building
  -Only <skill>           link just one skill ($($skillMap.Values -join '|')) instead of both
  -Help                   show this
Links skill/ -> ~/.claude/skills/theme-service and a11y-way-pages/skill/ -> ~/.claude/skills/a11y-way-pages,
and writes ~/.claude/theme-service.local.json.
"@
  exit 0
}

# Filter BEFORE the preflight loop, so -Only a11y-way-pages does not require skill/SKILL.md.
if ($Only) {
  if ($skillMap.Values -notcontains $Only) {
    Write-Error "-Only $Only : unknown skill. Known: $($skillMap.Values -join ', ')."
    exit 1
  }
  $filtered = [ordered]@{}
  foreach ($dir in $skillMap.Keys) {
    if ($skillMap[$dir] -eq $Only) { $filtered[$dir] = $skillMap[$dir] }
  }
  $skillMap = $filtered
}

foreach ($dir in $skillMap.Keys) {
  if (-not (Test-Path (Join-Path $repo "$dir/SKILL.md"))) { throw "$dir/SKILL.md not found under $repo" }
}
New-Item -ItemType Directory -Force -Path $skills | Out-Null

$linked = $true
$linkedNames = @()
foreach ($dir in $skillMap.Keys) {
  $source = Join-Path $repo $dir
  $target = Join-Path $skills $skillMap[$dir]

  # Remove any existing link (reparse point) so we can refresh it — including a DANGLING
  # one, which is why this tests the item itself rather than whether it resolves.
  if (Test-Path $target -ErrorAction SilentlyContinue) {
    $item = Get-Item $target -Force
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
      (Get-Item $target -Force).Delete()
    } else {
      throw "$target exists and is a real directory (not a link). Remove it manually, then re-run."
    }
  } elseif ((Get-Item $target -Force -ErrorAction SilentlyContinue)) {
    # Test-Path follows the reparse point, so a dangling junction lands here.
    (Get-Item $target -Force).Delete()
  }

  # Prefer a junction (no admin). Fall back to a copy.
  try {
    New-Item -ItemType Junction -Path $target -Target $source | Out-Null
    Write-Host "Linked (junction): $target -> $source"
  } catch {
    Copy-Item -Recurse -Force $source $target
    $linked = $false
    Write-Host "Copied skill into: $target (junction unavailable; re-run install to update)"
  }
  $linkedNames += $skillMap[$dir]
}

# The config: read-merged by the shared writer, so history[] and includeBuiltinThemes
# survive and the file is written UTF-8 with NO BOM.
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
  # NOT $args - that is a PowerShell automatic variable holding this script's own
  # arguments, so splatting it here would forward those instead of these.
  $cfgArgs = @('--repo', $repo, '--skills', ($linkedNames -join '+'))
  if ($Builtins) { $cfgArgs += @('--builtins', $Builtins) }
  & node (Join-Path $repo 'install/write-config.mjs') @cfgArgs
} else {
  Write-Warning "node not found - left ~/.claude/theme-service.local.json untouched."
  Write-Warning "The skills are linked, but agents may not find the source repo."
  Write-Warning "Install Node and re-run, or set 'repo' in that file by hand."
}

Write-Host ""
Write-Host "Done. Claude Code will discover these skills on next session: $($linkedNames -join ', ')."
if (-not $linked) { Write-Host "Note: installed as a copy - re-run this script after updating the repo." }
