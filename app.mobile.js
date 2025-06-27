// KOD 13 – pionowy slider z własnym kontenerem scroll (mobile only)
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth > 1024) return; // tylko mobile/tablet

  const palette = document.getElementById('palette');
  if (!palette) return;

  // Utwórz kontener przewijalny
  const scrollWrap = document.createElement('div');
  scrollWrap.className = 'palette-scroll-wrapper';
  scrollWrap.style.maxHeight = '70vh';      // 70% wysokości ekranu
  scrollWrap.style.overflowY = 'auto';
  scrollWrap.style.overflowX = 'hidden';
  scrollWrap.style.position = 'relative';
  scrollWrap.style.paddingRight = '32px';   // miejsce na slider

  // Wstaw wrapper w miejsce palety
  palette.parentNode.insertBefore(scrollWrap, palette);
  scrollWrap.appendChild(palette);

  // Utwórz slider
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'palette-vertical-slider';
  slider.min = 0;
  slider.max = 100;
  slider.value = 0;

  scrollWrap.appendChild(slider);

  // Synchronizacja slider <-> scroll
  const syncSlider = () => {
    const maxScroll = scrollWrap.scrollHeight - scrollWrap.clientHeight;
    slider.value = maxScroll ? (scrollWrap.scrollTop / maxScroll) * 100 : 0;
  };
  const syncScroll = () => {
    const maxScroll = scrollWrap.scrollHeight - scrollWrap.clientHeight;
    scrollWrap.scrollTop = (slider.value / 100) * maxScroll;
  };

  scrollWrap.addEventListener('scroll', syncSlider);
  slider.addEventListener('input', syncScroll);

  // Inicjalne ustawienie
  syncSlider();
});