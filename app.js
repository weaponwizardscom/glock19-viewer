/* --- pliki widoków ---------------------------------------------- */
const SVG_FILES = ["g17.svg", "g172.svg"];     // możesz dodać kolejne
const TEXTURE   = "img/glock17.png";           // zostawiamy jedną teksturę
const BG        = ["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];

/* --- ceny, części, kolory pozostają bez zmian -------------------- */
const PRICE={zamek:400,szkielet:400,spust:150,lufa:200,zerdz:50,pazur:50,
             zrzut:50,blokadap:50,blokada2:50,pin:50,stopka:150};
const MIX2=800,MIXN=1000;

const PARTS=[{id:"zamek",pl:"Zamek",en:"Slide"},{id:"szkielet",pl:"Szkielet",en:"Frame"},
 {id:"spust",pl:"Spust",en:"Trigger"},{id:"lufa",pl:"Lufa",en:"Barrel"},
 {id:"zerdz",pl:"Żerdź",en:"Recoil spring"},{id:"pazur",pl:"Pazur",en:"Extractor"},
 {id:"zrzut",pl:"Zrzut magazynka",en:"Magazine catch"},{id:"blokadap",pl:"Blokada zamka",en:"Slide lock"},
 {id:"blokada2",pl:"Zrzut zamka",en:"Slide stop lever"},{id:"pin",pl:"Pin",en:"Trigger pin"},
 {id:"stopka",pl:"Stopka",en:"Floorplate"},{id:"plytka",pl:"Płytka",en:"Back plate",disabled:true}];

const COLORS={/* skrócone */};
Object.assign(COLORS,{
 "H-140 Bright White":"#FFFFFF","H-242 Hidden White":"#E5E4E2",/* … (cała Twoja lista) … */"H-151 Satin Aluminum":"#C0C0C0"
});

/* --- DOM ---------------------------------------------------------- */
const $ = id => document.getElementById(id);
const gunBox=$("gun-view"), partsBox=$("parts"), palette=$("palette"), priceBox=$("price");
const bgBtn=$("bg-btn"),saveBtn=$("save-btn"),resetBtn=$("reset-btn");
const prevBtn=$("prev"),nextBtn=$("next");

/* --- STAN --------------------------------------------------------- */
let lang="pl", selections={},activePart=null,bgIdx=0, viewIdx=0;

/* --- INIT --------------------------------------------------------- */
(async()=>{await preloadBGs();await loadSvg();buildUI();defaultBlack();changeBg();})();
function preloadBGs(){BG.forEach(src=>{const i=new Image();i.src=src;});}

/* --- ŁADOWANIE SVG ------------------------------------------------ */
async function loadSvg(){
  gunBox.querySelectorAll("svg").forEach(s=>s.remove());  // usuń stare
  const svgText = await fetch(SVG_FILES[viewIdx]).then(r=>r.text());
  gunBox.insertAdjacentHTML("afterbegin",svgText);
  const svg = gunBox.querySelector("svg");
  const layer=document.createElementNS("http://www.w3.org/2000/svg","g");
  layer.id="color-overlays";svg.appendChild(layer);

  PARTS.filter(p=>!p.disabled).forEach(p=>{
    const base=svg.querySelector("#"+p.id);if(!base)return;
    ["1","2"].forEach(n=>{
      const ov=base.cloneNode(true);
      ov.id=`color-overlay-${n}-${p.id}`;
      ov.classList.add("color-overlay");
      layer.appendChild(ov);
    });
  });
  reapplyColours();
}

/* --- UI budowanie ------------------------------------------------- */
function buildUI(){
  // części
  PARTS.forEach(p=>{
    const b=document.createElement("button");
    b.textContent=p[lang];b.dataset.id=p.id;
    if(p.disabled){b.classList.add("disabled");b.disabled=true;}
    else b.onclick=()=>selectPart(b,p.id);
    partsBox.appendChild(b);
  });
  // mix
  ["MIX (≤2)","MIX (3+)"].forEach((txt,i)=>{
    const m=document.createElement("button");m.className="mix";m.textContent=txt;
    m.onclick=()=>mix(i?undefined:2);partsBox.appendChild(m);
  });
  // paleta
  Object.entries(COLORS).forEach(([full,hex])=>{
    const [code,...rest]=full.split(" ");const name=rest.join(" ");
    const sw=document.createElement("div");sw.className="sw";sw.title=full;
    sw.onclick=()=>applyColor(activePart,hex,code);
    sw.innerHTML=`<div class="dot" style="background:${hex}"></div><div class="lbl">${code}<br>${name}</div>`;
    palette.appendChild(sw);
  });
  // przyciski
  bgBtn.onclick=changeBg;saveBtn.onclick=savePng;resetBtn.onclick=resetAll;
  prevBtn.onclick=()=>{viewIdx=(viewIdx+SVG_FILES.length-1)%SVG_FILES.length;loadSvg();}
  nextBtn.onclick=()=>{viewIdx=(viewIdx+1)%SVG_FILES.length;loadSvg();}
}

/* --- wybór części ------------------------------------------------- */
function selectPart(btn,id){
  partsBox.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
  btn.classList.add("selected");activePart=id;
}

/* --- nakładanie koloru ------------------------------------------- */
function applyColor(id,hex,code){
  if(!id){alert(lang==="pl"?"Najpierw wybierz część":"Select a part first");return;}
  ["1","2"].forEach(n=>{
    const ov=document.getElementById(`color-overlay-${n}-${id}`);
    if(ov)(ov.tagName==="g"?ov.querySelectorAll("*"):[ov]).forEach(s=>s.style.fill=hex);
  });
  selections[id]=code;updateSummary();updatePrice();
}
function reapplyColours(){
  Object.entries(selections).forEach(([id,code])=>{
    const hex=Object.entries(COLORS).find(([key])=>key.startsWith(code))[1];
    applyColor(id,hex,code);
  });
}

/* --- MIX ---------------------------------------------------------- */
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

/* --- reset -------------------------------------------------------- */
function resetAll(){
  document.querySelectorAll(".color-overlay").forEach(o=>{
    (o.tagName==="g"?o.querySelectorAll("*"):[o]).forEach(s=>s.style.fill="transparent");
  });
  selections={};activePart=null;updateSummary();updatePrice();
}

/* --- domyślny czarny --------------------------------------------- */
function defaultBlack(){
  PARTS.filter(p=>!p.disabled).forEach(p=>applyColor(p.id,COLORS["H-146 Graphite Black"],"H-146"));
}

/* --- tło ---------------------------------------------------------- */
function changeBg(){bgIdx=(bgIdx+1)%BG.length;gunBox.style.backgroundImage=`url('${BG[bgIdx]}')`;}

/* --- podsumowanie i cena ----------------------------------------- */
function updateSummary(){
  const list=$("summary-list");list.innerHTML="";
  PARTS.forEach(p=>{
    if(selections[p.id]){
      const d=document.createElement("div");
      d.textContent=`${p[lang]} – ${selections[p.id]}`;
      list.appendChild(d);
    }
  });
}
function updatePrice(){
  const cols=new Set(Object.values(selections)).size;
  let total=Object.keys(selections).reduce((s,id)=>s+(PRICE[id]||0),0);
  total=cols<=2?Math.min(total,MIX2):Math.min(total,MIXN);
  priceBox.innerHTML=(lang==="pl"?"Szacowany koszt:&nbsp;&nbsp;":"Estimated cost:&nbsp;&nbsp;")+total+"&nbsp;zł";
  return total;
}

/* --- PNG save (bez zmian) ---------------------------------------- */
const loadImg=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s;});
async function savePng(){ /*  ... zostawiam bez zmian, działa jak było ... */ }
