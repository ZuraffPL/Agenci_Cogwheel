# Cogwheel Syndicate - Documentation Update & Commit Script
# Automatyczny skrypt do aktualizacji dokumentacji i commitowania zmian

param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage,
    
    [Parameter(Mandatory=$false)]
    [string]$ChangelogEntry = "",
    
    [Parameter(Mandatory=$false)]
    [string]$ReadmeEntry = "",
    
    [Parameter(Mandatory=$false)]
    [string]$VersionBump = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$Push
)

Write-Host "🚀 Cogwheel Syndicate - Documentation Update & Commit Script" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

# Sprawdź czy jesteśmy w głównym katalogu systemu
$SystemJsonPath = "system.json"
if (-not (Test-Path $SystemJsonPath)) {
    Write-Host "❌ Błąd: Nie znaleziono system.json. Uruchom skrypt z głównego katalogu systemu." -ForegroundColor Red
    exit 1
}

# Pobierz aktualną wersję
$SystemJson = Get-Content $SystemJsonPath | ConvertFrom-Json
$CurrentVersion = $SystemJson.version
Write-Host "📦 Aktualna wersja: $CurrentVersion" -ForegroundColor Yellow

# Jeśli podano nową wersję, zaktualizuj system.json
if ($VersionBump) {
    Write-Host "🔄 Aktualizacja wersji z $CurrentVersion na $VersionBump..." -ForegroundColor Yellow
    
    $SystemJsonContent = Get-Content $SystemJsonPath -Raw
    $SystemJsonContent = $SystemJsonContent -replace """version""\s*:\s*""[^""]*""", """version"": ""$VersionBump"""
    Set-Content $SystemJsonPath $SystemJsonContent -Encoding UTF8
    
    Write-Host "✅ Wersja zaktualizowana na $VersionBump" -ForegroundColor Green
    $CurrentVersion = $VersionBump
}

# Funkcja do aktualizacji CHANGELOG.md
function Update-Changelog {
    param([string]$Entry, [string]$Version)
    
    if (-not $Entry) { return }
    
    Write-Host "📝 Aktualizacja CHANGELOG.md..." -ForegroundColor Yellow
    
    $ChangelogPath = "CHANGELOG.md"
    if (Test-Path $ChangelogPath) {
        $ChangelogContent = Get-Content $ChangelogPath -Raw
        
        # Znajdź sekcję [Unreleased] lub utwórz nową sekcję wersji
        $DateString = Get-Date -Format "yyyy-MM-dd"
        $NewSection = "## [$Version] - $DateString`n`n$Entry`n`n"
        
        # Wstaw nową sekcję po sekcji [Unreleased]
        if ($ChangelogContent -match '## \[Unreleased\] \| \[Nieopublikowane\]') {
            $ChangelogContent = $ChangelogContent -replace '(## \[Unreleased\] \| \[Nieopublikowane\])', "`$1`n`n$NewSection"
        } else {
            # Jeśli nie ma sekcji Unreleased, dodaj na górze
            $ChangelogContent = $ChangelogContent -replace '(projekt przestrzega.*?\n)', "`$1`n`n## [Unreleased] | [Nieopublikowane]`n`n$NewSection"
        }
        
        Set-Content $ChangelogPath $ChangelogContent -Encoding UTF8
        Write-Host "✅ CHANGELOG.md zaktualizowany" -ForegroundColor Green
    } else {
        Write-Host "⚠️  CHANGELOG.md nie istnieje" -ForegroundColor Yellow
    }
}

# Funkcja do aktualizacji README.md
function Update-Readme {
    param([string]$Entry, [string]$Version)
    
    if (-not $Entry) { return }
    
    Write-Host "📝 Aktualizacja README.md..." -ForegroundColor Yellow
    
    $ReadmePath = "README.md"
    if (Test-Path $ReadmePath) {
        $ReadmeContent = Get-Content $ReadmePath -Raw
        
        # Zaktualizuj wersję w README
        $ReadmeContent = $ReadmeContent -replace 'Current System Version: [0-9]+\.[0-9]+\.[0-9]+', "Current System Version: $Version"
        
        # Dodaj nową sekcję "What's New"
        $NewSection = "## 🔥 What's New in v$Version`n`n$Entry`n`n"
        
        # Znajdź obecną sekcję "What's New" i zastąp ją
        if ($ReadmeContent -match "## 🔥 What's New in v[0-9]+\.[0-9]+\.[0-9]+") {
            $ReadmeContent = $ReadmeContent -replace "## 🔥 What's New in v[0-9]+\.[0-9]+\.[0-9]+.*?(?=## 🔥 What's New in v[0-9]+\.[0-9]+\.[0-9]+|## [^🔥]|$)", $NewSection, 1
        } else {
            # Jeśli nie ma sekcji "What's New", dodaj po opisie
            $ReadmeContent = $ReadmeContent -replace '(\*A game about secret agents.*?\*)', "`$1`n`n$NewSection"
        }
        
        Set-Content $ReadmePath $ReadmeContent -Encoding UTF8
        Write-Host "✅ README.md zaktualizowany" -ForegroundColor Green
    } else {
        Write-Host "⚠️  README.md nie istnieje" -ForegroundColor Yellow
    }
}

# Aktualizuj dokumentację jeśli podano wpisy
if ($ChangelogEntry) {
    Update-Changelog -Entry $ChangelogEntry -Version $CurrentVersion
}

if ($ReadmeEntry) {
    Update-Readme -Entry $ReadmeEntry -Version $CurrentVersion
}

# Sprawdź status git
Write-Host "📋 Sprawdzanie statusu git..." -ForegroundColor Yellow
$GitStatus = git status --porcelain

if ($GitStatus) {
    Write-Host "📁 Znalezione zmiany:" -ForegroundColor Yellow
    Write-Host $GitStatus
    
    # Dodaj wszystkie zmiany
    Write-Host "➕ Dodawanie wszystkich zmian do git..." -ForegroundColor Yellow
    git add .
    
    # Commit
    Write-Host "💾 Tworzenie commit..." -ForegroundColor Yellow
    git commit -m $CommitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Commit utworzony pomyślnie!" -ForegroundColor Green
        
        # Push jesli podano parametr -Push
        if ($Push) {
            Write-Host "🚀 Wypychanie na remote repository..." -ForegroundColor Yellow
            git push origin main
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Push wykonany pomyślnie!" -ForegroundColor Green
            } else {
                Write-Host "❌ Błąd podczas push" -ForegroundColor Red
                Write-Host "💡 Wykonaj ręcznie: git push origin main" -ForegroundColor Yellow
            }
        } else {
            Write-Host "💡 Aby wypchnąć zmiany wykonaj: git push origin main" -ForegroundColor Yellow
            Write-Host "💡 Lub użyj parametru -Push w następnym commicie" -ForegroundColor Yellow
        }
        
        Write-Host "🎉 Proces zakończony pomyślnie!" -ForegroundColor Green
    } else {
        Write-Host "❌ Błąd podczas tworzenia commit" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  Brak zmian do commitowania" -ForegroundColor Blue
}

Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "✅ Skrypt zakończony!" -ForegroundColor Green
