# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.3] - 2025-06-26

### Added
- **Przycisk "Przerzuć test za 3PP"**: Nowa funkcjonalność przerzucania testów
  - Nowy niebieski przycisk pod przyciskiem podnoszenia sukcesu
  - Koszt: 3 Punkty Pary z puli metawalut
  - Wykonuje ponowny rzut z identycznymi parametrami jak oryginalny test
  - Kości stresu/pary z oryginalnego testu są dołączone za darmo (bez dodatkowych kosztów)
  - Przycisk aktywny tylko dla ostatniego rzutu danego agenta
  - Komunikaty wyraźnie oznaczają darmowe kości: "za darmo" / "for free"
  - System automatycznie wyłącza stare przyciski przy nowych rzutach

### Enhanced
- **Kompaktowe przyciski**: Zmniejszono wysokość wszystkich przycisków (padding: 3px 6px)
- **Spójność kolorystyczna**: Wszystkie przyciski używają czarnego tekstu dla lepszej czytelności
- **Logika aktywności przycisków**: Oba przyciski (upgrade i reroll) działają tylko dla ostatniego rzutu
- **Stany wizualne przycisków**: Aktywny, użyte, przestarzałe - z odpowiednimi kolorami i komunikatami

## [0.6.2] - 2025-06-26

### Fixed
- **Ulepszenia funkcji podnoszenia sukcesu**: Poprawiono logikę aktywności przycisków podnoszenia sukcesu
  - Przycisk podnoszenia poziomu jest teraz aktywny tylko dla ostatniego rzutu danego agenta
  - Wszystkie starsze przyciski są automatycznie wyłączane przy każdym nowym rzucie (niezależnie od wyniku)
  - System śledzenia zapobiega podnoszeniu poziomu sukcesu starszych rzutów, nawet gdy ostatni test zakończył się pełnym sukcesem
  - Dodano rozróżnienie wizualne stanów przycisków: aktywny (pomarańczowy), użyte (zielony), przestarzałe (szary)

### Enhanced
- **Komunikat podniesienia sukcesu**: Dodano informację o testowanym atrybucie
  - **Polski**: "Agent {nazwa} podniósł poziom sukcesu z {stary} na {nowy} w teście {atrybut}"
  - **Angielski**: "Agent {nazwa} upgraded success level from {stary} to {nowy} in {atrybut} test"
  - Nazwa testowanego atrybutu jest wyświetlana w kolorze fioletowym z pogrubieniem
  - Ulepszone komunikaty o błędach z bardziej precyzyjnymi opisami

### Technical
- Rozszerzony system śledzenia rzutów z wykorzystaniem timestampów
- Dodano funkcję `disableAllUpgradeButtonsForActor()` do automatycznego wyłączania starszych przycisków
- Poprawiono walidację aktualności przycisków (trójstopniowa weryfikacja: istnienie, ID, timestamp)
- Dodano style CSS dla różnych stanów przycisków (.success-upgrade-button-used, .success-upgrade-button-outdated)

## [0.6.1] - 2025-06-26

### Added
- **Compendium Pack dla Archetypów**: Automatyczne dostarczanie gotowych archetypów po instalacji systemu
  - Archetypy są teraz dostępne w zakładce Compendium Packs w Foundry VTT
  - Użytkownicy mogą przeciągać archetypy bezpośrednio z pakietu do aktorów
  - **Nowe archetypy**: Parowy Komandos, Geniusz Techniki, Płaszcz Cienia, Agent Pary
  - Zbalansowane atrybuty główne dla każdego archetypu
  - Wielojęzyczne etykiety dla compendium pack (PL/EN)

### Changed
- **Zaktualizowane archetypy**: Zastąpiono stare archetypy (Mechanik, Inżynier, Szpieg) nowymi, bardziej zbalansowanymi
  - **Parowy Komandos**: Maszyna: 5, Inżynieria: 1, Intryga: 3 (specjalista walki z technologią parową)
  - **Geniusz Techniki**: Maszyna: 3, Inżynieria: 5, Intryga: 1 (mistrz wynalazków i konstrukcji)
  - **Płaszcz Cienia**: Maszyna: 1, Inżynieria: 3, Intryga: 5 (ekspert szpiegowstwa i manipulacji)
  - **Agent Pary**: Maszyna: 3, Inżynieria: 3, Intryga: 3 (wszechstronny agent)

### Technical
- Dodano konfigurację `packs` do system.json
- Dodano tłumaczenia dla nazwy compendium pack
- Skonfigurowano uprawnienia dostępu do pakietu (PLAYER: OBSERVER, ASSISTANT: OWNER)

## [0.6.0] - 2025-06-26

