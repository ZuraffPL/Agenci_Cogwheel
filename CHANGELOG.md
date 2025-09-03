# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.7.6] - 2025-09-04

### Added
- **Steam Booster Effect for Tech Genius Archetype**: Complete implementation of Steam Booster feat effect
  - **Automatic Steam Points Doubling**: When Tech Genius archetype has "Dopalacz Pary" feat, attribute tests generate 2x Steam Points
  - **Visual Notifications**: Styled chat messages with steampunk theming announcing Steam Booster activation
  - **Perfect Compatibility**: Works seamlessly on both Agent v1 and Agent v2 character sheets
  - **Smart Detection**: Automatically detects Tech Genius archetype and Steam Booster feat combination
  - **Chat Integration**: Displays Steam Booster effects in chat with copper-themed styling matching other feat effects

### Enhanced
- **Feat Display System Improvements**: Complete visual overhaul of feat management interface
  - **Archetype Integration**: Added archetype selection dropdown to feat creation dialog
  - **Adaptive Column Width**: Feat names now display with dynamic width to prevent truncation
  - **Inline Archetype Display**: Shows archetype name next to feat type with steampunk styling
  - **Grid Layout Optimization**: Improved feat grid alignment, spacing, and visual hierarchy
  - **Section Header Standardization**: Consistent headers across feat management interface
  - **Enhanced Visual Polish**: Better typography, spacing, and steampunk aesthetic integration

### Fixed
- **Critical Agent v2 Compatibility Issue**: Resolved Steam Booster effect not working on Agent v2 sheets
  - **Root Cause**: Fixed incorrect feat access method - system uses `actor.system.feats` array of IDs, not `actor.items`
  - **Correct Implementation**: Now uses same feat resolution method as actor sheets (map IDs to items via `game.items.get()`)
  - **Universal Compatibility**: Steam Booster effects now work identically on both Agent v1 and Agent v2
  - **Comprehensive Debugging**: Added detailed logging system for feat detection and resolution
  - **Consistent Architecture**: Aligned with Cogwheel Syndicate's feat storage system using ID references

### Technical
- **Feat Effects Architecture Enhancement**: Improved `feats-effects.mjs` with proper feat access patterns
  - Changed from `actor.items.contents` to `actor.system.feats` array approach
  - Implemented same feat resolution method as `actor-sheet.js` and `actor-sheetv2.js`
  - Added comprehensive debugging infrastructure for feat detection issues
  - Maintained compatibility with existing feat effects (Steam Commando, Shadowmantle, etc.)
- **Module Loading Optimization**: Corrected module loading order to ensure proper initialization
- **Error Handling**: Enhanced error handling with detailed console logging for troubleshooting
- **Code Quality**: Improved code consistency and maintainability across feat effects system

## [0.7.5] - 2025-09-03

### Added
- **Feats Effects System**: Complete automated attribute modification system
  - **Steam Commando + Steam Augmentation**: Automatic Steel attribute +1 when "Parowy Komandos" archetype has "Parowa Augmentacja" feat (maximum value 6)
  - **Tech Genius + Tinkerer**: Automatic Machine attribute +1 when "Geniusz Techniki" archetype has "Majsterkowicz" feat (maximum value 6)
  - **Visual Notifications**: Chat messages with steampunk theming, Font Awesome icons, and color coding
  - **Smart Effect Management**: Automatic effect removal when feats are deleted or archetypes changed
  - **System Architecture**: `FeatsEffects` class with comprehensive API methods
  - **Integration**: Seamless integration with both Agent v1 and v2 sheets

### Changed
- **Complete System Terminology Consistency**: Renamed entire system from "advantage-effects" to "feats-effects"
  - **File Renaming**: `advantage-effects.mjs` → `feats-effects.mjs`, `ADVANTAGE_EFFECTS.md` → `FEATS_EFFECTS.md`
  - **API Methods**: All method names updated (`applyAdvantageEffects` → `applyFeatEffects`, etc.)
  - **CSS Classes**: Updated class names (`.advantage-effect-message` → `.feat-effect-message`)
  - **Language Files**: Corrected all keys from `COGSYNDICATE.AdvantageEffect` to `COGSYNDICATE.FeatEffect`
  - **Parameter Names**: Updated from `{advantageName}` to `{featName}` in language strings

