
// KOD 10 – pionowy slider dopasowany do layoutu (mobile)
document.addEventListener('DOMContentLoaded', () => {
    const palette = document.getElementById('palette');
    if (!palette || window.innerWidth > 1024) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'palette-scroll-wrapper';
    palette.parentNode.insertBefore(wrapper, palette);
    wrapper.appendChild(palette);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'palette-vertical-slider';
    slider.min = 0;
    slider.max = 100;
    slider.value = 0;

    wrapper.appendChild(slider);

    const syncSlider = () => {
        const maxScroll = palette.scrollHeight - palette.clientHeight;
        if (maxScroll > 0) {
            slider.value = (palette.scrollTop / maxScroll) * 100;
        }
    };

    const scrollTo = () => {
        const maxScroll = palette.scrollHeight - palette.clientHeight;
        palette.scrollTop = (slider.value / 100) * maxScroll;
    };

    palette.addEventListener('scroll', syncSlider);
    slider.addEventListener('input', scrollTo);
});
