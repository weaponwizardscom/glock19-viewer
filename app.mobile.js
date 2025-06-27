document.addEventListener("DOMContentLoaded", ()=>{
  if(!window.matchMedia("(max-width:768px)").matches) return;

  const wrap   = document.querySelector(".palette-wrap");
  const slider = document.getElementById("palette-slider");
  if(!wrap||!slider) return;

  function updateRange(){
    const max = wrap.scrollHeight - wrap.clientHeight;
    slider.max = Math.max(0, max);
    slider.disabled = max <= 0;
  }
  updateRange();
  window.addEventListener("load", updateRange);
  window.addEventListener("resize", updateRange);

  slider.addEventListener("input", ()=>{
    wrap.scrollTop = Number(slider.value);
  }, {passive:true});

  wrap.addEventListener("scroll", ()=>{
    slider.value = wrap.scrollTop;
  }, {passive:true});

  /* Block finger scrolling inside palette */
  wrap.addEventListener("touchmove",(e)=>{
    e.preventDefault();
  }, {passive:false});
});
