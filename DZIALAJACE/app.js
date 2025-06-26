/* ====== app.js ====== */
document.addEventListener('DOMContentLoaded', () => {
    /* --- CONFIG --- */
    const SVG_FILE = 'g17.svg';
    const TEXTURE  = 'img/glock17.png';
    const FONT_SIZE_PX = 24;         // rozmiar tekstu na PNG
    const PANEL_W   = 380;           // szerokość panelu tekstowego na PNG
    const PADDING   = 32;            // margines w panelu tekstowym

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

    /* --- Kolory (jak poprzednio) --- */
    const COLORS = { /* skrócona lista – bez zmian od poprzedniej wersji */ };
    Object.assign(COLORS,{
        "H-140 Bright White":"#FFFFFF","H-242 Hidden White":"#E5E4E2","H-136 Snow White":"#F5F5F5",
        "H-297 Stormtrooper White":"#F2F2F2","H-300 Armor Clear":"#F5F5F5","H-331 Parakeet Green":"#C2D94B",
        "H-141 Prison Pink":"#E55C9C","H-306 Springfield Grey":"#A2A4A6","H-312 Frost":"#C9C8C6",
        "H-214 S&W Grey":"#8D918D","H-265 Cold War Grey":"#999B9E","H-227 Tactical Grey":"#8D8A82",
        "H-170 Titanium":"#7A7A7A","H-130 Combat Grey":"#6A6A6A","H-237 Tungsten":"#6E7176",
        "H-210 Sig Dark Grey":"#5B5E5E","H-234 Sniper Grey":"#5B6063","H-342 Smoke":"#84888B",
        "H-321 Blush":"#D8C0C4","H-213 Battleship Grey":"#52595D","H-146 Graphite Black":"#3B3B3B",
        "H-190 Armor Black":"#212121","H-142 Light Sand":"#D2C3A8","H-199 Desert Sand":"#C5BBAA",
        "H-267 Magpul FDE":"#A48F6A","H-269 Barrett Brown":"#67594D","H-148 Burnt Bronze":"#8C6A48",
        "H-339 Federal Brown":"#5E5044","H-8000 RAL 8000":"#937750","H-33446 FS Sabre Sand":"#B19672",
        "H-240 Mil Spec O.D. Green":"#5F604F","H-247 Desert Sage":"#6A6B5C","H-229 Sniper Green":"#565A4B",
        "H-344 Olive":"#6B6543","H-189 Noveske Bazooka Green":"#6C6B4E","H-353 Island Green":"#00887A",
        "H-127 Kel-Tec Navy Blue":"#2B3C4B","H-171 NRA Blue":"#00387B","H-188 Magpul Stealth Grey":"#5C6670",
        "H-256 Cobalt":"#395173","H-258 Socom Blue":"#3B4B5A","H-329 Blue Raspberry":"#0077C0",
        "H-362 Patriot Blue":"#33415C","H-197 Wild Purple":"#5A3A54","H-217 Bright Purple":"#8A2BE2",
        "H-332 Purplexed":"#6C4E7C","H-357 Periwinkle":"#6B6EA6","H-128 Hunter Orange":"#F26522",
        "H-167 USMC Red":"#9E2B2F","H-216 S&W Red":"#B70101","H-221 Crimson":"#891F2B",
        "H-317 Sunflower":"#F9A602","H-354 Lemon Zest":"#F7D51D","H-122 Gold":"#B79436",
        "H-151 Satin Aluminum":"#C0C0C0"
    });

    /* --- DOM --- */
    const gunBox = document.getElementById('gun-view-container');
    const partBox= document.getElementById('part-selection-container');
    const palBox = document.getElementById('color-palette');
    const resetBtn=document.getElementById('reset-button');
    const saveBtn =document.getElementById('save-button');
    const PLbtn=document.getElementById('lang-pl');
    const ENbtn=document.getElementById('lang-gb');
    const H1=document.getElementById('header-part-selection');
    const H2=document.getElementById('header-color-selection');
    const sumTitle=document.getElementById('summary-title');
    const sumList =document.getElementById('summary-list');

    /* --- state --- */
    let lang='pl', activePart=null;
    const selections={}; // {partId:colorName}

    /* ========== INIT ========== */
    (async function init(){
        await loadSvg();
        buildUI();
        defaultBlack();
        updateText();updateSummary();
    })();

    /* ===== SVG ===== */
    async function loadSvg(){
        const svgTxt=await fetch(SVG_FILE).then(r=>r.text());
        gunBox.innerHTML=svgTxt;
        const svg=gunBox.querySelector('svg');svg.classList.add('gun-svg');

        /* group lufa */
        const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='lufa';
        [...svg.querySelectorAll('#lufa1,#lufa2')].forEach(p=>g.appendChild(p));
        svg.insertBefore(g,svg.firstChild);

        /* overlays */
        const layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.id='color-overlays';svg.appendChild(layer);
        PARTS.forEach(p=>{
            const src=svg.querySelector('#'+p.id); if(!src) return;
            ['1','2'].forEach(n=>{
                const ov=src.cloneNode(true);ov.id=`color-overlay-${n}-${p.id}`;ov.classList.add('color-overlay');layer.appendChild(ov);
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

    /* ===== LANGUAGE ===== */
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

    /* ===== PALETTE ===== */
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
            const shapes = ov.tagName==='g' ? ov.querySelectorAll('path,polygon,ellipse,circle,rect') : [ov];
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
            const div=document.createElement('div');div.textContent=`${p[lang]} – ${c}`;sumList.appendChild(div);
        });
    }

    /* ===== SAVE PNG ===== */
    async function savePng(){
        const svg=document.querySelector('.gun-svg');if(!svg) return;

        /* przygotuj listę tekstową */
        const lines=PARTS.map(p=>selections[p.id]?`${p[lang]} – ${selections[p.id]}`:null).filter(Boolean);

        /* utwórz canvas szerszy o panel tekstowy */
        const scale=2;
        const box=svg.getBBox();
        const W=box.width*scale + PANEL_W;
        const H=box.height*scale;

        const canvas=Object.assign(document.createElement('canvas'),{width:W,height:H});
        const ctx=canvas.getContext('2d');

        /* tło (tekstura) */
        const base=new Image();base.src=TEXTURE;base.onload=drawAll;base.onerror=()=>alert('Błąd tekstury');

        async function drawAll(){
            ctx.drawImage(base,0,0,box.width*scale,H);

            /* kolorowe nakładki */
            await Promise.all([...svg.querySelectorAll('.color-overlay')]
                .filter(ov=>ov.style.fill && ov.style.fill!=='transparent')
                .map(ov=>{
                    const tmp=`<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"${svg.getAttribute('viewBox')}\"><g style=\"mix-blend-mode:hard-light;opacity:.45;\">${ov.outerHTML}</g></svg>`;
                    const url=URL.createObjectURL(new Blob([tmp],{type:'image/svg+xml'}));
                    return new Promise(res=>{
                        const img=new Image();
                        img.onload=()=>{ctx.drawImage(img,0,0,box.width*scale,H);URL.revokeObjectURL(url);res();};
                        img.src=url;
                    });
                }));

            /* panel tekstowy po prawej */
            const x0=box.width*scale;
            ctx.fillStyle='rgba(0,0,0,0.8)';
            ctx.fillRect(x0,0,PANEL_W,H);

            ctx.fillStyle='#FFFFFF';
            ctx.font=`${FONT_SIZE_PX}px sans-serif`;
            lines.forEach((t,i)=>ctx.fillText(t,x0+PADDING,PADDING+FONT_SIZE_PX*i*1.4));

            const a=document.createElement('a');
            a.href=canvas.toDataURL('image/png');a.download='weapon-wizards-projekt.png';a.click();
        }
    }
});
