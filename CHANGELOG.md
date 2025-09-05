# Changelog | Historia Zmian

All notable changes to this project will be documented in this file in both English and Polish.  
Wszystkie istotne zmiany w projekcie są dokumentowane w tym pliku w języku angielskim i polskim.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Format oparty na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
projekt przestrzega [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] | [Nieopublikowane]

## [0.7.9] - 2025-09-06

- **CSS Fix**: Completely rewrote clock filtering CSS with !important rules for proper category visibility
- **Debug Enhancement**: Added comprehensive console logging to track clock categories and visibility
- **Logic Improvement**: Simplified CSS rules - show only active category, hide others explicitly



## [0.7.9] - 2025-09-05

- **Clock Categories Bug Fix**: Fixed filtering logic to properly show only clocks from active category
- **Data Migration**: Added automatic category assignment for existing clocks (defaults to 'mission')
- **CSS Improvements**: Simplified and fixed conflicting display rules for clock categories
- **Debug Support**: Added console logging for troubleshooting category switches



## [0.7.9] - 2025-09-05

- **Git Configuration**: Fixed push automation and added safety measures
- **Enhanced Scripts**: Added -Push parameter to update-docs-and-commit.ps1
- **New Script**: Added push-changes.ps1 for interactive push management
- **Git Settings**: Configured push.default=simple and proper upstream tracking



## [0.7.9] - 2025-09-05

- **Progress Clocks Tabs**: Added category tabs (Mission, Combat, Other) to organize progress clocks by type
- **Enhanced Clock Creation**: New clocks are automatically assigned to the active tab category
- **Improved UX**: Easy switching between different clock categories with visual tab indicators



## [0.7.9] - 2025-09-05

- **Development Tools**: Added PowerShell automation scripts for consistent documentation updates and release management



## [0.7.9] - 2025-09-05

### Added | Dodano
- **Trauma Toggle & Collapse System | System Zwijania/Rozwijania Traum**: Implemented collapsible trauma sections matching equipment functionality | Zaimplementowano zwijanie sekcji traum odpowiadające funkcjonalności ekwipunku
  - **Toggle Buttons | Przyciski Toggle**: Added chevron icons for expand/collapse trauma details with smooth animations | Dodano ikony chevron do rozwijania/zwijania szczegółów traum z płynnymi animacjami
  - **Type-Specific Icons | Ikony Specyficzne dla Typów**: FontAwesome icons for trauma types: `fa-heart-broken` (Physical), `fa-head-side-virus` (Psychological), `fa-brain` (Mental) | Ikony FontAwesome dla typów traum: `fa-heart-broken` (Fizyczna), `fa-head-side-virus` (Psychiczna), `fa-brain` (Umysłowa)
  - **Steampunk Styling | Styling Steampunkowy**: Purple gradient backgrounds with metallic effects for all trauma types | Fioletowe gradienty tła z metalicznymi efektami dla wszystkich typów traum
  - **Inline Actions | Akcje w Linii**: Moved edit/delete buttons to trauma header with "|" separator for compact layout | Przeniesiono przyciski edycji/usuwania do nagłówka traumy z separatorem "|" dla kompaktowego układu

- **Progress Clocks Visual Overhaul | Przebudowa Wizualna Zegarów Postępu**: Complete steampunk redesign of the Progress Clocks application | Kompletna przebudowa steampunkowa aplikacji Zegarów Postępu
  - **Steampunk Dialog Background | Steampunkowe Tło Dialogu**: Brown-gold gradient background with metallic shine effects | Brązowo-złoty gradient tła z metalicznymi efektami połysku
  - **Enhanced Add Button | Ulepszony Przycisk Dodawania**: Clock icon, increased width (180px), steampunk gradient styling with hover effects | Ikona zegara, zwiększona szerokość (180px), steampunkowy gradient z efektami hover
  - **Multi-Color Clock Backgrounds | Wielokolorowe Tła Zegarów**: 8 different steampunk gradient backgrounds for visual distinction | 8 różnych steampunkowych gradientów tła dla wizualnego rozróżnienia
    - **Color Variants | Warianty Kolorystyczne**: Bronze, Purple-Gold, Green-Olive, Orange-Rust, Mystical Purple, Red-Brown, Steel Blue, Military Khaki | Brązowy, Fioletowo-Złoty, Zielono-Oliwkowy, Pomarańczowo-Rdzawy, Mistyczny Fioletowy, Czerwono-Brązowy, Stalowo-Niebieski, Khaki Militarny
  - **Enhanced Typography | Ulepszona Typografia**: Color-matched text with enhanced text-shadow for better readability | Dopasowane kolory tekstu z wzmocnionymi cieniami dla lepszej czytelności

