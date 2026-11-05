import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { createCarousel, initGallery } from '../scripts/gallery.js';
import { galleryImages } from '../scripts/gallery-images.js';
import { initImageModal } from '../scripts/modal.js';
import { initComparisons } from '../scripts/comparisons.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function site(
    t,
    { desktop = true, reducedMotion = false, images = galleryImages } = {},
) {
    const dom = new JSDOM(html, {
        pretendToBeVisual: true,
        url: 'http://localhost/',
    });
    t.after(() => dom.window.close());
    const { window } = dom;
    const { document } = window;
    const queries = new Map();
    window.matchMedia = (query) => {
        if (!queries.has(query)) {
            const media = new window.EventTarget();
            media.matches = query.includes('min-width')
                ? desktop
                : reducedMotion;
            queries.set(query, media);
        }
        return queries.get(query);
    };
    const timers = new Map();
    let timerId = 0;
    window.setInterval = (callback) => {
        timers.set(++timerId, callback);
        return timerId;
    };
    window.clearInterval = (id) => timers.delete(id);
    const modal = initImageModal(document);
    const gallery = initGallery(document, images, modal);
    initComparisons(document);
    t.after(() => gallery?.destroy());
    return { document, window, modal, gallery, timers, queries };
}

test('carousel wraps at both ends and clamps after resizing', () => {
    const carousel = createCarousel(11);
    carousel.move(-1);
    assert.equal(carousel.index, 10);
    carousel.resize(3);
    assert.equal(carousel.index, 8);
    carousel.move(1);
    assert.equal(carousel.index, 0);
    assert.equal(carousel.offset, 0);
});

test('empty and short carousels cannot move', () => {
    for (const total of [0, 1, 2]) {
        const carousel = createCarousel(total, 3);
        carousel.move(-1);
        assert.equal(carousel.index, 0);
        assert.equal(carousel.canMove, false);
    }
});

test('gallery controls move one slide without duplicating autoplay timers', (t) => {
    const { document, timers } = site(t);
    const next = document.querySelector('[data-gallery-direction="1"]');
    for (let i = 0; i < 3; i++) next.click();
    assert.equal(timers.size, 1);
    assert.equal(
        document.getElementById('gallery-track').style.transform,
        'translateX(-100%)',
    );
});

test('only visible slides are keyboard reachable; resizing clamps the last slide', (t) => {
    const { document, window, queries } = site(t, { desktop: false });
    document.querySelector('[data-gallery-direction="-1"]').click();
    assert.equal(
        document.querySelectorAll('.gallery-slide[tabindex="0"]').length,
        1,
    );
    const desktop = queries.get('(min-width: 768px)');
    desktop.matches = true;
    desktop.dispatchEvent(new window.Event('change'));
    assert.equal(
        document.querySelectorAll('.gallery-slide[tabindex="0"]').length,
        3,
    );
    assert.match(
        document.getElementById('gallery-track').style.transform,
        /-266/,
    );
});

test('hover, focus and hidden tabs pause autoplay until the reason clears', (t) => {
    const { document, window, timers } = site(t);
    const gallery = document.querySelector('[data-gallery]');
    gallery.dispatchEvent(new window.Event('mouseenter'));
    assert.equal(timers.size, 0);
    gallery.dispatchEvent(new window.Event('mouseleave'));
    assert.equal(timers.size, 1);
    document.querySelector('[data-gallery-direction="1"]').focus();
    assert.equal(timers.size, 0);
    document.querySelector('nav a').focus();
    assert.equal(timers.size, 1);
    Object.defineProperty(document, 'hidden', {
        value: true,
        configurable: true,
    });
    document.dispatchEvent(new window.Event('visibilitychange'));
    assert.equal(timers.size, 0);
    Object.defineProperty(document, 'hidden', { value: false });
    document.dispatchEvent(new window.Event('visibilitychange'));
    assert.equal(timers.size, 1);
});

