/** Bind each range control only to its own comparison image. */
export function initComparisons(document) {
    for (const container of document.querySelectorAll('[data-comparison]')) {
        const slider = container.querySelector('input[type="range"]');
        if (!slider) continue;
        const update = () =>
            container.style.setProperty('--position', `${slider.value}%`);
        slider.addEventListener('input', update);
        update();
    }
}
