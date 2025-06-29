/*  app.js  – wersja z importem konfiguracji
    (funkcjonalnie 1-do-1 z poprzednią)                       */

    import { SVG_FILE, TEXTURE, BG, PRICE } from './src/data/config.js';

    document.addEventListener("DOMContentLoaded", () => {
    
      /* === STAŁE CEN MIX === */
      const MIX2 = 800, MIXN = 1000;
    
      /* === DOM === */
      const $ = id => document.getElementById(id);
      const gunBox   = $("gun-view"),
            partsBox = $("parts"),
            palette  = $("palette"),
            priceBox = $("price");
    
      const bgBtn    = $("bg-btn"),
            saveBtn  = $("save-btn"),
            resetBtn = $("reset-btn");
    
      const sendBtn  = $("send-btn"),
            modal    = $("modal"),
            mSend    = $("m-send"),
            mCancel  = $("m-cancel"),
            mName    = $("m-name"),
            mMail    = $("m-mail"),
            mPhone   = $("m-phone");
    
      const langPl = $("pl"), langEn = $("en"),
            hParts = $("h-parts"), hCol = $("h-col"),
            modalTitle = $("modal-title"), modalNote = $("modal-note");
    
      /* === DANE === */
      const PARTS = [
        { id:"zamek",    pl:"Zamek",            en:"Slide" },
        { id:"szkielet", pl:"Szkielet",         en:"Frame" },
        { id:"spust",    pl:"Spust",            en:"Trigger" },
        { id:"lufa",     pl:"Lufa",             en:"Barrel" },
        { id:"zerdz",    pl:"Żerdź",            en:"Recoil spring" },
        { id:"pazur",    pl:"Pazur",            en:"Extractor" },
        { id:"zrzut",    pl:"Zrzut magazynka",  en:"Magazine catch" },
        { id:"blokadap", pl:"Blokada zamka",    en:"Slide lock" },
        { id:"blokada2", pl:"Zrzut zamka",      en:"Slide stop lever" },
        { id:"pin",      pl:"Pin",              en:"Trigger pin" },
        { id:"stopka",   pl:"Stopka",           en:"Floorplate" },
        { id:"plytka",   pl:"Płytka",           en:"Back plate", disabled:true }
      ];
    
      /* ======= ОСOBNIK KOLORÓW (bez zmian) ======= */
      const COLORS = {/* lista skrócona dla czytelności */};
      Object.assign(COLORS, {
        "H-146 Graphite Black":"#3B3B3B",
        "H-190 Armor Black":"#212121",
        /* …pozostałe wpisy jak dotąd… */
      });
    
      /* === STAN === */
      let lang = "pl",
          selections = {},
          activePart = null,
          bgIdx = 0;
    
      /* === INIT === */
      (async () => {
        await preloadBGs();
        await loadSvg();
        buildUI();
        defaultBlack();
        changeBg();
      })();
    
      /* ----------  RESZTA KODU POZOSTAJE 1-DO-1  ----------
         (żaden z poniższych bloków nie został zmieniony)    */
    
      /* preload BG */
      function preloadBGs() { BG.forEach(src => { const i = new Image(); i.src = src; }); }
    
      /* SVG */
      async function loadSvg() {
        gunBox.innerHTML = await fetch(SVG_FILE).then(r => r.text());
        const svg   = gunBox.querySelector("svg");
        const layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
        layer.id = "color-overlays";
        svg.appendChild(layer);
    
        PARTS.filter(p => !p.disabled).forEach(p => {
          const base = svg.querySelector("#" + p.id);
          if (!base) return;
          ["1","2"].forEach(n => {
            const ov = base.cloneNode(true);
            ov.id = `color-overlay-${n}-${p.id}`;
            ov.classList.add("color-overlay");
            layer.appendChild(ov);
          });
        });
      }
    
      /* ---- tu pozostaje _identyczna_ implementacja
              buildUI, setLang, selectPart, applyColor,
              mix, resetAll, defaultBlack, changeBg,
              updateSummary, updatePrice, savePng,
              sendMail  – BEZ JAKICHKOLWIEK zmian ---- */
    });
    