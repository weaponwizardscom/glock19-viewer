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
    const PARTS=[{id:"zamek",pl:"Zamek",en:"Slide"},{id:"szkielet",pl:"Szkielet",en:"Frame"},{id:"spust",pl:"Spust",en:"Trigger"},{id:"lufa",pl:"Lufa",en:"Barrel"},{id:"zerdz",pl:"Żerdź",en:"Recoil spring"},{id:"pazur",pl:"Pazur",en:"Extractor"},{id:"zrzut",pl:"Zrzut magazynka",en:"Magazine catch"},{id:"blokadap",pl:"Blokada zamka",en:"Slide lock"},{id:"blokada2",pl:"Zrzut zamka",en:"Slide stop lever"},{id:"pin",pl:"Pin",en:"Trigger pin"},{id:"stopka",pl:"Stopka",en:"Floorplate"}];
    const COLORS={"H-140":"#FFFFFF","H-242":"#E5E4E2","H-146":"#3B3B3B","H-170":"#7A7A7A","H-190":"#212121","H-265":"#999B9E","H-267":"#A48F6A","H-331":"#0077C0","H-8000":"#937750"};
  
    /* ------------ stan ------------ */
    let selections={}, currentBg=0, lang="pl", activePart=null;
  
    /* ------------ INIT ------------ */
    (async ()=>{ await loadSvg(); buildUI(); defaultBlack(); bgBtn.click(); })();
  
    async function loadSvg(){
      gunBox.innerHTML=await fetch(SVG_FILE).then(r=>r.text());
      const layer=document.createElementNS("http://www.w3.org/2000/svg","g");layer.id="color-overlays";
      const svg=gunBox.querySelector("svg");svg.appendChild(layer);
      PARTS.forEach(p=>{
        const base=svg.querySelector("#"+p.id); if(!base) return;
        ["1","2"].forEach(n=>{ const ov=base.cloneNode(true); ov.id=`color-overlay-${n}-${p.id}`; ov.classList.add("color-overlay"); layer.appendChild(ov); });
      });
    }
  
    function buildUI(){
      PARTS.forEach(p=>{ const b=document.createElement("button"); b.textContent=p[lang]; b.onclick=()=>selectPart(b,p.id); b.dataset.partId=p.id; partBox.appendChild(b); });
      Object.entries(COLORS).forEach(([name,hex])=>{
        const wrap=document.createElement("div");wrap.className="color-swatch-wrapper";wrap.title=name;
        wrap.onclick=()=>applyColor(activePart,hex,name);
        const d=document.createElement("div");d.className="color-swatch";d.style.backgroundColor=hex;
        const l=document.createElement("div");l.className="color-swatch-label";l.textContent=name;wrap.append(d,l);palBox.appendChild(wrap);
      });
  
      mix2Btn.onclick=()=>randomize(2);
      mixnBtn.onclick=()=>randomize();
      bgBtn.onclick =()=>{ currentBg=(currentBg+1)%BG.length; gunBox.style.backgroundImage=`url('${BG[currentBg]}')`; };
      resetBtn.onclick=resetAll;
      saveBtn.onclick=savePng;
      sendBtn.onclick=()=>modal.classList.remove("hidden");
      mCancel.onclick=()=>modal.classList.add("hidden");
      mSend.onclick=handleMailto;
    }
  
    function selectPart(btn,id){
      partBox.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected"); activePart=id;
    }
  
    function applyColor(pid,hex,label){
      if(!pid) return alert("Najpierw wybierz część!");
      ["1","2"].forEach(n=>{
        const ov=document.getElementById(`color-overlay-${n}-${pid}`);
        const shp=ov.tagName==="g"?ov.querySelectorAll("path,polygon,ellipse,circle,rect"):[ov];
        shp.forEach(s=>s.style.fill=hex);
      });
      selections[pid]=label; updateSummary(); updatePrice();
    }
  
    function randomize(max){
      const keys=Object.keys(COLORS);
      let used=new Set();
      PARTS.forEach(p=>{
        let col; do{ col=keys[Math.floor(Math.random()*keys.length)]; }while(max&&used.size>=max&&!used.has(col));
        used.add(col); applyColor(p.id,COLORS[col],col);
      });
    }
  
    function resetAll(){
      document.querySelectorAll(".color-overlay").forEach(ov=>{
        const shp=ov.tagName==="g"?ov.querySelectorAll("path,polygon,ellipse,circle,rect"):[ov];
        shp.forEach(s=>s.style.fill="transparent");
      });
      selections={}; activePart=null;
      partBox.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
      updateSummary(); updatePrice();
    }
  
    function defaultBlack(){ PARTS.forEach(p=>applyColor(p.id,COLORS["H-146"],"H-146")); }
  
    function updateSummary(){
      sumList.innerHTML=""; PARTS.forEach(p=>{ if(selections[p.id]){ const d=document.createElement("div"); d.textContent=`${p[lang]} – ${selections[p.id]}`; sumList.appendChild(d);} });
    }
    function updatePrice(){
      const colors=new Set(Object.values(selections)).size;
      let sum=0; for(const id in selections) sum+=PRICE[id]||0;
      sum=colors<=2?Math.min(sum,MIX2):Math.min(sum,MIXN);
      priceBox.textContent=`Szacowany koszt: ${sum} zł`; return sum;
    }
  
    /* ---------- PNG download ---------- */
    async function savePng(){
      const data=await exportPng();
      const a=document.createElement("a");
      a.href=data; a.download="weapon-wizards-projekt.png"; a.click();
    }
  
    async function exportPng(){
      const svg=gunBox.querySelector("svg");
      const canvas=document.createElement("canvas");
      canvas.width=1600; canvas.height=1200;
      const ctx=canvas.getContext("2d");
  
      await new Promise(r=>{ const i=new Image(); i.src=BG[currentBg]; i.onload=()=>{ctx.drawImage(i,0,0,1600,1200); r();}; });
      await new Promise(r=>{ const i=new Image(); i.src=TEXTURE; i.onload=()=>{ctx.drawImage(i,0,0,1600,1200); r();}; });
      await Promise.all([...svg.querySelectorAll(".color-overlay")].filter(o=>o.style.fill!=="transparent").map(ov=>{
        return new Promise(res=>{
          const tmp=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute("viewBox")}"><g style="mix-blend-mode:hard-light;opacity:.45;">${ov.outerHTML}</g></svg>`;
          const url=URL.createObjectURL(new Blob([tmp],{type:"image/svg+xml"}));
          const i=new Image(); i.src=url; i.onload=()=>{ctx.drawImage(i,0,0,1600,1200); URL.revokeObjectURL(url); res();};
        });
      }));
      return canvas.toDataURL("image/png");
    }
  
    /* ---------- mailto ---------- */
    async function handleMailto(){
      const name=mName.value.trim(), mail=mMail.value.trim(), tel=mPhone.value.trim();
      if(!name||!mail){ alert("Podaj imię i e-mail"); return; }
  
      const png=await exportPng();          // pobierz base64 (również zapisujemy plik, ale to dla usera)
      savePng();                            // pobiera plik lokalnie, by klient mógł załączyć
  
      /* budujemy treść maila */
      const cost=updatePrice();
      const lines=[...sumList.childNodes].map(n=>n.textContent).join("%0D%0A"); // CRLF url-encoded
      const body=`Imię: ${encodeURIComponent(name)}%0D%0ATelefon: ${encodeURIComponent(tel)}%0D%0A`+
                 `E-mail: ${encodeURIComponent(mail)}%0D%0A`+
                 `Koszt: ${cost} zł%0D%0A%0D%0AKolory:%0D%0A${lines}%0D%0A%0D%0A`+
                 `Załącz przesłany plik PNG jako podgląd.`;
  
      const mailto=`mailto:contact@weapon-wizards.com?subject=Projekt%20Weapon%20Wizards&body=${body}&cc=${encodeURIComponent(mail)}`;
      window.location.href=mailto;
      modal.classList.add("hidden");
    }
  
  });
  