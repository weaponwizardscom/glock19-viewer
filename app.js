/* ===== app.js (module) ===== */
document.addEventListener('DOMContentLoaded', async () => {
    const SVG_FILE='g17.svg', TEXTURE='img/glock17.png';
    const FONT_PX=24, PANEL_W=380, PAD=32;

    /* >>> NOWE: lista teł <<< */
    const BACKGROUNDS = Array.from({length:8},(_,i)=>`img/t${i+1}.png`);
    let currentBg = null;

    const [PARTS, COLORS] = await Promise.all([
        fetch('./data/parts.json').then(r=>r.json()),
        fetch('./data/colors.json').then(r=>r.json())
    ]);

    /* --- DOM --- */
    const gunView  = document.getElementById('gun-view');
    const partBox  = document.getElementById('part-selection-container');
    const palBox   = document.getElementById('color-palette');
    const resetBtn = document.getElementById('reset-button');
    const saveBtn  = document.getElementById('save-button');
    const bgBtn    = document.getElementById('bg-button');     /* NOWY */
    const PLbtn    = document.getElementById('lang-pl');
    const ENbtn    = document.getElementById('lang-gb');
    const H1       = document.getElementById('header-part-selection');
    const H2       = document.getElementById('header-color-selection');
    const sumList  = document.getElementById('summary-list');

    let lang='pl', activePart=null;
    const selections={};

    await loadSvg();
    buildUI();
    defaultBlack();
    updateText();
    updateSummary();
    changeBackground();                  /* ustaw domyślne losowe tło */

    /* ===== SVG ===== (bez zmian) */
    async function loadSvg(){
        const gunBox=document.getElementById('gun-view');
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

    /* ===== UI ===== */
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
        saveBtn .onclick=savePng;
        bgBtn   .onclick=changeBackground;           /* NOWE */

        PLbtn.onclick=()=>setLang('pl');
        ENbtn.onclick=()=>setLang('en');

        buildPalette();
    }
    function selectPart(btn,id){
        partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected'); activePart=id;
    }

    /* ===== LANGUAGE ===== */
    function setLang(l){ lang=l; updateText(); updateSummary(); }
    function updateText(){
        partBox.querySelectorAll('button').forEach(b=>{
            const p=PARTS.find(x=>x.id===b.dataset.partId);
            if(p) b.textContent=p[lang];
        });
        H1.textContent=lang==='pl'?'1. Wybierz część':'1. Select part';
        H2.textContent=lang==='pl'?'2. Wybierz kolor (Cerakote)':'2. Select color (Cerakote)';

        saveBtn.textContent = lang==='pl' ? 'Zapisz Obraz'   : 'Save Image';
        resetBtn.textContent= lang==='pl' ? 'Resetuj Kolory' : 'Reset Colors';
        bgBtn.textContent   = lang==='pl' ? 'Zmień Tło'      : 'Change Background';

        PLbtn.classList.toggle('active',lang==='pl');
        ENbtn.classList.toggle('active',lang==='en');
    }

    /* ===== BACKGROUND ===== */
    function changeBackground(){
        let next;
        do{ next = BACKGROUNDS[Math.floor(Math.random()*BACKGROUNDS.length)]; }
        while(next===currentBg);        // unikaj powtórzeń
        currentBg=next;
        gunView.style.background = `url("${next}") center/cover no-repeat`;
    }

    /* ===== PALETTE / COLORING / SUMMARY / SAVE PNG ===== */
    /* ... (cała dalsza logika bez zmian – identyczna jak w Twojej działającej wersji) ... */
});
