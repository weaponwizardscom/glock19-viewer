
/**
 * app.mobile.js – KOD 07
 * Bootstraps mobile layout and adds a synced horizontal slider for colour palette.
 */
export function initMobile(){
  console.log('[mobile] init – KOD 07');

  /* ---------- DOM refs ---------- */
  const gunWrap   = document.querySelector('.gun-wrap');
  if(!gunWrap) return;

  const summary   = document.querySelector('.summary');
  const price     = document.getElementById('price');
  const resetBtn  = document.getElementById('reset-btn');
  const sendBtn   = document.getElementById('send-btn');
  const controls  = document.querySelector('.controls');
  if(!controls) return;
  const partSection  = controls.querySelectorAll('.section')[0];
  const colorSection = controls.querySelectorAll('.section')[1];

  /* ---------- Re‑order for mobile ---------- */
  gunWrap.appendChild(partSection);
  gunWrap.appendChild(colorSection);
  gunWrap.appendChild(summary);
  gunWrap.appendChild(resetBtn);
  gunWrap.appendChild(price);
  gunWrap.appendChild(sendBtn);

  /* ---------- Horizontal palette slider ---------- */
  const paletteWrap = colorSection.querySelector('.palette-wrap');
  if(paletteWrap){

    /* Create slider only once */
    let slider = document.getElementById('palette-slider');
    if(!slider){
      slider = document.createElement('input');
      slider.id = 'palette-slider';
      slider.type = 'range';
      slider.min = 0;
      slider.value = 0;
      colorSection.appendChild(slider);
    }

    function setSliderMax(){
      /* total scrollable width */
      const max = Math.max(0, paletteWrap.scrollWidth - paletteWrap.clientWidth);
      slider.max = max;
      slider.disabled = max === 0;
    }
    /* initial & on resize */
    setSliderMax();
    window.addEventListener('resize', setSliderMax);

    /* slider drives scroll */
    slider.addEventListener('input', () => {
      paletteWrap.scrollLeft = slider.value;
    }, {passive:true});

    /* scroll drives slider (sync) */
    paletteWrap.addEventListener('scroll', () => {
      slider.value = paletteWrap.scrollLeft;
    }, {passive:true});

    /* Optional: when fonts/images load later and change width */
    window.addEventListener('load', setSliderMax);
  }

  /* ---------- Ensure controls remain visible ---------- */
  controls.style.display = '';
}