### Added
- **Automatic README Updates**: Workflow automatycznie aktualizuje README.md z najnowszymi zmianami
  - Automatyczne wyciąganie kluczowych zmian z CHANGELOG.md
  - Commitowanie i pushowanie zmian przed tworzeniem release'a
  - Aktualizacja sekcji changelog w README.md
- **Manifest URL**: Dodano poprawny manifest URL do README.md dla łatwej instalacji

### Technical
- Rozszerzono GitHub Actions workflow o automatyczną aktualizację dokumentacji
- README.md jest teraz automatycznie synchronizowany z changelog'iem

## [0.5.9] - 2025-06-26

### Fixed
- **GitHub Actions Workflow**: Naprawiono parsowanie changelog'a w automatycznych release'ach
  - Poprawiono ekstrakcję release notes z CHANGELOG.md
  - Dodano lepszy debug output
  - Naprawiono problem z wyświetlaniem zmiennych w opisie release'a

### Added
- **Manual Release Workflow**: Dodano alternatywny workflow do ręcznego tworzenia release'ów
  - Możliwość uruchomienia z GitHub Actions UI
  - Używa GitHub CLI dla lepszej niezawodności
  - Opcjonalne podanie wersji lub auto-detect z system.json

## [0.5.8] - 2025-06-26

### Added
- **Automated Release System**: GitHub Actions workflow dla automatycznych release'ów
  - Automatyczne wykrywanie zmian wersji w system.json
  - Tworzenie release'ów z odpowiednimi tagami
  - Automatyczne generowanie zip'ów z systemem
  - Wyciąganie informacji z CHANGELOG.md
  - Dodawanie assets (zip, system.json) do release'a

### Technical
- Dodano `.github/workflows/release.yml` dla automatyzacji deploymentu
- Workflow uruchamia się tylko przy zmianie pliku system.json na branchu main
- Zabezpieczenie przed duplikacją release'ów (sprawdzanie czy tag już istnieje)

## [0.5.7] - 2025-06-26

### Added
- **Success Level Upgrade System**: Nowa funkcjonalność pozwalająca na podnoszenie poziomu sukcesu za punkty pary
  - Przycisk "Podnieś poziom sukcesu za 2PP" pojawia się przy wynikach "Porażka z konsekwencją" i "Sukces z kosztem"
  - Automatyczne sprawdzanie dostępności punktów pary w puli (wymaga minimum 2 punktów)
  - Podnoszenie poziomu: Porażka z konsekwencją → Sukces z kosztem, Sukces z kosztem → Pełny sukces
  - Kolorowe komunikaty zgodne z systemem kolorów wyników rzutów
  - Wyświetlanie komunikatu o błędzie gdy brakuje punktów pary
  - Przycisk automatycznie się dezaktywuje po użyciu

### Changed
- Ulepszone wyświetlanie komunikatów o rzutach z możliwością interakcji
- Dodano nowe tłumaczenia dla funkcjonalności podnoszenia sukcesu (PL/EN)

### Technical
- Dodano nowy plik CSS `success-upgrade.css` dla stylizacji przycisków
- Nowe hooki obsługujące kliknięcia przycisków w wiadomościach czatu
- Rozszerzona funkcja `performAttributeRoll` o obsługę przycisków upgradu
- Nowa funkcja pomocnicza `upgradeSuccessLevel` do zarządzania podnoszeniem sukcesu

## [0.5.6] - 2025-06-26

### Added
- Initial release of Agenci Cogwheel system for Foundry VTT
- Complete character sheet system for players and NPCs
- Headquarters (HQ) management system
- Nemesis tracking system with dedicated sheets
- Comprehensive equipment and gear management
- Trauma system for tracking character psychological state
- Built-in clock system for mission and event tracking
- Meta currency system for special game mechanics
- Multilingual support (English and Polish)
- Integrated dice rolling mechanics
- Handlebars templates for all UI components
- CSS styling for modern and intuitive interface

### Features
- **Actor Types**: Support for multiple actor types including PCs, NPCs, and HQs
- **Item System**: Complete item management for equipment, feats, and archetypes
- **Clock Mechanics**: Visual progress tracking for missions and story elements
- **Equipment Points**: Dynamic equipment management system
- **Spend Gear System**: Resource management mechanics
- **Dialog Systems**: Interactive dialogs for various game actions
- **Archetype System**: Pre-built character archetypes with compendium support

### Technical
- Compatible with Foundry VTT v12+
- Verified compatibility with Foundry VTT v12.331
- ES6 module architecture
- Responsive CSS design
- Font Awesome icon integration
- Modular JavaScript structure

### Documentation
- Comprehensive README.md with installation instructions
- MIT License included
- GitHub repository integration for easy updates
