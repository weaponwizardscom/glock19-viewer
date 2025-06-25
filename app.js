/* ===== app.js ===== */
document.addEventListener('DOMContentLoaded', () => {
    /* ----------------- USTAWIENIA ----------------- */
    const SVG_FILE   = 'g17.svg';
    const TEXTURE    = 'img/glock17.png';
    const PANEL_W    = 380;  // szerokość panelu w PNG
    const FONT_PX    = 24;
    const PAD        = 32;
  
    const PARTS = [
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
  
    /* ---- PALETA ---- (bez zmian) */
    const COLORS = { /* pełna lista jak wcześniej */ };
    // (… wklej tu ten sam obiekt COLORS co w poprzedniej wersji – skrócony w tej wiadomości)
  
    /* ----------------- DOM ----------------- */
    const gunBox   = document.getElementById('gun-view-container');
    const partBox  = document.getElementById('part-selection-container');
    const palBox   = document.getElementById('color-palette');
    const palScroll= document.getElementById('palette-scroll');
    const resetBtn = document.getElementById('reset-button');
    const saveBtn  = document.getElementById('save-button');
    const sumList  = document.getElementById('summary-list');
    const sumTitle = document.getElementById('summary-title');
    const PLbtn    = document.getElementById('lang-pl');
    const ENbtn    = document.getElementById('lang-gb');
    const H1       = document.getElementById('header-part-selection');
    const H2       = document.getElementById('header-color-selection');
    const sumBox   = document.getElementById('summary-container');
  
    /* ----------------- STAN ----------------- */
    let lang = 'pl', activePart = null;
    const selections = {};      // { partId : colorName }
    let svgEl;                  // globalny ref do <svg> – do naprawy lufy
  
    /* =============== INIT =============== */
    (async function init() {
      await loadSvg();
      buildUI();
      defaultBlack();
      updateText();
      updateSummary();
      equalizeHeights();       // wyrównaj wysokość listy ↔ palety
      window.addEventListener('resize', equalizeHeights);
    })();
  
    /* ----------------- Wczytaj SVG ----------------- */
    async function loadSvg() {
      const svgTxt = await fetch(SVG_FILE).then(r => r.text());
      gunBox.innerHTML = svgTxt;
      svgEl = gunBox.querySelector('svg');
      svgEl.classList.add('gun-svg');
  
      /* grupujemy lufę (lufa1 + lufa2) */
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.id = 'lufa';
      [...svgEl.querySelectorAll('#lufa1,#lufa2')].forEach(p => g.appendChild(p));
      svgEl.insertBefore(g, svgEl.firstChild);
  
      /* warstwa overlayów */
      const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      layer.id = 'color-overlays';
      svgEl.appendChild(layer);
  
      PARTS.forEach(p => {
        const src = svgEl.querySelector('#' + p.id);
        if (!src) return;
        ['1', '2'].forEach(n => {
          const ov = src.cloneNode(true);
          ov.id = `color-overlay-${n}-${p.id}`;
          ov.classList.add('color-overlay');
          layer.appendChild(ov);
        });
      });
    }
  
    /* ----------------- UI ----------------- */
    function buildUI() {
      PARTS.forEach(p => {
        const b = document.createElement('button');
        b.dataset.partId = p.id;
        b.onclick = () => selectPart(b, p.id);
        partBox.appendChild(b);
      });
      const mix = document.createElement('button');
      mix.id = 'mix-button'; mix.textContent = 'MIX'; mix.onclick = randomize;
      partBox.appendChild(mix);
  
      resetBtn.onclick = resetAll;
      saveBtn .onclick = savePng;
      PLbtn  .onclick = () => setLang('pl');
      ENbtn  .onclick = () => setLang('en');
  
      buildPalette();
    }
    function selectPart(btn, id) {
      partBox.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      activePart = id;
    }
  
    /* ----------------- Język ----------------- */
    function setLang(l) { lang = l; updateText(); updateSummary(); }
    function updateText() {
      partBox.querySelectorAll('button').forEach(b => {
        const p = PARTS.find(x => x.id === b.dataset.partId);
        if (p) b.textContent = p[lang];
      });
      H1.textContent = lang === 'pl' ? '1. Wybierz część' : '1. Select part';
      H2.textContent = lang === 'pl' ? '2. Wybierz kolor (Cerakote)' : '2. Select color (Cerakote)';
      sumTitle.textContent = lang === 'pl'
        ? 'Twoje zestawienie kolorów Cerakote'
        : 'Your Cerakote color summary';
      PLbtn.classList.toggle('active', lang === 'pl');
      ENbtn.classList.toggle('active', lang === 'en');
    }
  
    /* ----------------- Paleta ----------------- */
    function buildPalette() {
      palBox.innerHTML = '';
      for (const [name, hex] of Object.entries(COLORS)) {
        const w = document.createElement('div');
        w.className = 'color-swatch-wrapper'; w.title = name;
        w.onclick = () => applyColor(activePart, hex, name);
        const dot = document.createElement('div');
        dot.className = 'color-swatch'; dot.style.backgroundColor = hex;
        const lbl = document.createElement('div');
        lbl.className = 'color-swatch-label'; lbl.textContent = name;
        w.append(dot, lbl); palBox.appendChild(w);
      }
    }
  
    /* ----------------- Kolorowanie ----------------- */
    function applyColor(pid, hex, name) {
      if (!pid) { alert(lang === 'pl' ? 'Najpierw wybierz część!' : 'Select a part first!'); return; }
  
      /* próbujemy overlayy */
      let shapes = [];
      ['1', '2'].forEach(n => {
        const ov = document.getElementById(`color-overlay-${n}-${pid}`);
        if (!ov) return;
        shapes.push(...(ov.tagName === 'g'
          ? [...ov.querySelectorAll('path,polygon,ellipse,circle,rect')]
          : [ov]));
      });
  
      /* jeśli overlayów brak (np. błąd z lufą) – łapiemy oryginalne ścieżki */
      if (!shapes.length && svgEl) {
        shapes = [...svgEl.querySelectorAll(
          `#${pid} path,#${pid} polygon,#${pid} ellipse,#${pid} circle,#${pid} rect`
        )];
      }
  
      shapes.forEach(s => s.style.fill = hex);
      selections[pid] = name;
      updateSummary();
    }
    function defaultBlack() {
      const def = 'H-146 Graphite Black', hex = COLORS[def];
      PARTS.forEach(p => { selections[p.id] = def; applyColor(p.id, hex, def); });
    }
    function randomize() {
      const keys = Object.keys(COLORS);
      PARTS.forEach(p => {
        const n = keys[Math.floor(Math.random() * keys.length)];
        applyColor(p.id, COLORS[n], n);
      });
    }
    function resetAll() {
      document.querySelectorAll('.color-overlay').forEach(ov => {
        const shapes = ov.tagName === 'g'
          ? ov.querySelectorAll('path,polygon,ellipse,circle,rect')
          : [ov];
        shapes.forEach(s => s.style.fill = 'transparent');
      });
      Object.keys(selections).forEach(k => delete selections[k]);
      partBox.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
      activePart = null;
      updateSummary();
    }
  
    /* ----------------- Summary ----------------- */
    function updateSummary() {
      sumList.innerHTML = '';
      PARTS.forEach(p => {
        const c = selections[p.id]; if (!c) return;
        const div = document.createElement('div');
        div.textContent = `${p[lang]} – ${c}`; sumList.appendChild(div);
      });
      equalizeHeights();
    }
  
    /* wyrównaj wysokość listy do palety */
    function equalizeHeights() {
      const h = palScroll.getBoundingClientRect().height;
      sumBox.style.height = h + 'px';
    }
  
    /* ----------------- Eksport PNG ----------------- */
    async function savePng() {
      const svg = document.querySelector('.gun-svg'); if (!svg) return;
  
      const lines = PARTS.map(p => selections[p.id]
        ? `${p[lang]} – ${selections[p.id]}` : null).filter(Boolean);
  
      const scale = 2;
      const box = svg.getBBox();
      const W = box.width * scale + PANEL_W;
      const H = box.height * scale;
  
      const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H });
      const ctx = canvas.getContext('2d');
  
      /* tło */
      const base = new Image(); base.src = TEXTURE; base.onload = drawAll; base.onerror = () => alert('Błąd tekstury');
  
      async function drawAll() {
        ctx.drawImage(base, 0, 0, box.width * scale, H);
  
        /* nakładki */
        await Promise.all([...svg.querySelectorAll('.color-overlay')]
          .filter(ov => ov.style.fill && ov.style.fill !== 'transparent')
          .map(ov => {
            const tmp = `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"${svg.getAttribute('viewBox')}\"><g style=\"mix-blend-mode:hard-light;opacity:.45;\">${ov.outerHTML}</g></svg>`;
            const url = URL.createObjectURL(new Blob([tmp], { type: 'image/svg+xml' }));
            return new Promise(res => {
              const img = new Image();
              img.onload = () => { ctx.drawImage(img, 0, 0, box.width * scale, H); URL.revokeObjectURL(url); res(); };
              img.src = url;
            });
          }));
  
        /* panel tekstowy */
        const x0 = box.width * scale;
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(x0, 0, PANEL_W, H);
  
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${FONT_PX}px sans-serif`;
        lines.forEach((t, i) =>
          ctx.fillText(t, x0 + PAD, PAD + FONT_PX * i * 1.4)
        );
  
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'weapon-wizards-projekt.png';
        link.click();
      }
    }
  });
  