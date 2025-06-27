/**
 * app.mobile.js – KOD 16 (robust slider)
 */
(function(){
  const mq = window.matchMedia("(max-width:768px)");
  if(!mq.matches) return;

  window.addEventListener("load", initSlider);

  function initSlider(){
    const palette = document.getElementById("palette");
    if(!palette) return;
    const wrap = palette.parentElement;         // .palette-wrap
    const section = wrap.parentElement;         // .section

    /* Ensure only one slider */
    let slider = document.getElementById("palette-slider");
    if(slider) slider.remove();

    slider = document.createElement("input");
    slider.type = "range";
    slider.id = "palette-slider";
    slider.className = "vslider";
    slider.min = "0";
    slider.value = "0";
    section.appendChild(slider);

    /* Prevent touch scroll inside wrap except taps */
    wrap.addEventListener("touchmove", (e) => {
      e.preventDefault();
    }, {passive:false});

    function updateRange(){
      const total = palette.scrollHeight;
      const visible = wrap.clientHeight;
      const max = Math.max(0, total - visible);
      slider.max = max;
      slider.disabled = max === 0;
      /* keep translate in range */
      const current = -parseFloat(palette.style.transform.replace(/translateY\((-?\d+(?:\.\d+)?)px\)/,'$1')) || 0;
      if(current > max){
        palette.style.transform = `translateY(-${max}px)`;
        slider.value = max;
      }
    }

    /* Slider drives palette */
    slider.addEventListener("input", () =>{
      const y = Number(slider.value);
      palette.style.transform = `translateY(-${y}px)`;
    }, {passive:true});

    /* Window resize recalc */
    window.addEventListener("resize", updateRange);
    updateRange();
  }
})();