### Changed | Zmieniono
- **Trauma Details Layout | Layout Szczegółów Traumy**: Restructured trauma description and effect display | Przestrukturyzowano wyświetlanie opisu i efektu traumy
  - **Separate Sections | Osobne Sekcje**: Description and effect now in individual labeled sections with frames | Opis i efekt teraz w osobnych oznakowanych sekcjach z ramkami
  - **Visual Distinction | Wizualne Rozróżnienie**: Different colored left borders (purple accents) and hover effects | Różne kolorowe lewe ramki (fioletowe akcenty) i efekty hover
  - **Bold Labels | Pogrubione Etykiety**: Clear section labels with dashed underlines for better organization | Wyraźne etykiety sekcji z przerywanym podkreśleniem dla lepszej organizacji

### Fixed | Naprawiono
- **Dialog Dropdown Height | Wysokość Dropdown w Dialogu**: Fixed trauma type dropdown options display in add/edit dialog | Naprawiono wyświetlanie opcji dropdown typu traumy w dialogu dodawania/edycji
  - **Improved Visibility | Lepsza Widoczność**: Increased option height and padding for better text visibility | Zwiększono wysokość opcji i padding dla lepszej widoczności tekstu
  - **Enhanced Styling | Lepszy Styling**: Better font size, line-height, and Foundry VTT compatibility | Lepszy rozmiar czcionki, line-height i kompatybilność z Foundry VTT

### Technical | Techniczne
- **V1/V2 Consistency | Spójność V1/V2**: All trauma enhancements implemented consistently across both actor sheet versions | Wszystkie ulepszenia traumy zaimplementowane spójnie w obu wersjach kart aktora
- **Event Handlers | Obsługa Wydarzeń**: Added `_onToggleTrauma()` JavaScript functions for collapse functionality | Dodano funkcje JavaScript `_onToggleTrauma()` dla funkcjonalności zwijania
- **CSS Organization | Organizacja CSS**: Enhanced trauma-types.css with modular styling for better maintainability | Ulepszono trauma-types.css z modułowym stylingiem dla lepszej łatwości utrzymania

## [0.7.8] - 2025-09-04

