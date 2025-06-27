KOD 10 – uniwersalny loader graficzny
====================================
**Pliki do podmiany:**
  • index.html      (dodany overlay #loader + script hide)  
  • styles.base.css (style loader + spinner)

Działanie:
  * Po otwarciu strony wyświetla się pełnoekranowa czarna plansza z animowanym
    spinnerem (border-top w kolorze --pri).
  * Gdy `window` wyemituje event `load` (wszystkie obrazy i SVG załadowane),
    skrypt dodaje klasę `.hide`, która płynnie wygasza overlay (opacity → 0).

Nie wymaga zmian w JavaScript aplikacji. Desktop i mobile korzystają z tego
samego loadera, dzięki czemu zniknie efekt „wczytywania od góry”.
