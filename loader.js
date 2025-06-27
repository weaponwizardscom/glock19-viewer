/**
 * loader.js – KOD 5
 * Mobile/tablet breakpoint do 1024 px
 */
const mqMobile = window.matchMedia('(max-width: 1024px)');

(async () => {
  await import('./app.common.js');

  // Ensure DOMContentLoaded listeners run if they were attached late
  if (document.readyState !== 'loading') {
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }

  if (mqMobile.matches) {
    const mod = await import('./app.mobile.js');
    if (typeof mod.initMobile === 'function') mod.initMobile();
  }
})();

mqMobile.addEventListener('change', () => location.reload());
