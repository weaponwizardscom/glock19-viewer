/**
 * app.mobile.js – KOD 15 (final)
 * Dynamically wstawia pionowy suwak po prawej stronie listy kolorów
 * i synchronizuje translateY palety z pozycją suwaka.
 */
document.addEventListener("DOMContentLoaded", () =>{
  /* tylko urządzenia mobilne <=768px */
  if(!window.matchMedia("(max-width:768px)").matches) return;

  const palette = document.getElementById("palette");
  if(!palette) return;

  const wrap = palette.parentElement;          // .palette-wrap
  const section = wrap.parentElement;          // .section (kolory)

  /* jeśli slider już istnieje – usuń */
  const old = document.getElementById("palette-slider");
  if(old) old.remove();

  /* utwórz slider */
  const slider = document.createElement("input");
  slider.type = "range";
  slider.id = "palette-slider";
  slider.className = "vslider";
  slider.min = "0";
  slider.value = "0";
  section.style.position = "relative";         // suwak pozycjonuje się absolutnie
  section.appendChild(slider);

  /* oblicz zakres */
  function updateRange(){
    const max = Math.max(0, palette.scrollHeight - wrap.clientHeight);
    slider.max = max;
    slider.disabled = max === 0;
  }

  /* suwak steruje listą */
  slider.addEventListener("input", ()=>{
    const y = -Number(slider.value);
    palette.style.transform = `translateY(${y}px)`;
  }, {passive:true});

  /* zmiana rozmiaru / fontów */
  window.addEventListener("resize", updateRange);
  window.addEventListener("load", updateRange);
  updateRange();
});
