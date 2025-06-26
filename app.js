/* ===== app.js ===== */
document.addEventListener('DOMContentLoaded', async () => {
    /*  pliki  */
    const BG = ['img/t1.png','img/t2.png','img/t3.png','img/t4.png','img/t5.png',
                'img/t6.png','img/t7.png'];                 // t8 usunięty
    const SVG_FILE = 'g17.svg';
    const TEXTURE  = 'img/glock17.png';
  
    /*  ceny  */
    const PRICE = {
      zamek:400,  szkielet:400, spust:100, lufa:200, zerdz:50,
      pazur:50,   zrzut:25, blokadap:25, blokada2:50, pin:50, stopka:100
    };
    const CAP_2 = 800, CAP_FULL = 1000;
  
    /*  refs  */
    const $=id=>document.getElementById(id);
    const gunView=$('gun-view'), partBox=$('part-selection-container'), palBox=$('color-palette');
    const mix2Btn=$('mix2-button'), mixBtn=$('mix-button'), bgBtn=$('bg-button');
    const resetBtn=$('reset-button'), saveBtn=$('save-button'), sendBtn=$('send-button');
    const PLbtn=$('lang-pl'), ENbtn=$('lang-gb');
    const H1=$('header-part-selection'), H2=$('header-color-selection');
    const sumList=$('summary-list'), priceBox=$('price-box');
  
    /*  state  */
    let lang='pl', activePart=null, selections={}, currentBg=null;
  
    /* JSON */
    const [PARTS,COLORS]=await Promise.all([
        fetch('./data/parts.json').then(r=>r.json()),
        fetch('./data/colors.json').then(r=>r.json())
    ]);
  
    /* ===== INIT ============================================ */
    await loadSvg(); buildUI(); defaultBlack(); changeBG(); updateText(); refreshPrice();
  
    /* ===== SVG ============================================= */
    async function loadSvg(){
      gunView.innerHTML = await fetch(SVG_FILE).then(r=>r.text());
      const svg=gunView.querySelector('svg');svg.classList.add('gun-svg');
      const layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.id='color-overlays';svg.appendChild(layer);
      PARTS.forEach(p=>{
        const src=svg.querySelector('#'+p.id); if(!src) return;
        ['1','2'].forEach(n=>{
          const clone=src.cloneNode(true);
          clone.id=`color-overlay-${n}-${p.id}`;
          clone.classList.add('color-overlay');
          layer.appendChild(clone);
        });
      });
    }
  
    /* ===== UI ============================================== */
    function buildUI(){
      PARTS.forEach(p=>{
        const b=document.createElement('button');b.dataset.partId=p.id;
        b.onclick=()=>selectPart(b,p.id);partBox.appendChild(b);
      });
  
      mix2Btn.onclick=()=>mixRandom(2);
      mixBtn.onclick =()=>mixRandom(Infinity);
      bgBtn.onclick  =changeBG;
      resetBtn.onclick=resetAll;
      saveBtn.onclick=savePng;
      sendBtn.onclick=showForm;
  
      PLbtn.onclick=()=>setLang('pl');
      ENbtn.onclick=()=>setLang('en');
      buildPalette();
    }
    const selectPart=(btn,id)=>{partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');activePart=id;}
  
    /* ===== LANGUAGE ======================================== */
    const setLang=l=>{lang=l;updateText();refreshPrice();}
    function updateText(){
      partBox.querySelectorAll('button').forEach(b=>{
        const p=PARTS.find(x=>x.id===b.dataset.partId);if(p)b.textContent=p[lang];
      });
      H1.textContent=lang==='pl'?'1. Wybierz część':'1. Select part';
      H2.textContent=lang==='pl'?'2. Wybierz kolor (Cerakote)':'2. Select color (Cerakote)';
      resetBtn.textContent=lang==='pl'?'Resetuj Kolory':'Reset Colors';
      bgBtn.textContent   =lang==='pl'?'Zmień Tło':'Change Background';
      saveBtn.textContent =lang==='pl'?'Zapisz Obraz':'Save Image';
      sendBtn.textContent =lang==='pl'?'Wyślij do Wizards!':'Send to Wizards!';
      mix2Btn.textContent =lang==='pl'?'MIX ≤ 2 kolory':'MIX ≤ 2 colors';
      mixBtn.textContent  =lang==='pl'?'MIX ∞':'MIX ∞';
      PLbtn.classList.toggle('active',lang==='pl');ENbtn.classList.toggle('active',lang==='en');
    }
  
    /* ===== PALETTE / COLORS ================================= */
    function buildPalette(){
      palBox.innerHTML='';
      for(const [name,hex] of Object.entries(COLORS)){
        const wrap=document.createElement('div');wrap.className='color-swatch-wrapper';wrap.title=name;
        wrap.onclick=()=>applyColor(activePart,hex,name);
        const dot=document.createElement('div');dot.className='color-swatch';dot.style.backgroundColor=hex;
        const lbl=document.createElement('div');lbl.className='color-swatch-label';lbl.textContent=name;
        wrap.append(dot,lbl);palBox.appendChild(wrap);
      }
    }
  
    function applyColor(pid,hex,name){
      if(!pid){alert(lang==='pl'?'Najpierw wybierz część!':'Select a part first!');return;}
      ['1','2'].forEach(n=>{
        const ov=document.getElementById(`color-overlay-${n}-${pid}`);
        const shapes=ov.tagName==='g'?ov.querySelectorAll('path,polygon,ellipse,circle,rect'):[ov];
        shapes.forEach(s=>{s.style.fill=hex;s.style.stroke=hex;});
      });
      selections[pid]=name;
      refreshPrice();
    }
  
    function defaultBlack(){
      const def='H-146 Graphite Black',hex=COLORS[def];
      PARTS.forEach(p=>{applyColor(p.id,hex,def);});
    }
  
    /* ===== MIX ============================================= */
    function mixRandom(maxColors){
      const keys=Object.keys(COLORS);
      let picked={};
      PARTS.forEach(p=>{
        let color;
        do{ color=keys[Math.floor(Math.random()*keys.length)]; }
        while(maxColors!==Infinity && !picked[color] && Object.keys(picked).length>=maxColors);
        picked[color]=true;
        applyColor(p.id,COLORS[color],color);
      });
    }
  
    /* ===== BG ============================================== */
    function changeBG(){
      let next; do{ next=BG[Math.floor(Math.random()*BG.length)]; }while(next===currentBg);
      currentBg=next;
      gunView.style.background=`url("${next}") center/100% 100% no-repeat`;
    }
  
    /* ===== PRICE =========================================== */
    function refreshPrice(){
      /* lista w podglądzie */
      sumList.innerHTML='';
      PARTS.forEach(p=>{
        if(selections[p.id]){
          const div=document.createElement('div');
          div.textContent=`${p[lang]} – ${selections[p.id].split(' ')[0]}`;
          sumList.appendChild(div);
        }
      });
  
      /* kalkulacja */
      const uniq=new Set(Object.values(selections)).size;
      let sum=0;
      for(const id in selections) sum+=PRICE[id]||0;
      const cap = uniq<=2 ? CAP_2 : CAP_FULL;
      const total=Math.min(sum,cap);
  
      priceBox.textContent=`${lang==='pl'?'Szacowany koszt':'Estimated cost'}: ${total} zł`;
    }
  
    /* ===== RESET =========================================== */
    function resetAll(){
      document.querySelectorAll('.color-overlay').forEach(ov=>{
        const shapes=ov.tagName==='g'?ov.querySelectorAll('path,polygon,ellipse,circle,rect'):[ov];
        shapes.forEach(s=>{s.style.fill='transparent';s.style.stroke='transparent';});
      });
      selections={}; partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
      activePart=null; refreshPrice();
    }
  
    /* ===== SAVE PNG (bez zmian od poprzedniej wersji) ======= */
    async function savePng(){
      const svg=gunView.querySelector('svg'); if(!svg) return;
      const imgLoad=src=>new Promise(res=>{const i=new Image();i.src=src;i.onload=()=>res(i);});
  
      /* canvas = 1600×1200 + panel */
      const gunS=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gun-scale'));
      const pistolW=1600*gunS, pistolH=1200*gunS,
            offX=(1600-pistolW)/2, offY=(1200-pistolH)/2;
  
      const cv=Object.assign(document.createElement('canvas'),{width:1600+380,height:1200});
      const ctx=cv.getContext('2d');
  
      ctx.drawImage(await imgLoad(currentBg),0,0,1600,1200);
      ctx.drawImage(await imgLoad(TEXTURE),offX,offY,pistolW,pistolH);
  
      await Promise.all([...gunView.querySelectorAll('.color-overlay')].filter(o=>o.style.fill&&o.style.fill!=='transparent').map(async ov=>{
        const tmp=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute('viewBox')}"><g style="mix-blend-mode:hard-light;opacity:.45;">${ov.outerHTML}</g></svg>`,
              url=URL.createObjectURL(new Blob([tmp],{type:'image/svg+xml'}));
        ctx.drawImage(await imgLoad(url),offX,offY,pistolW,pistolH); URL.revokeObjectURL(url);
      }));
  
      ctx.fillStyle='#000c';ctx.fillRect(1600,0,380,1200);
      ctx.fillStyle='#fff';ctx.font='24px sans-serif';
      [...sumList.childNodes].forEach((d,i)=>ctx.fillText(d.textContent,1600+32,32+24*1.4*i));
  
      const link=document.createElement('a');
      link.href=cv.toDataURL('image/png');
      link.download='weapon-wizards-projekt.png';
      link.click();
    }
  
    /* ===== SEND FORM  ======================================= */
    function showForm(){
      const modal=document.createElement('div');
      modal.style.cssText='position:fixed;inset:0;background:#0009;display:flex;justify-content:center;align-items:center;z-index:999;';
      modal.innerHTML=`
        <div style="background:#222;padding:24px;border-radius:8px;max-width:320px;width:100%;color:#fff;font-family:sans-serif;">
          <h3 style="margin-top:0">${lang==='pl'?'Wyślij projekt':'Send project'}</h3>
          <input id="f-name"  placeholder="${lang==='pl'?'Imię':'Name'}" style="width:100%;margin-bottom:8px;padding:8px;border-radius:4px;border:1px solid #ccc;">
          <input id="f-mail" type="email" placeholder="E-mail" style="width:100%;margin-bottom:8px;padding:8px;border-radius:4px;border:1px solid #ccc;">
          <input id="f-tel"  placeholder="${lang==='pl'?'Telefon':'Phone'}" style="width:100%;margin-bottom:12px;padding:8px;border-radius:4px;border:1px solid #ccc;">
          <button id="f-send" style="width:100%;padding:10px;border:none;border-radius:4px;background:#17a2b8;color:#fff;font-weight:600;">
            ${lang==='pl'?'Wyślij':'Send'}
          </button>
          <button id="f-cancel" style="margin-top:8px;width:100%;padding:8px;border:none;border-radius:4px;background:#6c757d;color:#fff;">
            ${lang==='pl'?'Anuluj':'Cancel'}
          </button>
        </div>`;
      document.body.appendChild(modal);
  
      $('f-cancel').onclick=()=>modal.remove();
      $('f-send').onclick=async()=>{
        const name=$('f-name').value.trim(), mail=$('f-mail').value.trim(), tel=$('f-tel').value.trim();
        if(!mail){alert('E-mail?');return;}
  
        /* przygotuj obraz PNG (bez panelu z ceną) */
        const pngCanvas=document.createElement('canvas');
        pngCanvas.width=1600; pngCanvas.height=1200;
        const ctx=pngCanvas.getContext('2d');
        ctx.drawImage(await new Promise(r=>{const i=new Image();i.src=currentBg;i.onload=()=>r(i);} ),0,0,1600,1200);
        ctx.drawImage(await new Promise(r=>{const i=new Image();i.src=TEXTURE;i.onload=()=>r(i);} ),0,0,1600,1200);
        const pngData=pngCanvas.toDataURL('image/png');
  
        /* wysyłka EmailJS */
        /* <<< WPISZ WŁASNE  service_id  i  template_id  >>> */
        emailjs.send("YOUR_SERVICE_ID","YOUR_TEMPLATE_ID",{
            to_email:mail,
            client_name:name,
            client_phone:tel,
            total_price:priceBox.textContent.replace(/[^0-9]/g,''),
            html_list:sumList.innerHTML.replace(/–/g,'-'),
            image:pngData
        }).then(()=>{
            alert(lang==='pl'?'Wysłane!':'Sent!');
            modal.remove();
        }).catch(()=>alert('EmailJS error'));
      };
    }
  });
  