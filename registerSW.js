// registerSW.js
// Rejestrujemy service-workera wygenerowanego przez vite-plugin-pwa
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/glock19-viewer/sw.js');
  });
}
