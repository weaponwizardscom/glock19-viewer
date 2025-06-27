Weapon‑Wizards – UPDATE (mobile reorder)
=======================================

W paczce znajdują się pliki:

1. index.html     – z podpiętym loader.js
2. loader.js      – dynamicznie importuje app.common.js oraz app.mobile.js
3. app.mobile.js  – skrypt ustawiający nową kolejność kontenerów na mobile

Instrukcja instalacji
---------------------
1. Skopiuj swój *obecny* `app.js` jako **app.common.js** (albo zmień mu nazwę).
2. Podmień `index.html` na wersję z tej paczki.
3. Dodaj pliki `loader.js` i `app.mobile.js` do katalogu projektu obok `app.common.js`.
4. Nie zmieniaj plików CSS ani JavaScriptu desktopowego – pozostają bez zmian.

Od teraz:
* Desktop (szerokość >768 px) ładuje tylko `app.common.js`.
* Mobile (≤768 px) – po `app.common.js` doładowuje `app.mobile.js` i wykonuje reorder.

Test:
— Otwórz w przeglądarce DevTools i włącz przełącznik urządzenia (≤768 px).  
— Sprawdź, czy elementy są w nowej kolejności.

Gotowe!
