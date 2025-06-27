
/* KOD 17 – statyczny slider, paleta przewijana TYLKO suwakiem */
/* Założenie: w dokumencie istnieje div#palette (kontener z próbkami) */
(function() {
  if (window.innerWidth > 1024) return;         // tylko mobile / tablet
  const palette = document.getElementById('palette');
  if (!palette) return;

  /* ---------- BLOKOWANIE NATIVE SCROLLA PALETY ---------- */
  const blockEvt = e => e.preventDefault();
  palette.addEventListener('touchmove', blockEvt, {passive:false});
  palette.addEventListener('wheel',     blockEvt, {passive:false});

  /* ---------- TWORZENIE / POZYSKANIE STAŁEGO SLIDERA ---------- */
  let slider = document.querySelector('.ww-vertical-slider');
  if (!slider) {
    slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'ww-vertical-slider';
    document.body.appendChild(slider);
  }

  /* Styl dynamiczny – wysokość i pozycja slidera równa się wysokości i górze palety */
  const applyPos = () => {
    const rect = palette.getBoundingClientRect();
    slider.style.position = 'fixed';
    slider.style.right    = '10px';
    slider.style.top      = rect.top + 'px';
    slider.style.height   = rect.height + 'px';
  };

  /* Ustaw max suwaka = maksymalny scrollTop palety */
  const setSliderLimits = () => {
    const max = Math.max(0, palette.scrollHeight - palette.clientHeight);
    slider.min = 0;
    slider.max = max;
    slider.step = 1;
  };

  /* Synchronizacja kierunek: slider -> scroll */
  slider.addEventListener('input', () => {
    palette.scrollTop = parseInt(slider.value, 10);
  });

  /* Synchronizacja kierunek: scroll -> slider  (przydatne jeśli kiedyś ruszymy paletę skryptowo) */
  palette.addEventListener('scroll', () => {
    slider.value = palette.scrollTop;
  });

  /* Init */
  const init = () => {
    applyPos();
    setSliderLimits();
    slider.value = palette.scrollTop;
  };

  /* Reakcja na zmianę rozmiaru / orientacji */
  window.addEventListener('resize', () => {
    applyPos();
    setSliderLimits();
  });

  /* Delay, żeby poczekać na obrazki w palecie */
  window.addEventListener('load', init);
  document.addEventListener('DOMContentLoaded', init);
})();
