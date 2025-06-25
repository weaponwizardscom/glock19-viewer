document.addEventListener('DOMContentLoaded', async () => {
    // --- KONFIGURACJA APLIKACJI ---
    const SVG_FILE_PATH = 'g17.svg';
    const MAIN_TEXTURE_FILE_PATH = 'img/glock17.png';
    const PARTS_TO_CONFIGURE = [
        { id: 'zamek',    pl: 'Zamek', en: 'Slide' },
        { id: 'szkielet', pl: 'Szkielet', en: 'Frame' },
        { id: 'spust',    pl: 'Język spustowy z szyną', en: 'Trigger with trigger bar' },
        { id: 'lufa',     pl: 'Lufa', en: 'Barrel' },
        { id: 'zerdz',    pl: 'Żerdź', en: 'Recoil spring' },
        { id: 'pazur',    pl: 'Pazur wyciągu', en: 'Extractor' },
        { id: 'zrzut',    pl: 'Zatrzask magazynka', en: 'Magazine catch' },
        { id: 'blokadap', pl: 'Blokada zamka', en: 'Slide lock' },
        { id: 'blokada2', pl: 'Dźwignia zrzutu zamka', en: 'Slide stop lever' },
        { id: 'pin',      pl: 'Pin', en: 'Trigger pin' },
        { id: 'stopka',   pl: 'Stopka magazynka', en: 'Magazine floorplate' }
    ];

    // ZMIANA: Nowa, posortowana i rozszerzona paleta kolorów
    const CERAKOTE_COLORS = {
        // BIAŁE I JASNE
        "H-140 Bright White": "#FFFFFF",
        "H-242 Hidden White": "#E5E4E2",
        "H-136 Snow White": "#F5F5F5",
        "H-297 Stormtrooper White": "#F2F2F2",
        "H-300 Armor Clear": "#F5F5F5", // Wizualnie jak biały/przezroczysty
        "H-331 Parakeet Green": "#C2D94B", // Bardziej jasny zielony
        "H-141 Prison Pink": "#E55C9C",

        // SZARE
        "H-306 Springfield Grey": "#A2A4A6",
        "H-312 Frost": "#C9C8C6",
        "H-317 Sunflower": "#F9A602", // To żółty
        "H-362 Patriot Blue": "#33415C", // To niebieski
        "H-214 S&W Grey": "#8D918D",
        "H-265 Cold War Grey": "#999B9E",
        "H-227 Tactical Grey": "#8D8A82",
        "H-130 Combat Grey": "#6a6a6a",
        "H-237 Tungsten": "#6E7176",
        "H-210 Sig Dark Grey": "#5B5E5E",
        "H-234 Sniper Grey": "#5B6063",
        "H-342 Smoke": "#84888B",
        "H-321 Blush": "#D8C0C4",

        // CZARNE
        "H-146 Graphite Black": "#3B3B3B",
        "H-199 Desert Sand": "#C5BBAA", // To piaskowy
        "H-190 Armor Black": "#212121",
        "H-197 Wild Purple": "#5A3A54", // To fiolet
        
        // BRĄZY I BEŻE (FDE)
        "H-142 Light Sand": "#D2C3A8",
        "H-265 Flat Dark Earth": "#786A5A",
        "H-269 Barrett Brown": "#67594D",
        "H-148 Burnt Bronze": "#8C6A48",
        "H-229 Sniper Green": "#565A4B", // To zielony
        "H-339 Federal Brown": "#5E5044",
        "H-341 Dark Green": "#4E544A", // To zielony
        "H-8000 Ral 8000": "#937750",
        "H-33446 FS Sabre Sand": "#B19672",

        // ZIELONE
        "H-240 Mil Spec O.D. Green": "#5F604F",
        "H-247 Desert Sage": "#6A6B5C",
        "H-170 Titanium": "#7A7A7A", // To szary
        "H-344 Olive": "#6B6543",
        "H-345 Dark Grey": "#65676A", // To szary

        // NIEBIESKIE
        "H-127 Kel-Tec Navy Blue": "#2B3C4B",
        "H-171 NRA Blue": "#00387B",
        "H-188 Magpul Stealth Grey": "#5C6670", // To szary
        "H-256 Cobalt": "#395173",
        "H-258 Socom Blue": "#3B4B5A",
        "H-329 Blue Raspberry": "#0077C0",
        "H-353 Island Green": "#00887A", // To turkusowy
        
        // CZERWONE i POMARAŃCZOWE
        "H-128 Hunter Orange": "#F26522",
        "H-151 Satin Aluminum": "#C0C0C0", // To srebrny
        "H-167 USMC Red": "#9E2B2F",
        "H-216 S&W Red": "#B70101",
        "H-221 Crimson": "#891F2B",
        "H-354 Lemon Zest": "#F7D51D", // To żółty
        "H-357 Periwinkle": "#6B6EA6", // To fioletowy/niebieski
        
        // ŻÓŁTE i ZŁOTE
        "H-122 Gold": "#B79436",
        "H-332 Purplexed": "#6C4E7C", // To fioletowy

        // INNE
        "H-189 Noveske Bazooka Green": "#6C6B4E", // To zielony
        "H-217 Bright Purple": "#8A2BE2",
        "H-224 Sig Pink": "#E8A7B3",
        "H-213 Battleship Grey": "#52595D"
    };

    // --- SILNIK APLIKACJI ---
    const gunViewContainer = document.getElementById('gun-view-container');
    const partSelectionContainer = document.getElementById('part-selection-container');
    const paletteContainer = document.getElementById('color-palette');
    const resetButton = document.getElementById('reset-button');
    const saveButton = document.getElementById('save-button');
    const langPl = document.getElementById('lang-pl');
    const langGb = document.getElementById('lang-gb');
    
    let activePartId = null;
    let selectedPartButton = null;
    let currentLang = 'pl';

    async function initialize() {
        try {
            const response = await fetch(SVG_FILE_PATH);
            if (!response.ok) throw new Error(`Nie udało się wczytać pliku ${SVG_FILE_PATH}`);
            
            const svgText = await response.text();
            gunViewContainer.innerHTML = svgText;
            const svgElement = gunViewContainer.querySelector('svg');
            if (!svgElement) throw new Error("Wczytany plik nie zawiera tagu SVG.");
            svgElement.setAttribute('class', 'gun-svg');

            const lufaGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            lufaGroup.id = 'lufa';
            const lufaPaths = Array.from(svgElement.querySelectorAll('#lufa1, #lufa2'));
            if (lufaPaths.length > 0) {
                const parent = lufaPaths[0].parentNode;
                parent.insertBefore(lufaGroup, lufaPaths[0]);
                lufaPaths.forEach(p => lufaGroup.appendChild(p));
            }
            
            const colorLayerGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            colorLayerGroup.id = 'color-overlays';
            svgElement.appendChild(colorLayerGroup);

            const allAppParts = [...PARTS_TO_CONFIGURE, 
                { id: 'all-parts', pl: 'Wszystkie Części', en: 'All Parts' },
                { id: 'mix', pl: 'MIX', en: 'MIX' }
            ];

            allAppParts.forEach(part => {
                if (part.id !== 'all-parts' && part.id !== 'mix') {
                    const originalElement = svgElement.querySelector(`#${part.id}`);
                    if (!originalElement) { console.warn(`Nie znaleziono części o ID: ${part.id}`); return; }
                    
                    const colorOverlay1 = originalElement.cloneNode(true);
                    colorOverlay1.id = `color-overlay-1-${part.id}`;
                    colorOverlay1.setAttribute('class', 'color-overlay');
                    colorLayerGroup.appendChild(colorOverlay1);

                    const colorOverlay2 = colorOverlay1.cloneNode(true);
                    colorOverlay2.id = `color-overlay-2-${part.id}`;
                    colorLayerGroup.appendChild(colorOverlay2);
                }
                const button = document.createElement('button');
                button.dataset.partId = part.id;
                button.id = `${part.id}-button`;
                partSelectionContainer.appendChild(button);
            });
            
            resetAllColors();
            updateUIText();
            createColorPalette();

            resetButton.addEventListener('click', resetAllColors);
            saveButton.addEventListener('click', saveAsPng);
            langPl.addEventListener('click', () => switchLang('pl'));
            langGb.addEventListener('click', () => switchLang('en'));

        } catch (error) {
            console.error("Błąd krytyczny aplikacji:", error);
            gunViewContainer.innerHTML = `<p style="color:red; font-weight:bold;">Wystąpił błąd: ${error.message}. Sprawdź konsolę.</p>`;
        }
    }

    function switchLang(lang) {
        currentLang = lang;
        updateUIText();
    }

    function updateUIText() {
        partSelectionContainer.querySelectorAll('button').forEach(button => {
            const partId = button.dataset.partId;
            const specialButtons = {
                'mix': { pl: 'MIX', en: 'MIX' },
                'all-parts': { pl: 'Wszystkie Części', en: 'All Parts' }
            };
            const partConfig = PARTS_TO_CONFIGURE.find(p => p.id === partId) || specialButtons[partId];
            
            if (partConfig) {
                button.textContent = partConfig[currentLang];
                button.onclick = () => {
                    if (partId === 'mix') {
                        applyRandomColors();
                        return;
                    }
                    if (selectedPartButton) selectedPartButton.classList.remove('selected');
                    button.classList.add('selected');
                    selectedPartButton = button;
                    activePartId = partId;
                };
            }
        });
        langPl.classList.toggle('active', currentLang === 'pl');
        langGb.classList.toggle('active', currentLang === 'en');
    }

    function createColorPalette() {
        paletteContainer.innerHTML = '';
        for (const [name, hex] of Object.entries(CERAKOTE_COLORS)) {
            const wrapper = document.createElement('div');
            wrapper.className = 'color-swatch-wrapper';
            wrapper.title = name;
            wrapper.addEventListener('click', () => applyColor(hex));
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = hex;
            const label = document.createElement('div');
            label.className = 'color-swatch-label';
            label.textContent = name;
            wrapper.appendChild(swatch);
            wrapper.appendChild(label);
            paletteContainer.appendChild(wrapper);
        }
    }
    
    function applyColor(hexColor) {
        if (!activePartId) { alert("Proszę najpierw wybrać część."); return; }
        if (activePartId === 'all-parts') {
            PARTS_TO_CONFIGURE.forEach(part => applyColorToSinglePart(part.id, hexColor));
        } else {
            applyColorToSinglePart(activePartId, hexColor);
        }
    }

    function applyColorToSinglePart(partId, hexColor) {
        const colorElement1 = document.getElementById(`color-overlay-1-${partId}`);
        const colorElement2 = document.getElementById(`color-overlay-2-${partId}`);
        if (colorElement1 && colorElement2) {
            const elementsToColor = [colorElement1, colorElement2];
            elementsToColor.forEach(el => {
                const shapes = el.tagName.toLowerCase() === 'g' ? el.querySelectorAll('path, polygon, ellipse, circle, rect') : [el];
                shapes.forEach(shape => shape.style.fill = hexColor);
            });
        }
    }

    function applyRandomColors() {
        const colorList = Object.values(CERAKOTE_COLORS);
        PARTS_TO_CONFIGURE.forEach(part => {
            const randomColor = colorList[Math.floor(Math.random() * colorList.length)];
            applyColorToSinglePart(part.id, randomColor);
        });
    }

    function resetAllColors() {
        document.querySelectorAll('.color-overlay').forEach(overlay => {
            const shapes = overlay.tagName.toLowerCase() === 'g' ? overlay.querySelectorAll('path, polygon, ellipse, circle, rect') : [overlay];
            shapes.forEach(shape => shape.style.fill = 'transparent');
        });
        if (selectedPartButton) { selectedPartButton.classList.remove('selected'); selectedPartButton = null; }
        activePartId = null;
    }
    
    async function saveAsPng() {
        const gunView = document.getElementById('gun-view-container');
        if (!window.html2canvas) { alert("Błąd: Biblioteka do zapisu obrazu nie jest gotowa."); return; }
        try {
            const canvas = await html2canvas(gunView, {
                backgroundColor: null,
                logging: false,
                useCORS: true,
                scale: 2 
            });
            const link = document.createElement('a');
            link.download = 'weapon-wizards-projekt.png';
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch(e) {
            console.error("Błąd podczas generowania obrazu PNG:", e);
            alert("Wystąpił nieoczekiwany błąd podczas próby zapisu obrazu.");
        }
    }
    
    initialize();
});