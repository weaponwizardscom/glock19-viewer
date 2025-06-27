/**
 * Mobile-specific functions – KOD 01 – KOD 4
 */
export function initMobile () {
  console.log('[mobile] init – KOD 4');

  const gunWrap   = document.querySelector('.gun-wrap');
  if (!gunWrap) return;

  // DOM refs
  const summary   = document.querySelector('.summary');
  const price     = document.getElementById('price');
  const resetBtn  = document.getElementById('reset-btn');
  const controls  = document.querySelector('.controls');
  if (!controls) return;
  const partSection   = controls.querySelectorAll('.section')[0];
  const colorSection  = controls.querySelectorAll('.section')[1];

  // Ensure order (already KOD 3), but for safety:
  gunWrap.appendChild(partSection);
  gunWrap.appendChild(colorSection);
  gunWrap.appendChild(summary);
  gunWrap.appendChild(resetBtn);
  gunWrap.appendChild(price);

  // send button should remain last inside gunWrap
  const sendBtn = document.getElementById('send-btn');
  gunWrap.appendChild(sendBtn);

  // Hide empty controls
  controls.style.display = 'none';

  /* === KOD 01: palette slider === */
  const paletteWrap = document.querySelector('.palette-wrap');
  const slider = document.getElementById('palette-slider');
  if (paletteWrap && slider) {
    function updateSliderMax() {
      const max = paletteWrap.scrollHeight - paletteWrap.clientHeight;
      slider.max = max > 0 ? max : 0;
    }
    updateSliderMax();
    paletteWrap.addEventListener('scroll', () => {
      slider.value = paletteWrap.scrollTop;
    });
    slider.addEventListener('input', () => {
      paletteWrap.scrollTop = slider.value;
    });
    window.addEventListener('resize', updateSliderMax);
  }

}
