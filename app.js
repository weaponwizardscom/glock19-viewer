/* ====== app.js (module) ====== */
document.addEventListener('DOMContentLoaded', async () => {
    const SVG_FILE='g17.svg', TEXTURE='img/glock17.png';
    const FONT_PX=24, PANEL_W=380, PAD=32;

    const [PARTS, COLORS]=await Promise.all([
        fetch('./data/parts.json').then(r=>r.json()),
        fetch('./data/colors.json').then(r=>r.json())
    ]);

    const gunBox=document.getElementById('gun-view-container');
    const partBox=document.getElementById('part-selection-container');
    const palBox =document.getElementById('color-palette');
    const resetBtn=document.getElementById('reset-button');
    const saveBtn =document.getElementById('save-button');
    const PLbtn=document.getElementById('lang-pl');
    const ENbtn=document.getElementById('lang-gb');
    const H1=document.getElementById('header-part-selection');
    const H2=document.getElementById('header-color-selection');
    const sumTitle=document.getElementById('summary-title');
    const sumList =document.getElementById('summary-list');

    let lang='pl', activePart=null;
    const selections={};

    await loadSvg();
    buildUI();
    defaultBlack();
    updateText();
    updateSummary();

    async function loadSvg(){
        const svgTxt=await fetch(SVG_FILE).then(r=>r.text());
        gunBox.innerHTML=svgTxt;
        const svg=gunBox.querySelector('svg'); svg.classList.add('gun-svg');

        const layer=document.createElementNS('http://www.w3.org/2000/svg','g');
        layer.id='color-overlays'; svg.appendChild(layer);

        PARTS.forEach(p=>{
            const src=svg.querySelector('#'+p.id); if(!src) return;
            ['1','2'].forEach(n=>{
                const ov=src.cloneNode(true);
                ov.id=`color-overlay-${n}-${p.id}`;
                ov.classList.add('color-overlay');
                layer.appendChild(ov);
            });
        });
    }

    function buildUI(){
        PARTS.forEach(p=>{
            const b=document.createElement('button');
            b.dataset.partId=p.id;
            b.onclick=()=>selectPart(b,p.id);
            partBox.appendChild(b);
        });
        const mix=document.createElement('button');
        mix.id='mix-button'; mix.textContent='MIX'; mix.onclick=randomize;
        partBox.appendChild(mix);

        resetBtn.onclick=resetAll;
        saveBtn.onclick=savePng;
        PLbtn.onclick=()=>setLang('pl');
        ENbtn.onclick=()=>setLang('en');

        buildPalette();
    }
    function selectPart(btn,id){
        partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected'); activePart=id;
    }

    /* --- LANG --- */
    function setLang(l){ lang=l; updateText(); updateSummary(); }
    function updateText(){
        partBox.querySelectorAll('button').forEach(b=>{
            const p=PARTS.find(x=>x.id===b.dataset.partId);
            if(p) b.textContent=p[lang];
        });
        H1.textContent=lang==='pl'?'1. Wybierz część':'1. Select part';
        H2.textContent=lang==='pl'?'2. Wybierz kolor (Cerakote)':'2. Select color (Cerakote)';
        sumTitle.textContent=lang==='pl'
            ?'Twoje zestawienie kolorów Cerakote'
            :'Your Cerakote color summary';

        /* --- NOWE: tłumaczymy główne przyciski --- */
        saveBtn.textContent  = lang==='pl' ? 'Zapisz Obraz'   : 'Save Image';
        resetBtn.textContent = lang==='pl' ? 'Resetuj Kolory' : 'Reset Colors';

        PLbtn.classList.toggle('active',lang==='pl');
        ENbtn.classList.toggle('active',lang==='en');
    }

    /* --- PALETTE --- */
    function buildPalette(){
        palBox.innerHTML='';
        for(const [name,hex] of Object.entries(COLORS)){
            const w=document.createElement('div'); w.className='color-swatch-wrapper'; w.title=name;
            w.onclick=()=>applyColor(activePart,hex,name);
            const dot=document.createElement('div'); dot.className='color-swatch'; dot.style.backgroundColor=hex;
            const lbl=document.createElement('div'); lbl.className='color-swatch-label'; lbl.textContent=name;
            w.append(dot,lbl); palBox.appendChild(w);
        }
    }

    /* --- COLORING --- */
    function applyColor(pid,hex,name){
        if(!pid){
            alert(lang==='pl'?'Najpierw wybierz część!':'Select a part first!');
            return;
        }
        ['1','2'].forEach(n=>{
            const ov=document.getElementById(`color-overlay-${n}-${pid}`);
            const shapes=ov.tagName==='g'
                ? ov.querySelectorAll('path,polygon,ellipse,circle,rect')
                : [ov];
            shapes.forEach(s=>{ s.style.fill=hex; s.style.stroke=hex; });
        });
        selections[pid]=name; updateSummary();
    }
    function defaultBlack(){
        const def='H-146 Graphite Black',hex=COLORS[def];
        PARTS.forEach(p=>{ selections[p.id]=def; applyColor(p.id,hex,def); });
    }
    function randomize(){
        const keys=Object.keys(COLORS);
        PARTS.forEach(p=>{
            const n=keys[Math.floor(Math.random()*keys.length)];
            applyColor(p.id,COLORS[n],n);
        });
    }
    function resetAll(){
        document.querySelectorAll('.color-overlay').forEach(ov=>{
            const shapes=ov.tagName==='g'
                ? ov.querySelectorAll('path,polygon,ellipse,circle,rect')
                : [ov];
            shapes.forEach(s=>{ s.style.fill='transparent'; s.style.stroke='transparent'; });
        });
        Object.keys(selections).forEach(k=>delete selections[k]);
        partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
        activePart=null; updateSummary();
    }

    /* --- SUMMARY --- */
    function updateSummary(){
        sumList.innerHTML='';
        PARTS.forEach(p=>{
            const c=selections[p.id]; if(!c) return;
            const d=document.createElement('div'); d.textContent=`${p[lang]} – ${c}`;
            sumList.appendChild(d);
        });
    }

    /* --- SAVE PNG (bez zmian) --- */
    async function savePng(){ /* … */ }
});
