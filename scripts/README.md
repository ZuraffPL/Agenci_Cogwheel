# Cogwheel Syndicate - Development Scripts

Zbiór skryptów PowerShell do automatyzacji procesu developmentu systemu Cogwheel Syndicate.

## 📁 Dostępne Skrypty

### 1. `update-docs-and-commit.ps1` - Główny Skrypt Dokumentacji
Automatyzuje aktualizację dokumentacji i commitowanie zmian.

**Użycie:**
```powershell
.\scripts\update-docs-and-commit.ps1 -CommitMessage "🎨 New feature description" [-ChangelogEntry "..."] [-ReadmeEntry "..."] [-VersionBump "0.8.0"] [-Push]
```

**Parametry:**
- `CommitMessage` (wymagany) - Wiadomość commit
- `ChangelogEntry` (opcjonalny) - Wpis do CHANGELOG.md
- `ReadmeEntry` (opcjonalny) - Wpis do README.md
- `VersionBump` (opcjonalny) - Nowa wersja do system.json
- `Push` (opcjonalny) - Automatycznie wypchnij na GitHub po commit

**Przykład:**
```powershell
.\scripts\update-docs-and-commit.ps1 -CommitMessage "🎨 Enhanced UI styling" -ChangelogEntry "- Added steampunk styling to buttons" -ReadmeEntry "- **UI Improvements**: New steampunk button designs" -Push
```

### 2. `quick-commit.ps1` - Szybki Commit
Uproszczony skrypt do szybkiego commitowania bez aktualizacji dokumentacji.

**Użycie:**
```powershell
.\scripts\quick-commit.ps1 "commit message"
```

**Przykład:**
```powershell
.\scripts\quick-commit.ps1 "🐛 Fixed minor CSS bug"
```

### 3. `create-release.ps1` - Tworzenie Releaseów
Kompleksowy skrypt do tworzenia nowych releaseów z pełną dokumentacją.

**Użycie:**
```powershell
.\scripts\create-release.ps1 -Version "0.8.0" -Features "New features list" [-Changes "..."] [-Fixes "..."] [-AutoPush]
```

**Parametry:**
- `Version` (wymagany) - Numer wersji release
- `Features` (wymagany) - Lista nowych funkcji
- `Changes` (opcjonalny) - Lista zmian
- `Fixes` (opcjonalny) - Lista napraw
- `AutoPush` (opcjonalny) - Automatyczny push na GitHub

**Przykład:**
```powershell
.\scripts\create-release.ps1 -Version "0.8.0" -Features "- **New Combat System**: Enhanced dice rolling mechanics`n- **UI Overhaul**: Complete steampunk redesign" -Changes "- Improved performance" -Fixes "- Fixed dialog rendering issues" -AutoPush
```

### 4. `push-changes.ps1` - Wypychanie Zmian
Interaktywny skrypt do bezpiecznego wypychania lokalnych commitów na GitHub.

**Użycie:**
```powershell
.\scripts\push-changes.ps1
```

**Funkcje:**
- Pokazuje niepypchnięte commity
- Interaktywne potwierdzenie push
- Opcjonalne push tagów
- Sprawdzanie statusu synchronizacji

**Przykład:**
```powershell
.\scripts\push-changes.ps1
# Interaktywnie wybierasz co chcesz wypchnąć
```

## 🔧 Automatyzacja

### Workflow Developmentu:
1. **Wprowadź zmiany** w kodzie
2. **Użyj odpowiedniego skryptu** do commitowania:
   - `quick-commit.ps1` - dla drobnych zmian
   - `update-docs-and-commit.ps1` - dla znaczących funkcji z dokumentacją
   - `create-release.ps1` - dla nowych releaseów
3. **Wypchnij zmiany** na GitHub:
   - Dodaj `-Push` do `update-docs-and-commit.ps1`
   - Użyj `push-changes.ps1` dla interaktywnego push
   - `create-release.ps1` z `-AutoPush` wypchnie automatycznie

### Co Robią Skrypty Automatycznie:
- ✅ **Sprawdzają status git**
- ✅ **Dodają wszystkie zmiany** (`git add .`)
- ✅ **Tworzą commit** z odpowiednią wiadomością
- ✅ **Aktualizują dokumentację** (CHANGELOG.md, README.md)
- ✅ **Aktualizują wersję** w system.json (jeśli potrzeba)
- ✅ **Tworzą tagi git** dla releaseów
- ✅ **Automatyczny push** na GitHub (z odpowiednim parametrem)
- ✅ **Formatują wiadomości** zgodnie ze standardem

## 📋 Standardy Commitów

Skrypty używają emoji i kategoryzacji:
- 🎨 `:art:` - Improvements structure/format
- ✨ `:sparkles:` - New features
- 🐛 `:bug:` - Bug fixes
- 🔧 `:wrench:` - Configuration/tools
- 📚 `:books:` - Documentation
- 🚀 `:rocket:` - Releases
- 🌈 `:rainbow:` - Visual/styling improvements

## 🛠️ Wymagania

- PowerShell 5.0+
- Git zainstalowany i skonfigurowany
- Dostęp do zapisu w katalogu systemu
- Prawidłowa struktura plików (system.json, CHANGELOG.md, README.md)

## 📝 Notatki

- Skrypty automatycznie wykrywają i tworzą potrzebne katalogi
- Wszystkie zmiany są commitowane w jednym przebiegu
- Dokumentacja jest automatycznie formatowana zgodnie ze standardem
- Bezpieczne obsługiwanie istniejących tagów w releasach
