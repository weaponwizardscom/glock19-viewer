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


  /* === KOD 02: vertical palette slider (mobile only) === */
  try{
    const colorSection  = document.querySelector('.controls .section:nth-child(2)');
    const paletteWrap   = colorSection ? colorSection.querySelector('.palette-wrap') : null;
    if (paletteWrap){
      // create slider element
      const slider = document.createElement('input');
      slider.type  = 'range';
      slider.id    = 'palette-slider';
      slider.className = 'palette-slider';
      slider.min   = 0;
      slider.value = 0;
      slider.setAttribute('orient','vertical'); // some browsers

      // make parent relative for absolute slider
      colorSection.style.position = 'relative';
      colorSection.appendChild(slider);

      function updateSliderMax(){
         const max = paletteWrap.scrollHeight - paletteWrap.clientHeight;
         slider.max = max>0?max:0;
      }
      function syncSlider(){
         slider.value = slider.max - paletteWrap.scrollTop;
      }

      updateSliderMax();
      syncSlider();
      paletteWrap.addEventListener('scroll', ()=>{
         updateSliderMax();
         syncSlider();
      });
      slider.addEventListener('input', ()=>{
         paletteWrap.scrollTop = slider.max - slider.value;
      });
      window.addEventListener('resize', ()=>{
         updateSliderMax();
         syncSlider();
      });
    }
  }catch(e){ console.error('[mobile slider]',e); }

