document.addEventListener("DOMContentLoaded", ()=>{
  const wrap = document.querySelector(".palette-wrap");
  const slider = document.getElementById("palette-slider");

  if(!wrap || !slider) return;
  if(!window.matchMedia("(max-width:768px)").matches) return;

  function updateSliderRange(){
    const max = Math.max(0, wrap.scrollHeight - wrap.clientHeight);
    slider.max = max;
    slider.disabled = max === 0;
  }

  slider.addEventListener("input", ()=>{
    wrap.scrollTop = slider.value;
  }, {passive:true});

  wrap.addEventListener("scroll", ()=>{
    slider.value = wrap.scrollTop;
  }, {passive:true});

  window.addEventListener("resize", updateSliderRange);
  updateSliderRange();
});
