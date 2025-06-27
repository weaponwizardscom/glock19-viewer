document.addEventListener("DOMContentLoaded", ()=>{
  if(!window.matchMedia("(max-width:768px)").matches) return;

  const palette = document.getElementById("palette");
  if(!palette){ console.log("palette not found"); return; }

  const wrap = palette.parentElement;
  const section = wrap.parentElement;

  let slider = document.getElementById("palette-slider");
  if(!slider){
    slider = document.createElement("input");
    slider.type = "range";
    slider.id = "palette-slider";
    slider.className = "vslider";
    slider.min = "0";
    slider.value = "0";
    section.style.position = "relative";
    section.appendChild(slider);
  }

  function updateRange(){
    const max = Math.max(0, palette.scrollHeight - wrap.clientHeight);
    slider.max = max;
    slider.disabled = max===0;
  }

  slider.addEventListener("input", ()=>{
    const y = -Number(slider.value);
    palette.style.transform = `translateY(${y}px)`;
  }, {passive:true});

  window.addEventListener("resize", updateRange);
  window.addEventListener("load", updateRange);
  updateRange();
});
