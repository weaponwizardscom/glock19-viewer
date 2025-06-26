/* ====== app.js ====== */
document.addEventListener('DOMContentLoaded', () => {
    /* --- CONFIG & stała lista PARTS + COLORS – NIE ZMIENIAM --- */
    ...

    /* --- DOM --- */
    const sumContainer = document.getElementById('summary-container'); //  ✔

    /* === INIT === */
    (async function init(){
        await loadSvg();
        buildUI();
        defaultBlack();          // domyślne H-146 dziaĹa jak wcześniej
        updateText();
        updateSummary();
        equaliseHeights();       //  ✔  dopasuj wysokość listy do palety
        window.addEventListener('resize', equaliseHeights); //  ✔  przy zmianie okna
    })();

    /* --- NOWA FUNKCJA WYRÓWNANIA --- */
    function equaliseHeights(){                 //  ✔
        const palH = document.querySelector('.color-palette-container')?.offsetHeight || 400;
        sumContainer.style.maxHeight = palH + 'px';
    }

    /* --- RESZTA KODU BEZ ZMIAN (applyColor, savePng, itd.) --- */
    ...
});
