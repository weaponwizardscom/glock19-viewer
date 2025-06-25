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
    const CERAKOTE_COLORS = { "H-190 Armor Black": "#212121", "H-146 Graphite Black": "#3B3B3B", "H-237 Tungsten": "#6E7176", "H-234 Sniper Grey": "#5B6063", "H-130 Combat Grey": "#6a6a6a", "H-214 S&W Grey": "#8D918D", "H-265 Cold War Grey": "#999B9E", "H-259 Barrett Bronze": "#655951", "H-267 Magpul FDE": "#A48F6A", "H-235 Coyote Tan": "#A48B68", "H-226 Patriot Brown": "#6A5445", "H-148 Burnt Bronze": "#8C6A48", "H-294 Midnight Bronze": "#51463C", "H-347 Copper": "#B87333", "H-236 O.D. Green": "#5A6349", "H-240 Mil-Spec Green": "#5F604F", "H-203 McMillan Tan": "#9F9473", "H-168 Zombie Green": "#84C341", "H-20150 Bazooka Green": "#596C43", "H-171 NRA Blue": "#00387B", "H-258 Socom Blue": "#3B4B5A", "H-185 Blue Titanium": "#647C93", "H-175 Robins Egg Blue": "#75C8C7", "H-328 Navy Blue": "#2E3A47", "H-216 S&W Red": "#B70101", "H-167 USMC Red": "#9E2B2F", "H-221 Crimson": "#891F2B", "H-142 Prison Pink": "#E55C9C", "H-30118 Crushed Orchid": "#8A4F80", "H-122 Gold": "#B79436", "H-151 Hunter Orange": "#F26522", "H-327 Guncandy Pineapple": "#E4BE0D", "H-256 Cobalt": "#395173", "H-166 Highland Green": "#434B3F", "H-140 Bright White": "#FAFAFA" };

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
    let textureAsDataUrl = '';

    async function initialize() {
        try {
            const toDataURL = async url => {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Nie znaleziono pliku tekstury: ${url}`);
                const blob = await response.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            };
            textureAsDataUrl = await toDataURL(MAIN_TEXTURE_FILE_PATH);

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
            
            const allAppParts = [...PARTS_TO_CONFIGURE, { id: 'all-parts', pl: 'Wszystkie Części', en: 'All Parts' }, { id: 'mix', pl: 'MIX', en: 'MIX' }];

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
    
    function saveAsPng() {
        const gunView = document.getElementById('gun-view-container');
        if (!window.html2canvas) { alert("Błąd: Biblioteka do zapisu obrazu nie jest gotowa."); return; }
        
        const svgElement = gunView.querySelector('.gun-svg');
        if (!svgElement) return;

        const serializer = new XMLSerializer();
        const svgClone = svgElement.cloneNode(true);
        const imageElement = svgClone.querySelector('image');

        if (imageElement && textureAsDataUrl) {
            imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', textureAsDataUrl);
        } else {
            alert("Błąd: Tekstura nie jest gotowa do zapisu.");
            return;
        }

        const svgString = serializer.serializeToString(svgClone);
        const canvas = document.createElement('canvas');
        const scaleFactor = 2;
        const svgSize = svgElement.getBoundingClientRect();
        canvas.width = svgSize.width * scaleFactor;
        canvas.height = svgSize.height * scaleFactor;
        
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function () {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const link = document.createElement('a');
            link.download = 'weapon-wizards-projekt.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    }
    
    // ZMIANA: Poprawne wywołanie funkcji inicjalizującej
    initialize();
});