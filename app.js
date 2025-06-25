document.addEventListener('DOMContentLoaded', async () => {
    // --- KONFIGURACJA APLIKACJI ---
    const SVG_FILE_PATH = 'g17.svg';
    
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
        // Biale
        "H-140 Bright White": "#FAFAFA",
        // Szare i Srebrne
        "H-141 Prison Pink": "#E55C9C", // To jest błąd w oryginalnej liście, H-141 to Satin Aluminum
        "H-305 Light Sand": "#DBCDBE", // Zakładając, że to H-305
        "H-242 Hidden White": "#E5E4E2",
        "H-297 Stormtrooper White": "#F2F2F2",
        "H-136 Snow White": "#f5f5f5",
        "H-214 S&W Grey": "#8D918D",
        "H-265 Cold War Grey": "#999B9E",
        "H-130 Combat Grey": "#6a6a6a",
        "H-237 Tungsten": "#6E7176",
        "H-234 Sniper Grey": "#5B6063",
        // Czarne
        "H-146 Graphite Black": "#3B3B3B",
        "H-199 Cobalt Kinetics Slate": "#4A4E54", // Zakładając H-199
        "H-190 Armor Black": "#212121",
        "E-100 Blackout": "#1C1C1C", // Z serii Elite, jako bonus
        // Brązy i Beże
        "H-267 Magpul FDE": "#A48F6A",
        "H-235 Coyote Tan": "#A48B68",
        "H-229 Patina Copper": "#8A5A3C", // Zakładając H-229
        "H-227 Tactical Grey": "#8D8A82",
        "H-259 Barrett Bronze": "#655951",
        "H-226 Patriot Brown": "#6A5445",
        "H-148 Burnt Bronze": "#8C6A48",
        "H-294 Midnight Bronze": "#51463C",
        "H-347 Copper": "#B87333",
        // Zielone
        "H-213 Battleship Green": "#4B534B", // Zakładając H-213
        "H-240 Mil-Spec Green": "#5F604F",
        "H-236 O.D. Green": "#5A6349",
        "H-247 WWII O.D. Green": "#595943",
        "H-166 Highland Green": "#434B3F",
        "H-269 Charlie Brown": "#8D7854", // To brąz, ale pasuje do grupy
        // Niebieskie
        "H-171 NRA Blue": "#00387B",
        "H-258 Socom Blue": "#3B4B5A",
        "H-256 Cobalt": "#395173",
        "H-328 Navy Blue": "#2E3A47",
        "H-329 G.I. Blue": "#596C80", // Zakładając H-329
        "H-188 Magpul Stealth Grey": "#5C6670", // To szary, ale pasuje do grupy
        // Czerwone, Różowe, Fioletowe
        "H-216 S&W Red": "#B70101",
        "H-167 USMC Red": "#9E2B2F",
        "H-217 Bright Purple": "#8A2BE2",
        "H-221 Crimson": "#891F2B",
        "H-142 Prison Pink": "#E55C9C",
        "H-224 Sig Pink": "#E8A7B3",
        "H-311 Clear - Aluminum": "#C0C0C0", // To clear, ale wizualnie srebrny
        "H-312 Clear - Stainless": "#A9A9A9",
        "H-317 Clear - Titanium": "#878787",
        "H-331 Covert Clear": "#FFFFFF",
        "H-332 Clear - Gold": "#CFB53B",
        "H-339 Federal Brown": "#5E5044",
        "H-341 NFA Brown": "#4B3621",
        "H-342 Smoke": "#84888B",
        "H-344 Magpul OD Green": "#575B4A",
        "H-345 Magpul Foliage Green": "#74786A",
        "H-353 Cerakote Blue": "#0072CE",
        "H-354 Cerakote Red": "#ED1C24",
        "H-357 Cerakote Yellow": "#FFDE00",
        "H-362 Light Grey": "#D3D3D3",
        "H-8000 20150": "#5F6553" // H-8000 to numer bazowy dla 20150
    };
    
    // --- SILNIK APLIKACJI (BEZ ZMIAN) ---
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
            updateButtonLabels();
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
        updateButtonLabels();
    }

    function updateButtonLabels() {
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
            if (part.id !== 'all-parts' && part.id !== 'mix') {
                const randomColor = colorList[Math.floor(Math.random() * colorList.length)];
                applyColorToSinglePart(part.id, randomColor);
            }
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
        if (!window.html2canvas) {
            alert("Błąd: Biblioteka do zapisu obrazu nie jest gotowa.");
            return;
        }
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
    
    main();
});