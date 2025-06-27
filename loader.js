/**
 * Universal loader – supports mobile up to 1024 px (iPhone & iPad).
 * Adds `mobile-active` class to <body> gdy ładowana jest wersja mobilna.
 */
const mqMobile = window.matchMedia('(max-width: 1024px)');

(async () => {
  await import('./app.common.js');

  // Fire DOMContentLoaded for late listeners
  if (document.readyState !== 'loading') {
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }

  if (mqMobile.matches) {
    document.body.classList.add('mobile-active');
    const mod = await import('./app.mobile.js');
    if (typeof mod.initMobile === 'function') mod.initMobile();
  }
})();

mqMobile.addEventListener('change', () => location.reload());
