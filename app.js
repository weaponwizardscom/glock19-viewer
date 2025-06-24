document.addEventListener('DOMContentLoaded', async () => {
    // --- KONFIGURACJA APLIKACJI ---

    const SVG_FILE_PATH = 'g17.svg';
    const IMG_DIR_PATH = 'img/';
    
    const PARTS_TO_CONFIGURE = [
        { id: 'szkielet', label: 'Szkielet' },
        { id: 'blokada1', label: 'Blokada' }
        // Gdy dorysujesz więcej części, dodaj je tutaj.
    ];

    // ZMIANA: Zaktualizowana i rozszerzona paleta kolorów
    const CERAKOTE_COLORS = {
        "H-190 Armor Black": "#212121",
        "H-146 Graphite Black": "#3B3B3B",
        "H-237 Tungsten": "#6E7176",
        "H-214 Smith & Wesson Grey": "#8D918D",
        "H-297 Stormtrooper White": "#F2F2F2",
        "H-140 Bright White": "#FAFAFA",
        "H-267 Magpul FDE": "#A48F6A",
        "H-235 Coyote Tan": "#A48B68",
        "H-226 Patriot Brown": "#6A5445",
        "H-148 Burnt Bronze": "#8C6A48",
        "H-236 O.D. Green": "#5A6349",
        "H-171 NRA Blue": "#00387B",
        "H-216 Smith & Wesson Red": "#B70101",
        "H-168 Zombie Green": "#66ff00",
        "H-122 Gold": "#D4AF37",
        "H-327 Guncandy Pineapple": "#E4BE0D"
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
            if (!originalPath) {
                console.warn(`Nie znaleziono w SVG części o ID: ${part.id}`);
                return;
            }
            const colorOverlay = originalPath.cloneNode(true);
            colorOverlay.id = `color-overlay-${part.id}`;
            colorOverlay.setAttribute('class', 'color-overlay');
            colorOverlay.setAttribute('fill', 'transparent');
            colorLayerGroup.appendChild(colorOverlay);

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
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = hex;
            swatch.title = name;
            swatch.addEventListener('click', () => applyColor(hex));
paletteContainer.appendChild(swatch);
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
        const colorElement = document.getElementById(`color-overlay-${activePartId}`);
        if (colorElement) {
            colorElement.setAttribute('fill', hexColor);
        }
    }

    function resetAllColors() {
        PARTS_TO_CONFIGURE.forEach(part => {
            const colorElement = document.getElementById(`color-overlay-${part.id}`);
            if (colorElement) {
                colorElement.setAttribute('fill', 'transparent');
            }
        });
        if (selectedPartButton) {
            selectedPartButton.classList.remove('selected');
            selectedPartButton = null;
        }
        activePartId = null;
    }
});