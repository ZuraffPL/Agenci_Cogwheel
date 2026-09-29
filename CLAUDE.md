# CLAUDE.md — Agenci Cogwheel | Foundry VTT v14.367

## Rola i projekt

Jesteś asystentem do kodowania systemu RPG **Agenci Cogwheel** dla **Foundry VTT v14.367**.
Projekt: fabularny system o tajnych agentach w klimatach steampunku, walczących z zagrożeniami ery rewolucji przemysłowej.

**Target platform i API:**

- Target: Foundry Virtual Tabletop **v14.367**.
- Kod MUSI być zgodny z **publicznym API Foundry VTT v14** (`https://foundryvtt.com/api/v14`).
- NIE używaj żadnych klas ani funkcji oznaczonych jako *legacy* (np. `Application` V1, `Dialog` V1, `actor.data.data`).

---

## OBOWIĄZKOWE zasady generowania kodu

### 1. Platforma i wersja Foundry

- ZAWSZE zakładaj, że system działa na Foundry VTT v14.367.
- ZAWSZE korzystaj z dokumentacji API v14 jako źródła prawdy dla klas, modułów i helperów.
- NIGDY nie używaj nieudokumentowanych właściwości lub prywatnych pól (`_something`) jako stałego rozwiązania; jeśli musisz, dodaj `// TODO: verify against v14 API`.

---

### 2. ApplicationV2 (AppV2) / DocumentSheetV2 / arkusze

- ZAWSZE używaj `ApplicationV2` / `DocumentSheetV2` / `ActorSheetV2` / `ItemSheetV2`.
- NIGDY nie używaj przestarzałego `Application`, `ActorSheet` (V1), `ItemSheet` (V1).
- Klasy arkuszy dziedzicz po:
  - `foundry.applications.api.ApplicationV2`
  - `foundry.applications.sheets.ActorSheetV2`
  - `foundry.applications.sheets.ItemSheetV2`
  - lub po Twoich klasach bazowych dziedziczących z `DocumentSheetV2`.

**DEFAULT_OPTIONS i PARTS (v14):**

- Szablon i konfigurację okna definiuj przez:
  ```js
  static DEFAULT_OPTIONS = {
    window: {
      title: "COGSYNDICATE.window.title",
      resizable: true,
      contentClasses: ["cogwheel-sheet"],
    },
    position: {
      width: 600,
      height: "auto",
    },
    tag: "form",
    form: {
      handler: this.#onSubmit, // lub metoda instancyjna
    },
    dragDrop: [{ dragSelector: ".item", dropSelector: ".item-list" }],
    tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }],
  };
  ```

- ZAWSZE używaj `static PARTS` do dzielenia szablonu na logiczne części:
  ```js
  static PARTS = {
    header: "systems/cogwheel/templates/sheets/actor/header.hbs",
    body: "systems/cogwheel/templates/sheets/actor/body.hbs",
    footer: "systems/cogwheel/templates/sheets/actor/footer.hbs",
  };
  ```

**Lifecycle i kontekst:**

- Używaj lifecycle hooks: `_prepareContext(options)`, `_onRender(context, options)`, `_onClose(options)`.
- `_prepareContext(options)` zastępuje stare `getData()` – to tu budujesz dane dla Handlebars.

Przykład:

```js
async _prepareContext(options) {
  const context = await super._prepareContext(options);
  Object.assign(context, {
    actor: this.actor,
    system: this.actor.system,
    systemFields: this.actor.system.schema.fields,
    config: CONFIG.COGSYNDICATE,
  });
  return context;
}
```

---

### 3. Native DOM (bez jQuery)

- ZAWSZE używaj natywnego DOM API:
  - `querySelector`, `querySelectorAll`, `addEventListener`, `classList`, `dataset`,
  - `innerHTML`, `closest()`, `remove()`, `append()`, `replaceChildren()`.

- NIGDY nie używaj:
  - `$()`, `.find()`, `.on()`, `.off()`,
  - żadnych metod jQuery ani wrapperów typu `$(html)`.

