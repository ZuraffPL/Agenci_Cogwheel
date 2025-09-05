# Quick Commit Script - Szybki commit z automatyczną aktualizacją dokumentacji
# Użycie: .\quick-commit.ps1 "commit message"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

Write-Host "⚡ Quick Commit - Cogwheel Syndicate" -ForegroundColor Cyan

# Sprawdź czy są zmiany
$GitStatus = git status --porcelain
if (-not $GitStatus) {
    Write-Host "ℹ️  Brak zmian do commitowania" -ForegroundColor Blue
    exit 0
}

Write-Host "📁 Zmiany do commitowania:" -ForegroundColor Yellow
Write-Host $GitStatus

# Dodaj wszystkie zmiany
git add .

# Commit
Write-Host "💾 Tworzenie commit: $Message" -ForegroundColor Yellow
git commit -m $Message

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit utworzony pomyślnie!" -ForegroundColor Green
} else {
    Write-Host "❌ Błąd podczas commitowania" -ForegroundColor Red
    exit 1
}
