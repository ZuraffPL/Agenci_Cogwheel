# Agenci Cogwheel — Foundry VTT System

System Foundry VTT dla **Agenci Cogwheel** — fabularnej gry o tajnych agentach walczących z zagrożeniami ery rewolucji przemysłowej.

[![Wersja systemu](https://img.shields.io/badge/system-v0.9.97-c0813a?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJhMTAgMTAgMCAxIDAgMCAyMEExMCAxMCAwIDAgMCAxMiAyem0wIDE4YTggOCAwIDEgMSAwLTE2IDggOCAwIDAgMSAwIDE2em0wLTEyYTQgNCAwIDEgMCAwIDggNCA0IDAgMCAwIDAtOHoiLz48L3N2Zz4=)](https://github.com/ZuraffPL/Agenci_Cogwheel/releases/latest)
[![Foundry VTT](https://img.shields.io/badge/Foundry_VTT-v13.351+-8b0000?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNVYybC0xMCA1LTEwLTV2MTV6Ii8+PC9zdmc+)](https://foundryvtt.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022%2B-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Licencja](https://img.shields.io/badge/licencja-CC_BY_4.0-2d7a2d?style=for-the-badge&logo=creativecommons&logoColor=white)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/ZuraffPL/Agenci_Cogwheel?style=for-the-badge&color=5b3a8c&label=GitHub+Release)](https://github.com/ZuraffPL/Agenci_Cogwheel/releases/latest)

---

## Instalacja

### Automatyczna (zalecana)

1. Otwórz Foundry VTT → zakładka **Game Systems** → **Install System**
2. W polu **Manifest URL** wklej:
   ```
   https://github.com/ZuraffPL/Agenci_Cogwheel/releases/latest/download/system.json
   ```
3. Kliknij **Install**, utwórz nowy świat z systemem **Agenci Cogwheel**

### Ręczna

1. Pobierz archiwum ZIP z [najnowszego release](https://github.com/ZuraffPL/Agenci_Cogwheel/releases)
2. Wypakuj do katalogu `Data/systems/` Foundry VTT
3. Uruchom ponownie Foundry i utwórz nowy świat

---

## Wymagania

| Komponent | Wersja |
|-----------|--------|
| Foundry VTT | v13.351+ |
| System | v0.9.96 |
| Przeglądarka | Nowoczesna (Chrome, Firefox, Edge) |

Wersja dla Foundry v12: branch `foundry-v12-compat` (v0.8.1, brak aktywnego wsparcia).

---

## Co nowego w v0.9.96

### 🧹 Kompleksowy audyt i porządki kodu

#### Usunięcie zbędnych plików i artefaktów
- **Usunięto `packs/`** — cały katalog z artefaktami LevelDB/NeDB (archetypy to Itemy, nie kompendium)
- **Usunięto `src/scripts/utiliti.mjs`** — wrapper V12/V13 zastąpiony bezpośrednimi wywołaniami `foundry.applications.handlebars.renderTemplate()`
- **Usunięto `src/scripts/shared/EXAMPLES.js` i `EQUIPMENT-EXAMPLES.js`** — pliki były czysto dokumentacyjne, nie ładowane przez runtime
- **Usunięto wpis `packs` z `system.json`** — sekcja wskazywała na nieistniejący plik `archetypes.db`

#### Naprawa systemu stylów
- **Dodano `sidebars-controls.css` do `system.json`** — plik istniał, ale nigdy nie był ładowany (style kontrolek sceny `doom-clocks`, `meta-currency` nie były stosowane)

#### Eliminacja bloków kompatybilności jQuery
- Usunięto martwy kod z `metacurrency-app.mjs` i `clocks.mjs`:
  ```js
  // Usunięto — this.element.jquery zawsze false w V13
  if (this.element && this.element.jquery) { html = this.element[0] }
  else { html = this.element }
  ```
  Zastąpiono prostym `const html = this.element;`

#### Tier 2: Usunięcie wszystkich console.log/warn/error z kodu runtime
- Wyczyszczono wszystkie pliki runtime: `actor-sheet.js`, `actor-sheetv2.js`, `feats-effects.mjs`, `clocks.mjs`, `consequences.mjs`, `init.js`, `roll-mechanics.js`, `metacurrency-app.mjs`, `shared/*`
- `console.error` w blokach catch → `ui.notifications.error()` (powiadomienia dla użytkownika)
- Logi migracji, debugowania i diagnostyczne — usunięte bez zastąpienia

#### Tier 1: Internacjonalizacja twardych tekstów w szablonach
- `add-minion-dialog.hbs` — 3 hardcoded PL placeholdery → `game.i18n.localize()`
- `add-clock-dialog.hbs` — label "Kategoria" + 3 opcje dropdown → klucze `COGSYNDICATE.*`
- `doom-clocks-dialog.hbs` — 3 przyciski zakładek z twardymi polskimi napisami → i18n
- `clock-archive-dialog.hbs` — 3 etykiety kategorii (Misja/Walka/Inne) → i18n
- `nemesis-sheet.hbs` — 6 tytułów przycisków zegarów, `Brak przybocznych.`, placeholder notatek → i18n
- Dodano 10+ nowych kluczy do `lang/pl.json` i `lang/en.json`

#### Naprawa krytycznego błędu w feats-effects.mjs
- Naprawiono **147 błędów kompilacji** — duplikat bloku zamykającego w metodzie `_removeTinkererEffect` (artefakt po wcześniejszej edycji)

#### Aktualizacja dokumentacji
- `FEATS_EFFECTS.md` — dodano dokumentację 6 brakujących metod, 2 nowe sekcje efektów (Szkolenie Organizacji, Wsparcie), usunięto zdezaktualizowaną sekcję "Debugging", zaktualizowano kompatybilność na v13+/v0.9.0+
- `ARCHITECTURE.md` — dodano katalog `src/models/` (4 pliki TypeDataModel), zaktualizowano Version Roadmap, rozszerzono listę plików w `src/scripts/`
- `INSTALL.md` — zaktualizowano wersję Foundry z 13.348 na 13.351

---

## Funkcje systemu

### Karty postaci
- **Agent V1 i V2** — dwie wersje karty agenta, obie oparte na `ActorSheetV2` (ApplicationV2)
- **Karta Bazy (HQ)** — zarządzanie kwaterą główną, sekcje, projekty rozbudowy
- **Karta Nemezis** — antagoniści z zintegrowanymi zegarami postępu i przybosznymi

### Mechanika rzutów
- Rzuty pulą kości d12 z automatycznym rozpoznawaniem sukcesu/porażki
- Krytyczny sukces (dublet 12), krytyczna porażka (dublet 1)
- Generowanie Punktów Nemezis przy wyrzuceniu 1
- Integracja z Dice So Nice (predefiniowane zestawy kolorów: złoty/czarny dla stresu, niebieski dla pary, ciemny dla Czarciego Targu)

### System konsekwencji
- Interaktywny wybór konsekwencji przez gracza (10 typów)
- Odrzucanie konsekwencji za Punkty Stresu (koszt zależny od pozycji)
- Przyciski konsekwencji z automatycznym wygaśnięciem (120s)
- Aktualizacja przycisków po ulepszeniu sukcesu
- Panel GM do aktywowania/dezaktywowania typów konsekwencji

### System zegarów postępu
- Trzy kategorie: Misja / Walka / Inne
- Synchronizacja w czasie rzeczywistym przez socket (wszyscy gracze widzą zmiany natychmiast)
- Archiwum usuniętych zegarów z możliwością przywrócenia
- Automatyczne dopasowanie wysokości okna

### System atutów i efektów
- Automatyczne efekty przy dodawaniu atutu na kartę (zależne od archetypu)
- Obsługiwane kombinacje: Parowy Komandos+Augmentacja, Geniusz Techniki+Majsterkowicz, Płaszcz Cienia+Intrygant, Geniusz Techniki+Dopalacz Pary, Agent Pary+Szkolenie Organizacji, Agent Pary+Wsparcie

### Metawaluty
- Globalne Punkty Pary i Punkty Nemezis z synchronizacją dla wszystkich graczy
- Dialog z przyciskami szybkiego wydawania (NP → potwierdzenie, SP → wybór nagrody)

### TypeDataModel
- Dane aktorów i itemów w dedykowanych klasach (`src/models/`): `AgentData`, `HQData`, `NemesisData`, `ItemData`
- Pełna walidacja schematu przez `foundry.data.fields.*`

---

## Architektura

```
src/
├── models/          # TypeDataModel — definicje schematów danych
├── scripts/         # Logika aplikacji (ApplicationV2, HandlebarsApplicationMixin)
│   └── shared/      # Współdzielone funkcje (gear, stress, equipment)
├── styles/          # Modułowe CSS (19 plików)
└── templates/       # Szablony Handlebars (.hbs)
lang/                # Lokalizacje (pl.json, en.json)
```

**Stack techniczny:** ES2022+, ApplicationV2, TypeDataModel, DialogV2, native DOM API (zero jQuery)

---

## Zgłaszanie błędów

[Issues na GitHub](https://github.com/ZuraffPL/Agenci_Cogwheel/issues)

## Licencja

[Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE)
