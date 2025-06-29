// src/registerSW.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/glock19-viewer/sw.js');
  });
}
