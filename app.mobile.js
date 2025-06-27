/**
 * app.mobile.js – KOD 11
 * 1) Disables touchscroll inside palette so page scrolls instead.
 * 2) Adds sync between vertical slider and palette scrollTop.
 */
document.addEventListener("DOMContentLoaded", ()=>{
  const mq = window.matchMedia("(max-width:768px)");
  if(!mq.matches) return;       // only mobile

  const wrap   = document.querySelector(".palette-wrap");
  const slider = document.getElementById("palette-slider");
  if(!wrap || !slider) return;

  /* ---------- 1. block finger swipe scrolling in palette ---------- */
  wrap.classList.add("no-touch-scroll");
  wrap.addEventListener("touchmove", (e)=>{ e.preventDefault(); }, {passive:false});

  /* ---------- 2. slider ↔ scroll sync ---------- */
  function setMax(){
    const max = Math.max(0, wrap.scrollHeight - wrap.clientHeight);
    slider.max = max;
    slider.disabled = max === 0;
  }
  setMax();
  window.addEventListener("resize", setMax);

  slider.addEventListener("input", ()=>{
    wrap.scrollTop = slider.value;
  }, {passive:true});

  wrap.addEventListener("scroll", ()=>{
    slider.value = wrap.scrollTop;
  }, {passive:true});

  window.addEventListener("load", setMax);
});
