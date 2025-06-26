/*  dostępne tła   --------------------------------------------------------- */
const backgrounds = [
    'img/t1.png',
    'img/t2.png',
    'img/t3.png',
    'img/t4.png',
    'img/t5.png',
    'img/t6.png',
    'img/t7.png'
  ];
  
  /*  generowanie przycisków wyboru tła  ------------------------------------- */
  const controlsDiv = document.getElementById('controls');
  backgrounds.forEach((src, i) => {
    const btn = document.createElement('button');
    btn.textContent = `T${i + 1}`;
    btn.onclick = () => changeBackground(i);
    controlsDiv.appendChild(btn);
  });
  
  /*  zmiana tła – podmienia src w <img id="bg">  ---------------------------- */
  function changeBackground(index) {
    if (index >= 0 && index < backgrounds.length) {
      document.getElementById('bg').src = backgrounds[index];
    }
  }
  
  /*  jeśli potrzebujesz w przyszłości obsłużyć kliknięcia w konkretne       */
  /*  ścieżki broni, możesz dodać ten szkielet:                               */
  document.getElementById('gun').addEventListener('load', () => {
    const svgDoc = document.getElementById('gun').contentDocument;
  
    // przykładowo: podświetl klikniętą część na czerwono
    ['zamek', 'lufa', 'spust', 'pin', 'zrzut'].forEach(id => {
      const el = svgDoc.getElementById(id);
      if (el) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
          el.style.stroke = '#ff0000';
          el.style.strokeWidth = 2;
        });
      }
    });
  });
  