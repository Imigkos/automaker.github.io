/** Preserve the image overlay while supporting keyboard navigation. */
export function initImageModal(document) {
    const modal = document.getElementById('imageModal');
    const image = document.getElementById('modalImage');
    const closeButton = modal?.querySelector('[data-modal-close]');
    if (!modal || !image || !closeButton) return { open() {} };
    let trigger = null;
    let previousOverflow = '';
    let isOpen = false;

    function close() {
        if (!isOpen) return;
        isOpen = false;
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = previousOverflow;
        image.removeAttribute('src');
        trigger?.focus();
        trigger = null;
        document.dispatchEvent(
            new document.defaultView.CustomEvent('image-modal:change', {
                detail: { open: false },
            }),
        );
    }
    modal.addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
        if (!isOpen) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
        } else if (event.key === 'Tab') {
            // The close button is the overlay's only interactive element.
            event.preventDefault();
            closeButton.focus();
        }
    });
    return {
        open(source, description, opener = document.activeElement) {
            if (!isOpen) {
                trigger = opener;
                previousOverflow = document.body.style.overflow;
            }
            isOpen = true;
            image.src = source;
            image.alt = description;
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            closeButton.focus();
            document.dispatchEvent(
                new document.defaultView.CustomEvent('image-modal:change', {
                    detail: { open: true },
                }),
            );
        },
        close,
    };
}
