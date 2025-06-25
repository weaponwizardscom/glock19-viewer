document.addEventListener('DOMContentLoaded', async () => {
    /* =====================  KONFIGURACJA APLIKACJI  ===================== */
    const SVG_FILE_PATH        = 'g17.svg';
    const MAIN_TEXTURE_FILE_PATH = 'img/glock17.png';

    const PARTS_TO_CONFIGURE = [
        { id: 'zamek',    pl: 'Zamek',                 en: 'Slide' },
        { id: 'szkielet', pl: 'Szkielet',              en: 'Frame' },
        { id: 'spust',    pl: 'Język spustowy z szyną',en: 'Trigger with trigger bar' },
        { id: 'lufa',     pl: 'Lufa',                  en: 'Barrel' },
        { id: 'zerdz',    pl: 'Żerdź',                 en: 'Recoil spring' },
        { id: 'pazur',    pl: 'Pazur wyciągu',         en: 'Extractor' },
        { id: 'zrzut',    pl: 'Zatrzask magazynka',    en: 'Magazine catch' },
        { id: 'blokadap', pl: 'Blokada zamka',         en: 'Slide lock' },
        { id: 'blokada2', pl: 'Dźwignia zrzutu zamka', en: 'Slide stop lever' },
        { id: 'pin',      pl: 'Pin',                   en: 'Trigger pin' },
        { id: 'stopka',   pl: 'Stopka magazynka',      en: 'Magazine floorplate' }
    ];

    /* =====================  CERAKOTE H-SERIES (HEX)  ===================== */
    const CERAKOTE_COLORS = {
        /* -------- BIAŁE I JASNE -------- */
        "H-140 Bright White":            "#FFFFFF",
        "H-242 Hidden White":            "#E5E4E2",
        "H-136 Snow White":              "#F5F5F5",
        "H-297 Stormtrooper White":      "#F2F2F2",
        "H-300 Armor Clear":             "#F5F5F5",    // wizualnie biały / bezbarwny
        "H-331 Parakeet Green":          "#C2D94B",    // jasna zieleń
        "H-141 Prison Pink":             "#E55C9C",

        /* -------- SZARE -------- */
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

        /* -------- CZARNE -------- */
        "H-146 Graphite Black":          "#3B3B3B",
        "H-190 Armor Black":             "#212121",

        /* -------- BRĄZY I BEŻE (FDE) -------- */
        "H-142 Light Sand":              "#D2C3A8",
        "H-199 Desert Sand":             "#C5BBAA",
        "H-267 Magpul FDE":              "#A48F6A",
        "H-269 Barrett Brown":           "#67594D",
        "H-148 Burnt Bronze":            "#8C6A48",
        "H-339 Federal Brown":           "#5E5044",
        "H-8000 RAL 8000":               "#937750",
        "H-33446 FS Sabre Sand":         "#B19672",

        /* -------- ZIELONE -------- */
        "H-240 Mil Spec O.D. Green":     "#5F604F",
        "H-247 Desert Sage":             "#6A6B5C",
        "H-229 Sniper Green":            "#565A4B",
        "H-344 Olive":                   "#6B6543",
        "H-189 Noveske Bazooka Green":   "#6C6B4E",
        "H-353 Island Green":            "#00887A",

        /* -------- NIEBIESKIE -------- */
        "H-127 Kel-Tec Navy Blue":       "#2B3C4B",
        "H-171 NRA Blue":                "#00387B",
        "H-188 Magpul Stealth Grey":     "#5C6670",
        "H-256 Cobalt":                  "#395173",
        "H-258 Socom Blue":              "#3B4B5A",
        "H-329 Blue Raspberry":          "#0077C0",
        "H-362 Patriot Blue":            "#33415C",

        /* -------- FIOLETOWE -------- */
        "H-197 Wild Purple":             "#5A3A54",
        "H-217 Bright Purple":           "#8A2BE2",
        "H-332 Purplexed":               "#6C4E7C",
        "H-357 Periwinkle":              "#6B6EA6",

        /* -------- CZERWONE / POMARAŃCZOWE / ŻÓŁTE -------- */
        "H-128 Hunter Orange":           "#F26522",
        "H-167 USMC Red":                "#9E2B2F",
        "H-216 S&W Red":                 "#B70101",
        "H-221 Crimson":                 "#891F2B",
        "H-317 Sunflower":               "#F9A602",
        "H-354 Lemon Zest":              "#F7D51D",

        /* -------- METALICZNE / ZŁOTE -------- */
        "H-122 Gold":                    "#B79436",
        "H-151 Satin Aluminum":          "#C0C0C0"
    };

    /* =====================  ELEMENTY DOM  ===================== */
    const gunViewContainer       = document.getElementById('gun-view-container');
    const partSelectionContainer = document.getElementById('part-selection-container');
    const paletteContainer       = document.getElementById('color-palette');
    const resetButton            = document.getElementById('reset-button');
    const saveButton             = document.getElementById('save-button');
    const langPl                 = document.getElementById('lang-pl');
    const langGb                 = document.getElementById('lang-gb');
    const headerPartSelection    = document.getElementById('header-part-selection');
    const headerColorSelection   = document.getElementById('header-color-selection');

    /* =====================  ZMIENNE STANU  ===================== */
    let activePartId        = null;
    let selectedPartButton  = null;
    let currentLang         = 'pl';

    /* =====================  INICJALIZACJA  ===================== */
    async function initialize() {
        try {
            /* -------------- Wczytaj SVG broni -------------- */
            const response = await fetch(SVG_FILE_PATH);
            if (!response.ok) throw new Error(`Nie udało się wczytać pliku ${SVG_FILE_PATH}`);
            const svgText   = await response.text();
            gunViewContainer.innerHTML = svgText;

            const svgElement = gunViewContainer.querySelector('svg');
            if (!svgElement) throw new Error('Wczytany plik nie zawiera tagu <svg>');
            svgElement.classList.add('gun-svg');

            /* -------------- Grupowanie lufy (lufa1 + lufa2) -------------- */
            const lufaGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            lufaGroup.id = 'lufa';
            [...svgElement.querySelectorAll('#lufa1, #lufa2')].forEach(path => lufaGroup.appendChild(path));
            svgElement.insertBefore(lufaGroup, svgElement.firstChild);

            /* -------------- Warstwa nakładek kolorystycznych -------------- */
            const colorLayerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            colorLayerGroup.id = 'color-overlays';
            svgElement.appendChild(colorLayerGroup);

            /* -------------- Przyciski części + nakładki koloru -------------- */
            PARTS_TO_CONFIGURE.forEach(part => {
                const source = svgElement.querySelector(`#${part.id}`);
                if (!source) { console.warn(`Brak elementu SVG o id=\"${part.id}\"`); return; }

                // tworzymy 2 nakładki /mix-blend-mode:hard-light/
                ['1','2'].forEach(layer => {
                    const overlay = source.cloneNode(true);
                    overlay.id = `color-overlay-${layer}-${part.id}`;
                    overlay.classList.add('color-overlay');
                    colorLayerGroup.appendChild(overlay);
                });

                // przycisk części
                const btn = document.createElement('button');
                btn.dataset.partId = part.id;
                partSelectionContainer.appendChild(btn);
            });

            /* -------------- Przycisk MIX -------------- */
            const mixBtn = document.createElement('button');
            mixBtn.id = 'mix-button';
            mixBtn.textContent = 'MIX';
            mixBtn.addEventListener('click', applyRandomColors);
            partSelectionContainer.appendChild(mixBtn);

            /* -------------- Interakcje UI -------------- */
            resetButton.addEventListener('click', resetAllColors);
            saveButton.addEventListener('click', saveAsPng);
            langPl .addEventListener('click', () => switchLang('pl'));
            langGb .addEventListener('click', () => switchLang('en'));

            resetAllColors();
            createColorPalette();
            setDefaultColor();
            updateUIText();
        } catch (err) {
            console.error('Błąd inicjalizacji:', err);
            gunViewContainer.innerHTML = `<p style="color:red;font-weight:bold;">${err.message}</p>`;
        }
    }

    /* =====================  INTERNACJONALIZACJA  ===================== */
    function switchLang(lang) {
        currentLang = lang;
        updateUIText();
    }

    function updateUIText() {
        // etykiety przycisków części
        partSelectionContainer.querySelectorAll('button:not(#mix-button)').forEach(btn => {
            const part = PARTS_TO_CONFIGURE.find(p => p.id === btn.dataset.partId);
            if (!part) return;
            btn.textContent = part[currentLang];
            btn.onclick = () => {
                if (selectedPartButton) selectedPartButton.classList.remove('selected');
                btn.classList.add('selected');
                selectedPartButton = btn;
                activePartId = part.id;
            };
        });

        headerPartSelection.textContent = currentLang === 'pl' ? '1. Wybierz część'   : '1. Select part';
        headerColorSelection.textContent = currentLang === 'pl' ? '2. Wybierz kolor (Cerakote)' : '2. Select color (Cerakote)';
        langPl.classList.toggle('active', currentLang === 'pl');
        langGb.classList.toggle('active', currentLang === 'en');
    }

    /* =====================  PALETA KOLORÓW  ===================== */
    function createColorPalette() {
        paletteContainer.innerHTML = '';
        for (const [name, hex] of Object.entries(CERAKOTE_COLORS)) {
            const wrapper = document.createElement('div');
            wrapper.className = 'color-swatch-wrapper';
            wrapper.title = name;
            wrapper.onclick = () => applyColorToPart(activePartId, hex);

            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = hex;

            const label = document.createElement('div');
            label.className = 'color-swatch-label';
            label.textContent = name;

            wrapper.append(swatch, label);
            paletteContainer.appendChild(wrapper);
        }
    }

    /* =====================  OPERACJE NA KOLORACH  ===================== */
    function applyColorToPart(partId, hex) {
        if (!partId) {
            if (selectedPartButton) alert('Najpierw wybierz część!');
            return;
        }
        ['1','2'].forEach(layer => {
            const overlay = document.getElementById(`color-overlay-${layer}-${partId}`);
            if (!overlay) return;
            const shapes = overlay.tagName.toLowerCase() === 'g'
                ? overlay.querySelectorAll('path,polygon,ellipse,circle,rect')
                : [overlay];
            shapes.forEach(s => s.style.fill = hex);
        });
    }

    function setDefaultColor() {
        const def = CERAKOTE_COLORS['H-146 Graphite Black'];
        PARTS_TO_CONFIGURE.forEach(part => applyColorToPart(part.id, def));
    }

    function applyRandomColors() {
        const hexes = Object.values(CERAKOTE_COLORS);
        PARTS_TO_CONFIGURE.forEach(part => {
            const rand = hexes[Math.floor(Math.random() * hexes.length)];
            applyColorToPart(part.id, rand);
        });
    }

    function resetAllColors() {
        document.querySelectorAll('.color-overlay').forEach(ov => {
            const shapes = ov.tagName.toLowerCase() === 'g'
                ? ov.querySelectorAll('path,polygon,ellipse,circle,rect')
                : [ov];
            shapes.forEach(s => s.style.fill = 'transparent');
        });
        if (selectedPartButton) selectedPartButton.classList.remove('selected');
        selectedPartButton = null;
        activePartId = null;
    }

    /* =====================  ZAPIS PNG  ===================== */
    async function saveAsPng() {
        const svgElement = document.querySelector('.gun-svg');
        if (!svgElement) return;

        const scale = 2;
        const box   = svgElement.getBBox();
        const canvas = Object.assign(document.createElement('canvas'), {
            width  : box.width  * scale,
            height : box.height * scale
        });
        const ctx = canvas.getContext('2d');

        /* główna tekstura */
        const baseImg = new Image();
        baseImg.src = MAIN_TEXTURE_FILE_PATH;
        baseImg.onload = async () => {
            ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

            const overlayPromises = [...svgElement.querySelectorAll('.color-overlay')]
                .filter(ov => ov.style.fill && ov.style.fill !== 'transparent')
                .map(ov => {
                    const tmpSvg = `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="${svgElement.getAttribute('viewBox')}">
                            <g style="mix-blend-mode:hard-light;opacity:0.45;">${ov.outerHTML}</g>
                        </svg>`;
                    const url = URL.createObjectURL(new Blob([tmpSvg], {type:'image/svg+xml'}));
                    return new Promise(res => {
                        const img = new Image();
                        img.onload = () => { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url); res(); };
                        img.src = url;
                    });
                });

            await Promise.all(overlayPromises);

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'weapon-wizards-projekt.png';
            link.click();
        };
        baseImg.onerror = () => alert('Błąd: nie można wczytać głównej tekstury.');
    }

    /* =====================  START  ===================== */
    initialize();
});
