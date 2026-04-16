# Release Script - Automatyczne tworzenie releaseów z pełną dokumentacją
# Użycie: .\create-release.ps1 -Version "0.8.0" -Features "Lista nowych funkcji"

param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [Parameter(Mandatory=$true)]
    [string]$Features,
    
    [Parameter(Mandatory=$false)]
    [string]$Changes = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Fixes = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$AutoPush = $false
)

Write-Host "🚀 Release Creator - Cogwheel Syndicate v$Version" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "ℹ️  Tag i GitHub Release tworzone automatycznie przez GitHub Actions po push." -ForegroundColor Cyan

# Aktualizuj wersję w system.json
Write-Host "🔄 Aktualizacja wersji w system.json..." -ForegroundColor Yellow
$SystemJsonPath = "system.json"
$SystemJsonContent = Get-Content $SystemJsonPath -Raw
$SystemJsonContent = $SystemJsonContent -replace """version""\s*:\s*""[^""]*""", """version"": ""$Version"""
Set-Content $SystemJsonPath $SystemJsonContent -Encoding UTF8

# Przygotuj wpis do CHANGELOG
$DateString = Get-Date -Format "yyyy-MM-dd"
$ChangelogEntry = "## [$Version] - $DateString`n`n"

if ($Features) {
    $ChangelogEntry += "### Added | Dodano`n$Features`n`n"
}

if ($Changes) {
    $ChangelogEntry += "### Changed | Zmieniono`n$Changes`n`n"
}

if ($Fixes) {
    $ChangelogEntry += "### Fixed | Naprawiono`n$Fixes`n`n"
}

# Aktualizuj CHANGELOG.md
Write-Host "📝 Aktualizacja CHANGELOG.md..." -ForegroundColor Yellow
$ChangelogPath = "CHANGELOG.md"
$ChangelogContent = Get-Content $ChangelogPath -Raw
$ChangelogContent = $ChangelogContent -replace '(## \[Unreleased\] \| \[Nieopublikowane\])', "`$1`n`n$ChangelogEntry"
Set-Content $ChangelogPath $ChangelogContent -Encoding UTF8

# Aktualizuj README.md
Write-Host "📝 Aktualizacja README.md..." -ForegroundColor Yellow
$ReadmePath = "README.md"
$ReadmeContent = Get-Content $ReadmePath -Raw
$ReadmeContent = $ReadmeContent -replace 'Current System Version: [0-9]+\.[0-9]+\.[0-9]+', "Current System Version: $Version"

# Dodaj sekcję "What's New"
$ReadmeNewSection = "## 🔥 What's New in v$Version`n`n$Features`n`n"
if ($ReadmeContent -match "## 🔥 What's New in v[0-9]+\.[0-9]+\.[0-9]+") {
    $ReadmeContent = $ReadmeContent -replace "## 🔥 What's New in v[0-9]+\.[0-9]+\.[0-9]+.*?(?=## 🔥 What's New in v[0-9]+\.[0-9]+\.[0-9]+|## [^🔥]|$)", $ReadmeNewSection, 1
} else {
    $ReadmeContent = $ReadmeContent -replace '(\*A game about secret agents.*?\*)', "`$1`n`n$ReadmeNewSection"
}
Set-Content $ReadmePath $ReadmeContent -Encoding UTF8

# Commit changes
Write-Host "💾 Tworzenie commit dla release v$Version..." -ForegroundColor Yellow
git add .
$CommitMessage = "release: Version $Version`n`n✨ New Features:`n$Features"
if ($Changes) { $CommitMessage += "`n`n🔄 Changes:`n$Changes" }
if ($Fixes) { $CommitMessage += "`n`n🐛 Fixes:`n$Fixes" }

git commit -m $CommitMessage

Write-Host "✅ Commit dla v$Version gotowy!" -ForegroundColor Green
Write-Host "ℹ️  Tag i GitHub Release zostaną utworzone automatycznie przez GitHub Actions po push." -ForegroundColor Cyan

# Push
if ($AutoPush) {
    Write-Host "🚀 Pushing do remote..." -ForegroundColor Yellow
    git push origin main
    Write-Host "✅ Wypchnięto na GitHub! GitHub Actions utworzy Release automatycznie." -ForegroundColor Green
} else {
    Write-Host "📤 Aby wypchnąć i uruchomić GitHub Actions, uruchom:" -ForegroundColor Yellow
    Write-Host "   git push origin main" -ForegroundColor White
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "🎉 Release v$Version gotowy do wdrożenia!" -ForegroundColor Green
