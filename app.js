document.addEventListener('DOMContentLoaded', async () => {
    // --- KONFIGURACJA APLIKACJI ---
    const SVG_FILE_PATH = 'g17.svg';
    const PARTS_TO_CONFIGURE = [
        { id: 'szkielet', label: 'Szkielet' },
        { id: 'blokada1', label: 'Blokada' }
    ];

    // ZMIANA: Nowa, ogromna paleta ~40 zróżnicowanych kolorów
    const CERAKOTE_COLORS = {
        // Ciemne i Szare
        "H-190 Armor Black": "#212121",
        "H-146 Graphite Black": "#3B3B3B",
        "H-237 Tungsten": "#6E7176",
        "H-234 Sniper Grey": "#5B6063",
        "H-130 Combat Grey": "#6a6a6a",
        "H-214 Smith & Wesson Grey": "#8D918D",
        "H-265 Cold War Grey": "#999B9E",
        "H-259 Barrett Bronze": "#655951",
        // Brązy i Ziemiste
        "H-267 Magpul FDE": "#A48F6A",
        "H-235 Coyote Tan": "#A48B68",
        "H-226 Patriot Brown": "#6A5445",
        "H-148 Burnt Bronze": "#8C6A48",
        "H-250 A.I. Dark Earth": "#786959",
        "H-30374 Troy Coyote Tan": "#B7A889",
        // Zielone
        "H-236 O.D. Green": "#5A6349",
        "H-240 Mil-Spec Green": "#5F604F",
        "H-203 McMillan Tan": "#9F9473",
        "H-168 Zombie Green": "#84C341",
        "H-20150 Bazooka Green": "#596C43",
        // Niebieskie
        "H-171 NRA Blue": "#00387B",
        "H-258 Socom Blue": "#3B4B5A",
        "H-185 Blue Titanium": "#647C93",
        "H-175 Robins Egg Blue": "#75C8C7",
        "H-328 Navy Blue": "#2E3A47",
        // Białe i Jasne
        "H-140 Bright White": "#FAFAFA",
        // Czerwone i Różowe
        "H-216 Smith & Wesson Red": "#B70101",
        "H-142 Prison Pink": "#E55C9C",
        "H-30118 Crushed Orchid": "#8A4F80",
        "H-225 Crimson": "#891F2B",
        // Żółte i Pomarańczowe
        "H-122 Gold": "#B79436",
        "H-327 Guncandy Pineapple": "#E4BE0D",
        "H-151 Hunter Orange": "#F26522",
        // Inne
        "H-167 USMC Red": "#9E2B2F",
        "H-294 Midnight Bronze": "#51463C",
        "H-347 Copper": "#B87333",
        "H-221 Crimson Tide": "#731221",
        "H-329 Northern Lights": "#434B56",
        "H-256 Cobalt": "#395173",
        "H-166 Highland Green": "#434B3F"
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
            
            // ZMIANA: Wracamy do podwójnej nakładki dla mocniejszego efektu
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
            wrapper.title = name;
            wrapper.addEventListener('click', () => applyColor(hex));
            const swatch = document