const mqMobile = window.matchMedia('(max-width: 768px)');

(async () => {
  // Ładujemy wspólny kod (to jest Twój obecny app.js przeniesiony/ skopiowany jako app.common.js)
  await import('./app.common.js');
  if (mqMobile.matches) {
    const mod = await import('./app.mobile.js');
    if (mod.initMobile) mod.initMobile();
  }
})();
mqMobile.addEventListener('change', () => location.reload());
