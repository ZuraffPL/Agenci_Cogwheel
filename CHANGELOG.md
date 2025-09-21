# Changelog | Historia Zmian

All notable changes to this project will be documented in this file in both English and Polish.  
Wszystkie istotne zmiany w projekcie są dokumentowane w tym pliku w języku angielskim i polskim.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Format oparty na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
projekt przestrzega [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] | [Nieopublikowane]

## [0.9.3] - 2025-01-27

**FOUNDRY VTT v13 DOM ACCESS FIX** | **NAPRAWA DOSTĘPU DO DOM FOUNDRY VTT v13**

### Fixed | Naprawione
- Fixed "Cannot read properties of null (reading 'setAttribute')" error in DoomClocksDialog when DOM element is not ready | Naprawiono błąd "Cannot read properties of null (reading 'setAttribute')" w DoomClocksDialog gdy element DOM nie jest gotowy
- Added null checks and error handling for DOM element access in clocks.mjs | Dodano sprawdzenia null i obsługę błędów dla dostępu do elementów DOM w clocks.mjs
- Improved robustness of dialog rendering in Foundry v13 | Zwiększono odporność renderowania dialogów w Foundry v13

## [0.9.2] - 2025-09-21

**FOUNDRY VTT v13 SCENE CONTROLS API FIX**

### 🔧 Fixed | Naprawione:
- **Scene Controls Error**: Fixed critical error "controls.find is not a function" in scene controls hook | **Błąd Kontrolek Sceny**: Naprawiono krytyczny błąd "controls.find is not a function" w hook'u kontrolek sceny
- **getSceneControlButtons Hook**: Updated for Foundry v13.332+ API changes | **Hook getSceneControlButtons**: Zaktualizowano dla zmian API Foundry v13.332+
- **Data Structure Migration**: Migrated from array-based to object-based controls structure | **Migracja Struktury Danych**: Przemigrowano ze struktury kontrolek opartej na array na strukturę obiektową

### 🔬 Technical Changes | Zmiany Techniczne:
- **Breaking API Change**: Foundry v13.332 changed `SceneControls#controls` from Array to Record/Object | **Przełomowa Zmiana API**: Foundry v13.332 zmienił `SceneControls#controls` z Array na Record/Object
- **Code Updates**: `controls.find()` → `controls.cogwheel`, `controls.push()` → `controls.cogwheel = {}` | **Aktualizacje Kodu**: `controls.find()` → `controls.cogwheel`, `controls.push()` → `controls.cogwheel = {}`

### 🎯 Impact | Wpływ:
- **Sidebar Controls**: Doom clocks and meta-currency tools now work correctly | **Kontrolki Sidebar**: Zegary zagłady i narzędzia meta-walut działają teraz poprawnie
- **System Loading**: Eliminates startup errors and failed UI initialization | **Ładowanie Systemu**: Eliminuje błędy startowe i nieudaną inicjalizację UI

## [0.9.1] - 2025-09-21

**FOUNDRY VTT v13 API COMPATIBILITY FIX**

### 🔧 Fixed | Naprawione:
- **Deprecated API Warnings**: Fixed all remaining Foundry v13 namespace warnings | **Ostrzeżenia przestarzałego API**: Naprawiono wszystkie pozostałe ostrzeżenia namespace'ów Foundry v13
  - Updated `ActorSheet` → `foundry.applications.sheets.ActorSheet` | Zaktualizowano `ActorSheet` → `foundry.applications.sheets.ActorSheet`
  - Updated `ItemSheet` → `foundry.applications.sheets.ItemSheet` | Zaktualizowano `ItemSheet` → `foundry.applications.sheets.ItemSheet`
  - Updated `Actors.registerSheet` → `foundry.documents.Actors.registerSheet` | Zaktualizowano `Actors.registerSheet` → `foundry.documents.Actors.registerSheet`
  - Updated `Items.registerSheet` → `foundry.documents.Items.registerSheet` | Zaktualizowano `Items.registerSheet` → `foundry.documents.Items.registerSheet`
- **Console Warnings**: Eliminated compatibility warnings in browser console | **Ostrzeżenia Konsoli**: Wyeliminowano ostrzeżenia kompatybilności w konsoli przeglądarki
- **Future Compatibility**: Prepared for Foundry VTT v15 when backward compatibility is removed | **Kompatybilność z Przyszłością**: Przygotowano na Foundry VTT v15 gdy backward compatibility zostanie usunięta

