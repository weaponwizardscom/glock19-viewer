/**
 * Mobile-specific functions – KOD 4
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
}


// KOD 03 – vertical slider for color palette (mobile only)
function addPaletteSlider() {
  const paletteWrap = document.querySelector('.palette-wrap');
  if (!paletteWrap) return;
  // create slider element
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = '0';
  slider.className = 'palette-slider-vertical';
  // position absolute inside parent
  paletteWrap.parentElement.style.position = 'relative';
  paletteWrap.parentElement.appendChild(slider);

  const syncFromSlider = () => {
    const maxScroll = paletteWrap.scrollHeight - paletteWrap.clientHeight;
    paletteWrap.scrollTop = maxScroll * (slider.value / 100);
  };
  const syncFromScroll = () => {
    const maxScroll = paletteWrap.scrollHeight - paletteWrap.clientHeight;
    slider.value = maxScroll ? (paletteWrap.scrollTop / maxScroll) * 100 : 0;
  };
  slider.addEventListener('input', syncFromSlider);
  paletteWrap.addEventListener('scroll', syncFromScroll);
  // initial sync
  syncFromScroll();
}

// invoke after mobile init
document.addEventListener('DOMContentLoaded', addPaletteSlider);
