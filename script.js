/* --------------------------------------------------
   1. Tailwind Configuration
   -------------------------------------------------- */
tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: '#D10000', // Professional Automotive Red
                dark: '#0f172a',  // Deep Blue/Grey 
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    // Select all elements with the class 'container'
    const containers = document.querySelectorAll('.container');

    // Check if we actually found them (Debugging)
    console.log("Found containers:", containers.length); 

    containers.forEach(container => {
        const slider = container.querySelector('.slider');
        
        // Safety check: does the slider input exist?
        if(!slider) return; 

        slider.addEventListener('input', (e) => {
            // Update the CSS variable
            container.style.setProperty('--position', `${e.target.value}%`);
        });
    });

});

/* --------------------------------------------------
   3. Modal Logic (Popup Images)
   -------------------------------------------------- */
// Function to close the modal (must be global for onclick="closeModal()")
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.add('hidden');
}

// Wait for the page to load before attaching click listeners to gallery items
document.addEventListener('DOMContentLoaded', () => {
    // Get the modal elements
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');

    // Select all gallery items (the containers that hold your images)
    const items = document.querySelectorAll('.gallery-item');

    // Add a click listener to each gallery item
    items.forEach(item => {
        item.addEventListener('click', function() {
            // Find the image inside the clicked item
            const img = this.querySelector('img');
            if (img) {
                modal.classList.remove('hidden'); // Show the modal
                modalImg.src = img.src;           // Set the modal image to the clicked image
            }
        });
    });
});