test('reduced motion and a short gallery disable autoplay', (t) => {
    assert.equal(site(t, { reducedMotion: true }).timers.size, 0);
    assert.equal(site(t, { images: [] }).timers.size, 0);
});

test('keyboard opens image dialog; Escape restores focus and scroll state', (t) => {
    const { document, window, timers } = site(t);
    const slide = document.querySelector('[data-gallery-index="0"]');
    document.body.style.overflow = 'auto';
    slide.focus();
    slide.dispatchEvent(
        new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    const modal = document.getElementById('imageModal');
    assert.equal(modal.getAttribute('aria-hidden'), 'false');
    assert.equal(
        document.activeElement,
        document.querySelector('[data-modal-close]'),
    );
    assert.equal(timers.size, 0);
    document.dispatchEvent(
        new window.KeyboardEvent('keydown', { key: 'Tab', cancelable: true }),
    );
    assert.equal(
        document.activeElement,
        document.querySelector('[data-modal-close]'),
    );
    document.dispatchEvent(
        new window.KeyboardEvent('keydown', { key: 'Escape' }),
    );
    assert.equal(modal.getAttribute('aria-hidden'), 'true');
    assert.equal(document.activeElement, slide);
    assert.equal(document.body.style.overflow, 'auto');
    assert.equal(
        document.getElementById('modalImage').hasAttribute('src'),
        false,
    );
});

test('mouse-opened modal pauses playback and closes from its backdrop', (t) => {
    const { document, timers } = site(t);
    document.querySelector('[data-gallery-index="0"] img').click();
    assert.equal(timers.size, 0);
    document.getElementById('imageModal').click();
    assert.equal(
        document.getElementById('imageModal').getAttribute('aria-hidden'),
        'true',
    );
});

test('comparison inputs update their own image independently', (t) => {
    const { document, window } = site(t);
    const comparisons = document.querySelectorAll('[data-comparison]');
    const input = comparisons[0].querySelector('input');
    input.value = '75';
    input.dispatchEvent(new window.Event('input'));
    assert.equal(comparisons[0].style.getPropertyValue('--position'), '75%');
    assert.equal(comparisons[1].style.getPropertyValue('--position'), '50%');
});

test('destroy removes timers and gallery listeners', (t) => {
    const { document, gallery, timers } = site(t);
    gallery.destroy();
    document.querySelector('[data-gallery-direction="1"]').click();
    assert.equal(timers.size, 0);
    assert.equal(
        document.getElementById('gallery-track').style.transform,
        'translateX(-0%)',
    );
});

test('missing optional components do not prevent initialization', () => {
    const dom = new JSDOM('<body></body>');
    assert.equal(initGallery(dom.window.document, [], { open() {} }), null);
    assert.doesNotThrow(() => initImageModal(dom.window.document).open());
    assert.doesNotThrow(() => initComparisons(dom.window.document));
    dom.window.close();
});

test('page has local assets, Greek language and no inline event handlers', () => {
    const dom = new JSDOM(html);
    const { document } = dom.window;
    assert.equal(document.documentElement.lang, 'el');
    for (const element of document.querySelectorAll('*')) {
        assert.equal(
            [...element.attributes].some(({ name }) => /^on/i.test(name)),
            false,
        );
    }
    for (const image of galleryImages)
        assert.ok(existsSync(new URL('../' + image, import.meta.url)));
    assert.equal(document.querySelector('script[src*="tailwind"]'), null);
    assert.ok(document.querySelector('link[href="assets/site.css"]'));
    dom.window.close();
});

test('compiled stylesheet image URLs resolve from the stylesheet directory', () => {
    const stylesheet = new URL('../assets/site.css', import.meta.url);
    const css = readFileSync(stylesheet, 'utf8');
    for (const match of css.matchAll(/url\(([^)]+)\)/g)) {
        const source = match[1].replace(/['"]/g, '');
        if (!source.startsWith('data:'))
            assert.ok(existsSync(new URL(source, stylesheet)), source);
    }
});