### 📁 Files Updated | Zaktualizowane Pliki:
- `actor-sheet.js`: Main agent sheet namespace updates | Główny arkusz agenta - aktualizacje namespace'ów
- `actor-sheetv2.js`: V2 agent sheet namespace updates | Arkusz agenta V2 - aktualizacje namespace'ów  
- `nemesis-sheet.js`: Nemesis sheet namespace updates | Arkusz nemesis - aktualizacje namespace'ów
- `hq-sheet.js`: HQ sheet namespace updates | Arkusz kwatery głównej - aktualizacje namespace'ów
- `item-sheet.js`: Archetype and feat sheet namespace updates | Arkusze archetypu i umiejętności - aktualizacje namespace'ów

## [0.9.0] - 2025-09-21

**FOUNDRY VTT v13 COMPATIBILITY RELEASE**

### 💥 Breaking Changes | Przełomowe Zmiany:
- **Foundry v13 Requirement**: System now requires Foundry VTT v13.348 or higher | **Wymaganie Foundry v13**: System wymaga teraz Foundry VTT v13.348 lub wyższej
- **jQuery Removal**: Complete migration from jQuery to native DOM API for Foundry v13 compatibility | **Usunięcie jQuery**: Kompletna migracja z jQuery na natywne API DOM dla kompatybilności z Foundry v13
- **Legacy Compatibility**: Use `foundry-v12-compat` branch for Foundry v12.331 support | **Kompatybilność Legacy**: Użyj gałęzi `foundry-v12-compat` dla wsparcia Foundry v12.331

### 🔧 Technical Modernization | Modernizacja Techniczna:
- **Native DOM API**: Replaced all `html.find()` with `querySelector()` and `querySelectorAll()` | **Natywne API DOM**: Zastąpiono wszystkie `html.find()` z `querySelector()` i `querySelectorAll()`
- **Event Handlers**: Converted jQuery `.click()`, `.change()` to `addEventListener()` | **Obsługa Zdarzeń**: Konwersja jQuery `.click()`, `.change()` na `addEventListener()`
- **Property Access**: Migrated `.val()`, `.is(':checked')`, `.data()` to native properties | **Dostęp do Właściwości**: Migracja `.val()`, `.is(':checked')`, `.data()` na natywne właściwości
- **Class Manipulation**: Replaced `.addClass()`, `.removeClass()` with `classList` API | **Manipulacja Klas**: Zastąpiono `.addClass()`, `.removeClass()` z API `classList`

### 📁 Files Updated | Zaktualizowane Pliki:
- **roll-mechanics.js**: Complete jQuery removal from dialog systems and button handlers | **roll-mechanics.js**: Kompletne usunięcie jQuery z systemów dialogów i obsługi przycisków
- **nemesis-sheet.js**: Migrated sheet activation and dialog callbacks | **nemesis-sheet.js**: Migracja aktywacji arkusza i callbacków dialogów
- **hq-sheet.js**: Updated headquarters management dialogs and event listeners | **hq-sheet.js**: Zaktualizowano dialogi zarządzania kwaterą główną i nasłuchiwanie zdarzeń
- **clocks.mjs**: Converted doom clocks interface to native DOM | **clocks.mjs**: Konwersja interfejsu zegarów zagłady na natywne DOM
- **feats-effects.mjs**: Updated feat selection dialogs | **feats-effects.mjs**: Zaktualizowano dialogi wyboru atutów
- **Equipment Functions**: Migrated all equipment management forms | **Funkcje Wyposażenia**: Migracja wszystkich formularzy zarządzania wyposażeniem

### 🌿 Branch Strategy | Strategia Gałęzi:
- **main**: Targets Foundry v13.348+ with native DOM API | **main**: Kieruje na Foundry v13.348+ z natywnym API DOM
- **foundry-v12-compat**: Preserves v0.8.1 for Foundry v12.331 compatibility | **foundry-v12-compat**: Zachowuje v0.8.1 dla kompatybilności z Foundry v12.331

### ⚠️ Migration Guide | Przewodnik Migracji:
- **Foundry v13 Users**: Update to this version for full compatibility | **Użytkownicy Foundry v13**: Zaktualizuj do tej wersji dla pełnej kompatybilności
- **Foundry v12 Users**: Switch to `foundry-v12-compat` branch | **Użytkownicy Foundry v12**: Przełącz się na gałąź `foundry-v12-compat`
- **No Data Loss**: All character data and game content remains compatible | **Brak Utraty Danych**: Wszystkie dane postaci i zawartość gry pozostają kompatybilne

## [0.8.1] - 2025-09-08

**SUPPORT FEAT SYSTEM RELEASE**

