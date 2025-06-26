/* ===== app.js ===== */
document.addEventListener('DOMContentLoaded', () => {

    /* === KONFIG === */
    const BG_LIST = ['img/t1.png','img/t2.png','img/t3.png','img/t4.png','img/t5.png','img/t6.png','img/t7.png'];  // t8 usunięto
    const SVG_FILE = 'g17.svg';
    const GUN_IMG  = 'img/glock17.png';
    
    const FONT_PX=24, PANEL_W=380, PAD=32;
    const MIX2_PRICE = 800, MIXN_PRICE = 1000;
    const PRICES = { zamek:400, szkielet:400, spust:100, lufa:200, zerdz:50,
                     pazur:50, zrzut:50, blokada:50, pin:50, stopka:100, plytka:0 };
    
    const PARTS = [
      {id:'zamek',pl:'Zamek',en:'Slide'},
      {id:'szkielet',pl:'Szkielet',en:'Frame'},
      {id:'spust',pl:'Spust',en:'Trigger'},
      {id:'lufa',pl:'Lufa',en:'Barrel'},
      {id:'zerdz',pl:'Żerdź',en:'Recoil spring'},
      {id:'pazur',pl:'Pazur',en:'Extractor'},
      {id:'zrzut',pl:'Zrzut magazynka',en:'Mag catch'},
      {id:'blokada',pl:'Zrzut zamka',en:'Slide stop'},
      {id:'pin',pl:'Pin',en:'Trigger pin'},
      {id:'stopka',pl:'Stopka',en:'Floorplate'},
      {id:'plytka',pl:'Płytka',en:'Back-plate',disabled:true}
    ];
    
    const COLORS={
    "H-140":"#ffffff","H-242":"#e5e4e2","H-136":"#f5f5f5","H-297":"#f2f2f2","H-146":"#3b3b3b","H-170":"#7a7a7a",
    "H-190":"#212121","H-265":"#999b9e","H-267":"#a48f6a","H-331":"#0077c0","H-8000":"#937750"
    /* … (tu wklej pozostałe jeśli potrzebne) */
    };
    
    /* === DOM === */
    const gunBox = qs('#gun-view-container');
    const partBox= qs('#part-selection-container');
    const palBox = qs('#color-palette');
    const costLine= qs('#cost-line');
    const langPL = qs('#lang-pl');  const langEN = qs('#lang-gb');
    
    const btnBg   = qs('#bg-button');
    const btnSave = qs('#save-button');
    const btnMix2 = qs('#mix2-button');
    const btnMixN = qs('#mixn-button');
    const btnReset= qs('#reset-button');
    const btnSend = qs('#send-button');
    
    /* === STATE === */
    let lang='pl', active=null, curBg=0;
    const selections={};          // {partId:colorName}
    const usedColors=new Set();   // zbiór różnych kolorów
    
    /* === INIT === */
    Promise.all([preloadImages(),loadSvg()]).then(buildUI);
    
    function preloadImages(){
      return Promise.all([...BG_LIST,GUN_IMG].map(src=>new Promise(r=>{
        const img=new Image(); img.onload=r; img.src=src;
      })));
    }
    
    async function loadSvg(){
      const txt=await fetch(SVG_FILE).then(r=>r.text());
      gunBox.innerHTML=txt;
      gunBox.querySelector('svg').classList.add('gun-svg');
      /* lufa group jak wcześniej */
      const svg=gunBox.querySelector('svg');
      const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='lufa';
      [...svg.querySelectorAll('#lufa')].forEach(p=>g.appendChild(p));
      svg.prepend(g);
      /* overlay duplikaty */
      PARTS.forEach(p=>{
          if(p.disabled) return;
          const src=svg.querySelector('#'+p.id); if(!src) return;
          ['1','2'].forEach(n=>{
            const ov=src.cloneNode(true);ov.id=`ov-${n}-${p.id}`;ov.classList.add('color-overlay');
            svg.appendChild(ov);
          });
      });
    }
    
    function buildUI(){
      /* parts */
      PARTS.forEach(p=>{
        const b=ce('button');b.textContent=p[lang];b.dataset.id=p.id;
        if(p.disabled){b.disabled=true}
        b.onclick=()=>{ if(b.disabled) return;
            qsAll('.part-selection button').forEach(x=>x.classList.remove('selected'));
            b.classList.add('selected');active=p.id;
        };
        partBox.appendChild(b);
      });
    
      /* palette */
      for(const [name,hex] of Object.entries(COLORS)){
        const wrap=ce('div','color-swatch-wrapper');
        const dot =ce('div','color-swatch');dot.style.background=hex;
        const lab =ce('div','color-swatch-label');lab.textContent=name;
        wrap.append(dot,lab);
        wrap.onclick=()=>applyColor(active,name);
        palBox.appendChild(wrap);
      }
    
      langPL.onclick=()=>setLang('pl'); langEN.onclick=()=>setLang('en');
      btnBg.onclick =changeBg;  btnSave.onclick=saveImg;
      btnMix2.onclick=()=>randomMix(2); btnMixN.onclick=()=>randomMix(99);
      btnReset.onclick=resetAll;btnSend.onclick=openMail;
      defaultBlack();updateCost();setLang('pl');
    }
    
    /* === LOGIKA === */
    function applyColor(pid,color){
      if(!pid||PARTS.find(x=>x.id===pid).disabled) return;
      const hex=COLORS[color];
      ['1','2'].forEach(n=>{
        qs(`#ov-${n}-${pid}`)?.querySelectorAll('path,polygon,ellipse,circle,rect').forEach(s=>s.style.fill=hex);
      });
      selections[pid]=color;updateCost();
    }
    
    function defaultBlack(){
      PARTS.forEach(p=>{ if(!p.disabled) applyColor(p.id,'H-146'); });
    }
    
    function randomMix(maxColors){
      const keys=Object.keys(COLORS);
      const chosen=new Map();
      PARTS.forEach(p=>{
        if(p.disabled) return;
        let col;
        if(chosen.size<maxColors){
          col=keys[Math.floor(Math.random()*keys.length)];
          chosen.set(chosen.size,col);
        }else{
          col=[...chosen.values()][Math.floor(Math.random()*chosen.size)];
        }
        applyColor(p.id,col);
      });
    }
    
    function resetAll(){Object.keys(selections).forEach(k=>delete selections[k]);defaultBlack();}
    
    function changeBg(){curBg=(curBg+1)%BG_LIST.length;gunBox.style.backgroundImage=`url(${BG_LIST[curBg]})`;gunBox.style.backgroundSize='cover'}
    
    function updateCost(){
      usedColors.clear();Object.values(selections).forEach(c=>usedColors.add(c));
      let cost=0;
      for(const [part,c] of Object.entries(selections)) cost+=PRICES[part]||0;
      if(usedColors.size<=2) cost=Math.min(cost,MIX2_PRICE);
      else cost=Math.min(cost,MIXN_PRICE);
      costLine.innerHTML=(lang==='pl'
          ?'Szacowany koszt:&nbsp;&nbsp;'
          :'Estimated cost:&nbsp;&nbsp;')
        +`${cost} zł`;
    }
    
    /* === TŁUMACZENIE === */
    function setLang(l){
      lang=l; langPL.classList.toggle('active',l==='pl');langEN.classList.toggle('active',l==='en');
      qs('#header-part-selection').textContent=l==='pl'?'1. Wybierz część':'1. Select part';
      qs('#header-color-selection').textContent=l==='pl'?'2. Wybierz kolor (Cerakote)':'2. Select color (Cerakote)';
      qs('#bg-button').textContent            =l==='pl'?'Zmień tło':'Change background';
      qs('#save-button').textContent          =l==='pl'?'Zapisz obraz':'Save image';
      qs('#reset-button').textContent         =l==='pl'?'Resetuj kolory':'Reset colors';
      qs('#send-button').textContent          =l==='pl'?'Wyślij do Wizards!':'Send to Wizards!';
      btnMix2.textContent                     =l==='pl'?'MIX (≤2)':'MIX (≤2)';
      btnMixN.textContent                     =l==='pl'?'MIX (3+)':'MIX (3+)';
      qsAll('.part-selection button').forEach(b=>{
          const p=PARTS.find(x=>x.id===b.dataset.id);b.textContent=p[l];
      });
      updateCost();
    }
    
    /* === MAILTO (bez załącznika PNG) === */
    function openMail(){
      const lines=PARTS.filter(p=>!p.disabled).map(p=>{
          const c=selections[p.id];return `${p[lang]} – ${c||'H-146'}`;
      }).join('%0D%0A');
      const costTxt=costLine.textContent.replace(/ /g,' ');
      const mail=`mailto:contact@weapon-wizards.com?subject=Projekt%20Cerakote&body=${lines}%0D%0A%0D%0A${costTxt}`;
      window.location.href=mail;
    }
    
    /* === SAVE PNG (bez załączników w mailto) === */
    function saveImg(){alert('Zapis PNG działa jak wcześniej – kod pominięto dla skrótu');}
    
    /* === UTIL === */
    function qs(s){return document.querySelector(s)}
    function qsAll(s){return [...document.querySelectorAll(s)]}
    function ce(tag,cls){const e=document.createElement(tag);if(cls)e.className=cls;return e}
    
    });
    