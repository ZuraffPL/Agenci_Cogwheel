# System Wspólnych Funkcji - Dokumentacja

## 🎯 Cel
System wspólnych funkcji został stworzony, aby:
- **Zredukować duplikację kodu** między wersjami kart postaci
- **Ułatwić utrzymanie** systemu (poprawka w jednym miejscu zamiast w wielu)
- **Zachować elastyczność** dla przyszłych wersji kart
- **Nie psuć istniejącej funkcjonalności**

## 📁 Struktura

```
src/scripts/shared/
├── actor-gear-functions.js         # Wspólne funkcje dla wydawania sprzętu
├── actor-stress-functions.js       # Wspólne funkcje dla wydawania stresu
├── actor-equipment-functions.js    # Wspólne funkcje dla zarządzania ekwipunkiem
├── EXAMPLES.js                     # Przykłady dostosowań gear/stress
├── EQUIPMENT-EXAMPLES.js           # Przykłady dostosowań ekwipunku
└── README.md                       # Ten plik
```

## 🔧 Jak to działa

### Aktualne użycie:
- **actor-sheet.js** (v1) - używa `_onSpendGearShared()` i `_onSpendStressShared()`
- **actor-sheetv2.js** (v2) - używa `_onSpendGear()` i `_onSpendStress()` z wspólnych funkcji

### Domyślne zachowanie:
Jeśli nie przekażesz żadnych opcji, funkcje działają **dokładnie tak samo** jak oryginalne.

## 🎛️ Dostosowania

### ActorGearFunctions.handleSpendGear(actor, sheet, options)

**Opcje dostosowań:**
- `onSuccess(gearType, gearCost, steamCost, newGearValue)` - callback po sukcesie
- `onError(error)` - custom obsługa błędów
- `validateGearCost(gearType, gearCost, steamCost, currentGear, currentSteam)` - custom walidacja
- `formatMessage(gearType, gearCost, steamCost, actorName)` - custom formatowanie komunikatu

### ActorStressFunctions.handleSpendStress(actor, sheet, options)

**Opcje dostosowań:**
- `onSuccess(stressAction, stressCost, steamBonus, finalStressValue, traumaOccurred)` - callback po sukcesie
- `onError(error)` - custom obsługa błędów
- `validateStressCost(stressAction, stressCost, steamBonus, currentStress, maxStress, currentSteam)` - custom walidacja
- `formatMessage(stressAction, actorName, traumaOccurred)` - custom formatowanie komunikatu
- `onTraumaWarning(actor, currentStress, stressCost, maxStress)` - custom ostrzeżenie o traumie

### ActorEquipmentFunctions.handleAddEquipment(actor, sheet, options)
### ActorEquipmentFunctions.handleEditEquipment(actor, sheet, index, options) 
### ActorEquipmentFunctions.handleDeleteEquipment(actor, sheet, index, options)

**Opcje dostosowań:**
- `validateInput(formData, html, config)` - custom walidacja danych z formularza
- `validateCost(cost, availablePoints, actor, config)` - custom walidacja kosztów
- `showValidationError(html, message)` - custom wyświetlanie błędów walidacji
- `processEquipmentData(formData, config)` - custom przetwarzanie danych sprzętu
- `calculateRefund(equipment, actor, config)` - custom kalkulacja zwrotu za usunięty sprzęt
- `confirmDelete` - czy potwierdzać usunięcie (domyślnie true)
- `equipmentDefaults` - domyślne wartości dla nowego sprzętu
- `onSuccess(...)` - callback po sukcesie operacji
- `onError(error, actor, sheet, config)` - custom obsługa błędów

## 🚀 Przykłady użycia

### Standardowe użycie (jak teraz):
```javascript
async _onSpendGear(event) {
  event.preventDefault();
  await ActorGearFunctions.handleSpendGear(this.actor, this, {});
}
```

### Z dostosowaniem dla konkretnej wersji:
```javascript
async _onSpendGear(event) {
  event.preventDefault();
  await ActorGearFunctions.handleSpendGear(this.actor, this, {
    validateGearCost: (gearType, gearCost, steamCost, currentGear, currentSteam) => {
      // Własna logika walidacji
      if (gearType === 'forbidden-item' && this.actor.type === 'agentv1') {
        return { valid: false, message: "Agent v1 nie może używać tego przedmiotu!" };
      }
      return { valid: true };
    },
    
    onSuccess: (gearType, gearCost, steamCost, newGearValue) => {
      // Dodatkowe akcje po sukcesie
      console.log(`Agent v2 użył ${gearType}!`);
    }
  });
}
```

## 🔮 Przyszłe wersje kart

### Scenariusz 1: Agent v3 z nowymi funkcjami
```javascript
// Nowa karta może używać wspólnych funkcji z dostosowaniami
async _onSpendGear(event) {
  await ActorGearFunctions.handleSpendGear(this.actor, this, {
    // v3-specific customizations
  });
}
```

### Scenariusz 2: Agent v4 z kompletnie nową mechaniką
```javascript
async _onSpendGear(event) {
  const useNewSystem = this.actor.getFlag('cogwheel', 'newGearSystem');
  
  if (useNewSystem) {
    // Kompletnie nowa logika
    await this._handleQuantumGearSystem(event);
  } else {
    // Fallback do wspólnej funkcji
    await ActorGearFunctions.handleSpendGear(this.actor, this, {});
  }
}
```

## ✅ Co zostało zdedukcowane:

### 1. **Funkcje Gear/Stress** (pierwsza iteracja)
- ✅ `_onSpendGear()` i `_onSpendStress()` 
- ✅ ~200 linii kodu mniej w każdej karcie
- ✅ Zachowana różnica między V1 i V2
- ✅ Elastyczne dostosowania per wersja

### 2. **Funkcje Equipment** (druga iteracja)
- ✅ `_onAddEquipment()`, `_onEditEquipment()`, `_onDeleteEquipment()`
- ✅ ~300+ linii kodu mniej w każdej karcie  
- ✅ Zachowane różnice w walidacji V1/V2
- ✅ Pełny system customizacji

## ✅ Korzyści

1. **Drastyczne zmniejszenie rozmiaru** - ~500+ linii zduplikowanego kodu usunięte
2. **Łatwiejsze utrzymanie** - bug fixy w jednym miejscu zamiast w wielu
3. **Spójność funkcji** - wszystkie karty działają tak samo (chyba że celowo zmienimy)
4. **Maksymalna elastyczność** - każda wersja może łatwo dodać własne funkcje
5. **Backward compatibility** - wszystkie karty działają bez zmian
6. **Future-proof** - łatwe dodawanie nowych wersji kart
7. **Debugging** - łatwiejsze znajdowanie i naprawianie problemów

**Łączne oszczędności:** ~500+ linii zduplikowanego kodu usunięte! 🎉

## 🛡️ Bezpieczeństwo

- **Nie psuję istniejących kart** - wszystko działa tak samo jak wcześniej
- **Fallback** - jeśli coś pójdzie nie tak, zawsze można wrócić do starej funkcji
- **Testy** - łatwo przetestować wspólne funkcje oddzielnie

## 📝 Rozwój

Aby dodać nową funkcję wspólną:
1. Dodaj ją do odpowiedniego pliku w `src/scripts/shared/`
2. Zaktualizuj `system.json` jeśli potrzeba
3. Dodaj przykład użycia do `EXAMPLES.js`
4. Przetestuj na wszystkich wersjach kart

---

*System stworzony z myślą o przyszłości - łatwy do rozszerzania, bezpieczny w użyciu.*
