/* ====== app.js ====== */
document.addEventListener('DOMContentLoaded', () => {
    /* --- CONFIG --- */
    const SVG_FILE   = 'g17.svg';
    const TEXTURE    = 'img/glock17.png';
    const FONT_SIZE_PX = 24;      // rozmiar tekstu na PNG
    const PANEL_W      = 380;     // szerokość panelu tekstowego na PNG
    const PADDING      = 32;      // margines w panelu tekstowym

    const PARTS = [
        { id:'zamek',    pl:'Zamek',                 en:'Slide' },
        { id:'szkielet', pl:'Szkielet',              en:'Frame' },
        { id:'spust',    pl:'Język spustowy z szyną',en:'Trigger with trigger bar' },
        { id:'lufa',     pl:'Lufa',                  en:'Barrel' },
        { id:'zerdz',    pl:'Żerdź',                 en:'Recoil spring' },
        { id:'pazur',    pl:'Pazur wyciągu',         en:'Extractor' },
        { id:'zrzut',    pl:'Zatrzask magazynka',    en:'Magazine catch' },
        { id:'blokadap', pl:'Blokada zamka',         en:'Slide lock' },
        { id:'blokada2', pl:'Dźwignia zrzutu zamka', en:'Slide stop lever' },
        { id:'pin',      pl:'Pin',                   en:'Trigger pin' },
        { id:'stopka',   pl:'Stopka magazynka',      en:'Magazine floorplate' }
    ];

    /* --- KOLORY (pełna lista bez zmian) --- */
    const COLORS = { /* ... */ };
    Object.assign(COLORS,{ /* …Twoje dotychczasowe HEX-y… */ });

    /* --- DOM --- */
    const gunBox   = document.getElementById('gun-view-container');
    const partBox  = document.getElementById('part-selection-container');
    const palBox   = document.getElementById('color-palette');
    const resetBtn = document.getElementById('reset-button');
    const saveBtn  = document.getElementById('save-button');
    const PLbtn    = document.getElementById('lang-pl');
    const ENbtn    = document.getElementById('lang-gb');
    const H1       = document.getElementById('header-part-selection');
    const H2       = document.getElementById('header-color-selection');
    const sumTitle = document.getElementById('summary-title');
    const sumList  = document.getElementById('summary-list');
    const summaryContainer = document.getElementById('summary-container');      // ← NOWE

    /* --- STATE --- */
    let lang='pl', activePart=null;
    const selections={};

    /* ========== INIT ========== */
    (async function init(){
        await loadSvg();
        buildUI();
        defaultBlack();
        updateText();
        updateSummary();
        alignSummaryHeight();                                  // ← NOWE
        window.addEventListener('resize', alignSummaryHeight); // ← NOWE
    })();

    /* ===== SVG ===== */
    async function loadSvg(){
        const svgTxt=await fetch(SVG_FILE).then(r=>r.text());
        gunBox.innerHTML=svgTxt;
        const svg=gunBox.querySelector('svg');svg.classList.add('gun-svg');

        /* lufa w grupę */
        const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='lufa';
        [...svg.querySelectorAll('#lufa1,#lufa2')].forEach(p=>g.appendChild(p));
        svg.insertBefore(g,svg.firstChild);

        /* overlaye */
        const layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.id='color-overlays';svg.appendChild(layer);
        PARTS.forEach(p=>{
            const src=svg.querySelector('#'+p.id); if(!src) return;
            ['1','2'].forEach(n=>{
                const ov=src.cloneNode(true);ov.id=`color-overlay-${n}-${p.id}`;ov.classList.add('color-overlay');
                layer.appendChild(ov);
            });
        });
    }

    /* ===== UI ===== */
    function buildUI(){
        PARTS.forEach(p=>{
            const b=document.createElement('button');b.dataset.partId=p.id;
            b.onclick=()=>selectPart(b,p.id);partBox.appendChild(b);
        });
        const mix=document.createElement('button');mix.id='mix-button';mix.textContent='MIX';mix.onclick=randomize;partBox.appendChild(mix);

        resetBtn.onclick=resetAll;saveBtn.onclick=savePng;
        PLbtn.onclick=()=>setLang('pl');ENbtn.onclick=()=>setLang('en');
        buildPalette();
    }
    function selectPart(btn,id){
        partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');activePart=id;
    }

    /* ===== LANG ===== */
    function setLang(l){lang=l;updateText();updateSummary();}
    function updateText(){
        partBox.querySelectorAll('button').forEach(b=>{
            const p=PARTS.find(x=>x.id===b.dataset.partId);if(p) b.textContent=p[lang];
        });
        H1.textContent=lang==='pl'?'1. Wybierz część':'1. Select part';
        H2.textContent=lang==='pl'?'2. Wybierz kolor (Cerakote)':'2. Select color (Cerakote)';
        sumTitle.textContent=lang==='pl'?'Twoje zestawienie kolorów Cerakote':'Your Cerakote color summary';
        PLbtn.classList.toggle('active',lang==='pl');ENbtn.classList.toggle('active',lang==='en');
    }

    /* ===== PALETA ===== */
    function buildPalette(){
        palBox.innerHTML='';
        for(const [name,hex] of Object.entries(COLORS)){
            const w=document.createElement('div');w.className='color-swatch-wrapper';w.title=name;
            w.onclick=()=>applyColor(activePart,hex,name);
            const dot=document.createElement('div');dot.className='color-swatch';dot.style.backgroundColor=hex;
            const lbl=document.createElement('div');lbl.className='color-swatch-label';lbl.textContent=name;
            w.append(dot,lbl);palBox.appendChild(w);
        }
    }

    /* ===== COLORING ===== */
    function applyColor(pid,hex,name){
        if(!pid){alert(lang==='pl'?'Najpierw wybierz część!':'Select a part first!');return;}
        ['1','2'].forEach(n=>{
            const ov=document.getElementById(`color-overlay-${n}-${pid}`);
            const shapes=ov.tagName==='g'?ov.querySelectorAll('path,polygon,ellipse,circle,rect'):[ov];
            shapes.forEach(s=>s.style.fill=hex);
        });
        selections[pid]=name;updateSummary();
    }
    function defaultBlack(){
        const def='H-146 Graphite Black',hex=COLORS[def];
        PARTS.forEach(p=>{selections[p.id]=def;applyColor(p.id,hex,def);});
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
            const shapes=ov.tagName==='g'?ov.querySelectorAll('path,polygon,ellipse,circle,rect'):[ov];
            shapes.forEach(s=>s.style.fill='transparent');
        });
        Object.keys(selections).forEach(k=>delete selections[k]);
        partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
        activePart=null;updateSummary();
    }

    /* ===== SUMMARY ===== */
    function updateSummary(){
        sumList.innerHTML='';
        PARTS.forEach(p=>{
            const c=selections[p.id];if(!c) return;
            const d=document.createElement('div');d.textContent=`${p[lang]} – ${c}`;sumList.appendChild(d);
        });
    }

    /* ========== WYRÓWNANIE LISTY ========== */
    function alignSummaryHeight(){
        const pal = document.querySelector('.color-palette-container');
        if(pal && summaryContainer){
            summaryContainer.style.minHeight = pal.offsetHeight + 'px';
        }
    }

    /* ===== SAVE PNG ===== */
    async function savePng(){
        /* ... NIC NIE ZMIENIAMY W TWOJEJ FUNKCJI ... */
    }
});
