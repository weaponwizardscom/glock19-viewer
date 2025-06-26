/* ===== app.js ===== */
document.addEventListener('DOMContentLoaded', async () => {
    /* --- pliki źródłowe --- */
    const SVG_FILE='g17.svg';
    const TEXTURE ='img/glock17.png';
    const BG_LIST = Array.from({length:8},(_,i)=>`img/t${i+1}.png`);

    /* --- stałe --- */
    const FONT_PX=24, PANEL_W=380, PAD=32;
    const PISTOL_SRC_W=843, BG_SRC_W=1600, RATIO=PISTOL_SRC_W/BG_SRC_W;   // 1

    /* --- CSS zmienne --- */
    const CSS=getComputedStyle(document.documentElement);
    let GUN_SCALE=parseFloat(CSS.getPropertyValue('--gun-scale'));        // 0-1
    function bgScale(){return GUN_SCALE * RATIO;}                         // stale liczone

    /* --- dane parts / colors --- */
    const [PARTS,COLORS]=await Promise.all([
        fetch('./data/parts.json').then(r=>r.json()),
        fetch('./data/colors.json').then(r=>r.json())
    ]);

    /* --- referencje --- */
    const gunView=document.getElementById('gun-view'),
          partBox=document.getElementById('part-selection-container'),
          palBox=document.getElementById('color-palette'),
          resetBtn=document.getElementById('reset-button'),
          saveBtn=document.getElementById('save-button'),
          bgBtn=document.getElementById('bg-button'),
          PLbtn=document.getElementById('lang-pl'),
          ENbtn=document.getElementById('lang-gb'),
          H1=document.getElementById('header-part-selection'),
          H2=document.getElementById('header-color-selection'),
          sumList=document.getElementById('summary-list');

    /* --- stan --- */
    let lang='pl', activePart=null, currentBg=null, selections={};

    /* ---------- INIT ---------- */
    await loadSvg();
    buildUI();
    defaultBlack();
    changeBackground();
    updateText();
    updateSummary();

    /* ---------- FUNKCJE ---------- */

    async function loadSvg(){
        const txt=await fetch(SVG_FILE).then(r=>r.text());
        gunView.innerHTML=txt;
        const svg=gunView.querySelector('svg');svg.classList.add('gun-svg');
        const layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.id='color-overlays';svg.appendChild(layer);
        PARTS.forEach(p=>{
            const src=svg.querySelector('#'+p.id);if(!src)return;
            ['1','2'].forEach(n=>{const ov=src.cloneNode(true);ov.id=`color-overlay-${n}-${p.id}`;ov.classList.add('color-overlay');layer.appendChild(ov);});
        });
    }

    function buildUI(){
        PARTS.forEach(p=>{const b=document.createElement('button');b.dataset.partId=p.id;b.onclick=()=>selectPart(b,p.id);partBox.appendChild(b);});
        const mix=document.createElement('button');mix.id='mix-button';mix.textContent='MIX';mix.onclick=randomize;partBox.appendChild(mix);
        resetBtn.onclick=resetAll;saveBtn.onclick=savePng;bgBtn.onclick=changeBackground;
        PLbtn.onclick=()=>setLang('pl');ENbtn.onclick=()=>setLang('en'); buildPalette();
    }
    const selectPart=(btn,id)=>{partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');activePart=id;}

    const setLang=l=>{lang=l;updateText();updateSummary();}
    function updateText(){
        partBox.querySelectorAll('button').forEach(b=>{const p=PARTS.find(x=>x.id===b.dataset.partId);if(p)b.textContent=p[lang];});
        H1.textContent=lang==='pl'?'1. Wybierz część':'1. Select part';
        H2.textContent=lang==='pl'?'2. Wybierz kolor (Cerakote)':'2. Select color (Cerakote)';
        saveBtn.textContent=lang==='pl'?'Zapisz Obraz':'Save Image';
        resetBtn.textContent=lang==='pl'?'Resetuj Kolory':'Reset Colors';
        bgBtn.textContent=lang==='pl'?'Zmień Tło':'Change Background';
        PLbtn.classList.toggle('active',lang==='pl');ENbtn.classList.toggle('active',lang==='en');
    }

    function changeBackground(){
        let next;do{next=BG_LIST[Math.floor(Math.random()*BG_LIST.length)];}while(next===currentBg);
        currentBg=next;
        gunView.style.background=`url("${next}") center/auto no-repeat`;
        gunView.style.backgroundSize=`${bgScale()*100}% auto`;
    }

    function buildPalette(){palBox.innerHTML='';for(const [name,hex]of Object.entries(COLORS)){const w=document.createElement('div');w.className='color-swatch-wrapper';w.title=name;w.onclick=()=>applyColor(activePart,hex,name);const d=document.createElement('div');d.className='color-swatch';d.style.backgroundColor=hex;const l=document.createElement('div');l.className='color-swatch-label';l.textContent=name;w.append(d,l);palBox.appendChild(w);}}
    function applyColor(pid,hex,name){if(!pid){alert(lang==='pl'?'Najpierw wybierz część!':'Select a part first!');return;}['1','2'].forEach(n=>{const ov=document.getElementById(`color-overlay-${n}-${pid}`);const s=ov.tagName==='g'?ov.querySelectorAll('path,polygon,ellipse,circle,rect'):[ov];s.forEach(e=>{e.style.fill=hex;e.style.stroke=hex;});});selections[pid]=name;updateSummary();}
    function defaultBlack(){const def='H-146 Graphite Black',hex=COLORS[def];PARTS.forEach(p=>{selections[p.id]=def;applyColor(p.id,hex,def);});}
    function randomize(){const k=Object.keys(COLORS);PARTS.forEach(p=>{const pick=k[Math.floor(Math.random()*k.length)];applyColor(p.id,COLORS[pick],pick);});}
    function resetAll(){document.querySelectorAll('.color-overlay').forEach(ov=>{const s=ov.tagName==='g'?ov.querySelectorAll('path,polygon,ellipse,circle,rect'):[ov];s.forEach(e=>{e.style.fill='transparent';e.style.stroke='transparent';});});Object.keys(selections).forEach(k=>delete selections[k]);partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));activePart=null;updateSummary();}
    function codeOnly(f){return f.split(' ')[0];}
    function updateSummary(){sumList.innerHTML='';PARTS.forEach(p=>{const full=selections[p.id];if(full){const d=document.createElement('div');d.textContent=`${p[lang]} – ${codeOnly(full)}`;sumList.appendChild(d);}});}

    async function savePng(){
        /* panel text */
        const lines=PARTS.map(p=>selections[p.id]?`${p[lang]} – ${codeOnly(selections[p.id])}`:null).filter(Boolean);

        /* canvas sizes */
        const BG_W=BG_SRC_W*bgScale(), BG_H=1200*bgScale();
        const scale=2, box=gunView.querySelector('svg').getBBox();
        const pistolW=box.width*scale*GUN_SCALE, pistolH=box.height*scale*GUN_SCALE;
        const offX=(BG_W-pistolW)/2, offY=(BG_H-pistolH)/2;

        const canvas=Object.assign(document.createElement('canvas'),{width:BG_W+PANEL_W,height:BG_H});
        const ctx=canvas.getContext('2d');

        if(currentBg){const bg=await loadImg(currentBg);ctx.drawImage(bg,0,0,BG_W,BG_H);}else{ctx.fillStyle='#000';ctx.fillRect(0,0,BG_W,BG_H);}
        const base=await loadImg(TEXTURE);ctx.drawImage(base,offX,offY,pistolW,pistolH);
        await Promise.all([...gunView.querySelectorAll('.color-overlay')].filter(o=>o.style.fill&&o.style.fill!=='transparent').map(ov=>{
            const tmp=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${gunView.querySelector('svg').getAttribute('viewBox')}"><g style="mix-blend-mode:hard-light;opacity:.45;">${ov.outerHTML}</g></svg>`;
            const url=URL.createObjectURL(new Blob([tmp],{type:'image/svg+xml'}));return loadImg(url).then(i=>{ctx.drawImage(i,offX,offY,pistolW,pistolH);URL.revokeObjectURL(url);});
        }));
        const x0=BG_W;ctx.fillStyle='#000c';ctx.fillRect(x0,0,PANEL_W,BG_H);ctx.fillStyle='#fff';ctx.font=`${FONT_PX}px sans-serif`;lines.forEach((t,i)=>ctx.fillText(t,x0+PAD,PAD+FONT_PX*i*1.4));
        const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='weapon-wizards-projekt.png';a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>document.body.removeChild(a),1000);
        function loadImg(src){return new Promise(res=>{const img=new Image();img.src=src;img.onload=()=>res(img);});}
    }
});
