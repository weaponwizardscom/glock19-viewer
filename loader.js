/**
 * Loader with DOMContentLoaded re-dispatch for late‑loaded modules.
 */
const mqMobile = window.matchMedia('(max-width: 768px)');

(async () => {
  // 1. Załaduj główny moduł z logiką konfiguratora
  await import('./app.common.js');

  // 2. Jeżeli DOMContentLoaded już było, wywołujemy je ponownie,
  //    bo app.common.js mógł dodać słuchacza po fakcie.
  if (document.readyState !== 'loading') {
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }

  // 3. Mobile‑specific reorder (≤768 px)
  if (mqMobile.matches) {
    const mod = await import('./app.mobile.js');
    if (typeof mod.initMobile === 'function') mod.initMobile();
  }
})();

// Odśwież stronę przy zmianie breakpointu (np. obrót ekranu)
mqMobile.addEventListener('change', () => location.reload());
