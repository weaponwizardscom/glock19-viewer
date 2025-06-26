/* ===== app.js ===== */
document.addEventListener('DOMContentLoaded', async () => {
    /* pliki */
    const SVG_FILE='g17.svg';
    const TEXTURE ='img/glock17.png';
    const BG_LIST = Array.from({length:8},(_,i)=>`img/t${i+1}.png`);

    /* stałe */
    const FONT=24, PANEL_W=380, PAD=32;
    const FULL_W=1600, FULL_H=1200;                   // wszystkie pliki

    /* css zmienne */
    const gunScale=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gun-scale'));

    /* dane */
    const [PARTS,COLORS]=await Promise.all([
        fetch('./data/parts.json').then(r=>r.json()),
        fetch('./data/colors.json').then(r=>r.json())
    ]);

    /* refs */
    const $=id=>document.getElementById(id);
    const gunView=$('gun-view'), partBox=$('part-selection-container'), palBox=$('color-palette'),
          resetBtn=$('reset-button'), saveBtn=$('save-button'), bgBtn=$('bg-button'),
          PLbtn=$('lang-pl'), ENbtn=$('lang-gb'),
          H1=$('header-part-selection'), H2=$('header-color-selection'), sumList=$('summary-list');

    /* state */
    let lang='pl',activePart=null,currentBg=null,selections={};

    /* init */
    await loadSvg(); buildUI(); defaultBlack(); changeBG(); updateText(); updateSummary();

    /* ---------- SVG ---------- */
    async function loadSvg(){
        gunView.innerHTML=await fetch(SVG_FILE).then(r=>r.text());
        const svg=gunView.querySelector('svg');svg.classList.add('gun-svg');
        const layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.id='color-overlays';svg.appendChild(layer);
        PARTS.forEach(p=>{
            const src=svg.querySelector('#'+p.id); if(!src) return;
            ['1','2'].forEach(n=>{const ov=src.cloneNode(true);ov.id=`color-overlay-${n}-${p.id}`;ov.classList.add('color-overlay');layer.appendChild(ov);});
        });
    }

    /* ---------- UI ---------- */
    function buildUI(){
        PARTS.forEach(p=>{const b=document.createElement('button');b.dataset.partId=p.id;b.onclick=()=>selectPart(b,p.id);partBox.appendChild(b);});
        const mix=document.createElement('button');mix.id='mix-button';mix.textContent='MIX';mix.onclick=randomize;partBox.appendChild(mix);
        resetBtn.onclick=resetAll;saveBtn.onclick=savePng;bgBtn.onclick=changeBG;
        PLbtn.onclick=()=>setLang('pl');ENbtn.onclick=()=>setLang('en');
        buildPalette();
    }
    const selectPart=(btn,id)=>{partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');activePart=id;}

    /* ---------- LANG ---------- */
    const setLang=l=>{lang=l;updateText();updateSummary();}
    function updateText(){
        partBox.querySelectorAll('button').forEach(b=>{const p=PARTS.find(x=>x.id===b.dataset.partId);if(p)b.textContent=p[lang];});
        H1.textContent=lang==='pl'?'1. Wybierz część':'1. Select part';
        H2.textContent=lang==='pl'?'2. Wybierz kolor (Cerakote)':'2. Select color (Cerakote)';
        saveBtn.textContent=lang==='pl'?'Zapisz Obraz':'Save Image';
        resetBtn.textContent=lang==='pl'?'Resetuj Kolory':'Reset Colors';
        bgBtn.textContent   =lang==='pl'?'Zmień Tło':'Change Background';
        PLbtn.classList.toggle('active',lang==='pl');ENbtn.classList.toggle('active',lang==='en');
    }

    /* ---------- BACKGROUND ---------- */
    function changeBG(){
        let next;do{next=BG_LIST[Math.floor(Math.random()*BG_LIST.length)];}while(next===currentBg);
        currentBg=next;
        gunView.style.background=`url("${next}") center/100% 100% no-repeat`;
    }

    /* ---------- PALETTE ---------- */
    function buildPalette(){palBox.innerHTML='';for(const [name,hex] of Object.entries(COLORS)){const w=document.createElement('div');w.className='color-swatch-wrapper';w.title=name;w.onclick=()=>applyColor(activePart,hex,name);const d=document.createElement('div');d.className='color-swatch';d.style.backgroundColor=hex;const l=document.createElement('div');l.className='color-swatch-label';l.textContent=name;w.append(d,l);palBox.appendChild(w);}}
    function applyColor(pid,hex,name){if(!pid){alert(lang==='pl'?'Najpierw wybierz część!':'Select a part first!');return;}['1','2'].forEach(n=>{const ov=$(`color-overlay-${n}-${pid}`);const s=ov.tagName==='g'?ov.querySelectorAll('path,polygon,ellipse,circle,rect'):[ov];s.forEach(e=>{e.style.fill=hex;e.style.stroke=hex;});});selections[pid]=name;updateSummary();}
    function defaultBlack(){const def='H-146 Graphite Black',hex=COLORS[def];PARTS.forEach(p=>{selections[p.id]=def;applyColor(p.id,hex,def);});}
    function randomize(){const k=Object.keys(COLORS);PARTS.forEach(p=>{const pick=k[Math.floor(Math.random()*k.length)];applyColor(p.id,COLORS[pick],pick);});}
    function resetAll(){document.querySelectorAll('.color-overlay').forEach(ov=>{const s=ov.tagName==='g'?ov.querySelectorAll('path,polygon,ellipse,circle,rect'):[ov];s.forEach(e=>{e.style.fill='transparent';e.style.stroke='transparent';});});Object.keys(selections).forEach(k=>delete selections[k]);partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));activePart=null;updateSummary();}
    function code(f){return f.split(' ')[0];}
    function updateSummary(){sumList.innerHTML='';PARTS.forEach(p=>{const c=selections[p.id];if(c){const d=document.createElement('div');d.textContent=`${p[lang]} – ${code(c)}`;sumList.appendChild(d);}});}

    /* ---------- SAVE PNG ---------- */
    async function savePng(){
        const svg=gunView.querySelector('svg');if(!svg)return;
        const lines=PARTS.map(p=>selections[p.id]?`${p[lang]} – ${code(selections[p.id])}`:null).filter(Boolean);

        /* canvas = FULL background + panel */
        const s=gunScale(), BG_W=FULL_W, BG_H=FULL_H;             // bez skalowania
        const pistolW=FULL_W*s, pistolH=FULL_H*s, offX=(BG_W-pistolW)/2, offY=(BG_H-pistolH)/2;

        const cv=Object.assign(document.createElement('canvas'),{width:BG_W+PANEL_W,height:BG_H});
        const ctx=cv.getContext('2d');

        if(currentBg){const bg=await img(currentBg);ctx.drawImage(bg,0,0,BG_W,BG_H);}else{ctx.fillStyle='#000';ctx.fillRect(0,0,BG_W,BG_H);}
        const base=await img(TEXTURE);ctx.drawImage(base,offX,offY,pistolW,pistolH);
        await Promise.all([...gunView.querySelectorAll('.color-overlay')].filter(o=>o.style.fill&&o.style.fill!=='transparent').map(ov=>{
            const tmp=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute('viewBox')}"><g style="mix-blend-mode:hard-light;opacity:.45;">${ov.outerHTML}</g></svg>`,url=URL.createObjectURL(new Blob([tmp],{type:'image/svg+xml'}));return img(url).then(i=>{ctx.drawImage(i,offX,offY,pistolW,pistolH);URL.revokeObjectURL(url);});
        }));
        ctx.fillStyle='#000c';ctx.fillRect(BG_W,0,PANEL_W,BG_H);
        ctx.fillStyle='#fff';ctx.font=`${FONT}px sans-serif`;lines.forEach((t,i)=>ctx.fillText(t,BG_W+PAD,PAD+FONT*i*1.4));
        const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download='weapon-wizards-projekt.png';document.body.appendChild(a);a.click();a.remove();

        function img(src){return new Promise(res=>{const i=new Image();i.src=src;i.onload=()=>res(i);});}
    }
});
