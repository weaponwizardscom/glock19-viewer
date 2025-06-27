
document.addEventListener("DOMContentLoaded", ()=>{
  if(!window.matchMedia("(max-width:768px)").matches) return;

  const wrap   = document.querySelector(".palette-wrap");
  const slider = document.getElementById("palette-slider");
  const inner  = document.querySelector(".palette");
  if(!wrap||!slider||!inner) return;

  function updateRange(){
    const total = inner.scrollHeight;               // full height of content
    const visible = wrap.clientHeight;
    const max = Math.max(0, total - visible);
    slider.max = max;
    slider.disabled = max<=0;
  }

  slider.addEventListener("input", ()=>{
    const y = -Number(slider.value);
    inner.style.transform = `translateY(${y}px)`;
  }, {passive:true});

  window.addEventListener("resize", updateRange);
  window.addEventListener("load", updateRange);
  updateRange();
});
