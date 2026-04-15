# CLAUDE.md — Agenci Cogwheel | Foundry VTT v13

## Rola i projekt
Jesteś asystentem do kodowania systemu RPG **Agenci Cogwheel** dla **Foundry VTT v13**.
Projekt: fabularny system o tajnych agentach w klimatach steampunku, walczących z zagrożeniami ery rewolucji przemysłowej.

---

## OBOWIĄZKOWE zasady generowania kodu

### 1. ApplicationV2 (AppV2)
- ZAWSZE używaj `ApplicationV2` / `DocumentSheetV2` / `ActorSheetV2` / `ItemSheetV2`.
- NIGDY nie używaj przestarzałego `Application`, `ActorSheet` (V1), `ItemSheet` (V1).
- Klasy dziedzicz po: `foundry.applications.api.ApplicationV2`, `foundry.applications.sheets.ActorSheetV2`, `foundry.applications.sheets.ItemSheetV2`.
- Szablon definiuj przez `static DEFAULT_OPTIONS` i `static PARTS`.
- Używaj lifecycle hooks: `_prepareContext()`, `_onRender()`, `_onClose()`.

### 2. Native DOM (bez jQuery)
- ZAWSZE używaj natywnego DOM API: `querySelector`, `querySelectorAll`, `addEventListener`, `classList`, `dataset`, `innerHTML`, `closest()`.
- NIGDY nie używaj `$()`, `.find()`, `.on()` ani żadnych metod jQuery.
- Zdarzenia rejestruj przez `_onRender(context, options)` lub `_attachFrameListeners()`.

### 3. DialogV2
- ZAWSZE używaj `foundry.applications.api.DialogV2` do dialogów i okienek potwierdzenia.
- NIGDY nie używaj przestarzałego `Dialog` (V1).
- Preferowane metody: `DialogV2.confirm()`, `DialogV2.prompt()`, `DialogV2.wait()`.
- Przykład:
  ```js
  const result = await foundry.applications.api.DialogV2.confirm({
    window: { title: "Potwierdzenie" },
    content: "<p>Czy na pewno?</p>",
    yes: { callback: () => true },
    no: { callback: () => false }
  });
  ```

### 4. Data Models (TypeDataModel / DataModel)
- ZAWSZE modeluj dane aktorów i itemów jako `TypeDataModel` (klasy dziedziczące po `foundry.abstract.TypeDataModel`).
- Schemat definiuj przez `static defineSchema()` z polami z `foundry.data.fields.*`.
- Używaj: `NumberField`, `StringField`, `BooleanField`, `SchemaField`, `ArrayField`, `ObjectField`, `HTMLField`.
- Przykład:
  ```js
  class CharacterData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      const fields = foundry.data.fields;
      return {
      vigor: new fields.NumberField({ required: true, initial: 10, min: 0 }),
      resolve: new fields.NumberField({ required: true, initial: 10, min: 0 }),
      fortune: new fields.NumberField({ required: true, initial: 3, min: 0 }),
      archetype: new fields.StringField({ initial: "" }),
      };
    }
  }
  ```
- Dostęp do danych przez `actor.system.*` lub `item.system.*`, nigdy przez `actor.data.data.*`.

### 5. Konwencje kodu

- JavaScript: `ES2022+`, class, `async/await`, bez transpilacji.
- Nazewnictwo: `camelCase` dla zmiennych i metod, `PascalCase` dla klas.
- Komentarze: po polsku lub angielsku, zwięźle.
- Lokalizacja: zawsze przez `game.i18n.localize("COGSYNDICATE.klucz")`, nie hardcoduj polskich/angielskich/francuskich tekstów.
- Flagi i ustawienia: przez `game.settings.register` / `document.setFlag`.

### 6. Formularze — `formInput` i `systemFields`

- ZAWSZE przekazuj `systemFields: this.actor.system.schema.fields` (lub item) w `_prepareContext()`, aby szablony HBS miały dostęp do definicji pól schematu.
- ZAWSZE używaj helpera `{{formInput schemaField value=system.pole}}` do generowania inputów — Foundry samo dobierze typ (`<input type="number">`, `<input type="text">`, `<select>`, itp.) oraz zastosuje `min`, `max`, `choices`.
- NIGDY nie buduj ręcznie `<input>`, `<select>` czy `<label>` tam, gdzie pole istnieje w schemacie — helper `formInput` robi to automatycznie w 1 linijce.
- Label pola wyciągaj ze schematu przez `{{localize schemaField.label}}` — nie hardcoduj etykiet w HBS.
- Dla pól wyboru (dropdown) definiuj `choices` bezpośrednio w `StringField` w data modelu (np. przez `toLabelObject(config.fachy)`). `formInput` wygeneruje z tego `<select>` automatycznie.

**Przykład — `_prepareContext()`:**
```js
async _prepareContext(options) {
  const context = await super._prepareContext(options);
  Object.assign(context, {
    actor: this.actor,
    system: this.actor.system,
    systemFields: this.actor.system.schema.fields, // kluczowe!
  });
  return context;
}
```

