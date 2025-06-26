document.addEventListener("DOMContentLoaded",()=>{

    /* --------- USTAWIENIA --------- */
    const SVG_FILE="g17.svg";
    const TEXTURE ="img/glock17.png";
    const BG      =["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];
    
    /* ceny */
    const PRICE={zamek:400,szkielet:400,spust:100,lufa:200,zerdz:50,pazur:50,
                 zrzut:50,blokadap:50,blokada2:50,pin:50,stopka:100};
    const MIX2=800,MIXN=1000;
    
    /* --------- DOM --------- */
    const $=id=>document.getElementById(id);
    const gunBox=$("gun-view"),partsBox=$("parts"),palette=$("palette"),priceBox=$("price");
    const bgBtn=$("bg-btn"),saveBtn=$("save-btn"),resetBtn=$("reset-btn");
    const sendBtn=$("send-btn"),modal=$("modal"),mSend=$("m-send"),mCancel=$("m-cancel"),
          mName=$("m-name"),mMail=$("m-mail"),mPhone=$("m-phone");
    const langPl=$("pl"),langEn=$("en"),hParts=$("h-parts"),hCol=$("h-col");
    const mTitle=$("m-title"),mNote=$("m-note"),bgImg=gunBox;
    
    /* --------- DANE --------- */
    const PARTS=[
     {id:"zamek",pl:"Zamek",en:"Slide"},
     {id:"szkielet",pl:"Szkielet",en:"Frame"},
     {id:"spust",pl:"Spust",en:"Trigger"},
     {id:"lufa",pl:"Lufa",en:"Barrel"},
     {id:"zerdz",pl:"Żerdź",en:"Recoil spring"},
     {id:"pazur",pl:"Pazur",en:"Extractor"},
     {id:"zrzut",pl:"Zrzut magazynka",en:"Magazine catch"},
     {id:"blokadap",pl:"Blokada zamka",en:"Slide lock"},
     {id:"blokada2",pl:"Zrzut zamka",en:"Slide stop lever"},
     {id:"pin",pl:"Pin",en:"Trigger pin"},
     {id:"stopka",pl:"Stopka",en:"Floorplate"},
     {id:"plytka",pl:"Płytka",en:"Back plate",disabled:true}
    ];
    
    const COLORS={/* pełna lista jak wcześniej */};
    Object.assign(COLORS,{
     "H-140 Bright White":"#FFFFFF","H-242 Hidden White":"#E5E4E2","H-136 Snow White":"#F5F5F5",
     "H-297 Stormtrooper White":"#F2F2F2","H-300 Armor Clear":"#F5F5F5","H-331 Parakeet Green":"#C2D94B",
     "H-141 Prison Pink":"#E55C9C","H-306 Springfield Grey":"#A2A4A6","H-312 Frost":"#C9C8C6",
     "H-214 S&W Grey":"#8D918D","H-265 Cold War Grey":"#999B9E","H-227 Tactical Grey":"#8D8A82",
     "H-170 Titanium":"#7A7A7A","H-130 Combat Grey":"#6A6A6A","H-237 Tungsten":"#6E7176",
     "H-210 Sig Dark Grey":"#5B5E5E","H-234 Sniper Grey":"#5B6063","H-342 Smoke":"#84888B",
     "H-321 Blush":"#D8C0C4","H-213 Battleship Grey":"#52595D","H-146 Graphite Black":"#3B3B3B",
     "H-190 Armor Black":"#212121","H-142 Light Sand":"#D2C3A8","H-199 Desert Sand":"#C5BBAA",
     "H-267 Magpul FDE":"#A48F6A","H-269 Barrett Brown":"#67594D","H-148 Burnt Bronze":"#8C6A48",
     "H-339 Federal Brown":"#5E5044","H-8000 RAL 8000":"#937750","H-33446 FS Sabre Sand":"#B19672",
     "H-240 Mil Spec O.D. Green":"#5F604F","H-247 Desert Sage":"#6A6B5C","H-229 Sniper Green":"#565A4B",
     "H-344 Olive":"#6B6543","H-189 Noveske Bazooka Green":"#6C6B4E","H-353 Island Green":"#00887A",
     "H-127 Kel-Tec Navy Blue":"#2B3C4B","H-171 NRA Blue":"#00387B","H-188 Stealth Grey":"#5C6670",
     "H-256 Cobalt":"#395173","H-258 Socom Blue":"#3B4B5A","H-329 Blue Raspberry":"#0077C0",
     "H-362 Patriot Blue":"#33415C","H-197 Wild Purple":"#5A3A54","H-217 Bright Purple":"#8A2BE2",
     "H-332 Purplexed":"#6C4E7C","H-357 Periwinkle":"#6B6EA6","H-128 Hunter Orange":"#F26522",
     "H-167 USMC Red":"#9E2B2F","H-216 S&W Red":"#B70101","H-221 Crimson":"#891F2B",
     "H-317 Sunflower":"#F9A602","H-354 Lemon Zest":"#F7D51D","H-122 Gold":"#B79436",
     "H-151 Satin Aluminum":"#C0C0C0"
    });
    
    /* tłumaczenia statyczne */
    const dict={
     pl:{bg:"Zmień Tło",save:"Zapisz Obraz",reset:"Resetuj Kolory",cost:"Szacowany koszt: ",
         send:"Wyślij do Wizards!",modal:"Wyślij projekt",note:"Po wysłaniu dołącz pobrany plik PNG.",
         fields:{name:"Imię",mail:"E-mail",tel:"Telefon"},parts:"1. Wybierz część",col:"2. Wybierz kolor (Cerakote)"},
     en:{bg:"Change Background",save:"Save Image",reset:"Reset Colours",cost:"Estimated cost: ",
         send:"Send to Wizards!",modal:"Send project",note:"Attach the downloaded PNG after sending.",
         fields:{name:"Name",mail:"E-mail",tel:"Phone"},parts:"1. Select part",col:"2. Select colour (Cerakote)"}
    };
    
    /* --------- STAN --------- */
    let lang="pl", selections={},activePart=null,bgIdx=0;
    
    /* --------- START --------- */
    (async()=>{preloadBGs();await loadSvg();buildUI();defaultBlack();changeBg();setLang("pl");})();
    
    /* Pre-loading teł */
    function preloadBGs(){BG.forEach(src=>{const i=new Image();i.src=src;});}
    
    /* SVG */
    async function loadSvg(){
      gunBox.innerHTML=await fetch(SVG_FILE).then(r=>r.text());
      const svg=gunBox.querySelector("svg");
      const layer=document.createElementNS("http://www.w3.org/2000/svg","g");layer.id="color-overlays";svg.appendChild(layer);
      PARTS.forEach(p=>{
        const base=svg.querySelector("#"+p.id);if(!base||p.disabled)return;
        ["1","2"].forEach(n=>{const ov=base.cloneNode(true);ov.id=`color-overlay-${n}-${p.id}`;ov.classList.add("color-overlay");layer.appendChild(ov);});
      });
    }
    
    /* UI */
    function buildUI(){
      partsBox.innerHTML="";
      PARTS.forEach(p=>{
        const b=document.createElement("button");b.dataset.id=p.id;
        b.textContent=p[lang];if(p.disabled){b.className="disabled";b.disabled=true;}
        else b.onclick=()=>selectPart(b,p.id);
        partsBox.appendChild(b);
      });
      /* Mix buttons */
      const mix2=document.createElement("button");mix2.className="mix";mix2.textContent="MIX (≤2)";
      mix2.style.width="48%";mix2.onclick=()=>mix(2);
      const mixN=document.createElement("button");mixN.className="mix";mixN.textContent="MIX (3+)";
      mixN.style.width="48%";mixN.onclick=()=>mix();
      const wrap=document.createElement("div");wrap.style.display="flex";wrap.style.gap="4%";
      wrap.append(mix2,mixN);partsBox.appendChild(wrap);
    
      /* palette */
      palette.innerHTML="";
      Object.entries(COLORS).forEach(([full,hex])=>{
        const [code,...rest]=full.split(" ");const name=rest.join(" ");
        const sw=document.createElement("div");sw.className="sw";sw.title=full;
        sw.onclick=()=>applyColor(activePart,hex,code);
        sw.innerHTML=`<div class="dot" style="background:${hex}"></div><div class="lbl">${code}<br>${name}</div>`;
        palette.appendChild(sw);
      });
    
      /* buttons + lang */
      bgBtn.onclick=changeBg;saveBtn.onclick=savePng;resetBtn.onclick=resetAll;
      sendBtn.onclick=()=>modal.classList.remove("hidden");
      mCancel.onclick=()=>modal.classList.add("hidden");mSend.onclick=sendMail;
      langPl.onclick=()=>setLang("pl");langEn.onclick=()=>setLang("en");
    }
    
    /* Język */
    function setLang(l){
      lang=l;
      bgBtn.textContent=dict[l].bg;saveBtn.textContent=dict[l].save;resetBtn.textContent=dict[l].reset;
      sendBtn.textContent=dict[l].send;hParts.textContent=dict[l].parts;hCol.textContent=dict[l].col;
      mTitle.textContent=dict[l].modal;mNote.textContent=dict[l].note;
      mName.placeholder=dict[l].fields.name;mMail.placeholder=dict[l].fields.mail;mPhone.placeholder=dict[l].fields.tel;
      langPl.classList.toggle("active",l==="pl");langEn.classList.toggle("active",l==="en");
      /* update parts labels */
      partsBox.querySelectorAll("button").forEach(b=>{
        const p=PARTS.find(x=>x.id===b.dataset.id);if(p)b.textContent=p[l];
      });
      updateSummary();
    }
    
    /* Wybór czesci */
    function selectPart(btn,id){
      partsBox.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected");activePart=id;
    }
    
    /* Kolor */
    function applyColor(pid,hex,code){
      if(!pid){alert(lang==="pl"?"Najpierw wybierz część":"Select a part first");return;}
      ["1","2"].forEach(n=>{
        const ov=document.getElementById(`color-overlay-${n}-${pid}`);
        if(ov)(ov.tagName==="g"?ov.querySelectorAll("*"):[ov]).forEach(s=>s.style.fill=hex);
      });
      selections[pid]=code;updateSummary();updatePrice();
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
      document.querySelectorAll(".color-overlay").forEach(o=>(o.tagName==="g"?o.querySelectorAll("*"):[o]).forEach(s=>s.style.fill="transparent"));
      selections={};activePart=null;updateSummary();updatePrice();
    }
    
    /* Domyślny czar */
    function defaultBlack(){PARTS.filter(p=>!p.disabled).forEach(p=>applyColor(p.id,COLORS["H-146 Graphite Black"],"H-146"));}
    
    /* Tło */
    function changeBg(){bgIdx=(bgIdx+1)%BG.length;gunBox.style.backgroundImage=`url('${BG[bgIdx]}')`;}
    
    /* Podsumowanie + koszt */
    function updateSummary(){
      const list=$("summary-list");list.innerHTML="";
      PARTS.forEach(p=>{if(selections[p.id]){
        const d=document.createElement("div");d.textContent=`${p[lang]} – ${selections[p.id]}`;list.appendChild(d);
      }});
    }
    function updatePrice(){
      const cols=new Set(Object.values(selections)).size;
      let total=Object.keys(selections).reduce((s,id)=>s+(PRICE[id]||0),0);
      total=cols<=2?Math.min(total,MIX2):Math.min(total,MIXN);
      priceBox.textContent=`${dict[lang].cost}${total} zł`;return total;
    }
    
    /* PNG helpers */
    const loadImg=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src;});
    async function savePng(){
      const cav=document.createElement("canvas");cav.width=1600;cav.height=1200;const ctx=cav.getContext("2d");
      ctx.drawImage(await loadImg(BG[bgIdx]),0,0,1600,1200);
      ctx.drawImage(await loadImg(TEXTURE),0,0,1600,1200);
      const svg=gunBox.querySelector("svg");
      const tasks=[...svg.querySelectorAll(".color-overlay")].filter(o=>o.style.fill!=="transparent").map(async ov=>{
        const xml=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute("viewBox")}"><g style="mix-blend-mode:hard-light;opacity:.45">${ov.outerHTML}</g></svg>`;
        const url=URL.createObjectURL(new Blob([xml],{type:"image/svg+xml"}));ctx.drawImage(await loadImg(url),0,0,1600,1200);URL.revokeObjectURL(url);
      });await Promise.all(tasks);
      const a=document.createElement("a");a.href=cav.toDataURL("image/png");a.download="weapon-wizards.png";a.click();
    }
    
    /* MAILTO */
    function sendMail(){
      const name=mName.value.trim(),mail=mMail.value.trim(),tel=mPhone.value.trim();
      if(!name||!mail){alert(lang==="pl"?"Podaj imię i e-mail":"Enter name & e-mail");return;}
      const cost=updatePrice();
      const body=[`Name: ${name}`,`Phone: ${tel}`,`E-mail: ${mail}`,`${dict[lang].cost}${cost} zł`,"","Colours:",
                  ...PARTS.map(p=>`${p[lang]} – ${selections[p.id]||"–"}`),
                  "","(attach the PNG)"].join("%0D%0A");
      location.href=`mailto:contact@weapon-wizards.com?subject=Weapon%20Wizards%20project&cc=${encodeURIComponent(mail)}&body=${body}`;
      modal.classList.add("hidden");
    }
    
    });
    