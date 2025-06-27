# Glock 19 viewer – refaktoryzacja
Ten pakiet zawiera nową wersję **index.html** oraz osobne arkusze **style.css** (mobile‑first) i **desktop.css**.
Aplikacja nadal korzysta z oryginalnego `app.js`. Umieść wszystkie pliki w głównym katalogu projektu, zachowując dotychczasowe
foldery `img/` i plik `g17.svg`.

Plik **config.json** to podstawa do dalszej modularizacji danych (cennik, kolory, części). Na razie nie jest jeszcze podłączony w JS –
przy kolejnej iteracji możemy dodać jego automatyczne wczytywanie.
