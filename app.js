document.addEventListener('DOMContentLoaded', async () => {
    // --- GŁÓWNA KONFIGURACJA ---
    const SVG_FILE_PATH = 'g17.svg';
    const IMG_DIR_PATH = 'img/';

    // 'id' musi odpowiadać 'id' w Twoim pliku SVG
    // 'textureFile' musi odpowiadać nazwie pliku PNG w folderze img/
    const PARTS = [
        { id: 'szkielet', label: 'Szkielet', textureFile: 'szkielet.png' },
        { id: 'blokada1', label: 'Blokada',  textureFile: 'blokada1.png' } 
        // Dokończ listę, gdy obrysujesz więcej części
    ];

    const CERAKOTE_COLORS = {
        "H-190 Armor Black": "#212121", "H-146 Graphite Black": "#3B3B3B",
        "H-237 Tungsten": "#6E7176", "H-214 S&W Grey": "#8D918D",
        "H-297 Stormtrooper White": "#F2F2F2", "H-140 Bright White": "#FAFAFA",
        "H-267 Magpul FDE": "#A48F6A", "H-235 Coyote Tan": "#A48B68",
        "H-226 Patriot Brown": "#6A5445", "H-148 Burnt Bronze": "#8C6A48",
        "H-236 O.D. Green": "#5A6349", "H-171 NRA Blue": "#00387B",
        "H-216 S&W Red": "#B70101", "H-168 Zombie Green": "#84C341",
        "H-122 Gold": "#B79436"
    };
    // --- KONIEC KONFIGURACJI ---

    const gunViewContainer = document.getElementById('gun-view-container');
    const partSelectionContainer = document.getElementById('part-selection-container');
    const paletteContainer = document.getElementById('color-palette-container');
    const resetButton = document.getElementById('reset-button');

    let activePartId = null;
    let selectedPartButton = null;

    try {
        // Wczytaj plik SVG z serwera
        const response = await fetch(SVG_FILE_PATH);
        if (!response.ok) throw new Error(`Nie można wczytać pliku SVG: ${response.statusText}`);
        
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const loadedSvg = svgDoc.documentElement;
        
        if (loadedSvg.nodeName === "parsererror" || !loadedSvg) {
            throw new Error("Błąd parsowania pliku SVG.");
        }
        loadedSvg.setAttribute('class', 'gun-svg');
        
        const svgNS = "http://www.w3.org/2000/svg";
        const defs = loadedSvg.querySelector('defs') || document.createElementNS(svgNS, 'defs');
        loadedSvg.prepend(defs);

        const colorLayerGroup = document.createElementNS(svgNS, 'g');
        colorLayerGroup.id = 'color-overlays';
        colorLayerGroup.style.mixBlendMode = 'hard-light'; // Ustawiamy tryb mieszania na całej grupie
        loadedSvg.appendChild(colorLayerGroup);

        // Przetwórz każdą część
        PARTS.forEach(part => {
            const originalPath = loadedSvg.querySelector(`#${part.id}`);
            if (!originalPath) {
                console.warn(`Nie znaleziono w SVG części o ID: ${part.id}`);
                return;
            }
            
            // Stwórz wzór (pattern) z teksturą
            const pattern = document.createElementNS(svgNS, 'pattern');
            pattern.setAttribute('id', `texture-${part.id}`);
            pattern.setAttribute('patternUnits', 'userSpaceOnUse');
            pattern.setAttribute('width', loadedSvg.viewBox.baseVal.width);
            pattern.setAttribute('height', loadedSvg.viewBox.baseVal.height);
            const image = document.createElementNS(svgNS, 'image');
            image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', IMG_DIR_PATH + part.textureFile);
            image.setAttribute('width', loadedSvg.viewBox.baseVal.width);
            image.setAttribute('height', loadedSvg.viewBox.baseVal.height);
            pattern.appendChild(image);
            defs.appendChild(pattern);
            
            // Wypełnij oryginalną ścieżkę teksturą
            originalPath.setAttribute('fill', `url(#texture-${part.id})`);
            
            // Sklonuj kształt na warstwę koloru
            const colorOverlay = originalPath.cloneNode(true);
            colorOverlay.id = `color-overlay-${part.id}`;
            colorOverlay.setAttribute('class', 'color-overlay');
            colorOverlay.setAttribute('fill', 'transparent');
            colorOverlay.setAttribute('opacity', '0.65');
            colorLayerGroup.appendChild(colorOverlay);
            
            // Stwórz przycisk
            const button = document.createElement('button');
            button.textContent = part.label;
            button.addEventListener('click', () => {
                if (selectedPartButton) selectedPartButton.classList.remove('selected');
                button.classList.add('selected');
                selectedPartButton = button;
                activePartId = part.id;
            });
            partSelectionContainer.appendChild(button);
        });

        // Wyczyść komunikat "Ładowanie..." i wstaw gotowe SVG
        gunViewContainer.innerHTML = '';
        gunViewContainer.appendChild(loadedSvg);
        
        // Stwórz paletę kolorów
        for (const [name, hex] of Object.entries(CERAKOTE_COLORS)) {
            const wrapper = document.createElement('div');
            wrapper.className = 'color-swatch-wrapper';
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = hex;
            swatch.title = name;
            swatch.addEventListener('click', () => applyColor(hex));
            const label = document.createElement('div');
            label.className = 'color-swatch-label';
            label.textContent = name;
            wrapper.appendChild(swatch);
            wrapper.appendChild(label);
            paletteContainer.appendChild(wrapper);
        }
        
        resetButton.addEventListener('click', resetAllColors);

    } catch (error) {
        console.error("Błąd krytyczny aplikacji:", error);
        gunViewContainer.innerHTML = `<p style="color:red; font-weight:bold;">Wystąpił błąd: ${error.message}. Sprawdź, czy plik ${SVG_FILE_PATH} jest na serwerze i czy jego nazwa jest poprawna.</p>`;
    }

    function applyColor(hexColor) {
        if (!activePartId) {
            alert("Proszę najpierw wybrać część.");
            return;
        }
        const colorElement = document.getElementById(`color-overlay-${activePartId}`);
        if (colorElement) {
            colorElement.setAttribute('fill', hexColor);
        }
    }

    function resetAllColors() {
        document.querySelectorAll('.color-overlay').forEach(overlay => {
            overlay.setAttribute('fill', 'transparent');
        });
        if (selectedPartButton) {
            selectedPartButton.classList.remove('selected');
            selectedPartButton = null;
        }
        activePartId = null;
    }
});