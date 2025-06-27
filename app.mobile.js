
document.addEventListener("DOMContentLoaded", ()=>{
  if(!window.matchMedia("(max-width:768px)").matches) return;

  const wrap   = document.querySelector(".palette-wrap");
  const slider = document.getElementById("palette-slider");
  if(!wrap || !slider) return;

  /* block finger swipe except when dragging slider */
  wrap.addEventListener("touchmove",(e)=>{
    if(e.target !== slider) e.preventDefault();
  },{passive:false});

  function updateRange(){
    const max = Math.max(0, wrap.scrollHeight - wrap.clientHeight);
    slider.max = max;
    slider.disabled = max === 0;
  }

  slider.addEventListener("input", ()=>{ wrap.scrollTop = slider.value; }, {passive:true});
  wrap.addEventListener("scroll", ()=>{ slider.value = wrap.scrollTop; }, {passive:true});

  window.addEventListener("resize", updateRange);
  window.addEventListener("load", updateRange);
  updateRange();
});
