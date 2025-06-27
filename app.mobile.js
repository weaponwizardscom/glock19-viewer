
/* KOD 16 – stały slider, przewija paletę wyłącznie suwakiem (mobile) */
document.addEventListener('DOMContentLoaded', () => {
  // pokazujemy slider tylko na mobile/tablet
  if (window.innerWidth > 1024) return;

  const palette = document.getElementById('palette');
  if (!palette) return;

  /* 1. Wyłączamy natywne przewijanie palety palcem/kołem myszy */
  const blockScroll = (e) => e.preventDefault();
  palette.addEventListener('wheel', blockScroll, { passive: false });
  palette.addEventListener('touchmove', blockScroll, { passive: false });

  /* 2. Dodajemy slider (jeden globalny) */
  // usuwamy poprzednie, jeśli były
  const old = document.querySelector('.ww-vertical-slider');
  if (old) old.remove();

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'ww-vertical-slider';
  slider.min = 0;
  slider.max = 100;
  slider.value = 0;

  document.body.appendChild(slider);

  /* 3. Funkcje pomocnicze */
  const setSliderPosition = () => {
    // wysokość slidera = wysokość palety na ekranie
    const palRect = palette.getBoundingClientRect();
    slider.style.height = palRect.height + 'px';
    slider.style.top = palRect.top + 'px';
  };

  const syncSlider = () => {
    const maxScroll = palette.scrollHeight - palette.clientHeight;
    if (maxScroll > 0) {
      slider.value = (palette.scrollTop / maxScroll) * 100;
    } else {
      slider.value = 0;
    }
  };

  const scrollPalette = () => {
    const maxScroll = palette.scrollHeight - palette.clientHeight;
    palette.scrollTop = (slider.value / 100) * maxScroll;
  };

  /* 4. Wiązanie zdarzeń */
  slider.addEventListener('input', scrollPalette);
  window.addEventListener('resize', setSliderPosition);
  window.addEventListener('scroll', setSliderPosition);

  // paleta może zmieniać wysokość przy zmianie orientacji – obserwator
  const resizeObserver = new ResizeObserver(setSliderPosition);
  resizeObserver.observe(palette);

  /* 5. Inicjalizacja */
  setSliderPosition();
  syncSlider();
});
