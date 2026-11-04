const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

function gallery(track = { style: {} }) {
    const timers = new Set();
    let id = 0;
    const context = vm.createContext({
        tailwind: {},
        window: { innerWidth: 1024 },
        document: { addEventListener() {}, getElementById: () => track },
        setInterval() { timers.add(++id); return id; },
        clearInterval(timer) { timers.delete(timer); },
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8'), context);
    return { context, timers, track };
}

test('starting autoplay repeatedly keeps one timer', () => {
    const { context, timers } = gallery();
    vm.runInContext('startAutoPlay(); startAutoPlay(); resetAutoPlay();', context);
    assert.equal(timers.size, 1);
});

test('resizing clamps the current slide to the visible range', () => {
    const { context, track } = gallery();
    vm.runInContext('currentSlide = 100; slidesVisible = 3; updateSlider();', context);
    assert.equal(vm.runInContext('currentSlide', context), 8);
    assert.match(track.style.transform, /^translateX\(-266/);
});

test('a gallery shorter than its visible range stays at the start', () => {
    const { context, track } = gallery();
    vm.runInContext('slidesVisible = 20; moveSlide(-1);', context);
    assert.equal(vm.runInContext('currentSlide', context), 0);
    assert.equal(track.style.transform, 'translateX(-0%)');
});

test('missing gallery does not throw during an update', () => {
    const { context } = gallery(null);
    assert.doesNotThrow(() => vm.runInContext('updateSlider();', context));
});
