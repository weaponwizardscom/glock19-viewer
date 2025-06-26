/* ===== app.js ===== */
document.addEventListener("DOMContentLoaded", () => {
    /* --- pliki --- */
    const SVG_FILE   = "g17.svg";
    const TEXTURE    = "img/glock17.png";
    const BG_LIST    = ["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];
  
    /* --- ceny --- */
    const PRICE = { zamek:400, szkielet:400, spust:100, lufa:200, zerdz:50, pazur:50,
                    zrzut:50, blokadap:50, blokada2:50, pin:50, stopka:100 };
    const MIX2 = 800, MIXN = 1000;
  
    /* --- części --- */
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
      {id:"stopka",pl:"Stopka",en:"Floorplate"}
    ];
  
    /* --- kolory --- (skrócona lista z Twojego pliku colors.json) */
    const COLORS = {
      "H-140": "#FFFFFF","H-242":"#E5E4E2","H-146":"#3B3B3B","H-170":"#7A7A7A",
      "H-190":"#212121","H-265":"#999B9E","H-267":"#A48F6A","H-331":"#0077C0",
      "H-8000":"#937750","H-188":"#5C6670","H-357":"#6B6EA6","H-329":"#0077C0",
      /* ... (dopełnij wedle potrzeb) ... */
    };
  
    /* --- DOM --- */
    const gunBox   = document.getElementById("gun-view-container");
    const partBox  = document.getElementById("part-selection-container");
    const palBox   = document.getElementById("color-palette");
    const resetBtn = document.getElementById("reset-button");
    const mix2Btn  = document.getElementById("mix2-btn");
    const mixnBtn  = document.getElementById("mixn-btn");
    const bgBtn    = document.getElementById("bg-button");
    const saveBtn  = document.getElementById("save-button");
    const priceBox = document.getElementById("price-box");
    const sumList  = document.getElementById("summary-list");
    const sendBtn  = document.getElementById("send-button");
    const modal    = document.getElementById("modal");
    const mSend    = document.getElementById("m-send");
    const mCancel  = document.getElementById("m-cancel");
    const mName    = document.getElementById("m-name");
    const mMail    = document.getElementById("m-mail");
    const mPhone   = document.getElementById("m-phone");
    const langPL   = document.getElementById("lang-pl");
    const langEN   = document.getElementById("lang-gb");
    const H1       = document.getElementById("header-part-selection");
    const H2       = document.getElementById("header-color-selection");
  
    /* --- stan --- */
    let lang="pl";
    let activePart=null;
    let selections={};
    let currentBg=0;
  
    /* === INIT === */
    (async ()=>{ await loadSvg(); buildUI(); defaultBlack(); updateText(); updateSummary(); updatePrice(); })();
  
    /* === ŁADOWANIE SVG === */
    async function loadSvg(){
      const txt=await fetch(SVG_FILE).then(r=>r.text());
      gunBox.innerHTML=txt;
      const svg=gunBox.querySelector("svg");svg.classList.add("gun-svg");
  
      /* grupujemy lufę */
      const g=document.createElementNS("http://www.w3.org/2000/svg","g");g.id="lufa";
      [...svg.querySelectorAll("#lufa1,#lufa2")].forEach(p=>g.appendChild(p));
      svg.insertBefore(g,svg.firstChild);
  
      /* warstwa kolorów */
      const layer=document.createElementNS("http://www.w3.org/2000/svg","g");layer.id="color-overlays";svg.appendChild(layer);
      PARTS.forEach(p=>{
        const base=svg.querySelector("#"+p.id); if(!base) return;
        ["1","2"].forEach(n=>{
          const ov=base.cloneNode(true); ov.id=`color-overlay-${n}-${p.id}`; ov.classList.add("color-overlay");
          layer.appendChild(ov);
        });
      });
    }
  
    /* === UI === */
    function buildUI(){
      PARTS.forEach(p=>{
        const b=document.createElement("button");
        b.dataset.partId=p.id; b.onclick=()=>selectPart(b,p.id); partBox.appendChild(b);
      });
      buildPalette();
  
      resetBtn.onclick=resetAll;
      mix2Btn.onclick=()=>randomize(2);
      mixnBtn.onclick=()=>randomize();    // dowolna liczba kolorów
      bgBtn.onclick = ()=>{ currentBg=(currentBg+1)%BG_LIST.length;
                            gunBox.style.backgroundImage=`url("${BG_LIST[currentBg]}")`; };
      saveBtn.onclick=savePng;
  
      sendBtn.onclick=()=>modal.classList.remove("hidden");
      mCancel.onclick=()=>modal.classList.add("hidden");
      mSend.onclick=handleSendMail;
  
      langPL.onclick = ()=>{lang="pl";updateText();updateSummary();};
      langEN.onclick = ()=>{lang="en";updateText();updateSummary();};
    }
  
    function selectPart(btn,id){
      partBox.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected"); activePart=id;
    }
  
    function buildPalette(){
      for(const [name,hex] of Object.entries(COLORS)){
        const w=document.createElement("div"); w.className="color-swatch-wrapper"; w.title=name;
        const dot=document.createElement("div"); dot.className="color-swatch"; dot.style.backgroundColor=hex;
        const lbl=document.createElement("div"); lbl.className="color-swatch-label"; lbl.textContent=name;
        w.append(dot,lbl);
        w.onclick=()=>applyColor(activePart,hex,name);
        palBox.appendChild(w);
      }
    }
  
    function applyColor(pid,hex,label){
      if(!pid){ alert(lang==="pl"?"Wybierz część!":"Select a part first!"); return; }
      ["1","2"].forEach(n=>{
        const ov=document.getElementById(`color-overlay-${n}-${pid}`);
        const shapes=ov.tagName==="g"?ov.querySelectorAll("path,polygon,ellipse,circle,rect"):[ov];
        shapes.forEach(s=>s.style.fill=hex);
      });
      selections[pid]=label; updateSummary(); updatePrice();
    }
  
    function defaultBlack(){
      const def="H-146",hex=COLORS[def];
      PARTS.forEach(p=>{ selections[p.id]=def; applyColor(p.id,hex,def); });
    }
  
    function randomize(maxColors){
      const list=Object.keys(COLORS);
      let used=new Set();
      PARTS.forEach(p=>{
        let color;
        if(maxColors && used.size>=maxColors){
          // wybieraj tylko spośród już użytych
          const arr=[...used]; color=arr[Math.floor(Math.random()*arr.length)];
        }else{
          color=list[Math.floor(Math.random()*list.length)];
          if(maxColors) used.add(color);
        }
        applyColor(p.id,COLORS[color],color);
      });
    }
  
    function resetAll(){
      document.querySelectorAll(".color-overlay").forEach(ov=>{
        const shapes=ov.tagName==="g"?ov.querySelectorAll("path,polygon,ellipse,circle,rect"):[ov];
        shapes.forEach(s=>s.style.fill="transparent");
      });
      selections={};
      partBox.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
      activePart=null; updateSummary(); updatePrice();
    }
  
    /* === SUMMARY & PRICE === */
    function updateSummary(){
      sumList.innerHTML="";
      PARTS.forEach(p=>{
        if(selections[p.id]){
          const div=document.createElement("div");
          div.textContent=`${p[lang]} – ${selections[p.id]}`;
          sumList.appendChild(div);
        }
      });
    }
    function updatePrice(){
      const colorsUsed=new Set(Object.values(selections)).size;
      let sum=0;
      for(const part in selections) sum+=PRICE[part]||0;
      if(colorsUsed===0) sum=0;
      else if(colorsUsed<=2) sum=Math.min(sum,MIX2);
      else sum=Math.min(sum,MIXN);
      priceBox.textContent=`Szacowany koszt: ${sum} zł`;
      return sum;
    }
  
    /* === LANGUAGE === */
    function updateText(){
      partBox.querySelectorAll("button").forEach(b=>{
        const p=PARTS.find(x=>x.id===b.dataset.partId); if(p) b.textContent=p[lang];
      });
      H1.textContent=lang==="pl"?"1. Wybierz część":"1. Select part";
      H2.textContent=lang==="pl"?"2. Wybierz kolor (Cerakote)":"2. Select color (Cerakote)";
      langPL.classList.toggle("active",lang==="pl");
      langEN.classList.toggle("active",lang==="en");
    }
  
    /* === PNG SAVE & BASE64 === */
    async function exportPng(){
      return new Promise(res=>{
        const svg=document.querySelector(".gun-svg");
        const box=svg.getBBox();
        const W=box.width*2, H=box.height*2;
        const canvas=Object.assign(document.createElement("canvas"),{width:W,height:H});
        const ctx=canvas.getContext("2d");
        const bg=new Image(); bg.src=BG_LIST[currentBg];
        bg.onload=async ()=>{
          ctx.drawImage(bg,0,0,W,H);
          await drawTextureAndOverlays(ctx,svg,W,H,box);
          res(canvas.toDataURL("image/png"));
        };
      });
    }
  
    async function savePng(){
      const data=await exportPng();
      const a=document.createElement("a");
      a.href=data; a.download="weapon-wizards.png"; a.click();
    }
  
    async function drawTextureAndOverlays(ctx,svg,W,H,box){
      return new Promise(resolve=>{
        const pistol=new Image(); pistol.src=TEXTURE;
        pistol.onload=async ()=>{
          ctx.drawImage(pistol,0,0,W,H);
          const overlays=[...svg.querySelectorAll(".color-overlay")].filter(o=>o.style.fill!=="transparent");
          for(const ov of overlays){
            const tmp=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute("viewBox")}">
                          <g style="mix-blend-mode:hard-light;opacity:.45;">${ov.outerHTML}</g></svg>`;
            const url=URL.createObjectURL(new Blob([tmp],{type:"image/svg+xml"}));
            await new Promise(r=>{
              const img=new Image();
              img.onload=()=>{ctx.drawImage(img,0,0,W,H);URL.revokeObjectURL(url);r();};
              img.src=url;
            });
          }
          resolve();
        };
      });
    }
  
    /* === MODAL SEND === */
    async function handleSendMail(){
      const name=mName.value.trim(), mail=mMail.value.trim(), tel=mPhone.value.trim();
      if(!name||!mail){ alert("Podaj imię i e-mail"); return; }
      const price=updatePrice();
      const png=await exportPng();
  
      emailjs.send("service_5a61e1n","template_m5cclnm",{
        to_email:mail,
        client_name:name,
        client_phone:tel,
        total_price:price,
        html_list:sumList.innerHTML,
        image:png
      }).then(()=>{
        alert("Wysłano!"); modal.classList.add("hidden");
      }).catch(e=>{
        console.error(e); alert("Błąd wysyłki");
      });
    }
  
  });
  