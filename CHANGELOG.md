# Changelog | Historia Zmian

All notable changes to this project will be documented in this file in both English and Polish.  
Wszystkie istotne zmiany w projekcie są dokumentowane w tym pliku w języku angielskim i polskim.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Format oparty na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
projekt przestrzega [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] | [Nieopublikowane]

### Added | Dodano
- **Clock Archive System** | **System Archiwum Zegarów**
  - Added archive button next to "Add Clock" button in clock dialog | Dodano przycisk archiwum obok przycisku "Dodaj Zegar" w oknie zegarów
  - Deleted clocks now move to archive instead of being permanently removed | Usunięte zegary trafiają teraz do archiwum zamiast być trwale usunięte
  - Archive dialog shows all deleted clocks with restore and permanent delete options | Dialog archiwum pokazuje wszystkie usunięte zegary z opcjami przywrócenia i trwałego usunięcia
  - Archived clocks display timestamp showing when they were archived | Zarchiwizowane zegary pokazują znacznik czasu kiedy zostały zarchiwizowane
  - Restore function returns clocks to active list in their original category | Funkcja przywracania zwraca zegary do aktywnej listy w ich oryginalnej kategorii
  - Multi-user synchronization for archive operations | Synchronizacja między użytkownikami dla operacji archiwum
  - Archive button visible only to GM users | Przycisk archiwum widoczny tylko dla GM
  - Full steampunk styling with horizontal layout (clock visual | details | buttons) | Pełna steampunkowa stylistyka z horyzontalnym układem (wizualizacja zegara | szczegóły | przyciski)

### Fixed | Naprawiono
- **Archive Dialog UI** | **UI Dialogu Archiwum**
  - Fixed archive dialog not applying steampunk styles | Naprawiono brak aplikacji steampunkowych stylów w dialogu archiwum
  - Fixed buttons positioned below clocks instead of on the right | Naprawiono przyciski umieszczone pod zegarami zamiast po prawej
  - Fixed dialog width not auto-adjusting to content | Naprawiono szerokość dialogu nie dostosowującą się do zawartości
  - Fixed archive and add clock buttons misalignment in toolbar | Naprawiono niewyrównanie przycisków archiwum i dodawania zegara w toolbarze

### Technical | Techniczne
- **Archive Settings** | **Ustawienia Archiwum**
  - Registered `archivedClocks` world setting in init.js | Zarejestrowano ustawienie world `archivedClocks` w init.js
  - Added `cogwheelSyndicateArchivedClocksUpdated` hook for archive synchronization | Dodano hook `cogwheelSyndicateArchivedClocksUpdated` dla synchronizacji archiwum
  - Socket type `updateArchivedClocks` for multi-user archive updates | Typ socket `updateArchivedClocks` dla aktualizacji archiwum między użytkownikami

- **Archive Functions** | **Funkcje Archiwum**
  - `_onDeleteClock()`: Modified to archive clocks with timestamp metadata | Zmodyfikowano aby archiwizować zegary ze znacznikiem czasu
  - `_onOpenArchive()`: Opens archive dialog using DialogV2 with inline styling | Otwiera dialog archiwum używając DialogV2 z inline stylami
  - `_onRestoreClock(index)`: Removes archive metadata and returns clock to active list | Usuwa metadane archiwum i zwraca zegar do aktywnej listy
  - `_onDeleteArchivedClock(index)`: Permanently deletes clock from archive | Trwale usuwa zegar z archiwum

- **UI Styling Approach** | **Podejście do Stylowania UI**
  - Triple-layer styling: CSS files + JavaScript _onRender() + inline styles in template | Trójwarstwowe stylowanie: pliki CSS + JavaScript _onRender() + style inline w szablonie
  - Direct DOM manipulation in _onRender() for dialog, header, content, and buttons | Bezpośrednia manipulacja DOM w _onRender() dla dialogu, nagłówka, contentu i przycisków
  - Inline styles in Handlebars template for guaranteed layout and colors | Style inline w szablonie Handlebars dla gwarantowanego layoutu i kolorów
  - DialogV2 positioning: width: auto, min-width: 650px, max-width: 950px | Pozycjonowanie DialogV2: szerokość: auto, min: 650px, max: 950px

