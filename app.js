/* ===== app.js ===== */
document.addEventListener('DOMContentLoaded', async () => {
    /* ---------- CONFIG ---------- */
    const SVG_FILE = 'g17.svg';
    const TEXTURE  = 'img/glock17.png';
    const BG_LIST  = Array.from({length:8}, (_,i)=>`img/t${i+1}.png`);
    const FONT_PX  = 24, PANEL_W = 380, PAD = 32;
    const GUN_SCALE = parseFloat(getComputedStyle(document.documentElement)
                                 .getPropertyValue('--gun-scale'));

    /* ---------- DATA ---------- */
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

    /* ---------- STATE ---------- */
    let lang='pl', activePart=null, currentBg=null;
    const selections = {};

    /* ---------- INIT ---------- */
    await loadSvg();
    buildUI();
    defaultBlack();
    changeBackground();
    updateText();
    updateSummary();

    /* ===== SVG ===== */
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

    /* ===== UI ===== */
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

    /* ===== LANGUAGE ===== */
    const setLang = l => { lang=l; updateText(); updateSummary(); };
    function updateText(){
        partBox.querySelectorAll('button').forEach(b=>{
            const p=PARTS.find(x=>x.id===b.dataset.partId); if(p) b.textContent=p[lang];
        });
        H1.textContent = lang==='pl' ? '1. Wybierz część'          : '1. Select part';
        H2.textContent = lang==='pl' ? '2. Wybierz kolor (Cerakote)': '2. Select color (Cerakote)';

        saveBtn.textContent  = lang==='pl' ? 'Zapisz Obraz'    : 'Save Image';
        resetBtn.textContent = lang==='pl' ? 'Resetuj Kolory'  : 'Reset Colors';
        bgBtn.textContent    = lang==='pl' ? 'Zmień Tło'       : 'Change Background';

        PLbtn.classList.toggle('active', lang==='pl');
        ENbtn.classList.toggle('active', lang==='en');
    }

    /* ===== BACKGROUND ===== */
    function changeBackground(){
        let next;
        do{ next = BG_LIST[Math.floor(Math.random()*BG_LIST.length)]; }
        while(next === currentBg);
        currentBg = next;
        gunView.style.background = `url("${next}") center/80% no-repeat`;
    }

    /* ===== PALETTE ===== */
    function buildPalette(){
        palBox.innerHTML='';
        for(const [name,hex] of Object.entries(COLORS)){
            const w=document.createElement('div'); w.className='color-swatch-wrapper'; w.title=name;
            w.onclick=()=>applyColor(activePart,hex,name);

            const d=document.createElement('div'); d.className='color-swatch'; d.style.backgroundColor=hex;
            const l=document.createElement('div'); l.className='color-swatch-label'; l.textContent=name;

            w.append(d,l); palBox.appendChild(w);
        }
    }

    /* ===== COLORING ===== */
    function applyColor(pid,hex,name){
        if(!pid){ alert(lang==='pl'?'Najpierw wybierz część!':'Select a part first!'); return; }
        ['1','2'].forEach(n=>{
            const ov=document.getElementById(`color-overlay-${n}-${pid}`);
            const shapes=ov.tagName==='g'?ov.querySelectorAll('path,polygon,ellipse,circle,rect'):[ov];
            shapes.forEach(s=>{s.style.fill=hex; s.style.stroke=hex;});
        });
        selections[pid]=name; updateSummary();
    }
    function defaultBlack(){
        const def='H-146 Graphite Black', hex=COLORS[def];
        PARTS.forEach(p=>{ selections[p.id]=def; applyColor(p.id,hex,def); });
    }

    /* ===== RANDOMIZE ===== */
    function randomize(){
        const keys=Object.keys(COLORS);
        PARTS.forEach(p=>{
            const pick=keys[Math.floor(Math.random()*keys.length)];
            applyColor(p.id, COLORS[pick], pick);
        });
    }

    /* ===== RESET ===== */
    function resetAll(){
        document.querySelectorAll('.color-overlay').forEach(ov=>{
            const arr = ov.tagName==='g' ? ov.querySelectorAll('path,polygon,ellipse,circle,rect') : [ov];
            arr.forEach(el=>{ el.style.fill='transparent'; el.style.stroke='transparent'; });
        });
        Object.keys(selections).forEach(k=>delete selections[k]);
        partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
        activePart=null; updateSummary();
    }

    /* ===== SUMMARY ===== */
    function codeOnly(full){ return full.split(' ')[0]; }
    function updateSummary(){
        sumList.innerHTML='';
        PARTS.forEach(p=>{
            const full=selections[p.id]; if(!full) return;
            const div=document.createElement('div');
            div.textContent = `${p[lang]} – ${codeOnly(full)}`;
            sumList.appendChild(div);
        });
    }

    /* ===== SAVE PNG ===== */
    async function savePng(){
        const svg=document.querySelector('.gun-svg'); if(!svg) return;

        /* tekst panelu */
        const lines = PARTS
            .map(p=> selections[p.id] ? `${p[lang]} – ${codeOnly(selections[p.id])}` : null)
            .filter(Boolean);

        /* canvas */
        const scale=2, box=svg.getBBox();
        const W = box.width*scale + PANEL_W;
        const H = box.height*scale;
        const canvas = Object.assign(document.createElement('canvas'), {width:W, height:H});
        const ctx = canvas.getContext('2d');

        /* tło */
        if(currentBg){
            await new Promise(res=>{
                const img=new Image();
                img.src=currentBg;
                img.onload=()=>{ ctx.drawImage(img,0,0,W,H); res(); };
            });
        } else { ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H); }

        /* tekstura pistoletu (z skalą) */
        await new Promise(res=>{
            const base=new Image();
            base.src=TEXTURE;
            base.onload=()=>{ ctx.drawImage(base,0,0,box.width*scale*GUN_SCALE,box.height*scale*GUN_SCALE); res(); };
        });

        /* kolorowe nakładki */
        await Promise.all(
            [...svg.querySelectorAll('.color-overlay')]
            .filter(ov=>ov.style.fill && ov.style.fill!=='transparent')
            .map(ov=>{
                const tmp=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute('viewBox')}">
                              <g style="mix-blend-mode:hard-light;opacity:.45;">${ov.outerHTML}</g></svg>`;
                const url=URL.createObjectURL(new Blob([tmp],{type:'image/svg+xml'}));
                return new Promise(res=>{
                    const img=new Image();
                    img.onload=()=>{ ctx.drawImage(img,0,0,box.width*scale*GUN_SCALE,box.height*scale*GUN_SCALE);
                                     URL.revokeObjectURL(url); res(); };
                    img.src=url;
                });
            })
        );

        /* panel kodów */
        const x0=box.width*scale*GUN_SCALE;
        ctx.fillStyle='#000c'; ctx.fillRect(x0,0,PANEL_W,H);
        ctx.fillStyle='#fff'; ctx.font=`${FONT_PX}px sans-serif`;
        lines.forEach((t,i)=> ctx.fillText(t, x0+PAD, PAD+FONT_PX*i*1.4));

        /* download */
        const a=document.createElement('a');
        a.href=canvas.toDataURL('image/png');
        a.download='weapon-wizards-projekt.png';
        a.style.display='none'; document.body.appendChild(a);
        a.click(); setTimeout(()=>document.body.removeChild(a),1000);
    }
});
