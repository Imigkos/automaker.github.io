const DESKTOP_QUERY = '(min-width: 768px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const AUTOPLAY_DELAY_MS = 4000;

/** Keep carousel bounds independent of rendering. */
export function createCarousel(total, visible = 1) {
    let index = 0;
    let visibleCount = Math.max(1, visible);
    const maximum = () => Math.max(0, total - visibleCount);
    return {
        get index() {
            return index;
        },
        get offset() {
            return index * (100 / visibleCount);
        },
        get canMove() {
            return maximum() > 0;
        },
        resize(count) {
            visibleCount = Math.max(1, count);
            index = Math.min(index, maximum());
        },
        move(direction) {
            const next = index + direction;
            index = next > maximum() ? 0 : next < 0 ? maximum() : next;
        },
    };
}

export function initGallery(document, images, modal) {
    const track = document.getElementById('gallery-track');
    const gallery = document.querySelector('[data-gallery]');
    if (!track || !gallery) return null;
    const window = document.defaultView;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const carousel = createCarousel(images.length, desktop.matches ? 3 : 1);
    const listeners = new window.AbortController();
    const options = { signal: listeners.signal };
    const pauses = new Set();
    let timer = null;

    const fragment = document.createDocumentFragment();
    for (const [index, source] of images.entries()) {
        const slide = document.createElement('div');
        slide.className =
            'gallery-slide flex-shrink-0 w-full md:w-1/3 px-2 cursor-pointer';
        slide.dataset.galleryIndex = index;
        slide.tabIndex = 0;
        slide.setAttribute('role', 'button');
        slide.setAttribute('aria-label', `Προβολή φωτογραφίας ${index + 1}`);
        slide.setAttribute('aria-haspopup', 'dialog');
        const frame = document.createElement('div');
        frame.className =
            'h-64 rounded-xl overflow-hidden shadow-md group relative bg-gray-200';
        const image = document.createElement('img');
        image.src = source;
        image.alt = `Auto Maker — φωτογραφία εργασιών ${index + 1}`;
        image.className =
            'w-full h-full object-cover transition duration-300 group-hover:scale-105';
        image.loading = 'lazy';
        image.decoding = 'async';
        frame.append(image);
        slide.append(frame);
        fragment.append(slide);
    }
    track.replaceChildren(fragment);

    function render() {
        track.style.transform = `translateX(-${carousel.offset}%)`;
        for (const slide of track.children) {
            const index = Number(slide.dataset.galleryIndex);
            const visible =
                index >= carousel.index &&
                index < carousel.index + (desktop.matches ? 3 : 1);
            slide.tabIndex = visible ? 0 : -1;
            slide.setAttribute('aria-hidden', String(!visible));
        }
    }
    function stopAutoplay() {
        if (timer !== null) window.clearInterval(timer);
        timer = null;
    }
    function syncAutoplay() {
        stopAutoplay();
        if (
            !carousel.canMove ||
            pauses.size ||
            document.hidden ||
            reducedMotion.matches
        )
            return;
        timer = window.setInterval(() => {
            carousel.move(1);
            render();
        }, AUTOPLAY_DELAY_MS);
    }
    function setPaused(reason, paused) {
        if (paused) pauses.add(reason);
        else pauses.delete(reason);
        syncAutoplay();
    }
    gallery.addEventListener(
        'click',
        (event) => {
            const control = event.target.closest('[data-gallery-direction]');
            if (control && gallery.contains(control)) {
                carousel.move(Number(control.dataset.galleryDirection));
                render();
                syncAutoplay();
                return;
            }
            const slide = event.target.closest('[data-gallery-index]');
            if (slide && track.contains(slide)) {
                const image = slide.querySelector('img');
                modal.open(
                    images[Number(slide.dataset.galleryIndex)],
                    image.alt,
                    slide,
                );
            }
        },
        options,
    );
    track.addEventListener(
        'keydown',
        (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            const slide = event.target.closest('[data-gallery-index]');
            if (!slide) return;
            event.preventDefault();
            slide.click();
        },
        options,
    );
    gallery.addEventListener(
        'mouseenter',
        () => setPaused('pointer', true),
        options,
    );
    gallery.addEventListener(
        'mouseleave',
        () => setPaused('pointer', false),
        options,
    );
    gallery.addEventListener(
        'focusin',
        () => setPaused('focus', true),
        options,
    );
    gallery.addEventListener(
        'focusout',
        (event) => {
            // Keep playback paused while focus is in the image dialog.
            const target = event.relatedTarget;
            setPaused(
                'focus',
                gallery.contains(target) ||
                    Boolean(target?.closest('#imageModal')),
            );
        },
        options,
    );
    document.addEventListener('visibilitychange', syncAutoplay, options);
    document.addEventListener(
        'image-modal:change',
        (event) => setPaused('modal', event.detail.open),
        options,
    );
    desktop.addEventListener(
        'change',
        () => {
            carousel.resize(desktop.matches ? 3 : 1);
            render();
            syncAutoplay();
        },
        options,
    );
    reducedMotion.addEventListener('change', syncAutoplay, options);
    render();
    syncAutoplay();
    return {
        destroy() {
            stopAutoplay();
            listeners.abort();
        },
    };
}
