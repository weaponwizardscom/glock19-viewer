/* ====== app.js ====== */
document.addEventListener('DOMContentLoaded', () => {
    /* ------- USTAWIENIA ------- */
    const SVG_FILE  = 'g17.svg';
    const TEXTURE   = 'img/glock17.png';
    const PANEL_W   = 380;      // szerokość panelu tekstowego w PNG
    const FONT_PX   = 24;       // wielkość czcionki w PNG
    const PAD       = 32;       // padding w panelu

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

    /* --- paleta Cerakote (identycznie jak wcześniej) --- */
    const COLORS = { /* …pełna lista… */ };
    /* (dla czytelności skrócona – kopiujesz tę samą listę, którą już miałeś) */

    /* ------- DOM ------- */
    const gunBox  = document.getElementById('gun-view-container');
    const partBox = document.getElementById('part-selection-container');
    const palBox  = document.getElementById('color-palette');
    const resetBtn= document.getElementById('reset-button');
    const saveBtn = document.getElementById('save-button');
    const sumList = document.getElementById('summary-list');
    const sumTitle= document.getElementById('summary-title');
    const PLbtn   = document.getElementById('lang-pl');
    const ENbtn   = document.getElementById('lang-gb');
    const H1      = document.getElementById('header-part-selection');
    const H2      = document.getElementById('header-color-selection');

    /* ------- STATE ------- */
    let lang='pl', activePart=null;
    const selections={};

    /* ===== INIT ===== */
    (async () => {
        await loadSvg();
        buildUI();
        setDefault();
        refreshText();
        refreshSummary();
    })();

    /* ===== SVG LOAD ===== */
    async function loadSvg(){
        const svgText = await (await fetch(SVG_FILE)).text();
        gunBox.innerHTML = svgText;
        const svg = gunBox.querySelector('svg');svg.classList.add('gun-svg');

        /* grupujemy lufę */
        const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='lufa';
        [...svg.querySelectorAll('#lufa1,#lufa2')].forEach(p=>g.appendChild(p));
        svg.insertBefore(g,svg.firstChild);

        /* nakładki kolorów */
        const layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.id='color-overlays';svg.appendChild(layer);
        PARTS.forEach(p=>{
            const src=svg.querySelector('#'+p.id); if(!src){console.warn('Brak ID w SVG:',p.id);return;}
            ['1','2'].forEach(n=>{
                const ov=src.cloneNode(true);ov.id=`color-overlay-${n}-${p.id}`;ov.classList.add('color-overlay');
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
        mix.id='mix-button';mix.textContent='MIX';mix.onclick=randomize;partBox.appendChild(mix);

        resetBtn.onclick=resetAll;saveBtn.onclick=savePNG;
        PLbtn.onclick=()=>setLang('pl');ENbtn.onclick=()=>setLang('en');
        buildPalette();
    }

    function selectPart(btn,id){
        partBox.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');activePart=id;
    }

    /* ===== LANG ===== */
    function setLang(l){lang=l;refreshText();refreshSummary();}
    function refreshText(){
        partBox.querySelectorAll('button').forEach(b=>{
            const p=PARTS.find(x=>x.id===b.dataset.partId);
            if(p) b.textContent=p[lang];
        });
        H1.textContent=lang==='pl'?'1. Wybierz część':'1. Select part';
        H2.textContent=lang==='pl'?'2. Wybierz kolor (Cerakote)':'2. Select color (Cerakote)';
        sumTitle.textContent=lang==='pl'
            ?'Twoje zestawienie kolorów Cerakote'
            :'Your Cerakote color summary';
        PLbtn.classList.toggle('active',lang==='pl');ENbtn.classList.toggle('active',lang==='en');
    }

    /* ===== PALETTE ===== */
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

    /* ===== COLORING ===== */
    function applyColor(pid,hex,name){
        if(!pid){alert(lang==='pl'?'Najpierw wybierz część!':'Select a part first!');return;}
        ['1','2'].forEach(n=>{
            const ov=document.getElementById(`color-overlay-${n}-${pid}`);
            const shapes=ov.tagName==='g'?ov.querySelectorAll('path,polygon,ellipse,circle,rect'):[ov];
            shapes.forEach(s=>s.style.fill=hex);
        });
        selections[pid]=name;refreshSummary();
    }

    function setDefault(){
        const def='H-146 Graphite Black', hex=COLORS[def];
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
        activePart=null;refreshSummary();
    }

    /* ===== SUMMARY ===== */
    function refreshSummary(){
        sumList.innerHTML='';
        PARTS.forEach(p=>{
            const c=selections[p.id];if(!c) return;
            const d=document.createElement('div');d.textContent=`${p[lang]} – ${c}`;sumList.appendChild(d);
        });
    }

    /* ===== SAVE PNG ===== */
    async function savePNG(){
        const svg=document.querySelector('.gun-svg');if(!svg) return;

        const lines=PARTS.map(p=>selections[p.id]?`${p[lang]} – ${selections[p.id]}`:null).filter(Boolean);

        const scale=2;
        const box=svg.getBBox();
        const W=box.width*scale + PANEL_W;
        const H=box.height*scale;

        const canvas=Object.assign(document.createElement('canvas'),{width:W,height:H});
        const ctx=canvas.getContext('2d');

        /* tło */
        const base=new Image();base.src=TEXTURE;base.onload=drawAll;base.onerror=()=>alert('Błąd tekstury');

        async function drawAll(){
            ctx.drawImage(base,0,0,box.width*scale,H);

            /* nakładki kolorów */
            await Promise.all(
                [...svg.querySelectorAll('.color-overlay')]
                    .filter(ov=>ov.style.fill && ov.style.fill!=='transparent')
                    .map(ov=>{
                        const tmp=`<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"${svg.getAttribute('viewBox')}\"><g style=\"mix-blend-mode:hard-light;opacity:.45;\">${ov.outerHTML}</g></svg>`;
                        const url=URL.createObjectURL(new Blob([tmp],{type:'image/svg+xml'}));
                        return new Promise(res=>{
                            const img=new Image();
                            img.onload=()=>{ctx.drawImage(img,0,0,box.width*scale,H);URL.revokeObjectURL(url);res();};
                            img.src=url;
                        });
                    })
            );

            /* panel tekstowy */
            const x0=box.width*scale;
            ctx.fillStyle='rgba(0,0,0,0.85)';
            ctx.fillRect(x0,0,PANEL_W,H);

            ctx.fillStyle='#fff';
            ctx.font=`${FONT_PX}px sans-serif`;
            lines.forEach((t,i)=>ctx.fillText(t,x0+PAD,PAD+i*FONT_PX*1.6));

            const a=document.createElement('a');
            a.href=canvas.toDataURL('image/png');a.download='weapon-wizards-projekt.png';a.click();
        }
    }
});
