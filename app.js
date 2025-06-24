document.addEventListener('DOMContentLoaded', () => {
    // --- KONFIGURACJA APLIKACJI ---

    const SVG_FILE_PATH = 'glock-wektor.svg'; // Ścieżka do Twojego pliku SVG na serwerze
    const IMG_DIR_PATH = 'img/'; // Ścieżka do folderu z teksturami PNG

    // Definicja części, które mają być interaktywne.
    // 'id' musi DOKŁADNIE odpowiadać 'id' w pliku SVG.
    // 'textureFile' musi DOKŁADNIE odpowiadać nazwie pliku PNG w folderze 'img/'.
    const parts = [
        { id: 'zamek',    label: 'Zamek',             textureFile: 'zamek.png' },
        { id: 'szkielet', label: 'Szkielet',          textureFile: 'szkielet.png' },
        { id: 'spust',    label: 'Spust',             textureFile: 'spust.png' },
        { id: 'zerdz',    label: 'Żerdź',             textureFile: 'zerdz.png' },
        { id: 'zrzut',    label: 'Zrzut magazynka',   textureFile: 'zrzut.png' }
        // Gdy dorysujesz w przyszłości więcej części, dodaj je tutaj.
    ];

    const cerakoteColors = {
        "Burnt Bronze": "#8C6A48", "Tungsten": "#6E7176", "O.D. Green": "#5A6349", 
        "Armor Black": "#212121", "MagPul FDE": "#A48F6A", "Gold": "#D4AF37", "S&W Red": "#B70101"
    };
    
    // --- KONIEC KONFIGURACJI ---


    const gunViewContainer = document.getElementById('gun-view-container');
    const partSelectionContainer = document.getElementById('part-selection-container');
    const paletteContainer = document.getElementById('color-palette-container');
    const resetButton = document.getElementById('reset-button');
    
    let activePartId = null;
    let selectedPartButton = null;

    async function initialize() {
        try {
            // 1. Wczytaj zewnętrzny plik SVG z serwera
            const response = await fetch(SVG_FILE_PATH);
            if (!response.ok) throw new Error(`Nie można wczytać pliku SVG: ${response.statusText}`);
            
            const svgText = await response.text();
            const svgContainer = document.createElement('div');
            svgContainer.innerHTML = svgText;
            const svgElement = svgContainer.querySelector('svg');
            
            if (!svgElement) throw new Error("Wczytany plik nie zawiera tagu SVG.");
            
            svgElement.setAttribute('class', 'gun-svg');
            const defs = svgElement.querySelector('defs') || document.createElementNS("http://www.w3.org/2000/svg", 'defs');
            svgElement.prepend(defs);

            // 2. Przetwórz każdą część
            parts.forEach(part => {
                const partNode = svgElement.querySelector(`#${part.id}`);
                if (!partNode) {
                    console.warn(`Nie znaleziono w SVG części o ID: ${part.id}`);
                    return;
                }

                // Stwórz wzór (pattern) z teksturą PNG
                const svgNS = "http://www.w3.org/2000/svg";
                const pattern = document.createElementNS(svgNS, 'pattern');
                pattern.setAttribute('id', `texture-${part.id}`);
                pattern.setAttribute('patternUnits', 'userSpaceOnUse');
                pattern.setAttribute('width', '1600');
                pattern.setAttribute('height', '1200');
                const image = document.createElementNS(svgNS, 'image');
                image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', IMG_DIR_PATH + part.textureFile);
                image.setAttribute('width', '1600');
                image.setAttribute('height', '1200');
                pattern.appendChild(image);
                defs.appendChild(pattern);

                // Ustaw teksturę jako wypełnienie
                partNode.setAttribute('fill', `url(#texture-${part.id})`);

                // Stwórz kopię na warstwę koloru
                const colorOverlay = partNode.cloneNode(true);
                colorOverlay.id = `color-overlay-${part.id}`;
                colorOverlay.setAttribute('class', 'color-overlay');
                colorOverlay.setAttribute('fill', 'transparent');
                colorOverlay.setAttribute('fill-opacity', '0.75');
                partNode.parentNode.insertBefore(colorOverlay, partNode.nextSibling);

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

            gunViewContainer.appendChild(svgElement);

            // 3. Stwórz paletę kolorów
            for (const [name, hex] of Object.entries(cerakoteColors)) {
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = hex;
                swatch.title = name;
                swatch.addEventListener('click', () => applyColor(hex));
                paletteContainer.appendChild(swatch);
            }
            
            resetButton.addEventListener('click', resetAllColors);

        } catch (error) {
            console.error("Błąd inicjalizacji aplikacji:", error);
            gunViewContainer.innerHTML = `<p style="color:red; font-weight:bold;">Wystąpił krytyczny błąd. Sprawdź, czy plik <code>${SVG_FILE_PATH}</code> znajduje się na serwerze i czy jest dostępny. Szczegóły w konsoli deweloperskiej (F12).</p>`;
        }
    }

    function applyColor(hexColor) {
        if (!activePartId) { alert("Proszę najpierw wybrać część."); return; }
        const colorElement = document.getElementById(`color-overlay-${activePartId}`);
        if (colorElement) {
            colorElement.setAttribute('fill', hexColor);
        }
    }

    function resetAllColors() {
        parts.forEach(part => {
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
    
    initialize();
});