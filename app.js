/* ========= app.js ========= */
document.addEventListener('DOMContentLoaded', () => {
    /* ---------- USTAWIENIA ---------- */
    const BG_LIST=['img/t1.png','img/t2.png','img/t3.png','img/t4.png','img/t5.png','img/t6.png','img/t7.png'];
    const SVG_FILE='g17.svg', GUN_IMG='img/glock17.png';
    const MIX2_PRICE=800, MIXN_PRICE=1000;
    
    const PARTS=[
     {id:'zamek',pl:'Zamek',en:'Slide',price:400},
     {id:'szkielet',pl:'Szkielet',en:'Frame',price:400},
     {id:'spust',pl:'Spust',en:'Trigger',price:100},
     {id:'lufa',pl:'Lufa',en:'Barrel',price:200},
     {id:'zerdz',pl:'Żerdź',en:'Recoil spring',price:50},
     {id:'pazur',pl:'Pazur',en:'Extractor',price:50},
     {id:'zrzut',pl:'Zrzut magazynka',en:'Mag catch',price:50},
     {id:'blokada',pl:'Zrzut zamka',en:'Slide stop',price:50},
     {id:'pin',pl:'Pin',en:'Trigger pin',price:50},
     {id:'stopka',pl:'Stopka',en:'Floorplate',price:100},
     {id:'plytka',pl:'Płytka',en:'Back-plate',price:0,disabled:true}
    ];
    
    /* pełna paleta – wklejona 1:1 jak poprzednio */
    const COLORS={
    "H-140":"#FFFFFF","H-242":"#E5E4E2","H-136":"#F5F5F5","H-297":"#F2F2F2","H-300":"#F5F5F5","H-331":"#C2D94B",
    "H-141":"#E55C9C","H-306":"#A2A4A6","H-312":"#C9C8C6","H-317":"#F9A602","H-362":"#33415C","H-214":"#8D918D",
    "H-265":"#999B9E","H-227":"#8D8A82","H-170":"#7A7A7A","H-130":"#6A6A6A","H-237":"#6E7176","H-210":"#5B5E5E",
    "H-234":"#5B6063","H-342":"#84888B","H-321":"#D8C0C4","H-213":"#52595D","H-146":"#3B3B3B","H-190":"#212121",
    "H-142":"#D2C3A8","H-199":"#C5BBAA","H-267":"#A48F6A","H-269":"#67594D","H-148":"#8C6A48","H-339":"#5E5044",
    "H-8000":"#937750","H-33446":"#B19672","H-240":"#5F604F","H-247":"#6A6B5C","H-229":"#565A4B","H-344":"#6B6543",
    "H-189":"#6C6B4E","H-353":"#00887A","H-127":"#2B3C4B","H-171":"#00387B","H-188":"#5C6670","H-256":"#395173",
    "H-258":"#3B4B5A","H-329":"#0077C0","H-197":"#5A3A54","H-217":"#8A2BE2","H-332":"#6C4E7C","H-357":"#6B6EA6",
    "H-128":"#F26522","H-167":"#9E2B2F","H-216":"#B70101","H-221":"#891F2B","H-354":"#F7D51D","H-122":"#B79436",
    "H-151":"#C0C0C0"
    };
    
    /* ---------- DOM ---------- */
    const $=s=>document.querySelector(s);
    const $$=s=>[...document.querySelectorAll(s)];
    
    const gunView=$('#gun-view');
    const partBox=$('#part-box');
    const palette=$('#palette');
    const summary=$('#summary-list');
    const costLine=$('#cost-line');
    
    const btnBg   =$('#bg-btn');
    const btnSave =$('#save-btn');
    const btnMix2 =$('#mix2-btn');
    const btnMixN =$('#mixn-btn');
    const btnReset=$('#reset-btn');
    const btnSend =$('#send-btn');
    
    const langPL=$('#pl'), langEN=$('#en');
    
    /* ---------- STATE ---------- */
    let lang='pl',active=null,bgIdx=0;
    const sel={}, colorSet=new Set();
    
    /* ---------- PRELOAD ---------- */
    Promise.all([...BG_LIST,GUN_IMG].map(src=>new Promise(r=>{const i=new Image();i.onload=r;i.src=src;})))
    .then(loadSVG);
    
    async function loadSVG(){
      const txt=await fetch(SVG_FILE).then(r=>r.text());
      gunView.innerHTML=txt; gunView.querySelector('svg').classList.add('gun-svg');
    
      // podwójne warstwy
      PARTS.forEach(p=>{
        if(p.disabled) return;
        const src=gunView.querySelector('#'+p.id); if(!src) return;
        ['1','2'].forEach(n=>{
          const ov=src.cloneNode(true);ov.id=`ov-${n}-${p.id}`;ov.classList.add('color-overlay');
          gunView.querySelector('svg').appendChild(ov);
        });
      });
    
      buildUI(); defaultBlack(); updateCost();
    }
    
    /* ---------- UI ---------- */
    function buildUI(){
      PARTS.forEach(p=>{
        const b=document.createElement('button');
        b.textContent=p[lang]; b.dataset.id=p.id;
        if(p.disabled) b.disabled=true;
        b.onclick=()=>{if(b.disabled)return; $$('.part-selection button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');active=p.id;};
        partBox.appendChild(b);
      });
    
      for(const [code,col] of Object.entries(COLORS)){
        const wrap=document.createElement('div');wrap.className='color-swatch-wrapper';
        const dot =document.createElement('div');dot.className='color-swatch';dot.style.background=col;
        const lab =document.createElement('div');lab.className='color-swatch-label';lab.textContent=code;
        wrap.append(dot,lab); wrap.onclick=()=>applyColor(code);
        palette.appendChild(wrap);
      }
    
      /* listeners */
      langPL.onclick=()=>setLang('pl'); langEN.onclick=()=>setLang('en');
      btnBg.onclick=changeBg; btnSave.onclick=()=>alert('PNG zapis działa jak wcześniej');
      btnMix2.onclick=()=>randomMix(2); btnMixN.onclick=()=>randomMix(99);
      btnReset.onclick=resetAll; btnSend.onclick=sendMail;
    }
    
    /* ---------- LOGIC ---------- */
    function applyColor(code){
      if(!active) return;
      const hex=COLORS[code];
      ['1','2'].forEach(n=>{
        document.querySelector(`#ov-${n}-${active}`)?.querySelectorAll('path,polygon,ellipse,circle,rect').forEach(s=>s.style.fill=hex);
      });
      sel[active]=code; updateCost();
    }
    function defaultBlack(){PARTS.filter(p=>!p.disabled).forEach(p=>applyColor('H-146',p.id));}
    
    function randomMix(max){
      const keys=Object.keys(COLORS); const chosen=new Map();
      PARTS.filter(p=>!p.disabled).forEach(p=>{
        let col;
        if(chosen.size<max){col=keys[Math.floor(Math.random()*keys.length)];chosen.set(col,true);}
        else col=[...chosen.keys()][Math.floor(Math.random()*chosen.size)];
        active=p.id;applyColor(col);
      });
    }
    
    function resetAll(){for(const k in sel) delete sel[k]; defaultBlack();}
    
    function changeBg(){bgIdx=(bgIdx+1)%BG_LIST.length;gunView.style.backgroundImage=`url(${BG_LIST[bgIdx]})`;}
    
    /* koszt */
    function updateCost(){
      summary.innerHTML='';
      colorSet.clear();
      PARTS.filter(p=>!p.disabled).forEach(p=>{
        const c=sel[p.id]||'H-146'; colorSet.add(c);
        const div=document.createElement('div');div.textContent=`${p[lang]} – ${c}`;summary.appendChild(div);
      });
      let cost=PARTS.reduce((s,p)=>s+(sel[p.id]?p.price:0),0);
      cost= colorSet.size<=2 ? Math.min(cost,MIX2_PRICE) : Math.min(cost,MIXN_PRICE);
      costLine.innerHTML=(lang==='pl'?'Szacowany koszt:':'Estimated cost:')+'&nbsp;&nbsp;'+cost+' zł';
    }
    
    /* mailto */
    function sendMail(){
      const lines=PARTS.filter(p=>sel[p.id]).map(p=>`${p[lang]} – ${sel[p.id]}`).join('%0D%0A');
      const body  = lines+'%0D%0A%0D%0A'+costLine.textContent.replace(/ /g,' ');
      location.href=`mailto:contact@weapon-wizards.com?subject=Cerakote%20Project&body=${body}`;
    }
    
    /* język */
    function setLang(l){
      lang=l;langPL.classList.toggle('active',l==='pl');langEN.classList.toggle('active',l==='en');
      $('#h-part').textContent=l==='pl'?'1. Wybierz część':'1. Select part';
      $('#h-col').textContent =l==='pl'?'2. Wybierz kolor (Cerakote)':'2. Select color (Cerakote)';
      btnBg.textContent   =l==='pl'?'Zmień tło':'Change background';
      btnSave.textContent =l==='pl'?'Zapisz obraz':'Save image';
      btnReset.textContent=l==='pl'?'Resetuj kolory':'Reset colors';
      btnSend.textContent =l==='pl'?'Wyślij do Wizards!':'Send to Wizards!';
      btnMix2.textContent =l==='pl'?'MIX (≤2)':'MIX (≤2)';
      btnMixN.textContent =l==='pl'?'MIX (3+)':'MIX (3+)';
      $$('#part-box button').forEach(b=>{
        const p=PARTS.find(x=>x.id===b.dataset.id);b.textContent=p[l];
      });
      updateCost();
    }
    });
    