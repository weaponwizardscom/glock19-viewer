
// KOD 14 – final vertical slider mobile
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth > 1024) return; // only mobile/tablet

  const wrap = document.querySelector('.palette-wrap');
  if (!wrap) return;

  // Create slider if not present
  if (!wrap.querySelector('.palette-vertical-slider')) {
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'palette-vertical-slider';
    slider.min = 0;
    slider.max = 100;
    slider.value = 0;
    wrap.appendChild(slider);

    const updateSlider = () => {
      const max = wrap.scrollHeight - wrap.clientHeight;
      slider.value = max ? (wrap.scrollTop / max) * 100 : 0;
    };
    const updateScroll = () => {
      const max = wrap.scrollHeight - wrap.clientHeight;
      wrap.scrollTop = (slider.value / 100) * max;
    };

    wrap.addEventListener('scroll', updateSlider);
    slider.addEventListener('input', updateScroll);
  }
});