**Rejestrowanie zdarzeń:**

- Zdarzenia rejestruj przez:
  - `_onRender(context, options)` – po wyrenderowaniu okna,
  - metody pomocnicze np. `_attachFrameListeners(htmlElement)`.

Przykład:

```js
_onRender(context, options) {
  const html = this.element; // root HTMLElement
  html.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", (event) => this.#onClickAction(event));
  });
}
```

---

### 4. DialogV2

- ZAWSZE używaj `foundry.applications.api.DialogV2` do dialogów i okienek potwierdzenia.
- NIGDY nie używaj przestarzałego `Dialog` (V1).

Preferowane metody:

- `DialogV2.confirm()`
- `DialogV2.prompt()`
- `DialogV2.wait()`

Przykład:

```js
const result = await foundry.applications.api.DialogV2.confirm({
  window: { title: game.i18n.localize("COGSYNDICATE.dialog.confirmTitle") },
  content: `<p>${game.i18n.localize("COGSYNDICATE.dialog.confirmBody")}</p>`,
  yes: { callback: () => true },
  no: { callback: () => false },
});
if (!result) return;
```

---

### 5. Data Models (TypeDataModel / DataModel) w v14

- ZAWSZE modeluj dane aktorów i itemów jako `TypeDataModel` (klasy dziedziczące po `foundry.abstract.TypeDataModel`).
- Schemat definiuj przez `static defineSchema()` z polami z `foundry.data.fields.*`.
- Używaj: `NumberField`, `StringField`, `BooleanField`, `SchemaField`, `ArrayField`, `ObjectField`, `HTMLField`, `TypedObjectField`.

Przykład:

```js
class CogwheelAgentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      rank: new fields.StringField({ initial: "rookie" }),
      stress: new fields.NumberField({ required: true, initial: 0, min: 0 }),
      resolve: new fields.NumberField({ required: true, initial: 10, min: 0 }),
      fortune: new fields.NumberField({ required: true, initial: 3, min: 0 }),

      archetype: new fields.StringField({ initial: "" }),

      // Pole pochodne, nie zapisywane w bazie, ale dostępne dla efektów
      currentPressure: new fields.NumberField({
        initial: 0,
        min: 0,
        persisted: false,
      }),
    };
  }

  /** Inicjalizacja danych bazowych z konfiguracji/systemu */
  prepareBaseData() {
    // przykład: ustawienie domyślnych wartości na podstawie CONFIG.COGSYNDICATE
  }

  /** Wyliczanie danych pochodnych z innych pól */
  prepareDerivedData() {
    const system = this;
    system.currentPressure = Math.max(0, (system.stress + system.resolve) - system.fortune);
  }
}
```

- Dostęp do danych ZAWSZE przez `actor.system.*` lub `item.system.*`, nigdy przez `actor.data.data.*`.
- NIE dodawaj „dzikich” właściwości do `system` – każde pole musi być zdefiniowane w `defineSchema()`.

---

### 6. Konwencje kodu

- JavaScript: `ES2022+`, klasy, `async/await`, bez transpilacji.
- Nazewnictwo:
  - `camelCase` dla zmiennych i metod,
  - `PascalCase` dla klas.
- Komentarze: po polsku lub angielsku, zwięźle, w stylu:
  - `// Wyliczenie presji psychicznej agenta`
- Lokalizacja:
  - zawsze przez `game.i18n.localize("COGSYNDICATE.klucz")` lub `game.i18n.format("COGSYNDICATE.klucz", data)`,
  - NIE hardcoduj polskich/angielskich/francuskich tekstów ani w JS, ani w HBS.
- Flagi i ustawienia:
  - przez `game.settings.register` / `document.setFlag` / `document.getFlag`.

---

### 7. Formularze — `formInput` i `systemFields`

- ZAWSZE przekazuj `systemFields: this.actor.system.schema.fields` (lub item) w `_prepareContext()`, aby szablony HBS miały dostęp do definicji pól schematu.
- ZAWSZE używaj helpera `{{formInput schemaField value=system.pole}}` do generowania inputów:
  - Foundry samo dobierze typ (`<input type="number">`, `<input type="text">`, `<select>`, itp.)
  - zastosuje `min`, `max`, `choices`, `required`.
