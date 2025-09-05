# Cogwheel Syndicate - Push Changes Script
# Prosty skrypt do wypychania lokalnych commitów na GitHub

Write-Host "🚀 Cogwheel Syndicate - Push Changes Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Sprawdź czy są niepypchnięte commity
$UnpushedCommits = git log origin/main..main --oneline

if ($UnpushedCommits) {
    Write-Host "📋 Niepypchnięte commity:" -ForegroundColor Yellow
    $UnpushedCommits | ForEach-Object { Write-Host "  • $_" -ForegroundColor White }
    Write-Host ""
    
    # Pokaż status
    Write-Host "📊 Status git:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    
    # Potwierdź push
    $Confirmation = Read-Host "Czy chcesz wypchnąć zmiany na GitHub? (y/N)"
    
    if ($Confirmation -eq 'y' -or $Confirmation -eq 'Y') {
        Write-Host "🚀 Wypychanie na GitHub..." -ForegroundColor Yellow
        git push origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Wszystkie zmiany zostały wypchnięte na GitHub!" -ForegroundColor Green
            
            # Sprawdź czy są tagi do push
            $UnpushedTags = git tag --no-merged origin/main
            if ($UnpushedTags) {
                Write-Host "🏷️  Znalezione niepypchnięte tagi:" -ForegroundColor Yellow
                $UnpushedTags | ForEach-Object { Write-Host "  • $_" -ForegroundColor White }
                
                $TagPush = Read-Host "Czy chcesz wypchnąć również tagi? (y/N)"
                if ($TagPush -eq 'y' -or $TagPush -eq 'Y') {
                    Write-Host "🏷️  Wypychanie tagów..." -ForegroundColor Yellow
                    git push origin --tags
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "✅ Tagi wypchnięte pomyślnie!" -ForegroundColor Green
                    } else {
                        Write-Host "❌ Błąd podczas push tagów" -ForegroundColor Red
                    }
                }
            }
            
        } else {
            Write-Host "❌ Błąd podczas push" -ForegroundColor Red
            Write-Host "💡 Sprawdź połączenie z internetem i uprawnienia" -ForegroundColor Yellow
        }
    } else {
        Write-Host "ℹ️  Push anulowany" -ForegroundColor Blue
        Write-Host "💡 Możesz użyć: git push origin main" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Wszystkie lokalne commity są już na GitHub" -ForegroundColor Green
    Write-Host "ℹ️  Twój branch jest aktualny z origin/main" -ForegroundColor Blue
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
