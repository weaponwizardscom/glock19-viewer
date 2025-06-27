
// KOD 15 – fixed vertical slider controlling palette (mobile)
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth > 1024) return; // tylko mobile/tablet

  const palette = document.getElementById('palette');
  if (!palette) return;

  // Usuń istniejący pływający suwak, jeśli był osadzony w palecie
  const old = document.querySelector('.palette-vertical-slider, .ww-vertical-slider');
  if (old) old.remove();

  // Tworzymy slider fixed
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'ww-vertical-slider';
  slider.min = 0;
  slider.max = 100;
  slider.value = 0;
  document.body.appendChild(slider);

  // Ustaw wysokość slidera na 80% wysokości okna i centrowanie
  const positionSlider = () => {
    const rect = palette.getBoundingClientRect();
    slider.style.height = Math.min(rect.height, window.innerHeight * 0.8) + 'px';
    const top = rect.top + window.scrollY + (rect.height - slider.offsetHeight) / 2;
    slider.style.top = top + 'px';
  };

  // Aktualizuj slider gdy paleta scrolluje
  const syncSlider = () => {
    const max = palette.scrollHeight - palette.clientHeight;
    slider.max = 100;
    if (max <= 0) return;
    slider.value = (palette.scrollTop / max) * 100;
  };

  // Przewiń paletę przy zmianie slidera
  const scrollPalette = () => {
    const max = palette.scrollHeight - palette.clientHeight;
    palette.scrollTop = (slider.value / 100) * max;
  };

  palette.addEventListener('scroll', syncSlider);
  slider.addEventListener('input', scrollPalette);
  window.addEventListener('resize', positionSlider);
  window.addEventListener('scroll', positionSlider);

  // Inicjalizacja
  positionSlider();
  syncSlider();
});
