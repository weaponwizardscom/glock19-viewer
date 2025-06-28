# Weapon Wizards iOS Web Bundle

Ten pakiet zawiera niezmienione pliki Twojej aplikacji (index.html, app.js itd.)
oraz minimalny plik `vite.config.js`, który:

* kopiuje katalog `public` (gdzie wstawiasz `g17.svg`, folder `img`, tła itp.)
  do finalnego `dist/`,
* pozostawia układ plików bez bundlowania modułów — wszystko zostaje tak,
  jak w oryginalnym projekcie.

**Co musisz zrobić przed kompilacją:**

1. Dodaj do `public/` wszystkie pliki statyczne:
   ```
   public/
     g17.svg
     img/
       t1.png …
       glock17.png
   ```
2. W terminalu:
   ```bash
   npm install
   npm run build
   npx cap copy ios
   ```
3. Uruchom Xcode z `ios/App/App.xcworkspace`.

Gotowe – web‑view w aplikacji będzie ładował Twojego konfiguratora offline.