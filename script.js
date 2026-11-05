import { initComparisons } from './scripts/comparisons.js';
import { initGallery } from './scripts/gallery.js';
import { galleryImages } from './scripts/gallery-images.js';
import { initImageModal } from './scripts/modal.js';

initComparisons(document);
const modal = initImageModal(document);
initGallery(document, galleryImages, modal);
