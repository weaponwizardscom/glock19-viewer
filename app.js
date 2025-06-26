/* ===== app.js ===== */
document.addEventListener('DOMContentLoaded', async () => {
    /* ---------- KONFIG ---------- */
    const SVG_FILE = 'g17.svg';
    const TEXTURE  = 'img/glock17.png';
    const BG_LIST  = Array.from({length:8}, (_,i)=>`img/t${i+1}.png`);

    const FONT_PX  = 24;
    const PANEL_W  = 380;
    const PAD      = 32;

    const GUN_SCALE = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--gun-scale')
    );

    /* ---------- DANE ---------- */
    const [PARTS, COLORS] = await Promise.all([
        fetch('./data/parts.json').then(r=>r.json()),
        fetch('./data/colors.json').then(r=>r.json())
    ]);

    /* ---------- DOM ---------- */
    const gunView = document.getElementById('gun-view');
    const partBox = document.getElementById('part-selection-container');
    const palBox  = document.getElementById('color-palette');
    const resetBtn= document.getElementById('reset-button');
    const saveBtn = document.getElementById('save-button');
    const bgBtn   = document.getElementById('bg-button');
    const PLbtn   = document.getElementById('lang-pl');
    const ENbtn   = document.getElementById('lang-gb');
    const H1      = document.getElementById('header-part-selection');
    const H2      = document.getElementById('header-color-selection');
    const sumList = document.getElementById('summary-list');

    /* ---------- STAN ---------- */
    let lang='pl', activePart=null, currentBg=null;
    const selections = {};

    /* ---------- INIT ---------- */
    await loadSvg();
    buildUI();
    defaultBlack();
    changeBackground();
    updateText();
    updateSummary();

    /* ========== FUNKCJE ========== */

    /* --- Ładowanie SVG --- */
    async function loadSvg(){
        const svgTxt = await fetch(SVG_FILE).then(r=>r.text());
        gunView.innerHTML = svgTxt;
        const svg = gunView.querySelector('svg'); svg.classList.add('gun-svg');

        const layer = document.createElementNS('http://www.w3.org/2000/svg','g');
        layer.id='color-overlays'; svg.appendChild(layer);

        PARTS.forEach(p=>{
            const src = svg.querySelector('#'+p.id); if(!src) return;
            ['1','2'].forEach(n=>{
                const ov = src.cloneNode(true);
                ov.id = `color-overlay-${n}-${p.id}`;
                ov.classList.add('color-overlay');
                layer.appendChild(ov);
            });
        });
    }

    /* --- Budowa UI --- */
    function buildUI(){
        PARTS.forEach(p=>{
            const btn=document.createElement('button');
            btn.dataset.partId=p.id;
            btn.onclick=()=>selectPart(btn,p.id);
            partBox.appendChild(btn);
        });
        const mix=document.createElement('button');
        mix.id='mix-button'; mix.textContent='MIX'; mix.onclick=randomize;
        partBox.appendChild(mix);

        resetBtn.onclick=resetAll;
        saveBtn .onclick=savePng;
        bgBtn   .onclick=changeBackground;
        PLbtn.onclick=()=>setLang('pl');
        ENbtn.onclick=()=>setLang('en');

        buildPalette();
    }
    const selectPart = (btn,id) =>{
        partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected'); activePart=id;
    };

    /* --- Język --- */
    const setLang = l => { lang=l; updateText(); updateSummary(); };
    function updateText(){
        partBox.querySelectorAll('button').forEach(b=>{
            const p=PARTS.find(x=>x.id===b.dataset.partId);
            if(p) b.textContent = p[lang];
        });
        H1.textContent = lang==='pl' ? '1. Wybierz część'           : '1. Select part';
        H2.textContent = lang==='pl' ? '2. Wybierz kolor (Cerakote)' : '2. Select color (Cerakote)';

        saveBtn.textContent  = lang==='pl' ? 'Zapisz Obraz'   : 'Save Image';
        resetBtn.textContent = lang==='pl' ? 'Resetuj Kolory' : 'Reset Colors';
        bgBtn.textContent    = lang==='pl' ? 'Zmień Tło'      : 'Change Background';

        PLbtn.classList.toggle('active', lang==='pl');
        ENbtn.classList.toggle('active', lang==='en');
    }

    /* --- Tło --- */
    function changeBackground(){
        let next;
        do{ next = BG_LIST[Math.floor(Math.random()*BG_LIST.length)]; }
        while(next === currentBg);
        currentBg = next;
        gunView.style.background = `url("${next}") center/auto no-repeat`;
    }

    /* --- Paleta kolorów --- */
    function buildPalette(){
        palBox.innerHTML='';
        for(const [name,hex] of Object.entries(COLORS)){
            const wrap=document.createElement('div'); wrap.className='color-swatch-wrapper'; wrap.title=name;
            wrap.onclick=()=>applyColor(activePart,hex,name);

            const dot=document.createElement('div'); dot.className='color-swatch'; dot.style.backgroundColor=hex;
            const lbl=document.createElement('div'); lbl.className='color-swatch-label'; lbl.textContent=name;

            wrap.append(dot,lbl);
            palBox.appendChild(wrap);
        }
    }

    /* --- Kolorowanie --- */
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
        const def='H-146 Graphite Black', hex=COLORS[def];
        PARTS.forEach(p=>{ selections[p.id]=def; applyColor(p.id,hex,def); });
    }

    /* --- Randomize --- */
    function randomize(){
        const keys=Object.keys(COLORS);
        PARTS.forEach(p=>{
            const pick = keys[Math.floor(Math.random()*keys.length)];
            applyColor(p.id, COLORS[pick], pick);
        });
    }

    /* --- Reset --- */
    function resetAll(){
        document.querySelectorAll('.color-overlay').forEach(ov=>{
            const arr = ov.tagName==='g'
                ? ov.querySelectorAll('path,polygon,ellipse,circle,rect')
                : [ov];
            arr.forEach(el=>{
                el.style.fill='transparent';
                el.style.stroke='transparent';
            });
        });
        Object.keys(selections).forEach(k=>delete selections[k]);
        partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
        activePart=null; updateSummary();
    }

    /* --- Summary helper --- */
    function codeOnly(full){ return full.split(' ')[0]; }

    /* --- Summary --- */
    function updateSummary(){
        sumList.innerHTML='';
        PARTS.forEach(p=>{
            const full = selections[p.id];
            if(!full) return;
            const div = document.createElement('div');
            div.textContent = `${p[lang]} – ${codeOnly(full)}`;
            sumList.appendChild(div);
        });
    }

    /* --- Save PNG --- */
    async function savePng(){
        const svg=document.querySelector('.gun-svg'); if(!svg) return;

        /* Panel text */
        const lines = PARTS
            .map(p=> selections[p.id] ? `${p[lang]} – ${codeOnly(selections[p.id])}` : null)
            .filter(Boolean);

        /* Canvas size */
        const scale=2, box=svg.getBBox();
        const pistolW = box.width  * scale * GUN_SCALE;
        const pistolH = box.height * scale * GUN_SCALE;

        const BG_W = 1600, BG_H = 1200;        // real background dims
        const canvas = Object.assign(document.createElement('canvas'), {width: BG_W+PANEL_W, height: BG_H});
        const ctx = canvas.getContext('2d');

        /* 1) Background */
        if(currentBg){
            const bgImg = await loadImg(currentBg);
            ctx.drawImage(bgImg, 0, 0, BG_W, BG_H);
        } else {
            ctx.fillStyle='#000'; ctx.fillRect(0,0,BG_W,BG_H);
        }

        /* Center offsets */
        const offX = (BG_W - pistolW)/2;
        const offY = (BG_H - pistolH)/2;

        /* 2) Pistol texture */
        const base = await loadImg(TEXTURE);
        ctx.drawImage(base, offX, offY, pistolW, pistolH);

        /* 3) Color overlays */
        await Promise.all(
            [...svg.querySelectorAll('.color-overlay')]
            .filter(o=>o.style.fill && o.style.fill!=='transparent')
            .map(ov=>{
                const tmp=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute('viewBox')}">
                              <g style="mix-blend-mode:hard-light;opacity:.45;">${ov.outerHTML}</g></svg>`;
                const url=URL.createObjectURL(new Blob([tmp],{type:'image/svg+xml'}));
                return loadImg(url).then(img=>{
                    ctx.drawImage(img, offX, offY, pistolW, pistolH);
                    URL.revokeObjectURL(url);
                });
            })
        );

        /* 4) Panel */
        const x0 = BG_W;
        ctx.fillStyle='#000c'; ctx.fillRect(x0,0,PANEL_W,BG_H);
        ctx.fillStyle='#fff'; ctx.font=`${FONT_PX}px sans-serif`;
        lines.forEach((t,i)=> ctx.fillText(t, x0+PAD, PAD+FONT_PX*i*1.4));

        /* 5) Download */
        const a=document.createElement('a');
        a.href=canvas.toDataURL('image/png');
        a.download='weapon-wizards-projekt.png';
        a.style.display='none';
        document.body.appendChild(a); a.click();
        setTimeout(()=>document.body.removeChild(a),1000);

        /* helper */
        function loadImg(src){ return new Promise(res=>{const i=new Image(); i.src=src; i.onload=()=>res(i);}); }
    }
});
