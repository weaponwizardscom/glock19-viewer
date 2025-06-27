/**
 * Mobile-specific functions – KOD 4 → KOD 01 (palette slider enabled)
 * Complete replacement file.
 */
export function initMobile () {
  console.log('[mobile] init – KOD 01');

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

  /* === REORDER FOR MOBILE === */
  gunWrap.appendChild(partSection);
  gunWrap.appendChild(colorSection);
  gunWrap.appendChild(summary);
  gunWrap.appendChild(resetBtn);
  gunWrap.appendChild(price);

  // send button remains last
  const sendBtn = document.getElementById('send-btn');
  gunWrap.appendChild(sendBtn);

  /* === NEW: enable horizontal slider for palette === */
  const paletteWrap = colorSection?.querySelector('.palette-wrap');
  if (paletteWrap){
    paletteWrap.classList.add('mobile-scroll');
  }

  /* === Make controls visible on mobile (remove previous hide) === */
  controls.style.display = '';
}