### 🤝 New Features | Nowe Funkcje:
- **Support Feat System**: Complete implementation of Support feat effect for Steam Agent archetype | **System Atutu Wsparcie**: Kompletna implementacja efektu atutu Wsparcie dla archetypu Agent Pary
- **Stacking Steam Points**: Each active Steam Agent with Support feat increases starting Steam Points by +1 | **Kumulowanie Punktów Pary**: Każdy aktywny Agent Pary z atutem Wsparcie zwiększa startowe Punkty Pary o +1
- **Active Player Detection**: Only counts Steam Agents with active (logged-in) player owners for balance | **Detekcja Aktywnych Graczy**: Liczy tylko Agentów Pary z aktywnymi (zalogowanymi) właścicielami dla balansu
- **Real-Time Synchronization**: Steam Points automatically update when feats are added/removed | **Synchronizacja w Czasie Rzeczywistym**: Punkty Pary automatycznie aktualizują się przy dodawaniu/usuwaniu atutów

### 🧹 Code Quality | Jakość Kodu:
- **Debug Cleanup**: Removed redundant debug logs for cleaner console output | **Oczyszczenie Debugów**: Usunięto nadmiarowe logi debugowania dla czystszego wyjścia konsoli
- **Performance Optimization**: Streamlined Support feat detection algorithms | **Optymalizacja Wydajności**: Usprawnienie algorytmów detekcji atutu Wsparcie
- **Enhanced Error Handling**: Improved error handling for feat system operations | **Ulepszona Obsługa Błędów**: Poprawiona obsługa błędów dla operacji systemu atutów

### 🎨 User Experience | Doświadczenie Użytkownika:
- **Visual Feedback**: Clear notifications when Support effects modify Steam Points | **Wizualny Feedback**: Wyraźne powiadomienia gdy efekty Wsparcia modyfikują Punkty Pary
- **Chat Integration**: Automatic chat messages for Support feat application/removal | **Integracja z Czatem**: Automatyczne wiadomości czatu dla zastosowania/usunięcia atutu Wsparcie
- **Full Internationalization**: Complete Polish/English support for Support feat messages | **Pełna Internacjonalizacja**: Kompletne wsparcie polsko/angielskie dla wiadomości atutu Wsparcie

## [0.8.0] - 2025-09-06

- **Code Cleanup**: Removed extensive debug logging from Progress Clocks system (75 lines reduced)
- **Production Ready**: Kept only essential logs for migration and error handling
- **Performance**: Improved performance by removing verbose console output
- **Maintainability**: Cleaner codebase with focused logging strategy



## [0.8.0] - 2025-09-06

**MAJOR RELEASE v0.8.0 - Progress Clocks Revolution**

### 🎯 New Features:
- Complete categorization system with Mission/Combat/Other tabs
- Dynamic window height adjustment (250px-600px)
- Smart state management and tab restoration
- Category-specific clock filtering

### 🛠️ Technical Improvements:
- Enhanced event handling and DOM synchronization
- Comprehensive debug system
- Improved user experience workflow
- Robust CSS hierarchy fixes

### 📋 Files Updated:
- system.json: Version bump to 0.8.0
- README.md: Updated feature descriptions
- CHANGELOG.md: Cleaned and consolidated release notes



## [0.8.0] - 2025-09-06

### Added | Dodano
- **Progress Clocks Categorization**: Added three independent tab system (Mission/Combat/Other) for organizing progress clocks | **Kategoryzacja Zegarów Postępu**: Dodano system trzech niezależnych zakładek (Misja/Walka/Inne) do organizacji zegarów postępu
- **Dynamic Window Height**: Window height automatically adjusts based on number of visible clocks in active category | **Dynamiczna Wysokość Okna**: Wysokość okna automatycznie dopasowuje się do ilości widocznych zegarów w aktywnej kategorii
- **Smart Tab Switching**: New clocks are added to currently active category tab | **Inteligentne Przełączanie Zakładek**: Nowe zegary są dodawane do aktualnie aktywnej kategorii
- **Category-Specific Filtering**: Each tab shows only clocks belonging to its category | **Filtrowanie Według Kategorii**: Każda zakładka pokazuje tylko zegary należące do jej kategorii

### Fixed | Naprawiono
- **CSS Selector Issues**: Fixed CSS hierarchy to properly target DOM elements for category filtering | **Problemy z Selektorami CSS**: Naprawiono hierarchię CSS aby właściwie targetować elementy DOM dla filtrowania kategorii
- **State Management**: Active category is now properly preserved between renders and operations | **Zarządzanie Stanem**: Aktywna kategoria jest teraz właściwie zachowywana między renderowaniem a operacjami
- **Tab Restoration**: System correctly restores active tab after adding new clocks | **Przywracanie Zakładek**: System poprawnie przywraca aktywną zakładkę po dodaniu nowych zegarów
- **Event Handling**: Improved programmatic event handling with safe preventDefault calls | **Obsługa Zdarzeń**: Ulepszona obsługa programowych zdarzeń z bezpiecznymi wywołaniami preventDefault