### Added | Dodano
- **Trauma Section UI Modernization | Modernizacja UI Sekcji Traumy**: Complete visual overhaul matching equipment section design | Kompletna przebudowa wizualna dopasowana do designu sekcji ekwipunku
  - **Archetype-Style Background | Tło w Stylu Archetypu**: Applied `.archetype-section` class to trauma sections in both V1 and V2 | Zastosowano klasę `.archetype-section` w sekcjach traumy w V1 i V2
  - **Steampunk Gradient | Gradient Steampunkowy**: Brown-gold gradient background with golden borders and shadow effects | Brązowo-złoty gradient tła ze złotymi ramkami i efektami cienia
  - **Purple Skull Icon | Fioletowa Ikona Czaszki**: Added distinctive `fa-skull` icon with purple color (#8e44ad) for trauma sections | Dodano charakterystyczną ikonę `fa-skull` w kolorze fioletowym (#8e44ad) dla sekcji traumy
  - **Steampunk Button Design | Design Przycisku Steampunk**: "Dodaj traumę" button with `.steampunk-btn` class and hover animations | Przycisk "Dodaj traumę" z klasą `.steampunk-btn` i animacjami hover
  - **Visual Consistency | Spójność Wizualna**: Trauma sections now match equipment section elegance with thematic distinction | Sekcje traumy teraz odpowiadają elegancji sekcji ekwipunku z tematycznym rozróżnieniem
  - **Template Updates | Aktualizacje Szablonów**: Modified both `actor-sheet.hbs` and `actor-sheetv2.hbs` for unified styling | Zmodyfikowano `actor-sheet.hbs` i `actor-sheetv2.hbs` dla ujednoliconej stylizacji
  - **CSS Enhancements | Ulepszenia CSS**: Added `.trauma-skull-icon` styling with purple coloring and text shadows | Dodano stylizację `.trauma-skull-icon` z fioletowym kolorem i cieniami tekstu

- **Equipment Section UI Overhaul | Przebudowa UI Sekcji Ekwipunku**: Complete modernization of equipment interface | Kompletna modernizacja interfejsu ekwipunku
  - **Archetype-Style Background | Tło w Stylu Archetypu**: Applied steampunk gradient backgrounds with golden borders | Zastosowano steampunkowe gradienty tła ze złotymi ramkami
  - **Backpack Icons | Ikony Plecaka**: Added `fa-backpack` icons throughout equipment sections for thematic consistency | Dodano ikony `fa-backpack` w sekcjach ekwipunku dla spójności tematycznej
  - **Steampunk Button Design | Design Przycisku Steampunk**: "Dodaj Ekwipunek" button with professional gradient styling and animations | Przycisk "Dodaj Ekwipunek" z profesjonalną stylizacją gradientu i animacjami
  - **Interface Cleanup | Oczyszczenie Interfejsu**: Removed "Brak ekwipunku do dodania" placeholder messages for cleaner UI | Usunięto komunikaty zastępcze "Brak ekwipunku do dodania" dla czystszego UI
  - **Visual Polish | Szlif Wizualny**: Enhanced user experience with consistent archetype-inspired design language | Ulepszone doświadczenie użytkownika ze spójnym językiem wizualnym inspirowanym archetypami

- **Equipment Messages System | System Komunikatów Ekwipunku**: Complete overhaul of equipment-related chat messages | Kompletna przebudowa komunikatów czatu związanych z ekwipunkiem
  - **Equipment-Message CSS Class | Klasa CSS Equipment-Message**: New archetype-inspired styling with steampunk gradient background | Nowa stylizacja inspirowana archetypami ze steampunkowym gradientem tła
  - **Backpack Icon | Ikona Plecaka**: Added fa-backpack icons for all equipment messages | Dodano ikony fa-backpack dla wszystkich komunikatów ekwipunku
  - **Color-Coded Information | Informacje Kolorowe**: Agent names (blue), equipment names (green), costs (red) | Nazwy agentów (niebieski), nazwy ekwipunku (zielony), koszty (czerwony)
  - **Both Sheet Versions | Obie Wersje Karty**: V1 and V2 actor sheets fully supported with custom callbacks | Karty aktorów V1 i V2 w pełni obsługiwane z niestandardowymi callbackami
  - **Multilingual Support | Wsparcie Wielojęzyczne**: Enhanced PL/EN translations with HTML formatting | Ulepszone tłumaczenia PL/EN z formatowaniem HTML

- **Resource Message Icon Differentiation | Różnicowanie Ikon Komunikatów Zasobów**: Specialized icons for different resource types | Specjalistyczne ikony dla różnych typów zasobów
  - **Gear Resources | Zasoby Ekwipunku**: fa-cog (cog wheel) - maintains existing theme | fa-cog (koło zębate) - zachowuje istniejący motyw
  - **Stress Resources | Zasoby Stresu**: fa-exclamation-triangle (warning triangle) | fa-exclamation-triangle (trójkąt ostrzegawczy)
  - **Trauma Resources | Zasoby Traumy**: fa-skull (skull icon) | fa-skull (ikona czaszki)
  - **Agent Names Styling | Stylizacja Nazw Agentów**: Blue color (#3498db) for all agent names in messages | Niebieski kolor (#3498db) dla wszystkich nazw agentów w komunikatach

- **CSS Modularization | Modularyzacja CSS**: Extracted feat effects styling to dedicated file for better code organization | Wydzielono stylizację efektów atutów do dedykowanego pliku dla lepszej organizacji kodu
  - **feats-effects.css**: New dedicated CSS file containing all feat effects styling | Nowy dedykowany plik CSS zawierający całą stylizację efektów atutów
  - **Comprehensive Extraction | Kompleksowe Wydzielenie**: Moved `.feat-effect-message`, `.steam-booster-effect`, and `.organization-training-dialog` styles | Przeniesiono style `.feat-effect-message`, `.steam-booster-effect` i `.organization-training-dialog`
  - **Both Sheet Versions | Obie Wersje Karty**: Includes styles for V1 and V2 (with `.agentv2` prefix) in single file | Zawiera style dla V1 i V2 (z prefiksem `.agentv2`) w jednym pliku
  - **Clean Architecture | Czysta Architektura**: Reduced cogwheel.css and agent-v2.css file size by ~200 lines total | Zmniejszono rozmiar plików cogwheel.css i agent-v2.css o ~200 linii łącznie
  - **System Integration | Integracja Systemowa**: Added feats-effects.css to system.json styles array for proper loading | Dodano feats-effects.css do tablicy stylów system.json dla poprawnego ładowania

### Enhanced | Ulepszone
- **Equipment Functions | Funkcje Ekwipunku**: Enhanced shared ActorEquipmentFunctions with new message formats | Ulepszone współdzielone ActorEquipmentFunctions z nowymi formatami komunikatów
  - **Add Equipment | Dodawanie Ekwipunku**: "{backpack icon} {agent name - bold blue} dodał {equipment name - green} za {cost - red} Punktów Ekwipunku" | "{ikona plecaka} {nazwa agenta - pogrubiony niebieski} dodał {nazwa ekwipunku - zielony} za {koszt - czerwony} Punktów Ekwipunku"
  - **Delete Equipment | Usuwanie Ekwipunku**: "Usunięto {equipment name - green} z karty {agent name - bold blue}" | "Usunięto {nazwa ekwipunku - zielony} z karty {nazwa agenta - pogrubiony niebieski}"
  - **Archetype-Style Design | Design w Stylu Archetypu**: Same visual styling as character archetype sections | Taka sama stylizacja wizualna jak sekcje archetypu postaci

- **Resource Messages | Komunikaty Zasobów**: Improved resource increment/decrement messages with proper styling | Ulepszone komunikaty zwiększania/zmniejszania zasobów z odpowiednią stylizacją
  - **Shared Functions | Współdzielone Funkcje**: ActorGearFunctions and ActorStressFunctions use feat-effect-message wrapper | ActorGearFunctions i ActorStressFunctions używają wrappera feat-effect-message
  - **Missing V2 Messages | Brakujące Komunikaty V2**: Added missing stress increment messages to V2 actor sheet | Dodano brakujące komunikaty zwiększania stresu do karty aktora V2
  - **Consistent Styling | Spójna Stylizacja**: All resource messages now use steampunk aesthetic | Wszystkie komunikaty zasobów używają teraz estetyki steampunk

- **Code Organization | Organizacja Kodu**: Improved maintainability with modular CSS approach | Ulepszona łatwość konserwacji dzięki modularnemu podejściu CSS
  - **Dedicated Module | Dedykowany Moduł**: All feat effects styling centralized in single location | Cała stylizacja efektów atutów scentralizowana w jednym miejscu
  - **Reduced Duplication | Zmniejszona Duplikacja**: Eliminated redundant CSS across multiple files | Wyeliminowano zbędny CSS w wielu plikach
  - **Better Structure | Lepsza Struktura**: Clear separation between general styles and feat-specific styling | Wyraźne oddzielenie między stylami ogólnymi a stylizacją specyficzną dla atutów
  - **Future-Proof | Przyszłościowe**: Easy addition of new feat effects without bloating main CSS files | Łatwe dodawanie nowych efektów atutów bez rozdmuchiwania głównych plików CSS

- **Styled Gear Resource Chat Messages | Wystylizowane Komunikaty Czatu Zasobów Ekwipunku**: Enhanced visual consistency between agent sheet versions | Ulepszona spójność wizualna między wersjami karty agenta
  - **V2 Agent Sheet | Karta Agenta V2**: Added missing gear resource increment/decrement chat messages | Dodano brakujące komunikaty czatu zwiększania/zmniejszania zasobów ekwipunku
  - **Both V1/V2 | Oba V1/V2**: Applied `.feat-effect-message` CSS styling with steampunk appearance | Zastosowano stylizację CSS `.feat-effect-message` z wyglądem steampunk
  - **Cog Icon Integration | Integracja Ikony Koła Zębatego**: Messages display with `<i class="fas fa-cog"></i>` icon matching feat effects | Komunikaty wyświetlane z ikoną `<i class="fas fa-cog"></i>` dopasowaną do efektów atutów
  - **Unified Styling | Ujednolicona Stylizacja**: Both sheet versions now use identical visual formatting for gear messages | Obie wersje karty używają teraz identycznego formatowania wizualnego dla komunikatów ekwipunku

- **Chat Message Consistency | Spójność Komunikatów Czatu**: Gear resource messages now match existing feat effects visual style | Komunikaty zasobów ekwipunku teraz odpowiadają istniejącemu stylowi wizualnemu efektów atutów
  - **Steampunk Theme | Motyw Steampunk**: Gold borders, gradient backgrounds, and professional typography | Złote ramki, tła z gradientem i profesjonalna typografia
  - **Multilingual Support | Wsparcie Wielojęzyczne**: Uses existing `COGSYNDICATE.ResourceAdded/ResourceSpent` translation keys | Używa istniejących kluczy tłumaczeniowych `COGSYNDICATE.ResourceAdded/ResourceSpent`
  - **Visual Hierarchy | Hierarchia Wizualna**: Clear distinction from plain chat messages with enhanced styling | Wyraźne odróżnienie od zwykłych komunikatów czatu dzięki ulepszonej stylizacji

### Fixed | Naprawione
- **Resource Auto-Correction System | System Automatycznej Korekty Zasobów**: Automatic correction of resource values when maximums decrease | Automatyczna korekta wartości zasobów gdy maksima maleją
  - **Gear Resource | Zasób Ekwipunku**: Auto-corrects current gear points when machine attribute damage reduces maximum | Automatycznie koryguje bieżące punkty ekwipunku gdy uszkodzenie atrybutu maszyna zmniejsza maksimum
  - **Stress Resource | Zasób Stresu**: Auto-corrects current stress when intrigue attribute damage reduces maximum | Automatycznie koryguje bieżący stres gdy uszkodzenie atrybutu intryga zmniejsza maksimum
  - **Equipment Points | Punkty Ekwipunku**: Always maintain maximum of 6 (independent of attributes - separate mechanic) | Zawsze utrzymują maksimum 6 (niezależnie od atrybutów - oddzielna mechanika)
  - **Prevents Invalid States | Zapobiega Nieprawidłowym Stanom**: Eliminates situations like 9/7 gear or 8/5 stress | Eliminuje sytuacje jak 9/7 ekwipunku lub 8/5 stresu
  - **Both Sheet Versions | Obie Wersje Karty**: Works identically in V1 (secondary attribute damage) and V2 (direct attribute damage) | Działa identycznie w V1 (uszkodzenia atrybutów wtórnych) i V2 (bezpośrednie uszkodzenia atrybutów)
  - **Automatic Activation | Automatyczna Aktywacja**: Triggers every time actor sheet refreshes, no manual intervention required | Uruchamia się za każdym razem gdy karta aktora się odświeża, nie wymaga ręcznej interwencji
  - **Console Logging | Logowanie Konsoli**: Transparently logs when auto-corrections are applied | Transparentnie loguje kiedy automatyczne korekty są stosowane

## [0.7.7] - 2025-09-04

### Added | Dodano
- **Complete Equipment Functions Deduplication System | Kompletny System Deduplikacji Funkcji Ekwipunku**: Revolutionary shared function architecture | Rewolucyjna architektura współdzielonych funkcji
  - **ActorEquipmentFunctions Module | Moduł ActorEquipmentFunctions**: Comprehensive equipment management with add/edit/delete operations | Kompleksowe zarządzanie ekwipunkiem z operacjami dodawania/edycji/usuwania
  - **Flexible Customization System | Elastyczny System Dostosowywania**: 10+ customization hooks allowing per-sheet version behavior modification | 10+ hooków dostosowywania pozwalających na modyfikację zachowania per wersja karty
  - **Full V1/V2 Compatibility | Pełna Kompatybilność V1/V2**: Both agent sheet versions maintain identical behavior while using shared code | Obie wersje karty agenta zachowują identyczne zachowanie używając współdzielonego kodu
  - **Future-Proof Architecture | Architektura na Przyszłość**: Easy integration for future agent sheet versions (V3, V4, etc.) | Łatwa integracja dla przyszłych wersji karty agenta (V3, V4, itd.)

### Enhanced | Ulepszone
- **Massive Code Reduction | Masywne Zmniejszenie Kodu**: Eliminated 300+ lines of duplicated equipment code per sheet version | Wyeliminowano 300+ linii zduplikowanego kodu ekwipunku na wersję karty
  - **Total Savings | Całkowite Oszczędności**: ~500+ lines of duplicated code removed across gear/stress/equipment functions | ~500+ linii zduplikowanego kodu usunięto z funkcji gear/stress/equipment
  - **Maintainability | Łatwość Konserwacji**: Bug fixes now require changes in single location instead of multiple files | Naprawienie błędów wymaga teraz zmian w jednym miejscu zamiast w wielu plikach
  - **Consistency | Spójność**: All equipment operations work identically unless explicitly customized | Wszystkie operacje ekwipunku działają identycznie chyba że są jawnie dostosowane
- **Advanced Customization Options | Zaawansowane Opcje Dostosowywania**: Comprehensive callback system for equipment operations | Kompleksowy system callbacków dla operacji ekwipunku
  - **Validation Hooks | Hooki Walidacji**: Custom input validation, cost validation, and error handling per sheet version | Niestandardowa walidacja wejścia, walidacja kosztów i obsługa błędów per wersja karty
  - **Processing Hooks | Hooki Przetwarzania**: Custom data processing and equipment defaults configuration | Niestandardowe przetwarzanie danych i konfiguracja domyślnych ustawień ekwipunku
  - **Success Callbacks | Callbacki Sukcesu**: Customizable success/error handling with version-specific behaviors | Dostosowywalna obsługa sukcesu/błędów z zachowaniami specyficznymi dla wersji
  - **Refund System | System Zwrotów**: Configurable equipment deletion refund calculation | Konfigurowalne obliczanie zwrotu za usunięcie ekwipunku
- **Documentation Excellence | Doskonała Dokumentacja**: Comprehensive examples and implementation guides | Kompleksowe przykłady i przewodniki implementacji
  - **EQUIPMENT-EXAMPLES.js**: 7+ detailed implementation scenarios for different sheet versions | 7+ szczegółowych scenariuszy implementacji dla różnych wersji karty
  - **Shared Function Architecture Documentation | Dokumentacja Architektury Współdzielonych Funkcji**: Complete system overview and usage patterns | Kompletny przegląd systemu i wzorce użytkowania
  - **Customization Recipes | Przepisy Dostosowywania**: Step-by-step guides for extending functionality | Przewodniki krok po kroku do rozszerzania funkcjonalności

### Technical | Techniczne
- **Shared Function Architecture | Architektura Współdzielonych Funkcji**: Complete modularization of equipment operations | Kompletna modularyzacja operacji ekwipunku
  - **handleAddEquipment()**: Universal equipment addition with validation and callbacks | Uniwersalne dodawanie ekwipunku z walidacją i callbackami
  - **handleEditEquipment()**: Equipment modification with cost difference handling | Modyfikacja ekwipunku z obsługą różnic kosztów
  - **handleDeleteEquipment()**: Equipment removal with optional confirmation and refund calculation | Usuwanie ekwipunku z opcjonalnym potwierdzeniem i obliczaniem zwrotu
- **Backward Compatibility | Kompatybilność Wsteczna**: All existing functionality preserved with zero breaking changes | Wszystkie istniejące funkcjonalności zachowane bez żadnych zmian łamiących
  - **V1 Behavior | Zachowanie V1**: Strict validation with trimming and dialog error display maintained | Zachowana ścisła walidacja z obcinaniem i wyświetlaniem błędów w dialogach
  - **V2 Behavior | Zachowanie V2**: Simplified validation with notification-based errors maintained | Zachowana uproszczona walidacja z błędami opartymi na powiadomieniach
  - **Integration | Integracja**: Seamless replacement of original functions without API changes | Bezproblemowa zamiana oryginalnych funkcji bez zmian API
- **Error Handling | Obsługa Błędów**: Comprehensive error management with fallback mechanisms | Kompleksowe zarządzanie błędami z mechanizmami fallback
  - **Validation Pipeline | Rurociąg Walidacji**: Multi-stage validation with custom override capabilities | Wieloetapowa walidacja z możliwościami niestandardowego nadpisywania
  - **Exception Safety | Bezpieczeństwo Wyjątków**: Robust error handling prevents system crashes during equipment operations | Solidna obsługa błędów zapobiega awariom systemu podczas operacji ekwipunku
  - **Debug Support | Wsparcie Debugowania**: Enhanced logging and error reporting for troubleshooting | Ulepszone logowanie i raportowanie błędów do rozwiązywania problemów
- **Module System | System Modułów**: Clean separation of concerns with shared function modules | Czyste rozdzielenie odpowiedzialności z modułami współdzielonych funkcji
  - **ActorGearFunctions**: Gear spending operations (v0.7.6) | Operacje wydawania ekwipunku (v0.7.6)
  - **ActorStressFunctions**: Stress spending operations (v0.7.6) | Operacje wydawania stresu (v0.7.6)
  - **ActorEquipmentFunctions**: Equipment management operations (v0.7.7) | Operacje zarządzania ekwipunkiem (v0.7.7)
  - **Example Documentation | Dokumentacja Przykładów**: Comprehensive usage examples for all shared functions | Kompleksowe przykłady użytkowania dla wszystkich współdzielonych funkcji

### Refactored | Refaktoryzowane
- **Actor Sheet V1 Equipment Functions | Funkcje Ekwipunku Karty Aktora V1**: Complete replacement with shared function calls | Kompletna zamiana na wywołania współdzielonych funkcji
  - **_onAddEquipment()**: Now uses ActorEquipmentFunctions.handleAddEquipment() with V1-specific options | Teraz używa ActorEquipmentFunctions.handleAddEquipment() z opcjami specyficznymi dla V1
  - **_onEditEquipment()**: Utilizes shared editing with strict validation preservation | Wykorzystuje współdzieloną edycję z zachowaniem ścisłej walidacji
  - **_onDeleteEquipment()**: Shared deletion with V1-style chat messages and rendering | Współdzielone usuwanie z komunikatami czatu i renderowaniem w stylu V1
- **Actor Sheet V2 Equipment Functions | Funkcje Ekwipunku Karty Aktora V2**: Full migration to shared function architecture | Pełna migracja do architektury współdzielonych funkcji
  - **_onAddEquipment()**: Uses shared functions with V2-simplified validation approach | Używa współdzielonych funkcji z uproszczonym podejściem walidacji V2
  - **_onEditEquipment()**: Shared editing with notification-based error handling | Współdzielona edycja z obsługą błędów opartą na powiadomieniach
  - **_onDeleteEquipment()**: Shared deletion with V2-style immediate execution | Współdzielone usuwanie z natychmiastowym wykonaniem w stylu V2
- **System Configuration | Konfiguracja Systemu**: Updated module loading for new shared functions | Zaktualizowane ładowanie modułów dla nowych współdzielonych funkcji
  - **system.json**: Added actor-equipment-functions.js to esmodules array | Dodano actor-equipment-functions.js do tablicy esmodules
  - **Import Structure | Struktura Importów**: Clean ES6 module imports across all affected files | Czyste importy modułów ES6 we wszystkich dotkniętych plikach
  - **Loading Order | Kolejność Ładowania**: Optimized module loading sequence for dependency resolution | Zoptymalizowana sekwencja ładowania modułów dla rozwiązywania zależności

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

### Added | Dodano
- **Czarci Targ (Devil's Bargain) - New Roll Mechanics | Czarci Targ - Nowa Mechanika Rzutów**:
  - **New Checkbox | Nowy Checkbox**: "Czarci Targ - Dodaj 2 Punkty Nemezis do puli, by dodać 1d12 do rzutu" in roll window | "Czarci Targ - Dodaj 2 Punkty Nemezis do puli, by dodać 1d12 do rzutu" w oknie rzutu
  - **Placement | Umieszczenie**: Positioned between Steam Die checkbox and Trauma | Umieszczony między checkboxem Steam Die a Trauma
  - **Mechanics | Mechanika**: Adds 2 Nemesis Points to GM pool and additional d12 ("devil dice") to roll | Dodaje 2 Punkty Nemezis do puli MG i dodatkową kość d12 ("devil dice") do rzutu
  - **Mutual Exclusion | Wzajemne Wykluczanie**: Mutually exclusive with Steam Die - maximum one per roll | Wzajemne wykluczanie się z Steam Die - można używać maksymalnie jednego na rzut
  - **Dice Limit | Limit Kości**: Maximum dice count remains 4d12: (2d12 + stress + steam) OR (2d12 + stress + devil) | Maksymalna liczba kości pozostaje na poziomie 4d12: (2d12 + stress + steam) OR (2d12 + stress + devil)
  - **Full Compatibility | Pełna Kompatybilność**: Complete compatibility with critical success and failure mechanics | Pełna kompatybilność z mechanikami krytycznych sukcesów i porażek
  - **Calculation Integration | Integracja Obliczeń**: Devil dice included in all calculations (11s/12s, critical success/failure) | Devil dice uwzględniana we wszystkich obliczeniach (11s/12s, krytyczne sukces/porażka)

### Enhanced | Ulepszone
- **Visual Mutual Exclusion Indicators | Wizualne Wskazywanie Wzajemnego Wykluczania**:
  - **Cross-out Effect | Efekt Przekreślenia**: Selecting Devil Die visually crosses out Steam Die (and vice versa) | Zaznaczenie Devil Die wizualnie przekreśla Steam Die (i na odwrót)
  - **Visual Effects | Efekty Wizualne**: Dimming (opacity 0.5), line-through, red striking line | Przygaszenie (opacity 0.5), line-through, czerwona linia przekreślająca
  - **Background Change | Zmiana Tła**: Background turns grey, checkbox becomes inactive with appropriate cursor | Tło zmienia się na szare, checkbox staje się nieaktywny z odpowiednim kursorem
  - **Auto Restoration | Automatyczne Przywracanie**: Automatic restoration of normal appearance when unchecked | Automatyczne przywracanie normalnego wyglądu po odznaczeniu
  - **Distinctive Styling | Charakterystyczna Stylizacja**: Distinctive red styling for Devil Die checkbox | Charakterystyczna czerwona stylistyka dla checkbox Devil Die

- **Reroll Mechanics with Devil Die | Mechanika Reroll z Devil Die**:
  - **Free Inclusion | Bezpłatne Dołączenie**: Devil dice included for free during test reroll (3PP) | Devil dice jest dołączana za darmo przy przerzucie testu (3PP)
  - **No Double Cost | Brak Podwójnego Kosztu**: Nemesis Points NOT added again during reroll (analogous to Steam Die) | Punkty Nemezis NIE są dodawane ponownie przy reroll (analogicznie do Steam Die)
  - **Clear Messaging | Wyraźne Komunikaty**: Messages clearly mark free dice: "(za darmo)" / "(for free)" | Komunikaty wyraźnie oznaczają darmowe kości: "(za darmo)" / "(for free)"
  - **Full Integration | Pełna Integracja**: Complete integration with existing reroll system | Pełna integracja z istniejącym systemem przerzutów

- **Chat Messages | Komunikaty na Czacie**:
  - **Action Messages | Komunikaty Akcji**: "Agent {name} dodał do puli MG 2 Punkty Nemezis, by dodać kość Diabelskiego Targu" | "Agent {imię} dodał do puli MG 2 Punkty Nemezis, by dodać kość Diabelskiego Targu"
  - **Result Display | Wyświetlanie Wyników**: Devil dice displayed in detailed roll results section | Devil dice wyświetlana w sekcji szczegółowych wyników rzutu
  - **Consistent Formatting | Spójne Formatowanie**: Consistent formatting with rest of roll messages | Spójne formatowanie z resztą komunikatów o rzutach

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

### Technical | Techniczne
- **Translations | Tłumaczenia**: Added PL/EN translations for Devil's Bargain functionality | Dodano tłumaczenia PL/EN dla funkcjonalności Devil's Bargain
- **Roll Mechanics Extension | Rozszerzenie Mechaniki Rzutów**: Extended `roll-mechanics.js` with Devil Die support in both main functions | Rozszerzono `roll-mechanics.js` o obsługę Devil Die w obu głównych funkcjach
- **CSS Styling | Stylizacja CSS**: Added dedicated Devil Die styles in `rolldialog.css` | Dodano dedykowane style CSS dla Devil Die w `rolldialog.css`
- **Dice Logic Update | Aktualizacja Logiki Kości**: Updated dice assignment logic for all combinations (3, 4, 5 dice) | Zaktualizowano logikę przypisywania wyników kości dla wszystkich kombinacji (3, 4, 5 kości)
- **Reroll Function Fix | Naprawa Funkcji Reroll**: Fixed `executeRollWithData` function for proper Devil Die handling in reroll | Poprawiono funkcję `executeRollWithData` dla prawidłowej obsługi Devil Die w reroll
- **Archetype Styling | Stylizacja Archetypu**: Archetype styling in `cogwheel.css` and `agent-v2.css` files | Stylizacja archetypu w plikach `cogwheel.css` i `agent-v2.css`

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

### Added | Dodano
- **Complete Nemesis Points Spending System | Kompletny System Wydawania Punktów Nemezis (PN)**:
  - **Spend NP Dialog | Dialog Wydawania PN**: "Wydaj PN" window with three sections: "Akcje za 1 PN", "Akcje za 2 PN", "Akcje za 3 PN" | Okno "Wydaj PN" z trzema sekcjami: "Akcje za 1 PN", "Akcje za 2 PN", "Akcje za 3 PN"
  - **10 Different Actions | 10 Różnych Akcji**: Various actions to choose from with radio buttons according to game mechanics | 10 różnych akcji do wyboru z radiobuttonami zgodnie z mechaniką gry
  - **Pool State Checking | Sprawdzanie Stanu Puli**: Automatic pool state verification before spending | Automatyczne sprawdzanie stanu puli PN przed wydatkowaniem
  - **Error Dialog | Dialog Błędu**: "Za mało Punktów Nemezis w Puli" with red, bold text | Dialog błędu "Za mało Punktów Nemezis w Puli" z czerwonym, pogrubionym tekstem
  - **Automatic Deduction | Automatyczne Odejmowanie**: Automatic point deduction from pool after action execution | Automatyczne odejmowanie punktów z puli po wykonaniu akcji
  - **Chat Messages | Komunikaty na Czacie**: Chat messages with username, spent points amount and action description (with bold and colors) | Komunikaty na czacie z nazwą użytkownika, ilością wydanych punktów i opisem akcji (z pogrubieniami i kolorami)

- **Meta Currency Spending Buttons | Przyciski Wydawania Metawalut**: 
  - **Spend NP Button | Przycisk "Wydaj PN"**: "Spend NP" (Nemesis Points) button - available only for GM and Assistant GM | Dodano przycisk "Wydaj PN" (Punkty Nemezis) - dostępny tylko dla GM i Assistant GM
  - **Spend SP Button | Przycisk "Wydaj PP"**: "Spend SP" (Steam Points) button - available for all users | Dodano przycisk "Wydaj PP" (Punkty Pary) - dostępny dla wszystkich użytkowników
  - **Permission Control | Kontrola Uprawnień**: "Spend NP" button automatically disabled for users without appropriate permissions | Przycisk "Wydaj PN" automatycznie wyłączany dla użytkowników bez odpowiednich uprawnień

- **Automatic Window Sizing | Automatyczne Dostosowanie Rozmiarów Okien**:
  - **Flexbox Layout | Layout Flexbox**: Dialog windows use flexbox for fluid content adaptation | Okna dialogowe używają flexbox dla płynnego dopasowania do zawartości
  - **No Scrollbars | Brak Pasków Przewijania**: Removed unnecessary scrollbars | Usunięto niepotrzebne paski przewijania
  - **Button Layout | Layout Przycisków**: "Cancel" and "Spend Points" buttons placed side by side (Cancel on left) | Przyciski "Anuluj" i "Wydaj punkty" umieszczone obok siebie (Anuluj po lewej)

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





