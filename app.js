/* ====== app.js ====== */
document.addEventListener('DOMContentLoaded', () => {

    /* === KONFIG === */
    const SVG_FILE = 'g17.svg';
    const TEXTURE  = 'img/glock17.png';
    const PANEL_W  = 380;      // szerokość panelu z listą w PNG  (NOWE)
    const FONT_PX  = 24;       // czcionka 24 px                (NOWE)

    /* ...  CAŁA TWOJA LISTA  PARTS & COLORS  BEZ ZMIAN ... */

    /* ---- DOM / state  ---- */
    /*  (NIC NIE RUSZAŁEM poza: ) */
    const sumList  = document.getElementById('summary-list');

    /* ---- SAVE PNG ---- */
    async function savePng(){
        const svg = document.querySelector('.gun-svg'); if(!svg) return;

        const lines = PARTS.map(p=>selections[p.id]?`${p[lang]} – ${selections[p.id]}`:null).filter(Boolean);

        const scale=2;
        const box  = svg.getBBox();
        const W    = box.width*scale + PANEL_W;    // poszerzamy obraz
        const H    = box.height*scale;

        const canvas = Object.assign(document.createElement('canvas'),{width:W,height:H});
        const ctx    = canvas.getContext('2d');

        /* tło */
        const base = new Image();
        base.src = TEXTURE;
        base.onload = async () => {

            ctx.drawImage(base, 0, 0, box.width*scale, H);

            /* nakładki */
            await Promise.all([...svg.querySelectorAll('.color-overlay')]
                .filter(ov=>ov.style.fill && ov.style.fill!=='transparent')
                .map(ov=>{
                    const tmp = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute('viewBox')}">
                                    <g style="mix-blend-mode:hard-light;opacity:.45;">${ov.outerHTML}</g></svg>`;
                    const url = URL.createObjectURL(new Blob([tmp],{type:'image/svg+xml'}));
                    return new Promise(res=>{
                        const img = new Image();
                        img.onload = () => { ctx.drawImage(img,0,0,box.width*scale,H); URL.revokeObjectURL(url); res(); };
                        img.src = url;
                    });
                }));

            /* panel tekstowy */
            const x0 = box.width*scale;
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(x0,0,PANEL_W,H);

            ctx.fillStyle = '#fff';
            ctx.font = `${FONT_PX}px sans-serif`;
            const PAD = 32;
            lines.forEach((t,i)=>ctx.fillText(t,x0+PAD, PAD+FONT_PX*i*1.6));

            /* download */
            const a=document.createElement('a');
            a.href=canvas.toDataURL('image/png');
            a.download='weapon-wizards-projekt.png';
            a.click();
        };
    }

    /* -- reszta Twojego pliku (loadSvg, buildUI, defaultBlack, itd.) zostaje bez zmian -- */
});
