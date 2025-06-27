
/* KOD 19 – ostateczny slider mobilny */
/* Działa tylko, gdy viewport <= 1024px */
(function(){
  if (window.innerWidth > 1024) return;
  const palette = document.getElementById('palette');
  if (!palette) return;

  /* ---------- Blokujemy natywny scroll dotykowy palety ---------- */
  const touchBlocker = (e) => {
    if (e.target.closest('#palette')) {
      e.preventDefault();
    }
  };
  document.addEventListener('touchmove', touchBlocker, {passive:false, capture:true});
  palette.addEventListener('wheel', (e)=> e.preventDefault(), {passive:false});

  /* ---------- Tworzymy (lub pobieramy) slider ---------- */
  let slider = document.querySelector('.ww-vertical-slider');
  if (!slider){
    slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'ww-vertical-slider';
    document.body.appendChild(slider);
  }

  /* ---------- Funkcje pomocnicze ---------- */
  const updateLimits = () => {
    const max = Math.max(0, palette.scrollHeight - palette.clientHeight);
    slider.min = 0;
    slider.max = max || 0;
  };

  const syncSlider = () => {
    slider.value = palette.scrollTop;
  };

  const scrollPalette = () => {
    palette.scrollTop = +slider.value;
  };

  const placeSlider = () => {
    const rect = palette.getBoundingClientRect();
    slider.style.top = rect.top + 'px';
    slider.style.height = rect.height + 'px';
  };

  /* ---------- Eventy ---------- */
  palette.addEventListener('scroll', syncSlider);
  slider.addEventListener('input', scrollPalette);
  window.addEventListener('resize', ()=>{placeSlider(); updateLimits();});
  window.addEventListener('scroll', placeSlider);

  /* ---------- Inicjalizacja ---------- */
  const init = () => {
    placeSlider();
    updateLimits();
    syncSlider();
  };
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