### Enhanced
- **Visual Polish**: Enhanced feat effect messages with copper theming and steampunk aesthetic
- **Documentation**: Added comprehensive `FEATS_EFFECTS.md` with system architecture and implementation details
- **Code Quality**: Improved naming consistency across entire codebase

### Technical
- **Module Loading**: Updated `system.json` to load `feats-effects.mjs`
- **Actor Sheet Integration**: Both v1 and v2 sheets call feat effects on drop and delete operations
- **Language Support**: Complete Polish and English localization for all feat effects
- **CSS Styling**: Dedicated `.feat-effect-message` styling with steampunk theme

## [0.7.4] - 2025-09-02

### Added
- **Complete Resource Icon System**: Added distinctive icons for all agent resources
  - ⚙️ **Gear**: Copper colored cog icon for equipment and tools
  - ⚠️ **Stress**: Red warning triangle for danger and pressure indicators
  - 💀 **Trauma**: Purple skull icon for permanent psychological damage
  - Icons appear on both Agent v1 and v2 cards with consistent color coding
- **Enhanced Typography**: Increased font sizes for better readability
  - Main attribute labels increased to 16px with bold styling
  - Secondary attribute labels increased to 15px on Agent v1
  - Resource labels increased to 16px on both card versions
  - Improved text shadows and color contrast for steampunk aesthetic

### Fixed
- **Agent v2 Functionality Parity**: Complete synchronization with Agent v1 features
  - **Spend Stress**: Fixed missing trauma warnings, Steam Points integration, and comprehensive error handling
  - **Spend Gear**: Added different gear types (light, medium, heavy, very heavy) with Steam Points costs
  - **Gear Auto-Regeneration Bug**: Fixed gear points incorrectly regenerating to maximum after spending
  - **Resource Validation**: Proper distinction between 0 values and undefined states
- **UI Positioning**: Improved workspace layout and window management
  - Metacurrency window positioned in bottom-left corner with 250px height
  - Doom clocks window positioned in top-left corner (20px from edges)
  - Better screen real estate utilization for main workspace

### Enhanced
- **Visual Consistency**: Both agent card versions now have complete visual and functional parity
- **Steampunk Aesthetic**: Maintained copper/bronze color scheme while adding semantic color coding
- **User Experience**: Improved accessibility with larger fonts and distinctive iconography
- **Workspace Organization**: Optimized window positioning for better workflow

## [0.7.3] - 2025-09-02

### Fixed
- **Critical JavaScript Error**: Fixed "currentResult is not defined" error in success upgrade button functionality
  - Resolved variable name mismatch in roll-mechanics.js click handler
  - Success upgrade buttons now work correctly for both Agent v1 and v2 sheets
  - Proper Steam Points deduction and chat message display restored

### Changed
- **Atrybut "Maszyna" przemianowany na "Stal"**: 
  - Zmiana nazwy atrybutu z "Maszyna" na "Stal" w języku polskim
  - Zmiana nazwy atrybutu z "Machine" na "Steel" w języku angielskim
  - Zaktualizowane wszystkie interfejsy użytkownika i opisy archetypu
  - Zachowana kompatybilność z istniejącymi danymi postaci
- **Atrybut "Inżynieria" przemianowany na "Maszyna"**:
  - Zmiana nazwy atrybutu z "Inżynieria" na "Maszyna" w języku polskim
  - Zmiana nazwy atrybutu z "Engineering" na "Machine" w języku angielskim
  - Zaktualizowane wszystkie interfejsy użytkownika i opisy archetypu
  - Zachowana kompatybilność z istniejącymi danymi postaci (internal key "engineering" unchanged)

### Enhanced
- **Strategic Attribute Mapping**: Complete attribute restructuring for better consistency
  - Final attribute names: Stal (Steel), Maszyna (Machine), Intryga (Intrigue)
  - All character sheets, roll dialogs, and archetype descriptions updated
  - Full backward compatibility maintained with existing character data