### Changed | Zmieniono
- **Window Sizing**: Compact view for few clocks (min 250px), expanded view for many clocks (max 600px) | **Rozmiar Okna**: Kompaktowy widok dla małej ilości zegarów (min 250px), rozszerzony dla wielu zegarów (max 600px)
- **User Experience**: Streamlined workflow for managing categorized progress clocks | **Doświadczenie Użytkownika**: Usprawnionyworkflow dla zarządzania skategoryzowanymi zegarami postępu

### Technical | Techniczne
- **Enhanced Debug System**: Comprehensive logging for troubleshooting category and state issues | **Rozszerzony System Debug**: Kompleksowe logowanie do rozwiązywania problemów z kategoriami i stanem
- **DOM Synchronization**: Improved synchronization between JavaScript state and DOM elements | **Synchronizacja DOM**: Ulepszona synchronizacja między stanem JavaScript a elementami DOM

## [0.7.9] - 2025-09-05

- **Clock Categories Bug Fix**: Fixed filtering logic to properly show only clocks from active category | **Naprawa Kategorii Zegarów**: Naprawiono logikę filtrowania aby właściwie pokazywać tylko zegary z aktywnej kategorii
- **Data Migration**: Added automatic category assignment for existing clocks (defaults to 'mission') | **Migracja Danych**: Dodano automatyczne przypisywanie kategorii dla istniejących zegarów (domyślnie 'mission')
- **CSS Improvements**: Simplified and fixed conflicting display rules for clock categories | **Usprawnienia CSS**: Uproszczono i naprawiono konflikty w regułach wyświetlania dla kategorii zegarów
- **Debug Support**: Added console logging for troubleshooting category switches | **Wsparcie Debug**: Dodano logowanie do konsoli dla rozwiązywania problemów z przełączaniem kategorii

## [0.7.9] - 2025-09-05

- **Git Configuration**: Fixed push automation and added safety measures | **Konfiguracja Git**: Naprawiono automatyzację push i dodano środki bezpieczeństwa
- **Enhanced Scripts**: Added -Push parameter to update-docs-and-commit.ps1 | **Rozszerzone Skrypty**: Dodano parametr -Push do update-docs-and-commit.ps1
- **New Script**: Added push-changes.ps1 for interactive push management | **Nowy Skrypt**: Dodano push-changes.ps1 do interaktywnego zarządzania push

## [0.7.9] - 2025-09-05

- **Initial Clock Categories**: Added preliminary support for progress clock categories | **Początkowe Kategorie Zegarów**: Dodano wstępne wsparcie dla kategorii zegarów postępu
- **Tab Interface**: Created tab-based UI for organizing clocks by type | **Interface Zakładek**: Stworzono interface oparty na zakładkach do organizacji zegarów według typu
- **Category Field**: Added category selection field to clock creation dialog | **Pole Kategorii**: Dodano pole wyboru kategorii do dialogu tworzenia zegara

## [0.7.8] - 2025-09-05

- **Enhanced Localization**: Updated Polish translations for better clarity | **Ulepszona Lokalizacja**: Zaktualizowano polskie tłumaczenia dla lepszej czytelności
- **Meta Currency Improvements**: Fixed display issues with meta currency system | **Usprawnienia Meta Waluty**: Naprawiono problemy z wyświetlaniem systemu meta waluty
- **UI Polish**: Various small improvements to user interface consistency | **Szlif UI**: Różne małe usprawnienia spójności interfejsu użytkownika

## [0.7.7] - 2025-09-04

- **Progress Clocks**: Enhanced progress clock system with better visual representation | **Zegary Postępu**: Usprawnionyystem zegarów postępu z lepszą reprezentacją wizualną
- **Socket Integration**: Improved real-time updates across multiple clients | **Integracja Socket**: Ulepszone aktualizacje w czasie rzeczywistym między wieloma klientami
- **Performance**: Optimized rendering performance for large number of clocks | **Wydajność**: Zoptymalizowano wydajność renderowania dla dużej liczby zegarów

## [0.7.6] - 2025-09-03

- **Bug Fixes**: Fixed various issues with clock persistence and display | **Naprawy Błędów**: Naprawiono różne problemy z trwałością i wyświetlaniem zegarów
- **Stability**: Improved overall system stability and error handling | **Stabilność**: Poprawiono ogólną stabilność systemu i obsługę błędów


