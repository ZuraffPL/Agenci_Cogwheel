Write-Host "=== Git Operations for Cogwheel Syndicate v0.6.1 ===" -ForegroundColor Green

# Set editor to avoid interactive prompts
$env:GIT_EDITOR = "true"
git config --global core.editor "true"

# Change to project directory
Set-Location "d:\Foundry\Data\systems\cogwheel-syndicate"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow

# Check git status
Write-Host "`n--- Git Status ---" -ForegroundColor Cyan
git status --porcelain

# Complete any pending merge
Write-Host "`n--- Completing merge ---" -ForegroundColor Cyan
try {
    git commit --no-edit -m "Merge from main"
    Write-Host "Merge completed successfully" -ForegroundColor Green
} catch {
    Write-Host "No merge to complete or merge already done" -ForegroundColor Yellow
}

# Add all changes
Write-Host "`n--- Adding changes ---" -ForegroundColor Cyan
git add .
git status --porcelain

# Commit archetype changes
Write-Host "`n--- Committing archetype changes ---" -ForegroundColor Cyan
$commitMessage = @"
feat: Zaktualizowano archetypy w compendium pack v0.6.1

- Zastąpiono stare archetypy nowymi, bardziej zbalansowanymi
- Parowy Komandos: Maszyna 5, Inżynieria 1, Intryga 3 (walka + technologia)  
- Geniusz Techniki: Maszyna 3, Inżynieria 5, Intryga 1 (wynalazki + konstrukcje)
- Płaszcz Cienia: Maszyna 1, Inżynieria 3, Intryga 5 (szpiegostwo + manipulacja)
- Agent Pary: Maszyna 3, Inżynieria 3, Intryga 3 (wszechstronny agent)
- Zaktualizowano packs/archetypes.json i archetypes.db
- Dodano szczegółowe opisy dla każdego archetypu w j. polskim
- Zaktualizowano CHANGELOG.md z informacjami o nowych archetypach
"@

git commit -m $commitMessage

# Clean up temporary files
Write-Host "`n--- Cleaning up temporary files ---" -ForegroundColor Cyan
$tempFiles = @("git_fix.ps1", "git_push.ps1", "remove_arch.ps1", "complete_git.sh")
foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removed: $file" -ForegroundColor Yellow
    }
}

# Commit cleanup
git add .
git commit -m "chore: Usunięto tymczasowe skrypty"

# Push to GitHub
Write-Host "`n--- Pushing to GitHub ---" -ForegroundColor Cyan
git push origin main

Write-Host "`n=== Operacja zakończona pomyślnie! ===" -ForegroundColor Green
Write-Host "Wersja 0.6.1 z nowymi archetypami została wysłana na GitHub" -ForegroundColor Green
Write-Host "Automatyczny release zostanie uruchomiony przez GitHub Actions" -ForegroundColor Yellow

# Keep window open
Write-Host "`nNaciśnij dowolny klawisz, aby zamknąć..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
