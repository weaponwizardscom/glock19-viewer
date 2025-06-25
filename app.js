document.addEventListener('DOMContentLoaded', async () => {
    // --- KONFIGURACJA APLIKACJI ---
    const SVG_FILE_PATH = 'g17.svg';
    const PARTS_TO_CONFIGURE = [
        { id: 'szkielet', label: 'Szkielet' },
        { id: 'blokada1', label: 'Blokada' }
    ];
    const CERAKOTE_COLORS = {
        "H-190 Armor Black": "#212121", "H-146 Graphite Black": "#3B3B3B", "H-237 Tungsten": "#6E7176",
        "H-214 S&W Grey": "#8D918D", "H-297 Stormtrooper White": "#F2F2F2", "H-140 Bright White": "#FAFAFA",
        "H-267 Magpul FDE": "#A48F6A", "H-235 Coyote Tan": "#A48B68", "H-226 Patriot Brown": "#6A5445",
        "H-148 Burnt Bronze": "#8C6A48", "H-236 O.D. Green": "#5A6349", "H-171 NRA Blue": "#00387B",
        "H-216 S&W Red": "#B70101", "H-168 Zombie Green": "#84C341", "H-122 Gold": "#B79436"
    };
    // --- KONIEC KONFIGURACJI ---

    const gunViewContainer = document.getElementById('gun-view-container');
    const partSelectionContainer = document.getElementById('part-selection-container');
    const paletteContainer = document.getElementById('color-palette-container');
    const resetButton = document.getElementById('reset-button');
    
    let activePartId = null;
    let selectedPartButton = null;

    try {
        const response = await fetch(SVG_FILE_PATH);
        if (!response.ok) throw new Error(`Nie udało się wczytać pliku ${SVG_FILE_PATH}`);
        
        const svgText = await response.text();
        gunViewContainer.innerHTML = svgText;
        const svgElement = gunViewContainer.querySelector('svg');
        if (!svgElement) throw new Error("Wczytany plik nie zawiera tagu SVG.");
        svgElement.setAttribute('class', 'gun-svg');

        const colorLayerGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        colorLayerGroup.id = 'color-overlays';
        svgElement.appendChild(colorLayerGroup);

        PARTS_TO_CONFIGURE.forEach(part => {
            const originalPath = svgElement.querySelector(`#${part.id}`);
            if (!originalPath) return;
            
            // ZMIANA: Tworzymy DWIE identyczne warstwy koloru dla każdej części
            const colorOverlay1 = originalPath.cloneNode(true);
            colorOverlay1.id = `color-overlay-1-${part.id}`;
            colorOverlay1.setAttribute('class', 'color-overlay');
            colorOverlay1.setAttribute('fill', 'transparent');
            colorLayerGroup.appendChild(colorOverlay1);

            const colorOverlay2 = originalPath.cloneNode(true);
            colorOverlay2.id = `color-overlay-2-${part.id}`;
            colorOverlay2.setAttribute('class', 'color-overlay');
            colorOverlay2.setAttribute('fill', 'transparent');
            colorLayerGroup.appendChild(colorOverlay2);

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
        gunViewContainer.innerHTML = `<p style="color:red; font-weight:bold;">Wystąpił błąd podczas ładowania konfiguratora. Sprawdź konsolę deweloperską (F12) po więcej szczegółów.</p>`;
    }

    function applyColor(hexColor) {
        if (!activePartId) {
            alert("Proszę najpierw wybrać część do pokolorowania.");
            return;
        }
        // ZMIANA: Ustawiamy kolor na OBU warstwach
        const colorElement1 = document.getElementById(`color-overlay-1-${activePartId}`);
        const colorElement2 = document.getElementById(`color-overlay-2-${activePartId}`);
        if (colorElement1 && colorElement2) {
            colorElement1.setAttribute('fill', hexColor);
            colorElement2.setAttribute('fill', hexColor);
        }
    }

    function resetAllColors() {
        // ZMIANA: Resetujemy OBIE warstwy
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