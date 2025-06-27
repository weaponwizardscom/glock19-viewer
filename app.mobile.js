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


('input', () => {
    const percent = slider.value / 100;
    colorContainer.scrollTop = percent * (colorContainer.scrollHeight - colorContainer.clientHeight);
});


// KOD 05 – Vertical slider for color palette (mobile only)
(function(){
  if (window.innerWidth > 768) return; // only mobile
  const paletteWrap = document.querySelector('.palette-wrap');
  if (!paletteWrap) return;

  const palette = document.getElementById('palette');
  if (!palette) return;

  // only add slider once
  if (paletteWrap.querySelector('.palette-scroll-slider')) return;

  paletteWrap.style.position = 'relative';

  // make sure palette can scroll vertically
  paletteWrap.style.maxHeight = paletteWrap.style.maxHeight || '400px';
  paletteWrap.style.overflowY = 'auto';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'palette-scroll-slider';
  slider.min = 0;
  slider.max = 100;
  slider.value = 0;

  // style inline for now; additional CSS in styles.loader.css can override
  slider.style.position = 'absolute';
  slider.style.right = '-15px';
  slider.style.top = '0';
  slider.style.height = '100%';
  slider.style.writingMode = 'bt-lr';
  slider.style.webkitAppearance = 'slider-vertical';
  slider.style.appearance = 'none';
  slider.style.transform = 'rotate(180deg)';
  slider.style.background = 'transparent';

  paletteWrap.appendChild(slider);

  // sync scroll ↔ slider
  function updateSlider(){
    const maxScroll = paletteWrap.scrollHeight - paletteWrap.clientHeight;
    slider.value = (paletteWrap.scrollTop / maxScroll) * 100;
  }

  paletteWrap.addEventListener('scroll', updateSlider);

  slider.addEventListener('input', () => {
    const percent = slider.value / 100;
    const maxScroll = paletteWrap.scrollHeight - paletteWrap.clientHeight;
    paletteWrap.scrollTop = percent * maxScroll;
  });

  // initial update
  updateSlider();
})();


// KOD 06 – pionowy slider mobilny (działa)
document.addEventListener('DOMContentLoaded', () => {
    const palette = document.getElementById('palette');
    if (!palette || window.innerWidth > 768) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'palette-scroll-wrapper';
    palette.parentNode.insertBefore(wrapper, palette);
    wrapper.appendChild(palette);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'palette-vertical-slider';
    slider.min = 0;
    slider.max = 100;
    slider.value = 0;

    wrapper.appendChild(slider);

    palette.addEventListener('scroll', () => {
        const percent = palette.scrollTop / (palette.scrollHeight - palette.clientHeight);
        slider.value = percent * 100;
    });

    slider.addEventListener('input', () => {
        const percent = slider.value / 100;
        palette.scrollTop = percent * (palette.scrollHeight - palette.clientHeight);
    });
});


/* KOD 09 – final mobile vertical slider */
document.addEventListener('DOMContentLoaded', ()=>{
    const palette = document.getElementById('palette');
    if(!palette) return;
    if(document.querySelector('.palette-vertical-slider')) return; // already set

    // Wrap palette
    const wrap = document.createElement('div');
    wrap.className = 'palette-scroll-wrapper';
    palette.parentNode.insertBefore(wrap, palette);
    wrap.appendChild(palette);

    // Create slider
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'palette-vertical-slider';
    slider.min = 0;
    slider.step = 1;
    slider.value = 0;

    // After layout, set slider max
    const updateMax = () => {
        const maxScroll = palette.scrollHeight - palette.clientHeight;
        slider.max = maxScroll > 0 ? maxScroll : 0;
    };
    requestAnimationFrame(updateMax);
    window.addEventListener('resize', updateMax);

    // Sync scroll
    palette.addEventListener('scroll', () => {
        slider.value = palette.scrollTop;
    });

    slider.addEventListener('input', () => {
        palette.scrollTop = slider.value;
    });

    wrap.appendChild(slider);
});
