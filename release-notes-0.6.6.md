# Cogwheel Syndicate v0.6.6 - Kontrola Uprawnień Przycisków Czatu

## 🛡️ Główne Ulepszenia

### Ograniczenie Aktywności Przycisków Czatu
- **Przyciski "Podnieś poziom sukcesu za 2PP" i "Przerzuć test za 3PP" są teraz aktywne tylko dla autora rzutu i mistrza gry**
- Eliminuje ryzyko przypadkowego kliknięcia nieswojego rzutu przez innych graczy
- **Wizualne wskazania**: Przyciski dla nieuprawniony użytkowników są automatycznie wyłączane z tooltipem informującym o braku uprawnień

## 🎨 Ulepszenia UX/UI

### Wizualne Wskazania Uprawnień
- Nowy styl CSS `.disabled-for-user` dla przycisków wyłączonych z powodu uprawnień
- Szary gradient, przerywaną ramka, zmniejszona przezroczystość i kursor `not-allowed`
- Tooltips z komunikatami o braku uprawnień w języku polskim i angielskim

## ⚙️ Zmiany Techniczne

### Sprawdzanie Uprawnień
- Funkcja `canUserInteractWithButton(authorUserId)` sprawdzająca uprawnienia użytkowników
- **GM** - może kliknąć wszystkie przyciski bez ograniczeń
- **Autor rzutu** - może kliknąć tylko swoje przyciski
- **Inni gracze** - widzą przyciski, ale są wyłączone

### Optymalizacja Kodu
- Połączono dwa hooki `renderChatMessage` w jeden dla lepszej wydajności
- Rozszerzenie wszystkich przycisków czatu o atrybut `data-user-id`
- Automatyczne dodawanie sprawdzania uprawnień podczas renderowania wiadomości

## 🌍 Tłumaczenia

### Nowe Komunikaty
- `COGSYNDICATE.UpgradeButtonNoPermission` - komunikat o braku uprawnień do podnoszenia sukcesu
- `COGSYNDICATE.RerollButtonNoPermission` - komunikat o braku uprawnień do przerzutu

## 🔧 Jak to Działa

1. **Podczas rzutu**: System automatycznie dodaje ID użytkownika do generowanych przycisków
2. **Podczas renderowania**: Sprawdza uprawnienia i wyłącza przyciski dla nieuprawniony użytkowników
3. **Podczas kliknięcia**: Dodatkowo sprawdza uprawnienia z komunikatem błędu w przypadku próby obejścia

---

**Uwaga**: Ta wersja jest w pełni kompatybilna z poprzednimi zapisami gry. Wszystkie istniejące funkcjonalności działają bez zmian.
