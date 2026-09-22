<#
.SYNOPSIS
  Build, test and publish the NutriJewel site.

.DESCRIPTION
  Everything needed to ship, in one command. Handles the two things that trip
  this repo up: Node is not on PATH, and Git Credential Manager refuses to
  authenticate unless it is told the session is interactive.

  What it does, in order:
    1. commits your changes (only if you pass -Message)
    2. runs the test suite         (skip with -SkipTests)
    3. builds the site             (warnings are treated as errors)
    4. pushes the source to main
    5. publishes the build to the chosen branch

.EXAMPLE
  .\deploy.ps1 -Message "new prices for September"
  Commits, tests, builds, pushes source, publishes to STAGING.

.EXAMPLE
  .\deploy.ps1
  Same but assumes you already committed.

.EXAMPLE
  .\deploy.ps1 -Production -Message "September prices live"
  Publishes to nutrijewel.com. Asks you to type a confirmation first.
  Add -Yes to skip that prompt.

.EXAMPLE
  .\deploy.ps1 -WhatIf
  Shows exactly what would happen and changes nothing.
#>

[CmdletBinding()]
param(
  [string]$Message,
  [switch]$Production,
  [switch]$Yes,
  [switch]$SkipTests,
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'

# ---- where things live -------------------------------------------------------
$NodeDir  = 'C:\tools\node-v20.18.1-win-x64'
$AppDir   = $PSScriptRoot
$RepoRoot = (Resolve-Path (Join-Path $AppDir '..\..')).Path

# Local branch holding the SOURCE. Confusingly it shares a name with the remote
# staging branch, which holds a BUILD. See CLAUDE.md.
$SourceBranch = 'nutrijewel-test'

if ($Production) {
  $TargetBranch = 'gh-pages'
  $TargetLabel  = 'PRODUCTION (nutrijewel.com)'
} else {
  $TargetBranch = 'nutrijewel-test'
  $TargetLabel  = 'staging (no public URL)'
}

# ---- output helpers ----------------------------------------------------------
function Step($n, $text) { Write-Host "`n[$n] $text" -ForegroundColor Cyan }
function Ok($text)       { Write-Host "    OK  $text" -ForegroundColor Green }
function Info($text)     { Write-Host "    $text" -ForegroundColor DarkGray }
function Die($text) {
  Write-Host "`nSTOPPED: $text`n" -ForegroundColor Red
  exit 1
}

# Git Credential Manager bails out instantly in a non-interactive shell unless
# told otherwise. Without this every push fails with "could not read Username".
$env:GCM_INTERACTIVE = 'true'
$GitAuth = @('-c','credential.interactive=true','-c','credential.guiPrompt=true')

# Named Invoke-Git, not Git: PowerShell resolves functions ahead of executables
# and ignores case, so a function called Git shadows git everywhere, including
# inside itself. Calling git.exe explicitly makes that impossible to reintroduce.
function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)]$GitArgs)
  Push-Location $RepoRoot
  try {
    & git.exe @GitArgs
    if ($LASTEXITCODE -ne 0) { Die "git $($GitArgs -join ' ') failed (exit $LASTEXITCODE)" }
  } finally { Pop-Location }
}

# ---- preflight ---------------------------------------------------------------
Write-Host "`n=====  NutriJewel deploy  =====" -ForegroundColor White
Write-Host "  target      : $TargetLabel"
Write-Host "  source ->   : main"
Write-Host "  app         : $AppDir"

if (-not (Test-Path (Join-Path $NodeDir 'node.exe'))) {
  Die "Node not found at $NodeDir. Edit `$NodeDir at the top of this script."
}
$env:Path = "$NodeDir;$env:Path"
$env:CI   = 'true'   # makes build warnings fail, and stops Jest watching
Info "node $(& node --version)"

Push-Location $RepoRoot
$dirty  = (& git.exe status --porcelain)
$branch = (& git.exe rev-parse --abbrev-ref HEAD)
Pop-Location