- **Archetype Updates**: All archetype descriptions reflect new attribute naming
  - Parowy Komandos: Stal: 5, Maszyna: 1, Intryga: 3
  - Geniusz Techniki: Stal: 3, Maszyna: 5, Intryga: 1
  - Płaszcz Cienia: Stal: 1, Maszyna: 3, Intryga: 5
  - Agent Pary: Stal: 3, Maszyna: 3, Intryga: 3

### Technical
- **Language File Updates**: Comprehensive localization updates for both Polish and English
- **Template Updates**: All Handlebars templates updated with new attribute references
- **UI Consistency**: Unified naming convention across entire system interface
- **Data Integrity**: All internal data structures preserved for seamless compatibility

## [0.7.2] - 2025-08-28
- **Atrybut "Maszyna" przemianowany na "Stal"**: 
  - Zmiana nazwy atrybutu z "Maszyna" na "Stal" w języku polskim
  - Zmiana nazwy atrybutu z "Machine" na "Steel" w języku angielskim
  - Zaktualizowane wszystkie interfejsy użytkownika i opisy archetypu
  - Zachowana kompatybilność z istniejącymi danymi postaci
- **Atrybut "Inżynieria" przemianowany na "Maszyna"**:
  - Zmiana nazwy atrybutu z "Inżynieria" na "Maszyna" w języku polskim
  - Zmiana nazwy atrybutu z "Engineering" na "Machine" w języku angielskim
  - Zaktualizowane wszystkie interfejsy użytkownika i opisy archetypu
  - Zachowana kompatybilność z istniejącymi danymi postaci (internal key "engineering" unchanged)

## [0.7.2] - 2025-08-28

