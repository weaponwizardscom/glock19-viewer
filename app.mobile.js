/**
 * Specjalne zachowania tylko dla wersji mobilnej.
 * Reorder elementów według nowej kolejności.
 */
export function initMobile() {
  console.log('[mobile] reorder start');

  const gunWrap = document.querySelector('.gun-wrap');
  const price   = document.getElementById('price');
  const sendBtn = document.getElementById('send-btn');
  const controls = document.querySelector('.controls');
  if (!gunWrap || !controls) return;

  const [partSection, colorSection] = controls.querySelectorAll('.section');
  const resetBtn = document.getElementById('reset-btn');

  // 1‑3 już w gunWrap na górze, nic nie ruszamy.

  // 4. Wybierz kolor (colorSection)
  gunWrap.insertBefore(colorSection, price);

  // 5. Resetuj kolory (resetBtn)
  gunWrap.insertBefore(resetBtn, price);

  // 6. (puste) — możemy zostawić odstęp, nic nie podmieniamy.

  // 7. Szacowany koszt (price) — pozostaje
  // 8. Wyślij do Wizards (sendBtn) — pozostaje po price (już w DOM)
  // 9. Wybierz część (partSection) — pozostaje w controls na końcu

  console.log('[mobile] reorder done');
}
