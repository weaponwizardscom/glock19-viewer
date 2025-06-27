document.addEventListener("DOMContentLoaded",()=>{

  /* === KONFIG === */
  const SVG_FILE="g17.svg";
  const TEXTURE ="img/glock17.png";
  const BG      =["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];
  
  const PRICE={zamek:400,szkielet:400,spust:150,lufa:200,zerdz:50,pazur:50,
               zrzut:50,blokadap:50,blokada2:50,pin:50,stopka:150}; // płytka = 0
  const MIX2=800, MIXN=1000;
  
  /* === DOM === */
  const $=id=>document.getElementById(id);
  // Główne elementy
  const gunBox=$("gun-view"), priceBox=$("price"), summaryList=$("summary-list");
  const bgBtn=$("bg-btn"), saveBtn=$("save-btn");
  
  // Kontrolki Desktop
  const partsBoxDesktop=$("parts-desktop"), paletteDesktop=$("palette-desktop"), resetBtnDesktop=$("reset-btn-desktop");
  const langPlDesktop=$("pl-desktop"), langEnDesktop=$("en-desktop");
  const hPartsDesktop=$("h-parts-desktop"), hColDesktop=$("h-col-desktop");
  
  // Kontrolki Mobile
  const partsBoxMobile=$("parts-mobile"), paletteMobile=$("palette-mobile"), resetBtnMobile=$("reset-btn-mobile");
  const langPlMobile=$("pl-mobile"), langEnMobile=$("en-mobile");
  const hPartsMobile=$("h-parts-mobile"), hColMobile=$("h-col-mobile");

  // Modal
  const sendBtn=$("send-btn"),modal=$("modal"),mSend=$("m-send"),mCancel=$("m-cancel"),
        mName=$("m-name"),mMail=$("m-mail"),mPhone=$("m-phone");
  const modalTitle=$("modal-title"),modalNote=$("modal-note");
  
  /* === DANE APLIKACJI (ładowane z JSON) === */
  let PARTS = [];
  let COLORS = {};
  
  /* === STAN === */
  let lang="pl", selections={}, activePart=null, bgIdx=0;
  
  /* === INIT === */
  async function initializeApp() {
      try {
          // Krok 1: Pobierz dane konfiguracyjne (części i kolory)
          const [partsData, colorsData] = await Promise.all([
              fetch('data/parts.json').then(res => res.json()),
              fetch('data/colors.json').then(res => res.json())
          ]);
          
          PARTS = partsData;
          COLORS = colorsData;

          // Krok 2: Kontynuuj inicjalizację, gdy dane są już dostępne
          await preloadBGs();
          await loadSvg();
          buildUI(partsBoxDesktop, paletteDesktop);
          buildUI(partsBoxMobile, paletteMobile);
          setupGlobalEvents();
          defaultBlack();
          changeBg();
          
      } catch (error) {
          console.error("Błąd inicjalizacji aplikacji:", error);
          gunBox.innerHTML = "<p style='text-align:center;padding-top:20px;color:red'>Nie udało się załadować danych aplikacji. Sprawdź pliki w folderze /data.</p>";
      }
  }

  initializeApp();
  
  /* Preload BG */
  function preloadBGs(){BG.forEach(src=>{const i=new Image();i.src=src;});}
  
  /* SVG */
  async function loadSvg(){
    gunBox.innerHTML=await fetch(SVG_FILE).then(r=>r.text());
    const svg=gunBox.querySelector("svg");const layer=document.createElementNS("http://www.w3.org/2000/svg","g");
    layer.id="color-overlays";svg.appendChild(layer);
    PARTS.filter(p=>!p.disabled).forEach(p=>{
      const base=svg.querySelector("#"+p.id);if(!base)return;
      ["1","2"].forEach(n=>{const ov=base.cloneNode(true);ov.id=`color-overlay-${n}-${p.id}`;ov.classList.add("color-overlay");layer.appendChild(ov);});
    });
  }
  
  /* Budowanie interfejsu (reużywalna funkcja) */
  function buildUI(partsContainer, paletteContainer){
    /* Części */
    PARTS.forEach(p=>{
      const b=document.createElement("button");
      b.textContent=p[lang];b.dataset.id=p.id;
      if(p.disabled){b.classList.add("disabled");b.disabled=true;}
      else b.onclick=()=>selectPart(p.id);
      partsContainer.appendChild(b);
    });
    /* Mix */
    ["MIX (≤2)","MIX (3+)"].forEach((txt,i)=>{
      const m=document.createElement("button");m.className="mix";m.textContent=txt;
      m.onclick=()=>mix(i?undefined:2);partsContainer.appendChild(m);
    });
    /* Paleta */
    Object.entries(COLORS).forEach(([full,hex])=>{
      const [code,...rest]=full.split(" ");const name=rest.join(" ");
      const sw=document.createElement("div");sw.className="sw";sw.title=full;
      sw.onclick=()=>applyColor(activePart,hex,code);
      sw.innerHTML=`<div class="dot" style="background:${hex}"></div><div class="lbl">${code}<br>${name}</div>`;
      paletteContainer.appendChild(sw);
    });
  }

  /* Globalne eventy */
  function setupGlobalEvents() {
      bgBtn.onclick=changeBg;
      saveBtn.onclick=savePng;
      
      resetBtnDesktop.onclick=resetAll;
      resetBtnMobile.onclick=resetAll;

      langPlDesktop.onclick=()=>setLang("pl");
      langEnDesktop.onclick=()=>setLang("en");
      langPlMobile.onclick=()=>setLang("pl");
      langEnMobile.onclick=()=>setLang("en");

      sendBtn.onclick=()=>modal.classList.remove("hidden");
      mCancel.onclick=()=>modal.classList.add("hidden");
      mSend.onclick=sendMail;
  }
  
  /* Zmiana języka */
  function setLang(l){
      lang=l;
      document.querySelectorAll(".parts button").forEach(b=>{
          const p=PARTS.find(x=>x.id===b.dataset.id);
          if(p && !b.classList.contains('mix')) b.textContent=p[lang];
      });

      hPartsDesktop.textContent=l==="pl"?"1. Wybierz część":"1. Select part";
      hColDesktop.textContent=l==="pl"?"2. Wybierz kolor (Cerakote)":"2. Select colour (Cerakote)";
      hPartsMobile.textContent=l==="pl"?"1. Wybierz część":"1. Select part";
      hColMobile.textContent=l==="pl"?"2. Wybierz kolor (Cerakote)":"2. Select colour (Cerakote)";
      
      bgBtn.textContent =l==="pl"?"Zmień Tło":"Change background";
      saveBtn.textContent=l==="pl"?"Zapisz Obraz":"Save image";
      resetBtnDesktop.textContent=l==="pl"?"Resetuj Kolory":"Reset colours";
      resetBtnMobile.textContent=l==="pl"?"Resetuj Kolory":"Reset colours";
      sendBtn.textContent =l==="pl"?"Wyślij do Wizards!":"Send to Wizards!";
      mSend.textContent   =l==="pl"?"Wyślij":"Send";
      mCancel.textContent =l==="pl"?"Anuluj":"Cancel";

      mName.placeholder   =l==="pl"?"Imię":"Name";
      mMail.placeholder   =l==="pl"?"E-mail":"E-mail";
      mPhone.placeholder  =l==="pl"?"Telefon":"Phone";
      modalTitle.textContent=l==="pl"?"Wyślij projekt":"Send project";
      modalNote.textContent =l==="pl"?"Po wysłaniu dołącz pobrany plik PNG." :"After sending, attach the downloaded PNG.";

      [langPlDesktop, langPlMobile].forEach(f=>f.classList.toggle("active", l==="pl"));
      [langEnDesktop, langEnMobile].forEach(f=>f.classList.toggle("active", l==="en"));
      
      updateSummary();
  }
  
  /* Wybór części */
  function selectPart(id){
    document.querySelectorAll(".parts button").forEach(b=>{
      b.classList.toggle("selected", b.dataset.id === id);
    });
    activePart=id;
  }
  
  /* Aplikowanie koloru */
  function applyColor(id,hex,code){
    if(!id){alert(lang==="pl"?"Najpierw wybierz część":"Select a part first");return;}
    ["1","2"].forEach(n=>{
      const ov=document.getElementById(`color-overlay-${n}-${id}`);
      if(ov)(ov.tagName==="g"?ov.querySelectorAll("*"):[ov]).forEach(s=>s.style.fill=hex);
    });
    selections[id]=code;updateSummary();updatePrice();
  }
  
  /* MIX */
  function mix(maxCols){
    const keys=Object.keys(COLORS),used=new Set();
    PARTS.filter(p=>!p.disabled).forEach(p=>{
      let pick;
      do{pick=keys[Math.floor(Math.random()*keys.length)];}
      while(maxCols && used.size>=maxCols && !used.has(pick.split(" ")[0]));
      used.add(pick.split(" ")[0]);
      applyColor(p.id,COLORS[pick],pick.split(" ")[0]);
    });
  }
  
  /* Reset */
  function resetAll(){
    document.querySelectorAll(".color-overlay").forEach(o=>{
      (o.tagName==="g"?o.querySelectorAll("*"):[o]).forEach(s=>s.style.fill="transparent");
    });
    selections={};activePart=null;
    document.querySelectorAll(".parts button").forEach(b => b.classList.remove("selected"));
    updateSummary();updatePrice();
  }
  
  /* Domyślny kolor */
  function defaultBlack(){PARTS.filter(p=>!p.disabled).forEach(p=>applyColor(p.id,COLORS["H-146 Graphite Black"],"H-146"));}
  
  /* Zmiana tła */
  function changeBg(){bgIdx=(bgIdx+1)%BG.length;gunBox.style.backgroundImage=`url('${BG[bgIdx]}')`;}
  
  /* Podsumowanie i cena */
  function updateSummary(){
    summaryList.innerHTML="";
    PARTS.forEach(p=>{if(selections[p.id]){const d=document.createElement("div");d.textContent=`${p[lang]} – ${selections[p.id]}`;summaryList.appendChild(d);}});
  }
  function updatePrice(){
    const cols=new Set(Object.values(selections)).size;
    let total=Object.keys(selections).reduce((s,id)=>s+(PRICE[id]||0),0);
    total=cols<=2?Math.min(total,MIX2):Math.min(total,MIXN);
    priceBox.innerHTML=(lang==="pl"?"Szacowany koszt:&nbsp;&nbsp;":"Estimated cost:&nbsp;&nbsp;")+total+"&nbsp;zł";
    return total;
  }
  
  /* Zapis do PNG */
  const loadImg=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s;});
  async function savePng(){
    const cvs=document.createElement("canvas");cvs.width=1600;cvs.height=1200;const ctx=cvs.getContext("2d");
    ctx.drawImage(await loadImg(BG[bgIdx]),0,0,1600,1200);
    ctx.drawImage(await loadImg(TEXTURE),0,0,1600,1200);
    const svg=gunBox.querySelector("svg");
    await Promise.all([...svg.querySelectorAll(".color-overlay")].filter(o=>o.style.fill && o.style.fill !== "transparent").map(async ov=>{
      const xml=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute("viewBox")}"><g style="mix-blend-mode:hard-light;opacity:.45">${ov.outerHTML}</g></svg>`;
      const url=URL.createObjectURL(new Blob([xml],{type:"image/svg+xml"}));
      ctx.drawImage(await loadImg(url),0,0,1600,1200);URL.revokeObjectURL(url);
    }));
    const a=document.createElement("a");a.href=cvs.toDataURL("image/png");a.download="weapon-wizards.png";a.click();
    return a.href;
  }
  
  /* Wysyłka maila */
  async function sendMail(){
    const name=mName.value.trim(),mail=mMail.value.trim(),tel=mPhone.value.trim();
    if(!name||!mail){alert(lang==="pl"?"Podaj imię i e-mail":"Please provide name and email");return;}
    await savePng();
    const cost=updatePrice();
    const body=[(lang==="pl"?"Imię":"Name")+": "+name,
                "Telefon: "+tel,"E-mail: "+mail,
                (lang==="pl"?"Koszt":"Cost")+": "+cost+" zł","","Kolory:",
                ...PARTS.map(p=>`${p[lang]} – ${selections[p.id]||"–"}`),"",
                (lang==="pl"?"Dołącz pobrany plik PNG.":"Attach the downloaded PNG.")].join("%0D%0A");
    location.href=`mailto:contact@weapon-wizards.com?subject=Projekt%20Weapon%20Wizards&cc=${encodeURIComponent(mail)}&body=${body}`;
    modal.classList.add("hidden");
  }
});