if ($branch -ne $SourceBranch) {
  Die "You are on branch '$branch' but the source branch is '$SourceBranch'. Switch first."
}

if ($dirty) {
  $count = ($dirty | Measure-Object -Line).Lines
  if ($Message) {
    Info "$count uncommitted file(s), will commit as: $Message"
  } else {
    Write-Host "`n  $count uncommitted file(s):" -ForegroundColor Yellow
    $dirty | Select-Object -First 15 | ForEach-Object { Write-Host "      $_" -ForegroundColor DarkGray }
    if ($count -gt 15) { Write-Host "      ... and $($count - 15) more" -ForegroundColor DarkGray }
    Die "Commit them first, or re-run with:  .\deploy.ps1 -Message ""what you changed"""
  }
} else {
  Info "working tree clean"
}

if ($WhatIf) {
  Write-Host "`n-WhatIf: nothing was changed. Would have run:" -ForegroundColor Yellow
  if ($Message) { Write-Host "    git commit -m ""$Message""" }
  if (-not $SkipTests) { Write-Host "    npx react-scripts test --watchAll=false" }
  Write-Host "    npm run build"
  Write-Host "    git push origin ${SourceBranch}:main"
  Write-Host "    npx gh-pages -d build -b $TargetBranch"
  Write-Host ""
  exit 0
}

# Production is the live shop. Make it deliberate. -Yes skips the prompt, for when
# you have already decided or are running this from a script.
if ($Production -and -not $Yes) {
  Write-Host "`n  This publishes to nutrijewel.com, seen by real customers." -ForegroundColor Yellow
  $typed = Read-Host "  Type SHIP IT to continue"
  if ($typed -ne 'SHIP IT') { Die "Not confirmed, nothing was published." }
}
if ($Production -and $Yes) {
  Write-Host "`n  Publishing to nutrijewel.com (-Yes given, no prompt)." -ForegroundColor Yellow
}

# ---- 1. commit ---------------------------------------------------------------
if ($Message) {
  Step 1 "Committing"
  Invoke-Git add -A -- 'njnew/nutrijewel-website'
  Invoke-Git commit -q -m $Message
  Ok "committed"
} else {
  Step 1 "Nothing to commit"
}

# ---- 2. test -----------------------------------------------------------------
if ($SkipTests) {
  Step 2 "Tests skipped (-SkipTests)"
} else {
  Step 2 "Running tests"
  Push-Location $AppDir
  & npx react-scripts test --watchAll=false --silent
  $testExit = $LASTEXITCODE
  Pop-Location
  if ($testExit -ne 0) { Die "Tests failed. Nothing was pushed or published." }
  Ok "tests passed"
}

# ---- 3. build ----------------------------------------------------------------
Step 3 "Building"
Push-Location $AppDir
& npm run build
$buildExit = $LASTEXITCODE
Pop-Location
if ($buildExit -ne 0) { Die "Build failed. Nothing was pushed or published." }
Ok "build ready"

# ---- 4. push source ----------------------------------------------------------
Step 4 "Pushing source to main"
Invoke-Git @GitAuth push origin "${SourceBranch}:main"
Ok "main updated"

# ---- 5. publish --------------------------------------------------------------
Step 5 "Publishing build to '$TargetBranch'"
Push-Location $AppDir
& npx gh-pages -d build -b $TargetBranch -m "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
$pubExit = $LASTEXITCODE
Pop-Location
if ($pubExit -ne 0) {
  Write-Host "    If it mentions a stale cache, run:  npx gh-pages-clean" -ForegroundColor Yellow
  Die "Publish failed. Source is on main, but the build did not go out."
}
Ok "published to $TargetBranch"

Write-Host "`n=====  Done: $TargetLabel  =====" -ForegroundColor Green
if ($Production) {
  Write-Host "  Live at https://nutrijewel.com (a minute or two to propagate)`n"
} else {
  Write-Host "  Staging has no public URL. Check it locally with: npm start`n"
}
