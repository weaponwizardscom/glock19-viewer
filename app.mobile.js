/**
 * mobile layout reorder – KOD 2 ➜ KOD 3 (2025‑06‑27)
 * Nowy porządek:
 *  1. gun-view
 *  2. bg & save buttons (larger gap)
 *  3. Wybierz część (partSection)
 *  4. Wybierz kolor (colorSection)
 *  5. Tabela z wybranymi kolorami (summary)
 *  6. Resetuj kolory
 *  7. Szacowany koszt
 *  8. Wyślij
 */
export function initMobile () {
  console.log('[mobile] reorder v2');
  const gunWrap   = document.querySelector('.gun-wrap');
  if (!gunWrap) return;

  // DOM refs
  const bgBtn     = document.getElementById('bg-btn');
  const saveBtn   = document.getElementById('save-btn');
  const summary   = document.querySelector('.summary');
  const price     = document.getElementById('price');
  const sendBtn   = document.getElementById('send-btn');
  const resetBtn  = document.getElementById('reset-btn');
  const controls  = document.querySelector('.controls');
  if (!controls) return;
  const [partSection, colorSection] = controls.querySelectorAll('.section');

  // 1‑2 already correct (gun-view, bgBtn, saveBtn)

  // 3. Wybierz część
  gunWrap.insertBefore(partSection, summary);

  // 4. Wybierz kolor
  gunWrap.insertBefore(colorSection, summary);

  // 6. Resetuj kolory (before price)
  gunWrap.insertBefore(resetBtn, price);

  // Optional: hide empty controls container
  controls.style.display = 'none';

  // Extra spacing between bg & save buttons
  if (saveBtn) saveBtn.style.marginTop = '16px';

  console.log('[mobile] reorder v2 done');
}