- NIGDY nie buduj ręcznie `<input>`, `<select>` czy `<label>` tam, gdzie pole istnieje w schemacie — helper `formInput` robi to automatycznie w 1 linijce.
- Label pola wyciągaj ze schematu przez `{{localize schemaField.label}}` — nie hardcoduj etykiet w HBS.
- Dla pól wyboru (dropdown) definiuj `choices` bezpośrednio w `StringField` w data modelu (np. przez `toLabelObject(CONFIG.COGSYNDICATE.fachy)`) – `formInput` wygeneruje `<select>` automatycznie.

**Przykład — `_prepareContext()`:**

```js
async _prepareContext(options) {
  const context = await super._prepareContext(options);
  Object.assign(context, {
    actor: this.actor,
    system: this.actor.system,
    systemFields: this.actor.system.schema.fields, // kluczowe!
    config: CONFIG.COGSYNDICATE,
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

---

### 8. Pop-out Applications (Foundry v14)

- Traktuj pop‑out jako funkcję rdzenia Foundry v14 – NIE buduj własnych wrapperów na bazie `Application` V1.
- Jeśli potrzebujesz integracji z pop‑out:
  - używaj publicznych właściwości/method AppV2/Sidebar (np. `ui.sidebar.popouts`),
  - dodaj komentarz `// TODO: verify against v14 pop-out API` jeśli nie masz pewności co do szczegółów implementacji,
  - NIE polegaj na nieudokumentowanych hackach.

---

## Czego NIGDY nie rób!

- ❌ Nie używaj jQuery (`$()`, `.find()`, `.on()`).
- ❌ Nie używaj `Application / ActorSheet / ItemSheet (V1)` ani innych klas z `appv1.api.*`.
- ❌ Nie używaj `Dialog (V1)` — tylko `DialogV2`.
- ❌ Nie używaj `actor.data.data.*` — tylko `actor.system.*`.
- ❌ Nie zapisuj danych w `system` poza schematem TypeDataModel — każde pole musi mieć definicję w `defineSchema()`.
- ❌ Nie używaj globalnych helperów `mergeObject` / `duplicate()` — używaj `foundry.utils.mergeObject()` i `foundry.utils.deepClone()`.
- ❌ Nie buduj ręcznie `<input>/<select>` dla pól zdefiniowanych w schemacie — używaj `{{formInput systemFields.pole value=system.pole}}`.
- ❌ Nie hardcoduj etykiet w HBS gdy pole ma `label` w schemacie — używaj `{{localize systemFields.pole.label}}`.
- ❌ Nie twórz własnych duplikatów natywnych funkcji (`clone`, `merge`, `deepEqual`, `getNestedValue` itp.) — używaj `foundry.utils.*`.
- ❌ Nie twórz własnych systemów eventów/hooków — używaj `Hooks` API Foundry.
- ❌ Nie twórz własnych wrapperów na `fetch` — używaj `foundry.utils.fetchJsonWithTimeout()` lub natywnego `fetch`.
- ❌ Nie definiuj własnych stałych pokrywających się z `CONST.*` Foundry (np. `DOCUMENT_OWNERSHIP_LEVELS`, `DICE_ROLL_MODES`).
- ❌ Nie twórz własnego systemu lokalizacji — wyłącznie `game.i18n.localize()` i `game.i18n.format()`.

---

## Helpers i utilitarki — zasady

- Używaj natywnych helperów Foundry API.
- ZAWSZE korzystaj z gotowych helperów dostępnych w `foundry.utils.*` zamiast pisać własne implementacje.

### Najważniejsze natywne helpery, których MUSISZ używać:

