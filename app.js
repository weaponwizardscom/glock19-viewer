/* ===== app.js ===== */
document.addEventListener("DOMContentLoaded", () => {

    /* ------------ stałe ------------ */
    const SVG_FILE="g17.svg";
    const TEXTURE ="img/glock17.png";
    const BG=["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];
    const PRICE={zamek:400,szkielet:400,spust:100,lufa:200,zerdz:50,pazur:50,zrzut:50,blokadap:50,blokada2:50,pin:50,stopka:100};
    const MIX2=800,MIXN=1000;
  
    /* ------------ elementy DOM ------------ */
    const $=id=>document.getElementById(id);
    const gunBox=$("gun-view-container"), partBox=$("part-selection-container"), palBox=$("color-palette");
    const resetBtn=$("reset-button"), saveBtn=$("save-button");
    const mix2Btn=$("mix2-btn"), mixnBtn=$("mixn-btn"), bgBtn=$("bg-button");
    const priceBox=$("price-box"), sumList=$("summary-list");
    const sendBtn=$("send-button"), modal=$("modal"), mSend=$("m-send"), mCancel=$("m-cancel"), mName=$("m-name"), mMail=$("m-mail"), mPhone=$("m-phone");
  
    /* ------------ dane ------------ */
    const PARTS=[{id:"zamek",pl:"Zamek",en:"Slide"},{id:"szkielet",pl:"Szkielet",en:"Frame"},
      {id:"spust",pl:"Spust",en:"Trigger"},{id:"lufa",pl:"Lufa",en:"Barrel"},
      {id:"zerdz",pl:"Żerdź",en:"Recoil spring"},{id:"pazur",pl:"Pazur",en:"Extractor"},
      {id:"zrzut",pl:"Zrzut magazynka",en:"Magazine catch"},
      {id:"blokadap",pl:"Blokada zamka",en:"Slide lock"},
      {id:"blokada2",pl:"Zrzut zamka",en:"Slide stop lever"},
      {id:"pin",pl:"Pin",en:"Trigger pin"},{id:"stopka",pl:"Stopka",en:"Floorplate"}];
  
    const COLORS={
      "H-140":"#FFFFFF","H-242":"#E5E4E2","H-146":"#3B3B3B","H-170":"#7A7A7A",
      "H-190":"#212121","H-265":"#999B9E","H-267":"#A48F6A","H-331":"#0077C0","H-8000":"#937750"
    };
  
    /* ------------ stan ------------ */
    let selections={}, currentBg=0, lang="pl", activePart=null;
  
    /* ------------ INIT ------------ */
    (async ()=>{ await loadSvg(); buildUI(); defaultBlack(); bgBtn.click(); })();
  
    async function loadSvg(){
      gunBox.innerHTML=await fetch(SVG_FILE).then(r=>r.text());
      const svg=gunBox.querySelector("svg");
      const layer=document.createElementNS("http://www.w3.org/2000/svg","g");
      layer.id="color-overlays"; svg.appendChild(layer);
      PARTS.forEach(p=>{
        const base=svg.querySelector("#"+p.id); if(!base) return;
        ["1","2"].forEach(n=>{ const ov=base.cloneNode(true); ov.id=`color-overlay-${n}-${p.id}`; ov.classList.add("color-overlay"); layer.appendChild(ov); });
      });
    }
  
    function buildUI(){
      PARTS.forEach(p=>{
        const b=document.createElement("button"); b.textContent=p[lang]; b.dataset.partId=p.id;
        b.onclick=()=>selectPart(b,p.id); partBox.appendChild(b);
      });
      Object.entries(COLORS).forEach(([code,hex])=>{
        const wrap=document.createElement("div");wrap.className="color-swatch-wrapper";wrap.title=code;
        wrap.onclick=()=>applyColor(activePart,hex,code);
        wrap.innerHTML=`<div class="color-swatch" style="background:${hex}"></div><div class="color-swatch-label">${code}</div>`;
        palBox.appendChild(wrap);
      });
      mix2Btn.onclick=()=>randomize(2); mixnBtn.onclick=()=>randomize();
      bgBtn.onclick =()=>{ currentBg=(currentBg+1)%BG.length; gunBox.style.backgroundImage=`url('${BG[currentBg]}')`; };
      resetBtn.onclick=resetAll; saveBtn.onclick=savePng;
      sendBtn.onclick=()=>modal.classList.remove("hidden");
      mCancel.onclick=()=>modal.classList.add("hidden");
      mSend.onclick=handleMailto;
    }
  
    function selectPart(btn,id){
      partBox.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected"); activePart=id;
    }
  
    function applyColor(pid,hex,label){
      if(!pid){alert("Najpierw wybierz część!");return;}
      ["1","2"].forEach(n=>{
        const ov=document.getElementById(`color-overlay-${n}-${pid}`);
        (ov.tagName==="g"?ov.querySelectorAll("*"):[ov]).forEach(s=>s.style.fill=hex);
      });
      selections[pid]=label; updateSummary(); updatePrice();
    }
  
    function randomize(maxColors){
      const keys=Object.keys(COLORS); const used=new Set();
      PARTS.forEach(p=>{
        let col; do{ col=keys[Math.floor(Math.random()*keys.length)]; }
        while(maxColors && used.size>=maxColors && !used.has(col));
        used.add(col); applyColor(p.id,COLORS[col],col);
      });
    }
  
    function resetAll(){
      document.querySelectorAll(".color-overlay").forEach(o=>{
        (o.tagName==="g"?o.querySelectorAll("*"):[o]).forEach(s=>s.style.fill="transparent");
      });
      selections={}; activePart=null;
      partBox.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
      updateSummary(); updatePrice();
    }
    function defaultBlack(){ PARTS.forEach(p=>applyColor(p.id,COLORS["H-146"],"H-146")); }
  
    function updateSummary(){
      sumList.innerHTML=""; PARTS.forEach(p=>{
        if(selections[p.id]){ const d=document.createElement("div"); d.textContent=`${p[lang]} – ${selections[p.id]}`; sumList.appendChild(d); }
      });
    }
    function updatePrice(){
      const colors=new Set(Object.values(selections)).size;
      let total=Object.keys(selections).reduce((s,k)=>s+(PRICE[k]||0),0);
      total=colors<=2?Math.min(total,MIX2):Math.min(total,MIXN);
      priceBox.textContent=`Szacowany koszt: ${total} zł`; return total;
    }
  
    /* ---------- PNG export & download ---------- */
    async function exportPng(){
      const svg=gunBox.querySelector("svg");
      const cvs=document.createElement("canvas"); cvs.width=1600; cvs.height=1200;
      const ctx=cvs.getContext("2d");
      await loadImg(BG[currentBg],i=>ctx.drawImage(i,0,0,1600,1200));
      await loadImg(TEXTURE ,i=>ctx.drawImage(i,0,0,1600,1200));
      await Promise.all([...svg.querySelectorAll(".color-overlay")].filter(o=>o.style.fill!=="transparent").map(ov=>{
        return new Promise(res=>{
          const data=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute("viewBox")}"><g style="mix-blend-mode:hard-light;opacity:.45;">${ov.outerHTML}</g></svg>`;
          const url=URL.createObjectURL(new Blob([data],{type:"image/svg+xml"}));
          loadImg(url,i=>{ctx.drawImage(i,0,0,1600,1200);URL.revokeObjectURL(url);res();});
        });
      }));
      return cvs.toDataURL("image/png");
    }
    function loadImg(src,cb){ const i=new Image(); i.onload=()=>cb(i); i.src=src; }
  
    async function savePng(){ const a=document.createElement("a"); a.href=await exportPng(); a.download="weapon-wizards-projekt.png"; a.click(); }
  
    /* ---------- mailto ---------- */
    async function handleMailto(){
      const name=mName.value.trim(), mail=mMail.value.trim(), tel=mPhone.value.trim();
      if(!name||!mail){alert("Podaj imię i e-mail");return;}
      savePng();                                         // pobiera PNG lokalnie
      const cost=updatePrice();
      const lines=[...sumList.children].map(div=>div.textContent).join("%0D%0A");
      const body=`Imię: ${encodeURIComponent(name)}%0D%0ATelefon: ${encodeURIComponent(tel)}%0D%0A`+
                 `E-mail: ${encodeURIComponent(mail)}%0D%0A`+
                 `Koszt: ${cost} zł%0D%0A%0D%0AKolory:%0D%0A${lines}%0D%0A%0D%0A`+
                 `Załącz pobrany plik PNG.`;
      window.location.href=`mailto:contact@weapon-wizards.com?subject=Projekt%20Weapon%20Wizards&cc=${encodeURIComponent(mail)}&body=${body}`;
      modal.classList.add("hidden");
    }
  
  });
  