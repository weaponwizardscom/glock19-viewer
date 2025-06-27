/**
 * app.mobile.js – KOD 06 (palette slider sync)
 * Replacement file.
 */
export function initMobile(){
  console.log('[mobile] init – KOD 06');

  const gunWrap = document.querySelector('.gun-wrap');
  if(!gunWrap)return;

  const summary=document.querySelector('.summary');
  const price=document.getElementById('price');
  const resetBtn=document.getElementById('reset-btn');
  const controls=document.querySelector('.controls');
  if(!controls)return;
  const partSection=controls.querySelectorAll('.section')[0];
  const colorSection=controls.querySelectorAll('.section')[1];

  // Reorder
  gunWrap.appendChild(partSection);
  gunWrap.appendChild(colorSection);
  gunWrap.appendChild(summary);
  gunWrap.appendChild(resetBtn);
  gunWrap.appendChild(price);
  gunWrap.appendChild(document.getElementById('send-btn'));

  // Activate slider sync
  const wrap=colorSection.querySelector('.palette-wrap');
  const slider=document.getElementById('palette-slider');
  if(wrap && slider){
    function updateSliderMax(){
      const max=wrap.scrollWidth - wrap.clientWidth;
      slider.max=max>0?max:0;
      slider.disabled=max<=0;
    }
    updateSliderMax();
    window.addEventListener('resize',updateSliderMax);

    slider.addEventListener('input',()=>{wrap.scrollLeft=slider.value;});
    wrap.addEventListener('scroll',()=>{slider.value=wrap.scrollLeft;});
  }

  // show controls
  controls.style.display='';
}
