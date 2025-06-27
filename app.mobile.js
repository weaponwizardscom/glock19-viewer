function waitForPalette(callback) {
  const maxWait = 2000;
  const interval = 100;
  let waited = 0;

  const check = () => {
    const palette = document.getElementById('palette');
    if (palette && palette.children.length > 0) {
      callback(palette);
    } else if (waited < maxWait) {
      waited += interval;
      setTimeout(check, interval);
    } else {
      console.warn('[mobile] Palette not found or empty');
    }
  };

  check();
}

window.addEventListener('load', () => {
  waitForPalette((palette) => {
    const wrap = document.getElementById('palette-wrap');
    if (!wrap) return;

    wrap.classList.add('ready');

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'vslider';
    slider.min = 0;
    slider.value = 0;

    const maxScroll = palette.scrollHeight - wrap.clientHeight;
    slider.max = maxScroll;

    slider.addEventListener('input', () => {
      palette.style.transform = `translateY(-${slider.value}px)`;
    });

    wrap.appendChild(slider);
  });
});