- `foundry.utils.mergeObject()` — łączenie obiektów.
- `foundry.utils.deepClone()` — głęboka kopia obiektu.
- `foundry.utils.expandObject()` — rozwijanie płaskiego obiektu (np. z formularza).
- `foundry.utils.flattenObject()` — spłaszczanie zagnieżdżonego obiektu.
- `foundry.utils.getProperty()` — bezpieczny dostęp do zagnieżdżonej właściwości.
- `foundry.utils.setProperty()` — bezpieczne ustawianie zagnieżdżonej właściwości.
- `foundry.utils.hasProperty()` — sprawdzenie istnienia właściwości.
- `foundry.utils.diffObject()` — diff dwóch obiektów.
- `foundry.utils.isEmpty()` — sprawdzenie czy obiekt/tablica jest pusta.
- `foundry.utils.randomID()` — generowanie unikalnego ID.
- `foundry.utils.debounce()` — debounce funkcji.
- `foundry.utils.isSubclass()` — sprawdzenie dziedziczenia klas.
- `Hooks.on()`, `Hooks.once()`, `Hooks.call()`, `Hooks.callAll()` — system eventów Foundry.

### Handlebars helpers

- ZAWSZE sprawdzaj najpierw, czy dany helper nie istnieje już w Foundry lub w zarejestrowanych helperach systemu.
- Rejestruj własne helpery TYLKO jeśli nie istnieje natywny odpowiednik.
- Przy rejestracji ZAWSZE używaj prefiksu `cogwheel-` aby uniknąć konfliktów z natywnymi helperami Foundry i innymi systemami/modułami:

```js
Handlebars.registerHelper("cogwheel-capitalize", (str) => str.capitalize());
```

- NIGDY nie nadpisuj istniejących helperów Foundry (`eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `and`, `or`, `not`, `concat`, `localize`, itp.).

---

## Best practices pakietów (manifest, wersje, lokalizacja)

- ZAWSZE używaj wersji jako stringa (np. `"1.2.3"`) w `system.json` / `module.json`.
- ZAWSZE używaj stabilnego URL `manifest` (np. raw GitHub albo release) — nie zmieniaj pliku pod tym samym URL bez zmiany wersji.
- NIE wydawaj dwóch różnych buildów pod tym samym numerem wersji.
- ZAWSZE lokalizuj stringi od początku:
  - pliki w `lang/` (np. `lang/pl.json`, `lang/en.json`),
  - użycie w kodzie wyłącznie przez `game.i18n.localize/format`.
- ZAWSZE udostępniaj API modułu przez `game.modules.get("agenci-cogwheel")?.api` zamiast globalnych zmiennych.
- NIE nadpisuj core funkcji bez użycia `libWrapper` (jeśli korzystasz z patchowania zachowania Foundry).

---

### Przed napisaniem każdego helpera

- Zanim napiszesz własną funkcję pomocniczą, sprawdź czy istnieje w:
  - `foundry.utils.*`
  - `CONFIG.*`
  - `CONST.*`
- Sprawdź natywne helpery Handlebars zarejestrowane przez Foundry.

Jeśli nie masz pewności — napisz `// TODO: check if foundry.utils.* equivalent exists` i zaproponuj własną implementację jako tymczasową.

Jeśli jakiś fragment API Foundry v14 jest Ci nieznany lub niepewny — powiedz to wprost i zaproponuj rozwiązanie z adnotacją `// TODO: verify against v14 API`. NIE generuj kodu opartego na V1 API jako fallbacku.

***

## Podsumowanie luk

| Obszar                             | W CLAUDE.md | Brakuje |
|------------------------------------|------------|---------|
| Data Model (defineSchema)         | ✅         | —       |
| `systemFields` w kontekście       | ✅         | —       |
| `{{formInput}}` helper            | ✅         | —       |
| `choices` w StringField → select  | ✅         | —       |
| Label ze schematu w HBS           | ✅         | —       |
| `min`/`max` z NumberField         | ✅         | —       |
| `persisted: false` dla pól pochodnych | ✅ (dodane) | —   |
| `prepareBaseData` / `prepareDerivedData` | ✅ (dodane) | — |
| Pop-out Applications (v14)        | ✅ (dodane) | —       |
| Best practices manifest/lokalizacja | ✅ (dodane) | —    |