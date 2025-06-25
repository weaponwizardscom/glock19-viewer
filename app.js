/* ====== app.js ====== */
document.addEventListener('DOMContentLoaded', () => {
    /* ---------- KONFIGURACJA ---------- */
    const SVG_FILE_PATH         = 'g17.svg';
    const MAIN_TEXTURE_FILE_PATH = 'img/glock17.png';

    const PARTS_TO_CONFIGURE = [
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

    /* ---------- PALETA CERAKOTE H-SERIES ---------- */
    const CERAKOTE_COLORS = {
        /* === BIAŁE I JASNE === */
        "H-140 Bright White":            "#FFFFFF",
        "H-242 Hidden White":            "#E5E4E2",
        "H-136 Snow White":              "#F5F5F5",
        "H-297 Stormtrooper White":      "#F2F2F2",
        "H-300 Armor Clear":             "#F5F5F5",
        "H-331 Parakeet Green":          "#C2D94B",
        "H-141 Prison Pink":             "#E55C9C",

        /* === SZARE === */
        "H-306 Springfield Grey":        "#A2A4A6",
        "H-312 Frost":                   "#C9C8C6",
        "H-214 S&W Grey":                "#8D918D",
        "H-265 Cold War Grey":           "#999B9E",
        "H-227 Tactical Grey":           "#8D8A82",
        "H-170 Titanium":                "#7A7A7A",
        "H-130 Combat Grey":             "#6A6A6A",
        "H-237 Tungsten":                "#6E7176",
        "H-210 Sig Dark Grey":           "#5B5E5E",
        "H-234 Sniper Grey":             "#5B6063",
        "H-342 Smoke":                   "#84888B",
        "H-321 Blush":                   "#D8C0C4",
        "H-213 Battleship Grey":         "#52595D",

        /* === CZARNE === */
        "H-146 Graphite Black":          "#3B3B3B",
        "H-190 Armor Black":             "#212121",

        /* === BRĄZY / BEŻE === */
        "H-142 Light Sand":              "#D2C3A8",
        "H-199 Desert Sand":             "#C5BBAA",
        "H-267 Magpul FDE":              "#A48F6A",
        "H-269 Barrett Brown":           "#67594D",
        "H-148 Burnt Bronze":            "#8C6A48",
        "H-339 Federal Brown":           "#5E5044",
        "H-8000 RAL 8000":               "#937750",
        "H-33446 FS Sabre Sand":         "#B19672",

        /* === ZIELONE === */
        "H-240 Mil Spec O.D. Green":     "#5F604F",
        "H-247 Desert Sage":             "#6A6B5C",
        "H-229 Sniper Green":            "#565A4B",
        "H-344 Olive":                   "#6B6543",
        "H-189 Noveske Bazooka Green":   "#6C6B4E",
        "H-353 Island Green":            "#00887A",

        /* === NIEBIESKIE === */
        "H-127 Kel-Tec Navy Blue":       "#2B3C4B",
        "H-171 NRA Blue":                "#00387B",
        "H-188 Magpul Stealth Grey":     "#5C6670",
        "H-256 Cobalt":                  "#395173",
        "H-258 Socom Blue":              "#3B4B5A",
        "H-329 Blue Raspberry":          "#0077C0",
        "H-362 Patriot Blue":            "#33415C",

        /* === FIOLET / RÓŻ === */
        "H-197 Wild Purple":             "#5A3A54",
        "H-217 Bright Purple":           "#8A2BE2",
        "H-332 Purplexed":               "#6C4E7C",
        "H-357 Periwinkle":              "#6B6EA6",

        /* === POMARAŃCZ / CZERWIEŃ / ŻÓŁĆ === */
        "H-128 Hunter Orange":           "#F26522",
        "H-167 USMC Red":                "#9E2B2F",
        "H-216 S&W Red":                 "#B70101",
        "H-221 Crimson":                 "#891F2B",
        "H-317 Sunflower":               "#F9A602",
        "H-354 Lemon Zest":              "#F7D51D",

        /* === METALICZNE === */
        "H-122 Gold":                    "#B79436",
        "H-151 Satin Aluminum":          "#C0C0C0"
    };

    /* ---------- ELEMENTY DOM ---------- */
    const gunViewContainer       = document.getElementById('gun-view-container');
    const partSelectionContainer = document.getElementById('part-selection-container');
    const paletteContainer       = document.getElementById('color-palette');
    const resetButton            = document.getElementById('reset-button');
    const saveButton             = document.getElementById('save-button');
    const summaryContainer       = document.getElementById('summary-container');
    const langPl                 = document.getElementById('lang-pl');
    const langGb                 = document.getElementById('lang-gb');
    const headerPartSelection    = document.getElementById('header-part-selection');
    const headerColorSelection   = document.getElementById('header-color-selection');

    /* ---------- STAN ---------- */
    let currentLang        = 'pl';
    let selectedPartButton = null;
    let activePartId       = null;
    const selectedColors   = {}; // { partId: "H-146 Graphite Black" }

    /* ============================================================= */
    /* ===================  INICJALIZACJA  ========================== */
    /* ============================================================= */
    init();

    async function init() {
        await loadSvg();
        buildUI();
        resetAllColors();
        createColorPalette();
        setDefaultColor();
        updateUIText();
        updateSummary();
    }

    /* ---------- Wczytanie i przygotowanie SVG ---------- */
    async function loadSvg() {
        const resp = await fetch(SVG_FILE_PATH);
        if (!resp.ok) throw new Error('Nie można wczytać ' + SVG_FILE_PATH);
        const svgText = await resp.text();
        gunViewContainer.innerHTML = svgText;

        const svg = gunViewContainer.querySelector('svg');
        svg.classList.add('gun-svg');

        /* grupujemy lufę (id lufa1, lufa2) w jeden <g id="lufa"> */
        const lufaGroup = document.createElementNS('http://www.w3.org/2000/svg','g');
        lufaGroup.id = 'lufa';
        [...svg.querySelectorAll('#lufa1, #lufa2')].forEach(p => lufaGroup.appendChild(p));
        svg.insertBefore(lufaGroup, svg.firstChild);

        /* warstwa overlayów kolorystycznych */
        const colorLayerGroup = document.createElementNS('http://www.w3.org/2000/svg','g');
        colorLayerGroup.id = 'color-overlays';
        svg.appendChild(colorLayerGroup);

        PARTS_TO_CONFIGURE.forEach(part=>{
            const source = svg.querySelector('#'+part.id);
            if(!source){console.warn('Brak w SVG: '+part.id);return;}

            ['1','2'].forEach(layer=>{
                const ov = source.cloneNode(true);
                ov.id = `color-overlay-${layer}-${part.id}`;
                ov.classList.add('color-overlay');
                colorLayerGroup.appendChild(ov);
            });
        });
    }

    /* ---------- Budujemy przyciski części ---------- */
    function buildUI() {
        PARTS_TO_CONFIGURE.forEach(part=>{
            const btn = document.createElement('button');
            btn.dataset.partId = part.id;
            btn.onclick = ()=>selectPart(btn, part.id);
            partSelectionContainer.appendChild(btn);
        });

        /* przycisk MIX */
        const mixBtn=document.createElement('button');
        mixBtn.id='mix-button';mixBtn.textContent='MIX';
        mixBtn.onclick = applyRandomColors;
        partSelectionContainer.appendChild(mixBtn);

        /* reszta przycisków */
        resetButton.onclick = resetAllColors;
        saveButton  .onclick = saveAsPng;
        langPl     .onclick = ()=>switchLang('pl');
        langGb     .onclick = ()=>switchLang('en');
    }

    /* ============================================================= */
    /* =====================  FUNKCJE UI  =========================== */
    /* ============================================================= */
    function selectPart(btn, partId){
        if(selectedPartButton) selectedPartButton.classList.remove('selected');
        btn.classList.add('selected');
        selectedPartButton = btn;
        activePartId = partId;
    }

    function switchLang(lang){
        currentLang = lang;
        updateUIText();
        updateSummary(); // odśwież nazwy części w podsumowaniu
    }

    function updateUIText(){
        /* etykiety przycisków części */
        partSelectionContainer.querySelectorAll('button').forEach(b=>{
            const part = PARTS_TO_CONFIGURE.find(p=>p.id===b.dataset.partId);
            if(part) b.textContent = part[currentLang];
        });

        headerPartSelection.textContent = currentLang==='pl' ? '1. Wybierz część':'1. Select part';
        headerColorSelection.textContent= currentLang==='pl' ? '2. Wybierz kolor (Cerakote)':'2. Select color (Cerakote)';
        langPl.classList.toggle('active',currentLang==='pl');
        langGb.classList.toggle('active',currentLang==='en');
    }

    /* ---------- PALETA ---------- */
    function createColorPalette(){
        paletteContainer.innerHTML='';
        for(const [name,hex] of Object.entries(CERAKOTE_COLORS)){
            const wrap = document.createElement('div');
            wrap.className='color-swatch-wrapper';
            wrap.title=name;
            wrap.onclick = ()=>applyColorToPart(activePartId, hex, name);

            const swatch=document.createElement('div');
            swatch.className='color-swatch';
            swatch.style.backgroundColor=hex;

            const label=document.createElement('div');
            label.className='color-swatch-label';
            label.textContent=name;

            wrap.append(swatch,label);
            paletteContainer.appendChild(wrap);
        }
    }

    /* ---------- NAKŁADANIE KOLORU ---------- */
    function applyColorToPart(partId, hex, colorName){
        if(!partId){
            if(selectedPartButton) alert(currentLang==='pl'?'Najpierw wybierz część!':'Select a part first!');
            return;
        }
        ['1','2'].forEach(layer=>{
            const ov=document.getElementById(`color-overlay-${layer}-${partId}`);
            if(!ov) return;
            const shapes = ov.tagName==='g'
                ? ov.querySelectorAll('path,polygon,ellipse,circle,rect')
                : [ov];
            shapes.forEach(s=>s.style.fill=hex);
        });
        selectedColors[partId] = colorName; // zapisz wybór
        updateSummary();
    }

    function setDefaultColor(){
        const defName = 'H-146 Graphite Black';
        const defHex  = CERAKOTE_COLORS[defName];
        PARTS_TO_CONFIGURE.forEach(p=>{
            selectedColors[p.id]=defName;
            applyColorToPart(p.id, defHex, defName);
        });
    }

    function applyRandomColors(){
        const names = Object.keys(CERAKOTE_COLORS);
        PARTS_TO_CONFIGURE.forEach(p=>{
            const rndName = names[Math.floor(Math.random()*names.length)];
            const rndHex  = CERAKOTE_COLORS[rndName];
            applyColorToPart(p.id, rndHex, rndName);
        });
    }

    function resetAllColors(){
        document.querySelectorAll('.color-overlay').forEach(ov=>{
            const shapes = ov.tagName==='g'
                ? ov.querySelectorAll('path,polygon,ellipse,circle,rect')
                : [ov];
            shapes.forEach(s=>s.style.fill='transparent');
        });
        for(const k in selectedColors) delete selectedColors[k];
        if(selectedPartButton) selectedPartButton.classList.remove('selected');
        selectedPartButton=null;activePartId=null;
        updateSummary();
    }

    /* ---------- PODSUMOWANIE ---------- */
    function updateSummary(){
        summaryContainer.innerHTML='';
        PARTS_TO_CONFIGURE.forEach(part=>{
            const col = selectedColors[part.id];
            if(!col) return;
            const line=document.createElement('div');
            line.textContent = `• ${part[currentLang]} – ${col}`;
            summaryContainer.appendChild(line);
        });
    }

    /* ---------- ZAPIS PNG ---------- */
    async function saveAsPng(){
        const svg = document.querySelector('.gun-svg');
        if(!svg) return;

        const scale = 2;
        const box   = svg.getBBox();
        const canvas = Object.assign(document.createElement('canvas'),{
            width : box.width  * scale,
            height: box.height * scale
        });
        const ctx = canvas.getContext('2d');

        const base = new Image();
        base.src = MAIN_TEXTURE_FILE_PATH;

        base.onload = async ()=>{
            ctx.drawImage(base,0,0,canvas.width,canvas.height);

            const promises=[...svg.querySelectorAll('.color-overlay')]
                .filter(ov=>ov.style.fill && ov.style.fill!=='transparent')
                .map(ov=>{
                    const tmpSvg = `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"${svg.getAttribute('viewBox')}\"><g style=\"mix-blend-mode:hard-light;opacity:.45;\">${ov.outerHTML}</g></svg>`;
                    const url = URL.createObjectURL(new Blob([tmpSvg],{type:'image/svg+xml'}));
                    return new Promise(res=>{
                        const img=new Image();
                        img.onload=()=>{ctx.drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);res();};
                        img.src=url;
                    });
                });

            await Promise.all(promises);

            const a=document.createElement('a');
            a.href=canvas.toDataURL('image/png');
            a.download='weapon-wizards-projekt.png';
            a.click();
        };
       	base.onerror=()=>alert('Błąd ładowania tekstury.');
    }
});
