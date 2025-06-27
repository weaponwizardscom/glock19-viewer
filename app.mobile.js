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


// KOD 04 – Dodanie pionowego slidera do przewijania kolorów
const colorContainer = document.querySelector('.color-picker');
const slider = document.createElement('input');
slider.type = 'range';
slider.className = 'color-scroll-slider';
slider.min = 0;
slider.max = 100;
slider.value = 0;

const wrapper = document.createElement('div');
wrapper.className = 'color-scroll-container';
colorContainer.parentNode.replaceChild(wrapper, colorContainer);
wrapper.appendChild(colorContainer);
wrapper.appendChild(slider);

colorContainer.addEventListener('scroll', () => {
    const percent = colorContainer.scrollTop / (colorContainer.scrollHeight - colorContainer.clientHeight);
    slider.value = percent * 100;
});

slider.addEventListener('input', () => {
    const percent = slider.value / 100;
    colorContainer.scrollTop = percent * (colorContainer.scrollHeight - colorContainer.clientHeight);
});
