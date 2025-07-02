# Cogwheel Syndicate v0.6.7 - Release Notes

## 🎯 Akcje Przybocznych/Nemezis

### Nowe funkcje:
- **Sekcja "Akcje Przybocznych/Nemezis"** w oknie wydawania Punktów Nemezis
- **Dowolna liczba PN (1-10)** do wydania na akcję specjalną
- **Interaktywny interfejs** z automatycznym zaznaczaniem opcji
- **Walidacja danych** z komunikatami błędów
- **Specjalne komunikaty na czacie** z dedykowanym formatowaniem

### Szczegóły techniczne:
- Rozbudowa szablonu `spend-np-dialog.hbs` o nową sekcję
- Logika obsługi akcji niestandardowych w `metacurrency-app.mjs`
- Event listenery dla lepszego UX (automatyczne zaznaczanie)
- Walidacja zakresu 1-10 punktów z komunikatami błędów
- Pełne tłumaczenia PL/EN dla wszystkich nowych elementów

### Usprawnienia UX:
- Radio button automatycznie zaznacza się przy kliknięciu na pole liczby
- Dynamiczne aktualizowanie kosztu akcji
- Dedykowane komunikaty na czacie dla akcji Przybocznych/Nemezis
- Zachowanie spójności stylu z resztą interfejsu

---

**Kompatybilność:** Foundry VTT v12+  
**Typ aktualizacji:** Rozszerzenie funkcjonalności  
**Wymagane działania:** Brak, automatyczna aktualizacja
