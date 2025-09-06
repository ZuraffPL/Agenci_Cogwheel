# Changelog | Historia Zmian

All notable changes to this project will be documented in this file in both English and Polish.  
Wszystkie istotne zmiany w projekcie są dokumentowane w tym pliku w języku angielskim i polskim.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Format oparty na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
projekt przestrzega [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] | [Nieopublikowane]

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