- **UI Enhancements** | **Ulepszenia UI**
  - Created `clock-archive-dialog.hbs` template with SVG clock visualization | Utworzono szablon `clock-archive-dialog.hbs` z wizualizacją SVG zegarów
  - Added `.clock-toolbar` container for button layout with perfect alignment | Dodano kontener `.clock-toolbar` dla układu przycisków z idealnym wyrównaniem
  - Horizontal flexbox layout: [Clock SVG 80x80] | [Details flex-grow] | [Buttons fixed-width] | Horyzontalny layout flexbox: [SVG zegara 80x80] | [Szczegóły flex-grow] | [Przyciski stała szerokość]
  - Steampunk-styled archive button matching existing UI (removed margin-bottom) | Przycisk archiwum w stylu steampunk pasujący do istniejącego UI (usunięto margin-bottom)
  - Archive dialog with full steampunk gradient backgrounds and golden borders | Dialog archiwum z pełnymi gradientowymi tłami steampunk i złotymi obramowaniami
  - Green restore button (linear-gradient #2d4a2d → #3d5a3d) | Zielony przycisk przywracania (linear-gradient #2d4a2d → #3d5a3d)
  - Red delete button (linear-gradient #4a2d2d → #5a3d3d) | Czerwony przycisk usuwania (linear-gradient #4a2d2d → #5a3d3d)
  - Metallic sheen effect overlay on dialog content | Efekt metalicznego połysku na contencie dialogu

- **Translations** | **Tłumaczenia**
  - Added 13 new translation keys for archive feature (pl.json, en.json) | Dodano 13 nowych kluczy tłumaczeń dla funkcji archiwum (pl.json, en.json)
  - Keys: Archive, OpenArchive, ArchivedClocks, RestoreClock, DeletePermanently, ArchivedOn, NoArchivedClocks, ClockArchived, ClockRestored, ClockDeletedPermanently, Restore, Delete, Close

### Files Modified | Zmodyfikowane Pliki
- `src/scripts/init.js` - Added archivedClocks settings registration | Dodano rejestrację ustawień archivedClocks
- `src/scripts/clocks.mjs` - Archive system implementation with inline styling | Implementacja systemu archiwum z inline stylami
- `src/templates/doom-clocks-dialog.hbs` - Added archive button in toolbar | Dodano przycisk archiwum w toolbarze
- `src/templates/clock-archive-dialog.hbs` - New archive dialog template with inline styles | Nowy szablon dialogu archiwum z inline stylami
- `src/styles/clocks.css` - Archive dialog CSS (backup for inline styles) | CSS dialogu archiwum (backup dla inline stylów)
- `lang/pl.json` & `lang/en.json` - Archive translations | Tłumaczenia archiwum

## [0.9.19] - 2025-10-06

**REAL-TIME CLOCK SYNCHRONIZATION** | **SYNCHRONIZACJA ZEGARÓW W CZASIE RZECZYWISTYM**

### Fixed | Naprawiono
- **Real-time Clock Synchronization Across All Users** | **Synchronizacja Zegarów w Czasie Rzeczywistym Między Wszystkimi Użytkownikami**
  - Fixed clocks not updating immediately when GM makes changes (add/edit/delete/increment segments) | Naprawiono brak natychmiastowej aktualizacji zegarów gdy GM wprowadza zmiany (dodawanie/edycja/usuwanie/zmiana segmentów)
  - All clock operations now synchronize instantly without requiring window close/reopen | Wszystkie operacje na zegarach synchronizują się natychmiast bez potrzeby zamykania/otwierania okna
  - Socket broadcasting properly updates all connected users' clock dialogs | Socket broadcasting prawidłowo aktualizuje dialogi zegarów wszystkich podłączonych użytkowników
  - Active category (Mission/Campaign/Personal) is preserved during synchronization | Aktywna kategoria (Misja/Kampania/Osobiste) jest zachowywana podczas synchronizacji

### Technical | Techniczne
- **ApplicationV2 Instance Discovery** | **Wykrywanie Instancji ApplicationV2**
  - Added unique marker `_isCogwheelClocksDialog` to DoomClocksDialog class for reliable identification | Dodano unikalny marker `_isCogwheelClocksDialog` do klasy DoomClocksDialog dla niezawodnej identyfikacji
  - Replaced `instanceof` checks with marker-based detection (more reliable with module scoping) | Zamieniono sprawdzanie `instanceof` na detekcję opartą na markerze (bardziej niezawodne z module scoping)
  - Triple-layer instance search: `ui.windows` → `foundry.applications.instances` → `globalThis.foundry.applications.apps` | Trójwarstwowe wyszukiwanie instancji: `ui.windows` → `foundry.applications.instances` → `globalThis.foundry.applications.apps`

- **Socket Optimization** | **Optymalizacja Socketów**
  - Moved socket listener from `Hooks.once("setup")` to `Hooks.once("ready")` for guaranteed initialization | Przeniesiono nasłuchiwanie socketów z `Hooks.once("setup")` do `Hooks.once("ready")` dla gwarancji inicjalizacji
  - Added `isSocketUpdate` flag to prevent infinite socket broadcast loops | Dodano flagę `isSocketUpdate` aby zapobiec nieskończonym pętlom socketowym
  - Optimized non-GM users to only refresh UI without redundant settings saves | Zoptymalizowano użytkowników non-GM aby tylko odświeżali UI bez nadmiarowych zapisów ustawień
  - Reduced console logging to essential synchronization messages only | Zredukowano logowanie w konsoli do tylko istotnych komunikatów synchronizacji

- **Export and Global Access** | **Eksport i Globalny Dostęp**
  - Exported `DoomClocksDialog` class from clocks.mjs module | Wyeksportowano klasę `DoomClocksDialog` z modułu clocks.mjs
  - Added global `window.DoomClocksDialog` reference for cross-module compatibility | Dodano globalną referencję `window.DoomClocksDialog` dla kompatybilności między modułami

### Files Modified | Zmodyfikowane Pliki
- `src/scripts/clocks.mjs` - Real-time synchronization logic | Logika synchronizacji w czasie rzeczywistym
- `src/scripts/init.js` - DoomClocksDialog export and global registration | Eksport DoomClocksDialog i rejestracja globalna
- `TEST-CLOCKS-SYNC.md` - Updated test documentation with success confirmation | Zaktualizowana dokumentacja testów z potwierdzeniem sukcesu

## [0.9.18] - 2025-10-03

**INTERACTIVE CONSEQUENCE SELECTION SYSTEM** | **INTERAKTYWNY SYSTEM WYBORU KONSEKWENCJI**

### Added | Dodano
- **Interactive Consequence Selection Dialog** | **Interaktywny Dialog Wyboru Konsekwencji**
  - Added "Select Consequences" button below consequence messages in roll results | Dodano przycisk "Wybierz konsekwencje" pod komunikatami konsekwencji w wynikach rzutów
  - Implemented DialogV2-based selection interface with 10 predefined consequence types | Zaimplementowano interfejs wyboru oparty na DialogV2 z 10 predefiniowanymi typami konsekwencji
  - Real-time selection counter with color-coded feedback (blue/green/red) | Licznik wyboru w czasie rzeczywistym z kolorowym feedbackiem (niebieski/zielony/czerwony)
  - Automatic checkbox disabling when selection limit is reached | Automatyczne wyłączanie checkboxów po osiągnięciu limitu wyboru
  - Selection validation ensuring exact number of consequences chosen | Walidacja wyboru zapewniająca dokładną liczbę wybranych konsekwencji
  - Steampunk-styled chat message displaying selected consequences | Komunikat czatu w stylu steampunk wyświetlający wybrane konsekwencje
  - Button auto-disabling after selection to prevent duplicate choices | Automatyczne wyłączanie przycisku po wyborze aby zapobiec duplikacji

- **10 Consequence Types** | **10 Typów Konsekwencji**
  1. Attribute damage | Obrażenie w atrybut
  2. Lower fictional position | Obniżenie pozycji fikcyjnej
  3. Lose Gear points | Utrata punktów Sprzętu
  4. Lose Steam Points | Utrata Punktów Pary
  5. Increase Stress level | Podniesienie poziomu Stresu
  6. Advance threat clock | Podbicie zegara zagrożenia
  7. Reduce progress clock | Obniżenie zegara postępu
  8. Damage/drop equipment | Uszkodzenie/upuszczenie ekwipunku
  9. Negative roll modifier | Ujemny modyfikator do rzutu
  10. Additional narrative complication | Dodatkowa komplikacja fabularna

- **Consequence Selection Styling** | **Stylizacja Wyboru Konsekwencji**
  - Added `.select-consequences-btn` with steampunk gradient and golden border | Dodano `.select-consequences-btn` z gradientem steampunk i złotą ramką
  - Added `.selected-consequences-message` with steel/coal gradient background | Dodano `.selected-consequences-message` z tłem w gradiencie stali/węgla
  - Copper-colored gear icon bullets (⚙) for consequence lists | Punktory w postaci ikon kół zębatych w kolorze miedzi (⚙)
  - Blue highlighted agent names in consequence messages | Niebieskie wyróżnienie nazw agentów w komunikatach konsekwencji
  - Font size 1.3em matching main consequence messages | Rozmiar czcionki 1.3em dopasowany do głównych komunikatów konsekwencji

### Technical | Techniczne
- Modularized consequence logic in `consequences.mjs` module | Zmodularyzowano logikę konsekwencji w module `consequences.mjs`
- Implemented `showConsequencesSelectionDialog()` using DialogV2.wait() API | Zaimplementowano `showConsequencesSelectionDialog()` używając API DialogV2.wait()
- Fixed DialogV2 element access using `dialog.element` for DOM manipulation | Naprawiono dostęp do elementu DialogV2 używając `dialog.element` dla manipulacji DOM
- Fixed `currentRollTimestamp` reference error by moving declaration to callback start | Naprawiono błąd referencji `currentRollTimestamp` przez przeniesienie deklaracji na początek callbacku
- Added comprehensive bilingual translations for all consequence UI elements | Dodano kompleksowe dwujęzyczne tłumaczenia dla wszystkich elementów UI konsekwencji
- Enhanced consequences.css with button and message styling | Rozszerzono consequences.css o style przycisków i komunikatów

### Changed | Zmieniono
- Consequence system now interactive instead of passive display | System konsekwencji teraz interaktywny zamiast pasywnego wyświetlania
- Roll mechanics now generate unique timestamp-based button IDs early in callback | Mechanika rzutów teraz generuje unikalne ID przycisków oparte na timestampie wcześnie w callbacku

## [0.9.9] - 2025-09-22

### Fixed | Naprawione
- Fixed comprehensive Foundry v13 compatibility issues with complete Dialog to DialogV2 migration | Naprawiono kompleksowe problemy kompatybilności z Foundry v13 przez pełną migrację Dialog na DialogV2
- Fixed renderSceneControls hook jQuery compatibility by wrapping html in $(html) | Naprawiono kompatybilność jQuery hooka renderSceneControls przez owinięcie html w $(html)
- Replaced deprecated renderTemplate with foundry.applications.handlebars.renderTemplate in clocks.mjs | Zastąpiono przestarzały renderTemplate na foundry.applications.handlebars.renderTemplate w clocks.mjs
- Migrated Dialog to DialogV2 in DoomClocksDialog for add/edit clock functionality | Zmigrowano Dialog na DialogV2 w DoomClocksDialog dla funkcjonalności dodawania/edycji zegarów
- Fixed DialogV2 render callback errors by removing problematic target.querySelector usage | Naprawiono błędy callback render DialogV2 przez usunięcie problematycznego użycia target.querySelector
- Removed deprecated Dialog V1 usage throughout the system for Foundry v13+ compatibility | Usunięto przestarzałe użycie Dialog V1 w całym systemie dla kompatybilności z Foundry v13+
- Fixed scene controls onClick handlers not working by adding renderSceneControls hook | Naprawiono niedziałające handlery onClick kontrolek sceny przez dodanie hooka renderSceneControls
- Replaced deprecated Dialog with foundry.applications.api.DialogV2 for Foundry v13+ compatibility | Zastąpiono przestarzały Dialog na foundry.applications.api.DialogV2 dla kompatybilności z Foundry v13+
- Updated MetaCurrencyApp dialogs to use modern DialogV2.wait() pattern | Zaktualizowano dialogi MetaCurrencyApp do używania nowoczesnego wzorca DialogV2.wait()
- Fixed getSceneControlButtons hook to properly handle controls as object in Foundry v13 | Naprawiono hook getSceneControlButtons aby właściwie obsługiwał controls jako object w Foundry v13
- Replaced deprecated global renderTemplate with foundry.applications.handlebars.renderTemplate | Zastąpiono przestarzały globalny renderTemplate na foundry.applications.handlebars.renderTemplate
- Scene controls now properly register as object properties instead of array items | Kontrolki sceny teraz prawidłowo rejestrują się jako właściwości object zamiast elementów tablicy
- Fixed doom clocks window height adjustment not working properly in ApplicationV2 | Naprawiono nieprawidłowe dostosowywanie wysokości okna zegarów postępu w ApplicationV2
- Fixed scene controls buttons (meta-currency and doom clocks) not working after ApplicationV2 migration | Naprawiono przyciski kontrolek sceny (metawaluty i zegary postępu) niedziałające po migracji ApplicationV2
- Removed direct CSS manipulation in ApplicationV2 window resizing - now uses only setPosition | Usunięto bezpośrednią manipulację CSS w zmianie rozmiaru okien ApplicationV2 - teraz używa tylko setPosition
- Fixed ApplicationV2 jQuery compatibility issues by wrapping this.element in $() for DOM queries | Naprawiono problemy kompatybilności jQuery w ApplicationV2 przez owinięcie this.element w $() dla zapytań DOM
- Replaced deprecated renderChatMessage hook with renderChatMessageHTML for Foundry v13+ compatibility | Zastąpiono przestarzały hook renderChatMessage hookiem renderChatMessageHTML dla kompatybilności z Foundry v13+
- Fixed "this.element.find is not a function" errors in DoomClocksDialog methods | Naprawiono błędy "this.element.find is not a function" w metodach DoomClocksDialog
- Added extensive logging and fallback imports for better debugging of scene controls | Dodano obszerne logowanie i fallback imports dla lepszego debugowania kontrolek sceny
- Fixed positioning of dialogs after render to prevent undefined element errors | Naprawiono pozycjonowanie dialogów po renderze aby zapobiec błędom undefined element

### Note | Uwaga
- Dialog class deprecation warning exists but no V2 replacement available yet - will work until Foundry v16 | Ostrzeżenie deprecation klasy Dialog istnieje ale nie ma jeszcze zamiennika V2 - będzie działać do Foundry v16

## [0.9.8] - 2025-01-27

**FOUNDRY VTT v13 APPLICATIONV2 DOM AND POSITIONING FIXES** | **NAPRAWY DOM I POZYCJONOWANIA APPLICATIONV2 FOUNDRY VTT v13**

### Fixed | Naprawione
- Fixed "html.find is not a function" error by wrapping this.element in jQuery | Naprawiono błąd "html.find is not a function" przez owinięcie this.element w jQuery
- Fixed positioning errors in ApplicationV2 by using setPosition instead of constructor options | Naprawiono błędy pozycjonowania w ApplicationV2 używając setPosition zamiast opcji konstruktora
- Removed deprecated _updatePosition methods that conflicted with ApplicationV2 positioning | Usunięto przestarzałe metody _updatePosition które kolidowały z pozycjonowaniem ApplicationV2
- Fixed "Cannot read properties of undefined (reading 'width')" positioning error | Naprawiono błąd pozycjonowania "Cannot read properties of undefined (reading 'width')"
- Fixed "Cannot read properties of undefined (reading 'style')" by positioning after render | Naprawiono błąd "Cannot read properties of undefined (reading 'style')" przez pozycjonowanie po renderze

### Technical Details | Szczegóły techniczne
- ApplicationV2 passes native HTMLElement to _onRender, not jQuery object
- Position settings must be done via setPosition() method after render() completes
- jQuery wrapping required for backwards compatibility with existing code
- Element must exist before calling setPosition() in ApplicationV2

**Compatibility:** Foundry VTT v13.348+ | **Kompatybilność:** Foundry VTT v13.348+
**System Version:** 0.9.8

## [0.9.7] - 2025-01-27

**FOUNDRY VTT v13 HANDLEBARS MIXIN FIX** | **NAPRAWA HANDLEBARS MIXIN FOUNDRY VTT v13**

### Fixed | Naprawione
- Fixed "Application class is not renderable" error by adding HandlebarsApplicationMixin | Naprawiono błąd "Application class is not renderable" przez dodanie HandlebarsApplicationMixin
- Added required _renderHTML and _replaceHTML methods via HandlebarsApplicationMixin | Dodano wymagane metody _renderHTML i _replaceHTML przez HandlebarsApplicationMixin
- MetaCurrencyApp now properly extends HandlebarsApplicationMixin(ApplicationV2) | MetaCurrencyApp teraz prawidłowo rozszerza HandlebarsApplicationMixin(ApplicationV2)
- DoomClocksDialog now properly extends HandlebarsApplicationMixin(ApplicationV2) | DoomClocksDialog teraz prawidłowo rozszerza HandlebarsApplicationMixin(ApplicationV2)

### Technical Details | Szczegóły techniczne
- ApplicationV2 requires mixins to provide rendering functionality
- HandlebarsApplicationMixin provides template rendering for ApplicationV2
- Fixes abstract method implementation requirements

**Compatibility:** Foundry VTT v13.348+ | **Kompatybilność:** Foundry VTT v13.348+
**System Version:** 0.9.7

## [0.9.6] - 2025-01-27

**FOUNDRY VTT v13 APPLICATION V2 FIXES** | **NAPRAWY APPLICATION V2 FOUNDRY VTT v13**

### Fixed | Naprawione
- Fixed "Cannot add property left, object is not extensible" error in ApplicationV2 | Naprawiono błąd "Cannot add property left, object is not extensible" w ApplicationV2
- Updated position setting to use constructor options instead of direct property modification | Zaktualizowano ustawianie pozycji aby używać opcji konstruktora zamiast bezpośredniej modyfikacji właściwości
- Removed deprecated _updatePosition method | Usunięto przestarzałą metodę _updatePosition
- Fixed window positioning in ApplicationV2 framework | Naprawiono pozycjonowanie okien w frameworku ApplicationV2
- Improved render method calls for ApplicationV2 compatibility | Zwiększono kompatybilność wywołań metod render dla ApplicationV2

### Technical Details | Szczegóły techniczne
- Fixed immutable options object handling in ApplicationV2
- Removed manual DOM positioning in favor of framework positioning
- Updated render method usage for better compatibility

**Compatibility:** Foundry VTT v13.348+ | **Kompatybilność:** Foundry VTT v13.348+
**System Version:** 0.9.6

## [0.9.5] - 2025-01-27

**FOUNDRY VTT v13 APPLICATION V2 MIGRATION** | **MIGRACJA DO APPLICATION V2 FOUNDRY VTT v13**

### Fixed | Naprawione
- **BREAKING:** Migrated from deprecated Application V1 to ApplicationV2 framework | **PRZEŁOMOWE:** Zmigrowano z przestarzałego frameworka Application V1 do ApplicationV2
- Fixed "V1 Application framework is deprecated" warnings | Naprawiono ostrzeżenia "V1 Application framework is deprecated"
- Updated MetaCurrencyApp to use foundry.applications.api.ApplicationV2 | Zaktualizowano MetaCurrencyApp aby używało foundry.applications.api.ApplicationV2
- Updated DoomClocksDialog to use foundry.applications.api.ApplicationV2 | Zaktualizowano DoomClocksDialog aby używało foundry.applications.api.ApplicationV2
- Modernized event handling and DOM manipulation for V2 API | Zmodernizowano obsługę zdarzeń i manipulację DOM dla API V2

### Technical Details | Szczegóły techniczne
- Replaced `static get defaultOptions()` with `static DEFAULT_OPTIONS`
- Replaced `getData()` with `_prepareContext()` 
- Replaced `activateListeners()` with `_onRender()`
- Updated template system to use `static PARTS`
- Enhanced compatibility with Foundry VTT v13+ architecture

**Compatibility:** Foundry VTT v13.348+ | **Kompatybilność:** Foundry VTT v13.348+
**System Version:** 0.9.5

## [0.9.4] - 2025-01-27

**FOUNDRY VTT v13 DIALOG COMPATIBILITY FIX** | **NAPRAWA KOMPATYBILNOŚCI DIALOGÓW FOUNDRY VTT v13**

### Fixed | Naprawione
- Fixed DoomClocksDialog not initializing due to overly strict DOM checks | Naprawiono nieinicjalizację DoomClocksDialog z powodu zbyt restrykcyjnych sprawdzeń DOM
- Added fallback to jQuery selectors when native DOM queries fail | Dodano fallback do selektorów jQuery gdy natywne zapytania DOM nie działają
- Improved DOM element detection for different Foundry v13 dialog structures | Zwiększono wykrywanie elementów DOM dla różnych struktur dialogów w Foundry v13
- Restored full functionality of doom clocks dialog | Przywrócono pełną funkcjonalność dialogu zegarów zagłady

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


