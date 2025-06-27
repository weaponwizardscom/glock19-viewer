
// KOD 11 – slider as sibling to palette
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth > 1024) return;
    const palette = document.getElementById('palette');
    if (!palette) return;

    const parent = palette.parentElement;
    parent.classList.add('palette-parent');

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'palette-vertical-slider';
    slider.min = 0;
    slider.max = 100;
    slider.value = 0;

    parent.appendChild(slider);

    const updateSlider = () => {
        const maxScroll = palette.scrollHeight - palette.clientHeight;
        if (maxScroll <= 0) {
            slider.style.display = 'none';
            return;
        }
        slider.style.display = '';
        slider.value = (palette.scrollTop / maxScroll) * 100;
    };

    const scrollPalette = () => {
        const maxScroll = palette.scrollHeight - palette.clientHeight;
        palette.scrollTop = (slider.value / 100) * maxScroll;
    };

    palette.addEventListener('scroll', updateSlider);
    slider.addEventListener('input', scrollPalette);

    updateSlider(); // initial
});
