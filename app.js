document.addEventListener('DOMContentLoaded', async () => {
    // --- KONFIGURACJA APLIKACJI ---
    const SVG_FILE_PATH = 'g17.svg';
    const PARTS_TO_CONFIGURE = [
        { id: 'szkielet', label: 'Szkielet' },
        { id: 'blokada1', label: 'Blokada' }
    ];

    // ZMIANA: Nowa, zróżnicowana paleta ~20 kolorów
    const CERAKOTE_COLORS = {
        "H-190 Armor Black": "#212121",
        "H-148 Burnt Bronze": "#8C6A48",
        "H-236 O.D. Green": "#5A6349",
        "H-237 Tungsten": "#6E7176",
        "H-267 Magpul FDE": "#A48F6A",
        "H-140 Bright White": "#FAFAFA",
        "H-216 Smith & Wesson Red": "#B70101",
        "H-171 NRA Blue": "#00387B",
        "H-122 Gold": "#B79436",
        "H-234 Sniper Grey": "#5B6063",
        "H-168 Zombie Green": "#84C341",
        "H-224 Sig Pink": "#E8A7B3",
        "H-258 Socom Blue": "#3B4B5A",
        "H-226 Patriot Brown": "#6A5445",
        "H-185 Blue Titanium": "#647C93",
        "H-30118 Crushed Orchid": "#8A4F80",
        "H-136 Snow White": "#f5f5f5",
        "H-235 Coyote Tan": "#A48B68",
        "H-151 Hunter Orange": "#F26522",
        "H-142 Prison Pink": "#E55C9C"
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
            
            // ZMIANA: Wracamy do tworzenia DWÓCH warstw koloru dla pistoletu
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

        // ZMIANA: Uproszczone tworzenie palety kolorów (kółka)
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
        
        resetButton.addEventListener('click', resetAllColors);

    } catch (error) {
        console.error("Błąd krytyczny aplikacji:", error);
        gunViewContainer.innerHTML = `<p style="color:red; font-weight:bold;">Wystąpił błąd podczas ładowania konfiguratora. Sprawdź konsolę (F12).</p>`;
    }

    function applyColor(hexColor) {
        if (!activePartId) {
            alert("Proszę najpierw wybrać część do pokolorowania.");
            return;
        }
        // ZMIANA: Ustawiamy kolor na OBU warstwach dla pistoletu
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