**Przykład — HBS (3 linie zamiast ręcznego HTML):**
```hbs
{{formInput systemFields.vigor value=system.vigor}}
{{formInput systemFields.archetype value=system.archetype}}
{{formInput systemFields.specjalizacjaFach value=system.specjalizacjaFach}}
```
**Przykład — StringField z choices w data modelu:**
```js
specjalizacjaFach: new fields.StringField({
  label: "COGSYNDICATE.atrybut.specjalizacja",
  initial: "brak",
  choices: toLabelObject(CONFIG.COGSYNDICATE.fachy), // generuje <select>
  required: true,
}),
```

## Czego NIGDY nie rób!

- ❌ Nie używaj jQuery (`$()`, `.find()`, `.on()`).
- ❌ Nie używaj `Application / ActorSheet / ItemSheet (V1)`.
- ❌ Nie używaj `Dialog (V1)` — tylko `DialogV2`.
- ❌ Nie używaj `actor.data.data.*` — tylko `actor.system.*`.
- ❌ Nie używaj `mergeObject` — zastąp przez `foundry.utils.mergeObject`.
- ❌ Nie używaj `duplicate()` — zastąp przez `foundry.utils.deepClone()`.
- ❌ Nie buduj ręcznie <input>/<select> dla pól zdefiniowanych w schemacie — używaj {{formInput systemFields.pole value=system.pole}}.
- ❌ Nie hardcoduj etykiet w HBS gdy pole ma label w schemacie — używaj {{localize systemFields.pole.label}}.

## Helpers i utilitarki — zasady
- Używaj natywnych helperów Foundry API
- ZAWSZE korzystaj z gotowych helperów dostępnych w `foundry.utils.*` zamiast pisać własne implementacje.

### Najważniejsze natywne helpery, których MUSISZ używać:
   - `foundry.utils.mergeObject()` — łączenie obiektów
   - `foundry.utils.deepClone()` — głęboka kopia obiektu
  - `foundry.utils.expandObject()` — rozwijanie płaskiego obiektu (np. z formularza)
  - `foundry.utils.flattenObject()` — spłaszczanie zagnieżdżonego obiektu
  - `foundry.utils.getProperty()` — bezpieczny dostęp do zagnieżdżonej właściwości
  - `foundry.utils.setProperty()` — bezpieczne ustawianie zagnieżdżonej właściwości
  - `foundry.utils.hasProperty()` — sprawdzenie istnienia właściwości
  - `foundry.utils.diffObject()` — diff dwóch obiektów
  - `foundry.utils.isEmpty()` — sprawdzenie czy obiekt/tablica jest pusta
  - `foundry.utils.randomID()` — generowanie unikalnego ID
  - `foundry.utils.debounce()` — debounce funkcji
  - `foundry.utils.isSubclass()` — sprawdzenie dziedziczenia klas
  - `Hooks.on()`, `Hooks.once()`, `Hooks.call()`, `Hooks.callAll()` 
  - system eventów Foundry.

### Handlebars helpers

- ZAWSZE sprawdzaj najpierw, czy dany helper nie istnieje już w Foundry lub w zarejestrowanych helperach systemu.
- Rejestruj własne helpery TYLKO jeśli nie istnieje natywny odpowiednik.
- Przy rejestracji ZAWSZE używaj prefiksu `cogwheel-` aby uniknąć konfliktów z natywnymi helperami Foundry i innymi systemami/modułami:

```js
  Handlebars.registerHelper("cogwheel-capitalize", (str) => str.capitalize());
```

- NIGDY nie nadpisuj istniejących helperów Foundry (`eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `and`, `or`, `not`, `concat`, `localize`, itp.).

---

### Zakaz tworzenia własnych duplikatów natywnych funkcji

- ❌ Nie twórz własnych funkcji `clone`, `merge`, `deepEqual`, `getNestedValue` itp. — używaj `foundry.utils.*`.
- ❌ Nie twórz własnych systemów eventów/hooków — używaj `Hooks` API Foundry.
- ❌ Nie twórz własnych wrapperów na fetch — używaj `foundry.utils.fetchJsonWithTimeout()` lub natywnego `fetch`.
- ❌ Nie definiuj własnych stałych pokrywających się z `CONST.*` Foundry (np. `DOCUMENT_OWNERSHIP_LEVELS`, `DICE_ROLL_MODES`).
- ❌ Nie twórz własnego systemu lokalizacji — wyłącznie `game.i18n.localize()` i `game.i18n.format()`.

### Przed napisaniem każdego helpera

- Zanim napiszesz własną funkcję pomocniczą, sprawdź czy istnieje w:
  `foundry.utils.*`
  `CONFIG.*`
  `CONST.*`
- Natywnych helperach Handlebars zarejestrowanych przez Foundry

Jeśli nie masz pewności — napisz // TODO: check if foundry.utils.* equivalent exists i zaproponuj własną implementację jako tymczasową.

Jeśli jakiś fragment API Foundry v13 jest Ci nieznany lub niepewny — powiedz to wprost i zaproponuj rozwiązanie z adnotacją // TODO: verify against v13 API. Nie generuj kodu opartego na V1 API jako fallbacku.

***

## Podsumowanie luk

| Obszar | W CLAUDE.md | Brakuje |
|---|---|---|
| Data Model (defineSchema) | ✅ | — |
| `systemFields` w kontekście | ✅ | — |
| `{{formInput}}` helper | ✅ | — |
| `choices` w StringField → select | ✅ | — |
| Label ze schematu w HBS | ✅ | — |
| `min`/`max` z NumberField | ✅ | — |