### Added
- **Complete Steampunk Theme Implementation**:
  - Kompletna przebudowa wizualna z spójną steampunkową paletą kolorów
  - Kolory: miedź (#cd7f32), stal (#c0c0c0-#d3d3d3), gradienty węglowe, piaskowy (#f4a460)
  - Steampunkowy styl sekcji archetypu na obu kartach agentów v1 i v2
  - Unifikacja sekcji notatek ze steampunkowym motywem na wszystkich arkuszach aktorów

### Enhanced
- **Roll Dialog Enhanced Styling**:
  - Kolorowe sekcje kości: kości stresu (czerwone), kości pary (niebieskie), kości diabelskie (stalowy gradient), trauma (fioletowe)
  - Naprawiono etykiety pozycji i modyfikatorów - teraz prawidłowo wyświetlają piaskowy kolor (#f4a460)
  - Ultra-specyficzne selektory CSS dla niezawodnego stylizowania etykiet
  - Tło sekcji kości diabelskich zmienione na ciemnoszary gradient stalowy

### Fixed
- **Trauma Text Formatting**:
  - Usunięto pogrubienie z tekstu prefiksu "Agent posiada traumę"
  - Zmieniono kolor tekstu prefiksu na czarny dla lepszej czytelności
  - Zachowano fioletowy styl dla wartości traumy
- **UI Consistency Improvements**:
  - Ulepszona hierarchia wizualna w oknach rzutów
  - Poprawiony kontrast tekstu i czytelność
  - Spójna steampunkowa estetyka w całym systemie

### Technical
- Dodano ultra-specyficzne selektory CSS dla etykiet .position-label i .modifier-label
- Modyfikacje plików językowych (pl.json, en.json) dla prawidłowego formatowania tekstu traumy
- Rozszerzone stylizowanie w plikach rolldialog.css, cogwheel.css, agent-v2.css
- Implementacja steampunkowych gradientów i efektów hover w całym systemie

## [0.7.1] - 2025-08-27

### Fixed
- **Funkcjonalność drag & drop archetypu**:
  - Naprawiono przeciąganie archetypu na kartę agenta - teraz poprawnie aktualizuje wartości atrybutów
  - Poprawiono wyświetlanie wartości atrybutów w sekcji archetypu (pokazuje liczby zamiast pustych pól)
  - Dodano obsługę starszego formatu danych archetypu dla kompatybilności wstecznej
- **Layout sekcji archetypu**:
  - Poprawiono pozycjonowanie CSS Grid dla lepszego wyśrodkowania atrybutów
  - Zmieniono proporcje kolumn na 1fr 2fr 60px dla lepszej równowagi
  - Naprawiono struktura HTML dla przypadku bez archetypu

### Technical
- Rozszerzono funkcje `_onDrop()` o kopiowanie wartości atrybutów z archetypu do aktora
- Dodano obsługę dwóch formatów danych: `item.system.attributes` i `item.data.attributes`
- Poprawiono szablony Handlebars: `{{attr}}` zamiast `{{attr.base}}` dla atrybutów archetypu
- Zoptymalizowano CSS Grid layout w `cogwheel.css` i `agent-v2.css`

## [0.7.0] - 2025-08-26

### Added
- **Czarci Targ (Devil's Bargain) - Nowa mechanika rzutów**:
  - Nowy checkbox "Czarci Targ - Dodaj 2 Punkty Nemezis do puli, by dodać 1d12 do rzutu" w oknie rzutu
  - Umieszczony między checkboxem Steam Die a Trauma
  - Dodaje 2 Punkty Nemezis do puli MG i dodatkową kość d12 ("devil dice") do rzutu
  - Wzajemne wykluczanie się z Steam Die - można używać maksymalnie jednego z nich na rzut
  - Maksymalna liczba kości pozostaje na poziomie 4d12: (2d12 + stress + steam) OR (2d12 + stress + devil)
  - Pełna kompatybilność z mechanikami krytycznych sukcesów i porażek
  - Devil dice uwzględniana we wszystkich obliczeniach (11s/12s, krytyczne sukces/porażka)

### Enhanced
- **Wizualne wskazywanie wzajemnego wykluczania**:
  - Zaznaczenie Devil Die wizualnie przekreśla Steam Die (i na odwrót)
  - Efekty wizualne: przygaszenie (opacity 0.5), line-through, czerwona linia przekreślająca
  - Tło zmienia się na szare, checkbox staje się nieaktywny z odpowiednim kursorem
  - Automatyczne przywracanie normalnego wyglądu po odznaczeniu
  - Charakterystyczna czerwona stylistyka dla checkbox Devil Die

- **Mechanika Reroll z Devil Die**:
  - Devil dice jest dołączana za darmo przy przerzucie testu (3PP)
  - Punkty Nemezis NIE są dodawane ponownie przy reroll (analogicznie do Steam Die)
  - Komunikaty wyraźnie oznaczają darmowe kości: "(za darmo)" / "(for free)"
  - Pełna integracja z istniejącym systemem przerzutów

- **Komunikaty na czacie**:
  - "Agent {imię} dodał do puli MG 2 Punkty Nemezis, by dodać kość Diabelskiego Targu"
  - Devil dice wyświetlana w sekcji szczegółowych wyników rzutu
  - Spójne formatowanie z resztą komunikatów o rzutach

### Enhanced - Stylizacja Archetypu
- **Jednolite style sekcji archetypu na kartach agenta i agenta v2**:
  - Eleganckie gradienty tła (szaro-fioletowa paleta)
  - Fioletowa ramka z zaokrąglonymi rogami i subtelnym cieniem
  - Efekty hover z animowaną linią świetlną
  - Stylizowany przycisk usuń z gradientem i efektami hover/active
  - Dopasowane rozmiary przycisku usuń (24x24px) dla lepszej proporcji
  - Identyczne style na obu typach kart agentów

### Fixed
- **Agent v2 - Kompletna rekonstrukcja funkcjonalności**:
  - Naprawiono sekcję Ekwipunek: koloryzacja, layout, tłumaczenia
  - Naprawiono sekcję Traumy: struktura, CSS klasy, tłumaczenia typu trauma
  - Naprawiono sekcję Notatki: struktura HTML, CSS klasy, layout flexbox
  - Wszystkie sekcje Agent v2 teraz mają identyczną funkcjonalność z oryginalną kartą agenta

### Technical
- Dodano tłumaczenia PL/EN dla Devil's Bargain functionality
- Rozszerzono `roll-mechanics.js` o obsługę Devil Die w obu głównych funkcjach
- Dodano dedykowane style CSS dla Devil Die w `rolldialog.css`
- Zaktualizowano logikę przypisywania wyników kości dla wszystkich kombinacji (3, 4, 5 kości)
- Poprawiono funkcję `executeRollWithData` dla prawidłowej obsługi Devil Die w reroll
- Stylizacja archetypu w plikach `cogwheel.css` i `agent-v2.css`

## [0.6.9] - 2025-08-25

### Added
- **Nowy typ aktora: Agent v2**:
  - Stworzono niezależną kopię karty agenta z dedykowanymi plikami (`actor-sheetv2.js`, `actor-sheetv2.hbs`)
  - Osobny template `agentv2Base` w `template.json` z własną strukturą danych
  - Dedykowany plik stylów `agent-v2.css` dla unikalnego wyglądu

### Changed
- **System obrażeń atrybutów w Agent v2**:
  - Usunięto atrybuty pochodne (Endurance, Control, Determination) - ukryte przez CSS
  - Dodano dynamiczne pola obrażeń pod każdym atrybutem głównym
  - Liczba pól obrażeń dostosowuje się automatycznie do wartości bazowej atrybutu (0 do -X)
  - Efektywna wartość atrybutu = wartość bazowa - obrażenia (zamiast bazowa + pochodna)
  - Pola obrażeń ułożone poziomo z etykietami pod spodem
  - Helper Handlebars `times` dla dynamicznego generowania pól

### Fixed
- **Sekcja Atutów w Agent v2**:
  - Naprawiono funkcjonalność drag&drop - atuty można teraz przeciągać z katalogu przedmiotów
  - Przywrócono pełną funkcjonalność sekcji atutów identyczną z oryginalną kartą agenta
  - Dodano brakujące style CSS dla prawidłowego wyświetlania atutów w układzie siatki
  - Poprawiono logikę _onDrop w JavaScript dla prawidłowego rozpoznawania targetów
  - Dodano brakujące tłumaczenia dla kluczy "COGSYNDICATE.FeatsDrop" i "COGSYNDICATE.NoFeats"
  - Naprawiono strukturę template'a dla pełnej kompatybilności z systemem atutów

### Technical
- Zaktualizowany `system.json` z importem nowych plików
- Rozszerzony `handlebars.mjs` o helper `times`
- Rejestracja arkusza `CogwheelActorSheetV2` jako domyślnego dla typu `agentv2`
- Osobna logika obliczania efektywnych atrybutów w Agent v2
- Zachowano kompatybilność z oryginalnym agentem
- Kompletna refaktoryzacja sekcji atutów w `actor-sheetv2.hbs`, `actor-sheetv2.js` i `agent-v2.css`
- Dodano tłumaczenia do plików `pl.json` i `en.json` dla Agent v2

## [0.6.8] - 2025-07-02

### Improved
- **Sekcja Atutów na karcie aktora**:
  - Atuty są teraz wyświetlane w osobnej zakładce między "Podstawowe" a "Wyposażenie"
  - Przejrzysty układ w siatce 3-kolumnowej z naprzemiennymi tłem dla lepszej widoczności
  - Nazwa atutu (po lewej, pogrubiona), typ (na środku) oraz mały, wyrównany do prawej przycisk usuwania
  - Opis i Efekt narracyjny są wyświetlane poniżej każdego atutu, jeśli są obecne
  - Obsługa przeciągnij-i-upuść z katalogu przedmiotów dla atutów
  - Atuty są teraz przechowywane jako odniesienia (ID) w `system.feats` i zawsze odzwierciedlają aktualne dane z odpowiadającego przedmiotu (na żywo)
  - Wizualne i funkcjonalne ulepszenia obszaru przeciągania i upuszczania
  - Wysokość karty automatycznie dopasowuje się do zawartości; brak niepotrzebnych pasków przewijania
  - Pełne tłumaczenie dla nowych elementów interfejsu w języku polskim i angielskim

### Technical
- Refaktoryzacja `actor-sheet.hbs`, `actor-sheet.js`, oraz dodane/zaktualizowane style w `feats.css` i `cogwheel.css`
- Zaktualizowana logika dodawania/usuwania atutów, przeciągania i upuszczania oraz synchronizacji danych na żywo
- Zaktualizowany `system.json` dla wersji 0.6.8

## [0.6.7] - 2025-07-02

### Added
- **Akcje Przybocznych/Nemezis w oknie wydawania Punktów Nemezis**:
  - Dodano nową sekcję "Akcje Przybocznych/Nemezis" z możliwością wydania dowolnej liczby PN (1-10)
  - Interaktywny input z automatycznym zaznaczaniem opcji przy kliknięciu
  - Walidacja wprowadzonej liczby punktów z komunikatami błędów
  - Specjalne formatowanie komunikatów na czacie dla akcji niestandardowych
  - Pełne tłumaczenia PL/EN dla nowej funkcjonalności

## [0.6.6] - 2025-07-02

### Added
- **Ograniczenie aktywności przycisków czatu tylko dla autora rzutu i GM**:
  - Przyciski "Podnieś poziom sukcesu za 2PP" i "Przerzuć test za 3PP" są teraz aktywne tylko dla autora rzutu i mistrza gry
  - Wizualne wskazania dla nieuprawnionych użytkowników - przyciski są wyłączone z tooltipem informującym o braku uprawnień
  - Nowy styl CSS `.disabled-for-user` dla przycisków wyłączonych z powodu uprawnień
  - Sprawdzanie uprawnień na poziomie obsługi kliknięć z komunikatami błędów
  - Automatyczne dodawanie ID użytkownika do przycisków czatu (`data-user-id`)

### Improved
- **Optymalizacja hookups renderowania czatu**: Połączono dwa hooki `renderChatMessage` w jeden dla lepszej wydajności
- **Tłumaczenia**: Dodano komunikaty PL/EN dla nowych funkcji uprawnień (`COGSYNDICATE.UpgradeButtonNoPermission`, `COGSYNDICATE.RerollButtonNoPermission`)

### Technical
- Funkcja `canUserInteractWithButton(authorUserId)` sprawdzająca uprawnienia użytkowników
- Rozszerzenie wszystkich przycisków czatu o atrybut `data-user-id`
- Automatyczne wyłączanie przycisków podczas renderowania dla nieuprawniony użytkowników

## [0.6.5] - 2025-07-02

### Added
- **Kompletny system wydawania punktów Nemezis (PN)**:
  - Okno dialogowe "Wydaj PN" z trzema sekcjami: "Akcje za 1 PN", "Akcje za 2 PN", "Akcje za 3 PN"
  - 10 różnych akcji do wyboru z radiobuttonami zgodnie z mechaniką gry
  - Automatyczne sprawdzanie stanu puli PN przed wydatkowaniem
  - Dialog błędu "Za mało Punktów Nemezis w Puli" z czerwonym, pogrubionym tekstem
  - Automatyczne odejmowanie punktów z puli po wykonaniu akcji
  - Komunikaty na czacie z nazwą użytkownika, ilością wydanych punktów i opisem akcji (z pogrubieniami i kolorami)

- **Przyciski wydawania metawalut w oknie metawalut**: 
  - Dodano przycisk "Wydaj PN" (Punkty Nemezis) - dostępny tylko dla GM i Assistant GM
  - Dodano przycisk "Wydaj PP" (Punkty Pary) - dostępny dla wszystkich użytkowników
  - **Kontrola uprawnień**: Przycisk "Wydaj PN" automatycznie wyłączany dla użytkowników bez odpowiednich uprawnień

- **Automatyczne dostosowanie rozmiarów okien**:
  - Okna dialogowe używają flexbox dla płynnego dopasowania do zawartości
  - Usunięto niepotrzebne paski przewijania
  - Przyciski "Anuluj" i "Wydaj punkty" umieszczone obok siebie (Anuluj po lewej)

### Fixed
- **Poprawiona matematyka pul metawalut**: Zmieniono `||` na `??` w getData() aby wartości mogły zejść do 0
- **Działające przyciski "Anuluj"**: Przeszło na standardowe przyciski Foundry VTT zamiast niestandardowych
- **Lokalizacja komunikatów**: Zastąpiono hardcoded teksty polskie kluczami tłumaczeń

### Enhanced
- **Stylizacja okien dialogowych**: 
  - Dedykowane style CSS dla różnych typów punktów (czerwone dla PN, niebieskie dla PP)
  - Usunięto zbędne odstępy między sekcjami a przyciskami
  - Lepsze wizualne oddzielenie sekcji akcji
- **Tłumaczenia**: Kompletne tłumaczenia PL/EN wszystkich nowych elementów i komunikatów

### Technical
- Dodano szablony `spend-np-dialog.hbs` i `spend-sp-dialog.hbs` 
- Rozszerzono `MetaCurrencyApp` o pełną obsługę wydawania PN
- Dodano nowe pliki CSS: `meta-currency.css` i `spend-points-dialog.css`
- Zoptymalizowano strukturę flexbox dla lepszej responsywności okien

## [0.6.4] - 2025-06-26

### Added
- **Przycisk "Wydaj Stres"**: Nowa funkcjonalność wydawania punktów stresu
  - Dodano przycisk w sekcji zasobów agenta pod zasobem stresu
  - **Sekcja 1 Punkt Stresu**: Obniż/odrzuć konsekwencję w pozycji kontrolowanej
  - **Sekcja 2 Punkty Stresu**: 
    - Obniż/odrzuć konsekwencję w pozycji ryzykownej
    - Dodaj 1 Punkt Pary do Puli Drużyny (+2 PS agenta + 1 PP do puli)
    - Pomoc innemu Agentowi
  - **Sekcja 3 Punkty Stresu**: Obniż/odrzuć konsekwencję w pozycji desperackiej
  - **Obsługa traumy**: Gdy wydanie stresu spowodowałoby przekroczenie maksimum, wyświetlane jest ostrzeżenie o traumie
  - **Automatyczna trauma**: Po potwierdzeniu agent otrzymuje traumę, stres resetuje się do nadmiarowej wartości
  - **Komunikaty na czat**: Każda akcja generuje odpowiedni komunikat z informacją o traumie (jeśli wystąpiła)

### Enhanced
- **Integracja z systemem metawalut**: Opcja "Dodaj do Puli Drużyny 1 Punkt Pary" automatycznie synchronizuje punkty pary
- **Logika traumy**: Spójny system obsługi traumy podobny do mechaniki rzutów z kością stresu
- **Stylizacja**: Nowe style CSS w osobnym pliku `spend-stress.css` z kolorystyką dopasowaną do stresu
- **Tłumaczenia**: Pełne wsparcie dla języka polskiego i angielskiego

### Technical
- Dodano szablon `spend-stress-dialog.hbs` dla okna dialogowego
- Dodano style `spend-stress.css` zintegrowane w `system.json`
- Rozszerzono funkcjonalność `actor-sheet.js` o funkcję `_onSpendStress()`
- Dodano funkcję `executeStressAction()` z obsługą traumy i komunikatów
- Dodano tłumaczenia do plików `pl.json` i `en.json`

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
  - **Parowy Komandos**: Stal: 5, Maszyna: 1, Intryga: 3 (specjalista walki z technologią parową)
  - **Geniusz Techniki**: Stal: 3, Maszyna: 5, Intryga: 1 (mistrz wynalazków i konstrukcji)
  - **Płaszcz Cienia**: Stal: 1, Maszyna: 3, Intryga: 5 (ekspert szpiegowstwa i manipulacji)
  - **Agent Pary**: Stal: 3, Maszyna: 3, Intryga: 3 (wszechstronny agent)

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
