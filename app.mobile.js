
/* palette-slider sync */
document.addEventListener("DOMContentLoaded", () => {
  const paletteWrap = document.querySelector(".palette-wrap");
  const slider = document.getElementById("palette-slider");

  if (!paletteWrap || !slider) return;

  function updateSliderMax() {
    slider.max = Math.max(0, paletteWrap.scrollWidth - paletteWrap.clientWidth);
    slider.disabled = slider.max <= 0;
  }

  slider.addEventListener("input", () => {
    paletteWrap.scrollLeft = slider.value;
  });

  paletteWrap.addEventListener("scroll", () => {
    slider.value = paletteWrap.scrollLeft;
  });

  window.addEventListener("resize", updateSliderMax);
  updateSliderMax();
});
