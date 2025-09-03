# System Efektów Atutów (Feats Effects System)

## Opis

System automatycznie stosuje specjalne efekty gdy określone atuty (feats) są przeciągane na karty agentów, w zależności od ich archetypu i innych warunków.

## Aktualne Efekty

### Parowy Komandos + Parowa Augmentacja

**Warunki:**
- Agent posiada archetyp "Parowy Komandos"
- Na jego kartę zostaje przeciągnięty atut "Parowa Augmentacja"

**Efekt:**
- Bazowa wartość atrybutu **Stal** wzrasta o 1 punkt
- Maksymalna wartość bazowa to 6
- Jeśli Stal już ma wartość 6, efekt nie jest stosowany
- System wyświetla powiadomienie i wiadomość na czacie

**Usuwanie:**
- Gdy atut "Parowa Augmentacja" jest usuwany z karty Parowego Komandosa
- Bazowa wartość **Stali** maleje o 1 punkt
- Minimalna wartość to wartość bazowa archetypu (zwykle 5)

### Geniusz Techniki + Majsterkowicz

**Warunki:**
- Agent posiada archetyp "Geniusz Techniki" 
- Na jego kartę zostaje przeciągnięty atut "Majsterkowicz"

**Efekt:**
- Bazowa wartość atrybutu **Maszyna** wzrasta o 1 punkt
- Maksymalna wartość bazowa to 6
- Jeśli Maszyna już ma wartość 6, efekt nie jest stosowany
- System wyświetla powiadomienie i wiadomość na czacie z ikoną klucza

**Usuwanie:**
- Gdy atut "Majsterkowicz" jest usuwany z karty Geniusza Techniki
- Bazowa wartość **Maszyny** maleje o 1 punkt
- Minimalna wartość to wartość bazowa archetypu

## Techniczne Aspekty

### Pliki

- `src/scripts/feats-effects.mjs` - główny moduł systemu
- `src/scripts/actor-sheet.js` - integracja z kartą agenta v1
- `src/scripts/actor-sheetv2.js` - integracja z kartą agenta v2
- `src/scripts/init.js` - inicjalizacja systemu

### Klasa FeatsEffects

#### Główne Metody

- `applyFeatEffects(actor, feat)` - stosuje efekty przy dodawaniu atutu
- `removeFeatEffects(actor, feat)` - usuwa efekty przy usuwaniu atutu
- `hasFeatEffects(actor, feat)` - sprawdza czy atut ma efekty dla danego aktora
- `getFeatEffectDescription(actor, feat)` - zwraca opis efektów

#### Prywatne Metody dla Konkretnych Efektów

- `_applySteamAugmentationEffect(actor, advantage)` - stosuje efekt Parowej Augmentacji
- `_removeSteamAugmentationEffect(actor, advantage)` - usuwa efekt Parowej Augmentacji

### Integracja z Kartami Agentów

System jest automatycznie wywoływany w następujących sytuacjach:

1. **Przeciąganie atutu na kartę** - `_onDrop()` w actor-sheet.js i actor-sheetv2.js
2. **Usuwanie atutu z karty** - `_onDeleteFeat()` w obu wersjach kart

### Powiadomienia

System wyświetla:
- **UI Notifications** - powiadomienia w prawym górnym rogu
- **Chat Messages** - szczegółowe wiadomości na czacie z efektami wizualnymi

### CSS Styling

Wiadomości na czacie mają specjalne stylowanie zdefiniowane w `cogwheel.css`:
- Tło gradientowe w kolorach steampunkowych
- Złota ramka i nagłówki
- Ikony Font Awesome
- Responsywne style

## Rozszerzanie Systemu

### Dodawanie Nowych Efektów

1. **Dodaj warunek** w `applyFeatEffects()`:
```javascript
if (archetypeName.includes('nazwa_archetypu') && featName.includes('nazwa_atutu')) {
  return await this._applyNowyEfekt(actor, feat);
}
```

2. **Stwórz metody implementacyjne**:
```javascript
static async _applyNowyEfekt(actor, feat) {
  // logika stosowania efektu
}

static async _removeNowyEfekt(actor, feat) {
  // logika usuwania efektu
}
```

3. **Dodaj do metod pomocniczych**:
- `removeFeatEffects()`
- `hasFeatEffects()`
- `getFeatEffectDescription()`

### Przykład Nowego Efektu

```javascript
// Sprawdzanie warunków
if (archetypeName.includes('mechanik') && featName.includes('precyzyjne narzędzia')) {
  return await this._applyPrecisionToolsEffect(actor, feat);
}

// Implementacja efektu
static async _applyPrecisionToolsEffect(actor, feat) {
  const updates = {
    "system.attributes.engineering.base": actor.system.attributes.engineering.base + 1
  };
  await actor.update(updates);
  
  await ChatMessage.create({
    content: `<div class="feat-effect-message">...</div>`,
    speaker: { actor: actor.id }
  });
  
  return true;
}
```

## Debugging

System loguje informacje do konsoli:
```javascript
console.log(`FeatsEffects: Checking effects for feat "${feat.name}" on actor "${actor.name}"`);
```

Włącz Developer Tools (F12) żeby zobaczyć logi systemu.

## Bezpieczeństwo

- System sprawdza typy obiektów przed operacjami
- Wartości atrybutów są ograniczane do sensownych zakresów
- Efekty mogą być cofnięte przez usunięcie atutu
- Wszystkie zmiany są zapisywane w bazie danych Foundry VTT

## Kompatybilność

- Foundry VTT v12+
- System Cogwheel Syndicate v0.7.4+
- Obsługuje obie wersje kart agentów (v1 i v2)
- Działa z systemem przeciągania i upuszczania Foundry VTT
